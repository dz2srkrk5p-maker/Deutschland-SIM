import { schlagzeilen } from '../../engine/schlagzeilen.js';

// Nachrichtenticker (F15): feste Liste, keine Laufschrift, keine Live-Region (die Ansage aus F04 reicht).
export function tickerHtml(zustand) {
  const liste = schlagzeilen(zustand);
  if (!liste.length) return '';
  return `<section class="ticker" aria-label="Schlagzeilen"><ul>${liste.map((s) => `<li>${s}</li>`).join('')}</ul></section>`;
}
