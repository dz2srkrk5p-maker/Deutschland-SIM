import { test, expect } from 'vitest';
import { parteiPosition, chesAufAchsen, abstand } from '../src/engine/profil.js';
import { parteien } from '../src/data/parteien.js';

test('Parteipositionen: alle Parteien mit Sitzchance haben CHES-Werte, Achsen im Bereich −2 … +2', () => {
  for (const p of parteien.filter((x) => !x.sonstige)) {
    const pos = parteiPosition(p.id);
    expect(Object.values(pos).every((v) => v >= -2 && v <= 2)).toBe(true);
  }
  expect(parteiPosition('sonstige')).toBeNull();
  // Plausibilität der Richtung: Grüne ökologischer als AfD, FDP marktliberaler als Linke, AfD EU-kritischer als SPD
  expect(parteiPosition('gruene').oekologie).toBeGreaterThan(parteiPosition('afd').oekologie);
  expect(parteiPosition('fdp').wirtschaft).toBeGreaterThan(parteiPosition('linke').wirtschaft);
  expect(parteiPosition('afd').eu).toBeLessThan(parteiPosition('spd').eu);
});

test('Umrechnung und Abstand', () => {
  expect(chesAufAchsen({ lrecon: 5, galtan: 5, eu: 4, umwelt: 5 })).toEqual({ wirtschaft: 0, gesellschaft: 0, oekologie: 0, eu: 0 });
  expect(chesAufAchsen({ lrecon: 10, galtan: 0, eu: 7, umwelt: 0 })).toEqual({ wirtschaft: 2, gesellschaft: -2, oekologie: 2, eu: 2 });
  expect(abstand({ wirtschaft: 1, eu: -1 }, { wirtschaft: -1, eu: -1, oekologie: 2 })).toBe(1); // nur gemeinsame Achsen
});
