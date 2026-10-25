import { test, expect } from 'vitest';
import { config } from '../src/data/config.js';
import { laender } from '../src/data/laender.js';
import { ministerien } from '../src/data/ministerien.js';
import { neuesSpiel, laden } from '../src/engine/state.js';
import { bundesratAbstimmung } from '../src/engine/bundesrat.js';
import { quartalBeenden } from '../src/engine/regierung.js';
import { laenderStart, kalenderJahr, stimmung, wechselChance, wechsel, naechsteWahlen, landtagswahlenQuartal } from '../src/engine/landtagswahlen.js';

const lw = config.landtagswahlen;
// Union + SPD im Amt, Bundestagswahl mit Startanteilen; keine geschäftsführenden Länder (für saubere Einzeltests)
const imAmt = (extra = {}) => {
  const z = neuesSpiel('union', 7);
  const stand = Object.fromEntries(Object.entries(laenderStart()).map(([id, l]) => [id, { ...l, geschaeftsfuehrend: false }]));
  return {
    ...z, phase: 'regierung', quartal: 1, kanzlerParteiId: 'union', sitze: { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 },
    koalition: { partner: ['spd'], startAnteile: { spd: 16.4 }, minderheit: false, fehlschlaege: 0 },
    kabinett: { anspruch: {}, verteilung: Object.fromEntries(ministerien.map((m) => [m.id, 'union'])) },
    wahlergebnis: { anteile: { ...z.anteile }, vorher: { ...z.anteile }, wahlkampf: 0 },
    laender: stand,
    ...extra,
  };
};

test('Feature 5: Termine mit Quelle, Kalenderjahr aus Kanzlerjahren', () => {
  for (const l of laender) {
    expect(l.wahl.jahr).toBeGreaterThanOrEqual(2027);
    expect([1, 2, 3, 4]).toContain(l.wahl.quartal);
    expect(l.wahl.quelle === 'Spielwert' || l.wahl.quelle.startsWith('Quelle: ')).toBe(true);
  }
  expect(laender.find((l) => l.id === 'hb').wahlperiode).toBe(4);
  expect(kalenderJahr(imAmt())).toBe(2026);
  expect(kalenderJahr(imAmt({ statistik: { jahreKanzler: 3 } }))).toBe(2029);
});

test('Feature 5: Wechselchance nach Stimmung, begrenzt; Wechsel tauscht genau eine Partei, nie die AfD', () => {
  const z = imAmt();
  expect(stimmung(z)).toBeCloseTo(0, 6);
  expect(wechselChance(z, 'nw')).toBe(lw.basis); // NRW: Union regiert mit
  const schlecht = imAmt({ anteile: { ...z.anteile, union: z.anteile.union - 3, spd: z.anteile.spd - 2, afd: z.anteile.afd + 5 } });
  expect(wechselChance(schlecht, 'nw')).toBe(Math.min(lw.max, Math.round((lw.basis + 5 * lw.jePunkt) * 100) / 100));
  // Gegenrichtung: Saarland (nur SPD) bei Union + Grünen im Bund – schlechte Stimmung senkt die Chance, dass eine Bundespartei hinzukommt
  const unionGruen = { ...schlecht, koalition: { ...schlecht.koalition, partner: ['gruene'] } };
  expect(wechselChance(unionGruen, 'sl')).toBe(Math.max(lw.min, Math.round((lw.basis + lw.jePunkt * stimmung(unionGruen)) * 100) / 100));
  expect(wechselChance(unionGruen, 'sl')).toBeLessThan(lw.basis);
  // NRW (Union, Grüne): die Union fällt heraus, die inhaltlich nächste Partei außerhalb kommt hinein
  const w = wechsel(z, 'nw');
  expect(w.raus).toBe('union');
  expect(w.regierung).toHaveLength(2);
  expect(w.regierung).not.toContain('union');
  expect(w.regierung).not.toContain('afd');
  // Landesregierung nur aus einer Partei ohne Profil (Freie Wähler): kein Absturz, stärkste Bundespartei kommt hinzu
  const nurFw = { ...z, laender: { ...z.laender, by: { ...z.laender.by, regierung: ['fw'] } } };
  expect(wechsel(nurFw, 'by').rein).toBe('union');
  // Saarland (SPD allein): SPD raus, eine andere Partei rein
  expect(wechsel(z, 'sl').regierung).toHaveLength(1);
});

test('Feature 5: Wahl zum Termin, nächste Wahl nach Wahlperiode, Umfragewirkung in der Bilanz', () => {
  // NRW 2027, Quartal 2: Kalenderjahr 2027 = 1 Kanzlerjahr
  const z = imAmt({ quartal: 2, statistik: { jahreKanzler: 1, regierungenGebildet: 1, besteWahl: 28 } });
  const ergebnisse = Array.from({ length: 30 }, (_, i) => landtagswahlenQuartal({ ...z, rngZustand: i * 7 + 3 }));
  const nw = ergebnisse.map((r) => r.state.laender.nw);
  expect(nw.every((l) => l.wahl.jahr === 2032)).toBe(true);
  expect(ergebnisse.every((r) => r.ereignisse.some((e) => e.startsWith('Landtagswahl Nordrhein-Westfalen')))).toBe(true);
  const gewechselt = ergebnisse.find((r) => r.state.laender.nw.regierung.join() !== 'union,gruene');
  expect(gewechselt).toBeDefined();
  expect(gewechselt.state.umfrageBilanz.at(-1).posten.some((p) => p.ursache.startsWith('Landtagswahl Nordrhein-Westfalen'))).toBe(true);
  // Bremen am selben Termin, Hessen nicht
  expect(ergebnisse[0].ereignisse.some((e) => e.includes('Bremen'))).toBe(true);
  expect(ergebnisse[0].ereignisse.some((e) => e.includes('Hessen'))).toBe(false);
  // nicht in der Regierung: nichts
  expect(landtagswahlenQuartal({ ...z, phase: 'wahlkampf' }).ereignisse).toEqual([]);
});

test('Feature 5: Ankündigung, Bundesrat aus dem Spielstand, geschäftsführende Länder bilden neu', () => {
  const z = imAmt({ quartal: 1, statistik: { jahreKanzler: 1, regierungenGebildet: 1, besteWahl: 28 } });
  expect(naechsteWahlen(z).map((w) => w.land.id)).toEqual(expect.arrayContaining(['nw', 'sl', 'sh', 'hb']));
  expect(naechsteWahlen(z).every((w) => w.inQuartalen === 1)).toBe(true);
  // Bundesrat zählt den Stand im Spiel
  const ohneNrw = { ...z.laender, nw: { ...z.laender.nw, regierung: ['spd', 'gruene'] } };
  expect(bundesratAbstimmung(['union', 'gruene'], ohneNrw).ja).toBe(bundesratAbstimmung(['union', 'gruene']).ja - 6);
  // geschäftsführend: Neubildung am ersten Quartalsende
  const start = imAmt({ laender: laenderStart() });
  const r = quartalBeenden(start);
  expect(Object.values(r.state.laender).some((l) => l.geschaeftsfuehrend)).toBe(false);
  expect(r.ereignisse.filter((e) => e.includes('Neubildung'))).toHaveLength(3);
});

test('Feature 5: Migration 16 → 17', () => {
  const { laender: _, ...rest } = neuesSpiel('spd', 1);
  expect(laden(JSON.stringify({ ...rest, version: 16 })).laender.nw.regierung).toEqual(['union', 'gruene']);
});
