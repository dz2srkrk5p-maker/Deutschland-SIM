import { test, expect } from 'vitest';
import { config } from '../src/data/config.js';
import { ministerien } from '../src/data/ministerien.js';
import { neuesSpiel } from '../src/engine/state.js';
import { wahlkampfWoche } from '../src/engine/wahlkampf.js';
import { schlagzeilen } from '../src/engine/schlagzeilen.js';

const regierung = (extra = {}) => ({
  ...neuesSpiel('union', 1),
  phase: 'regierung',
  sitze: { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 },
  kanzlerParteiId: 'union',
  koalition: { partner: ['spd'], startAnteile: { spd: 16.4 }, minderheit: false, fehlschlaege: 0 },
  kabinett: { anspruch: { union: 16 }, verteilung: Object.fromEntries(ministerien.map((m) => [m.id, 'union'])) },
  ...extra,
});

test('F15: Spielbeginn: BSW knapp an der Hürde, sonst nichts', () => {
  expect(schlagzeilen(neuesSpiel('spd', 1))).toEqual(['BSW zittert um die Fünf-Prozent-Hürde (4,98 %)']);
});

test('F15: Regierung: Koalitionsunruhe, brennende Probleme (höchster zuerst), Minderheit; höchstens 3, keine doppelten', () => {
  const z = regierung({
    anteile: { ...neuesSpiel('union', 1).anteile, spd: 15.4, sonstige: 5.519 },
    probleme: { ...neuesSpiel('union', 1).probleme, wohnungsnot: { wert: 75, verlauf: [75] }, pflegenotstand: { wert: 90, verlauf: [90] } },
  });
  const liste = schlagzeilen(z);
  expect(liste).toEqual([
    'Unruhe bei SPD: Basis zweifelt an der Koalition',
    'Pflegenotstand: Druck auf die Bundesregierung wächst (90 von 100)',
    'Wohnungsnot und Mietenkrise: Druck auf die Bundesregierung wächst (75 von 100)',
  ]);
  expect(liste).toHaveLength(config.ticker.anzahl);
  const minderheit = regierung({ koalition: { partner: [], startAnteile: {}, minderheit: true, fehlschlaege: 0 } });
  // Start: Wohnungsnot (60) ist schon ernst und steht davor
  expect(schlagzeilen(minderheit).some((s) => s.startsWith('Minderheitsregierung: CDU/CSU'))).toBe(true);
});

test('F15: Umfragetrend der eigenen Partei, gleicher Zustand gleiche Schlagzeilen', () => {
  let z = neuesSpiel('union', 5);
  for (let i = 0; i < 4; i++) z = wahlkampfWoche(z, { aktion: 'plakate' }).state;
  const liste = schlagzeilen(z);
  expect(liste).toEqual(schlagzeilen(z));
  const trend = z.verlauf.at(-1).anteil - z.verlauf.at(-1 - config.ticker.trendSchritte).anteil;
  expect(liste.some((s) => s.startsWith('Umfragen: CDU/CSU'))).toBe(Math.abs(trend) >= config.ticker.trendPunkte);
  for (const s of liste) expect(s).not.toMatch(/undefined|NaN/);
});
