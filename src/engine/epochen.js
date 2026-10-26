// Epochen-Kern (Epochen-Etappe 2, docs/epochen-spec.md): Etwa alle zehn Jahre beginnt eine Epoche aus src/data/epochen.js
// (in der Reihenfolge der Daten). Sie bringt eigene Probleme, verteilt über die ersten Jahre, und eine Streitfrage.
// Höchstens config.epochen.maxGleichzeitig laufen gleichzeitig; ist der Platz belegt, wartet die nächste.
// Zeit als Monatszähler: jahr × 12 + monat − 1. Wahlkampf und Regierungsbildung kosten keine Zeit, Epochen laufen nur weiter,
// wenn ein Monat endet (monatsabschluss, auch in der Opposition und nach dem Haushalt).
import { config } from '../data/config.js';
import { epochen as epochenDaten } from '../data/epochen.js';
import { zufall } from './rng.js';

const ec = config.epochen;
export const zeitpunkt = (jahr, monat) => jahr * 12 + monat - 1;
export const alsDatum = (t) => ({ jahr: Math.floor(t / 12), monat: (t % 12) + 1 });
export const epoche = (id) => epochenDaten.find((e) => e.id === id);

// Anfangszustand: noch keine Epoche, die erste beginnt im Januar von config.epochen.ersteEpocheJahr
export const epochenStart = () => ({ aktiv: [], vorbei: [], naechste: zeitpunkt(ec.ersteEpocheJahr, 1), index: 0, titelseite: null });

// Epochenprobleme, die bis zum Zeitpunkt jetzt fällig sind (Abstand zum Epochenstart in Monaten laut Daten)
export const faelligeProbleme = (daten, start, jetzt) => daten.probleme.filter((p) => start + p.monat <= jetzt);

// Abstand zur nächsten Epoche: abstandJahre ± abstandSchwankungJahre, monatsgenau per Zufall
function abstand(rngZustand) {
  const z = zufall(rngZustand);
  const spanne = ec.abstandSchwankungJahre * 12;
  return { monate: ec.abstandJahre * 12 + Math.round((z.wert * 2 - 1) * spanne), rngZustand: z.rngZustand };
}

// Zu Beginn eines neuen Monats (jahr, monat): Epochen enden, beginnen, bringen ihre fälligen Probleme.
export function epochenMonat(zustand, jahr, monat) {
  const jetzt = zeitpunkt(jahr, monat);
  const ereignisse = [];
  let { aktiv, vorbei, naechste, index, titelseite } = zustand.epochen;
  let rngZustand = zustand.rngZustand;

  const endet = aktiv.filter((a) => a.ende <= jetzt);
  for (const a of endet) ereignisse.push(`Epoche zu Ende: ${epoche(a.id).name}`);
  vorbei = [...vorbei, ...endet.map((a) => ({ id: a.id, start: a.start, ende: a.ende }))];
  aktiv = aktiv.filter((a) => a.ende > jetzt);

  if (jetzt >= naechste && index < epochenDaten.length && aktiv.length < ec.maxGleichzeitig) {
    const daten = epochenDaten[index];
    aktiv = [...aktiv, { id: daten.id, start: jetzt, ende: jetzt + ec.dauerJahre * 12 }];
    const a = abstand(rngZustand);
    rngZustand = a.rngZustand;
    naechste = jetzt + a.monate;
    index += 1;
    titelseite = daten.id;
    ereignisse.push(`Neue Epoche: ${daten.name}. Streitfrage: ${daten.streitfrage.text}`);
  }

  const probleme = { ...zustand.probleme };
  for (const a of aktiv) {
    for (const p of faelligeProbleme(epoche(a.id), a.start, jetzt)) {
      if (probleme[p.id]) continue;
      probleme[p.id] = { wert: p.start, verlauf: [p.start] };
      ereignisse.push(`Neues Problem der Epoche „${epoche(a.id).name}“: ${p.name}`);
    }
  }
  return { state: { ...zustand, rngZustand, probleme, epochen: { aktiv, vorbei, naechste, index, titelseite } }, ereignisse };
}

// Aktion: Titelseite gelesen (sie erscheint einmal, wenn eine Epoche beginnt)
export function titelseiteGelesen(zustand) {
  return { state: { ...zustand, epochen: { ...zustand.epochen, titelseite: null } }, ereignisse: [] };
}

// Für die Anzeige: Monate seit Beginn und bis zum Ende einer laufenden Epoche
export const epochenLauf = (zustand, a) => {
  const jetzt = zeitpunkt(zustand.jahr, zustand.monat);
  return { seit: jetzt - a.start, bis: a.ende - jetzt };
};
