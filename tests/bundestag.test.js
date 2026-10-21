import { test, expect } from 'vitest';
import { sitzPositionen, fraktionen, bundestagSvg } from '../src/ui/components/bundestag.js';
import { parteien } from '../src/data/parteien.js';

test('so viele Plätze wie Sitze, für viele Größen', () => {
  for (const n of [1, 2, 3, 7, 50, 299, 630, 736]) {
    expect(sitzPositionen(n).plaetze).toHaveLength(n);
  }
  expect(sitzPositionen(0).plaetze).toHaveLength(0);
});

test('Plätze liegen im oberen Halbkreis und laufen von links nach rechts', () => {
  const { plaetze, punktRadius } = sitzPositionen(630);
  expect(punktRadius).toBeGreaterThan(0);
  for (const p of plaetze) {
    expect(p.y).toBeGreaterThanOrEqual(-1e-9);
    expect(Math.hypot(p.x, p.y)).toBeLessThanOrEqual(1 + 1e-9);
  }
  for (let i = 1; i < plaetze.length; i++) expect(plaetze[i].winkel).toBeLessThanOrEqual(plaetze[i - 1].winkel);
});

test('Punkte überlappen nicht', () => {
  const { plaetze, punktRadius } = sitzPositionen(630);
  let minAbstand = Infinity;
  for (let i = 0; i < plaetze.length; i++) {
    for (let j = i + 1; j < plaetze.length; j++) {
      minAbstand = Math.min(minAbstand, Math.hypot(plaetze[i].x - plaetze[j].x, plaetze[i].y - plaetze[j].y));
    }
  }
  expect(minAbstand).toBeGreaterThan(2 * punktRadius);
});

test('Fraktionen in Sitzordnung, ohne Parteien ohne Sitze', () => {
  const liste = fraktionen({ union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 }, parteien);
  expect(liste.map((p) => p.id)).toEqual(['linke', 'gruene', 'spd', 'union', 'afd']);
});

test('SVG enthält einen Punkt je Sitz', () => {
  const svg = bundestagSvg({ union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 }, parteien);
  expect(svg.match(/<circle/g)).toHaveLength(630);
});
