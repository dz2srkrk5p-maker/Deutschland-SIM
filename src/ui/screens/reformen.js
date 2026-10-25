import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { bereiche } from '../../data/reformwege.js';
import { probleme } from '../../data/probleme.js';
import { gruppen, kennzahlen } from '../../data/kennzahlen.js';
import { ministerien } from '../../data/ministerien.js';
import { einnahmearten } from '../../data/einnahmen.js';
import { bereichStatus, wegVorschau, richtungsprofil, weg } from '../../engine/reformwege.js';
import { mrd } from '../../engine/haushalt.js';
import { trendJeMonat } from '../../engine/probleme.js';
import { profilHtml } from '../components/profil.js';
import { karte, badge, status, zahl, plusMinus, aufklapp } from '../components/basis.js';
import { erklaerungen } from '../../data/hinweise.js';
import { zeitstrahlHtml } from '../components/zeitstrahl.js';

const partei = (id) => parteien.find((p) => p.id === id);
const gName = (id) => gruppen.find((g) => g.id === id)?.name ?? id;
const pName = (id) => probleme.find((p) => p.id === id)?.name ?? id;
const kName = (id) => (id === 'gini' ? 'Gini' : kennzahlen.find((k) => k.id === id)?.name ?? id);
const STATUS = { offen: ['offen', ''], umsetzung: ['in Umsetzung', 'gelb'], beschlossen: ['beschlossen', 'ok'], gescheitert: ['gescheitert', 'rot'] };
const euro = (t) => `${zahl(mrd(Math.abs(t)), 1)} Mrd.`;

// Wirkung als lesbarer Text: Kennzahlen, Gruppen, Probleme (einmalig) und Trends (dauerhaft je Monat)
function wirkungText(w = {}) {
  const teile = [
    ...['wachstum', 'inflation', 'arbeitslosigkeit', 'gini'].filter((k) => w[k]).map((k) => `${kName(k)} ${plusMinus(w[k])}`),
    ...Object.entries(w.gruppen ?? {}).map(([g, v]) => `${gName(g)} ${plusMinus(v, 0)}`),
    ...Object.entries(w.probleme ?? {}).map(([p, v]) => `${pName(p)} ${plusMinus(v, 0)}`),
    ...Object.entries(w.trend ?? {}).map(([p, v]) => `${pName(p)} dauerhaft ${plusMinus(trendJeMonat(v), 3)} je Monat`),
  ];
  return teile.join(' · ') || '–';
}
const haltung = (h) => (h >= 0.5 ? status('ok', 'dafür') : h <= -0.5 ? status('rot', 'dagegen') : '<span class="klein">neutral</span>');

function wegKarte(zustand, w) {
  const v = wegVorschau(zustand, w.id);
  const stand = zustand.reformwege[w.id];
  const a = v.abstimmung;
  const kosten = w.kosten ? `${w.kosten > 0 ? '' : 'spart '}${euro(w.kosten)} je Jahr` : 'keine';
  const einnahmen = Object.entries(w.einnahmen ?? {}).map(([id, b]) => `${einnahmearten.find((e) => e.id === id).name} ${b > 0 ? '+' : '−'}${euro(b)}`).join(', ');
  return `<article class="karte weg">
    <h3>${w.name} ${stand ? badge(...STATUS[stand.status]) : ''}</h3>
    <p>${badge(v.ausrichtung)}${(zustand.koalition?.vertrag?.vorhaben ?? []).filter((x) => x.wegId === w.id).map((x) => ` ${badge(`Koalitionsvertrag (${partei(x.partei).name})${x.status === 'offen' ? '' : x.status === 'umgesetzt' ? ': erfüllt' : ': gebrochen'}`, x.status === 'gebrochen' ? 'rot' : 'ok')}`).join('')}${(zustand.koalition?.vertrag?.vorhaben ?? []).filter((x) => x.status === 'offen' && x.wegId !== w.id && weg(x.wegId).bereich.id === w.bereich.id && !w.braucht).map((x) => ` ${badge(`bricht den Koalitionsvertrag (${partei(x.partei).name})`, 'rot')}`).join('')}</p>
    <p class="klein">${w.text}</p>
    ${profilHtml(v.vektor)}
    <table><tbody>
      <tr><th scope="row">Kosten</th><td>${kosten}</td></tr>
      ${einnahmen ? `<tr><th scope="row">Einnahmen</th><td>${einnahmen}</td></tr>` : ''}
      <tr><th scope="row">Sofort</th><td>${wirkungText(w.kurz)}</td></tr>
      <tr><th scope="row">Nach Umsetzung</th><td>${wirkungText(w.lang)}</td></tr>
      <tr><th scope="row">Gewinner</th><td>${v.gewinner.map(gName).join(', ') || '–'}</td></tr>
      <tr><th scope="row">Verlierer</th><td>${v.verlierer.map(gName).join(', ') || '–'}</td></tr>
      <tr><th scope="row">Dauer</th><td>${w.dauer} Monate</td></tr>
      <tr><th scope="row">Risiko des Scheiterns</th><td>${Math.round(v.risiko * 100)} %${w.verfassung ? ' <span class="gelb">⚠ verfassungsrechtlich umstritten</span>' : ''}</td></tr>
      <tr><th scope="row">Politisches Kapital</th><td>${v.kapital}${v.revision ? ` <span class="gelb">(davon ${config.reformwege.revisionKapital} für den Kurswechsel)</span>` : ''}</td></tr>
      ${v.bonus ? `<tr><th scope="row">${partei(zustand.kanzlerParteiId).name}</th><td>${status('ok', `passt zur eigenen Linie, +${zahl(v.bonus, 2)} beim Beschluss`)}</td></tr>` : ''}
      <tr><th scope="row" title="${erklaerungen.abstimmung}">Bundestag ⓘ</th><td title="${erklaerungen.abstimmung}">${status(a.angenommen ? 'ok' : 'rot', `${a.ja} Ja, ${a.nein} Nein`)}</td></tr>
      ${v.bundesrat ? `<tr><th scope="row">Bundesrat</th><td>${status(v.bundesrat.mehrheit ? 'ok' : 'rot', `${v.bundesrat.ja} von ${v.bundesrat.noetig}`)}</td></tr>` : ''}
      ${w.haushalt ? '<tr><th scope="row">Haushalt</th><td>braucht Spielraum in der Schuldenbremse</td></tr>' : ''}
      ${v.partner.map((p) => `<tr><th scope="row">${partei(p.id).name}</th><td>${p.veto ? status('rot', 'Veto (stimmt mit Nein)') : p.unmut ? status('gelb', `trägt mit, Unmut −${zahl(p.unmut, 2)}`) : status('ok', 'trägt mit')}</td></tr>`).join('')}
    </tbody></table>
    ${aufklapp('Verbände und EU', `<table><tbody>${v.akteure.map((r) => `<tr><th scope="row">${r.akteur.name}</th><td>${haltung(r.haltung)}</td></tr>`).join('')}
      ${w.verfassung ? '<tr><th scope="row">Bundesverfassungsgericht</th><td><span class="gelb">⚠ Klage wahrscheinlich</span></td></tr>' : ''}</tbody></table>`)}
    ${stand && stand.status !== 'gescheitert' ? '' : v.sperre ? `<p class="klein">✗ ${v.sperre.grund}</p>${v.sperre.kompromiss && !v.kompromissSperre ? `<p class="klein">${erklaerungen.kompromiss}</p><button data-waehlen="${w.id}" data-kompromiss="1">Kompromiss im Bundesrat …</button>` : ''}` : `<button class="primaer" data-waehlen="${w.id}">${v.revision ? 'Kurs wechseln …' : 'Diesen Weg wählen …'}</button>`}
  </article>`;
}

// Bestätigungsdialog mit Zusammenfassung der Folgen
function dialogHtml(zustand, wegId, kompromiss = false) {
  const v = wegVorschau(zustand, wegId);
  const w = v.weg;
  const km = config.kompromiss;
  return `<dialog id="weg-bestaetigen" aria-labelledby="weg-titel">
    <h2 id="weg-titel">„${w.name}“ ${kompromiss ? 'als Kompromiss im Bundesrat' : 'verbindlich'} beschließen?</h2>
    ${kompromiss ? `<p class="gelb">⚠ Kompromiss: Im Bundesrat fehlen ${v.bundesrat.noetig - v.bundesrat.ja} Stimmen. Die Länder stimmen einer abgeschwächten Fassung zu: alle Wirkungen und Einnahmen nur zu ${Math.round(km.wirkungFaktor * 100)} %, politisches Kapital ${v.kompromissKapital} statt ${v.kapital}. Die Angaben unten gelten für die volle Fassung.</p>` : ''}
    <p>${badge(v.ausrichtung)} im Bereich ${w.bereich.name}. ${v.revision ? `<strong class="gelb">⚠ Kurswechsel: „${v.revision.name}“ wird zurückgenommen (Glaubwürdigkeit −${zahl(config.reformwege.revisionUmfrage, 1)}).</strong>` : 'Andere Wege in diesem Bereich sind danach nur mit hohem politischem Preis möglich.'}</p>
    <ul>
      <li>Bundestag: ${v.abstimmung.ja} Ja, ${v.abstimmung.nein} Nein – ${v.abstimmung.angenommen ? 'angenommen' : '<strong class="rot">abgelehnt (Kapital trotzdem teilweise verbraucht)</strong>'}</li>
      <li>Kosten: ${w.kosten ? `${w.kosten > 0 ? '' : 'spart '}${euro(w.kosten)} je Jahr ab dem nächsten Haushalt` : 'keine laufenden Kosten'}</li>
      <li>Sofort: ${wirkungText(w.kurz)}</li>
      <li>Nach ${w.dauer} Monaten: ${wirkungText(w.lang)}</li>
      ${v.bonus ? `<li>${partei(zustand.kanzlerParteiId).name}: +${zahl(v.bonus, 2)} (passt zur eigenen Linie)</li>` : ''}
      <li>Risiko des Scheiterns: ${Math.round(v.risiko * 100)} %; politisches Kapital: ${v.kapital}</li>
      ${v.partner.filter((p) => p.unmut || p.veto).map((p) => `<li>${partei(p.id).name}: ${p.veto ? 'stimmt dagegen' : `Unmut −${zahl(p.unmut, 2)}`}</li>`).join('')}
    </ul>
    <div class="knoepfe"><button class="primaer" data-beschliessen="${w.id}">Verbindlich beschließen</button><button data-abbrechen>Abbrechen</button></div>
  </dialog>`;
}

function uebersicht(zustand) {
  return `${karte(`${profilHtml(richtungsprofil(zustand))}<p class="klein">Aus allen Reformwegen in Umsetzung oder beschlossen. Es wirkt auf Wirtschaft, Koalition, Wählerstimmung, EU und Ereignisse.</p>`, { titel: 'Richtungsprofil des Landes' })}
    ${zeitstrahlHtml(zustand) ? karte(zeitstrahlHtml(zustand), { titel: 'Laufende Vorhaben' }) : ''}
    <div class="kennzahlen">${bereiche.map((b) => {
      const st = bereichStatus(zustand, b);
      const folge = b.wege.filter((w) => w.braucht && zustand.reformwege[w.braucht]?.status === 'beschlossen' && !zustand.reformwege[w.id]);
      return karte(`<p>${badge(...STATUS[st.status])} ${st.weg ? st.weg.name : ''}</p>
        <p class="klein">${ministerien.find((m) => m.id === b.ministerium).kurz} · ${b.probleme.map((p) => `${pName(p)} ${Math.round(zustand.probleme[p].wert)}`).join(', ')}</p>
        ${folge.length ? `<p>${badge(`Anschlussreform möglich: ${folge.map((w) => w.name).join(', ')}`, 'ok')}</p>` : ''}
        <button data-bereich-auswahl="${b.id}">Wege vergleichen</button>`, { titel: b.name });
    }).join('')}</div>`;
}

function detail(zustand, b) {
  const st = bereichStatus(zustand, b);
  const grund = b.wege.filter((w) => !w.braucht);
  const folge = b.wege.filter((w) => w.braucht);
  return `<button id="zurueck">← Alle Bereiche</button>
    <h2>${b.name} ${badge(...STATUS[st.status])}</h2>
    ${st.weg ? `<p>Gewählt: <strong>${st.weg.name}</strong>. Ein anderer Weg ist nur mit Kurswechsel möglich (+${config.reformwege.revisionKapital} Kapital, Glaubwürdigkeit −${zahl(config.reformwege.revisionUmfrage, 1)}).</p>` : '<p>Noch kein Weg gewählt. Der Beschluss ist verbindlich.</p>'}
    <div class="wege">${grund.map((w) => wegKarte(zustand, w)).join('')}</div>
    ${folge.length ? `<h2>Anschlussreformen</h2><p class="klein">Nur nach dem passenden Grundweg möglich (Pfadabhängigkeit).</p><div class="wege">${folge.map((w) => wegKarte(zustand, w)).join('')}</div>` : ''}`;
}

// Reformen (System 1): Übersicht der Bereiche, Vergleich der Wege, Bestätigung vor dem Beschluss
export function reformenScreen(el, zustand, { auswahl, onAuswahl, onBeschliessen }) {
  const b = bereiche.find((x) => x.id === auswahl);
  el.innerHTML = `<div class="ansicht">
    <h1>Reformen</h1>
    <p class="klein">Politisches Kapital: <strong>${zustand.kapital}</strong> · Vorhaben in diesem Monat: ${zustand.aktionenImMonat} von ${config.probleme.aktionenJeMonat}.</p>
    ${b ? detail(zustand, b) : uebersicht(zustand)}
    <div id="dialog-platz"></div>
  </div>`;
  el.querySelectorAll('[data-bereich-auswahl]').forEach((k) => k.addEventListener('click', () => onAuswahl(k.dataset.bereichAuswahl)));
  el.querySelector('#zurueck')?.addEventListener('click', () => onAuswahl(null));
  el.querySelectorAll('[data-waehlen]').forEach((k) => k.addEventListener('click', () => {
    const kompromiss = k.dataset.kompromiss === '1';
    el.querySelector('#dialog-platz').innerHTML = dialogHtml(zustand, k.dataset.waehlen, kompromiss);
    const d = el.querySelector('#weg-bestaetigen');
    d.querySelector('[data-abbrechen]').addEventListener('click', () => (d.close(), k.focus()));
    d.querySelector('[data-beschliessen]').addEventListener('click', () => (d.close(), onBeschliessen({ wegId: k.dataset.waehlen, kompromiss })));
    d.showModal();
  }));
}
