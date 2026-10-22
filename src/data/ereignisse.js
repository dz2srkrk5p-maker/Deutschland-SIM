// Ereignisse in der Regierungszeit (F14, freigegeben automatisch nach Empfehlung 2026-10-22). Eigene Texte, keine echten
// Personen. Alle Zahlen sind Spielwerte. Folgen (Umfragepunkte bzw. Druckpunkte):
//   kanzler: Kanzlerpartei; partner: jede Partnerpartei; ministerium: { ministeriumId: Wert } für die Partei, die es hält;
//   druck: { problemId: Wert }.
// bedingung: (zustand) => boolean, sonst jederzeit möglich.
export const ereignisse = [
  {
    id: 'mieten',
    titel: 'Mieten steigen in den Großstädten weiter',
    text: 'Neue Zahlen zeigen zweistellige Mietsteigerungen. Mieterverbände fordern sofortiges Handeln.',
    bedingung: (z) => z.probleme.wohnen >= 50,
    moeglichkeiten: [
      { text: 'Mietpreisbremse verschärfen', folgen: { druck: { wohnen: -5 }, ministerium: { bauen: 0.1, wirtschaft: -0.1 } } },
      { text: 'Auf den Markt vertrauen', folgen: { druck: { wohnen: 5 } } },
    ],
  },
  {
    id: 'pflegestreik',
    titel: 'Warnstreik in Kliniken und Pflegeheimen',
    text: 'Pflegekräfte legen bundesweit die Arbeit nieder und verlangen mehr Personal und Lohn.',
    moeglichkeiten: [
      { text: 'Lohnzusagen machen', folgen: { druck: { pflege: -8 }, ministerium: { gesundheit: 0.1, finanzen: -0.2 } } },
      { text: 'Hart bleiben', folgen: { druck: { pflege: 6 }, kanzler: -0.2 } },
    ],
  },
  {
    id: 'stellwerk',
    titel: 'Stellwerksausfall legt den Bahnverkehr lahm',
    text: 'Ein veraltetes Stellwerk fällt aus, tausende Pendler stranden.',
    moeglichkeiten: [
      { text: 'Sonderprogramm für Stellwerke', folgen: { druck: { schiene: -5 }, ministerium: { finanzen: -0.15 } } },
      { text: 'Konzernspitze zur Rechenschaft ziehen', folgen: { druck: { schiene: 2 }, ministerium: { verkehr: 0.1 } } },
      { text: 'Aussitzen', folgen: { druck: { schiene: 6 }, ministerium: { verkehr: -0.2 } } },
    ],
  },
  {
    id: 'hochwasser',
    titel: 'Hochwasser in mehreren Ländern',
    text: 'Flüsse treten über die Ufer, ganze Ortschaften stehen unter Wasser.',
    moeglichkeiten: [
      { text: 'Die Kanzlerin bzw. der Kanzler reist ins Krisengebiet', folgen: { kanzler: 0.3 } },
      { text: 'Das Innenministerium koordiniert die Hilfe', folgen: { ministerium: { inneres: 0.2 } } },
    ],
  },
  {
    id: 'koalitionsstreit',
    titel: 'Öffentlicher Streit in der Koalition',
    text: 'Ein Partner kritisiert die Regierungslinie offen in den Medien.',
    bedingung: (z) => z.koalition.partner.length > 0,
    moeglichkeiten: [
      { text: 'Machtwort sprechen', folgen: { kanzler: 0.1, partner: -0.3 } },
      { text: 'Kompromiss suchen', folgen: { kanzler: -0.1, partner: 0.1 } },
    ],
  },
  {
    id: 'beratervertraege',
    titel: 'Fragwürdige Beraterverträge im Verteidigungsministerium',
    text: 'Der Rechnungshof rügt teure Aufträge ohne Ausschreibung.',
    moeglichkeiten: [
      { text: 'Verantwortliche Beamte entlassen', folgen: { ministerium: { verteidigung: -0.2 } } },
      { text: 'Aussitzen', folgen: { ministerium: { verteidigung: -0.1 }, kanzler: -0.2 } },
    ],
  },
  {
    id: 'konjunktur',
    titel: 'Wirtschaft wächst stärker als erwartet',
    text: 'Die Institute heben ihre Prognosen an.',
    moeglichkeiten: [
      { text: 'Erfolg der Regierung herausstellen', folgen: { kanzler: 0.2, ministerium: { wirtschaft: 0.1 } } },
      { text: 'Dem Finanzministerium die Bühne lassen', folgen: { ministerium: { finanzen: 0.2 } } },
    ],
  },
  {
    id: 'cyberangriff',
    titel: 'Cyberangriff auf Bundesbehörden',
    text: 'Mehrere Ämter sind tagelang nicht erreichbar.',
    moeglichkeiten: [
      { text: 'Digitalpaket für die Verwaltung', folgen: { ministerium: { digitales: 0.15, inneres: -0.05 } } },
      { text: 'Vorfall herunterspielen', folgen: { kanzler: -0.2 } },
    ],
  },
];
