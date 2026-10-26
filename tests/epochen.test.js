import { test, expect } from 'vitest';
import { neuesSpiel, laden, speichern, ZUSTAND_VERSION } from '../src/engine/state.js';
import { epochenMonat, epochenStart, faelligeProbleme, titelseiteGelesen, zeitpunkt } from '../src/engine/epochen.js';
import { problemListe } from '../src/engine/probleme.js';
import { epochen } from '../src/data/epochen.js';
import { config } from '../src/data/config.js';
import { zug } from './helfer/spieler.js';

const ec = config.epochen;

test('neues Spiel: noch keine Epoche, die erste beginnt im Januar des ersten Epochenjahres', () => {
  const z = neuesSpiel('spd', 1);
  expect(z.epochen).toEqual(epochenStart());
  expect(z.epochen.naechste).toBe(zeitpunkt(ec.ersteEpocheJahr, 1));
});

test('Epochenbeginn: Titelseite, Streitfrage, Problem mit Abstand 0 kommt sofort', () => {
  const z = neuesSpiel('spd', 1);
  const vorher = epochenMonat(z, ec.ersteEpocheJahr - 1, 12);
  expect(vorher.state.epochen.aktiv).toEqual([]);
  const r = epochenMonat(z, ec.ersteEpocheJahr, 1);
  const e = epochen[0];
  expect(r.state.epochen.aktiv.map((a) => a.id)).toEqual([e.id]);
  expect(r.state.epochen.titelseite).toBe(e.id);
  expect(r.ereignisse.join(' ')).toContain(e.streitfrage.text);
  expect(r.state.probleme[e.probleme[0].id].wert).toBe(e.probleme[0].start);
  expect(problemListe(r.state).some((x) => x.problem.id === e.probleme[0].id)).toBe(true);
  // nächste Epoche etwa zehn Jahre später
  const abstand = r.state.epochen.naechste - zeitpunkt(ec.ersteEpocheJahr, 1);
  expect(abstand).toBeGreaterThanOrEqual((ec.abstandJahre - ec.abstandSchwankungJahre) * 12);
  expect(abstand).toBeLessThanOrEqual((ec.abstandJahre + ec.abstandSchwankungJahre) * 12);
  expect(titelseiteGelesen(r.state).state.epochen.titelseite).toBeNull();
});

test('Epochenprobleme verteilt: fällig erst nach ihrem Abstand zum Start', () => {
  const daten = { probleme: [{ id: 'a', monat: 0 }, { id: 'b', monat: 18 }, { id: 'c', monat: 36 }] };
  expect(faelligeProbleme(daten, 100, 100).map((p) => p.id)).toEqual(['a']);
  expect(faelligeProbleme(daten, 100, 118).map((p) => p.id)).toEqual(['a', 'b']);
  expect(faelligeProbleme(daten, 100, 136).map((p) => p.id)).toEqual(['a', 'b', 'c']);
});

test('höchstens zwei Epochen gleichzeitig; sind beide Plätze belegt, wartet die nächste', () => {
  const z = { ...neuesSpiel('spd', 1), epochen: { aktiv: epochen.map((e) => ({ id: e.id, start: 0, ende: 10 ** 6 })), vorbei: [], naechste: 0, index: 0, titelseite: null } };
  const r = epochenMonat(z, 2030, 1);
  expect(r.state.epochen.aktiv).toHaveLength(2);
  expect(r.state.epochen.index).toBe(0);
});

test('Migration 24 → 25: Epochen beginnen frühestens im nächsten Monat', () => {
  const { epochen: _e, ...alt } = { ...neuesSpiel('union', 5), jahr: 2031, monat: 4 };
  const z = laden(JSON.stringify({ ...alt, version: 24 }));
  expect(z.version).toBe(ZUSTAND_VERSION);
  expect(z.epochen.aktiv).toEqual([]);
  expect(z.epochen.naechste).toBe(zeitpunkt(2031, 4) + 1);
});

// Headless-Lauf über 30 Jahre (Auftrag): ohne Fehler, Invarianten nach jedem Zug
test('30 Jahre ohne Fehler: höchstens zwei Epochen, Epochen beginnen und enden, Speichern und Laden stabil', { timeout: 120000 }, () => {
  for (const [partei, seed] of [['union', 11], ['linke', 12]]) {
    let z = neuesSpiel(partei, seed);
    const ende = z.jahr + 30;
    let maxAktiv = 0;
    for (let i = 0; i < 20000 && z.jahr < ende; i++) {
      z = zug(z).state;
      maxAktiv = Math.max(maxAktiv, z.epochen.aktiv.length);
      expect(z.epochen.aktiv.length).toBeLessThanOrEqual(ec.maxGleichzeitig);
      // Weiche: spätestens nach dem Aufschub ist ein Weg gewählt (Etappe 3)
      const jetzt = z.jahr * 12 + z.monat - 1;
      if (z.phase === 'regierung' || z.phase === 'opposition') for (const e of z.epochen.aktiv) if (jetzt - e.start > ec.aufschubMonate) expect(e.wege.length).toBeGreaterThan(0);
      expect(Object.keys(z.probleme).length).toBeLessThanOrEqual(config.problemObergrenze.aktivMax + epochen.length);
    }
    expect(z.jahr).toBeGreaterThanOrEqual(ende);
    expect(laden(speichern(z))).toEqual(z);
    expect(z.epochen.index).toBe(epochen.length); // beide Platzhalter-Epochen sind gekommen
    expect(z.epochen.vorbei.length).toBeGreaterThanOrEqual(1); // die erste ist nach 15 Jahren vorbei
    for (const v of z.epochen.vorbei) expect(typeof v.gelungen).toBe('boolean');
    expect(maxAktiv).toBe(2);
  }
});
