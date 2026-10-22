import { config } from '../data/config.js';
import { druckSteigt } from './reformen.js';
import { ereignisZiehen } from './ereignisse.js';

const letztes = config.regierung.quartaleJeJahr;

// Regierungsjahr in Quartalen (F12). Im letzten Quartal wird der Haushalt beschlossen (haushaltBeschliessen),
// danach beginnt das nächste Jahr mit Quartal 1.
export const haushaltsQuartal = (zustand) => zustand.quartal === letztes;

// Aktion: Quartal beenden, weiter zum nächsten. Nicht im Haushaltsquartal, dort endet das Jahr mit dem Haushalt.
export function quartalBeenden(zustand) {
  if (zustand.phase !== 'regierung') throw new Error('Keine Regierung im Amt');
  if (haushaltsQuartal(zustand)) throw new Error('Im letzten Quartal wird der Haushalt beschlossen');
  if (zustand.offenesEreignis) throw new Error('Erst auf das Ereignis reagieren');
  // Probleme (F13): Druck steigt, brennende Probleme kosten die Kanzlerpartei; danach vielleicht ein Ereignis (F14)
  const druck = druckSteigt(zustand);
  const neu = ereignisZiehen({ ...druck.state, quartal: zustand.quartal + 1 });
  return {
    state: neu.state,
    ereignisse: [`Haushaltsjahr ${zustand.haushalt.jahr}, Quartal ${zustand.quartal} vorbei`, ...druck.ereignisse, ...neu.ereignisse],
  };
}
