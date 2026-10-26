// Merkmale des Landes (Etappe 1, 2026-10-26). PLATZHALTER: Welche Merkmale es gibt, entscheidet der Nutzer
// (docs/epochen-spec.md). Je Platzhalter-Weg aus src/data/epochen.js ein Merkmal, neutral nach der Sache benannt.
//
// Felder je Merkmal:
//   staerke: { text, ansaetze: Ids (Reformwege oder Lösungen), die stärker wirken (config.merkmale.ansatzBonus),
//              gruppen: { gruppeId: Punkte }, probleme: { problemId: Punkte, negativ = bremst } }
//   schwaeche: { text, gruppen, probleme } wie oben, Vorzeichen umgekehrt gemeint (Nachteil)
//   tragend: Reformwege, die das Merkmal tragen; „drei passende Aufbaugesetze“ und Verblassen nach Aufhebung zählen diese
//   Punkte rechnet die Engine mit config.merkmale um (gruppenJePunkt, problemTrendJePunkt).

export const merkmale = [
  {
    id: 'eigenvorsorge', platzhalter: true, quelle: 'Spielwert', name: 'Kapitalgedeckte Vorsorge',
    staerke: { text: 'Private und betriebliche Vorsorge entlasten die Rentenkasse.', ansaetze: ['r_kapital', 'r_generationenkapital'], gruppen: { unternehmen: 1 }, probleme: { rentenluecke: -1 } },
    schwaeche: { text: 'Vorsorge hängt am Einkommen.', gruppen: { geringverdiener: -1 }, probleme: { soziale_spaltung: 1 } },
    tragend: ['r_kapital', 'r_generationenkapital'],
  },
  {
    id: 'starke_rente', platzhalter: true, quelle: 'Spielwert', name: 'Starke gesetzliche Rente',
    staerke: { text: 'Die Rente sichert den Lebensstandard.', ansaetze: ['r_umlage', 'r_mindestrente'], gruppen: { rentner: 1 }, probleme: { rentenluecke: -1 } },
    schwaeche: { text: 'Beiträge und Zuschüsse steigen.', gruppen: { unternehmen: -1 }, probleme: { staatsverschuldung: 1 } },
    tragend: ['r_umlage', 'r_mindestrente'],
  },
  {
    id: 'langes_erwerbsleben', platzhalter: true, quelle: 'Spielwert', name: 'Längeres Erwerbsleben',
    staerke: { text: 'Erfahrene Beschäftigte bleiben länger im Beruf.', ansaetze: ['r_eintritt'], gruppen: { unternehmen: 1 }, probleme: { fachkraefte: -1 } },
    schwaeche: { text: 'Für körperlich schwere Berufe ist der Weg lang.', gruppen: { arbeitnehmer: -1 }, probleme: { vertrauensverlust: 1 } },
    tragend: ['r_eintritt'],
  },
  {
    id: 'erneuerbares_land', platzhalter: true, quelle: 'Spielwert', name: 'Erneuerbares Energieland',
    staerke: { text: 'Wind, Sonne und Wasserstoff liefern den Großteil der Energie.', ansaetze: ['e_turbo', 'e_wasserstoff'], gruppen: { familien: 1 }, probleme: { klimafolgen: -1 } },
    schwaeche: { text: 'Flächen und Netze sind knapp.', gruppen: { landwirtschaft: -1 }, probleme: { infrastruktur: 1 } },
    tragend: ['e_turbo', 'e_wasserstoff', 'st_oeko'],
  },
  {
    id: 'eigene_energie', platzhalter: true, quelle: 'Spielwert', name: 'Eigene Energieversorgung',
    staerke: { text: 'Das Land deckt seinen Bedarf weitgehend selbst.', ansaetze: ['e_kern'], gruppen: { landwirtschaft: 1 }, probleme: { geopolitik: -1 } },
    schwaeche: { text: 'Teure Anlagen und weniger europäische Zusammenarbeit.', gruppen: { unternehmen: -1 }, probleme: { energiepreise: 1 } },
    tragend: ['e_kern'],
  },
  {
    id: 'starke_netze', platzhalter: true, quelle: 'Spielwert', name: 'Starke Netze',
    staerke: { text: 'Strom-, Wärme- und Datennetze sind ausgebaut.', ansaetze: ['e_netze', 'd_staat'], gruppen: { unternehmen: 1 }, probleme: { infrastruktur: -1 } },
    schwaeche: { text: 'Der Unterhalt kostet dauerhaft Geld.', gruppen: { familien: -1 }, probleme: { kommunalfinanzen: 1 } },
    tragend: ['e_netze', 'd_staat'],
  },
];
