import { test, expect } from 'vitest';
import { config } from '../src/data/config.js';
import { akteure } from '../src/data/reformwege.js';
import { verbaendeZuSteuern, verbaendeKapital } from '../src/engine/verbaende.js';

const vs = config.verbaendeSteuern;
const haltung = (liste, id) => liste.find((v) => v.akteur.id === id);

test('Verbände zu Steuern: Haltung aus vertretener Gruppe bzw. Problem, begrenzt auf ±2, EU ohne Haltung', () => {
  const l = verbaendeZuSteuern({ gruppen: { arbeitnehmer: -6, unternehmen: 2, geringverdiener: -9 }, probleme: { klimafolgen: -3 } });
  expect(haltung(l, 'gewerkschaften')).toMatchObject({ haltung: -2, kapital: -vs.kapitalDagegen });
  expect(haltung(l, 'wirtschaftsverbaende')).toMatchObject({ haltung: 0.67, kapital: 0 }); // unter der Schwelle
  expect(haltung(l, 'sozialverbaende').haltung).toBe(-2); // −3 begrenzt
  expect(haltung(l, 'umweltverbaende')).toMatchObject({ haltung: 1.5, kapital: vs.kapitalDafuer }); // weniger Klimafolgen
  expect(haltung(l, 'bauernverband')).toMatchObject({ haltung: 0, kapital: 0 });
  expect(haltung(l, 'eu')).toMatchObject({ haltung: null, kapital: 0 });
  expect(l).toHaveLength(akteure.length);
  expect(verbaendeKapital(l)).toBe(-2 * vs.kapitalDagegen + vs.kapitalDafuer);
  expect(verbaendeKapital(verbaendeZuSteuern({}))).toBe(0);
});
