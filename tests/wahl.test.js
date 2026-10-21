import { test, expect } from 'vitest';
import { wahl } from '../src/engine/wahl.js';
import { sainteLague } from '../src/engine/hoechstzahl.js';
import { neuesSpiel, zurueckInDenWahlkampf } from '../src/engine/state.js';
import { zufall } from '../src/engine/rng.js';
import { parteien } from '../src/data/parteien.js';

const summe = (sitze) => Object.values(sitze).reduce((s, n) => s + n, 0);

// Zustand mit eigenen Anteilen; nicht genannte Parteien bekommen 0 %
const mitAnteilen = (anteile) => ({
  ...neuesSpiel('spd', 1),
  anteile: { ...Object.fromEntries(parteien.map((p) => [p.id, 0])), ...anteile },
});

test('Rechenbeispiel aus Datei 03: A=3, B=3, C=1, D=1', () => {
  const { sitze } = sainteLague({ A: 100, B: 80, C: 30, D: 20 }, 8, 1);
  expect(sitze).toEqual({ A: 3, B: 3, C: 1, D: 1 });
});

test('Gleichstand an der Grenze: Los, mit gleichem Seed immer gleich', () => {
  const gewinner = (seed) => Object.keys(sainteLague({ A: 10, B: 10 }, 3, seed).sitze).find(
    (id) => sainteLague({ A: 10, B: 10 }, 3, seed).sitze[id] === 2,
  );
  expect(gewinner(5)).toBe(gewinner(5));
  // über viele Seeds gewinnen beide mal
  const sieger = new Set(Array.from({ length: 50 }, (_, i) => gewinner(i)));
  expect(sieger).toEqual(new Set(['A', 'B']));
});

test('kein Los ohne Gleichstand: Zufall bleibt unverbraucht', () => {
  // (Im Beispiel aus Datei 03 haben A und D zwischendurch beide Höchstzahl 40 – dort wird gelost, ohne Folgen.)
  expect(sainteLague({ A: 100, B: 80, C: 30 }, 8, 77).rngZustand).toBe(77);
});

test('Sperrklausel: 4,99 % bekommt nichts, genau 5,0 % schon', () => {
  const unter = wahl(mitAnteilen({ union: 50, spd: 45.01, fdp: 4.99 })).state.sitze;
  expect(unter.fdp).toBeUndefined();
  const genau = wahl(mitAnteilen({ union: 50, spd: 45, fdp: 5 })).state.sitze;
  expect(genau.fdp).toBeGreaterThan(0);
});

test('Sonstige bekommen nie Sitze, auch über 5 %', () => {
  const { sitze } = wahl(mitAnteilen({ union: 60, sonstige: 40 })).state;
  expect(sitze).toEqual({ union: 630 });
});

test('nur eine Partei über der Hürde bekommt alle 630 Sitze', () => {
  expect(wahl(mitAnteilen({ union: 96, fdp: 4 })).state.sitze).toEqual({ union: 630 });
});

test('keine Partei über der Hürde: Fehler', () => {
  expect(() => wahl(mitAnteilen({ fdp: 4, sonstige: 96 }))).toThrow();
});

test('Summe ist immer die Gesamtsitzzahl (viele Zufallsverteilungen)', () => {
  let z = 2024;
  for (let lauf = 0; lauf < 200; lauf++) {
    const stimmen = {};
    const anzahl = 1 + (lauf % 8);
    for (let i = 0; i < anzahl; i++) {
      const r = zufall(z);
      z = r.rngZustand;
      stimmen[`P${i}`] = 1 + Math.floor(r.wert * 100000);
    }
    expect(summe(sainteLague(stimmen, 630, z).sitze)).toBe(630);
  }
});

test('Wahl mit Startwerten 2025: 630 Sitze, Phase Koalition, nah am echten Ergebnis', () => {
  const { state, ereignisse } = wahl(neuesSpiel('spd', 1));
  expect(state.phase).toBe('koalition');
  expect(summe(state.sitze)).toBe(630);
  expect(Object.keys(state.sitze).sort()).toEqual(['afd', 'gruene', 'linke', 'spd', 'union']);
  // echtes Ergebnis 2025 ohne SSW (1 Sitz): höchstens 1 Sitz Abweichung je Partei
  for (const p of parteien) expect(Math.abs((state.sitze[p.id] ?? 0) - p.sitze2025)).toBeLessThanOrEqual(1);
  expect(ereignisse).toHaveLength(1);
});

test('Wahlergebnis: erste Wahl gegen 2025, zweite gegen die erste, Wahlkampfbilanz netto', () => {
  const start = neuesSpiel('spd', 1);
  const erste = wahl({ ...start, anteile: { ...start.anteile, spd: 17.4, sonstige: start.anteile.sonstige - 1 } }).state;
  expect(erste.wahlergebnis.vorher.spd).toBe(16.4); // Ergebnis 2025
  expect(erste.wahlergebnis.anteile.spd).toBe(17.4);
  expect(erste.wahlergebnis.wahlkampf).toBe(1);

  const wahlkampf = zurueckInDenWahlkampf(erste);
  expect(wahlkampf.wahlkampfStart).toBe(17.4);
  expect(wahlkampf.wahlergebnis).toEqual(erste.wahlergebnis); // bleibt für den nächsten Vergleich
  const zweite = wahl({ ...wahlkampf, anteile: { ...wahlkampf.anteile, spd: 16.9, sonstige: wahlkampf.anteile.sonstige + 0.5 } }).state;
  expect(zweite.wahlergebnis.vorher).toEqual(erste.wahlergebnis.anteile);
  expect(zweite.wahlergebnis.anteile.spd).toBe(16.9);
  expect(zweite.wahlergebnis.wahlkampf).toBe(-0.5);
});
