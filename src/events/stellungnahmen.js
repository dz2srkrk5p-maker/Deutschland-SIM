// ============================================================
// STELLUNGNAHMEN.JS — Pool politischer Positionierungen
// Werden vom Scheduler einmal pro ~2 Quartale gezogen.
// Themen werden pro Legislatur nicht wiederholt (via topic-ID).
// ============================================================

export const STELLUNGNAHMEN_POOL = [
  {
    id: 'stell-rente',
    type: 'stellungnahme',
    topic: 'rente',
    label: 'Rentensystem: Regierung gefordert',
    description: 'Der Sozialbeirat legt seinen Jahresbericht vor: Das Rentensystem ist ohne Strukturreform bis 2040 nicht mehr finanzierbar. Gewerkschaften, Arbeitgeber und Rentenexperten fordern eine klare Positionierung der Bundesregierung.',
    choices: [
      {
        id: 'rente-kapital',
        label: 'Aktienrente stärken — Kapitaldeckung einführen',
        immediateEffects: { 'society.publicSatisfaction': -4, 'society.socialJustice': -5, 'economy.gdpIndex': +2 },
        policyArea: 'sozialstaat',
        policyPosition: 35,
        delayedEffects: [
          { quartersDelay: 6, effects: { 'government.budgetBalance': +8 }, label: 'Kapitalgedeckte Rente entlastet Staatshaushalt' },
        ],
      },
      {
        id: 'rente-niveau',
        label: 'Rentenniveau halten — Beiträge leicht erhöhen',
        immediateEffects: { 'society.publicSatisfaction': +4, 'society.socialJustice': +4, 'economy.gdpIndex': -2 },
        policyArea: 'sozialstaat',
        policyPosition: 72,
        delayedEffects: [
          { quartersDelay: 4, effects: { 'government.budgetBalance': -6 }, label: 'Höhere Rentenbeiträge belasten Arbeitnehmer' },
        ],
      },
      {
        id: 'rente-pruefen',
        label: 'Rentenkommission einsetzen — Ergebnisse abwarten',
        immediateEffects: { 'politics.mediaRelations': -4, 'politics.parliamentarySupport': -2 },
      },
    ],
  },

  {
    id: 'stell-kernkraft',
    type: 'stellungnahme',
    topic: 'kernkraft',
    label: 'Kernkraft-Debatte: Rückkehr oder Nein?',
    description: 'Industrieverbände und mehrere Bundesländer fordern angesichts hoher Strompreise die Rückkehr zur Kernenergie. Eine Petition mit 1,2 Millionen Unterschriften liegt vor. Der Energieausschuss erwartet eine Stellungnahme.',
    choices: [
      {
        id: 'kern-nein',
        label: 'Ausstieg verteidigen — Erneuerbare beschleunigen',
        immediateEffects: { 'society.climateProgress': +5, 'politics.coalitionStability': -5 },
        policyArea: 'klimaschutz',
        policyPosition: 80,
        delayedEffects: [
          { quartersDelay: 4, effects: { 'economy.tradeBalance': +3 }, label: 'Erneuerbare-Ausbau stärkt Exportposition' },
        ],
      },
      {
        id: 'kern-ja',
        label: 'Laufzeitverlängerung erlauben — Energiesicherheit',
        immediateEffects: { 'society.climateProgress': -6, 'economy.inflation': +4, 'politics.coalitionStability': -8 },
        policyArea: 'klimaschutz',
        policyPosition: 28,
        delayedEffects: [
          { quartersDelay: 3, effects: { 'society.publicSatisfaction': +3 }, label: 'Energiepreise stabilisieren sich leicht' },
        ],
      },
      {
        id: 'kern-pruefen',
        label: 'Technologieoffen bleiben — Prüfkommission beauftragen',
        immediateEffects: { 'politics.mediaRelations': -5, 'society.publicSatisfaction': -2 },
      },
    ],
  },

  {
    id: 'stell-waffenexporte',
    type: 'stellungnahme',
    topic: 'ruestung',
    label: 'Rüstungsexporte: Genehmigung oder Stopp?',
    description: 'Ein Rüstungskonzern beantragt die Genehmigung für Waffenlieferungen in eine krisenhafte Region. Menschenrechtsorganisationen protestieren, Verteidigungsexperten sehen Bündnisverpflichtungen auf dem Spiel.',
    choices: [
      {
        id: 'waffen-erlauben',
        label: 'Export genehmigen — Bündnissolidarität',
        immediateEffects: { 'politics.usRelations': +6, 'economy.tradeBalance': +4, 'politics.mediaRelations': -6 },
        policyArea: 'nato',
        policyPosition: 78,
        internationalReactions: { usa: +5 },
      },
      {
        id: 'waffen-ablehnen',
        label: 'Export ablehnen — Menschenrechte priorisieren',
        immediateEffects: { 'politics.mediaRelations': +5, 'society.publicSatisfaction': +3, 'economy.tradeBalance': -3 },
        policyArea: 'nato',
        policyPosition: 28,
        internationalReactions: { usa: -4 },
      },
      {
        id: 'waffen-bedingen',
        label: 'Teilgenehmigung mit Auflagen und Kontrollen',
        immediateEffects: { 'politics.coalitionStability': -3, 'politics.mediaRelations': +2 },
      },
    ],
  },

  {
    id: 'stell-ki',
    type: 'stellungnahme',
    topic: 'digitalisierung',
    label: 'KI-Regulierung: Deutschland im EU-Rat',
    description: 'Brüssel plant das weltweit erste umfassende KI-Gesetz. Die Tech-Industrie warnt vor Wettbewerbsnachteilen, KI-Ethiker fordern strenge Auflagen. Deutschland muss im EU-Rat eine Schlüsselposition einnehmen.',
    choices: [
      {
        id: 'ki-streng',
        label: 'Strikte KI-Regulierung unterstützen — Verbraucherschutz',
        immediateEffects: { 'politics.euRelations': +6, 'economy.gdpIndex': -2, 'society.publicSatisfaction': +3 },
        policyArea: 'euIntegration',
        policyPosition: 75,
        internationalReactions: { eu: +8 },
      },
      {
        id: 'ki-liberal',
        label: 'Marktfreundliche KI-Politik — Innovationsmotor',
        immediateEffects: { 'economy.gdpIndex': +4, 'economy.tradeBalance': +3, 'politics.euRelations': -4 },
        policyArea: 'wirtschaftsliberalismus',
        policyPosition: 82,
        internationalReactions: { eu: -5, usa: +4 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'economy.gdpIndex': +3 }, label: 'KI-Startups etablieren sich in Deutschland' },
        ],
      },
      {
        id: 'ki-vermitteln',
        label: 'Vermittlerrolle übernehmen — EU-Kompromiss suchen',
        immediateEffects: { 'politics.euRelations': +3, 'politics.mediaRelations': +3 },
        internationalReactions: { eu: +4 },
      },
    ],
  },

  {
    id: 'stell-migration',
    type: 'stellungnahme',
    topic: 'asyl',
    label: 'Asylzahlen: Regierungsposition gefordert',
    description: 'Erneuter Anstieg der Asylzahlen. Kommunen berichten von Überlastung, Sozialverbände warnen vor Rechtsverlust. Der Innenausschuss fordert eine Regierungsposition.',
    choices: [
      {
        id: 'migration-haerter',
        label: 'Strengere Kontrollen — Zurückweisungen ausweiten',
        immediateEffects: { 'society.securityFeeling': +5, 'politics.euRelations': -5, 'politics.coalitionStability': -6 },
        policyArea: 'migration',
        policyPosition: 22,
        internationalReactions: { eu: -6 },
        delayedEffects: [
          { quartersDelay: 3, effects: { 'society.publicSatisfaction': +3 }, label: 'Bevölkerung nimmt Kontrollmaßnahmen an' },
        ],
      },
      {
        id: 'migration-human',
        label: 'Humanitären Kurs halten — EU-Lösung suchen',
        immediateEffects: { 'politics.euRelations': +5, 'politics.coalitionStability': -5, 'society.socialJustice': +4 },
        policyArea: 'migration',
        policyPosition: 72,
        internationalReactions: { eu: +6 },
      },
      {
        id: 'migration-verteilen',
        label: 'EU-Verteilmechanismus vorantreiben',
        immediateEffects: { 'politics.euRelations': +8, 'politics.parliamentarySupport': -3 },
        internationalReactions: { eu: +10 },
        delayedEffects: [
          { quartersDelay: 5, effects: { 'society.publicSatisfaction': +2 }, label: 'EU-Lösung entlastet Kommunen schrittweise' },
        ],
      },
    ],
  },

  {
    id: 'stell-buergergeld',
    type: 'stellungnahme',
    topic: 'buergergeld',
    label: 'Bürgergeld-Debatte: Sanktionen oder Förderung?',
    description: 'Eine Studie zeigt: Ein Drittel der Bürgergeld-Empfänger lehnt Arbeitsangebote wiederholt ab. Arbeitgeber fordern härtere Sanktionen, Sozialverbände warnen vor Verarmungsspirale.',
    choices: [
      {
        id: 'bgeld-sanktionen',
        label: 'Sanktionen verschärfen — Zumutbarkeitspflicht stärken',
        immediateEffects: { 'society.socialJustice': -6, 'economy.unemployment': +3, 'politics.coalitionStability': -5 },
        policyArea: 'sozialstaat',
        policyPosition: 30,
        delayedEffects: [
          { quartersDelay: 3, effects: { 'government.budgetBalance': +5 }, label: 'Weniger Bürgergeld-Ausgaben im Bundeshaushalt' },
        ],
      },
      {
        id: 'bgeld-foerdern',
        label: 'Fördern statt fordern — Qualifizierungsoffensive',
        immediateEffects: { 'economy.debtRatio': +2, 'society.socialJustice': +4 },
        policyArea: 'sozialstaat',
        policyPosition: 72,
        delayedEffects: [
          { quartersDelay: 5, effects: { 'economy.unemployment': +4, 'economy.taxRevenue': +3 }, label: 'Qualifizierungsoffensive trägt Früchte' },
        ],
      },
      {
        id: 'bgeld-pruefen',
        label: 'Evaluation beauftragen — keine übereilten Urteile',
        immediateEffects: { 'politics.mediaRelations': -4 },
      },
    ],
  },

  {
    id: 'stell-nato',
    type: 'stellungnahme',
    topic: 'nato-ausgaben',
    label: 'NATO-2%-Ziel: USA erhöhen Druck',
    description: 'Der NATO-Generalsekretär kritisiert Deutschland öffentlich: Das 2%-Verteidigungsziel werde nicht verlässlich erreicht. US-Senatoren drohen mit Handelskonsequenzen.',
    choices: [
      {
        id: 'nato-vollverpflichtung',
        label: '2%-Ziel sofort zusagen und Sondervermögen schaffen',
        immediateEffects: { 'politics.usRelations': +10, 'economy.debtRatio': +5, 'politics.coalitionStability': -6 },
        policyArea: 'nato',
        policyPosition: 85,
        internationalReactions: { usa: +10, eu: +4 },
      },
      {
        id: 'nato-schrittweise',
        label: 'Schrittweisen Plan vorlegen — Ziel bis 2028',
        immediateEffects: { 'politics.usRelations': +3, 'economy.debtRatio': +2 },
        policyArea: 'nato',
        policyPosition: 65,
        internationalReactions: { usa: +3 },
      },
      {
        id: 'nato-kritik',
        label: 'NATO-Ausgabenziel öffentlich in Frage stellen',
        immediateEffects: { 'politics.usRelations': -10, 'politics.coalitionStability': -8, 'politics.euRelations': +3 },
        policyArea: 'nato',
        policyPosition: 20,
        internationalReactions: { usa: -12, eu: +3 },
      },
    ],
  },

  {
    id: 'stell-co2',
    type: 'stellungnahme',
    topic: 'co2-preis',
    label: 'CO₂-Preis: Entlastung oder Beschleunigung?',
    description: 'Der CO₂-Preis steigt auf 55€/Tonne. Pendler und Geringverdiener berichten von massiven Zusatzkosten. Der Klimarat empfiehlt ein Klimageld, der Finanzminister warnt vor Ausgaben.',
    choices: [
      {
        id: 'co2-klimageld',
        label: 'Klimageld einführen — Pro-Kopf-Rückerstattung',
        immediateEffects: { 'society.publicSatisfaction': +5, 'society.climateProgress': +4, 'government.budgetBalance': -8 },
        policyArea: 'klimaschutz',
        policyPosition: 78,
        delayedEffects: [
          { quartersDelay: 3, effects: { 'society.socialJustice': +3 }, label: 'Klimageld entlastet untere Einkommensgruppen' },
        ],
      },
      {
        id: 'co2-industrie',
        label: 'CO₂-Erlöse für grüne Industrieförderung nutzen',
        immediateEffects: { 'economy.gdpIndex': +3, 'economy.tradeBalance': +2, 'society.publicSatisfaction': -3 },
        policyArea: 'wirtschaftsliberalismus',
        policyPosition: 65,
      },
      {
        id: 'co2-pause',
        label: 'CO₂-Preiserhöhung pausieren — Wirtschaft entlasten',
        immediateEffects: { 'society.climateProgress': -5, 'economy.gdpIndex': +2, 'society.publicSatisfaction': +3 },
        policyArea: 'klimaschutz',
        policyPosition: 30,
      },
    ],
  },
];
