import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { ministerien } from '../../data/ministerien.js';
import { config } from '../../data/config.js';
import { vorschau, mrd } from '../../engine/haushalt.js';
import { haushaltsQuartal } from '../../engine/regierung.js';
import { bundesratAbstimmung } from '../../engine/bundesrat.js';
import { koalitionsParteien } from '../../engine/kabinett.js';
import { abstimmungHtml } from '../components/abstimmung.js';
import { bundesratHtml } from '../components/bundesrat.js';
import { koalitionslageHtml } from '../components/koalitionslage.js';
import { karte, tabs, status, punkt, zahl, plusMinus, leer } from '../components/basis.js';

const hh = config.haushalt;
const partei = (id) => parteien.find((p) => p.id === id);
const euro = (tausend) => `${zahl(mrd(tausend), 2)} Mrd.`;
const prozentStufe = (stufe, schritt) => (stufe ? ` <small>(${plusMinus(stufe * schritt, 0)} %)</small>` : '');
const TABS = [
  { id: 'ueberblick', text: 'Überblick' },
  { id: 'ausgaben', text: 'Ausgaben' },
  { id: 'einnahmen', text: 'Einnahmen' },
  { id: 'abstimmungen', text: 'Abstimmungen' },
];

// Haushalt: Überblick mit Bilanz und Einbringen; Ausgaben, Einnahmen und Abstimmungen als Unterbereiche.
// Außerhalb des Haushaltsquartals nur lesbar. entwurf: { jahr, stufen, steuerStufe, tab } aus app.js, bleibt beim Bereichswechsel.
export function haushaltScreen(el, zustand, { entwurf, onBeschliessen }) {
  if (entwurf.jahr !== zustand.haushalt.jahr) Object.assign(entwurf, { jahr: zustand.haushalt.jahr, stufen: {}, steuerStufe: 0 });
  const bearbeitbar = haushaltsQuartal(zustand) && !zustand.offenesEreignis;
  const maxMinister = hh.ministerMaxProzent / hh.ministerSchrittProzent;
  const maxSteuer = hh.steuerMaxProzent / hh.steuerSchrittProzent;
  const verteilung = zustand.kabinett.verteilung;

  const zeile = (key, titel, farbe, betrag, stufe, max, schritt) => `
    <div class="posten ${bearbeitbar ? '' : 'nurlesen'}">
      <span>${punkt(farbe)}${titel}</span>
      <span class="betrag">${euro(betrag)}${prozentStufe(stufe, schritt)}</span>
      ${bearbeitbar ? `
      <button data-key="${key}" data-dir="-1" ${stufe <= -max ? 'aria-disabled="true"' : ''} aria-label="${titel} senken">−</button>
      <button data-key="${key}" data-dir="1" ${stufe >= max ? 'aria-disabled="true"' : ''} aria-label="${titel} erhöhen">+</button>` : ''}
    </div>`;

  function ueberblick(v) {
    const b = v.bilanz;
    const wirkung = Object.entries(v.wirkung).filter(([, w]) => w);
    // nur eine Minderheitsregierung kann im Bundestag scheitern (F11)
    const durchfallen = !v.bundestag.angenommen && zustand.koalition.minderheit;
    const kannEinbringen = durchfallen || (b.eingehalten && v.bundesrat?.mehrheit !== false);
    return `
      ${karte(`<div class="bilanz">
        <span>Einnahmen</span><span>${euro(b.einnahmen)}</span>
        <span>Ausgaben</span><span>${euro(b.ausgaben)}</span>
        ${b.reformen ? `<span>davon laufende Reformen</span><span>${euro(b.reformen)}</span>` : ''}
        <span>Neue Schulden</span><span>${euro(b.neueSchulden)}</span>
        <span>davon Verteidigungsausnahme</span><span>${euro(b.ausnahme)}</span>
        <span>Schuldenbremse</span><span>${status(b.eingehalten ? 'ok' : 'rot', `${euro(b.schuldenbremse)} von ${euro(hh.schuldenbremseGrenze)}`)}</span>
        <span>Bundestag</span><span>${status(v.bundestag.angenommen ? 'ok' : 'rot', `${v.bundestag.ja} Ja, ${v.bundestag.nein} Nein`)}</span>
        ${v.bundesrat ? `<span>Bundesrat (Steueränderung)</span><span>${status(v.bundesrat.mehrheit ? 'ok' : 'rot', `${v.bundesrat.ja} von ${v.bundesrat.noetig} Stimmen`)}</span>` : ''}
      </div>`, { titel: 'Bilanz' })}
      ${karte(`<p>${wirkung.length ? wirkung.map(([id, w]) => `${partei(id).name} ${plusMinus(w)}`).join(' · ') : 'Keine Änderung gegenüber dem Vorjahr.'}</p>`, { titel: 'Wirkung auf die Umfragen' })}
      ${karte(koalitionslageHtml(zustand, v.anteile), { titel: 'Koalition' })}
      ${bearbeitbar ? karte(`
        ${durchfallen ? `<p class="rot">✗ Keine Mehrheit. Einbringen heißt: Der Vorjahreshaushalt gilt weiter, ${partei(zustand.kanzlerParteiId).name} ${plusMinus(-config.minderheit.umfrageVerlustHaushaltGescheitert, 1)} Punkte (Fehlschlag ${(zustand.koalition.fehlschlaege ?? 0) + 1} von ${config.minderheit.fehlschlaegeBisSpielende} bis zum Spielende).</p>` : ''}
        ${!b.eingehalten && !durchfallen ? '<p class="rot">✗ Schuldenbremse überschritten: unter „Ausgaben“ kürzen oder unter „Einnahmen“ Steuern erhöhen.</p>' : ''}
        ${v.bundesrat?.mehrheit === false && !durchfallen ? '<p class="rot">✗ Für die Steueränderung fehlt die Mehrheit im Bundesrat.</p>' : ''}
        <div class="knoepfe"><button id="beschliessen" class="${durchfallen ? 'gefahr primaer' : 'primaer'}" ${kannEinbringen ? '' : 'disabled'}>${durchfallen ? 'Trotzdem einbringen' : 'Haushalt einbringen'}</button></div>`) : ''}`;
  }

  function zeichne() {
    const v = vorschau(zustand, { stufen: entwurf.stufen, steuerStufe: entwurf.steuerStufe });
    const inhalt = {
      ueberblick: () => ueberblick(v),
      ausgaben: () => karte(ministerien.map((m) => zeile(m.id, m.kurz, partei(verteilung[m.id]).farbe, v.etats[m.id], entwurf.stufen[m.id] ?? 0, maxMinister, hh.ministerSchrittProzent)).join(''),
        { titel: `Ministerien <small>(je Schritt ${hh.ministerSchrittProzent} %, höchstens ±${hh.ministerMaxProzent} %)</small>` }),
      einnahmen: () => karte(zeile('steuern', `Steuern (${partei(verteilung.finanzen).name}, Finanzen)`, partei(verteilung.finanzen).farbe, v.steuern, entwurf.steuerStufe, maxSteuer, hh.steuerSchrittProzent)
        + `<p><small>Steueränderungen brauchen die Mehrheit im Bundesrat.</small></p>`, { titel: 'Steuern' }),
      abstimmungen: () => karte(abstimmungHtml(v.bundestag, 'Bundestag über den Haushalt', true), { titel: 'Bundestag' })
        + karte(bundesratHtml(bundesratAbstimmung(koalitionsParteien(zustand))), { titel: 'Bundesrat' }),
    }[entwurf.tab];
    el.innerHTML = `<div class="ansicht">
      <h1>Haushalt Jahr ${zustand.haushalt.jahr}</h1>
      ${hinweisHtml('regierung')}
      ${bearbeitbar ? '' : zustand.offenesEreignis ? '<div class="meldung">Erst auf das Ereignis in der Lage reagieren.</div>'
        : `<div class="meldung">Nur lesen: Der Haushalt wird im ${config.regierung.quartaleJeJahr}. Quartal aufgestellt. Gezeigt wird der laufende Haushalt.</div>`}
      ${tabs(TABS, entwurf.tab, 'Haushalt')}
      ${inhalt() || leer('Nichts zu zeigen.')}
    </div>`;

    el.querySelectorAll('[data-tab]').forEach((t) => t.addEventListener('click', () => ((entwurf.tab = t.dataset.tab), zeichne(), el.querySelector(`[data-tab="${t.dataset.tab}"]`).focus())));
    el.querySelectorAll('[data-key]').forEach((knopf) =>
      knopf.addEventListener('click', () => {
        if (knopf.getAttribute('aria-disabled') === 'true') return;
        const d = Number(knopf.dataset.dir);
        if (knopf.dataset.key === 'steuern') entwurf.steuerStufe += d;
        else entwurf.stufen[knopf.dataset.key] = (entwurf.stufen[knopf.dataset.key] ?? 0) + d;
        zeichne();
        // Fokus zurück auf denselben Knopf, sonst springt er bei jedem Klick nach oben
        el.querySelector(`[data-key="${knopf.dataset.key}"][data-dir="${d}"]`).focus();
      }),
    );
    el.querySelector('#beschliessen')?.addEventListener('click', () => onBeschliessen({ stufen: { ...entwurf.stufen }, steuerStufe: entwurf.steuerStufe }));
  }
  zeichne();
}
