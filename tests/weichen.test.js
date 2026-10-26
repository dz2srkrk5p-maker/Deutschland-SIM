import { test, expect } from 'vitest';
import { neuesSpiel, laden, ZUSTAND_VERSION } from '../src/engine/state.js';
import { epochenMonat, zeitpunkt } from '../src/engine/epochen.js';
import { angebot, wegWaehlen, kurswechsel, kurswechselSperre, zweiterWeg, zweiterWegSperre, fortschritt, passenderWeg, schwerpunktFaktor, schwerpunktKostenFaktor, epochenErgebnis } from '../src/engine/weichen.js';
import { loesungKapital } from '../src/engine/probleme.js';
import { weg, wegVorschau } from '../src/engine/reformwege.js';
import { epochen } from '../src/data/epochen.js';
import { config } from '../src/data/config.js';
import { ministerien } from '../src/data/ministerien.js';

const ec = config.epochen;
const E = epochen[0];
// eigene Regierung (SPD) im Januar des ersten Epochenjahres, Epoche hat gerade begonnen
function imAmt(stufe = 2, seit = null) {
  const verteilung = Object.fromEntries(ministerien.map((m) => [m.id, 'spd']));
  const basis = { ...neuesSpiel('spd', 1, stufe), phase: 'regierung', sitze: { spd: 400, union: 230 }, kanzlerParteiId: 'spd',
    koalition: { partner: [], startAnteile: {} }, kabinett: { anspruch: { spd: 16 }, verteilung }, jahr: ec.ersteEpocheJahr - 1, monat: 12, regierungSeit: seit };
  const r = epochenMonat(basis, ec.ersteEpocheJahr, 1);
  return { ...r.state, jahr: ec.ersteEpocheJahr, monat: 1 };
}

test('Angebot: Stufe 1 zwei Wege, sonst drei', () => {
  expect(angebot(imAmt(1), E.id)).toHaveLength(2);
  expect(angebot(imAmt(2), E.id)).toHaveLength(3);
});

test('Weg wählen: nur einmal, nur aus dem Angebot; Basis und Fortschritt der Aufgabe', () => {
  const z = imAmt();
  expect(() => wegWaehlen(z, { epocheId: E.id, wegId: 'gibtsnicht' })).toThrow();
  const r = wegWaehlen(z, { epocheId: E.id, wegId: E.wege[1].id });
  const a = r.state.epochen.aktiv[0];
  expect(a.wege).toEqual([E.wege[1].id]);
  expect(() => wegWaehlen(r.state, { epocheId: E.id, wegId: E.wege[0].id })).toThrow();
  const p = E.wege[1].aufgabe.problem;
  expect(a.basis[p]).toBe(E.probleme.find((x) => x.id === p).start);
  // Halbe Strecke zum Ziel = 50 %
  const halb = { ...r.state, probleme: { ...r.state.probleme, [p]: { wert: (a.basis[p] + E.wege[1].aufgabe.ziel) / 2, verlauf: [a.basis[p]] } } };
  expect(fortschritt(halb, a, E.wege[1].id).anteil).toBe(0.5);
});

test('Prognose bei diesem Tempo: sinkt das Problem je Monat um 1, wird es bis zum Ende fortgeschrieben', () => {
  const z = wegWaehlen(imAmt(), { epocheId: E.id, wegId: E.wege[0].id }).state;
  const a = z.epochen.aktiv[0];
  const p = E.wege[0].aufgabe.problem;
  const verlauf = Array.from({ length: 13 }, (_, i) => 45 - i);
  const f = fortschritt({ ...z, probleme: { ...z.probleme, [p]: { wert: 33, verlauf } } }, a, E.wege[0].id);
  expect(f.wertEnde).toBe(0); // 33 − 1 × 180 Monate, begrenzt auf 0
  expect(f.prognose).toBe(1);
});

test('Aufschub: nach drei Monaten nimmt die eigene Partei den passenden Weg; in der Opposition sofort die Regierung', () => {
  let z = imAmt();
  for (let m = 2; m <= 1 + ec.aufschubMonate; m++) z = { ...epochenMonat(z, ec.ersteEpocheJahr, m).state, monat: m };
  expect(z.epochen.aktiv[0].wege).toEqual([passenderWeg(z, E.id, 'spd').id]);
  const opp = { ...imAmt(), phase: 'opposition', kanzlerParteiId: 'union' };
  const r = epochenMonat(opp, ec.ersteEpocheJahr, 2);
  expect(r.state.epochen.aktiv[0].wege).toEqual([passenderWeg(opp, E.id, 'union').id]);
  expect(r.ereignisse.join(' ')).toContain('Die Regierung wählt');
});

test('Kurswechsel: erst ab Stufe 3, einmal je Epoche, kostet Kapital und Umfrage; neue Regierung im ersten Jahr kostenlos', () => {
  const zwei = wegWaehlen(imAmt(2), { epocheId: E.id, wegId: E.wege[0].id }).state;
  expect(kurswechselSperre(zwei, E.id)).toBe('erst ab Stufe 3');
  const z = wegWaehlen(imAmt(3), { epocheId: E.id, wegId: E.wege[0].id }).state;
  const r = kurswechsel(z, { epocheId: E.id, wegId: E.wege[1].id });
  expect(r.state.epochen.aktiv[0].wege).toEqual([E.wege[1].id]);
  expect(r.state.kapital).toBe(z.kapital - ec.kurswechselKapital);
  expect(r.state.anteile.spd).toBeLessThan(z.anteile.spd);
  expect(kurswechselSperre(r.state, E.id)).toBe('nur einmal je Epoche');
  // neue Regierung: kostenlos, zählt nicht
  const neu = wegWaehlen(imAmt(3, zeitpunkt(ec.ersteEpocheJahr, 1)), { epocheId: E.id, wegId: E.wege[0].id }).state;
  const f = kurswechsel(neu, { epocheId: E.id, wegId: E.wege[2].id });
  expect(f.state.kapital).toBe(neu.kapital);
  expect(f.state.epochen.aktiv[0].kurswechsel).toBe(0);
});

test('Zweiter Weg nur auf Stufe 4; Schwerpunkt-Ansätze beider Wege kosten das 1,5-Fache, wirken 10 % stärker', () => {
  expect(zweiterWegSperre(wegWaehlen(imAmt(3), { epocheId: E.id, wegId: E.wege[0].id }).state, E.id)).toBe('nur auf Stufe 4');
  const z = wegWaehlen(imAmt(4), { epocheId: E.id, wegId: E.wege[0].id }).state;
  const ansatz = E.wege[1].schwerpunkt[0];
  expect(schwerpunktFaktor(z, ansatz)).toBe(1);
  expect(schwerpunktFaktor(z, E.wege[0].schwerpunkt[0])).toBe(1 + ec.schwerpunktBonus);
  expect(schwerpunktKostenFaktor(z, E.wege[0].schwerpunkt[0])).toBe(1);
  const r = zweiterWeg(z, { epocheId: E.id, wegId: E.wege[1].id });
  expect(r.state.epochen.aktiv[0].wege).toHaveLength(2);
  expect(schwerpunktKostenFaktor(r.state, ansatz)).toBe(ec.zweiterWegKostenFaktor);
  expect(zweiterWegSperre(r.state, E.id)).toBe('schon zwei Wege');
  // Reformweg im Schwerpunkt: Kapital × 1,5; Lösung außerhalb der Schwerpunkte unverändert
  const w = weg(ansatz);
  expect(wegVorschau(r.state, ansatz).kapital - wegVorschau(z, ansatz).kapital).toBe(Math.round(w.kapital * 1.5) - w.kapital);
  expect(loesungKapital(r.state, { id: 'fk_ausbildung', kapital: 8 })).toBe(8);
});

test('Epochenende: gelungen → Rückenwind (nach Kurswechsel halb), verfehlt → Hypothek; nächste Epoche startet leichter', () => {
  const z = wegWaehlen(imAmt(3), { epocheId: E.id, wegId: E.wege[0].id }).state;
  const a = z.epochen.aktiv[0];
  const p = E.wege[0].aufgabe.problem;
  const gut = { ...z, probleme: { ...z.probleme, [p]: { wert: 10, verlauf: [10] } } };
  expect(epochenErgebnis(gut, a)).toMatchObject({ gelungen: true, faktor: ec.rueckenwindStartFaktor });
  expect(epochenErgebnis(gut, { ...a, kurswechsel: 1 }).faktor).toBe(1 - (1 - ec.rueckenwindStartFaktor) / 2);
  expect(epochenErgebnis(z, a)).toMatchObject({ gelungen: false, faktor: ec.hypothekStartFaktor });
  // Ende und nächster Beginn mit Rückenwind
  const ende = { ...gut, epochen: { ...gut.epochen, aktiv: [{ ...a, ende: zeitpunkt(2030, 1) }], naechste: zeitpunkt(2030, 1) } };
  const r = epochenMonat(ende, 2030, 1);
  expect(r.state.epochen.vorbei[0]).toMatchObject({ id: E.id, gelungen: true });
  const zweite = epochen[1];
  expect(r.state.epochen.aktiv[0]).toMatchObject({ id: zweite.id, startFaktor: ec.rueckenwindStartFaktor });
  expect(r.state.probleme[zweite.probleme[0].id].wert).toBe(Math.round(zweite.probleme[0].start * ec.rueckenwindStartFaktor * 100) / 100);
});

test('Migration 25 → 26: laufende Epochen bekommen Wege-Felder', () => {
  const z = imAmt();
  const { regierungSeit: _r, ...alt } = z;
  const a = { ...z.epochen.aktiv[0] };
  delete a.wege; delete a.basis; delete a.startFaktor; delete a.kurswechsel;
  const { folgen: _f, ...ep } = z.epochen;
  const m = laden(JSON.stringify({ ...alt, version: 25, epochen: { ...ep, aktiv: [a] } }));
  expect(m.version).toBe(ZUSTAND_VERSION);
  expect(m.epochen.aktiv[0]).toMatchObject({ wege: [], startFaktor: 1, kurswechsel: 0 });
  expect(m.epochen.folgen).toEqual([]);
  expect(m.regierungSeit).toBeNull();
});
