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
import { erklaerungen } from '../../data/hinweise.js';
import { umfrageBilanzHtml } from '../components/umfragebilanz.js';
import { naechsteWahlen, wechselChance, wechsel } from '../../engine/landtagswahlen.js';
import { faellig } from '../../engine/koalitionsvertrag.js';
import { weg } from '../../engine/reformwege.js';
import { bundesratAbstimmung } from '../../engine/bundesrat.js';
import { bruchStufe, koalitionsWarnung, koalitionslageHtml } from '../components/koalitionslage.js';
import { karte, kennzahl, status, zahl, plusMinus, balken, badge } from '../components/basis.js';
import { wirtschaftsverlaufHtml } from '../components/wirtschaftsverlauf.js';
import { zeitstrahlHtml } from '../components/zeitstrahl.js';

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

function topProblemeHtml(zustand) {
  const liste = problemListe(zustand).slice(0, 4);
  // Jede Zeile führt direkt zum Problem (Ursachen, Lösungen)
  return `<ul class="liste">${liste.map((e) => `<li class="problem-zeile"><button data-problem="${e.problem.id}" class="problem-knopf">
    <span class="problem-kopf"><span>${e.problem.name} ${e.wert >= pc.stufen[2].ab ? badge(e.stufe.name, 'rot') : ''}</span><span class="zahl">${Math.round(e.wert)}</span></span>
    ${balken(e.wert, e.wert >= pc.stufen[2].ab ? 'var(--gefahr)' : 'var(--warn)', { marke: pc.stufen[2].ab, label: `${e.problem.name}: ${Math.round(e.wert)} von 100` })}</button></li>`).join('')}</ul>
    <div class="knoepfe"><button data-gehe="probleme">Alle Probleme und Lösungen</button></div>`;
}

// Lage: Dashboard jedes Quartals. Offenes Ereignis zuerst, dann Kennzahlen, Top-Probleme, Wirtschaft, Schlagzeilen, Hauptaktion.
// Landtagswahlen (Feature 5): Termine dieses und des nächsten Quartals mit Chance und Folge für den Bundesrat
function landtagswahlenHtml(zustand) {
  const wahlen = naechsteWahlen(zustand, 2);
  if (!wahlen.length) return '';
  const name = (id) => partei(id)?.name ?? id;
  const bund = koalitionsParteien(zustand);
  const jetzt = bundesratAbstimmung(bund, zustand.laender).ja;
  return `<p class="klein">${erklaerungen.landtagswahl}</p><ul class="liste">${wahlen.map((w) => {
    const l = zustand.laender[w.land.id];
    const neu = wechsel(zustand, w.land.id);
    const danach = bundesratAbstimmung(bund, { ...zustand.laender, [w.land.id]: { ...l, regierung: neu.regierung } }).ja;
    return `<li><span><strong>${w.land.name}</strong> ${w.inQuartalen === 0 ? 'am Ende dieses Quartals' : 'am Ende des nächsten Quartals'} · Regierung: ${l.regierung.map(name).join(', ')}<br>
      <small>Wechselchance ${Math.round(wechselChance(zustand, w.land.id) * 100)} %. Bei Wechsel: ${[neu.raus && `${name(neu.raus)} raus`, neu.rein && `${name(neu.rein)} rein`].filter(Boolean).join(', ') || 'keine Änderung möglich'}; Bundesrat für deine Koalition ${jetzt} → ${danach} Stimmen.</small></span></li>`;
  }).join('')}</ul>`;
}

// Koalitionsvertrag (Feature 7): Stand der Vorhaben, was bis Jahresende fällig ist
const STATUS_VORHABEN = { offen: 'offen', umgesetzt: '✓ beschlossen', gebrochen: '✗ gebrochen' };
function vertragHtml(zustand) {
  const vorhaben = zustand.koalition?.vertrag?.vorhaben ?? [];
  if (!vorhaben.length) return '';
  const erfuellt = vorhaben.filter((v) => v.status === 'umgesetzt').length;
  const soll = zustand.koalition.partner.reduce((s, id) => s + faellig(vorhaben.filter((v) => v.partei === id).length, zustand.haushalt.jahr), 0);
  return `<p>${erfuellt} von ${vorhaben.length} Vorhaben beschlossen; bis zum Haushalt dieses Jahres fällig: ${soll}.</p>
    <ul class="liste">${vorhaben.map((v) => `<li><span>${weg(v.wegId).name} <small>(${partei(v.partei).name})</small></span> <span>${STATUS_VORHABEN[v.status]}</span></li>`).join('')}</ul>
    <p class="klein">${erklaerungen.vertrag}</p><div class="knoepfe"><button data-gehe="reformen">Zu den Reformen</button></div>`;
}

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

export function lageScreen(el, zustand, { onWeiter, onEreignis, onBereich, onProblem, onZugestaendnis, zusatz = '' }) {
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
      ${kennzahl('Schuldenbremse', `<span title="${erklaerungen.schuldenbremse}">${zahl(mrd(spielraum), 1)} Mrd.</span>`, spielraum >= 0 ? status('ok', 'Spielraum') : status('rot', 'überschritten – im Haushalt ausgleichen'))}
      ${kennzahl('Politisches Kapital', `<span title="${erklaerungen.kapital}">${zustand.kapital}</span> <small>von ${config.kapital.max}</small>`, `+${config.kapital.jeQuartal} je Quartal`)}
    </div>
    ${koalitionsWarnung(zustand) ? karte(koalitionHtml(zustand), { titel: `Koalition: ${koalitionsWarnung(zustand).text}` }) : ''}
    ${e ? '' : karte(hauptaktion, { titel: `Jahr ${zustand.haushalt.jahr} von ${config.legislaturJahre} · Quartal ${zustand.quartal} von ${config.regierung.quartaleJeJahr}` })}
    <div class="kennzahlen">
      ${karte(topProblemeHtml(zustand), { titel: 'Top-Probleme' })}
      ${karte(wirtschaftsverlaufHtml(zustand), { titel: 'Wirtschaft (Vorjahr)' })}
    </div>
    ${zeitstrahlHtml(zustand) ? karte(zeitstrahlHtml(zustand), { titel: 'Laufende Vorhaben' }) : ''}
    ${vertragHtml(zustand) ? karte(vertragHtml(zustand), { titel: 'Koalitionsvertrag' }) : ''}
    ${landtagswahlenHtml(zustand) ? karte(landtagswahlenHtml(zustand), { titel: 'Landtagswahlen' }) : ''}
    ${karte(umfrageBilanzHtml(zustand), { titel: 'Warum bewegt sich die Umfrage?' })}
    ${zusatz}
    ${tickerHtml(zustand) ? karte(tickerHtml(zustand), { titel: 'Schlagzeilen' }) : ''}
  </div>`;

  el.querySelector('#weiter')?.addEventListener('click', () => onWeiter());
  el.querySelectorAll('[data-zugestaendnis]').forEach((k) => k.addEventListener('click', () => onZugestaendnis({ partnerId: k.dataset.zugestaendnis })));
  el.querySelectorAll('[data-wahl]').forEach((k) => k.addEventListener('click', () => onEreignis({ wahl: Number(k.dataset.wahl) })));
  el.querySelectorAll('[data-gehe]').forEach((k) => k.addEventListener('click', () => onBereich(k.dataset.gehe)));
  el.querySelectorAll('[data-problem]').forEach((k) => k.addEventListener('click', () => onProblem(k.dataset.problem)));
}
