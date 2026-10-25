// Umfrageverlauf der eigenen Partei als SVG-Linie (F09): 5-%-Hürde gestrichelt, Wahlen als Punkte.
import { config } from '../../data/config.js';

const B = 320; // Breite und Höhe der Zeichenfläche in SVG-Einheiten; skaliert mit der Seitenbreite
const H = 120;
const RAND = { links: 34, rechts: 8, oben: 8, unten: 8 };
const prozent = (a) => a.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

export function verlaufSvg(verlauf, partei) {
  const werte = verlauf.map((e) => e.anteil);
  const huerde = config.sperrklauselProzent;
  // Skala: alle Werte und die Hürde sichtbar, mindestens 4 Punkte Spannweite
  let min = Math.min(...werte, huerde) - 1;
  let max = Math.max(...werte, huerde) + 1;
  if (max - min < 4) [min, max] = [(min + max) / 2 - 2, (min + max) / 2 + 2];
  min = Math.max(0, Math.floor(min));
  max = Math.ceil(max);

  const letzter = verlauf.at(-1).schritt || 1;
  const x = (schritt) => RAND.links + ((B - RAND.links - RAND.rechts) * schritt) / letzter;
  const y = (anteil) => RAND.oben + ((H - RAND.oben - RAND.unten) * (max - anteil)) / (max - min);
  const punkte = verlauf.map((e) => `${x(e.schritt).toFixed(1)},${y(e.anteil).toFixed(1)}`).join(' ');
  const wahlen = verlauf.filter((e) => e.wahl);
  const label = `Umfrageverlauf ${partei.name}: Start ${prozent(werte[0])}, jetzt ${prozent(werte.at(-1))}` +
    (wahlen.length ? `, ${wahlen.length} ${wahlen.length === 1 ? 'Wahl' : 'Wahlen'}` : '');

  return `
    <svg class="verlauf" viewBox="0 0 ${B} ${H}" role="img" aria-label="${label}">
      <text x="${RAND.links - 4}" y="${y(max) + 4}" text-anchor="end">${max} %</text>
      <text x="${RAND.links - 4}" y="${y(min)}" text-anchor="end">${min} %</text>
      <line x1="${RAND.links}" x2="${B - RAND.rechts}" y1="${y(huerde)}" y2="${y(huerde)}" class="huerde-linie" />
      <text x="${RAND.links - 4}" y="${y(huerde) + 4}" text-anchor="end">${huerde} %</text>
      <polyline points="${punkte}" fill="none" stroke="${partei.farbe}" stroke-width="2" />
      ${wahlen.map((e) => `<circle cx="${x(e.schritt)}" cy="${y(e.anteil)}" r="4" fill="${partei.farbe}" stroke="#fff"><title>Wahl: ${prozent(e.anteil)}</title></circle>`).join('')}
    </svg>`;
}
