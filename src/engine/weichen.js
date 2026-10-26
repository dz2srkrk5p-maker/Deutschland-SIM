// Weichen, Wege, Aufgabe und Fortschritt (Epochen-Etappe 3, docs/epochen-spec.md).
// Zu Beginn einer Epoche wählt der Spieler einen Weg (Stufe 1: aus zwei, sonst aus drei). Ohne Wahl nimmt nach
// config.epochen.aufschubMonate die eigene Partei den Weg, der zum Programm passt; in der Opposition wählt die Regierung.
// Jeder Weg hat eine Aufgabe (ein Problem bis zum Epochenende auf höchstens ziel drücken), eine Stärke, eine Schwäche,
// Schwerpunkt-Ansätze (10 % stärker) und ein Merkmal (Etappe 4). Gelingt die Aufgabe, startet die nächste Epoche mit
// Rückenwind, sonst mit einer Hypothek. Ab Stufe 3 Kurswechsel (einmal je Epoche), auf Stufe 4 stattdessen ein zweiter Weg.
import { config } from '../data/config.js';
import { epochen as epochenDaten } from '../data/epochen.js';
import { AUSRICHTUNGEN } from '../data/reformwege.js';
import { parteien } from '../data/parteien.js';
import { gruppen as gruppenDaten } from '../data/kennzahlen.js';
import { parteiPosition, abstand } from './profil.js';
import { stufenRegeln, systemAn } from './spielstufe.js';
import { umverteilen, runden } from './wahlkampf.js';
import { mitVerlauf } from './state.js';
import { umfrageBuchen } from './umfragebilanz.js';

const ec = config.epochen;
const r3 = (x) => Math.round(x * 1000) / 1000 + 0;
const jetzt = (z) => z.jahr * 12 + z.monat - 1;
const epochenDatum = (id) => epochenDaten.find((e) => e.id === id);
const name = (id) => parteien.find((p) => p.id === id).name;

export const wegDaten = (wegId) => epochenDaten.flatMap((e) => e.wege).find((w) => w.id === wegId);
// Angebot der Weiche: auf Stufe 1 die ersten zwei Wege der Daten, sonst alle (config.spielstufen)
export const angebot = (zustand, epocheId) => epochenDatum(epocheId).wege.slice(0, stufenRegeln(zustand).wegeJeWeiche);
export const aktiveEpoche = (zustand, epocheId) => zustand.epochen.aktiv.find((a) => a.id === epocheId);
// alle gewählten Wege laufender Epochen
export const gewaehlteWege = (zustand) => (zustand.epochen?.aktiv ?? []).flatMap((a) => a.wege ?? []);

// Weg, der am besten zum Programm einer Partei passt (kleinster Abstand ihrer Position zur Ausrichtung des Wegs)
export function passenderWeg(zustand, epocheId, parteiId) {
  const pos = parteiPosition(parteiId);
  return [...angebot(zustand, epocheId)].sort((a, b) => abstand(pos, AUSRICHTUNGEN[a.ausrichtung].vektor) - abstand(pos, AUSRICHTUNGEN[b.ausrichtung].vektor))[0];
}

// Fortschritt der Aufgabe eines Wegs: (Basis − Wert) / (Basis − Ziel); Basis = Wert des Problems, als die Epoche bzw. das
// Problem begann (a.basis). roh kann unter 0 oder über 1 liegen; anteil ist auf 0…1 begrenzt (Anzeige).
export function fortschritt(zustand, a, wegId) {
  const w = wegDaten(wegId);
  const p = w.aufgabe.problem;
  const wert = zustand.probleme[p]?.wert;
  const basis = a.basis?.[p];
  if (wert === undefined || basis === undefined) return { roh: 0, anteil: 0, wert: null, ziel: w.aufgabe.ziel, prognose: null };
  const roh = basis <= w.aufgabe.ziel ? (wert <= w.aufgabe.ziel ? 1 : 0) : (basis - wert) / (basis - w.aufgabe.ziel);
  // Prognose „bei diesem Tempo“: Veränderung der letzten Monate bis zum Epochenende fortgeschrieben
  const verlauf = zustand.probleme[p].verlauf;
  const n = Math.min(ec.prognoseMonate, verlauf.length - 1);
  const tempo = n > 0 ? (verlauf.at(-1) - verlauf.at(-1 - n)) / n : 0;
  const wertEnde = Math.max(0, Math.min(100, wert + tempo * Math.max(0, a.ende - jetzt(zustand))));
  const prognose = basis <= w.aufgabe.ziel ? (wertEnde <= w.aufgabe.ziel ? 1 : 0) : (basis - wertEnde) / (basis - w.aufgabe.ziel);
  const grenze = (x) => Math.max(0, Math.min(1, x));
  return { roh: r3(roh), anteil: r3(grenze(roh)), wert, ziel: w.aufgabe.ziel, prognose: r3(grenze(prognose)), wertEnde: r3(wertEnde) };
}
export const aufgabeGelungen = (zustand, a, wegId) => fortschritt(zustand, a, wegId).roh >= ec.aufgabeErfuelltAb;

// Schwerpunkt-Ansätze der gewählten Wege wirken stärker (Lösungen und Reformwege)
export const schwerpunktFaktor = (zustand, ansatzId) =>
  gewaehlteWege(zustand).some((id) => wegDaten(id).schwerpunkt.includes(ansatzId)) ? 1 + ec.schwerpunktBonus : 1;
// Stufe 4: Mit zwei Wegen in einer Epoche kosten deren Schwerpunkt-Gesetze das 1,5-Fache (politisches Kapital)
export const schwerpunktKostenFaktor = (zustand, ansatzId) =>
  (zustand.epochen?.aktiv ?? []).some((a) => (a.wege ?? []).length > 1 && a.wege.some((id) => wegDaten(id).schwerpunkt.includes(ansatzId))) ? ec.zweiterWegKostenFaktor : 1;

// Stärken und Schwächen der gewählten Wege als Trend je Monat auf Probleme (für die Problem-Engine)
export const wegEpochenTrends = (zustand, problemId) => gewaehlteWege(zustand).flatMap((id) => {
  const w = wegDaten(id);
  return [['Stärke', w.staerke], ['Schwäche', w.schwaeche]]
    .filter(([, x]) => x.probleme?.[problemId])
    .map(([art, x]) => ({ text: `${art} des Wegs „${w.name}“`, beitrag: r3(x.probleme[problemId] * ec.wegProblemTrendJePunkt) }));
});
// … und auf Gruppen: Punkte je Monat (Daten: je Jahr)
export function wegGruppenMonat(zustand) {
  const gruppen = { ...zustand.gruppen };
  for (const id of gewaehlteWege(zustand)) {
    const w = wegDaten(id);
    for (const x of [w.staerke, w.schwaeche]) {
      for (const [g, v] of Object.entries(x.gruppen ?? {})) gruppen[g] = Math.max(0, Math.min(100, r3(gruppen[g] + (v * ec.wegGruppenJePunkt) / 12)));
    }
  }
  return gruppen;
}

const mitWeg = (zustand, epocheId, aendern) => ({
  ...zustand,
  epochen: { ...zustand.epochen, aktiv: zustand.epochen.aktiv.map((a) => (a.id === epocheId ? aendern(a) : a)) },
});

// Automatische Wahl am Monatsanfang: in der Opposition sofort durch die Regierung, sonst nach dem Aufschub durch die eigene Partei
export function wegeAutomatisch(zustand) {
  const ereignisse = [];
  let z = zustand;
  for (const a of zustand.epochen.aktiv) {
    if ((a.wege ?? []).length) continue;
    const opposition = z.phase === 'opposition';
    if (!opposition && jetzt(z) - a.start < ec.aufschubMonate) continue;
    const partei = opposition ? z.kanzlerParteiId : z.spielerParteiId;
    const w = passenderWeg(z, a.id, partei);
    z = mitWeg(z, a.id, (x) => ({ ...x, wege: [w.id], gewaehlt: jetzt(z), durch: partei }));
    ereignisse.push(opposition
      ? `Die Regierung wählt den Weg für die Epoche „${epochenDatum(a.id).name}“: „${w.name}“.`
      : `Ohne Entscheidung nimmt ${name(partei)} für die Epoche „${epochenDatum(a.id).name}“ den Weg, der zum Programm passt: „${w.name}“.`);
  }
  return { state: z, ereignisse };
}

function pruefen(zustand, epocheId, wegId) {
  if (zustand.phase !== 'regierung') throw new Error('Nur die eigene Regierung wählt den Weg');
  const a = aktiveEpoche(zustand, epocheId);
  if (!a) throw new Error('Diese Epoche läuft nicht');
  if (!angebot(zustand, epocheId).some((w) => w.id === wegId)) throw new Error('Dieser Weg steht nicht zur Wahl');
  return a;
}

// Aktion: Weg wählen (Weiche), solange noch keiner gewählt ist
export function wegWaehlen(zustand, { epocheId, wegId }) {
  const a = pruefen(zustand, epocheId, wegId);
  if ((a.wege ?? []).length) throw new Error('Für diese Epoche ist der Weg schon gewählt');
  const w = wegDaten(wegId);
  return {
    state: mitWeg(zustand, epocheId, (x) => ({ ...x, wege: [wegId], gewaehlt: jetzt(zustand), durch: zustand.spielerParteiId })),
    ereignisse: [`Weichenstellung für die Epoche „${epochenDatum(epocheId).name}“: „${w.name}“. Aufgabe: ${w.aufgabe.text}`],
  };
}

// Kurswechsel kostenlos: eine neue Regierung im ersten Jahr (seit der Vereidigung)
export const kurswechselFrei = (zustand) => zustand.regierungSeit != null && jetzt(zustand) - zustand.regierungSeit < ec.kurswechselKostenlosMonate;

// Warum ein Kurswechsel jetzt nicht geht, oder null
export function kurswechselSperre(zustand, epocheId) {
  if (!systemAn(zustand, 'kurswechsel')) return 'erst ab Stufe 3';
  if (zustand.phase !== 'regierung') return 'nur in der Regierung';
  const a = aktiveEpoche(zustand, epocheId);
  if (!a || !(a.wege ?? []).length) return 'noch kein Weg gewählt';
  if (kurswechselFrei(zustand)) return null;
  if ((a.kurswechsel ?? 0) >= ec.kurswechselJeEpoche) return 'nur einmal je Epoche';
  if (zustand.kapital < ec.kurswechselKapital) return `zu wenig politisches Kapital (${ec.kurswechselKapital} nötig)`;
  return null;
}

// Aktion: Kurswechsel (ab Stufe 3). Kostet Zustimmung (Kapital, Umfrage der Kanzlerpartei, Gruppen des alten Wegs) und
// halbiert den Rückenwind; im ersten Jahr einer neuen Regierung kostenlos.
export function kurswechsel(zustand, { epocheId, wegId }) {
  const sperre = kurswechselSperre(zustand, epocheId);
  if (sperre) throw new Error(`Kurswechsel nicht möglich: ${sperre}`);
  const a = pruefen(zustand, epocheId, wegId);
  if (a.wege.includes(wegId)) throw new Error('Diesen Weg geht das Land schon');
  const alt = wegDaten(a.wege[0]);
  const neu = wegDaten(wegId);
  const frei = kurswechselFrei(zustand);
  let z = mitWeg(zustand, epocheId, (x) => ({ ...x, wege: [wegId], gewaehlt: jetzt(zustand), durch: zustand.spielerParteiId, kurswechsel: (x.kurswechsel ?? 0) + (frei ? 0 : 1) }));
  const ereignisse = [`Kurswechsel in der Epoche „${epochenDatum(epocheId).name}“: statt „${alt.name}“ jetzt „${neu.name}“${frei ? ' (neue Regierung, ohne Kosten)' : ''}`];
  if (!frei) {
    const gruppen = { ...z.gruppen };
    const verlierer = Object.entries(alt.staerke.gruppen ?? {}).filter(([, v]) => v > 0).map(([g]) => g);
    for (const g of verlierer) gruppen[g] = Math.max(0, gruppen[g] - ec.kurswechselGruppen);
    const posten = [{ ursache: `Kurswechsel: „${alt.name}“ aufgegeben`, partei: z.kanzlerParteiId, wert: -ec.kurswechselUmfrage }];
    z = umfrageBuchen(z, mitVerlauf({ ...z, gruppen, kapital: z.kapital - ec.kurswechselKapital, anteile: runden(umverteilen(z.anteile, { [z.kanzlerParteiId]: -ec.kurswechselUmfrage })) }), posten);
    ereignisse.push(`Der Kurswechsel kostet ${ec.kurswechselKapital} Kapital und Glaubwürdigkeit${verlierer.length ? `; enttäuscht: ${verlierer.map((g) => gruppenDaten.find((x) => x.id === g).name).join(', ')}` : ''}. Der Rückenwind einer gelungenen Aufgabe halbiert sich.`);
  }
  return { state: z, ereignisse };
}

// Warum ein zweiter Weg jetzt nicht geht, oder null
export function zweiterWegSperre(zustand, epocheId) {
  if (!systemAn(zustand, 'zweiterWeg')) return 'nur auf Stufe 4';
  if (zustand.phase !== 'regierung') return 'nur in der Regierung';
  const a = aktiveEpoche(zustand, epocheId);
  if (!a || !(a.wege ?? []).length) return 'erst einen Weg wählen';
  if (a.wege.length > ec.zweiterWegJeEpoche) return 'schon zwei Wege';
  return null;
}

// Aktion: zweiten Weg dazunehmen (Stufe 4): Beide Aufgaben zählen, die Schwerpunkt-Gesetze beider Wege kosten das 1,5-Fache
export function zweiterWeg(zustand, { epocheId, wegId }) {
  const sperre = zweiterWegSperre(zustand, epocheId);
  if (sperre) throw new Error(`Zweiter Weg nicht möglich: ${sperre}`);
  const a = pruefen(zustand, epocheId, wegId);
  if (a.wege.includes(wegId)) throw new Error('Diesen Weg geht das Land schon');
  const w = wegDaten(wegId);
  return {
    state: mitWeg(zustand, epocheId, (x) => ({ ...x, wege: [...x.wege, wegId] })),
    ereignisse: [`Zweiter Weg in der Epoche „${epochenDatum(epocheId).name}“: dazu „${w.name}“. Beide Aufgaben zählen; Schwerpunkt-Gesetze beider Wege kosten das ${ec.zweiterWegKostenFaktor.toLocaleString('de-DE')}-Fache.`],
  };
}

// Ende einer Epoche: Ergebnis je Weg; gelungen, wenn alle gewählten Aufgaben gelungen sind. Folge für die nächste Epoche:
// Rückenwind (Startwerte × rueckenwindStartFaktor, nach Kurswechsel nur halb so viel Erleichterung) oder Hypothek.
export function epochenErgebnis(zustand, a) {
  const wege = a.wege ?? [];
  const ergebnis = Object.fromEntries(wege.map((id) => [id, aufgabeGelungen(zustand, a, id)]));
  const gelungen = wege.length > 0 && wege.every((id) => ergebnis[id]);
  const rw = 1 - (1 - ec.rueckenwindStartFaktor) * ((a.kurswechsel ?? 0) > 0 ? ec.kurswechselRueckenwindFaktor : 1);
  return { ergebnis, gelungen, faktor: r3(gelungen ? rw : ec.hypothekStartFaktor), fortschritt: Object.fromEntries(wege.map((id) => [id, fortschritt(zustand, a, id).anteil])) };
}
