// ============================================================
// EVENTS-GESELLSCHAFT.JS — Gesellschaft, Natur & positive Ereignisse
//
// Was: Naturkatastrophen, Technologiesprünge, Koalitionskrisen,
//      positive Wirtschaftsereignisse und Sozialdynamiken.
//
// Nutzt: keine Abhängigkeiten
//
// Erweiterungspunkte:
//   - Landtagswahl-Folgeeffekte hier verankern sobald Bundeslaender fertig
//   - Positive Ereignisse als Belohnung für gute Politik skalieren
// ============================================================

export const EVENTS_GESELLSCHAFT = [

  // ── NATURKATASTROPHEN ──────────────────────────────────────
  {
    id: 'flood-disaster',
    label: 'Jahrhundertflut',
    description: 'Extremhochwasser überfluten Rheinland, Saarland und Bayern. Dörfer werden evakuiert, Sachschäden von über 20 Milliarden Euro. Der Druck zu handeln ist enorm.',
    trigger: () => true,
    probability: 0.05,
    immediateEffects: {
      'economy.gdpIndex': -5,
      'society.infrastructureState': -8,
      'society.publicSatisfaction': -5,
    },
    choices: [
      {
        id: 'flood-wiederaufbau',
        label: 'Nationales Wiederaufbauprogramm',
        immediateEffects: { 'economy.debtRatio': +5, 'government.budgetBalance': -12, 'society.publicSatisfaction': +4 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'society.infrastructureState': +10, 'society.publicSatisfaction': +3 }, label: 'Wiederaufbau abgeschlossen' },
        ],
      },
      {
        id: 'flood-eu-hilfe',
        label: 'EU-Katastrophenschutzmittel beantragen',
        immediateEffects: { 'politics.euRelations': +6 },
        internationalReactions: { eu: +5 },
        delayedEffects: [
          { quartersDelay: 6, effects: { 'society.infrastructureState': +7, 'economy.debtRatio': +2 }, label: 'EU-Mittel bewilligt, Aufbau läuft' },
        ],
      },
      {
        id: 'flood-klimapaket',
        label: 'Klimaanpassungspaket beschließen',
        immediateEffects: { 'economy.debtRatio': +3, 'society.climateProgress': +5 },
        policyArea: 'klimaschutz',
        policyPosition: 72,
        delayedEffects: [
          { quartersDelay: 8, effects: { 'society.infrastructureState': +6 }, label: 'Hochwasserschutz modernisiert' },
        ],
      },
    ],
  },

  {
    id: 'drought-crisis',
    label: 'Dürresommer',
    description: 'Rekordtemperaturen, Ernteausfälle 40%, Waldbrände in Brandenburg und Bayern. Der Rhein ist kaum schiffbar – Gütertransporte stehen still.',
    trigger: (state) => state.society.climateProgress < 50,
    probability: 0.11,
    immediateEffects: {
      'economy.gdpIndex': -4,
      'economy.tradeBalance': -5,
      'society.publicSatisfaction': -4,
    },
    choices: [
      {
        id: 'drought-landwirtschaft',
        label: 'Nothilfe Landwirtschaft + Ernährungssicherung',
        immediateEffects: { 'economy.debtRatio': +3, 'government.budgetBalance': -7, 'society.publicSatisfaction': +3 },
        delayedEffects: [
          { quartersDelay: 2, effects: { 'economy.gdpIndex': +2 }, label: 'Ernteausfälle kompensiert' },
        ],
      },
      {
        id: 'drought-klimapakt',
        label: 'Notstandsprogramm Klimaschutz',
        immediateEffects: { 'politics.coalitionStability': -8, 'society.climateProgress': +8 },
        policyArea: 'klimaschutz',
        policyPosition: 82,
        delayedEffects: [
          { quartersDelay: 6, effects: { 'economy.gdpIndex': +3, 'economy.inflation': +3 }, label: 'Erneuerbare reduzieren Energiekosten' },
        ],
      },
      {
        id: 'drought-wasserinfra',
        label: 'Wasserinfrastruktur modernisieren',
        immediateEffects: { 'economy.debtRatio': +4, 'government.budgetBalance': -8 },
        delayedEffects: [
          { quartersDelay: 6, effects: { 'society.infrastructureState': +6, 'society.publicSatisfaction': +4 }, label: 'Wassernetz zukunftssicher ausgebaut' },
        ],
      },
    ],
  },

  // ── KOALITIONSINTERNE STREITIGKEITEN ───────────────────────
  {
    id: 'coalition-ultimatum',
    label: 'Ultimatum des Koalitionspartners',
    description: 'Der kleinste Koalitionspartner stellt ein Ultimatum: Entweder seine Kernforderung zum Haushaltsrecht wird noch diese Woche erfüllt – oder er verlässt die Regierung.',
    trigger: (state) => state.politics.coalitionStability < 50,
    probability: 0.15,
    immediateEffects: {
      'politics.coalitionStability': -8,
      'politics.mediaRelations': -5,
    },
    choices: [
      {
        id: 'coalition-nachgeben',
        label: 'Kernforderung erfüllen und Koalition retten',
        immediateEffects: { 'politics.coalitionStability': +12, 'politics.parliamentarySupport': -5 },
        delayedEffects: [
          { quartersDelay: 2, effects: { 'politics.coalitionStability': +5 }, label: 'Koalitionsfrieden konsolidiert' },
        ],
      },
      {
        id: 'coalition-ausschuss',
        label: 'Koalitionsausschuss: Kompromiss suchen',
        immediateEffects: { 'politics.coalitionStability': +5, 'politics.mediaRelations': +3 },
        delayedEffects: [
          { quartersDelay: 2, effects: { 'politics.coalitionStability': +4 }, label: 'Koalitionsvertrag angepasst' },
        ],
      },
      {
        id: 'coalition-neuwahlen',
        label: 'Neuwahl als Druckmittel in Aussicht stellen',
        immediateEffects: { 'politics.coalitionStability': -5, 'society.publicSatisfaction': -5 },
        delayedEffects: [
          { quartersDelay: 2, effects: { 'politics.parliamentarySupport': -6 }, label: 'Koalitionskrise eskaliert weiter' },
        ],
      },
    ],
  },

  {
    id: 'minister-scandal',
    label: 'Ministerrücktritt',
    description: 'Ein zentraler Kabinettsminister ist in einen persönlichen Skandal verwickelt. Medien und Opposition fordern lautstark den Rücktritt. Das Kanzleramt muss handeln.',
    trigger: (state) => state.politics.mediaRelations < 48,
    probability: 0.11,
    immediateEffects: {
      'politics.mediaRelations': -8,
      'government.approvalRating': -6,
      'society.publicSatisfaction': -3,
    },
    choices: [
      {
        id: 'minister-entlassen',
        label: 'Sofort entlassen, eigenen Nachfolger benennen',
        immediateEffects: { 'politics.coalitionStability': -5, 'politics.mediaRelations': +8 },
        delayedEffects: [
          { quartersDelay: 2, effects: { 'government.approvalRating': +5 }, label: 'Nachfolger überzeugt in erstem Auftritt' },
        ],
      },
      {
        id: 'minister-koalitionspartner',
        label: 'Koalitionspartner nominiert Nachfolger',
        immediateEffects: { 'politics.coalitionStability': +6 },
        delayedEffects: [
          { quartersDelay: 2, effects: { 'politics.parliamentarySupport': -3, 'politics.mediaRelations': +4 }, label: 'Neuer Minister eingearbeitet' },
        ],
      },
      {
        id: 'minister-halten',
        label: 'Minister stützen, Rücktritt ablehnen',
        immediateEffects: { 'politics.mediaRelations': -12, 'society.publicSatisfaction': -5, 'politics.coalitionStability': -4 },
      },
    ],
  },

  // ── TECHNOLOGIESPRÜNGE ─────────────────────────────────────
  {
    id: 'ai-disruption',
    label: 'KI-Disruption des Arbeitsmarkts',
    description: 'Neue KI-Systeme automatisieren massenweise Bürotätigkeiten. Banken, Versicherungen und die Bundesverwaltung planen, 30% der Stellen abzubauen. Gewerkschaften schlagen Alarm.',
    trigger: () => true,
    probability: 0.08,
    immediateEffects: {
      'economy.unemployment': -6,
      'society.socialJustice': -5,
      'society.publicSatisfaction': -4,
    },
    choices: [
      {
        id: 'ai-regulierung',
        label: 'KI-Regulierung + Umschulungsprogramm',
        immediateEffects: { 'economy.debtRatio': +4, 'society.socialJustice': +6 },
        policyArea: 'sozialstaat',
        policyPosition: 70,
        delayedEffects: [
          { quartersDelay: 5, effects: { 'economy.gdpIndex': +4, 'economy.unemployment': +3 }, label: 'Transformation sozial abgefedert' },
        ],
      },
      {
        id: 'ai-vorreiter',
        label: 'KI-Vorreiter-Strategie: Deregulierung und Förderung',
        immediateEffects: { 'economy.gdpIndex': +4, 'politics.coalitionStability': -6 },
        policyArea: 'wirtschaftsliberalismus',
        policyPosition: 85,
        delayedEffects: [
          { quartersDelay: 4, effects: { 'economy.gdpIndex': +5, 'economy.tradeBalance': +4 }, label: 'Deutschland als KI-Standort etabliert' },
        ],
      },
      {
        id: 'ai-steuer',
        label: 'KI-Steuer für Umverteilung einführen',
        immediateEffects: { 'society.socialJustice': +7, 'economy.gdpIndex': -3 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'society.publicSatisfaction': +4, 'government.budgetBalance': +6 }, label: 'KI-Steuer finanziert Sozialleistungen' },
        ],
      },
    ],
  },

  {
    id: 'chip-factory',
    label: 'Halbleiter-Megafabrik',
    description: 'Ein globaler Chiphersteller bietet an, eine 30-Milliarden-Fabrik in Sachsen zu errichten – fordert aber massive staatliche Garantien und Steuerbefreiungen.',
    trigger: () => true,
    probability: 0.06,
    immediateEffects: {
      'economy.gdpIndex': +2,
    },
    choices: [
      {
        id: 'chip-vollfoerderung',
        label: 'Vollsubventionierung: Staatsgarantien zusagen',
        immediateEffects: { 'economy.debtRatio': +5, 'government.budgetBalance': -12 },
        delayedEffects: [
          { quartersDelay: 6, effects: { 'economy.gdpIndex': +7, 'economy.unemployment': +4, 'economy.tradeBalance': +5 }, label: 'Halbleiterfabrik produziert – 15.000 Jobs' },
        ],
      },
      {
        id: 'chip-eu-konsortium',
        label: 'EU-Konsortium bilden, Kosten teilen',
        immediateEffects: { 'politics.euRelations': +7 },
        internationalReactions: { eu: +8 },
        delayedEffects: [
          { quartersDelay: 7, effects: { 'economy.gdpIndex': +4, 'economy.tradeBalance': +3 }, label: 'Europäische Chipfabrik läuft an' },
        ],
      },
      {
        id: 'chip-ablehnen',
        label: 'Ablehnen: Zu riskant für den Steuerzahler',
        immediateEffects: { 'economy.gdpIndex': -1, 'politics.mediaRelations': -3 },
        delayedEffects: [
          { quartersDelay: 2, effects: { 'economy.tradeBalance': -2 }, label: 'Fabrik geht nach Polen – Wettbewerbsnachteil' },
        ],
      },
    ],
  },

  // ── POSITIVE EREIGNISSE ───────────────────────────────────────
  {
    id: 'exportboom',
    label: 'Exportboom',
    description: 'Die globale Nachfrage nach deutschen Industriegütern schießt in die Höhe. Maschinenbau, Chemie und Automobilzulieferer vermelden volle Auftragsbücher — der Export-Überschuss erreicht ein Rekordhoch.',
    trigger: (state) => state.economy.tradeBalance > 54 || state.economy.gdpIndex > 57,
    probability: 0.13,
    immediateEffects: {
      'economy.gdpIndex': +8,
      'economy.taxRevenue': +6,
      'society.publicSatisfaction': +4,
    },
    choices: [
      {
        id: 'boom-schulden',
        label: 'Haushalt konsolidieren — Schulden tilgen',
        immediateEffects: { 'economy.debtRatio': -4, 'government.budgetBalance': +8 },
        delayedEffects: [
          { quartersDelay: 2, effects: { 'economy.interestBurden': -3, 'economy.debtRatio': -2 }, label: 'Zinslast sinkt dank Schuldenabbau' },
        ],
      },
      {
        id: 'boom-investieren',
        label: 'Boom nutzen — Infrastruktur und Klimaschutz',
        immediateEffects: { 'society.infrastructureState': +5, 'society.climateProgress': +4 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'economy.gdpIndex': +4 }, label: 'Investitionen steigern langfristige Produktivität' },
        ],
      },
      {
        id: 'boom-steuern',
        label: 'Steuererleichterungen für Bürger',
        immediateEffects: { 'society.publicSatisfaction': +8, 'economy.taxRevenue': -3 },
        delayedEffects: [
          { quartersDelay: 3, effects: { 'economy.gdpIndex': +3 }, label: 'Konsumboom durch mehr verfügbares Einkommen' },
        ],
      },
    ],
  },

  {
    id: 'tech-breakthrough',
    label: 'Deutsches Tech-Wunder',
    description: 'Ein Berliner Start-up entwickelt eine revolutionäre Batterietechnologie. Internationale Investoren pumpen Milliarden in den deutschen Markt — die Technologiebörse feiert ein Allzeithoch.',
    trigger: (state) => state.society.climateProgress > 52 || state.economy.gdpIndex > 51,
    probability: 0.10,
    immediateEffects: {
      'economy.gdpIndex': +6,
      'economy.tradeBalance': +4,
      'politics.mediaRelations': +5,
    },
    choices: [
      {
        id: 'tech-foerdern',
        label: 'Staatlich fördern und skalieren',
        immediateEffects: { 'economy.debtRatio': +2, 'society.climateProgress': +6 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'economy.gdpIndex': +5, 'economy.tradeBalance': +5 }, label: 'Deutsche Technologie dominiert Weltmarkt' },
        ],
      },
      {
        id: 'tech-export',
        label: 'Exportlizenzen vergeben, Devisen sichern',
        immediateEffects: { 'economy.tradeBalance': +6, 'economy.taxRevenue': +4 },
        internationalReactions: { eu: +5, usa: +3 },
      },
      {
        id: 'tech-spinoff',
        label: 'Mittelstand und Ausgründungen einbinden',
        immediateEffects: { 'economy.unemployment': +4, 'society.socialJustice': +3 },
        delayedEffects: [
          { quartersDelay: 5, effects: { 'economy.gdpIndex': +3, 'economy.taxRevenue': +5 }, label: 'Tech-Ökosystem blüht auf — Tausende neue Jobs' },
        ],
      },
    ],
  },

  {
    id: 'eu-foerderprogramm',
    label: 'EU-Infrastrukturfonds',
    description: 'Brüssel genehmigt ein Sonderprogramm: Deutschland erhält 18 Milliarden Euro aus dem Kohäsionsfonds für Infrastruktur, Digitalisierung und grüne Industrie.',
    trigger: (state) => state.politics.euRelations > 60,
    probability: 0.12,
    immediateEffects: {
      'economy.debtRatio': -2,
      'politics.euRelations': +5,
      'politics.mediaRelations': +3,
    },
    choices: [
      {
        id: 'eu-infra',
        label: 'Infrastruktur: Bahn, Brücken, Breitband',
        immediateEffects: { 'society.infrastructureState': +8 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'economy.gdpIndex': +4, 'society.publicSatisfaction': +3 }, label: 'Infrastrukturprogramm zeigt spürbare Wirkung' },
        ],
      },
      {
        id: 'eu-digital',
        label: 'Digitalisierung: Schulen, Verwaltung, KI',
        immediateEffects: { 'society.healthcareQuality': +3 },
        delayedEffects: [
          { quartersDelay: 3, effects: { 'economy.gdpIndex': +3, 'economy.taxRevenue': +3 }, label: 'Digitale Verwaltung spart Milliarden' },
        ],
      },
      {
        id: 'eu-klima',
        label: 'Grüne Industrie: Wasserstoff, Solar, Wind',
        immediateEffects: { 'society.climateProgress': +7 },
        policyArea: 'klimaschutz',
        policyPosition: 78,
        delayedEffects: [
          { quartersDelay: 5, effects: { 'economy.tradeBalance': +4, 'economy.gdpIndex': +3 }, label: 'Grüne Exporte steigen deutlich' },
        ],
      },
    ],
  },

  {
    id: 'diplomatic-success',
    label: 'Historischer Handelspakt',
    description: 'Nach zweijährigen Verhandlungen unterzeichnet Deutschland ein wegweisendes Handelsabkommen. Zölle fallen, neue Märkte öffnen sich. Außenminister und Wirtschaftsverbände feiern.',
    trigger: (state) => state.politics.usRelations > 58 || state.politics.euRelations > 63,
    probability: 0.11,
    immediateEffects: {
      'economy.tradeBalance': +8,
      'economy.gdpIndex': +3,
      'politics.mediaRelations': +4,
    },
    choices: [
      {
        id: 'diplo-vertiefen',
        label: 'Partnerschaft vertiefen — Investitionsschutz',
        internationalReactions: { eu: +5 },
        delayedEffects: [
          { quartersDelay: 3, effects: { 'economy.tradeBalance': +5, 'economy.gdpIndex': +3 }, label: 'Investitionsschutz erhöht Handelsvolumen' },
        ],
      },
      {
        id: 'diplo-eu',
        label: 'Abkommen auf EU-Ebene erweitern',
        immediateEffects: { 'politics.euRelations': +8 },
        internationalReactions: { eu: +10 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'economy.tradeBalance': +4 }, label: 'EU-weiter Handelspakt ratifiziert' },
        ],
      },
    ],
  },

  {
    id: 'sozialfrieden',
    label: 'Historische Tarifeinigung',
    description: 'IG Metall und Arbeitgeber einigen sich: 7 % Lohnerhöhung über 3 Jahre, Arbeitszeitflexibilisierung, optionale 4-Tage-Woche. Der drohende Generalstreik ist abgewendet.',
    trigger: () => true,
    probability: 0.09,
    immediateEffects: {
      'society.publicSatisfaction': +6,
      'society.socialJustice': +5,
      'politics.coalitionStability': +4,
      'politics.mediaRelations': +4,
    },
    choices: [
      {
        id: 'frieden-unterstuetzen',
        label: 'Tarifeinigung politisch flankieren',
        immediateEffects: { 'politics.parliamentarySupport': +5 },
        delayedEffects: [
          { quartersDelay: 2, effects: { 'economy.gdpIndex': +2, 'society.publicSatisfaction': +3 }, label: 'Sozialfrieden steigert Produktivität' },
        ],
      },
      {
        id: 'frieden-ausweiten',
        label: 'Modell auf öffentlichen Dienst übertragen',
        immediateEffects: { 'economy.debtRatio': +2, 'government.budgetBalance': -4 },
        delayedEffects: [
          { quartersDelay: 3, effects: { 'society.publicSatisfaction': +4, 'society.socialJustice': +3 }, label: 'Öffentlicher Dienst befriedet' },
        ],
      },
    ],
  },

  {
    id: 'haushaltsrekord',
    label: 'Steuerrekord',
    description: 'Das Bundesfinanzministerium meldet: Die Steuereinnahmen liegen 28 Milliarden Euro über dem Haushaltsansatz. Starke Konjunktur und Beschäftigung füllen die Staatskasse.',
    trigger: (state) => state.economy.taxRevenue > 58 || state.economy.gdpIndex > 54,
    probability: 0.11,
    immediateEffects: {
      'economy.taxRevenue': +5,
      'government.budgetBalance': +8,
      'politics.mediaRelations': +5,
    },
    choices: [
      {
        id: 'haushalt-schulden',
        label: 'Überschuss für Schuldentilgung nutzen',
        immediateEffects: { 'economy.debtRatio': -3 },
        delayedEffects: [
          { quartersDelay: 2, effects: { 'economy.interestBurden': -2, 'economy.debtRatio': -2 }, label: 'Solide Haushaltspolitik: Schuldenquote sinkt weiter' },
        ],
      },
      {
        id: 'haushalt-investieren',
        label: 'Zukunftsfonds: Infrastruktur und Bildung',
        immediateEffects: { 'society.infrastructureState': +4, 'society.healthcareQuality': +3 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'economy.gdpIndex': +3 }, label: 'Zukunftsinvestitionen zahlen sich aus' },
        ],
      },
      {
        id: 'haushalt-steuern',
        label: 'Steuersenkungen für Bürger und Unternehmen',
        immediateEffects: { 'society.publicSatisfaction': +6, 'economy.taxRevenue': -3 },
        delayedEffects: [
          { quartersDelay: 3, effects: { 'economy.gdpIndex': +4 }, label: 'Steuerimpuls belebt die Binnenkonjunktur' },
        ],
      },
    ],
  },

  {
    id: 'reformerfolg',
    label: 'Reformdividende',
    description: 'Eine vor zwei Jahren beschlossene Verwaltungsreform zeigt Wirkung: weniger Bürokratie, schnellere Genehmigungen, mehr Effizienz. Der internationale Aufbruch-Bericht lobt Deutschland.',
    trigger: (state) => state.government.termQuarter > 4,
    probability: 0.09,
    immediateEffects: {
      'economy.gdpIndex': +3,
      'society.publicSatisfaction': +3,
      'politics.parliamentarySupport': +5,
      'politics.mediaRelations': +6,
    },
    choices: [
      {
        id: 'reform-ausbauen',
        label: 'Nächste Reformstufe einleiten',
        immediateEffects: { 'politics.coalitionStability': -4 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'economy.gdpIndex': +4, 'economy.taxRevenue': +3 }, label: 'Zweite Reformwelle trägt Früchte' },
        ],
      },
      {
        id: 'reform-kommunizieren',
        label: 'Erfolg sichtbar machen — Kommunikationsoffensive',
        immediateEffects: { 'government.approvalRating': +8, 'politics.mediaRelations': +5 },
      },
      {
        id: 'reform-exportieren',
        label: 'Modell international vermarkten',
        internationalReactions: { eu: +8 },
        delayedEffects: [
          { quartersDelay: 2, effects: { 'politics.euRelations': +5 }, label: 'Deutschland als Reformvorbild in Europa' },
        ],
      },
    ],
  },

  {
    id: 'eu-ratsvorsitz',
    label: 'EU-Ratsvorsitz übernommen',
    description: 'Deutschland übernimmt den rotierenden EU-Ratsvorsitz. Internationale Medien loben Berlins Führungsrolle. Die Bundesregierung kann die europäische Agenda sechs Monate lang mitgestalten.',
    trigger: (state) => state.politics.euRelations > 60,
    probability: 0.08,
    immediateEffects: {
      'politics.euRelations': +10,
      'politics.mediaRelations': +6,
      'government.approvalRating': +5,
    },
    choices: [
      {
        id: 'eu-vorsitz-klima',
        label: 'Klimagipfel: EU-weites CO₂-Ziel erhöhen',
        immediateEffects: { 'society.climateProgress': +8, 'politics.coalitionStability': -4 },
        policyArea: 'klimaschutz',
        policyPosition: 82,
        internationalReactions: { eu: +12 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'economy.tradeBalance': +3, 'politics.euRelations': +5 }, label: 'EU-Klimaführerschaft stärkt deutschen Grünexport' },
        ],
      },
      {
        id: 'eu-vorsitz-wirtschaft',
        label: 'Binnenmarkt vertiefen und Finanzunion voranbringen',
        immediateEffects: { 'economy.gdpIndex': +3 },
        internationalReactions: { eu: +8, usa: +4 },
        delayedEffects: [
          { quartersDelay: 3, effects: { 'economy.tradeBalance': +5, 'economy.gdpIndex': +3 }, label: 'Vertiefter EU-Binnenmarkt = mehr Handel' },
        ],
      },
      {
        id: 'eu-vorsitz-sicherheit',
        label: 'EU-Verteidigungsunion voranbringen',
        immediateEffects: { 'society.securityFeeling': +4 },
        internationalReactions: { eu: +10, usa: +6 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'politics.parliamentarySupport': +4 }, label: 'EU-Verteidigungszusammenarbeit fest etabliert' },
        ],
      },
    ],
  },

  {
    id: 'zuwanderung-erfolg',
    label: 'Fachkräftezuwanderung greift',
    description: 'Das Fachkräfteeinwanderungsgesetz zeigt Erfolg: 180.000 qualifizierte Einwanderer besetzen offene Stellen in Pflege, IT und Ingenieurswesen. Unternehmen sind begeistert.',
    trigger: (state) => state.economy.unemployment > 45 || state.society.publicSatisfaction > 48,
    probability: 0.10,
    immediateEffects: {
      'economy.gdpIndex': +4,
      'economy.unemployment': +5,
      'economy.taxRevenue': +3,
    },
    choices: [
      {
        id: 'zuwanderung-ausbauen',
        label: 'Visa-Verfahren weiter beschleunigen',
        immediateEffects: { 'politics.coalitionStability': -3 },
        policyArea: 'migration',
        policyPosition: 68,
        delayedEffects: [
          { quartersDelay: 3, effects: { 'economy.gdpIndex': +4, 'economy.unemployment': +4 }, label: 'Fachkräftemangel strukturell gelindert' },
        ],
      },
      {
        id: 'zuwanderung-integration',
        label: 'Integrationsprogramme massiv stärken',
        immediateEffects: { 'economy.debtRatio': +2, 'society.socialJustice': +5 },
        delayedEffects: [
          { quartersDelay: 4, effects: { 'society.publicSatisfaction': +4, 'economy.taxRevenue': +4 }, label: 'Integration gelingt — Gesellschaft und Wirtschaft profitieren' },
        ],
      },
    ],
  },

  {
    id: 'klimatech-export',
    label: 'Klimatechnologie: Exporterfolg',
    description: 'Deutsche Hersteller von Solarmodulen, Windkraftanlagen und Wärmepumpen dominieren den Weltmarkt. Grüne Technologie ist Deutschlands neues Exportwunder — "Made in Germany" grünt.',
    trigger: (state) => state.society.climateProgress > 48,
    probability: 0.11,
    immediateEffects: {
      'society.climateProgress': +8,
      'economy.tradeBalance': +6,
      'economy.gdpIndex': +4,
    },
    choices: [
      {
        id: 'klima-export-skalieren',
        label: 'Exportoffensive: Lieferketten ausbauen',
        immediateEffects: { 'economy.debtRatio': +2 },
        delayedEffects: [
          { quartersDelay: 3, effects: { 'economy.tradeBalance': +6, 'economy.gdpIndex': +4 }, label: 'Grüne Exportoffensive voll angelaufen' },
        ],
      },
      {
        id: 'klima-inland',
        label: 'Inland priorisieren — günstige Energie für alle',
        immediateEffects: { 'economy.inflation': +4, 'society.publicSatisfaction': +5 },
        policyArea: 'klimaschutz',
        policyPosition: 85,
        delayedEffects: [
          { quartersDelay: 4, effects: { 'economy.gdpIndex': +3, 'society.publicSatisfaction': +3 }, label: 'Energiewende senkt Lebenshaltungskosten' },
        ],
      },
      {
        id: 'klima-eu-markt',
        label: 'EU-Energiemarkt integrieren',
        immediateEffects: { 'politics.euRelations': +7 },
        internationalReactions: { eu: +8 },
        delayedEffects: [
          { quartersDelay: 5, effects: { 'economy.tradeBalance': +4, 'economy.gdpIndex': +3 }, label: 'EU-Energiemarkt stärkt deutsche Position' },
        ],
      },
    ],
  },

  {
    id: 'pension-crisis',
    label: 'Rentenkrise',
    description: 'Aktuarielle Prognosen schlagen Alarm: Das gesetzliche Rentensystem ist ab 2035 nicht mehr finanzierbar. Die Koalition muss vor der Wahl Farbe bekennen.',
    trigger: (state) => state.economy.taxRevenue < 50 || state.economy.debtRatio > 40,
    probability: 0.10,
    immediateEffects: {
      'politics.mediaRelations': -5,
      'society.publicSatisfaction': -4,
    },
    choices: [
      {
        id: 'pension-rentenalter',
        label: 'Renteneintrittsalter auf 68 erhöhen',
        immediateEffects: { 'society.publicSatisfaction': -10, 'politics.coalitionStability': -8 },
        policyArea: 'sozialstaat',
        policyPosition: 35,
        delayedEffects: [
          { quartersDelay: 4, effects: { 'government.budgetBalance': +10, 'economy.taxRevenue': +3 }, label: 'Rentenhaushalt langfristig stabilisiert' },
        ],
      },
      {
        id: 'pension-kapitaldeckung',
        label: 'Kapitalgedeckte Säule einführen (Aktienrente)',
        immediateEffects: { 'society.socialJustice': -4, 'economy.gdpIndex': +2 },
        delayedEffects: [
          { quartersDelay: 6, effects: { 'government.budgetBalance': +5, 'economy.tradeBalance': +2 }, label: 'Aktienrente trägt erste Früchte' },
        ],
      },
      {
        id: 'pension-beitraege',
        label: 'Rentenbeiträge und Steuern erhöhen',
        immediateEffects: { 'economy.gdpIndex': -3, 'society.socialJustice': +4, 'politics.coalitionStability': -5 },
        delayedEffects: [
          { quartersDelay: 3, effects: { 'government.budgetBalance': +7 }, label: 'Rentenfinanzierung kurzfristig gesichert' },
        ],
      },
    ],
  },
];
