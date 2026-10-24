import { parteien } from '../data/parteien.js';
import { achsen } from '../data/kennzahlen.js';

// Positionen auf den Spielachsen (−2 … +2), umgerechnet aus den CHES-Skalen (parteien.js):
// wirtschaft + = marktliberal, gesellschaft + = konservativ, oekologie + = ökologisch, eu + = EU-orientiert
const begrenzt = (x) => Math.max(-2, Math.min(2, x));
export function chesAufAchsen(c) {
  return {
    wirtschaft: begrenzt((c.lrecon - 5) / 2.5),
    gesellschaft: begrenzt((c.galtan - 5) / 2.5),
    oekologie: begrenzt((5 - c.umwelt) / 2.5),
    eu: begrenzt((c.eu - 4) / 1.5),
  };
}

export const parteiPosition = (id) => {
  const p = parteien.find((x) => x.id === id);
  return p?.ches ? chesAufAchsen(p.ches) : null;
};

// Richtungsprofil des Landes aus den beschlossenen Reformwegen (System 1, Schritt 4). Ohne Reformwege neutral.
// wegAusrichtung: Funktion wegId → Ausrichtung; wird von reformwege.js gesetzt, damit profil.js keine Inhalte importiert.
let wegAusrichtung = () => null;
export const setzeWegAusrichtung = (fn) => (wegAusrichtung = fn);
export function richtungsprofil(zustand) {
  const leer = Object.fromEntries(achsen.map((a) => [a.id, 0]));
  const wege = Object.values(zustand.reformwege ?? {}).filter((b) => b.status === 'beschlossen' || b.status === 'umsetzung').map((b) => wegAusrichtung(b.weg)).filter(Boolean);
  if (!wege.length) return leer;
  // Mittel über alle Wege, gedämpft bei wenigen Wegen (ein einzelner Weg prägt das Land noch nicht ganz)
  const daempfung = wege.length / (wege.length + 2);
  return Object.fromEntries(achsen.map((a) => [a.id, Math.round((wege.reduce((s, w) => s + (w[a.id] ?? 0), 0) / wege.length) * daempfung * 100) / 100]));
}

// Abstand zweier Positionen: Mittel der Beträge je Achse (0 = gleich, 4 = maximal entgegengesetzt).
// Achsen, die eine Seite nicht berührt (Wert fehlt), zählen nicht.
export function abstand(a, b) {
  const ids = achsen.map((x) => x.id).filter((id) => a[id] !== undefined && b[id] !== undefined);
  return ids.length ? ids.reduce((s, id) => s + Math.abs(a[id] - b[id]), 0) / ids.length : 0;
}
