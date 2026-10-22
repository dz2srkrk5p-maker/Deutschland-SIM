import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { koalitionsParteien } from '../../engine/kabinett.js';
import { protokollHtml } from '../components/protokoll.js';
import { verlaufSvg } from '../components/verlauf.js';
import { abstimmungHtml } from '../components/abstimmung.js';
import { probleme, reformen } from '../../data/probleme.js';
import { ministerien } from '../../data/ministerien.js';
import { reformVorschau, sperrgrund } from '../../engine/reformen.js';
import { mrd } from '../../engine/haushalt.js';
import { offenesEreignis, folgen } from '../../engine/ereignisse.js';

const partei = (id) => parteien.find((p) => p.id === id);
const prozent = (a) => a.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';

const rf = config.reformen;
const euro = (t) => mrd(t).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' Mrd.';

// Probleme mit Druck und ihre Reformen (F13): Vorschau vor dem Klick, gesperrte mit Grund
function problemeHtml(zustand) {
  return probleme.map((p) => {
    const druck = zustand.probleme[p.id];
    const ministerium = ministerien.find((m) => m.id === p.ministerium);
    const liste = reformen.filter((r) => r.problem === p.id).map((r) => {
      const grund = sperrgrund(zustand, r.id);
      if (grund) return `<div class="reform gesperrt"><span>${r.name}</span><small>${grund}</small></div>`;
      const v = reformVorschau(zustand, r.id);
      return `<div class="reform">
        <span><strong>${r.name}</strong><br><small>Druck ${v.druckVorher} → ${v.druckNachher} · kostet ${euro(r.kosten)} je Jahr · ${partei(v.partei).name} +${v.gewinn.toLocaleString('de-DE', { maximumFractionDigits: 2 })}</small></span>
        ${abstimmungHtml(v.abstimmung, 'Bundestag', false)}
        <button data-reform="${r.id}">${v.abstimmung.angenommen ? 'Einbringen' : 'Trotzdem einbringen'}</button>
      </div>`;
    }).join('');
    return `<div class="problem">
      <div class="problemkopf"><span>${p.name} <small>(${ministerium.kurz}: ${partei(zustand.kabinett.verteilung[p.ministerium]).name})</small></span>
        <span class="${druck >= rf.druckSchwelle ? 'rot' : ''}">Druck ${druck}</span></div>
      <span class="balken"><span style="width:${druck}%;background:${druck >= rf.druckSchwelle ? '#b00' : '#5577aa'}"></span><i class="huerde" style="left:${rf.druckSchwelle}%"></i></span>
      ${liste}
    </div>`;
  }).join('');
}

// Offenes Ereignis (F14): jede Möglichkeit mit ihren Folgen vor dem Klick
function ereignisHtml(zustand, e) {
  const zahl = (x) => (x > 0 ? '+' : '−') + Math.abs(x).toLocaleString('de-DE', { maximumFractionDigits: 2 });
  const knoepfe = e.moeglichkeiten.map((m, i) => {
    const f = folgen(zustand, e.id, i);
    const teile = [
      ...Object.entries(f.parteien).map(([id, w]) => `${partei(id).name} ${zahl(w)}`),
      ...Object.entries(f.druck).map(([id, d]) => `Druck ${probleme.find((p) => p.id === id).name} ${zahl(d)}`),
    ];
    return `<button data-wahl="${i}">${m.text}<br><small>${teile.join(' · ') || 'keine Folgen'}</small></button>`;
  }).join('');
  return `<div class="ereignis"><h2>${e.titel}</h2><p>${e.text}</p><div class="knoepfe">${knoepfe}</div></div>`;
}

// Regierungsquartal (F12): Übersicht, Probleme und Reformen (F13), weiter zum nächsten Quartal. Im letzten Quartal zeigt app.js den Haushalt.
export function regierungScreen(el, zustand, protokoll, { onWeiter, onReform, onEreignis }) {
  const e = offenesEreignis(zustand);
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
    ${e ? ereignisHtml(zustand, e) : `
    <h2>Probleme und Reformen</h2>
    <p><small>Je Quartal eine Reform. Ab Druck ${rf.druckSchwelle} kostet jedes Problem ${partei(zustand.kanzlerParteiId).name} je Quartal ${rf.verlustJeQuartal.toLocaleString('de-DE')} Punkte. Reformkosten müssen im Haushalt ausgeglichen werden (Schuldenbremse).</small></p>
    ${problemeHtml(zustand)}
    <h2>Umfrageverlauf</h2>
    ${verlaufSvg(zustand.verlauf, spieler)}
    <div class="knoepfe"><button id="weiter">${zustand.quartal + 1 === config.regierung.quartaleJeJahr ? 'Weiter zum Haushalt' : 'Nächstes Quartal'}</button></div>`}
    ${protokollHtml(protokoll)}`;
  el.querySelector('#weiter')?.addEventListener('click', () => onWeiter());
  el.querySelectorAll('[data-wahl]').forEach((b) => b.addEventListener('click', () => onEreignis({ wahl: Number(b.dataset.wahl) })));
  el.querySelectorAll('[data-reform]').forEach((b) => b.addEventListener('click', () => onReform({ reformId: b.dataset.reform })));
}
