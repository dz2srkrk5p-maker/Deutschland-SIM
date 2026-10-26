// Generationen von Problemen (Epochen-Etappe 5, docs/epochen-spec.md): „Manche Probleme kehren in neuer Gestalt zurück, etwa
// ‚Bundeswehr unterbesetzt‘ als ‚Verteidigung in Europa‘.“ PLATZHALTER: Welche Ketten es gibt, entscheidet der Nutzer; hier nur
// das Beispiel der Spec. von: Id des alten Problems; nach: neues Problem im Format von src/data/probleme.js.
// Wann die neue Generation kommt, steht in config.generationen (TODO-BALANCE).
export const generationen = [
  {
    von: 'bundeswehr', platzhalter: true,
    nach: {
      id: 'verteidigung_europa', platzhalter: true, quelle: 'Spielwert', name: 'Verteidigung in Europa', kategorie: 'Sicherheit', ministerium: 'verteidigung', start: 45, trend: 0.2,
      text: 'Die eigene Armee ist wieder aufgestellt, doch Europa muss seine Verteidigung gemeinsam organisieren.',
      treiber: [{ problem: 'geopolitik', ab: 40, gewicht: 0.2 }],
      folgen: { gruppen: { unternehmen: -2 } },
      loesungen: [
        { id: 've_gemeinsam', platzhalter: true, quelle: 'Spielwert', name: 'Gemeinsame Beschaffung mit Partnern', text: 'Rüstungsprojekte mit europäischen Partnern bündeln.', ausrichtung: { eu: 1 }, kosten: 1000000, dauer: 12, erfolg: 0.65, wirkung: 10, kapital: 10 },
      ],
    },
  },
];
