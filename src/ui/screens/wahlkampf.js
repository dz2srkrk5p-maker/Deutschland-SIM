import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { ueberHuerde } from '../../engine/wahl.js';
import { ertragFaktor } from '../../engine/wahlkampf.js';
import { verlaufSvg } from '../components/verlauf.js';
import { tickerHtml } from '../components/ticker.js';
import { karte, aufklapp, balken, prozent, plusMinus } from '../components/basis.js';
import { schritteHtml } from '../shell.js';

const SKALA = 40; // Prozent, die einer vollen Balkenbreite entsprechen
// Hinweis auf abnehmenden Ertrag (F08), wenn die Aktion zuletzt schon gewählt wurde
const abnahme = (faktor) => (faktor < 1 ? `<small class="gelb">⚠ ${Math.round(faktor * 100)} % Wirkung (zuletzt schon gewählt)</small>` : '');

// Wahlkampf: Aktion der Woche zuerst, darunter die Umfrage; Verlauf aufklappbar.
export function wahlkampfScreen(el, zustand, { onAktion }) {
  const spieler = parteien.find((p) => p.id === zustand.spielerParteiId);
  const ziele = parteien.filter((p) => !p.sonstige && p.id !== spieler.id);
  const sortiert = [...parteien].sort((a, b) => zustand.anteile[b.id] - zustand.anteile[a.id]);
  const wk = config.wahlkampf;
  const f = Object.fromEntries(['plakate', 'kundgebung', 'angriff'].map((a) => [a, ertragFaktor(zustand, a)]));

  el.innerHTML = `<div class="ansicht">
    ${schritteHtml('wahlkampf')}
    <h1>Wahlkampf</h1>
    ${hinweisHtml('wahlkampf')}
    ${tickerHtml(zustand)}
    <h2>Aktion in Woche ${zustand.wahlkampfWoche} von ${wk.wochen}</h2>
    <div class="aktionen">
      ${karte(`<h3>Plakate und Werbung</h3><span>Umfrage <strong>sicher ${plusMinus(wk.plakateGewinn * f.plakate)}</strong> Punkte</span>${abnahme(f.plakate)}
        <button class="primaer" data-aktion="plakate">Plakatieren</button>`)}
      ${karte(`<h3>Großkundgebung</h3><span>Umfrage <strong>${plusMinus(wk.kundgebungMin * f.kundgebung)} bis ${plusMinus(wk.kundgebungMax * f.kundgebung)}</strong> Punkte (Zufall)</span>${abnahme(f.kundgebung)}
        <button class="primaer" data-aktion="kundgebung">Kundgebung abhalten</button>`)}
      ${karte(`<h3>Angriff</h3><span>Ziel <strong>${plusMinus(-wk.angriffZielVerlust * f.angriff)}</strong>, du <strong>${plusMinus(wk.angriffEigenGewinn * f.angriff)}</strong> Punkte</span>${abnahme(f.angriff)}
        <label>Ziel <select id="ziel">${ziele.map((p) => `<option value="${p.id}">${p.name}</option>`).join('')}</select></label>
        <button class="primaer" data-aktion="angriff">Angreifen</button>`)}
    </div>
    ${karte(`
      <div class="umfrage">
        ${sortiert.map((p) => `
          <div class="zeile${p.id === spieler.id ? ' eigene' : ''}">
            <span>${p.name}</span>
            ${balken((zustand.anteile[p.id] / SKALA) * 100, p.farbe, { marke: (config.sperrklauselProzent / SKALA) * 100, label: `${p.name} ${prozent(zustand.anteile[p.id])}` })}
            <span class="wert">${prozent(zustand.anteile[p.id])}${p.sonstige || ueberHuerde(p, zustand.anteile[p.id]) ? '' : ' <small class="rot">✗ Hürde</small>'}</span>
          </div>`).join('')}
      </div>
      <p><small>Gestrichelte Linie: ${config.sperrklauselProzent}-%-Hürde.</small></p>
      ${aufklapp('Umfrageverlauf', verlaufSvg(zustand.verlauf, spieler))}`, { titel: 'Umfrage' })}
  </div>`;

  el.querySelectorAll('[data-aktion]').forEach((b) =>
    b.addEventListener('click', () => onAktion({ aktion: b.dataset.aktion, ziel: el.querySelector('#ziel').value })),
  );
}
