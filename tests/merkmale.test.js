import { test, expect } from 'vitest';
import { neuesSpiel, laden, ZUSTAND_VERSION } from '../src/engine/state.js';
import { merkmaleMonat, merkmalStaerke, merkmalTrends, merkmalAnsatzFaktor, merkmalGruppenMonat } from '../src/engine/merkmale.js';
import { epochenMonat, zeitpunkt } from '../src/engine/epochen.js';
import { wegWaehlen, aufgabenTrends, ansatzFaktor } from '../src/engine/weichen.js';
import { ursachen, problem } from '../src/engine/probleme.js';
import { merkmale } from '../src/data/merkmale.js';
import { epochen } from '../src/data/epochen.js';
import { config } from '../src/data/config.js';
import { ministerien } from '../src/data/ministerien.js';

const mc = config.merkmale;
const T = 2030 * 12;
const mit = (z, wege) => ({ ...z, reformwege: { ...z.reformwege, ...Object.fromEntries(wege.map((id) => [id, { status: 'beschlossen' }])) } });
const erneuerbar = merkmale.find((m) => m.id === 'erneuerbares_land');

test('Vergabe: drei geltende tragende Gesetze ergeben das Merkmal, zwei nicht', () => {
  const z = neuesSpiel('gruene', 1);
  expect(merkmaleMonat(mit(z, erneuerbar.tragend.slice(0, 2)), T).state.merkmale).toEqual([]);
  const r = merkmaleMonat(mit(z, erneuerbar.tragend), T);
  expect(r.state.merkmale).toMatchObject([{ id: erneuerbar.id, seit: T, verblasst: null }]);
  expect(r.ereignisse[0]).toContain(erneuerbar.name);
});

test('Vergabe aus gelungener Aufgabe; höchstens config.merkmale.max', () => {
  const z = neuesSpiel('spd', 1);
  expect(merkmaleMonat(z, T, ['starke_rente']).state.merkmale.map((m) => m.id)).toEqual(['starke_rente']);
  const alt = mc.max;
  try {
    mc.max = 1;
    const r = merkmaleMonat({ ...z, merkmale: [{ id: 'eigenvorsorge', seit: 0, verblasst: null, getragen: [] }] }, T, ['starke_rente']);
    expect(r.state.merkmale).toHaveLength(1);
    expect(r.ereignisse[0]).toContain('Kein Platz');
  } finally {
    mc.max = alt;
  }
});

test('Aufhebung der tragenden Gesetze: Merkmal verblasst linear über zwei Jahre und verschwindet', () => {
  let z = merkmaleMonat(mit(neuesSpiel('gruene', 1), erneuerbar.tragend), T).state;
  const ohne = { ...z, reformwege: {} };
  z = merkmaleMonat(ohne, T + 1).state;
  expect(z.merkmale[0].verblasst).toBe(T + 1);
  expect(merkmalStaerke(z, z.merkmale[0], T + 1 + mc.verblassenMonate / 2)).toBe(0.5);
  z = merkmaleMonat(z, T + mc.verblassenMonate).state;
  expect(z.merkmale).toHaveLength(1);
  z = merkmaleMonat(z, T + 1 + mc.verblassenMonate).state;
  expect(z.merkmale).toEqual([]);
});

test('Merkmal aus einer Aufgabe ohne tragende Gesetze verblasst nicht von selbst', () => {
  let z = merkmaleMonat(neuesSpiel('spd', 1), T, ['starke_rente']).state;
  for (let t = T + 1; t < T + 40; t++) z = merkmaleMonat(z, t).state;
  expect(z.merkmale).toMatchObject([{ id: 'starke_rente', verblasst: null }]);
});

test('Wirkung: passende Ansätze stärker, Probleme gebremst, Gruppen gebunden; beim Verblassen schwächer', () => {
  const z = { ...neuesSpiel('gruene', 1), merkmale: [{ id: erneuerbar.id, seit: T, verblasst: null, getragen: [] }], jahr: 2030, monat: 1 };
  expect(merkmalAnsatzFaktor(z, 'e_turbo')).toBeCloseTo(1 + mc.ansatzBonus, 10);
  expect(merkmalAnsatzFaktor(z, 'r_kapital')).toBe(1);
  const pid = Object.keys(erneuerbar.staerke.probleme)[0];
  expect(merkmalTrends(z, pid)[0].beitrag).toBeCloseTo(erneuerbar.staerke.probleme[pid] * mc.problemTrendJePunkt, 6);
  expect(ursachen(z, problem(pid)).some((u) => u.text.includes(erneuerbar.name))).toBe(true);
  const g = Object.keys(erneuerbar.staerke.gruppen)[0];
  expect(merkmalGruppenMonat(z)[g]).toBeGreaterThan(z.gruppen[g]);
  const halb = { ...z, merkmale: [{ ...z.merkmale[0], verblasst: zeitpunkt(2030, 1) - mc.verblassenMonate / 2 }] };
  expect(merkmalAnsatzFaktor(halb, 'e_turbo')).toBeCloseTo(1 + mc.ansatzBonus / 2, 10);
});

test('Antwort 1 (2026-10-26): geltende Schwerpunkt-Gesetze senken das Aufgaben-Problem; Epochenprobleme haben Lösungen', () => {
  const E = epochen[0];
  const verteilung = Object.fromEntries(ministerien.map((m) => [m.id, 'spd']));
  const basis = { ...neuesSpiel('spd', 1), phase: 'regierung', sitze: { spd: 400 }, kanzlerParteiId: 'spd', koalition: { partner: [], startAnteile: {} }, kabinett: { anspruch: {}, verteilung }, jahr: 2026, monat: 12 };
  let z = { ...epochenMonat(basis, 2027, 1).state, jahr: 2027, monat: 1 };
  z = wegWaehlen(z, { epocheId: E.id, wegId: E.wege[0].id }).state;
  const p = E.wege[0].aufgabe.problem;
  expect(aufgabenTrends(z, p)).toEqual([]);
  const zwei = mit(z, E.wege[0].schwerpunkt.slice(0, 2));
  expect(aufgabenTrends(zwei, p)[0].beitrag).toBeCloseTo(-2 * config.epochen.schwerpunktAufgabeTrend, 6);
  expect(ansatzFaktor(zwei, E.wege[0].schwerpunkt[0])).toBeCloseTo(1 + config.epochen.schwerpunktBonus, 10);
  for (const e of epochen) for (const q of e.probleme) expect(q.loesungen.length).toBeGreaterThan(0);
});

test('Migration 26 → 27: keine Merkmale', () => {
  const { merkmale: _m, ...alt } = neuesSpiel('union', 3);
  const z = laden(JSON.stringify({ ...alt, version: 26 }));
  expect(z.version).toBe(ZUSTAND_VERSION);
  expect(z.merkmale).toEqual([]);
});
