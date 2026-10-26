// Sozialbeiträge (Epochen-Etappe 6, docs/epochen-spec.md): Ansätze, die eine Sozialversicherung bezahlt, stehen nicht im
// Bundeshaushalt („über Beiträge“). Ihre jährlichen Kosten treiben das Problem „Steigende Sozialbeiträge“; Ansätze mit mehr
// Einzahlern (Bürgerversicherung) entlasten es. Zuordnung: src/data/sozialbeitraege.js.
import { config } from '../data/config.js';
import { ueberBeitraege, mehrEinzahler } from '../data/sozialbeitraege.js';
import { bereiche } from '../data/reformwege.js';
import { probleme } from '../data/probleme.js';
import { epochen } from '../data/epochen.js';
import { generationen } from '../data/generationen.js';
import { problemSozialbeitraege } from '../data/sozialbeitraege.js';

const sc = config.sozialbeitraege;
const r3 = (x) => Math.round(x * 1000) / 1000 + 0;
export const PROBLEM = problemSozialbeitraege.id;
const kostenVon = Object.fromEntries([
  ...bereiche.flatMap((b) => b.wege.map((w) => [w.id, w.kosten])),
  ...[...probleme, problemSozialbeitraege, ...epochen.flatMap((e) => e.probleme), ...generationen.map((g) => g.nach)].flatMap((p) => p.loesungen.map((l) => [l.id, l.kosten])),
]);

export const kasse = (ansatzId) => ueberBeitraege[ansatzId] ?? null;
const reformAktiv = (s) => s && (s.status === 'umsetzung' || s.status === 'beschlossen');
const loesungAktiv = (s) => s && s.status !== 'gescheitert';

// Geltende Ansätze, die über Beiträge laufen
export const beitragsAnsaetze = (zustand) => [
  ...Object.entries(zustand.reformwege ?? {}).filter(([id, s]) => kasse(id) && reformAktiv(s)).map(([id]) => id),
  ...Object.entries(zustand.loesungen ?? {}).filter(([id, s]) => kasse(id) && loesungAktiv(s)).map(([id]) => id),
];
// Jährliche Last über Beiträge (tausend €; Einsparungen der Kassen negativ)
export const beitragsLast = (zustand) => beitragsAnsaetze(zustand).reduce((s, id) => s + kostenVon[id], 0);

// Trends für „Steigende Sozialbeiträge“ je Monat (für die Problem-Engine)
export function beitragsTrends(zustand, problemId) {
  if (problemId !== PROBLEM) return [];
  const liste = [];
  const last = beitragsLast(zustand);
  if (last) liste.push({ text: `Kosten über Beiträge (${(last / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 1 })} Mrd. € je Jahr)`, beitrag: r3((last / 1e6) * sc.trendJeMrd) });
  const einzahler = beitragsAnsaetze(zustand).filter((id) => mehrEinzahler.includes(id) && zustand.reformwege?.[id]?.status === 'beschlossen');
  if (einzahler.length) liste.push({ text: `Mehr Einzahler (${einzahler.length} ${einzahler.length === 1 ? 'Gesetz' : 'Gesetze'})`, beitrag: r3(-einzahler.length * sc.entlastungJeAnsatz) });
  return liste;
}
