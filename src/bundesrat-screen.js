// ============================================================
// BUNDESRAT-SCREEN.JS — Ring-Segment-Diagramm der 16 Bundesländer
// Variante B: Äußerer Ring zeigt Koalitionsfarben jedes Landes
// (state.extensions.bundeslaender hat bereits ein koalition-Array)
// ============================================================

const ALL_PARTY_COLORS = {
  CDU:   '#555555',
  SPD:   '#E3000F',
  Grüne: '#1AA037',
  FDP:   '#D4BC00',
  AfD:   '#009EE0',
  Linke: '#BE3075',
  BSW:   '#8B2FC0',
  CSU:   '#2d2d6e',
  FW:    '#d97706',
  Volt:  '#502379',
  SSW:   '#003082',
};

// Clockwise order around the ring (geographic grouping N→S, W→E)
const STATE_ORDER = [
  'schleswigholstein',
  'hamburg',
  'mecklenburgvorpommern',
  'niedersachsen',
  'bremen',
  'nordrheinwestfalen',
  'brandenburg',
  'berlin',
  'sachsenanhalt',
  'rheinlandpfalz',
  'hessen',
  'thueringen',
  'sachsen',
  'saarland',
  'badenwuerttemberg',
  'bayern',
];

const STATE_CODES = {
  schleswigholstein:     'SH',
  hamburg:               'HH',
  mecklenburgvorpommern: 'MV',
  niedersachsen:         'NI',
  bremen:                'HB',
  nordrheinwestfalen:    'NW',
  brandenburg:           'BB',
  berlin:                'B',
  sachsenanhalt:         'ST',
  rheinlandpfalz:        'RP',
  hessen:                'HE',
  thueringen:            'TH',
  sachsen:               'SN',
  saarland:              'SL',
  badenwuerttemberg:     'BW',
  bayern:                'BY',
};

function _partyColor(party) {
  return ALL_PARTY_COLORS[party] ?? '#444';
}

function _isAligned(stateParty, coalition) {
  if (!stateParty) return false;
  if (coalition.includes(stateParty)) return true;
  if (stateParty === 'CSU' && coalition.includes('CDU')) return true;
  if (stateParty === 'CDU' && coalition.includes('CSU')) return true;
  return false;
}

// SVG donut arc path: sweeps clockwise from startAngle to endAngle (radians, 0=right)
function donutArc(cx, cy, r1, r2, startAngle, endAngle) {
  const cos = Math.cos, sin = Math.sin;
  const x1o = cx + r2 * cos(startAngle), y1o = cy + r2 * sin(startAngle);
  const x2o = cx + r2 * cos(endAngle),   y2o = cy + r2 * sin(endAngle);
  const x1i = cx + r1 * cos(endAngle),   y1i = cy + r1 * sin(endAngle);
  const x2i = cx + r1 * cos(startAngle), y2i = cy + r1 * sin(startAngle);
  const large = (endAngle - startAngle > Math.PI) ? 1 : 0;
  const f = n => n.toFixed(2);
  return `M ${f(x1o)} ${f(y1o)} A ${r2} ${r2} 0 ${large} 1 ${f(x2o)} ${f(y2o)} L ${f(x1i)} ${f(y1i)} A ${r1} ${r1} 0 ${large} 0 ${f(x2i)} ${f(y2i)} Z`;
}

function bundesratRingSVG(bl, coalition) {
  const W = 560, H = 560, cx = 280, cy = 280;
  const R1 = 105;  // inner radius of state ring
  const R2 = 195;  // outer radius of state ring
  const R_align = 200; // inner edge of alignment ring
  const R_align2 = 206; // outer edge of alignment ring
  const R_label = 226; // label radius
  const TOTAL_VOTES = 69;
  const GAP_RAD = 1.2 * Math.PI / 180; // 1.2° gap between states

  const totalGap = GAP_RAD * STATE_ORDER.length;
  const usable = 2 * Math.PI - totalGap;

  // Start at top (−π/2 = 12 o'clock), go clockwise
  let angle = -Math.PI / 2;
  const parts = [];

  // Collect legend data
  const partyVotes = {};

  for (const key of STATE_ORDER) {
    const data = bl[key];
    if (!data) { angle += GAP_RAD; continue; }

    const votes = data.bundesratStimmen ?? 0;
    const stateAngle = (votes / TOTAL_VOTES) * usable;
    const startA = angle;
    const endA   = angle + stateAngle;
    const midA   = (startA + endA) / 2;

    const coal = data.koalition?.length ? data.koalition : [data.regierungspartei ?? 'CDU'];
    const aligned = _isAligned(data.regierungspartei, coalition);
    const partA = stateAngle / coal.length;

    // Draw coalition sub-arcs (Variante B: equal split per coalition partner)
    coal.forEach((party, i) => {
      const pStart = startA + i * partA;
      const pEnd   = pStart + partA;
      const color  = _partyColor(party);
      const opacity = aligned ? '1' : '0.45';
      parts.push(`<path d="${donutArc(cx, cy, R1, R2, pStart, pEnd)}" fill="${color}" opacity="${opacity}" stroke="#0d1117" stroke-width="1.5"/>`);

      // Accumulate for legend
      if (!partyVotes[party]) partyVotes[party] = { votes: 0, states: 0 };
      partyVotes[party].votes += votes / coal.length;
    });

    // Alignment ring: thin arc outside the state segment
    if (aligned) {
      parts.push(`<path d="${donutArc(cx, cy, R_align, R_align2, startA + 0.005, endA - 0.005)}" fill="#3fb950" opacity="0.9"/>`);
    }

    // Divider lines between states (subtle gap already, this adds clarity)
    const gapMid = endA + GAP_RAD / 2;
    // (gap lines not needed — the stroke on arcs creates natural separation)

    // State labels outside the ring
    const lx = cx + R_label * Math.cos(midA);
    const ly = cy + R_label * Math.sin(midA);

    // Radial text anchor: left side = start, right side = end, top/bottom = middle
    const cosM = Math.cos(midA);
    const anchor = cosM > 0.25 ? 'start' : cosM < -0.25 ? 'end' : 'middle';
    const code = STATE_CODES[key] ?? key.substring(0, 2).toUpperCase();

    // Offset second line slightly along radius
    const dx2 = R_label * Math.cos(midA + 0.001) - lx;
    const dy2 = 11 * Math.sign(Math.sin(midA) + 0.001);

    parts.push(`<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" fill="#e6edf3" font-family="sans-serif" font-size="11.5" font-weight="700">${code}</text>`);
    parts.push(`<text x="${lx.toFixed(1)}" y="${(ly + dy2).toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" fill="#8b949e" font-family="sans-serif" font-size="9.5">${votes}</text>`);

    angle = endA + GAP_RAD;
  }

  // Center: background + labels
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${R1 - 2}" fill="#161b22" stroke="#30363d" stroke-width="1.5"/>`);
  parts.push(`<text x="${cx}" y="${cy - 22}" text-anchor="middle" fill="#e6edf3" font-family="sans-serif" font-size="22" font-weight="800" letter-spacing="-0.5">69</text>`);
  parts.push(`<text x="${cx}" y="${cy - 2}" text-anchor="middle" fill="#8b949e" font-family="sans-serif" font-size="10">Stimmen gesamt</text>`);
  parts.push(`<text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="#8b949e" font-family="sans-serif" font-size="10">Mehrheit: 35</text>`);
  parts.push(`<text x="${cx}" y="${cy + 32}" text-anchor="middle" fill="#3fb950" font-family="sans-serif" font-size="9" font-weight="700">&#9632; = Koalition</text>`);

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:560px;height:auto;">${parts.join('\n')}</svg>`;
}

export function buildBundesratScreenHTML(state) {
  const bl       = state.extensions?.bundeslaender ?? {};
  const coalition = state.government?.coalition ?? [];

  // Vote totals
  let reg = 0, opp = 0;
  for (const data of Object.values(bl)) {
    const v = data.bundesratStimmen ?? 0;
    _isAligned(data.regierungspartei, coalition) ? (reg += v) : (opp += v);
  }
  const hasMaj    = reg >= 35;
  const regPct    = ((reg / 69) * 100).toFixed(1);
  const threshPct = (35 / 69 * 100).toFixed(1);

  // Table rows sorted by votes desc
  const tableRows = STATE_ORDER
    .map(key => [key, bl[key]])
    .filter(([, d]) => d)
    .sort(([, a], [, b]) => (b.bundesratStimmen ?? 0) - (a.bundesratStimmen ?? 0))
    .map(([key, data]) => {
      const aligned = _isAligned(data.regierungspartei, coalition);
      const coal = data.koalition?.length ? data.koalition : [data.regierungspartei ?? '—'];
      const dotHtml = coal.map(p =>
        `<span class="br-dot" style="background:${_partyColor(p)}" title="${p}"></span>`
      ).join('');
      return `
        <tr class="${aligned ? 'br-row--aligned' : ''}">
          <td>${STATE_CODES[key] ?? key}</td>
          <td>${data.name ?? key}</td>
          <td class="br-td-coal">${dotHtml} ${coal.join('/')}</td>
          <td class="br-td-num">${data.bundesratStimmen ?? 0}</td>
          <td>${aligned
            ? '<span class="br-badge--reg">Koalition</span>'
            : '<span class="br-badge--opp">Opposition</span>'
          }</td>
        </tr>
      `;
    }).join('');

  return `
    <div class="br-screen">
      <div class="br-topbar">
        <button class="btn btn-ghost" id="br-back">&#8592; Zurück</button>
        <div>
          <h1 class="br-title">Bundesrat</h1>
          <p class="br-subtitle">69 Stimmen · Koalitionsfarben je Bundesland (Variante B)</p>
        </div>
      </div>

      <div class="br-body">
        <!-- Left: Ring diagram -->
        <div class="br-left">
          <div class="br-section-label">Stimmenverteilung nach Bundesland</div>
          <div class="br-ring-wrap">
            ${bundesratRingSVG(bl, coalition)}
          </div>
          <p class="br-ring-hint">Segmentbreite = Stimmenzahl (3–6) · Helligkeit = Bundeskoalition</p>
        </div>

        <!-- Right: majority card + table -->
        <div class="br-right">
          <div class="card br-maj-card">
            <div class="card-title">Mehrheitsverhältnisse</div>
            <div class="br-maj-row">
              <div class="br-maj-side">
                <span class="br-maj-num">${reg}</span>
                <span class="br-maj-lbl">Koalition</span>
              </div>
              <div class="br-maj-divider">/ 69</div>
              <div class="br-maj-side">
                <span class="br-maj-num br-maj-num--opp">${opp}</span>
                <span class="br-maj-lbl">Opposition</span>
              </div>
            </div>

            <div class="br-bar-wrap">
              <div class="br-bar">
                <div class="br-bar-fill${hasMaj ? ' br-bar-fill--maj' : ' br-bar-fill--min'}"
                     style="width:${regPct}%"></div>
                <div class="br-bar-thresh" style="left:${threshPct}%" title="35 = Mehrheit"></div>
              </div>
              <div class="br-bar-labels">
                <span>0</span>
                <span class="br-bar-thresh-lbl" style="margin-left:${threshPct}%">35</span>
                <span style="margin-left:auto">69</span>
              </div>
            </div>

            <div class="br-maj-status${hasMaj ? ' br-maj-status--ok' : ' br-maj-status--warn'}">
              ${hasMaj
                ? `&#x2713; Mehrheit vorhanden (${reg} / 69)`
                : `&#x26A0; Keine Mehrheit — noch ${35 - reg} Stimmen nötig`}
            </div>
          </div>

          <div class="card">
            <div class="card-title">Alle Bundesländer</div>
            <table class="br-table">
              <thead>
                <tr><th></th><th>Land</th><th>Regierung</th><th>St.</th><th>Seite</th></tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}
