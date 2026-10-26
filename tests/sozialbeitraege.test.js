import { test, expect } from 'vitest';
import { neuesSpiel, laden, ZUSTAND_VERSION } from '../src/engine/state.js';
import { beitragsLast, beitragsTrends, kasse } from '../src/engine/sozialbeitraege.js';
import { wegKosten, weg } from '../src/engine/reformwege.js';
import { laufendeKosten } from '../src/engine/haushalt.js';
import { ursachen, problem, problemListe, loesung } from '../src/engine/probleme.js';
import { ueberBeitraege, mehrEinzahler, problemSozialbeitraege } from '../src/data/sozialbeitraege.js';
import { config } from '../src/data/config.js';

const sc = config.sozialbeitraege;
const mit = (wege, loesungen = {}) => ({ ...neuesSpiel('spd', 1), reformwege: Object.fromEntries(wege.map(([id, st]) => [id, { status: st, fertig: 0 }])), loesungen });

test('„Steigende Sozialbeiträge“ gehört zu jeder Partie', () => {
  const z = neuesSpiel('union', 1);
  expect(z.probleme.sozialbeitraege.wert).toBe(problemSozialbeitraege.start);
  expect(problemListe(z).some((e) => e.problem.id === 'sozialbeitraege')).toBe(true);
});

test('Daten: jeder Ansatz über Beiträge existiert', () => {
  for (const id of [...Object.keys(ueberBeitraege), ...mehrEinzahler]) expect(Boolean(weg(id) || loesung(id)), id).toBe(true);
});

test('über Beiträge: nicht im Bundeshaushalt, sondern als Last bei den Sozialkassen', () => {
  const z = mit([['r_umlage', 'beschlossen'], ['r_kapital', 'beschlossen']]);
  expect(kasse('r_umlage')).toBe('Rentenversicherung');
  expect(wegKosten(z)).toBe(weg('r_kapital').kosten);
  expect(beitragsLast(z)).toBe(weg('r_umlage').kosten);
  const l = mit([], { pflege1: { status: 'laufend', fertig: 5 }, pflege2: { status: 'laufend', fertig: 5 } });
  expect(laufendeKosten(l)).toBe(loesung('pflege2').kosten);
  expect(beitragsLast(l)).toBe(loesung('pflege1').kosten);
});

test('Last treibt das Problem, mehr Einzahler (Bürgerversicherung) entlasten', () => {
  const z = mit([['r_umlage', 'beschlossen']]);
  const t = beitragsTrends(z, 'sozialbeitraege');
  expect(t[0].beitrag).toBeCloseTo((weg('r_umlage').kosten / 1e6) * sc.trendJeMrd, 3);
  expect(beitragsTrends(z, 'rentenluecke')).toEqual([]);
  const b = mit([['r_buerger', 'beschlossen']]);
  const tb = beitragsTrends(b, 'sozialbeitraege');
  expect(tb.find((x) => x.text.startsWith('Mehr Einzahler')).beitrag).toBe(-sc.entlastungJeAnsatz);
  expect(tb.reduce((s, x) => s + x.beitrag, 0)).toBeLessThan(0); // spart und entlastet
  expect(ursachen(z, problem('sozialbeitraege')).some((u) => u.text.includes('über Beiträge'))).toBe(true);
});

test('Migration 28 → 29: das Problem kommt mit seinem Startwert dazu', () => {
  const alt = neuesSpiel('union', 3);
  const { sozialbeitraege: _s, ...probleme } = alt.probleme;
  const z = laden(JSON.stringify({ ...alt, probleme, version: 28 }));
  expect(z.version).toBe(ZUSTAND_VERSION);
  expect(z.probleme.sozialbeitraege).toEqual({ wert: problemSozialbeitraege.start, verlauf: [problemSozialbeitraege.start] });
});
