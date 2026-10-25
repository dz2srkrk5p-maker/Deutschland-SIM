import { test, expect } from 'vitest';
import { config } from '../src/data/config.js';
import { probleme } from '../src/data/probleme.js';
import { neuesSpiel, periodeSchnappschuss } from '../src/engine/state.js';
import { wahlkampfWoche } from '../src/engine/wahlkampf.js';
import { regierungsBilanz, wahlperiodeEnde } from '../src/engine/regierungsbilanz.js';

const rb = config.regierungsbilanz;
const [a, b, c] = probleme.map((p) => p.id);

// Regierung CDU/CSU mit SPD, Schnappschuss vom Spielstart, danach Problemwerte geändert
function regierung(aenderung = {}, vorhaben = []) {
  const z = neuesSpiel('union', 1);
  const probl = Object.fromEntries(Object.entries(z.probleme).map(([id, p]) => [id, { ...p, wert: p.wert + (aenderung[id] ?? 0) }]));
  return { ...z, phase: 'regierung', kanzlerParteiId: 'union', periodeStart: periodeSchnappschuss(z), probleme: probl,
    koalition: { partner: ['spd'], startAnteile: {}, minderheit: false, fehlschlaege: 0, vertrag: { vorhaben, ressorts: {} } } };
}

test('Feature 9: Bilanz zählt Vertrag und Probleme, Wirkung nach Spielwerten', () => {
  const vorhaben = [{ status: 'umgesetzt' }, { status: 'umgesetzt' }, { status: 'gebrochen' }, { status: 'offen' }];
  const bil = regierungsBilanz(regierung({ [a]: -rb.problemSchwelle, [b]: -20, [c]: rb.problemSchwelle - 1 }, vorhaben));
  expect(bil.vertrag).toEqual({ gesamt: 4, umgesetzt: 2, gebrochen: 1, offen: 1 });
  expect(bil.geloest).toEqual([a, b]);
  expect(bil.verschleppt).toEqual([]);
  expect(bil.punkte.vertrag).toBeCloseTo((rb.jeVertrag * (2 - 1 - rb.offenAnteil)) / 4, 2);
  expect(bil.punkte.probleme).toBeCloseTo(2 * rb.jeProblem, 6);
  expect(bil.wirkung).toBeCloseTo(bil.punkte.vertrag + bil.punkte.probleme, 2);
});

test('Feature 9: Wirkung gedeckelt, das Wahlergebnis hängt nicht allein an der Bilanz', () => {
  const alle = Object.fromEntries(probleme.map((p) => [p.id, 30]));
  const bil = regierungsBilanz(regierung(alle, [{ status: 'gebrochen' }]));
  expect(bil.wirkung).toBe(-rb.max);
  // die Deckelung bleibt unter dem, was ein Wahlkampf allein sicher bewegt (8 Wochen Plakate)
  expect(rb.max).toBeLessThan(config.wahlkampf.wochen * config.wahlkampf.plakateGewinn);
});

test('Feature 9: Ende der Wahlperiode wirkt einmalig auf die Regierungsparteien und zeigt die Bilanz', () => {
  const z = regierung({ [a]: -20, [b]: -20 }, [{ status: 'umgesetzt' }]);
  const r = wahlperiodeEnde(z);
  const bil = r.state.regierungsBilanz;
  expect(r.state.phase).toBe('wahlkampf');
  expect(bil.wirkung).toBeGreaterThan(0);
  expect(r.state.anteile.union - z.anteile.union).toBeCloseTo(bil.wirkung, 1);
  expect(r.state.anteile.spd - z.anteile.spd).toBeCloseTo(bil.wirkung * rb.partnerAnteil, 1);
  expect(r.state.wahlkampfStart).toBe(r.state.anteile.union);
  expect(r.state.umfrageBilanz.at(-1).zeit).toBe('Regierungsbilanz');
  expect(r.ereignisse[0]).toContain('Regierungsbilanz');
});

test('Feature 9: alter Spielstand ohne Schnappschuss läuft ohne Bilanz weiter', () => {
  const { periodeStart, ...alt } = regierung({ [a]: -20 });
  const r = wahlperiodeEnde(alt);
  expect(r.state.regierungsBilanz).toBeNull();
  expect(r.state.anteile).toEqual(alt.anteile);
});

test('Feature 9: Schnappschuss bei der Bundestagswahl', () => {
  let z = neuesSpiel('union', 3);
  for (let i = 0; i < config.wahlkampf.wochen; i++) z = wahlkampfWoche(z, { aktion: 'plakate' }).state;
  expect(z.periodeStart.probleme[a]).toBe(z.probleme[a].wert);
  expect(z.periodeStart.land.wachstum).toBe(z.land.wachstum);
});
