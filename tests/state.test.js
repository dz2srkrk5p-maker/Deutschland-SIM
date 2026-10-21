import { test, expect } from 'vitest';
import { neuesSpiel, speichern, laden, ZUSTAND_VERSION } from '../src/engine/state.js';
import { zufall } from '../src/engine/rng.js';

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
  expect(ZUSTAND_VERSION).toBe(2);
  expect(z.wahlergebnis).toBeNull();
  expect(z.wahlkampfStart).toBe(16.4);
  expect(() => laden(JSON.stringify({ ...z, version: 1 }))).toThrow();
});
