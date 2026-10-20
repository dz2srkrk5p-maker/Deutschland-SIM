// ============================================================
// CONFIG.JS — Zentrale Spielkonfiguration
//
// Was: Alle Balancing-Parameter, Wahrscheinlichkeiten und
//      Schwellenwerte an einem Ort. Änderungen hier wirken
//      sich automatisch auf alle Module aus.
//
// Nutzt: keine Abhängigkeiten (wird von allen anderen Modulen genutzt)
//
// Erweiterungspunkte:
//   - Neue Parameter als weitere Konstanten im CONFIG-Objekt ergänzen
//   - DIFFICULTY_PRESETS: Objekte mit überschreibenden Werten für leicht/schwer
// ============================================================

export const CONFIG = {
  // ── WAHLZYKLUS ─────────────────────────────────────────────
  QUARTERS_PER_ELECTION: 16,          // 4 Jahre × 4 Quartale
  HAUSHALT_INTERVAL: 8,               // Alle 8 Quartale (= 2 Jahre)

  // ── STELLUNGNAHMEN ─────────────────────────────────────────
  MIN_STELLUNGNAHME_GAP: 2,           // Mindestabstand zwischen Stellungnahmen
  STELLUNGNAHME_FORCED_GAP: 3,        // Erzwingen wenn Abstand >= 3 Quartale
  STELLUNGNAHME_PROBABILITY: 0.55,    // Zufallswahrscheinlichkeit wenn eligible

  // ── PARLAMENT ──────────────────────────────────────────────
  TOTAL_SEATS: 630,
  MAJORITY_SEATS: 316,

  // ── KOALITION ──────────────────────────────────────────────
  COALITION_STABILITY_START: 68,
  COALITION_TENSION_MAX: 30,          // Maximale Instabilität pro Entscheidung
  FIRE_MINISTER_STABILITY_PENALTY: 10,
  COALITION_EXIT_STABILITY_PENALTY: 25,

  // ── GAME OVER SCHWELLENWERTE ──────────────────────────────
  GAME_OVER_DEBT: 100,                // Schuldenquote % BIP — zahlungsunfähig
  GAME_OVER_STABILITY: 5,             // Koalitionsstabilität — regierungsunfähig
  GAME_OVER_SATISFACTION: 8,          // Bevölkerungszufriedenheit — Misstrauensvotum

  // ── WIRTSCHAFT ─────────────────────────────────────────────
  MAX_DEBT_RATIO: 120,                // Schulden können max. 120% BIP erreichen

  // ── GESETZGEBUNG ───────────────────────────────────────────
  BUNDESRAT_BLOCK_CHANCE: 0.30,
  BVERFG_REVERSAL_CHANCE: 0.05,
  COMPROMISE_EFFECT_MULTIPLIER: 0.6,  // Gesetze per Kompromiss = 60% Wirkung

  // ── MINISTERIEN ─────────────────────────────────────────────
  SCANDAL_BASE_CHANCE: 0.08,
  CONFLICT_CHANCE: 0.20,
  MINISTER_COMPETENCE_HIGH: 70,       // Ab hier: kompetent (+20% Gesetzeserfolg)
  MINISTER_COMPETENCE_LOW: 40,        // Darunter: inkompetent (−20% Gesetzeserfolg)
  MINISTER_REPLACEMENT_WORSE_CHANCE: 0.60,

  // ── EREIGNISSE ─────────────────────────────────────────────
  RANDOM_EVENT_CHANCE: 0.05,          // Chance auf Zufallsereignis ohne Trigger

  // ── KOALITIONSVERHANDLUNG ──────────────────────────────────
  LEAK_PROBABILITY: 0.12,
};
