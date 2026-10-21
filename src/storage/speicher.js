import { speichern, laden } from '../engine/state.js';

// Ein Spielstand im Browser (localStorage): Zustand plus Protokoll für die Anzeige.
const ZUSTAND = 'desim-zustand';
const PROTOKOLL = 'desim-protokoll';

// speicher: standardmäßig localStorage, in Tests ersetzbar
export function spielSichern(zustand, protokoll, speicher = globalThis.localStorage) {
  try {
    speicher.setItem(ZUSTAND, speichern(zustand));
    speicher.setItem(PROTOKOLL, JSON.stringify(protokoll));
  } catch {
    // Speicher voll oder gesperrt (z. B. privates Fenster): Spiel läuft ohne Sichern weiter
  }
}

// Gespeichertes Spiel oder null. Kaputte oder veraltete Spielstände werden verworfen statt weitergespielt.
export function spielLaden(speicher = globalThis.localStorage) {
  try {
    const text = speicher.getItem(ZUSTAND);
    if (!text) return null;
    return { zustand: laden(text), protokoll: JSON.parse(speicher.getItem(PROTOKOLL) ?? '[]') };
  } catch {
    spielLoeschen(speicher);
    return null;
  }
}

export function spielLoeschen(speicher = globalThis.localStorage) {
  try {
    speicher.removeItem(ZUSTAND);
    speicher.removeItem(PROTOKOLL);
  } catch {
    // nichts zu tun
  }
}

// Schalter für die Erklärtexte, unabhängig vom Spielstand. Ohne Eintrag oder bei gesperrtem Speicher: an.
const HINWEISE = 'desim-hinweise';

export function hinweiseAn(speicher = globalThis.localStorage) {
  try {
    return speicher.getItem(HINWEISE) !== 'aus';
  } catch {
    return true;
  }
}

export function hinweiseSetzen(an, speicher = globalThis.localStorage) {
  try {
    speicher.setItem(HINWEISE, an ? 'an' : 'aus');
  } catch {
    // gesperrt: Schalter wird nicht gemerkt, Spiel läuft weiter
  }
}
