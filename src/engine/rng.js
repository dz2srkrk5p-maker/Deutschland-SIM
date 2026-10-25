// Seed-fähiger Zufall (Mulberry32). Der Zustand des Generators ist eine Zahl und liegt
// im Spielzustand, damit Speichern/Laden und Tests denselben Zufall reproduzieren.

// Liefert eine Zufallszahl in [0, 1) und den nächsten Generatorzustand.
export function zufall(rngZustand) {
  const naechster = (rngZustand + 0x6d2b79f5) >>> 0;
  let t = naechster;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const wert = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { wert, rngZustand: naechster };
}
