import { config } from '../data/config.js';
import { problemeQuartal } from './probleme.js';
import { reformwegeQuartal } from './reformwege.js';
import { ereignisZiehen } from './ereignisse.js';
import { koalitionPruefen } from './haushalt.js';
import { verfahrenQuartal } from './verfahren.js';
import { landtagswahlenQuartal } from './landtagswahlen.js';
import { wahlperiodeEnde } from './regierungsbilanz.js';

const letztes = config.regierung.quartaleJeJahr;

// Regierungsjahr in Quartalen (F12). Im letzten Quartal wird der Haushalt beschlossen (haushaltBeschliessen),
// danach beginnt das nächste Jahr mit Quartal 1.
export const haushaltsQuartal = (zustand) => zustand.quartal === letztes;

// Aktion: Quartal beenden, weiter zum nächsten. Nicht im Haushaltsquartal, dort endet das Jahr mit dem Haushalt.
export function quartalBeenden(zustand) {
  if (zustand.phase !== 'regierung') throw new Error('Keine Regierung im Amt');
  if (haushaltsQuartal(zustand)) throw new Error('Im letzten Quartal wird der Haushalt beschlossen');
  if (zustand.offenesEreignis) throw new Error('Erst auf das Ereignis reagieren');
  // Probleme (System 3) entwickeln sich, Lösungen werden fertig; danach vielleicht ein Ereignis (F14)
  const entwicklung = problemeQuartal(zustand);
  const umsetzung = reformwegeQuartal(entwicklung.state);
  // Ultimaten und Koalitionsbruch nach Fristablauf (Block 2)
  const urteile = verfahrenQuartal(umsetzung.state);
  const land = landtagswahlenQuartal(urteile.state);
  const lage = koalitionPruefen(land.state);
  const vorher = [`Haushaltsjahr ${zustand.haushalt.jahr}, Quartal ${zustand.quartal} vorbei`, ...entwicklung.ereignisse, ...umsetzung.ereignisse, ...urteile.ereignisse, ...land.ereignisse, ...lage.ereignisse];
  if (lage.neuwahl) {
    const ende = wahlperiodeEnde(lage.state);
    return { state: ende.state, ereignisse: [...vorher, ...ende.ereignisse] };
  }
  const neu = ereignisZiehen({ ...lage.state, quartal: zustand.quartal + 1 });
  return { state: neu.state, ereignisse: [...vorher, ...neu.ereignisse] };
}
