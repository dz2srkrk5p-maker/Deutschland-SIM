import { describe, it, expect } from 'vitest';
import { epochen } from '../src/data/epochen.js';
import { merkmale } from '../src/data/merkmale.js';
import { grossprojekte } from '../src/data/grossprojekte.js';
import { bereiche, AUSRICHTUNGEN } from '../src/data/reformwege.js';
import { probleme, kategorien } from '../src/data/probleme.js';
import { gruppen } from '../src/data/kennzahlen.js';
import { ministerien } from '../src/data/ministerien.js';
import { config } from '../src/data/config.js';

const wegIds = new Set(bereiche.flatMap((b) => b.wege.map((w) => w.id)));
const loesungIds = new Set(probleme.flatMap((p) => p.loesungen.map((l) => l.id)));
const ansatz = (id) => wegIds.has(id) || loesungIds.has(id);
const epochenProbleme = epochen.flatMap((e) => e.probleme);
const problemIds = new Set([...probleme.map((p) => p.id), ...epochenProbleme.map((p) => p.id)]);
const gruppenIds = new Set(gruppen.map((g) => g.id));
const merkmalIds = new Set(merkmale.map((m) => m.id));

const wirkungOk = (w) => {
  for (const id of Object.keys(w.gruppen ?? {})) expect(gruppenIds, id).toContain(id);
  for (const id of Object.keys(w.probleme ?? {})) expect(problemIds, id).toContain(id);
};

describe('Epochen-Daten (Etappe 1)', () => {
  it('Ids sind eindeutig, alle Inhalte sind als Platzhalter gekennzeichnet', () => {
    const ids = [...epochen.map((e) => e.id), ...epochen.flatMap((e) => e.wege.map((w) => w.id)), ...epochenProbleme.map((p) => p.id), ...merkmale.map((m) => m.id), ...grossprojekte.map((g) => g.id)];
    expect(new Set(ids).size).toBe(ids.length);
    for (const x of [...epochen, ...epochen.flatMap((e) => e.wege), ...epochenProbleme, ...merkmale, ...grossprojekte]) expect(x.platzhalter, x.id).toBe(true);
  });
  it('Epochenprobleme kollidieren nicht mit den 25 festen Problemen und haben deren Format', () => {
    for (const p of epochenProbleme) {
      expect(probleme.map((x) => x.id)).not.toContain(p.id);
      expect(kategorien).toContain(p.kategorie);
      expect(ministerien.map((m) => m.id)).toContain(p.ministerium);
      expect(p.monat).toBeGreaterThanOrEqual(0);
      expect(p.monat).toBeLessThanOrEqual(config.epochen.problemeVerteiltMonate);
      for (const t of p.treiber) if (t.problem) expect(problemIds).toContain(t.problem);
    }
  });
  it('jede Epoche hat Streitfrage und genug Wege für die höchste Stufe; Wege sind vollständig', () => {
    const maxWege = Math.max(...Object.values(config.spielstufen.stufen).map((s) => s.wegeJeWeiche));
    for (const e of epochen) {
      expect(e.streitfrage.text).toBeTruthy();
      expect(e.wege.length).toBeGreaterThanOrEqual(maxWege);
      for (const w of e.wege) {
        expect(Object.keys(AUSRICHTUNGEN)).toContain(w.ausrichtung);
        expect(problemIds).toContain(w.aufgabe.problem);
        expect(w.aufgabe.ziel).toBeGreaterThanOrEqual(0);
        wirkungOk(w.staerke);
        wirkungOk(w.schwaeche);
        for (const id of w.schwerpunkt) expect(ansatz(id), id).toBe(true);
        expect(merkmalIds).toContain(w.merkmal);
      }
    }
  });
  it('Neutralität: Wege einer Epoche haben verschiedene Ausrichtungen', () => {
    for (const e of epochen) expect(new Set(e.wege.map((w) => w.ausrichtung)).size).toBe(e.wege.length);
  });
  it('Merkmale: Verweise stimmen, jedes Merkmal hat tragende Gesetze', () => {
    for (const m of merkmale) {
      wirkungOk(m.staerke);
      wirkungOk(m.schwaeche);
      for (const id of m.staerke.ansaetze) expect(ansatz(id), id).toBe(true);
      for (const id of m.tragend) expect(wegIds, id).toContain(id);
      expect(m.tragend.length).toBeGreaterThan(0);
    }
  });
  it('Großprojekte: Start-Ansatz existiert, Meilensteine aufsteigend, Wirkung auf bekannte Probleme', () => {
    for (const g of grossprojekte) {
      expect(ansatz(g.startDurch), g.startDurch).toBe(true);
      expect(g.baukostenJeJahr).toBeGreaterThan(0);
      const monate = g.meilensteine.map((m) => m.monate);
      expect(monate).toEqual([...monate].sort((a, b) => a - b));
      for (const m of g.meilensteine) wirkungOk(m.wirkung);
    }
  });
  it('Konfig enthält die Zahlen der Spec', () => {
    expect(config.epochen).toMatchObject({ abstandJahre: 10, maxGleichzeitig: 2, schwerpunktBonus: 0.1, aufschubMonate: 3, kurswechselJeEpoche: 1, kurswechselRueckenwindFaktor: 0.5, kurswechselKostenlosMonate: 12, zweiterWegKostenFaktor: 1.5 });
    expect(config.merkmale).toMatchObject({ max: 6, aufbaugesetzeNoetig: 3, verblassenMonate: 24 });
    expect(config.generationen.altGesetzWirkung).toBe(0.5);
    expect(config.ursachen).toMatchObject({ arten: ['geld', 'regeln', 'angebot'], gleicheUrsacheFaktor: 0.5 });
    expect(config.wertverlust).toMatchObject({ abJahr: 5, jeJahr: 0.03, anpassungJeLegislatur: 1 });
    expect(config.grossprojekte).toMatchObject({ max: 2, untersuchungAbUeberPlan: 0.3, umbauKostenFaktor: 0.75, umbauVerzoegerungMonate: 12 });
    expect(config.bestaende.stufen).toEqual([40, 60, 70, 85]);
    expect(config.bevoelkerung).toMatchObject({ schrumpfendUnter: 80000000, schrumpfendJahre: 3, wachsendUeber: 84000000, wachsendBisJahr: 2060, spaltungAb: 70, altersgruppenVergleichJahr: 2029 });
    expect(config.problemObergrenze.aktivMax).toBe(26);
  });
});
