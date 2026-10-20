// ============================================================
// MINISTER-DATA.JS — Stammdaten für das Ministerien-System
//
// Was: Alle statischen Daten: Namenslisten, Ministeriums-
//      Definitionen, Initiativvorlagen, Skandaltypen.
//
// Nutzt: keine Abhängigkeiten (reine Datendatei)
//
// Erweiterungspunkte:
//   - MINISTRY_DEFS: neues Ministerium als Objekt anhängen
//   - INITIATIVE_TEMPLATES: neue Initiativen pro Ministerium
//   - SCANDAL_TYPES: neuen Skandaltyp mit choices anlegen
// ============================================================

// ── NAMEN-POOL ────────────────────────────────────────────────
export const MALE_FIRST = [
  'Hans', 'Klaus', 'Wolfgang', 'Werner', 'Friedrich', 'Karl', 'Gerhard', 'Thomas',
  'Andreas', 'Michael', 'Peter', 'Stefan', 'Markus', 'Christian', 'Martin',
  'Daniel', 'Alexander', 'Florian', 'Jürgen', 'Heinrich', 'Rainer', 'Ulrich',
  'Norbert', 'Dieter', 'Helmut', 'Rudolf', 'Manfred', 'Bernd', 'Volker',
];
export const FEMALE_FIRST = [
  'Ursula', 'Angela', 'Sabine', 'Claudia', 'Monika', 'Christine', 'Maria',
  'Petra', 'Susanne', 'Andrea', 'Katharina', 'Julia', 'Laura', 'Nina', 'Anna',
  'Elisabeth', 'Barbara', 'Helga', 'Ingrid', 'Eva', 'Renate', 'Dagmar',
  'Hannelore', 'Gisela', 'Ilse', 'Hildegard',
];
export const LAST_NAMES = [
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner',
  'Becker', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein',
  'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger',
  'Hofmann', 'Lange', 'Hartmann', 'Werner', 'Schmitt', 'Krause', 'Meier',
  'Lehmann', 'Schulze', 'Maier', 'Köhler', 'Herrmann', 'König', 'Walter',
  'Huber', 'Kaiser', 'Fuchs', 'Peters', 'Vogel', 'Keller', 'Groß', 'Sommer',
  'Winter', 'Brandt', 'Haas', 'Schreiber', 'Frank', 'Roth', 'Bergmann',
  'Winkler', 'Kramer', 'Baumann', 'Strauß', 'Arnold', 'Burger',
];
export const TITLES = ['', '', '', 'Dr.', 'Dr.', 'Prof. Dr.'];

// ── PERSÖNLICHKEITS-PROFILE ───────────────────────────────────
export const PERSONALITY_PROFILES = {
  Pragmatiker: [
    'Langjähriger Verwaltungsexperte mit Sinn für das Machbare. Bevorzugt graduelle Reformen statt großer Würfe.',
    'Ehemaliger Staatssekretär mit solider Karriere in mehreren Ressorts. Gilt als verlässlicher Problemlöser.',
    'Bekannt für sachliche Entscheidungen ohne ideologische Scheuklappen. Kompromisse sind für ihn Stärke, nicht Schwäche.',
    'Früherer Unternehmensberater, der politische Prozesse nüchtern analysiert. Lösungsorientiert bis zur Sturheit.',
  ],
  Idealist: [
    'Akademischer Hintergrund und tiefe Überzeugung von seiner Mission. Ambitiöse Ziele, aber manchmal an der Realität gescheitert.',
    'Jahrelanger Aktivismus prägte sein politisches Denken. Verfolgt Ziele konsequent, auch gegen internen Widerstand.',
    'Visionäres Denken und Bereitschaft, unbequeme Wahrheiten auszusprechen. Reibungspunkte gehören für ihn dazu.',
    'Promovierte Politikwissenschaftlerin mit Idealvorstellungen. Kämpft hartnäckig für ihre Überzeugungen.',
  ],
  Karrierist: [
    'Aufgewachsen im Parteiapparat, versteht politische Dynamiken intuitiv. Medienpräsenz ist für ihn Kapital.',
    'Selbstvermarktung ist seine Kernkompetenz. Inhaltliche Tiefe bleibt manchmal auf der Strecke.',
    'Experte für den großen Auftritt. Konzentriert sich auf Projekte mit hoher Sichtbarkeit.',
    'Netzwerker par excellence. Hat überall gute Kontakte, aber wenige echte Überzeugungen.',
  ],
  Hardliner: [
    'Unnachgiebig in der Sache, wenig bereit zum Kompromiss. Koalitionspartner schätzen seine Verlässlichkeit — und fürchten seine Sturheit.',
    'Ideologisch geerdet und von der Richtigkeit seiner Position überzeugt. Polarisiert, aber mobilisiert.',
    'Bekannt für klare Kanten und wenig Spielraum für Abweichungen. Hat loyale Anhänger und entschlossene Kritiker.',
    'Harter Hund mit klarem Kompass. Hält nichts von Kompromissen, die er als Verrat an der Sache betrachtet.',
  ],
};

// ── MINISTERIUMS-DEFINITIONEN ─────────────────────────────────
export const MINISTRY_DEFS = [
  {
    name:          'Finanzen',
    icon:          '€',
    ressortKey:    null,
    statPaths:     ['economy.debtRatio', 'economy.taxRevenue'],
    lawCategories: ['wirtschaft'],
    neutralFrac:   null,
    description:   'Hüter der Staatsfinanzen und des Bundeshaushalts',
  },
  {
    name:          'Innen',
    icon:          '🏛',
    ressortKey:    'sicherheit',
    statPaths:     ['society.securityFeeling'],
    lawCategories: ['sicherheit'],
    neutralFrac:   0.07,
    description:   'Innere Sicherheit, Polizei und Verfassungsschutz',
  },
  {
    name:          'Außen',
    icon:          '🌍',
    ressortKey:    null,
    statPaths:     ['politics.euRelations', 'politics.usRelations'],
    lawCategories: ['international'],
    neutralFrac:   null,
    description:   'Außenpolitik und internationale Beziehungen',
  },
  {
    name:          'Wirtschaft',
    icon:          '📊',
    ressortKey:    'wirtschaft',
    statPaths:     ['economy.gdpIndex', 'economy.tradeBalance'],
    lawCategories: ['wirtschaft'],
    neutralFrac:   0.05,
    description:   'Wirtschaftspolitik, Industrie und Handel',
  },
  {
    name:          'Arbeit',
    icon:          '⚒',
    ressortKey:    'soziales',
    statPaths:     ['economy.unemployment', 'society.socialJustice'],
    lawCategories: ['soziales'],
    neutralFrac:   0.21,
    description:   'Arbeitsmarkt, Sozialversicherung und Gewerkschaften',
  },
  {
    name:          'Verteidigung',
    icon:          '🛡',
    ressortKey:    'verteidigung',
    statPaths:     ['politics.usRelations', 'society.securityFeeling'],
    lawCategories: ['international'],
    neutralFrac:   0.24,
    description:   'Bundeswehr, NATO-Verpflichtungen und Rüstung',
  },
  {
    name:          'Umwelt',
    icon:          '🌱',
    ressortKey:    'klima',
    statPaths:     ['society.climateProgress'],
    lawCategories: ['klima'],
    neutralFrac:   0.11,
    description:   'Klimaschutz, Energie und Naturschutz',
  },
  {
    name:          'Gesundheit',
    icon:          '⚕',
    ressortKey:    'gesundheit',
    statPaths:     ['society.healthcareQuality'],
    lawCategories: ['soziales'],
    neutralFrac:   0.10,
    description:   'Gesundheitssystem, Krankenkassen und Pflege',
  },
  {
    name:          'Justiz',
    icon:          '⚖',
    ressortKey:    'sicherheit',
    statPaths:     ['society.securityFeeling'],
    lawCategories: ['sicherheit'],
    neutralFrac:   0.07,
    description:   'Rechtsstaat, Strafverfolgung und Justizreform',
  },
  {
    name:          'Soziales',
    icon:          '🤝',
    ressortKey:    'soziales',
    statPaths:     ['society.socialJustice', 'society.publicSatisfaction'],
    lawCategories: ['soziales'],
    neutralFrac:   0.21,
    description:   'Sozialhilfe, Rente und gesellschaftliche Teilhabe',
  },
  {
    name:          'Bildung',
    icon:          '🎓',
    ressortKey:    'bildung',
    statPaths:     ['economy.gdpIndex'],
    lawCategories: ['soziales'],
    neutralFrac:   0.08,
    description:   'Schulen, Hochschulen und Bildungsreform',
  },
  {
    name:          'Verkehr',
    icon:          '🚆',
    ressortKey:    'infrastruktur',
    statPaths:     ['society.infrastructureState'],
    lawCategories: ['wirtschaft'],
    neutralFrac:   0.10,
    description:   'Straßen, Schienen, Bahn und Mobilität',
  },
  {
    name:          'Digitales',
    icon:          '💻',
    ressortKey:    'wirtschaft',
    statPaths:     ['economy.gdpIndex', 'economy.tradeBalance'],
    lawCategories: ['wirtschaft'],
    neutralFrac:   0.05,
    description:   'Digitalisierung, KI und Breitbandausbau',
  },
  {
    name:          'Entwicklung',
    icon:          '🌐',
    ressortKey:    'entwicklung',
    statPaths:     ['politics.euRelations'],
    lawCategories: ['international'],
    neutralFrac:   0.04,
    description:   'Entwicklungshilfe und internationale Zusammenarbeit',
  },
];

// ── INITIATIV-TEMPLATES ───────────────────────────────────────
// personality: welche Persönlichkeit schlägt das typischerweise vor
// (picker wählt eine zufällige aus dem passenden Pool)
export const INITIATIVE_TEMPLATES = [

  // FINANZEN
  {
    id: 'fin-sparpaket',     ministry: 'Finanzen',
    personalities: ['Hardliner', 'Pragmatiker'],
    label: '{name} schlägt Sparpaket vor',
    description: '{titleName} fordert Ausgabenkürzungen um 12 Mrd. € zur Konsolidierung des Bundeshaushalts. Die Schuldenbremse macht Handlungsdruck.',
    choices: [
      { id: 'support', label: 'Unterstützen', desc: 'Vollständige Umsetzung. Haushalt wird konsolidiert.',
        immediateEffects: { 'economy.debtRatio': -4, 'society.publicSatisfaction': -3 },
        coalitionStabilityDelta: -4, ministerSatisfactionDelta: +15, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen', desc: 'Kein Sparpaket. Minister frustriert.',
        immediateEffects: {},
        coalitionStabilityDelta: +2, ministerSatisfactionDelta: -20, ministerCompetenceDelta: -1 },
      { id: 'modify', label: 'Modifizieren', desc: 'Abgeschwächtes Paket — 5 Mrd. € Einsparung.',
        immediateEffects: { 'economy.debtRatio': -1 },
        coalitionStabilityDelta: -2, ministerSatisfactionDelta: -5, ministerCompetenceDelta: 0 },
    ],
  },
  {
    id: 'fin-steuerreform',  ministry: 'Finanzen',
    personalities: ['Karrierist', 'Idealist'],
    label: '{name} schlägt Steuerreform vor',
    description: '{titleName} will mittlere Einkommen steuerlich entlasten und Steuerschlupflöcher für Konzerne schließen.',
    choices: [
      { id: 'support', label: 'Unterstützen', desc: 'Reform wird eingeleitet — dauert 2 Quartale.',
        immediateEffects: { 'society.publicSatisfaction': +4, 'society.socialJustice': +3 },
        delayedEffects: [{ quartersDelay: 2, effects: { 'economy.taxRevenue': +4 }, label: 'Steuerreform greift' }],
        coalitionStabilityDelta: +3, ministerSatisfactionDelta: +12, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen', desc: 'Status quo bleibt.',
        immediateEffects: {}, coalitionStabilityDelta: -5, ministerSatisfactionDelta: -15, ministerCompetenceDelta: 0 },
      { id: 'modify', label: 'Modifizieren', desc: 'Nur die Entlastung, keine Konzernregeln.',
        immediateEffects: { 'society.publicSatisfaction': +2 },
        coalitionStabilityDelta: -2, ministerSatisfactionDelta: -4, ministerCompetenceDelta: 0 },
    ],
  },

  // INNEN
  {
    id: 'inn-polizeipersonal',  ministry: 'Innen',
    personalities: ['Hardliner', 'Pragmatiker'],
    label: '{name} fordert 10.000 neue Polizistenstellen',
    description: '{titleName} will massiv in Polizeipersonal investieren. Die Gewerkschaft der Polizei jubelt, Haushälter stöhnen.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'society.securityFeeling': +5, 'economy.debtRatio': +2 },
        coalitionStabilityDelta: +3, ministerSatisfactionDelta: +12, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -6, ministerSatisfactionDelta: -18, ministerCompetenceDelta: -1 },
      { id: 'modify', label: 'Modifizieren', desc: '3.000 Stellen als Kompromiss.',
        immediateEffects: { 'society.securityFeeling': +2 },
        coalitionStabilityDelta: -3, ministerSatisfactionDelta: -5, ministerCompetenceDelta: 0 },
    ],
  },
  {
    id: 'inn-abschiebung',  ministry: 'Innen',
    personalities: ['Hardliner'],
    label: '{name} fordert verschärfte Abschieberegelungen',
    description: '{titleName} will Abschiebungen in bestimmte Länder beschleunigen und Ausreisepflichten konsequenter durchsetzen.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'society.securityFeeling': +4, 'politics.euRelations': -5, 'politics.coalitionStability': -8 },
        coalitionStabilityDelta: -8, ministerSatisfactionDelta: +15, ministerCompetenceDelta: 0 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -3, ministerSatisfactionDelta: -18, ministerCompetenceDelta: 0 },
      { id: 'modify', label: 'Modifizieren',
        immediateEffects: { 'society.securityFeeling': +2 },
        coalitionStabilityDelta: -5, ministerSatisfactionDelta: -8, ministerCompetenceDelta: 0 },
    ],
  },

  // AUßEN
  {
    id: 'aus-eu-gipfel',  ministry: 'Außen',
    personalities: ['Idealist', 'Karrierist'],
    label: '{name} schlägt EU-Sondergipfel vor',
    description: '{titleName} will Deutschland als Initiatorin eines europäischen Reformgipfels positionieren — und nebenbei internationale Präsenz zeigen.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'politics.euRelations': +6, 'politics.mediaRelations': +4 },
        coalitionStabilityDelta: +2, ministerSatisfactionDelta: +10, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -3, ministerSatisfactionDelta: -12, ministerCompetenceDelta: 0 },
      { id: 'modify', label: 'Modifizieren', desc: 'Kleineres bilaterales Format statt Gipfel.',
        immediateEffects: { 'politics.euRelations': +3 },
        coalitionStabilityDelta: -1, ministerSatisfactionDelta: -4, ministerCompetenceDelta: 0 },
    ],
  },
  {
    id: 'aus-nato-druck',  ministry: 'Außen',
    personalities: ['Pragmatiker', 'Hardliner'],
    label: '{name} drängt auf NATO-Sondertreffen',
    description: '{titleName} sieht Deutschland in der Pflicht, mehr Führungsverantwortung in der Allianz zu übernehmen.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'politics.usRelations': +5, 'society.securityFeeling': +3 },
        coalitionStabilityDelta: -3, ministerSatisfactionDelta: +10, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -2, ministerSatisfactionDelta: -10, ministerCompetenceDelta: 0 },
      { id: 'modify', label: 'Modifizieren',
        immediateEffects: { 'politics.usRelations': +2 },
        coalitionStabilityDelta: -1, ministerSatisfactionDelta: -3, ministerCompetenceDelta: 0 },
    ],
  },

  // WIRTSCHAFT
  {
    id: 'wir-foerderprogramm',  ministry: 'Wirtschaft',
    personalities: ['Karrierist', 'Pragmatiker'],
    label: '{name} fordert Industrieförderpaket',
    description: '{titleName} schlägt 8 Mrd. € Förderpaket für Schlüsselindustrien vor. Ziel: Investitionen in Deutschland halten.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'economy.gdpIndex': +3, 'economy.debtRatio': +2 },
        delayedEffects: [{ quartersDelay: 3, effects: { 'economy.gdpIndex': +4, 'economy.tradeBalance': +3 }, label: 'Industrieförderung entfaltet Wirkung' }],
        coalitionStabilityDelta: +2, ministerSatisfactionDelta: +12, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -4, ministerSatisfactionDelta: -15, ministerCompetenceDelta: 0 },
      { id: 'modify', label: 'Modifizieren', desc: '3 Mrd. € Paket, enger gefasst.',
        immediateEffects: { 'economy.gdpIndex': +1 },
        coalitionStabilityDelta: -1, ministerSatisfactionDelta: -4, ministerCompetenceDelta: 0 },
    ],
  },
  {
    id: 'wir-buerokratie',  ministry: 'Wirtschaft',
    personalities: ['FDP', 'Pragmatiker'],
    label: '{name} will Bürokratieabbau beschleunigen',
    description: '{titleName} legt Entlastungspaket für Unternehmen vor: 200 Formulare werden abgeschafft, Genehmigungen digitalisiert.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'economy.gdpIndex': +2, 'economy.tradeBalance': +2 },
        coalitionStabilityDelta: +4, ministerSatisfactionDelta: +10, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -5, ministerSatisfactionDelta: -18, ministerCompetenceDelta: -1 },
      { id: 'modify', label: 'Modifizieren',
        immediateEffects: { 'economy.gdpIndex': +1 },
        coalitionStabilityDelta: +1, ministerSatisfactionDelta: -3, ministerCompetenceDelta: 0 },
    ],
  },

  // ARBEIT
  {
    id: 'arb-weiterbildung',  ministry: 'Arbeit',
    personalities: ['Idealist', 'Pragmatiker'],
    label: '{name} schlägt Weiterbildungsoffensive vor',
    description: '{titleName} will mit 4 Mrd. € eine nationale Qualifizierungsinitiative starten — Umschulung für strukturellen Wandel.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'economy.unemployment': +3 },
        delayedEffects: [{ quartersDelay: 4, effects: { 'economy.gdpIndex': +4, 'economy.unemployment': +4 }, label: 'Qualifizierungsoffensive zeigt Wirkung' }],
        coalitionStabilityDelta: +3, ministerSatisfactionDelta: +12, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -3, ministerSatisfactionDelta: -14, ministerCompetenceDelta: 0 },
      { id: 'modify', label: 'Modifizieren',
        immediateEffects: {},
        delayedEffects: [{ quartersDelay: 4, effects: { 'economy.unemployment': +2 }, label: 'Kleinere Weiterbildungsmaßnahmen greifen' }],
        coalitionStabilityDelta: -1, ministerSatisfactionDelta: -4, ministerCompetenceDelta: 0 },
    ],
  },

  // VERTEIDIGUNG
  {
    id: 'ver-ruestung',  ministry: 'Verteidigung',
    personalities: ['Hardliner', 'Karrierist'],
    label: '{name} fordert Sondervermögen für Bundeswehr',
    description: '{titleName} schlägt 20 Mrd. € Sondervermögen für Rüstungsbeschaffung vor. NATO-Partner signalisieren Unterstützung.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'politics.usRelations': +6, 'society.securityFeeling': +4, 'economy.debtRatio': +4 },
        coalitionStabilityDelta: -5, ministerSatisfactionDelta: +15, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: { 'politics.usRelations': -3 },
        coalitionStabilityDelta: -3, ministerSatisfactionDelta: -20, ministerCompetenceDelta: -1 },
      { id: 'modify', label: 'Modifizieren', desc: '8 Mrd. € als Kompromiss.',
        immediateEffects: { 'politics.usRelations': +3, 'economy.debtRatio': +2 },
        coalitionStabilityDelta: -2, ministerSatisfactionDelta: -5, ministerCompetenceDelta: 0 },
    ],
  },

  // UMWELT
  {
    id: 'umw-naturschutz',  ministry: 'Umwelt',
    personalities: ['Idealist'],
    label: '{name} schlägt nationales Naturschutzprogramm vor',
    description: '{titleName} fordert 30% aller Landesfläche als Naturschutzgebiet bis 2035 — ambitionierter als EU-Vorgaben.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'society.climateProgress': +6, 'politics.euRelations': +4 },
        delayedEffects: [{ quartersDelay: 3, effects: { 'society.publicSatisfaction': +2 }, label: 'Naturschutz wirkt positiv auf Stimmung' }],
        coalitionStabilityDelta: -4, ministerSatisfactionDelta: +15, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -6, ministerSatisfactionDelta: -20, ministerCompetenceDelta: -1 },
      { id: 'modify', label: 'Modifizieren', desc: '20% Schutzfläche als realistisches Ziel.',
        immediateEffects: { 'society.climateProgress': +3 },
        coalitionStabilityDelta: -2, ministerSatisfactionDelta: -6, ministerCompetenceDelta: 0 },
    ],
  },
  {
    id: 'umw-energiesparen',  ministry: 'Umwelt',
    personalities: ['Pragmatiker', 'Karrierist'],
    label: '{name} startet Energiespar-Kampagne',
    description: '{titleName} will mit Aufklärungskampagne und Förderanreizen den Energieverbrauch privater Haushalte um 15% senken.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'society.climateProgress': +3, 'politics.mediaRelations': +3 },
        coalitionStabilityDelta: +2, ministerSatisfactionDelta: +8, ministerCompetenceDelta: +1 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -2, ministerSatisfactionDelta: -10, ministerCompetenceDelta: 0 },
      { id: 'modify', label: 'Modifizieren',
        immediateEffects: { 'society.climateProgress': +1 },
        coalitionStabilityDelta: 0, ministerSatisfactionDelta: -2, ministerCompetenceDelta: 0 },
    ],
  },

  // GESUNDHEIT
  {
    id: 'ges-kassenbeitrag',  ministry: 'Gesundheit',
    personalities: ['Pragmatiker', 'Hardliner'],
    label: '{name} will Krankenkassenbeiträge stabilisieren',
    description: '{titleName} schlägt Strukturreform der GKV vor, um Beitragserhöhungen der nächsten Jahre zu verhindern.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'society.healthcareQuality': +3, 'society.publicSatisfaction': +3 },
        delayedEffects: [{ quartersDelay: 3, effects: { 'economy.taxRevenue': +2 }, label: 'GKV-Reform spart Lohnnebenkosten' }],
        coalitionStabilityDelta: +3, ministerSatisfactionDelta: +12, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -3, ministerSatisfactionDelta: -14, ministerCompetenceDelta: 0 },
      { id: 'modify', label: 'Modifizieren',
        immediateEffects: { 'society.healthcareQuality': +1 },
        coalitionStabilityDelta: -1, ministerSatisfactionDelta: -4, ministerCompetenceDelta: 0 },
    ],
  },

  // JUSTIZ
  {
    id: 'jus-gefaengnisreform',  ministry: 'Justiz',
    personalities: ['Idealist'],
    label: '{name} fordert Gefängnisreform',
    description: '{titleName} will Resozialisierung stärken und Überbelegung in Justizvollzugsanstalten abbauen.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'society.socialJustice': +4, 'society.securityFeeling': -2 },
        coalitionStabilityDelta: -4, ministerSatisfactionDelta: +12, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -3, ministerSatisfactionDelta: -14, ministerCompetenceDelta: 0 },
      { id: 'modify', label: 'Modifizieren',
        immediateEffects: { 'society.socialJustice': +2 },
        coalitionStabilityDelta: -2, ministerSatisfactionDelta: -5, ministerCompetenceDelta: 0 },
    ],
  },

  // SOZIALES
  {
    id: 'soz-grundsicherung',  ministry: 'Soziales',
    personalities: ['Idealist', 'Karrierist'],
    label: '{name} schlägt Reform der Grundsicherung vor',
    description: '{titleName} will Bürgergeld um 12% erhöhen und Leistungen für Kinder ausweiten.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'society.socialJustice': +5, 'society.publicSatisfaction': +3, 'economy.debtRatio': +2 },
        coalitionStabilityDelta: -4, ministerSatisfactionDelta: +12, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -5, ministerSatisfactionDelta: -16, ministerCompetenceDelta: 0 },
      { id: 'modify', label: 'Modifizieren',
        immediateEffects: { 'society.socialJustice': +2, 'economy.debtRatio': +1 },
        coalitionStabilityDelta: -2, ministerSatisfactionDelta: -5, ministerCompetenceDelta: 0 },
    ],
  },

  // BILDUNG
  {
    id: 'bil-ganztagsschule',  ministry: 'Bildung',
    personalities: ['Idealist', 'Pragmatiker'],
    label: '{name} fordert Ganztagsschulausbau',
    description: '{titleName} will Rechtsanspruch auf Ganztagsschule vollumfänglich finanzieren — Investition in die nächste Generation.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'economy.debtRatio': +2 },
        delayedEffects: [{ quartersDelay: 5, effects: { 'economy.gdpIndex': +3, 'society.socialJustice': +3 }, label: 'Bildungsinvestition zeigt Wirkung' }],
        coalitionStabilityDelta: +2, ministerSatisfactionDelta: +12, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -4, ministerSatisfactionDelta: -14, ministerCompetenceDelta: 0 },
      { id: 'modify', label: 'Modifizieren',
        immediateEffects: {},
        delayedEffects: [{ quartersDelay: 5, effects: { 'economy.gdpIndex': +1 }, label: 'Teilweise Bildungsmaßnahmen wirken' }],
        coalitionStabilityDelta: -1, ministerSatisfactionDelta: -4, ministerCompetenceDelta: 0 },
    ],
  },

  // VERKEHR
  {
    id: 'ver-infrastruktur',  ministry: 'Verkehr',
    personalities: ['Pragmatiker', 'Hardliner'],
    label: '{name} fordert Infrastrukturoffensive',
    description: '{titleName} will marode Brücken und Schienen mit einem Sonderprogramm von 15 Mrd. € sanieren.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'society.infrastructureState': +5, 'economy.debtRatio': +3 },
        delayedEffects: [{ quartersDelay: 3, effects: { 'economy.gdpIndex': +3 }, label: 'Infrastrukturprogramm stärkt Wirtschaft' }],
        coalitionStabilityDelta: +3, ministerSatisfactionDelta: +12, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -3, ministerSatisfactionDelta: -14, ministerCompetenceDelta: 0 },
      { id: 'modify', label: 'Modifizieren', desc: '6 Mrd. € für kritische Sanierungen.',
        immediateEffects: { 'society.infrastructureState': +2 },
        coalitionStabilityDelta: -1, ministerSatisfactionDelta: -4, ministerCompetenceDelta: 0 },
    ],
  },

  // DIGITALES
  {
    id: 'dig-e-government',  ministry: 'Digitales',
    personalities: ['Karrierist', 'Pragmatiker'],
    label: '{name} drängt auf E-Government-Offensive',
    description: '{titleName} will 200 Behördenleistungen digitalisieren. Deutschland soll Schlusslicht der EU-Digitalisierung überwinden.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'economy.gdpIndex': +2, 'politics.mediaRelations': +3 },
        delayedEffects: [{ quartersDelay: 3, effects: { 'economy.gdpIndex': +3, 'economy.taxRevenue': +2 }, label: 'Digitalisierung spart Kosten und stärkt Wirtschaft' }],
        coalitionStabilityDelta: +3, ministerSatisfactionDelta: +10, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -4, ministerSatisfactionDelta: -14, ministerCompetenceDelta: 0 },
      { id: 'modify', label: 'Modifizieren',
        immediateEffects: { 'politics.mediaRelations': +1 },
        coalitionStabilityDelta: -1, ministerSatisfactionDelta: -3, ministerCompetenceDelta: 0 },
    ],
  },

  // ENTWICKLUNG
  {
    id: 'ent-hilfspaket',  ministry: 'Entwicklung',
    personalities: ['Idealist'],
    label: '{name} fordert erhöhte Entwicklungshilfe',
    description: '{titleName} will Deutschland zur 0,7%-BNE-Marke bei Entwicklungshilfe führen — ein Versprechen das jahrzehntelang gebrochen wurde.',
    choices: [
      { id: 'support', label: 'Unterstützen',
        immediateEffects: { 'politics.euRelations': +4, 'economy.debtRatio': +2 },
        coalitionStabilityDelta: -3, ministerSatisfactionDelta: +12, ministerCompetenceDelta: +2 },
      { id: 'reject', label: 'Ablehnen',
        immediateEffects: {},
        coalitionStabilityDelta: -3, ministerSatisfactionDelta: -16, ministerCompetenceDelta: 0 },
      { id: 'modify', label: 'Modifizieren',
        immediateEffects: { 'politics.euRelations': +2 },
        coalitionStabilityDelta: -1, ministerSatisfactionDelta: -5, ministerCompetenceDelta: 0 },
    ],
  },
];

// ── SKANDAL-TYPEN ─────────────────────────────────────────────
export const SCANDAL_TYPES = [
  {
    id: 'korruption',
    label: 'Korruptionsvorwurf',
    eventLabel: '{titleName} ({ministry}) steht unter Korruptionsverdacht',
    description: 'Investigativjournalisten berichten, {name} soll Gegenleistungen für Behördenentscheidungen angenommen haben. Die Opposition fordert sofortigen Rücktritt.',
    competenceThreshold: 50, // häufiger bei niedrig kompetenten
    choices: [
      { id: 'keep',        label: 'Im Amt halten',
        desc: 'Sie stehen zu Ihrem Minister. Der Mediengegenwind ist stark.',
        immediateEffects: { 'politics.mediaRelations': -15, 'society.publicSatisfaction': -4 },
        coalitionStabilityDelta: +5, ministerSatisfactionDelta: +10, clearScandal: true },
      { id: 'fire',        label: 'Entlassen',
        desc: 'Sie ziehen die Konsequenzen. Die Koalitionspartner sind nicht begeistert.',
        immediateEffects: { 'politics.mediaRelations': +10 },
        coalitionStabilityDelta: -10, firesMinister: true, clearScandal: true },
      { id: 'investigate', label: 'Untersuchungsausschuss',
        desc: 'Kein voreiliges Urteil — ein Ausschuss soll Licht ins Dunkel bringen. Dauert 2 Quartale.',
        immediateEffects: { 'politics.mediaRelations': -5 },
        coalitionStabilityDelta: -5, ministerSatisfactionDelta: -10, startsInvestigation: 2 },
    ],
  },
  {
    id: 'aussagen',
    label: 'Aussagen-Skandal',
    eventLabel: '{titleName} sorgt mit Aussage für Empörung',
    description: '{name} hat bei einem Kongress eine Aussage gemacht, die als diskriminierend interpretiert wird. Social Media brodelt, die Presse fordert Erklärungen.',
    competenceThreshold: 60,
    choices: [
      { id: 'keep',        label: 'Minister verteidigen',
        desc: 'Missverständnis — der Minister bleibt im Amt.',
        immediateEffects: { 'politics.mediaRelations': -10, 'society.publicSatisfaction': -3 },
        coalitionStabilityDelta: +4, ministerSatisfactionDelta: +8, clearScandal: true },
      { id: 'fire',        label: 'Entlassen',
        desc: 'Klare Kante — das Kabinett steht für andere Werte.',
        immediateEffects: { 'politics.mediaRelations': +5 },
        coalitionStabilityDelta: -10, firesMinister: true, clearScandal: true },
      { id: 'investigate', label: 'Untersuchungsausschuss',
        desc: 'Formale Überprüfung einleiten.',
        immediateEffects: { 'politics.mediaRelations': -4 },
        coalitionStabilityDelta: -4, ministerSatisfactionDelta: -10, startsInvestigation: 2 },
    ],
  },
  {
    id: 'dienstwagen',
    label: 'Dienstwagenaffäre',
    eventLabel: '{titleName} nutzt Dienstwagen für Privatfahrten',
    description: 'Recherchen zeigen, dass {name} den Dienstwagen regelmäßig für private Zwecke nutzt. Kleinlich, aber politisch toxisch in Zeiten knapper Kassen.',
    competenceThreshold: 70,
    choices: [
      { id: 'keep',        label: 'Im Amt halten',
        desc: 'Formale Entschuldigung und interne Rüge.',
        immediateEffects: { 'politics.mediaRelations': -8 },
        coalitionStabilityDelta: +3, ministerSatisfactionDelta: -5, clearScandal: true },
      { id: 'fire',        label: 'Entlassen',
        desc: 'Zero Tolerance für Privilegienmissbrauch.',
        immediateEffects: { 'politics.mediaRelations': +4, 'society.publicSatisfaction': +2 },
        coalitionStabilityDelta: -10, firesMinister: true, clearScandal: true },
      { id: 'investigate', label: 'Untersuchungsausschuss',
        desc: 'Formelle Überprüfung — etwas überdimensioniert für den Vorwurf.',
        immediateEffects: { 'politics.mediaRelations': -3 },
        coalitionStabilityDelta: -2, ministerSatisfactionDelta: -8, startsInvestigation: 2 },
    ],
  },
  {
    id: 'lobbyismus',
    label: 'Lobbyismus-Verdacht',
    eventLabel: '{titleName} traf sich heimlich mit Industrievertretern',
    description: 'Einem Bericht zufolge hat {name} mehrfach nicht protokollierte Treffen mit Lobbyistengruppen geführt. Das Vertrauen in politische Integrität leidet.',
    competenceThreshold: 55,
    choices: [
      { id: 'keep',        label: 'Im Amt halten',
        desc: 'Lobbyarbeit gehört zum Regierungsalltag — aber Transparenz wird zugesagt.',
        immediateEffects: { 'politics.mediaRelations': -12, 'society.publicSatisfaction': -3 },
        coalitionStabilityDelta: +4, ministerSatisfactionDelta: +6, clearScandal: true },
      { id: 'fire',        label: 'Entlassen',
        desc: 'Transparenz-Verstöße werden nicht toleriert.',
        immediateEffects: { 'politics.mediaRelations': +8 },
        coalitionStabilityDelta: -10, firesMinister: true, clearScandal: true },
      { id: 'investigate', label: 'Untersuchungsausschuss',
        desc: 'Parlamentarische Aufklärung einleiten.',
        immediateEffects: { 'politics.mediaRelations': -6 },
        coalitionStabilityDelta: -4, ministerSatisfactionDelta: -10, startsInvestigation: 2 },
    ],
  },
];
