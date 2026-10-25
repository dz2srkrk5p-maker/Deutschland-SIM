import { describe, it, expect } from 'vitest';
import { neuesSpiel, laden, ZUSTAND_VERSION } from '../src/engine/state.js';
import { stufenRegeln, systemAn, spielstufen } from '../src/engine/spielstufe.js';
import { config } from '../src/data/config.js';

describe('Spielstufen (Etappe 0c)', () => {
  it('neues Spiel ohne Angabe läuft auf der Standardstufe', () => {
    expect(neuesSpiel('spd', 1).stufe).toBe(config.spielstufen.standard);
  });
  it('gewählte Stufe steht im Spielstand und bestimmt die Schalter', () => {
    const z = neuesSpiel('spd', 1, 3);
    expect(z.stufe).toBe(3);
    expect(stufenRegeln(z).name).toBe('Erfahren');
    expect(systemAn(z, 'grossprojekte')).toBe(true);
    expect(systemAn(neuesSpiel('spd', 1, 1), 'ursachen')).toBe(false);
    expect(stufenRegeln(neuesSpiel('spd', 1, 1)).wegeJeWeiche).toBe(2);
    expect(systemAn(neuesSpiel('spd', 1, 4), 'zweiterWeg')).toBe(true);
    expect(systemAn(neuesSpiel('spd', 1, 4), 'kurswechsel')).toBe(false);
  });
  it('unbekannte Stufe wird abgelehnt', () => {
    expect(() => neuesSpiel('spd', 1, 5)).toThrow();
    expect(() => neuesSpiel('spd', 1, 0)).toThrow();
  });
  it('vier Stufen, jede höhere hat mindestens die Systeme der vorigen (außer Kurswechsel ↔ zweiter Weg)', () => {
    expect(spielstufen).toEqual([1, 2, 3, 4]);
    const systeme = ['ursachen', 'generationen', 'wertverlust', 'grossprojekte', 'bestaende', 'altersgruppen'];
    for (let i = 1; i < spielstufen.length; i++) {
      for (const s of systeme) if (config.spielstufen.stufen[i][s]) expect(config.spielstufen.stufen[i + 1][s]).toBe(true);
    }
  });
  it('Migration 23 → 24: alte Partien laufen als Stufe 2 weiter', () => {
    const { stufe, ...alt } = neuesSpiel('union', 5);
    const z = laden(JSON.stringify({ ...alt, version: 23 }));
    expect(z.version).toBe(ZUSTAND_VERSION);
    expect(z.stufe).toBe(2);
  });
});
