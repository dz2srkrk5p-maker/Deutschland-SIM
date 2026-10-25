// Haltung der Verbände zu Steueränderungen (freigegeben 2026-10-25): abgeleitet aus der Gesamtwirkung des Entwurfs auf
// die vertretene Gruppe bzw. das Problem (config.verbaendeSteuern). Wirkt beim Haushaltsbeschluss nur aufs Kapital.
import { config } from '../data/config.js';
import { akteure } from '../data/reformwege.js';

const vs = config.verbaendeSteuern;
const r2 = (x) => Math.round(x * 100) / 100 + 0;

// wirkung: { gruppen, probleme } wie aus entwurfWirkung. Liefert je Verband haltung (null = keine Haltung) und kapital.
export function verbaendeZuSteuern(wirkung) {
  return akteure.map((akteur) => {
    const q = vs.quellen[akteur.id];
    if (!q) return { akteur, haltung: null, kapital: 0 };
    const roh = (q.gruppe ? wirkung.gruppen?.[q.gruppe] : wirkung.probleme?.[q.problem]) ?? 0;
    const haltung = r2(Math.max(-2, Math.min(2, roh / q.teiler)));
    const kapital = haltung <= vs.dagegenAb ? -vs.kapitalDagegen : haltung >= vs.dafuerAb ? vs.kapitalDafuer : 0;
    return { akteur, haltung, kapital };
  });
}

export const verbaendeKapital = (liste) => liste.reduce((s, v) => s + v.kapital, 0);
