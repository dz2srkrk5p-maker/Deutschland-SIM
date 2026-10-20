// Parliament screen — hemicycle SVG + HTML

const POLITICAL_ORDER = ['Linke', 'BSW', 'Grüne', 'SPD', 'FDP', 'CDU', 'AfD'];

const PARTY_COLORS = {
  CDU: '#555555', SPD: '#E3000F', Grüne: '#1AA037',
  FDP: '#D4BC00', AfD: '#009EE0', Linke: '#BE3075', BSW: '#8B2FC0',
};

const PARTY_FULLNAMES = {
  CDU: 'CDU/CSU', SPD: 'SPD', Grüne: 'Grüne', FDP: 'FDP',
  AfD: 'AfD', Linke: 'Die Linke', BSW: 'BSW',
};

// ── HEMICYCLE SVG ─────────────────────────────────────────────
// Each party occupies a continuous radial wedge from inner to outer ring.
// Seat assignment is angle-based (not sequential), so parties form solid sectors.

export function hemicycleSVG(seats, coalition) {
  const total = Object.values(seats).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return `<svg viewBox="0 0 560 280"><text x="280" y="140" text-anchor="middle" fill="#8b949e" font-family="sans-serif" font-size="13">Keine Parlamentsdaten</text></svg>`;
  }

  // Left-to-right political order
  const orderedParties = [
    ...POLITICAL_ORDER.filter(p => seats[p] > 0),
    ...Object.keys(seats).filter(p => !POLITICAL_ORDER.includes(p) && seats[p] > 0),
  ];

  // Compute fractional angular boundaries for each party.
  // Fraction 0 = leftmost seat, 1 = rightmost seat.
  // Party wedges span [startFrac, endFrac] across ALL rings.
  const partyBounds = [];
  let cum = 0;
  for (const p of orderedParties) {
    const f = seats[p] / total;
    partyBounds.push({ party: p, start: cum, end: cum + f });
    cum += f;
  }

  // Hemicycle geometry
  const W = 560, H = 285;
  const cx = W / 2, cy = H - 5;
  const nRows = 9;
  const rMin = 62, rMax = 248;
  const SEAT_R = 3.2;
  const margin = 0.055;
  const aMax = Math.PI * (1 - margin);
  const aMin = Math.PI * margin;
  const angRange = aMax - aMin;

  // Seats per row proportional to arc length (∝ radius)
  const radii = Array.from({ length: nRows }, (_, i) => rMin + (rMax - rMin) * i / (nRows - 1));
  const arcSum = radii.reduce((s, r) => s + r, 0);
  const rowCounts = radii.map(r => Math.round((r / arcSum) * total));
  rowCounts[nRows - 1] += total - rowCounts.reduce((s, n) => s + n, 0);

  const parts = [];

  // Outer arc guide line
  const arcPts = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const a = aMax - t * angRange;
    arcPts.push(`${(cx + (rMax + 18) * Math.cos(a)).toFixed(1)},${(cy - (rMax + 18) * Math.sin(a)).toFixed(1)}`);
  }
  parts.push(`<polyline points="${arcPts.join(' ')}" stroke="#21262d" stroke-width="1.5" fill="none"/>`);
  parts.push(`<line x1="18" y1="${cy}" x2="${W - 18}" y2="${cy}" stroke="#21262d" stroke-width="1.5"/>`);

  // Party divider lines (radial lines between wedges, spanning inner to outer ring)
  for (let b = 1; b < partyBounds.length; b++) {
    const f = partyBounds[b].start;
    const a = aMax - f * angRange;
    const x1 = (cx + rMin * Math.cos(a)).toFixed(1);
    const y1 = (cy - rMin * Math.sin(a)).toFixed(1);
    const x2 = (cx + rMax * Math.cos(a)).toFixed(1);
    const y2 = (cy - rMax * Math.sin(a)).toFixed(1);
    parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0d1117" stroke-width="1.5"/>`);
  }

  // Seats — assigned by angular position so each party forms a radial wedge
  for (let row = 0; row < nRows; row++) {
    const r = radii[row];
    const n = rowCounts[row];
    for (let s = 0; s < n; s++) {
      const t = n > 1 ? s / (n - 1) : 0.5; // fraction 0 (left) → 1 (right)
      // Find party whose angular range [start, end] contains t
      let party = orderedParties[orderedParties.length - 1];
      for (const b of partyBounds) {
        if (t >= b.start - 0.0001 && t < b.end + 0.0001) { party = b.party; break; }
      }
      const angle = aMax - t * angRange;
      const x = (cx + r * Math.cos(angle)).toFixed(1);
      const y = (cy - r * Math.sin(angle)).toFixed(1);
      const inCoal = coalition.includes(party);
      const color = PARTY_COLORS[party] || '#666';
      const opacity = inCoal ? '1' : '0.3';
      parts.push(`<circle cx="${x}" cy="${y}" r="${SEAT_R}" fill="${color}" opacity="${opacity}"/>`);
    }
  }

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;">${parts.join('')}</svg>`;
}

// ── PARLIAMENT SCREEN HTML ────────────────────────────────────

export function buildParliamentHTML(state, voncResult) {
  const seats          = state.parliament?.seats        || {};
  const majorityNeeded = state.parliament?.majorityNeeded || 316;
  const coalition      = state.government?.coalition    || [];
  const chancellorParty = state.government?.chancellorParty || '';
  const termQuarter    = state.government?.termQuarter  || 0;
  const stability      = state.politics?.coalitionStability || 0;
  const phase          = state.phase || 'governing';

  const totalSeats    = Object.values(seats).reduce((a, b) => a + b, 0);
  const coalitionSeats = coalition.reduce((s, p) => s + (seats[p] || 0), 0);
  const hasMajority   = coalitionSeats >= majorityNeeded;

  // Political order for hemicycle & legend
  const hemicycleParties = [
    ...POLITICAL_ORDER.filter(p => seats[p] > 0),
    ...Object.keys(seats).filter(p => !POLITICAL_ORDER.includes(p) && seats[p] > 0),
  ];

  // Table order: coalition first (kanzler top), then opposition by size
  const tableParties = [...hemicycleParties].sort((a, b) => {
    const ac = coalition.includes(a), bc = coalition.includes(b);
    if (ac !== bc) return ac ? -1 : 1;
    const aK = a === chancellorParty, bK = b === chancellorParty;
    if (aK !== bK) return aK ? -1 : 1;
    return seats[b] - seats[a];
  });

  const stabColor = stability < 20 ? '#f85149' : stability < 40 ? '#d29922' : '#3fb950';
  const voncActive = stability < 30 && phase === 'governing';

  const largestOpposition = hemicycleParties
    .filter(p => !coalition.includes(p))
    .sort((a, b) => seats[b] - seats[a])[0] || '';

  return `
<div class="parl-wrap">
  <div class="parl-header">
    <button class="btn btn-ghost" id="parl-back">&#8592; Dashboard</button>
    <div class="parl-header-center">
      <span class="parl-title">Bundestag</span>
      <span class="parl-meta">${state.year ?? ''} &middot; ${totalSeats} Mandate &middot; Mehrheit ab ${majorityNeeded}</span>
    </div>
  </div>

  <div class="parl-grid">

    <!-- LEFT: Hemicycle + Table -->
    <div class="parl-col-left">
      <div class="card">
        <div class="card-title">Sitzverteilung</div>
        <div class="parl-hemi-wrap">${hemicycleSVG(seats, coalition)}</div>
        <div class="parl-legend">
          ${hemicycleParties.map(p => `
            <div class="parl-legend-item${coalition.includes(p) ? '' : ' parl-legend-opp'}">
              <span class="parl-legend-dot" style="background:${PARTY_COLORS[p] || '#888'}"></span>
              <span class="parl-legend-name">${p}</span>
              <span class="parl-legend-seats">${seats[p]}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-title">Fraktionen</div>
        <table class="parl-table">
          <thead>
            <tr>
              <th>Partei</th>
              <th class="parl-num">Sitze</th>
              <th class="parl-num">Anteil</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableParties.map(p => {
              const pct = totalSeats > 0 ? ((seats[p] / totalSeats) * 100).toFixed(1) : '0.0';
              const isKanzler = p === chancellorParty;
              const isCoal    = coalition.includes(p);
              const label     = isKanzler ? 'Kanzlerpartei' : isCoal ? 'Koalition' : 'Opposition';
              const pillCls   = isKanzler ? 'parl-pill-kanzler' : isCoal ? 'parl-pill-coal' : 'parl-pill-opp';
              return `
              <tr class="${isCoal ? '' : 'parl-row-opp'}">
                <td>
                  <span class="parl-party-dot" style="background:${PARTY_COLORS[p] || '#888'}"></span>
                  ${PARTY_FULLNAMES[p] || p}
                </td>
                <td class="parl-num parl-bold">${seats[p]}</td>
                <td class="parl-num parl-muted">${pct}%</td>
                <td><span class="parl-status-pill ${pillCls}">${label}</span></td>
              </tr>`;
            }).join('')}
          </tbody>
          <tfoot>
            <tr class="parl-tfoot-total">
              <td>Gesamt</td>
              <td class="parl-num parl-bold">${totalSeats}</td>
              <td class="parl-num parl-muted">100%</td>
              <td></td>
            </tr>
            <tr class="parl-tfoot-note">
              <td colspan="4">
                Koalition: <strong>${coalitionSeats}</strong> Sitze
                <span class="${hasMajority ? 'parl-major-yes' : 'parl-major-no'}">
                  &mdash; ${hasMajority ? 'Mehrheit gesichert' : 'keine Mehrheit'}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- RIGHT: Coalition Info + VoNC -->
    <div class="parl-col-right">
      <div class="card">
        <div class="card-title">Regierungskoalition</div>

        <div class="parl-coal-parties">
          ${coalition.map(p => `
            <div class="parl-coal-badge" style="border-left-color:${PARTY_COLORS[p] || '#888'}">
              <span class="parl-coal-dot" style="background:${PARTY_COLORS[p] || '#888'}"></span>
              <span class="parl-coal-name">${PARTY_FULLNAMES[p] || p}</span>
              <span class="parl-coal-seats">${seats[p] || 0}</span>
            </div>
          `).join('')}
        </div>

        <div class="parl-coal-stats">
          <div class="parl-coal-row">
            <span class="parl-coal-label">Kanzler-Partei</span>
            <span class="parl-coal-val">${PARTY_FULLNAMES[chancellorParty] || chancellorParty || '—'}</span>
          </div>
          <div class="parl-coal-row">
            <span class="parl-coal-label">Im Amt seit</span>
            <span class="parl-coal-val">${termQuarter}&nbsp;Q&thinsp;(${(termQuarter / 4).toFixed(1)}&nbsp;J.)</span>
          </div>
          <div class="parl-coal-row">
            <span class="parl-coal-label">Koalitionsmandate</span>
            <span class="parl-coal-val ${hasMajority ? 'parl-major-yes' : 'parl-major-no'}">${coalitionSeats}&nbsp;/&nbsp;${majorityNeeded}</span>
          </div>
        </div>

        <div class="parl-stab-block">
          <div class="parl-stab-header">
            <span class="parl-coal-label">Koalitionsstabilität</span>
            <span class="parl-stab-num" style="color:${stabColor}">${stability.toFixed(0)}</span>
          </div>
          <div class="parl-stab-track">
            <div class="parl-stab-fill" style="width:${Math.min(100, stability).toFixed(0)}%;background:${stabColor}"></div>
            <div class="parl-stab-threshold" title="Schwelle für Misstrauensvotum"></div>
          </div>
          <div class="parl-stab-hint">Misstrauensvotum möglich wenn &lt;&nbsp;30</div>
        </div>
      </div>

      <div class="card" id="vonc-card">
        <div class="card-title">Misstrauensvotum</div>
        ${voncResult ? buildVoncResult(voncResult) : buildVoncButton(voncActive, largestOpposition)}
      </div>
    </div>

  </div>
</div>`;
}

// ── VOTE OF NO CONFIDENCE ──────────────────────────────────────

function buildVoncButton(active, initiator) {
  return `
    <p class="parl-vonc-desc">
      In Deutschland ist nur ein <strong>konstruktives Misstrauensvotum</strong> möglich —
      die Opposition muss gleichzeitig einen neuen Kanzler wählen.
    </p>
    <button
      class="btn ${active ? 'btn-danger' : 'btn-ghost'} parl-vonc-btn"
      id="btn-vonc"
      ${active ? '' : 'disabled'}
      data-initiator="${initiator}"
    >${active ? 'Misstrauensvotum einleiten' : 'Stabilität zu hoch'}</button>
    ${!active ? `<p class="parl-vonc-inactive">Koalitionsstabilität muss unter 30 sinken.</p>` : ''}
  `;
}

function buildVoncResult(r) {
  const passed = r.passed;
  return `
    <div class="parl-vonc-verdict ${passed ? 'vonc-pass' : 'vonc-fail'}">
      <div class="parl-vonc-verdict-title">${passed ? 'Angenommen' : 'Gescheitert'}</div>
      <div class="parl-vonc-verdict-sub">${passed ? 'Neuwahlen wurden eingeleitet.' : 'Die Koalition bleibt im Amt.'}</div>
    </div>
    <div class="parl-vonc-tally">
      <div class="parl-vonc-tally-row">
        <span>Dafür</span>
        <span class="parl-vonc-for">${r.seatsFor} Sitze</span>
      </div>
      <div class="parl-vonc-tally-row">
        <span>Dagegen</span>
        <span class="parl-vonc-against">${r.seatsAgainst} Sitze</span>
      </div>
      <div class="parl-vonc-tally-row parl-vonc-needed">
        <span>Mehrheit benötigt</span>
        <span>${r.majorityNeeded} Sitze</span>
      </div>
    </div>
    <div class="parl-vonc-parties">
      <div class="parl-vonc-group">
        <span class="parl-vonc-group-lbl parl-vonc-lbl-for">Dafür</span>
        ${(r.votingFor || []).map(p => `<span class="parl-vonc-tag">${p}</span>`).join('')}
      </div>
      <div class="parl-vonc-group">
        <span class="parl-vonc-group-lbl parl-vonc-lbl-against">Dagegen</span>
        ${(r.votingAgainst || []).map(p => `<span class="parl-vonc-tag">${p}</span>`).join('')}
      </div>
    </div>
  `;
}
