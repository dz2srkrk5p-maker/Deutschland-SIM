// Spielstufe der Partie (Etappe 0c): Regeln je Stufe stehen in config.spielstufen.
import { config } from '../data/config.js';

export const spielstufen = Object.keys(config.spielstufen.stufen).map(Number);

// Regeln der Stufe dieser Partie
export const stufenRegeln = (zustand) => config.spielstufen.stufen[zustand.stufe ?? config.spielstufen.standard];

// Spielt ein Teil des Epochen-Systems in dieser Partie mit? (z. B. 'grossprojekte')
export const systemAn = (zustand, system) => Boolean(stufenRegeln(zustand)[system]);
