import { test, expect } from 'vitest';
import { haushaltBeschliessen } from '../src/engine/haushalt.js';
import { neuesSpiel, laden } from '../src/engine/state.js';
import { wahlkampfWoche } from '../src/engine/wahlkampf.js';
import { quartalBeenden } from '../src/engine/regierung.js';
import { umfrageBuchen } from '../src/engine/umfragebilanz.js';
import { ministerien } from '../src/data/ministerien.js';
import { gruppen } from '../src/data/kennzahlen.js';
import { config } from '../src/data/config.js';

// Union + SPD im Amt, Haushaltsquartal
const imAmt = () => ({
  ...neuesSpiel('union', 3),
  phase: 'regierung', quartal: 4, kanzlerParteiId: 'union', sitze: { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 },
  koalition: { partner: ['spd'], startAnteile: { spd: 16.4 }, minderheit: false, fehlschlaege: 0 },
  kabinett: { anspruch: {}, verteilung: { ...Object.fromEntries(ministerien.map((m) => [m.id, 'union'])), arbeit: 'spd' } },
  gruppen: { ...neuesSpiel('union', 3).gruppen, rentner: 30 },
});
// Summe aller Posten einer Partei im letzten Eintrag
const summe = (z, id) => z.umfrageBilanz.at(-1).posten.filter((p) => p.partei === id).reduce((s, p) => s + p.wert, 0);

test('Haushalt: Posten mit Ursache addieren sich zur tatsächlichen Änderung, Gruppen einzeln', () => {
  const z = imAmt();
  const { state } = haushaltBeschliessen(z, { stufen: { arbeit: -1, verteidigung: 1 } });
  const e = state.umfrageBilanz.at(-1);
  expect(e.zeit).toBe('Haushalt Jahr 1');
  for (const id of ['union', 'spd']) expect(summe(state, id)).toBeCloseTo(state.anteile[id] - z.anteile[id], 2);
  const ursachen = e.posten.map((p) => p.ursache);
  expect(ursachen).toContain('Haushalt: Etat Arbeit gekürzt');
  expect(ursachen).toContain('Haushalt: Etat Verteidigung erhöht');
  // Gruppen getrennt: je Gruppe ein Posten, die unzufriedenen Rentner kosten die Kanzlerpartei
  // (Gruppen genau bei 50 tragen nichts bei und erscheinen nicht)
  for (const g of gruppen.filter((x) => Math.abs(state.gruppen[x.id] - 50) > 0.1)) expect(ursachen).toContain(`Stimmung der Gruppe ${g.name}`);
  expect(e.posten.find((p) => p.ursache === 'Stimmung der Gruppe Rentner').wert).toBeLessThan(0);
  expect(e.posten.some((p) => p.rest)).toBe(true); // Schwankung als Rest
});

test('Wahlkampf und Quartal buchen, es bleiben die letzten Runden', () => {
  let z = neuesSpiel('spd', 1);
  z = wahlkampfWoche(z, { aktion: 'angriff', ziel: 'union' }).state;
  const e = z.umfrageBilanz.at(-1);
  expect(e.zeit).toBe('Wahlkampf, Woche 1');
  expect(e.posten.find((p) => p.partei === 'union').ursache).toBe('Wahlkampf: Angriff auf CDU/CSU');
  expect(summe(z, 'spd')).toBeCloseTo(z.anteile.spd - neuesSpiel('spd', 1).anteile.spd, 2);
  // Kürzung auf config.umfrageBilanz.runden Zeitangaben
  let y = { ...neuesSpiel('spd', 1), umfrageBilanz: [] };
  for (let i = 1; i <= 12; i++) y = umfrageBuchen({ ...y, wahlkampfWoche: i }, { ...y, anteile: { ...y.anteile, spd: y.anteile.spd + 0.1 } }, []);
  expect(new Set(y.umfrageBilanz.map((x) => x.zeit)).size).toBe(config.umfrageBilanz.runden);
  expect(y.umfrageBilanz.at(-1).zeit).toBe('Wahlkampf, Woche 12');
});

test('Quartal: belastende Probleme erscheinen einzeln mit Namen', () => {
  const z = { ...imAmt(), quartal: 1, probleme: { ...imAmt().probleme, wohnungsnot: { wert: 85, verlauf: [85] } } };
  const { state } = quartalBeenden(z);
  const posten = state.umfrageBilanz.flatMap((e) => e.posten);
  expect(posten.some((p) => p.ursache.startsWith('Problem „Wohnungsnot'))).toBe(true);
});

test('Migration 13 → 14: leere Umfrage-Bilanz', () => {
  const { umfrageBilanz, ...rest } = neuesSpiel('gruene', 2);
  expect(laden(JSON.stringify({ ...rest, version: 13 })).umfrageBilanz).toEqual([]);
});
