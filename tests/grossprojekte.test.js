import { test, expect } from 'vitest';
import { neuesSpiel, laden, ZUSTAND_VERSION } from '../src/engine/state.js';
import { projektStarten, grossprojekteMonat, baukosten, projektTrends, uebernahmenAnlegen, projektEntscheiden, laufende } from '../src/engine/grossprojekte.js';
import { loesungStarten, loesung } from '../src/engine/probleme.js';
import { laufendeKosten } from '../src/engine/haushalt.js';
import { grossprojekte } from '../src/data/grossprojekte.js';
import { config } from '../src/data/config.js';
import { ministerien } from '../src/data/ministerien.js';

const gc = config.grossprojekte;
const D = grossprojekte[0];
const imAmt = (stufe = 3) => ({
  ...neuesSpiel('spd', 1, stufe), phase: 'regierung', sitze: { spd: 400 }, kanzlerParteiId: 'spd', koalition: { partner: [], startAnteile: {} },
  kabinett: { anspruch: {}, verteilung: Object.fromEntries(ministerien.map((m) => [m.id, 'spd'])) }, kapital: 80, jahr: 2027, monat: 3,
  loesungen: { schiene1: { status: 'erfolg', fertig: 0 } }, // Deutschlandtakt braucht die Netzsanierung
});
const mitKonfig = (werte, f) => {
  const alt = { ...gc };
  Object.assign(gc, werte);
  try { return f(); } finally { Object.assign(gc, alt); }
};

test('Start ab Stufe 3 durch den Ansatz; Baukosten im Bundeshaushalt', () => {
  expect(loesungStarten(imAmt(2), { loesungId: D.startDurch }).state.grossprojekte).toEqual([]);
  const r = loesungStarten(imAmt(), { loesungId: D.startDurch });
  expect(r.state.grossprojekte).toMatchObject([{ id: D.id, status: 'laufend', erreicht: 0, kostenFaktor: 1, traeger: 'spd' }]);
  expect(r.ereignisse.join(' ')).toContain('Großprojekt gestartet');
  expect(baukosten(r.state)).toBe(D.baukostenJeJahr);
  expect(laufendeKosten(r.state) - laufendeKosten(imAmt())).toBe(D.baukostenJeJahr + loesung(D.startDurch).kosten);
});

test('höchstens config.grossprojekte.max laufen gleichzeitig', () => {
  mitKonfig({ max: 1 }, () => {
    const z = { ...imAmt(), grossprojekte: [{ id: grossprojekte[1].id, start: 0, status: 'laufend', erreicht: 0, kostenFaktor: 1, verzoegerung: 0, traeger: 'spd', ausschuss: false, uebernahme: null }] };
    const r = projektStarten(z, D.startDurch);
    expect(laufende(r.state)).toHaveLength(1);
    expect(r.ereignisse[0]).toContain('startet nicht');
  });
});

test('Meilenstein: dauerhafte Wirkung; Kostensteigerung; ab 30 % über Plan Untersuchungsausschuss', () => {
  const z = projektStarten(imAmt(), D.startDurch).state;
  const start = z.grossprojekte[0].start;
  const vorher = grossprojekteMonat(z, start + D.meilensteine[0].monate - 1).state;
  expect(vorher.grossprojekte[0].erreicht).toBe(0);
  mitKonfig({ kostensteigerungChance: 1 }, () => {
    let s = grossprojekteMonat(z, start + D.meilensteine[0].monate).state;
    expect(s.grossprojekte[0].erreicht).toBe(1);
    expect(s.grossprojekte[0].kostenFaktor).toBe(1 + gc.kostensteigerung);
    const pid = Object.keys(D.meilensteine[0].wirkung.probleme)[0];
    expect(projektTrends(s, pid)[0].beitrag).toBe(D.meilensteine[0].wirkung.probleme[pid]);
    expect(s.grossprojekte[0].ausschuss).toBe(false);
    const r = grossprojekteMonat(s, start + D.meilensteine[1].monate);
    s = r.state;
    expect(s.grossprojekte[0].ausschuss).toBe(true);
    expect(r.ereignisse.join(' ')).toContain('Untersuchungsausschuss');
    expect(s.anteile.spd).toBeLessThan(z.anteile.spd);
    expect(s.kapital).toBe(z.kapital - gc.ausschussKapital);
  });
});

test('nach dem letzten Meilenstein fertig: keine Baukosten, Wirkung bleibt', () => {
  const z = projektStarten(imAmt(), D.startDurch).state;
  const s = grossprojekteMonat(z, z.grossprojekte[0].start + D.meilensteine.at(-1).monate).state;
  expect(s.grossprojekte[0]).toMatchObject({ status: 'fertig', erreicht: D.meilensteine.length });
  expect(baukosten(s)).toBe(0);
  expect(projektTrends(s, 'infrastruktur')[0].beitrag).toBeLessThan(0);
});

test('Übernahme durch eine neue Regierung: weiterführen, umbauen (¼ billiger, 1 Jahr später) oder stoppen', () => {
  const fremd = { ...projektStarten(imAmt(), D.startDurch).state };
  fremd.grossprojekte = fremd.grossprojekte.map((p) => ({ ...p, traeger: 'union' }));
  const z = uebernahmenAnlegen(fremd);
  expect(z.grossprojekte[0].uebernahme).toBe('offen');
  const u = projektEntscheiden(z, { projektId: D.id, wahl: 'umbauen' }).state.grossprojekte[0];
  expect(u).toMatchObject({ uebernahme: null, kostenFaktor: gc.umbauKostenFaktor, verzoegerung: gc.umbauVerzoegerungMonate, traeger: 'spd' });
  const s = projektEntscheiden(z, { projektId: D.id, wahl: 'stoppen' }).state;
  expect(s.grossprojekte[0].status).toBe('gestoppt');
  expect(baukosten(s)).toBe(0);
  expect(projektEntscheiden(z, { projektId: D.id, wahl: 'weiterfuehren' }).state.grossprojekte[0].uebernahme).toBeNull();
  expect(() => projektEntscheiden(s, { projektId: D.id, wahl: 'stoppen' })).toThrow();
  // eigenes Projekt: keine Entscheidung nötig
  expect(uebernahmenAnlegen(projektStarten(imAmt(), D.startDurch).state).grossprojekte[0].uebernahme).toBeNull();
});

test('Migration 29 → 30', () => {
  const { grossprojekte: _g, ...alt } = neuesSpiel('union', 3);
  const z = laden(JSON.stringify({ ...alt, version: 29 }));
  expect(z.version).toBe(ZUSTAND_VERSION);
  expect(z.grossprojekte).toEqual([]);
});
