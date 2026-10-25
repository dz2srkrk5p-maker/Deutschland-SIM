import { test, expect } from 'vitest';
import { ministerien } from '../src/data/ministerien.js';
import { einnahmearten } from '../src/data/einnahmen.js';
import { config } from '../src/data/config.js';
import { neuesSpiel, laden } from '../src/engine/state.js';
import { aufstellung, entwurfPruefen, entwurfWirkung, einnahmenUebernehmen, gegenfinanzierung, spielraum, aufkommensSchaetzung } from '../src/engine/einnahmen.js';
import { vorschau, prognose, kuerzungsVorschlag, mrd, einnahmenWirkung } from '../src/engine/haushalt.js';
import { jahresSchritt } from '../src/engine/wirtschaft.js';

// Steueränderung in früheren (geeichten) Stufen → Reglerschritte (feinere Schritte seit 2026-10-25)
const fein = (id, stufen) => { const p = einnahmearten.find((a) => a.id === id).parameter; return Math.round((stufen * (p.eichSchritt ?? p.schritt)) / p.schritt); };

const regierung = () => ({
  ...neuesSpiel('union', 1), phase: 'regierung', monat: 12, kanzlerParteiId: 'union',
  sitze: { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 },
  koalition: { partner: ['spd'], startAnteile: { spd: 16.4 }, minderheit: false, fehlschlaege: 0 },
  kabinett: { anspruch: {}, verteilung: Object.fromEntries(ministerien.map((m) => [m.id, 'union'])) },
});

test('Einnahmen: Start ergibt den Haushalt 2026 (387,21 Steuern + 39,36 sonstige), CO2 und Länder-/Gemeindesteuern zählen nicht', () => {
  const a = aufstellung(regierung());
  expect(Math.abs(a.kern - 426570000)).toBeLessThan(10); // Rundung je Steuerart
  expect(a.ktf).toBe(15400000);
  for (const id of ['gewerbe', 'erbschaft', 'vermoegen', 'sozialversicherung', 'co2']) expect(a.zeilen.find((z) => z.art.id === id).imKernhaushalt).toBe(false);
  expect(new Set(einnahmearten.map((e) => e.id)).size).toBe(einnahmearten.length);
});

test('Einnahmen: Stufe, Verzögerung im ersten Jahr, Ausweichen bei hohen Sätzen, Ausgestaltung', () => {
  const z = regierung();
  const ek = (e) => aufstellung(z, e).zeilen.find((x) => x.art.id === 'einkommensteuer');
  const eins = ek({ einnahmen: { einkommensteuer: fein('einkommensteuer', 1) } });
  expect(eins.stufen).toBe(3000000);
  expect(eins.verzoegerung).toBe(-600000); // 20 % wirken erst im Folgejahr
  expect(eins.ausweichen).toBe(0);
  const z3 = { ...z, haushalt: { ...z.haushalt, einnahmen: { ...z.haushalt.einnahmen, stufen: { einkommensteuer: fein('einkommensteuer', 3) } } } };
  const drei = aufstellung(z3).zeilen.find((x) => x.art.id === 'einkommensteuer');
  expect(drei.ausweichen).toBe(-450000); // Stufe 3 liegt eine über ausweichenAb (2): 15 % von 3 Mrd.
  expect(ek({ ausgestaltung: { grundfreibetrag: true } }).ausgestaltung).toBe(-6000000);
  // einmalige Privatisierung zählt nur im Jahr des Entwurfs und wird nicht gespeichert
  expect(einnahmenUebernehmen(z, { einnahmen: { sonstige: fein('sonstige', 2) } }).stufen.sonstige).toBeUndefined();
});

test('Einnahmen: Grenzen je Jahr und absolut, Wirkung und Bundesrat', () => {
  const z = regierung();
  expect(() => entwurfPruefen(z, { einnahmen: { umsatz: fein('umsatz', 2) } })).toThrow(); // höchstens 1 Stufe je Jahr
  expect(() => entwurfPruefen(z, { einnahmen: { vermoegen: fein('vermoegen', -1) } })).toThrow(); // unter 0 %
  const w = entwurfWirkung(z, { einnahmen: { umsatz: fein('umsatz', 1) } });
  expect(w.bundesrat).toBe(true);
  expect(w.wirkung.inflation).toBeCloseTo(0.35);
  expect(entwurfWirkung(z, { einnahmen: { energie: fein('energie', 1) } }).bundesrat).toBe(false);
  expect(entwurfWirkung(z, { einnahmen: { vermoegen: fein('vermoegen', 1) } }).verfassung).toBe(true);
});

test('Gegenfinanzierung schlägt nur mögliche Einnahmen vor, Kürzungsvorschlag hält die Schuldenbremse', () => {
  const z = regierung();
  const vorschlaege = gegenfinanzierung(z, {}, 5000000);
  expect(vorschlaege.length).toBeGreaterThan(0);
  expect(vorschlaege.every((v) => !v.art.keinBund && !v.art.sondervermoegen)).toBe(true);
  const e = kuerzungsVorschlag(z, { stufen: { bildung: 2 } });
  expect(vorschau(z, e).bilanz.eingehalten).toBe(true);
  expect(e.stufen.bildung).toBe(2);
});

test('Wirtschaft: ohne Wirkung und Zufall kehrt das Wachstum zum Potenzial zurück, Okun und Schuldenquote', () => {
  const land = regierung().land;
  const null0 = { wachstum: 0, inflation: 0, arbeitslosigkeit: 0, gini: 0, gruppen: {}, probleme: {} };
  let l = land;
  for (let i = 0; i < 10; i++) l = jahresSchritt(l, null0, 0, 0, false).land;
  expect(l.wachstum).toBeCloseTo(config.wirtschaft.potenzialWachstum, 1);
  const schwach = jahresSchritt(land, { ...null0, wachstum: -2 }, 0, 0, false).land;
  expect(schwach.arbeitslosigkeit).toBeGreaterThan(land.arbeitslosigkeit);
  const mitSchulden = jahresSchritt(land, null0, 100, 0, false).land;
  expect(mitSchulden.schulden - jahresSchritt(land, null0, 0, 0, false).land.schulden).toBe(100);
});

test('Prognose: 5 Jahre, ohne Zufall, ändert den Spielstand nicht; Entwurf mit Steuersenkung hat niedrigere Einnahmen', () => {
  const z = regierung();
  const plan = prognose(z, {});
  expect(plan).toHaveLength(5);
  expect(prognose(z, {})).toEqual(plan);
  const senkung = prognose(z, { einnahmen: { einkommensteuer: fein('einkommensteuer', -2) } });
  expect(senkung[1].einnahmen).toBeLessThan(plan[1].einnahmen);
  expect(mrd(plan[0].einnahmen)).toBeCloseTo(426.57, 1);
  expect(z.haushalt.einnahmen.stufen).toEqual({});
});

test('Regler: Spielraum je Jahr und absolut, jede Stellung ist ein gültiger Entwurf', () => {
  const z = regierung();
  expect(spielraum(z, 'umsatz')).toEqual({ min: -10, max: 10 }); // ±1 Punkt je Jahr in 0,1-Schritten
  expect(spielraum(z, 'vermoegen')).toEqual({ min: 0, max: 10 }); // Satz 0 % ist die Untergrenze, +1 Punkt je Jahr
  const z3 = { ...z, haushalt: { ...z.haushalt, einnahmen: { ...z.haushalt.einnahmen, stufen: { einkommensteuer: fein('einkommensteuer', 2) } } } };
  expect(spielraum(z3, 'einkommensteuer')).toEqual({ min: -20, max: 10 }); // max +3 Pp
  for (const a of einnahmearten) {
    const r = spielraum(z, a.id);
    for (const d of [r.min, r.max]) expect(() => entwurfPruefen(z, { einnahmen: { [a.id]: d } })).not.toThrow();
    expect(() => entwurfPruefen(z, { einnahmen: { [a.id]: r.max + 1 } })).toThrow();
  }
});

test('Regler: Schätzung des Aufkommens im ersten Jahr und dauerhaft', () => {
  const z = regierung();
  const ek = aufkommensSchaetzung(z, { einnahmen: { einkommensteuer: fein('einkommensteuer', 1) } }, 'einkommensteuer');
  expect(ek.erstesJahr).toBe(2400000); // 3 Mrd. je Stufe, 80 % im ersten Jahr
  expect(ek.dauerhaft).toBe(3000000);
  expect(ek.aufkommen).toBe(aufstellung(z, { einnahmen: { einkommensteuer: fein('einkommensteuer', 1) } }).zeilen.find((x) => x.art.id === 'einkommensteuer').summe);
  expect(aufkommensSchaetzung(z, {}, 'umsatz')).toMatchObject({ erstesJahr: 0, dauerhaft: 0 });
  // Andere Änderungen im Entwurf zählen nicht mit
  expect(aufkommensSchaetzung(z, { einnahmen: { einkommensteuer: fein('einkommensteuer', 1), umsatz: fein('umsatz', 1) } }, 'einkommensteuer').erstesJahr).toBe(2400000);
  expect(aufkommensSchaetzung(z, { einnahmen: { sonstige: fein('sonstige', 2) } }, 'sonstige').dauerhaft).toBe(0); // einmalig
  const kap = aufkommensSchaetzung(z, { einnahmen: { kapitalertrag: fein('kapitalertrag', 2) } }, 'kapitalertrag');
  expect(kap.dauerhaft).toBeLessThan(2 * 900000); // Ausweichen ab der 2. Stufe
});

test('Übersicht: Gesamtwirkung aller Einnahmeänderungen wie in der Vorschau', () => {
  const z = regierung(); // Union hält Finanzen
  const e = { einnahmen: { einkommensteuer: fein('einkommensteuer', 2), umsatz: fein('umsatz', 1) } };
  const w = einnahmenWirkung(z, e);
  expect(w.wirkung.wachstum).toBeCloseTo(2 * -0.06 - 0.08, 5); // beide Steuern zusammen
  expect(w.wirkung.gruppen.familien).toBe(2 * -2 - 3);
  expect(w.kern).toBeCloseTo(4.8 + 7, 5); // Mehraufkommen im 1. Jahr
  // gleiche Umfragewirkung wie die Vorschau des ganzen Haushalts (ohne Etats)
  expect(w.umfrage.union).toBeCloseTo(vorschau(z, e).wirkung.union, 6);
  expect(einnahmenWirkung(z, {}).umfrage).toEqual({});
  expect(einnahmenWirkung(z, { einnahmen: { gewerbe: fein('gewerbe', 1) } }).wirkung.probleme.kommunalfinanzen).toBe(-6);
});

test('Feine Schritte: an früheren Stufen gleiche Werte, dazwischen linear; Migration rechnet alte Stufen um', () => {
  const z = regierung();
  const ek = (d) => aufstellung(z, { einnahmen: { einkommensteuer: d } }).zeilen.find((x) => x.art.id === 'einkommensteuer');
  expect(ek(fein('einkommensteuer', 1)).stufen).toBe(3000000); // wie früher 1 Stufe = 1 Punkt
  expect(ek(5).stufen).toBe(1500000); // 0,5 Punkte
  // Ausweichen ab der 2. geeichten Stufe: 2,5 Punkte liegen in der Mitte zwischen 2 (kein Verlust) und 3 (450 Mio.)
  const z25 = { ...z, haushalt: { ...z.haushalt, einnahmen: { ...z.haushalt.einnahmen, stufen: { einkommensteuer: 25 } } } };
  expect(aufstellung(z25).zeilen.find((x) => x.art.id === 'einkommensteuer').ausweichen).toBe(-225000);
  // Spielstand Version 20 mit alten Stufen: gleicher Steuersatz in Reglerschritten
  const alt = { ...z, version: 20, haushalt: { ...z.haushalt, einnahmen: { ...z.haushalt.einnahmen, stufen: { umsatz: 1, co2: 2, kapitalertrag: -1 } } }, verfahren: [{ typ: 'einnahme', id: 'vermoegen', stufen: 2 }] };
  const neu = laden(JSON.stringify(alt));
  expect(neu.haushalt.einnahmen.stufen).toEqual({ umsatz: 10, co2: 10, kapitalertrag: -20 });
  expect(neu.verfahren[0].stufen).toBe(10);
});
