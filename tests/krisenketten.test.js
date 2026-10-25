import { test, expect } from 'vitest';
import { config } from '../src/data/config.js';
import { neuesSpiel, laden } from '../src/engine/state.js';
import { kettenZiele, kettenSchritt, kettenStart } from '../src/engine/krisenketten.js';

const kk = config.krisenketten;
const mitWert = (z, werte) => ({ ...z, probleme: Object.fromEntries(Object.entries(z.probleme).map(([id, p]) => [id, werte[id] !== undefined ? { wert: werte[id], verlauf: [werte[id]] } : p])) });

test('Feature 8: Ziele kommen aus den bestehenden Wechselwirkungen', () => {
  // Energiepreise treiben laut probleme.js Inflation (0,2) und Rezession (0,25)
  expect(kettenZiele('energiepreise')).toEqual(expect.arrayContaining([
    { nach: 'rezession', staerke: 0.25 * kk.faktor }, { nach: 'inflation', staerke: 0.2 * kk.faktor },
  ]));
  expect(kettenZiele('pandemie')).toEqual([]); // treibt kein anderes Problem
});

test('Feature 8: Krise löst verzögerte Glieder aus, höchstens maxAktiv, mit Abklingzeit', () => {
  const z = { ...mitWert(neuesSpiel('union', 1), { geopolitik: 70 }), runde: 10, ketten: kettenStart() };
  const neu = mitWert(z, { geopolitik: 85 }).probleme;
  const r = kettenSchritt(z, neu);
  expect(r.ketten.aktiv.length).toBe(Math.min(kk.maxAktiv, kettenZiele('geopolitik').length));
  expect(r.ketten.aktiv.every((g) => g.faellig === 10 + kk.verzoegerung && g.tiefe === 1 && g.von === 'geopolitik')).toBe(true);
  expect(r.ereignisse[0]).toContain('Krisenkette');
  // nicht sofort: die Werte der Ziele bleiben in diesem Quartal
  for (const g of r.ketten.aktiv) expect(r.probleme[g.nach].wert).toBe(neu[g.nach].wert);
  // erneute Krise innerhalb der Abklingzeit: keine neuen Glieder
  const wieder = kettenSchritt({ ...mitWert(z, { geopolitik: 70 }), runde: 12, ketten: { aktiv: [], zuletzt: r.ketten.zuletzt, verlauf: [] } }, neu);
  expect(wieder.ketten.aktiv).toEqual([]);
});

test('Feature 8: fällige Glieder wirken, zweite Stufe gedämpft, nie über maxTiefe', () => {
  const basis = { ...mitWert(neuesSpiel('union', 1), { energiepreise: 40, rezession: 75 }), runde: 12 };
  const glied = { von: 'geopolitik', nach: 'energiepreise', staerke: 50, faellig: 12, tiefe: 1 };
  const r = kettenSchritt({ ...basis, ketten: { aktiv: [glied], zuletzt: {}, verlauf: [] } }, basis.probleme);
  expect(r.probleme.energiepreise.wert).toBe(90);
  expect(r.ketten.verlauf).toEqual([{ von: 'geopolitik', nach: 'energiepreise', staerke: 50, runde: 12 }]);
  // Energiepreise jetzt in der Krise: Stufe 2, Stärke × daempfung
  const zweite = r.ketten.aktiv.filter((g) => g.von === 'energiepreise');
  expect(zweite.length).toBeGreaterThan(0);
  expect(zweite.every((g) => g.tiefe === 2)).toBe(true);
  expect(zweite.find((g) => g.nach === 'rezession').staerke).toBeCloseTo(0.25 * kk.faktor * kk.daempfung, 6);
  // auf Stufe maxTiefe ausgelöste Krise setzt keine weitere Kette fort
  const tief = { ...glied, tiefe: kk.maxTiefe };
  expect(kettenSchritt({ ...basis, ketten: { aktiv: [tief], zuletzt: {}, verlauf: [] } }, basis.probleme).ketten.aktiv).toEqual([]);
});

test('Feature 8: Migration 17 → 18', () => {
  const { ketten, ...rest } = neuesSpiel('spd', 1);
  expect(laden(JSON.stringify({ ...rest, version: 17 })).ketten).toEqual(kettenStart());
});
