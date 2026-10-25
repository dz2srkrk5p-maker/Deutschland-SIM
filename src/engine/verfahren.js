// Verfassungsrisiko für Steuern (Paket Klein, Feature 3): riskante Steueränderungen werden beklagt; nach einer Frist
// entscheidet das Gericht per Seed-Zufall mit der Chance aus src/data/einnahmen.js (Spielwerte, keine Rechtsauskunft).
// Gekippt: die Änderung wird zurückgenommen (Einnahmeausfall ab dann), die Kanzlerpartei verliert an Glaubwürdigkeit.
import { config } from '../data/config.js';
import { RECHTSARTEN } from '../data/einnahmen.js';
import { einnahmeart } from './einnahmen.js';
import { zufall } from './rng.js';
import { umverteilen, runden } from './wahlkampf.js';
import { mitVerlauf } from './state.js';
import { umfrageBuchen } from './umfragebilanz.js';

const vr = config.verfassungsrisiko;

// beim Haushaltsbeschluss: je Rechtsrisiko ein Verfahren, Urteil nach dauerQuartale Quartalen
export const verfahrenAnlegen = (zustand, risiken) => (risiken.length
  ? { ...zustand, verfahren: [...(zustand.verfahren ?? []), ...risiken.map((r) => ({ ...r, faellig: zustand.runde + vr.dauerQuartale }))] }
  : zustand);

// Rücknahme einer gekippten Änderung im Einnahmenstand
function zuruecknehmen(einnahmen, v) {
  if (v.typ === 'ausgestaltung') return { ...einnahmen, ausgestaltung: einnahmen.ausgestaltung.filter((id) => id !== v.id) };
  const p = einnahmeart(v.id).parameter;
  const min = Math.ceil((p.min - p.startwert) / p.schritt - 1e-9);
  const max = Math.floor((p.max - p.startwert) / p.schritt + 1e-9);
  const stufe = Math.max(min, Math.min(max, (einnahmen.stufen[v.id] ?? 0) - v.stufen));
  return { ...einnahmen, stufen: { ...einnahmen.stufen, [v.id]: stufe } };
}

// am Quartalsende: fällige Verfahren entscheiden
export function verfahrenQuartal(zustand) {
  const offen = zustand.verfahren ?? [];
  if (!offen.some((v) => v.faellig <= zustand.runde)) return { state: zustand, ereignisse: [] };
  let rngZustand = zustand.rngZustand;
  let einnahmen = zustand.haushalt.einnahmen;
  const ereignisse = [];
  const posten = [];
  for (const v of offen.filter((x) => x.faellig <= zustand.runde)) {
    const r = zufall(rngZustand);
    rngZustand = r.rngZustand;
    const art = RECHTSARTEN[v.art];
    if (r.wert < v.chance) {
      einnahmen = zuruecknehmen(einnahmen, v);
      posten.push({ ursache: `Verfassungsgericht kippt „${v.name}“`, partei: zustand.kanzlerParteiId, wert: -vr.verlustUmfrage });
      ereignisse.push(`Das Bundesverfassungsgericht kippt „${v.name}“ (${art.name}, ${art.grundlage}). Die Änderung wird zurückgenommen, die Einnahmen fallen ab jetzt weg.`);
    } else {
      ereignisse.push(`Das Bundesverfassungsgericht bestätigt „${v.name}“ (${art.name}).`);
    }
  }
  let state = { ...zustand, rngZustand, verfahren: offen.filter((x) => x.faellig > zustand.runde), haushalt: { ...zustand.haushalt, einnahmen } };
  const verlust = posten.reduce((s, p) => s + p.wert, 0);
  if (verlust && zustand.kanzlerParteiId) {
    state = umfrageBuchen(zustand, mitVerlauf({ ...state, anteile: runden(umverteilen(zustand.anteile, { [zustand.kanzlerParteiId]: verlust })) }), posten);
  }
  return { state, ereignisse };
}
