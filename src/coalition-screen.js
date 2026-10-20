// ============================================================
// COALITION-SCREEN.JS — Koalitionsverhandlungs-UI (4 Phasen)
// ============================================================

import { PARTY_POSITIONS, MINISTERIEN } from './engine/state.js';
import { conductExploratoryTalks } from './parties/coalition.js';

export const POLICY_AREAS = [
  { key: 'schuldenbremse',          label: 'Schuldenbremse & Haushalt',  leftLabel: 'Keine Schuldenbremse',   rightLabel: 'Strikte Schuldenbremse' },
  { key: 'migration',               label: 'Migrationspolitik',           leftLabel: 'Sehr restriktiv',         rightLabel: 'Sehr offen'             },
  { key: 'klimaschutz',             label: 'Klimaschutz & Energie',       leftLabel: 'Geringe Ambitionen',      rightLabel: 'Höchste Ambitionen'     },
  { key: 'sozialstaat',             label: 'Sozialleistungen & Rente',    leftLabel: 'Schlanker Sozialstaat',   rightLabel: 'Starker Sozialstaat'    },
  { key: 'nato',                    label: 'Verteidigung & NATO',         leftLabel: 'NATO-kritisch',           rightLabel: 'Starkes Engagement'     },
  { key: 'wirtschaftsliberalismus', label: 'Wirtschaftspolitik',          leftLabel: 'Staatsorientiert',        rightLabel: 'Marktliberal'           },
  { key: 'euIntegration',           label: 'Europapolitik',               leftLabel: 'EU-skeptisch',            rightLabel: 'Pro-europäisch'         },
  { key: 'inneresSicherheit',       label: 'Innere Sicherheit',           leftLabel: 'Bürgerrechtsfokus',       rightLabel: 'Sicherheitsfokus'       },
];

// ── SHARED HELPERS ───────────────────────────────────────────

export function getRedLineViolations(policyKey, meanValue, coalition) {
  const violations = [];
  for (const party of coalition) {
    for (const rl of PARTY_POSITIONS[party]?.redLines || []) {
      const parts = rl.split(' ');
      if (parts.length !== 3) continue;
      const [area, op, threshold] = parts;
      if (area !== policyKey) continue;
      const t = parseFloat(threshold);
      const violated = op === '<' ? meanValue < t : meanValue > t;
      if (violated) violations.push({ party, redLine: rl });
    }
  }
  return violations;
}

function computePairCompatibility(partyA, partyB) {
  const a = PARTY_POSITIONS[partyA];
  const b = PARTY_POSITIONS[partyB];
  if (!a || !b) return 0;
  const areas = Object.keys(a.positions);
  let total = 0;
  for (const area of areas) total += Math.abs((a.positions[area] || 50) - (b.positions[area] || 50));
  return Math.max(0, 100 - total / areas.length);
}

function policyStatus(policyKey, coalition, playerPositions, playerParty) {
  const values = coalition.map(p =>
    p === playerParty
      ? (playerPositions[policyKey] ?? PARTY_POSITIONS[p]?.positions[policyKey] ?? 50)
      : (PARTY_POSITIONS[p]?.positions[policyKey] ?? 50)
  );
  const mean   = values.reduce((a, b) => a + b, 0) / values.length;
  const spread = Math.max(...values) - Math.min(...values);
  const violations = getRedLineViolations(policyKey, mean, coalition);
  if (violations.length > 0)  return { status: 'red',    label: `Rote Linie: ${violations.map(v => v.party).join(', ')}`, mean, spread, violations };
  if (spread > 40)             return { status: 'red',    label: 'Zu weit auseinander', mean, spread, violations: [] };
  if (spread > 20)             return { status: 'yellow', label: 'Schwieriger Kompromiss', mean, spread, violations: [] };
  return                               { status: 'green',  label: 'Einigung möglich', mean, spread, violations: [] };
}

export function buildOverallStatusHTML(coalition, playerPositions, playerParty) {
  let conflicts = 0, compromises = 0;
  for (const area of POLICY_AREAS) {
    const s = policyStatus(area.key, coalition, playerPositions, playerParty);
    if (s.status === 'red') conflicts++;
    else if (s.status === 'yellow') compromises++;
  }
  const agreed = POLICY_AREAS.length - conflicts - compromises;
  return `
    <span class="coal-ovr-item coal-ovr-green">${agreed} Einigung${agreed !== 1 ? 'en' : ''}</span>
    <span class="coal-ovr-item coal-ovr-yellow">${compromises} Kompromiss${compromises !== 1 ? 'e' : ''}</span>
    <span class="coal-ovr-item coal-ovr-red">${conflicts} Konflikt${conflicts !== 1 ? 'e' : ''}</span>
  `;
}

// ── PHASE 1: SONDIERUNG ──────────────────────────────────────

function getSondierungReason(party, playerParty, willing) {
  const data = PARTY_POSITIONS[party];
  const playerData = PARTY_POSITIONS[playerParty];
  if (party === 'AfD') return 'Alle anderen Parteien verweigern eine Zusammenarbeit (Brandmauer).';
  if (data?.isPariah) return 'Diese Partei wird von demokratischen Parteien gemieden.';
  if (!willing) {
    const compat = computePairCompatibility(playerParty, party);
    if (compat < 30) return `Zu große ideologische Distanz zu ${playerData?.fullName || playerParty}.`;
    return `${data?.fullName || party} sieht keine ausreichende programmatische Schnittmenge.`;
  }
  if (data?.koalitionspräferenz?.includes(playerParty)) return `${playerData?.fullName || playerParty} steht auf der Wunschliste von ${data?.fullName || party}.`;
  const compat = computePairCompatibility(playerParty, party);
  if (compat > 60) return 'Gute programmatische Übereinstimmungen in mehreren Bereichen.';
  return 'Bereit zur Sondierung — Kompromisse werden aber schwierig.';
}

export function buildSondierungHTML(electionResult, playerParty, suggestedParties) {
  const willingToTalk = conductExploratoryTalks(electionResult, playerParty);
  const { seats, majorityNeeded } = electionResult;
  const playerSeats = seats[playerParty] || 0;
  const parties = Object.keys(seats)
    .filter(p => seats[p] > 0 && p !== playerParty)
    .sort((a, b) => seats[b] - seats[a]);

  const pData = PARTY_POSITIONS[playerParty];

  return `
    <div class="coal-wrap">
      <div class="coal-header">
        <div class="coal-phase-badge">Phase 1 von 4 — Sondierung</div>
        <h1 class="coal-title">Sondierungsgespräche</h1>
        <p class="coal-subtitle">Klären Sie, welche Parteien zu Koalitionsgesprächen bereit sind. Mehrheit: ${majorityNeeded} Sitze.</p>
      </div>

      <div class="coal-grid">
        <div class="coal-main">
          <div class="card">
            <div class="card-title">Sondierungsbereitschaft der Parteien</div>
            <div class="sond-list">
              ${parties.map(party => {
                const d = PARTY_POSITIONS[party];
                const willing = willingToTalk[party];
                const preChecked = suggestedParties.includes(party);
                const reason = getSondierungReason(party, playerParty, willing);
                return `
                  <div class="sond-row${willing ? '' : ' sond-row--no'}">
                    <div class="sond-row-left">
                      <span class="sond-dot" style="background:${d?.color}"></span>
                      <div class="sond-info">
                        <div class="sond-name">${d?.fullName || party}</div>
                        <div class="sond-seats">${seats[party]} Sitze</div>
                        <div class="sond-reason">${reason}</div>
                      </div>
                    </div>
                    <div class="sond-row-right">
                      ${willing
                        ? `<span class="sond-pill sond-pill-yes">Bereit</span>
                           <label class="sond-check-label">
                             <input type="checkbox" class="sond-check" data-party="${party}" data-seats="${seats[party]}" ${preChecked ? 'checked' : ''}>
                             <span class="sond-check-text">Einladen</span>
                           </label>`
                        : `<span class="sond-pill sond-pill-no">Lehnt ab</span>`
                      }
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="coal-side">
          <div class="card">
            <div class="card-title">Ihre Partei</div>
            <div class="coal-player-card">
              <span class="sond-dot" style="background:${pData?.color}"></span>
              <div>
                <div class="coal-player-name">${pData?.fullName || playerParty}</div>
                <div class="coal-player-seats">${playerSeats} Sitze</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">Mehrheitsrechner</div>
            <div class="coal-calc">
              <div class="coal-calc-row">
                <span class="coal-calc-label">Koalitionssitze</span>
                <span class="coal-calc-val" id="sond-total-seats">${playerSeats}</span>
              </div>
              <div class="coal-calc-row">
                <span class="coal-calc-label">Mehrheit ab</span>
                <span class="coal-calc-val">${majorityNeeded}</span>
              </div>
              <div class="coal-maj-track">
                <div class="coal-maj-fill" id="sond-maj-fill" style="width:${Math.min(100, playerSeats / 630 * 100).toFixed(1)}%"></div>
                <div class="coal-maj-marker" style="left:${(majorityNeeded / 630 * 100).toFixed(1)}%"></div>
              </div>
              <div id="sond-majority-verdict" class="coal-majority-verdict">
                <span class="coal-verdict-no">Keine Mehrheit</span>
              </div>
            </div>
          </div>

          <button class="btn btn-primary coal-action-btn" id="btn-to-phase2" disabled>
            Verhandlungen starten →
          </button>
          <div class="coal-action-hint" id="sond-hint">Wählen Sie Parteien, die gemeinsam eine Mehrheit ergeben.</div>
        </div>
      </div>
    </div>
  `;
}

// ── PHASE 2: POLITISCHE VERHANDLUNG ─────────────────────────

function buildPolicyRowHTML(area, coalition, playerPositions, playerParty) {
  const positions = coalition.map(p => ({
    party: p,
    value: p === playerParty
      ? (playerPositions[area.key] ?? PARTY_POSITIONS[p]?.positions[area.key] ?? 50)
      : (PARTY_POSITIONS[p]?.positions[area.key] ?? 50),
    color: PARTY_POSITIONS[p]?.color || '#888',
    isPlayer: p === playerParty,
  }));

  const values  = positions.map(p => p.value);
  const mean    = values.reduce((a, b) => a + b, 0) / values.length;
  const minVal  = Math.min(...values);
  const maxVal  = Math.max(...values);
  const spread  = maxVal - minVal;
  const violations = getRedLineViolations(area.key, mean, coalition);

  let status = 'green', statusLabel = 'Einigung möglich';
  if (violations.length > 0)  { status = 'red';    statusLabel = `Rote Linie: ${violations.map(v => v.party).join(', ')}`; }
  else if (spread > 40)       { status = 'red';    statusLabel = 'Positionen zu weit auseinander'; }
  else if (spread > 20)       { status = 'yellow'; statusLabel = 'Schwieriger Kompromiss'; }

  const playerPos = positions.find(p => p.isPlayer);
  const playerVal = playerPos?.value ?? 50;
  const playerColor = playerPos?.color ?? '#888';

  return `
    <div class="coal-policy-row" data-area="${area.key}" data-status="${status}">
      <div class="coal-policy-header">
        <div class="coal-policy-name">${area.label}</div>
        <div class="coal-status-light coal-status-${status}">
          <span class="coal-status-dot"></span>
          <span class="coal-status-label">${statusLabel}</span>
        </div>
      </div>

      <div class="coal-scale-wrap">
        <div class="coal-scale-track">
          <div class="coal-compromise-zone" style="left:${minVal.toFixed(1)}%;width:${Math.max(0, spread).toFixed(1)}%"></div>
          <div class="coal-mean-marker" style="left:${mean.toFixed(1)}%"></div>
          ${positions.filter(p => !p.isPlayer).map(p => `
            <div class="coal-party-marker" style="left:${p.value.toFixed(1)}%;background:${p.color}" title="${PARTY_POSITIONS[p.party]?.fullName || p.party}: ${Math.round(p.value)}"></div>
          `).join('')}
          <div class="coal-player-marker" id="pm-${area.key}" style="left:${playerVal.toFixed(1)}%;background:${playerColor}" title="${PARTY_POSITIONS[playerParty]?.fullName || playerParty}: ${Math.round(playerVal)}"></div>
        </div>
        <div class="coal-scale-labels">
          <span>${area.leftLabel}</span>
          <span>${area.rightLabel}</span>
        </div>
      </div>

      <div class="coal-slider-row">
        <span class="coal-slider-party" style="color:${playerColor}">Ihre Position:</span>
        <input type="range" class="coal-slider" data-area="${area.key}" min="0" max="100" step="1" value="${Math.round(playerVal)}">
        <span class="coal-slider-val" id="val-${area.key}">${Math.round(playerVal)}</span>
      </div>

      ${violations.length > 0 ? `
        <div class="coal-redline-warning">
          ⚠ ${violations.map(v => `${v.party}: ${v.redLine}`).join(' · ')}
        </div>
      ` : ''}
    </div>
  `;
}

export function buildVerhandlungHTML(coalition, playerPositions, playerParty) {
  return `
    <div class="coal-wrap">
      <div class="coal-header">
        <div class="coal-phase-badge">Phase 2 von 4 — Inhaltliche Verhandlung</div>
        <h1 class="coal-title">Politikfelder verhandeln</h1>
        <p class="coal-subtitle">Legen Sie Ihre Positionen fest. Rote Linien der Partner werden sofort markiert.</p>
      </div>

      <div class="coal-legend">
        ${coalition.map(p => {
          const d = PARTY_POSITIONS[p];
          return `<div class="coal-legend-item">
            <span class="coal-legend-dot${p === playerParty ? ' coal-legend-dot--player' : ''}" style="background:${d?.color}"></span>
            <span>${d?.fullName || p}${p === playerParty ? ' (Sie)' : ''}</span>
          </div>`;
        }).join('')}
        <div class="coal-legend-item coal-legend-mean">
          <span class="coal-legend-mean-line"></span>
          <span>Kompromiss-Mittelwert</span>
        </div>
      </div>

      <div class="coal-policy-list" id="coal-policy-list">
        ${POLICY_AREAS.map(area => buildPolicyRowHTML(area, coalition, playerPositions, playerParty)).join('')}
      </div>

      <div class="coal-phase2-footer">
        <div class="coal-overall-status" id="coal-overall-status">
          ${buildOverallStatusHTML(coalition, playerPositions, playerParty)}
        </div>
        <button class="btn btn-primary coal-action-btn" id="btn-to-phase3">
          Zu Phase 3: Ministerienverteilung →
        </button>
      </div>
    </div>
  `;
}

// ── PHASE 3: MINISTERIENVERTEILUNG ───────────────────────────

export function buildMinisterienHTML(coalition, seats, assignments, entitlements, playerParty) {
  const counts = {};
  for (const p of coalition) counts[p] = 0;
  for (const party of Object.values(assignments)) {
    if (counts[party] !== undefined) counts[party]++;
  }

  return `
    <div class="coal-wrap">
      <div class="coal-header">
        <div class="coal-phase-badge">Phase 3 von 4 — Ministerienverteilung</div>
        <h1 class="coal-title">Kabinettsposten verteilen</h1>
        <p class="coal-subtitle">Verteilung nach Sitzanteilen. Sie können Ministerien per Dropdown umverteilen.</p>
      </div>

      <div class="coal-entitlement-row">
        ${coalition.map(p => {
          const d = PARTY_POSITIONS[p];
          const count = counts[p] || 0;
          const ent = entitlements[p] || 0;
          return `
            <div class="coal-ent-item">
              <span class="coal-ent-dot" style="background:${d?.color}"></span>
              <span class="coal-ent-name">${p === playerParty ? `${d?.fullName || p} (Sie)` : d?.fullName || p}</span>
              <span class="coal-ent-count${count !== ent ? ' coal-ent-warn' : ''}" data-party="${p}">${count}/${ent}</span>
            </div>
          `;
        }).join('')}
      </div>

      <div class="coal-ministry-grid" id="coal-ministry-grid">
        ${MINISTERIEN.map(min => {
          const assigned = assignments[min.name];
          const d = PARTY_POSITIONS[assigned];
          return `
            <div class="coal-ministry-card" data-ministry="${min.name}">
              <div class="coal-ministry-head">
                <span class="coal-ministry-name">${min.name}</span>
                <div class="coal-ministry-influence">
                  ${Array.from({length: 10}, (_, i) => `<span class="coal-pip${i < min.power ? ' coal-pip--on' : ''}"></span>`).join('')}
                </div>
              </div>
              <div class="coal-ministry-policy">Politikfeld: ${min.policyArea}</div>
              <div class="coal-ministry-assign">
                <span class="coal-ministry-dot" id="mdot-${min.name}" style="background:${d?.color || '#888'}"></span>
                <select class="coal-ministry-select" data-ministry="${min.name}">
                  ${coalition.map(p => `
                    <option value="${p}" ${p === assigned ? 'selected' : ''}>${PARTY_POSITIONS[p]?.fullName || p}</option>
                  `).join('')}
                </select>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="coal-phase3-footer">
        <button class="btn btn-primary coal-action-btn" id="btn-to-phase4">
          Zum Koalitionsvertrag →
        </button>
      </div>
    </div>
  `;
}

// ── PHASE 4: KOALITIONSVERTRAG ────────────────────────────────

export function buildVertragHTML(coalition, playerPositions, playerParty, policyResults, assignments, entitlements) {
  const hasConflicts = Object.values(policyResults).some(r => r.status === 'conflict');
  const coalName = coalition.join(' + ');

  const byParty = {};
  for (const p of coalition) byParty[p] = [];
  for (const [min, party] of Object.entries(assignments)) {
    if (byParty[party]) byParty[party].push(min);
  }

  return `
    <div class="coal-wrap">
      <div class="coal-header">
        <div class="coal-phase-badge">Phase 4 von 4 — Koalitionsvertrag</div>
        <h1 class="coal-title">Koalitionsvertrag</h1>
        <p class="coal-subtitle">Zusammenfassung aller Verhandlungsergebnisse für ${coalName}.</p>
      </div>

      <div class="coal-grid">
        <div class="coal-main">
          <div class="card">
            <div class="card-title">Vereinbarte Positionen</div>
            <table class="coal-vertrag-table">
              <thead>
                <tr>
                  <th>Politikfeld</th>
                  <th>Vereinbarte Position</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${POLICY_AREAS.map(area => {
                  const r = policyResults[area.key];
                  const status = r?.status || 'conflict';
                  const pos = r?.agreedPosition;
                  return `
                    <tr class="coal-vertrag-row coal-vertrag-row--${status}">
                      <td class="coal-vertrag-area">${area.label}</td>
                      <td class="coal-vertrag-pos">
                        ${pos != null ? `
                          <div class="coal-mini-scale">
                            <div class="coal-mini-fill" style="width:${pos}%"></div>
                          </div>
                          <span class="coal-mini-val">${pos}</span>
                        ` : '<span class="coal-no-agreement">—</span>'}
                      </td>
                      <td>${buildStatusBadge(status, r?.description)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="coal-side">
          <div class="card">
            <div class="card-title">Kabinett</div>
            ${coalition.map(p => {
              const d = PARTY_POSITIONS[p];
              const mins = byParty[p] || [];
              return `
                <div class="coal-cabinet-party">
                  <div class="coal-cabinet-head">
                    <span class="coal-ent-dot" style="background:${d?.color}"></span>
                    <span class="coal-cabinet-name">${d?.fullName || p}${p === playerParty ? ' (Sie)' : ''}</span>
                    <span class="coal-cabinet-count">${mins.length} Min.</span>
                  </div>
                  <div class="coal-cabinet-mins">
                    ${mins.map(m => `<span class="coal-cabinet-tag">${m}</span>`).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          ${hasConflicts ? `
            <div class="coal-conflict-box">
              <div class="coal-conflict-title">⛔ Offene Konflikte</div>
              <div class="coal-conflict-list">
                ${POLICY_AREAS
                  .filter(a => policyResults[a.key]?.status === 'conflict')
                  .map(a => `<div class="coal-conflict-item">${a.label}: ${policyResults[a.key]?.description || 'Keine Einigung'}</div>`)
                  .join('')}
              </div>
            </div>
          ` : `
            <div class="coal-success-box">
              <div class="coal-success-title">✓ Vertrag unterzeichnungsreif</div>
              <div class="coal-success-desc">Alle Politikfelder haben eine tragfähige Einigung erreicht.</div>
            </div>
          `}

          <button class="btn btn-primary coal-action-btn coal-sign-btn" id="btn-sign-contract"${hasConflicts ? ' disabled' : ''}>
            Koalitionsvertrag unterzeichnen ✓
          </button>
          ${hasConflicts ? `<div class="coal-action-hint">Lösen Sie erst alle Konflikte in Phase 2.</div>` : ''}

          <button class="btn btn-ghost coal-action-btn" id="btn-back-to-phase2" style="margin-top:8px">
            ← Zurück zu Phase 2
          </button>
        </div>
      </div>
    </div>
  `;
}

function buildStatusBadge(status, description) {
  const desc = description ? ` title="${description}"` : '';
  if (status === 'agreed')     return `<span class="coal-badge-agreed"${desc}>Einigung</span>`;
  if (status === 'compromise') return `<span class="coal-badge-compromise"${desc}>Kompromiss</span>`;
  return `<span class="coal-badge-conflict"${desc}>Konflikt</span>`;
}

// ── NEGOTIATION RESULT COMPUTATION ───────────────────────────

export function computeNegotiationResults(coalition, playerPositions, playerParty) {
  const results = {};
  for (const area of POLICY_AREAS) {
    const values = coalition.map(p =>
      p === playerParty
        ? (playerPositions[area.key] ?? PARTY_POSITIONS[p]?.positions[area.key] ?? 50)
        : (PARTY_POSITIONS[p]?.positions[area.key] ?? 50)
    );
    const mean    = values.reduce((a, b) => a + b, 0) / values.length;
    const spread  = Math.max(...values) - Math.min(...values);
    const violations = getRedLineViolations(area.key, mean, coalition);

    if (violations.length > 0) {
      results[area.key] = { status: 'conflict', agreedPosition: null, spread, description: `Rote Linie verletzt (${violations.map(v => v.party).join(', ')})` };
    } else if (spread > 40) {
      results[area.key] = { status: 'conflict', agreedPosition: null, spread, description: `Spread ${Math.round(spread)} — zu weit auseinander` };
    } else if (spread > 20) {
      results[area.key] = { status: 'compromise', agreedPosition: Math.round(mean), spread, description: `Kompromiss bei ${Math.round(mean)}` };
    } else {
      results[area.key] = { status: 'agreed',    agreedPosition: Math.round(mean), spread, description: `Einigung bei ${Math.round(mean)}` };
    }
  }
  return results;
}
