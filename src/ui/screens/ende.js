import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { bundestagSvg } from '../components/bundestag.js';
import { verlaufSvg } from '../components/verlauf.js';
import { teilenHtml, teilenBinden } from '../components/teilen.js';
import { mrd } from '../../engine/haushalt.js';
import { karte, kennzahl, zahl, aufklapp } from '../components/basis.js';

// Spielende: Sieg oder Opposition, mit Statistik.
export function endeScreen(el, zustand, { onNeu, onChronik }) {
  const spieler = parteien.find((p) => p.id === zustand.spielerParteiId);
  const s = zustand.statistik;
  const sieg = zustand.phase === 'sieg';
  const grund = sieg
    ? `${spieler.name} hat ${s.jahreKanzler} Jahre lang den Kanzler gestellt. Ziel erreicht.`
    : zustand.koalition?.minderheit && zustand.koalition.fehlschlaege >= config.minderheit.fehlschlaegeBisSpielende
      ? `Die Minderheitsregierung von ${spieler.name} ist an ${zustand.koalition.fehlschlaege} Haushalten gescheitert. Das Spiel ist vorbei.`
      : `${spieler.name} hat keine Mehrheit für eine Regierung. Das Spiel ist vorbei.`;

  el.innerHTML = `<div class="ansicht">
    <h1>${sieg ? '✓ Sieg!' : 'Opposition'}</h1>
    ${hinweisHtml('ende')}
    <div class="meldung ${sieg ? '' : 'rot'}">${grund}</div>
    <div class="kennzahlen">
      ${kennzahl('Jahre als Kanzler', `${s.jahreKanzler} <small>von ${config.spielende.siegJahreKanzler}</small>`)}
      ${kennzahl('Gebildete Regierungen', zahl(s.regierungenGebildet))}
      ${kennzahl('Bestes Wahlergebnis', s.besteWahl === null ? '–' : `${zahl(s.besteWahl, 2)} %`)}
      ${kennzahl('Neue Schulden insgesamt', `${zahl(mrd(zustand.haushalt.neueSchuldenSeitStart), 2)} Mrd.`)}
    </div>
    ${karte(`${verlaufSvg(zustand.verlauf, spieler)}${zustand.sitze ? aufklapp('Letzter Bundestag', bundestagSvg(zustand.sitze, parteien)) : ''}`, { titel: 'Verlauf' })}
    ${karte(teilenHtml(zustand), { titel: 'Partie teilen' })}
    <div class="knoepfe"><button id="neu" class="primaer">Neues Spiel</button><button id="chronik">Chronik ansehen</button></div>
  </div>`;
  el.querySelector('#neu').addEventListener('click', onNeu);
  el.querySelector('#chronik').addEventListener('click', onChronik);
  teilenBinden(el, zustand);
}
