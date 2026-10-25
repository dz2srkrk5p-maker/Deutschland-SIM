import { parteien } from '../../data/parteien.js';
import { verlaufSvg } from '../components/verlauf.js';
import { wahlergebnisHtml } from '../components/wahlergebnis.js';
import { karte, tabs, leer } from '../components/basis.js';

const JE_SEITE = 20;
const TABS = [
  { id: 'verlauf', text: 'Umfrageverlauf' },
  { id: 'wahl', text: 'Letzte Wahl' },
  { id: 'protokoll', text: 'Protokoll' },
];

// Chronik (Nachschlagen): Umfrageverlauf, letzte Wahl, Protokoll seitenweise (neueste zuerst).
// onZurueck nur im geführten Ablauf (Aufruf über das Spielmenü)
export function chronikScreen(el, zustand, protokoll, { tab, seite, onTab, onSeite, onZurueck }) {
  const spieler = parteien.find((p) => p.id === zustand.spielerParteiId);
  const neueste = [...protokoll].reverse();
  const seiten = Math.max(1, Math.ceil(neueste.length / JE_SEITE));
  const s = Math.min(seite, seiten - 1);
  const inhalt = {
    verlauf: () => karte(`${verlaufSvg(zustand.verlauf, spieler)}<p class="klein">Eigene Partei; Punkte markieren Bundestagswahlen, die gestrichelte Linie die 5-%-Hürde.</p>`, { titel: spieler.name }),
    wahl: () => karte(zustand.wahlergebnis ? wahlergebnisHtml(zustand, zustand.sitze) : leer('Noch keine Wahl in dieser Partie.'), { titel: 'Letzte Bundestagswahl' }),
    protokoll: () => karte(`${neueste.length ? `<ol class="liste" start="${s * JE_SEITE + 1}">${neueste.slice(s * JE_SEITE, (s + 1) * JE_SEITE).map((t) => `<li>${t}</li>`).join('')}</ol>` : leer('Noch nichts passiert.')}
      ${seiten > 1 ? `<div class="knoepfe"><button data-seite="${s - 1}" ${s === 0 ? 'disabled' : ''}>← Neuere</button><span class="klein">Seite ${s + 1} von ${seiten}</span><button data-seite="${s + 1}" ${s === seiten - 1 ? 'disabled' : ''}>Ältere →</button></div>` : ''}`,
    { titel: 'Protokoll (neueste zuerst)' }),
  }[tab];
  el.innerHTML = `<div class="ansicht">
    ${onZurueck ? '<button id="zurueck">← Zurück zum Spiel</button>' : ''}
    <h1>Chronik</h1>${tabs(TABS, tab, 'Chronik')}${inhalt()}</div>`;
  el.querySelectorAll('[data-tab]').forEach((t) => t.addEventListener('click', () => onTab(t.dataset.tab)));
  el.querySelectorAll('[data-seite]').forEach((b) => b.addEventListener('click', () => onSeite(Number(b.dataset.seite))));
  el.querySelector('#zurueck')?.addEventListener('click', onZurueck);
}
