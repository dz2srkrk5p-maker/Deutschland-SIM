// ============================================================
// LAWS.JS — Pool aller einbringbaren Gesetze
//
// blockers: Koalitionspartner die GEGEN das Gesetz stimmen
//   → löst Blockade-Dialog aus wenn Party in Koalition
// oppositionSupport: Oppositionsparteien die DAFÜR stimmen
// causesCoalitionExit: Parteien die Koalition verlassen wenn Gesetz passt
// isFederalLaw: Bundesrat-Beteiligung (30% Blockade-Chance)
// requires2_3: Zweidrittel-Mehrheit nötig
// isConstitutional: 5% BVerfG-Kipprisiko
// ============================================================

export const LAW_CATEGORIES = [
  { id: 'wirtschaft',     label: 'Wirtschaft' },
  { id: 'soziales',       label: 'Soziales' },
  { id: 'klima',          label: 'Klima & Energie' },
  { id: 'sicherheit',     label: 'Sicherheit & Gesellschaft' },
  { id: 'international',  label: 'International' },
];

export const LAW_POOL = [

  // ── WIRTSCHAFT ────────────────────────────────────────────────

  {
    id: 'mindestlohn',
    label: 'Mindestlohnerhöhung',
    category: 'wirtschaft',
    description: 'Der gesetzliche Mindestlohn wird von 12,41 € auf 15,00 € pro Stunde erhöht. Gewerkschaften begrüßen den Schritt, Arbeitgeberverbände warnen vor Jobverlusten im Niedriglohnsektor.',
    immediateEffects: {
      'society.publicSatisfaction': +5,
      'society.socialJustice':      +6,
      'economy.gdpIndex':           -2,
      'economy.unemployment':       -3,
    },
    delayedEffects: [
      { quartersDelay: 3, effects: { 'economy.taxRevenue': +3, 'society.publicSatisfaction': +2 }, label: 'Mehr Kaufkraft stärkt Binnenkonsum' },
      { quartersDelay: 4, effects: { 'economy.unemployment': -2 }, label: 'Rationalisierungswelle im Niedriglohnsektor' },
    ],
    blockers: [
      { party: 'FDP', reason: 'Verletzt Grundsatz der Tarifautonomie und marktwirtschaftliche Lohnfindung' },
    ],
    oppositionSupport: ['SPD', 'Grüne', 'Linke', 'BSW'],
    isFederalLaw: false, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'Zufriedenheit +, Beschäftigung -, Wirtschaft -',
    pressComment: 'Historische Lohnerhöhung: Mehr Gerechtigkeit oder Job-Killer?',
  },

  {
    id: 'unternehmensteuer',
    label: 'Unternehmenssteuersenkung',
    category: 'wirtschaft',
    description: 'Die Körperschaftsteuer wird von 15% auf 10% gesenkt. Ziel ist die Stärkung des Wirtschaftsstandorts Deutschland und die Anziehung ausländischer Investitionen.',
    immediateEffects: {
      'economy.gdpIndex':       +4,
      'economy.tradeBalance':   +3,
      'economy.taxRevenue':     -6,
      'society.socialJustice':  -4,
    },
    delayedEffects: [
      { quartersDelay: 4, effects: { 'economy.gdpIndex': +3, 'economy.taxRevenue': +4 }, label: 'Laffer-Effekt: Mehr Wirtschaftsaktivität bringt Steuereinnahmen' },
    ],
    blockers: [
      { party: 'SPD', reason: 'Entlastet Konzerne auf Kosten öffentlicher Daseinsvorsorge' },
      { party: 'Grüne', reason: 'Verstärkt soziale Ungleichheit und gefährdet Staatsfinanzen' },
      { party: 'Linke', reason: 'Massive Umverteilung von unten nach oben' },
    ],
    oppositionSupport: ['CDU', 'FDP'],
    isFederalLaw: false, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'Wirtschaft +, Steuereinnahmen -, Soziale Gerechtigkeit -',
    pressComment: 'Standortvorteil oder Steuergeschenk? Expertenstreit um Körperschaftsteuer',
  },

  {
    id: 'lieferkette',
    label: 'Lieferkettengesetz verschärfen',
    category: 'wirtschaft',
    description: 'Das Lieferkettensorgfaltspflichtengesetz wird auf Unternehmen ab 250 Mitarbeitern ausgeweitet und sieht schärfere Sanktionen bei Verstößen vor. Die EU-Kommission hat Deutschland als Vorreiter gelobt.',
    immediateEffects: {
      'politics.euRelations':    +6,
      'economy.gdpIndex':        -2,
      'economy.tradeBalance':    -3,
      'society.publicSatisfaction': +3,
    },
    delayedEffects: [
      { quartersDelay: 5, effects: { 'economy.tradeBalance': +2, 'politics.euRelations': +3 }, label: 'Nachhaltige Lieferketten werden zum Wettbewerbsvorteil' },
    ],
    blockers: [
      { party: 'FDP', reason: 'Bürokratieaufwand schwächt Mittelstand und Exportwirtschaft' },
      { party: 'CDU', reason: 'Wettbewerbsnachteil gegenüber Unternehmen aus Ländern ohne vergleichbare Regeln' },
    ],
    oppositionSupport: ['Grüne', 'SPD'],
    isFederalLaw: false, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'EU-Beziehungen +, Wirtschaft -, Außenhandel -',
    pressComment: 'Menschenrechte in der Lieferkette: Deutschland setzt Maßstäbe',
  },

  {
    id: 'arbeitszeit',
    label: 'Arbeitszeitverkürzung (32-Stunden-Woche)',
    category: 'wirtschaft',
    description: 'Die gesetzliche Regelarbeitszeit wird schrittweise auf 32 Stunden pro Woche bei vollem Lohnausgleich reduziert. Pilotprogramme in Skandinavien zeigen positive Produktivitätseffekte.',
    immediateEffects: {
      'society.publicSatisfaction': +7,
      'society.socialJustice':      +4,
      'economy.gdpIndex':           -4,
      'economy.unemployment':       +3,
    },
    delayedEffects: [
      { quartersDelay: 4, effects: { 'economy.gdpIndex': +2, 'economy.unemployment': +2 }, label: 'Produktivitätssteigerung durch bessere Work-Life-Balance' },
    ],
    blockers: [
      { party: 'FDP', reason: 'Staatlicher Eingriff in Tarifvertragsfreiheit, gefährdet Wettbewerbsfähigkeit' },
      { party: 'CDU', reason: 'Wirtschaftlich nicht finanzierbar und international konkurrenzlos' },
    ],
    oppositionSupport: ['SPD', 'Grüne', 'Linke'],
    isFederalLaw: false, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'Zufriedenheit ++, Wirtschaft --, Beschäftigung +',
    pressComment: '32-Stunden-Woche: Revolution der Arbeit oder wirtschaftlicher Selbstmord?',
  },

  // ── SOZIALES ─────────────────────────────────────────────────

  {
    id: 'kindergeld',
    label: 'Kindergelderhöhung',
    category: 'soziales',
    description: 'Das Kindergeld wird um 50 € pro Monat erhöht und durch die Einführung einer Kindergrundsicherung ergänzt. Familien mit Kindern sollen stärker von der wirtschaftlichen Leistung Deutschlands profitieren.',
    immediateEffects: {
      'society.publicSatisfaction': +5,
      'society.socialJustice':      +5,
      'economy.debtRatio':          +2,
    },
    delayedEffects: [
      { quartersDelay: 4, effects: { 'society.publicSatisfaction': +2 }, label: 'Mehr Kaufkraft durch höheres Kindergeld' },
    ],
    blockers: [
      { party: 'FDP', reason: 'Schuldenbremse erfordert Gegenfinanzierung' },
    ],
    oppositionSupport: ['SPD', 'Grüne', 'Linke', 'BSW'],
    isFederalLaw: true, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'Zufriedenheit +, Soziale Gerechtigkeit +, Schulden +',
    pressComment: 'Mehr Geld für Familien: Politischer Konsens über Parteigrenzen',
  },

  {
    id: 'rentenalter',
    label: 'Renteneintrittsalter auf 68 anheben',
    category: 'soziales',
    description: 'Das gesetzliche Renteneintrittsalter wird schrittweise bis 2045 auf 68 Jahre angehoben. Rentenexperten sprechen von notwendiger Anpassung, Gewerkschaften protestieren landesweit.',
    immediateEffects: {
      'society.publicSatisfaction': -8,
      'society.socialJustice':      -6,
      'economy.debtRatio':          -4,
    },
    delayedEffects: [
      { quartersDelay: 6, effects: { 'economy.unemployment': -3, 'economy.gdpIndex': +2 }, label: 'Mehr Erwerbspersonen stabilisieren Arbeitsmarkt' },
      { quartersDelay: 8, effects: { 'economy.debtRatio': -5 }, label: 'Rentensystem nachhaltig entlastet' },
    ],
    blockers: [
      { party: 'SPD', reason: 'Wer körperlich arbeitet, kann nicht bis 68 schuften' },
      { party: 'Grüne', reason: 'Lebensqualität im Alter darf nicht geopfert werden' },
      { party: 'Linke', reason: 'Rentenkürzung auf Raten — inakzeptabel' },
      { party: 'BSW', reason: 'Belastet arbeitende Menschen disproportional' },
    ],
    oppositionSupport: ['CDU', 'FDP'],
    isFederalLaw: true, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'Schulden -, Zufriedenheit --, Soz. Gerechtigkeit -',
    pressComment: 'Rente mit 68: Schmerzhafte Notwendigkeit oder soziale Zumutung?',
  },

  {
    id: 'pflegereform',
    label: 'Pflegereform: Vollversicherung',
    category: 'soziales',
    description: 'Die Pflegeversicherung wird zur Vollkaskoversicherung ausgebaut. Eigenanteile in Pflegeheimen werden gedeckelt, Pflegekräfte erhalten deutliche Gehaltserhöhungen.',
    immediateEffects: {
      'society.healthcareQuality':  +7,
      'society.publicSatisfaction': +5,
      'economy.debtRatio':          +3,
    },
    delayedEffects: [
      { quartersDelay: 4, effects: { 'economy.unemployment': +2 }, label: 'Bessere Bezahlung reduziert Pflegekräftemangel' },
    ],
    blockers: [
      { party: 'FDP', reason: 'Vollkaskoversicherung schafft falsche Anreize und explodiert finanziell' },
    ],
    oppositionSupport: ['SPD', 'Grüne', 'Linke', 'BSW'],
    isFederalLaw: true, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'Gesundheit ++, Zufriedenheit +, Schulden +',
    pressComment: 'Pflegereform: Ein Meilenstein für die alternde Gesellschaft',
  },

  {
    id: 'wohngeld',
    label: 'Wohngeldreform: Ausweitung und Erhöhung',
    category: 'soziales',
    description: 'Der Empfängerkreis des Wohngelds wird auf 5 Millionen Haushalte ausgeweitet und die Leistungshöhe um 40% erhöht. In Großstädten sollen Mieter dadurch effektiv entlastet werden.',
    immediateEffects: {
      'society.socialJustice':      +6,
      'society.publicSatisfaction': +4,
      'economy.debtRatio':          +2,
    },
    delayedEffects: [
      { quartersDelay: 3, effects: { 'society.publicSatisfaction': +2 }, label: 'Wohnsituation von Geringverdienern stabilisiert sich' },
    ],
    blockers: [
      { party: 'FDP', reason: 'Symptombekämpfung statt Marktlösungen — erhöht Kosten ohne Ursache zu bekämpfen' },
    ],
    oppositionSupport: ['SPD', 'Grüne', 'Linke'],
    isFederalLaw: true, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'Soziale Gerechtigkeit +, Zufriedenheit +, Schulden +',
    pressComment: 'Wohnen als Menschenrecht: Regierung will niemanden zurücklassen',
  },

  // ── KLIMA & ENERGIE ───────────────────────────────────────────

  {
    id: 'co2-steuer',
    label: 'CO₂-Steuer erhöhen (auf 100€/Tonne)',
    category: 'klima',
    description: 'Der CO₂-Preis wird auf 100 € pro Tonne erhöht. Die Einnahmen fließen in ein Klimageld und in grüne Infrastrukturinvestitionen. Kritiker warnen vor Wettbewerbsnachteilen.',
    immediateEffects: {
      'society.climateProgress':    +7,
      'politics.euRelations':       +4,
      'society.publicSatisfaction': -5,
      'economy.gdpIndex':           -2,
    },
    delayedEffects: [
      { quartersDelay: 4, effects: { 'economy.tradeBalance': +3 }, label: 'Grüne Technologien werden exportstark' },
      { quartersDelay: 6, effects: { 'society.climateProgress': +4 }, label: 'CO₂-Emissionen spürbar gesunken' },
    ],
    blockers: [
      { party: 'FDP', reason: 'Belastet Pendler und Industrie — Entlastungsmaßnahmen fehlen' },
      { party: 'CDU', reason: 'Gefährdet internationale Wettbewerbsfähigkeit' },
    ],
    oppositionSupport: ['Grüne', 'SPD'],
    isFederalLaw: false, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'Klimafortschritt ++, Zufriedenheit -, Wirtschaft -',
    pressComment: 'Teuerste Klimapolitik Europas: Vorreiter oder Alleingang?',
  },

  {
    id: 'tempolimit',
    label: 'Tempolimit 130 km/h auf Autobahnen',
    category: 'klima',
    description: 'Deutschland führt als letztes Land in Europa ein allgemeines Tempolimit auf Autobahnen ein. Umweltverbände jubeln, der ADAC spricht von einem Angriff auf die Fahrfreiheit.',
    immediateEffects: {
      'society.climateProgress':    +5,
      'society.securityFeeling':    +2,
      'society.publicSatisfaction': -4,
    },
    delayedEffects: [
      { quartersDelay: 2, effects: { 'society.climateProgress': +2 }, label: 'CO₂-Ausstoß des Straßenverkehrs messbar gesunken' },
    ],
    blockers: [
      { party: 'CDU', reason: 'Eingriff in persönliche Freiheit, kein signifikanter Klimabeitrag' },
      { party: 'FDP', reason: 'Symbol-Regulierung, die echte Klimapolitik verdrängt' },
    ],
    oppositionSupport: ['Grüne', 'SPD', 'Linke'],
    isFederalLaw: false, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'Klimafortschritt +, Zufriedenheit -',
    pressComment: 'Tempo 130: Das Ende einer deutschen Besonderheit',
  },

  {
    id: 'solar',
    label: 'Solarausbau-Beschleunigungsgesetz',
    category: 'klima',
    description: 'Das Gesetz verpflichtet alle Neubauten zur Solarinstallation und beschleunigt Genehmigungsverfahren massiv. 200 GW Solarkapazität bis 2030 sind das Ziel.',
    immediateEffects: {
      'society.climateProgress':    +6,
      'economy.gdpIndex':           -2,
      'economy.debtRatio':          +1,
    },
    delayedEffects: [
      { quartersDelay: 3, effects: { 'economy.gdpIndex': +3, 'economy.tradeBalance': +4 }, label: 'Solarindustrie boomt — Exportchance genutzt' },
      { quartersDelay: 4, effects: { 'society.climateProgress': +5 }, label: 'Erneuerbare Kapazität deutlich ausgebaut' },
    ],
    blockers: [
      { party: 'FDP', reason: 'Pflichtinstallation ist Eingriff in Eigentumsrechte' },
    ],
    oppositionSupport: ['Grüne', 'SPD'],
    isFederalLaw: true, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'Klimafortschritt +, langfristig Wirtschaft +',
    pressComment: 'Sonnenwende in der Energiepolitik: Solarpflicht schafft Zukunft',
  },

  {
    id: 'atomkraft',
    label: 'Atomkraft-Laufzeitverlängerung',
    category: 'klima',
    description: 'Die abgeschalteten Kernkraftwerke werden reaktiviert und die Laufzeiten um 20 Jahre verlängert. Befürworter sprechen von günstigem Brückenstrom, Kritiker sehen ungelöstes Endlagerproblem.',
    immediateEffects: {
      'society.climateProgress':    -8,
      'economy.gdpIndex':           +3,
      'economy.inflation':          +5,
      'politics.coalitionStability': -12,
    },
    delayedEffects: [
      { quartersDelay: 3, effects: { 'society.publicSatisfaction': +4 }, label: 'Energiepreise sinken durch mehr Grundlastkapazität' },
    ],
    blockers: [
      { party: 'Grüne', reason: 'Fundamentaler Bruch unserer Kernpolitik — nicht verhandelbar' },
      { party: 'SPD', reason: 'Sicherheitsrisiko und löst kein Endlagerproblem' },
    ],
    oppositionSupport: ['CDU', 'FDP', 'AfD'],
    isFederalLaw: false, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: ['Grüne'],
    effectSummary: 'Energie +, Klimafortschritt --, Koalitionsstabilität --',
    pressComment: 'Atomkraft-Comeback: Deutschland kehrt zur Kernenergie zurück',
  },

  // ── SICHERHEIT & GESELLSCHAFT ────────────────────────────────

  {
    id: 'videoüberwachung',
    label: 'KI-gestützte Videoüberwachung ausweiten',
    category: 'sicherheit',
    description: 'Innenstädte und Bahnhöfe werden flächendeckend mit KI-gestützter Videoüberwachung ausgestattet. Polizeigewerkschaft begrüßt den Schritt, Datenschützer klagen bereits an.',
    immediateEffects: {
      'society.securityFeeling':    +6,
      'politics.mediaRelations':    +3,
    },
    delayedEffects: [
      { quartersDelay: 2, effects: { 'society.publicSatisfaction': +3 }, label: 'Sinkende Kriminalitätsrate spürbar' },
    ],
    blockers: [
      { party: 'Grüne', reason: 'Massenüberwachung ist Angriff auf Grundrechte und Datenschutz' },
      { party: 'Linke', reason: 'Überwachungsstaat gefährdet Bürgerrechte fundamental' },
      { party: 'FDP', reason: 'Anlasslose Überwachung verletzt Persönlichkeitsrechte' },
    ],
    oppositionSupport: ['CDU', 'AfD'],
    isFederalLaw: false, requires2_3: false, isConstitutional: true,
    causesCoalitionExit: [],
    effectSummary: 'Sicherheitsgefühl ++, Datenschutzbedenken',
    pressComment: 'Big Brother auf deutschen Straßen: Sicherheit vs. Freiheit',
  },

  {
    id: 'cannabis',
    label: 'Cannabis-Regulierung ausweiten',
    category: 'sicherheit',
    description: 'Der Kauf von Cannabis in lizenzierten Fachgeschäften wird bundesweit legalisiert. Einnahmen aus Steuern und Einsparungen bei Strafverfolgung sollen Staatskasse entlasten.',
    immediateEffects: {
      'economy.taxRevenue':         +3,
      'society.publicSatisfaction': +3,
      'society.securityFeeling':    -2,
    },
    delayedEffects: [
      { quartersDelay: 3, effects: { 'economy.taxRevenue': +4 }, label: 'Cannabis-Steuern fließen in Staatshaushalt' },
      { quartersDelay: 4, effects: { 'society.securityFeeling': +2 }, label: 'Schwarzmarkt schrumpft spürbar' },
    ],
    blockers: [
      { party: 'CDU', reason: 'Drogenpolitik sendet falsches Signal an Jugendliche' },
      { party: 'BSW', reason: 'Weitere Normalisierung von Drogenkonsum ist falsch' },
    ],
    oppositionSupport: ['Grüne', 'SPD', 'FDP', 'Linke'],
    isFederalLaw: true, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'Steuereinnahmen +, Zufriedenheit +, Sicherheitsgefühl -',
    pressComment: 'High Noon: Deutschland reguliert Cannabis-Markt',
  },

  {
    id: 'wehrpflicht',
    label: 'Wehrpflicht wiedereinführen',
    category: 'sicherheit',
    description: 'Der allgemeine Grundwehrdienst wird für alle männlichen Staatsbürger mit 12 Monaten Dauer wiedereingeführt. Alternativ ist ein Sozialdienst möglich. Nato-Partner begrüßen die Entscheidung.',
    immediateEffects: {
      'politics.usRelations':       +8,
      'society.securityFeeling':    +4,
      'society.publicSatisfaction': -6,
    },
    delayedEffects: [
      { quartersDelay: 4, effects: { 'society.securityFeeling': +3, 'economy.unemployment': -3 }, label: 'Ausgebildete Reservisten stärken Verteidigungsfähigkeit' },
    ],
    blockers: [
      { party: 'Grüne', reason: 'Wehrpflicht ist rückschrittlich und kontraproduktiv für moderne Verteidigung' },
      { party: 'Linke', reason: 'Grundrecht auf Kriegsdienstverweigerung muss respektiert werden' },
    ],
    oppositionSupport: ['CDU', 'AfD'],
    isFederalLaw: false, requires2_3: true, isConstitutional: true,
    causesCoalitionExit: [],
    effectSummary: 'USA-Beziehungen ++, Zufriedenheit -, NATO +',
    pressComment: 'Zurück in Uniform: Deutschland reaktiviert Wehrpflicht',
  },

  {
    id: 'sterbehilfe',
    label: 'Sterbehilfe legalisieren',
    category: 'sicherheit',
    description: 'Assistierter Suizid wird unter strengen Bedingungen für schwerkranke Patienten erlaubt. Das Bundesverfassungsgericht hatte das bestehende Verbot bereits gekippt — die Gesetzgebung war überfällig.',
    immediateEffects: {
      'society.publicSatisfaction': +2,
      'politics.coalitionStability': -6,
      'politics.mediaRelations':     -3,
    },
    delayedEffects: [],
    blockers: [
      { party: 'CDU', reason: 'Tiefe ethische Überzeugung: Leben ist unantastbar' },
      { party: 'BSW', reason: 'Gesellschaftlich noch nicht reif für diesen Schritt' },
    ],
    oppositionSupport: ['FDP', 'Grüne', 'SPD'],
    isFederalLaw: false, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'Gesellschaftliche Debatte, Koalitionsspannung',
    pressComment: 'Recht auf den eigenen Tod: Deutschland wählt Selbstbestimmung',
  },

  // ── INTERNATIONAL ─────────────────────────────────────────────

  {
    id: 'nato-ausgaben',
    label: 'NATO-Ausgaben auf 3% BIP erhöhen',
    category: 'international',
    description: 'Deutschland erhöht seine Verteidigungsausgaben über das 2%-Ziel hinaus auf 3% des BIP. Washington zeigt sich begeistert, Haushaltspolitiker warnen vor den Folgekosten.',
    immediateEffects: {
      'politics.usRelations':       +12,
      'society.securityFeeling':    +4,
      'economy.debtRatio':          +5,
      'politics.coalitionStability': -6,
    },
    delayedEffects: [
      { quartersDelay: 4, effects: { 'economy.gdpIndex': +2 }, label: 'Rüstungsindustrie als Wirtschaftsmotor' },
    ],
    blockers: [
      { party: 'Linke', reason: 'Aufrüstung statt Diplomatie — ein Fehler mit Ansage' },
      { party: 'BSW', reason: 'Rüstungsspirale gefährdet Frieden in Europa' },
      { party: 'FDP', reason: 'Haushaltsdisziplin muss auch bei Verteidigung gelten' },
    ],
    oppositionSupport: ['CDU', 'AfD'],
    isFederalLaw: false, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'USA ++, Schulden +, Sicherheit +',
    pressComment: 'Zeitenwende 2.0: Deutschland rüstet massiv auf',
  },

  {
    id: 'eu-transfer',
    label: 'EU-Transferzahlungen erhöhen',
    category: 'international',
    description: 'Deutschland erklärt sich bereit, seinen Anteil am EU-Haushalt um 20% zu erhöhen und tritt für ein gemeinsames europäisches Investitionsprogramm ein. Brüssel feiert die Entscheidung.',
    immediateEffects: {
      'politics.euRelations':    +10,
      'economy.debtRatio':       +2,
      'economy.tradeBalance':    +3,
    },
    delayedEffects: [
      { quartersDelay: 4, effects: { 'economy.gdpIndex': +3, 'economy.tradeBalance': +4 }, label: 'EU-Binnenmarkt profitiert — deutscheExporte steigen' },
    ],
    blockers: [
      { party: 'FDP', reason: 'Blankocheck für andere Volkswirtschaften geht auf Kosten der deutschen Steuerzahler' },
      { party: 'AfD', reason: 'Souveränitätsabgabe an Brüssel — inakzeptabel' },
    ],
    oppositionSupport: ['SPD', 'Grüne'],
    isFederalLaw: false, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'EU-Beziehungen ++, Schulden +, langfristig Wirtschaft +',
    pressComment: 'Motor Europa: Deutschland investiert in europäische Einheit',
  },

  {
    id: 'ruestungsexport',
    label: 'Rüstungsexporte einschränken',
    category: 'international',
    description: 'Rüstungsexporte in Länder außerhalb der EU und NATO werden massiv eingeschränkt. Menschenrechtsorganisationen loben das Gesetz, die Rüstungsindustrie spricht von Arbeitsplatzverlusten.',
    immediateEffects: {
      'politics.euRelations':    +5,
      'economy.gdpIndex':        -2,
      'economy.tradeBalance':    -4,
      'politics.mediaRelations': +4,
    },
    delayedEffects: [],
    blockers: [
      { party: 'CDU', reason: 'Schwächt Bündnispartner und kostet Tausende Arbeitsplätze' },
    ],
    oppositionSupport: ['Grüne', 'SPD', 'Linke'],
    isFederalLaw: false, requires2_3: false, isConstitutional: false,
    causesCoalitionExit: [],
    effectSummary: 'EU +, Medien +, Wirtschaft -, Außenhandel -',
    pressComment: 'Keine Waffen in Krisengebiete: Deutschland wählt Diplomatie',
  },

  {
    id: 'asylrecht',
    label: 'Asylrecht verschärfen',
    category: 'international',
    description: 'Asylverfahren werden auf 3 Monate begrenzt, sichere Herkunftsstaaten ausgeweitet und Zurückweisungen an der Grenze rechtlich verankert. Die EU-Kommission warnt vor Rechtsstaatlichkeitsproblemen.',
    immediateEffects: {
      'society.securityFeeling':    +5,
      'politics.euRelations':       -7,
      'society.socialJustice':      -4,
      'politics.coalitionStability': -8,
    },
    delayedEffects: [
      { quartersDelay: 3, effects: { 'society.publicSatisfaction': +4 }, label: 'Bevölkerung nimmt Maßnahmen positiv auf' },
    ],
    blockers: [
      { party: 'Grüne', reason: 'Verletzt Genfer Flüchtlingskonvention und Europäisches Recht' },
      { party: 'Linke', reason: 'Festungspolitik statt Humanität' },
    ],
    oppositionSupport: ['CDU', 'AfD', 'BSW'],
    isFederalLaw: true, requires2_3: false, isConstitutional: true,
    causesCoalitionExit: [],
    effectSummary: 'Sicherheitsgefühl +, EU-Beziehungen -, Koalitionsspannung',
    pressComment: 'Grenzpolitik neu: Deutschland setzt auf nationalen Kurs',
  },
];

// ── HILFSFUNKTIONEN ───────────────────────────────────────────

export function getLawsByCategory(categoryId) {
  return LAW_POOL.filter(l => l.category === categoryId);
}

export function getLawById(id) {
  return LAW_POOL.find(l => l.id === id) ?? null;
}

export function isLawAlreadyEnacted(lawId, state) {
  return (state.legislation?.enactedLaws ?? []).some(e => e.lawId === lawId);
}

export function canProposeLaw(state) {
  const tq   = state.government?.termQuarter ?? 0;
  const last = state.legislation?.lastLegislationQuarter ?? -1;
  return tq > last && state.phase === 'governing';
}
