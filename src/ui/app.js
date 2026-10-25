import './stil.css';
import { neuesSpiel, seedAusAdresse } from '../engine/state.js';
import { wahlkampfWoche } from '../engine/wahlkampf.js';
import { verhandeln, minderheitAntreten } from '../engine/koalition.js';
import { bestaetigen } from '../engine/kabinett.js';
import { haushaltBeschliessen, zugestaendnis } from '../engine/haushalt.js';
import { quartalBeenden, haushaltsQuartal } from '../engine/regierung.js';
import { loesungStarten } from '../engine/probleme.js';
import { ereignisEntscheiden } from '../engine/ereignisse.js';
import { spielSichern, spielLaden, spielLoeschen, hinweiseSetzen, hinweiseAn } from '../storage/speicher.js';
import { shellHtml } from './shell.js';
import { badge, meldungHtml } from './components/basis.js';
import { teilenBinden } from './components/teilen.js';
import { startScreen } from './screens/start.js';
import { wahlkampfScreen } from './screens/wahlkampf.js';
import { wahlabendScreen } from './screens/wahlabend.js';
import { koalitionScreen } from './screens/koalition.js';
import { kabinettScreen } from './screens/kabinett.js';
import { lageScreen } from './screens/lage.js';
import { problemeScreen, warnZahl } from './screens/probleme.js';
import { reformenScreen } from './screens/reformen.js';
import { wegBeschliessen, richtungsprofil } from '../engine/reformwege.js';
import { profilHtml } from './components/profil.js';
import { karte } from './components/basis.js';
import { haushaltScreen } from './screens/haushalt.js';
import { parlamentScreen } from './screens/parlament.js';
import { chronikScreen } from './screens/chronik.js';
import { endeScreen } from './screens/ende.js';

const el = document.querySelector('#app');
const ansage = document.querySelector('#ansage');
let zustand = null;
let protokoll = [];
// Zustand der Oberfläche (nicht gespeichert, nicht im Spielstand): Bereich, Unterbereiche, Rückmeldung, Haushaltsentwurf
const ui = {
  bereich: 'lage',
  problem: null, // geöffnetes Problem im Bereich Probleme
  kategorie: null, // Filter im Bereich Probleme
  reformBereich: null, // geöffneter Bereich unter Reformen
  parlament: 'bundestag',
  chronik: 'verlauf',
  seite: 0,
  chronikOffen: false, // Chronik im geführten Ablauf und am Ende (über Spielmenü bzw. Knopf)
  wahlabendGesehen: false,
  meldung: null,
  entwurf: { jahr: null, stufen: {}, einnahmen: {}, ausgestaltung: {}, tab: 'ueberblick' },
};
// Geteilter Link ?seed=… (F07): einmal lesen, dann aus der Adresse entfernen, damit Neuladen nicht erneut startet
let link = null;
if (new URLSearchParams(location.search).has('seed')) {
  const seed = seedAusAdresse(location.search);
  if (seed !== null) link = { seed, bestaetigt: false };
  history.replaceState(null, '', location.pathname);
}

const neu = () => (ui.bereich = 'lage', ui.problem = null, ui.chronikOffen = false, ui.meldung = null);

function zeichne() {
  if (!zustand) {
    el.innerHTML = shellHtml(null);
    return startScreen(ansicht(), {
      gespeichert: spielLaden()?.zustand ?? null,
      link,
      onStart: starten,
      onWeiter: weiterspielen,
      onLinkJa: () => ((link.bestaetigt = true), zeichne(), fokusOben()),
      onLinkNein: () => ((link = null), weiterspielen()),
    });
  }
  const regiert = zustand.phase === 'regierung';
  const ernst = regiert ? warnZahl(zustand) : 0;
  const badges = regiert ? { lage: zustand.offenesEreignis ? badge('Ereignis', 'gelb') : '', probleme: ernst ? badge(String(ernst), 'rot') : '', haushalt: haushaltsQuartal(zustand) ? badge('fällig', 'gelb') : '' } : {};
  el.innerHTML = shellHtml(zustand, { aktiv: regiert ? ui.bereich : null, badges });
  el.querySelector('#meldung').innerHTML = meldungHtml(ui.meldung);
  menueBinden();
  const a = ansicht();
  const chronik = (onZurueck) => chronikScreen(a, zustand, protokoll, {
    tab: ui.chronik, seite: ui.seite, onZurueck,
    onTab: (t) => ((ui.chronik = t), (ui.seite = 0), zeichne(), fokusAuf(`[data-tab="${t}"]`)),
    onSeite: (s) => ((ui.seite = s), zeichne(), fokusOben()),
  });
  if (ui.chronikOffen && !regiert) return chronik(() => ((ui.chronikOffen = false), zeichne(), fokusOben()));

  if (zustand.phase === 'wahlkampf') return wahlkampfScreen(a, zustand, { onAktion: ausfuehren(wahlkampfWoche) });
  if (zustand.phase === 'koalition' && !ui.wahlabendGesehen) {
    return wahlabendScreen(a, zustand, { onWeiter: () => ((ui.wahlabendGesehen = true), (ui.meldung = null), zeichne(), fokusOben()) });
  }
  if (zustand.phase === 'koalition') {
    return koalitionScreen(a, zustand, {
      onVerhandeln: ausfuehren(verhandeln),
      onMinderheit: ausfuehren(minderheitAntreten),
      onWahlabend: () => ((ui.wahlabendGesehen = false), zeichne(), fokusOben()),
    });
  }
  if (zustand.phase === 'kabinett') return kabinettScreen(a, zustand, { onBestaetigen: ausfuehren(bestaetigen) });
  if (!regiert) return endeScreen(a, zustand, { onNeu: neuesSpielStarten, onChronik: () => ((ui.chronikOffen = true), zeichne(), fokusOben()) });

  if (ui.bereich === 'lage') {
    // „Zum Haushalt“ führt immer auf den Überblick mit dem Knopf zum Einbringen
    const onBereich = (b) => (b === 'haushalt' && (ui.entwurf.tab = 'ueberblick'), wechseln(b));
    // Richtungsprofil auf dem Dashboard (System 1)
    const zusatz = karte(`${profilHtml(richtungsprofil(zustand))}<div class="knoepfe"><button data-gehe="reformen">Zu den Reformen</button></div>`, { titel: 'Richtungsprofil' });
    const onProblem = (p) => (wechseln('probleme'), (ui.problem = p), zeichne(), fokusOben());
    return lageScreen(a, zustand, { onWeiter: ausfuehren(quartalBeenden), onEreignis: ausfuehren(ereignisEntscheiden), onZugestaendnis: ausfuehren(zugestaendnis), onBereich, onProblem, zusatz });
  }
  if (ui.bereich === 'reformen') {
    return reformenScreen(a, zustand, { auswahl: ui.reformBereich, onBeschliessen: ausfuehren(wegBeschliessen), onAuswahl: (b) => ((ui.reformBereich = b), zeichne(), fokusOben()) });
  }
  if (ui.bereich === 'probleme') {
    return problemeScreen(a, zustand, {
      auswahl: ui.problem, filter: ui.kategorie, onLoesung: ausfuehren(loesungStarten),
      onReformbereich: (b) => (wechseln('reformen'), (ui.reformBereich = b), zeichne(), fokusOben()),
      onAuswahl: (p) => ((ui.problem = p), zeichne(), fokusOben()),
      onFilter: (k) => ((ui.kategorie = k), zeichne(), fokusAuf(`[data-filter="${k ?? ''}"]`)),
    });
  }
  if (ui.bereich === 'haushalt') return haushaltScreen(a, zustand, { entwurf: ui.entwurf, onBeschliessen: ausfuehren(haushaltBeschliessen) });
  if (ui.bereich === 'parlament') return parlamentScreen(a, zustand, { tab: ui.parlament, onTab: (t) => ((ui.parlament = t), zeichne(), fokusAuf(`[data-tab="${t}"]`)) });
  return chronik(null);
}

const ansicht = () => el.querySelector('#ansicht');
const fokusAuf = (selektor) => el.querySelector(selektor)?.focus();
// Nach dem Neuzeichnen ist das fokussierte Element weg. Nach einer Aktion daher auf die Überschrift, nicht beim ersten Laden.
function fokusOben() {
  const h1 = el.querySelector('#ansicht h1');
  if (!h1) return;
  h1.tabIndex = -1;
  h1.focus();
}

function wechseln(bereich) {
  ui.bereich = bereich;
  ui.problem = null; // Probleme und Reformen beginnen über die Navigation immer mit der Übersicht
  ui.reformBereich = null;
  ui.meldung = null;
  zeichne();
  fokusOben();
}

function menueBinden() {
  const menue = el.querySelector('#menue');
  if (!menue) return;
  const bestaetigen = el.querySelector('#neu-bestaetigen');
  el.querySelector('#menue-auf').addEventListener('click', () => menue.showModal());
  teilenBinden(menue, zustand, 'menue-teilen');
  el.querySelectorAll('[data-menue]').forEach((k) => k.addEventListener('click', () => {
    const was = k.dataset.menue;
    if (was === 'zu') return menue.close();
    if (was === 'chronik') return ((ui.chronikOffen = true), zeichne(), fokusOben());
    if (was === 'hinweise') return (hinweiseSetzen(!hinweiseAn()), zeichne(), fokusOben());
    if (was === 'neu') return (menue.close(), bestaetigen.showModal());
    if (was === 'neu-nein') return bestaetigen.close();
    if (was === 'hilfe') return (menue.close(), el.querySelector('#hilfe').showModal());
    if (was === 'hilfe-zu') return el.querySelector('#hilfe').close();
    if (was === 'neu-ja') return neuesSpielStarten();
  }));
}

function neuesSpielStarten() {
  spielLoeschen();
  zustand = null;
  neu();
  zeichne();
  fokusOben();
}

function starten(parteiId) {
  // Zufall außerhalb der Engine ist erlaubt: nur der Seed für ein neues Spiel (außer er kommt aus einem Link)
  zustand = neuesSpiel(parteiId, link ? link.seed : Math.floor(Math.random() * 2 ** 31));
  link = null;
  protokoll = [];
  neu();
  spielSichern(zustand, protokoll);
  zeichne();
  fokusOben();
}

function weiterspielen() {
  ({ zustand, protokoll } = spielLaden());
  neu();
  // nach dem Laden mitten in der Regierungsbildung erst das Wahlergebnis zeigen
  ui.wahlabendGesehen = false;
  zeichne();
  fokusOben();
}

// Engine-Aktion ausführen, Zustand und Protokoll übernehmen, automatisch sichern, neu zeichnen.
// Wirft die Engine (ungültige Aktion), bleibt der Zustand unverändert und der Grund erscheint als Meldung.
const ausfuehren = (aktion) => (params) => {
  let ergebnis;
  try {
    ergebnis = aktion(zustand, params);
  } catch (fehler) {
    ui.meldung = { texte: [fehler.message], fehler: true };
    zeichne();
    fokusOben();
    return;
  }
  const vorher = zustand.phase;
  zustand = ergebnis.state;
  protokoll = [...protokoll, ...ergebnis.ereignisse];
  spielSichern(zustand, protokoll);
  if (zustand.phase !== vorher) {
    neu();
    if (zustand.phase === 'koalition') ui.wahlabendGesehen = false;
  }
  if (aktion === haushaltBeschliessen) Object.assign(ui.entwurf, { stufen: {}, einnahmen: {}, ausgestaltung: {}, kompromiss: false, tab: 'ueberblick' });
  ui.meldung = { texte: ergebnis.ereignisse, fehler: false };
  zeichne();
  fokusOben();
  // Screenreader: nur den neuesten Eintrag ansagen. Erst leeren, damit auch ein gleicher Text erneut angesagt wird.
  ansage.textContent = '';
  if (ergebnis.ereignisse.length) setTimeout(() => (ansage.textContent = ergebnis.ereignisse.at(-1)), 50);
};

// Klicks, die überall vorkommen: Hauptnavigation und Hinweise aus-/einblenden
el.addEventListener('click', (e) => {
  const bereich = e.target.closest('[data-bereich]');
  if (bereich) return wechseln(bereich.dataset.bereich);
  const knopf = e.target.closest('[data-hinweise]');
  if (!knopf) return;
  const an = knopf.dataset.hinweise === 'an';
  hinweiseSetzen(an);
  // Startbildschirm neu zeichnen, damit dort der Knopf zum Wiedereinblenden erscheint; sonst nur die Box entfernen (Eingaben bleiben)
  if (an || !zustand) zeichne();
  else knopf.closest('.hinweis').remove();
  fokusOben();
});

zeichne();
