import { test, expect } from 'vitest';
import { config } from '../src/data/config.js';
import { ministerien } from '../src/data/ministerien.js';
import { ereignisse } from '../src/data/ereignisse.js';
import { neuesSpiel, zurueckInDenWahlkampf } from '../src/engine/state.js';
import { quartalBeenden } from '../src/engine/regierung.js';
import { loesungStarten } from '../src/engine/probleme.js';
import { haushaltBeschliessen } from '../src/engine/haushalt.js';
import { ereignisZiehen, ereignisEntscheiden, folgen } from '../src/engine/ereignisse.js';

const SITZE_2025 = { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 };
// Union + SPD, Gesundheit und Finanzen bei der SPD
const regierung = (extra = {}) => ({
  ...neuesSpiel('union', 1),
  phase: 'regierung',
  sitze: SITZE_2025,
  kanzlerParteiId: 'union',
  koalition: { partner: ['spd'], startAnteile: { spd: 16.4 }, minderheit: false, fehlschlaege: 0 },
  kabinett: { anspruch: { union: 14, spd: 2 }, verteilung: Object.fromEntries(ministerien.map((m) => [m.id, ['gesundheit', 'finanzen'].includes(m.id) ? 'spd' : 'union'])) },
  ...extra,
});

test('F14: Chance je Quartal, gleicher Seed gleiches Ereignis, Daten vollständig', () => {
  let mit = 0;
  for (let seed = 1; seed <= 2000; seed++) if (ereignisZiehen(regierung({ rngZustand: seed })).state.offenesEreignis) mit++;
  expect(mit / 2000).toBeGreaterThan(config.ereignisse.chanceJeQuartal - 0.05);
  expect(mit / 2000).toBeLessThan(config.ereignisse.chanceJeQuartal + 0.05);
  const z = regierung({ rngZustand: 42 });
  expect(ereignisZiehen(z)).toEqual(ereignisZiehen(z));
  expect(new Set(ereignisse.map((e) => e.id)).size).toBe(ereignisse.length);
  for (const e of ereignisse) expect(e.moeglichkeiten.length).toBeGreaterThanOrEqual(2);
});

test('F14: keine Wiederholung je Wahlperiode, Bedingungen gelten, Wahlkampf setzt die Liste zurück', () => {
  const alle = ereignisse.map((e) => e.id);
  for (let seed = 1; seed <= 300; seed++) {
    expect(ereignisZiehen(regierung({ rngZustand: seed, ereignisseWahlperiode: alle })).state.offenesEreignis).toBeNull();
    // ohne Partner kein Koalitionsstreit, unter Druck 50 keine Mieten-Meldung
    const allein = regierung({ rngZustand: seed, koalition: { partner: [], startAnteile: {} }, probleme: { ...neuesSpiel('union', 1).probleme, wohnungsnot: { wert: 40, verlauf: [40] } } });
    expect(['koalitionsstreit', 'mieten']).not.toContain(ereignisZiehen(allein).state.offenesEreignis);
  }
  expect(zurueckInDenWahlkampf(regierung({ ereignisseWahlperiode: alle })).ereignisseWahlperiode).toEqual([]);
});

test('F14: Folgen gehen an die Partei, die das Ministerium hält; Entscheidung wendet sie an', () => {
  const z = regierung({ offenesEreignis: 'pflegestreik' });
  expect(folgen(z, 'pflegestreik', 0)).toEqual({ parteien: { spd: 0.1 - 0.2 }, probleme: { pflegenotstand: -8 } });
  const { state, ereignisse: text } = ereignisEntscheiden(z, { wahl: 0 });
  expect(state.offenesEreignis).toBeNull();
  expect(state.ereignisseWahlperiode).toEqual(['pflegestreik']);
  expect(state.probleme.pflegenotstand.wert).toBe(47);
  expect(state.anteile.spd).toBeCloseTo(z.anteile.spd - 0.1, 2);
  expect(state.rngZustand).toBe(z.rngZustand);
  expect(text[0]).toContain('Lohnzusagen');
  // Koalitionsstreit: Partner verliert, Kanzlerpartei gewinnt
  expect(folgen(z, 'koalitionsstreit', 0).parteien).toEqual({ union: 0.1, spd: -0.3 });
});

test('F14: solange ein Ereignis offen ist, geht nichts anderes', () => {
  const z = regierung({ offenesEreignis: 'hochwasser' });
  expect(() => quartalBeenden(z)).toThrow('Ereignis');
  expect(() => loesungStarten(z, { loesungId: 'wohnen1' })).toThrow('Ereignis');
  expect(() => haushaltBeschliessen({ ...z, quartal: config.regierung.quartaleJeJahr }, {})).toThrow('Ereignis');
  expect(() => ereignisEntscheiden(z, { wahl: 5 })).toThrow();
  expect(() => ereignisEntscheiden(regierung(), { wahl: 0 })).toThrow('Kein offenes');
});
