import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { ueberHuerde } from '../../engine/wahl.js';
import { ertragFaktor } from '../../engine/wahlkampf.js';
import { protokollHtml } from '../components/protokoll.js';

const SKALA = 40; // Prozent, die einer vollen Balkenbreite entsprechen
const prozent = (a) => a.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
const pp = (wert) => (wert > 0 ? '+' : wert < 0 ? '−' : '') + Math.abs(wert).toLocaleString('de-DE', { maximumFractionDigits: 2 });
// Hinweis auf abnehmenden Ertrag (F08), wenn die Aktion zuletzt schon gewählt wurde
const abnahme = (faktor) => (faktor < 1 ? `<br><small class="gelb">${Math.round(faktor * 100)} % Wirkung (zuletzt schon gewählt)</small>` : '');

// Wahlkampf: Umfrage, Aktionen, Protokoll.
export function wahlkampfScreen(el, zustand, protokoll, { onAktion }) {
  const spieler = parteien.find((p) => p.id === zustand.spielerParteiId);
  const ziele = parteien.filter((p) => !p.sonstige && p.id !== spieler.id);
  const sortiert = [...parteien].sort((a, b) => zustand.anteile[b.id] - zustand.anteile[a.id]);
  const wk = config.wahlkampf;
  const f = Object.fromEntries(['plakate', 'kundgebung', 'angriff'].map((a) => [a, ertragFaktor(zustand, a)]));

  el.innerHTML = `
    <h1>Wahlkampf: ${spieler.name}</h1>
    ${hinweisHtml('wahlkampf')}
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
      <button data-aktion="plakate">Plakate und Werbung<br><small>sicher ${pp(wk.plakateGewinn * f.plakate)}</small>${abnahme(f.plakate)}</button>
      <button data-aktion="kundgebung">Großkundgebung<br><small>${pp(wk.kundgebungMin * f.kundgebung)} bis ${pp(wk.kundgebungMax * f.kundgebung)}</small>${abnahme(f.kundgebung)}</button>
    </div>
    <div class="knoepfe">
      <label>Angriff auf
        <select id="ziel">${ziele.map((p) => `<option value="${p.id}">${p.name}</option>`).join('')}</select>
      </label>
      <button data-aktion="angriff">Angreifen<br><small>Ziel ${pp(-wk.angriffZielVerlust * f.angriff)}, du ${pp(wk.angriffEigenGewinn * f.angriff)}</small>${abnahme(f.angriff)}</button>
    </div>

    ${protokollHtml(protokoll)}`;

  el.querySelectorAll('[data-aktion]').forEach((b) =>
    b.addEventListener('click', () => onAktion({ aktion: b.dataset.aktion, ziel: el.querySelector('#ziel').value })),
  );
}
