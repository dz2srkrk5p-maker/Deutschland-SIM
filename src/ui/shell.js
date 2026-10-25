// App-Shell (UI-Umbau): Kopfzeile mit Dauer-Kennzahlen und Spielmenü, Navigation bzw. Schrittanzeige, Hauptbereich.
import { monatsname } from '../data/kalender.js';
import { parteien } from '../data/parteien.js';
import { config } from '../data/config.js';
import { hinweiseAn } from '../storage/speicher.js';
import { zahl, prozent, trend, punkt } from './components/basis.js';
import { teilenHtml } from './components/teilen.js';
import { koalitionsWarnung } from './components/koalitionslage.js';
import { hilfeHtml } from './components/hilfe.js';
import { umfrageBilanzKurz } from './components/umfragebilanz.js';
import { erklaerungen } from '../data/hinweise.js';
import { status } from './components/basis.js';

const partei = (id) => parteien.find((p) => p.id === id);

// Bereiche der Regierung (Hauptnavigation)
export const BEREICHE = [
  { id: 'lage', text: 'Lage' },
  { id: 'probleme', text: 'Probleme' },
  { id: 'reformen', text: 'Reformen' },
  { id: 'haushalt', text: 'Haushalt' },
  { id: 'parlament', text: 'Parlament' },
  { id: 'chronik', text: 'Chronik' },
];

// Schritte des geführten Ablaufs bis zur Regierung
const SCHRITTE = [
  { id: 'wahlkampf', text: 'Wahlkampf' },
  { id: 'wahlabend', text: 'Wahlabend' },
  { id: 'koalition', text: 'Regierungsbildung' },
  { id: 'kabinett', text: 'Kabinett' },
];

export function zeitText(z) {
  if (z.phase === 'wahlkampf') return `Woche ${z.wahlkampfWoche} von ${config.wahlkampf.wochen}`;
  if (z.phase === 'koalition' || z.phase === 'kabinett') return 'Regierungsbildung';
  if (z.phase === 'regierung') return `Jahr ${z.haushalt.jahr} · ${monatsname(z.monat)}`;
  return 'Spielende';
}

// Umfragetrend der eigenen Partei über die letzten 3 Verlaufsschritte
export const umfrageTrend = (z) => z.verlauf.at(-1).anteil - z.verlauf.at(-Math.min(4, z.verlauf.length)).anteil;

function kopfHtml(z) {
  if (!z) return `<header class="kopf"><div class="kopf-innen"><span class="marke">Deutschland-Simulator</span></div></header>`;
  const p = partei(z.spielerParteiId);
  return `
    <header class="kopf"><div class="kopf-innen">
      <span class="marke">Deutschland-Simulator</span>
      <dl class="dauer">
        <div><dt>Partei</dt><dd>${punkt(p.farbe)}${p.name}</dd></div>
        <div><dt>Zeit</dt><dd>${zeitText(z)}</dd></div>
        <div><dt>Umfrage</dt><dd title="${umfrageBilanzKurz(z) || 'Noch keine Änderung'}. Einzelheiten: Lage, „Warum bewegt sich die Umfrage?“">${prozent(z.anteile[p.id])} ${trend(umfrageTrend(z))}</dd></div>
        <div><dt>Kanzlerjahre</dt><dd>${zahl(z.statistik.jahreKanzler)} von ${config.spielende.siegJahreKanzler}</dd></div>
        ${z.phase === 'regierung' ? `<div><dt>Kapital</dt><dd title="${erklaerungen.kapital}">${z.kapital}</dd></div>` : ''}
        ${z.phase === 'regierung' && koalitionsWarnung(z) ? `<div><dt>Koalition</dt><dd>${status(koalitionsWarnung(z).stufe, koalitionsWarnung(z).text)}</dd></div>` : ''}
      </dl>
      <button id="menue-auf" aria-haspopup="dialog">☰ Spiel</button>
    </div></header>`;
}

// Spielmenü als Modal: Chronik, Hilfe, Teilen, Hinweise, Neues Spiel (mit Bestätigung)
function menueHtml(z, phaseMitNavi) {
  return `
    <dialog id="menue" aria-labelledby="menue-titel">
      <h2 id="menue-titel">Spiel</h2>
      <div class="knoepfe">
        ${phaseMitNavi ? '' : '<button data-menue="chronik">Chronik (Verlauf, Protokoll)</button>'}
        <button data-menue="hilfe">Hilfe: Herkunft der Werte</button>
        <button data-menue="hinweise">${hinweiseAn() ? 'Hinweise ausblenden' : 'Hinweise einblenden'}</button>
        <button data-menue="neu" class="gefahr">Neues Spiel …</button>
        <button data-menue="zu" class="primaer">Schließen</button>
      </div>
      <h3>Partie teilen</h3>
      ${teilenHtml(z, 'menue-teilen')}
    </dialog>
    <dialog id="hilfe" class="breit" aria-labelledby="hilfe-titel">
      <h2 id="hilfe-titel">Hilfe: Herkunft der Werte</h2>
      ${hilfeHtml()}
      <div class="knoepfe"><button data-menue="hilfe-zu" class="primaer">Schließen</button></div>
    </dialog>
    <dialog id="neu-bestaetigen" aria-labelledby="neu-titel">
      <h2 id="neu-titel">Neues Spiel beginnen?</h2>
      <p>Der gespeicherte Stand dieser Partie wird gelöscht.</p>
      <div class="knoepfe"><button data-menue="neu-ja" class="gefahr primaer">Ja, Partie beenden</button><button data-menue="neu-nein">Abbrechen</button></div>
    </dialog>`;
}

const naviHtml = (aktiv, badges) => `
  <nav class="navi" aria-label="Hauptnavigation"><div class="navi-innen">
    ${BEREICHE.map((b) => `<button data-bereich="${b.id}" ${b.id === aktiv ? 'aria-current="page"' : ''}>${b.text}${badges[b.id] ?? ''}</button>`).join('')}
  </div></nav>`;

export function schritteHtml(aktiv) {
  const i = SCHRITTE.findIndex((s) => s.id === aktiv);
  return `<ol class="schritte" aria-label="Weg zur Regierung">${SCHRITTE.map((s, j) =>
    `<li ${j === i ? 'aria-current="step"' : ''} class="${j < i ? 'erledigt' : ''}">${j + 1}. ${s.text}</li>`).join('')}</ol>`;
}

// Gerüst der Seite; Rückmeldungen kommen nach #meldung, der Bildschirm nach #ansicht
export function shellHtml(z, { aktiv = null, badges = {} } = {}) {
  return `<div class="oben">${kopfHtml(z)}${aktiv ? naviHtml(aktiv, badges) : ''}</div><main class="inhalt" id="haupt"><div id="meldung"></div><div id="ansicht"></div></main>${z ? menueHtml(z, Boolean(aktiv)) : ''}`;
}
