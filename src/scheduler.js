// ============================================================
// SCHEDULER.JS — Quartal-Timing für alle Gameplay-Elemente
//
// Was: Entscheidet pro Quartal ob Haushalt, Ereignis oder
//      Stellungnahme ansteht. Genau 1 Element pro Quartal.
//      Priorität: Haushalt > Ereignis > Stellungnahme.
//
// Nutzt: events/stellungnahmen.js, events/haushaltsplanung.js,
//        config.js (HAUSHALT_INTERVAL, STELLUNGNAHME_*)
//
// Erweiterungspunkte:
//   - Neue Prioritätsstufe zwischen Ereignis und Stellungnahme einfügen
//   - HAUSHALT_INTERVAL in config.js anpassen (Standard: 8)
// ============================================================

import { STELLUNGNAHMEN_POOL } from './events/stellungnahmen.js';
import { buildHaushaltsEvent  } from './events/haushaltsplanung.js';
import { CONFIG } from './config.js';

/**
 * Entscheidet was in diesem Quartal passiert.
 * Wird NACH tick() aufgerufen (termQuarter ist bereits erhöht).
 *
 * @param {object} state      - aktueller Spielstate
 * @param {Array}  rawEvents  - Ereignisse die checkForEvents() gefunden hat
 * @returns {{ events: Array, update: object }}
 *   events: Array von Event-Objekten (max. 1)
 *   update: Felder die in state.scheduling gemergt werden sollen
 */
export function runScheduler(state, rawEvents) {
  const tq  = state.government.termQuarter;
  const sch = state.scheduling ?? {};
  const update = {};

  // ── 1. HAUSHALT — höchste Priorität ──────────────────────────
  if (tq > 0 && tq % CONFIG.HAUSHALT_INTERVAL === 0) {
    update.lastQuarterType = 'haushalt';
    return { events: [buildHaushaltsEvent(state)], update };
  }

  // ── 2. EREIGNIS — wenn getriggert (kein Haushalt fällig) ─────
  if (rawEvents.length > 0) {
    update.lastQuarterType  = 'ereignis';
    update.lastEventQuarter = tq;
    update.eventCount       = (sch.eventCount ?? 0) + 1;
    return { events: rawEvents, update };
  }

  // ── 3. STELLUNGNAHME — zufällig aber garantiert ───────────────
  const lastSQ  = sch.lastStellungnahmeQuarter ?? 0;
  const gap     = tq - lastSQ;
  // Nie direkt nach einer Stellungnahme (gap muss >= MIN_STELLUNGNAHME_GAP)
  // Erzwingen ab STELLUNGNAHME_FORCED_GAP (Garantie: kein längeres Schweigen)
  const eligible = gap >= CONFIG.MIN_STELLUNGNAHME_GAP && sch.lastQuarterType !== 'stellungnahme';
  const forced   = gap >= CONFIG.STELLUNGNAHME_FORCED_GAP;

  if (eligible && (forced || Math.random() < CONFIG.STELLUNGNAHME_PROBABILITY)) {
    const stell = _pickStellungnahme(sch.usedStellungnahmeTopics ?? []);
    if (stell) {
      update.lastStellungnahmeQuarter  = tq;
      update.lastQuarterType           = 'stellungnahme';
      update.usedStellungnahmeTopics   = [...(sch.usedStellungnahmeTopics ?? []), stell.topic];
      return { events: [stell], update };
    }
  }

  update.lastQuarterType = null;
  return { events: [], update };
}

/**
 * Liefert eine Vorschau der nächsten 4 Quartale für das Dashboard.
 * Berücksichtigt deterministische Haushalt-Termine und schätzt
 * Stellungnahme-Wahrscheinlichkeiten.
 *
 * @returns {Array<{ relQ, absQ, type, label, certain }>}
 *   relQ:    relativer Abstand (1–4)
 *   absQ:    absoluter Legislatur-Quartal
 *   type:    'haushalt' | 'stellungnahme' | 'unknown'
 *   label:   Anzeige-Text
 *   certain: ob sicher (Haushalt) oder nur wahrscheinlich
 */
export function getTimeline(state) {
  const tq      = state.government.termQuarter;
  const sch     = state.scheduling ?? {};
  const lastSQ  = sch.lastStellungnahmeQuarter ?? 0;
  const lastType = sch.lastQuarterType ?? null;

  const timeline = [];
  // Simulierte State-Variablen um die nächsten Quartale vorherzusagen
  let simGap      = tq - lastSQ;
  let simLastType = lastType;

  for (let i = 1; i <= 4; i++) {
    const absQ = tq + i;

    // Haushalt: deterministisch
    if (absQ > 0 && absQ % CONFIG.HAUSHALT_INTERVAL === 0) {
      timeline.push({ relQ: i, absQ, type: 'haushalt', label: 'Haushaltsplanung', certain: true });
      simLastType = 'haushalt';
      simGap = 0;
      continue;
    }

    simGap++;
    const eligible = simGap >= CONFIG.MIN_STELLUNGNAHME_GAP && simLastType !== 'stellungnahme';
    const forced   = simGap >= CONFIG.STELLUNGNAHME_FORCED_GAP;

    if (eligible) {
      if (forced) {
        // Erzwungen: sicher in diesem Quartal
        timeline.push({ relQ: i, absQ, type: 'stellungnahme', label: 'Stellungnahme erwartet', certain: true });
        simLastType = 'stellungnahme';
        simGap = 0;
      } else {
        // Möglich, aber nicht garantiert
        timeline.push({ relQ: i, absQ, type: 'stellungnahme', label: 'Stellungnahme möglich', certain: false });
        // Simulation: konservativ annehmen es findet statt (damit nächste Quartale realistisch sind)
        simLastType = 'stellungnahme';
        simGap = 0;
      }
    } else {
      timeline.push({ relQ: i, absQ, type: 'unknown', label: '—', certain: false });
    }
  }

  return timeline;
}

/**
 * Quartale bis zur nächsten Haushaltsplanung.
 */
export function quartersUntilHaushalt(state) {
  const tq = state.government.termQuarter;
  return CONFIG.HAUSHALT_INTERVAL - (tq % CONFIG.HAUSHALT_INTERVAL);
}

// ── Interne Hilfsfunktionen ────────────────────────────────────

function _pickStellungnahme(usedTopics) {
  const available = STELLUNGNAHMEN_POOL.filter(s => !usedTopics.includes(s.topic));
  if (available.length === 0) {
    // Alle Themen verbraucht — für längere Legislaturen Pool zurücksetzen
    return STELLUNGNAHMEN_POOL[Math.floor(Math.random() * STELLUNGNAHMEN_POOL.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}
