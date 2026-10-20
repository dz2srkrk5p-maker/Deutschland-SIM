// ============================================================
// COAL-NEG-UI.JS — HTML-Builder für Koalitionsverhandlungs-Screen
// ============================================================

import { WORKING_GROUPS, PARTY_LEADERS, PARTY_SHOWSTOPPERS, MINISTRY_WISH_LISTS,
         FORMULATIONS, PERSONALITY_LABELS, AUSSCHUSS_REPS } from './coal-neg-data.js';
import { PARTY_POSITIONS, MINISTERIEN } from './engine/state.js';
import { checkShowstoppers, getOverallProgress, isContractReady, getContractSummary,
         evaluatePackage, getUnresolvedTopics, getContractBlockers } from './coal-neg-engine.js';

// ── HAUPT-SCREEN ──────────────────────────────────────────────

export function buildCoalNegScreen(state) {
  return `
    <div class="cn-screen" id="cn-screen">
      ${buildHeader(state)}
      <div class="cn-body">
        <div class="cn-left" id="cn-left">
          ${buildLeftPanel(state)}
        </div>
        <div class="cn-right" id="cn-right">
          ${buildRightPanel(state)}
        </div>
      </div>
    </div>
  `;
}

function buildHeader(state) {
  const contractReady = isContractReady(state);
  const isNacht = state.isNachtsitzung;
  const overallPct = getOverallProgress(state);

  return `
    <div class="cn-header">
      <div class="cn-header-left">
        <div class="cn-phase-badge${isNacht ? ' cn-phase-nacht' : ''}">
          ${isNacht ? '🌙 Nachtsitzung' : 'Koalitionsverhandlung'}
        </div>
        <div class="cn-header-title">Runde ${Math.min(state.round, state.maxRounds)} / ${state.maxRounds}</div>
        <div class="cn-header-progress">
          <div class="cn-hdr-bar-track">
            <div class="cn-hdr-bar-fill${overallPct >= 60 ? ' cn-hdr-bar-good' : ''}" style="width:${overallPct}%"></div>
          </div>
          <span class="cn-hdr-bar-label">${overallPct}% Gesamtfortschritt</span>
        </div>
      </div>
      <div class="cn-header-ap">
        <span class="cn-ap-label">Aktionspunkte</span>
        <div class="cn-ap-pips">
          ${state.isNachtsitzung
            ? '<span class="cn-ap-nacht">∞ Nachtsitzung</span>'
            : [0,1,2].map(i => `<span class="cn-ap-pip${i < state.actionPoints ? ' cn-ap-pip--on' : ''}"></span>`).join('')
          }
        </div>
      </div>
      <div class="cn-header-right">
        ${contractReady
          ? `<button class="btn btn-primary cn-sign-btn" id="btn-cn-sign">Koalitionsvertrag unterzeichnen ✓</button>`
          : `<button class="btn btn-ghost cn-end-round-btn" id="btn-cn-end-round"${state.actionPoints > 0 && !state.isNachtsitzung ? ' style="opacity:0.5"' : ''}>Runde beenden →</button>`
        }
      </div>
    </div>
  `;
}

// ── LINKES PANEL (60%) ────────────────────────────────────────

function buildLeftPanel(state) {
  switch (state.view) {
    case 'topic-detail':    return buildTopicDetailView(state);
    case 'package-builder': return buildPackageBuilderView(state);
    case 'ministry-offers': return buildMinistryOffersView(state);
    default:                return buildAGSelectView(state);
  }
}

// Arbeitsgruppen-Auswahl (Default-View)
function buildAGSelectView(state) {
  return `
    <div class="cn-view-header">
      <div class="cn-view-title">Arbeitsgruppen</div>
      <div class="cn-view-subtitle">Wählen Sie eine AG um ein Thema zu verhandeln (kostet 1 Aktionspunkt)</div>
    </div>
    <div class="cn-ag-grid" id="cn-ag-grid">
      ${WORKING_GROUPS.map(ag => buildAGCard(state, ag)).join('')}
    </div>
    <div class="cn-action-bar">
      <button class="btn btn-ghost cn-action-btn${state.actionPoints <= 0 && !state.isNachtsitzung ? ' disabled' : ''}" id="btn-open-package"
        ${state.actionPoints <= 0 && !state.isNachtsitzung ? 'disabled' : ''}>
        📦 Paketlösung bauen
      </button>
      <button class="btn btn-ghost cn-action-btn" id="btn-open-ministry">
        🏛 Ministerium anbieten
      </button>
    </div>
  `;
}

function buildAGCard(state, ag) {
  const agState = state.ags[ag.id];
  const progress = agState.progress;
  const resolvedCount = Object.values(agState.topics).filter(t => t !== null).length;
  const totalTopics = ag.subTopics.length;
  const hasUnresolved = resolvedCount < totalTopics;
  const canAdvance = (state.actionPoints > 0 || state.isNachtsitzung) && hasUnresolved;

  const progressClass = progress >= 80 ? 'cn-ag-prog--good' : progress >= 40 ? 'cn-ag-prog--mid' : '';

  return `
    <div class="cn-ag-card${canAdvance ? ' cn-ag-card--active' : ' cn-ag-card--dim'}" data-ag="${ag.id}"
         ${canAdvance ? `title="Klicken um ein Thema in '${ag.label}' zu verhandeln"` : ''}>
      <div class="cn-ag-card-head">
        <div class="cn-ag-name-row">
          <span class="cn-ag-color-dot" style="background:${ag.color}"></span>
          <span class="cn-ag-label">${ag.label}</span>
        </div>
        <span class="cn-ag-topics-done">${resolvedCount}/${totalTopics} Themen</span>
      </div>
      <div class="cn-ag-prog-wrap">
        <div class="cn-ag-prog-track">
          <div class="cn-ag-prog-fill ${progressClass}" style="width:${progress}%"></div>
        </div>
        <span class="cn-ag-prog-num">${progress}%</span>
      </div>
      <div class="cn-ag-topics-preview">
        ${ag.subTopics.map(t => {
          const resolved = agState.topics[t.id];
          const fmtIcon = resolved ? { binding: '●', aspiring: '◐', examining: '○' }[resolved.formulation] || '●' : '·';
          const fmtClass = resolved ? `cn-topic-${resolved.formulation}` : 'cn-topic-open';
          return `<span class="cn-topic-pip ${fmtClass}" title="${t.label}: ${resolved ? `${resolved.formulation} @ ${resolved.value}` : 'offen'}">${fmtIcon} ${t.label}</span>`;
        }).join('')}
      </div>
    </div>
  `;
}

// Themen-Detail-View (wenn AG ausgewählt)
function buildTopicDetailView(state) {
  const { agId, topicId, playerValue, formulation } = state.viewData;
  const ag = WORKING_GROUPS.find(g => g.id === agId);
  if (!ag) return '';
  const agState = state.ags[agId];

  return `
    <div class="cn-view-header">
      <button class="cn-back-btn" id="btn-back-to-ag">← Zurück</button>
      <div class="cn-view-title">
        <span class="cn-ag-color-dot" style="background:${ag.color}"></span>
        ${ag.label}
      </div>
      <div class="cn-view-subtitle">Wählen Sie ein Thema und legen Sie Ihre Position und Formulierung fest.</div>
    </div>

    <div class="cn-topics-list">
      ${ag.subTopics.map(topic => {
        const resolved = agState.topics[topic.id];
        const isSelected = topic.id === topicId;
        const isResolved = !!resolved;

        return `
          <div class="cn-topic-card${isSelected ? ' cn-topic-card--selected' : ''}${isResolved ? ' cn-topic-card--resolved' : ''}"
               data-topic="${topic.id}" id="tc-${topic.id}">
            <div class="cn-topic-header">
              <div class="cn-topic-title">${topic.label}</div>
              ${isResolved
                ? `<span class="cn-topic-resolved-badge cn-fmt-${resolved.formulation}">${{ binding: 'Verbindlich', aspiring: 'Angestrebt', examining: 'Geprüft' }[resolved.formulation]} · ${resolved.value}</span>`
                : `<span class="cn-topic-open-badge">Offen</span>`
              }
            </div>

            ${isSelected && !isResolved ? `
              <div class="cn-topic-body">
                <p class="cn-topic-desc">${topic.description}</p>

                <!-- Position visualization -->
                <div class="cn-pos-scale-wrap">
                  <div class="cn-pos-scale-track" id="scale-${topic.id}">
                    ${state.coalition.filter(p => p !== state.playerParty).map(p => {
                      const pPos = topic.partyPositions[p] ?? 50;
                      const pData = PARTY_POSITIONS[p];
                      return `<div class="cn-pos-party-dot" style="left:${pPos}%;background:${pData?.color || '#888'}" title="${PARTY_POSITIONS[p]?.fullName || p}: ${pPos}"></div>`;
                    }).join('')}
                    <div class="cn-pos-player-dot" id="pdot-${topic.id}" style="left:${playerValue}%;background:${PARTY_POSITIONS[state.playerParty]?.color || '#388bfd'}" title="Ihre Position: ${playerValue}"></div>
                  </div>
                  <div class="cn-scale-labels">
                    <span>${topic.leftLabel}</span>
                    <span>${topic.rightLabel}</span>
                  </div>
                  <!-- Legend -->
                  <div class="cn-pos-legend">
                    ${state.coalition.filter(p => p !== state.playerParty).map(p => {
                      const pData = PARTY_POSITIONS[p];
                      return `<span class="cn-pos-legend-item"><span class="cn-pos-legend-dot" style="background:${pData?.color}"></span>${pData?.fullName || p}: ${topic.partyPositions[p] ?? 50}</span>`;
                    }).join('')}
                    <span class="cn-pos-legend-item cn-pos-legend-player"><span class="cn-pos-legend-dot" style="background:${PARTY_POSITIONS[state.playerParty]?.color}"></span>Sie: <span id="player-val-label-${topic.id}">${playerValue}</span></span>
                  </div>
                </div>

                <!-- Player slider -->
                <div class="cn-slider-row">
                  <span class="cn-slider-label">Ihre Position:</span>
                  <input type="range" class="cn-slider" id="slider-${topic.id}" data-topic="${topic.id}" data-ag="${agId}"
                    min="0" max="100" step="1" value="${playerValue}">
                  <span class="cn-slider-val" id="slval-${topic.id}">${playerValue}</span>
                </div>

                <!-- Formulation picker -->
                <div class="cn-fmt-picker">
                  <div class="cn-fmt-label">Formulierung:</div>
                  <div class="cn-fmt-options">
                    ${FORMULATIONS.map(f => `
                      <label class="cn-fmt-opt${formulation === f.id ? ' cn-fmt-opt--selected' : ''}">
                        <input type="radio" name="fmt-${topic.id}" value="${f.id}" class="cn-fmt-radio" data-topic="${topic.id}" ${formulation === f.id ? 'checked' : ''}>
                        <div class="cn-fmt-opt-body">
                          <div class="cn-fmt-opt-label" style="color:${f.color}">${f.label}</div>
                          <div class="cn-fmt-opt-desc">${f.description}</div>
                        </div>
                      </label>
                    `).join('')}
                  </div>
                </div>

                <!-- Party reaction preview -->
                <div class="cn-reaction-preview" id="reaction-preview-${topic.id}">
                  ${buildReactionPreview(state, agId, topic.id, playerValue, formulation)}
                </div>

                <button class="btn btn-primary cn-confirm-topic-btn" id="btn-confirm-topic"
                  data-ag="${agId}" data-topic="${topic.id}"
                  ${state.actionPoints <= 0 && !state.isNachtsitzung ? 'disabled' : ''}>
                  Einigen (1 AP)${state.isNachtsitzung ? ' — kostenlos' : ''}
                </button>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function buildReactionPreview(state, agId, topicId, value, formulation) {
  return `
    <div class="cn-reaction-title">Erwartete Reaktionen:</div>
    ${state.coalition.filter(p => p !== state.playerParty).map(p => {
      const pData = PARTY_POSITIONS[p];
      const leader = state.partyStates[p]?.leader || PARTY_LEADERS[p];
      const ag = WORKING_GROUPS.find(g => g.id === agId);
      const topic = ag?.subTopics.find(t => t.id === topicId);
      const partyIdeal = topic?.partyPositions[p] ?? 50;
      const distance = Math.abs(partyIdeal - value);
      const fmtData = FORMULATIONS.find(f => f.id === formulation);

      let icon = '✓', cls = 'cn-react-ok', text = 'Akzeptiert';
      if (formulation === 'examining' && leader.personality === 'Hardliner') {
        icon = '✗'; cls = 'cn-react-no'; text = 'Lehnt ab — Formulierung zu unverbindlich';
      } else if (distance > 40) {
        icon = '✗'; cls = 'cn-react-no'; text = `Lehnt ab — Differenz zu groß (${Math.round(distance)} Punkte)`;
      } else if (distance > 20) {
        icon = '⚠'; cls = 'cn-react-warn'; text = `Schluckt Kröte — Zufriedenheit −${fmtData?.satisfactionCost ?? 6}`;
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

// Package-Builder-View (Drag & Drop)
function buildPackageBuilderView(state) {
  const packageReactions = state.packageItems.length > 0 ? evaluatePackage(state) : {};
  const playerWishList = MINISTRY_WISH_LISTS[state.playerParty]?.wish || [];
  const totalItems = state.packageItems.length;

  return `
    <div class="cn-view-header">
      <button class="cn-back-btn" id="btn-back-to-ag">← Zurück</button>
      <div class="cn-view-title">📦 Paketlösung bauen</div>
      <div class="cn-view-subtitle">Politikpositionen und Ministerien ins Paket ziehen. Parteien reagieren live.</div>
    </div>

    <div class="cn-package-layout">
      <!-- Left: sources (topics + ministries) -->
      <div class="cn-pkg-sources">

        <!-- AG topics -->
        <div class="cn-pkg-source-section">
          <div class="cn-pkg-sources-title">Politikpositionen</div>
          ${WORKING_GROUPS.map(ag => {
            const unresolvedTopics = ag.subTopics.filter(t => !state.ags[ag.id]?.topics[t.id]);
            if (unresolvedTopics.length === 0) return '';
            return `
              <div class="cn-pkg-ag-group">
                <div class="cn-pkg-ag-name">
                  <span class="cn-ag-color-dot cn-ag-color-dot--sm" style="background:${ag.color}"></span>
                  ${ag.short}
                </div>
                ${unresolvedTopics.map(topic => {
                  const inPkg = state.packageItems.some(i => i.agId === ag.id && i.topicId === topic.id);
                  return `
                    <div class="cn-pkg-topic-chip${inPkg ? ' cn-pkg-topic-chip--in-pkg' : ''}"
                         draggable="${!inPkg}"
                         data-ag="${ag.id}" data-topic="${topic.id}">
                      ${topic.label}${inPkg ? ' ✓' : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Ministries -->
        <div class="cn-pkg-source-section cn-pkg-min-section">
          <div class="cn-pkg-sources-title">Ministerien anbieten</div>
          <div class="cn-pkg-sources-hint">Ministerium ins Paket ziehen → dann Empfängerpartei wählen</div>
          <div class="cn-pkg-min-grid">
            ${MINISTERIEN.map(min => {
              const inPkg = state.packageItems.some(i => i.type === 'ministry' && i.ministry === min.name);
              const currentOwner = state.ministries[min.name];
              const playerNeeds = playerWishList.includes(min.name);
              const ownerData = currentOwner ? PARTY_POSITIONS[currentOwner] : null;
              return `
                <div class="cn-pkg-ministry-chip${inPkg ? ' cn-pkg-topic-chip--in-pkg' : ''}"
                     draggable="${!inPkg}"
                     data-ministry="${min.name}"
                     title="${min.name} (${min.policyArea}, Macht ${min.power}/10)">
                  <div class="cn-pkg-min-chip-top">
                    <span class="cn-pkg-min-chip-name">${min.name}</span>
                    <span class="cn-pkg-min-chip-power">
                      ${Array.from({length: 5}, (_, i) => `<span class="cn-pip${i < Math.ceil(min.power/2) ? ' cn-pip--on' : ''}"></span>`).join('')}
                    </span>
                  </div>
                  <div class="cn-pkg-min-chip-meta">
                    ${min.policyArea}
                    ${currentOwner ? `<span class="cn-pkg-min-chip-owner" style="color:${ownerData?.color}">${currentOwner}</span>` : ''}
                  </div>
                  ${playerNeeds ? `<div class="cn-pkg-min-chip-warn">⚠ eigene Wunschliste</div>` : ''}
                  ${inPkg ? `<div class="cn-pkg-min-chip-in-pkg">Im Paket ✓</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Right: Package drop zone -->
      <div class="cn-pkg-zone" id="cn-pkg-zone">
        <div class="cn-pkg-zone-header">
          Ihr Paket
          ${totalItems > 0 ? `<span class="cn-pkg-count">${totalItems} ${totalItems === 1 ? 'Element' : 'Elemente'}</span>` : ''}
        </div>
        <div class="cn-pkg-drop-area" id="cn-pkg-drop">
          ${totalItems === 0
            ? `<div class="cn-pkg-empty">Positionen oder Ministerien hierher ziehen</div>`
            : state.packageItems.map(item => buildPackageItem(state, item)).join('')
          }
        </div>

        ${totalItems > 0 ? `
          <!-- Party reactions -->
          <div class="cn-pkg-reactions">
            <div class="cn-pkg-reactions-title">Reaktionen:</div>
            ${state.coalition.filter(p => p !== state.playerParty).map(p => {
              const r = packageReactions[p] || { accepts: null, reason: '—' };
              const cls = r.accepts === true ? 'cn-pkg-react-yes' : r.accepts === false ? 'cn-pkg-react-no' : 'cn-pkg-react-unk';
              const icon = r.accepts === true ? '✓' : r.accepts === false ? '✗' : '?';
              const pData = PARTY_POSITIONS[p];
              // Ministries going to this party
              const gettingMins = state.packageItems.filter(i => i.type === 'ministry' && i.toParty === p);
              return `
                <div class="cn-pkg-react-row ${cls}">
                  <span class="cn-react-dot" style="background:${pData?.color}"></span>
                  <span class="cn-pkg-react-name">${pData?.fullName || p}</span>
                  <span class="cn-pkg-react-icon">${icon}</span>
                  <div class="cn-pkg-react-detail">
                    <span class="cn-pkg-react-reason">${r.reason}</span>
                    ${gettingMins.length > 0 ? `<span class="cn-pkg-react-mins">erhält: ${gettingMins.map(i => i.ministry).join(', ')}</span>` : ''}
                    ${r.counterDemand ? `<div class="cn-pkg-counter">Gegenforderung: ${r.counterDemand.label}</div>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <button class="btn btn-primary cn-pkg-send-btn" id="btn-send-package"
            ${state.actionPoints <= 0 && !state.isNachtsitzung ? 'disabled' : ''}>
            Paket schicken (1 AP)
          </button>
          <button class="btn btn-ghost cn-pkg-clear-btn" id="btn-clear-package">Leeren</button>
        ` : ''}
      </div>
    </div>
  `;
}

function buildPackageItem(state, item) {
  if (item.type === 'ministry') return buildPackageMinistryItem(state, item);

  const ag = WORKING_GROUPS.find(g => g.id === item.agId);
  const topic = ag?.subTopics.find(t => t.id === item.topicId);
  if (!topic) return '';

  return `
    <div class="cn-pkg-item" data-ag="${item.agId}" data-topic="${item.topicId}">
      <div class="cn-pkg-item-head">
        <span class="cn-ag-color-dot cn-ag-color-dot--sm" style="background:${ag.color}"></span>
        <span class="cn-pkg-item-label">${topic.label}</span>
        <button class="cn-pkg-item-remove" data-ag="${item.agId}" data-topic="${item.topicId}">✕</button>
      </div>
      <div class="cn-pkg-item-controls">
        <span class="cn-pkg-item-scale-label">${topic.leftLabel.slice(0,14)}</span>
        <input type="range" class="cn-pkg-slider" min="0" max="100" step="1" value="${item.value}"
               data-ag="${item.agId}" data-topic="${item.topicId}">
        <span class="cn-pkg-item-scale-label cn-pkg-item-scale-label--right">${topic.rightLabel.slice(0,14)}</span>
        <span class="cn-pkg-val">${item.value}</span>
      </div>
      <div class="cn-pkg-item-fmts">
        ${FORMULATIONS.map(f => {
          const isActive = item.formulation === f.id;
          const pct = { binding: '100%', aspiring: '60%', examining: '20%' }[f.id];
          return `
            <button
              class="cn-pkg-fmt-btn${isActive ? ' cn-pkg-fmt-btn--on' : ''}"
              data-ag="${item.agId}" data-topic="${item.topicId}" data-fmt="${f.id}"
              style="--fmt-color:${f.color}"
              title="${f.description}"
            >
              <span class="cn-pkg-fmt-name">${f.label}</span>
              <span class="cn-pkg-fmt-pct">${pct} Wirkung</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function buildPackageMinistryItem(state, item) {
  const min = MINISTERIEN.find(m => m.name === item.ministry);
  if (!min) return '';
  const playerWishList = MINISTRY_WISH_LISTS[state.playerParty]?.wish || [];
  const playerNeeds = playerWishList.includes(item.ministry);
  const receiverWishList = item.toParty ? (MINISTRY_WISH_LISTS[item.toParty]?.wish || []) : [];
  const isWanted = item.toParty && receiverWishList.includes(item.ministry);

  return `
    <div class="cn-pkg-item cn-pkg-item--ministry" data-ministry="${item.ministry}">
      <div class="cn-pkg-item-head">
        <span class="cn-pkg-min-icon">🏛</span>
        <span class="cn-pkg-item-label">${item.ministry}</span>
        <button class="cn-pkg-item-remove cn-pkg-item-remove--ministry" data-ministry="${item.ministry}">✕</button>
      </div>
      <div class="cn-pkg-min-meta-row">
        <span class="cn-pkg-min-policy">${min.policyArea}</span>
        <span class="cn-pkg-min-power-row">
          ${Array.from({length: 10}, (_, i) => `<span class="cn-pip${i < min.power ? ' cn-pip--on' : ''}"></span>`).join('')}
        </span>
      </div>
      ${playerNeeds ? `<div class="cn-pkg-min-player-warn">⚠ Ihre Partei wünscht dieses Ministerium</div>` : ''}
      <div class="cn-pkg-min-to">
        <span class="cn-pkg-min-to-label">Angeboten an:</span>
        <select class="cn-pkg-min-party-sel" data-ministry="${item.ministry}">
          <option value="">— Partei auswählen —</option>
          ${state.coalition.filter(p => p !== state.playerParty).map(p => {
            const pData = PARTY_POSITIONS[p];
            return `<option value="${p}" ${item.toParty === p ? 'selected' : ''}>${pData?.fullName || p}</option>`;
          }).join('')}
        </select>
        ${isWanted ? `<span class="cn-pkg-min-wanted">★ Wunschministerium</span>` : ''}
      </div>
    </div>
  `;
}

// Ministerien-View
function buildMinistryOffersView(state) {
  // Count assigned per party
  const counts = {};
  for (const p of state.coalition) counts[p] = 0;
  for (const [m, p] of Object.entries(state.ministries)) {
    if (p && counts[p] !== undefined) counts[p]++;
  }

  return `
    <div class="cn-view-header">
      <button class="cn-back-btn" id="btn-back-to-ag">← Zurück</button>
      <div class="cn-view-title">🏛 Ministerienverteilung</div>
      <div class="cn-view-subtitle">Bieten Sie Ministerien an (1 AP pro Angebot). Beeinflusst Zufriedenheit der Parteien.</div>
    </div>

    <!-- Kontingent-Übersicht -->
    <div class="cn-min-quotas">
      ${state.coalition.map(p => {
        const wishList = MINISTRY_WISH_LISTS[p];
        const pData = PARTY_POSITIONS[p];
        return `
          <div class="cn-min-quota-item">
            <span class="cn-react-dot" style="background:${pData?.color}"></span>
            <span class="cn-min-quota-name">${pData?.fullName || p}${p === state.playerParty ? ' (Sie)' : ''}</span>
            <span class="cn-min-quota-val">${counts[p]}/${wishList?.min ?? '?'} Min.</span>
            <span class="cn-min-quota-wish">Wunsch: ${(wishList?.wish || []).slice(0,2).join(', ')}</span>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Ministerien-Grid -->
    <div class="cn-min-grid">
      ${MINISTERIEN.map(min => {
        const assigned = state.ministries[min.name];
        const pData = assigned ? PARTY_POSITIONS[assigned] : null;
        return `
          <div class="cn-min-card" data-ministry="${min.name}">
            <div class="cn-min-card-head">
              <span class="cn-min-name">${min.name}</span>
              <div class="cn-min-power">
                ${Array.from({length: 10}, (_, i) => `<span class="cn-pip${i < min.power ? ' cn-pip--on' : ''}"></span>`).join('')}
              </div>
            </div>
            <div class="cn-min-policy">→ ${min.policyArea}</div>
            <div class="cn-min-assign">
              ${assigned
                ? `<span class="cn-min-assigned-dot" style="background:${pData?.color}"></span>
                   <span class="cn-min-assigned-name">${PARTY_POSITIONS[assigned]?.fullName || assigned}</span>`
                : `<span class="cn-min-unassigned">Nicht vergeben</span>`
              }
            </div>
            <div class="cn-min-offer-row">
              <select class="cn-min-select" data-ministry="${min.name}"
                ${state.actionPoints <= 0 && !state.isNachtsitzung ? 'disabled' : ''}>
                <option value="">— Anbieten an —</option>
                ${state.coalition.map(p => `
                  <option value="${p}">${PARTY_POSITIONS[p]?.fullName || p}</option>
                `).join('')}
              </select>
              <button class="cn-min-offer-btn btn btn-ghost" data-ministry="${min.name}"
                ${state.actionPoints <= 0 && !state.isNachtsitzung ? 'disabled' : ''}>
                Anbieten
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ── RECHTES PANEL (40%) ───────────────────────────────────────

function buildRightPanel(state) {
  const showstoppers = checkShowstoppers(state);
  return `
    <div class="cn-right-content">
      ${buildRoundInfo(state)}
      ${buildAGMiniPanel(state)}
      ${buildPartyStatusPanel(state, showstoppers)}
      ${buildMediaPanel(state)}
    </div>
  `;
}

function buildRoundInfo(state) {
  const overallPct = getOverallProgress(state);
  const unresolved = getUnresolvedTopics(state).length;
  const contractReady = isContractReady(state);
  const blockers = contractReady ? [] : getContractBlockers(state);

  // Group blockers for compact display
  const agBlockers  = blockers.filter(b => b.type === 'ag');
  const minBlockers = blockers.filter(b => b.type === 'ministry');
  const ssBlockers  = blockers.filter(b => b.type === 'showstopper');

  return `
    <div class="cn-right-section cn-right-rounds">
      <div class="cn-right-title">Status</div>
      <div class="cn-status-row">
        <span>Runde</span>
        <span class="cn-status-val">${Math.min(state.round, state.maxRounds)} / ${state.maxRounds}</span>
      </div>
      <div class="cn-status-row">
        <span>Offene Themen</span>
        <span class="cn-status-val${unresolved > 5 ? ' cn-val-red' : unresolved > 0 ? ' cn-val-yellow' : ' cn-val-green'}">${unresolved}</span>
      </div>
      <div class="cn-status-row">
        <span>Vertrag</span>
        <span class="cn-status-val${contractReady ? ' cn-val-green' : ' cn-val-red'}">${contractReady ? '✓ Unterzeichnungsbereit' : 'In Arbeit'}</span>
      </div>
      ${!contractReady && blockers.length > 0 ? `
        <div class="cn-contract-blockers">
          ${agBlockers.length > 0 ? `<div class="cn-blocker-row cn-blocker-ag">AGs: ${agBlockers.map(b => b.label).join(' · ')}</div>` : ''}
          ${minBlockers.length > 0 ? `<div class="cn-blocker-row cn-blocker-min">${minBlockers.length} Ministerium${minBlockers.length > 1 ? 'en' : ''} unverb.</div>` : ''}
          ${ssBlockers.map(b => `
            <div class="cn-blocker-row cn-blocker-ss">
              <div class="cn-blocker-ss-label">${b.label}</div>
              ${b.detail ? `<div class="cn-blocker-ss-detail">${b.detail}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${state.isNachtsitzung ? `<div class="cn-nacht-warning">🌙 Nachtsitzung — jetzt alles klären!</div>` : ''}
    </div>
  `;
}

function buildAGMiniPanel(state) {
  return `
    <div class="cn-right-section">
      <div class="cn-right-title">Arbeitsgruppen</div>
      ${WORKING_GROUPS.map(ag => {
        const agState = state.ags[ag.id];
        const resolved = Object.values(agState.topics).filter(t => t !== null).length;
        const total = ag.subTopics.length;
        const progress = agState.progress;
        const cls = progress >= 80 ? 'cn-mini-fill--good' : progress >= 40 ? 'cn-mini-fill--mid' : '';
        return `
          <div class="cn-mini-ag-row">
            <span class="cn-mini-ag-dot" style="background:${ag.color}"></span>
            <span class="cn-mini-ag-label">${ag.short}</span>
            <div class="cn-mini-ag-track">
              <div class="cn-mini-ag-fill ${cls}" style="width:${progress}%"></div>
            </div>
            <span class="cn-mini-ag-pct">${progress}%</span>
            <span class="cn-mini-topics">${resolved}/${total}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function buildPartyStatusPanel(state, showstoppers) {
  return `
    <div class="cn-right-section">
      <div class="cn-right-title">Verhandlungsführer</div>
      ${state.coalition.filter(p => p !== state.playerParty).map(p => {
        const ps = state.partyStates[p];
        if (!ps) return '';
        const pData = PARTY_POSITIONS[p];
        const leader = ps.leader;
        const pers = PERSONALITY_LABELS[leader.personality];
        const sat = ps.satisfaction;
        const satCls = sat < 15 ? 'cn-sat-crit' : sat < 30 ? 'cn-sat-warn' : sat < 50 ? 'cn-sat-mid' : 'cn-sat-ok';
        const myShowstoppers = showstoppers[p] || [];
        const openStops = myShowstoppers.filter(ss => !ss.met).length;

        return `
          <div class="cn-party-status-card">
            <div class="cn-psc-header">
              <span class="cn-psc-dot" style="background:${pData?.color}"></span>
              <span class="cn-psc-name">${pData?.fullName || p}</span>
              <span class="cn-psc-personality" style="color:${pers?.color}" title="${pers?.desc}">
                ${leader.icon} ${leader.personality}${ps.leaderChanged ? ' ⚡neu' : ''}
              </span>
            </div>
            <div class="cn-psc-leader">${leader.name}</div>
            <div class="cn-psc-sat-row">
              <span class="cn-psc-sat-label">Basis-Zufriedenheit</span>
              <span class="cn-psc-sat-val ${satCls}">${sat}%</span>
            </div>
            <div class="cn-sat-track">
              <div class="cn-sat-fill ${satCls}" style="width:${sat}%"></div>
              <div class="cn-sat-marker" style="left:30%"></div>
              <div class="cn-sat-marker cn-sat-marker-15" style="left:15%"></div>
            </div>
            ${sat < 30 ? `<div class="cn-psc-warn">${sat < 15 ? '⚠ Parteichef-Sturz droht!' : '⚠ Mitgliederentscheid droht!'}</div>` : ''}
            <!-- Showstoppers -->
            <div class="cn-psc-stops">
              ${myShowstoppers.map(ss => `
                <div class="cn-psc-stop${ss.met ? ' cn-stop-met' : ' cn-stop-open'}${ss.autoFulfilled ? ' cn-stop-auto' : ''}">
                  <span class="cn-stop-icon">${ss.met ? '✓' : '✗'}</span>
                  <span class="cn-stop-label">${ss.label}</span>
                  ${!ss.met && ss.reason ? `<div class="cn-stop-detail">${ss.reason}</div>` : ''}
                  ${ss.autoFulfilled ? `<div class="cn-stop-detail cn-stop-auto-note">Auto-erfüllt (AG abgeschlossen)</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}

      <!-- Player party compact -->
      <div class="cn-party-player-compact">
        <span class="cn-psc-dot" style="background:${PARTY_POSITIONS[state.playerParty]?.color}"></span>
        <span>${PARTY_POSITIONS[state.playerParty]?.fullName || state.playerParty} (Sie)</span>
        <span class="cn-player-showstoppers">
          Ihre Showstopper: ${(showstoppers[state.playerParty] || []).filter(ss => ss.met).length}/${(showstoppers[state.playerParty] || []).length}
        </span>
      </div>
    </div>
  `;
}

function buildMediaPanel(state) {
  const sentimentColors = { great: '#3fb950', good: '#d29922', neutral: '#8b949e', bad: '#f85149', leak: '#f85149', nachtsitzung: '#a371f7' };
  const color = sentimentColors[state.mediaSentiment] || '#8b949e';
  return `
    <div class="cn-right-section cn-media-panel">
      <div class="cn-right-title">Medienkommentar Woche ${Math.max(1, state.round - 1)}</div>
      <div class="cn-media-comment" style="border-left-color:${color}">
        ${state.mediaComment}
      </div>
      ${state.pendingLeak && !state.leakReacted ? `
        <div class="cn-leak-alert">
          ⚠ Leak aufgedeckt! Reaktion erforderlich.
          <button class="btn cn-leak-btn" id="btn-show-leak">Reagieren →</button>
        </div>
      ` : ''}
    </div>
  `;
}

// ── OVERLAYS ──────────────────────────────────────────────────

export function buildLeakOverlay(state) {
  const leak = state.pendingLeak;
  if (!leak) return '';
  const damping = state.leakDamping < 1.0 ? ` (Öffentlichkeit gewöhnt sich — ${Math.round(state.leakDamping * 100)}% der Normaldauer)` : '';
  return `
    <div class="cn-overlay-backdrop">
      <div class="cn-overlay cn-overlay-leak">
        <div class="cn-overlay-tag cn-tag-red">Medien-Leak</div>
        <h2 class="cn-overlay-title">Datenpanne in den Verhandlungen</h2>
        <p class="cn-overlay-body">
          <strong>${PARTY_POSITIONS[leak.partyId]?.fullName || leak.partyId}</strong>s ${leak.text}${damping}.<br>
          Schaden: <span class="cn-red">${leak.damage} Zufriedenheit bei ${PARTY_POSITIONS[leak.partyId]?.fullName || leak.partyId}</span>
        </p>
        <div class="cn-overlay-choices">
          <button class="cn-overlay-choice" data-reaction="apologize">
            <div class="cn-oc-label">Entschuldigen</div>
            <div class="cn-oc-desc">+5 Zufriedenheit · kostet Glaubwürdigkeit in Presse</div>
          </button>
          <button class="cn-overlay-choice" data-reaction="search">
            <div class="cn-oc-label">Leaker suchen (−1 AP)</div>
            <div class="cn-oc-desc">+3 Vertrauen bei allen · kostet 1 Aktionspunkt</div>
          </button>
          <button class="cn-overlay-choice" data-reaction="ignore">
            <div class="cn-oc-label">Ignorieren</div>
            <div class="cn-oc-desc">−5 Zufriedenheit bei allen Parteien · Medien drehen durch</div>
          </button>
        </div>
      </div>
    </div>
  `;
}

export function buildRoundEndOverlay(results, state) {
  return `
    <div class="cn-overlay-backdrop">
      <div class="cn-overlay cn-overlay-round-end">
        <div class="cn-overlay-tag">Runden-Zusammenfassung</div>
        <h2 class="cn-overlay-title">Runde ${state.round - 1} abgeschlossen</h2>

        ${results.agDecays.length > 0 ? `
          <div class="cn-re-section">
            <div class="cn-re-section-title">AG-Stagnation</div>
            ${results.agDecays.map(d => `
              <div class="cn-re-row cn-re-neg">−${d.decay}% in ${d.label} (nicht vorangetrieben)</div>
            `).join('')}
          </div>
        ` : ''}

        <div class="cn-re-section">
          <div class="cn-re-section-title">Medienkommentar</div>
          <div class="cn-re-media">${results.mediaComment}</div>
        </div>

        ${results.interrupts.length > 0 ? `
          <div class="cn-re-section">
            <div class="cn-re-section-title">Ereignisse</div>
            ${results.interrupts.map(intr => {
              if (intr.type === 'leader-change') {
                return `<div class="cn-re-row cn-re-warn">⚡ ${PARTY_POSITIONS[intr.party]?.fullName || intr.party}: Parteichef gestürzt! Neuer Verhandlungsführer ist ${PERSONALITY_LABELS[intr.newPersonality]?.label}.</div>`;
              }
              if (intr.type === 'member-vote') {
                return `<div class="cn-re-row cn-re-warn">⚠ ${PARTY_POSITIONS[intr.party]?.fullName || intr.party}: Basis fordert Mitgliederentscheid über den Vertrag.</div>`;
              }
              return '';
            }).join('')}
          </div>
        ` : ''}

        ${state.isNachtsitzung ? `
          <div class="cn-re-nacht">🌙 Nachtsitzung beginnt! Aktionspunkte sind in Runde ${state.round} unbegrenzt.</div>
        ` : ''}

        <button class="btn btn-primary cn-overlay-continue" id="btn-round-continue">
          ${state.status === 'failed-neuwahl' ? 'Neuwahlen' : `Weiter zu Runde ${state.round}`} →
        </button>
      </div>
    </div>
  `;
}

export function buildMemberVoteOverlay(party, rejected, state) {
  const pData = PARTY_POSITIONS[party];
  return `
    <div class="cn-overlay-backdrop">
      <div class="cn-overlay ${rejected ? 'cn-overlay-danger' : 'cn-overlay-ok'}">
        <div class="cn-overlay-tag ${rejected ? 'cn-tag-red' : 'cn-tag-green'}">Mitgliederentscheid</div>
        <h2 class="cn-overlay-title">${pData?.fullName || party}: Basis hat entschieden</h2>
        <p class="cn-overlay-body">
          ${rejected
            ? `Die Basis von ${pData?.fullName || party} lehnt den bisherigen Verhandlungsstand ab. Mehrere bereits erzielte Einigungen müssen neu verhandelt werden. Fortschritt wurde um 15% zurückgesetzt.`
            : `Die Basis von ${pData?.fullName || party} hat den bisherigen Verhandlungsstand akzeptiert. Die Gespräche können fortgesetzt werden.`
          }
        </p>
        <button class="btn btn-primary cn-overlay-continue" id="btn-vote-continue">
          Weiter →
        </button>
      </div>
    </div>
  `;
}

export function buildContractSummaryOverlay(state) {
  const summary = getContractSummary(state);
  const stoppersOk = checkShowstoppers(state);
  const hasConflicts = summary.filter(s => s.resolved && s.formulation === 'examining').length > 0;

  return `
    <div class="cn-overlay-backdrop">
      <div class="cn-overlay cn-overlay-contract" style="max-width:800px">
        <div class="cn-overlay-tag cn-tag-green">Koalitionsvertrag</div>
        <h2 class="cn-overlay-title">Koalitionsvertrag — Zusammenfassung</h2>

        <div class="cn-contract-grid">
          ${['finanzen','soziales','klima','sicherheit','außen'].map(agId => {
            const ag = WORKING_GROUPS.find(g => g.id === agId);
            const agTopics = summary.filter(s => {
              const a = WORKING_GROUPS.find(g => g.subTopics.some(t => t.id === s.topicLabel || t.label === s.topicLabel));
              return a?.id === agId;
            });
            const agSummary = summary.filter((_, i) => {
              const grouped = WORKING_GROUPS.map(g => g.subTopics).flat();
              const topic = grouped[i];
              return WORKING_GROUPS.find(g => g.id === agId)?.subTopics.some(t => t.id === topic?.id);
            });
            // Get topics for this AG
            const agData = WORKING_GROUPS.find(g => g.id === agId);
            return `
              <div class="cn-contract-ag">
                <div class="cn-contract-ag-title">
                  <span style="background:${agData?.color}" class="cn-ag-color-dot cn-ag-color-dot--sm"></span>
                  ${agData?.label}
                </div>
                ${agData?.subTopics.map(topic => {
                  const agState = state.ags[agId];
                  const resolved = agState?.topics[topic.id];
                  const fmtData = FORMULATIONS.find(f => f.id === resolved?.formulation);
                  return `
                    <div class="cn-contract-topic ${!resolved ? 'cn-ct-open' : `cn-ct-${resolved.formulation}`}">
                      <span class="cn-ct-label">${topic.label}</span>
                      ${resolved
                        ? `<span class="cn-ct-status" style="color:${fmtData?.color}">${fmtData?.label} · ${resolved.value}/100</span>`
                        : `<span class="cn-ct-status cn-ct-missing">Nicht verhandelt</span>`
                      }
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Showstoppers check -->
        <div class="cn-contract-stops">
          <div class="cn-contract-stops-title">Showstopper-Status:</div>
          ${state.coalition.map(p => {
            const pData = PARTY_POSITIONS[p];
            const stops = stoppersOk[p] || [];
            return `
              <div class="cn-contract-party-stops">
                <span class="cn-react-dot" style="background:${pData?.color}"></span>
                <span>${pData?.fullName || p}:</span>
                ${stops.map(ss => `<span class="cn-ct-stop ${ss.met ? 'cn-stop-met' : 'cn-stop-open'}">${ss.met ? '✓' : '✗'} ${ss.label}</span>`).join('')}
              </div>
            `;
          }).join('')}
        </div>

        <button class="btn btn-primary cn-contract-sign-btn" id="btn-contract-sign">
          Koalitionsvertrag unterzeichnen ✓
        </button>
      </div>
    </div>
  `;
}

export function buildKoalitionsausschussOverlay() {
  return `
    <div class="cn-overlay-backdrop">
      <div class="cn-overlay cn-overlay-ausschuss">
        <div class="cn-overlay-tag cn-tag-blue">Koalitionsausschuss</div>
        <h2 class="cn-overlay-title">Wählen Sie Ihren Vertreter</h2>
        <p class="cn-overlay-body">
          Der Koalitionsausschuss tritt monatlich zusammen und schlichtet Streitigkeiten. Wer vertritt Ihre Partei?
        </p>
        <div class="cn-ausschuss-options">
          ${AUSSCHUSS_REPS.map(rep => `
            <button class="cn-ausschuss-opt" data-rep="${rep.id}">
              <div class="cn-ao-label">${rep.label}</div>
              <div class="cn-ao-desc">${rep.desc}</div>
              <div class="cn-ao-effect">${rep.effect}</div>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function buildTopicResultOverlay(results) {
  const { reactions, agId, topicId, interrupts } = results;
  const ag = WORKING_GROUPS.find(g => g.id === agId);
  const topic = ag?.subTopics.find(t => t.id === topicId);

  return `
    <div class="cn-overlay-backdrop cn-overlay-backdrop--sm">
      <div class="cn-overlay cn-overlay-topic-result">
        <div class="cn-overlay-tag cn-tag-green">Verhandlungsergebnis</div>
        <h2 class="cn-overlay-title">${topic?.label || 'Thema'} — Ergebnis</h2>
        <div class="cn-topic-reactions">
          ${Object.entries(reactions || {}).map(([party, r]) => {
            const pData = PARTY_POSITIONS[party];
            return `
              <div class="cn-reaction-row ${r.accepts ? 'cn-react-ok' : 'cn-react-no'}">
                <span class="cn-react-dot" style="background:${pData?.color}"></span>
                <span class="cn-react-name">${pData?.fullName || party}</span>
                <span class="cn-react-icon">${r.accepts ? '✓' : '✗'}</span>
                <span class="cn-react-text">${r.reason}</span>
                <span class="cn-react-delta">${r.satisfactionDelta > 0 ? '+' : ''}${r.satisfactionDelta}</span>
              </div>
            `;
          }).join('')}
        </div>
        ${interrupts?.length > 0 ? `
          <div class="cn-re-section">
            ${interrupts.map(intr => {
              if (intr.type === 'leader-change') return `<div class="cn-re-row cn-re-warn">⚡ Parteichef-Sturz bei ${PARTY_POSITIONS[intr.party]?.fullName || intr.party}! Neuer Typ: ${intr.newPersonality}</div>`;
              if (intr.type === 'member-vote') return `<div class="cn-re-row cn-re-warn">⚠ ${PARTY_POSITIONS[intr.party]?.fullName || intr.party} droht mit Mitgliederentscheid</div>`;
              return '';
            }).join('')}
          </div>
        ` : ''}
        <button class="btn btn-primary cn-overlay-continue" id="btn-result-continue">Weiter</button>
      </div>
    </div>
  `;
}

export function buildPackageResultOverlay(results, state) {
  const { allAccept, reactions } = results;
  return `
    <div class="cn-overlay-backdrop cn-overlay-backdrop--sm">
      <div class="cn-overlay cn-overlay-topic-result">
        <div class="cn-overlay-tag ${allAccept ? 'cn-tag-green' : 'cn-tag-red'}">Paketergebnis</div>
        <h2 class="cn-overlay-title">${allAccept ? 'Paket angenommen' : 'Paket abgelehnt'}</h2>
        <div class="cn-topic-reactions">
          ${Object.entries(reactions || {}).map(([party, r]) => {
            const pData = PARTY_POSITIONS[party];
            return `
              <div class="cn-reaction-row ${r.accepts ? 'cn-react-ok' : 'cn-react-no'}">
                <span class="cn-react-dot" style="background:${pData?.color}"></span>
                <span class="cn-react-name">${pData?.fullName || party}</span>
                <span class="cn-react-icon">${r.accepts ? '✓' : '✗'}</span>
                <span class="cn-react-text">${r.reason}</span>
                ${r.counterDemand ? `<div class="cn-pkg-counter">Gegenforderung: ${r.counterDemand.label}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
        <button class="btn btn-primary cn-overlay-continue" id="btn-result-continue">Weiter</button>
      </div>
    </div>
  `;
}

export function buildMinistryResultOverlay(ministry, toParty, result) {
  const pData = PARTY_POSITIONS[toParty];
  return `
    <div class="cn-overlay-backdrop cn-overlay-backdrop--sm">
      <div class="cn-overlay cn-overlay-topic-result">
        <div class="cn-overlay-tag ${result.accepts ? 'cn-tag-green' : 'cn-tag-red'}">Ministeriumsangebot</div>
        <h2 class="cn-overlay-title">${ministry} → ${pData?.fullName || toParty}</h2>
        <div class="cn-topic-reactions">
          <div class="cn-reaction-row ${result.accepts ? 'cn-react-ok' : 'cn-react-no'}">
            <span class="cn-react-dot" style="background:${pData?.color}"></span>
            <span class="cn-react-name">${pData?.fullName || toParty}</span>
            <span class="cn-react-icon">${result.accepts ? '✓' : '✗'}</span>
            <span class="cn-react-text">${result.reason}</span>
            ${result.accepts ? `<span class="cn-react-delta">${result.satisfactionDelta > 0 ? '+' : ''}${result.satisfactionDelta} Zufriedenheit</span>` : ''}
          </div>
        </div>
        <button class="btn btn-primary cn-overlay-continue" id="btn-result-continue">Weiter</button>
      </div>
    </div>
  `;
}

export function buildFailedOverlay(state) {
  return `
    <div class="cn-overlay-backdrop">
      <div class="cn-overlay cn-overlay-danger">
        <div class="cn-overlay-tag cn-tag-red">Verhandlungen gescheitert</div>
        <h2 class="cn-overlay-title">Koalitionsbildung nicht möglich</h2>
        <p class="cn-overlay-body">
          Nach ${state.maxRounds} Verhandlungsrunden konnte keine Einigung erzielt werden.
          Gesamtfortschritt: ${getOverallProgress(state)}%.
          ${getOverallProgress(state) >= 40
            ? 'Eine Minderheitsregierung ist möglich, aber instabil.'
            : 'Neuwahlen sind unvermeidlich.'
          }
        </p>
        <div class="cn-overlay-choices">
          ${getOverallProgress(state) >= 40 ? `
            <button class="cn-overlay-choice" id="btn-minority-gov">
              <div class="cn-oc-label">Minderheitsregierung</div>
              <div class="cn-oc-desc">Instabile Regierung ohne Mehrheit. Hohe Koalitionsspannung.</div>
            </button>
          ` : ''}
          <button class="cn-overlay-choice" id="btn-neuwahl">
            <div class="cn-oc-label">Neuwahlen ausrufen</div>
            <div class="cn-oc-desc">Zurück zur Wahlkampf-Phase.</div>
          </button>
        </div>
      </div>
    </div>
  `;
}
