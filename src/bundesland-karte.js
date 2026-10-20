// ============================================================
// BUNDESLAND-KARTE.JS — Interaktive Deutschland-Karte
//
// Rendert eine farbige SVG-Karte mit allen 16 Bundesländern
// als statische Polygon-Pfade (kein externer Fetch).
// Einfärbung nach Regierungspartei aus state.extensions.bundeslaender.
// ============================================================

import { PARTY_POSITIONS } from './engine/state.js';

const SVG_W = 380;
const SVG_H = 480;

// Vereinfachte Polygon-Pfade für alle 16 Bundesländer
// Koordinatensystem: 380×480, Norden oben, Westen links
const BUNDESLAND_PATHS = {
  schleswigholstein:     'M68,12 L148,12 L190,40 L200,92 L172,110 L138,112 L98,112 L72,88 L55,42 Z',
  hamburg:               'M140,112 L175,112 L175,128 L140,128 Z',
  mecklenburgvorpommern: 'M190,40 L252,12 L322,22 L342,65 L330,112 L250,130 L218,132 L200,115 L200,92 Z',
  niedersachsen:         'M55,88 L72,88 L98,112 L138,112 L140,112 L140,128 L175,128 L175,112 L200,115 L218,132 L215,240 L188,248 L132,248 L102,212 L78,200 L40,200 L26,158 L26,118 L42,100 Z',
  bremen:                'M92,195 L118,195 L118,215 L92,215 Z',
  nordrheinwestfalen:    'M26,120 L42,100 L40,200 L78,200 L102,212 L112,252 L98,312 L78,326 L50,318 L24,285 L22,242 L22,195 Z',
  sachsenanhalt:         'M218,132 L285,135 L292,255 L262,262 L215,258 L205,242 L215,240 Z',
  brandenburg:           'M250,130 L330,112 L342,120 L348,268 L292,272 L262,262 L292,255 L285,135 L250,132 Z',
  berlin:                'M285,172 L312,172 L312,198 L285,198 Z',
  hessen:                'M112,252 L135,248 L188,248 L215,258 L215,320 L192,338 L158,342 L128,338 L105,312 Z',
  thueringen:            'M215,258 L262,262 L270,320 L245,338 L215,340 L192,338 L215,320 Z',
  sachsen:               'M262,262 L292,272 L348,268 L348,328 L312,342 L270,320 Z',
  rheinlandpfalz:        'M24,242 L50,318 L78,326 L98,312 L105,312 L128,338 L115,380 L88,395 L52,385 L28,355 L22,312 L22,242 Z',
  saarland:              'M52,385 L88,395 L90,418 L62,425 L48,412 Z',
  badenwuerttemberg:     'M105,312 L128,338 L158,342 L192,338 L215,340 L218,425 L195,460 L145,468 L95,445 L68,418 L62,425 L90,418 L88,395 L115,380 Z',
  bayern:                'M215,340 L245,338 L270,320 L312,342 L348,328 L358,368 L345,435 L318,465 L268,468 L218,460 L195,460 L218,425 Z',
};

// Colors for regional/smaller parties not in PARTY_POSITIONS
const EXTRA_COLORS = {
  CSU:  '#2d2d6e',
  FW:   '#d97706',
  Volt: '#502379',
  SSW:  '#003082',
};

// ── PUBLIC API ────────────────────────────────────────────────

export function buildBundeslandKarteHTML() {
  return `
    <div class="bk-root card span-full">
      <div class="card-title">Bundesländer — Politische Karte</div>
      <div class="bk-body">
        <div class="bk-map-wrap">
          <svg id="bk-svg" viewBox="0 0 ${SVG_W} ${SVG_H}" xmlns="http://www.w3.org/2000/svg"></svg>
          <div id="bk-tooltip" class="bk-tooltip"></div>
        </div>
        <div class="bk-sidebar">
          <div class="bk-panel">
            <div class="bk-panel-title">Regierung je Land</div>
            <div id="bk-legend"></div>
          </div>
          <div class="bk-panel">
            <div class="bk-panel-title">Bundesrat — 69 Stimmen</div>
            <div id="bk-bundesrat"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initBundeslandKarte(container, state) {
  _renderMap(container, state);
}

export function updateBundeslandKarte(container, state) {
  _updatePathColors(container, state);
  _renderSidebar(container, state);
}

// ── PARTY COLOR ───────────────────────────────────────────────

function _partyColor(party) {
  return PARTY_POSITIONS[party]?.color ?? EXTRA_COLORS[party] ?? '#2a3242';
}

function _isAligned(stateParty, coalition) {
  if (!stateParty) return false;
  if (coalition.includes(stateParty)) return true;
  if (stateParty === 'CSU' && coalition.includes('CDU')) return true;
  if (stateParty === 'CDU' && coalition.includes('CSU')) return true;
  return false;
}

// ── RENDER ────────────────────────────────────────────────────

function _renderMap(container, state) {
  const svg = container.querySelector('#bk-svg');
  if (!svg) return;

  const bl       = state.extensions?.bundeslaender ?? {};
  const coalition = state.government?.coalition ?? [];

  let html = '';
  for (const [key, d] of Object.entries(BUNDESLAND_PATHS)) {
    const data  = bl[key];
    const party = data?.regierungspartei ?? null;
    const fill  = party ? _partyColor(party) : '#2a3242';
    const name  = data?.name ?? key;

    html += `<path d="${d}" fill="${fill}" stroke="#0d1117" stroke-width="0.8"
      stroke-linejoin="round" class="bk-path"
      data-key="${key}" data-name="${name}" data-party="${party ?? ''}" data-fill="${fill}"/>`;
  }

  svg.innerHTML = html;
  _wireInteractions(svg, container, state);
  _renderSidebar(container, state);
}

function _updatePathColors(container, state) {
  const svg = container.querySelector('#bk-svg');
  if (!svg) return;
  const bl = state.extensions?.bundeslaender ?? {};
  svg.querySelectorAll('.bk-path').forEach(path => {
    const data  = bl[path.dataset.key];
    const party = data?.regierungspartei ?? null;
    const fill  = party ? _partyColor(party) : '#2a3242';
    path.setAttribute('fill', fill);
    path.dataset.fill  = fill;
    path.dataset.party = party ?? '';
  });
}

function _wireInteractions(svg, container, state) {
  const tooltip = container.querySelector('#bk-tooltip');
  const bl      = state.extensions?.bundeslaender ?? {};
  const wrap    = container.querySelector('.bk-map-wrap');

  svg.querySelectorAll('.bk-path').forEach(path => {
    const key  = path.dataset.key;
    const name = path.dataset.name;
    const data = bl[key];

    path.addEventListener('mouseenter', () => {
      if (tooltip) {
        tooltip.innerHTML = _tooltipHTML(name, data);
        tooltip.classList.add('bk-tooltip--vis');
      }
      path.setAttribute('fill', '#4a5568');
    });

    path.addEventListener('mousemove', e => {
      if (!tooltip || !wrap) return;
      const r  = wrap.getBoundingClientRect();
      tooltip.style.left = `${e.clientX - r.left + 14}px`;
      tooltip.style.top  = `${e.clientY - r.top  - 10}px`;
    });

    path.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.classList.remove('bk-tooltip--vis');
      path.setAttribute('fill', path.dataset.fill);
    });

    path.addEventListener('click', () => _openModal(name, data));
  });
}

// ── TOOLTIP ───────────────────────────────────────────────────

function _tooltipHTML(name, data) {
  const hs = data?.hauptstadt ?? '—';
  const st = data?.bundesratStimmen ?? '—';
  const ko = data?.koalition?.join(' + ') ?? data?.regierungspartei ?? '—';
  return `
    <div class="bk-tip-name">${name}</div>
    <div class="bk-tip-row"><span>Hauptstadt</span><strong>${hs}</strong></div>
    <div class="bk-tip-row"><span>Regierung</span><strong>${ko}</strong></div>
    <div class="bk-tip-row"><span>Bundesrat</span><strong>${st} Stimmen</strong></div>
  `;
}

// ── LAND MODAL ────────────────────────────────────────────────

function _openModal(name, data) {
  let ov = document.getElementById('bk-land-modal');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'bk-land-modal';
    ov.className = 'bk-modal-ov';
    document.body.appendChild(ov);
  }

  const hs    = data?.hauptstadt ?? '—';
  const ko    = data?.koalition?.join(' + ') ?? data?.regierungspartei ?? '—';
  const st    = data?.bundesratStimmen ?? '—';
  const wi    = data?.wirtschaftskraft ?? '—';
  const wj    = data?.nextWahl ?? '—';
  const party = data?.regierungspartei;
  const dot   = party
    ? `<span class="bk-modal-dot" style="background:${_partyColor(party)}"></span>`
    : '';

  ov.innerHTML = `
    <div class="bk-modal-box">
      <div class="bk-modal-head">
        ${dot}<span class="bk-modal-title">${name}</span>
        <button id="bk-modal-x" class="bk-modal-close">&#x2715;</button>
      </div>
      <table class="bk-modal-table">
        <tr><td>Hauptstadt</td><td><strong>${hs}</strong></td></tr>
        <tr><td>Regierung</td><td><strong>${ko}</strong></td></tr>
        <tr><td>Bundesratsstimmen</td><td><strong>${st}</strong></td></tr>
        <tr><td>Wirtschaftskraft</td><td><strong>${wi}/100</strong></td></tr>
        <tr><td>Nächste Wahl</td><td><strong>${wj}</strong></td></tr>
      </table>
      <div class="bk-modal-note">
        Detaillierte Landespolitik und Bundesratsabstimmungen folgen in Phase 2.
      </div>
    </div>
  `;
  ov.style.display = 'flex';

  const close = () => { ov.style.display = 'none'; };
  document.getElementById('bk-modal-x').addEventListener('click', close);
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
}

// ── SIDEBAR ───────────────────────────────────────────────────

function _renderSidebar(container, state) {
  _renderLegend(container, state);
  _renderBundesrat(container, state);
}

function _renderLegend(container, state) {
  const el = container.querySelector('#bk-legend');
  if (!el) return;

  const bl       = state.extensions?.bundeslaender ?? {};
  const coalition = state.government?.coalition ?? [];

  const partyMap = {};
  for (const data of Object.values(bl)) {
    const p = data.regierungspartei;
    if (!p) continue;
    if (!partyMap[p]) partyMap[p] = { states: 0, votes: 0 };
    partyMap[p].states++;
    partyMap[p].votes += data.bundesratStimmen ?? 0;
  }

  const rows = Object.entries(partyMap).sort((a, b) => b[1].votes - a[1].votes);
  el.innerHTML = rows.map(([party, d]) => {
    const aligned = _isAligned(party, coalition);
    return `
      <div class="bk-leg-row${aligned ? ' bk-leg-row--aligned' : ''}">
        <span class="bk-leg-dot" style="background:${_partyColor(party)}"></span>
        <span class="bk-leg-party">${party}</span>
        <span class="bk-leg-meta">${d.states}L · ${d.votes}St.</span>
        ${aligned ? '<span class="bk-leg-badge">Koalition</span>' : ''}
      </div>
    `;
  }).join('');
}

function _renderBundesrat(container, state) {
  const el = container.querySelector('#bk-bundesrat');
  if (!el) return;

  const bl       = state.extensions?.bundeslaender ?? {};
  const coalition = state.government?.coalition ?? [];

  let reg = 0, opp = 0;
  for (const data of Object.values(bl)) {
    const v = data.bundesratStimmen ?? 0;
    _isAligned(data.regierungspartei, coalition) ? (reg += v) : (opp += v);
  }

  const total     = reg + opp;
  const hasMaj    = reg >= 35;
  const regPct    = total > 0 ? (reg / total * 100).toFixed(1) : '0';
  const threshPct = (35 / 69 * 100).toFixed(1);

  el.innerHTML = `
    <div class="bk-br-row">
      <div class="bk-br-side bk-br-side--reg">
        <span class="bk-br-num">${reg}</span>
        <span class="bk-br-lbl">Koalition</span>
      </div>
      <div class="bk-br-divider"></div>
      <div class="bk-br-side bk-br-side--opp">
        <span class="bk-br-num">${opp}</span>
        <span class="bk-br-lbl">Opposition</span>
      </div>
    </div>
    <div class="bk-br-bar-wrap">
      <div class="bk-br-bar">
        <div class="bk-br-fill ${hasMaj ? 'bk-br-fill--maj' : 'bk-br-fill--min'}"
          style="width:${regPct}%"></div>
        <div class="bk-br-thresh" style="left:${threshPct}%"
          title="35 Stimmen = Mehrheit"></div>
      </div>
      <div class="bk-br-axis">
        <span>0</span>
        <span class="bk-br-axis-35" style="left:${threshPct}%">35</span>
        <span>69</span>
      </div>
    </div>
    <div class="bk-br-status ${hasMaj ? 'bk-br-status--ok' : 'bk-br-status--warn'}">
      ${hasMaj
        ? `Koalition hat Bundesratsmehrheit (${reg} von 69)`
        : `Keine Bundesratsmehrheit — noch ${35 - reg} Stimmen nötig`
      }
    </div>
  `;
}
