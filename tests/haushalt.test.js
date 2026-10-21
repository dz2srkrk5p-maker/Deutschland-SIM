import { test, expect } from 'vitest';
import { bilanz, vorschau, haushaltBeschliessen } from '../src/engine/haushalt.js';
import { neuesSpiel } from '../src/engine/state.js';
import { etats2026, steuern2026 } from '../src/data/haushalt.js';
import { ministerien } from '../src/data/ministerien.js';
import { config } from '../src/data/config.js';

const hh = config.haushalt;
const summe = (o) => Object.values(o).reduce((s, x) => s + x, 0);

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
  const b = bilanz(etats2026, steuern2026);
  expect(b.ausgaben).toBe(524540138);
  expect(b.einnahmen).toBe(426570000);
  expect(b.neueSchulden).toBe(97970138);
  expect(b.schuldenbremse).toBe(hh.schuldenbremseGrenze);
  expect(b.eingehalten).toBe(true);
});

test('jedes Ministerium hat einen Etat', () => {
  expect(Object.keys(etats2026).sort()).toEqual(ministerien.map((m) => m.id).sort());
});

test('Schrittgrenzen: ±4 Stufen (±20 %) und ±5 Steuerstufen erlaubt, mehr nicht', () => {
  expect(() => vorschau(imAmt(), { stufen: { arbeit: -4 }, steuerStufe: 5 })).not.toThrow();
  expect(() => vorschau(imAmt(), { stufen: { arbeit: 5 } })).toThrow();
  expect(() => vorschau(imAmt(), { stufen: { arbeit: 1.5 } })).toThrow();
  expect(() => vorschau(imAmt(), { steuerStufe: -6 })).toThrow();
  expect(() => vorschau(imAmt(), { stufen: { gibtsnicht: 1 } })).toThrow();
});

test('Mehrausgaben ohne Gegenfinanzierung brechen die Schuldenbremse', () => {
  const z = imAmt();
  expect(vorschau(z, { stufen: { bildung: 1 } }).bilanz.eingehalten).toBe(false);
  expect(() => haushaltBeschliessen(z, { stufen: { bildung: 1 } })).toThrow();
});

test('Mehr Verteidigung über der Freigrenze zählt nicht zur Schuldenbremse', () => {
  const v = vorschau(imAmt(), { stufen: { verteidigung: 4 } });
  expect(v.bilanz.neueSchulden).toBeGreaterThan(97970138);
  expect(v.bilanz.schuldenbremse).toBe(hh.schuldenbremseGrenze);
  expect(v.bilanz.eingehalten).toBe(true);
});

test('Wirkung trifft die Partei, die das Ministerium hält', () => {
  // Arbeit −5 % = −9,867 Mrd. → Union (Arbeit); Steuern +1 % = +3,872 Mrd. → Union (Finanzen); Bildung +5 % → SPD
  const v = vorschau(imAmt(), { stufen: { arbeit: -1, bildung: 1 }, steuerStufe: 1 });
  expect(v.wirkung.union).toBeCloseTo(-9.867052 * hh.wirkungKuerzungProMrd - 3.8721 * hh.wirkungSteuerErhoehungProMrd, 4);
  expect(v.wirkung.spd).toBeCloseTo(0.8332007 * hh.wirkungMehrausgabeProMrd, 4); // Bildung +5 %
  expect(v.bilanz.eingehalten).toBe(true);
});

test('Beschluss: Haushalt gilt weiter, Jahr zählt hoch, Schulden werden mitgezählt', () => {
  const { state } = haushaltBeschliessen(imAmt(), { stufen: { arbeit: -1 } });
  expect(state.haushalt.jahr).toBe(2);
  expect(state.haushalt.etats.arbeit).toBe(Math.round(etats2026.arbeit * 0.95));
  expect(state.haushalt.neueSchuldenSeitStart).toBe(97970138 - (etats2026.arbeit - Math.round(etats2026.arbeit * 0.95)));
  expect(Math.round(summe(state.anteile) * 1000)).toBe(100000);
  // ein Jahr später: Startpunkt ist der beschlossene Haushalt
  expect(vorschau(state, {}).etats.arbeit).toBe(state.haushalt.etats.arbeit);
});

test('gleicher Seed ergibt gleiche Umfragen', () => {
  const p = { stufen: { arbeit: -2, verteidigung: 2 } }; // ohne Steuern: SPD+Union hat keine Bundesratsmehrheit (M9)
  expect(haushaltBeschliessen(imAmt(7), p).state.anteile).toEqual(haushaltBeschliessen(imAmt(7), p).state.anteile);
});

test('nach Jahr 4 beginnt der Wahlkampf, der Haushalt bleibt', () => {
  let z = imAmt();
  for (let jahr = 1; jahr <= config.legislaturJahre; jahr++) {
    expect(z.phase).toBe('regierung');
    z = haushaltBeschliessen(z, { stufen: { arbeit: -1 } }).state;
  }
  expect(z.phase).toBe('wahlkampf');
  expect(z.wahlkampfWoche).toBe(1);
  expect(z.kabinett).toBeNull();
  expect(z.haushalt.jahr).toBe(1);
  expect(z.haushalt.etats.arbeit).toBeLessThan(etats2026.arbeit);
});

test('ohne Regierung kein Haushalt', () => {
  expect(() => haushaltBeschliessen({ ...imAmt(), phase: 'wahlkampf' }, {})).toThrow();
});
