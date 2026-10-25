// Wirtschaft (Vorjahr) als kleine Liniendiagramme, eins je Kennzahl (verschiedene Skalen, daher kein gemeinsames Diagramm).
// Gestrichelt: Grenze für ✓/⚠. Beim Überfahren eines Jahres erscheinen Hilfslinie und Wert; alle Werte zusätzlich als Tabelle.
import { config } from '../../data/config.js';
import { zahl, aufklapp } from './basis.js';

const B = 200; // Zeichenfläche in SVG-Einheiten, skaliert mit der Kachelbreite
const H = 64;
const RAND = { links: 6, rechts: 6, oben: 22, unten: 6 };
const g = config.wirtschaft.anzeigeGrenzen;
// gut: Bewertung wie bisher in der Lage; grenze: gestrichelte Linie (null = keine)
const KENNZAHLEN = [
  { id: 'wachstum', name: 'Wachstum', einheit: ' %', grenze: config.wirtschaft.potenzialWachstum, gut: (v) => v >= config.wirtschaft.potenzialWachstum },
  { id: 'inflation', name: 'Inflation', einheit: ' %', grenze: g.inflation, gut: (v) => v <= g.inflation },
  { id: 'arbeitslosigkeit', name: 'Arbeitslosenquote', einheit: ' %', grenze: g.arbeitslosigkeit, gut: (v) => v <= g.arbeitslosigkeit },
  { id: 'schuldenquote', name: 'Schuldenquote', einheit: ' %', grenze: g.schuldenquote, gut: (v) => v <= g.schuldenquote },
  { id: 'gini', name: 'Ungleichheit (Gini)', einheit: '', grenze: null, gut: () => null },
];
const jahrName = (i) => (i === 0 ? 'Start' : `Jahr ${i}`);
const wert = (k, v) => `${zahl(v, 1)}${k.einheit}`;
const symbol = (gut) => (gut === null ? '' : gut ? ' <span class="ok">✓</span>' : ' <span class="gelb">⚠</span>');

function diagramm(k, werte) {
  const alle = k.grenze === null ? werte : [...werte, k.grenze];
  let min = Math.min(...alle);
  let max = Math.max(...alle);
  if (max - min < 1) [min, max] = [(min + max) / 2 - 0.5, (min + max) / 2 + 0.5]; // flache Verläufe nicht aufblähen
  const breite = B - RAND.links - RAND.rechts;
  const x = (i) => RAND.links + (werte.length > 1 ? (breite * i) / (werte.length - 1) : breite / 2);
  const y = (v) => RAND.oben + ((H - RAND.oben - RAND.unten) * (max - v)) / (max - min);
  const spalte = werte.length > 1 ? breite / (werte.length - 1) : breite;
  const label = `${k.name}: ${werte.map((v, i) => `${jahrName(i)} ${wert(k, v)}`).join(', ')}`;
  return `<svg class="mini-verlauf" viewBox="0 0 ${B} ${H}" role="img" aria-label="${label}">
    ${k.grenze === null ? '' : `<line x1="${RAND.links}" x2="${B - RAND.rechts}" y1="${y(k.grenze)}" y2="${y(k.grenze)}" class="grenze" />`}
    ${werte.length > 1 ? `<polyline points="${werte.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}" class="linie" />` : ''}
    <circle cx="${x(werte.length - 1)}" cy="${y(werte.at(-1))}" r="4" class="punkt-aktuell" />
    ${werte.map((v, i) => `<g class="spalte">
      <rect x="${(x(i) - spalte / 2).toFixed(1)}" y="0" width="${spalte.toFixed(1)}" height="${H}" />
      <line x1="${x(i)}" x2="${x(i)}" y1="${RAND.oben}" y2="${H - RAND.unten}" class="kreuz" />
      <text x="${Math.min(Math.max(x(i), 55), B - 55)}" y="15" text-anchor="middle" class="kreuz">${jahrName(i)}: ${wert(k, v)}</text>
      <title>${jahrName(i)}: ${wert(k, v)}</title></g>`).join('')}
  </svg>`;
}

export function wirtschaftsverlaufHtml(zustand) {
  const verlauf = zustand.wirtschaftVerlauf?.length ? zustand.wirtschaftVerlauf : [zustand.land];
  const kacheln = KENNZAHLEN.map((k) => {
    const werte = verlauf.map((e) => e[k.id]);
    const jetzt = zustand.land[k.id];
    return `<div class="mini-kachel">
      <div class="mini-kopf"><span>${k.name}</span><span class="zahl">${wert(k, jetzt)}${symbol(k.gut(jetzt))}</span></div>
      ${diagramm(k, werte)}
    </div>`;
  }).join('');
  const tabelle = `<table><thead><tr><th scope="col">Jahr</th>${KENNZAHLEN.map((k) => `<th scope="col">${k.name}</th>`).join('')}</tr></thead>
    <tbody>${verlauf.map((e, i) => `<tr><th scope="row">${jahrName(i)}</th>${KENNZAHLEN.map((k) => `<td>${wert(k, e[k.id])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  return `<div class="mini-raster">${kacheln}</div>
    <p class="klein">${verlauf.length > 1 ? 'Ein Punkt je Haushaltsjahr; gestrichelt: Grenze für ✓.' : 'Der Verlauf beginnt mit dem ersten beschlossenen Haushalt. Gestrichelt: Grenze für ✓.'}</p>
    ${aufklapp('Werte als Tabelle', tabelle)}`;
}
