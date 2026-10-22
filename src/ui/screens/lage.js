import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { probleme } from '../../data/probleme.js';
import { koalitionsParteien } from '../../engine/kabinett.js';
import { mehrheit } from '../../engine/koalition.js';
import { vorschau, mrd, bruchAbstand } from '../../engine/haushalt.js';
import { haushaltsQuartal } from '../../engine/regierung.js';
import { offenesEreignis, folgen } from '../../engine/ereignisse.js';
import { tickerHtml } from '../components/ticker.js';
import { bruchStufe } from '../components/koalitionslage.js';
import { karte, kennzahl, status, zahl, plusMinus } from '../components/basis.js';

const partei = (id) => parteien.find((p) => p.id === id);
const STUFE_TEXT = { ok: 'stabil', gelb: 'angespannt', rot: 'vor dem Bruch' };

// Offenes Ereignis (F14): Kontext, Möglichkeiten und ihre Folgen vor dem Klick
function ereignisHtml(zustand, e) {
  const optionen = e.moeglichkeiten.map((m, i) => {
    const f = folgen(zustand, e.id, i);
    const teile = [
      ...Object.entries(f.parteien).map(([id, w]) => `${partei(id).name} ${plusMinus(w)}`),
      ...Object.entries(f.druck).map(([id, d]) => `Druck ${probleme.find((p) => p.id === id).name} ${plusMinus(d, 0)}`),
    ];
    return `<button data-wahl="${i}"><strong>${m.text}</strong><small>${teile.join(' · ') || 'keine Folgen'}</small></button>`;
  }).join('');
  return karte(`<span class="badge gelb">⚠ Entscheidung nötig</span><h2>${e.titel}</h2><p>${e.text}</p><div class="optionen">${optionen}</div>`, { klasse: 'ereignis' });
}

// Lage: Startseite jedes Quartals. Offenes Ereignis zuerst, dann Kennzahlen, Ticker und die Hauptaktion.
export function lageScreen(el, zustand, { onWeiter, onEreignis, onBereich }) {
  const e = offenesEreignis(zustand);
  const regierung = koalitionsParteien(zustand);
  const sitze = regierung.reduce((s, id) => s + zustand.sitze[id], 0);
  const noetig = mehrheit(zustand.sitze);
  const b = vorschau(zustand, {}).bilanz;
  const spielraum = config.haushalt.schuldenbremseGrenze - b.schuldenbremse;
  const abstaende = bruchAbstand(zustand);
  const koalitionStufe = abstaende.map(bruchStufe).sort((x, y) => ['ok', 'gelb', 'rot'].indexOf(y) - ['ok', 'gelb', 'rot'].indexOf(x))[0];
  const groesstes = [...probleme].sort((a, c) => zustand.probleme[c.id] - zustand.probleme[a.id])[0];
  const druck = zustand.probleme[groesstes.id];
  const druckStufe = druck >= config.reformen.druckSchwelle ? 'rot' : druck >= config.reformen.druckSchwelle - 10 ? 'gelb' : 'ok';

  const hauptaktion = haushaltsQuartal(zustand)
    ? `<p>Im ${zustand.quartal}. Quartal wird der Haushalt für Jahr ${zustand.haushalt.jahr} eingebracht.</p>
       <div class="knoepfe"><button class="primaer" data-gehe="haushalt">Zum Haushalt</button></div>`
    : `<p>${zustand.reformImQuartal ? status('ok', 'Reform dieses Quartals eingebracht.') : 'In diesem Quartal ist noch eine Reform möglich.'}
         ${zustand.reformImQuartal ? '' : '<button data-gehe="reformen">Zu den Reformen</button>'}</p>
       <div class="knoepfe"><button class="primaer" id="weiter">${zustand.quartal + 1 === config.regierung.quartaleJeJahr ? 'Weiter ins Haushaltsquartal' : 'Nächstes Quartal'}</button></div>`;

  el.innerHTML = `<div class="ansicht">
    <h1>Lage</h1>
    ${hinweisHtml('quartal')}
    ${e ? ereignisHtml(zustand, e) : ''}
    <div class="kennzahlen">
      ${kennzahl('Regierung', abstaende.length ? status(koalitionStufe, STUFE_TEXT[koalitionStufe]) : zustand.koalition.minderheit ? status('gelb', 'Minderheit') : status('ok', 'allein'),
        regierung.map((id) => partei(id).name).join(', '))}
      ${kennzahl('Mehrheit im Bundestag', `${sitze} <small>von ${noetig}</small>`, sitze >= noetig ? status('ok', 'eigene Mehrheit') : status('gelb', 'Stimmen der Opposition nötig'))}
      ${kennzahl('Schuldenbremse', `${zahl(mrd(spielraum), 1)} Mrd.`, spielraum >= 0 ? status('ok', 'Spielraum') : status('rot', 'überschritten – im Haushalt ausgleichen'))}
      ${kennzahl('Größtes Problem', `${druck} <small>von 100</small>`, status(druckStufe, groesstes.name))}
    </div>
    ${tickerHtml(zustand) ? karte(tickerHtml(zustand), { titel: 'Schlagzeilen' }) : ''}
    ${e ? '' : karte(hauptaktion, { titel: `Jahr ${zustand.haushalt.jahr} von ${config.legislaturJahre} · Quartal ${zustand.quartal} von ${config.regierung.quartaleJeJahr}` })}
  </div>`;

  el.querySelector('#weiter')?.addEventListener('click', () => onWeiter());
  el.querySelectorAll('[data-wahl]').forEach((k) => k.addEventListener('click', () => onEreignis({ wahl: Number(k.dataset.wahl) })));
  el.querySelectorAll('[data-gehe]').forEach((k) => k.addEventListener('click', () => onBereich(k.dataset.gehe)));
}
