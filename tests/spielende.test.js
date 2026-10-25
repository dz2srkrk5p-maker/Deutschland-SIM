import { test, expect } from 'vitest';
import { koalitionsbruch, bruchAbstand, vorschau, haushaltBeschliessen, koalitionPruefen, ultimatumRest, zugestaendnis, zugestaendnisSperre } from '../src/engine/haushalt.js';
import { verhandeln } from '../src/engine/koalition.js';
import { wahl } from '../src/engine/wahl.js';
import { neuesSpiel } from '../src/engine/state.js';
import { ministerien } from '../src/data/ministerien.js';
import { config } from '../src/data/config.js';
import { monatBeenden, haushaltsMonat } from '../src/engine/regierung.js';
import { ereignisEntscheiden } from '../src/engine/ereignisse.js';
// F12: bis zum Haushaltsmonat weiterschalten, dann beschließen
const beschliessen = (z, p) => {
  // F14: offene Ereignisse mit der ersten Möglichkeit beantworten
  while (!haushaltsMonat(z) || z.offenesEreignis) z = (z.offenesEreignis ? ereignisEntscheiden(z, { wahl: 0 }) : monatBeenden(z)).state;
  return haushaltBeschliessen(z, p);
};


// Regierung SPD (Kanzler) + Union + Grüne; Union hält Inneres, Grüne Umwelt, SPD den Rest
const imAmt = (sitze = { spd: 200, union: 200, gruene: 80, afd: 150 }) => {
  const verteilung = Object.fromEntries(ministerien.map((m) => [m.id, 'spd']));
  verteilung.inneres = 'union';
  verteilung.umwelt = 'gruene';
  return {
    ...neuesSpiel('spd', 1),
    phase: 'regierung',
    sitze,
    koalition: { partner: ['union', 'gruene'], startAnteile: { union: 28.6, gruene: 11.6 } },
    kanzlerParteiId: 'spd',
    kabinett: { anspruch: { spd: 14, union: 1, gruene: 1 }, verteilung },
  };
};
// Anteil setzen; die Differenz geht an „Sonstige“, damit die Summe 100 bleibt
const mitAnteil = (z, id, wert) => ({
  ...z,
  anteile: { ...z.anteile, [id]: wert, sonstige: z.anteile.sonstige + z.anteile[id] - wert },
});

test('Koalitionsbruch: knapp über der Grenze löst aus, genau auf der Grenze nicht', () => {
  const grenze = config.spielende.koalitionsbruchPunkte;
  expect(koalitionsbruch(mitAnteil(imAmt(), 'gruene', 11.6 - grenze)).state.koalition.partner).toEqual(['union', 'gruene']);
  expect(koalitionsbruch(mitAnteil(imAmt(), 'gruene', 11.6 - grenze - 0.01)).state.koalition.partner).toEqual(['union']);
});

test('bruchAbstand: dieselben Grenzfälle wie koalitionsbruch (−1,50 bleibt, −1,51 geht)', () => {
  const grenze = config.spielende.koalitionsbruchPunkte;
  const gruene = (z, anteile) => bruchAbstand(z, anteile).find((a) => a.id === 'gruene');
  expect(gruene(mitAnteil(imAmt(), 'gruene', 11.6 - grenze))).toEqual({ id: 'gruene', verlust: grenze, grenze, geht: false });
  expect(gruene(mitAnteil(imAmt(), 'gruene', 11.6 - grenze - 0.01)).geht).toBe(true);
  // Plan-Anteile (z. B. aus vorschau) statt zustand.anteile
  expect(gruene(imAmt(), mitAnteil(imAmt(), 'gruene', 11.6 - grenze - 0.01).anteile).geht).toBe(true);
});

test('vorschau: Anteile nach fester Wirkung, Summe 100, Kürzung beim Partner vergrößert seinen Verlust', () => {
  const z = imAmt();
  const v = vorschau(z, { stufen: { umwelt: -1 } });
  expect(Object.values(v.anteile).reduce((s, a) => s + a, 0)).toBeCloseTo(100, 6);
  expect(v.anteile.gruene).toBeCloseTo(z.anteile.gruene + v.wirkung.gruene, 3);
});

test('Bruch mit verbleibender Mehrheit: weiterregieren, Ministerien an den Spieler', () => {
  // SPD 200 + Union 200 = 400 ≥ 316
  const { state, neuwahl } = koalitionsbruch(mitAnteil(imAmt(), 'gruene', 9.0));
  expect(neuwahl).toBe(false);
  expect(state.kabinett.verteilung.umwelt).toBe('spd');
  expect(state.kabinett.anspruch).toEqual({ spd: 15, union: 1 });
});

test('Bruch ohne Mehrheit: vorgezogene Neuwahl', () => {
  // SPD 200 + Grüne 80 = 280 < 316, wenn die Union geht; SPD ist nicht stärkste Fraktion (seit F11 sonst Minderheit)
  const z = mitAnteil(imAmt({ spd: 200, union: 210, gruene: 80, afd: 140 }), 'union', 26.0);
  expect(koalitionsbruch(z).neuwahl).toBe(true);
  // Block 2: erst das Ultimatum am Monatsende, nach Ablauf der Frist der Bruch, hier mit Neuwahl
  let r = { state: z, ereignisse: [] };
  const alle = [];
  for (let i = 0; i < 10 && r.state.phase === 'regierung'; i++) {
    if (r.state.offenesEreignis) r = ereignisEntscheiden(r.state, { wahl: 0 });
    else r = haushaltsMonat(r.state) ? haushaltBeschliessen(r.state, {}) : monatBeenden(r.state);
    alle.push(...r.ereignisse);
  }
  expect(r.state.phase).toBe('wahlkampf');
  expect(r.state.koalition).toBeNull();
  const u = alle.findIndex((e) => e.startsWith('Ultimatum: CDU/CSU'));
  const b = alle.findIndex((e) => e.includes('vorgezogene Neuwahl'));
  expect(u).toBeGreaterThanOrEqual(0);
  expect(b).toBeGreaterThan(u);
  // zwischen Ultimatum und Bruch liegen so viele Monatsenden wie die Frist
  expect(alle.slice(u, b).filter((e) => / vorbei$|beschlossen/.test(e)).length).toBeGreaterThanOrEqual(config.koalitionsbruch.fristMonate);
});

test('Block 2: Ultimatum ab 80 % der Grenze, Bruch erst nach der Frist, Rücknahme unter der Warnstufe', () => {
  const grenze = config.spielende.koalitionsbruchPunkte;
  const kb = config.koalitionsbruch;
  // alter Spielstand ohne ultimatum-Feld: über der Grenze, aber noch kein Ultimatum → kein Bruch
  const z = { ...mitAnteil(imAmt(), 'gruene', 11.6 - grenze - 0.5), runde: 5 };
  const erst = koalitionPruefen(z);
  expect(erst.state.koalition.partner).toEqual(['union', 'gruene']);
  expect(erst.state.koalition.ultimatum).toEqual({ gruene: 5 + kb.fristMonate });
  expect(ultimatumRest(erst.state, 'gruene')).toBe(kb.fristMonate);
  const frist = 5 + kb.fristMonate; // Runde, in der gebrochen wird
  expect(ultimatumRest({ ...erst.state, runde: frist - 1 }, 'gruene')).toBe(1);
  // vor der Frist: bleibt
  expect(koalitionPruefen({ ...erst.state, runde: frist - 1 }).state.koalition.partner).toEqual(['union', 'gruene']);
  // Frist abgelaufen und weiter über der Grenze: Bruch, Ultimatum gelöscht
  const bruch = koalitionPruefen({ ...erst.state, runde: frist });
  expect(bruch.state.koalition.partner).toEqual(['union']);
  expect(bruch.state.koalition.ultimatum).toEqual({});
  // Frist abgelaufen, aber zwischen Warnstufe und Grenze: bleibt mit Ultimatum
  const knapp = { ...mitAnteil(erst.state, 'gruene', 11.6 - grenze * 0.9), runde: frist };
  expect(koalitionPruefen(knapp).state.koalition.ultimatum.gruene).toBe(frist);
  // unter der Warnstufe: Ultimatum zurückgezogen
  const erholt = koalitionPruefen({ ...mitAnteil(erst.state, 'gruene', 11.4), runde: frist });
  expect(erholt.state.koalition.ultimatum).toEqual({});
  expect(erholt.ereignisse[0]).toContain('zieht das Ultimatum zurück');
  // unter 80 %: kein Ultimatum
  expect(koalitionPruefen(mitAnteil(imAmt(), 'gruene', 11.6 - grenze * 0.7)).state.koalition.ultimatum).toEqual({});
});

test('Block 2: Zugeständnis hebt den Partner, kostet Kapital, Vorhaben und eigene Punkte, einmal je Jahr', () => {
  const kb = config.koalitionsbruch;
  const z = { ...imAmt(), kapital: 50, aktionenImMonat: 0 };
  const { state, ereignisse } = zugestaendnis(z, { partnerId: 'gruene' });
  expect(state.anteile.gruene).toBeCloseTo(z.anteile.gruene + kb.zugestaendnisPunkte, 2);
  expect(state.anteile.spd).toBeCloseTo(z.anteile.spd - kb.zugestaendnisKanzler, 2);
  expect(state.kapital).toBe(50 - kb.zugestaendnisKapital);
  expect(state.aktionenImMonat).toBe(1);
  expect(ereignisse[0]).toContain('Zugeständnis an Grüne');
  expect(zugestaendnisSperre(state, 'gruene')).toContain('schon');
  expect(zugestaendnisSperre({ ...z, kapital: 5 }, 'gruene')).toContain('Kapital');
  expect(zugestaendnisSperre(z, 'linke')).toBe('kein Koalitionspartner');
});

test('Sieg nach 12 Jahren als Kanzler, nicht nach 11', () => {
  const z = (jahre) => ({ ...imAmt(), statistik: { jahreKanzler: jahre, regierungenGebildet: 3, besteWahl: 20 } });
  expect(beschliessen(z(config.spielende.siegJahreKanzler - 2), {}).state.phase).toBe('regierung');
  expect(beschliessen(z(config.spielende.siegJahreKanzler - 1), {}).state.phase).toBe('sieg');
});

test('Sieg geht vor Koalitionsbruch im selben Jahr', () => {
  const z = { ...mitAnteil(imAmt(), 'union', 20.0), statistik: { jahreKanzler: 11, regierungenGebildet: 3, besteWahl: 20 } };
  expect(beschliessen(z, {}).state.phase).toBe('sieg');
});

test('Opposition: knapp ohne mögliche Mehrheit ja, knapp mit Mehrheit nein', () => {
  // Spieler SPD; einziger möglicher Partner Union. 315 Sitze zusammen reichen nicht, 316 schon.
  const nachWahlMit = (spd, union) => {
    const z = neuesSpiel('spd', 1);
    const anteile = { ...Object.fromEntries(Object.keys(z.anteile).map((id) => [id, 0])), spd, union, afd: 100 - spd - union };
    return wahl({ ...z, anteile }).state;
  };
  // Anteile so gewählt, dass SPD+Union genau 315 bzw. 316 von 630 Sitzen bekommen
  expect(nachWahlMit(25, 25).phase).toBe('opposition'); // 315 Sitze
  expect(nachWahlMit(25, 25.1).phase).toBe('koalition'); // 316 Sitze
});

test('Statistik zählt Regierungen, Kanzlerjahre und beste Wahl', () => {
  const z = { ...neuesSpiel('union', 1), phase: 'koalition', sitze: { union: 400, spd: 230 } };
  const regiert = verhandeln(z, { partner: [] }).state;
  expect(regiert.statistik.regierungenGebildet).toBe(1);
  const nachJahr = beschliessen(regiert, {}).state;
  expect(nachJahr.statistik.jahreKanzler).toBe(1);
  expect(wahl(neuesSpiel('spd', 1)).state.statistik.besteWahl).toBe(16.4);
});

test('F11: Bruch ohne Mehrheit als stärkste Fraktion: weiter als Minderheitsregierung', () => {
  // SPD 200 = Union 200: gleich stark zählt als stärkste Fraktion
  const { state, neuwahl, ereignisse } = koalitionsbruch(mitAnteil(imAmt(), 'union', 26.0));
  expect(neuwahl).toBe(false);
  expect(state.koalition.minderheit).toBe(true);
  expect(state.koalition.partner).toEqual(['gruene']);
  expect(ereignisse.at(-1)).toContain('Minderheitsregierung');
});

// Minderheitsregierung der Grünen mit Sitzen 2025: Haushalt fällt durch (205 Ja, 361 Nein)
const minderheit = () => {
  const verteilung = Object.fromEntries(ministerien.map((m) => [m.id, 'gruene']));
  return {
    ...neuesSpiel('gruene', 1),
    phase: 'regierung',
    sitze: { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 },
    koalition: { partner: [], startAnteile: {}, minderheit: true, fehlschlaege: 0 },
    kanzlerParteiId: 'gruene',
    kabinett: { anspruch: { gruene: 16 }, verteilung },
  };
};

test('F11: gescheiterter Haushalt: Vorjahr gilt weiter, Jahr zählt, Kanzlerpartei verliert, zweiter Fehlschlag = Spielende', () => {
  const z = minderheit();
  const { state, ereignisse } = beschliessen(z, { stufen: { umwelt: 2 } });
  expect(ereignisse[0]).toContain('gescheitert');
  expect(state.haushalt.etats).toEqual(z.haushalt.etats); // die gewünschte Erhöhung gilt nicht
  expect(state.haushalt.jahr).toBe(2);
  expect(state.statistik.jahreKanzler).toBe(1);
  expect(state.koalition.fehlschlaege).toBe(1);
  // feste Wirkung −0,5 für die Kanzlerpartei (dazu die Lage der Wirtschaft, System 2)
  expect(ereignisse[0]).toMatch(/Grüne −/);
  const zweite = beschliessen(state, {});
  expect(zweite.state.phase).toBe('opposition');
  expect(zweite.ereignisse.at(-1)).toContain('Minderheitsregierung ist am Ende');
});

test('F11: Mehrheitsregierung kann nicht an der Abstimmung scheitern (sonst Fehler statt vorläufiger Haushalt)', () => {
  const z = { ...minderheit(), koalition: { partner: [], startAnteile: {}, minderheit: false, fehlschlaege: 0 } };
  expect(() => beschliessen(z, {})).toThrow('Keine Mehrheit im Bundestag');
});
