// Epochen (Etappe 1, 2026-10-26). PLATZHALTER: Welche Epochen, Wege, Aufgaben und Streitfragen es gibt, entscheidet der Nutzer
// (docs/epochen-spec.md). Bis dahin zwei kleine Beispiel-Epochen, damit die Engine (ab Etappe 2) laufen kann.
// Neutralität: Wege heißen nach den Ausrichtungen aus reformwege.js (AUSRICHTUNGEN), je Epoche Wege aus verschiedenen Lagern.
// Die Namen der beiden Epochen stammen aus den Beispielen der Spec.
//
// Felder je Epoche:
//   streitfrage: { text } – „macht eine Streitfrage laut“ (Titelseite, Reiter „Euer Land“)
//   probleme: epocheneigene Probleme im Format von src/data/probleme.js (mit Platzhalter-Lösungen); monat = Abstand zum Epochenstart,
//             höchstens config.epochen.problemeVerteiltMonate
//   wege: Reihenfolge = Angebot auf Stufe 1 (die ersten config.spielstufen.stufen[1].wegeJeWeiche Wege)
// Felder je Weg:
//   ausrichtung: Schlüssel aus AUSRICHTUNGEN (für „passt zum Programm“, automatische Wahl)
//   aufgabe: { text, problem, ziel } – gelingt, wenn das Problem am Ende der Epoche höchstens bei ziel steht;
//            Fortschritt = (Startwert − Wert) / (Startwert − ziel)
//   staerke, schwaeche: { text, gruppen: { gruppeId: Punkte je Jahr }, probleme: { problemId: Punkte } } (Punkte: config.merkmale)
//   schwerpunkt: Ansätze (Ids von Reformwegen oder Lösungen), die 10 % stärker wirken
//   merkmal: Id aus src/data/merkmale.js

export const epochen = [
  {
    id: 'verrentung', platzhalter: true, quelle: 'Spielwert', name: 'Die große Verrentung',
    text: 'Die geburtenstarken Jahrgänge gehen in Rente. Es fehlen Beitragszahler und Arbeitskräfte.',
    streitfrage: { text: 'Wer trägt die Kosten der Alterung: Beschäftigte, Rentner oder der Staat?' },
    probleme: [
      {
        id: 'rentenwelle', platzhalter: true, quelle: 'Spielwert', name: 'Rentenwelle', kategorie: 'Soziales', ministerium: 'arbeit', monat: 0, start: 45, trend: 0.3,
        text: 'Jedes Jahr gehen mehr Menschen in Rente, als Junge nachkommen.',
        treiber: [{ problem: 'demografie', ab: 40, gewicht: 0.2 }],
        folgen: { wachstum: -0.2, gruppen: { arbeitnehmer: -3, rentner: -3 } },
        loesungen: [
          { id: 'rw_uebergang', platzhalter: true, quelle: 'Spielwert', name: 'Gleitender Übergang in die Rente', text: 'Teilrente und Hinzuverdienst erleichtern.', ausrichtung: { wirtschaft: 0.5 }, kosten: 400000, dauer: 9, erfolg: 0.7, wirkung: 8, kapital: 8 },
          { id: 'rw_beitragszahler', platzhalter: true, quelle: 'Spielwert', name: 'Mehr Beitragszahler gewinnen', text: 'Erwerbstätigkeit von Eltern und Älteren fördern.', ausrichtung: { wirtschaft: -0.5 }, kosten: 900000, dauer: 12, erfolg: 0.65, wirkung: 10, kapital: 10 },
        ],
      },
    ],
    wege: [
      {
        id: 'verrentung_markt', platzhalter: true, ausrichtung: 'marktliberal', name: 'Marktliberaler Weg',
        aufgabe: { text: 'Die Rentenwelle bis zum Ende der Epoche auf höchstens 35 drücken.', problem: 'rentenwelle', ziel: 35 },
        staerke: { text: 'Mehr private Vorsorge entlastet die Rentenkasse.', gruppen: { unternehmen: 1 }, probleme: { rentenluecke: -1 } },
        schwaeche: { text: 'Geringverdiener können kaum vorsorgen.', gruppen: { geringverdiener: -1 }, probleme: { soziale_spaltung: 1 } },
        schwerpunkt: ['r_kapital', 'r_generationenkapital', 'a_flex'],
        merkmal: 'eigenvorsorge',
      },
      {
        id: 'verrentung_sozial', platzhalter: true, ausrichtung: 'sozialdemokratisch', name: 'Sozialdemokratischer Weg',
        aufgabe: { text: 'Die Rentenwelle bis zum Ende der Epoche auf höchstens 35 drücken.', problem: 'rentenwelle', ziel: 35 },
        staerke: { text: 'Die gesetzliche Rente bleibt verlässlich.', gruppen: { rentner: 1 }, probleme: { soziale_spaltung: -1 } },
        schwaeche: { text: 'Höhere Beiträge belasten Beschäftigte und Betriebe.', gruppen: { unternehmen: -1 }, probleme: { staatsverschuldung: 1 } },
        schwerpunkt: ['r_umlage', 'r_mindestrente', 'a_mindestlohn'],
        merkmal: 'starke_rente',
      },
      {
        id: 'verrentung_konservativ', platzhalter: true, ausrichtung: 'konservativ', name: 'Konservativer Weg',
        aufgabe: { text: 'Die Rentenwelle bis zum Ende der Epoche auf höchstens 35 drücken.', problem: 'rentenwelle', ziel: 35 },
        staerke: { text: 'Längeres Arbeiten hält Fachkräfte im Betrieb.', gruppen: { unternehmen: 1 }, probleme: { fachkraefte: -1 } },
        schwaeche: { text: 'Wer körperlich schwer arbeitet, verliert.', gruppen: { arbeitnehmer: -1 }, probleme: { vertrauensverlust: 1 } },
        schwerpunkt: ['r_eintritt', 'a_grundsicherung', 'b_leistung'],
        merkmal: 'langes_erwerbsleben',
      },
    ],
  },
  {
    id: 'klimaneutralitaet', platzhalter: true, quelle: 'Spielwert', name: 'Endspurt zur Klimaneutralität',
    text: 'Das Klimaziel rückt näher. Energie, Verkehr und Wohnen müssen sich schnell umstellen.',
    streitfrage: { text: 'Wie schnell, und wer bezahlt den Umbau?' },
    probleme: [
      {
        id: 'klimaziel', platzhalter: true, quelle: 'Spielwert', name: 'Klimaziel in Gefahr', kategorie: 'Umwelt', ministerium: 'umwelt', monat: 0, start: 50, trend: 0.3,
        text: 'Die Emissionen sinken langsamer als geplant.',
        treiber: [{ problem: 'energiepreise', ab: 50, gewicht: 0.1 }, { profil: 'oekologie', gewicht: -0.3 }],
        folgen: { gruppen: { familien: -2 } },
        loesungen: [
          { id: 'kz_programm', platzhalter: true, quelle: 'Spielwert', name: 'Sofortprogramm Emissionen', text: 'Gezielte Förderung in den Sektoren mit der größten Lücke.', ausrichtung: { oekologie: 1 }, kosten: 1200000, dauer: 9, erfolg: 0.65, wirkung: 10, kapital: 10 },
          { id: 'kz_monitoring', platzhalter: true, quelle: 'Spielwert', name: 'Klimaziel-Monitoring mit Nachsteuerung', text: 'Jährliche Prüfung, Nachsteuern wo Ziele verfehlt werden.', ausrichtung: { oekologie: 0.5 }, kosten: 100000, dauer: 6, erfolg: 0.75, wirkung: 6, kapital: 6 },
        ],
      },
    ],
    wege: [
      {
        id: 'klima_gruen', platzhalter: true, ausrichtung: 'gruen', name: 'Grün-ökologischer Weg',
        aufgabe: { text: 'Das Problem „Klimaziel in Gefahr“ bis zum Ende der Epoche auf höchstens 35 drücken.', problem: 'klimaziel', ziel: 35 },
        staerke: { text: 'Schneller Ausbau senkt die Emissionen.', gruppen: { familien: 1 }, probleme: { klimafolgen: -1 } },
        schwaeche: { text: 'Der Umbau verteuert Energie für eine Weile.', gruppen: { landwirtschaft: -1 }, probleme: { energiepreise: 1 } },
        schwerpunkt: ['e_turbo', 'e_wasserstoff', 'st_oeko'],
        merkmal: 'erneuerbares_land',
      },
      {
        id: 'klima_national', platzhalter: true, ausrichtung: 'national', name: 'National-konservativer Weg',
        aufgabe: { text: 'Das Problem „Klimaziel in Gefahr“ bis zum Ende der Epoche auf höchstens 35 drücken.', problem: 'klimaziel', ziel: 35 },
        staerke: { text: 'Eigene Energiequellen machen unabhängiger.', gruppen: { landwirtschaft: 1 }, probleme: { geopolitik: -1 } },
        schwaeche: { text: 'Europäische Partner ziehen nicht mit.', gruppen: { unternehmen: -1 }, probleme: { klimafolgen: 1 } },
        schwerpunkt: ['e_kern', 'm_grenze'],
        merkmal: 'eigene_energie',
      },
      {
        id: 'klima_pragmatisch', platzhalter: true, ausrichtung: 'pragmatisch', name: 'Technokratisch-pragmatischer Weg',
        aufgabe: { text: 'Das Problem „Klimaziel in Gefahr“ bis zum Ende der Epoche auf höchstens 35 drücken.', problem: 'klimaziel', ziel: 35 },
        staerke: { text: 'Starke Netze bringen den Strom dahin, wo er gebraucht wird.', gruppen: { unternehmen: 1 }, probleme: { infrastruktur: -1 } },
        schwaeche: { text: 'Planung und Bau dauern lange.', gruppen: { familien: -1 }, probleme: { energiepreise: 1 } },
        schwerpunkt: ['e_netze', 'd_staat', 'g_planung'],
        merkmal: 'starke_netze',
      },
    ],
  },
];
