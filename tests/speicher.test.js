import { test, expect } from 'vitest';
import { spielSichern, spielLaden, spielLoeschen, hinweiseAn, hinweiseSetzen } from '../src/storage/speicher.js';
import { neuesSpiel } from '../src/engine/state.js';
import { wahlkampfWoche } from '../src/engine/wahlkampf.js';

// Ersatz für localStorage
const ersatzSpeicher = () => {
  const daten = new Map();
  return {
    getItem: (k) => (daten.has(k) ? daten.get(k) : null),
    setItem: (k, v) => daten.set(k, String(v)),
    removeItem: (k) => daten.delete(k),
    daten,
  };
};

test('Sichern und Laden ergibt denselben Zustand und dasselbe Protokoll', () => {
  const s = ersatzSpeicher();
  const { state, ereignisse } = wahlkampfWoche(neuesSpiel('gruene', 5), { aktion: 'kundgebung' });
  spielSichern(state, ereignisse, s);
  expect(spielLaden(s)).toEqual({ zustand: state, protokoll: ereignisse });
});

test('ohne Spielstand: null', () => {
  expect(spielLaden(ersatzSpeicher())).toBeNull();
});

test('kaputter oder veralteter Spielstand wird verworfen', () => {
  const s = ersatzSpeicher();
  s.setItem('desim-zustand', 'kein json');
  expect(spielLaden(s)).toBeNull();
  expect(s.daten.size).toBe(0);
  s.setItem('desim-zustand', JSON.stringify({ ...neuesSpiel('spd', 1), version: 0 }));
  expect(spielLaden(s)).toBeNull();
});

test('Löschen entfernt den Spielstand', () => {
  const s = ersatzSpeicher();
  spielSichern(neuesSpiel('spd', 1), [], s);
  spielLoeschen(s);
  expect(spielLaden(s)).toBeNull();
});

test('gesperrter Speicher (z. B. privates Fenster) bricht das Spiel nicht ab', () => {
  const gesperrt = { getItem: () => { throw new Error('gesperrt'); }, setItem: () => { throw new Error('voll'); }, removeItem: () => { throw new Error('gesperrt'); } };
  expect(() => spielSichern(neuesSpiel('spd', 1), [], gesperrt)).not.toThrow();
  expect(spielLaden(gesperrt)).toBeNull();
});

test('Hinweis-Schalter: ohne Eintrag an, wird gemerkt, unabhängig vom Spielstand', () => {
  const s = ersatzSpeicher();
  expect(hinweiseAn(s)).toBe(true);
  hinweiseSetzen(false, s);
  expect(hinweiseAn(s)).toBe(false);
  spielLoeschen(s);
  expect(hinweiseAn(s)).toBe(false);
  hinweiseSetzen(true, s);
  expect(hinweiseAn(s)).toBe(true);
});

test('Hinweis-Schalter: gesperrter Speicher bricht nichts, Hinweise bleiben an', () => {
  const gesperrt = { getItem: () => { throw new Error('gesperrt'); }, setItem: () => { throw new Error('voll'); } };
  expect(() => hinweiseSetzen(false, gesperrt)).not.toThrow();
  expect(hinweiseAn(gesperrt)).toBe(true);
});
