import { test, expect } from 'vitest';
import { einnahmearten } from '../src/data/einnahmen.js';
import { bilanz, vorschau, haushaltBeschliessen } from '../src/engine/haushalt.js';
import { neuesSpiel } from '../src/engine/state.js';
import { etats2026, steuern2026, sonstigeEinnahmen2026 } from '../src/data/haushalt.js';
import { ministerien } from '../src/data/ministerien.js';
import { config } from '../src/data/config.js';
import { monatBeenden, haushaltsMonat } from '../src/engine/regierung.js';
import { ereignisEntscheiden } from '../src/engine/ereignisse.js';

// Steueränderung in früheren (geeichten) Stufen → Reglerschritte (feinere Schritte seit 2026-10-25)
const fein = (id, stufen) => { const p = einnahmearten.find((a) => a.id === id).parameter; return Math.round((stufen * (p.eichSchritt ?? p.schritt)) / p.schritt); };
// F12: bis zum Haushaltsmonat weiterschalten, dann beschließen
const beschliessen = (z, p) => {
  // F14: offene Ereignisse mit der ersten Möglichkeit beantworten
  while (!haushaltsMonat(z) || z.offenesEreignis) z = (z.offenesEreignis ? ereignisEntscheiden(z, { wahl: 0 }) : monatBeenden(z)).state;
  return haushaltBeschliessen(z, p);
};


const hh = config.haushalt;
const summe = (o) => Object.values(o).reduce((s, x) => s + x, 0);
// Etatänderung in Prozent → Stufen (Schrittweite aus config)
const P = (prozent) => prozent / hh.ministerSchrittProzent;

// Regierung SPD (Kanzler) + Union; Union hält Finanzen und Arbeit, SPD den Rest
const imAmt = (seed = 1) => {
  const verteilung = Object.fromEntries(ministerien.map((m) => [m.id, 'spd']));
  verteilung.finanzen = 'union';
  verteilung.arbeit = 'union';
  return {
    ...neuesSpiel('spd', seed),
    phase: 'regierung',
    sitze: { union: 191, afd: 138, spd: 132, gruene: 74, linke: 60, bsw: 35 },
    koalition: { partner: ['union'], startAnteile: { union: 28.6 } },
    kanzlerParteiId: 'spd',
    kabinett: { anspruch: { spd: 14, union: 2 }, verteilung },
  };
};

test('Startwerte: Ausgaben 524,54 Mrd., neue Schulden 97,97 Mrd., Schuldenbremse genau eingehalten', () => {
  const b = bilanz(etats2026, steuern2026 + sonstigeEinnahmen2026);
  expect(b.ausgaben).toBe(524540138);
  expect(b.einnahmen).toBe(426570000);
  expect(b.neueSchulden).toBe(97970138);
  expect(b.schuldenbremse).toBe(hh.schuldenbremseGrenze);
  expect(b.eingehalten).toBe(true);
});

test('jedes Ministerium hat einen Etat', () => {
  expect(Object.keys(etats2026).sort()).toEqual(ministerien.map((m) => m.id).sort());
});

test('Schrittgrenzen: Etats höchstens ±ministerMaxProzent, Einnahmen höchstens maxJeJahr Stufen, mehr nicht', () => {
  expect(() => vorschau(imAmt(), { stufen: { arbeit: -P(hh.ministerMaxProzent) }, einnahmen: { einkommensteuer: fein('einkommensteuer', 2), umsatz: fein('umsatz', -1) } })).not.toThrow();
  expect(() => vorschau(imAmt(), { einnahmen: { umsatz: fein('umsatz', 2) } })).toThrow();
  expect(() => vorschau(imAmt(), { einnahmen: { gibtsnicht: fein('gibtsnicht', 1) } })).toThrow();
  expect(() => vorschau(imAmt(), { stufen: { arbeit: P(hh.ministerMaxProzent) + 1 } })).toThrow();
  expect(() => vorschau(imAmt(), { stufen: { arbeit: 1.5 } })).toThrow();
  expect(() => vorschau(imAmt(), { stufen: { gibtsnicht: 1 } })).toThrow();
});

test('Mehrausgaben ohne Gegenfinanzierung brechen die Schuldenbremse', () => {
  const z = imAmt();
  expect(vorschau(z, { stufen: { bildung: 1 } }).bilanz.eingehalten).toBe(false);
  expect(() => beschliessen(z, { stufen: { bildung: 1 } })).toThrow();
});

test('Mehr Verteidigung über der Freigrenze zählt nicht zur Schuldenbremse', () => {
  const v = vorschau(imAmt(), { stufen: { verteidigung: 4 } });
  expect(v.bilanz.neueSchulden).toBeGreaterThan(97970138);
  expect(v.bilanz.schuldenbremse).toBe(hh.schuldenbremseGrenze);
  expect(v.bilanz.eingehalten).toBe(true);
});

test('Wirkung trifft die Partei, die das Ministerium hält', () => {
  // Arbeit −5 % = −9,867 Mrd. → Union (Arbeit); Energiesteuern +1 Stufe = +3,5 Mrd. → Union (Finanzen); Bildung +5 % → SPD
  const v = vorschau(imAmt(), { stufen: { arbeit: -P(5), bildung: P(5) }, einnahmen: { energie: fein('energie', 1) } });
  expect(v.wirkung.union).toBeCloseTo(-9.867052 * hh.wirkungKuerzungProMrd - 3.5 * hh.wirkungSteuerErhoehungProMrd, 4);
  expect(v.wirkung.spd).toBeCloseTo(0.8332007 * hh.wirkungMehrausgabeProMrd, 4); // Bildung +5 %
  expect(v.bilanz.eingehalten).toBe(true);
});

test('Beschluss: Haushalt gilt weiter, Jahr zählt hoch, Schulden werden mitgezählt', () => {
  const { state } = beschliessen(imAmt(), { stufen: { arbeit: -P(5) } });
  expect(state.haushalt.jahr).toBe(2);
  expect(state.haushalt.etats.arbeit).toBe(Math.round(etats2026.arbeit * 0.95));
  expect(state.haushalt.neueSchuldenSeitStart).toBe(97970138 - (etats2026.arbeit - Math.round(etats2026.arbeit * 0.95)));
  expect(Math.round(summe(state.anteile) * 1000)).toBe(100000);
  // ein Jahr später: Startpunkt ist der beschlossene Haushalt
  expect(vorschau(state, {}).etats.arbeit).toBe(state.haushalt.etats.arbeit);
});

test('gleicher Seed ergibt gleiche Umfragen', () => {
  const p = { stufen: { arbeit: -2, verteidigung: 2 } }; // ohne Steuern: SPD+Union hat keine Bundesratsmehrheit (M9)
  expect(beschliessen(imAmt(7), p).state.anteile).toEqual(beschliessen(imAmt(7), p).state.anteile);
});

test('nach Jahr 4 beginnt der Wahlkampf, der Haushalt bleibt', () => {
  let z = imAmt();
  for (let jahr = 1; jahr <= config.legislaturJahre; jahr++) {
    expect(z.phase).toBe('regierung');
    // direkt ins Haushaltsmonat, ohne Quartale und Ereignisse (F12/F14), damit nur der Haushalt wirkt
    // Kürzung bei der Kanzlerpartei (Verkehr, SPD): kein Koalitionsbruch, Schuldenbremse hält
    z = haushaltBeschliessen({ ...z, monat: config.regierung.monateJeJahr }, { stufen: { verkehr: -P(5) } }).state;
  }
  expect(z.phase).toBe('wahlkampf');
  // Wirtschaftsverlauf: Start plus ein Eintrag je Haushaltsjahr, letzter Eintrag = aktuelle Kennzahlen
  expect(z.wirtschaftVerlauf).toHaveLength(config.legislaturJahre + 1);
  expect(z.wirtschaftVerlauf.at(-1)).toEqual({ wachstum: z.land.wachstum, inflation: z.land.inflation, arbeitslosigkeit: z.land.arbeitslosigkeit, schuldenquote: z.land.schuldenquote, gini: z.land.gini });
  expect(z.wahlkampfWoche).toBe(1);
  expect(z.kabinett).toBeNull();
  expect(z.haushalt.jahr).toBe(1);
  expect(z.haushalt.etats.verkehr).toBeLessThan(etats2026.verkehr);
});

test('ohne Regierung kein Haushalt', () => {
  expect(() => beschliessen({ ...imAmt(), phase: 'wahlkampf' }, {})).toThrow();
});
