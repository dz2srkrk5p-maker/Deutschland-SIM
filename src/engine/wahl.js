import { config } from '../data/config.js';
import { parteien } from '../data/parteien.js';
import { sainteLague } from './hoechstzahl.js';
import { regierungMoeglich } from './koalition.js';
import { inDieOpposition } from './opposition.js';

// Prozentwerte haben höchstens 3 Nachkommastellen; als ganze Tausendstel gerechnet gibt es keine Rundungsfehler.
const inTausendstel = (prozent) => Math.round(prozent * 1000);
const runden3 = (prozent) => inTausendstel(prozent) / 1000;

// Kommt eine Partei mit diesem Anteil in den Bundestag? (Auch für die Anzeige im Wahlkampf.)
export function ueberHuerde(partei, anteil) {
  return !partei.sonstige && inTausendstel(anteil) >= inTausendstel(config.sperrklauselProzent);
}

// Aktion Bundestagswahl: aktuelle Anteile → Sitze, danach Phase Koalition (oder Opposition mit der Regierung der anderen,
// wenn der Spieler keine Regierung bilden kann).
export function wahl(zustand) {
  const stimmen = {};
  for (const p of parteien) {
    if (ueberHuerde(p, zustand.anteile[p.id])) stimmen[p.id] = inTausendstel(zustand.anteile[p.id]);
  }
  if (Object.keys(stimmen).length === 0) throw new Error('Keine Partei über der Sperrklausel');

  const { sitze, rngZustand } = sainteLague(stimmen, config.sitzeBundestag, zustand.rngZustand);
  const ergebnis = parteien.filter((p) => sitze[p.id]).map((p) => `${p.name} ${sitze[p.id]}`);
  const eigenerAnteil = zustand.anteile[zustand.spielerParteiId];
  const statistik = { ...zustand.statistik, besteWahl: Math.max(zustand.statistik.besteWahl ?? 0, eigenerAnteil) };
  // Vergleich mit der vorigen Wahl der Partie, bei der ersten mit dem Ergebnis 2025 (Startwerte)
  const vorher = zustand.wahlergebnis?.anteile ?? Object.fromEntries(parteien.map((p) => [p.id, p.startanteil]));
  const wahlergebnis = { anteile: zustand.anteile, vorher, wahlkampf: runden3(eigenerAnteil - zustand.wahlkampfStart) };
  const state = { ...zustand, sitze, rngZustand, statistik, wahlergebnis, phase: 'koalition', abgelehnt: [], koalition: null, kabinett: null };
  const ereignisse = [`Bundestagswahl: ${ergebnis.join(', ')}`];
  if (regierungMoeglich(state)) return { state, ereignisse };
  return inDieOpposition(state, [...ereignisse, 'Keine eigene Regierung möglich: Opposition']);
}
