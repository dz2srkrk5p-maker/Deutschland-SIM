import { test, expect } from 'vitest';
import { config } from '../src/data/config.js';
import { ministerien } from '../src/data/ministerien.js';
import { neuesSpiel, laden, ZUSTAND_VERSION } from '../src/engine/state.js';
import { regierungDerAnderen, inDieOpposition, oppositionMonat } from '../src/engine/opposition.js';
import { mehrheit } from '../src/engine/koalition.js';

// Linke spielt, Sitze 2025: die anderen bilden die Regierung
const SITZE = { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 };
const opposition = (extra = {}) => inDieOpposition({ ...neuesSpiel('linke', 5), phase: 'koalition', sitze: SITZE, abgelehnt: [], ...extra }).state;

test('Regierung der anderen: stärkste Partei ohne Spieler und Brandmauer, Partner bis zur Mehrheit', () => {
  const r = regierungDerAnderen({ ...neuesSpiel('linke', 5), sitze: SITZE });
  expect(r.kanzler).toBe('union');
  expect(r.partner).not.toContain('linke');
  expect(r.partner).not.toContain('afd');
  expect(r.minderheit).toBe(false);
  expect([r.kanzler, ...r.partner].reduce((s, id) => s + SITZE[id], 0)).toBeGreaterThanOrEqual(mehrheit(SITZE));
  // ohne mögliche Mehrheit: Minderheitsregierung der stärksten Partei vor der Brandmauer
  const knapp = { union: 200, afd: 300, linke: 130 };
  expect(regierungDerAnderen({ ...neuesSpiel('linke', 5), sitze: knapp })).toEqual({ kanzler: 'union', partner: [], minderheit: true });
});

test('In die Opposition: Phase opposition, Kanzlerpartei der anderen, volles Kabinett, kein Vertrag', () => {
  const z = opposition();
  expect(z.phase).toBe('opposition');
  expect(z.kanzlerParteiId).toBe('union');
  expect(ministerien.every((m) => [z.kanzlerParteiId, ...z.koalition.partner].includes(z.kabinett.verteilung[m.id]))).toBe(true);
  expect(z.koalition.vertrag).toBeNull();
});

test('Opposition: Monate laufen, im Dezember beschließt die Regierung den Haushalt, nach der Wahlperiode Wahlkampf', () => {
  let z = opposition();
  const start = z.jahr;
  const kanzlerJahre = z.statistik.jahreKanzler;
  const ereignisse = [];
  for (let i = 0; i < config.regierung.monateJeJahr * config.legislaturJahre + 2 && z.phase === 'opposition'; i++) {
    const r = oppositionMonat(z);
    ereignisse.push(...r.ereignisse);
    z = r.state;
  }
  expect(z.phase).toBe('wahlkampf');
  expect(z.jahr).toBeGreaterThan(start);
  expect(z.statistik.jahreKanzler).toBe(kanzlerJahre); // in der Opposition zählen keine Kanzlerjahre
  expect(ereignisse.some((e) => e.startsWith('Haushalt Jahr 1'))).toBe(true);
  expect(ereignisse.some((e) => e.startsWith('Regierung: Reform beschlossen'))).toBe(true);
  expect(() => oppositionMonat(neuesSpiel('linke', 5))).toThrow('Opposition');
});

test('Migration 22 → 23: Kalenderjahr aus den Kanzlerjahren, Sieg regiert weiter, altes Spielende wird Wahlkampf', () => {
  const { jahr, ...rest } = neuesSpiel('union', 2);
  const alt = { ...rest, version: 22, statistik: { ...rest.statistik, jahreKanzler: 5 } };
  const z = laden(JSON.stringify(alt));
  expect(z.version).toBe(ZUSTAND_VERSION);
  expect(z.jahr).toBe(config.kalender.startJahr + 5);
  expect(laden(JSON.stringify({ ...alt, phase: 'sieg' })).phase).toBe('regierung');
  expect(laden(JSON.stringify({ ...alt, phase: 'opposition' })).phase).toBe('wahlkampf');
});
