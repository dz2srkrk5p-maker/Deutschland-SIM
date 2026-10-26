// Reiter „Euer Land“ (Epochen-Etappe 2): laufende und vergangene Epochen mit Streitfrage und ihren Problemen.
import { hinweisHtml } from '../components/hinweis.js';
import { karte, badge } from '../components/basis.js';
import { epoche, epochenLauf } from '../../engine/epochen.js';
import { problemListe } from '../../engine/probleme.js';
import { config } from '../../data/config.js';
import { datumText, titelseiteHtml, dauerText } from '../components/epochen.js';
import { wegeHtml } from '../components/wege.js';
import { wegDaten } from '../../engine/weichen.js';
import { status } from '../components/basis.js';


function epocheHtml(zustand, a) {
  const e = epoche(a.id);
  const lauf = epochenLauf(zustand, a);
  const liste = problemListe(zustand);
  const probleme = e.probleme.map((p) => {
    const eintrag = liste.find((x) => x.problem.id === p.id);
    if (!eintrag) return `<li>${p.name} <small>(kommt ab ${datumText(a.start + p.monat)})</small></li>`;
    return `<li><button data-problem="${p.id}" class="link">${p.name}</button> <span class="zahl">${Math.round(eintrag.wert)}</span> ${eintrag.wert >= config.probleme.stufen[2].ab ? badge(eintrag.stufe.name, 'rot') : `<small>${eintrag.stufe.name}</small>`}</li>`;
  });
  return karte(`<p>${e.text}</p>
    <p><strong>Streitfrage:</strong> ${e.streitfrage.text}</p>
    <p class="klein">Seit ${datumText(a.start)} · endet ${datumText(a.ende)} (noch ${dauerText(lauf.bis)})</p>
    ${a.startFaktor && a.startFaktor !== 1 ? `<p>${a.startFaktor < 1 ? status('ok', 'Rückenwind: Ihre Probleme starten leichter.') : status('rot', 'Hypothek: Ihre Probleme starten schwerer.')}</p>` : ''}
    ${wegeHtml(zustand, a)}
    <h3>Probleme der Epoche</h3><ul class="liste">${probleme.join('')}</ul>`, { titel: e.name });
}

export function landScreen(el, zustand, { onProblem, onTitelseite, onBereich, onWeg, onKurswechsel, onZweiterWeg }) {
  const { aktiv, vorbei } = zustand.epochen;
  el.innerHTML = `<div class="ansicht">
    <h1>Euer Land</h1>
    ${hinweisHtml('land')}
    ${titelseiteHtml(zustand, { mitLink: false })}
    ${aktiv.length ? aktiv.map((a) => epocheHtml(zustand, a)).join('') : karte('<p>Noch hat keine neue Zeit begonnen.</p>', { titel: 'Epochen' })}
    ${vorbei.length ? karte(`<ul class="liste">${vorbei.map((v) => `<li>${epoche(v.id).name} <small>(${datumText(v.start)} bis ${datumText(v.ende)})</small> – ${v.gelungen ? status('ok', 'Aufgabe gelungen') : status('rot', 'Aufgabe verfehlt')}${(v.wege ?? []).length ? ` <small>(${v.wege.map((id) => `${wegDaten(id).name}: ${Math.round((v.fortschritt?.[id] ?? 0) * 100)} %`).join(', ')})</small>` : ''}</li>`).join('')}</ul>`, { titel: 'Vergangene Epochen' }) : ''}
  </div>`;
  el.querySelectorAll('[data-problem]').forEach((k) => k.addEventListener('click', () => onProblem(k.dataset.problem)));
  el.querySelector('#titelseite-gelesen')?.addEventListener('click', () => onTitelseite());
  el.querySelectorAll('[data-weg]').forEach((k) => k.addEventListener('click', () => onWeg({ epocheId: k.dataset.epoche, wegId: k.dataset.weg })));
  el.querySelectorAll('[data-kurswechsel]').forEach((k) => k.addEventListener('click', () => onKurswechsel({ epocheId: k.dataset.epoche, wegId: k.dataset.kurswechsel })));
  el.querySelectorAll('[data-zweiterweg]').forEach((k) => k.addEventListener('click', () => onZweiterWeg({ epocheId: k.dataset.epoche, wegId: k.dataset.zweiterweg })));
  el.querySelectorAll('[data-gehe]').forEach((k) => k.addEventListener('click', () => onBereich(k.dataset.gehe)));
}
