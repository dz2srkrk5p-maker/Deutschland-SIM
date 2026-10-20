// ============================================================
// COAL-NEG-DATA.JS — Alle Konstanten für die Koalitionsverhandlung
// ============================================================

// ── ARBEITSGRUPPEN ───────────────────────────────────────────

export const WORKING_GROUPS = [
  {
    id: 'finanzen',
    label: 'Finanzen & Haushalt',
    short: 'Finanzen',
    color: '#388bfd',
    subTopics: [
      {
        id: 'schuldenbremse',
        label: 'Schuldenbremse',
        description: 'Soll die Schuldenbremse im Grundgesetz unverändert bleiben?',
        leftLabel: 'Reformieren / Aussetzen',
        rightLabel: 'Unverändert erhalten',
        partyPositions: { CDU: 78, SPD: 32, Grüne: 22, FDP: 95, Linke: 5, BSW: 38 },
        formulationTemplate: 'die Schuldenbremse im Grundgesetz beizubehalten',
      },
      {
        id: 'sondervermoegen',
        label: 'Investitions-Sondervermögen',
        description: 'Einmaliges Investitionssondervermögen außerhalb der Schuldenbremse (100–200 Mrd. €)',
        leftLabel: 'Ablehnen',
        rightLabel: 'Großes Volumen',
        partyPositions: { CDU: 30, SPD: 72, Grüne: 78, FDP: 15, Linke: 88, BSW: 65 },
        formulationTemplate: 'ein Investitionssondervermögen aufzulegen',
      },
      {
        id: 'steuern',
        label: 'Steuerreform',
        description: 'Wer soll steuerlich entlastet werden: Unternehmen oder Arbeitnehmer?',
        leftLabel: 'Kapital / Unternehmen',
        rightLabel: 'Arbeitnehmer / Geringverdiener',
        partyPositions: { CDU: 35, SPD: 78, Grüne: 68, FDP: 20, Linke: 92, BSW: 75 },
        formulationTemplate: 'untere Einkommensgruppen steuerlich zu entlasten',
      },
    ],
  },
  {
    id: 'soziales',
    label: 'Soziales & Arbeit',
    short: 'Soziales',
    color: '#f85149',
    subTopics: [
      {
        id: 'mindestlohn',
        label: 'Mindestlohn',
        description: 'Anhebung des gesetzlichen Mindestlohns auf 15€ (und automatische Anpassung)',
        leftLabel: 'Kein Anstieg / Flexibel',
        rightLabel: '15€+ sofort',
        partyPositions: { CDU: 38, SPD: 92, Grüne: 85, FDP: 22, Linke: 98, BSW: 88 },
        formulationTemplate: 'den Mindestlohn auf 15 Euro anzuheben',
      },
      {
        id: 'rente',
        label: 'Rentenreform',
        description: 'Aktienrente, Rentenniveau-Haltelinie und Beitragsstabilität bis 2040',
        leftLabel: 'Kapitaldeckung / Reform',
        rightLabel: 'Stabiles Rentenniveau 48%',
        partyPositions: { CDU: 48, SPD: 80, Grüne: 70, FDP: 62, Linke: 90, BSW: 85 },
        formulationTemplate: 'das Rentenniveau dauerhaft zu sichern',
      },
      {
        id: 'buergergeld',
        label: 'Bürgergeld-Reform',
        description: 'Sanktionen, Zuverdienst und Transferhöhe im Bürgergeld',
        leftLabel: 'Stark kürzen / Abschaffen',
        rightLabel: 'Beibehalten / Erhöhen',
        partyPositions: { CDU: 18, SPD: 78, Grüne: 72, FDP: 12, Linke: 95, BSW: 82 },
        formulationTemplate: 'das Bürgergeld in seiner Grundstruktur zu erhalten',
      },
    ],
  },
  {
    id: 'klima',
    label: 'Klima & Energie',
    short: 'Klima',
    color: '#3fb950',
    subTopics: [
      {
        id: 'klimageld',
        label: 'Klimageld',
        description: 'Pro-Kopf-Rückerstattung der CO₂-Bepreisung an alle Bürgerinnen und Bürger',
        leftLabel: 'Ablehnen',
        rightLabel: 'Sofort einführen',
        partyPositions: { CDU: 28, SPD: 68, Grüne: 92, FDP: 52, Linke: 85, BSW: 45 },
        formulationTemplate: 'das Klimageld einzuführen',
      },
      {
        id: 'ausbau',
        label: 'Erneuerbare Energien',
        description: 'Ausbauziel für Wind und Solar sowie Abschaltplan für fossile Kraftwerke',
        leftLabel: 'Langsam / Technologieoffen',
        rightLabel: 'Schnell / Klarer Ausstiegsplan',
        partyPositions: { CDU: 52, SPD: 70, Grüne: 96, FDP: 55, Linke: 88, BSW: 40 },
        formulationTemplate: 'den Ausbau Erneuerbarer Energien deutlich zu beschleunigen',
      },
      {
        id: 'tempolimit',
        label: 'Tempolimit Autobahn',
        description: 'Allgemeines Tempolimit von 120 km/h auf deutschen Autobahnen',
        leftLabel: 'Kein Tempolimit',
        rightLabel: '120 km/h Limit',
        partyPositions: { CDU: 8, SPD: 55, Grüne: 88, FDP: 2, Linke: 80, BSW: 35 },
        formulationTemplate: 'ein allgemeines Tempolimit auf Autobahnen einzuführen',
      },
    ],
  },
  {
    id: 'sicherheit',
    label: 'Sicherheit & Migration',
    short: 'Sicherheit',
    color: '#d29922',
    subTopics: [
      {
        id: 'grenzkontrollen',
        label: 'Grenzkontrollen',
        description: 'Stationäre Grenzkontrollen und Zurückweisungen an deutschen Grenzen',
        leftLabel: 'Ablehnen / Europäisch',
        rightLabel: 'Sofort einführen',
        partyPositions: { CDU: 82, SPD: 42, Grüne: 12, FDP: 58, Linke: 8, BSW: 72 },
        formulationTemplate: 'stationäre Grenzkontrollen dauerhaft einzuführen',
      },
      {
        id: 'abschiebungen',
        label: 'Abschiebungsrecht',
        description: 'Verschärfung der Abschiebungsgesetze und -praxis',
        leftLabel: 'Liberaler Ansatz',
        rightLabel: 'Konsequente Durchsetzung',
        partyPositions: { CDU: 88, SPD: 38, Grüne: 10, FDP: 55, Linke: 5, BSW: 68 },
        formulationTemplate: 'konsequente Abschiebungen abgelehnter Asylbewerber durchzusetzen',
      },
      {
        id: 'innere-sicherheit',
        label: 'Innere Sicherheit',
        description: 'Mehr Personal, Befugnisse und Ausstattung für Sicherheitsbehörden',
        leftLabel: 'Bürgerrechte stärken',
        rightLabel: 'Sicherheit ausbauen',
        partyPositions: { CDU: 85, SPD: 60, Grüne: 30, FDP: 62, Linke: 15, BSW: 70 },
        formulationTemplate: 'Sicherheitsbehörden personell und technisch auszubauen',
      },
    ],
  },
  {
    id: 'außen',
    label: 'Außen & Verteidigung',
    short: 'Außen',
    color: '#a371f7',
    subTopics: [
      {
        id: 'nato-ziel',
        label: '2%-NATO-Ziel',
        description: 'Dauerhaftes Erreichen des NATO-Verteidigungsziels von 2% des BIP',
        leftLabel: 'Unter 2% / Abrüstung',
        rightLabel: 'Über 2% anstreben',
        partyPositions: { CDU: 88, SPD: 65, Grüne: 55, FDP: 80, Linke: 8, BSW: 25 },
        formulationTemplate: 'das NATO-Ziel von 2% BIP für Verteidigung dauerhaft zu erreichen',
      },
      {
        id: 'ukraine',
        label: 'Ukraine-Unterstützung',
        description: 'Umfang und Art der deutschen Militär- und Wirtschaftshilfe für die Ukraine',
        leftLabel: 'Verhandlungslösung fördern',
        rightLabel: 'Maximale Unterstützung',
        partyPositions: { CDU: 82, SPD: 68, Grüne: 88, FDP: 72, Linke: 20, BSW: 15 },
        formulationTemplate: 'die Ukraine mit allen vertretbaren Mitteln zu unterstützen',
      },
      {
        id: 'eu-integration',
        label: 'EU-Vertiefung',
        description: 'Mehr europäische Integration und Souveränitätsübertragung',
        leftLabel: 'Nationale Souveränität',
        rightLabel: 'Mehr Europa',
        partyPositions: { CDU: 62, SPD: 72, Grüne: 88, FDP: 70, Linke: 52, BSW: 28 },
        formulationTemplate: 'die europäische Integration konsequent voranzutreiben',
      },
    ],
  },
];

// ── PARTEICHEFS & PERSÖNLICHKEITEN ───────────────────────────

export const PARTY_LEADERS = {
  CDU:   { name: 'Friedrich Merz',      personality: 'Hardliner',   icon: '◆' },
  SPD:   { name: 'Lars Klingbeil',      personality: 'Pragmatiker', icon: '⇄' },
  Grüne: { name: 'Annalena Baerbock',   personality: 'Idealist',    icon: '★' },
  FDP:   { name: 'Christian Lindner',   personality: 'Egomane',     icon: '✦' },
  Linke: { name: 'Jan van Aken',        personality: 'Idealist',    icon: '★' },
  BSW:   { name: 'Sahra Wagenknecht',   personality: 'Hardliner',   icon: '◆' },
};

export const PERSONALITY_LABELS = {
  Hardliner:   { label: 'Hardliner',   desc: 'Gibt nie ohne Gegenleistung nach. Maximaler Druck.',               color: '#f85149' },
  Pragmatiker: { label: 'Pragmatiker', desc: 'Kompromissbereit, fordert aber immer konkrete Gegenleistung.',     color: '#388bfd' },
  Egomane:     { label: 'Egomane',     desc: 'Braucht Anerkennung. Prestigeministerium erhöht Kooperationsbereitschaft.', color: '#d29922' },
  Idealist:    { label: 'Idealist',    desc: 'Bricht bei kleinsten Kernwert-Verletzungen ab. Unberechenbar.',    color: '#3fb950' },
};

// ── SHOWSTOPPER (2 pro Partei) ────────────────────────────────

export const PARTY_SHOWSTOPPERS = {
  CDU: [
    { id: 'cdu-1', label: 'Schuldenbremse bleibt unverändert', agId: 'finanzen',   topicId: 'schuldenbremse',   cond: 'gte', threshold: 65, formulations: ['binding', 'aspiring'] },
    { id: 'cdu-2', label: 'Grenzkontrollen und Zurückweisungen', agId: 'sicherheit', topicId: 'grenzkontrollen', cond: 'gte', threshold: 60, formulations: ['binding', 'aspiring'] },
  ],
  SPD: [
    { id: 'spd-1', label: 'Mindestlohn mindestens 15€',        agId: 'soziales',   topicId: 'mindestlohn',      cond: 'gte', threshold: 68, formulations: ['binding', 'aspiring'] },
    { id: 'spd-2', label: 'Bürgergeld bleibt in Grundstruktur',agId: 'soziales',   topicId: 'buergergeld',      cond: 'gte', threshold: 42, formulations: ['binding', 'aspiring'] },
  ],
  Grüne: [
    { id: 'gru-1', label: 'Klimageld wird eingeführt',          agId: 'klima',      topicId: 'klimageld',        cond: 'gte', threshold: 62, formulations: ['binding', 'aspiring'] },
    { id: 'gru-2', label: 'Ausbaupfad Erneuerbare 2030',        agId: 'klima',      topicId: 'ausbau',           cond: 'gte', threshold: 72, formulations: ['binding'] },
  ],
  FDP: [
    { id: 'fdp-1', label: 'Keine Steuererhöhungen',             agId: 'finanzen',   topicId: 'steuern',          cond: 'lte', threshold: 42, formulations: ['binding', 'aspiring'] },
    { id: 'fdp-2', label: 'Schuldenbremse sakrosankt',          agId: 'finanzen',   topicId: 'schuldenbremse',   cond: 'gte', threshold: 70, formulations: ['binding', 'aspiring'] },
  ],
  Linke: [
    { id: 'lin-1', label: 'Keine Abschiebungen in Kriegsgebiete', agId: 'sicherheit', topicId: 'abschiebungen', cond: 'lte', threshold: 32, formulations: ['binding'] },
    { id: 'lin-2', label: 'Mindestlohn 16€+',                   agId: 'soziales',   topicId: 'mindestlohn',      cond: 'gte', threshold: 82, formulations: ['binding', 'aspiring'] },
  ],
  BSW: [
    { id: 'bsw-1', label: 'Keine weiteren Waffenlieferungen',   agId: 'außen',      topicId: 'ukraine',          cond: 'lte', threshold: 38, formulations: ['binding', 'aspiring'] },
    { id: 'bsw-2', label: 'Rentenerhöhung für Geringverdiener', agId: 'soziales',   topicId: 'rente',            cond: 'gte', threshold: 68, formulations: ['aspiring', 'binding'] },
  ],
};

// ── MINISTERIEN-PRIORITÄTEN ───────────────────────────────────

export const MINISTRY_WISH_LISTS = {
  CDU:   { wish: ['Finanzen', 'Innen', 'Wirtschaft', 'Verteidigung'], min: 5 },
  SPD:   { wish: ['Arbeit', 'Außen', 'Gesundheit', 'Soziales'],       min: 3 },
  Grüne: { wish: ['Außen', 'Wirtschaft', 'Umwelt', 'Verkehr'],        min: 2 },
  FDP:   { wish: ['Finanzen', 'Justiz', 'Wirtschaft', 'Digitales'],   min: 2 },
  Linke: { wish: ['Soziales', 'Arbeit', 'Gesundheit'],                min: 2 },
  BSW:   { wish: ['Soziales', 'Innen', 'Außen'],                      min: 1 },
};

// ── FORMULIERUNGSOPTIONEN ─────────────────────────────────────

export const FORMULATIONS = [
  {
    id: 'binding',
    label: 'Wir werden…',
    description: 'Verbindlich — hohe Wirkung, aber Koalitionsspannung wenn nicht erfüllt',
    effectMultiplier: 1.0,
    satisfactionCost: 10,   // Kosten für Partei die nachgibt
    color: '#3fb950',
  },
  {
    id: 'aspiring',
    label: 'Wir streben an…',
    description: 'Absichtserklärung — mittlere Wirkung, wenig Spannung',
    effectMultiplier: 0.6,
    satisfactionCost: 6,
    color: '#d29922',
  },
  {
    id: 'examining',
    label: 'Wir prüfen ob…',
    description: 'Faktisch Nein — kaum Wirkung, gilt aber als "behandelt"',
    effectMultiplier: 0.15,
    satisfactionCost: 2,
    color: '#8b949e',
  },
];

// ── MEDIA-KOMMENTARE ──────────────────────────────────────────

export const MEDIA_TEMPLATES = {
  great:   ['Durchbruch in den Koalitionsgesprächen — Einigung in mehreren Schlüsselbereichen.', 'Überraschend konstruktiver Tag: Alle Arbeitsgruppen machen Fortschritte.', 'Experten sehen Koalition auf der Zielgeraden — Vertragsunterzeichnung in Sichtweite.'],
  good:    ['Langsam aber stetig: Verhandlungsführer berichten von substanziellen Fortschritten.', 'Zähe Gespräche, aber die Parteien bewegen sich aufeinander zu.', 'Erste zaghafte Einigungen — die Atmosphäre soll besser werden.'],
  neutral: ['Koalitionsgespräche ohne spektakuläre Neuigkeiten — Details werden noch verhandelt.', 'Stagnation in Schlüsselbereichen, aber kein Abbruch in Sicht.', 'Politikbeobachter mahnen zur Eile — die Zeit läuft.'],
  bad:     ['Verhandlungskrise: Mehrere Arbeitsgruppen stecken fest, erste Stimmen fordern Neuwahlen.', 'Anonyme Quellen: "Festgefahrene" Gespräche — Abbruch nicht ausgeschlossen.', 'Schlechte Stimmung in den Verhandlungsräumen — Medien sprechen von Scheitern.'],
  leak:    ['Peinlicher Leak erschüttert die Gespräche — Vertrauen der Parteien untereinander beschädigt.', 'Durchgesickert: Geheimpapier zeigt Kluft zwischen öffentlichem und privatem Verhandlungsstil.'],
  nachtsitzung: ['Dramatische Nacht in Berlin: Letzte Chance für eine Einigung — alles auf dem Spiel.', 'Marathonsitzung bis in den Morgen — Verhandlungsführer kämpfen um letzte Details.'],
};

export const LEAK_SUBJECTS = [
  { agId: 'finanzen',   topicId: 'schuldenbremse',  text: 'interne Kompromisslinie zur Schuldenbremse' },
  { agId: 'finanzen',   topicId: 'steuern',          text: 'geheime Steuerpläne' },
  { agId: 'soziales',   topicId: 'mindestlohn',      text: 'Mindestlohn-Untergrenzen im internen Papier' },
  { agId: 'klima',      topicId: 'klimageld',        text: 'Klimageld-Kompromissvorschlag' },
  { agId: 'sicherheit', topicId: 'grenzkontrollen',  text: 'vertrauliche Grenzschutz-Position' },
  { agId: 'außen',      topicId: 'ukraine',          text: 'Ukraine-Hilfsstrategie im internen Papier' },
];

export const AUSSCHUSS_REPS = [
  { id: 'hardliner', label: 'Parteistratege',  desc: 'Verteidigt Koalitionsvertrag kompromisslos. Hohe Reibung, klare Linie.',    effect: 'Koalitionsspannung -20% langsamer, aber +10% bei Krisen.' },
  { id: 'pragmatiker', label: 'Vermittler',    desc: 'Sucht Kompromiss im Koalitionsausschuss. Reduziert Spannung effektiv.',      effect: 'Koalitionsspannung sinkt 30% schneller bei Streit.' },
  { id: 'mediator',   label: 'Medienprofi',    desc: 'Nutzt Öffentlichkeit als Druckmittel. Gut für Umfragen, schlecht intern.',   effect: '+5% Umfragen pro Ausschuss, -5% Koalitionsstabilität.' },
];
