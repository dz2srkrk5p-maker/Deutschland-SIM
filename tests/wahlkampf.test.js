import { test, expect } from 'vitest';
import { wirkung, schwankung, runden, umverteilen, wahlkampfWoche, ertragFaktor } from '../src/engine/wahlkampf.js';
import { neuesSpiel, zurueckInDenWahlkampf } from '../src/engine/state.js';
import { config } from '../src/data/config.js';

const wk = config.wahlkampf;
const summe = (anteile) => Object.values(anteile).reduce((s, a) => s + a, 0);
const start = () => neuesSpiel('spd', 4711);

const spiele = (zustand, zuege) => {
  let z = zustand;
  for (const zug of zuege) z = wahlkampfWoche(z, zug).state;
  return z;
};
const zuege = [
  { aktion: 'plakate' }, { aktion: 'kundgebung' }, { aktion: 'angriff', ziel: 'afd' }, { aktion: 'kundgebung' },
];

test('gleicher Seed und gleiche Aktionen ergeben gleiche Umfragewerte', () => {
  expect(spiele(start(), zuege).anteile).toEqual(spiele(start(), zuege).anteile);
  expect(spiele(neuesSpiel('spd', 1), zuege).anteile).not.toEqual(spiele(start(), zuege).anteile);
});

test('Summe bleibt nach jeder Woche genau 100, kein Anteil negativ', () => {
  let z = start();
  for (let i = 0; i < wk.wochen - 1; i++) {
    z = wahlkampfWoche(z, zuege[i % zuege.length]).state;
    expect(Math.round(summe(z.anteile) * 1000)).toBe(100000);
    expect(Object.values(z.anteile).every((a) => a >= 0)).toBe(true);
  }
});

test('Plakate wirken genau +0,4 vor der Schwankung, Summe bleibt 100', () => {
  const { anteile } = wirkung(start().anteile, 'spd', { aktion: 'plakate' }, 1);
  expect(anteile.spd).toBeCloseTo(16.4 + wk.plakateGewinn, 9);
  expect(summe(anteile)).toBeCloseTo(100, 9);
});

test('Kundgebung bleibt immer zwischen −0,5 und +1,5', () => {
  let rng = 1;
  for (let i = 0; i < 500; i++) {
    const w = wirkung(start().anteile, 'spd', { aktion: 'kundgebung' }, rng);
    rng = w.rngZustand;
    expect(w.anteile.spd - 16.4).toBeGreaterThanOrEqual(wk.kundgebungMin - 1e-9);
    expect(w.anteile.spd - 16.4).toBeLessThanOrEqual(wk.kundgebungMax + 1e-9);
  }
});

test('Angriff: Ziel −0,8, du +0,3, Rest an die anderen', () => {
  const vorher = start().anteile;
  const { anteile } = wirkung(vorher, 'spd', { aktion: 'angriff', ziel: 'afd' }, 1);
  expect(anteile.afd).toBeCloseTo(vorher.afd - wk.angriffZielVerlust, 9);
  expect(anteile.spd).toBeCloseTo(vorher.spd + wk.angriffEigenGewinn, 9);
  expect(anteile.union).toBeGreaterThan(vorher.union);
  expect(summe(anteile)).toBeCloseTo(100, 9);
});

test('Angriff auf eine Partei mit fast 0 %: Anteil fällt nicht unter 0', () => {
  const anteile = umverteilen({ a: 0.1, b: 50, c: 49.9 }, { a: -0.8 });
  expect(anteile.a).toBe(0);
  expect(summe(anteile)).toBeCloseTo(100, 9);
});

test('Schwankung bleibt im Rahmen und ergibt wieder 100', () => {
  const vorher = start().anteile;
  const { anteile } = schwankung(vorher, 99);
  expect(summe(anteile)).toBeCloseTo(100, 9);
  // ±0,3 plus kleine Korrektur durch das Zurückrechnen auf 100
  for (const id in vorher) expect(Math.abs(anteile[id] - vorher[id])).toBeLessThan(wk.schwankungMax + 0.1);
});

test('runden ergibt Tausendstel mit Summe genau 100', () => {
  const r = runden({ a: 33.33333, b: 33.33333, c: 33.33334 });
  expect(Math.round(summe(r) * 1000)).toBe(100000);
});

test('nach der letzten Woche kommt die Wahl, danach Phase Koalition', () => {
  let z = start();
  for (let i = 1; i < wk.wochen; i++) {
    z = wahlkampfWoche(z, { aktion: 'plakate' }).state;
    expect(z.phase).toBe('wahlkampf');
  }
  const { state, ereignisse } = wahlkampfWoche(z, { aktion: 'plakate' });
  expect(state.phase).toBe('koalition');
  expect(Object.values(state.sitze).reduce((s, n) => s + n, 0)).toBe(config.sitzeBundestag);
  expect(ereignisse.at(-1)).toMatch(/^Bundestagswahl/);
});

test('ungültige Züge werden abgelehnt', () => {
  expect(() => wahlkampfWoche(start(), { aktion: 'bestechung' })).toThrow();
  expect(() => wahlkampfWoche(start(), { aktion: 'angriff', ziel: 'spd' })).toThrow();
  expect(() => wahlkampfWoche(start(), { aktion: 'angriff', ziel: 'sonstige' })).toThrow();
  expect(() => wahlkampfWoche({ ...start(), phase: 'koalition' }, { aktion: 'plakate' })).toThrow();
});

test('abnehmender Ertrag (F08): 100 %, 75 %, 50 %, 25 %, nie darunter; andere Aktion setzt zurück', () => {
  let z = start();
  const faktoren = [];
  for (let i = 0; i < 6; i++) {
    faktoren.push(ertragFaktor(z, 'plakate'));
    z = wahlkampfWoche(z, { aktion: 'plakate' }).state;
  }
  expect(faktoren).toEqual([1, 0.75, 0.5, 0.25, 0.25, 0.25].map((f) => Math.max(wk.mindestFaktor, f)));
  expect(z.wahlkampfSerie).toEqual({ aktion: 'plakate', anzahl: 6 });
  expect(ertragFaktor(z, 'kundgebung')).toBe(1);
  z = wahlkampfWoche(z, { aktion: 'kundgebung' }).state;
  expect(ertragFaktor(z, 'plakate')).toBe(1);
});

test('abnehmender Ertrag: Angriff auf ein anderes Ziel zählt als Wiederholung, neuer Wahlkampf setzt zurück', () => {
  let z = wahlkampfWoche(start(), { aktion: 'angriff', ziel: 'afd' }).state;
  expect(ertragFaktor(z, 'angriff')).toBe(0.75);
  z = wahlkampfWoche(z, { aktion: 'angriff', ziel: 'union' }).state;
  expect(z.wahlkampfSerie.anzahl).toBe(2);
  expect(zurueckInDenWahlkampf(z).wahlkampfSerie).toBeNull();
});

test('abnehmender Ertrag: die Wirkung wird genau mit dem Faktor verkleinert', () => {
  const vorher = start().anteile;
  expect(wirkung(vorher, 'spd', { aktion: 'plakate' }, 1, 0.5).anteile.spd).toBeCloseTo(vorher.spd + wk.plakateGewinn * 0.5, 10);
  const a = wirkung(vorher, 'spd', { aktion: 'angriff', ziel: 'afd' }, 1, 0.5).anteile;
  expect(a.afd).toBeCloseTo(vorher.afd - wk.angriffZielVerlust * 0.5, 10);
  expect(a.spd).toBeCloseTo(vorher.spd + wk.angriffEigenGewinn * 0.5, 10);
  // Kundgebung: gleiche Zufallszahl, halbe Wirkung
  const voll = wirkung(vorher, 'spd', { aktion: 'kundgebung' }, 7).anteile.spd - vorher.spd;
  const halb = wirkung(vorher, 'spd', { aktion: 'kundgebung' }, 7, 0.5).anteile.spd - vorher.spd;
  expect(halb).toBeCloseTo(voll * 0.5, 10);
  // Protokoll nennt die Abnahme
  const z = wahlkampfWoche(start(), { aktion: 'plakate' }).state;
  expect(wahlkampfWoche(z, { aktion: 'plakate' }).ereignisse[0]).toContain('2. Mal in Folge, 75 % Wirkung');
});
