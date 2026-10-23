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

// Abstand zweier Positionen: Mittel der Beträge je Achse (0 = gleich, 4 = maximal entgegengesetzt).
// Achsen, die eine Seite nicht berührt (Wert fehlt), zählen nicht.
export function abstand(a, b) {
  const ids = achsen.map((x) => x.id).filter((id) => a[id] !== undefined && b[id] !== undefined);
  return ids.length ? ids.reduce((s, id) => s + Math.abs(a[id] - b[id]), 0) / ids.length : 0;
}
