// Regierungsbilanz im Wahlkampf (Paket Groß, Feature 9): Am Ende einer Regierungszeit (Wahlperiode vorbei oder Neuwahl
// nach Koalitionsbruch) vergleicht das Spiel den Stand mit dem Schnappschuss bei der Wahl: Vorhaben des Koalitionsvertrags
// (Feature 7), Probleme gelöst oder verschleppt, Kennzahlen, wichtigste Umfrage-Ursachen (Feature 1). Vertrag und Probleme
// wirken einmalig und gedeckelt auf die Regierungsparteien; der Wahlkampf danach und der Zufall bleiben voll wirksam.
// Spielwerte: config.regierungsbilanz.
import { config } from '../data/config.js';
import { probleme } from '../data/probleme.js';
import { parteien } from '../data/parteien.js';
import { kennzahlen } from '../data/kennzahlen.js';
import { zurueckInDenWahlkampf, mitVerlauf } from './state.js';
import { umverteilen, runden } from './wahlkampf.js';
import { umfrageBuchen } from './umfragebilanz.js';

const rb = config.regierungsbilanz;
const r2 = (x) => Math.round(x * 100) / 100 + 0;

// Bilanz der Regierungszeit oder null (kein Schnappschuss, z. B. alter Spielstand, oder keine Regierung)
export function regierungsBilanz(zustand) {
  const start = zustand.periodeStart;
  if (!start || !zustand.kanzlerParteiId) return null;
  const vorhaben = zustand.koalition?.vertrag?.vorhaben ?? [];
  const zahl = (s) => vorhaben.filter((v) => v.status === s).length;
  const vertrag = { gesamt: vorhaben.length, umgesetzt: zahl('umgesetzt'), gebrochen: zahl('gebrochen'), offen: zahl('offen') };

  const verlauf = probleme.filter((p) => start.probleme[p.id] !== undefined)
    .map((p) => ({ id: p.id, vorher: start.probleme[p.id], nachher: zustand.probleme[p.id].wert }));
  const geloest = verlauf.filter((d) => d.vorher - d.nachher >= rb.problemSchwelle).map((d) => d.id);
  const verschleppt = verlauf.filter((d) => d.nachher - d.vorher >= rb.problemSchwelle).map((d) => d.id);

  const werte = kennzahlen.map((k) => ({ id: k.id, vorher: start.land[k.id], nachher: zustand.land[k.id] }));

  // wichtigste Ursachen der Umfrageänderungen der eigenen Partei (aus der Umfrage-Bilanz, ohne den Restposten)
  const summen = {};
  for (const e of zustand.umfrageBilanz ?? []) {
    for (const p of e.posten) if (p.partei === zustand.spielerParteiId && !p.rest) summen[p.ursache] = (summen[p.ursache] ?? 0) + p.wert;
  }
  const ursachen = Object.entries(summen).map(([ursache, wert]) => ({ ursache, wert: r2(wert) }))
    .sort((a, b) => Math.abs(b.wert) - Math.abs(a.wert)).slice(0, rb.ursachen);

  const punkte = {
    vertrag: vertrag.gesamt ? r2((rb.jeVertrag * (vertrag.umgesetzt - vertrag.gebrochen - vertrag.offen * rb.offenAnteil)) / vertrag.gesamt) : 0,
    probleme: r2(rb.jeProblem * (geloest.length - verschleppt.length)),
  };
  const wirkung = r2(Math.max(-rb.max, Math.min(rb.max, punkte.vertrag + punkte.probleme)));
  return { kanzler: zustand.kanzlerParteiId, partner: zustand.koalition?.partner ?? [], vertrag, geloest, verschleppt, kennzahlen: werte, ursachen, punkte, wirkung };
}

// Ende der Regierungszeit: zurück in den Wahlkampf, Bilanz ziehen und einmalig wirken lassen
export function wahlperiodeEnde(zustand) {
  const bilanz = regierungsBilanz(zustand);
  const neu = zurueckInDenWahlkampf(zustand);
  if (!bilanz) return { state: neu, ereignisse: [] };
  const feste = { [bilanz.kanzler]: bilanz.wirkung, ...Object.fromEntries(bilanz.partner.map((id) => [id, r2(bilanz.wirkung * rb.partnerAnteil)])) };
  const posten = Object.entries(feste).map(([partei, wert]) => ({ ursache: 'Regierungsbilanz', partei, wert }));
  const anteile = bilanz.wirkung ? runden(umverteilen(neu.anteile, feste)) : neu.anteile;
  const mit = umfrageBuchen(neu, bilanz.wirkung ? mitVerlauf({ ...neu, anteile }) : neu, posten, 'Regierungsbilanz');
  const pp = (x) => (x >= 0 ? '+' : '−') + Math.abs(x).toLocaleString('de-DE');
  return {
    state: { ...mit, regierungsBilanz: bilanz, wahlkampfStart: mit.anteile[mit.spielerParteiId] },
    ereignisse: [`Regierungsbilanz: ${bilanz.vertrag.gesamt ? `${bilanz.vertrag.umgesetzt} von ${bilanz.vertrag.gesamt} Vertragsvorhaben umgesetzt, ` : ''}${bilanz.geloest.length} Probleme gelöst, ${bilanz.verschleppt.length} verschleppt: ${Object.entries(feste).map(([id, x]) => `${parteien.find((p) => p.id === id).name} ${pp(x)}`).join(', ')}`],
  };
}
