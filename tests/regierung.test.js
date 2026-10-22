import { test, expect } from 'vitest';
import { config } from '../src/data/config.js';
import { neuesSpiel, zurueckInDenWahlkampf } from '../src/engine/state.js';
import { wahl } from '../src/engine/wahl.js';
import { minderheitAntreten } from '../src/engine/koalition.js';
import { haushaltBeschliessen } from '../src/engine/haushalt.js';
import { quartalBeenden, haushaltsQuartal } from '../src/engine/regierung.js';

// Union regiert mit den Startwerten 2025 als Minderheit: einfachster Weg in die Phase regierung
const imAmt = () => minderheitAntreten(wahl(neuesSpiel('union', 1)).state).state;
const q = config.regierung.quartaleJeJahr;

test('F12: Regierung beginnt in Quartal 1, Haushalt erst im letzten Quartal', () => {
  let z = imAmt();
  expect(z.quartal).toBe(1);
  expect(() => haushaltBeschliessen(z, {})).toThrow('letzten Quartal');
  for (let i = 1; i < q; i++) {
    const r = quartalBeenden(z);
    expect(r.ereignisse[0]).toContain(`Quartal ${i} vorbei`);
    expect(r.state.rngZustand).toBe(z.rngZustand); // Zeit allein verbraucht keinen Zufall
    expect(r.state.anteile).toEqual(z.anteile); // und ändert keine Umfragen
    z = r.state;
  }
  expect(haushaltsQuartal(z)).toBe(true);
  expect(() => quartalBeenden(z)).toThrow();
  const nach = haushaltBeschliessen(z, {}).state;
  expect(nach.quartal).toBe(1);
  expect(nach.haushalt.jahr).toBe(2);
});

test('F12: Quartal nur in der Regierung, Wahlkampf setzt es zurück', () => {
  expect(() => quartalBeenden(neuesSpiel('spd', 1))).toThrow('Keine Regierung');
  expect(zurueckInDenWahlkampf({ ...imAmt(), quartal: 3 }).quartal).toBe(1);
});
