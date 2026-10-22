import { parteien } from '../data/parteien.js';
import { etats2026, steuern2026 } from '../data/haushalt.js';
import { probleme } from '../data/probleme.js';

// Erhöhen, sobald sich die Form des Zustands ändert; alte Spielstände werden dann abgelehnt.
export const ZUSTAND_VERSION = 8; // 2: wahlergebnis, wahlkampfStart (F05); 3: seed (F07); 4: wahlkampfSerie (F08); 5: verlauf (F09);
// 6: koalition.minderheit und koalition.fehlschlaege (F11); 7: quartal (F12);
// 8: probleme, reformen, reformImQuartal (F13)

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
    wahlkampfStart: partei.startanteil, // eigener Anteil vor Woche 1, für die Wahlkampfbilanz
    wahlkampfSerie: null, // { aktion, anzahl }: wie oft die letzte Aktion in Folge gewählt wurde (abnehmender Ertrag)
    // letzte Wahl der Partie: { anteile, vorher (Anteile der Wahl davor, bei der ersten Wahl 2025), wahlkampf (Bilanz) }
    wahlergebnis: null,
    // Umfrageverlauf der eigenen Partei: ein Eintrag je Aktion, die Anteile ändert; wahl: true bei der Bundestagswahl
    verlauf: [{ schritt: 0, anteil: partei.startanteil }],
    sitze: null, // erst nach der Wahl gesetzt: { parteiId: Sitze }
    abgelehnt: [], // Parteien, die in dieser Wahlperiode eine Koalition abgelehnt haben
    // { partner: [parteiId], startAnteile, minderheit, fehlschlaege } nach Regierungsbildung; minderheit ohne eigene Mehrheit
    koalition: null,
    kanzlerParteiId: null,
    kabinett: null, // { anspruch: { parteiId: Anzahl }, verteilung: { ministeriumId: parteiId } | null }
    // Haushalt in tausend Euro; gilt über Wahlperioden hinweg weiter, nur das Jahr beginnt neu
    haushalt: { jahr: 1, etats: { ...etats2026 }, steuern: steuern2026, neueSchuldenSeitStart: 0 },
    // für Sieg und Endbildschirm; besteWahl = bester Stimmanteil der Spielerpartei bei einer Wahl
    quartal: 1, // Quartal im laufenden Regierungsjahr (F12); Haushalt im letzten
    // Problemdruck 0–100 je Problem und beschlossene Reformen (F13); gelten über Wahlperioden hinweg weiter
    probleme: Object.fromEntries(probleme.map((p) => [p.id, p.startDruck])),
    reformen: [],
    reformImQuartal: false, // in diesem Quartal schon eine Reform eingebracht
    statistik: { jahreKanzler: 0, regierungenGebildet: 0, besteWahl: null },
    seed, // Start-Seed, bleibt unverändert: zum Teilen der Partie (F07)
    rngZustand: seed >>> 0,
  };
}

// Eintrag in den Umfrageverlauf anhängen (eigene Partei, aktueller Anteil). Von den Aktionen aufgerufen, die Anteile ändern.
export function mitVerlauf(zustand, wahl = false) {
  const schritt = zustand.verlauf.at(-1).schritt + 1;
  const eintrag = { schritt, anteil: zustand.anteile[zustand.spielerParteiId], ...(wahl && { wahl: true }) };
  return { ...zustand, verlauf: [...zustand.verlauf, eintrag] };
}

// Zurück in den Wahlkampf (Neuwahl oder Ende der Wahlperiode): alles aus der alten Wahlperiode zurücksetzen.
// Haushalt, Umfragen und Statistik bleiben.
export function zurueckInDenWahlkampf(zustand) {
  return {
    ...zustand,
    phase: 'wahlkampf',
    wahlkampfWoche: 1,
    wahlkampfStart: zustand.anteile[zustand.spielerParteiId],
    wahlkampfSerie: null,
    sitze: null,
    abgelehnt: [],
    koalition: null,
    kanzlerParteiId: null,
    kabinett: null,
    haushalt: { ...zustand.haushalt, jahr: 1 },
    quartal: 1,
    reformImQuartal: false,
  };
}

// Seed aus der Adresse (?seed=12345): ganze Zahl von 0 bis 2^32 − 1, sonst null (ungültig wird ignoriert)
export function seedAusAdresse(suche) {
  const text = new URLSearchParams(suche).get('seed');
  if (!text || !/^\d{1,10}$/.test(text)) return null;
  const seed = Number(text);
  return seed <= 0xffffffff ? seed : null;
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
