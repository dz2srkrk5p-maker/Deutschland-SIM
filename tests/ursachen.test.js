import { test, expect } from 'vitest';
import { neuesSpiel, laden, ZUSTAND_VERSION, zurueckInDenWahlkampf } from '../src/engine/state.js';
import { ursacheVon, ergaenzungFaktor, wertverlustFaktor, anpassungsgesetz, anpassungSperre, geldleistungen } from '../src/engine/ursachen.js';
import { generationenMonat, stammbaum } from '../src/engine/generationen.js';
import { wegTrends, wegKosten } from '../src/engine/reformwege.js';
import { problemListe, problemeMonat } from '../src/engine/probleme.js';
import { ursachen } from '../src/data/ursachen.js';
import { generationen } from '../src/data/generationen.js';
import { bereiche } from '../src/data/reformwege.js';
import { probleme } from '../src/data/probleme.js';
import { epochen } from '../src/data/epochen.js';
import { config } from '../src/data/config.js';
import { ministerien } from '../src/data/ministerien.js';

const wv = config.wertverlust;
const imAmt = (stufe = 2) => ({
  ...neuesSpiel('spd', 1, stufe), phase: 'regierung', sitze: { spd: 400 }, kanzlerParteiId: 'spd', koalition: { partner: [], startAnteile: {} },
  kabinett: { anspruch: {}, verteilung: Object.fromEntries(ministerien.map((m) => [m.id, 'spd'])) }, runde: 100, kapital: 50,
});

test('Daten: jeder Ansatz hat genau eine bekannte Ursache', () => {
  const ids = [...bereiche.flatMap((b) => b.wege.map((w) => w.id)), ...[...probleme, ...epochen.flatMap((e) => e.probleme), ...generationen.map((g) => g.nach)].flatMap((p) => p.loesungen.map((l) => l.id))];
  for (const id of ids) expect(config.ursachen.arten, id).toContain(ursachen[id]);
  expect(Object.keys(ursachen).sort()).toEqual([...ids].sort());
});

test('Ergänzung: zweiter Ansatz mit derselben Ursache gegen dasselbe Problem wirkt halb, andere Ursache voll; nicht auf Stufe 1', () => {
  // rentenluecke: r_kapital (geld) und r_umlage (geld) und r_eintritt (regeln)
  const z = { ...imAmt(), reformwege: { r_kapital: { status: 'beschlossen', fertig: 10 } } };
  expect(ergaenzungFaktor(z, 'rentenluecke', 'r_umlage')).toBe(config.ursachen.gleicheUrsacheFaktor);
  expect(ergaenzungFaktor(z, 'rentenluecke', 'r_eintritt')).toBe(1);
  expect(ergaenzungFaktor(z, 'rentenluecke', 'r_kapital')).toBe(1); // der erste bleibt voll
  const beide = { ...z, reformwege: { ...z.reformwege, r_umlage: { status: 'beschlossen', fertig: 20 } } };
  const t = wegTrends(beide, 'rentenluecke');
  const umlage = t.find((x) => x.text.includes('Umlage'));
  expect(umlage.text).toContain('halbe Wirkung');
  expect(ergaenzungFaktor({ ...z, stufe: 1 }, 'rentenluecke', 'r_umlage')).toBe(1);
  expect(ursacheVon('r_umlage')).toBe('geld');
});

test('Wertverlust: Geldleistung verliert ab dem fünften Jahr 3 % je Jahr; Preiskopplung und Anpassungsgesetz verhindern es', () => {
  const s = (alter, extra = {}) => ({ ...imAmt(), reformwege: { r_umlage: { status: 'beschlossen', fertig: 100 - alter, ...extra } } });
  expect(wertverlustFaktor(s(4 * 12 - 1), 'r_umlage')).toBe(1);
  expect(wertverlustFaktor(s(4 * 12), 'r_umlage')).toBe(1 - wv.jeJahr);
  expect(wertverlustFaktor(s(6 * 12), 'r_umlage')).toBe(1 - 3 * wv.jeJahr);
  expect(wertverlustFaktor(s(6 * 12, { preisgekoppelt: true }), 'r_umlage')).toBe(1);
  expect(wertverlustFaktor({ ...s(6 * 12), stufe: 1 }, 'r_umlage')).toBe(1);
  expect(wertverlustFaktor({ ...imAmt(), reformwege: { r_eintritt: { status: 'beschlossen', fertig: 0 } } }, 'r_eintritt')).toBe(1); // Regeln veralten nicht
  const r = anpassungsgesetz(s(6 * 12));
  expect(wertverlustFaktor(r.state, 'r_umlage')).toBe(1);
  expect(r.state.kapital).toBe(50 - wv.anpassungKapital);
  expect(anpassungSperre({ ...r.state, aktionenImMonat: 0 })).toBe('nur einmal je Legislatur');
  expect(zurueckInDenWahlkampf(r.state).anpassungen).toBe(0);
  // Preiskopplung kostet mehr
  expect(wegKosten(s(0, { preisgekoppelt: true }))).toBeCloseTo(wegKosten(s(0)) * (1 + wv.preiskopplungAufschlag), 6);
  expect(geldleistungen(s(6 * 12))[0]).toMatchObject({ id: 'r_umlage', preisgekoppelt: false });
});

test('Generationen: altes Problem lange ruhig → neue Generation löst ab; Stammbaum; alte Gesetze helfen halb', () => {
  const g = generationen[0];
  const ruhig = Array(config.generationen.ruhigMonate).fill(config.generationen.ruhigUnter - 1);
  let z = { ...imAmt(), probleme: { ...imAmt().probleme, [g.von]: { wert: 20, verlauf: ruhig } }, reformwege: { v_wehrpflicht: { status: 'beschlossen', fertig: 0 } } };
  expect(generationenMonat({ ...z, stufe: 1 }, 5).state.probleme[g.nach.id]).toBeUndefined();
  const r = generationenMonat(z, 5);
  z = r.state;
  expect(z.probleme[g.von].abgeloest).toBe(g.nach.id);
  expect(z.probleme[g.nach.id].wert).toBe(g.nach.start);
  expect(problemListe(z).map((e) => e.problem.id)).not.toContain(g.von);
  expect(problemListe(z).map((e) => e.problem.id)).toContain(g.nach.id);
  expect(stammbaum(z, g.nach.id).map((x) => x.id)).toEqual([g.von, g.nach.id]);
  const halb = wegTrends(z, g.nach.id).find((t) => t.text.includes('Wehrpflicht'));
  expect(halb.text).toContain('50 %');
  // ruhendes Problem bleibt im Monatsschritt unverändert
  const m = problemeMonat(z).state;
  expect(m.probleme[g.von]).toEqual(z.probleme[g.von]);
  // zu kurz ruhig: keine Ablösung
  const kurz = { ...imAmt(), probleme: { ...imAmt().probleme, [g.von]: { wert: 20, verlauf: [50, ...ruhig.slice(1)] } } };
  expect(generationenMonat(kurz, 5).state.generationen).toEqual([]);
});

test('Migration 27 → 28', () => {
  const { generationen: _g, anpassungen: _a, ...alt } = neuesSpiel('union', 3);
  const z = laden(JSON.stringify({ ...alt, version: 27 }));
  expect(z.version).toBe(ZUSTAND_VERSION);
  expect(z).toMatchObject({ generationen: [], anpassungen: 0 });
});
