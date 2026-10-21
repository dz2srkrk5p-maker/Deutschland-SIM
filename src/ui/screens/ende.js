import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { bundestagSvg } from '../components/bundestag.js';
import { protokollHtml } from '../components/protokoll.js';
import { mrd } from '../../engine/haushalt.js';

// Spielende: Sieg oder Opposition, mit Statistik.
export function endeScreen(el, zustand, protokoll, { onNeu }) {
  const spieler = parteien.find((p) => p.id === zustand.spielerParteiId);
  const s = zustand.statistik;
  const sieg = zustand.phase === 'sieg';
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
    ${zustand.sitze ? `<h2>Letzter Bundestag</h2>${bundestagSvg(zustand.sitze, parteien)}` : ''}
    <div class="knoepfe"><button id="neu">Neues Spiel</button></div>
    ${protokollHtml(protokoll)}`;
  el.querySelector('#neu').addEventListener('click', onNeu);
}
