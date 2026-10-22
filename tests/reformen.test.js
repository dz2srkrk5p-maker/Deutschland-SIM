import { test, expect } from 'vitest';
import { config } from '../src/data/config.js';
import { ministerien } from '../src/data/ministerien.js';
import { neuesSpiel } from '../src/engine/state.js';
import { quartalBeenden } from '../src/engine/regierung.js';
import { vorschau } from '../src/engine/haushalt.js';
import { reformEinbringen, reformVorschau, sperrgrund, reformKosten, druckSteigt } from '../src/engine/reformen.js';

const SITZE_2025 = { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 };
// Union + SPD regieren, Bauen hält die SPD
const regierung = (extra = {}) => {
  const verteilung = Object.fromEntries(ministerien.map((m) => [m.id, m.id === 'bauen' ? 'spd' : 'union']));
  return {
    ...neuesSpiel('union', 1),
    phase: 'regierung',
    sitze: SITZE_2025,
    kanzlerParteiId: 'union',
    koalition: { partner: ['spd'], startAnteile: { spd: 16.4 }, minderheit: false, fehlschlaege: 0 },
    kabinett: { anspruch: { union: 15, spd: 1 }, verteilung },
    ...extra,
  };
};

test('F13: Reform beschlossen: Druck sinkt sofort, Partei des Ministeriums gewinnt, kein Zufall verbraucht', () => {
  const z = regierung();
  const v = reformVorschau(z, 'wohnen1');
  expect(v).toMatchObject({ partei: 'spd', druckVorher: 60, druckNachher: 40 });
  expect(v.gewinn).toBeCloseTo(20 * config.reformen.gewinnJeDruckpunkt);
  const { state, ereignisse } = reformEinbringen(z, { reformId: 'wohnen1' });
  expect(state.probleme.wohnen).toBe(40);
  expect(state.reformen).toEqual(['wohnen1']);
  expect(state.anteile.spd).toBeCloseTo(z.anteile.spd + v.gewinn, 2);
  expect(state.rngZustand).toBe(z.rngZustand);
  expect(state.verlauf).toHaveLength(z.verlauf.length + 1);
  expect(ereignisse[0]).toContain('beschlossen');
});

test('F13: Stufen, eine Reform je Quartal, nicht im Haushaltsquartal', () => {
  const z = regierung();
  expect(sperrgrund(z, 'wohnen2')).toContain('Bauoffensive');
  const nach = reformEinbringen(z, { reformId: 'wohnen1' }).state;
  expect(sperrgrund(nach, 'wohnen1')).toBe('beschlossen');
  expect(sperrgrund(nach, 'wohnen2')).toBe('nur eine Reform je Quartal');
  expect(() => reformEinbringen(nach, { reformId: 'pflege1' })).toThrow();
  const naechstes = quartalBeenden(nach).state;
  expect(sperrgrund(naechstes, 'wohnen2')).toBeNull();
  expect(() => reformEinbringen(regierung({ quartal: config.regierung.quartaleJeJahr }), { reformId: 'pflege1' })).toThrow('Haushaltsquartal');
});

test('F13: Minderheitsregierung scheitert im Bundestag, das Quartal ist trotzdem verbraucht', () => {
  const z = regierung({ koalition: { partner: [], startAnteile: {}, minderheit: true, fehlschlaege: 0 } });
  const { state, ereignisse } = reformEinbringen(z, { reformId: 'pflege1' });
  expect(ereignisse[0]).toContain('abgelehnt');
  expect(state.reformen).toEqual([]);
  expect(state.probleme.pflege).toBe(55);
  expect(state.reformImQuartal).toBe(true);
});

test('F13: Druck steigt je Quartal bis höchstens 100, ab der Schwelle verliert die Kanzlerpartei', () => {
  const z = regierung({ probleme: { wohnen: 69, pflege: 100, schiene: 10 } });
  const { state, ereignisse } = druckSteigt(z);
  expect(state.probleme).toEqual({ wohnen: 70, pflege: 100, schiene: 11 });
  // zwei Probleme über der Schwelle
  expect(state.anteile.union).toBeCloseTo(z.anteile.union - 2 * config.reformen.verlustJeQuartal, 2);
  expect(ereignisse[0]).toContain('Mieten und Wohnraum');
  const ruhig = druckSteigt(regierung());
  expect(ruhig.state.anteile).toEqual(regierung().anteile);
  expect(ruhig.ereignisse).toEqual([]);
});

test('F13: laufende Reformkosten zählen im Haushalt und zur Schuldenbremse', () => {
  const z = regierung({ reformen: ['wohnen1', 'schiene1'] });
  expect(reformKosten(z)).toBe(6000000);
  const ohne = vorschau(regierung(), {}).bilanz;
  const mit = vorschau(z, {}).bilanz;
  expect(mit.neueSchulden - ohne.neueSchulden).toBe(6000000);
  expect(ohne.eingehalten).toBe(true); // Haushalt 2026 liegt genau an der Grenze
  expect(mit.eingehalten).toBe(false); // jede Reform muss im Haushalt ausgeglichen werden
});
