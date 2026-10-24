// Ereignisse in der Regierungszeit (F14, freigegeben automatisch nach Empfehlung 2026-10-22). Eigene Texte, keine echten
// Personen. Alle Zahlen sind Spielwerte. Folgen (Umfragepunkte bzw. Druckpunkte):
//   kanzler: Kanzlerpartei; partner: jede Partnerpartei; ministerium: { ministeriumId: Wert } für die Partei, die es hält;
//   probleme: { problemId: Wert } (System 3).
// problem: zugehöriges Problem; das Ereignis kommt nur, wenn dieses Problem mindestens bei 30 liegt (System 3).
// bedingung: (zustand, { profil }) => boolean, sonst jederzeit möglich; profil = Richtungsprofil des Landes (System 1).
export const ereignisse = [
  {
    id: 'mieten',
    titel: 'Mieten steigen in den Großstädten weiter',
    text: 'Neue Zahlen zeigen zweistellige Mietsteigerungen. Mieterverbände fordern sofortiges Handeln.',
    problem: 'wohnungsnot',
    bedingung: (z) => z.probleme.wohnungsnot.wert >= 50,
    moeglichkeiten: [
      { text: 'Mietpreisbremse verschärfen', folgen: { probleme: { wohnungsnot: -5 }, ministerium: { bauen: 0.1, wirtschaft: -0.1 } } },
      { text: 'Auf den Markt vertrauen', folgen: { probleme: { wohnungsnot: 5 } } },
    ],
  },
  {
    id: 'pflegestreik',
    problem: 'pflegenotstand',
    titel: 'Warnstreik in Kliniken und Pflegeheimen',
    text: 'Pflegekräfte legen bundesweit die Arbeit nieder und verlangen mehr Personal und Lohn.',
    moeglichkeiten: [
      { text: 'Lohnzusagen machen', folgen: { probleme: { pflegenotstand: -8 }, ministerium: { gesundheit: 0.1, finanzen: -0.2 } } },
      { text: 'Hart bleiben', folgen: { probleme: { pflegenotstand: 6 }, kanzler: -0.2 } },
    ],
  },
  {
    id: 'stellwerk',
    problem: 'infrastruktur',
    titel: 'Stellwerksausfall legt den Bahnverkehr lahm',
    text: 'Ein veraltetes Stellwerk fällt aus, tausende Pendler stranden.',
    moeglichkeiten: [
      { text: 'Sonderprogramm für Stellwerke', folgen: { probleme: { infrastruktur: -5 }, ministerium: { finanzen: -0.15 } } },
      { text: 'Konzernspitze zur Rechenschaft ziehen', folgen: { probleme: { infrastruktur: 2 }, ministerium: { verkehr: 0.1 } } },
      { text: 'Aussitzen', folgen: { probleme: { infrastruktur: 6 }, ministerium: { verkehr: -0.2 } } },
    ],
  },
  {
    id: 'hochwasser',
    problem: 'klimafolgen',
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
    problem: 'vertrauensverlust',
    titel: 'Fragwürdige Beraterverträge im Verteidigungsministerium',
    text: 'Der Rechnungshof rügt teure Aufträge ohne Ausschreibung.',
    moeglichkeiten: [
      { text: 'Verantwortliche Beamte entlassen', folgen: { ministerium: { verteidigung: -0.2 } } },
      { text: 'Aussitzen', folgen: { ministerium: { verteidigung: -0.1 }, kanzler: -0.2 } },
    ],
  },
  {
    id: 'konjunktur',
    bedingung: (z) => z.probleme.rezession.wert < 45,
    titel: 'Wirtschaft wächst stärker als erwartet',
    text: 'Die Institute heben ihre Prognosen an.',
    moeglichkeiten: [
      { text: 'Erfolg der Regierung herausstellen', folgen: { kanzler: 0.2, ministerium: { wirtschaft: 0.1 } } },
      { text: 'Dem Finanzministerium die Bühne lassen', folgen: { ministerium: { finanzen: 0.2 } } },
    ],
  },
  {
    id: 'cyberangriff',
    problem: 'cyberangriffe',
    titel: 'Cyberangriff auf Bundesbehörden',
    text: 'Mehrere Ämter sind tagelang nicht erreichbar.',
    moeglichkeiten: [
      { text: 'Digitalpaket für die Verwaltung', folgen: { ministerium: { digitales: 0.15, inneres: -0.05 } } },
      { text: 'Vorfall herunterspielen', folgen: { kanzler: -0.2 } },
    ],
  },
  // Reaktionen auf das Richtungsprofil (System 1)
  {
    id: 'eu_verfahren',
    titel: 'EU-Kommission leitet Vertragsverletzungsverfahren ein',
    text: 'Brüssel sieht in mehreren Gesetzen Verstöße gegen europäisches Recht.',
    bedingung: (z, k) => k.profil.eu < -0.8,
    moeglichkeiten: [
      { text: 'Gesetze anpassen', folgen: { kanzler: -0.1, probleme: { geopolitik: -3 } } },
      { text: 'Auf nationaler Souveränität bestehen', folgen: { kanzler: 0.1, probleme: { geopolitik: 5, rezession: 2 } } },
    ],
  },
  {
    id: 'investoren',
    titel: 'Investoren kündigen Großprojekte an',
    text: 'Mehrere Konzerne wollen nach dem Reformkurs wieder in Deutschland bauen.',
    bedingung: (z, k) => k.profil.wirtschaft > 0.8,
    moeglichkeiten: [
      { text: 'Erfolg der Reformen herausstellen', folgen: { kanzler: 0.2, probleme: { rezession: -4 } } },
      { text: 'Standortgarantien mit Tarifbindung verknüpfen', folgen: { ministerium: { arbeit: 0.1 }, probleme: { rezession: -2, soziale_spaltung: -2 } } },
    ],
  },
  {
    id: 'generalstreik',
    titel: 'Gewerkschaften rufen zum Großstreik auf',
    text: 'Gegen den Abbau von Arbeitnehmerrechten stehen Bahnen, Kliniken und Kitas still.',
    bedingung: (z, k) => k.profil.wirtschaft > 1,
    moeglichkeiten: [
      { text: 'Zugeständnisse machen', folgen: { kanzler: -0.1, probleme: { soziale_spaltung: -4 } } },
      { text: 'Hart bleiben', folgen: { kanzler: -0.2, probleme: { rezession: 3, polarisierung: 3 } } },
    ],
  },
  {
    id: 'klimaklage',
    titel: 'Klimaklage vor dem Bundesverfassungsgericht',
    text: 'Junge Kläger sehen ihre Freiheitsrechte durch fehlenden Klimaschutz verletzt.',
    bedingung: (z, k) => k.profil.oekologie < -0.7,
    moeglichkeiten: [
      { text: 'Klimaziele freiwillig nachschärfen', folgen: { ministerium: { wirtschaft: -0.1 }, probleme: { klimafolgen: -4 } } },
      { text: 'Das Urteil abwarten', folgen: { kanzler: -0.2, probleme: { vertrauensverlust: 3 } } },
    ],
  },
  {
    id: 'rating',
    titel: 'Ratingagentur warnt vor dem Ausgabenkurs',
    text: 'Die Bonität Deutschlands wird mit negativem Ausblick versehen.',
    bedingung: (z, k) => k.profil.wirtschaft < -1,
    moeglichkeiten: [
      { text: 'Sparsignal senden', folgen: { kanzler: -0.1, probleme: { staatsverschuldung: -4 } } },
      { text: 'Kurs halten: Investitionen zahlen sich aus', folgen: { probleme: { staatsverschuldung: 5 } } },
    ],
  },
];
