// ============================================================
// simulate.js — Monte-Carlo-Simulation ohne Spieler-Input
//
// Aufruf: npm run simulate [QUARTALE] [LAEUFE]
// Standard: 50 Quartale, 200 Läufe
//
// Ausgabe:
//   - Min/Max/Ø für alle 20 Variablen (über alle Q × Läufe)
//   - Endwerte (QN) je Lauf: Min/Max/Ø Vergleich
//   - Game-Over-Häufigkeit und -Grund
//   - Ereignis-Trigger-Statistik
// ============================================================

import { createInitialState } from './src/engine/state.js';
import { tick } from './src/engine/engine.js';
import { checkForEvents } from './src/events/events.js';

const QUARTERS = parseInt(process.argv[2]) || 50;
const RUNS     = parseInt(process.argv[3]) || 200;

// ── ALLE 20 VARIABLEN ────────────────────────────────────────

const VARS = {
  'economy.gdpIndex':             'BIP-Index',
  'economy.unemployment':         'Beschäftigung-Index',
  'economy.inflation':            'Inflations-Index',
  'economy.debtRatio':            'Schuldenquote (%)',
  'economy.interestBurden':       'Zinslast',
  'economy.taxRevenue':           'Steuereinnahmen',
  'economy.tradeBalance':         'Außenhandel',
  'society.publicSatisfaction':   'Bevölkerungszufriedenheit',
  'society.socialJustice':        'Soziale Gerechtigkeit',
  'society.securityFeeling':      'Sicherheitsgefühl',
  'society.climateProgress':      'Klimafortschritt',
  'society.healthcareQuality':    'Gesundheitssystem',
  'society.infrastructureState':  'Infrastruktur',
  'politics.coalitionStability':  'Koalitionsstabilität',
  'politics.mediaRelations':      'Medienbeziehungen',
  'politics.parliamentarySupport':'Parlamentsrückhalt',
  'politics.euRelations':         'EU-Beziehungen',
  'politics.usRelations':         'USA-Beziehungen',
  'politics.chinaRelations':      'China-Beziehungen',
  'government.approvalRating':    'Kanzler-Zustimmung',
};

function getVar(state, path) {
  const parts = path.split('.');
  let obj = state;
  for (const p of parts) obj = obj?.[p];
  return typeof obj === 'number' ? obj : 0;
}

// ── STARTZUSTAND ─────────────────────────────────────────────
// GroKo CDU+SPD als neutrale Baseline ohne Spieler-Vorteil

function buildStartState() {
  const s = createInitialState();
  s.government.coalition       = ['CDU', 'SPD'];
  s.government.chancellorParty = 'CDU';
  s.government.approvalRating  = 45;
  s.parliament.seats = { CDU: 196, SPD: 120, Grüne: 85, AfD: 152, FDP: 72, BSW: 5 };
  return s;
}

// ── SIMULATION ────────────────────────────────────────────────

function runSimulation() {
  // allValues[path] = jeder Wert über alle Quartale aller Läufe
  const allValues   = {};
  const finalValues = {};   // Wert am letzten Quartal je Lauf
  for (const path of Object.keys(VARS)) {
    allValues[path]   = [];
    finalValues[path] = [];
  }

  const gameOverEvents = [];           // { run, quarter, reason }
  const eventCounts    = new Map();    // id → { label, count }

  // Anfangswerte für Vergleich
  const initialValues = {};
  const initRef = buildStartState();
  for (const path of Object.keys(VARS)) initialValues[path] = getVar(initRef, path);

  for (let run = 0; run < RUNS; run++) {
    let state = buildStartState();
    let gameOverThisRun = false;

    for (let q = 0; q < QUARTERS; q++) {
      // Events prüfen — Effekte werden NICHT angewendet (kein Spieler-Input)
      const triggered = checkForEvents(state);
      for (const ev of triggered) {
        if (!eventCounts.has(ev.id)) {
          eventCounts.set(ev.id, { label: ev.label ?? ev.id, count: 0 });
        }
        eventCounts.get(ev.id).count++;
        // In activeEvents eintragen damit dasselbe Event nicht gleich nochmal feuert
        state.activeEvents.push({ id: ev.id, type: 'simulated' });
        // Scheduling aktualisieren (Mindestabstand + Max-Count tracking)
        state.scheduling = {
          ...state.scheduling,
          lastEventQuarter: state.government.termQuarter,
          eventCount: (state.scheduling?.eventCount ?? 0) + 1,
        };
      }

      state = tick(state);

      // Variablen aufzeichnen (nach tick)
      for (const path of Object.keys(VARS)) {
        allValues[path].push(getVar(state, path));
      }

      // Game-Over: nur erste Instanz pro Lauf zählen, dann Lauf fortsetzen
      if (state.phase === 'gameover' && !gameOverThisRun) {
        gameOverEvents.push({ run: run + 1, quarter: q + 1, reason: state.gameOverReason ?? 'Unbekannt' });
        gameOverThisRun = true;
        state.phase = 'governing';
      }

      // Wahl-Phase zurücksetzen damit alle 50 Quartale laufen
      if (state.phase === 'campaign') {
        state.phase = 'governing';
        state.turnsUntilElection = 16;
      }
    }

    for (const path of Object.keys(VARS)) {
      finalValues[path].push(getVar(state, path));
    }
  }

  return { allValues, finalValues, initialValues, gameOverEvents, eventCounts };
}

// ── STATISTIK ────────────────────────────────────────────────

function calcStats(arr) {
  if (arr.length === 0) return { min: 0, max: 0, avg: 0, std: 0 };
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  const std = Math.sqrt(arr.reduce((s, v) => s + (v - avg) ** 2, 0) / arr.length);
  return { min, max, avg, std };
}

function f(n, d = 1) { return n.toFixed(d).padStart(7); }
function fSmall(n)   { return n.toFixed(2).padStart(6); }

function sparkBar(avg, min, max, width = 18) {
  if (max === min) return '[' + '▓'.repeat(width) + ']';
  const pos = Math.max(0, Math.min(width, Math.round(((avg - min) / (max - min)) * width)));
  return '[' + '▓'.repeat(pos) + '░'.repeat(width - pos) + ']';
}

function trendArrow(ini, finalAvg) {
  const d = finalAvg - ini;
  if (d > 3)  return '↑ (' + (d > 0 ? '+' : '') + d.toFixed(1) + ')';
  if (d < -3) return '↓ (' + d.toFixed(1) + ')';
  return '→ (' + (d > 0 ? '+' : '') + d.toFixed(1) + ')';
}

// ── REPORT AUSGABE ────────────────────────────────────────────

function printReport({ allValues, finalValues, initialValues, gameOverEvents, eventCounts }) {
  const HR  = '─'.repeat(100);
  const DHR = '═'.repeat(100);

  console.log('\n' + DHR);
  console.log(' DEUTSCHLAND SIMULATOR — Simulations-Report');
  console.log(` ${RUNS} Läufe × ${QUARTERS} Quartale   (${(RUNS * QUARTERS).toLocaleString()} Datenpunkte/Variable)   Baseline: CDU+SPD GroKo`);
  console.log(DHR);

  // ── 1. VARIABLEN: VOLLSTÄNDIGE STATISTIK ─────────────────────
  console.log('\n▌ ALLE VARIABLEN — Statistik über alle Quartale × alle Läufe\n');
  console.log(
    '  ' + 'Variable'.padEnd(30) +
    'Start'.padStart(8) +
    ' │' + '  Min  '.padStart(8) +
    '  Max  '.padStart(8) +
    '   Ø   '.padStart(8) +
    '  σ   '.padStart(7) +
    '  Position (Min→Max)    ' +
    'Trend (Ø Ende)'
  );
  console.log('  ' + HR.slice(0, 96));

  for (const [path, label] of Object.entries(VARS)) {
    const s    = calcStats(allValues[path]);
    const sf   = calcStats(finalValues[path]);
    const ini  = initialValues[path];
    const name = label.padEnd(30);
    const bar  = sparkBar(s.avg, s.min, s.max);
    const trend = trendArrow(ini, sf.avg);

    console.log(
      `  ${name}` +
      f(ini) + ' │' +
      f(s.min) + f(s.max) + f(s.avg) + fSmall(s.std) +
      `  ${bar}  ` +
      trend
    );
  }

  // ── 2. ENDWERTE Q(N): CROSS-RUN VERGLEICH ────────────────────
  console.log('\n\n▌ ENDWERTE BEI Q' + QUARTERS + ' — Verteilung über ' + RUNS + ' Läufe\n');
  console.log(
    '  ' + 'Variable'.padEnd(30) +
    'Start'.padStart(8) +
    ' │' + '  Min  '.padStart(8) +
    '  Max  '.padStart(8) +
    '   Ø   '.padStart(8) +
    '  σ   '.padStart(7) +
    '  Streuung (breiter = mehr Varianz)'
  );
  console.log('  ' + HR.slice(0, 96));

  for (const [path, label] of Object.entries(VARS)) {
    const s    = calcStats(finalValues[path]);
    const ini  = initialValues[path];
    const name = label.padEnd(30);
    const range = Math.round(s.max - s.min);
    const spreadBar = '█'.repeat(Math.min(36, Math.round(range / 2)));
    console.log(
      `  ${name}` +
      f(ini) + ' │' +
      f(s.min) + f(s.max) + f(s.avg) + fSmall(s.std) +
      `  ${spreadBar}`
    );
  }

  // ── 3. GAME OVER ──────────────────────────────────────────────
  console.log('\n\n' + DHR);
  console.log(' GAME OVER — Analyse');
  console.log(DHR);

  if (gameOverEvents.length === 0) {
    console.log('\n  ✓ Kein einziges Game Over in allen ' + RUNS + ' Läufen über ' + QUARTERS + ' Quartale.\n');
  } else {
    const pct = (gameOverEvents.length / RUNS * 100).toFixed(1);
    const qs  = calcStats(gameOverEvents.map(e => e.quarter));
    console.log(`\n  Aufgetreten:   ${gameOverEvents.length} von ${RUNS} Läufen (${pct}%)`);
    console.log(`  Ø Quartal:     ${qs.avg.toFixed(1)}   Frühestes: Q${qs.min}   Spätestes: Q${qs.max}`);

    // Aufschlüsselung nach Grund
    const byReason = new Map();
    for (const ev of gameOverEvents) {
      byReason.set(ev.reason, (byReason.get(ev.reason) ?? 0) + 1);
    }
    const sortedReasons = [...byReason.entries()].sort((a, b) => b[1] - a[1]);

    console.log('\n  Grund                                                  Anzahl    %    Balken');
    console.log('  ' + HR.slice(0, 80));
    for (const [reason, count] of sortedReasons) {
      const p   = (count / RUNS * 100).toFixed(1);
      const bar = '█'.repeat(Math.round(count / RUNS * 40));
      const shortReason = reason.length > 50 ? reason.slice(0, 47) + '…' : reason;
      console.log(`  ${shortReason.padEnd(52)} ${String(count).padStart(5)}  ${p.padStart(5)}%  ${bar}`);
    }

    // Frühe Game Overs
    const early = gameOverEvents.filter(e => e.quarter <= 20);
    console.log(`\n  Game Overs bis Q20: ${early.length} (von ${gameOverEvents.length} gesamt)`);
    if (early.length > 0) {
      for (const e of early.slice(0, 8)) {
        const shortR = (e.reason ?? '').slice(0, 55);
        console.log(`    Lauf ${String(e.run).padStart(3)}  Q${String(e.quarter).padStart(2)}  ${shortR}`);
      }
      if (early.length > 8) console.log(`    … und ${early.length - 8} weitere`);
    }
    console.log();
  }

  // ── 4. EREIGNISSE ─────────────────────────────────────────────
  console.log(DHR);
  console.log(' EREIGNISSE — Trigger-Häufigkeit über alle ' + RUNS + ' Läufe');
  console.log(DHR);

  if (eventCounts.size === 0) {
    console.log('\n  Keine Ereignisse getriggert.\n');
  } else {
    const sorted   = [...eventCounts.entries()].sort((a, b) => b[1].count - a[1].count);
    const maxCount = sorted[0][1].count;
    const totalTriggers = sorted.reduce((s, [, d]) => s + d.count, 0);

    console.log(`\n  ${'Ereignis'.padEnd(42)} ${'Ges.'.padStart(6)}  ${'∅/Lauf'.padStart(7)}  ${'%'.padStart(6)}  Häufigkeit`);
    console.log('  ' + HR.slice(0, 88));

    for (const [id, { label, count }] of sorted) {
      const perRun  = (count / RUNS).toFixed(2);
      const pct     = (count / totalTriggers * 100).toFixed(1);
      const barLen  = Math.round((count / maxCount) * 30);
      const bar     = '█'.repeat(barLen) + '░'.repeat(30 - barLen);
      const name    = (label ?? id).padEnd(42);
      console.log(`  ${name} ${String(count).padStart(6)}  ${perRun.padStart(7)}  ${pct.padStart(5)}%  ${bar}`);
    }

    console.log(`\n  ${sorted.length} verschiedene Event-Typen  |  ${totalTriggers} Trigger gesamt  |  Ø ${(totalTriggers / RUNS).toFixed(1)} Events/Lauf`);
    console.log();
  }

  console.log(DHR + '\n');
}

// ── MAIN ──────────────────────────────────────────────────────

console.log(`\nStarte Simulation: ${RUNS} Läufe × ${QUARTERS} Quartale …`);
const t0      = Date.now();
const result  = runSimulation();
const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
console.log(`Abgeschlossen in ${elapsed}s.\n`);

printReport(result);
