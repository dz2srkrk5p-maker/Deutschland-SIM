import { test, expect } from 'vitest';
import { parteien } from '../src/data/parteien.js';
import { config } from '../src/data/config.js';
import { laender, bundesratGesamt, bundesratMehrheit } from '../src/data/laender.js';
import { ministerien } from '../src/data/ministerien.js';
import { hinweise } from '../src/data/hinweise.js';

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

test('jede Phase hat einen Hinweis, Zahlen sind eingesetzt', () => {
  for (const schluessel of ['start', 'wahlkampf', 'koalition', 'kabinett', 'regierung', 'ende']) {
    expect(hinweise[schluessel]).toMatch(/\S/);
    expect(hinweise[schluessel]).not.toMatch(/undefined|NaN|\$\{/);
  }
  expect(hinweise.koalition).toContain('316 Sitze');
});

test('jede spielbare Partei hat eine gültige Schwierigkeitsstufe (F06)', () => {
  const gueltig = [...Object.keys(config.schwierigkeit), 'fast unmöglich'];
  for (const p of parteien.filter((p) => !p.sonstige)) expect(gueltig).toContain(p.schwierigkeit);
});
