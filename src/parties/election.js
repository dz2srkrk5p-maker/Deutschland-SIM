// ============================================================
// ELECTION.JS — Wahlsystem, Sitzverteilung, Ergebnisberechnung
// ============================================================

import { PARTY_POSITIONS } from '../engine/state.js';

// Sperrklausel: 5% der Zweitstimmen oder 3 Direktmandate
const SPERRKLAUSEL = 5.0;
const TOTAL_SEATS = 630;

// ── WAHL SIMULIEREN ──────────────────────────────────────────
// Basiert auf Spielzustand + "Umfragen" die sich über Legislatur entwickelt haben
export function conductElection(state) {
  const basePolls = computeBasePolls(state);
  const finalResults = applyElectionDynamics(basePolls, state);
  const seats = computeSeats(finalResults);

  return {
    votes: finalResults,   // { CDU: 28.4, SPD: 18.2, ... }
    seats,                 // { CDU: 196, SPD: 120, ... }
    totalSeats: TOTAL_SEATS,
    majorityNeeded: Math.floor(TOTAL_SEATS / 2) + 1,
    timestamp: { year: state.year, quarter: state.quarter },
  };
}

// Basisumfragen aus Spielzustand ableiten
function computeBasePolls(state) {
  const polls = {};

  // Regierungsparteien: Koalitionsstabilität und Zufriedenheit beeinflussen Ergebnis
  const incumbentBonus = state.government.approvalRating > 50 ? 2 : -3;
  const economyEffect = (state.economy.gdpIndex - 50) / 10;

  for (const [name, party] of Object.entries(PARTY_POSITIONS)) {
    let baseVote = getHistoricalBaseline(name);

    if (state.government.coalition.includes(name)) {
      baseVote += incumbentBonus + economyEffect;
    }

    // Gesellschaftliche Lage beeinflusst Extremparteien
    if (name === 'AfD') {
      baseVote += (50 - state.society.publicSatisfaction) * 0.15;
      baseVote += (50 - state.society.securityFeeling) * 0.1;
    }
    if (name === 'Grüne') {
      baseVote += (state.society.climateProgress - 50) * 0.05;
    }
    if (name === 'Linke' || name === 'BSW') {
      baseVote += (50 - state.society.socialJustice) * 0.1;
    }

    polls[name] = Math.max(1, baseVote);
  }

  return polls;
}

// Historische Basiswerte (orientiert an realen Ergebnissen 2021/2025)
function getHistoricalBaseline(party) {
  const baselines = {
    CDU:   28.5,
    SPD:   19.0,
    Grüne: 11.5,
    FDP:    6.5,
    AfD:   20.5,
    Linke:  4.0,
    BSW:    6.5,
  };
  return baselines[party] || 5.0;
}

// Wahlkampfdynamik: leichte Zufälligkeit + Normalisierung
function applyElectionDynamics(polls, state) {
  const result = {};
  let total = 0;

  for (const [name, vote] of Object.entries(polls)) {
    // ±2% Zufallsschwankung (Wahlkampfeffekte)
    const swing = (Math.random() - 0.5) * 4;
    result[name] = Math.max(0.5, vote + swing);
    total += result[name];
  }

  // Normalisieren auf 100%
  for (const name in result) {
    result[name] = (result[name] / total) * 100;
  }

  return result;
}

// Sitze berechnen: Sainte-Laguë-Verfahren (wie Bundestagswahl)
function computeSeats(votes) {
  // Sperrklausel anwenden
  const qualified = {};
  for (const [name, pct] of Object.entries(votes)) {
    if (pct >= SPERRKLAUSEL) {
      qualified[name] = pct;
    }
  }

  // Sainte-Laguë
  const seats = {};
  for (const name in qualified) seats[name] = 0;

  for (let i = 0; i < TOTAL_SEATS; i++) {
    let maxQuotient = -1;
    let winner = null;
    for (const [name, pct] of Object.entries(qualified)) {
      const quotient = pct / (2 * seats[name] + 1);
      if (quotient > maxQuotient) {
        maxQuotient = quotient;
        winner = name;
      }
    }
    if (winner) seats[winner]++;
  }

  return seats;
}

// ── KOALITIONSMÖGLICHKEITEN BERECHNEN ────────────────────────
export function findPossibleCoalitions(seats, majorityNeeded) {
  const parties = Object.keys(seats).filter(p => seats[p] > 0);
  const possible = [];

  // Alle Kombinationen von 2–4 Parteien prüfen
  for (let size = 2; size <= 4; size++) {
    const combos = getCombinations(parties, size);
    for (const combo of combos) {
      // AfD-Brandmauer: keine Koalition mit AfD
      if (combo.includes('AfD')) continue;

      const totalSeats = combo.reduce((sum, p) => sum + (seats[p] || 0), 0);
      if (totalSeats >= majorityNeeded) {
        const compatibility = computeCoalitionCompatibility(combo);
        possible.push({
          parties: combo,
          seats: totalSeats,
          majority: totalSeats - majorityNeeded,
          compatibility,  // 0–100: wie gut passen sie zusammen
          name: generateCoalitionName(combo),
        });
      }
    }
  }

  // Sortieren nach Kompatibilität (mit ausreichend Mehrheit)
  return possible.sort((a, b) => b.compatibility - a.compatibility);
}

// Koalitionskompatibilität: mittlere Distanz aller Parteipaare
function computeCoalitionCompatibility(parties) {
  let totalDistance = 0;
  let pairs = 0;
  const policyAreas = ['wirtschaftsliberalismus', 'sozialstaat', 'migration',
                        'klimaschutz', 'euIntegration', 'schuldenbremse', 'nato'];

  for (let i = 0; i < parties.length; i++) {
    for (let j = i + 1; j < parties.length; j++) {
      const a = PARTY_POSITIONS[parties[i]];
      const b = PARTY_POSITIONS[parties[j]];
      if (!a || !b) continue;

      let pairDistance = 0;
      for (const area of policyAreas) {
        pairDistance += Math.abs((a.positions[area] || 50) - (b.positions[area] || 50));
      }
      totalDistance += pairDistance / policyAreas.length;
      pairs++;
    }
  }

  const avgDistance = pairs > 0 ? totalDistance / pairs : 50;
  return Math.max(0, Math.round(100 - avgDistance));
}

// Namen wie "Große Koalition", "Ampel" etc.
function generateCoalitionName(parties) {
  const sorted = [...parties].sort();
  const key = sorted.join('+');
  const names = {
    'CDU+SPD': 'Große Koalition (GroKo)',
    'Grüne+SPD': 'Rot-Grün',
    'FDP+Grüne+SPD': 'Ampelkoalition',
    'CDU+FDP': 'Schwarz-Gelb',
    'CDU+Grüne': 'Schwarz-Grün',
    'CDU+FDP+SPD': 'Deutschlandkoalition',
    'BSW+Linke+SPD': 'Linkskoalition',
    'CDU+SPD+Grüne': 'Kenia-Koalition',
    'CDU+Grüne+SPD': 'Kenia-Koalition',
  };
  return names[key] || parties.join('-') + '-Koalition';
}

function getCombinations(arr, size) {
  if (size === 1) return arr.map(x => [x]);
  const result = [];
  for (let i = 0; i <= arr.length - size; i++) {
    const rest = getCombinations(arr.slice(i + 1), size - 1);
    for (const combo of rest) {
      result.push([arr[i], ...combo]);
    }
  }
  return result;
}
