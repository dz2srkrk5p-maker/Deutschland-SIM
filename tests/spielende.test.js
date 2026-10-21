import { test, expect } from 'vitest';
import { koalitionsbruch, haushaltBeschliessen } from '../src/engine/haushalt.js';
import { verhandeln } from '../src/engine/koalition.js';
import { wahl } from '../src/engine/wahl.js';
import { neuesSpiel } from '../src/engine/state.js';
import { ministerien } from '../src/data/ministerien.js';
import { config } from '../src/data/config.js';

// Regierung SPD (Kanzler) + Union + Grüne; Union hält Inneres, Grüne Umwelt, SPD den Rest
const imAmt = (sitze = { spd: 200, union: 200, gruene: 80, afd: 150 }) => {
  const verteilung = Object.fromEntries(ministerien.map((m) => [m.id, 'spd']));
  verteilung.inneres = 'union';
  verteilung.umwelt = 'gruene';
  return {
    ...neuesSpiel('spd', 1),
    phase: 'regierung',
    sitze,
    koalition: { partner: ['union', 'gruene'], startAnteile: { union: 28.6, gruene: 11.6 } },
    kanzlerParteiId: 'spd',
    kabinett: { anspruch: { spd: 14, union: 1, gruene: 1 }, verteilung },
  };
};
// Anteil setzen; die Differenz geht an „Sonstige“, damit die Summe 100 bleibt
const mitAnteil = (z, id, wert) => ({
  ...z,
  anteile: { ...z.anteile, [id]: wert, sonstige: z.anteile.sonstige + z.anteile[id] - wert },
});

test('Koalitionsbruch: knapp über der Grenze löst aus, genau auf der Grenze nicht', () => {
  const grenze = config.spielende.koalitionsbruchPunkte;
  expect(koalitionsbruch(mitAnteil(imAmt(), 'gruene', 11.6 - grenze)).state.koalition.partner).toEqual(['union', 'gruene']);
  expect(koalitionsbruch(mitAnteil(imAmt(), 'gruene', 11.6 - grenze - 0.01)).state.koalition.partner).toEqual(['union']);
});

test('Bruch mit verbleibender Mehrheit: weiterregieren, Ministerien an den Spieler', () => {
  // SPD 200 + Union 200 = 400 ≥ 316
  const { state, neuwahl } = koalitionsbruch(mitAnteil(imAmt(), 'gruene', 9.0));
  expect(neuwahl).toBe(false);
  expect(state.kabinett.verteilung.umwelt).toBe('spd');
  expect(state.kabinett.anspruch).toEqual({ spd: 15, union: 1 });
});

test('Bruch ohne Mehrheit: vorgezogene Neuwahl', () => {
  // SPD 200 + Grüne 80 = 280 < 316, wenn die Union geht
  const z = mitAnteil(imAmt(), 'union', 26.0);
  expect(koalitionsbruch(z).neuwahl).toBe(true);
  const { state, ereignisse } = haushaltBeschliessen(z, {});
  expect(state.phase).toBe('wahlkampf');
  expect(state.koalition).toBeNull();
  expect(ereignisse.some((e) => e.includes('vorgezogene Neuwahl'))).toBe(true);
});

test('Sieg nach 12 Jahren als Kanzler, nicht nach 11', () => {
  const z = (jahre) => ({ ...imAmt(), statistik: { jahreKanzler: jahre, regierungenGebildet: 3, besteWahl: 20 } });
  expect(haushaltBeschliessen(z(config.spielende.siegJahreKanzler - 2), {}).state.phase).toBe('regierung');
  expect(haushaltBeschliessen(z(config.spielende.siegJahreKanzler - 1), {}).state.phase).toBe('sieg');
});

test('Sieg geht vor Koalitionsbruch im selben Jahr', () => {
  const z = { ...mitAnteil(imAmt(), 'union', 20.0), statistik: { jahreKanzler: 11, regierungenGebildet: 3, besteWahl: 20 } };
  expect(haushaltBeschliessen(z, {}).state.phase).toBe('sieg');
});

test('Opposition: knapp ohne mögliche Mehrheit ja, knapp mit Mehrheit nein', () => {
  // Spieler SPD; einziger möglicher Partner Union. 315 Sitze zusammen reichen nicht, 316 schon.
  const nachWahlMit = (spd, union) => {
    const z = neuesSpiel('spd', 1);
    const anteile = { ...Object.fromEntries(Object.keys(z.anteile).map((id) => [id, 0])), spd, union, afd: 100 - spd - union };
    return wahl({ ...z, anteile }).state;
  };
  // Anteile so gewählt, dass SPD+Union genau 315 bzw. 316 von 630 Sitzen bekommen
  expect(nachWahlMit(25, 25).phase).toBe('opposition'); // 315 Sitze
  expect(nachWahlMit(25, 25.1).phase).toBe('koalition'); // 316 Sitze
});

test('Statistik zählt Regierungen, Kanzlerjahre und beste Wahl', () => {
  const z = { ...neuesSpiel('union', 1), phase: 'koalition', sitze: { union: 400, spd: 230 } };
  const regiert = verhandeln(z, { partner: [] }).state;
  expect(regiert.statistik.regierungenGebildet).toBe(1);
  const nachJahr = haushaltBeschliessen(regiert, {}).state;
  expect(nachJahr.statistik.jahreKanzler).toBe(1);
  expect(wahl(neuesSpiel('spd', 1)).state.statistik.besteWahl).toBe(16.4);
});
