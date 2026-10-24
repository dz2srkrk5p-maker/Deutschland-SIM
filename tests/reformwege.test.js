import { test, expect } from 'vitest';
import { config } from '../src/data/config.js';
import { ministerien } from '../src/data/ministerien.js';
import { bereiche, AUSRICHTUNGEN, akteure } from '../src/data/reformwege.js';
import { probleme } from '../src/data/probleme.js';
import { einnahmearten } from '../src/data/einnahmen.js';
import { gruppen, achsen } from '../src/data/kennzahlen.js';
import { neuesSpiel, laden } from '../src/engine/state.js';
import { abstimmung } from '../src/engine/bundestag.js';
import { aufstellung } from '../src/engine/einnahmen.js';
import { laufendeKosten } from '../src/engine/haushalt.js';
import { ursachen } from '../src/engine/probleme.js';
import { richtungsprofil } from '../src/engine/profil.js';
import {
  weg, wegVektor, wegSperre, wegVorschau, wegBeschliessen, reformwegeQuartal, bereichStatus, gewinnerVerlierer, profilWirkung,
} from '../src/engine/reformwege.js';

const rw = config.reformwege;
const SITZE = { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 };
const regierung = (extra = {}) => ({
  ...neuesSpiel('union', 1), phase: 'regierung', quartal: 1, kanzlerParteiId: 'union', sitze: SITZE, kapital: 100,
  koalition: { partner: ['spd'], startAnteile: { spd: 16.4 }, minderheit: false, fehlschlaege: 0 },
  kabinett: { anspruch: {}, verteilung: Object.fromEntries(ministerien.map((m) => [m.id, 'union'])) },
  ...extra,
});

test('Daten: 10 Bereiche mit je 3–5 Grundwegen, gültige Verweise, Gewinner und Verlierer', () => {
  expect(bereiche).toHaveLength(10);
  const alle = bereiche.flatMap((b) => b.wege);
  expect(new Set(alle.map((w) => w.id)).size).toBe(alle.length);
  const pIds = new Set(probleme.map((p) => p.id));
  const gIds = new Set(gruppen.map((g) => g.id));
  const eIds = new Set(einnahmearten.map((e) => e.id));
  for (const b of bereiche) {
    const grund = b.wege.filter((w) => !w.braucht);
    expect(grund.length).toBeGreaterThanOrEqual(3);
    expect(grund.length).toBeLessThanOrEqual(5);
    expect(ministerien.some((m) => m.id === b.ministerium)).toBe(true);
    // verschiedene Ausrichtungen je Bereich
    expect(new Set(grund.map((w) => w.richtung)).size).toBeGreaterThanOrEqual(3);
    for (const w of b.wege) {
      expect(AUSRICHTUNGEN[w.richtung]).toBeDefined();
      if (w.braucht) expect(b.wege.some((x) => x.id === w.braucht && !x.braucht)).toBe(true);
      for (const t of [w.kurz ?? {}, w.lang ?? {}]) {
        expect(Object.keys(t.gruppen ?? {}).every((g) => gIds.has(g))).toBe(true);
        expect(Object.keys(t.probleme ?? {}).every((p) => pIds.has(p))).toBe(true);
        expect(Object.keys(t.trend ?? {}).every((p) => pIds.has(p))).toBe(true);
      }
      expect(Object.keys(w.einnahmen ?? {}).every((e) => eIds.has(e))).toBe(true);
      expect(Object.values(wegVektor(w)).every((x) => x >= -2 && x <= 2)).toBe(true);
    }
  }
  for (const a of akteure) expect(Object.keys(a.vektor).every((id) => achsen.some((x) => x.id === id))).toBe(true);
  expect(gewinnerVerlierer(weg('a_mindestlohn'))).toEqual({ gewinner: ['geringverdiener'], verlierer: ['unternehmen'] });
});

test('Abstimmung nach Inhalt: Opposition nach Abstand, Partner mit Veto', () => {
  const z = regierung();
  const markt = abstimmung(z, { id: 'a_flex', vektor: wegVektor(weg('a_flex')) });
  const stimme = (a, id) => a.fraktionen.find((f) => f.id === id).stimme;
  expect(stimme(markt, 'union')).toBe('ja');
  expect(stimme(markt, 'spd')).toBe('ja'); // Abstand rund 1,15 < Veto 1,7
  expect(stimme(markt, 'linke')).toBe('nein');
  // ein nationalkonservativer Weg: SPD-Veto
  const grenze = abstimmung(z, { id: 'm_grenze', vektor: wegVektor(weg('m_grenze')) });
  expect(stimme(grenze, 'spd')).toBe('nein');
  expect(grenze.vorlage).toBe('m_grenze');
});

test('Beschluss: Kapital, Aufmerksamkeit, Umsetzung, Kosten und Einnahmen mit Herleitung', () => {
  // mit den Grünen: 49 Bundesratsstimmen für das Zustimmungsgesetz
  const z = regierung({ koalition: { partner: ['spd', 'gruene'], startAnteile: { spd: 16.4, gruene: 11.6 }, minderheit: false, fehlschlaege: 0 } });
  const { state, ereignisse } = wegBeschliessen(z, { wegId: 'st_einfach' });
  expect(ereignisse[0]).toContain('Reform beschlossen');
  expect(state.reformwege.st_einfach).toEqual({ status: 'umsetzung', fertig: z.runde + 4 });
  expect(state.kapital).toBe(100 - weg('st_einfach').kapital);
  expect(state.aktionenImQuartal).toBe(1);
  const ek = aufstellung(state).zeilen.find((x) => x.art.id === 'einkommensteuer');
  expect(ek.reformen).toEqual([{ quelle: 'Einfaches Steuerrecht mit Stufentarif', betrag: -12000000 }]);
  expect(bereichStatus(state, weg('st_einfach').bereich).status).toBe('umsetzung');
  expect(laufendeKosten(wegBeschliessen(z, { wegId: 'r_kapital' }).state)).toBe(3000000);
});

test('Sperren: Folgeweg, Bundesrat, Haushalt, Revision kostet zusätzlich', () => {
  const z = regierung();
  expect(wegSperre(z, 'r_generationenkapital').grund).toContain('Aktienrente');
  // Union + SPD hat 24 von 35 Bundesratsstimmen
  expect(wegSperre(z, 'r_buerger').grund).toContain('Bundesrat');
  const v = wegBeschliessen(z, { wegId: 'r_kapital' }).state;
  const vor = wegVorschau({ ...v, aktionenImQuartal: 0 }, 'r_eintritt');
  expect(vor.revision.id).toBe('r_kapital');
  expect(vor.kapital).toBe(weg('r_eintritt').kapital + rw.revisionKapital);
  const nach = wegBeschliessen({ ...v, aktionenImQuartal: 0 }, { wegId: 'r_eintritt' });
  expect(nach.state.reformwege.r_kapital).toBeUndefined();
  expect(nach.ereignisse.some((e) => e.includes('Kurswechsel'))).toBe(true);
  expect(wegSperre({ ...z, kapital: 3 }, 'a_flex').grund).toContain('Kapital');
});

test('Umsetzung: nach der Dauer Erfolg oder Scheitern, Langwirkung und Trends, Richtungsprofil', () => {
  const z = regierung();
  const b = wegBeschliessen(z, { wegId: 'w_bauen' }).state;
  expect(richtungsprofil(b).wirtschaft).toBeCloseTo((AUSRICHTUNGEN.marktliberal.vektor.wirtschaft * 1) / 3, 2);
  const fertig = { ...b, runde: 10 };
  const laeufe = Array.from({ length: 40 }, (_, i) => reformwegeQuartal({ ...fertig, rngZustand: i * 13 + 1 }).state);
  const ok = laeufe.filter((s) => s.reformwege.w_bauen.status === 'beschlossen');
  expect(ok.length).toBeGreaterThan(25);
  expect(laeufe.some((s) => s.reformwege.w_bauen.status === 'gescheitert')).toBe(true);
  // Erfolg wird belohnt wie bei Lösungen
  expect(ok[0].anteile.union).toBeGreaterThan(fertig.anteile.union);
  expect(ok[0].probleme.wohnungsnot.wert).toBe(Math.round((fertig.probleme.wohnungsnot.wert - 12) * 10) / 10);
  const p = probleme.find((x) => x.id === 'wohnungsnot');
  expect(ursachen(ok[0], p).find((u) => u.text.includes('Bauen erleichtern')).beitrag).toBe(-0.15);
});

test('Richtungsprofil wirkt: Partner mit großem Abstand verlieren, Kanzlerpartei gewinnt bei passendem Kurs', () => {
  const z = regierung({ reformwege: { a_flex: { status: 'beschlossen', fertig: 0 }, st_einfach: { status: 'beschlossen', fertig: 0 }, e_markt: { status: 'beschlossen', fertig: 0 } } });
  const p = profilWirkung(z);
  expect(p.wirkung.wachstum).toBeGreaterThan(0);
  expect(p.umfrage.union).toBeGreaterThan(-1);
  expect(profilWirkung(regierung()).umfrage).toEqual({});
});

test('Migration 12 → 13: leere Reformwege', () => {
  const { reformwege, ...rest } = neuesSpiel('spd', 3);
  expect(laden(JSON.stringify({ ...rest, version: 12 })).reformwege).toEqual({});
});
