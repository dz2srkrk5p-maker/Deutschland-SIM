// Ursachen, Ergänzung und Wertverlust (Epochen-Etappe 5, docs/epochen-spec.md). Ab Stufe 2 (config.spielstufen):
// - Jeder Ansatz packt eine Ursache an: Geld, Regeln oder Angebot (src/data/ursachen.js). Ansätze mit verschiedenen Ursachen
//   ergänzen sich; ein zweiter mit derselben Ursache gegen dasselbe Problem wirkt nur halb (config.ursachen.gleicheUrsacheFaktor).
// - Geldleistungen (Reformwege mit Ursache Geld; nur sie wirken dauerhaft) verlieren ohne Anpassung ab dem fünften Jahr jedes Jahr
//   3 Prozentpunkte Wirkung. Preiskopplung im Entwurf oder ein Anpassungsgesetz je Legislatur verhindern das.
import { config } from '../data/config.js';
import { ursachen as ursachenDaten } from '../data/ursachen.js';
import { bereiche } from '../data/reformwege.js';
import { probleme } from '../data/probleme.js';
import { epochen } from '../data/epochen.js';
import { generationen } from '../data/generationen.js';
import { systemAn } from './spielstufe.js';

const uc = config.ursachen;
const wv = config.wertverlust;
const r3 = (x) => Math.round(x * 1000) / 1000 + 0;
const wege = Object.fromEntries(bereiche.flatMap((b) => b.wege.map((w) => [w.id, w])));
const loesungProblem = Object.fromEntries([...probleme, ...epochen.flatMap((e) => e.probleme), ...generationen.map((g) => g.nach)]
  .flatMap((p) => p.loesungen.map((l) => [l.id, p.id])));

export const ursacheVon = (ansatzId) => ursachenDaten[ansatzId] ?? null;

// Wirksame Ansätze gegen ein Problem in der Reihenfolge, in der sie wirksam wurden (Reformweg beschlossen mit Wirkung auf das
// Problem, Lösung erfolgreich gegen das Problem)
export function wirksameAnsaetze(zustand, problemId) {
  const liste = [];
  for (const [id, s] of Object.entries(zustand.reformwege ?? {})) {
    const w = wege[id];
    if (s.status === 'beschlossen' && (w.lang?.trend?.[problemId] || w.lang?.probleme?.[problemId])) liste.push({ id, ursache: ursacheVon(id), seit: s.fertig ?? 0 });
  }
  for (const [id, s] of Object.entries(zustand.loesungen ?? {})) {
    if (s.status === 'erfolg' && loesungProblem[id] === problemId) liste.push({ id, ursache: ursacheVon(id), seit: s.fertig ?? 0 });
  }
  return liste.sort((a, b) => a.seit - b.seit || (a.id < b.id ? -1 : 1));
}

// Ergänzung: halbe Wirkung, wenn vorher schon ein Ansatz mit derselben Ursache gegen das Problem wirkt. Ist der Ansatz selbst
// noch nicht wirksam (Vorschau, Abschluss), zählen alle wirksamen.
export function ergaenzungFaktor(zustand, problemId, ansatzId) {
  if (!systemAn(zustand, 'ursachen')) return 1;
  const u = ursacheVon(ansatzId);
  if (!u) return 1;
  const liste = wirksameAnsaetze(zustand, problemId);
  const i = liste.findIndex((a) => a.id === ansatzId);
  const vorher = i === -1 ? liste : liste.slice(0, i);
  return vorher.some((a) => a.ursache === u) ? uc.gleicheUrsacheFaktor : 1;
}

// Wertverlust einer Geldleistung (Reformweg): volle Wirkung in den ersten abJahr − 1 Jahren seit der Umsetzung bzw. der letzten
// Anpassung, ab dem abJahr-ten Jahr je angefangenem Jahr jeJahr weniger (linear, nicht unter 0)
export function wertverlustFaktor(zustand, wegId) {
  const s = zustand.reformwege?.[wegId];
  if (!systemAn(zustand, 'wertverlust') || ursacheVon(wegId) !== 'geld' || !s || s.preisgekoppelt) return 1;
  const jahre = Math.floor((zustand.runde - (s.angepasst ?? s.fertig ?? 0)) / 12);
  // im angefangenen Jahr jahre + 1; ab dem Jahr abJahr je Jahr ein Abzug (im fünften Jahr der erste)
  return r3(Math.max(0, 1 - wv.jeJahr * Math.max(0, jahre + 1 - wv.abJahr + 1)));
}

// Geldleistungen, die ohne Anpassung an Wert verlieren (für die Anzeige und das Anpassungsgesetz)
export const geldleistungen = (zustand) => Object.entries(zustand.reformwege ?? {})
  .filter(([id, s]) => s.status === 'beschlossen' && ursacheVon(id) === 'geld')
  .map(([id, s]) => ({ id, weg: wege[id], preisgekoppelt: Boolean(s.preisgekoppelt), faktor: wertverlustFaktor(zustand, id) }));

// Warum das Anpassungsgesetz jetzt nicht geht, oder null
export function anpassungSperre(zustand) {
  if (!systemAn(zustand, 'wertverlust')) return 'erst ab Stufe 2';
  if (zustand.phase !== 'regierung') return zustand.phase === 'opposition' ? 'in der Opposition' : 'keine Regierung';
  if ((zustand.anpassungen ?? 0) >= wv.anpassungJeLegislatur) return 'nur einmal je Legislatur';
  if (!geldleistungen(zustand).some((g) => !g.preisgekoppelt)) return 'keine Geldleistung ohne Preiskopplung';
  if (zustand.offenesEreignis) return 'erst auf das Ereignis reagieren';
  if (zustand.monat === config.regierung.monateJeJahr) return 'im Haushaltsmonat nicht möglich';
  if (zustand.aktionenImMonat >= config.probleme.aktionenJeMonat) return `höchstens ${config.probleme.aktionenJeMonat} Vorhaben je Monat`;
  if (zustand.kapital < wv.anpassungKapital) return `zu wenig politisches Kapital (${wv.anpassungKapital} nötig)`;
  return null;
}

// Aktion: Anpassungsgesetz – frischt alle Geldleistungen auf (volle Wirkung, das Alter zählt neu)
export function anpassungsgesetz(zustand) {
  const sperre = anpassungSperre(zustand);
  if (sperre) throw new Error(`Anpassungsgesetz nicht möglich: ${sperre}`);
  const reformwege = { ...zustand.reformwege };
  const liste = geldleistungen(zustand).filter((g) => !g.preisgekoppelt);
  for (const g of liste) reformwege[g.id] = { ...reformwege[g.id], angepasst: zustand.runde };
  return {
    state: { ...zustand, reformwege, anpassungen: (zustand.anpassungen ?? 0) + 1, kapital: zustand.kapital - wv.anpassungKapital, aktionenImMonat: zustand.aktionenImMonat + 1 },
    ereignisse: [`Anpassungsgesetz beschlossen: ${liste.map((g) => `„${g.weg.name}“`).join(', ')} ${liste.length === 1 ? 'wirkt' : 'wirken'} wieder voll.`],
  };
}
