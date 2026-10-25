import { config } from '../data/config.js';
import { parteien } from '../data/parteien.js';
import { ereignisse } from '../data/ereignisse.js';
import { probleme } from '../data/probleme.js';
import { zufall } from './rng.js';
import { umverteilen, runden } from './wahlkampf.js';
import { mitVerlauf } from './state.js';
import { umfrageBuchen } from './umfragebilanz.js';
import { richtungsprofil } from './profil.js';

const ereignis = (id) => ereignisse.find((e) => e.id === id);
const name = (id) => parteien.find((p) => p.id === id).name;
const zahl = (x) => (x > 0 ? '+' : '−') + Math.abs(x).toLocaleString('de-DE', { maximumFractionDigits: 2 });

export const offenesEreignis = (zustand) => (zustand.offenesEreignis ? ereignis(zustand.offenesEreignis) : null);

// Folgen einer Möglichkeit, aufgelöst auf Parteien: { parteien: { parteiId: Punkte }, probleme: { problemId: Punkte } }
export function folgen(zustand, ereignisId, wahl) {
  const f = ereignis(ereignisId).moeglichkeiten[wahl].folgen;
  const wirkung = {};
  const dazu = (id, wert) => (wirkung[id] = (wirkung[id] ?? 0) + wert);
  if (f.kanzler) dazu(zustand.kanzlerParteiId, f.kanzler);
  if (f.partner) zustand.koalition.partner.forEach((id) => dazu(id, f.partner));
  for (const [ministerium, wert] of Object.entries(f.ministerium ?? {})) dazu(zustand.kabinett.verteilung[ministerium], wert);
  return { parteien: wirkung, probleme: f.probleme ?? {} };
}

// Beim Quartalswechsel (F14): mit fester Chance ein noch nicht dagewesenes, passendes Ereignis ziehen.
export function ereignisZiehen(zustand) {
  const ob = zufall(zustand.rngZustand);
  if (ob.wert >= config.ereignisse.chanceJeQuartal) return { state: { ...zustand, rngZustand: ob.rngZustand }, ereignisse: [] };
  // nur Ereignisse, deren Problem spürbar ist (System 3), dazu eigene Bedingungen; kontext.profil: Richtungsprofil (System 1)
  const kontext = { profil: richtungsprofil(zustand) };
  const moeglich = ereignisse.filter((e) => !zustand.ereignisseWahlperiode.includes(e.id) && (!e.problem || zustand.probleme[e.problem].wert >= 30) && (!e.bedingung || e.bedingung(zustand, kontext)));
  if (!moeglich.length) return { state: { ...zustand, rngZustand: ob.rngZustand }, ereignisse: [] };
  const welches = zufall(ob.rngZustand);
  const e = moeglich[Math.floor(welches.wert * moeglich.length)];
  return { state: { ...zustand, rngZustand: welches.rngZustand, offenesEreignis: e.id }, ereignisse: [`Ereignis: ${e.titel}`] };
}

// Aktion: auf das offene Ereignis reagieren. Folgen ohne Zufall, über umverteilen wie beim Haushalt.
export function ereignisEntscheiden(zustand, { wahl }) {
  const e = offenesEreignis(zustand);
  if (!e) throw new Error('Kein offenes Ereignis');
  if (!e.moeglichkeiten[wahl]) throw new Error(`Ungültige Wahl: ${wahl}`);
  const f = folgen(zustand, e.id, wahl);
  const neu = { ...zustand.probleme };
  for (const [id, d] of Object.entries(f.probleme)) neu[id] = { ...neu[id], wert: Math.max(0, Math.min(100, neu[id].wert + d)) };
  const basis = { ...zustand, probleme: neu, offenesEreignis: null, ereignisseWahlperiode: [...zustand.ereignisseWahlperiode, e.id] };
  const state = Object.keys(f.parteien).length
    ? umfrageBuchen(zustand, mitVerlauf({ ...basis, anteile: runden(umverteilen(zustand.anteile, f.parteien)) }), Object.entries(f.parteien).map(([id, w]) => ({ ursache: `Ereignis: ${e.titel}`, partei: id, wert: w })))
    : basis;
  const teile = [
    ...Object.entries(f.parteien).map(([id, w]) => `${name(id)} ${zahl(w)}`),
    ...Object.entries(f.probleme).map(([id, d]) => `${probleme.find((p) => p.id === id).name} ${zahl(d)}`),
  ];
  return { state, ereignisse: [`${e.titel}: „${e.moeglichkeiten[wahl].text}“${teile.length ? ` (${teile.join(', ')})` : ''}`] };
}
