import { test, expect } from 'vitest';
import { zufall } from '../src/engine/rng.js';

const folge = (seed, n) => {
  const werte = [];
  let z = seed;
  for (let i = 0; i < n; i++) {
    const r = zufall(z);
    werte.push(r.wert);
    z = r.rngZustand;
  }
  return werte;
};

test('gleicher Seed ergibt gleiche Folge', () => {
  expect(folge(42, 100)).toEqual(folge(42, 100));
});

test('anderer Seed ergibt andere Folge', () => {
  expect(folge(42, 10)).not.toEqual(folge(43, 10));
});

test('Werte liegen in [0, 1) und sind grob gleich verteilt', () => {
  const werte = folge(1, 10000);
  expect(werte.every((w) => w >= 0 && w < 1)).toBe(true);
  const mittel = werte.reduce((s, w) => s + w, 0) / werte.length;
  expect(mittel).toBeGreaterThan(0.48);
  expect(mittel).toBeLessThan(0.52);
});
