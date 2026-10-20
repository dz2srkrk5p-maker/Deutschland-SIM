// ============================================================
// MAIN.JS — Einstiegspunkt und View-Management
//
// Was: Initialisiert das Spiel, verwaltet alle Screen-Übergänge
//      und rendert das Dashboard. Kein Game-Logik hier.
//
// Nutzt: game.js, parliament.js, campaign.js, election.js,
//        haushalts-screen.js, legislation-screen.js, ministers-screen.js,
//        coal-neg-engine.js, coal-neg-ui.js, coalition-contract-screen.js
//
// Erweiterungspunkte:
//   - NAV_ITEMS: neue Screens als Eintrag hinzufügen (kein buildShell-Edit nötig)
//   - showXView()-Funktionen: neuen Screen als Funktion implementieren
// ============================================================

import { Game } from './game.js';
import Chart from 'chart.js/auto';
import './style.css';
import { buildParliamentHTML } from './parliament.js';
import {
  pickRandomEvents, calculatePoll, renderPollBars,
  applyCampaignToState, buildCampaignHTML, buildElectionResultHTML,
} from './campaign.js';
import { findPossibleCoalitions } from './parties/election.js';
import { PARTY_POSITIONS } from './engine/state.js';
import { getTimeline, quartersUntilHaushalt } from './scheduler.js';
import {
  computeBudgetNumbers, buildHaushaltsHTML, initHaushaltsScreen,
  buildMediaResultHTML, neutralAllocation,
} from './haushalts-screen.js';
import {
  buildLegislationHTML, initLegislationScreen,
} from './legislation-screen.js';
import { canProposeLaw } from './legislation/laws.js';
import {
  buildMinistersHTML, initMinistersScreen,
} from './ministers-screen.js';
import { getMinisterLawModifier } from './ministers/minister-logic.js';
import { distributeMinistries } from './parties/coalition.js';
import {
  buildSondierungHTML,
  getRedLineViolations, POLICY_AREAS,
} from './coalition-screen.js';
import {
  createNegotiationState, openAGDetail, selectTopicInDetail, resolveTopic,
  openPackageBuilder, addToPackage, removeFromPackage,
  addMinistryToPackage, updateMinistryInPackage, removeMinistryFromPackage,
  evaluatePackage, sendPackage,
  openMinistryOffers, offerMinistry, reactToLeak, endRound, resolveMemberVote,
  setAusschussRep, isContractReady, checkShowstoppers, getAGData,
} from './coal-neg-engine.js';
import {
  buildCoalNegScreen, buildLeakOverlay, buildRoundEndOverlay,
  buildTopicResultOverlay, buildPackageResultOverlay, buildMinistryResultOverlay,
  buildMemberVoteOverlay, buildContractSummaryOverlay, buildKoalitionsausschussOverlay,
  buildFailedOverlay,
} from './coal-neg-ui.js';
import { buildCoalitionContractScreen, getContractRating } from './coalition-contract-screen.js';
import { buildBundeslandKarteHTML, initBundeslandKarte, updateBundeslandKarte } from './bundesland-karte.js';
import { THRESHOLDS, getDeviation, getAlarmLevel } from './thresholds.js';
import { buildBundesratScreenHTML } from './bundesrat-screen.js';

const game = new Game('CDU');

// ── WAHLKAMPF-INTERCEPTION ────────────────────────────────────
// Überschreibe startCampaign dauerhaft, damit wir den Wahlkampf-Screen
// zeigen können BEVOR die Wahl läuft.
let _campaignPending = false;
const _runElection = game.startCampaign.bind(game); // echte Wahlmethode
game.startCampaign = () => { _campaignPending = true; };

// Kampagnenzustand (wird bei jedem Wahlkampf zurückgesetzt)
let selectedCampaignEvents = [];
let campaignBudget  = { wirtschaft: 20, soziales: 20, sicherheit: 20, klima: 20, migration: 20 };
let campaignChoices = {}; // eventId → optionId

// ── DASHBOARD VARIABLE DEFINITIONS ───────────────────────────
const CATEGORIES = [
  {
    id: 'wirtschaft', label: 'Wirtschaft',
    vars: [
      { path: 'economy.gdpIndex',        label: 'BIP-Index',        higherIsBad: false, max: 100 },
      { path: 'economy.unemployment',    label: 'Beschäftigung',    higherIsBad: false, max: 100 },
      { path: 'economy.inflation',       label: 'Preisstabilität',  higherIsBad: false, max: 100 },
      { path: 'economy.debtRatio',       label: 'Schuldenquote',    higherIsBad: true,  max: 120 },
      { path: 'economy.interestBurden',  label: 'Zinslast',         higherIsBad: true,  max: 100 },
      { path: 'economy.taxRevenue',      label: 'Steuereinnahmen',  higherIsBad: false, max: 100 },
      { path: 'economy.tradeBalance',    label: 'Außenhandel',      higherIsBad: false, max: 100 },
    ],
  },
  {
    id: 'gesellschaft', label: 'Gesellschaft',
    vars: [
      { path: 'society.publicSatisfaction',  label: 'Zufriedenheit',      higherIsBad: false, max: 100 },
      { path: 'society.socialJustice',       label: 'Soz. Gerechtigkeit', higherIsBad: false, max: 100 },
      { path: 'society.securityFeeling',     label: 'Sicherheitsgefühl',  higherIsBad: false, max: 100 },
      { path: 'society.climateProgress',     label: 'Klimafortschritt',   higherIsBad: false, max: 100 },
      { path: 'society.healthcareQuality',   label: 'Gesundheitssystem',  higherIsBad: false, max: 100 },
      { path: 'society.infrastructureState', label: 'Infrastruktur',      higherIsBad: false, max: 100 },
    ],
  },
  {
    id: 'politik', label: 'Politik',
    vars: [
      { path: 'politics.coalitionStability',   label: 'Koalitionsstab.',    higherIsBad: false, max: 100 },
      { path: 'politics.mediaRelations',        label: 'Medienrelationen',   higherIsBad: false, max: 100 },
      { path: 'politics.parliamentarySupport',  label: 'Parlamentsrückhalt', higherIsBad: false, max: 100 },
      { path: 'government.approvalRating',      label: 'Kanzler-Zustimmung',higherIsBad: false, max: 100 },
    ],
  },
  {
    id: 'international', label: 'International',
    vars: [
      { path: 'international.eu.relationScore',    label: 'EU-Beziehungen',    higherIsBad: false, max: 100 },
      { path: 'international.usa.relationScore',   label: 'USA-Beziehungen',   higherIsBad: false, max: 100 },
      { path: 'international.china.relationScore', label: 'China-Beziehungen', higherIsBad: false, max: 100 },
    ],
  },
];

// ── EFFECT METADATA (for modal previews) ─────────────────────
const EFFECT_META = {
  'economy.gdpIndex':              { label: 'BIP',               higherIsBad: false },
  'economy.unemployment':          { label: 'Beschäftigung',     higherIsBad: false },
  'economy.inflation':             { label: 'Preisstabilität',   higherIsBad: false },
  'economy.debtRatio':             { label: 'Schuldenquote',     higherIsBad: true  },
  'economy.interestBurden':        { label: 'Zinslast',          higherIsBad: true  },
  'economy.taxRevenue':            { label: 'Steuereinnahmen',   higherIsBad: false },
  'economy.tradeBalance':          { label: 'Außenhandel',       higherIsBad: false },
  'government.budgetBalance':      { label: 'Haushalt',          higherIsBad: false },
  'society.publicSatisfaction':    { label: 'Zufriedenheit',     higherIsBad: false },
  'society.socialJustice':         { label: 'Soz. Gerechtigk.',  higherIsBad: false },
  'society.securityFeeling':       { label: 'Sicherheit',        higherIsBad: false },
  'society.climateProgress':       { label: 'Klimafortschritt',  higherIsBad: false },
  'society.healthcareQuality':     { label: 'Gesundheit',        higherIsBad: false },
  'society.infrastructureState':   { label: 'Infrastruktur',     higherIsBad: false },
  'politics.coalitionStability':   { label: 'Koalitionsstab.',   higherIsBad: false },
  'politics.mediaRelations':       { label: 'Medien',            higherIsBad: false },
  'politics.parliamentarySupport': { label: 'Parlamentsrückh.',  higherIsBad: false },
  'politics.euRelations':          { label: 'EU',                higherIsBad: false },
  'politics.usRelations':          { label: 'USA',               higherIsBad: false },
  'politics.chinaRelations':       { label: 'China',             higherIsBad: false },
};

// Maps CATEGORIES var path → snapshot key in state.history entries
const PATH_TO_SNAPSHOT = {
  'economy.gdpIndex':                'gdpIndex',
  'economy.unemployment':            'unemployment',
  'economy.inflation':               'inflation',
  'economy.debtRatio':               'debtRatio',
  'economy.interestBurden':          'interestBurden',
  'economy.taxRevenue':              'taxRevenue',
  'economy.tradeBalance':            'tradeBalance',
  'society.publicSatisfaction':      'publicSatisfaction',
  'society.socialJustice':           'socialJustice',
  'society.securityFeeling':         'securityFeeling',
  'society.climateProgress':         'climateProgress',
  'society.healthcareQuality':       'healthcareQuality',
  'society.infrastructureState':     'infrastructureState',
  'politics.coalitionStability':     'coalitionStability',
  'politics.mediaRelations':         'mediaRelations',
  'politics.parliamentarySupport':   'parliamentarySupport',
  'government.approvalRating':       'approvalRating',
  'international.eu.relationScore':  'euRelations',
  'international.usa.relationScore': 'usaRelations',
  'international.china.relationScore': 'chinaRelations',
};

// Tracks which category panels are collapsed (by cat.id)
const collapsedCats = new Set();

const EVENT_CATEGORIES = {
  'energy-crisis':         'Energie',
  'auto-industry-crisis':  'Wirtschaft',
  'usa-trade-pressure':    'International',
  'china-tech-demand':     'International',
  'eu-budget-dispute':     'Europa',
  'migration-crisis':      'Innenpolitik',
  'infrastructure-crisis': 'Infrastruktur',
  'bank-rescue':           'Finanzkrise',
  'fachkraefte-mangel':    'Wirtschaft',
  'wohnungskrise':         'Gesellschaft',
  'flood-disaster':        'Naturkatastrophe',
  'drought-crisis':        'Naturkatastrophe',
  'corruption-scandal':    'Skandal',
  'spy-affair':            'Skandal',
  'nato-crisis':           'Sicherheitspolitik',
  'oil-price-shock':       'International',
  'cyberattack':           'Sicherheitspolitik',
  'coalition-ultimatum':   'Koalitionskrise',
  'minister-scandal':      'Skandal',
  'ai-disruption':         'Technologie',
  'chip-factory':          'Technologie',
  'pension-crisis':        'Sozialpolitik',
};

// ── HELPERS ──────────────────────────────────────────────────
function getVal(state, path) {
  return path.split('.').reduce((o, k) => o?.[k], state) ?? 0;
}

function displayPct(v, raw) {
  const pct = Math.min(100, (raw / v.max) * 100);
  return v.higherIsBad ? 100 - pct : pct;
}

function colorClass(pct) {
  if (pct < 20) return 'c-red';
  if (pct < 40) return 'c-yellow';
  return 'c-green';
}

// Parses a choice's effects into displayable pills
function parseEffects(choice) {
  const pills = [];

  for (const [path, val] of Object.entries(choice.immediateEffects || {})) {
    const meta = EFFECT_META[path];
    if (!meta) continue;
    const isGood = meta.higherIsBad ? val < 0 : val > 0;
    const sign = val > 0 ? '+' : '';
    pills.push({ text: `${sign}${val} ${meta.label}`, good: isGood, kind: 'immediate' });
  }

  for (const [actor, val] of Object.entries(choice.internationalReactions || {})) {
    const name = { eu: 'EU', usa: 'USA', china: 'China' }[actor] || actor;
    pills.push({ text: `${val > 0 ? '+' : ''}${val} ${name}`, good: val > 0, kind: 'immediate' });
  }

  for (const de of choice.delayedEffects || []) {
    pills.push({ text: `In ${de.quartersDelay}Q: ${de.label}`, good: null, kind: 'delayed' });
  }

  return pills;
}

function pillHtml(p) {
  const cls = p.kind === 'delayed' ? 'pill-delayed' : p.good ? 'pill-pos' : 'pill-neg';
  return `<span class="effect-pill ${cls}">${p.text}</span>`;
}

// ── CHART ────────────────────────────────────────────────────
const CHART_LINES = [
  { key: 'gdpIndex',           label: 'BIP-Index',       color: '#388bfd' },
  { key: 'publicSatisfaction', label: 'Zufriedenheit',   color: '#3fb950' },
  { key: 'debtRatio',          label: 'Schuldenquote',   color: '#f85149' },
  { key: 'coalitionStability', label: 'Koalitionsstab.', color: '#d29922' },
];

let chart = null;

function createChart(canvas) {
  chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: [],
      datasets: CHART_LINES.map(l => ({
        label: l.label,
        data: [],
        borderColor: l.color,
        backgroundColor: l.color + '15',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.35,
        fill: false,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', align: 'end', labels: { color: '#8b949e', boxWidth: 10, boxHeight: 2, font: { size: 11 }, padding: 16 } },
        tooltip: { backgroundColor: '#161b22', borderColor: '#30363d', borderWidth: 1, titleColor: '#e6edf3', bodyColor: '#8b949e' },
      },
      scales: {
        x: { ticks: { color: '#8b949e', font: { size: 10 }, maxTicksLimit: 8 }, grid: { color: '#21262d' } },
        y: { min: 0, max: 100, ticks: { color: '#8b949e', font: { size: 10 }, stepSize: 20 }, grid: { color: '#21262d' } },
      },
    },
  });
}

function updateChart(state) {
  const chartWrap = document.getElementById('chart-wrap');
  const canvas    = document.getElementById('history-chart');

  if (state.history.length < 2) {
    if (canvas) canvas.style.display = 'none';
    if (chartWrap && !chartWrap.querySelector('.chart-placeholder')) {
      const ph = document.createElement('div');
      ph.className = 'chart-placeholder';
      ph.textContent = 'Verlauf verfügbar ab dem zweiten Quartal';
      chartWrap.appendChild(ph);
    }
    return;
  }

  if (chartWrap) {
    const ph = chartWrap.querySelector('.chart-placeholder');
    if (ph) ph.remove();
  }
  if (canvas) canvas.style.display = '';

  if (!chart) return;
  const h = state.history.slice(-8);
  chart.data.labels = h.map(x => `${x.year} Q${x.quarter}`);
  CHART_LINES.forEach((l, i) => {
    chart.data.datasets[i].data = h.map(x => +x[l.key].toFixed(1));
  });
  chart.update('active');
}

// ── TOAST NOTIFICATIONS (delayed effects) ────────────────────
function showToast(label) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `
    <div class="toast-icon">&#9200;</div>
    <div class="toast-body">
      <div class="toast-label">Verzögerter Effekt eingetreten</div>
      <div class="toast-text">${label}</div>
    </div>
    <button class="toast-close" onclick="this.closest('.toast').remove()">&#x2715;</button>
  `;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => el.remove(), 400);
  }, 6000);
}

function drainResolvedToasts() {
  const resolved = game.state.activeEvents.filter(e => e.type === 'delayed-resolved');
  if (resolved.length === 0) return;
  game.state.activeEvents = game.state.activeEvents.filter(e => e.type !== 'delayed-resolved');
  resolved.forEach((e, i) => {
    _pushEventLog({
      quarter: game.state.quarter,
      year:    game.state.year,
      type:    'delayed',
      title:   'Verzögerter Effekt eingetreten',
      detail:  e.label ?? '',
      effects: [],
    });
    setTimeout(() => showToast(e.label), i * 600);
  });
}

// ── EVENT MODAL ───────────────────────────────────────────────
let eventQueue = [];

function getOverlay() {
  let el = document.getElementById('ev-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ev-overlay';
    el.className = 'ev-overlay';
    document.body.appendChild(el);
  }
  return el;
}

function openOverlay(html) {
  const ov = getOverlay();
  ov.innerHTML = `<div class="ev-modal">${html}</div>`;
  ov.classList.add('open');
  // Attach listeners after DOM update
  return ov.querySelector('.ev-modal');
}

function closeOverlay() {
  const ov = getOverlay();
  ov.classList.remove('open');
  ov.innerHTML = '';
}

// Process next event in queue, or close modal
function nextInQueue() {
  drainResolvedToasts();
  if (eventQueue.length === 0) {
    closeOverlay();
    render(game.state);
    return;
  }
  showEventModal(eventQueue.shift());
}

function showEventModal(event) {
  const MINISTER_TYPE_LABELS = {
    'minister-initiative':  'Ministerielle Initiative',
    'minister-scandal':     'Ministerskandal',
    'minister-conflict':    'Ressortstreit',
    'minister-resolution':  'Untersuchungsausschuss',
  };
  const category = event.type === 'haushalt'
    ? 'Haushaltsplanung'
    : event.type === 'stellungnahme'
    ? 'Politische Stellungnahme'
    : MINISTER_TYPE_LABELS[event.type]
    ?? EVENT_CATEGORIES[event.id]
    ?? 'Ereignis';
  const remaining = eventQueue.length;

  const typeCls = event.type === 'haushalt'      ? 'ev-type-haushalt'
    : event.type === 'stellungnahme'              ? 'ev-type-stellungnahme'
    : event.type === 'minister-scandal'           ? 'ev-type-scandal'
    : event.type === 'minister-initiative'        ? 'ev-type-initiative'
    : event.type === 'minister-conflict'          ? 'ev-type-conflict'
    : '';

  // Ministerkontext-Header (Name + Icon wenn vorhanden)
  const ministerHint = event.ministerName
    ? `<div class="ev-minister-hint">
        <span class="ev-minister-icon">${event.icon ?? '🏛'}</span>
        ${event.ministerName}${event.personality ? ` · ${event.personality}` : ''}
      </div>`
    : '';

  const modal = openOverlay(`
    <div class="ev-category ${typeCls}">${category}</div>
    ${ministerHint}
    <h2 class="ev-title">${event.label}</h2>
    <p class="ev-desc">${event.description || ''}</p>
    <div class="ev-choices">
      ${event.choices.map((c, i) => {
        const pills = parseEffects(c);
        return `
          <button class="ev-choice-btn" data-idx="${i}">
            <span class="ev-choice-label">${c.label}</span>
            ${c.description ? `<span class="ev-choice-subdesc">${c.description}</span>` : ''}
            ${pills.length > 0 ? `
              <div class="ev-choice-preview">
                ${pills.map(pillHtml).join('')}
              </div>
            ` : ''}
          </button>
        `;
      }).join('')}
    </div>
    ${remaining > 0 ? `<div class="ev-queue-hint">${remaining} weiteres Ereignis wartet</div>` : ''}
  `);

  modal.querySelectorAll('.ev-choice-btn').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const choice = event.choices[i];
      const pills  = parseEffects(choice);
      game.makeDecision(event.id, choice.id);

      // Log decision to event log
      const effectTexts = Object.entries(choice.immediateEffects || {})
        .slice(0, 4)
        .map(([path, val]) => {
          const meta = EFFECT_META[path];
          if (!meta) return null;
          return `${val > 0 ? '+' : ''}${val} ${meta.label}`;
        })
        .filter(Boolean);
      _pushEventLog({
        quarter: game.state.quarter,
        year:    game.state.year,
        type:    event.type === 'minister-scandal' ? 'scandal' : 'decision',
        title:   event.label,
        detail:  choice.label,
        effects: effectTexts,
      });

      // Collect any delayed-resolved events the decision's tick produced
      const justResolved = game.state.activeEvents.filter(e => e.type === 'delayed-resolved');
      game.state.activeEvents = game.state.activeEvents.filter(e => e.type !== 'delayed-resolved');
      showResultModal(event.label, choice.label, pills, justResolved);
    });
  });
}

function showResultModal(eventLabel, choiceLabel, pills, justResolved) {
  const immediatePills = pills.filter(p => p.kind === 'immediate');
  const delayedPills   = pills.filter(p => p.kind === 'delayed');
  const more = eventQueue.length;

  const modal = openOverlay(`
    <div class="ev-result-check">Entscheidung getroffen</div>
    <div class="ev-result-event">${eventLabel}</div>
    <div class="ev-result-choice">${choiceLabel}</div>

    ${immediatePills.length > 0 ? `
      <div class="ev-result-section-title">Sofortige Auswirkungen</div>
      <div class="ev-result-pills">
        ${immediatePills.map(p => `
          <div class="ev-result-row ${p.good ? 'pos' : 'neg'}">
            ${pillHtml(p)}
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${delayedPills.length > 0 ? `
      <div class="ev-result-section-title">Geplante Effekte</div>
      <div class="ev-result-pills">
        ${delayedPills.map(p => `<div class="ev-result-row">${pillHtml(p)}</div>`).join('')}
      </div>
    ` : ''}

    ${justResolved.length > 0 ? `
      <div class="ev-result-section-title ev-resolved-title">Verzögerte Effekte eingetreten</div>
      <div class="ev-result-pills">
        ${justResolved.map(e => `
          <div class="ev-result-row">
            <span class="effect-pill pill-resolved">${e.label}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <button class="btn btn-primary ev-continue" id="ev-continue">
      ${more > 0 ? `Weiter — noch ${more} Ereignis${more > 1 ? 'se' : ''} ` : 'Zum Dashboard'} &#8594;
    </button>
  `);

  modal.querySelector('#ev-continue').addEventListener('click', nextInQueue);
}

// ── VIEW MANAGEMENT ───────────────────────────────────────────
let currentView = 'dashboard';

function showParliamentView(voncResult = null) {
  currentView = 'parliament';
  if (chart) { chart.destroy(); chart = null; }
  document.getElementById('app').innerHTML = buildParliamentHTML(game.state, voncResult);

  document.getElementById('parl-back').addEventListener('click', () => {
    currentView = 'dashboard';
    buildShell();
    render(game.state);
  });

  const voncBtn = document.getElementById('btn-vonc');
  if (voncBtn) {
    voncBtn.addEventListener('click', () => {
      const initiator = voncBtn.dataset.initiator;
      const result = game.handleVoteOfNoConfidence(initiator);
      showParliamentView(result);
    });
  }
}

// ── TIMELINE HELPER ───────────────────────────────────────────
function _buildTimelineHTML(timeline) {
  const TYPE_LABEL = { haushalt: 'Haushaltsplanung', stellungnahme: 'Stellungnahme', unknown: '—' };
  const TYPE_CLS   = { haushalt: 'tl-q--haushalt',  stellungnahme: 'tl-q--stell',   unknown: 'tl-q--unknown' };

  return `
    <div class="tl-label">Naechste Quartale</div>
    <div class="tl-quarters">
      ${timeline.map(q => `
        <div class="tl-quarter ${TYPE_CLS[q.type]} ${q.certain ? 'tl-certain' : ''}">
          <div class="tl-q-id">Q${q.absQ}</div>
          <div class="tl-q-text">${TYPE_LABEL[q.type] || '—'}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ── NAVIGATION ITEMS ─────────────────────────────────────────
// Erweiterbar: neuen Screen als Objekt hier hinzufügen.
// condition(state): true = Button aktiv, false = disabled.
// Neue Screens brauchen nur einen Eintrag hier + eine showXView()-Funktion.
const NAV_ITEMS = [
  {
    id: 'cabinet',
    label: 'Kabinett',
    action: () => showMinistersView(),
  },
  {
    id: 'legislation',
    label: 'Gesetz einbringen',
    title: 'Einmal pro Quartal nutzbar',
    disabledTitle: 'Bereits dieses Quartal genutzt',
    condition: (state) => canProposeLaw(state),
    action: () => showLegislationView(),
  },
  {
    id: 'bundesrat',
    label: 'Bundesrat',
    action: () => showBundesratView(),
  },
  // Zukunft: { id: 'parteiaufbau', label: 'Parteiaufbau', action: () => showParteiaufbauView() },
];

// ── DASHBOARD SHELL ───────────────────────────────────────────
function buildShell() {
  document.getElementById('app').innerHTML = `
    <div class="statusbar">
      <span class="statusbar-title">Deutschland Simulator</span>
      <div class="stat-item">
        <span class="stat-label">Jahr / Quartal</span>
        <span class="stat-value" id="s-year">—</span>
      </div>
      <div class="stat-item stat-clickable" id="coal-nav" title="Bundestag öffnen">
        <span class="stat-label">Koalition &#8599;</span>
        <span class="stat-value" id="s-coalition">—</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Kanzler-Partei</span>
        <span class="stat-value" id="s-chancellor">—</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Bis zur Wahl</span>
        <span class="stat-value" id="s-election">—</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Naechster Haushalt</span>
        <span class="stat-value" id="s-haushalt">—</span>
      </div>
      <div class="statusbar-actions">
        <span class="phase-pill" id="s-phase"></span>
        ${NAV_ITEMS.map(item =>
          `<button class="btn btn-ghost" id="btn-nav-${item.id}"${item.title ? ` title="${item.title}"` : ''}>${item.label}</button>`
        ).join('')}
        <button class="btn btn-primary" id="btn-next">Nächste Runde &#8594;</button>
      </div>
    </div>

    <div class="timeline-bar" id="timeline-bar"></div>

    <!-- AMPEL-ALARMSYSTEM: 3 kritischste Variablen -->
    <div class="alarm-section" id="alarm-section">
      <div class="alarm-card" id="alarm-0"></div>
      <div class="alarm-card" id="alarm-1"></div>
      <div class="alarm-card" id="alarm-2"></div>
    </div>

    <div class="main-grid">
      ${CATEGORIES.map(cat => `
        <div class="card">
          <div class="card-title cat-title" data-cat="${cat.id}">
            ${cat.label}<span class="cat-chevron">&#9660;</span>
          </div>
          <div class="var-list" id="vars-${cat.id}"></div>
        </div>
      `).join('')}

      <!-- Ereignisprotokoll — rechte Spalte, spannt 2 Zeilen -->
      <div class="card event-log-card" id="event-log-card">
        <div class="card-title">Ereignisprotokoll</div>
        <div id="event-log-list"></div>
      </div>

      <!-- Bundesrat-Zusammenfassung -->
      <div class="card br-summary-row span-full">
        <span class="br-summary-label">Bundesrat</span>
        <span id="br-summary-votes">— / 69</span>
        <span id="br-summary-status" class="br-summary-status">—</span>
        <button class="btn btn-ghost btn-sm" id="btn-open-bundesrat">Details &#8599;</button>
      </div>

      <div class="card span-full">
        <div class="card-title">Verlauf — letzte 8 Quartale</div>
        <div class="chart-wrap" id="chart-wrap"><canvas id="history-chart"></canvas></div>
      </div>

      <div id="gameover-banner" class="gameover-banner span-full" style="display:none"></div>
    </div>
  `;

  createChart(document.getElementById('history-chart'));

  document.getElementById('btn-next').addEventListener('click', onNextTurn);
  document.getElementById('coal-nav').addEventListener('click', () => showParliamentView());
  document.getElementById('btn-open-bundesrat')?.addEventListener('click', () => showBundesratView());

  NAV_ITEMS.forEach(item => {
    document.getElementById(`btn-nav-${item.id}`)?.addEventListener('click', () => {
      if (!item.condition || item.condition(game.state)) item.action();
    });
  });

  // Wire up collapse toggles for category cards
  CATEGORIES.forEach(cat => {
    const titleEl = document.querySelector(`.cat-title[data-cat="${cat.id}"]`);
    if (!titleEl) return;
    titleEl.addEventListener('click', () => {
      const list = document.getElementById(`vars-${cat.id}`);
      if (!list) return;
      if (collapsedCats.has(cat.id)) {
        collapsedCats.delete(cat.id);
        list.style.display = '';
        titleEl.querySelector('.cat-chevron').innerHTML = '&#9660;';
      } else {
        collapsedCats.add(cat.id);
        list.style.display = 'none';
        titleEl.querySelector('.cat-chevron').innerHTML = '&#9654;';
      }
    });
    // Apply persisted collapse state
    if (collapsedCats.has(cat.id)) {
      const list = document.getElementById(`vars-${cat.id}`);
      if (list) list.style.display = 'none';
      titleEl.querySelector('.cat-chevron').innerHTML = '&#9654;';
    }
  });
}

// ── DASHBOARD RENDER ─────────────────────────────────────────
function render(state) {
  document.getElementById('s-year').textContent       = `${state.year} / Q${state.quarter}`;
  document.getElementById('s-coalition').textContent  = state.government.coalition.join(' + ') || '—';
  document.getElementById('s-chancellor').textContent = state.government.chancellorParty || '—';

  const turns = state.turnsUntilElection;
  document.getElementById('s-election').textContent = turns > 0 ? `${turns} Quartale` : 'Wahl fällig!';

  const hqEl = document.getElementById('s-haushalt');
  if (hqEl) {
    const hq = quartersUntilHaushalt(state);
    hqEl.textContent = hq === 0 ? 'Jetzt!' : `in ${hq} Q`;
    hqEl.style.color = hq <= 2 ? 'var(--yellow)' : '';
  }

  const tlEl = document.getElementById('timeline-bar');
  if (tlEl) {
    const tl = getTimeline(state);
    tlEl.innerHTML = _buildTimelineHTML(tl);
  }

  const pill = document.getElementById('s-phase');
  pill.textContent = state.phase;
  pill.className = `phase-pill phase-${state.phase}`;

  document.getElementById('btn-next').disabled = state.phase !== 'governing';

  NAV_ITEMS.forEach(item => {
    const btn = document.getElementById(`btn-nav-${item.id}`);
    if (!btn) return;
    const active = !item.condition || item.condition(state);
    btn.disabled = !active;
    btn.title = active ? (item.title || item.label) : (item.disabledTitle || item.label);
  });

  // Previous snapshot for delta display
  const prevSnap = state.history.length >= 2 ? state.history[state.history.length - 2] : null;

  for (const cat of CATEGORIES) {
    const listEl = document.getElementById(`vars-${cat.id}`);
    if (!listEl) continue;
    listEl.innerHTML = cat.vars.map(v => {
      const raw = getVal(state, v.path);
      const pct = displayPct(v, raw);
      const cls = colorClass(pct);

      let deltaHtml = '';
      if (prevSnap) {
        const snapKey  = PATH_TO_SNAPSHOT[v.path];
        const prevVal  = snapKey !== undefined ? prevSnap[snapKey] : undefined;
        if (prevVal !== undefined) {
          const delta = raw - prevVal;
          if (Math.abs(delta) >= 0.05) {
            const isGood = v.higherIsBad ? (delta < 0) : (delta > 0);
            const arrow  = delta > 0 ? '&#8593;' : '&#8595;';
            const sign   = delta > 0 ? '+' : '';
            deltaHtml = `<span class="var-delta ${isGood ? 'delta-pos' : 'delta-neg'}">${arrow}${sign}${Math.abs(delta).toFixed(1)}</span>`;
          }
        }
      }

      return `
        <div class="var-row">
          <span class="var-label">${v.label}</span>
          <div class="bar-track"><div class="bar-fill ${cls}" style="width:${pct.toFixed(1)}%"></div></div>
          <span class="var-value ${cls}">${raw.toFixed(0)}</span>
          ${deltaHtml}
        </div>`;
    }).join('');
  }

  _renderAlarmCards(state);
  _renderEventLog(state);
  _renderBrSummary(state);

  updateChart(state);

  const goBanner = document.getElementById('gameover-banner');
  if (state.phase === 'gameover') {
    goBanner.style.display = 'block';
    goBanner.textContent = `Game Over — ${state.gameOverReason}`;
  } else {
    goBanner.style.display = 'none';
  }
}

// ── EVENT LOG HELPER ─────────────────────────────────────────
function _pushEventLog(entry) {
  if (!game.state.eventLog) game.state.eventLog = [];
  game.state.eventLog = [entry, ...game.state.eventLog].slice(0, 20);
}

// ── DASHBOARD SUB-RENDERERS ──────────────────────────────────

function _renderAlarmCards(state) {
  // Collect all 20 vars with deviation from optimal
  const allVars = [];
  for (const cat of CATEGORIES) {
    for (const v of cat.vars) {
      const raw = getVal(state, v.path);
      const dev = getDeviation(v.path, raw);
      const lvl = getAlarmLevel(v.path, raw);
      const t   = THRESHOLDS[v.path];
      allVars.push({ v, raw, dev, lvl, t });
    }
  }

  // 3 worst by signed deviation (most negative = worst)
  allVars.sort((a, b) => a.dev - b.dev);
  const worst = allVars.slice(0, 3);

  const LEVEL_ICON = { critical: '&#9940;', danger: '&#9888;', warn: '&#9888;', ok: '&#10003;' };
  const LEVEL_LABEL = { critical: 'KRITISCH', danger: 'GEFAHR', warn: 'WARNUNG', ok: 'OK' };

  worst.forEach((item, i) => {
    const el = document.getElementById(`alarm-${i}`);
    if (!el) return;
    const borderColor = item.lvl === 'critical' ? 'var(--red)'
      : item.lvl === 'danger' ? '#f97316'
      : item.lvl === 'warn'   ? 'var(--yellow)'
      : 'var(--border)';
    el.style.borderColor = borderColor;
    el.dataset.level = item.lvl;

    const barPct = Math.min(100, Math.max(0, item.raw)).toFixed(1);
    const optPct = item.t ? Math.min(100, Math.max(0, item.t.optimal)).toFixed(1) : '60';

    el.innerHTML = `
      <div class="alarm-header">
        <span class="alarm-icon">${LEVEL_ICON[item.lvl]}</span>
        <span class="alarm-label">${item.v.label}</span>
        <span class="alarm-badge alarm-badge--${item.lvl}">${LEVEL_LABEL[item.lvl]}</span>
      </div>
      <div class="alarm-value">${item.raw.toFixed(0)}</div>
      <div class="alarm-bar-track">
        <div class="alarm-bar-fill alarm-bar-fill--${item.lvl}" style="width:${barPct}%"></div>
        <div class="alarm-bar-optimal" style="left:${optPct}%" title="Ziel: ${item.t?.optimal ?? '—'}"></div>
      </div>
      <div class="alarm-dev">Ziel: ${item.t?.optimal ?? '—'} &nbsp;|&nbsp; Abw.: ${item.dev > 0 ? '+' : ''}${item.dev.toFixed(1)}</div>
    `;
  });
}

function _renderEventLog(state) {
  const el  = document.getElementById('event-log-list');
  if (!el) return;
  const log = state.eventLog ?? [];
  if (log.length === 0) {
    el.innerHTML = '<div class="elog-empty">Noch keine Ereignisse protokolliert.</div>';
    return;
  }

  const TYPE_CLS   = { decision: 'elog-badge--decision', scandal: 'elog-badge--scandal', delayed: 'elog-badge--delayed' };
  const TYPE_LABEL = { decision: 'Entscheidung', scandal: 'Skandal', delayed: 'Verzögerter Effekt' };

  el.innerHTML = log.slice(0, 8).map(entry => {
    const badgeCls   = TYPE_CLS[entry.type]   ?? 'elog-badge--decision';
    const badgeLabel = TYPE_LABEL[entry.type]  ?? 'Ereignis';
    const efxHtml = (entry.effects ?? []).length > 0
      ? `<div class="elog-effects">${entry.effects.map(e => `<span class="elog-effect-pill">${e}</span>`).join('')}</div>`
      : '';
    return `
      <div class="elog-entry">
        <div class="elog-meta">
          <span class="elog-badge ${badgeCls}">${badgeLabel}</span>
          <span class="elog-time">Q${entry.quarter} ${entry.year}</span>
        </div>
        <div class="elog-title">${entry.title}</div>
        ${entry.detail ? `<div class="elog-detail">${entry.detail}</div>` : ''}
        ${efxHtml}
      </div>
    `;
  }).join('');
}

function _renderBrSummary(state) {
  const bl       = state.extensions?.bundeslaender ?? {};
  const coalition = state.government?.coalition ?? [];
  let reg = 0, opp = 0;
  for (const data of Object.values(bl)) {
    const v = data.bundesratStimmen ?? 0;
    const p = data.regierungspartei;
    const aligned = p && (
      coalition.includes(p) ||
      (p === 'CSU' && coalition.includes('CDU')) ||
      (p === 'CDU' && coalition.includes('CSU'))
    );
    aligned ? (reg += v) : (opp += v);
  }
  const hasMaj = reg >= 35;
  const votesEl  = document.getElementById('br-summary-votes');
  const statusEl = document.getElementById('br-summary-status');
  if (votesEl)  votesEl.textContent  = `${reg} / 69 Koalitionsstimmen`;
  if (statusEl) {
    statusEl.innerHTML = hasMaj ? '&#x2713; Mehrheit' : '&#x26A0; Keine Mehrheit';
    statusEl.style.color = hasMaj ? 'var(--green)' : 'var(--red)';
  }
}

// ── BUNDESRAT-VIEW ────────────────────────────────────────────
function showBundesratView() {
  currentView = 'bundesrat';
  if (chart) { chart.destroy(); chart = null; }
  document.getElementById('app').innerHTML = buildBundesratScreenHTML(game.state);
  document.getElementById('br-back')?.addEventListener('click', () => {
    currentView = 'dashboard';
    buildShell();
    render(game.state);
  });
}

// ── NEXT TURN ACTION ─────────────────────────────────────────
function onNextTurn() {
  _campaignPending = false;

  game.nextTurn();
  drainResolvedToasts();

  // Wahl wurde getriggert → Wahlkampf-Screen zeigen
  if (_campaignPending) {
    showCampaignView();
    return;
  }

  // Haushaltsplanung → eigener Screen (hat keine choices[])
  const haushaltsEvent = game.state.activeEvents.find(e => e.type === 'haushalt');
  if (haushaltsEvent) {
    game.state.activeEvents = game.state.activeEvents.filter(e => e.type !== 'haushalt');
    showHaushaltsView(haushaltsEvent);
    return;
  }

  // Choice events → modal queue
  const choiceEvents = game.state.activeEvents.filter(e => e.choices?.length > 0);
  if (choiceEvents.length > 0) {
    game.state.activeEvents = game.state.activeEvents.filter(e => !e.choices?.length);
    eventQueue = [...choiceEvents];
    nextInQueue();
  } else {
    render(game.state);
  }
}

// ── WAHLKAMPF-VIEW ────────────────────────────────────────────
function showCampaignView() {
  currentView = 'campaign';
  if (chart) { chart.destroy(); chart = null; }

  // Neue Kampagne vorbereiten
  selectedCampaignEvents = pickRandomEvents(3);
  campaignBudget  = { wirtschaft: 20, soziales: 20, sicherheit: 20, klima: 20, migration: 20 };
  campaignChoices = {};

  const initialPoll = calculatePoll(game.state, campaignBudget, campaignChoices, selectedCampaignEvents);
  document.getElementById('app').innerHTML =
    buildCampaignHTML(game.state, selectedCampaignEvents, initialPoll);

  wireCampaignListeners();
}

// ── HAUSHALTS-VIEW ────────────────────────────────────────────
function showHaushaltsView(event) {
  currentView = 'haushalt';
  if (chart) { chart.destroy(); chart = null; }

  const bn        = computeBudgetNumbers(game.state);
  const prevAlloc = game.state.scheduling?.lastHaushaltAllocation ?? null;

  document.getElementById('app').innerHTML = buildHaushaltsHTML(game.state, bn, prevAlloc);

  const container = document.getElementById('app');

  initHaushaltsScreen(container, game.state, bn, prevAlloc, (result) => {
    if (!result) {
      // Abgebrochen → zurück zum Dashboard
      currentView = 'dashboard';
      buildShell();
      render(game.state);
      return;
    }

    // Effekte anwenden
    game.applyHaushaltsEffects(result.immediateEffects, result.delayedEffects);

    // Letzte Zuweisung für Vergleich speichern
    game.state.scheduling = {
      ...(game.state.scheduling || {}),
      lastHaushaltAllocation: result.allocation,
    };

    // Medien- und Koalitions-Ergebnis-Overlay zeigen
    result.bn = bn;
    const modalHtml = buildMediaResultHTML(result);
    const ov = openOverlay(modalHtml);

    ov.querySelector('#hb-result-continue')?.addEventListener('click', () => {
      closeOverlay();
      currentView = 'dashboard';
      buildShell();
      render(game.state);
    });
  });
}

// ── KABINETT-VIEW ─────────────────────────────────────────────
let _ministersCtrl = null;

function showMinistersView() {
  currentView = 'ministers';
  if (chart) { chart.destroy(); chart = null; }

  document.getElementById('app').innerHTML = buildMinistersHTML(game.state);
  const container = document.getElementById('app');

  _ministersCtrl = initMinistersScreen(container, game.state, (action) => {
    if (action.type === 'back') {
      _ministersCtrl = null;
      currentView = 'dashboard';
      buildShell();
      render(game.state);
      return;
    }

    if (action.type === 'fire-minister') {
      // Bestätigungsdialog als Overlay
      const ov = openOverlay(`
        <div class="confirm-modal">
          <div class="confirm-title">Minister entlassen</div>
          <div class="confirm-text">${action.confirmText.replace(/\n/g, '<br>')}</div>
          <div class="confirm-actions">
            <button class="btn btn-ghost" id="confirm-cancel">Abbrechen</button>
            <button class="btn btn-danger" id="confirm-ok">Entlassen</button>
          </div>
        </div>`);

      ov.querySelector('#confirm-cancel').addEventListener('click', () => closeOverlay());
      ov.querySelector('#confirm-ok').addEventListener('click', () => {
        closeOverlay();
        // Feuern: Koalitionsstabilität sinkt, Nachfolger wird generiert
        game.removeFromMinistry(action.ministryName);
        // Detail-Panel aktualisieren
        if (_ministersCtrl) _ministersCtrl.refresh(game.state);
      });
    }
  });
}

// ── GESETZGEBUNGS-VIEW ────────────────────────────────────────
function showLegislationView() {
  currentView = 'legislation';
  if (chart) { chart.destroy(); chart = null; }

  document.getElementById('app').innerHTML = buildLegislationHTML(game.state);
  const container = document.getElementById('app');

  initLegislationScreen(
    container,
    game.state,

    // openOverlay(htmlString) → gibt das inner-Modal-Element zurück
    (html) => {
      let ov = document.getElementById('overlay');
      if (!ov) {
        ov = document.createElement('div');
        ov.id = 'overlay';
        ov.className = 'overlay';
        document.body.appendChild(ov);
      }
      ov.innerHTML = `<div class="modal leg-modal">${html}</div>`;
      ov.style.display = 'flex';
      return ov.querySelector('.leg-modal');
    },

    // closeOverlay()
    () => {
      const ov = document.getElementById('overlay');
      if (ov) ov.style.display = 'none';
    },

    // onResult(result)
    (result) => {
      const closeOv = () => {
        const ov = document.getElementById('overlay');
        if (ov) ov.style.display = 'none';
      };

      if (result.action === 'cancel' || result.action === 'withdraw') {
        closeOv();
        currentView = 'dashboard';
        buildShell();
        render(game.state);
        return;
      }

      if (result.action === 'enacted') {
        const effMult = result.isCompromise ? 0.6 : 1.0;
        game.enactLaw(
          result.law,
          result.law.immediateEffects,
          result.law.delayedEffects,
          effMult
        );
        // Koalitionsaustritte verarbeiten
        for (const party of (result.coalitionExits || [])) {
          game.removeFromCoalition(party);
        }
      } else if (result.action === 'failed') {
        game.recordLawFailed(result.law, result.failReason ?? 'Abstimmung verloren');
      }

      closeOv();
      currentView = 'dashboard';
      buildShell();
      render(game.state);
    }
  );
}

function wireCampaignListeners() {
  // Budget-Schieberegler
  document.querySelectorAll('.camp-slider').forEach(slider => {
    slider.addEventListener('input', () => {
      campaignBudget[slider.dataset.topic] = parseInt(slider.value, 10);
      document.getElementById(`val-${slider.dataset.topic}`).textContent = slider.value;
      updateBudgetTotal();
      updateCampaignPoll();
    });
  });

  // Ereignis-Optionen
  document.querySelectorAll('.camp-radio').forEach(radio => {
    radio.addEventListener('change', () => {
      const eventId = radio.name.replace('event-', '');
      campaignChoices[eventId] = radio.value;
      // Ausgewählte Option visuell markieren
      document.querySelectorAll(`[data-event="${eventId}"]`).forEach(el => {
        el.classList.remove('camp-opt-selected');
      });
      radio.closest('.camp-opt').classList.add('camp-opt-selected');
      updateCampaignPoll();
    });
  });

  // Zur Wahl
  document.getElementById('btn-to-election').addEventListener('click', () => {
    const total = Object.values(campaignBudget).reduce((a, b) => a + b, 0);
    if (total > 100) return; // Button wäre disabled

    const prevSeats = { ...game.state.parliament.seats };

    // Kampagneneffekte auf den Spielzustand anwenden
    applyCampaignToState(game.state, campaignBudget, campaignChoices, selectedCampaignEvents);

    // Echte Wahl durchführen
    _runElection();

    showElectionResultView(prevSeats);
  });
}

function updateBudgetTotal() {
  const total = Object.values(campaignBudget).reduce((a, b) => a + b, 0);
  const el = document.getElementById('camp-total-display');
  if (!el) return;
  el.textContent = `${total} / 100`;
  el.className = total > 100 ? 'camp-total-over' : 'camp-total-ok';
  const btn = document.getElementById('btn-to-election');
  if (btn) btn.disabled = total > 100;
}

function updateCampaignPoll() {
  const poll = calculatePoll(game.state, campaignBudget, campaignChoices, selectedCampaignEvents);
  const coalition = game.state.government?.coalition || [];
  const el = document.getElementById('camp-poll-bars');
  if (el) el.innerHTML = renderPollBars(poll, coalition);
}

// ── WAHLERGEBNIS-VIEW ─────────────────────────────────────────
function showElectionResultView(prevSeats) {
  currentView = 'election';

  const electionResult = game.electionResult;
  const coalitions     = findPossibleCoalitions(
    game.state.parliament.seats,
    electionResult.majorityNeeded
  );

  document.getElementById('app').innerHTML =
    buildElectionResultHTML(electionResult, prevSeats, coalitions);

  // Koalitionsverhandlungs-Buttons → Verhandlungs-Screen starten
  document.querySelectorAll('.elec-coal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parties = btn.dataset.parties.split(',');
      showCoalitionNegScreen(parties);
    });
  });
}

// ── KOALITIONSVERHANDLUNGS-SCREEN ─────────────────────────────

let coalNeg = null;

function showCoalitionNegScreen(suggestedParties) {
  currentView = 'coalition-neg';
  if (chart) { chart.destroy(); chart = null; }

  coalNeg = {
    suggestedParties,
    selectedParties: [game.playerParty, ...suggestedParties.filter(p => p !== game.playerParty)],
    playerPositions: {},
    ministryAssignments: {},
    entitlements: {},
    policyResults: {},
  };
  for (const area of POLICY_AREAS) {
    coalNeg.playerPositions[area.key] =
      PARTY_POSITIONS[game.playerParty]?.positions[area.key] ?? 50;
  }
  renderCoalPhase1();
}

function renderCoalPhase1() {
  document.getElementById('app').innerHTML =
    buildSondierungHTML(game.electionResult, game.playerParty, coalNeg.suggestedParties);
  wireCoalPhase1();
}

function wireCoalPhase1() {
  const seats = game.electionResult.seats;
  const majorityNeeded = game.electionResult.majorityNeeded;

  const refresh = () => {
    const checkedParties = Array.from(document.querySelectorAll('.sond-check:checked'))
      .map(cb => cb.dataset.party);
    const coalition = [game.playerParty, ...checkedParties];
    const total = coalition.reduce((s, p) => s + (seats[p] || 0), 0);

    const seatsEl   = document.getElementById('sond-total-seats');
    const fillEl    = document.getElementById('sond-maj-fill');
    const verdictEl = document.getElementById('sond-majority-verdict');
    const btn       = document.getElementById('btn-to-phase2');
    const hint      = document.getElementById('sond-hint');

    if (seatsEl) seatsEl.textContent = total;
    if (fillEl)  fillEl.style.width  = `${Math.min(100, total / 630 * 100).toFixed(1)}%`;

    const hasMaj = total >= majorityNeeded;
    if (verdictEl) verdictEl.innerHTML = hasMaj
      ? '<span class="coal-verdict-yes">&#10003; Mehrheit erreicht</span>'
      : `<span class="coal-verdict-no">&#10007; ${majorityNeeded - total} Sitze fehlen</span>`;
    if (btn)  btn.disabled = !hasMaj || checkedParties.length === 0;
    if (hint) hint.textContent = hasMaj
      ? `${coalition.join(' + ')} — ${total} Sitze`
      : `Noch ${majorityNeeded - total} Sitze bis zur Mehrheit.`;

    coalNeg.selectedParties = coalition;
  };

  document.querySelectorAll('.sond-check').forEach(cb => cb.addEventListener('change', refresh));
  refresh();
  document.getElementById('btn-to-phase2')?.addEventListener('click', () => {
    startRoundBasedNeg(coalNeg.selectedParties, game.electionResult.seats);
  });
}

function renderCoalPhase2() {
  document.getElementById('app').innerHTML =
    buildVerhandlungHTML(coalNeg.selectedParties, coalNeg.playerPositions, game.playerParty);
  wireCoalPhase2();
}

function wireCoalPhase2() {
  document.querySelectorAll('.coal-slider').forEach(slider => {
    slider.addEventListener('input', () => {
      const area = slider.dataset.area;
      const val  = parseInt(slider.value, 10);
      coalNeg.playerPositions[area] = val;
      const valEl = document.getElementById(`val-${area}`);
      if (valEl) valEl.textContent = val;
      updatePolicyRowUI(area);
      const overallEl = document.getElementById('coal-overall-status');
      if (overallEl) overallEl.innerHTML =
        buildOverallStatusHTML(coalNeg.selectedParties, coalNeg.playerPositions, game.playerParty);
    });
  });

  document.getElementById('btn-to-phase3')?.addEventListener('click', () => {
    const result = distributeMinistries(coalNeg.selectedParties, game.electionResult.seats);
    coalNeg.ministryAssignments = { ...result.assignments };
    coalNeg.entitlements = { ...result.entitlements };
    renderCoalPhase3();
  });
}

function updatePolicyRowUI(areaKey) {
  const row = document.querySelector(`.coal-policy-row[data-area="${areaKey}"]`);
  if (!row) return;

  const coalition = coalNeg.selectedParties;
  const values = coalition.map(p =>
    p === game.playerParty
      ? (coalNeg.playerPositions[areaKey] ?? 50)
      : (PARTY_POSITIONS[p]?.positions[areaKey] ?? 50)
  );
  const mean   = values.reduce((a, b) => a + b, 0) / values.length;
  const minVal = Math.min(...values);
  const spread = Math.max(...values) - minVal;
  const playerVal = coalNeg.playerPositions[areaKey] ?? 50;

  const pm = document.getElementById(`pm-${areaKey}`);
  if (pm) pm.style.left = `${playerVal.toFixed(1)}%`;
  const zone = row.querySelector('.coal-compromise-zone');
  if (zone) { zone.style.left = `${minVal.toFixed(1)}%`; zone.style.width = `${spread.toFixed(1)}%`; }
  const meanM = row.querySelector('.coal-mean-marker');
  if (meanM) meanM.style.left = `${mean.toFixed(1)}%`;

  const violations = getRedLineViolations(areaKey, mean, coalition);
  let status = 'green', statusLabel = 'Einigung möglich';
  if (violations.length > 0)  { status = 'red';    statusLabel = `Rote Linie: ${violations.map(v => v.party).join(', ')}`; }
  else if (spread > 40)       { status = 'red';    statusLabel = 'Positionen zu weit auseinander'; }
  else if (spread > 20)       { status = 'yellow'; statusLabel = 'Schwieriger Kompromiss'; }

  row.dataset.status = status;
  const lightEl = row.querySelector('.coal-status-light');
  if (lightEl) {
    lightEl.className = `coal-status-light coal-status-${status}`;
    const lbl = lightEl.querySelector('.coal-status-label');
    if (lbl) lbl.textContent = statusLabel;
  }

  let warn = row.querySelector('.coal-redline-warning');
  if (violations.length > 0) {
    const txt = `⚠ ${violations.map(v => `${v.party}: ${v.redLine}`).join(' · ')}`;
    if (warn) { warn.textContent = txt; }
    else { warn = document.createElement('div'); warn.className = 'coal-redline-warning'; warn.textContent = txt; row.appendChild(warn); }
  } else if (warn) {
    warn.remove();
  }
}

function renderCoalPhase3() {
  document.getElementById('app').innerHTML =
    buildMinisterienHTML(
      coalNeg.selectedParties, game.electionResult.seats,
      coalNeg.ministryAssignments, coalNeg.entitlements, game.playerParty
    );
  wireCoalPhase3();
}

function wireCoalPhase3() {
  document.querySelectorAll('.coal-ministry-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const minName  = sel.dataset.ministry;
      const newParty = sel.value;
      coalNeg.ministryAssignments[minName] = newParty;
      const dot = sel.closest('.coal-ministry-assign')?.querySelector('.coal-ministry-dot');
      if (dot) dot.style.background = PARTY_POSITIONS[newParty]?.color || '#888';
      const counts = {};
      for (const p of coalNeg.selectedParties) counts[p] = 0;
      for (const party of Object.values(coalNeg.ministryAssignments)) {
        if (counts[party] !== undefined) counts[party]++;
      }
      document.querySelectorAll('.coal-ent-count[data-party]').forEach(el => {
        const p = el.dataset.party;
        const c = counts[p] || 0, e = coalNeg.entitlements[p] || 0;
        el.textContent = `${c}/${e}`;
        el.className = `coal-ent-count${c !== e ? ' coal-ent-warn' : ''}`;
      });
    });
  });

  document.getElementById('btn-to-phase4')?.addEventListener('click', () => {
    coalNeg.policyResults = computeNegotiationResults(
      coalNeg.selectedParties, coalNeg.playerPositions, game.playerParty
    );
    renderCoalPhase4();
  });
}

function renderCoalPhase4() {
  document.getElementById('app').innerHTML =
    buildVertragHTML(
      coalNeg.selectedParties, coalNeg.playerPositions, game.playerParty,
      coalNeg.policyResults, coalNeg.ministryAssignments, coalNeg.entitlements
    );
  wireCoalPhase4();
}

function wireCoalPhase4() {
  document.getElementById('btn-back-to-phase2')?.addEventListener('click', renderCoalPhase2);

  document.getElementById('btn-sign-contract')?.addEventListener('click', () => {
    game.startCoalitionNegotiation(coalNeg.selectedParties, coalNeg.playerPositions);
    if (game.state.phase === 'governing') {
      game.state.government.ministries = coalNeg.ministryAssignments;
      const seats = game.electionResult.seats;
      game.state.government.chancellorParty = coalNeg.selectedParties.reduce((a, b) =>
        (seats[a] || 0) >= (seats[b] || 0) ? a : b
      );
      coalNeg = null;
      currentView = 'dashboard';
      buildShell();
      render(game.state);
    }
  });
}

// ── RUNDENBASIERTE KOALITIONSVERHANDLUNG ──────────────────────

let negEngine = null;

function startRoundBasedNeg(coalition, seats) {
  negEngine = createNegotiationState(coalition, game.playerParty, seats);
  renderCNScreen();
}

function renderCNScreen() {
  document.getElementById('app').innerHTML = buildCoalNegScreen(negEngine);
  wireCNScreen();
}


// Full re-render helper (used after overlays are dismissed)
function cnRerender() {
  renderCNScreen();
}

function wireCNScreen() {
  // ── Header buttons ──
  document.getElementById('btn-cn-end-round')?.addEventListener('click', () => {
    const results = endRound(negEngine);
    showCNOverlay(buildRoundEndOverlay(results, negEngine));
    document.getElementById('btn-round-continue')?.addEventListener('click', () => {
      closeCNOverlay();
      if (negEngine.status === 'failed-neuwahl') {
        showCNOverlay(buildFailedOverlay(negEngine));
        wireCNFailedOverlay();
      } else {
        // Check pending member votes
        const pendingVotes = negEngine.coalition
          .filter(p => p !== negEngine.playerParty && negEngine.partyStates[p]?.memberVotePending);
        if (pendingVotes.length > 0) {
          showMemberVoteFlow(pendingVotes, 0);
        } else {
          cnRerender();
        }
      }
    });
  });

  document.getElementById('btn-cn-sign')?.addEventListener('click', () => {
    showCNOverlay(buildContractSummaryOverlay(negEngine));
    document.getElementById('btn-contract-sign')?.addEventListener('click', () => {
      closeCNOverlay();
      showCNOverlay(buildKoalitionsausschussOverlay());
      wireAusschussOverlay();
    });
  });

  // ── Leak alert button (in right panel) ──
  document.getElementById('btn-show-leak')?.addEventListener('click', () => {
    showCNOverlay(buildLeakOverlay(negEngine));
    document.querySelectorAll('.cn-overlay-choice[data-reaction]').forEach(btn => {
      btn.addEventListener('click', () => {
        reactToLeak(negEngine, btn.dataset.reaction);
        closeCNOverlay();
        cnRerender();
      });
    });
  });

  // ── AG card click ──
  document.querySelectorAll('.cn-ag-card--active[data-ag]').forEach(card => {
    card.addEventListener('click', () => {
      openAGDetail(negEngine, card.dataset.ag);
      cnRerender();
    });
  });

  // ── Action bar buttons ──
  document.getElementById('btn-open-package')?.addEventListener('click', () => {
    openPackageBuilder(negEngine);
    cnRerender();
  });
  document.getElementById('btn-open-ministry')?.addEventListener('click', () => {
    openMinistryOffers(negEngine);
    cnRerender();
  });

  // ── Back buttons ──
  document.getElementById('btn-back-to-ag')?.addEventListener('click', () => {
    negEngine.view = 'ag-select';
    negEngine.viewData = {};
    cnRerender();
  });

  // ── Topic detail: topic card selection ──
  document.querySelectorAll('.cn-topic-card:not(.cn-topic-card--resolved)[data-topic]').forEach(tc => {
    tc.addEventListener('click', (e) => {
      if (e.target.closest('.cn-topic-body')) return; // Don't re-select when clicking controls inside
      selectTopicInDetail(negEngine, tc.dataset.topic);
      cnRerender();
    });
  });

  // ── Topic slider ──
  document.querySelectorAll('.cn-slider[data-topic]').forEach(slider => {
    slider.addEventListener('input', () => {
      const val = parseInt(slider.value, 10);
      negEngine.viewData.playerValue = val;
      // Update display without full re-render
      const valEl = document.getElementById(`slval-${slider.dataset.topic}`);
      if (valEl) valEl.textContent = val;
      const labelEl = document.getElementById(`player-val-label-${slider.dataset.topic}`);
      if (labelEl) labelEl.textContent = val;
      const dotEl = document.getElementById(`pdot-${slider.dataset.topic}`);
      if (dotEl) dotEl.style.left = `${val}%`;
      // Update reaction preview
      const previewEl = document.getElementById(`reaction-preview-${slider.dataset.topic}`);
      if (previewEl) {
        const ag = negEngine.viewData.agId;
        const topic = slider.dataset.topic;
        const fmt = negEngine.viewData.formulation;
        previewEl.innerHTML = buildInlineReactionPreview(negEngine, ag, topic, val, fmt);
      }
    });
  });

  // ── Topic formulation radio ──
  document.querySelectorAll('.cn-fmt-radio[data-topic]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      negEngine.viewData.formulation = radio.value;
      document.querySelectorAll(`.cn-fmt-opt`).forEach(o => o.classList.remove('cn-fmt-opt--selected'));
      radio.closest('.cn-fmt-opt')?.classList.add('cn-fmt-opt--selected');
      // Update reaction preview
      const previewEl = document.getElementById(`reaction-preview-${radio.dataset.topic}`);
      if (previewEl) {
        const ag = negEngine.viewData.agId;
        const topic = radio.dataset.topic;
        const val = negEngine.viewData.playerValue;
        previewEl.innerHTML = buildInlineReactionPreview(negEngine, ag, topic, val, radio.value);
      }
    });
  });

  // ── Confirm topic (spend AP) ──
  document.getElementById('btn-confirm-topic')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const { agId, topicId, playerValue, formulation } = negEngine.viewData;
    const result = resolveTopic(negEngine, agId, topicId, playerValue || 50, formulation || 'aspiring');
    if (result.error) { alert(result.error); return; }
    showCNOverlay(buildTopicResultOverlay(result));
    document.getElementById('btn-result-continue')?.addEventListener('click', () => {
      closeCNOverlay();
      // Check for member vote events
      if (result.interrupts?.some(i => i.type === 'member-vote')) {
        const voteParties = result.interrupts.filter(i => i.type === 'member-vote').map(i => i.party);
        showMemberVoteFlow(voteParties, 0);
      } else {
        cnRerender();
      }
    });
  });

  // ── Package builder: drag & drop ──
  wireDragAndDrop();

  // ── Package item sliders ──
  document.querySelectorAll('.cn-pkg-slider[data-ag][data-topic]').forEach(slider => {
    slider.addEventListener('input', () => {
      const { ag, topic } = slider.dataset;
      const val = parseInt(slider.value, 10);
      const item = negEngine.packageItems.find(i => i.agId === ag && i.topicId === topic);
      if (item) {
        item.value = val;
        const valEl = slider.closest('.cn-pkg-item')?.querySelector('.cn-pkg-val');
        if (valEl) valEl.textContent = val;
        refreshPackageReactions();
      }
    });
  });

  // ── Package item formulation buttons ──
  document.querySelectorAll('.cn-pkg-fmt-btn[data-ag][data-topic][data-fmt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { ag, topic, fmt } = btn.dataset;
      const item = negEngine.packageItems.find(i => i.agId === ag && i.topicId === topic);
      if (!item) return;
      item.formulation = fmt;
      // Update visual state for all buttons in this topic group
      document.querySelectorAll(`.cn-pkg-fmt-btn[data-ag="${ag}"][data-topic="${topic}"]`).forEach(b => {
        b.classList.toggle('cn-pkg-fmt-btn--on', b.dataset.fmt === fmt);
      });
      refreshPackageReactions();
    });
  });

  // ── Package item remove (topic) ──
  document.querySelectorAll('.cn-pkg-item-remove[data-ag][data-topic]').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromPackage(negEngine, btn.dataset.ag, btn.dataset.topic);
      cnRerender();
    });
  });

  // ── Ministry party selector ──
  document.querySelectorAll('.cn-pkg-min-party-sel[data-ministry]').forEach(sel => {
    sel.addEventListener('change', () => {
      updateMinistryInPackage(negEngine, sel.dataset.ministry, sel.value);
      // Re-render so the "Wunschministerium" badge and reactions both update
      cnRerender();
    });
  });

  // ── Ministry remove ──
  document.querySelectorAll('.cn-pkg-item-remove--ministry[data-ministry]').forEach(btn => {
    btn.addEventListener('click', () => {
      removeMinistryFromPackage(negEngine, btn.dataset.ministry);
      cnRerender();
    });
  });

  // ── Send package ──
  document.getElementById('btn-send-package')?.addEventListener('click', () => {
    const result = sendPackage(negEngine);
    if (result.error) { alert(result.error); return; }
    showCNOverlay(buildPackageResultOverlay(result, negEngine));
    document.getElementById('btn-result-continue')?.addEventListener('click', () => {
      closeCNOverlay();
      if (result.success && result.interrupts?.some(i => i.type === 'member-vote')) {
        const voteParties = result.interrupts.filter(i => i.type === 'member-vote').map(i => i.party);
        showMemberVoteFlow(voteParties, 0);
      } else {
        cnRerender();
      }
    });
  });

  // ── Clear package ──
  document.getElementById('btn-clear-package')?.addEventListener('click', () => {
    negEngine.packageItems = [];
    cnRerender();
  });

  // ── Ministry offers ──
  document.querySelectorAll('.cn-min-offer-btn[data-ministry]').forEach(btn => {
    btn.addEventListener('click', () => {
      const select = document.querySelector(`.cn-min-select[data-ministry="${btn.dataset.ministry}"]`);
      const toParty = select?.value;
      if (!toParty) { alert('Bitte eine Partei auswählen.'); return; }
      const result = offerMinistry(negEngine, btn.dataset.ministry, toParty);
      if (result.error) { alert(result.error); return; }
      showCNOverlay(buildMinistryResultOverlay(btn.dataset.ministry, toParty, result));
      document.getElementById('btn-result-continue')?.addEventListener('click', () => {
        closeCNOverlay();
        if (result.accepts && result.interrupts?.some(i => i.type === 'member-vote')) {
          const voteParties = result.interrupts.filter(i => i.type === 'member-vote').map(i => i.party);
          showMemberVoteFlow(voteParties, 0);
        } else {
          cnRerender();
        }
      });
    });
  });
}

// ── CN DRAG & DROP ────────────────────────────────────────────

function wireDragAndDrop() {
  const dropArea = document.getElementById('cn-pkg-drop');
  if (!dropArea) return;

  // Topic chips
  document.querySelectorAll('.cn-pkg-topic-chip[data-ag][data-topic]:not(.cn-pkg-topic-chip--in-pkg)').forEach(chip => {
    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'topic', agId: chip.dataset.ag, topicId: chip.dataset.topic }));
      chip.classList.add('cn-chip-dragging');
    });
    chip.addEventListener('dragend', () => chip.classList.remove('cn-chip-dragging'));
  });

  // Ministry chips
  document.querySelectorAll('.cn-pkg-ministry-chip[data-ministry]:not(.cn-pkg-topic-chip--in-pkg)').forEach(chip => {
    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'ministry', ministry: chip.dataset.ministry }));
      chip.classList.add('cn-chip-dragging');
    });
    chip.addEventListener('dragend', () => chip.classList.remove('cn-chip-dragging'));
  });

  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('cn-drop-active');
  });
  dropArea.addEventListener('dragleave', () => dropArea.classList.remove('cn-drop-active'));
  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('cn-drop-active');
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'ministry') {
        addMinistryToPackage(negEngine, data.ministry);
      } else {
        const ag = getAGData(data.agId);
        const topic = ag?.subTopics.find(t => t.id === data.topicId);
        if (!topic) return;
        addToPackage(negEngine, data.agId, data.topicId, topic.partyPositions[negEngine.playerParty] ?? 50, 'aspiring');
      }
      cnRerender();
    } catch {}
  });
}

function refreshPackageReactions() {
  const reactions = evaluatePackage(negEngine);
  const reactionsContainer = document.querySelector('.cn-pkg-reactions');
  if (!reactionsContainer) return;
  const partyCells = reactionsContainer.querySelectorAll('.cn-pkg-react-row');
  Object.entries(reactions).forEach(([party, r], i) => {
    const row = partyCells[i];
    if (!row) return;
    const cls = r.accepts === true ? 'cn-pkg-react-yes' : r.accepts === false ? 'cn-pkg-react-no' : 'cn-pkg-react-unk';
    const icon = r.accepts === true ? '✓' : r.accepts === false ? '✗' : '?';
    row.className = `cn-pkg-react-row ${cls}`;
    const iconEl = row.querySelector('.cn-pkg-react-icon');
    if (iconEl) iconEl.textContent = icon;
    const reasonEl = row.querySelector('.cn-pkg-react-reason');
    if (reasonEl) reasonEl.textContent = r.reason;
  });
}

// Inline reaction preview builder (avoids circular import at module load time)
function buildInlineReactionPreview(state, agId, topicId, value, formulation) {
  const ag = getAGData(agId);
  const topic = ag?.subTopics.find(t => t.id === topicId);
  if (!topic) return '';

  return `
    <div class="cn-reaction-title">Erwartete Reaktionen:</div>
    ${state.coalition.filter(p => p !== state.playerParty).map(p => {
      const pData = PARTY_POSITIONS[p];
      const leader = state.partyStates[p]?.leader;
      const partyIdeal = topic.partyPositions[p] ?? 50;
      const distance = Math.abs(partyIdeal - value);
      let icon = '✓', cls = 'cn-react-ok', text = 'Akzeptiert';
      if (formulation === 'examining' && leader?.personality === 'Hardliner') {
        icon = '✗'; cls = 'cn-react-no'; text = 'Ablehnung — Formulierung zu unverbindlich';
      } else if (distance > 40) {
        icon = '✗'; cls = 'cn-react-no'; text = `Ablehnung — Differenz zu groß (${Math.round(distance)}P)`;
      } else if (distance > 20) {
        icon = '⚠'; cls = 'cn-react-warn'; text = 'Schluckt Kröte';
      }
      return `
        <div class="cn-reaction-row ${cls}">
          <span class="cn-react-dot" style="background:${pData?.color}"></span>
          <span class="cn-react-name">${pData?.fullName || p}</span>
          <span class="cn-react-icon">${icon}</span>
          <span class="cn-react-text">${text}</span>
        </div>
      `;
    }).join('')}
  `;
}

// ── CN MEMBER VOTE FLOW ───────────────────────────────────────

function showMemberVoteFlow(parties, idx) {
  if (idx >= parties.length) { cnRerender(); return; }
  const party = parties[idx];
  const result = resolveMemberVote(negEngine, party);
  showCNOverlay(buildMemberVoteOverlay(party, result.rejected, negEngine));
  document.getElementById('btn-vote-continue')?.addEventListener('click', () => {
    closeCNOverlay();
    showMemberVoteFlow(parties, idx + 1);
  });
}

// ── CN AUSSCHUSS OVERLAY ─────────────────────────────────────

function wireAusschussOverlay() {
  document.querySelectorAll('.cn-ausschuss-opt[data-rep]').forEach(btn => {
    btn.addEventListener('click', () => {
      setAusschussRep(negEngine, btn.dataset.rep);
      closeCNOverlay();
      showCoalitionContractScreen();
    });
  });
}

function showCoalitionContractScreen() {
  const seats = game.electionResult?.seats ?? {};
  document.getElementById('app').innerHTML = buildCoalitionContractScreen(negEngine, seats, game.state?.year);
  document.getElementById('btn-start-government').addEventListener('click', () => {
    finalizeGovernmentFromEngine();
  });
}

function finalizeGovernmentFromEngine() {
  const rating = getContractRating(negEngine);
  const policyChoices = buildPolicyChoicesFromEngine(negEngine);
  game.startCoalitionNegotiation(negEngine.coalition, policyChoices);

  if (game.state.phase === 'governing') {
    // Apply ministry assignments
    const assigned = {};
    for (const [m, p] of Object.entries(negEngine.ministries)) {
      if (p) assigned[m] = p;
    }
    if (Object.keys(assigned).length > 0) game.state.government.ministries = assigned;

    // Apply press rating effects to starting state
    const approval = game.state.government?.approvalRating ?? game.state.politics?.approvalRating;
    if (approval !== undefined) {
      if (game.state.government?.approvalRating !== undefined)
        game.state.government.approvalRating = Math.max(0, Math.min(100, approval + rating.approvalDelta));
      else if (game.state.politics?.approvalRating !== undefined)
        game.state.politics.approvalRating = Math.max(0, Math.min(100, approval + rating.approvalDelta));
    }
    if (game.state.politics?.coalitionStability !== undefined) {
      game.state.politics.coalitionStability = Math.max(0, Math.min(100,
        game.state.politics.coalitionStability + rating.stabilityDelta
      ));
    }
  }

  negEngine = null;
  coalNeg = null;
  currentView = 'dashboard';
  buildShell();
  render(game.state);
}

// ── CN FAILED OVERLAY ────────────────────────────────────────

function wireCNFailedOverlay() {
  document.getElementById('btn-neuwahl')?.addEventListener('click', () => {
    closeCNOverlay();
    negEngine = null;
    coalNeg = null;
    showElectionResultView({});
  });
  document.getElementById('btn-minority-gov')?.addEventListener('click', () => {
    closeCNOverlay();
    const policyChoices = buildPolicyChoicesFromEngine(negEngine);
    game.startCoalitionNegotiation(negEngine.coalition, policyChoices);
    negEngine = null;
    coalNeg = null;
    currentView = 'dashboard';
    buildShell();
    render(game.state);
  });
}

// Build a policy choices map from engine resolved topics
function buildPolicyChoicesFromEngine(state) {
  const choices = {};
  for (const ag of Object.values(state.ags)) {
    for (const [topicId, resolved] of Object.entries(ag.topics)) {
      if (resolved) choices[topicId] = resolved.value;
    }
  }
  return choices;
}

// ── CN OVERLAY HELPERS ────────────────────────────────────────

let _cnOverlayEl = null;

function showCNOverlay(html) {
  let el = document.getElementById('cn-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'cn-overlay';
    document.getElementById('app').appendChild(el);
  }
  el.innerHTML = html;
  el.style.display = 'block';
  _cnOverlayEl = el;
}

function closeCNOverlay() {
  const el = document.getElementById('cn-overlay');
  if (el) { el.innerHTML = ''; el.style.display = 'none'; }
}

// ── BOOT ─────────────────────────────────────────────────────
buildShell();
render(game.state);
