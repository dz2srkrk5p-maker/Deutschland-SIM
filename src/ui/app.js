import { neuesSpiel, seedAusAdresse } from '../engine/state.js';
import { wahlkampfWoche } from '../engine/wahlkampf.js';
import { verhandeln } from '../engine/koalition.js';
import { startScreen } from './screens/start.js';
import { wahlkampfScreen } from './screens/wahlkampf.js';
import { bestaetigen } from '../engine/kabinett.js';
import { koalitionScreen } from './screens/koalition.js';
import { kabinettScreen } from './screens/kabinett.js';
import { haushaltBeschliessen } from '../engine/haushalt.js';
import { haushaltScreen } from './screens/haushalt.js';
import { endeScreen } from './screens/ende.js';
import { spielSichern, spielLaden, spielLoeschen, hinweiseSetzen } from '../storage/speicher.js';

const el = document.querySelector('#app');
const ansage = document.querySelector('#ansage');
let zustand = null;
let protokoll = [];
// Geteilter Link ?seed=… (F07): einmal lesen, dann aus der Adresse entfernen, damit Neuladen nicht erneut startet
let link = null;
if (new URLSearchParams(location.search).has('seed')) {
  const seed = seedAusAdresse(location.search);
  if (seed !== null) link = { seed, bestaetigt: false };
  history.replaceState(null, '', location.pathname);
}

function zeichne() {
  if (!zustand) {
    return startScreen(el, {
      gespeichert: spielLaden()?.zustand ?? null,
      link,
      onStart: starten,
      onWeiter: weiterspielen,
      onLinkJa: () => ((link.bestaetigt = true), zeichne(), fokusOben()),
      onLinkNein: () => ((link = null), weiterspielen()),
    });
  }
  if (zustand.phase === 'wahlkampf') return wahlkampfScreen(el, zustand, protokoll, { onAktion: ausfuehren(wahlkampfWoche) });
  if (zustand.phase === 'koalition') return koalitionScreen(el, zustand, protokoll, { onVerhandeln: ausfuehren(verhandeln) });
  if (zustand.phase === 'kabinett') return kabinettScreen(el, zustand, protokoll, { onBestaetigen: ausfuehren(bestaetigen) });
  if (zustand.phase === 'regierung') return haushaltScreen(el, zustand, protokoll, { onBeschliessen: ausfuehren(haushaltBeschliessen) });
  return endeScreen(el, zustand, protokoll, { onNeu: () => (spielLoeschen(), (zustand = null), zeichne(), fokusOben()) });
}

// Nach dem Neuzeichnen ist das fokussierte Element weg (Fokus auf body). Nach einer Aktion daher auf die Überschrift, nicht beim ersten Laden.
function fokusOben() {
  const h1 = el.querySelector('h1');
  h1.tabIndex = -1;
  h1.focus();
}

function starten(parteiId) {
  // Zufall außerhalb der Engine ist erlaubt: nur der Seed für ein neues Spiel (außer er kommt aus einem Link)
  zustand = neuesSpiel(parteiId, link ? link.seed : Math.floor(Math.random() * 2 ** 31));
  link = null;
  protokoll = [];
  spielSichern(zustand, protokoll);
  zeichne();
  fokusOben();
}

function weiterspielen() {
  ({ zustand, protokoll } = spielLaden());
  zeichne();
  fokusOben();
}

// Engine-Aktion ausführen, Zustand und Protokoll übernehmen, automatisch sichern, neu zeichnen
const ausfuehren = (aktion) => (params) => {
  const ergebnis = aktion(zustand, params);
  zustand = ergebnis.state;
  protokoll = [...protokoll, ...ergebnis.ereignisse];
  spielSichern(zustand, protokoll);
  zeichne();
  fokusOben();
  // Screenreader: nur den neuesten Eintrag ansagen. Erst leeren, damit auch ein gleicher Text erneut angesagt wird.
  ansage.textContent = '';
  if (ergebnis.ereignisse.length) setTimeout(() => (ansage.textContent = ergebnis.ereignisse.at(-1)), 50);
};

// Hinweise aus-/einblenden (Knöpfe aus hinweis.js und start.js). Ausblenden entfernt nur die Box, damit z. B. Haushaltseingaben bleiben.
el.addEventListener('click', (e) => {
  const knopf = e.target.closest('[data-hinweise]');
  if (!knopf) return;
  const an = knopf.dataset.hinweise === 'an';
  hinweiseSetzen(an);
  // Startbildschirm neu zeichnen, damit dort der Knopf zum Wiedereinblenden erscheint
  if (an || !zustand) zeichne();
  else knopf.closest('.hinweis').remove();
  fokusOben();
});

zeichne();
