import { test, expect } from 'vitest';
import { neuesSpiel, speichern, laden, ZUSTAND_VERSION, seedAusAdresse } from '../src/engine/state.js';
import { zufall } from '../src/engine/rng.js';
import { config } from '../src/data/config.js';
import { wahlkampfWoche } from '../src/engine/wahlkampf.js';
import { ministerien } from '../src/data/ministerien.js';
import { haushaltBeschliessen } from '../src/engine/haushalt.js';
import { quartalBeenden, haushaltsQuartal } from '../src/engine/regierung.js';
import { ereignisEntscheiden } from '../src/engine/ereignisse.js';
// F12: bis zum Haushaltsquartal weiterschalten, dann beschließen
const beschliessen = (z, p) => {
  // F14: offene Ereignisse mit der ersten Möglichkeit beantworten
  while (!haushaltsQuartal(z) || z.offenesEreignis) z = (z.offenesEreignis ? ereignisEntscheiden(z, { wahl: 0 }) : quartalBeenden(z)).state;
  return haushaltBeschliessen(z, p);
};


test('Anfangszustand enthält Startwerte aus den Daten', () => {
  const z = neuesSpiel('spd', 7);
  expect(z.phase).toBe('wahlkampf');
  expect(z.spielerParteiId).toBe('spd');
  expect(z.anteile.union).toBe(28.6);
  expect(Object.values(z.anteile).reduce((s, a) => s + a, 0)).toBeCloseTo(100, 9);
});

test('Speichern und Laden ergibt denselben Zustand', () => {
  const z = neuesSpiel('gruene', 12345);
  expect(laden(speichern(z))).toEqual(z);
});

test('geladener Zustand liefert denselben Zufall weiter', () => {
  const z = neuesSpiel('afd', 99);
  const geladen = laden(speichern(z));
  expect(zufall(geladen.rngZustand)).toEqual(zufall(z.rngZustand));
});

test('ungültige Eingaben werden abgelehnt', () => {
  expect(() => neuesSpiel('gibtsnicht', 1)).toThrow();
  expect(() => neuesSpiel('sonstige', 1)).toThrow();
  expect(() => neuesSpiel('spd', 1.5)).toThrow();
  expect(() => laden('{"version":0}')).toThrow();
  expect(() => laden('kein json')).toThrow();
});

test('Version 2 (F05): neue Felder gesetzt, Spielstände der Version 1 werden abgelehnt', () => {
  const z = neuesSpiel('spd', 1);
  expect(ZUSTAND_VERSION).toBeGreaterThanOrEqual(2);
  expect(z.wahlergebnis).toBeNull();
  expect(z.wahlkampfStart).toBe(16.4);
  expect(() => laden(JSON.stringify({ ...z, version: 1 }))).toThrow();
});

test('Version 3 (F07): Start-Seed bleibt im Spielstand, Version 2 wird abgelehnt', () => {
  const z = neuesSpiel('spd', 12345);
  expect(ZUSTAND_VERSION).toBeGreaterThanOrEqual(3);
  expect(z.seed).toBe(12345);
  expect(() => laden(JSON.stringify({ ...z, version: 2 }))).toThrow();
});

test('Seed aus der Adresse: gültige ganze Zahl, sonst null', () => {
  expect(seedAusAdresse('?seed=12345')).toBe(12345);
  expect(seedAusAdresse('?seed=0')).toBe(0);
  expect(seedAusAdresse('?seed=4294967295')).toBe(4294967295);
  for (const falsch of ['', '?seed=', '?seed=-1', '?seed=1.5', '?seed=abc', '?seed=4294967296', '?seed=1e5', '?seed=%2012', '?partei=spd']) {
    expect(seedAusAdresse(falsch)).toBeNull();
  }
});

test('Verlauf (F09): ein Eintrag je Aktion, Wahl markiert, Haushalt zählt mit, Version 4 abgelehnt', () => {
  let z = neuesSpiel('union', 3);
  expect(ZUSTAND_VERSION).toBeGreaterThanOrEqual(5);
  expect(z.verlauf).toEqual([{ schritt: 0, anteil: 28.6 }]);
  expect(() => laden(JSON.stringify({ ...z, version: 4 }))).toThrow();
  for (let woche = 1; woche <= config.wahlkampf.wochen; woche++) {
    z = wahlkampfWoche(z, { aktion: 'plakate' }).state;
    expect(z.verlauf).toHaveLength(woche + 1);
    expect(z.verlauf.at(-1).anteil).toBe(z.anteile.union);
  }
  expect(z.verlauf.filter((e) => e.wahl).map((e) => e.schritt)).toEqual([config.wahlkampf.wochen]);
  // Alleinregierung im Amt, ein Haushalt: ein weiterer Eintrag ohne Wahl-Markierung
  const verteilung = Object.fromEntries(ministerien.map((m) => [m.id, 'union']));
  const regierung = { ...z, phase: 'regierung', kanzlerParteiId: 'union', koalition: { partner: [], startAnteile: {} }, kabinett: { anspruch: { union: 16 }, verteilung } };
  const nachher = haushaltBeschliessen({ ...regierung, quartal: config.regierung.quartaleJeJahr }, {}).state;
  expect(nachher.verlauf).toHaveLength(regierung.verlauf.length + 1);
  expect(nachher.verlauf.at(-1)).toEqual({ schritt: config.wahlkampf.wochen + 1, anteil: nachher.anteile.union });
});
