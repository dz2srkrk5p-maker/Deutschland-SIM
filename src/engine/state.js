import { parteien } from '../data/parteien.js';
import { etats2026, steuern2026 } from '../data/haushalt.js';

// Erhöhen, sobald sich die Form des Zustands ändert; alte Spielstände werden dann abgelehnt.
export const ZUSTAND_VERSION = 1;

// Anfangszustand eines neuen Spiels. Weitere Felder (Sitze, Regierung, Haushalt …) kommen mit ihren Meilensteinen.
export function neuesSpiel(spielerParteiId, seed) {
  const partei = parteien.find((p) => p.id === spielerParteiId);
  if (!partei || partei.sonstige) throw new Error(`Unbekannte oder nicht spielbare Partei: ${spielerParteiId}`);
  if (!Number.isInteger(seed)) throw new Error('Seed muss eine ganze Zahl sein');

  return {
    version: ZUSTAND_VERSION,
    phase: 'wahlkampf',
    wahlkampfWoche: 1,
    spielerParteiId,
    anteile: Object.fromEntries(parteien.map((p) => [p.id, p.startanteil])),
    sitze: null, // erst nach der Wahl gesetzt: { parteiId: Sitze }
    abgelehnt: [], // Parteien, die in dieser Wahlperiode eine Koalition abgelehnt haben
    koalition: null, // { partner: [parteiId] } nach erfolgreicher Verhandlung
    kanzlerParteiId: null,
    kabinett: null, // { anspruch: { parteiId: Anzahl }, verteilung: { ministeriumId: parteiId } | null }
    // Haushalt in tausend Euro; gilt über Wahlperioden hinweg weiter, nur das Jahr beginnt neu
    haushalt: { jahr: 1, etats: { ...etats2026 }, steuern: steuern2026, neueSchuldenSeitStart: 0 },
    // für Sieg und Endbildschirm; besteWahl = bester Stimmanteil der Spielerpartei bei einer Wahl
    statistik: { jahreKanzler: 0, regierungenGebildet: 0, besteWahl: null },
    rngZustand: seed >>> 0,
  };
}

// Zurück in den Wahlkampf (Neuwahl oder Ende der Wahlperiode): alles aus der alten Wahlperiode zurücksetzen.
// Haushalt, Umfragen und Statistik bleiben.
export function zurueckInDenWahlkampf(zustand) {
  return {
    ...zustand,
    phase: 'wahlkampf',
    wahlkampfWoche: 1,
    sitze: null,
    abgelehnt: [],
    koalition: null,
    kanzlerParteiId: null,
    kabinett: null,
    haushalt: { ...zustand.haushalt, jahr: 1 },
  };
}

export function speichern(zustand) {
  return JSON.stringify(zustand);
}

// Spielstand aus Text laden. Wirft bei kaputtem oder veraltetem Spielstand, statt Unsinn weiterzuspielen.
export function laden(text) {
  const zustand = JSON.parse(text);
  if (zustand?.version !== ZUSTAND_VERSION) {
    throw new Error(`Spielstand-Version ${zustand?.version} passt nicht zu ${ZUSTAND_VERSION}`);
  }
  return zustand;
}
