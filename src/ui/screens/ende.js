import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { bundestagSvg } from '../components/bundestag.js';
import { protokollHtml } from '../components/protokoll.js';
import { verlaufSvg } from '../components/verlauf.js';
import { mrd } from '../../engine/haushalt.js';

// Spielende: Sieg oder Opposition, mit Statistik.
export function endeScreen(el, zustand, protokoll, { onNeu }) {
  const spieler = parteien.find((p) => p.id === zustand.spielerParteiId);
  const s = zustand.statistik;
  const sieg = zustand.phase === 'sieg';
  const link = `${location.origin}${location.pathname}?seed=${zustand.seed}`;
  const zahl = (x, stellen = 0) => x.toLocaleString('de-DE', { minimumFractionDigits: stellen, maximumFractionDigits: stellen });

  el.innerHTML = `
    <h1>${sieg ? 'Sieg!' : 'Opposition'}</h1>
    ${hinweisHtml('ende')}
    <p>${sieg
      ? `${spieler.name} hat ${s.jahreKanzler} Jahre lang den Kanzler gestellt. Ziel erreicht.`
      : `${spieler.name} hat keine Mehrheit für eine Regierung. Das Spiel ist vorbei.`}</p>
    <h2>Statistik</h2>
    <div class="bilanz">
      <span>Jahre als Kanzler</span><span>${s.jahreKanzler} von ${config.spielende.siegJahreKanzler}</span>
      <span>Gebildete Regierungen</span><span>${s.regierungenGebildet}</span>
      <span>Bestes Wahlergebnis</span><span>${s.besteWahl === null ? '–' : `${zahl(s.besteWahl, 2)} %`}</span>
      <span>Neue Schulden insgesamt</span><span>${zahl(mrd(zustand.haushalt.neueSchuldenSeitStart), 2)} Mrd.</span>
    </div>
    <h2>Umfrageverlauf</h2>
    ${verlaufSvg(zustand.verlauf, spieler)}
    ${zustand.sitze ? `<h2>Letzter Bundestag</h2>${bundestagSvg(zustand.sitze, parteien)}` : ''}
    <h2>Partie teilen</h2>
    <p>Gleicher Start, gleicher Zufall: Bei gleichen Entscheidungen verläuft die Partie genau gleich.</p>
    <p><label for="teilen-link">Link zu dieser Partie (Seed ${zustand.seed})</label></p>
    <div class="teilen"><input id="teilen-link" readonly value="${link}"><button id="kopieren">Link kopieren</button></div>
    <p id="kopiert" role="status"></p>
    <div class="knoepfe"><button id="neu">Neues Spiel</button></div>
    ${protokollHtml(protokoll)}`;
  el.querySelector('#neu').addEventListener('click', onNeu);
  const feld = el.querySelector('#teilen-link');
  feld.addEventListener('focus', () => feld.select());
  // Rückfall ohne Zwischenablage (z. B. ohne HTTPS): Link markieren, damit man ihn selbst kopieren kann
  el.querySelector('#kopieren').addEventListener('click', () =>
    (navigator.clipboard?.writeText(link) ?? Promise.reject(new Error('keine Zwischenablage')))
      .then(() => (el.querySelector('#kopiert').textContent = 'Link kopiert.'))
      .catch(() => {
        feld.focus();
        feld.select(); // focus allein markiert nicht, wenn das Feld schon fokussiert war
        el.querySelector('#kopiert').textContent = 'Kopieren nicht möglich. Der Link ist markiert, bitte selbst kopieren (Strg+C).';
      }),
  );
}
