// ============================================================
// LEGISLATION-SCREEN.JS — Gesetzgebungs-System
//
// Exports:
//   buildLegislationHTML(state)  → vollständiger Screen
//   initLegislationScreen(...)  → Listener + Abstimmungslogik
// ============================================================

import { LAW_POOL, LAW_CATEGORIES, getLawsByCategory, getLawById, isLawAlreadyEnacted } from './legislation/laws.js';
import { getMinisterLawModifier } from './ministers/minister-logic.js';

// ── ABSTIMMUNGS-LOGIK ─────────────────────────────────────────

export function computeVotePrediction(law, state, isCompromise = false) {
  const seats     = state.parliament?.seats ?? {};
  const coalition = state.government?.coalition ?? [];
  const totalSeats = Object.values(seats).reduce((a, b) => a + b, 0) || 630;

  // Minister-Kompetenz-Modifier: ±20% auf Ja-Stimmen
  const { multiplier: ministerMult, minister: relevantMinister } =
    getMinisterLawModifier(law, state);

  // Bei Kompromiss: Blocker stimmen zu, aber leicht reduzierte Effekte
  const activeBlockers = isCompromise
    ? []
    : (law.blockers || []).map(b => b.party);

  let yesVotes = 0, noVotes = 0;
  const breakdown = [];

  for (const [party, partySeats] of Object.entries(seats)) {
    if (!partySeats) continue;

    const inCoalition  = coalition.includes(party);
    const isBlocker    = activeBlockers.includes(party);
    const inOppSupport = (law.oppositionSupport || []).includes(party);
    const isPariah     = party === 'AfD';

    let stance, votes;

    if (inCoalition && !isBlocker) {
      stance = 'ja';
      votes  = partySeats;
    } else if (inCoalition && isBlocker) {
      stance = 'nein';
      votes  = partySeats;
    } else if (!inCoalition && inOppSupport) {
      // Opposition-Unterstützer: ca. 85% stimmen zu (Fraktionsdisziplin nicht perfekt)
      const yes = Math.round(partySeats * 0.85);
      breakdown.push({ party, stance: 'geteilt', yes, no: partySeats - yes });
      yesVotes += yes;
      noVotes  += partySeats - yes;
      continue;
    } else if (isPariah && !inOppSupport) {
      // AfD: generell gegen Regierungsinitiativen
      stance = 'nein';
      votes  = partySeats;
    } else {
      // Reguläre Opposition: stimmt nein
      stance = 'nein';
      votes  = partySeats;
    }

    if (stance === 'ja')   yesVotes += votes;
    if (stance === 'nein') noVotes  += votes;
    breakdown.push({ party, stance, yes: stance === 'ja' ? votes : 0, no: stance === 'nein' ? votes : 0 });
  }

  // Apply minister competence modifier to yes votes
  const adjustedYes = Math.min(totalSeats - noVotes, Math.round(yesVotes * ministerMult));

  const majorityThreshold = law.requires2_3
    ? Math.ceil(totalSeats * (2/3))
    : Math.floor(totalSeats / 2) + 1;

  const passed = adjustedYes >= majorityThreshold;

  return {
    yesVotes: adjustedYes, noVotes, totalSeats, majorityThreshold, passed,
    breakdown, isCompromise, ministerMult, relevantMinister,
  };
}

export function checkBlockers(law, state) {
  const coalition = state.government?.coalition ?? [];
  return (law.blockers || []).filter(b => coalition.includes(b.party));
}

export function checkBundesrat(law, state) {
  if (!law.isFederalLaw) return { risk: false };
  // Vereinfacht: 30% Chance wenn Opposition hat starke Stellung
  const risk = Math.random() < 0.30;
  return { risk, message: 'Der Bundesrat könnte das Gesetz blockieren (föderales Thema).' };
}

export function checkVerfassungsgericht(law) {
  if (!law.isConstitutional) return { risk: false };
  const risk = Math.random() < 0.05;
  return { risk, message: 'Das Bundesverfassungsgericht könnte das Gesetz kippen (5% Chance).' };
}

// ── HALBKREIS-DIAGRAMM (SVG) ──────────────────────────────────

function _semicircleSVG(yesVotes, noVotes, totalSeats, requires2_3, animate = false) {
  const r      = 82;
  const cx     = 100, cy = 100;
  const arcLen = Math.PI * r;  // ≈ 257.6

  const yesFrac = Math.max(0, Math.min(1, yesVotes / totalSeats));
  const noFrac  = Math.max(0, Math.min(1, noVotes  / totalSeats));
  const yesArc  = (yesFrac * arcLen).toFixed(1);
  const noArc   = (noFrac  * arcLen).toFixed(1);
  const gap     = (arcLen + 1).toFixed(1);

  const majority = requires2_3 ? 2/3 : 0.5;
  // Majority marker: an der Bogenposition des Mehrheitswertes
  const majAngle   = Math.PI * (1 - majority); // Bogenpositon von links
  const majX       = (cx + r * Math.cos(Math.PI - majAngle)).toFixed(1);
  const majY       = (cy - r * Math.sin(Math.PI - majAngle)).toFixed(1);
  const majInnerX  = (cx + (r - 20) * Math.cos(Math.PI - majAngle)).toFixed(1);
  const majInnerY  = (cy - (r - 20) * Math.sin(Math.PI - majAngle)).toFixed(1);

  const passed       = yesVotes >= Math.ceil(totalSeats * majority);
  const centerColor  = passed ? '#3fb950' : '#f85149';
  const animCls      = animate ? ' class="leg-arc-anim"' : '';

  return `
<svg viewBox="0 0 200 110" class="leg-semicircle" xmlns="http://www.w3.org/2000/svg">
  <!-- Hintergrund-Bogen -->
  <path d="M 18 100 A ${r} ${r} 0 0 1 182 100" stroke="#21262d" stroke-width="20" fill="none"/>
  <!-- NEIN-Stimmen (rot, von rechts nach links) -->
  <path d="M 182 100 A ${r} ${r} 0 0 0 18 100" stroke="#f85149" stroke-width="20" fill="none"
    stroke-dasharray="${noArc} ${gap}"/>
  <!-- JA-Stimmen (grün, von links nach rechts) -->
  <path d="M 18 100 A ${r} ${r} 0 0 1 182 100" stroke="#3fb950" stroke-width="20" fill="none"
    stroke-dasharray="${yesArc} ${gap}"${animCls}/>
  <!-- Mehrheits-Markierung -->
  <line x1="${majInnerX}" y1="${majInnerY}" x2="${majX}" y2="${majY}"
    stroke="#d29922" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="${majX}" cy="${majY}" r="3.5" fill="#d29922"/>
  <!-- Zahlen -->
  <text x="100" y="72" text-anchor="middle" fill="${centerColor}"
    font-size="19" font-weight="700" font-family="-apple-system,sans-serif">${yesVotes}</text>
  <text x="100" y="87" text-anchor="middle" fill="#8b949e"
    font-size="9" font-family="-apple-system,sans-serif">von ${Math.ceil(totalSeats * majority)} nötig</text>
  <!-- JA/NEIN Labels -->
  <text x="18" y="113" text-anchor="middle" fill="#3fb950" font-size="9" font-weight="700">JA</text>
  <text x="182" y="113" text-anchor="middle" fill="#f85149" font-size="9" font-weight="700">NEIN</text>
  ${requires2_3 ? `<text x="100" y="113" text-anchor="middle" fill="#d29922" font-size="8">2/3-Mehrheit</text>` : ''}
</svg>`.trim();
}

// ── SITZGITTER (Abstimmungsanimation) ─────────────────────────

function _buildSeatGridHTML(totalSeats) {
  // 72 Blöcke ≈ 630 Sitze (1 Block = ~8.75 Sitze)
  const blocks = 72;
  return `<div class="leg-seat-grid" id="leg-seat-grid">
    ${Array.from({ length: blocks }, () => '<div class="leg-seat"></div>').join('')}
  </div>`;
}

function _animateSeats(gridEl, yesVotes, noVotes, totalSeats, onDone) {
  const BLOCKS  = 72;
  const yesBlk  = Math.round((yesVotes / totalSeats) * BLOCKS);
  const seats   = gridEl.querySelectorAll('.leg-seat');

  let i = 0;
  const ivl = setInterval(() => {
    if (i >= BLOCKS) { clearInterval(ivl); onDone?.(); return; }
    seats[i].className = i < yesBlk ? 'leg-seat leg-seat--yes' : 'leg-seat leg-seat--no';
    i++;
  }, 18);
}

// ── EFFEKT-META ───────────────────────────────────────────────

const EFX_META = {
  'economy.gdpIndex':              { label: 'BIP-Index',          pos: true  },
  'economy.unemployment':          { label: 'Beschäftigung',      pos: true  },
  'economy.inflation':             { label: 'Preisstabilität',    pos: true  },
  'economy.debtRatio':             { label: 'Schuldenquote',      pos: false },
  'economy.taxRevenue':            { label: 'Steuereinnahmen',    pos: true  },
  'economy.tradeBalance':          { label: 'Außenhandel',        pos: true  },
  'government.budgetBalance':      { label: 'Haushaltssaldo',     pos: true  },
  'society.publicSatisfaction':    { label: 'Zufriedenheit',      pos: true  },
  'society.socialJustice':         { label: 'Soz. Gerechtigkeit', pos: true  },
  'society.securityFeeling':       { label: 'Sicherheitsgefühl',  pos: true  },
  'society.climateProgress':       { label: 'Klimafortschritt',   pos: true  },
  'society.healthcareQuality':     { label: 'Gesundheit',         pos: true  },
  'society.infrastructureState':   { label: 'Infrastruktur',      pos: true  },
  'politics.coalitionStability':   { label: 'Koalitionsstab.',    pos: true  },
  'politics.mediaRelations':       { label: 'Medienrelat.',       pos: true  },
  'politics.euRelations':          { label: 'EU-Beziehungen',     pos: true  },
  'politics.usRelations':          { label: 'USA-Beziehungen',    pos: true  },
};

function _efxPillsHTML(effects, label = 'Sofort') {
  return Object.entries(effects).map(([path, val]) => {
    const m   = EFX_META[path] || { label: path, pos: true };
    const pos = (val > 0) === m.pos;
    const s   = val > 0 ? '+' : '';
    return `<div class="leg-efx-row ${pos ? 'leg-efx-pos' : 'leg-efx-neg'}">
      <span class="leg-efx-lbl">${m.label}</span>
      <span class="leg-efx-val">${s}${val}</span>
    </div>`;
  }).join('');
}

// ── SCREEN-HTML ────────────────────────────────────────────────

export function buildLegislationHTML(state) {
  const enacted   = state.legislation?.enactedLaws  ?? [];
  const failed    = state.legislation?.failedLaws   ?? [];
  const coalition = state.government?.coalition     ?? [];

  const firstCat  = LAW_CATEGORIES[0].id;
  const lawsInCat = getLawsByCategory(firstCat);

  const categoryTabs = LAW_CATEGORIES.map((c, i) =>
    `<button class="leg-tab ${i === 0 ? 'leg-tab--active' : ''}" data-cat="${c.id}">${c.label}</button>`
  ).join('');

  const lawList = (cat) => getLawsByCategory(cat).map(law => {
    const alreadyEnacted = enacted.some(e => e.lawId === law.id);
    const cls = alreadyEnacted ? 'leg-law-item leg-law-enacted' : 'leg-law-item';
    const badgeDone = alreadyEnacted ? '<span class="leg-enacted-badge">Beschlossen</span>' : '';
    return `<div class="${cls}" data-law="${law.id}">
      <div class="leg-law-name">${law.label}</div>
      <div class="leg-law-summary">${law.effectSummary}</div>
      ${badgeDone}
    </div>`;
  }).join('');

  const enactedList = enacted.length === 0
    ? '<div class="leg-empty">Noch keine Gesetze beschlossen.</div>'
    : enacted.map(e => {
        const law = getLawById(e.lawId);
        return `<div class="leg-enacted-item">
          <span class="leg-enacted-name">${law?.label ?? e.lawId}</span>
          <span class="leg-enacted-q">Q${e.termQuarter} / ${e.year}</span>
        </div>`;
      }).join('');

  return `
<div class="leg-page">
  <div class="leg-header">
    <button class="btn btn-ghost leg-back" id="leg-back">&#8592; Dashboard</button>
    <div class="leg-header-center">
      <div class="leg-badge">Gesetzgebung</div>
      <h1 class="leg-title">Gesetze einbringen</h1>
    </div>
    <div class="leg-header-right">Koalition: ${coalition.join(' + ')}</div>
  </div>

  <div class="leg-layout">

    <!-- Linke Spalte: Tab-Navigation + Gesetzesliste + Beschlossen -->
    <div class="leg-left">
      <div class="leg-tabs" id="leg-tabs">${categoryTabs}</div>
      <div class="leg-law-list" id="leg-law-list">
        ${lawList(firstCat)}
      </div>

      <div class="leg-enacted-panel">
        <div class="leg-enacted-title">Beschlossene Gesetze</div>
        <div id="leg-enacted-list">${enactedList}</div>
      </div>
    </div>

    <!-- Rechte Spalte: Detail-Ansicht -->
    <div class="leg-right" id="leg-detail">
      <div class="leg-detail-empty">
        Gesetz aus der Liste auswählen.
      </div>
    </div>
  </div>
</div>`.trim();
}

// ── DETAIL-HTML FÜR EIN GESETZ ────────────────────────────────

function _buildDetailHTML(law, state, isCompromise = false) {
  const vp        = computeVotePrediction(law, state, isCompromise);
  const blockers  = checkBlockers(law, state);
  const coalition = state.government?.coalition ?? [];
  const enacted   = state.legislation?.enactedLaws ?? [];
  const alreadyEnacted = enacted.some(e => e.lawId === law.id);

  const passedCls   = vp.passed ? 'leg-prognose--pass' : 'leg-prognose--fail';
  const passedLabel = vp.passed ? 'Voraussichtlich angenommen' : 'Voraussichtlich gescheitert';

  // Partei-Positionen
  const seats     = state.parliament?.seats ?? {};
  const partyRows = Object.entries(seats).map(([party, partySeats]) => {
    if (!partySeats) return '';
    const bd   = vp.breakdown.find(b => b.party === party);
    const inCoal = coalition.includes(party);
    const stance = bd?.stance ?? 'nein';
    const icon   = stance === 'ja' ? '✓' : stance === 'geteilt' ? '◐' : '✗';
    const stCls  = stance === 'ja' ? 'leg-party-yes' : stance === 'geteilt' ? 'leg-party-split' : 'leg-party-no';
    const label  = inCoal ? `${party} (Koalition)` : party;
    return `<div class="leg-party-row">
      <span class="leg-party-icon ${stCls}">${icon}</span>
      <span class="leg-party-name">${label}</span>
      <span class="leg-party-seats">${partySeats} Sitze</span>
      <span class="leg-party-stance ${stCls}">${stance === 'ja' ? 'Dafür' : stance === 'geteilt' ? 'Gespalten' : 'Dagegen'}</span>
    </div>`;
  }).join('');

  // Effekte
  const immHtml = law.immediateEffects
    ? `<div class="leg-efx-section">
        <div class="leg-efx-head">Sofortige Auswirkungen</div>
        ${_efxPillsHTML(law.immediateEffects)}
      </div>`
    : '';

  const delHtml = (law.delayedEffects || []).length > 0
    ? `<div class="leg-efx-section">
        <div class="leg-efx-head">Verzögerte Auswirkungen</div>
        ${law.delayedEffects.map(d => `
          <div class="leg-delayed-row">
            <span class="leg-delayed-q">Q+${d.quartersDelay}</span>
            <span class="leg-delayed-lbl">${d.label}</span>
          </div>`).join('')}
      </div>`
    : '';

  // Kompromiss-Hinweis
  const compLabel = isCompromise
    ? `<div class="leg-compromise-note">Kompromissversion: Effekte um 40% reduziert, Blocker stimmen zu.</div>`
    : '';

  // Sonderfälle
  const exitWarning = (law.causesCoalitionExit || []).filter(p => coalition.includes(p)).length > 0
    ? `<div class="leg-exit-warning">
        Warnung: Bei Verabschiedung verlässt <strong>${law.causesCoalitionExit.filter(p => coalition.includes(p)).join(', ')}</strong> die Koalition!
      </div>`
    : '';

  // Bundesrat / BVerfG Risiken
  const riskBadges = [
    law.isFederalLaw ? '<span class="leg-risk-badge">Bundesrat beteiligt</span>' : '',
    law.requires2_3  ? '<span class="leg-risk-badge leg-risk-badge--2/3">2/3-Mehrheit</span>' : '',
    law.isConstitutional ? '<span class="leg-risk-badge leg-risk-badge--bverfg">BVerfG-Risiko</span>' : '',
  ].filter(Boolean).join('');

  const enactBtn = alreadyEnacted
    ? `<button class="btn leg-propose-btn" disabled>Bereits beschlossen</button>`
    : `<button class="btn btn-primary leg-propose-btn" id="leg-propose" data-law="${law.id}" data-compromise="${isCompromise}">
        ${isCompromise ? 'Kompromiss einbringen' : 'Gesetz einbringen'} &#8594;
      </button>`;

  return `
    <div class="leg-detail-inner">
      <div class="leg-detail-cat">${LAW_CATEGORIES.find(c => c.id === law.category)?.label ?? law.category}</div>
      <h2 class="leg-detail-title">${law.label}</h2>
      ${riskBadges ? `<div class="leg-risk-badges">${riskBadges}</div>` : ''}
      ${compLabel}
      ${exitWarning}

      <p class="leg-detail-desc">${law.description}</p>

      ${immHtml}${delHtml}

      <!-- Parteien -->
      <div class="leg-section-title">Parteipositionen</div>
      <div class="leg-party-list">${partyRows}</div>

      ${blockers.length > 0 && !isCompromise ? `
        <div class="leg-blocker-box">
          <div class="leg-blocker-title">Koalitionspartner blockieren</div>
          ${blockers.map(b => `
            <div class="leg-blocker-row">
              <span class="leg-blocker-party">${b.party}</span>
              <span class="leg-blocker-reason">${b.reason}</span>
            </div>`).join('')}
        </div>
      ` : ''}

      <!-- Abstimmungsprognose -->
      <div class="leg-section-title">Abstimmungsprognose</div>
      <div class="leg-prognose ${passedCls}">
        <div class="leg-semicircle-wrap">
          ${_semicircleSVG(vp.yesVotes, vp.noVotes, vp.totalSeats, law.requires2_3)}
        </div>
        <div class="leg-prognose-label">${passedLabel}</div>
        <div class="leg-prognose-nums">
          <span class="leg-prognose-yes">${vp.yesVotes} Ja</span>
          <span class="leg-prognose-sep"> / </span>
          <span class="leg-prognose-no">${vp.noVotes} Nein</span>
          <span class="leg-prognose-maj"> (Mehrheit: ${vp.majorityThreshold})</span>
        </div>
        ${vp.relevantMinister ? `
          <div class="leg-minister-modifier">
            ${vp.ministerMult > 1
              ? `<span class="leg-mod-pos">▲ ${vp.relevantMinister.name} (${vp.relevantMinister.ministry}): +20% Erfolgschance</span>`
              : vp.ministerMult < 1
              ? `<span class="leg-mod-neg">▼ ${vp.relevantMinister.name} (${vp.relevantMinister.ministry}): −20% Erfolgschance</span>`
              : ''}
          </div>` : ''}
      </div>

      <div class="leg-propose-actions">
        ${enactBtn}
        ${blockers.length > 0 && !isCompromise ? `
          <button class="btn btn-ghost leg-compromise-btn" id="leg-compromise" data-law="${law.id}">
            Kompromissversion anzeigen
          </button>
          <button class="btn btn-ghost leg-withdraw-btn" id="leg-withdraw">
            Gesetz zurückziehen
          </button>
        ` : ''}
      </div>
    </div>
  `.trim();
}

// ── ABSTIMMUNGS-MODAL ─────────────────────────────────────────

function _buildVotingModalHTML(law, vp) {
  return `
    <div class="leg-vote-badge">Bundestagsabstimmung</div>
    <h2 class="leg-vote-title">${law.label}</h2>
    <p class="leg-vote-desc">Die Abstimmung läuft…</p>
    <div class="leg-seat-wrap">
      ${_buildSeatGridHTML(vp.totalSeats)}
    </div>
    <div class="leg-vote-counts" id="leg-vote-counts">
      <span class="leg-vote-yes" id="leg-v-yes">0 Ja</span>
      <span class="leg-vote-sep">/</span>
      <span class="leg-vote-no" id="leg-v-no">0 Nein</span>
    </div>
    <div id="leg-vote-result" style="display:none">
      <div class="leg-vote-final" id="leg-vote-final-text"></div>
      <button class="btn btn-primary leg-vote-done" id="leg-vote-done">Weiter &#8594;</button>
    </div>
  `.trim();
}

// ── ERGEBNIS-MODAL ────────────────────────────────────────────

function _buildResultModalHTML(law, vp, passed, failReason) {
  const title   = passed ? 'Gesetz angenommen!' : 'Gesetz gescheitert';
  const cls     = passed ? 'leg-result-pass' : 'leg-result-fail';
  const symbol  = passed ? '✓' : '✗';

  const effects = passed ? [
    ...Object.entries(law.immediateEffects || {}).map(([path, val]) => {
      const m = EFX_META[path] || { label: path, pos: true };
      const isGood = (val > 0) === m.pos;
      return { label: m.label, val, isGood };
    }),
  ] : [];

  const delayedText = (law.delayedEffects || []).map(d =>
    `<div class="leg-res-delayed">Q+${d.quartersDelay}: ${d.label}</div>`
  ).join('');

  return `
    <div class="leg-result-icon ${cls}">${symbol}</div>
    <h2 class="leg-result-title">${title}</h2>
    <div class="leg-result-nums">
      <span class="leg-v-yes">${vp.yesVotes} Ja</span>
      <span class="leg-v-sep"> / </span>
      <span class="leg-v-no">${vp.noVotes} Nein</span>
    </div>
    ${failReason ? `<div class="leg-result-fail-reason">${failReason}</div>` : ''}

    ${passed && effects.length > 0 ? `
      <div class="leg-result-effects">
        ${effects.map(e => `
          <div class="leg-res-efx ${e.isGood ? 'leg-efx-pos' : 'leg-efx-neg'}">
            <span>${e.label}</span>
            <span class="leg-efx-val">${e.val > 0 ? '+' : ''}${e.val}</span>
          </div>`).join('')}
      </div>` : ''}

    ${passed && delayedText ? `<div class="leg-result-delayed">${delayedText}</div>` : ''}

    ${passed ? `
      <div class="leg-result-press">
        <div class="leg-press-outlet">Presse-Kommentar</div>
        <div class="leg-press-quote">"${law.pressComment}"</div>
      </div>` : ''}

    <button class="btn btn-primary leg-result-done" id="leg-result-done">Zum Dashboard &#8594;</button>
  `.trim();
}

// ── SCREEN-INITIALISIERUNG ────────────────────────────────────

export function initLegislationScreen(container, state, openOverlay, closeOverlay, onResult) {
  let currentLawId    = null;
  let currentCompromise = false;

  // ── Tab-Navigation
  container.querySelectorAll('.leg-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.leg-tab').forEach(t => t.classList.remove('leg-tab--active'));
      tab.classList.add('leg-tab--active');
      const cat = tab.dataset.cat;
      const listEl = container.querySelector('#leg-law-list');
      const enacted = state.legislation?.enactedLaws ?? [];
      listEl.innerHTML = getLawsByCategory(cat).map(law => {
        const ae = enacted.some(e => e.lawId === law.id);
        const cls = ae ? 'leg-law-item leg-law-enacted' : 'leg-law-item';
        return `<div class="${cls}" data-law="${law.id}">
          <div class="leg-law-name">${law.label}</div>
          <div class="leg-law-summary">${law.effectSummary}</div>
          ${ae ? '<span class="leg-enacted-badge">Beschlossen</span>' : ''}
        </div>`;
      }).join('');
      _wireListClicks();
      // Reset detail
      container.querySelector('#leg-detail').innerHTML = '<div class="leg-detail-empty">Gesetz aus der Liste auswählen.</div>';
      currentLawId = null;
    });
  });

  function _wireListClicks() {
    container.querySelectorAll('.leg-law-item').forEach(item => {
      item.addEventListener('click', () => {
        container.querySelectorAll('.leg-law-item').forEach(i => i.classList.remove('leg-law-active'));
        item.classList.add('leg-law-active');
        currentLawId = item.dataset.law;
        currentCompromise = false;
        _showDetail(currentLawId, false);
      });
    });
  }

  function _showDetail(lawId, isCompromise) {
    const law = getLawById(lawId);
    if (!law) return;
    const detailEl = container.querySelector('#leg-detail');
    detailEl.innerHTML = _buildDetailHTML(law, state, isCompromise);
    _wireDetailButtons(lawId);
  }

  function _wireDetailButtons(lawId) {
    const proposeBtn    = container.querySelector('#leg-propose');
    const compromiseBtn = container.querySelector('#leg-compromise');
    const withdrawBtn   = container.querySelector('#leg-withdraw');

    if (proposeBtn && !proposeBtn.disabled) {
      proposeBtn.addEventListener('click', () => {
        const law         = getLawById(proposeBtn.dataset.law);
        const isCompromise = proposeBtn.dataset.compromise === 'true';
        _startVoting(law, isCompromise);
      });
    }

    if (compromiseBtn) {
      compromiseBtn.addEventListener('click', () => {
        currentCompromise = true;
        _showDetail(lawId, true);
      });
    }

    if (withdrawBtn) {
      withdrawBtn.addEventListener('click', () => {
        // Zurückziehen: kein Effekt
        onResult({ action: 'withdraw', law: getLawById(lawId) });
      });
    }
  }

  function _startVoting(law, isCompromise) {
    // Kompromiss-Effekte sind 40% schwächer
    const vp = computeVotePrediction(law, state, isCompromise);

    const modal = openOverlay(_buildVotingModalHTML(law, vp));
    const gridEl = modal.querySelector('#leg-seat-grid');
    const yesEl  = modal.querySelector('#leg-v-yes');
    const noEl   = modal.querySelector('#leg-v-no');
    const resEl  = modal.querySelector('#leg-vote-result');
    const finEl  = modal.querySelector('#leg-vote-final-text');

    // Sitz-Animation
    let counted = 0;
    const totalCounted = vp.yesVotes + vp.noVotes;
    const BLOCKS = 72;
    const yesBlk = Math.round((vp.yesVotes / vp.totalSeats) * BLOCKS);
    const seats  = gridEl.querySelectorAll('.leg-seat');

    const ivl = setInterval(() => {
      if (counted >= BLOCKS) {
        clearInterval(ivl);
        // Zeige Ergebnis
        const passed = vp.passed;

        // Bundesrat / BVerfG prüfen
        const brat  = checkBundesrat(law, state);
        const bverfg = checkVerfassungsgericht(law);
        let failReason = null;

        let finalPassed = passed;
        if (passed && brat.risk)   { finalPassed = false; failReason = 'Bundesrat hat das Gesetz blockiert.'; }
        if (passed && bverfg.risk) { finalPassed = false; failReason = 'Das Bundesverfassungsgericht hat das Gesetz für verfassungswidrig erklärt.'; }

        finEl.textContent = finalPassed
          ? `Angenommen — ${vp.yesVotes} zu ${vp.noVotes} Stimmen`
          : `Gescheitert — ${vp.yesVotes} zu ${vp.noVotes} Stimmen`;
        finEl.className = `leg-vote-final ${finalPassed ? 'leg-vote-final--pass' : 'leg-vote-final--fail'}`;
        resEl.style.display = '';

        modal.querySelector('#leg-vote-done').addEventListener('click', () => {
          closeOverlay();
          _showVoteResult(law, vp, finalPassed, isCompromise, failReason);
        });
        return;
      }

      // Sitze einfärben
      seats[counted].className = counted < yesBlk ? 'leg-seat leg-seat--yes' : 'leg-seat leg-seat--no';

      // Zähler live update
      const yesC = Math.round((Math.min(counted + 1, yesBlk) / BLOCKS) * vp.yesVotes);
      const noC  = Math.round((Math.max(0, counted + 1 - yesBlk) / BLOCKS) * vp.noVotes);
      if (yesEl) yesEl.textContent = `${yesC} Ja`;
      if (noEl)  noEl.textContent  = `${noC} Nein`;

      counted++;
    }, 18);
  }

  function _showVoteResult(law, vp, passed, isCompromise, failReason) {
    const effMult = isCompromise ? 0.6 : 1.0;

    // Koalitionsaustritt prüfen
    const coalition = state.government?.coalition ?? [];
    const exits = passed ? (law.causesCoalitionExit || []).filter(p => coalition.includes(p)) : [];

    const modal = openOverlay(_buildResultModalHTML(law, vp, passed, failReason));

    modal.querySelector('#leg-result-done')?.addEventListener('click', () => {
      closeOverlay();
      onResult({
        action: passed ? 'enacted' : 'failed',
        law,
        vp,
        isCompromise,
        effMult,
        failReason,
        coalitionExits: exits,
      });
    });
  }

  // Erste Initialisierung der Klick-Listener
  _wireListClicks();

  // ── Back-Button
  container.querySelector('#leg-back')?.addEventListener('click', () => {
    onResult({ action: 'cancel' });
  });
}
