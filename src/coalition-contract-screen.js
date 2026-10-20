// ============================================================
// COALITION-CONTRACT-SCREEN.JS — Koalitionsvertrag-Ergebnis-Screen
// ============================================================

import { WORKING_GROUPS, PARTY_SHOWSTOPPERS, FORMULATIONS } from './coal-neg-data.js';
import { PARTY_POSITIONS, MINISTERIEN } from './engine/state.js';

// ── CONSTANTS ─────────────────────────────────────────────────

const RATING_GRADES = [
  { min: 80, grade: 'A', label: 'Starke Koalition',       effect: '+12 Zustimmung',  approvalDelta: 12, stabilityDelta: 15 },
  { min: 65, grade: 'B', label: 'Solide Einigung',        effect: '+6 Zustimmung',   approvalDelta:  6, stabilityDelta:  8 },
  { min: 50, grade: 'C', label: 'Schwieriger Kompromiss', effect: '±0 Zustimmung',   approvalDelta:  0, stabilityDelta:  2 },
  { min: 35, grade: 'D', label: 'Fragile Koalition',      effect: '−5 Zustimmung',   approvalDelta: -5, stabilityDelta: -5 },
  { min:  0, grade: 'F', label: 'Brüchige Koalition',     effect: '−12 Zustimmung',  approvalDelta:-12, stabilityDelta:-12 },
];
const GRADE_COLORS = { A: '#3fb950', B: '#388bfd', C: '#d29922', D: '#f85149', F: '#6e3737' };

const FMT_META = {
  binding:   { icon: '✓', label: 'Wir werden',     color: '#3fb950', title: 'Verbindlich — volle Umsetzung (100%)'     },
  aspiring:  { icon: '→', label: 'Wir streben an', color: '#388bfd', title: 'Absichtserklärung — 60% Wirkung'          },
  examining: { icon: '?', label: 'Wir prüfen ob',  color: '#d29922', title: 'Prüfauftrag — schwache Wirkung (20%)'     },
};

const NEWSPAPERS = {
  faz:     { name: 'F.A.Z.',              lean: 'Wirtschaftsliberal-konservativ', leanMod: 'right'  },
  welt:    { name: 'Die Welt',            lean: 'Konservativ',                    leanMod: 'right'  },
  sz:      { name: 'Süddeutsche Zeitung', lean: 'Liberal-sozialdemokratisch',     leanMod: 'cleft'  },
  spiegel: { name: 'Der Spiegel',         lean: 'Kritisch-investigativ',          leanMod: 'crit'   },
  taz:     { name: 'taz',                 lean: 'Links-grün',                     leanMod: 'left'   },
  bild:    { name: 'Bild',                lean: 'Populistisch',                   leanMod: 'pop'    },
};

const HEADLINE_RULES = [
  {
    paper: 'faz', agId: 'finanzen', topicId: 'schuldenbremse', goodAbove: 65,
    posHead: 'Schuldenbremse bleibt — Koalition mit fiskalischer Vernunft',
    posQuote: 'Die neue Bundesregierung beweist Haushaltsdisziplin. Die Schuldenbremse bleibt das Fundament solider Finanzpolitik — ein Versprechen an künftige Generationen.',
    negHead: 'Schuldenbremse aufgeweicht: Regierung auf Schuldenkurs',
    negQuote: 'Was als pragmatische Reform verpackt wird, ist der Einstieg in fiskalische Verantwortungslosigkeit. Deutschland riskiert seine Kreditwürdigkeit.',
  },
  {
    paper: 'welt', agId: 'sicherheit', topicId: 'grenzkontrollen', goodAbove: 60,
    posHead: 'Grenzkontrollen: Endlich Ordnung in der Migrationspolitik',
    posQuote: 'Nach Jahren des Kontrollverlustes setzt die Koalition auf legale Steuerung. Ein überfälliger Schritt, der Zustimmung verdient.',
    negHead: 'Offene Grenzen: Koalition drückt sich vor der Verantwortung',
    negQuote: 'Wer Zuwanderung nicht steuert, verliert das Vertrauen der Bevölkerung. Diese Koalition hat erneut eine historische Chance verpasst.',
  },
  {
    paper: 'sz', agId: 'soziales', topicId: 'mindestlohn', goodAbove: 68,
    posHead: 'Mindestlohn steigt: Historischer Erfolg für Millionen Arbeitnehmer',
    posQuote: 'Endlich setzt die Politik ein Zeichen gegen Niedriglöhne. Die Anhebung ist längst überfällig und stärkt den Konsum im ganzen Land.',
    negHead: 'Mindestlohn stagniert: Koalition lässt Geringverdiener im Stich',
    negQuote: 'Trotz Wahlkampfversprechen bleibt der Mindestlohn weit hinter dem zurück, was Beschäftigte im Niedriglohnsektor zum Leben brauchen.',
  },
  {
    paper: 'spiegel', agId: 'außen', topicId: 'ukraine', goodAbove: 55,
    posHead: 'Ukraine-Solidarität: Deutschland steht zu seinen Versprechen',
    posQuote: 'In einer Zeit globaler Unsicherheit sendet die neue Regierung das richtige Signal. Deutschlands Verlässlichkeit ist keine Verhandlungsmasse.',
    negHead: 'Ukraine-Kurswechsel: Deutschland zieht sich zurück',
    negQuote: 'Die Koalition riskiert Europas Glaubwürdigkeit. Ein Rückzug aus der Ukraine-Unterstützung hätte weitreichende Folgen für Berlin, Brüssel und Kiew.',
  },
  {
    paper: 'taz', agId: 'klima', topicId: 'klimageld', goodAbove: 62,
    posHead: 'Klimageld kommt! Ein historischer Schritt zu sozialem Klimaschutz',
    posQuote: 'Endlich verbindet die Klimapolitik ökologische Notwendigkeit mit sozialer Gerechtigkeit. Das Klimageld beweist: Klimaschutz geht auch solidarisch.',
    negHead: 'Klimageld gestrichen: Soziale Klimapolitik gescheitert',
    negQuote: 'Wer den CO₂-Preis ohne Rückerstattung lässt, bestraft die Ärmsten. Diese Koalition hat Klimaschutz zur Frage des Geldbeutels gemacht.',
  },
  {
    paper: 'taz', agId: 'klima', topicId: 'tempolimit', goodAbove: 65,
    posHead: 'Tempolimit: Deutschland verlässt seinen europäischen Sonderweg',
    posQuote: 'Kein anderes EU-Land hatte noch ein allgemeines Fahrverbot auf Autobahnen. Das ist jetzt Geschichte — und längst überfällig.',
    negHead: 'Kein Tempolimit: Autolobby regiert wieder mit',
    negQuote: 'Trotz Klimakrise bleibt Deutschland das einzige EU-Land ohne Tempolimit. Die Koalition hat sich dem Autolobbyismus gebeugt.',
  },
  {
    paper: 'bild', agId: 'sicherheit', topicId: 'abschiebungen', goodAbove: 55,
    posHead: 'ENDLICH KONSEQUENZ! Neue Regierung macht Ernst bei Abschiebungen',
    posQuote: 'Das haben sich die Deutschen gewünscht: eine Regierung, die handelt statt redet. Wer kein Bleiberecht hat, muss das Land verlassen.',
    negHead: 'ABSCHIEBUNGS-CHAOS GEHT WEITER! Regierung versagt wieder',
    negQuote: 'Wieder einmal nichts. Die gleichen Phrasen, die gleiche Untätigkeit. Unsere Leser haben mehr verdient als leere Versprechen.',
  },
  {
    paper: 'bild', agId: 'soziales', topicId: 'rente', goodAbove: 65,
    posHead: 'RENTE SICHER! Neue Regierung schützt unsere Senioren',
    posQuote: 'Rentner können aufatmen: Die Koalition hält Wort. Das Rentenniveau bleibt stabil — ein Versprechen an Millionen Seniorinnen und Senioren.',
    negHead: 'RENTEN-ALARM! Koalition ohne Plan für unsere Alten',
    negQuote: 'Während Politiker tagen, zittern Millionen Rentner. Ein Skandal, der Konsequenzen haben muss.',
  },
];

// ── MAIN EXPORT ───────────────────────────────────────────────

export function buildCoalitionContractScreen(negEngine, seats, year) {
  const displayYear  = year ?? 2029;
  const violations   = getViolations(negEngine);
  const headlines    = generateHeadlines(negEngine);
  const rating       = calculateRating(negEngine);
  const color        = GRADE_COLORS[rating.grade] || '#8b949e';
  const posCount     = headlines.filter(h => h.sentiment === 'positive').length;
  const sentimentPct = Math.round((posCount / Math.max(headlines.length, 1)) * 100);
  const shortNames   = negEngine.coalition.join(' + ');
  const fullNames    = negEngine.coalition.map(p => PARTY_POSITIONS[p]?.fullName || p).join(', ');

  return `
    <div class="ct-screen" id="ct-screen">

      <!-- ── DOCUMENT HEADER ── -->
      <div class="ct-doc-header">
        <div class="ct-doc-eagle">🦅</div>
        <div class="ct-doc-title-block">
          <div class="ct-doc-kicker">Koalitionsvertrag ${displayYear}</div>
          <h1 class="ct-doc-headline">${shortNames} einigen sich</h1>
          <div class="ct-doc-sub">${fullNames} · Koalitionsausschuss: ${negEngine.ausschussRep || '—'}</div>
        </div>
        <div class="ct-doc-grade-wrap" style="--gc:${color}">
          <div class="ct-doc-grade-letter">${rating.grade}</div>
          <div class="ct-doc-grade-label">${rating.label}</div>
        </div>
      </div>

      <!-- ── TWO-COLUMN BODY ── -->
      <div class="ct-columns">

        <!-- LEFT COLUMN: Vertragstext (65%) scrollable -->
        <div class="ct-col-left">
          ${WORKING_GROUPS.map(ag => buildAGSection(ag, negEngine, violations)).join('')}
          ${buildMinistryTable(negEngine)}
          <div class="ct-left-spacer"></div>
        </div>

        <!-- RIGHT COLUMN: Presse (35%) fixed -->
        <div class="ct-col-right">
          ${buildRatingPanel(rating, color)}
          <div class="ct-press-header">Pressestimmen</div>
          <div class="ct-headlines-list">
            ${headlines.map(h => buildHeadlineCard(h)).join('')}
          </div>
          <div class="ct-right-footer">
            <div class="ct-sentiment-row">
              <span class="ct-sent-label">Medientenor</span>
              <div class="ct-sent-track">
                <div class="ct-sent-pos" style="width:${sentimentPct}%"></div>
                <div class="ct-sent-neg" style="width:${100 - sentimentPct}%"></div>
              </div>
              <span class="ct-sent-pct ${sentimentPct >= 60 ? 'ct-sent-pct--good' : sentimentPct >= 40 ? '' : 'ct-sent-pct--bad'}">${sentimentPct}% positiv</span>
            </div>
            <button class="ct-start-btn" id="btn-start-government">
              Regierung startet →
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

// ── AG SECTION (left) ─────────────────────────────────────────

function buildAGSection(ag, negEngine, violations) {
  const agState          = negEngine.ags[ag.id];
  const violatedTopicIds = new Set(violations.map(v => v.topicId));

  return `
    <section class="ct-ag-section">
      <div class="ct-ag-head" style="--agc:${ag.color}">
        <span class="ct-ag-stripe"></span>
        <span class="ct-ag-title">${ag.label}</span>
        <span class="ct-ag-pct ${agState.progress === 100 ? 'ct-ag-pct--done' : ''}">${agState.progress}% abgeschlossen</span>
      </div>
      <div class="ct-ag-topics">
        ${ag.subTopics.map(topic => buildTopicRow(topic, ag, agState, negEngine, violatedTopicIds, violations)).join('')}
      </div>
    </section>
  `;
}

function buildTopicRow(topic, ag, agState, negEngine, violatedTopicIds, violations) {
  const resolved      = agState.topics[topic.id];
  const isViolation   = violatedTopicIds.has(topic.id);
  const playerDefault = topic.partyPositions[negEngine.playerParty] ?? 50;

  if (!resolved) {
    return `
      <div class="ct-topic-row ct-topic-row--open">
        <div class="ct-tr-icon ct-tr-icon--open">—</div>
        <div class="ct-tr-body">
          <span class="ct-tr-name">${topic.label}</span>
          <span class="ct-tr-unresolved">Nicht verhandelt</span>
        </div>
      </div>
    `;
  }

  const distance     = Math.abs(resolved.value - playerDefault);
  const isCompromise = distance > 25 && !isViolation;
  const fmt          = FMT_META[resolved.formulation] || FMT_META.examining;
  const rowMod       = isViolation ? 'ct-topic-row--red' : isCompromise ? 'ct-topic-row--orange' : 'ct-topic-row--green';
  const violInfo     = violations.find(v => v.topicId === topic.id);

  const partyDots = negEngine.coalition.map(p => {
    const pos   = topic.partyPositions[p] ?? 50;
    const pData = PARTY_POSITIONS[p];
    return `<span class="ct-pd ct-pd--party" style="left:${pos}%;background:${pData?.color}" title="${pData?.fullName||p}: ${pos}"></span>`;
  }).join('');

  const lo = Math.min(playerDefault, resolved.value);
  const hi = Math.max(playerDefault, resolved.value);

  return `
    <div class="ct-topic-row ${rowMod}"
         title="${isViolation ? (violInfo?.reason||'Rote Linie verletzt') : isCompromise ? `Zugeständnis: ${Math.round(distance)} Punkte` : 'Gute Einigung'}">

      <!-- Formulation icon pill -->
      <div class="ct-tr-icon" style="--fc:${fmt.color}" title="${fmt.title}">${fmt.icon}</div>

      <div class="ct-tr-body">
        <div class="ct-tr-top-row">
          <span class="ct-tr-name">${topic.label}</span>
          <div class="ct-tr-tags">
            ${isViolation  ? `<span class="ct-tag ct-tag--red">⚠ Rote Linie${violInfo ? ` (${violInfo.party})` : ''}</span>` : ''}
            ${isCompromise ? `<span class="ct-tag ct-tag--orange">Kompromiss −${Math.round(distance)}P</span>` : ''}
            <span class="ct-fmt-tag" style="--fc:${fmt.color}" title="${fmt.title}">${fmt.icon} ${fmt.label}</span>
          </div>
        </div>

        <!-- Position bar -->
        <div class="ct-pos-bar-wrap">
          <div class="ct-pos-track">
            ${partyDots}
            <!-- Compromise span -->
            ${isCompromise ? `<span class="ct-compromise-span" style="left:${lo}%;width:${hi-lo}%"></span>` : ''}
            <!-- Player start position -->
            <span class="ct-pd ct-pd--start" style="left:${playerDefault}%" title="Ihre Ausgangsposition: ${playerDefault}"></span>
            <!-- Agreed position -->
            <span class="ct-pd ct-pd--agreed" style="left:${resolved.value}%" title="Einigung: ${resolved.value}"></span>
          </div>
          <div class="ct-pos-extremes">
            <span>${topic.leftLabel.slice(0, 22)}</span>
            <span class="ct-pos-value">Einigung: ${resolved.value}</span>
            <span>${topic.rightLabel.slice(0, 22)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── MINISTRY TABLE ────────────────────────────────────────────

function buildMinistryTable(negEngine) {
  const assigned   = MINISTERIEN.filter(m => negEngine.ministries[m.name] && negEngine.coalition.includes(negEngine.ministries[m.name]));
  const unassigned = MINISTERIEN.filter(m => !negEngine.ministries[m.name]);

  return `
    <section class="ct-ministry-section">
      <div class="ct-ag-head" style="--agc:#8b949e">
        <span class="ct-ag-stripe"></span>
        <span class="ct-ag-title">Ministerienverteilung</span>
      </div>
      <table class="ct-min-table">
        <thead>
          <tr>
            <th>Ministerium</th>
            <th>Partei</th>
            <th>Politikbereich</th>
            <th title="Politisches Gewicht">Gewicht</th>
          </tr>
        </thead>
        <tbody>
          ${assigned.map(m => {
            const party = negEngine.ministries[m.name];
            const pData = PARTY_POSITIONS[party];
            const pips  = '▪'.repeat(Math.ceil((m.power || 0) / 2));
            return `
              <tr class="ct-min-row">
                <td class="ct-min-name">${m.name}</td>
                <td class="ct-min-party-cell">
                  <span class="ct-min-dot" style="background:${pData?.color}"></span>
                  ${pData?.fullName || party}${party === negEngine.playerParty ? ' ★' : ''}
                </td>
                <td class="ct-min-area">${m.policyArea || '—'}</td>
                <td class="ct-min-pips">${pips}</td>
              </tr>
            `;
          }).join('')}
          ${unassigned.length > 0 ? `
            <tr class="ct-min-row ct-min-row--open">
              <td colspan="4" class="ct-min-unassigned">${unassigned.map(m => m.name).join(', ')} — nicht vergeben</td>
            </tr>
          ` : ''}
        </tbody>
      </table>
    </section>
  `;
}

// ── RATING PANEL (right) ──────────────────────────────────────

function buildRatingPanel(rating, color) {
  return `
    <div class="ct-rating-panel" style="--rc:${color}">
      <div class="ct-rp-top">
        <div class="ct-rp-score">${rating.score}<span class="ct-rp-denom">/100</span></div>
        <div class="ct-rp-info">
          <div class="ct-rp-label">${rating.label}</div>
          <div class="ct-rp-effect">${rating.effect}</div>
        </div>
      </div>
      <div class="ct-rp-bars">
        ${[
          ['Parteizufriedenheit',   rating.components.satisfaction,  '#3fb950'],
          ['Showstopper erfüllt',   rating.components.showstoppers,  '#388bfd'],
          ['Formulierungsqualität', rating.components.formulations,  '#d29922'],
        ].map(([lbl, val, c]) => `
          <div class="ct-rp-row">
            <span class="ct-rp-lbl">${lbl}</span>
            <div class="ct-rp-track"><div class="ct-rp-fill" style="width:${Math.round(val)}%;background:${c}40;border-right:2px solid ${c}"></div></div>
            <span class="ct-rp-val">${Math.round(val)}%</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ── HEADLINE CARD (right) ─────────────────────────────────────

function buildHeadlineCard(h) {
  const paper  = NEWSPAPERS[h.paper];
  const isPos  = h.sentiment === 'positive';
  return `
    <div class="ct-hl-card ${isPos ? 'ct-hl-card--pos' : 'ct-hl-card--neg'}">
      <div class="ct-hl-top">
        <span class="ct-hl-paper ct-lean--${paper?.leanMod || 'crit'}">${paper?.name || h.paper}</span>
        <span class="ct-hl-arrow">${isPos ? '▲' : '▼'}</span>
      </div>
      <div class="ct-hl-headline">${h.headline}</div>
      <div class="ct-hl-quote">${h.quote}</div>
      ${h.formNote ? `<div class="ct-hl-formnote">${h.formNote}</div>` : ''}
    </div>
  `;
}

// ── LOGIC ─────────────────────────────────────────────────────

function generateHeadlines(negEngine) {
  const used   = new Set();
  const result = [];
  for (const rule of HEADLINE_RULES) {
    if (used.has(rule.paper) || result.length >= 5) continue;
    const resolved = negEngine.ags[rule.agId]?.topics[rule.topicId];
    if (!resolved) continue;
    const isGood   = resolved.value >= rule.goodAbove;
    let formNote   = null;
    if (resolved.formulation === 'examining') {
      formNote = isGood
        ? 'Einschränkung: nur als unverbindlicher Prüfauftrag formuliert.'
        : 'Immerhin: kein explizites Verbot, nur Prüfvorbehalt.';
    }
    result.push({ paper: rule.paper, headline: isGood ? rule.posHead : rule.negHead, quote: isGood ? rule.posQuote : rule.negQuote, sentiment: isGood ? 'positive' : 'negative', formNote });
    used.add(rule.paper);
  }
  return result;
}

function getViolations(negEngine) {
  const violations = [];
  for (const party of negEngine.coalition) {
    for (const ss of PARTY_SHOWSTOPPERS[party] || []) {
      const resolved = negEngine.ags[ss.agId]?.topics[ss.topicId];
      if (!resolved) { violations.push({ topicId: ss.topicId, party, reason: `${party}: "${ss.label}" nicht verhandelt` }); continue; }
      const condMet  = ss.cond === 'gte' ? resolved.value >= ss.threshold : resolved.value <= ss.threshold;
      const formulOk = ss.formulations.includes(resolved.formulation);
      if (!condMet || !formulOk) violations.push({ topicId: ss.topicId, party, reason: `${party}: "${ss.label}" — ${!condMet ? `Wert ${resolved.value} verfehlt` : 'Formulierung zu unverbindlich'}` });
    }
  }
  return violations;
}

function calculateRating(negEngine) {
  const others = negEngine.coalition.filter(p => p !== negEngine.playerParty);
  const satisfactionAvg = others.length > 0
    ? others.reduce((s, p) => s + (negEngine.partyStates[p]?.satisfaction ?? 50), 0) / others.length : 50;

  let stTotal = 0, stMet = 0;
  for (const party of negEngine.coalition) {
    for (const ss of PARTY_SHOWSTOPPERS[party] || []) {
      stTotal++;
      const r = negEngine.ags[ss.agId]?.topics[ss.topicId];
      if (r && (ss.cond === 'gte' ? r.value >= ss.threshold : r.value <= ss.threshold) && ss.formulations.includes(r.formulation)) stMet++;
    }
  }
  const showstoppersScore = stTotal > 0 ? (stMet / stTotal) * 100 : 100;

  const fmtW = { binding: 100, aspiring: 60, examining: 20 };
  let fmtTotal = 0, fmtScore = 0;
  for (const ag of Object.values(negEngine.ags))
    for (const r of Object.values(ag.topics))
      if (r) { fmtTotal++; fmtScore += fmtW[r.formulation] ?? 20; }
  const formulationAvg = fmtTotal > 0 ? fmtScore / fmtTotal : 50;

  const score     = Math.round(0.40 * satisfactionAvg + 0.35 * showstoppersScore + 0.25 * formulationAvg);
  const gradeData = RATING_GRADES.find(g => score >= g.min) ?? RATING_GRADES[RATING_GRADES.length - 1];
  return { score, ...gradeData, components: { satisfaction: satisfactionAvg, showstoppers: showstoppersScore, formulations: formulationAvg } };
}

export function getContractRating(negEngine) { return calculateRating(negEngine); }
