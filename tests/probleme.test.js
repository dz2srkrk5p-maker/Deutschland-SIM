import { test, expect } from 'vitest';
import { config } from '../src/data/config.js';
import { ministerien } from '../src/data/ministerien.js';
import { probleme, kategorien } from '../src/data/probleme.js';
import { einnahmearten } from '../src/data/einnahmen.js';
import { ereignisse } from '../src/data/ereignisse.js';
import { kennzahlen, gruppen, achsen } from '../src/data/kennzahlen.js';
import { neuesSpiel, laden } from '../src/engine/state.js';
import {
  ursachen, trend, problemListe, loesungStarten, loesungSperre, problemeQuartal, jahresFolgen, laufendeKosten, erfolgschance, loesung, stufeVon,
} from '../src/engine/probleme.js';

const pc = config.probleme;
const regierung = (extra = {}) => ({
  ...neuesSpiel('union', 1), phase: 'regierung', quartal: 1, kanzlerParteiId: 'union',
  sitze: { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 },
  koalition: { partner: ['spd'], startAnteile: { spd: 16.4 }, minderheit: false, fehlschlaege: 0 },
  kabinett: { anspruch: {}, verteilung: Object.fromEntries(ministerien.map((m) => [m.id, m.id === 'bauen' ? 'spd' : 'union'])) },
  ...extra,
});
const mitWerten = (z, werte) => ({ ...z, probleme: { ...z.probleme, ...Object.fromEntries(Object.entries(werte).map(([id, w]) => [id, { wert: w, verlauf: [w] }])) } });

test('Daten: mindestens 20 Problembereiche, eindeutige IDs, alle Verweise existieren', () => {
  expect(probleme.length).toBeGreaterThanOrEqual(20);
  const ids = new Set(probleme.map((p) => p.id));
  expect(ids.size).toBe(probleme.length);
  const loesungIds = probleme.flatMap((p) => p.loesungen.map((l) => l.id));
  expect(new Set(loesungIds).size).toBe(loesungIds.length);
  const ministerium = new Set(ministerien.map((m) => m.id));
  const kennzahl = new Set(kennzahlen.map((k) => k.id));
  const gruppe = new Set(gruppen.map((g) => g.id));
  const achse = new Set(achsen.map((a) => a.id));
  const wirkungOk = (w = {}) => Object.keys(w.gruppen ?? {}).every((g) => gruppe.has(g)) && Object.keys(w.probleme ?? {}).every((p) => ids.has(p));
  for (const p of probleme) {
    expect(kategorien).toContain(p.kategorie);
    expect(ministerium.has(p.ministerium)).toBe(true);
    expect(p.loesungen.length).toBeGreaterThanOrEqual(2);
    for (const t of p.treiber) {
      if (t.land !== undefined) expect(kennzahl.has(t.land)).toBe(true);
      if (t.problem) expect(ids.has(t.problem)).toBe(true);
      if (t.gruppe) expect(gruppe.has(t.gruppe)).toBe(true);
      if (t.etat) expect(ministerium.has(t.etat)).toBe(true);
      if (t.profil) expect(achse.has(t.profil)).toBe(true);
    }
    expect(wirkungOk(p.folgen)).toBe(true);
    for (const l of p.loesungen) {
      expect(wirkungOk(l.nebenwirkung)).toBe(true);
      expect(Object.keys(l.ausrichtung).every((a) => achse.has(a))).toBe(true);
      if (l.braucht) expect(loesungIds).toContain(l.braucht);
    }
  }
  for (const e of einnahmearten) {
    expect(wirkungOk(e.wirkungJeStufe)).toBe(true);
    for (const s of e.ausgestaltung) expect(wirkungOk(s.wirkung)).toBe(true);
  }
  for (const e of ereignisse) {
    if (e.problem) expect(ids.has(e.problem)).toBe(true);
    for (const m of e.moeglichkeiten) expect(Object.keys(m.folgen.probleme ?? {}).every((p) => ids.has(p))).toBe(true);
  }
});

test('Start: höchstens maxAktiv Probleme prominent, Rest auf der Beobachtungsliste', () => {
  const liste = problemListe(regierung());
  expect(liste.filter((e) => e.prominent).length).toBeLessThanOrEqual(pc.maxAktiv);
  expect(liste.filter((e) => !e.prominent).length).toBeGreaterThan(0);
  expect(liste[0].wert).toBeGreaterThanOrEqual(liste.at(-1).wert);
});

test('Ursachen: Etatkürzung und andere Probleme treiben den Trend', () => {
  const z = regierung();
  const p = probleme.find((x) => x.id === 'infrastruktur');
  const gekuerzt = { ...z, haushalt: { ...z.haushalt, etats: { ...z.haushalt.etats, verkehr: z.haushalt.etats.verkehr * 0.8 } } };
  expect(trend(gekuerzt, p)).toBeGreaterThan(trend(z, p));
  const kommunen = mitWerten(z, { kommunalfinanzen: 90 });
  expect(ursachen(kommunen, p).find((u) => u.problem === 'kommunalfinanzen').beitrag).toBeCloseTo(0.15 * 4, 5);
});

test('Quartal: Werte bewegen sich, Verlauf wächst, Runde und Kapital, gleicher Seed gleiches Ergebnis', () => {
  const z = regierung({ kapital: 40, aktionenImQuartal: 2 });
  const r = problemeQuartal(z);
  expect(r).toEqual(problemeQuartal(z));
  expect(r.state.runde).toBe(z.runde + 1);
  expect(r.state.kapital).toBe(40 + config.kapital.jeQuartal);
  expect(r.state.aktionenImQuartal).toBe(0);
  expect(r.state.probleme.wohnungsnot.verlauf).toHaveLength(2);
  // Eskalation wird gemeldet
  const knapp = mitWerten(z, { rezession: 79.9 });
  const meldungen = Array.from({ length: 30 }, (_, i) => problemeQuartal({ ...knapp, rngZustand: i + 1 }).ereignisse).flat();
  expect(meldungen.some((m) => m.includes('Rezession und Industrieabwanderung ist jetzt „Krise“'))).toBe(true);
});

test('Lösung: Sperren, Kosten, Abschluss mit Erfolg oder Fehlschlag', () => {
  const z = regierung();
  expect(loesungSperre(z, 'wohnen2')).toContain('Bauoffensive');
  expect(loesungSperre({ ...z, quartal: 4 }, 'wohnen1')).toContain('Haushaltsquartal');
  expect(loesungSperre({ ...z, kapital: 2 }, 'wohnen1')).toContain('Kapital');
  const gestartet = loesungStarten(z, { loesungId: 'wohnen1' }).state;
  expect(gestartet.kapital).toBe(z.kapital - loesung('wohnen1').kapital);
  expect(gestartet.loesungen.wohnen1).toEqual({ status: 'laufend', fertig: z.runde + 4, start: z.runde });
  expect(laufendeKosten(gestartet)).toBe(2000000);
  expect(loesungSperre(gestartet, 'wohnen1')).toBe('läuft schon');
  expect(loesungSperre({ ...gestartet, aktionenImQuartal: pc.aktionenJeQuartal }, 'pflege1')).toContain('je Quartal');
  // Abschluss: über viele Seeds mal Erfolg, mal Fehlschlag; Erfolg senkt stark, Fehlschlag nur teilweise
  const fertig = { ...gestartet, runde: 3, loesungen: { wohnen1: { status: 'laufend', fertig: 4 } } };
  const ergebnisse = Array.from({ length: 60 }, (_, i) => problemeQuartal({ ...fertig, rngZustand: i * 7 + 1 }).state);
  const erfolge = ergebnisse.filter((s) => s.loesungen.wohnen1.status === 'erfolg');
  expect(erfolge.length).toBeGreaterThan(30);
  expect(erfolge.length).toBeLessThan(60);
  expect(ergebnisse.some((s) => s.loesungen.wohnen1.status === 'gescheitert')).toBe(true);
  expect(laufendeKosten({ ...fertig, loesungen: { wohnen1: { status: 'gescheitert', fertig: 4 } } })).toBe(0);
});

test('Jahresfolgen: nur Probleme ab „angespannt“ wirken, Krise voll', () => {
  const ruhig = jahresFolgen(mitWerten(regierung(), Object.fromEntries(probleme.map((p) => [p.id, 10]))));
  expect(ruhig.wachstum).toBe(0);
  const krise = jahresFolgen(mitWerten(regierung(), { ...Object.fromEntries(probleme.map((p) => [p.id, 10])), rezession: 90 }));
  expect(krise.wachstum).toBeCloseTo(-0.4);
  expect(stufeVon(90).id).toBe('krise');
});

test('Erfolgschance: neutrale Lösung ohne Bonus, Grenzen 5–95 %', () => {
  const z = regierung();
  expect(erfolgschance(z, loesung('pflege2'))).toBe(loesung('pflege2').erfolg);
  for (const p of probleme) for (const l of p.loesungen) {
    const c = erfolgschance(z, l);
    expect(c).toBeGreaterThanOrEqual(0.05);
    expect(c).toBeLessThanOrEqual(0.95);
  }
});

test('Migration 11 → 12: F13-Druck wird Problemwert, beschlossene Reformen werden erfolgreiche Lösungen', () => {
  const { probleme: _, loesungen, runde, aktionenImQuartal, jahresWirkung, ...rest } = neuesSpiel('spd', 2);
  const v11 = { ...rest, version: 11, probleme: { wohnen: 44, pflege: 71, schiene: 50 }, reformen: ['wohnen1', 'schiene1'], reformImQuartal: true };
  const z = laden(JSON.stringify(v11));
  expect(z.probleme.wohnungsnot.wert).toBe(44);
  expect(z.probleme.pflegenotstand.wert).toBe(71);
  expect(z.loesungen).toEqual({ wohnen1: { status: 'erfolg', fertig: 0 }, schiene1: { status: 'erfolg', fertig: 0 } });
  expect(laufendeKosten(z)).toBe(6000000); // Kosten laufen weiter wie bei F13
  expect(z.aktionenImQuartal).toBe(1);
  expect(z.reformen).toBeUndefined();
});
