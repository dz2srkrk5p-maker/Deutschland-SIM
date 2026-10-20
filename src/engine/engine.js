// ============================================================
// ENGINE.JS — tick() Funktion: verarbeitet alle Flows pro Quartal
//
// Was: Kern-Spielschleife. tick() ist die einzige Funktion die
//      einen neuen State erzeugt. applyDecision() ist der
//      öffentliche Einstiegspunkt für Spielerentscheidungen.
//
// Nutzt: state.js (PARTY_POSITIONS), config.js (Schwellenwerte)
//
// Erweiterungspunkte:
//   - registerHook(event, fn): Callback für 'beforeTick'/'afterTick'
//   - Neue computeXFlows()-Funktionen für weitere State-Bereiche
//   - CONFIG-Werte für Balancing anpassen ohne Code zu ändern
// ============================================================

import { PARTY_POSITIONS } from './state.js';
import { CONFIG } from '../config.js';

// ── HOOK SYSTEM ───────────────────────────────────────────────
// Erlaubt Erweiterungen (Bundeslaender, Parteiaufbau) sich in
// den Game-Loop einzuhängen ohne engine.js zu modifizieren.
const _hooks = new Map();

export function registerHook(event, fn) {
  if (!_hooks.has(event)) _hooks.set(event, []);
  _hooks.get(event).push(fn);
}

export function runHooks(event, state) {
  const fns = _hooks.get(event) ?? [];
  for (const fn of fns) fn(state);
}

// Hilfsfunktionen
const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const clampDebt = (v) => Math.max(0, Math.min(CONFIG.MAX_DEBT_RATIO, v));

// ── HAUPT-TICK ───────────────────────────────────────────────
export function tick(state) {
  const s = structuredClone(state);
  const delta = {}; // Sammelt alle Änderungen bevor sie angewendet werden

  runHooks('beforeTick', s);

  // 1. WIRTSCHAFTLICHE FLOWS
  computeEconomyFlows(s, delta);

  // 2. GESELLSCHAFTLICHE FLOWS
  computeSocietyFlows(s, delta);

  // 3. POLITISCHE FLOWS
  computePoliticsFlows(s, delta);

  // 4. INTERNATIONALE FLOWS
  computeInternationalFlows(s, delta);

  // 5. MEDIEN-MULTIPLIKATOR anwenden
  applyMediaMultiplier(s, delta);

  // 6. DELTA ANWENDEN
  applyDelta(s, delta);

  // 7. VERZÖGERTE EFFEKTE prüfen
  processDelayedEffects(s);

  // 8. WAHLTRIGGER prüfen
  s.turnsUntilElection -= 1;
  s.government.termQuarter += 1;
  s.quarter = s.quarter === 4 ? 1 : s.quarter + 1;
  if (s.quarter === 1) s.year += 1;

  // 9. HISTORY snapshot
  s.history.push(snapshotState(s));

  // 10. GAME OVER CHECKS
  checkGameOver(s);

  runHooks('afterTick', s);

  return s;
}

// ── WIRTSCHAFT ───────────────────────────────────────────────
function computeEconomyFlows(s, delta) {
  const e = s.economy;

  // Zinslast konvergiert zu Gleichgewichtswert basierend auf Schuldenquote (nicht mehr kumulativ wachsend)
  const targetInterestBurden = 15 + e.debtRatio * 0.3; // Ziel: bei 28% Schulden → ~23, bei 60% → ~33
  delta['economy.interestBurden'] = (targetInterestBurden - e.interestBurden) * 0.1;

  // Zinslast schadet BIP (halbiert: /40 statt /20)
  delta['economy.gdpIndex'] = -(e.interestBurden / 40);

  // Basis-Produktivitätswachstum (+0.15/Quartal ≈ 0.6/Jahr) — ohne Krisen stabilisiert BIP
  delta['economy.gdpIndex'] += 0.15;

  // Positive Wirtschaftsdynamik: starkes BIP zieht Investitionen an (gedämpft ×0.008 statt 0.02)
  if (e.gdpIndex > 52) delta['economy.gdpIndex'] += (e.gdpIndex - 52) * 0.008;

  // Natürliche Erholung: wenn BIP unter 40 → automatisch +0.5 pro Quartal
  if (e.gdpIndex < 40) delta['economy.gdpIndex'] += 0.5;

  // Erwartungsinflation: kontinuierliche Bremse, wächst mit dem Wert mit (kein Stufen-Problem)
  delta['economy.gdpIndex'] -= Math.pow(Math.max(0, e.gdpIndex - 55), 1.5) * 0.015;

  // Beschäftigung: leichte Kopplung an BIP
  if (e.gdpIndex > 60) delta['economy.unemployment'] = (delta['economy.unemployment'] ?? 0) + 0.2;

  // Inflation: leichte Kopplung an Schuldenquote (hohe Schulden → reale Inflation steigt → Index sinkt)
  if (e.debtRatio > 40) delta['economy.inflation'] = (delta['economy.inflation'] ?? 0) - 0.3;

  // BIP beeinflusst Steuereinnahmen (mit 1 Quartal Verzögerung — hier direkt für Einfachheit)
  delta['economy.taxRevenue'] = (e.gdpIndex - e.taxRevenue) * 0.15;

  // Steuereinnahmen vs. Haushalt: Defizit = Schulden wachsen
  const budgetPressure = s.government.budgetBalance < 0
    ? Math.abs(s.government.budgetBalance) / 50
    : -0.2;
  delta['economy.debtRatio'] = +budgetPressure;

  // Inflation-BIP-Zusammenhang: sehr hohe oder sehr niedrige Inflation schadet BIP
  const inflationDeviation = Math.abs(e.inflation - 70); // 70 = "gesunde" ~2% Inflation
  delta['economy.gdpIndex'] += -(inflationDeviation / 80);

  // Handel: gute EU-Beziehungen = besserer Außenhandel
  delta['economy.tradeBalance'] = (s.politics.euRelations - 50) * 0.05;
  // Kontinuierliche Handelsbremse — verhindert Drift zu 100 (identisches Prinzip wie BIP)
  delta['economy.tradeBalance'] -= Math.pow(Math.max(0, e.tradeBalance - 55), 1.5) * 0.015;

  // Außenhandel → BIP
  delta['economy.gdpIndex'] += (e.tradeBalance - 50) * 0.03;

  // Infrastruktur → BIP (mittelfristig, daher schwacher Faktor)
  delta['economy.gdpIndex'] += (s.society.infrastructureState - 50) * 0.02;
}

// ── GESELLSCHAFT ─────────────────────────────────────────────
function computeSocietyFlows(s, delta) {
  const e = s.economy;
  const soc = s.society;

  // Wirtschaft → Zufriedenheit (stärkster Faktor)
  delta['society.publicSatisfaction'] = (e.gdpIndex - 50) * 0.12;

  // Arbeitslosigkeit → Zufriedenheit & soziale Gerechtigkeit
  delta['society.publicSatisfaction'] += (e.unemployment - 50) * 0.08;
  delta['society.socialJustice'] = (e.unemployment - 50) * 0.03; // halbiert (war 0.06)

  // Soziale Gerechtigkeit → Zufriedenheit (verzögert, daher schwach)
  delta['society.publicSatisfaction'] += (soc.socialJustice - 50) * 0.04;

  // Inflation → Zufriedenheit (direkt spürbar)
  delta['society.publicSatisfaction'] += (e.inflation - 50) * 0.06;

  // Sicherheitsgefühl → Zufriedenheit
  delta['society.publicSatisfaction'] += (soc.securityFeeling - 50) * 0.03;

  // Infrastruktur degeneriert langsam ohne Investition (halbiert)
  delta['society.infrastructureState'] = -0.15;

  // Gesundheitsystem wird durch Steuereinnahmen gestützt
  delta['society.healthcareQuality'] = (e.taxRevenue - 50) * 0.02;

  // Soziale Gerechtigkeit: automatische Erholung bei sehr niedrigen Werten (sozialer Druck)
  if (soc.socialJustice < 30) delta['society.socialJustice'] = (delta['society.socialJustice'] ?? 0) + 0.2;

  // Erwartungsinflation für Zufriedenheit: kontinuierliche Bremse (identisches Prinzip wie BIP)
  delta['society.publicSatisfaction'] -= Math.pow(Math.max(0, soc.publicSatisfaction - 55), 1.5) * 0.015;

  // Sicherheitsgefühl: natürliche Drift ohne Investitionen
  delta['society.securityFeeling'] = (delta['society.securityFeeling'] ?? 0) - 0.1;

  // Klimafortschritt: Zerfall ohne aktive Klimapolitik
  delta['society.climateProgress'] = (delta['society.climateProgress'] ?? 0) - 0.2;
}

// ── POLITIK ─────────────────────────────────────────────────
function computePoliticsFlows(s, delta) {
  const p = s.politics;

  // Koalitionsstabilität sinkt natürlich über Zeit (reduziert: -0.2 statt -0.5)
  delta['politics.coalitionStability'] = -0.2;

  // Zufriedenheit → parlamentarischer Rückhalt
  delta['politics.parliamentarySupport'] = (s.society.publicSatisfaction - 50) * 0.08;
  // Parlamentsbremse: Fraktionskonflikte bei dauerhaft hoher Unterstützung lassen nach
  delta['politics.parliamentarySupport'] -= Math.pow(Math.max(0, p.parliamentarySupport - 55), 1.5) * 0.015;

  // Niedrige Parlamentsunterstützung destabilisiert Koalition
  if (p.parliamentarySupport < 40) {
    delta['politics.coalitionStability'] += (p.parliamentarySupport - 40) * 0.1;
  }

  // Medien: schlechte Wirtschaft = schlechtere Medienberichterstattung
  delta['politics.mediaRelations'] = (s.economy.gdpIndex - 50) * 0.04;
  delta['politics.mediaRelations'] += (s.society.publicSatisfaction - 50) * 0.03;
  // Medien-Bremse: kritische Presse bei dauerhaft hohen Werten (Erwartungsdruck)
  delta['politics.mediaRelations'] -= Math.pow(Math.max(0, p.mediaRelations - 55), 1.5) * 0.015;

  // Zustimmung des Kanzlers
  delta['government.approvalRating'] = 0;
  s.government.approvalRating += (s.society.publicSatisfaction - 50) * 0.1;
  s.government.approvalRating += (p.coalitionStability - 50) * 0.05;
  s.government.approvalRating = clamp(s.government.approvalRating);

  // Misstrauensvotum-Druck steigt bei sehr niedriger Stabilität
  if (p.coalitionStability < 20 && p.parliamentarySupport < 35) {
    s.parliament.pendingVotesOfNoConfidence += 1;
  }
}

// ── INTERNATIONAL ────────────────────────────────────────────
function computeInternationalFlows(s, delta) {
  const intl = s.international;

  // EU-Beziehungen beeinflussen Handel und Schulden (EU-Fördermittel)
  delta['economy.tradeBalance'] += (intl.eu.relationScore - 50) * 0.04;
  if (intl.eu.relationScore < 40) {
    delta['economy.debtRatio'] += 0.2; // EU-Fördermittel fallen weg
  }

  // USA: Handelsabkommen aktiv?
  if (intl.usa.tradeAgreementActive) {
    delta['economy.gdpIndex'] += 0.3;
  }
  // NATO-Verpflichtung nicht erfüllt = USA-Beziehungen verschlechtern sich
  if (!intl.usa.natoCommitmentSatisfied) {
    intl.usa.relationScore = clamp(intl.usa.relationScore - 0.5);
  }

  // China: hoher Handelsvolumen = BIP-Abhängigkeit (risikobehaftet)
  delta['economy.tradeBalance'] += (intl.china.tradeVolume - 50) * 0.03;
  if (intl.china.techTransferPressure) {
    delta['economy.gdpIndex'] -= 0.8;
  }

  // EU/China: zufällige Drift ±0.1 pro Quartal
  intl.eu.relationScore    = clamp(intl.eu.relationScore    + (Math.random() - 0.5) * 0.2);
  intl.china.relationScore = clamp(intl.china.relationScore + (Math.random() - 0.5) * 0.2);

  // Sync zurück zu politics
  delta['politics.euRelations']    = (intl.eu.relationScore    - s.politics.euRelations)    * 0.3;
  delta['politics.usRelations']    = (intl.usa.relationScore   - s.politics.usRelations)    * 0.3;
  delta['politics.chinaRelations'] = (intl.china.relationScore - s.politics.chinaRelations) * 0.3;
}

// ── MEDIEN-MULTIPLIKATOR ─────────────────────────────────────
// Schlechte Medien = alle negativen Effekte werden verstärkt, positive gedämpft
function applyMediaMultiplier(s, delta) {
  const media = s.politics.mediaRelations;
  const multiplier = media < 50
    ? 1 + (50 - media) / 100  // bis 1.5× bei media=0
    : 1 - (media - 50) / 200; // bis 0.75× bei media=100

  for (const key in delta) {
    if (delta[key] < 0) {
      delta[key] *= multiplier; // negative Effekte werden stärker
    } else {
      delta[key] /= multiplier; // positive Effekte werden gedämpft
    }
  }
}

// ── DELTA ANWENDEN ───────────────────────────────────────────
function applyDelta(s, delta) {
  for (const [path, value] of Object.entries(delta)) {
    const parts = path.split('.');
    let obj = s;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }
    const key = parts[parts.length - 1];
    if (key === 'debtRatio') {
      obj[key] = clampDebt((obj[key] || 0) + value);
    } else if (key === 'budgetBalance') {
      obj[key] = (obj[key] || 0) + value; // Budget kann negativ sein
    } else {
      obj[key] = clamp((obj[key] || 0) + value);
    }
  }
}

// ── VERZÖGERTE EFFEKTE ───────────────────────────────────────
function processDelayedEffects(s) {
  const currentTurn = s.government.termQuarter;
  const toApply = s.delayedEffects.filter(e => e.appliesInQuarter <= currentTurn);
  const remaining = s.delayedEffects.filter(e => e.appliesInQuarter > currentTurn);

  for (const effect of toApply) {
    applyDelta(s, effect.effects);
    // Effekt kann als "news" in activeEvents erscheinen
    s.activeEvents.push({
      id: effect.id + '-resolved',
      type: 'delayed-resolved',
      label: effect.label,
      quarter: currentTurn,
    });
  }
  s.delayedEffects = remaining;
}

// ── SNAPSHOT FÜR HISTORY ─────────────────────────────────────
function snapshotState(s) {
  return {
    year: s.year,
    quarter: s.quarter,
    gdpIndex:             s.economy.gdpIndex,
    unemployment:         s.economy.unemployment,
    inflation:            s.economy.inflation,
    debtRatio:            s.economy.debtRatio,
    interestBurden:       s.economy.interestBurden,
    taxRevenue:           s.economy.taxRevenue,
    tradeBalance:         s.economy.tradeBalance,
    publicSatisfaction:   s.society.publicSatisfaction,
    socialJustice:        s.society.socialJustice,
    securityFeeling:      s.society.securityFeeling,
    climateProgress:      s.society.climateProgress,
    healthcareQuality:    s.society.healthcareQuality,
    infrastructureState:  s.society.infrastructureState,
    coalitionStability:   s.politics.coalitionStability,
    mediaRelations:       s.politics.mediaRelations,
    parliamentarySupport: s.politics.parliamentarySupport,
    approvalRating:       s.government.approvalRating,
    euRelations:          s.international.eu.relationScore,
    usaRelations:         s.international.usa.relationScore,
    chinaRelations:       s.international.china.relationScore,
  };
}

// ── GAME OVER CHECKS ─────────────────────────────────────────
export function checkGameOver(s) {
  if (s.economy.debtRatio >= CONFIG.GAME_OVER_DEBT) {
    s.phase = 'gameover';
    s.gameOverReason = 'Deutschland ist zahlungsunfähig. Der IWF übernimmt die Haushaltskontrolle.';
  }
  if (s.politics.coalitionStability <= CONFIG.GAME_OVER_STABILITY) {
    s.phase = 'gameover';
    s.gameOverReason = 'Die Koalition ist zerbrochen. Das Land ist regierungsunfähig.';
  }
  if (s.society.publicSatisfaction <= CONFIG.GAME_OVER_SATISFACTION) {
    s.phase = 'gameover';
    s.gameOverReason = 'Massenproteste. Du wirst mit einem konstruktiven Misstrauensvotum abgesetzt.';
  }
  if (s.turnsUntilElection <= 0) {
    s.phase = 'campaign';
  }
}

// ── POLITIKENTSCHEIDUNG ANWENDEN ─────────────────────────────
// Jede Entscheidung aus dem Scenario-System ruft das hier auf
export function applyDecision(state, decision) {
  const s = structuredClone(state);

  // Sofortige Effekte
  if (decision.immediateEffects) {
    applyDelta(s, decision.immediateEffects);
  }

  // Verzögerte Effekte in Queue
  if (decision.delayedEffects) {
    for (const de of decision.delayedEffects) {
      s.delayedEffects.push({
        id: decision.id + '-delayed-' + de.quartersDelay,
        appliesInQuarter: s.government.termQuarter + de.quartersDelay,
        effects: de.effects,
        label: de.label,
      });
    }
  }

  // Internationale Reaktionen
  if (decision.internationalReactions) {
    for (const [actor, effect] of Object.entries(decision.internationalReactions)) {
      s.international[actor].relationScore = clamp(
        s.international[actor].relationScore + effect
      );
      if (effect < 0) {
        s.international[actor].currentDemands.push(decision.label + '-Gegenmaßnahme');
      }
    }
  }

  // Koalitionsspannungen: passt die Entscheidung zu allen Partnern?
  if (s.government.coalition.length > 0) {
    const tension = computeCoalitionTension(s, decision);
    s.politics.coalitionStability = clamp(s.politics.coalitionStability - tension);
  }

  return tick(s); // direkt nächste Runde berechnen
}

// Wie viel Spannung erzeugt eine Entscheidung in der Koalition?
function computeCoalitionTension(s, decision) {
  let tension = 0;
  for (const partyName of s.government.coalition) {
    const party = PARTY_POSITIONS[partyName];
    if (!party || !decision.policyArea) continue;

    const partyPos = party.positions[decision.policyArea] || 50;
    const decisionPos = decision.policyPosition || 50;
    const distance = Math.abs(partyPos - decisionPos);

    // Wenn Entscheidung eine Red Line überschreitet: massive Spannung
    for (const redLine of party.redLines) {
      if (decision.violatesRedLine === redLine) {
        tension += 25;
      }
    }
    tension += distance * 0.05;
  }
  return Math.min(tension, CONFIG.COALITION_TENSION_MAX);
}
