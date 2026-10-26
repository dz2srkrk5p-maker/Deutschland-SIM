// Generationen von Problemen (Epochen-Etappe 5, docs/epochen-spec.md): Liegt ein Problem config.generationen.ruhigMonate lang
// unter ruhigUnter (TODO-BALANCE), kehrt es in neuer Gestalt zurück (src/data/generationen.js). Die neue Generation löst die alte
// ab (das alte Problem ruht, Eintrag abgeloest); Gesetze gegen das alte Problem helfen zur Hälfte weiter (reformwege.js).
// Ab Stufe 2 (config.spielstufen: generationen).
import { config } from '../data/config.js';
import { generationen as genDaten } from '../data/generationen.js';
import { systemAn } from './spielstufe.js';

const gc = config.generationen;
const name = (z, id) => genDaten.find((g) => g.nach.id === id)?.nach.name ?? id;

// Ablösungen am Monatsende (jetzt = Zeitpunkt des neuen Monats)
export function generationenMonat(zustand, jetzt) {
  if (!systemAn(zustand, 'generationen')) return { state: zustand, ereignisse: [] };
  const ereignisse = [];
  let probleme = zustand.probleme;
  let liste = zustand.generationen ?? [];
  for (const g of genDaten) {
    const alt = probleme[g.von];
    if (!alt || alt.abgeloest || probleme[g.nach.id]) continue;
    const letzte = alt.verlauf.slice(-gc.ruhigMonate);
    if (letzte.length < gc.ruhigMonate || letzte.some((w) => w >= gc.ruhigUnter)) continue;
    probleme = { ...probleme, [g.von]: { ...alt, abgeloest: g.nach.id }, [g.nach.id]: { wert: g.nach.start, verlauf: [g.nach.start] } };
    liste = [...liste, { von: g.von, nach: g.nach.id, zeit: jetzt }];
    ereignisse.push(`Ein Problem kehrt in neuer Gestalt zurück: Aus dem gelösten Problem wird „${name(zustand, g.nach.id)}“. Gesetze gegen das alte Problem helfen zur Hälfte weiter.`);
  }
  return { state: { ...zustand, probleme, generationen: liste }, ereignisse };
}

// Stammbaum eines Problems: Kette der Vorgänger und Nachfolger [{ id, zeit }] (zeit = Ablösung durch den Nachfolger)
export function stammbaum(zustand, problemId) {
  const liste = zustand.generationen ?? [];
  let start = problemId;
  for (let v = liste.find((g) => g.nach === start); v; v = liste.find((g) => g.nach === start)) start = v.von;
  const kette = [];
  for (let id = start; id; ) {
    const n = liste.find((g) => g.von === id);
    kette.push({ id, abgeloest: n?.zeit ?? null });
    id = n?.nach;
  }
  return kette.length > 1 ? kette : [];
}

// Vorgänger, deren Gesetze zur Hälfte auf ein Problem weiterwirken
export const vorgaenger = (zustand, problemId) => (zustand.generationen ?? []).filter((g) => g.nach === problemId).map((g) => g.von);
