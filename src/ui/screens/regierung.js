import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { koalitionsParteien } from '../../engine/kabinett.js';
import { protokollHtml } from '../components/protokoll.js';
import { verlaufSvg } from '../components/verlauf.js';

const partei = (id) => parteien.find((p) => p.id === id);
const prozent = (a) => a.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

// Regierungsquartal (F12): Übersicht, weiter zum nächsten Quartal. Im letzten Quartal zeigt app.js den Haushalt.
export function regierungScreen(el, zustand, protokoll, { onWeiter }) {
  const spieler = partei(zustand.spielerParteiId);
  const regierung = koalitionsParteien(zustand).map((id) => partei(id).name).join(', ');
  el.innerHTML = `
    <h1>Regierung</h1>
    ${hinweisHtml('quartal')}
    <p><strong>Haushaltsjahr ${zustand.haushalt.jahr} von ${config.legislaturJahre}, Quartal ${zustand.quartal} von ${config.regierung.quartaleJeJahr}</strong></p>
    <div class="bilanz">
      <span>Regierung</span><span>${regierung}${zustand.koalition.minderheit ? ' (Minderheit)' : ''}</span>
      <span>Umfrage ${spieler.name}</span><span>${prozent(zustand.anteile[spieler.id])}</span>
      <span>Jahre als Kanzler</span><span>${zustand.statistik.jahreKanzler} von ${config.spielende.siegJahreKanzler}</span>
    </div>
    <h2>Umfrageverlauf</h2>
    ${verlaufSvg(zustand.verlauf, spieler)}
    <div class="knoepfe"><button id="weiter">${zustand.quartal + 1 === config.regierung.quartaleJeJahr ? 'Weiter zum Haushalt' : 'Nächstes Quartal'}</button></div>
    ${protokollHtml(protokoll)}`;
  el.querySelector('#weiter').addEventListener('click', () => onWeiter());
}
