import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { probleme, reformen } from '../../data/probleme.js';
import { ministerien } from '../../data/ministerien.js';
import { reformVorschau, sperrgrund } from '../../engine/reformen.js';
import { haushaltsQuartal } from '../../engine/regierung.js';
import { abstimmung } from '../../engine/bundestag.js';
import { mrd } from '../../engine/haushalt.js';
import { abstimmungHtml } from '../components/abstimmung.js';
import { karte, badge, balken, zahl, plusMinus } from '../components/basis.js';

const rf = config.reformen;
const partei = (id) => parteien.find((p) => p.id === id);
const druckFarbe = (d) => (d >= rf.druckSchwelle ? 'var(--gefahr)' : 'var(--akzent)');

// Warum gerade gar keine Reform möglich ist (gilt für alle), oder null
function allgemeinGesperrt(zustand) {
  if (zustand.offenesEreignis) return 'Erst auf das Ereignis in der Lage reagieren.';
  if (haushaltsQuartal(zustand)) return 'Im Haushaltsquartal gibt es keine Reformen.';
  if (zustand.reformImQuartal) return 'In diesem Quartal wurde schon eine Reform eingebracht.';
  return null;
}

function problemKarte(zustand, p, mitKnopf = true) {
  const druck = zustand.probleme[p.id];
  const stufen = reformen.filter((r) => r.problem === p.id);
  const fertig = stufen.filter((r) => zustand.reformen.includes(r.id)).length;
  return karte(`
    <div class="problem-kopf"><h3>${p.name}</h3><span class="zahl ${druck >= rf.druckSchwelle ? 'rot' : ''}">${druck >= rf.druckSchwelle ? '⚠ ' : ''}Druck ${druck}</span></div>
    ${balken(druck, druckFarbe(druck), { marke: rf.druckSchwelle, label: `Druck ${druck} von 100` })}
    <p class="klein">${ministerien.find((m) => m.id === p.ministerium).kurz}: ${partei(zustand.kabinett.verteilung[p.ministerium]).name} · ${fertig} von ${stufen.length} Reformen beschlossen</p>
    ${mitKnopf ? `<button data-problem="${p.id}">Reformen ansehen</button>` : ''}`, { klasse: 'problem' });
}

function reformDetail(zustand, p, gesperrt) {
  const stufen = reformen.filter((r) => r.problem === p.id);
  const liste = stufen.map((r) => {
    const grund = sperrgrund(zustand, r.id);
    if (grund === 'beschlossen') return `<div class="reform"><h3>${r.name} ${badge('beschlossen', 'ok')}</h3><p class="klein">kostet ${zahl(mrd(r.kosten), 1)} Mrd. je Jahr</p></div>`;
    const v = reformVorschau(zustand, r.id);
    const kannNicht = gesperrt ?? grund;
    return `<div class="reform">
      <h3>${r.name} ${kannNicht ? badge(kannNicht) : ''}</h3>
      <table><tbody>
        <tr><th scope="row">Druck</th><td>${v.druckVorher} → ${v.druckNachher}</td></tr>
        <tr><th scope="row">Kosten</th><td>${zahl(mrd(r.kosten), 1)} Mrd. je Jahr, dauerhaft</td></tr>
        <tr><th scope="row">Umfrage ${partei(v.partei).name}</th><td>${plusMinus(v.gewinn)} Punkte</td></tr>
      </tbody></table>
      ${kannNicht ? '' : `<div class="knoepfe"><button class="primaer" data-reform="${r.id}">${v.abstimmung.angenommen ? 'Einbringen' : 'Trotzdem einbringen'}</button></div>`}
    </div>`;
  }).join('');
  return `<button id="zurueck">← Alle Probleme</button>
    ${problemKarte(zustand, p, false)}
    ${karte(`${abstimmungHtml(abstimmung(zustand, 'reform'), 'Bundestag (gilt für jede Reform)', false)}${liste}`, { titel: 'Reformen' })}`;
}

// Reformen (F13): Problemliste, Klick öffnet die Stufen mit Kosten, Wirkung und Abstimmung.
export function reformenScreen(el, zustand, { problem, onProblem, onReform }) {
  const gesperrt = allgemeinGesperrt(zustand);
  const p = probleme.find((x) => x.id === problem);
  el.innerHTML = `<div class="ansicht">
    <h1>Reformen</h1>
    ${gesperrt ? `<div class="meldung">${gesperrt}</div>` : ''}
    <p class="klein">Je Quartal eine Reform. Ab Druck ${rf.druckSchwelle} kostet jedes Problem ${partei(zustand.kanzlerParteiId).name} ${zahl(rf.verlustJeQuartal, 1)} Punkte je Quartal. Reformkosten müssen im Haushalt ausgeglichen werden.</p>
    ${p ? reformDetail(zustand, p, gesperrt) : probleme.map((x) => problemKarte(zustand, x)).join('')}
  </div>`;
  el.querySelectorAll('[data-problem]').forEach((b) => b.addEventListener('click', () => onProblem(b.dataset.problem)));
  el.querySelector('#zurueck')?.addEventListener('click', () => onProblem(null));
  el.querySelectorAll('[data-reform]').forEach((b) => b.addEventListener('click', () => onReform({ reformId: b.dataset.reform })));
}
