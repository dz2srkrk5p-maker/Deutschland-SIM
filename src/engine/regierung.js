import { config } from '../data/config.js';
import { monatsname } from '../data/kalender.js';
import { problemeMonat } from './probleme.js';
import { reformwegeMonat } from './reformwege.js';
import { ereignisZiehen } from './ereignisse.js';
import { koalitionPruefen } from './haushalt.js';
import { verfahrenMonat } from './verfahren.js';
import { landtagswahlenMonat } from './landtagswahlen.js';
import { zurueckInDenWahlkampf } from './state.js';
import { epochenMonat, zeitpunkt } from './epochen.js';
import { generationenMonat } from './generationen.js';

const letzter = config.regierung.monateJeJahr;

// Regierungsjahr in Monaten (seit 2026-10-25, vorher Quartale, F12). Im letzten Monat wird der Haushalt beschlossen
// (haushaltBeschliessen); danach endet auch dieser Monat, und das nächste Jahr beginnt mit Monat 1.
export const haushaltsMonat = (zustand) => zustand.monat === letzter;

// Monatsende ohne Monatswechsel und ohne Ereignis: Probleme entwickeln sich, Lösungen und Reformwege werden fertig,
// Verfahren, Landtagswahlen, Ultimaten und Koalitionsbruch. Auch nach dem Haushalt im letzten Monat.
export function monatsabschluss(zustand) {
  const entwicklung = problemeMonat(zustand);
  const umsetzung = reformwegeMonat(entwicklung.state);
  const urteile = verfahrenMonat(umsetzung.state);
  const land = landtagswahlenMonat(urteile.state);
  const lage = koalitionPruefen(land.state);
  // Epochen (Etappe 2): für den Monat, der jetzt beginnt (nach dem Dezember Januar des nächsten Jahres)
  const dez = zustand.monat === letzter;
  const [jahr, monat] = dez ? [zustand.jahr + 1, 1] : [zustand.jahr, zustand.monat + 1];
  const zeit = epochenMonat(lage.state, jahr, monat);
  const gen = generationenMonat(zeit.state, zeitpunkt(jahr, monat)); // Generationen (Etappe 5)
  return {
    state: gen.state, neuwahl: lage.neuwahl,
    ereignisse: [...entwicklung.ereignisse, ...umsetzung.ereignisse, ...urteile.ereignisse, ...land.ereignisse, ...lage.ereignisse, ...zeit.ereignisse, ...gen.ereignisse],
  };
}

// Aktion: Monat beenden, weiter zum nächsten. Nicht im Haushaltsmonat, dort endet das Jahr mit dem Haushalt.
export function monatBeenden(zustand) {
  if (zustand.phase !== 'regierung') throw new Error('Keine Regierung im Amt');
  if (haushaltsMonat(zustand)) throw new Error(`Im ${monatsname(letzter)} wird der Haushalt beschlossen`);
  if (zustand.offenesEreignis) throw new Error('Erst auf das Ereignis reagieren');
  const ende = monatsabschluss(zustand);
  const vorher = [`${monatsname(zustand.monat)} im Haushaltsjahr ${zustand.haushalt.jahr} vorbei`, ...ende.ereignisse];
  if (ende.neuwahl) return { state: zurueckInDenWahlkampf(ende.state), ereignisse: vorher };
  const neu = ereignisZiehen({ ...ende.state, monat: zustand.monat + 1 });
  return { state: neu.state, ereignisse: [...vorher, ...neu.ereignisse] };
}
