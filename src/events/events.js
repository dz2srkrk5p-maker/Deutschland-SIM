// ============================================================
// EVENTS.JS — Zentrales Ereignissystem
//
// Was: Importiert Events aus Kategorie-Dateien und stellt
//      checkForEvents() bereit. EVENT_POOL = alle Events zusammen.
//
// Nutzt: events-wirtschaft.js, events-international.js,
//        events-gesellschaft.js, config.js
//
// Erweiterungspunkte:
//   - Neue Kategorie-Datei erstellen (z.B. events-bundeslaender.js)
//   - Import + Spread in EVENT_POOL hier hinzufügen
//   - event.trigger und event.sideEffect bleiben in den Kategorie-
//     Dateien; serializeEvent() entfernt sie vor structuredClone()
// ============================================================

import { EVENTS_WIRTSCHAFT }    from './events-wirtschaft.js';
import { EVENTS_INTERNATIONAL } from './events-international.js';
import { EVENTS_GESELLSCHAFT }  from './events-gesellschaft.js';
// Zukunft: import { EVENTS_BUNDESLAENDER } from './events-bundeslaender.js';

import { CONFIG } from '../config.js';

// Alle Events in einem Pool — Reihenfolge hat keinen Einfluss
// (shuffleArray sorgt für gleiche Chancen aller Events)
const EVENT_POOL = [
  ...EVENTS_WIRTSCHAFT,
  ...EVENTS_INTERNATIONAL,
  ...EVENTS_GESELLSCHAFT,
  // Zukunft: ...EVENTS_BUNDESLAENDER,
];

// Funktionen (trigger, sideEffect) aus Events herausfiltern,
// damit structuredClone() auf Event-Objekte angewendet werden kann
function serializeEvent(event) {
  const { trigger, sideEffect, ...rest } = event;
  return rest;
}

// Pool mischen damit positive Events dieselbe Chance haben wie negative
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── EREIGNIS-TRIGGER PRÜFEN ──────────────────────────────────
export function checkForEvents(state) {
  const triggered = [];
  const tq  = state.government?.termQuarter ?? 0;
  const sch = state.scheduling ?? {};

  // Mindestabstand von 2 Quartalen zwischen Events
  if (tq - (sch.lastEventQuarter ?? -10) < 2) return triggered;

  // Maximal 10 Events pro Legislatur (16 Quartale)
  if ((sch.eventCount ?? 0) >= 10) return triggered;

  // Bereits aktive Events nicht nochmal triggern
  const activeIds = new Set(state.activeEvents.map(e => e.id));

  for (const event of shuffleArray(EVENT_POOL)) {
    if (activeIds.has(event.id)) continue;

    const conditionMet = event.trigger ? event.trigger(state) : false;
    const randomRoll = Math.random();

    // Wahrscheinlichkeit um 40% reduziert
    if (conditionMet && randomRoll < event.probability * 0.6) {
      triggered.push(serializeEvent(event));
      break; // Nur ein Ereignis pro Quartal
    }
  }

  // Auch ohne Trigger: Zufallsereignis möglich (ebenfalls -40%)
  if (triggered.length === 0 && Math.random() < CONFIG.RANDOM_EVENT_CHANCE * 0.6) {
    const randomEvents = EVENT_POOL.filter(e => !e.trigger && !activeIds.has(e.id));
    if (randomEvents.length > 0) {
      triggered.push(serializeEvent(randomEvents[Math.floor(Math.random() * randomEvents.length)]));
    }
  }

  return triggered;
}
