import { parteien } from '../data/parteien.js';
import { etats2026, steuern2026 } from '../data/haushalt.js';
import { startProbleme } from './probleme.js';
import { wirkungSumme, wirtschaftWerte } from './wirtschaft.js';
import { kennzahlen, gruppen, startSchulden, startBip } from '../data/kennzahlen.js';
import { config } from '../data/config.js';
import { laenderStart } from './landtagswahlen.js';
import { kettenStart } from './krisenketten.js';

// Erhöhen, sobald sich die Form des Zustands ändert, und in MIGRATIONEN einen Schritt von der alten Version ergänzen.
export const ZUSTAND_VERSION = 19; // 2: wahlergebnis, wahlkampfStart (F05); 3: seed (F07); 4: wahlkampfSerie (F08); 5: verlauf (F09);
// 6: koalition.minderheit und koalition.fehlschlaege (F11); 7: quartal (F12);
// 8: probleme, reformen, reformImQuartal (F13); 9: offenesEreignis, ereignisseWahlperiode (F14);
// 10: land (Kennzahlen, Schulden, BIP), gruppen, kapital; 11: haushalt.einnahmen statt haushalt.steuern, land.preise;
// 12: Problem-Engine: probleme { id: { wert, verlauf } }, loesungen, runde, aktionenImQuartal, jahresWirkung (statt reformen, reformImQuartal);
// 13: reformwege { wegId: { status: umsetzung | beschlossen | gescheitert, fertig } } (System 1)
// 14: umfrageBilanz [{ zeit, posten: [{ ursache, partei, wert, rest? }] }] (Paket Klein, Feature 1)
// 15: land.zinsaufschlag (Anteil auf die Zinslast, Feature 2)
// 16: verfahren [{ typ, id, name, art, chance, stufen?, faellig }] (Verfassungsrisiko für Steuern, Feature 3)
// 17: laender { landId: { regierung, geschaeftsfuehrend, wahl: { jahr, quartal } } } (Landtagswahlen, Feature 5)
// 18: ketten { aktiv: [{ von, nach, staerke, faellig, tiefe }], zuletzt: { problemId: runde }, verlauf } (Krisenketten, Feature 8)
// 19: wirtschaftVerlauf [{ wachstum, inflation, arbeitslosigkeit, schuldenquote, gini }] je Haushaltsjahr, erster Eintrag = Start

// Neue Felder ab Version 10, auch für die Migration alter Spielstände
const landStart = () => ({ ...Object.fromEntries(kennzahlen.map((k) => [k.id, k.start])), schulden: startSchulden, bip: startBip, preise: 1, zinsaufschlag: 0 });
// Einnahmen (System 2): Stufen je Einnahmeart, aktive Ausgestaltungen; altFaktor überträgt Steueränderungen alter Spielstände
const einnahmenStart = (altFaktor = 1) => ({ stufen: {}, ausgestaltung: [], altFaktor });
const gruppenStart = () => Object.fromEntries(gruppen.map((g) => [g.id, 50]));

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
    haushalt: { jahr: 1, etats: { ...etats2026 }, einnahmen: einnahmenStart(), neueSchuldenSeitStart: 0 },
    // für Sieg und Endbildschirm; besteWahl = bester Stimmanteil der Spielerpartei bei einer Wahl
    quartal: 1, // Quartal im laufenden Regierungsjahr (F12); Haushalt im letzten
    // Probleme 0–100 mit Verlauf und gestartete Lösungen (System 3); gelten über Wahlperioden hinweg weiter
    probleme: startProbleme(),
    loesungen: {}, // { loesungId: { status: 'laufend' | 'erfolg' | 'gescheitert', fertig: Runde } }
    runde: 0, // gezählte Quartale in der Regierung (für Dauer von Lösungen und Reformen)
    aktionenImQuartal: 0, // gestartete Lösungen und Reformwege in diesem Quartal (Aufmerksamkeit)
    jahresWirkung: wirkungSumme(), // Wirkungen im laufenden Jahr, fließen in den nächsten Jahresschritt
    reformwege: {}, // gewählte Reformwege (System 1); gelten über Wahlperioden hinweg
    umfrageBilanz: [], // Ursachen der Umfrageänderungen der letzten Runden (Anzeige)
    verfahren: [], // anhängige Klagen gegen Steueränderungen (Feature 3)
    laender: laenderStart(), // Landesregierungen und nächste Landtagswahl je Land (Feature 5)
    ketten: kettenStart(), // Krisenketten: aktive Glieder, Abklingzeit, letzte Wirkungen (Feature 8)
    offenesEreignis: null, // Ereignis, auf das der Spieler noch reagieren muss (F14)
    ereignisseWahlperiode: [], // schon dagewesene Ereignisse dieser Wahlperiode
    land: landStart(), // Landeskennzahlen (data/kennzahlen.js), Schulden und BIP in Mrd. €
    wirtschaftVerlauf: [wirtschaftWerte(landStart())], // Kennzahlen je Haushaltsjahr (Anzeige), erster Eintrag = Start
    gruppen: gruppenStart(), // Zustimmung je Gruppe 0–100
    kapital: config.kapital.start, // politisches Kapital 0–100
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
    aktionenImQuartal: 0,
    ereignisseWahlperiode: [],
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

// Migrationen: je alter Version ein Schritt auf die nächste. Neue Felder bekommen ihre Startwerte, nichts geht verloren.
const MIGRATIONEN = {
  9: (z) => ({ ...z, version: 10, land: landStart(), gruppen: gruppenStart(), kapital: config.kapital.start }),
  10: (z) => {
    const { steuern, ...haushalt } = z.haushalt;
    return { ...z, version: 11, land: { preise: 1, ...z.land }, haushalt: { ...haushalt, einnahmen: einnahmenStart(steuern / steuern2026) } };
  },
  // F13-Probleme gehen in der Problem-Engine auf: Druck → Wert, beschlossene Reformen → erfolgreiche Lösungen (gleiche IDs)
  11: (z) => {
    const { reformen = [], reformImQuartal, ...rest } = z;
    const probleme = startProbleme();
    for (const [alt, neu] of [['wohnen', 'wohnungsnot'], ['pflege', 'pflegenotstand'], ['schiene', 'infrastruktur']]) {
      if (typeof z.probleme?.[alt] === 'number') probleme[neu] = { wert: z.probleme[alt], verlauf: [z.probleme[alt]] };
    }
    const loesungen = Object.fromEntries(reformen.map((id) => [id, { status: 'erfolg', fertig: 0 }]));
    return { ...rest, version: 12, probleme, loesungen, runde: 0, aktionenImQuartal: reformImQuartal ? 1 : 0, jahresWirkung: wirkungSumme() };
  },
  12: (z) => ({ ...z, version: 13, reformwege: {} }),
  13: (z) => ({ ...z, version: 14, umfrageBilanz: [] }),
  14: (z) => ({ ...z, version: 15, land: { ...z.land, zinsaufschlag: 0 } }),
  15: (z) => ({ ...z, version: 16, verfahren: [] }),
  16: (z) => ({ ...z, version: 17, laender: laenderStart() }),
  17: (z) => ({ ...z, version: 18, ketten: kettenStart() }),
  // Frühere Jahre sind nicht gespeichert: der Verlauf beginnt mit dem aktuellen Stand
  18: (z) => ({ ...z, version: 19, wirtschaftVerlauf: [wirtschaftWerte(z.land)] }),
};

// Spielstand aus Text laden, ältere Versionen werden schrittweise migriert. Wirft bei kaputtem oder zu altem Spielstand
// (vor Version 9), statt Unsinn weiterzuspielen.
export function laden(text) {
  let zustand = JSON.parse(text);
  while (zustand?.version in MIGRATIONEN) zustand = MIGRATIONEN[zustand.version](zustand);
  if (zustand?.version !== ZUSTAND_VERSION) {
    throw new Error(`Spielstand-Version ${zustand?.version} passt nicht zu ${ZUSTAND_VERSION}`);
  }
  return zustand;
}
