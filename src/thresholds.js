// ============================================================
// THRESHOLDS.JS — Zielkorridore für alle 20 Dashboard-Variablen
// optimal: Zielwert · dangerBelow/Above: Warnschwelle · criticalBelow/Above: Kritische Schwelle
// ============================================================

export const THRESHOLDS = {
  'economy.gdpIndex': {
    label: 'BIP-Index', optimal: 60, dangerBelow: 35, criticalBelow: 20, higherIsBad: false,
  },
  'economy.unemployment': {
    label: 'Beschäftigung', optimal: 60, dangerBelow: 35, criticalBelow: 20, higherIsBad: false,
  },
  'economy.inflation': {
    label: 'Preisstabilität', optimal: 65, dangerBelow: 40, criticalBelow: 25, higherIsBad: false,
  },
  'economy.debtRatio': {
    label: 'Schuldenquote', optimal: 30, dangerAbove: 55, criticalAbove: 75, higherIsBad: true,
  },
  'economy.interestBurden': {
    label: 'Zinslast', optimal: 22, dangerAbove: 35, criticalAbove: 50, higherIsBad: true,
  },
  'economy.taxRevenue': {
    label: 'Steuereinnahmen', optimal: 60, dangerBelow: 35, criticalBelow: 20, higherIsBad: false,
  },
  'economy.tradeBalance': {
    label: 'Außenhandel', optimal: 55, dangerBelow: 30, criticalBelow: 15, higherIsBad: false,
  },
  'society.publicSatisfaction': {
    label: 'Zufriedenheit', optimal: 55, dangerBelow: 20, criticalBelow: 10, higherIsBad: false,
  },
  'society.socialJustice': {
    label: 'Soz. Gerechtigkeit', optimal: 50, dangerBelow: 28, criticalBelow: 15, higherIsBad: false,
  },
  'society.securityFeeling': {
    label: 'Sicherheitsgefühl', optimal: 55, dangerBelow: 30, criticalBelow: 15, higherIsBad: false,
  },
  'society.climateProgress': {
    label: 'Klimafortschritt', optimal: 50, dangerBelow: 25, criticalBelow: 10, higherIsBad: false,
  },
  'society.healthcareQuality': {
    label: 'Gesundheitssystem', optimal: 60, dangerBelow: 35, criticalBelow: 20, higherIsBad: false,
  },
  'society.infrastructureState': {
    label: 'Infrastruktur', optimal: 55, dangerBelow: 30, criticalBelow: 15, higherIsBad: false,
  },
  'politics.coalitionStability': {
    label: 'Koalitionsstab.', optimal: 60, dangerBelow: 25, criticalBelow: 10, higherIsBad: false,
  },
  'politics.mediaRelations': {
    label: 'Medienrelationen', optimal: 55, dangerBelow: 25, criticalBelow: 10, higherIsBad: false,
  },
  'politics.parliamentarySupport': {
    label: 'Parlamentsrückhalt', optimal: 60, dangerBelow: 30, criticalBelow: 15, higherIsBad: false,
  },
  'government.approvalRating': {
    label: 'Kanzler-Zustimmung', optimal: 55, dangerBelow: 20, criticalBelow: 10, higherIsBad: false,
  },
  'international.eu.relationScore': {
    label: 'EU-Beziehungen', optimal: 60, dangerBelow: 30, criticalBelow: 15, higherIsBad: false,
  },
  'international.usa.relationScore': {
    label: 'USA-Beziehungen', optimal: 60, dangerBelow: 30, criticalBelow: 15, higherIsBad: false,
  },
  'international.china.relationScore': {
    label: 'China-Beziehungen', optimal: 50, dangerBelow: 20, criticalBelow: 10, higherIsBad: false,
  },
};

// Returns signed deviation from optimal: negative = bad, positive = good
export function getDeviation(path, value) {
  const t = THRESHOLDS[path];
  if (!t) return 0;
  // higherIsBad: low values are good → deviation = optimal - value (positive when below optimal)
  // else: high values are good → deviation = value - optimal (positive when above optimal)
  return t.higherIsBad ? (t.optimal - value) : (value - t.optimal);
}

// Returns alarm level for a variable
export function getAlarmLevel(path, value) {
  const t = THRESHOLDS[path];
  if (!t) return 'ok';
  if (t.higherIsBad) {
    if (t.criticalAbove !== undefined && value >= t.criticalAbove) return 'critical';
    if (t.dangerAbove  !== undefined && value >= t.dangerAbove)   return 'danger';
    if (value > t.optimal * 1.15)                                  return 'warn';
  } else {
    if (t.criticalBelow !== undefined && value <= t.criticalBelow) return 'critical';
    if (t.dangerBelow   !== undefined && value <= t.dangerBelow)   return 'danger';
    if (value < t.optimal * 0.88)                                  return 'warn';
  }
  return 'ok';
}

// Short display labels for effect paths (used in event log)
export const EFFECT_LABELS = {
  'economy.gdpIndex':              'BIP',
  'economy.unemployment':          'Beschäftigung',
  'economy.inflation':             'Preisstabilität',
  'economy.debtRatio':             'Schuldenquote',
  'economy.interestBurden':        'Zinslast',
  'economy.taxRevenue':            'Steuereinnahmen',
  'economy.tradeBalance':          'Außenhandel',
  'government.budgetBalance':      'Haushalt',
  'society.publicSatisfaction':    'Zufriedenheit',
  'society.socialJustice':         'Soz. Gerechtigkeit',
  'society.securityFeeling':       'Sicherheit',
  'society.climateProgress':       'Klimafortschritt',
  'society.healthcareQuality':     'Gesundheit',
  'society.infrastructureState':   'Infrastruktur',
  'politics.coalitionStability':   'Koalitionsstab.',
  'politics.mediaRelations':       'Medien',
  'politics.parliamentarySupport': 'Parlamentsrückh.',
  'politics.euRelations':          'EU',
  'politics.usRelations':          'USA',
  'politics.chinaRelations':       'China',
};
