import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { ueberHuerde } from '../../engine/wahl.js';
import { protokollHtml } from '../components/protokoll.js';

const SKALA = 40; // Prozent, die einer vollen Balkenbreite entsprechen
const prozent = (a) => a.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
const pp = (wert) => (wert > 0 ? '+' : wert < 0 ? '−' : '') + Math.abs(wert).toLocaleString('de-DE');

// Wahlkampf: Umfrage, Aktionen, Protokoll.
export function wahlkampfScreen(el, zustand, protokoll, { onAktion }) {
  const spieler = parteien.find((p) => p.id === zustand.spielerParteiId);
  const ziele = parteien.filter((p) => !p.sonstige && p.id !== spieler.id);
  const sortiert = [...parteien].sort((a, b) => zustand.anteile[b.id] - zustand.anteile[a.id]);

  el.innerHTML = `
    <h1>Wahlkampf: ${spieler.name}</h1>
    <p><strong>Woche ${zustand.wahlkampfWoche} von ${config.wahlkampf.wochen}</strong></p>

    <h2>Umfrage</h2>
    <div class="umfrage">
      ${sortiert.map((p) => `
        <div class="zeile${p.id === spieler.id ? ' eigene' : ''}">
          <span class="name">${p.name}</span>
          <span class="balken"><span style="width:${(zustand.anteile[p.id] / SKALA) * 100}%;background:${p.farbe}"></span>
            <i class="huerde" style="left:${(config.sperrklauselProzent / SKALA) * 100}%"></i></span>
          <span class="wert">${prozent(zustand.anteile[p.id])}${p.sonstige ? '' : ueberHuerde(p, zustand.anteile[p.id]) ? '' : ' <small>unter Hürde</small>'}</span>
        </div>`).join('')}
    </div>

    <h2>Deine Aktion diese Woche</h2>
    <div class="knoepfe">
      <button data-aktion="plakate">Plakate und Werbung<br><small>sicher ${pp(config.wahlkampf.plakateGewinn)}</small></button>
      <button data-aktion="kundgebung">Großkundgebung<br><small>${pp(config.wahlkampf.kundgebungMin)} bis ${pp(config.wahlkampf.kundgebungMax)}</small></button>
    </div>
    <div class="knoepfe">
      <label>Angriff auf
        <select id="ziel">${ziele.map((p) => `<option value="${p.id}">${p.name}</option>`).join('')}</select>
      </label>
      <button data-aktion="angriff">Angreifen<br><small>Ziel ${pp(-config.wahlkampf.angriffZielVerlust)}, du ${pp(config.wahlkampf.angriffEigenGewinn)}</small></button>
    </div>

    ${protokollHtml(protokoll)}`;

  el.querySelectorAll('[data-aktion]').forEach((b) =>
    b.addEventListener('click', () => onAktion({ aktion: b.dataset.aktion, ziel: el.querySelector('#ziel').value })),
  );
}
