import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { ministerien } from '../../data/ministerien.js';
import { config } from '../../data/config.js';
import { vorschau, mrd, bruchAbstand } from '../../engine/haushalt.js';
import { protokollHtml } from '../components/protokoll.js';
import { abstimmungHtml } from '../components/abstimmung.js';
import { verlaufSvg } from '../components/verlauf.js';
import { bundesratAbstimmung } from '../../engine/bundesrat.js';
import { koalitionsParteien } from '../../engine/kabinett.js';
import { andereParteien } from '../../data/laender.js';

const parteiInfo = (id) => partei(id) ?? andereParteien[id];

// Bundesrat zum Aufklappen: Länder, Regierung, Stimmen, Haltung bei Steueränderungen
function bundesratHtml(abstimmung, offen) {
  return `
    <details class="bundesrat" ${offen ? 'open' : ''}>
      <summary>Bundesrat: ${abstimmung.ja} von ${abstimmung.noetig} nötigen Stimmen für Steueränderungen</summary>
      ${abstimmung.laender.map((l) => `
        <div class="land">
          <span>${l.name}${l.geschaeftsfuehrend ? ' <small>(geschäftsführend)</small>' : ''}</span>
          <span>${l.regierung.map((id) => `<span class="punkt" style="background:${parteiInfo(id).farbe}" title="${parteiInfo(id).name}"></span>`).join('')}
            <small>${l.regierung.map((id) => parteiInfo(id).name).join(', ')}</small></span>
          <span>${l.bundesratStimmen}</span>
          <span class="${l.stimmtZu ? 'ok' : ''}">${l.stimmtZu ? 'Ja' : 'Enthaltung'}</span>
        </div>`).join('')}
    </details>`;
}

const hh = config.haushalt;
const partei = (id) => parteien.find((p) => p.id === id);
const euro = (tausend) => mrd(tausend).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mrd.';
const pp = (w) => (w >= 0 ? '+' : '−') + Math.abs(w).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const farbe = (a) => (a.geht ? 'rot' : a.verlust >= a.grenze * config.spielende.warnAnteil ? 'gelb' : 'ok');

// Je Partner: Verlust seit Regierungsbildung jetzt und nach diesem Haushalt (feste Wirkung). Bei Alleinregierung leer.
function koalitionHtml(zustand, anteile) {
  const jetzt = bruchAbstand(zustand);
  if (!jetzt.length) return '';
  const nachher = bruchAbstand(zustand, anteile);
  // drei Stellen, weil die Grenze in Tausendsteln gilt: −1,503 geht, würde mit zwei Stellen aber als −1,50 erscheinen
  const punkte = (v) => (v > 0 ? '−' : '+') + Math.abs(v).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  return `
    <h2>Koalition</h2>
    ${jetzt.map((a, i) => {
      const n = nachher[i];
      return `<p>${partei(a.id).name}: <span class="${farbe(a)}">jetzt ${punkte(a.verlust)}</span> ·
        <span class="${farbe(n)}">nach diesem Haushalt ${punkte(n.verlust)}</span> von −${a.grenze.toLocaleString('de-DE', { minimumFractionDigits: 2 })} Punkten${n.geht ? ' – <strong class="rot">würde die Koalition verlassen</strong>' : ''}</p>`;
    }).join('')}
    <p><small>Ohne die zufällige Schwankung von ±${config.wahlkampf.schwankungMax.toLocaleString('de-DE')} Punkten; das Ergebnis kann davon abweichen.</small></p>`;
}

const prozent = (stufe, schritt) => (stufe ? ` <small>(${stufe > 0 ? '+' : '−'}${Math.abs(stufe * schritt)} %)</small>` : '');

// Haushalt des laufenden Jahres aufstellen und beschließen.
export function haushaltScreen(el, zustand, protokoll, { onBeschliessen }) {
  const stufen = {};
  let steuerStufe = 0;
  let bundesratOffen = false;
  let bundestagOffen = false;
  const maxMinister = hh.ministerMaxProzent / hh.ministerSchrittProzent;
  const maxSteuer = hh.steuerMaxProzent / hh.steuerSchrittProzent;
  const verteilung = zustand.kabinett.verteilung;

  const zeile = (key, titel, farbe, betrag, stufe, max, schritt) => `
    <div class="posten">
      <span><span class="punkt" style="background:${farbe}"></span>${titel}</span>
      <span class="betrag">${euro(betrag)}${prozent(stufe, schritt)}</span>
      <button data-key="${key}" data-dir="-1" ${stufe <= -max ? 'aria-disabled="true"' : ''} aria-label="${titel} senken">−</button>
      <button data-key="${key}" data-dir="1" ${stufe >= max ? 'aria-disabled="true"' : ''} aria-label="${titel} erhöhen">+</button>
    </div>`;

  function zeichne() {
    const v = vorschau(zustand, { stufen, steuerStufe });
    const b = v.bilanz;
    const wirkung = Object.entries(v.wirkung).filter(([, w]) => w);
    // nur eine Minderheitsregierung kann im Bundestag scheitern (F11)
    const durchfallen = !v.bundestag.angenommen && zustand.koalition.minderheit;
    el.innerHTML = `
      <h1>Haushalt</h1>
      ${hinweisHtml('regierung')}
      <p><strong>Haushaltsjahr ${zustand.haushalt.jahr} von ${config.legislaturJahre}</strong> · Kanzler: ${partei(zustand.kanzlerParteiId).name}${zustand.koalition.minderheit ? ' · <strong>Minderheitsregierung</strong>' : ''}</p>
      <div class="bilanz">
        <span>Einnahmen</span><span>${euro(b.einnahmen)}</span>
        <span>Ausgaben</span><span>${euro(b.ausgaben)}</span>
        ${b.reformen ? `<span>davon laufende Reformen</span><span>${euro(b.reformen)}</span>` : ''}
        <span>Neue Schulden</span><span>${euro(b.neueSchulden)}</span>
        <span>davon Verteidigungsausnahme</span><span>${euro(b.ausnahme)}</span>
        <span>Schuldenbremse</span><span class="${b.eingehalten ? 'ok' : 'rot'}">${euro(b.schuldenbremse)} von ${euro(hh.schuldenbremseGrenze)} ${b.eingehalten ? '✓' : '✗ überschritten'}</span>
        <span>Bundestag</span><span class="${v.bundestag.angenommen ? 'ok' : 'rot'}">${v.bundestag.ja} Ja, ${v.bundestag.nein} Nein ${v.bundestag.angenommen ? '✓' : '✗ keine Mehrheit'}</span>
        ${v.bundesrat ? `<span>Bundesrat (wegen Steueränderung)</span><span class="${v.bundesrat.mehrheit ? 'ok' : 'rot'}">${v.bundesrat.ja} von ${v.bundesrat.noetig} Stimmen ${v.bundesrat.mehrheit ? '✓' : '✗ keine Mehrheit'}</span>` : ''}
      </div>
      ${koalitionHtml(zustand, v.anteile)}
      <h2>Wirkung auf die Umfragen</h2>
      <p>${wirkung.length ? wirkung.map(([id, w]) => `${partei(id).name} ${pp(w)}`).join(' · ') : 'Keine Änderung gegenüber dem Vorjahr.'}</p>
      <h2>Umfrageverlauf</h2>
      ${verlaufSvg(zustand.verlauf, partei(zustand.spielerParteiId))}
      <h2>Einnahmen</h2>
      ${zeile('steuern', `Steuern (${partei(verteilung.finanzen).name}, Finanzen)`, partei(verteilung.finanzen).farbe, v.steuern, steuerStufe, maxSteuer, hh.steuerSchrittProzent)}
      <h2>Ministerien</h2>
      ${ministerien.map((m) => zeile(m.id, m.kurz, partei(verteilung[m.id]).farbe, v.etats[m.id], stufen[m.id] ?? 0, maxMinister, hh.ministerSchrittProzent)).join('')}
      ${durchfallen ? `<p class="rot">Der Haushalt hat keine Mehrheit. Einbringen heißt: vorläufige Haushaltsführung, der Vorjahreshaushalt gilt weiter, ${partei(zustand.kanzlerParteiId).name} −${config.minderheit.umfrageVerlustHaushaltGescheitert.toLocaleString('de-DE')} Punkte (Fehlschlag ${(zustand.koalition.fehlschlaege ?? 0) + 1} von ${config.minderheit.fehlschlaegeBisSpielende} bis zum Spielende).</p>` : ''}
      <div class="knoepfe"><button id="beschliessen" ${durchfallen || (b.eingehalten && v.bundesrat?.mehrheit !== false) ? '' : 'disabled'}>${durchfallen ? 'Haushalt trotzdem einbringen' : 'Haushalt beschließen'}</button></div>
      ${abstimmungHtml(v.bundestag, 'Bundestag über den Haushalt', bundestagOffen)}
      ${bundesratHtml(bundesratAbstimmung(koalitionsParteien(zustand)), bundesratOffen)}
      ${protokollHtml(protokoll)}`;

    el.querySelectorAll('[data-key]').forEach((knopf) =>
      knopf.addEventListener('click', () => {
        if (knopf.getAttribute('aria-disabled') === 'true') return;
        const d = Number(knopf.dataset.dir);
        if (knopf.dataset.key === 'steuern') steuerStufe += d;
        else stufen[knopf.dataset.key] = (stufen[knopf.dataset.key] ?? 0) + d;
        zeichne();
        // Fokus zurück auf denselben Knopf, sonst springt er bei jedem Klick nach oben
        el.querySelector(`[data-key="${knopf.dataset.key}"][data-dir="${d}"]`).focus();
      }),
    );
    el.querySelector('#beschliessen').addEventListener('click', () => onBeschliessen({ stufen: { ...stufen }, steuerStufe }));
    // aufgeklappt bleiben, wenn der Bildschirm nach einem Klick neu gezeichnet wird
    el.querySelector('.bundesrat').addEventListener('toggle', (e) => (bundesratOffen = e.target.open));
    el.querySelector('.abstimmung').addEventListener('toggle', (e) => (bundestagOffen = e.target.open));
  }
  zeichne();
}
