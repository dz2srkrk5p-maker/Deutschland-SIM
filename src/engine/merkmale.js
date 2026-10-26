// Merkmale und Landesprofil (Epochen-Etappe 4, docs/epochen-spec.md). Gelingt die Aufgabe eines Wegs oder gelten drei
// passende Aufbaugesetze (vorerst: drei der tragenden Reformwege aus src/data/merkmale.js), bekommt das Land ein Merkmal,
// höchstens config.merkmale.max. Merkmale stärken passende Ansätze, binden Gruppen und bremsen Probleme, haben aber eine
// Schwäche. Hebt eine spätere Regierung alle tragenden Gesetze auf, die das Merkmal getragen haben, verblasst es über
// config.merkmale.verblassenMonate (linear) und verschwindet dann.
import { config } from '../data/config.js';
import { merkmale as merkmalDaten } from '../data/merkmale.js';

const mc = config.merkmale;
const r3 = (x) => Math.round(x * 1000) / 1000 + 0;
export const merkmal = (id) => merkmalDaten.find((m) => m.id === id);
const jetztVon = (z) => z.jahr * 12 + z.monat - 1;
const gilt = (zustand, wegId) => zustand.reformwege?.[wegId]?.status === 'beschlossen';

// Stärke eines Merkmals: 1, beim Verblassen linear bis 0
export const merkmalStaerke = (zustand, m, jetzt = jetztVon(zustand)) =>
  m.verblasst == null ? 1 : r3(Math.max(0, 1 - (jetzt - m.verblasst) / mc.verblassenMonate));

// Bremse und Schwäche auf Probleme als Trend je Monat (für die Problem-Engine)
export const merkmalTrends = (zustand, problemId) => (zustand.merkmale ?? []).flatMap((m) => {
  const d = merkmal(m.id);
  const f = merkmalStaerke(zustand, m);
  return [['Merkmal', d.staerke], ['Schwäche des Merkmals', d.schwaeche]]
    .filter(([, x]) => x.probleme?.[problemId] && f > 0)
    .map(([art, x]) => ({ text: `${art} „${d.name}“`, beitrag: r3(x.probleme[problemId] * mc.problemTrendJePunkt * f) }));
});

// Passende Ansätze wirken stärker (stärkstes Merkmal zählt, nicht addiert)
export const merkmalAnsatzFaktor = (zustand, ansatzId) => 1 + mc.ansatzBonus * Math.max(0, ...(zustand.merkmale ?? [])
  .filter((m) => merkmal(m.id).staerke.ansaetze.includes(ansatzId))
  .map((m) => merkmalStaerke(zustand, m)));

// Gruppen: Punkte je Jahr aus Stärke und Schwäche, monatlich anteilig
export function merkmalGruppenMonat(zustand, gruppen = zustand.gruppen) {
  const neu = { ...gruppen };
  for (const m of zustand.merkmale ?? []) {
    const d = merkmal(m.id);
    const f = merkmalStaerke(zustand, m);
    for (const x of [d.staerke, d.schwaeche]) {
      for (const [g, v] of Object.entries(x.gruppen ?? {})) neu[g] = Math.max(0, Math.min(100, r3(neu[g] + (v * mc.gruppenJePunkt * f) / 12)));
    }
  }
  return neu;
}

// Am Monatsanfang (jetzt): Vergabe aus gelungenen Aufgaben (wegeMerkmale: Merkmal-Ids der gelungenen Wege) und aus drei
// geltenden tragenden Gesetzen; Verblassen und Verschwinden.
export function merkmaleMonat(zustand, jetzt, wegeMerkmale = []) {
  const ereignisse = [];
  let liste = [...(zustand.merkmale ?? [])];
  const vergeben = (id, grund) => {
    if (liste.some((m) => m.id === id)) return;
    if (liste.length >= mc.max) {
      ereignisse.push(`Kein Platz für das Merkmal „${merkmal(id).name}“: Das Land hat schon ${mc.max} Merkmale.`);
      return;
    }
    liste.push({ id, seit: jetzt, verblasst: null, getragen: merkmal(id).tragend.filter((w) => gilt(zustand, w)) });
    ereignisse.push(`Neues Merkmal des Landes: „${merkmal(id).name}“ (${grund})`);
  };
  for (const id of wegeMerkmale) vergeben(id, 'Aufgabe gelungen');
  for (const d of merkmalDaten) {
    if (d.tragend.filter((w) => gilt(zustand, w)).length >= mc.aufbaugesetzeNoetig) vergeben(d.id, `${mc.aufbaugesetzeNoetig} passende Gesetze gelten`);
  }
  liste = liste.flatMap((m) => {
    const d = merkmal(m.id);
    const geltend = d.tragend.filter((w) => gilt(zustand, w));
    const getragen = [...new Set([...(m.getragen ?? []), ...geltend])];
    if (m.verblasst == null && getragen.length && !geltend.length) {
      ereignisse.push(`Merkmal „${d.name}“ verblasst: Die tragenden Gesetze gelten nicht mehr.`);
      return [{ ...m, getragen, verblasst: jetzt }];
    }
    if (m.verblasst != null && geltend.length) {
      ereignisse.push(`Merkmal „${d.name}“ ist wieder getragen und verblasst nicht mehr.`);
      return [{ ...m, getragen, verblasst: null }];
    }
    if (m.verblasst != null && jetzt - m.verblasst >= mc.verblassenMonate) {
      ereignisse.push(`Merkmal „${d.name}“ ist verschwunden.`);
      return [];
    }
    return [{ ...m, getragen }];
  });
  return { state: { ...zustand, merkmale: liste }, ereignisse };
}
