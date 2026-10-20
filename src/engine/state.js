// ============================================================
// STATE.JS — Das komplette Spielmodell
// Alle Werte: 0–100 sofern nicht anders angegeben
// ============================================================

export const createInitialState = () => ({

  // ── META ─────────────────────────────────────────────────
  year: 2025,
  quarter: 1,           // 1–4
  phase: 'governing',   // 'governing' | 'campaign' | 'coalition' | 'gameover' | 'win'
  turnsUntilElection: 16, // Quartale (= 4 Jahre)

  // ── PRIMÄRVARIABLEN (direkt sichtbar) ────────────────────
  economy: {
    gdpIndex: 54,         // BIP-Index
    unemployment: 38,     // invertiert: 100 = 0% Arbeitslos
    inflation: 65,        // invertiert: 100 = 0% Inflation
    debtRatio: 28,        // Schuldenquote % BIP (NICHT invertiert, niedriger = besser)
    interestBurden: 22,   // Zinslast (steigt mit debtRatio)
    taxRevenue: 58,       // Steuereinnahmen-Index
    tradeBalance: 52,     // Außenhandel
  },

  society: {
    publicSatisfaction: 45,   // Bevölkerungszufriedenheit
    socialJustice: 48,        // Verteilungsgerechtigkeit
    securityFeeling: 55,      // Innere Sicherheit
    climateProgress: 40,      // Klimaschutz-Index
    healthcareQuality: 62,    // Gesundheitssystem
    infrastructureState: 50,  // Infrastrukturzustand
  },

  politics: {
    coalitionStability: 68,   // Wie stabil ist die aktuelle Koalition
    mediaRelations: 52,       // Medien-Multiplikator: <50 = negativ, >50 = positiv
    parliamentarySupport: 61, // Rückhalt im Bundestag
    euRelations: 65,          // Verhältnis zur EU
    usRelations: 70,          // Verhältnis zu USA
    chinaRelations: 45,       // Verhältnis zu China
  },

  // ── REGIERUNG ────────────────────────────────────────────
  government: {
    coalition: [],            // z.B. ['CDU', 'SPD']
    ministries: {},           // { 'Finanzen': 'CDU', 'Innen': 'SPD', ... }
    coalitionContract: {},    // { policy: 'agreed'|'contested', ... }
    chancellorParty: '',
    approvalRating: 45,       // Kanzler-Zustimmung
    budgetBalance: -12,       // Mrd. €, negativ = Defizit
    termQuarter: 0,           // Wie lange regiert diese Koalition schon
  },

  // ── PARLAMENT ────────────────────────────────────────────
  parliament: {
    seats: {},                // { CDU: 196, SPD: 120, ... } — wird bei Wahl gesetzt
    totalSeats: 630,
    majorityNeeded: 316,
    pendingVotesOfNoConfidence: 0,
  },

  // ── INTERNATIONALE AKTEURE ───────────────────────────────
  international: {
    eu: {
      relationScore: 65,
      currentDemands: [],     // z.B. ['Haushaltsdisziplin', 'Migrationspakt']
      activeConflicts: [],
    },
    usa: {
      relationScore: 70,
      currentDemands: [],
      tradeAgreementActive: true,
      natoCommitmentSatisfied: true,
    },
    china: {
      relationScore: 45,
      currentDemands: [],
      tradeVolume: 52,
      techTransferPressure: false,
    },
  },

  // ── VERZÖGERUNGSWARTESCHLANGE ────────────────────────────
  // Effekte die erst in N Quartalen eintreten
  delayedEffects: [
    // Beispiel: { id: 'infra-invest-1', appliesInQuarter: 8, effects: { 'economy.gdpIndex': +5 }, label: 'Infrastrukturinvestition greift' }
  ],

  // ── AKTIVE EREIGNISSE ────────────────────────────────────
  activeEvents: [],

  // ── MINISTERIEN ──────────────────────────────────────────
  // Wird befüllt wenn Koalition gebildet wird (generateAllMinisters)
  ministers: [],

  // ── GESETZGEBUNG ─────────────────────────────────────────
  legislation: {
    enactedLaws:             [],   // [{ lawId, termQuarter, year }]
    failedLaws:              [],   // [{ lawId, termQuarter, year, reason }]
    lastLegislationQuarter:  -1,   // termQuarter der letzten Einbringung (max. 1/Quartal)
  },

  // ── SCHEDULING ───────────────────────────────────────────
  // Steuert Timing von Haushalt, Stellungnahmen, Ereignissen.
  scheduling: {
    lastStellungnahmeQuarter:  0,    // Quartal der letzten Stellungnahme (0 = noch keine)
    usedStellungnahmeTopics:   [],   // Themen die bereits diese Legislatur vorkamen
    lastQuarterType:           null, // 'haushalt' | 'ereignis' | 'stellungnahme' | null
    lastEventQuarter:          -10,  // Quartal des letzten Events (−10 = noch keines)
    eventCount:                0,    // Anzahl Events in dieser Legislatur
  },

  // ── HISTORY (für Charts) ─────────────────────────────────
  history: [],

  // ── EREIGNISPROTOKOLL ────────────────────────────────────
  eventLog: [],

  // ── ERWEITERUNGEN ────────────────────────────────────────
  // Platzhalter für zukünftige Features. Hooks und Extensions
  // können hier ihre Daten ablegen ohne den Kern-State zu ändern.
  extensions: {
    bundeslaender:  BUNDESLAENDER_DATA,  // Bundesländer-Daten (Bundesrat-System)
    bundesrat:      {},                  // Bundesrat-Abstimmungsergebnisse
    parteiaufbau:   {},                  // Parteistrukturen und Mitglieder
    landtagswahlen: {},                  // Landtagswahl-Ergebnisse und -Termine
  },
});

// ── PARTEIPOSITIONEN (Policy-Skalen 0–100) ───────────────────
// Jede Partei hat eine Position auf jeder Achse.
// Koalitionsverhandlung = wie weit müssen sie sich annähern?
export const PARTY_POSITIONS = {
  CDU: {
    color: '#1a1a1a',
    fullName: 'CDU/CSU',
    seats: 0, // wird bei Wahl gesetzt
    ideology: 'konservativ',
    positions: {
      wirtschaftsliberalismus: 72,
      sozialstaat: 40,
      migration: 30,        // 0 = sehr restriktiv, 100 = sehr offen
      klimaschutz: 45,
      euIntegration: 65,
      inneresSicherheit: 70,
      nato: 80,
      schuldenbremse: 75,
    },
    redLines: ['schuldenbremse < 40', 'migration > 70'],
    ministerienPrioritaet: ['Finanzen', 'Innen', 'Wirtschaft'],
    koalitionspräferenz: ['SPD', 'FDP', 'Grüne'],
  },

  SPD: {
    color: '#E3000F',
    fullName: 'SPD',
    seats: 0,
    ideology: 'sozialdemokratisch',
    positions: {
      wirtschaftsliberalismus: 40,
      sozialstaat: 75,
      migration: 62,
      klimaschutz: 60,
      euIntegration: 72,
      inneresSicherheit: 52,
      nato: 65,
      schuldenbremse: 35,
    },
    redLines: ['sozialstaat < 55', 'nato < 40'],
    ministerienPrioritaet: ['Arbeit', 'Außen', 'Gesundheit'],
    koalitionspräferenz: ['Grüne', 'CDU', 'FDP'],
  },

  Grüne: {
    color: '#1AA037',
    fullName: 'Bündnis 90/Die Grünen',
    seats: 0,
    ideology: 'grün-links',
    positions: {
      wirtschaftsliberalismus: 38,
      sozialstaat: 68,
      migration: 82,
      klimaschutz: 92,
      euIntegration: 85,
      inneresSicherheit: 42,
      nato: 55,
      schuldenbremse: 25,
    },
    redLines: ['klimaschutz < 60', 'migration < 50'],
    ministerienPrioritaet: ['Umwelt', 'Außen', 'Wirtschaft'],
    koalitionspräferenz: ['SPD', 'FDP', 'CDU'],
  },

  FDP: {
    color: '#FFED00',
    fullName: 'FDP',
    seats: 0,
    ideology: 'liberal',
    positions: {
      wirtschaftsliberalismus: 88,
      sozialstaat: 28,
      migration: 48,
      klimaschutz: 40,
      euIntegration: 70,
      inneresSicherheit: 58,
      nato: 75,
      schuldenbremse: 95,
    },
    redLines: ['schuldenbremse < 70', 'wirtschaftsliberalismus < 65'],
    ministerienPrioritaet: ['Finanzen', 'Justiz', 'Wirtschaft'],
    koalitionspräferenz: ['CDU', 'SPD'],
  },

  AfD: {
    color: '#009EE0',
    fullName: 'AfD',
    seats: 0,
    ideology: 'rechtsnational',
    positions: {
      wirtschaftsliberalismus: 50,
      sozialstaat: 45,
      migration: 5,
      klimaschutz: 10,
      euIntegration: 15,
      inneresSicherheit: 85,
      nato: 35,
      schuldenbremse: 60,
    },
    redLines: ['migration > 30', 'euIntegration > 40'],
    ministerienPrioritaet: ['Innen', 'Verteidigung'],
    koalitionspräferenz: [], // Brandmauer: niemand koaliert mit AfD
    isPariah: true,          // andere Parteien koalieren nicht mit ihr
  },

  Linke: {
    color: '#BE3075',
    fullName: 'Die Linke',
    seats: 0,
    ideology: 'links',
    positions: {
      wirtschaftsliberalismus: 15,
      sozialstaat: 92,
      migration: 88,
      klimaschutz: 78,
      euIntegration: 55,
      inneresSicherheit: 30,
      nato: 10,
      schuldenbremse: 5,
    },
    redLines: ['nato > 50', 'sozialstaat < 70'],
    ministerienPrioritaet: ['Soziales', 'Gesundheit', 'Arbeit'],
    koalitionspräferenz: ['SPD', 'Grüne', 'BSW'],
  },

  BSW: {
    color: '#7B1E52',
    fullName: 'BSW',
    seats: 0,
    ideology: 'linksnational',
    positions: {
      wirtschaftsliberalismus: 30,
      sozialstaat: 80,
      migration: 22,
      klimaschutz: 45,
      euIntegration: 35,
      inneresSicherheit: 68,
      nato: 25,
      schuldenbremse: 40,
    },
    redLines: ['nato > 60', 'migration > 55'],
    ministerienPrioritaet: ['Soziales', 'Innen', 'Außen'],
    koalitionspräferenz: ['SPD', 'Linke'],
  },
};

export const MINISTERIEN = [
  { name: 'Finanzen',       power: 10, policyArea: 'schuldenbremse' },
  { name: 'Innen',          power: 9,  policyArea: 'inneresSicherheit' },
  { name: 'Außen',          power: 9,  policyArea: 'euIntegration' },
  { name: 'Wirtschaft',     power: 8,  policyArea: 'wirtschaftsliberalismus' },
  { name: 'Arbeit',         power: 7,  policyArea: 'sozialstaat' },
  { name: 'Verteidigung',   power: 7,  policyArea: 'nato' },
  { name: 'Umwelt',         power: 7,  policyArea: 'klimaschutz' },
  { name: 'Gesundheit',     power: 6,  policyArea: 'sozialstaat' },
  { name: 'Justiz',         power: 6,  policyArea: 'inneresSicherheit' },
  { name: 'Soziales',       power: 6,  policyArea: 'sozialstaat' },
  { name: 'Bildung',        power: 5,  policyArea: 'sozialstaat' },
  { name: 'Verkehr',        power: 5,  policyArea: 'klimaschutz' },
  { name: 'Digitales',      power: 4,  policyArea: 'wirtschaftsliberalismus' },
  { name: 'Entwicklung',    power: 3,  policyArea: 'euIntegration' },
];

// ── BUNDESLÄNDER (Stand: 2025) ────────────────────────────────
// bundesratStimmen: je nach Bevölkerung (3 / 4 / 5 / 6)
// Total: 69 Stimmen
// regierungspartei: führende Partei der Landesregierung
export const BUNDESLAENDER_DATA = {
  badenwuerttemberg: {
    name: 'Baden-Württemberg',
    hauptstadt: 'Stuttgart',
    bundesratStimmen: 6,
    regierungspartei: 'Grüne',
    koalition: ['Grüne', 'CDU'],
    wirtschaftskraft: 82,
    nextWahl: 2026,
  },
  bayern: {
    name: 'Bayern',
    hauptstadt: 'München',
    bundesratStimmen: 6,
    regierungspartei: 'CSU',
    koalition: ['CSU', 'FW'],
    wirtschaftskraft: 85,
    nextWahl: 2028,
  },
  berlin: {
    name: 'Berlin',
    hauptstadt: 'Berlin',
    bundesratStimmen: 4,
    regierungspartei: 'CDU',
    koalition: ['CDU', 'SPD'],
    wirtschaftskraft: 63,
    nextWahl: 2026,
  },
  brandenburg: {
    name: 'Brandenburg',
    hauptstadt: 'Potsdam',
    bundesratStimmen: 4,
    regierungspartei: 'SPD',
    koalition: ['SPD', 'BSW'],
    wirtschaftskraft: 48,
    nextWahl: 2029,
  },
  bremen: {
    name: 'Bremen',
    hauptstadt: 'Bremen',
    bundesratStimmen: 3,
    regierungspartei: 'SPD',
    koalition: ['SPD', 'Grüne', 'Volt'],
    wirtschaftskraft: 58,
    nextWahl: 2027,
  },
  hamburg: {
    name: 'Hamburg',
    hauptstadt: 'Hamburg',
    bundesratStimmen: 3,
    regierungspartei: 'SPD',
    koalition: ['SPD', 'Grüne'],
    wirtschaftskraft: 78,
    nextWahl: 2029,
  },
  hessen: {
    name: 'Hessen',
    hauptstadt: 'Wiesbaden',
    bundesratStimmen: 5,
    regierungspartei: 'CDU',
    koalition: ['CDU', 'SPD'],
    wirtschaftskraft: 80,
    nextWahl: 2028,
  },
  mecklenburgvorpommern: {
    name: 'Mecklenburg-Vorpommern',
    hauptstadt: 'Schwerin',
    bundesratStimmen: 3,
    regierungspartei: 'SPD',
    koalition: ['SPD', 'Linke'],
    wirtschaftskraft: 38,
    nextWahl: 2026,
  },
  niedersachsen: {
    name: 'Niedersachsen',
    hauptstadt: 'Hannover',
    bundesratStimmen: 6,
    regierungspartei: 'SPD',
    koalition: ['SPD', 'CDU'],
    wirtschaftskraft: 68,
    nextWahl: 2027,
  },
  nordrheinwestfalen: {
    name: 'Nordrhein-Westfalen',
    hauptstadt: 'Düsseldorf',
    bundesratStimmen: 6,
    regierungspartei: 'CDU',
    koalition: ['CDU', 'Grüne'],
    wirtschaftskraft: 72,
    nextWahl: 2027,
  },
  rheinlandpfalz: {
    name: 'Rheinland-Pfalz',
    hauptstadt: 'Mainz',
    bundesratStimmen: 4,
    regierungspartei: 'SPD',
    koalition: ['SPD', 'Grüne', 'FDP'],
    wirtschaftskraft: 64,
    nextWahl: 2026,
  },
  saarland: {
    name: 'Saarland',
    hauptstadt: 'Saarbrücken',
    bundesratStimmen: 3,
    regierungspartei: 'SPD',
    koalition: ['SPD'],
    wirtschaftskraft: 55,
    nextWahl: 2027,
  },
  sachsen: {
    name: 'Sachsen',
    hauptstadt: 'Dresden',
    bundesratStimmen: 4,
    regierungspartei: 'CDU',
    koalition: ['CDU', 'SPD', 'BSW'],
    wirtschaftskraft: 55,
    nextWahl: 2029,
  },
  sachsenanhalt: {
    name: 'Sachsen-Anhalt',
    hauptstadt: 'Magdeburg',
    bundesratStimmen: 4,
    regierungspartei: 'CDU',
    koalition: ['CDU', 'SPD'],
    wirtschaftskraft: 42,
    nextWahl: 2026,
  },
  schleswigholstein: {
    name: 'Schleswig-Holstein',
    hauptstadt: 'Kiel',
    bundesratStimmen: 4,
    regierungspartei: 'CDU',
    koalition: ['CDU'],
    wirtschaftskraft: 58,
    nextWahl: 2027,
  },
  thueringen: {
    name: 'Thüringen',
    hauptstadt: 'Erfurt',
    bundesratStimmen: 4,
    regierungspartei: 'CDU',
    koalition: ['CDU', 'BSW', 'SPD'],
    wirtschaftskraft: 46,
    nextWahl: 2029,
  },
};
