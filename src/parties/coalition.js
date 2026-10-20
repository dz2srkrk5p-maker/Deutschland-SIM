// ============================================================
// COALITION.JS — Koalitionsverhandlungen: das Herzstück des Spiels
//
// Ablauf:
// 1. Sondierungsgespräche (welche Parteien reden überhaupt?)
// 2. Koalitionsverhandlungen (Policy-Positionen aushandeln)
// 3. Ministerienverteilung (Proporz-Verhandlung)
// 4. Koalitionsvertrag (Kompromisse festlegen)
// 5. Vertrauensfrage im Bundestag
// ============================================================

import { PARTY_POSITIONS, MINISTERIEN } from '../engine/state.js';

// ── SONDIERUNGSGESPRÄCHE ─────────────────────────────────────
// Welche Parteien sind bereit zu sondieren?
export function conductExploratoryTalks(electionResult, playerParty) {
  const { seats, majorityNeeded } = electionResult;
  const parties = Object.keys(seats).filter(p => seats[p] > 0);

  const willingToTalk = {};

  for (const party of parties) {
    if (party === 'AfD') {
      willingToTalk[party] = false; // Niemand redet mit AfD
      continue;
    }
    if (party === playerParty) {
      willingToTalk[party] = true;
      continue;
    }

    const partyData = PARTY_POSITIONS[party];
    const playerData = PARTY_POSITIONS[playerParty];
    if (!partyData || !playerData) continue;

    // Bereitschaft basiert auf: ideologische Nähe + Sitzmathematik
    const compatibility = computePairCompatibility(playerParty, party);
    const isInPlayerPreference = playerData.koalitionspräferenz?.includes(party);
    const playerIsInTheirPreference = partyData.koalitionspräferenz?.includes(playerParty);

    willingToTalk[party] = compatibility > 35 || isInPlayerPreference || playerIsInTheirPreference;
  }

  return willingToTalk;
}

// ── KOALITIONSVERHANDLUNGEN ──────────────────────────────────
// Simuliert mehrere Verhandlungsrunden zu Policy-Themen
export function negotiateCoalitionContract(coalition, playerChoices = {}) {
  const policyAreas = [
    { key: 'schuldenbremse',         label: 'Schuldenbremse & Haushalt',  weight: 10 },
    { key: 'migration',              label: 'Migrationspolitik',           weight: 9  },
    { key: 'klimaschutz',            label: 'Klimaschutz & Energie',       weight: 8  },
    { key: 'sozialstaat',            label: 'Sozialleistungen & Rente',    weight: 8  },
    { key: 'nato',                   label: 'Verteidigung & NATO',         weight: 7  },
    { key: 'wirtschaftsliberalismus',label: 'Wirtschaftspolitik',          weight: 7  },
    { key: 'euIntegration',          label: 'Europapolitik',               weight: 6  },
    { key: 'inneresSicherheit',      label: 'Innere Sicherheit',           weight: 5  },
  ];

  const contract = {};
  const conflicts = [];
  const breakthroughs = [];

  for (const area of policyAreas) {
    const positions = coalition.map(p => ({
      party: p,
      position: PARTY_POSITIONS[p]?.positions[area.key] || 50,
      redLines: PARTY_POSITIONS[p]?.redLines || [],
    }));

    // Spieler kann Position für seine Partei vorgeben
    if (playerChoices[area.key] !== undefined) {
      const playerIdx = positions.findIndex(p => p.party === coalition[0]); // coalition[0] = Spielerpartei
      if (playerIdx !== -1) {
        positions[playerIdx].position = playerChoices[area.key];
      }
    }

    const result = negotiatePolicyArea(area, positions);
    contract[area.key] = result;

    if (result.status === 'conflict') conflicts.push(area.label);
    if (result.status === 'agreed') breakthroughs.push(area.label);
  }

  const overallSuccess = conflicts.length === 0;
  const successChance = Math.max(0, 100 - conflicts.length * 15);

  return {
    contract,
    conflicts,
    breakthroughs,
    overallSuccess,
    successChance,
    finalPosition: computeFinalCoalitionPositions(contract, coalition),
  };
}

// Eine Policy-Area verhandeln
function negotiatePolicyArea(area, positions) {
  const values = positions.map(p => p.position);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  // Red-Line-Check: Würde der Kompromiss eine Red Line verletzen?
  for (const pos of positions) {
    for (const redLine of pos.redLines) {
      if (redLineViolated(area.key, mean, redLine)) {
        return {
          status: 'conflict',
          agreedPosition: null,
          spread,
          description: `${pos.party}: Red Line verletzt bei ${area.label}`,
          redLineViolator: pos.party,
        };
      }
    }
  }

  // Kompromiss möglich?
  if (spread <= 20) {
    return {
      status: 'agreed',
      agreedPosition: Math.round(mean),
      spread,
      description: `Einigung bei ${Math.round(mean)} (Spread: ${Math.round(spread)})`,
    };
  } else if (spread <= 40) {
    return {
      status: 'compromise',
      agreedPosition: Math.round(mean),
      spread,
      description: `Schwieriger Kompromiss, Spannungen bleiben`,
    };
  } else {
    return {
      status: 'conflict',
      agreedPosition: null,
      spread,
      description: `Zu weit auseinander (Spread: ${Math.round(spread)})`,
    };
  }
}

// Prüft ob eine Red-Line-Formel verletzt wird
// Format: "schuldenbremse < 40" oder "migration > 70"
function redLineViolated(area, agreedValue, redLine) {
  const parts = redLine.split(' ');
  if (parts.length !== 3) return false;
  const [rlArea, operator, threshold] = parts;
  if (rlArea !== area) return false;
  const t = parseFloat(threshold);
  if (operator === '<') return agreedValue < t;
  if (operator === '>') return agreedValue > t;
  return false;
}

// Aus Vertragsposition → Auswirkungen auf Spielvariablen
function computeFinalCoalitionPositions(contract, coalition) {
  const effects = {};

  // Schuldenbremse → budget
  if (contract.schuldenbremse?.agreedPosition) {
    const sb = contract.schuldenbremse.agreedPosition;
    effects['government.budgetBalance'] = sb > 70 ? -5 : sb > 50 ? -15 : -30;
  }

  // Klimaschutz → climate progress, aber Wirtschaftskosten
  if (contract.klimaschutz?.agreedPosition) {
    const kl = contract.klimaschutz.agreedPosition;
    effects['society.climateProgress'] = kl * 0.3;
    effects['economy.gdpIndex'] = -(kl - 50) * 0.05;
  }

  // Migration → Sicherheitsgefühl, soziale Gerechtigkeit
  if (contract.migration?.agreedPosition) {
    const mg = contract.migration.agreedPosition;
    effects['society.securityFeeling'] = 100 - mg; // restriktiv = mehr Sicherheitsgefühl
    effects['society.socialJustice'] = mg * 0.3;
  }

  // Sozialstaat → Zufriedenheit, aber Haushalt
  if (contract.sozialstaat?.agreedPosition) {
    const ss = contract.sozialstaat.agreedPosition;
    effects['society.publicSatisfaction'] = (ss - 50) * 0.2;
    effects['government.budgetBalance'] = -(ss - 50) * 0.3;
  }

  return effects;
}

// ── MINISTERIENVERTEILUNG ────────────────────────────────────
// Proporz basierend auf Sitzanteilen, Prioritäten der Parteien
export function distributeMinistries(coalition, seats) {
  const totalSeats = coalition.reduce((sum, p) => sum + (seats[p] || 0), 0);
  const entitlements = {}; // Wie viele Ministerien stehen jeder Partei zu?

  for (const party of coalition) {
    const share = (seats[party] || 0) / totalSeats;
    entitlements[party] = Math.round(share * MINISTERIEN.length);
  }

  // Korrektur: Summe muss genau MINISTERIEN.length sein
  let total = Object.values(entitlements).reduce((a, b) => a + b, 0);
  while (total < MINISTERIEN.length) {
    const biggest = coalition.reduce((a, b) =>
      (seats[a] || 0) > (seats[b] || 0) ? a : b);
    entitlements[biggest]++;
    total++;
  }
  while (total > MINISTERIEN.length) {
    const smallest = coalition.filter(p => entitlements[p] > 1).reduce((a, b) =>
      (seats[a] || 0) < (seats[b] || 0) ? a : b);
    if (smallest) { entitlements[smallest]--; total--; }
    else break;
  }

  // Kanzler: größte Partei
  const chancellorParty = coalition.reduce((a, b) =>
    (seats[a] || 0) >= (seats[b] || 0) ? a : b);

  // Ministerien zuweisen: Prioritäten der Parteien berücksichtigen
  const ministryAssignments = {};
  const partyBudgets = { ...entitlements };
  const sortedMinistries = [...MINISTERIEN].sort((a, b) => b.power - a.power);
  const assignedMinistries = new Set();

  // Erste Runde: Prioritäts-Ministerien
  for (const party of coalition) {
    const partyData = PARTY_POSITIONS[party];
    if (!partyData) continue;

    for (const prio of partyData.ministerienPrioritaet || []) {
      if (partyBudgets[party] > 0 && !assignedMinistries.has(prio)) {
        ministryAssignments[prio] = party;
        partyBudgets[party]--;
        assignedMinistries.add(prio);
      }
    }
  }

  // Zweite Runde: Rest auffüllen
  for (const ministry of sortedMinistries) {
    if (assignedMinistries.has(ministry.name)) continue;
    // Wer hat noch Budget und die wenigsten Ministerien?
    const eligible = coalition.filter(p => partyBudgets[p] > 0);
    if (eligible.length === 0) break;
    const assignee = eligible.reduce((a, b) =>
      partyBudgets[a] >= partyBudgets[b] ? a : b);
    ministryAssignments[ministry.name] = assignee;
    partyBudgets[assignee]--;
    assignedMinistries.add(ministry.name);
  }

  return {
    assignments: ministryAssignments,
    chancellorParty,
    entitlements,
    ministryList: MINISTERIEN,
  };
}

// ── MISSTRAUENSVOTUM ─────────────────────────────────────────
export function conductVoteOfNoConfidence(state, initiatingParty) {
  const { seats, totalSeats, majorityNeeded } = state.parliament;

  // Welche Parteien stimmen für das Misstrauensvotum?
  const votingFor = [];
  const votingAgainst = [];

  for (const [party, partySeats] of Object.entries(seats)) {
    if (party === initiatingParty) {
      votingFor.push(party);
      continue;
    }
    if (state.government.coalition.includes(party)) {
      // Koalitionspartner: stimmen gegen, es sei denn Stabilität ist sehr niedrig
      if (state.politics.coalitionStability < 20) {
        votingFor.push(party);
      } else {
        votingAgainst.push(party);
      }
    } else {
      // Opposition: stimmt normalerweise für Misstrauensvotum
      votingFor.push(party);
    }
  }

  const seatsFor = votingFor.reduce((sum, p) => sum + (seats[p] || 0), 0);
  const seatsAgainst = votingAgainst.reduce((sum, p) => sum + (seats[p] || 0), 0);
  const passed = seatsFor >= majorityNeeded;

  return {
    passed,
    seatsFor,
    seatsAgainst,
    votingFor,
    votingAgainst,
    majorityNeeded,
    // In Deutschland: konstruktives Misstrauensvotum = neuer Kanzler muss gleichzeitig gewählt werden
    requiresNewChancellor: true,
  };
}

// Hilfsfunktion: Kompatibilität zweier Parteien
function computePairCompatibility(partyA, partyB) {
  const a = PARTY_POSITIONS[partyA];
  const b = PARTY_POSITIONS[partyB];
  if (!a || !b) return 0;

  const areas = Object.keys(a.positions);
  let totalDistance = 0;
  for (const area of areas) {
    totalDistance += Math.abs((a.positions[area] || 50) - (b.positions[area] || 50));
  }
  return Math.max(0, 100 - (totalDistance / areas.length));
}
