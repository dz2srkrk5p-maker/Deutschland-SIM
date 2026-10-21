import { config } from '../data/config.js';
import { parteien } from '../data/parteien.js';
import { zufall } from './rng.js';
import { wahl } from './wahl.js';
import { mitVerlauf } from './state.js';

const wk = config.wahlkampf;
const name = (id) => parteien.find((p) => p.id === id).name;
const pp = (wert) => (wert >= 0 ? '+' : '−') + Math.abs(wert).toLocaleString('de-DE', { maximumFractionDigits: 2 });

export const AKTIONEN = ['plakate', 'kundgebung', 'angriff'];

// Feste Änderungen für einzelne Parteien; was sie gewinnen oder verlieren, tragen die übrigen
// Parteien im Verhältnis ihrer Größe. Kein Anteil fällt unter 0.
export function umverteilen(anteile, feste) {
  const neu = { ...anteile };
  let netto = 0;
  for (const [id, delta] of Object.entries(feste)) {
    neu[id] = Math.max(0, anteile[id] + delta);
    netto += neu[id] - anteile[id];
  }
  const uebrige = Object.keys(anteile).filter((id) => !(id in feste));
  const summe = uebrige.reduce((s, id) => s + anteile[id], 0);
  for (const id of uebrige) {
    const teil = summe > 0 ? anteile[id] / summe : 1 / uebrige.length;
    neu[id] = Math.max(0, anteile[id] - netto * teil);
  }
  return neu;
}

// Anteil der vollen Wirkung, wenn diese Aktion jetzt gewählt wird: sinkt mit jeder Wiederholung in Folge (F08)
export function ertragFaktor(zustand, aktion) {
  const wiederholungen = zustand.wahlkampfSerie?.aktion === aktion ? zustand.wahlkampfSerie.anzahl : 0;
  return Math.max(wk.mindestFaktor, 1 - wk.abnahmeJeWiederholung * wiederholungen);
}

// Wirkung einer Aktion vor der wöchentlichen Schwankung. faktor: abnehmender Ertrag, wirkt auf alle festen Änderungen.
export function wirkung(anteile, spielerId, { aktion, ziel }, rngZustand, faktor = 1) {
  if (aktion === 'plakate') {
    const gewinn = wk.plakateGewinn * faktor;
    return { anteile: umverteilen(anteile, { [spielerId]: gewinn }), rngZustand, text: `Plakate und Werbung: ${pp(gewinn)}` };
  }
  if (aktion === 'kundgebung') {
    const r = zufall(rngZustand);
    const delta = (wk.kundgebungMin + r.wert * (wk.kundgebungMax - wk.kundgebungMin)) * faktor;
    return { anteile: umverteilen(anteile, { [spielerId]: delta }), rngZustand: r.rngZustand, text: `Großkundgebung: ${pp(delta)}` };
  }
  if (aktion === 'angriff') {
    const verlust = Math.min(wk.angriffZielVerlust * faktor, anteile[ziel]);
    const gewinn = Math.min(wk.angriffEigenGewinn * faktor, verlust);
    return {
      anteile: umverteilen(anteile, { [ziel]: -verlust, [spielerId]: gewinn }),
      rngZustand,
      text: `Angriff auf ${name(ziel)}: ${name(ziel)} ${pp(-verlust)}, du ${pp(gewinn)}`,
    };
  }
  throw new Error(`Unbekannte Aktion: ${aktion}`);
}

// Jede Partei schwankt zufällig um bis zu ±schwankungMax, danach zurück auf 100 %.
export function schwankung(anteile, rngZustand) {
  const neu = {};
  for (const p of parteien) {
    const r = zufall(rngZustand);
    rngZustand = r.rngZustand;
    neu[p.id] = Math.max(0, anteile[p.id] + (r.wert * 2 - 1) * wk.schwankungMax);
  }
  const summe = Object.values(neu).reduce((s, a) => s + a, 0);
  for (const id in neu) neu[id] = (neu[id] * 100) / summe;
  return { anteile: neu, rngZustand };
}

// Auf ganze Tausendstel runden, damit gespeicherte Werte genau das sind, womit die Wahl rechnet.
// Der Rundungsrest (wenige Tausendstel) geht an die größte Partei, damit die Summe genau 100 ist.
export function runden(anteile) {
  const t = Object.fromEntries(Object.entries(anteile).map(([id, a]) => [id, Math.round(a * 1000)]));
  const groesste = Object.keys(t).reduce((a, b) => (t[b] > t[a] ? b : a));
  t[groesste] += 100000 - Object.values(t).reduce((s, x) => s + x, 0);
  return Object.fromEntries(Object.entries(t).map(([id, x]) => [id, x / 1000]));
}

// Aktion: eine Wahlkampfwoche. Nach der letzten Woche folgt automatisch die Wahl.
export function wahlkampfWoche(zustand, params) {
  if (zustand.phase !== 'wahlkampf') throw new Error('Kein Wahlkampf');
  if (!AKTIONEN.includes(params.aktion)) throw new Error(`Unbekannte Aktion: ${params.aktion}`);
  if (params.aktion === 'angriff') {
    const ziel = parteien.find((p) => p.id === params.ziel);
    if (!ziel || ziel.sonstige || ziel.id === zustand.spielerParteiId) throw new Error(`Ungültiges Angriffsziel: ${params.ziel}`);
  }

  const faktor = ertragFaktor(zustand, params.aktion);
  const w = wirkung(zustand.anteile, zustand.spielerParteiId, params, zustand.rngZustand, faktor);
  const s = schwankung(w.anteile, w.rngZustand);
  const woche = zustand.wahlkampfWoche;
  const anzahl = zustand.wahlkampfSerie?.aktion === params.aktion ? zustand.wahlkampfSerie.anzahl + 1 : 1;
  const wahlkampfSerie = { aktion: params.aktion, anzahl };
  // nach der letzten Woche folgt die Wahl mit genau diesen Anteilen: Eintrag als Wahl markieren
  const state = mitVerlauf({ ...zustand, anteile: runden(s.anteile), rngZustand: s.rngZustand, wahlkampfWoche: woche + 1, wahlkampfSerie }, woche >= wk.wochen);
  const abnahme = faktor < 1 ? ` (${anzahl}. Mal in Folge, ${Math.round(faktor * 100)} % Wirkung)` : '';
  const ereignisse = [`Woche ${woche}: ${w.text}${abnahme}`];

  if (woche < wk.wochen) return { state, ereignisse };
  const ergebnis = wahl(state);
  return { state: ergebnis.state, ereignisse: [...ereignisse, ...ergebnis.ereignisse] };
}
