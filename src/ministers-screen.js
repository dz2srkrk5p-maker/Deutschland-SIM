// ============================================================
// MINISTERS-SCREEN.JS — Kabinett-Übersicht + Detail-Panel
//
// Was: Rendert das Kabinett-Grid (4-3-4-3), Detail-Panel mit
//      Kompetenz, Persönlichkeit, Status und Entlassungs-Dialog.
//
// Nutzt: ministers/minister-logic.js (computeMinisterStatus,
//        getMinisterBudgetSatisfaction, competenceToStars)
//
// Erweiterungspunkte:
//   - buildMinisterDetailHTML(): neue Felder aus minister-logic.js anzeigen
//   - NAV_ITEMS in main.js für Tab-Navigation im Kabinett
// ============================================================

import { MINISTRY_DEFS } from './ministers/minister-data.js';
import {
  computeMinisterStatus,
  getMinisterBudgetSatisfaction,
  competenceToStars,
  competenceLabel,
} from './ministers/minister-logic.js';

// ── PARTEIFARBKARTE ───────────────────────────────────────────
const PARTY_COLORS = {
  CDU: '#555', SPD: '#E3000F', Grüne: '#1AA037',
  FDP: '#c8a800', AfD: '#009EE0', Linke: '#BE3075', BSW: '#7B1E52',
};
function _partyDot(party) {
  const c = PARTY_COLORS[party] ?? '#888';
  return `<span class="min-party-dot" style="background:${c}"></span>`;
}

// ── STATUS-BADGE ─────────────────────────────────────────────
function _statusBadge(status) {
  const MAP = { stabil: 'stabil', angespannt: 'angespannt', kritisch: 'kritisch' };
  return `<span class="min-status-badge min-status-${status}">${MAP[status] ?? status}</span>`;
}

// ── KOMPETENZ-FARBE ───────────────────────────────────────────
function _compClass(c) {
  if (c >= 70) return 'min-comp-high';
  if (c >= 45) return 'min-comp-mid';
  return 'min-comp-low';
}

// ── EINZELNE KARTE ────────────────────────────────────────────
function _buildCard(minister, def, status) {
  const critCls   = status === 'kritisch' ? ' min-card--critical' : '';
  const scandalCls= minister.inScandal    ? ' min-card--scandal'  : '';
  return `
<div class="min-card${critCls}${scandalCls}" data-ministry="${minister.ministry}" role="button" tabindex="0">
  <div class="min-card-header">
    <span class="min-card-icon">${def.icon}</span>
    <span class="min-card-name">${minister.ministry}</span>
    ${minister.inScandal ? '<span class="min-scandal-dot" title="Laufender Skandal">!</span>' : ''}
  </div>
  <div class="min-card-body">
    <div class="min-card-person">
      ${_partyDot(minister.party)}
      <span class="min-card-minister">${minister.name}</span>
    </div>
    <div class="min-card-stars">${competenceToStars(minister.competence)}</div>
    <div class="min-card-status">${_statusBadge(status)}</div>
  </div>
  <div class="min-card-hover-hint">Klicken für Details</div>
</div>`.trim();
}

// ── GRID HTML ─────────────────────────────────────────────────
function _buildGridHTML(state) {
  const ministers = state.ministers ?? [];
  // 4-3-4-3 Zeilen
  const rows = [
    ministers.slice(0, 4),
    ministers.slice(4, 7),
    ministers.slice(7, 11),
    ministers.slice(11, 14),
  ];

  return rows.map((row, ri) => {
    const cards = row.map(m => {
      const def    = MINISTRY_DEFS.find(d => d.name === m.ministry) ?? MINISTRY_DEFS[0];
      const status = computeMinisterStatus(m, state);
      return _buildCard(m, def, status);
    }).join('');
    return `<div class="min-row min-row-${row.length}">${cards}</div>`;
  }).join('');
}

// ── DETAIL-PANEL HTML ─────────────────────────────────────────
export function buildMinisterDetailHTML(minister, state) {
  const def           = MINISTRY_DEFS.find(d => d.name === minister.ministry) ?? MINISTRY_DEFS[0];
  const status        = computeMinisterStatus(minister, state);
  const budgetSat     = getMinisterBudgetSatisfaction(minister, state);
  const compLbl       = competenceLabel(minister.competence);
  const compCls       = _compClass(minister.competence);
  const totalActions  = minister.termSuccesses + minister.termFailures;

  // Aktuelle Koalitions-Entlassungswarnung
  const firingWarning = (minister.firingCount ?? 0) >= 2
    ? `<div class="min-firing-warning">Zu viele Entlassungen in diesem Ressort — Koalitionspartner drohen mit Konsequenzen!</div>`
    : '';

  // Budget-Balken: wenn ressortKey vorhanden, zeige Allocation
  let budgetBarHTML = '';
  if (def.ressortKey) {
    const alloc = state.scheduling?.lastHaushaltAllocation;
    const frac  = alloc ? (alloc[def.ressortKey] ?? 0) : def.neutralFrac ?? 0.1;
    const pct   = Math.min(100, (frac / (def.neutralFrac ?? 0.1)) * 100).toFixed(0);
    const bCls  = pct >= 90 ? 'bar-fill--green' : pct >= 60 ? 'bar-fill--yellow' : 'bar-fill--red';
    budgetBarHTML = `
      <div class="min-detail-section">
        <div class="min-detail-label">Budget-Zuweisung (${pct}% des Richtwertes)</div>
        <div class="bar-track"><div class="bar-fill ${bCls}" style="width:${pct}%"></div></div>
        <div class="min-budget-sat-row">
          <span>Minister-Zufriedenheit mit Budget:</span>
          <span class="${budgetSat >= 70 ? 'min-val-ok' : budgetSat >= 40 ? 'min-val-warn' : 'min-val-crit'}">${budgetSat}%</span>
        </div>
      </div>`;
  }

  // Bilanz dieser Legislatur
  const bilanzHTML = totalActions > 0
    ? `<div class="min-bilanz">
        <span class="min-bilanz-ok">✓ ${minister.termSuccesses} Erfolge</span>
        <span class="min-bilanz-sep"> / </span>
        <span class="min-bilanz-fail">✗ ${minister.termFailures} Niederlagen</span>
      </div>`
    : '<div class="min-bilanz-empty">Noch keine Initiativen diese Legislatur.</div>';

  // Letzter Aktionsvermerk
  const lastActionHTML = minister.lastActionLabel
    ? `<div class="min-last-action">Zuletzt (Q${minister.lastActionQuarter}): ${minister.lastActionLabel}</div>`
    : '';

  // Aktiver Untersuchungsausschuss
  const investigationHTML = minister.investigationQuartersLeft > 0
    ? `<div class="min-investigation-note">Untersuchungsausschuss läuft — noch ${minister.investigationQuartersLeft} Quartal${minister.investigationQuartersLeft > 1 ? 'e' : ''}</div>`
    : '';

  // Entlassungsrisiko
  const dismissalHTML = minister.dismissalWarning
    ? `<div class="min-dismissal-warning">⚠ Minister droht mit Rücktritt</div>`
    : '';

  // Entlassen-Button
  const inScandal = minister.inScandal || minister.investigationQuartersLeft > 0;
  const fireBtn = `<button class="btn btn-ghost min-fire-btn" data-ministry="${minister.ministry}" ${inScandal ? 'title="Aktiver Skandal — Entlassung über Skandal-Dialog"' : ''}>
    Minister entlassen
  </button>`;

  return `
<div class="min-detail-inner">
  <div class="min-detail-head">
    <span class="min-detail-icon">${def.icon}</span>
    <div class="min-detail-head-text">
      <div class="min-detail-ministry">${minister.ministry}</div>
      <div class="min-detail-desc">${def.description}</div>
    </div>
    ${_statusBadge(status)}
  </div>

  ${firingWarning}
  ${investigationHTML}
  ${dismissalHTML}

  <!-- Persönlichkeit -->
  <div class="min-detail-section">
    <div class="min-person-header">
      ${_partyDot(minister.party)}
      <span class="min-person-name">${minister.name}</span>
      <span class="min-person-party">(${minister.party})</span>
      <span class="min-person-personality">${minister.personality}</span>
    </div>
    <p class="min-person-profile">${minister.profile}</p>
  </div>

  <!-- Kompetenz -->
  <div class="min-detail-section">
    <div class="min-detail-label">Kompetenz — ${compLbl}</div>
    <div class="min-comp-row">
      <div class="bar-track min-comp-track">
        <div class="bar-fill ${compCls}" style="width:${minister.competence}%"></div>
      </div>
      <span class="min-comp-val ${compCls}">${minister.competence}/100</span>
    </div>
    <div class="min-stars-row">${competenceToStars(minister.competence)}</div>
    ${minister.competence > 70
      ? '<div class="min-comp-hint min-comp-hint--good">Gesetze im Ressort: +20% Erfolgschance · Effekte: +15%</div>'
      : minister.competence < 40
        ? '<div class="min-comp-hint min-comp-hint--bad">Gesetze im Ressort: −20% Erfolgschance · Höheres Skandalrisiko</div>'
        : ''
    }
  </div>

  ${budgetBarHTML}

  <!-- Bilanz -->
  <div class="min-detail-section">
    <div class="min-detail-label">Bilanz dieser Legislatur</div>
    ${bilanzHTML}
    ${lastActionHTML}
  </div>

  <!-- Aktiver Skandal -->
  ${minister.inScandal ? `
  <div class="min-detail-section min-scandal-section">
    <div class="min-detail-label">Aktiver Skandal: ${minister.scandalType ?? 'Unbekannt'}</div>
    <div class="min-scandal-hint">Reagieren Sie über den Ereignis-Dialog oder warten Sie auf den nächsten Quartalsbericht.</div>
  </div>` : ''}

  <!-- Aktionen -->
  <div class="min-actions">
    ${fireBtn}
  </div>
</div>`.trim();
}

// ── HAUPT-SCREEN ──────────────────────────────────────────────
export function buildMinistersHTML(state) {
  const coalition  = state.government.coalition ?? [];
  const ministers  = state.ministers ?? [];
  const gridHTML   = ministers.length > 0
    ? _buildGridHTML(state)
    : '<div class="min-empty">Noch keine Minister im Kabinett.</div>';

  return `
<div class="min-page">
  <div class="min-header">
    <button class="btn btn-ghost min-back" id="min-back">&#8592; Dashboard</button>
    <div class="min-header-center">
      <div class="min-badge">Kabinett</div>
      <h1 class="min-title">Bundesministerien</h1>
    </div>
    <div class="min-header-right">Koalition: ${coalition.join(' + ')}</div>
  </div>

  <div class="min-layout">
    <!-- Linke Spalte: Grid -->
    <div class="min-left">
      <div class="min-grid" id="min-grid">${gridHTML}</div>
    </div>

    <!-- Rechte Spalte: Detail-Panel -->
    <div class="min-right" id="min-detail">
      <div class="min-detail-placeholder">
        <div class="min-placeholder-icon">🏛</div>
        <div class="min-placeholder-text">Ministerium auswählen</div>
        <div class="min-placeholder-hint">Klicken Sie auf eine Karte für Details und Aktionen.</div>
      </div>
    </div>
  </div>
</div>`.trim();
}

// ── SCREEN-INITIALISIERUNG ────────────────────────────────────
export function initMinistersScreen(container, state, onAction) {
  let currentMinistryName = null;

  function _showDetail(ministryName) {
    currentMinistryName = ministryName;
    const minister = state.ministers?.find(m => m.ministry === ministryName);
    if (!minister) return;

    // Aktive Karte markieren
    container.querySelectorAll('.min-card').forEach(c => {
      c.classList.toggle('min-card--active', c.dataset.ministry === ministryName);
    });

    const detailEl = container.querySelector('#min-detail');
    detailEl.innerHTML = buildMinisterDetailHTML(minister, state);
    _wireDetailButtons();
  }

  function _wireDetailButtons() {
    const fireBtn = container.querySelector('.min-fire-btn');
    if (fireBtn) {
      fireBtn.addEventListener('click', () => {
        const ministryName = fireBtn.dataset.ministry;
        const minister     = state.ministers?.find(m => m.ministry === ministryName);
        if (!minister) return;

        // Bestätigungsdialog
        const party   = minister.party;
        const consequence = minister.firingCount >= 1
          ? `Bereits ${minister.firingCount} Entlassung(en) in diesem Ressort — Koalitionspartner ${party} reagiert sehr negativ!`
          : `Koalitionspartner ${party} wird verärgert sein.`;

        onAction({
          type:        'fire-minister',
          ministryName,
          minister,
          confirmText: `Minister ${minister.name} wirklich entlassen?\n\n${consequence}\n\nKoalitionsstabilität: −10`,
        });
      });
    }
  }

  function _wireCardClicks() {
    container.querySelectorAll('.min-card').forEach(card => {
      card.addEventListener('click', () => _showDetail(card.dataset.ministry));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _showDetail(card.dataset.ministry); }
      });
    });
  }

  _wireCardClicks();

  container.querySelector('#min-back')?.addEventListener('click', () => {
    onAction({ type: 'back' });
  });

  // Erstes Ministerium auto-auswählen
  if ((state.ministers ?? []).length > 0) {
    _showDetail(state.ministers[0].ministry);
  }

  // Reload wenn State sich von außen ändert
  return {
    refresh(newState) {
      state = newState;
      const gridEl = container.querySelector('#min-grid');
      if (gridEl) gridEl.innerHTML = _buildGridHTML(state);
      _wireCardClicks();
      if (currentMinistryName) _showDetail(currentMinistryName);
    },
  };
}
