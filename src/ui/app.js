import { neuesSpiel } from '../engine/state.js';
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
let zustand = null;
let protokoll = [];

function zeichne() {
  if (!zustand) return startScreen(el, { gespeichert: spielLaden()?.zustand ?? null, onStart: starten, onWeiter: weiterspielen });
  if (zustand.phase === 'wahlkampf') return wahlkampfScreen(el, zustand, protokoll, { onAktion: ausfuehren(wahlkampfWoche) });
  if (zustand.phase === 'koalition') return koalitionScreen(el, zustand, protokoll, { onVerhandeln: ausfuehren(verhandeln) });
  if (zustand.phase === 'kabinett') return kabinettScreen(el, zustand, protokoll, { onBestaetigen: ausfuehren(bestaetigen) });
  if (zustand.phase === 'regierung') return haushaltScreen(el, zustand, protokoll, { onBeschliessen: ausfuehren(haushaltBeschliessen) });
  return endeScreen(el, zustand, protokoll, { onNeu: () => (spielLoeschen(), (zustand = null), zeichne()) });
}

function starten(parteiId) {
  // Zufall außerhalb der Engine ist erlaubt: nur der Seed für ein neues Spiel
  zustand = neuesSpiel(parteiId, Math.floor(Math.random() * 2 ** 31));
  protokoll = [];
  spielSichern(zustand, protokoll);
  zeichne();
}

function weiterspielen() {
  ({ zustand, protokoll } = spielLaden());
  zeichne();
}

// Engine-Aktion ausführen, Zustand und Protokoll übernehmen, automatisch sichern, neu zeichnen
const ausfuehren = (aktion) => (params) => {
  const ergebnis = aktion(zustand, params);
  zustand = ergebnis.state;
  protokoll = [...protokoll, ...ergebnis.ereignisse];
  spielSichern(zustand, protokoll);
  zeichne();
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
});

zeichne();
