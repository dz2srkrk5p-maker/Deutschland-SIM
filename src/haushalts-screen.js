// ============================================================
// HAUSHALTS-SCREEN.JS — Detaillierte Bundeshaushalt-Planung
//
// Architektur:
//   computeBudgetNumbers(state) → budget-Zahlen in Mrd €
//   buildHaushaltsHTML(...)     → HTML-String des Screens
//   initHaushaltsScreen(...)    → Listener + Live-Updates
//   computeHaushaltsEffects(...)→ finale Effekte bei Abgabe
// ============================================================

// ── RESSORT-DEFINITIONEN ─────────────────────────────────────

// neutralFrac: Anteil des Discretionary-Budgets bei Neutral-Zuweisung (Summe = 1.0)
// minFrac / maxFrac: Bandbreite der Schieberegler (relativ zu neutralMrd)
export const RESSORTS = [
  {
    id: 'verteidigung',
    label: 'Verteidigung',
    sub: 'Bundeswehr · NATO · Rüstung',
    neutralFrac: 0.144,
    minFrac: 0.36,   // 36% von neutral
    maxFrac: 2.50,
    // Effekte pro Mrd Abweichung von Neutral
    posEffects: { 'politics.usRelations': 0.28, 'society.securityFeeling': 0.22 },
    negEffects: { 'politics.usRelations': -0.36, 'society.securityFeeling': -0.30 },
    posDelayed: null,
    negDelayed: null,
    // Koalitionspartner-Präferenzen (welcher Anteil zum Neutral genügt der Partei)
    partyReaction: { CDU: { happy: 1.15, unhappy: 0.75 }, SPD: { happy: null, unhappy: 0.55 }, Grüne: { happy: null, unhappy: null }, FDP: { happy: null, unhappy: null } },
    // Für Media: +1 = FAZ mag mehr, -1 = mag weniger
    mediaWeight: { faz: +1.2, sud: -0.5, spiegel: +0.3 },
  },
  {
    id: 'soziales',
    label: 'Soziales & Rente',
    sub: 'Bürgergeld · Rente · Sozialleistungen',
    neutralFrac: 0.178,
    minFrac: 0.45,
    maxFrac: 2.20,
    posEffects: { 'society.publicSatisfaction': 0.32, 'society.socialJustice': 0.28 },
    negEffects: { 'society.publicSatisfaction': -0.38, 'society.socialJustice': -0.34 },
    posDelayed: null,
    negDelayed: null,
    partyReaction: { SPD: { happy: 1.10, unhappy: 0.80 }, Grüne: { happy: 1.05, unhappy: 0.70 }, CDU: { happy: null, unhappy: null }, FDP: { happy: null, unhappy: 1.20 } },
    mediaWeight: { faz: -0.8, sud: +1.2, spiegel: +0.4 },
  },
  {
    id: 'klima',
    label: 'Klimaschutz & Energie',
    sub: 'Erneuerbare · CO₂ · Transformation',
    neutralFrac: 0.100,
    minFrac: 0.30,
    maxFrac: 2.60,
    posEffects: { 'society.climateProgress': 0.40, 'politics.euRelations': 0.20 },
    negEffects: { 'society.climateProgress': -0.45, 'politics.euRelations': -0.18 },
    posDelayed: { quartersDelay: 4, perMrd: { 'economy.tradeBalance': 0.10 }, label: 'Grüne Technologieexporte steigen' },
    negDelayed: null,
    partyReaction: { Grüne: { happy: 1.15, unhappy: 0.72 }, SPD: { happy: 1.05, unhappy: 0.80 }, CDU: { happy: null, unhappy: null }, FDP: { happy: null, unhappy: null } },
    mediaWeight: { faz: -0.4, sud: +0.8, spiegel: +0.9 },
  },
  {
    id: 'infrastruktur',
    label: 'Infrastruktur',
    sub: 'Straßen · Schienen · Brücken · Glasfaser',
    neutralFrac: 0.144,
    minFrac: 0.35,
    maxFrac: 2.30,
    posEffects: { 'society.infrastructureState': 0.45 },
    negEffects: { 'society.infrastructureState': -0.50 },
    posDelayed: { quartersDelay: 3, perMrd: { 'economy.gdpIndex': 0.12 }, label: 'Infrastrukturinvestitionen wirken' },
    negDelayed: { quartersDelay: 3, perMrd: { 'economy.gdpIndex': -0.10 }, label: 'Infrastrukturmängel bremsen Wirtschaft' },
    partyReaction: { SPD: { happy: 1.08, unhappy: 0.75 }, CDU: { happy: 1.05, unhappy: 0.75 }, Grüne: { happy: 1.00, unhappy: null }, FDP: { happy: null, unhappy: null } },
    mediaWeight: { faz: +0.5, sud: +0.7, spiegel: +0.8 },
  },
  {
    id: 'bildung',
    label: 'Bildung & Forschung',
    sub: 'Universitäten · BMBF · Forschungsförderung',
    neutralFrac: 0.100,
    minFrac: 0.33,
    maxFrac: 2.40,
    posEffects: { 'society.publicSatisfaction': 0.12 },  // kaum sofort
    negEffects: { 'society.publicSatisfaction': -0.08 },
    posDelayed: { quartersDelay: 4, perMrd: { 'economy.gdpIndex': 0.14, 'economy.unemployment': 0.08 }, label: 'Bildungsinvestitionen steigern Produktivität' },
    negDelayed: { quartersDelay: 4, perMrd: { 'economy.gdpIndex': -0.12 }, label: 'Bildungsdefizite schwächen Wirtschaft' },
    partyReaction: { SPD: { happy: 1.05, unhappy: 0.78 }, Grüne: { happy: 1.05, unhappy: 0.75 }, CDU: { happy: null, unhappy: null }, FDP: { happy: 1.05, unhappy: null } },
    mediaWeight: { faz: +0.2, sud: +0.9, spiegel: +0.7 },
  },
  {
    id: 'gesundheit',
    label: 'Gesundheit',
    sub: 'Krankenhäuser · Pflegereform · Prävention',
    neutralFrac: 0.111,
    minFrac: 0.40,
    maxFrac: 2.20,
    posEffects: { 'society.healthcareQuality': 0.42, 'society.publicSatisfaction': 0.16 },
    negEffects: { 'society.healthcareQuality': -0.48, 'society.publicSatisfaction': -0.22 },
    posDelayed: null,
    negDelayed: null,
    partyReaction: { SPD: { happy: 1.08, unhappy: 0.80 }, Grüne: { happy: 1.05, unhappy: 0.75 }, CDU: { happy: null, unhappy: null }, FDP: { happy: null, unhappy: null } },
    mediaWeight: { faz: +0.1, sud: +1.0, spiegel: +0.6 },
  },
  {
    id: 'sicherheit',
    label: 'Innere Sicherheit',
    sub: 'Polizei · BKA · Justiz',
    neutralFrac: 0.089,
    minFrac: 0.37,
    maxFrac: 2.30,
    posEffects: { 'society.securityFeeling': 0.38, 'politics.mediaRelations': 0.14 },
    negEffects: { 'society.securityFeeling': -0.35, 'politics.mediaRelations': -0.16 },
    posDelayed: null,
    negDelayed: null,
    partyReaction: { CDU: { happy: 1.12, unhappy: 0.75 }, FDP: { happy: null, unhappy: null }, SPD: { happy: null, unhappy: null }, Grüne: { happy: null, unhappy: null } },
    mediaWeight: { faz: +0.9, sud: -0.2, spiegel: +0.4 },
  },
  {
    id: 'wirtschaft',
    label: 'Wirtschaftsförderung',
    sub: 'Subventionen · Mittelstand · Startups',
    neutralFrac: 0.078,
    minFrac: 0.26,
    maxFrac: 2.60,
    posEffects: { 'economy.gdpIndex': 0.28, 'economy.unemployment': 0.20 },
    negEffects: { 'economy.gdpIndex': -0.28, 'economy.unemployment': -0.16 },
    posDelayed: { quartersDelay: 2, perMrd: { 'economy.taxRevenue': 0.08 }, label: 'Wirtschaftsförderung steigert Steuereinnahmen' },
    negDelayed: null,
    partyReaction: { FDP: { happy: 1.15, unhappy: 0.72 }, CDU: { happy: 1.05, unhappy: 0.80 }, SPD: { happy: null, unhappy: null }, Grüne: { happy: null, unhappy: null } },
    mediaWeight: { faz: +1.0, sud: -0.1, spiegel: +0.5 },
  },
  {
    id: 'entwicklung',
    label: 'Entwicklungshilfe',
    sub: 'ODA · Auslandsaid · Multilateral',
    neutralFrac: 0.056,
    minFrac: 0.00,
    maxFrac: 2.50,
    posEffects: { 'politics.euRelations': 0.22, 'politics.usRelations': 0.10 },
    negEffects: { 'politics.euRelations': -0.18 },
    posDelayed: null,
    negDelayed: null,
    partyReaction: { Grüne: { happy: 1.10, unhappy: 0.60 }, SPD: { happy: 1.02, unhappy: null }, CDU: { happy: null, unhappy: null }, FDP: { happy: null, unhappy: 1.30 } },
    mediaWeight: { faz: -0.3, sud: +0.5, spiegel: +0.4 },
  },
];

// Sondervermögen: fixer Betrag + Effekte
const SONDERVERM_BETRAG = 25;

// ── BUDGET-BERECHNUNG ─────────────────────────────────────────

export function computeBudgetNumbers(state) {
  const taxRev  = state.economy?.taxRevenue    ?? 58;
  const intBurd = state.economy?.interestBurden ?? 22;
  const gdpIdx  = state.economy?.gdpIndex       ?? 54;
  const debtR   = state.economy?.debtRatio       ?? 28;

  // Gesamteinnahmen: taxRevenue-Index → Mrd €
  // Bei Standard (58): ~315 Mrd (D: ~370 Mrd Steuereinnahmen)
  const totalRevenue = Math.round(taxRev * 4.8 + 35);

  // Pflichtausgaben (fix)
  const zinsenMrd    = Math.round(intBurd * 0.85);           // Zinsdienst
  const sozialMrd    = 148;                                    // Sozialversicherung (fest)
  const beamtenMrd   = 38;                                    // Beamtengehälter (fest)
  const mandatoryMrd = zinsenMrd + sozialMrd + beamtenMrd;

  // Frei verfügbares Budget
  const freeBase = Math.max(15, totalRevenue - mandatoryMrd);

  // Schuldenbremse: strukturelles Defizit ≤ 0.35% BIP (Art. 115 GG)
  const gdpMrd           = gdpIdx * 52;                        // BIP in Mrd (~2800 bei Standard)
  const schuldenbremseOk = Math.round(gdpMrd * 0.0035);        // ~10 Mrd bei Standard

  return {
    totalRevenue,
    zinsenMrd,
    sozialMrd,
    beamtenMrd,
    mandatoryMrd,
    freeBase,
    gdpMrd,
    schuldenbremseOk,
    debtRatio: debtR,
  };
}

// ── NEUTRAL-ZUWEISUNG ─────────────────────────────────────────

export function neutralAllocation(bn) {
  const alloc = {};
  for (const r of RESSORTS) {
    alloc[r.id] = Math.max(1, Math.round(bn.freeBase * r.neutralFrac));
  }
  return alloc;
}

// ── KOALITIONSREAKTIONEN ──────────────────────────────────────

export function computeCoalitionReactions(allocation, bn, coalition, useSonderv) {
  const neutral = neutralAllocation(bn);
  const reactions = [];

  const schuldenbremseOk = computeSchuldenbremse(allocation, bn, useSonderv).ok;

  for (const party of coalition) {
    let score = 50; // Neutral = 50

    // Anteil an preferred Ministries vs. Neutral
    for (const r of RESSORTS) {
      const pref = r.partyReaction?.[party];
      if (!pref) continue;
      const ratio = allocation[r.id] / (neutral[r.id] || 1);
      if (pref.happy && ratio >= pref.happy)  score += 8;
      if (pref.unhappy && ratio < pref.unhappy) score -= 12;
    }

    // Schuldenbremse
    if (party === 'FDP') {
      if (!schuldenbremseOk && !useSonderv) score -= 20;
      else if (schuldenbremseOk) score += 5;
      if (useSonderv) score -= 10;  // FDP toleriert es gerade so
    }

    score = Math.max(0, Math.min(100, score));

    let sentiment, label;
    if (score >= 75)      { sentiment = 'happy';   label = 'Zufrieden' }
    else if (score >= 50) { sentiment = 'neutral';  label = 'Akzeptabel' }
    else if (score >= 30) { sentiment = 'unhappy';  label = 'Unzufrieden' }
    else                  { sentiment = 'angry';    label = 'Sehr unzufrieden' }

    // Koalitionsstabilitäts-Delta aus diesem Haushalt
    const stabilityDelta = score >= 75 ? +5
      : score >= 50 ? 0
      : score >= 30 ? -10
      : -22;

    reactions.push({ party, score, sentiment, label, stabilityDelta });
  }

  return reactions;
}

// ── SCHULDENBREMSE ────────────────────────────────────────────

export function computeSchuldenbremse(allocation, bn, useSonderv) {
  const totalAlloc = Object.values(allocation).reduce((a, b) => a + b, 0);
  const sondervBetrag = useSonderv ? SONDERVERM_BETRAG : 0;

  // Neuverschuldung = Ausgaben - Einnahmen (ohne Sondervermögen im SB-Check)
  const neuverschuldung = (totalAlloc + bn.mandatoryMrd) - bn.totalRevenue;
  const sbRelevantDebt  = useSonderv ? neuverschuldung - sondervBetrag : neuverschuldung;
  const haushaltssaldo  = bn.totalRevenue - (bn.mandatoryMrd + totalAlloc) + sondervBetrag;

  return {
    neuverschuldung:    Math.round(neuverschuldung),
    sbRelevantDebt:     Math.round(sbRelevantDebt),
    ok:                 sbRelevantDebt <= bn.schuldenbremseOk,
    haushaltssaldo:     Math.round(haushaltssaldo),
    sondervBetrag,
    totalAlloc:         Math.round(totalAlloc),
  };
}

// ── MEDIENREAKTIONEN ──────────────────────────────────────────

export function computeMediaReactions(allocation, bn, sb) {
  const neutral = neutralAllocation(bn);

  // Score pro Outlet (0–100): basiert auf Abweichungen
  const scores = { faz: 50, sud: 50, spiegel: 50 };

  for (const r of RESSORTS) {
    const deviation = (allocation[r.id] - neutral[r.id]) / Math.max(1, neutral[r.id]);
    for (const [outlet, weight] of Object.entries(r.mediaWeight || {})) {
      scores[outlet] = Math.max(0, Math.min(100, scores[outlet] + deviation * weight * 15));
    }
  }

  // Schuldenbremse beeinflusst FAZ stark
  if (!sb.ok) scores.faz -= 18;
  else         scores.faz += 8;

  const headlines = {
    faz: {
      happy:   'Haushaltsdisziplin: Regierung setzt Zeichen der Vernunft',
      neutral: 'Solider Haushalt mit Abstrichen beim Schuldenabbau',
      unhappy: 'Haushaltspolitik enttäuscht — Schuldenbremse unter Druck',
      angry:   'Schwarze Null in weiter Ferne: Ein Haushalt ohne Rückgrat',
    },
    sud: {
      happy:   'Investitionen in Mensch und Zukunft: Dieser Haushalt kann überzeugen',
      neutral: 'Haushalt zwischen Sparwillen und sozialem Auftrag',
      unhappy: 'Soziale Kälte im Haushalt: Die Schwächsten zahlen die Zeche',
      angry:   'Sozialer Kahlschlag: Die Regierung kürzt am falschen Ende',
    },
    spiegel: {
      happy:   'Ein Haushalt mit Strategie — selten, aber gut',
      neutral: 'Der Kompromiss-Haushalt: niemand jubelt, niemand weint',
      unhappy: 'Haushaltsdebatte: Die Regierung drückt sich um die Wahrheit',
      angry:   'Haushaltschaos: Koalition kämpft mit sich selbst',
    },
  };

  const outletNames = { faz: 'FAZ', sud: 'Süddeutsche', spiegel: 'Spiegel' };

  return ['faz', 'sud', 'spiegel'].map(outlet => {
    const s = Math.round(scores[outlet]);
    const sentiment = s >= 70 ? 'happy' : s >= 50 ? 'neutral' : s >= 30 ? 'unhappy' : 'angry';
    return {
      outlet,
      name: outletNames[outlet],
      headline: headlines[outlet][sentiment],
      sentiment,
      score: s,
    };
  });
}

// ── EFFEKT-BERECHNUNG ─────────────────────────────────────────

export function computeHaushaltsEffects(allocation, bn, state, useSonderv) {
  const neutral    = neutralAllocation(bn);
  const sb         = computeSchuldenbremse(allocation, bn, useSonderv);
  const coalition  = state.government.coalition || [];
  const coalReact  = computeCoalitionReactions(allocation, bn, coalition, useSonderv);
  const mediaReact = computeMediaReactions(allocation, bn, sb);

  const imm = {};  // immediateEffects
  const del = [];  // delayedEffects

  // ── Ressort-Effekte
  for (const r of RESSORTS) {
    const dev = allocation[r.id] - neutral[r.id]; // Mrd Abweichung
    if (dev === 0) continue;

    if (dev > 0 && r.posEffects) {
      for (const [path, rate] of Object.entries(r.posEffects)) {
        imm[path] = (imm[path] || 0) + dev * rate;
      }
      if (r.posDelayed) {
        const deffects = {};
        for (const [p, rate] of Object.entries(r.posDelayed.perMrd)) {
          deffects[p] = dev * rate;
        }
        del.push({ quartersDelay: r.posDelayed.quartersDelay, effects: deffects, label: r.posDelayed.label });
      }
    } else if (dev < 0 && r.negEffects) {
      for (const [path, rate] of Object.entries(r.negEffects)) {
        imm[path] = (imm[path] || 0) + Math.abs(dev) * rate;
      }
      if (r.negDelayed) {
        const deffects = {};
        for (const [p, rate] of Object.entries(r.negDelayed.perMrd)) {
          deffects[p] = Math.abs(dev) * rate;
        }
        del.push({ quartersDelay: r.negDelayed.quartersDelay, effects: deffects, label: r.negDelayed.label });
      }
    }
  }

  // ── Schuldenbremse-Effekte
  if (!sb.ok && !useSonderv) {
    imm['politics.coalitionStability'] = (imm['politics.coalitionStability'] || 0) - 15;
    imm['politics.mediaRelations']     = (imm['politics.mediaRelations']     || 0) - 8;
  } else if (sb.ok) {
    imm['politics.coalitionStability'] = (imm['politics.coalitionStability'] || 0) + 4;
  }

  // ── Sondervermögen-Kosten
  if (useSonderv) {
    imm['politics.coalitionStability'] = (imm['politics.coalitionStability'] || 0) - 10;
    if (coalition.includes('FDP')) {
      imm['politics.coalitionStability'] = (imm['politics.coalitionStability'] || 0) - 8;
    }
  }

  // ── Koalitionsreaktionen
  for (const r of coalReact) {
    imm['politics.coalitionStability'] = (imm['politics.coalitionStability'] || 0) + r.stabilityDelta;
  }

  // ── Schuldenquote (Neuverschuldung → debtRatio steigt)
  if (sb.neuverschuldung > 0) {
    const gdpMrd = state.economy.gdpIndex * 52;
    imm['economy.debtRatio'] = (imm['economy.debtRatio'] || 0) + (sb.neuverschuldung / gdpMrd) * 100;
  } else {
    // Überschuss → Schulden sinken
    const gdpMrd = state.economy.gdpIndex * 52;
    imm['economy.debtRatio'] = (imm['economy.debtRatio'] || 0) - (Math.abs(sb.neuverschuldung) / gdpMrd) * 100;
  }

  // ── Budgetsaldo → Haushalt
  imm['government.budgetBalance'] = (imm['government.budgetBalance'] || 0) + sb.haushaltssaldo;

  // Runde alle Werte
  for (const k of Object.keys(imm)) imm[k] = Math.round(imm[k] * 10) / 10;

  return { immediateEffects: imm, delayedEffects: del, coalitionReactions: coalReact, mediaReactions: mediaReact, sb };
}

// ── LIVE-PREVIEW-EFFEKTE (vereinfacht, für Echtzeit-UI) ───────

export function previewEffects(allocation, bn) {
  const neutral = neutralAllocation(bn);
  const preview = {};
  for (const r of RESSORTS) {
    const dev = allocation[r.id] - neutral[r.id];
    const effects = dev >= 0 ? r.posEffects : r.negEffects;
    if (!effects) continue;
    for (const [path, rate] of Object.entries(effects)) {
      const val = Math.round(Math.abs(dev) * rate * 10) / 10;
      if (val === 0) continue;
      const sign = dev >= 0 ? '+' : '-';
      if (!preview[path]) preview[path] = 0;
      preview[path] += dev >= 0 ? val : -val;
    }
  }
  return preview;
}

// ── HTML-GENERIERUNG ──────────────────────────────────────────

export function buildHaushaltsHTML(state, bn, prevAlloc) {
  const neutral = neutralAllocation(bn);
  const sb0     = computeSchuldenbremse(neutral, bn, false);

  const coalition = state.government.coalition || [];
  const cParties  = coalition.map(p => `<span class="hb-coal-tag">${p}</span>`).join('');

  const saldoStr  = sb0.haushaltssaldo >= 0
    ? `+${sb0.haushaltssaldo} Mrd`
    : `${sb0.haushaltssaldo} Mrd`;

  return `
<div class="hb-page">

  <!-- HEADER -->
  <div class="hb-header">
    <button class="btn btn-ghost hb-back" id="hb-back">&#8592; Abbrechen</button>
    <div class="hb-header-center">
      <div class="hb-badge">Bundeshaushalt ${state.year}</div>
      <h1 class="hb-title">Haushalt verabschieden</h1>
    </div>
    <div class="hb-header-meta">
      Koalition: ${cParties}
    </div>
  </div>

  <!-- LAYOUT: Links Schieberegler | Rechts Übersicht -->
  <div class="hb-layout">

    <!-- LINKE SPALTE: Ressorts -->
    <div class="hb-left">

      <!-- Pflichtausgaben (Info-Box) -->
      <div class="hb-mandatory-box">
        <div class="hb-mandatory-title">Pflichtausgaben (nicht kürzbar)</div>
        <div class="hb-mandatory-items">
          <div class="hb-mand-row">
            <span>Zinsdienst</span>
            <span class="hb-mand-val">${bn.zinsenMrd} Mrd</span>
          </div>
          <div class="hb-mand-row">
            <span>Sozialversicherung &amp; Transfers</span>
            <span class="hb-mand-val">${bn.sozialMrd} Mrd</span>
          </div>
          <div class="hb-mand-row">
            <span>Beamte &amp; öffentlicher Dienst</span>
            <span class="hb-mand-val">${bn.beamtenMrd} Mrd</span>
          </div>
          <div class="hb-mand-row hb-mand-total">
            <span>Gesamt Pflicht</span>
            <span class="hb-mand-val">${bn.mandatoryMrd} Mrd</span>
          </div>
        </div>
      </div>

      <!-- Frei verfügbares Budget -->
      <div class="hb-free-header">
        <span class="hb-free-label">Frei verfügbares Budget</span>
        <span class="hb-free-amount">
          <span id="hb-free-total">${bn.freeBase}</span> Mrd
          <span class="hb-free-sub" id="hb-sonderv-badge" style="display:none">+ ${SONDERVERM_BETRAG} Mrd SV</span>
        </span>
      </div>

      <!-- Ressort-Schieberegler -->
      <div class="hb-ressorts">
        ${RESSORTS.map(r => _ressortSliderHTML(r, bn, neutral, prevAlloc)).join('')}
      </div>

      <!-- Sondervermögen -->
      <div class="hb-sonderv-box" id="hb-sonderv-box">
        <label class="hb-sonderv-label">
          <input type="checkbox" id="hb-sonderv-check" class="hb-sonderv-chk">
          <span class="hb-sonderv-text">
            <strong>Sondervermögen</strong> (+${SONDERVERM_BETRAG} Mrd — umgeht Schuldenbremse formal)
            <span class="hb-sonderv-cost">Koalitionsstabilität −10${coalition.includes('FDP') ? ', FDP −8 extra' : ''}</span>
          </span>
        </label>
      </div>

      <!-- Abgabe-Button -->
      <button class="btn btn-primary hb-submit" id="hb-submit">
        Haushalt verabschieden &#8594;
      </button>
    </div>

    <!-- RECHTE SPALTE: Übersicht + Live-Reaktionen -->
    <div class="hb-right">

      <!-- Budget-Übersicht -->
      <div class="hb-panel">
        <div class="hb-panel-title">Haushaltsübersicht</div>
        <div class="hb-budget-table">
          <div class="hb-brow">
            <span class="hb-brow-l">Gesamteinnahmen</span>
            <span class="hb-brow-r hb-brow-pos">${bn.totalRevenue} Mrd</span>
          </div>
          <div class="hb-brow">
            <span class="hb-brow-l">Pflichtausgaben</span>
            <span class="hb-brow-r hb-brow-neg">−${bn.mandatoryMrd} Mrd</span>
          </div>
          <div class="hb-brow">
            <span class="hb-brow-l">Ressort-Ausgaben</span>
            <span class="hb-brow-r" id="hb-brow-alloc">−${Object.values(neutral).reduce((a,b)=>a+b,0)} Mrd</span>
          </div>
          <div class="hb-brow hb-brow--saldo">
            <span class="hb-brow-l">Haushaltssaldo</span>
            <span class="hb-brow-r" id="hb-brow-saldo">${saldoStr}</span>
          </div>
          <div class="hb-brow" id="hb-brow-sonderv-row" style="display:none">
            <span class="hb-brow-l">Sondervermögen</span>
            <span class="hb-brow-r hb-brow-pos">+${SONDERVERM_BETRAG} Mrd</span>
          </div>
        </div>
        <!-- Donut-Ersatz: Budget-Balken -->
        <div class="hb-budget-visual">
          <div class="hb-bv-bar">
            <div class="hb-bv-mandatory" id="hb-bv-mandatory" style="width:${Math.min(100,(bn.mandatoryMrd/bn.totalRevenue*100)).toFixed(1)}%"></div>
            <div class="hb-bv-free" id="hb-bv-free"></div>
          </div>
          <div class="hb-bv-legend">
            <span class="hb-bv-dot hb-bv-dot--mand"></span> Pflicht
            <span class="hb-bv-dot hb-bv-dot--free"></span> Ressorts
            <span class="hb-bv-dot hb-bv-dot--rest"></span> Saldo
          </div>
        </div>
      </div>

      <!-- Schuldenbremse -->
      <div class="hb-panel hb-sb-panel" id="hb-sb-panel">
        <div class="hb-panel-title">Schuldenbremse (Art. 115 GG)</div>
        <div class="hb-sb-status" id="hb-sb-status">Eingehalten</div>
        <div class="hb-sb-bar-wrap">
          <div class="hb-sb-bar" id="hb-sb-bar"></div>
        </div>
        <div class="hb-sb-detail" id="hb-sb-detail">
          Erlaubt: ≤ ${bn.schuldenbremseOk} Mrd Neuverschuldung
        </div>
      </div>

      <!-- Koalitionsreaktionen (live) -->
      <div class="hb-panel">
        <div class="hb-panel-title">Koalitionsreaktionen (Vorschau)</div>
        <div id="hb-coal-reactions"></div>
      </div>

      <!-- Erwartete Auswirkungen (live) -->
      <div class="hb-panel">
        <div class="hb-panel-title">Erwartete Sofortauswirkungen</div>
        <div id="hb-effects-preview"></div>
      </div>

      <!-- Verzögerte Effekte -->
      <div class="hb-panel">
        <div class="hb-panel-title">Verzögerte Effekte</div>
        <div id="hb-delayed-preview" class="hb-delayed-list">
          <div class="hb-delayed-empty">Keine besonderen Investitionen geplant.</div>
        </div>
      </div>

    </div>
  </div>
</div>
  `.trim();
}

function _ressortSliderHTML(r, bn, neutral, prevAlloc) {
  const neutralMrd = neutral[r.id];
  const minMrd     = Math.max(0, Math.round(neutralMrd * r.minFrac));
  const maxMrd     = Math.round(neutralMrd * r.maxFrac);
  const prevMrd    = prevAlloc?.[r.id];
  const arrowCls   = prevMrd == null ? '' : prevMrd < neutralMrd ? 'hb-arrow--up' : prevMrd > neutralMrd ? 'hb-arrow--down' : '';
  const arrowSym   = prevMrd == null ? '' : prevMrd < neutralMrd ? '↑' : prevMrd > neutralMrd ? '↓' : '→';

  return `
<div class="hb-ressort" data-id="${r.id}">
  <div class="hb-res-top">
    <div class="hb-res-labels">
      <span class="hb-res-name">${r.label}</span>
      <span class="hb-res-sub">${r.sub}</span>
    </div>
    <div class="hb-res-nums">
      ${prevAlloc ? `<span class="hb-res-arrow ${arrowCls}" id="hb-arrow-${r.id}">${arrowSym}</span>` : ''}
      <span class="hb-res-mrd" id="hb-mrd-${r.id}">${neutralMrd}</span>
      <span class="hb-res-unit">Mrd</span>
      <span class="hb-res-pct" id="hb-pct-${r.id}">(${(r.neutralFrac * 100).toFixed(0)}%)</span>
    </div>
  </div>
  <div class="hb-slider-wrap">
    <span class="hb-slider-min">${minMrd}</span>
    <input type="range"
      id="hb-slider-${r.id}"
      class="hb-slider"
      data-id="${r.id}"
      data-neutral="${neutralMrd}"
      min="${minMrd}"
      max="${maxMrd}"
      step="1"
      value="${neutralMrd}">
    <span class="hb-slider-max">${maxMrd}</span>
  </div>
  <div class="hb-fund-bar-wrap">
    <div class="hb-fund-bar" id="hb-fund-${r.id}">
      <div class="hb-fund-fill" id="hb-fund-fill-${r.id}" style="width:50%"></div>
      <div class="hb-fund-neutral-mark" style="left:${_neutralMarkPct(minMrd, maxMrd, neutralMrd)}%"></div>
    </div>
    <span class="hb-fund-label" id="hb-fund-label-${r.id}">Neutral</span>
  </div>
</div>`.trim();
}

function _neutralMarkPct(min, max, neutral) {
  if (max === min) return 50;
  return Math.round(((neutral - min) / (max - min)) * 100);
}

// ── SCREEN-INITIALISIERUNG ────────────────────────────────────

export function initHaushaltsScreen(container, state, bn, prevAlloc, onSubmit) {
  const neutral    = neutralAllocation(bn);
  const coalition  = state.government.coalition || [];
  const allocation = { ...neutral };
  let   useSonderv = false;

  const EFFECT_META = {
    'economy.gdpIndex':              { label: 'BIP',              pos: true  },
    'economy.unemployment':          { label: 'Beschäftigung',    pos: true  },
    'economy.inflation':             { label: 'Preisstabilität',  pos: true  },
    'economy.debtRatio':             { label: 'Schuldenquote',    pos: false },
    'economy.taxRevenue':            { label: 'Steuereinnahmen',  pos: true  },
    'economy.tradeBalance':          { label: 'Außenhandel',      pos: true  },
    'government.budgetBalance':      { label: 'Haushaltssaldo',   pos: true  },
    'society.publicSatisfaction':    { label: 'Zufriedenheit',    pos: true  },
    'society.socialJustice':         { label: 'Soz. Gerechtigkeit', pos: true },
    'society.securityFeeling':       { label: 'Sicherheit',       pos: true  },
    'society.climateProgress':       { label: 'Klimafortschritt', pos: true  },
    'society.healthcareQuality':     { label: 'Gesundheit',       pos: true  },
    'society.infrastructureState':   { label: 'Infrastruktur',    pos: true  },
    'politics.coalitionStability':   { label: 'Koalitionsstab.',  pos: true  },
    'politics.mediaRelations':       { label: 'Medienrelat.',     pos: true  },
    'politics.euRelations':          { label: 'EU',               pos: true  },
    'politics.usRelations':          { label: 'USA',              pos: true  },
  };

  // ── Event Listener auf Schieberegler
  container.querySelectorAll('.hb-slider').forEach(slider => {
    slider.addEventListener('input', () => {
      const id = slider.dataset.id;
      allocation[id] = parseInt(slider.value, 10);
      _updateAll();
    });
  });

  // ── Sondervermögen
  const svCheck = container.querySelector('#hb-sonderv-check');
  if (svCheck) {
    svCheck.addEventListener('change', () => {
      useSonderv = svCheck.checked;
      _updateAll();
    });
  }

  // ── Back-Button
  const backBtn = container.querySelector('#hb-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => onSubmit(null)); // null = cancel
  }

  // ── Submit
  const submitBtn = container.querySelector('#hb-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const result = computeHaushaltsEffects(allocation, bn, state, useSonderv);
      result.allocation = { ...allocation };
      result.useSonderv = useSonderv;
      onSubmit(result);
    });
  }

  // Initiales Rendern
  _updateAll();

  // ── Live-Update-Funktion
  function _updateAll() {
    const sb = computeSchuldenbremse(allocation, bn, useSonderv);
    const totalAlloc = sb.totalAlloc;
    const freePool   = bn.freeBase + (useSonderv ? SONDERVERM_BETRAG : 0);

    // Ressort-Anzeigen
    for (const r of RESSORTS) {
      const mrd = allocation[r.id];
      const neutral = neutralAllocation(bn)[r.id];  // frisch berechnet
      const pct = Math.round((mrd / freePool) * 100);

      const el_mrd = container.querySelector(`#hb-mrd-${r.id}`);
      const el_pct = container.querySelector(`#hb-pct-${r.id}`);
      const el_fill = container.querySelector(`#hb-fund-fill-${r.id}`);
      const el_label = container.querySelector(`#hb-fund-label-${r.id}`);
      const el_slider = container.querySelector(`#hb-slider-${r.id}`);
      const el_arrow = container.querySelector(`#hb-arrow-${r.id}`);

      if (el_mrd) el_mrd.textContent = mrd;
      if (el_pct) el_pct.textContent = `(${pct}%)`;

      // Funding-Bar (0 = min, 50% = neutral, 100% = max)
      if (el_fill && el_slider) {
        const min = parseInt(el_slider.min, 10);
        const max = parseInt(el_slider.max, 10);
        const fillPct = ((mrd - min) / (max - min)) * 100;
        el_fill.style.width = `${fillPct.toFixed(1)}%`;

        const ratio = mrd / Math.max(1, neutral);
        el_fill.className = 'hb-fund-fill';
        if (ratio < 0.70)      el_fill.classList.add('hb-fund-red');
        else if (ratio < 0.90) el_fill.classList.add('hb-fund-yellow');
        else if (ratio >= 1.10) el_fill.classList.add('hb-fund-green');
        else                   el_fill.classList.add('hb-fund-neutral');

        if (el_label) {
          el_label.textContent = ratio < 0.70 ? 'Unterfinanziert'
            : ratio < 0.90 ? 'Knapp'
            : ratio > 1.20 ? 'Gut ausgestattet'
            : 'Neutral';
        }
      }

      // Vergleichs-Pfeil (vorjahr vs. aktuell)
      if (el_arrow && prevAlloc) {
        const prev = prevAlloc[r.id];
        if (prev != null) {
          if (mrd > prev)       { el_arrow.textContent = '↑'; el_arrow.className = 'hb-res-arrow hb-arrow--up'; }
          else if (mrd < prev)  { el_arrow.textContent = '↓'; el_arrow.className = 'hb-res-arrow hb-arrow--down'; }
          else                  { el_arrow.textContent = '→'; el_arrow.className = 'hb-res-arrow'; }
        }
      }
    }

    // Budget-Tabelle
    const el_alloc = container.querySelector('#hb-brow-alloc');
    const el_saldo = container.querySelector('#hb-brow-saldo');
    const el_svrow = container.querySelector('#hb-brow-sonderv-row');
    const el_svbadge = container.querySelector('#hb-sonderv-badge');
    const el_freetotal = container.querySelector('#hb-free-total');

    if (el_alloc) el_alloc.textContent = `−${totalAlloc} Mrd`;
    if (el_freetotal) el_freetotal.textContent = freePool;
    if (el_svrow)   el_svrow.style.display    = useSonderv ? '' : 'none';
    if (el_svbadge) el_svbadge.style.display  = useSonderv ? '' : 'none';

    if (el_saldo) {
      const s = sb.haushaltssaldo + (useSonderv ? SONDERVERM_BETRAG : 0);
      el_saldo.textContent = s >= 0 ? `+${s} Mrd` : `${s} Mrd`;
      el_saldo.className = `hb-brow-r ${s >= 0 ? 'hb-brow-pos' : 'hb-brow-neg'}`;
    }

    // Schuldenbremse
    const el_sbpanel = container.querySelector('#hb-sb-panel');
    const el_sbstatus = container.querySelector('#hb-sb-status');
    const el_sbbar = container.querySelector('#hb-sb-bar');
    const el_sbdetail = container.querySelector('#hb-sb-detail');

    if (el_sbstatus && el_sbbar && el_sbdetail) {
      const aktNeuv  = sb.sbRelevantDebt;
      const pct      = Math.min(100, Math.max(0, (aktNeuv / Math.max(1, bn.schuldenbremseOk)) * 100));
      el_sbbar.style.width = `${pct.toFixed(0)}%`;

      if (sb.ok) {
        el_sbstatus.textContent = useSonderv ? 'Eingehalten (via Sondervermögen)' : 'Eingehalten';
        el_sbstatus.className = 'hb-sb-status hb-sb-ok';
        el_sbbar.className = 'hb-sb-bar hb-sb-bar--ok';
        el_sbpanel?.classList.remove('hb-sb-breach');
      } else {
        const over = aktNeuv - bn.schuldenbremseOk;
        el_sbstatus.textContent = `GEBROCHEN (${over > 0 ? '+' : ''}${over} Mrd über Limit)`;
        el_sbstatus.className = 'hb-sb-status hb-sb-breach';
        el_sbbar.className = 'hb-sb-bar hb-sb-bar--breach';
        el_sbpanel?.classList.add('hb-sb-breach');
      }
      el_sbdetail.textContent = `Erlaubt: ≤${bn.schuldenbremseOk} Mrd | Aktuell: ${aktNeuv} Mrd Neuverschuldung`;
    }

    // Koalitionsreaktionen
    const el_coal = container.querySelector('#hb-coal-reactions');
    if (el_coal) {
      const reactions = computeCoalitionReactions(allocation, bn, coalition, useSonderv);
      el_coal.innerHTML = reactions.map(r => {
        const icon = r.sentiment === 'happy' ? '●' : r.sentiment === 'neutral' ? '○' : r.sentiment === 'unhappy' ? '◐' : '◯';
        const cls  = `hb-coal-row hb-coal-${r.sentiment}`;
        const delta = r.stabilityDelta;
        const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;
        return `<div class="${cls}">
          <span class="hb-coal-icon">${icon}</span>
          <span class="hb-coal-party">${r.party}</span>
          <span class="hb-coal-label">${r.label}</span>
          <span class="hb-coal-stab">${deltaStr} Stabilität</span>
        </div>`;
      }).join('');
    }

    // Effekte-Vorschau
    const el_efx = container.querySelector('#hb-effects-preview');
    if (el_efx) {
      const efx = previewEffects(allocation, bn);

      // Schuldenbremse-Effekt ergänzen
      if (!sb.ok && !useSonderv) efx['politics.coalitionStability'] = (efx['politics.coalitionStability'] || 0) - 15;

      const entries = Object.entries(efx).filter(([, v]) => Math.abs(v) >= 0.5);
      if (entries.length === 0) {
        el_efx.innerHTML = '<div class="hb-efx-empty">Keine wesentlichen Abweichungen.</div>';
      } else {
        el_efx.innerHTML = entries.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 8).map(([path, val]) => {
          const meta = EFFECT_META[path] || { label: path, pos: true };
          const isGood = (val > 0) === meta.pos;
          const sign = val > 0 ? '+' : '';
          return `<div class="hb-efx-row ${isGood ? 'hb-efx-pos' : 'hb-efx-neg'}">
            <span class="hb-efx-label">${meta.label}</span>
            <span class="hb-efx-val">${sign}${val.toFixed(1)}</span>
          </div>`;
        }).join('');
      }
    }

    // Verzögerte Effekte
    const el_del = container.querySelector('#hb-delayed-preview');
    if (el_del) {
      const delayedItems = [];
      for (const r of RESSORTS) {
        const dev = allocation[r.id] - neutral[r.id];
        if (Math.abs(dev) < 2) continue;
        const dSpec = dev > 0 ? r.posDelayed : r.negDelayed;
        if (dSpec) {
          const mrd = Math.abs(dev);
          for (const [p, rate] of Object.entries(dSpec.perMrd)) {
            const meta = EFFECT_META[p] || { label: p, pos: true };
            const val  = Math.round(mrd * rate * 10) / 10;
            const isGood = (val > 0) === meta.pos;
            delayedItems.push({ label: dSpec.label, meta: meta.label, val, isGood, delay: dSpec.quartersDelay });
          }
        }
      }
      if (delayedItems.length === 0) {
        el_del.innerHTML = '<div class="hb-delayed-empty">Keine besonderen verzögerten Effekte.</div>';
      } else {
        el_del.innerHTML = delayedItems.map(d => `
          <div class="hb-delayed-row">
            <span class="hb-delayed-q">Q+${d.delay}</span>
            <span class="hb-delayed-text">${d.label}</span>
            <span class="hb-delayed-val ${d.isGood ? 'hb-efx-pos' : 'hb-efx-neg'}">
              ${d.val > 0 ? '+' : ''}${d.val} ${d.meta}
            </span>
          </div>`).join('');
      }
    }
  }
}

// ── ERGEBNIS-HTML NACH ABGABE ─────────────────────────────────

export function buildMediaResultHTML(result) {
  const { coalitionReactions, mediaReactions, sb } = result;

  const saldoStr = sb.haushaltssaldo >= 0 ? `+${sb.haushaltssaldo} Mrd` : `${sb.haushaltssaldo} Mrd`;
  const sbText   = sb.ok ? 'Eingehalten' : `Gebrochen (+${sb.sbRelevantDebt - result.bn?.schuldenbremseOk ?? 0} Mrd)`;

  const coalHtml = (coalitionReactions || []).map(r => `
    <div class="hb-res-coal-row hb-coal-${r.sentiment}">
      <span class="hb-coal-party">${r.party}</span>
      <span class="hb-coal-label">${r.label}</span>
      <span class="hb-coal-stab">${r.stabilityDelta > 0 ? '+' : ''}${r.stabilityDelta} Stabilität</span>
    </div>`).join('');

  const mediaHtml = (mediaReactions || []).map(m => `
    <div class="hb-media-row hb-media-${m.sentiment}">
      <span class="hb-media-outlet">${m.name}</span>
      <span class="hb-media-headline">"${m.headline}"</span>
    </div>`).join('');

  return `
    <div class="hb-result-badge">Haushalt verabschiedet</div>
    <h2 class="hb-result-title">Bundeshaushalt beschlossen</h2>

    <div class="hb-result-summary">
      <div class="hb-res-row">
        <span>Haushaltssaldo</span>
        <span class="${sb.haushaltssaldo >= 0 ? 'hb-brow-pos' : 'hb-brow-neg'}">${saldoStr}</span>
      </div>
      <div class="hb-res-row">
        <span>Schuldenbremse</span>
        <span class="${sb.ok ? 'hb-brow-pos' : 'hb-brow-neg'}">${sbText}</span>
      </div>
    </div>

    <div class="hb-result-section">Koalitionsreaktionen</div>
    <div class="hb-coal-reactions">${coalHtml}</div>

    <div class="hb-result-section">Pressekommentare</div>
    <div class="hb-media-reactions">${mediaHtml}</div>

    <button class="btn btn-primary hb-result-continue" id="hb-result-continue">
      Zum Dashboard &#8594;
    </button>
  `.trim();
}
