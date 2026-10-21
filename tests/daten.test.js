import { test, expect } from 'vitest';
import { parteien } from '../src/data/parteien.js';
import { laender, bundesratGesamt, bundesratMehrheit } from '../src/data/laender.js';
import { ministerien } from '../src/data/ministerien.js';

const eindeutig = (liste) => new Set(liste.map((x) => x.id)).size === liste.length;

test('Stimmanteile ergeben 100 %', () => {
  expect(parteien.reduce((s, p) => s + p.startanteil, 0)).toBeCloseTo(100, 9);
});

test('Bundesrat: 16 Länder, 69 Stimmen, Mehrheit 35', () => {
  expect(laender).toHaveLength(16);
  expect(bundesratGesamt).toBe(69);
  expect(bundesratMehrheit).toBe(35);
});

test('16 Ministerien', () => {
  expect(ministerien).toHaveLength(16);
});

test('keine doppelten IDs', () => {
  expect(eindeutig(parteien)).toBe(true);
  expect(eindeutig(laender)).toBe(true);
  expect(eindeutig(ministerien)).toBe(true);
});
