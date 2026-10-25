import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { bundestagSvg } from '../components/bundestag.js';
import { wahlergebnisHtml } from '../components/wahlergebnis.js';
import { karte, plusMinus } from '../components/basis.js';
import { schritteHtml } from '../shell.js';

// Wahlabend (UI-Umbau): Ergebnis und Sitze, bevor es an die Regierungsbildung geht. Nur Anzeige.
export function wahlabendScreen(el, zustand, { onWeiter }) {
  const w = zustand.wahlergebnis;
  el.innerHTML = `<div class="ansicht">
    ${schritteHtml('wahlabend')}
    <h1>Wahlabend</h1>
    ${karte(`<p>Euer Wahlkampf: <strong>${plusMinus(w.wahlkampf)} Punkte</strong> <small>(Umfrage nach Woche ${config.wahlkampf.wochen} minus vor Woche 1, mit Schwankung)</small></p>
      ${wahlergebnisHtml(zustand, zustand.sitze)}`, { titel: 'Ergebnis' })}
    ${karte(bundestagSvg(zustand.sitze, parteien), { titel: 'Sitze im Bundestag' })}
    <div class="knoepfe"><button id="weiter" class="primaer">${zustand.phase === 'opposition' ? 'Weiter in die Opposition' : 'Weiter zur Regierungsbildung'}</button></div>
  </div>`;
  el.querySelector('#weiter').addEventListener('click', onWeiter);
}
