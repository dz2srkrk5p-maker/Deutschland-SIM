import { test, expect } from 'vitest';
import { config } from '../src/data/config.js';
import { monatsname } from '../src/data/kalender.js';
import { neuesSpiel, zurueckInDenWahlkampf } from '../src/engine/state.js';
import { wahl } from '../src/engine/wahl.js';
import { minderheitAntreten } from '../src/engine/koalition.js';
import { haushaltBeschliessen } from '../src/engine/haushalt.js';
import { monatBeenden, haushaltsMonat } from '../src/engine/regierung.js';
import { ereignisEntscheiden } from '../src/engine/ereignisse.js';

// Union regiert mit den Startwerten 2025 als Minderheit: einfachster Weg in die Phase regierung
const imAmt = () => minderheitAntreten(wahl(neuesSpiel('union', 1)).state).state;
const q = config.regierung.monateJeJahr;

test('Monatstakt: Regierung beginnt im Januar, Haushalt erst im Dezember', () => {
  let z = imAmt();
  expect(z.monat).toBe(1);
  expect(() => haushaltBeschliessen(z, {})).toThrow('Dezember');
  for (let i = 1; i < q; i++) {
    const r = monatBeenden(z);
    expect(r.ereignisse[0]).toContain(`${monatsname(i)} im Haushaltsjahr 1 vorbei`);
    expect(r.state.runde).toBe(z.runde + 1); // jeder Monat zählt als Runde
    z = r.state.offenesEreignis ? ereignisEntscheiden(r.state, { wahl: 0 }).state : r.state; // F14
  }
  expect(haushaltsMonat(z)).toBe(true);
  expect(() => monatBeenden(z)).toThrow();
  const nach = haushaltBeschliessen(z, {}).state;
  expect(nach.monat).toBe(1);
  expect(nach.runde).toBe(z.runde + 1); // auch der Dezember endet wie jeder Monat
  expect(nach.haushalt.jahr).toBe(2);
});

test('Monatstakt: Monate nur in der Regierung, Wahlkampf setzt es zurück', () => {
  expect(() => monatBeenden(neuesSpiel('spd', 1))).toThrow('Keine Regierung');
  expect(zurueckInDenWahlkampf({ ...imAmt(), monat: 3 }).monat).toBe(1);
});
