// Bundestag-Abstimmung zum Aufklappen (F10): Fraktionen mit Stimme, Summe, Ergebnis.
import { parteien } from '../../data/parteien.js';

const TEXT = { ja: 'Ja', nein: 'Nein', enthaltung: 'Enthaltung' };

export function abstimmungHtml(a, titel, offen) {
  return `
    <details class="abstimmung" ${offen ? 'open' : ''}>
      <summary>${titel}: ${a.ja} Ja, ${a.nein} Nein, ${a.enthaltung} Enthaltung – <span class="${a.angenommen ? 'ok' : 'rot'}">${a.angenommen ? 'angenommen' : 'abgelehnt'}</span></summary>
      ${a.fraktionen.map((f) => {
        const p = parteien.find((x) => x.id === f.id);
        return `<div class="land"><span><span class="punkt" style="background:${p.farbe}"></span>${p.name}</span><span></span><span>${f.sitze}</span><span class="${f.stimme === 'ja' ? 'ok' : ''}">${TEXT[f.stimme]}</span></div>`;
      }).join('')}
      <p><small>Angenommen bei mehr Ja- als Nein-Stimmen, Enthaltungen zählen nicht.</small></p>
    </details>`;
}
