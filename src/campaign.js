// ── WAHLKAMPF-SCREEN + WAHLERGEBNIS ───────────────────────────

export const BUDGET_TOPICS = [
  { id: 'wirtschaft', label: 'Wirtschaft'  },
  { id: 'soziales',   label: 'Soziales'    },
  { id: 'sicherheit', label: 'Sicherheit'  },
  { id: 'klima',      label: 'Klimaschutz' },
  { id: 'migration',  label: 'Migration'   },
];

export const CAMPAIGN_EVENTS_POOL = [
  {
    id: 'tv-duel',
    title: 'TV-Duell',
    description: 'Das ARD/ZDF-Triell live vor 14 Millionen Zuschauern. Wie tritt der Kanzlerkandidat auf?',
    options: [
      {
        id: 'aggressiv',
        label: 'Angriff — Opposition scharf kritisieren',
        hint: '+Stammwähler, −Mitte, −Medien',
        partyDeltas: { CDU: +2, AfD: +1, SPD: -1, Grüne: -1 },
        approvalDelta: -2,
      },
      {
        id: 'sachlich',
        label: 'Sachlich — Bilanz und Programm präsentieren',
        hint: '+Mitte, +Medien, −Stammwähler',
        partyDeltas: { CDU: +1, SPD: +1, Grüne: +1, AfD: -2 },
        approvalDelta: +3,
      },
    ],
  },
  {
    id: 'coalition-scandal',
    title: 'Koalitionspartner-Skandal',
    description: 'Ein Koalitionspartner steckt in einem Korruptionsskandal. Die Presse fragt: Solidarität oder Distanz?',
    options: [
      {
        id: 'distanzieren',
        label: 'Distanzieren — klare Worte, Aufklärung fordern',
        hint: '+Glaubwürdigkeit, −Koalitionsfrieden',
        partyDeltas: { CDU: +3, AfD: -1, SPD: -2, FDP: -1 },
        approvalDelta: +4,
      },
      {
        id: 'verteidigen',
        label: 'Verteidigen — Koalitionssolidarität zeigen',
        hint: '+Koalitionstreue, −Glaubwürdigkeit',
        partyDeltas: { AfD: +3, CDU: -2, BSW: +1, Linke: +1 },
        approvalDelta: -5,
      },
    ],
  },
  {
    id: 'kampagnenfokus',
    title: 'Wahlkampfstrategie',
    description: 'Die Zeit ist knapp. Wo soll der Kanzlerkandidat die letzten Wochen vor der Wahl verbringen?',
    options: [
      {
        id: 'grossstadt',
        label: 'Metropolen — Berlin, Hamburg, München, Köln',
        hint: '+Bildungswähler, −Ostdeutschland',
        partyDeltas: { CDU: +1, Grüne: -1, AfD: -2, SPD: -1 },
        approvalDelta: +2,
      },
      {
        id: 'laendlich',
        label: 'Ostdeutschland und ländliche Regionen',
        hint: '+Pendler und Landwähler, −Metropolenwähler',
        partyDeltas: { CDU: +2, AfD: -2, BSW: -1, Grüne: +1 },
        approvalDelta: +1,
      },
    ],
  },
  {
    id: 'endorsement',
    title: 'Prominente Unterstützung',
    description: 'In der Schlussphase: Wer soll die Partei öffentlich unterstützen?',
    options: [
      {
        id: 'wirtschaft',
        label: 'Wirtschaftsführer und DAX-Vorstände',
        hint: '+Wirtschaftswähler, −Arbeitnehmer',
        partyDeltas: { CDU: +2, FDP: +1, SPD: -2, Linke: -1 },
        approvalDelta: +1,
      },
      {
        id: 'sozial',
        label: 'Gewerkschaften und Sozialverbände',
        hint: '+Arbeiterwähler, −liberale Mitte',
        partyDeltas: { CDU: +1, SPD: -1, Grüne: -1, AfD: -1 },
        approvalDelta: +2,
      },
    ],
  },
  {
    id: 'fake-news',
    title: 'Desinformationskampagne',
    description: 'Gezielte Falschmeldungen über die Partei verbreiten sich massenhaft in sozialen Medien. Wie reagieren?',
    options: [
      {
        id: 'faktencheck',
        label: 'Faktencheck-Offensive — Medien und Experten einbinden',
        hint: '+Medienvertrauen, kostet Ressourcen',
        partyDeltas: { CDU: +1, AfD: -2, Grüne: +1, SPD: +1 },
        approvalDelta: +3,
      },
      {
        id: 'ignorieren',
        label: 'Ignorieren — auf eigene Themen fokussieren',
        hint: '−Narrative-Kontrolle, +Fokus auf Programm',
        partyDeltas: { AfD: +3, CDU: -1, BSW: +1 },
        approvalDelta: -2,
      },
    ],
  },
  {
    id: 'koalitionssignal',
    title: 'Koalitionssignal',
    description: 'Journalisten fragen immer wieder nach einem klaren Signal für den Wunschpartner nach der Wahl.',
    options: [
      {
        id: 'offen',
        label: 'Offen — keine Koalition ausschließen',
        hint: '+Flexibilität, +Mitte, −Mobilisierung',
        partyDeltas: { CDU: +1, SPD: +1, FDP: +1, AfD: -2 },
        approvalDelta: +2,
      },
      {
        id: 'klar',
        label: 'Klar — Wunschpartner öffentlich benennen',
        hint: '+Stammwähler mobilisieren',
        partyDeltas: { CDU: +3, SPD: -1, Grüne: -1, AfD: -1 },
        approvalDelta: +1,
      },
    ],
  },
];

export function pickRandomEvents(n, pool = CAMPAIGN_EVENTS_POOL) {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, n);
}

// ── PARTY COLORS (geteilt mit parliament.js) ──────────────────
export const PARTY_COLORS = {
  CDU: '#555555', SPD: '#E3000F', Grüne: '#1AA037',
  FDP: '#D4BC00', AfD: '#009EE0', Linke: '#BE3075', BSW: '#8B2FC0',
};

// ── POLL BERECHNEN ─────────────────────────────────────────────
// Repliziert die Logik aus election.js ohne Zufälligkeit
export function calculatePoll(state, budget, eventChoices, selectedEvents) {
  const BASELINES = { CDU: 28.5, SPD: 19.0, Grüne: 11.5, FDP: 6.5, AfD: 20.5, Linke: 4.0, BSW: 6.5 };

  const coalition  = state.government?.coalition     || [];
  const chanParty  = state.government?.chancellorParty || 'CDU';
  const approval   = state.government?.approvalRating  ?? 50;
  const gdp        = state.economy?.gdpIndex           ?? 50;
  const sat        = state.society?.publicSatisfaction  ?? 50;
  const security   = state.society?.securityFeeling    ?? 50;
  const climate    = state.society?.climateProgress    ?? 50;
  const social     = state.society?.socialJustice      ?? 50;

  const incumbentBonus = approval > 50 ? 2 : -3;
  const economyEffect  = (gdp - 50) / 10;

  const poll = {};
  for (const [p, base] of Object.entries(BASELINES)) {
    let v = base;
    if (coalition.includes(p)) v += incumbentBonus + economyEffect;
    if (p === 'AfD')                v += (50 - sat) * 0.15 + (50 - security) * 0.1;
    if (p === 'Grüne')              v += (climate - 50) * 0.05;
    if (p === 'Linke' || p === 'BSW') v += (50 - social) * 0.1;
    poll[p] = Math.max(1, v);
  }

  // Budget-Effekte (Abweichung vom Standard 20)
  const budgetTotal = Object.values(budget).reduce((a, b) => a + b, 0);
  if (budgetTotal <= 100) {
    const w  = budget.wirtschaft - 20,  s  = budget.soziales   - 20,
          si = budget.sicherheit - 20,  k  = budget.klima      - 20,
          m  = budget.migration  - 20;
    if (poll[chanParty]) poll[chanParty] += w * 0.07 + si * 0.04 + s * 0.02 + k * 0.01;
    if (poll['SPD'])     poll['SPD']     += s * 0.04 - w * 0.02;
    if (poll['Grüne'])   poll['Grüne']   += k * 0.07 - si * 0.02;
    if (poll['AfD'])     poll['AfD']     += si * 0.02 + m * 0.05 - k * 0.02;
    if (poll['FDP'])     poll['FDP']     += w * 0.02;
    if (poll['Linke'])   poll['Linke']   += s * 0.03;
    if (poll['BSW'])     poll['BSW']     += m * 0.02;
  }

  // Ereignis-Effekte
  for (const event of (selectedEvents || [])) {
    const choiceId = eventChoices[event.id];
    if (!choiceId) continue;
    const opt = event.options.find(o => o.id === choiceId);
    if (!opt) continue;
    for (const [p, d] of Object.entries(opt.partyDeltas || {})) {
      if (poll[p] !== undefined) poll[p] += d;
    }
    if (poll[chanParty] !== undefined) poll[chanParty] += (opt.approvalDelta || 0) * 0.2;
  }

  // Normalisieren
  for (const p of Object.keys(poll)) poll[p] = Math.max(0.5, poll[p]);
  const sum = Object.values(poll).reduce((a, b) => a + b, 0);
  for (const p of Object.keys(poll)) poll[p] = (poll[p] / sum) * 100;

  return poll;
}

// ── POLL-BALKEN HTML ──────────────────────────────────────────
export function renderPollBars(poll, coalition) {
  const sorted = Object.entries(poll).sort(([, a], [, b]) => b - a);
  const maxPct = sorted[0]?.[1] || 35;

  return sorted.map(([party, pct]) => {
    const inCoal  = coalition.includes(party);
    const color   = PARTY_COLORS[party] || '#888';
    const under5  = pct < 5;
    const barW    = ((pct / (maxPct + 3)) * 100).toFixed(1);
    return `
      <div class="poll-row${under5 ? ' poll-under5' : ''}">
        <div class="poll-row-name">
          <span class="poll-dot" style="background:${color}"></span>
          <span>${party}</span>
          ${inCoal ? '<span class="poll-gov-badge">Reg.</span>' : ''}
        </div>
        <div class="poll-track">
          <div class="poll-fill" style="width:${barW}%;background:${color};opacity:${under5 ? '.3' : '1'}"></div>
        </div>
        <span class="poll-pct-num${under5 ? ' poll-warn' : ''}">${pct.toFixed(1)}%</span>
      </div>`;
  }).join('');
}

// ── KAMPAGNENEFFEKTE AUF SPIELZUSTAND ANWENDEN ───────────────
export function applyCampaignToState(state, budget, eventChoices, selectedEvents) {
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const w = (budget.wirtschaft - 20) * 0.04;
  const s = (budget.soziales   - 20) * 0.03;
  const si = (budget.sicherheit - 20) * 0.04;
  const k  = (budget.klima     - 20) * 0.04;

  state.economy.gdpIndex             = clamp(state.economy.gdpIndex + w);
  state.society.socialJustice        = clamp(state.society.socialJustice + s);
  state.society.securityFeeling      = clamp(state.society.securityFeeling + si);
  state.society.climateProgress      = clamp(state.society.climateProgress + k);

  let approvalDelta = 0;
  for (const event of (selectedEvents || [])) {
    const opt = event.options.find(o => o.id === eventChoices[event.id]);
    if (opt) approvalDelta += opt.approvalDelta || 0;
  }
  state.government.approvalRating = clamp(state.government.approvalRating + approvalDelta);
}

// ── WAHLKAMPF-SCREEN HTML ─────────────────────────────────────
export function buildCampaignHTML(state, selectedEvents, poll) {
  const coalition = state.government?.coalition || [];
  const year      = state.year ?? 2029;
  const budgetTotal = 100; // initial

  return `
<div class="camp-wrap">
  <div class="camp-header">
    <div class="camp-header-left">
      <span class="camp-badge">Wahlkampf</span>
      <h1 class="camp-title">Bundestagswahlkampf ${year}</h1>
      <p class="camp-subtitle">Wahl in 4 Wochen &mdash; letzte Chance, Wähler zu überzeugen</p>
    </div>
  </div>

  <div class="camp-grid">

    <!-- LEFT: Budget + Events -->
    <div class="camp-left">

      <div class="card">
        <div class="card-title">Kampagnenbudget</div>
        <div class="camp-budget-header">
          <span class="camp-budget-desc">Verteile 100 Punkte auf deine Wahlkampfschwerpunkte</span>
          <span id="camp-total-display" class="camp-total-ok">100 / 100</span>
        </div>
        ${BUDGET_TOPICS.map(t => `
          <div class="camp-slider-wrap">
            <div class="camp-slider-head">
              <span class="camp-slider-label">${t.label}</span>
              <span class="camp-slider-val" id="val-${t.id}">20</span>
            </div>
            <input type="range" class="camp-slider"
              id="slider-${t.id}"
              min="0" max="80" value="20"
              data-topic="${t.id}">
          </div>
        `).join('')}
      </div>

      <div class="card">
        <div class="card-title">Wahlkampfereignisse</div>
        ${selectedEvents.map((event, i) => `
          <div class="camp-event${i > 0 ? ' camp-event-sep' : ''}">
            <div class="camp-event-title">${event.title}</div>
            <p class="camp-event-desc">${event.description}</p>
            <div class="camp-options">
              ${event.options.map(opt => `
                <label class="camp-opt" data-event="${event.id}" data-opt="${opt.id}">
                  <input type="radio" class="camp-radio" name="event-${event.id}" value="${opt.id}">
                  <div class="camp-opt-body">
                    <span class="camp-opt-label">${opt.label}</span>
                    <span class="camp-opt-hint">${opt.hint}</span>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

    </div>

    <!-- RIGHT: Live-Umfrage + Button -->
    <div class="camp-right">

      <div class="card">
        <div class="card-title">Aktuelle Umfrage</div>
        <div id="camp-poll-bars">${renderPollBars(poll, coalition)}</div>
        <p class="camp-poll-note">Passt sich nach jeder Entscheidung an</p>
      </div>

      <button class="btn btn-primary camp-election-btn" id="btn-to-election">
        Wahlkampf beenden &rarr; Zur Wahl
      </button>

    </div>
  </div>
</div>`;
}

// ── WAHLERGEBNIS-SCREEN HTML ──────────────────────────────────
export function buildElectionResultHTML(electionResult, prevSeats, coalitions) {
  const { votes, seats, majorityNeeded, timestamp } = electionResult;
  const year  = timestamp?.year ?? '';

  const prevTotal = Object.values(prevSeats).reduce((a, b) => a + b, 0);
  const sorted    = Object.keys(votes).sort((a, b) => votes[b] - votes[a]);
  const winner    = sorted[0];
  const maxVote   = votes[winner] || 40;

  const playerPartySeats = Object.values(seats).reduce((a, b) => a + b, 0);

  return `
<div class="elec-wrap">
  <div class="elec-header">
    <span class="elec-badge">Wahlergebnis</span>
    <h1 class="elec-title">Bundestagswahl ${year}</h1>
    <p class="elec-subtitle">Stärkste Partei: <strong>${winner}</strong> mit ${votes[winner].toFixed(1)}% der Stimmen</p>
  </div>

  <div class="elec-grid">

    <!-- Ergebnis-Balken -->
    <div class="card">
      <div class="card-title">Stimmenanteile und Mandate</div>

      <div class="elec-bars">
        ${sorted.map(p => {
          const pct      = votes[p];
          const newSeat  = seats[p] || 0;
          const prevPct  = prevTotal > 0 ? ((prevSeats[p] || 0) / prevTotal * 100) : 0;
          const delta    = pct - prevPct;
          const under5   = pct < 5;
          const color    = PARTY_COLORS[p] || '#888';
          const barW     = ((pct / (maxVote + 3)) * 100).toFixed(1);
          const deltaStr = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}`;
          return `
          <div class="elec-bar-row${under5 ? ' elec-under5' : ''}${p === winner ? ' elec-winner-row' : ''}">
            <div class="elec-bar-label">
              <span class="elec-dot" style="background:${color}"></span>
              <span class="elec-party-name">${p}</span>
              ${under5 ? '<span class="elec-sperrklausel">5%-Hürde</span>' : ''}
            </div>
            <div class="elec-bar-track">
              <div class="elec-bar-fill" style="width:${barW}%;background:${color};opacity:${under5 ? '.28' : '1'}"></div>
            </div>
            <div class="elec-bar-nums">
              <span class="elec-pct">${pct.toFixed(1)}%</span>
              <span class="elec-seats-num">${newSeat > 0 ? newSeat + ' Sitze' : '—'}</span>
              <span class="elec-delta ${delta >= 0 ? 'elec-pos' : 'elec-neg'}">${deltaStr}</span>
            </div>
          </div>`;
        }).join('')}
      </div>

      <div class="elec-threshold-note">
        5%-Sperrklausel: Parteien darunter erhalten keine Sitze &middot; Mehrheit ab ${majorityNeeded} Sitzen
      </div>
    </div>

    <!-- Mögliche Koalitionen -->
    <div class="card">
      <div class="card-title">Mögliche Koalitionen</div>

      ${coalitions.length > 0 ? `
        <div class="elec-coalitions">
          ${coalitions.slice(0, 5).map(c => `
            <div class="elec-coal-card">
              <div class="elec-coal-name">${c.name}</div>
              <div class="elec-coal-parties">
                ${c.parties.map(p => `<span class="elec-coal-party-tag" style="border-color:${PARTY_COLORS[p] || '#888'}">${p}</span>`).join('')}
              </div>
              <div class="elec-coal-stats">
                <span class="elec-coal-seats">${c.seats} Sitze (+${c.majority} über Mehrheit)</span>
                <div class="elec-compat-track" title="Kompatibilität ${c.compatibility}%">
                  <div class="elec-compat-fill" style="width:${c.compatibility}%"></div>
                </div>
                <span class="elec-compat-num">${c.compatibility}% Kompatibilität</span>
              </div>
              <button class="btn btn-ghost elec-coal-btn" data-parties="${c.parties.join(',')}">
                Verhandlungen starten &rarr;
              </button>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="elec-no-coal">
          Keine regierungsfähige Koalition ohne die AfD möglich.<br>
          Neuwahlen werden eingeleitet.
        </div>
      `}
    </div>

  </div>
</div>`;
}
