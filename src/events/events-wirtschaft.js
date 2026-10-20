// ============================================================
// EVENTS-WIRTSCHAFT.JS — Wirtschafts- und Innenpolitik-Ereignisse
//
// Was: Ereignisse für Energiekrise, Automobilindustrie, Migration,
//      Infrastruktur, Bankenkrise, Fachkräftemangel, Wohnungskrise.
//
// Nutzt: keine Abhängigkeiten
//
// Erweiterungspunkte:
//   - Neue Wirtschaftsereignisse hier anhängen und in events.js exportieren
// ============================================================

export const EVENTS_WIRTSCHAFT = [

  // ── WIRTSCHAFT ─────────────────────────────────────────────
  {
    id: 'energy-crisis',
    label: 'Energiekrise',
    description: 'Ein unerwarteter Gaslieferstopp trifft die Industrie. Produktionsausfälle drohen.',
    trigger: (state) => state.politics.chinaRelations < 35 || state.politics.euRelations < 40,
    probability: 0.15,
    immediateEffects: {
      'economy.gdpIndex': -8,
      'economy.inflation': -12,
      'society.publicSatisfaction': -6,
    },
    choices: [
      {
        id: 'energy-crisis-lng',
        label: 'LNG-Importe ausweiten (USA, Katar)',
        immediateEffects: { 'economy.debtRatio': +3, 'economy.gdpIndex': +4 },
        internationalReactions: { usa: +5 },
        delayedEffects: [{ quartersDelay: 2, effects: { 'economy.gdpIndex': +3 }, label: 'LNG-Kapazität voll ausgebaut' }],
      },
      {
        id: 'energy-crisis-rationing',
        label: 'Industriegas rationieren, Haushalte schützen',
        immediateEffects: { 'economy.gdpIndex': -6, 'society.publicSatisfaction': +3 },
        delayedEffects: [{ quartersDelay: 4, effects: { 'economy.gdpIndex': -4 }, label: 'Industrieverluste manifestieren sich' }],
      },
      {
        id: 'energy-crisis-nuclear',
        label: 'AKWs temporär reaktivieren',
        immediateEffects: { 'economy.gdpIndex': +5, 'politics.coalitionStability': -15 },
        policyArea: 'klimaschutz',
        policyPosition: 20,
        internationalReactions: { eu: -8 },
      },
    ],
  },

  {
    id: 'auto-industry-crisis',
    label: 'Automobilindustrie in der Krise',
    description: 'Chinesische E-Auto-Hersteller verdrängen VW, BMW und Mercedes. 120.000 Jobs bedroht.',
    trigger: (state) => state.economy.tradeBalance < 40,
    probability: 0.12,
    immediateEffects: {
      'economy.unemployment': -8,
      'economy.gdpIndex': -5,
      'society.publicSatisfaction': -5,
    },
    choices: [
      {
        id: 'auto-subsidies',
        label: 'Transformationssubventionen (E-Autos, KI)',
        immediateEffects: { 'economy.debtRatio': +4, 'government.budgetBalance': -8 },
        delayedEffects: [
          { quartersDelay: 6, effects: { 'economy.gdpIndex': +6, 'economy.unemployment': +5 }, label: 'E-Auto-Wende trägt Früchte' },
        ],
        policyArea: 'klimaschutz',
        policyPosition: 75,
      },
      {
        id: 'auto-tariffs',
        label: 'EU-Zölle auf chinesische E-Autos durchsetzen',
        immediateEffects: { 'economy.tradeBalance': +4 },
        internationalReactions: { china: -15, eu: -5 },
        delayedEffects: [
          { quartersDelay: 3, effects: { 'economy.tradeBalance': -8 }, label: 'Chinas Gegenzölle treffen Maschinenbau' },
        ],
      },
      {
        id: 'auto-market',
        label: 'Markt entscheiden lassen, Kurzarbeit finanzieren',
        immediateEffects: { 'economy.debtRatio': +2, 'society.socialJustice': -5 },
        delayedEffects: [
          { quartersDelay: 8, effects: { 'economy.gdpIndex': +3 }, label: 'Strukturwandel abgeschlossen' },
        ],
      },
    ],
  },

  // ── INNENPOLITIK ───────────────────────────────────────────
  {
    id: 'migration-crisis',
    label: 'Migrationsdruck',
    description: 'Kommunen melden Überlastung. Asylanträge auf Rekordhoch. Innenpolitisch explosiv.',
    trigger: () => true,
    probability: 0.12,
    immediateEffects: {
      'society.securityFeeling': -5,
      'politics.coalitionStability': -5,
    },
    choices: [
      {
        id: 'migration-open',
        label: 'Schnellintegration, Bürokratieabbau',
        immediateEffects: { 'economy.gdpIndex': +3, 'society.socialJustice': +4 },
        delayedEffects: [{ quartersDelay: 4, effects: { 'economy.unemployment': +5, 'economy.taxRevenue': +3 }, label: 'Fachkräfte integriert' }],
        policyArea: 'migration',
        policyPosition: 75,
        violatesRedLine: 'migration > 70',
      },
      {
        id: 'migration-restrict',
        label: 'Grenzkontrollen verschärfen',
        immediateEffects: { 'society.securityFeeling': +8, 'politics.euRelations': -6 },
        policyArea: 'migration',
        policyPosition: 20,
        internationalReactions: { eu: -8 },
      },
      {
        id: 'migration-eu',
        label: 'EU-Verteilmechanismus durchsetzen',
        immediateEffects: { 'politics.euRelations': +5 },
        delayedEffects: [{ quartersDelay: 6, effects: { 'society.securityFeeling': +4 }, label: 'EU-Pakt greift' }],
      },
    ],
  },

  {
    id: 'infrastructure-crisis',
    label: 'Infrastrukturkollaps',
    description: 'Brücken, Bahnen, Autobahnen: Der Investitionsstau der letzten 20 Jahre schlägt durch.',
    trigger: (state) => state.society.infrastructureState < 35,
    probability: 0.2,
    immediateEffects: {
      'economy.gdpIndex': -4,
      'society.publicSatisfaction': -6,
    },
    choices: [
      {
        id: 'infra-invest',
        label: 'Großinvestitionsprogramm auflegen',
        immediateEffects: { 'economy.debtRatio': +5, 'government.budgetBalance': -12 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'society.infrastructureState': +15 }, label: 'Erste Bauprojekte fertig' },
          { quartersDelay: 8, effects: { 'economy.gdpIndex': +5, 'society.publicSatisfaction': +4 }, label: 'Infrastruktur wirkt auf Wirtschaft' },
        ],
        policyArea: 'schuldenbremse',
        policyPosition: 30,
      },
      {
        id: 'infra-ppp',
        label: 'Öffentlich-Private Partnerschaften',
        immediateEffects: { 'economy.debtRatio': +2 },
        delayedEffects: [{ quartersDelay: 6, effects: { 'society.infrastructureState': +8 }, label: 'PPP-Projekte liefern' }],
      },
    ],
  },

  // ── WIRTSCHAFTSKRISEN ──────────────────────────────────────
  {
    id: 'bank-rescue',
    label: 'Bankenkrise',
    description: 'Eine systemrelevante Großbank steht vor der Insolvenz. Ratingagenturen stufen Deutschland herab. Die Finanzmärkte reagieren panisch.',
    trigger: (state) => state.economy.gdpIndex < 42 || state.economy.debtRatio > 50,
    probability: 0.12,
    immediateEffects: {
      'economy.gdpIndex': -6,
      'economy.tradeBalance': -4,
      'society.publicSatisfaction': -5,
    },
    choices: [
      {
        id: 'bank-bailout',
        label: 'Staatsrettungspaket (Too big to fail)',
        immediateEffects: { 'economy.debtRatio': +6, 'government.budgetBalance': -15, 'society.publicSatisfaction': -4 },
        delayedEffects: [
          { quartersDelay: 3, effects: { 'economy.gdpIndex': +5, 'economy.tradeBalance': +4 }, label: 'Bankensektor stabilisiert' },
        ],
      },
      {
        id: 'bank-bail-in',
        label: 'Bail-in: Aktionäre und Gläubiger haften',
        immediateEffects: { 'economy.gdpIndex': -4, 'society.socialJustice': +6 },
        delayedEffects: [
          { quartersDelay: 5, effects: { 'economy.gdpIndex': +3, 'economy.tradeBalance': +2 }, label: 'Marktbereinigung abgeschlossen' },
        ],
      },
      {
        id: 'bank-esm',
        label: 'EU-Bankenunion und ESM aktivieren',
        immediateEffects: { 'politics.euRelations': +6 },
        internationalReactions: { eu: +5 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'economy.debtRatio': +3, 'economy.gdpIndex': +4 }, label: 'ESM-Kredite stützen Bankensektor' },
        ],
      },
    ],
  },

  {
    id: 'fachkraefte-mangel',
    label: 'Fachkräftemangel',
    description: 'Deutschlands Unternehmen suchen 600.000 Fachkräfte vergeblich. Industrieaufträge können nicht erfüllt werden. Wachstum bricht ein.',
    trigger: (state) => state.economy.unemployment > 62,
    probability: 0.14,
    immediateEffects: {
      'economy.gdpIndex': -4,
      'economy.taxRevenue': -3,
    },
    choices: [
      {
        id: 'fachkraefte-einwanderung',
        label: 'Fachkräfteeinwanderungsgesetz verschärfen',
        immediateEffects: { 'politics.coalitionStability': -7 },
        policyArea: 'migration',
        policyPosition: 62,
        delayedEffects: [
          { quartersDelay: 4, effects: { 'economy.gdpIndex': +5, 'economy.unemployment': -3, 'economy.taxRevenue': +4 }, label: 'Qualifizierte Einwanderer integriert' },
        ],
      },
      {
        id: 'fachkraefte-ausbildung',
        label: 'Nationale Ausbildungsoffensive',
        immediateEffects: { 'economy.debtRatio': +3, 'government.budgetBalance': -6 },
        delayedEffects: [
          { quartersDelay: 6, effects: { 'economy.gdpIndex': +3, 'economy.unemployment': -2 }, label: 'Ausbildungswelle zeigt Wirkung' },
        ],
      },
      {
        id: 'fachkraefte-automatisierung',
        label: 'Automatisierungsprogramm fördern',
        immediateEffects: { 'economy.debtRatio': +2, 'society.socialJustice': -4 },
        delayedEffects: [
          { quartersDelay: 5, effects: { 'economy.gdpIndex': +4, 'economy.tradeBalance': +3 }, label: 'Produktivitätssprung durch Automatisierung' },
        ],
      },
    ],
  },

  {
    id: 'wohnungskrise',
    label: 'Wohnungskrise',
    description: 'Mieten in Großstädten sind seit 2020 um 60% gestiegen. Familien und Azubis finden keine bezahlbaren Wohnungen. Soziale Unruhen beginnen.',
    trigger: (state) => state.society.socialJustice < 45 || state.society.publicSatisfaction < 42,
    probability: 0.13,
    immediateEffects: {
      'society.socialJustice': -5,
      'society.publicSatisfaction': -4,
      'politics.mediaRelations': -4,
    },
    choices: [
      {
        id: 'wohnung-mietpreisbremse',
        label: 'Mietpreisbremse + staatlicher Sozialbau',
        immediateEffects: { 'society.socialJustice': +8, 'economy.debtRatio': +4, 'government.budgetBalance': -10 },
        policyArea: 'sozialstaat',
        policyPosition: 75,
        delayedEffects: [
          { quartersDelay: 6, effects: { 'society.publicSatisfaction': +5 }, label: '100.000 Sozialwohnungen fertiggestellt' },
        ],
      },
      {
        id: 'wohnung-bauoffensive',
        label: 'Bürokratieabbau für privates Bauen',
        immediateEffects: { 'economy.gdpIndex': +2 },
        delayedEffects: [
          { quartersDelay: 5, effects: { 'society.socialJustice': +4, 'economy.gdpIndex': +2 }, label: 'Wohnungsmarkt entspannt sich leicht' },
        ],
      },
      {
        id: 'wohnung-laender',
        label: 'Ländern und Städten überlassen',
        immediateEffects: { 'society.publicSatisfaction': -5, 'politics.parliamentarySupport': -5 },
      },
    ],
  },
];
