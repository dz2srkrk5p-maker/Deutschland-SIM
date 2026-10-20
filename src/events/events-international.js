// ============================================================
// EVENTS-INTERNATIONAL.JS — Außenpolitik- und Sicherheitsereignisse
//
// Was: Ereignisse für US-Handelskonflikte, China, EU-Haushalt,
//      NATO, Ölpreisschock, Cyberangriff und politische Skandale.
//
// Nutzt: keine Abhängigkeiten
//
// Erweiterungspunkte:
//   - Neue internationale Krisen hier anhängen
//   - Bundeslaender-Außenbeziehungen später hier verankern
// ============================================================

export const EVENTS_INTERNATIONAL = [

  // ── INTERNATIONAL ──────────────────────────────────────────
  {
    id: 'usa-trade-pressure',
    label: 'US-Handelskonflikt',
    description: 'Washington droht mit Strafzöllen auf europäische Waren. Transatlantische Spannungen steigen.',
    trigger: (state) => state.politics.usRelations < 50,
    probability: 0.1,
    immediateEffects: {
      'economy.tradeBalance': -6,
      'politics.usRelations': -10,
    },
    choices: [
      {
        id: 'usa-concede',
        label: 'Zugeständnisse machen (mehr NATO-Ausgaben)',
        immediateEffects: { 'economy.debtRatio': +2, 'politics.usRelations': +15 },
        delayedEffects: [{ quartersDelay: 2, effects: { 'economy.tradeBalance': +5 }, label: 'Handelsstreit beigelegt' }],
        policyArea: 'nato',
        policyPosition: 80,
      },
      {
        id: 'usa-eu-front',
        label: 'EU-Gegenfront aufbauen',
        immediateEffects: { 'politics.euRelations': +8, 'politics.usRelations': -8 },
        internationalReactions: { eu: +10, usa: -10 },
      },
      {
        id: 'usa-negotiate',
        label: 'Direktverhandlungen aufnehmen',
        immediateEffects: { 'economy.debtRatio': +1 },
        delayedEffects: [{ quartersDelay: 3, effects: { 'economy.tradeBalance': +3, 'politics.usRelations': +5 }, label: 'Handelsabkommen in Sicht' }],
      },
    ],
  },

  {
    id: 'china-tech-demand',
    label: 'China fordert Technologietransfer',
    description: 'Peking knüpft Marktzugang an Weitergabe sensibler Technologien. Wirtschaft vs. Sicherheit.',
    trigger: (state) => state.international?.china?.tradeVolume > 55,
    probability: 0.08,
    immediateEffects: {},
    choices: [
      {
        id: 'china-comply',
        label: 'Technologietransfer akzeptieren',
        immediateEffects: { 'economy.tradeBalance': +8, 'politics.usRelations': -12 },
        sideEffect: (state) => { state.international.china.techTransferPressure = true; },
      },
      {
        id: 'china-refuse',
        label: 'Ablehnen, Marktdiversifizierung starten',
        immediateEffects: { 'economy.tradeBalance': -5, 'politics.usRelations': +5 },
        internationalReactions: { china: -12 },
        delayedEffects: [{ quartersDelay: 6, effects: { 'economy.tradeBalance': +4 }, label: 'Neue Handelspartner erschlossen' }],
      },
    ],
  },

  {
    id: 'eu-budget-dispute',
    label: 'EU-Haushaltsdisput',
    description: 'Brüssel fordert mehr Beiträge und Haushaltsdisziplin. Deutschland steht unter Druck.',
    trigger: (state) => state.economy.debtRatio > 35,
    probability: 0.1,
    immediateEffects: { 'politics.euRelations': -8 },
    choices: [
      {
        id: 'eu-comply',
        label: 'EU-Forderungen erfüllen (Ausgaben kürzen)',
        immediateEffects: { 'politics.euRelations': +12, 'society.publicSatisfaction': -8, 'government.budgetBalance': +10 },
        policyArea: 'schuldenbremse',
        policyPosition: 80,
      },
      {
        id: 'eu-negotiate',
        label: 'Sonderregelung aushandeln',
        immediateEffects: { 'politics.euRelations': -3 },
        delayedEffects: [{ quartersDelay: 4, effects: { 'politics.euRelations': +6 }, label: 'EU-Sonderregelung genehmigt' }],
      },
      {
        id: 'eu-ignore',
        label: 'Ignorieren, eigenen Kurs fahren',
        immediateEffects: { 'politics.euRelations': -15, 'economy.tradeBalance': -4 },
      },
    ],
  },

  // ── INTERNATIONALE KONFLIKTE ───────────────────────────────
  {
    id: 'nato-crisis',
    label: 'NATO-Bündnisfall droht',
    description: 'Ein NATO-Mitglied im Baltikum wird militärisch unter extremen Druck gesetzt. Die Alliierten debattieren Artikel 5. Deutschland wird um eine klare Haltung gebeten.',
    trigger: (state) => state.politics.usRelations < 60,
    probability: 0.08,
    immediateEffects: {
      'politics.coalitionStability': -6,
      'society.publicSatisfaction': -4,
    },
    choices: [
      {
        id: 'nato-truppen',
        label: 'Truppen und Mittel entsenden',
        immediateEffects: { 'economy.debtRatio': +4, 'politics.coalitionStability': -10, 'politics.usRelations': +12 },
        policyArea: 'nato',
        policyPosition: 85,
        internationalReactions: { usa: +10, eu: +5 },
        delayedEffects: [
          { quartersDelay: 3, effects: { 'politics.parliamentarySupport': +4 }, label: 'Bündnistreue stärkt internationale Stellung' },
        ],
      },
      {
        id: 'nato-finanziell',
        label: 'Finanzielle Unterstützung, keine Truppen',
        immediateEffects: { 'economy.debtRatio': +3, 'politics.usRelations': +5 },
        internationalReactions: { usa: +3 },
      },
      {
        id: 'nato-vermittler',
        label: 'Vermittlerrolle übernehmen, Waffenstillstand verhandeln',
        immediateEffects: { 'politics.euRelations': +7, 'politics.usRelations': -6, 'politics.coalitionStability': +3 },
        internationalReactions: { eu: +8, usa: -5 },
      },
    ],
  },

  {
    id: 'oil-price-shock',
    label: 'Ölpreisschock',
    description: 'Eskalation im Nahen Osten treibt den Ölpreis auf 180 Dollar. Spritpreise explodieren, Lieferketten kollabieren. Die Industrie schlägt Alarm.',
    trigger: () => true,
    probability: 0.07,
    immediateEffects: {
      'economy.gdpIndex': -5,
      'economy.inflation': -8,
      'society.publicSatisfaction': -5,
    },
    choices: [
      {
        id: 'oil-reserve',
        label: 'Strategische Erdölreserve freigeben',
        immediateEffects: { 'society.publicSatisfaction': +3, 'economy.inflation': +5 },
        delayedEffects: [
          { quartersDelay: 3, effects: { 'economy.debtRatio': +2 }, label: 'Reserve muss kostspielig aufgefüllt werden' },
        ],
      },
      {
        id: 'oil-erneuerbare',
        label: 'Notfallprogramm erneuerbare Energien',
        immediateEffects: { 'economy.debtRatio': +4, 'society.climateProgress': +6 },
        policyArea: 'klimaschutz',
        policyPosition: 80,
        delayedEffects: [
          { quartersDelay: 5, effects: { 'economy.gdpIndex': +4, 'economy.inflation': +4 }, label: 'Erneuerbare dämpfen Energiekosten' },
        ],
      },
      {
        id: 'oil-golfpakt',
        label: 'Notfallpakt mit Golfstaaten schließen',
        immediateEffects: { 'economy.tradeBalance': +3, 'politics.euRelations': -4 },
        internationalReactions: { usa: +3, eu: -3 },
      },
    ],
  },

  {
    id: 'cyberattack',
    label: 'Staatlicher Cyberangriff',
    description: 'Ein koordinierter Hackerangriff legt Teile der kritischen Infrastruktur lahm: Stromnetze, Bahnsteuerung und Krankenhäuser sind 48 Stunden ausgefallen.',
    trigger: () => true,
    probability: 0.06,
    immediateEffects: {
      'economy.gdpIndex': -4,
      'society.securityFeeling': -8,
      'society.healthcareQuality': -4,
    },
    choices: [
      {
        id: 'cyber-offensive',
        label: 'Cyber-Verteidigungsoffensive, BSI massiv stärken',
        immediateEffects: { 'economy.debtRatio': +3, 'government.budgetBalance': -6 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'society.securityFeeling': +6, 'society.infrastructureState': +4 }, label: 'Cybersicherheitsinfrastruktur ausgebaut' },
        ],
      },
      {
        id: 'cyber-attribution',
        label: 'Angreifer öffentlich benennen, EU koordinieren',
        immediateEffects: { 'politics.euRelations': +6 },
        internationalReactions: { eu: +6, china: -8, usa: +5 },
        delayedEffects: [
          { quartersDelay: 3, effects: { 'society.securityFeeling': +4 }, label: 'Internationale Cyberallianz gebildet' },
        ],
      },
      {
        id: 'cyber-stillschweigen',
        label: 'Stillschweigend beheben, Täter nicht benennen',
        immediateEffects: { 'politics.mediaRelations': -7, 'society.publicSatisfaction': -4 },
      },
    ],
  },

  // ── SKANDALE ───────────────────────────────────────────────
  {
    id: 'corruption-scandal',
    label: 'Korruptionsskandal in der Koalition',
    description: 'Investigativjournalisten enthüllen: Mehrere Koalitionsabgeordnete vergaben lukrative Beraterverträge an Parteifreunde. Die Staatsanwaltschaft ermittelt.',
    trigger: () => true,
    probability: 0.07,
    immediateEffects: {
      'politics.mediaRelations': -10,
      'society.publicSatisfaction': -6,
      'politics.parliamentarySupport': -5,
    },
    choices: [
      {
        id: 'corruption-aufklaerung',
        label: 'Vollständige Aufklärung, Betroffene entlassen',
        immediateEffects: { 'politics.coalitionStability': -10, 'politics.mediaRelations': +7 },
        delayedEffects: [
          { quartersDelay: 3, effects: { 'society.publicSatisfaction': +5, 'politics.parliamentarySupport': +4 }, label: 'Glaubwürdigkeit schrittweise wiederhergestellt' },
        ],
      },
      {
        id: 'corruption-ausschuss',
        label: 'Parlamentarischen Untersuchungsausschuss einsetzen',
        immediateEffects: { 'politics.parliamentarySupport': +4, 'politics.mediaRelations': -3 },
        delayedEffects: [
          { quartersDelay: 5, effects: { 'politics.mediaRelations': +5, 'society.publicSatisfaction': +3 }, label: 'Ausschuss legt Abschlussbericht vor' },
        ],
      },
      {
        id: 'corruption-kleinreden',
        label: 'Kleinreden und Parteilinie halten',
        immediateEffects: { 'politics.mediaRelations': -12, 'society.publicSatisfaction': -8, 'politics.coalitionStability': -5 },
      },
    ],
  },

  {
    id: 'spy-affair',
    label: 'BND-Spionageaffäre',
    description: 'Enthüllungen zeigen: Der BND hat jahrelang mit ausländischen Geheimdiensten Millionen Deutsche überwacht. Der Datenschutzbeauftragte und die Opposition fordern Konsequenzen.',
    trigger: (state) => state.politics.usRelations < 65,
    probability: 0.09,
    immediateEffects: {
      'politics.mediaRelations': -8,
      'society.publicSatisfaction': -5,
    },
    choices: [
      {
        id: 'spy-reform',
        label: 'BND-Reform und parlamentarische Kontrolle stärken',
        immediateEffects: { 'politics.parliamentarySupport': +6, 'politics.usRelations': -5 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'politics.mediaRelations': +7, 'society.publicSatisfaction': +4 }, label: 'Reformgesetz verabschiedet' },
        ],
      },
      {
        id: 'spy-alliierte',
        label: 'Alliierte schützen, Affäre intern klären',
        immediateEffects: { 'politics.usRelations': +5, 'politics.mediaRelations': -8 },
      },
      {
        id: 'spy-kooperation-ende',
        label: 'Geheimdienstkooperation mit Alliierten einfrieren',
        immediateEffects: { 'politics.usRelations': -12, 'politics.euRelations': +5, 'society.publicSatisfaction': +4 },
        internationalReactions: { usa: -10, eu: +5 },
      },
    ],
  },
];
