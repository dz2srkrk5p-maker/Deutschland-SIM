// ── HAUSHALTSPLANUNG — Trigger-Event ─────────────────────────
// Enthält keine Choices mehr — der HaushaltsScreen übernimmt.

export function buildHaushaltsEvent(state) {
  const periode = Math.ceil(state.government.termQuarter / 8);
  return {
    id:         `haushalt-${state.year}-p${periode}`,
    type:       'haushalt',
    isHaushalt: true,
    year:       state.year,
    label:      `Bundeshaushalt ${state.year}`,
    periode,
  };
}
