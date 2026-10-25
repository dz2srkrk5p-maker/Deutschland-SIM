import { test, expect } from 'vitest';
import { config } from '../src/data/config.js';
import { zinsaufschlagZiel, jahresSchritt, wirkungSumme } from '../src/engine/wirtschaft.js';
import { zinsen } from '../src/engine/haushalt.js';
import { neuesSpiel, laden } from '../src/engine/state.js';

const za = config.haushalt.zinsaufschlag;

test('Feature 2: Ziel aus Schuldenquote und Neuverschuldung, gedeckelt', () => {
  expect(zinsaufschlagZiel(60, 1)).toBe(0);
  expect(zinsaufschlagZiel(za.quoteAb + 10, 0)).toBeCloseTo(10 * za.jePunktQuote, 6);
  expect(zinsaufschlagZiel(za.quoteAb, za.defizitAb + 2)).toBeCloseTo(2 * za.jePunktDefizit, 6);
  expect(zinsaufschlagZiel(300, 50)).toBe(za.max);
});

test('Feature 2: Aufschlag nähert sich dem Ziel gedämpft und klingt wieder ab', () => {
  const land = { ...neuesSpiel('union', 1).land, schulden: 4000, schuldenquote: 89 };
  // hohe Quote, hohe Neuverschuldung: steigt, aber nur um den Anteil anpassung
  const hoch = jahresSchritt(land, wirkungSumme(), 200, 1, false).land;
  const ziel = zinsaufschlagZiel(hoch.schuldenquote, (200 / hoch.bip) * 100);
  expect(hoch.zinsaufschlag).toBeCloseTo(ziel * za.anpassung, 3);
  // gute Lage danach: Aufschlag sinkt wieder
  const gut = jahresSchritt({ ...hoch, schulden: 2000 }, wirkungSumme(), 0, 1, false).land;
  expect(gut.zinsaufschlag).toBeLessThan(hoch.zinsaufschlag);
  // nie über max, auch nach vielen extremen Jahren
  let l = land;
  for (let i = 0; i < 40; i++) l = jahresSchritt(l, wirkungSumme(), 400, 1, false).land;
  expect(l.zinsaufschlag).toBeLessThanOrEqual(za.max);
  expect(Number.isFinite(l.zinsaufschlag)).toBe(true);
});

test('Feature 2: Zinsen mit Aufschlag, Migration 14 → 15', () => {
  const z = neuesSpiel('spd', 1);
  expect(zinsen({ ...z, land: { ...z.land, zinsaufschlag: 0.1 } })).toBe(Math.round(zinsen(z) * 1.1));
  const { zinsaufschlag, ...landAlt } = z.land;
  expect(laden(JSON.stringify({ ...z, version: 14, land: landAlt })).land.zinsaufschlag).toBe(0);
});
