import { test, expect } from 'vitest';
import { config } from '../src/data/config.js';
import { RECHTSARTEN, einnahmearten } from '../src/data/einnahmen.js';
import { ministerien } from '../src/data/ministerien.js';
import { rechtsrisiken } from '../src/engine/einnahmen.js';
import { verfahrenAnlegen, verfahrenQuartal } from '../src/engine/verfahren.js';
import { haushaltBeschliessen } from '../src/engine/haushalt.js';
import { neuesSpiel, laden } from '../src/engine/state.js';

const vr = config.verfassungsrisiko;
// Union + SPD + Grüne: 49 Bundesratsstimmen, genug für Steueränderungen
const imAmt = () => ({
  ...neuesSpiel('union', 4), phase: 'regierung', quartal: 4, runde: 10, kanzlerParteiId: 'union',
  sitze: { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 },
  koalition: { partner: ['spd', 'gruene'], startAnteile: { spd: 16.4, gruene: 11.6 }, minderheit: false, fehlschlaege: 0 },
  kabinett: { anspruch: {}, verteilung: Object.fromEntries(ministerien.map((m) => [m.id, 'union'])) },
});

test('Feature 3: Rechtsrisiken nur bei Erhöhung bzw. neu eingeschalteter Ausgestaltung', () => {
  const z = imAmt();
  expect(rechtsrisiken(z, { einnahmen: { vermoegen: 1 } })).toMatchObject([{ typ: 'einnahme', id: 'vermoegen', art: 'eigentum', stufen: 1 }]);
  expect(rechtsrisiken(z, { einnahmen: { umsatz: 1 } })).toEqual([]);
  expect(rechtsrisiken(z, { ausgestaltung: { agrardiesel: true } })[0]).toMatchObject({ art: 'gleichheit', chance: 0.1 });
  // schon aktiv oder ausgeschaltet: kein neues Risiko
  const aktiv = { ...z, haushalt: { ...z.haushalt, einnahmen: { ...z.haushalt.einnahmen, ausgestaltung: ['agrardiesel'] } } };
  expect(rechtsrisiken(aktiv, { ausgestaltung: { agrardiesel: true } })).toEqual([]);
  expect(rechtsrisiken(z, { ausgestaltung: { agrardiesel: false } })).toEqual([]);
  // jedes Risiko ist als Spielwert gekennzeichnet und hat eine bekannte Art
  for (const r of [...einnahmearten, ...einnahmearten.flatMap((a) => a.ausgestaltung)].map((x) => x.rechtsrisiko).filter(Boolean)) {
    expect(r.quelle).toBe('Spielwert');
    expect(RECHTSARTEN[r.art]).toBeDefined();
  }
});

test('Feature 3: Haushaltsbeschluss legt Verfahren an, Urteil nach der Frist', () => {
  const { state } = haushaltBeschliessen(imAmt(), { einnahmen: { vermoegen: 2 } });
  expect(state.verfahren).toMatchObject([{ id: 'vermoegen', stufen: 2, faellig: state.runde + vr.dauerQuartale }]);
  expect(state.haushalt.einnahmen.stufen.vermoegen).toBe(2);
  // vor der Frist nichts
  expect(verfahrenQuartal({ ...state, runde: state.runde + 1 }).ereignisse).toEqual([]);
});

test('Feature 3: gekippt → Rücknahme, Verlust der Kanzlerpartei in der Umfrage-Bilanz; bestätigt → bleibt', () => {
  const basis = imAmt();
  const z = { ...basis, haushalt: { ...basis.haushalt, einnahmen: { ...basis.haushalt.einnahmen, stufen: { vermoegen: 2 }, ausgestaltung: ['agrardiesel'] } } };
  const sicher = (chance) => verfahrenAnlegen({ ...z, runde: 6 }, [
    { typ: 'einnahme', id: 'vermoegen', name: 'Vermögensteuer erhöht', stufen: 2, art: 'eigentum', chance },
    { typ: 'ausgestaltung', id: 'agrardiesel', name: 'Agrardiesel', art: 'gleichheit', chance },
  ]);
  const gekippt = verfahrenQuartal({ ...sicher(1), runde: 6 + vr.dauerQuartale });
  expect(gekippt.state.haushalt.einnahmen.stufen.vermoegen).toBe(0);
  expect(gekippt.state.haushalt.einnahmen.ausgestaltung).toEqual([]);
  expect(gekippt.state.verfahren).toEqual([]);
  expect(gekippt.state.anteile.union).toBeCloseTo(z.anteile.union - 2 * vr.verlustUmfrage, 2);
  expect(gekippt.ereignisse[0]).toContain('kippt');
  expect(gekippt.state.umfrageBilanz.at(-1).posten.some((p) => p.ursache.startsWith('Verfassungsgericht kippt'))).toBe(true);
  const bestaetigt = verfahrenQuartal({ ...sicher(0), runde: 6 + vr.dauerQuartale });
  expect(bestaetigt.state.haushalt.einnahmen.stufen.vermoegen).toBe(2);
  expect(bestaetigt.state.anteile).toEqual(z.anteile);
  expect(bestaetigt.ereignisse[0]).toContain('bestätigt');
});

test('Feature 3: Migration 15 → 16', () => {
  const { verfahren, ...rest } = neuesSpiel('spd', 1);
  expect(laden(JSON.stringify({ ...rest, version: 15 })).verfahren).toEqual([]);
});
