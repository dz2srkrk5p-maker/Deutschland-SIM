import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { probleme } from '../../data/probleme.js';
import { koalitionsParteien } from '../../engine/kabinett.js';
import { mehrheit } from '../../engine/koalition.js';
import { vorschau, mrd, bruchAbstand, zugestaendnisSperre } from '../../engine/haushalt.js';
import { haushaltsQuartal } from '../../engine/regierung.js';
import { offenesEreignis, folgen } from '../../engine/ereignisse.js';
import { problemListe } from '../../engine/probleme.js';
import { tickerHtml } from '../components/ticker.js';
import { umfrageBilanzHtml } from '../components/umfragebilanz.js';
import { bruchStufe, koalitionsWarnung, koalitionslageHtml } from '../components/koalitionslage.js';
import { karte, kennzahl, status, zahl, plusMinus, balken, badge } from '../components/basis.js';

const partei = (id) => parteien.find((p) => p.id === id);
const STUFE_TEXT = { ok: 'stabil', gelb: 'angespannt', rot: 'vor dem Bruch' };
const pc = config.probleme;

// Offenes Ereignis (F14): Kontext, Möglichkeiten und ihre Folgen vor dem Klick
function ereignisHtml(zustand, e) {
  const optionen = e.moeglichkeiten.map((m, i) => {
    const f = folgen(zustand, e.id, i);
    const teile = [
      ...Object.entries(f.parteien).map(([id, w]) => `${partei(id).name} ${plusMinus(w)}`),
      ...Object.entries(f.probleme).map(([id, d]) => `${probleme.find((p) => p.id === id).name} ${plusMinus(d, 0)}`),
    ];
    return `<button data-wahl="${i}"><strong>${m.text}</strong><small>${teile.join(' · ') || 'keine Folgen'}</small></button>`;
  }).join('');
  return karte(`<span class="badge gelb">⚠ Entscheidung nötig</span><h2>${e.titel}</h2><p>${e.text}</p><div class="optionen">${optionen}</div>`, { klasse: 'ereignis' });
}

// Wirtschaftslage: Wert, Bewertung mit Symbol
function wirtschaftHtml(l) {
  const zeile = (titel, wert, gut) => `<span>${titel}</span><span>${wert} ${gut === null ? '' : gut ? '<span class="ok">✓</span>' : '<span class="gelb">⚠</span>'}</span>`;
  return `<div class="bilanz">
    ${zeile('Wachstum', `${zahl(l.wachstum, 1)} %`, l.wachstum >= config.wirtschaft.potenzialWachstum)}
    ${zeile('Inflation', `${zahl(l.inflation, 1)} %`, l.inflation <= 3)}
    ${zeile('Arbeitslosenquote', `${zahl(l.arbeitslosigkeit, 1)} %`, l.arbeitslosigkeit <= 6)}
    ${zeile('Schuldenquote', `${zahl(l.schuldenquote, 1)} %`, l.schuldenquote <= 65)}
    ${zeile('Ungleichheit (Gini)', zahl(l.gini, 1), null)}
  </div>`;
}

function topProblemeHtml(zustand) {
  const liste = problemListe(zustand).slice(0, 4);
  return `<ul class="liste">${liste.map((e) => `<li>
    <span class="problem-kopf"><span>${e.problem.name} ${e.wert >= pc.stufen[2].ab ? badge(e.stufe.name, 'rot') : ''}</span><span class="zahl">${Math.round(e.wert)}</span></span>
    ${balken(e.wert, e.wert >= pc.stufen[2].ab ? 'var(--gefahr)' : 'var(--warn)', { marke: pc.stufen[2].ab, label: `${e.problem.name}: ${Math.round(e.wert)} von 100` })}</li>`).join('')}</ul>
    <div class="knoepfe"><button data-gehe="probleme">Alle Probleme und Lösungen</button></div>`;
}

// Lage: Dashboard jedes Quartals. Offenes Ereignis zuerst, dann Kennzahlen, Top-Probleme, Wirtschaft, Schlagzeilen, Hauptaktion.
// Koalition unter Druck (Block 2): Lage der Partner, Fristen, Gegenmaßnahme Zugeständnis
function koalitionHtml(zustand) {
  const kb = config.koalitionsbruch;
  const knoepfe = zustand.koalition.partner.map((id) => {
    const sperre = zugestaendnisSperre(zustand, id);
    return `<button data-zugestaendnis="${id}" ${sperre ? 'disabled' : ''}>Zugeständnis an ${partei(id).name}</button>${sperre ? ` <small>${sperre}</small>` : ''}`;
  }).join(' ');
  return `${koalitionslageHtml(zustand)}
    <p class="klein">Zugeständnis: ${partei(zustand.kanzlerParteiId).name} gibt in einem Streitpunkt nach. Partner +${zahl(kb.zugestaendnisPunkte, 1)}, eigene Partei −${zahl(kb.zugestaendnisKanzler, 1)}, ${kb.zugestaendnisKapital} Kapital und ein Vorhaben; einmal je Partner und Jahr.</p>
    <div class="knoepfe">${knoepfe}</div>`;
}

export function lageScreen(el, zustand, { onWeiter, onEreignis, onBereich, onZugestaendnis, zusatz = '' }) {
  const e = offenesEreignis(zustand);
  const regierung = koalitionsParteien(zustand);
  const sitze = regierung.reduce((s, id) => s + zustand.sitze[id], 0);
  const noetig = mehrheit(zustand.sitze);
  const b = vorschau(zustand, {}).bilanz;
  const spielraum = b.grenze - b.schuldenbremse;
  const abstaende = bruchAbstand(zustand);
  const koalitionStufe = abstaende.map(bruchStufe).sort((x, y) => ['ok', 'gelb', 'rot'].indexOf(y) - ['ok', 'gelb', 'rot'].indexOf(x))[0];
  const frei = pc.aktionenJeQuartal - zustand.aktionenImQuartal;

  const hauptaktion = haushaltsQuartal(zustand)
    ? `<p>Im ${zustand.quartal}. Quartal wird der Haushalt für Jahr ${zustand.haushalt.jahr} eingebracht.</p>
       <div class="knoepfe"><button class="primaer" data-gehe="haushalt">Zum Haushalt</button></div>`
    : `<p>${frei > 0 ? `Noch ${frei} von ${pc.aktionenJeQuartal} Vorhaben in diesem Quartal möglich (Lösungen und Reformen).` : status('ok', 'Alle Vorhaben für dieses Quartal sind gestartet.')}</p>
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
      ${kennzahl('Politisches Kapital', `${zustand.kapital} <small>von ${config.kapital.max}</small>`, `+${config.kapital.jeQuartal} je Quartal`)}
    </div>
    ${koalitionsWarnung(zustand) ? karte(koalitionHtml(zustand), { titel: `Koalition: ${koalitionsWarnung(zustand).text}` }) : ''}
    ${e ? '' : karte(hauptaktion, { titel: `Jahr ${zustand.haushalt.jahr} von ${config.legislaturJahre} · Quartal ${zustand.quartal} von ${config.regierung.quartaleJeJahr}` })}
    <div class="kennzahlen">
      ${karte(topProblemeHtml(zustand), { titel: 'Top-Probleme' })}
      ${karte(wirtschaftHtml(zustand.land), { titel: 'Wirtschaft (Vorjahr)' })}
    </div>
    ${karte(umfrageBilanzHtml(zustand), { titel: 'Warum bewegt sich die Umfrage?' })}
    ${zusatz}
    ${tickerHtml(zustand) ? karte(tickerHtml(zustand), { titel: 'Schlagzeilen' }) : ''}
  </div>`;

  el.querySelector('#weiter')?.addEventListener('click', () => onWeiter());
  el.querySelectorAll('[data-zugestaendnis]').forEach((k) => k.addEventListener('click', () => onZugestaendnis({ partnerId: k.dataset.zugestaendnis })));
  el.querySelectorAll('[data-wahl]').forEach((k) => k.addEventListener('click', () => onEreignis({ wahl: Number(k.dataset.wahl) })));
  el.querySelectorAll('[data-gehe]').forEach((k) => k.addEventListener('click', () => onBereich(k.dataset.gehe)));
}
