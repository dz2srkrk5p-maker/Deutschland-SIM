// Epochen-Kern (Epochen-Etappe 2, docs/epochen-spec.md): Etwa alle zehn Jahre beginnt eine Epoche aus src/data/epochen.js
// (in der Reihenfolge der Daten). Sie bringt eigene Probleme, verteilt über die ersten Jahre, und eine Streitfrage.
// Höchstens config.epochen.maxGleichzeitig laufen gleichzeitig; ist der Platz belegt, wartet die nächste.
// Zeit als Monatszähler: jahr × 12 + monat − 1. Wahlkampf und Regierungsbildung kosten keine Zeit, Epochen laufen nur weiter,
// wenn ein Monat endet (monatsabschluss, auch in der Opposition und nach dem Haushalt).
import { config } from '../data/config.js';
import { epochen as epochenDaten } from '../data/epochen.js';
import { zufall } from './rng.js';
import { epochenErgebnis, wegeAutomatisch, wegGruppenMonat } from './weichen.js';

const ec = config.epochen;
export const zeitpunkt = (jahr, monat) => jahr * 12 + monat - 1;
export const alsDatum = (t) => ({ jahr: Math.floor(t / 12), monat: (t % 12) + 1 });
export const epoche = (id) => epochenDaten.find((e) => e.id === id);

// Anfangszustand: noch keine Epoche, die erste beginnt im Januar von config.epochen.ersteEpocheJahr
// folgen: Startfaktoren aus beendeten Epochen (Rückenwind < 1, Hypothek > 1) für die nächste Epoche (Etappe 3)
export const epochenStart = () => ({ aktiv: [], vorbei: [], naechste: zeitpunkt(ec.ersteEpocheJahr, 1), index: 0, titelseite: null, folgen: [] });
// Basis der Aufgaben: Wert der Aufgaben-Probleme beim Epochenstart bzw. beim Eintreffen des Problems
const aufgabenProbleme = (daten) => [...new Set(daten.wege.map((w) => w.aufgabe.problem))];
const r2 = (x) => Math.round(x * 100) / 100 + 0;

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
  let { aktiv, vorbei, naechste, index, titelseite, folgen } = zustand.epochen;
  let rngZustand = zustand.rngZustand;

  // Ende: Ergebnis der Aufgaben, Rückenwind oder Hypothek für die nächste Epoche
  for (const a of aktiv.filter((x) => x.ende <= jetzt)) {
    const e = epochenErgebnis(zustand, a);
    vorbei = [...vorbei, { id: a.id, start: a.start, ende: a.ende, wege: a.wege ?? [], ergebnis: e.ergebnis, fortschritt: e.fortschritt, gelungen: e.gelungen, kurswechsel: a.kurswechsel ?? 0 }];
    folgen = [...folgen, e.faktor];
    ereignisse.push(`Epoche zu Ende: ${epoche(a.id).name} – ${e.gelungen ? 'Aufgabe gelungen, die nächste Epoche beginnt mit Rückenwind' : 'Aufgabe verfehlt, die nächste Epoche beginnt mit einer Hypothek'}`);
  }
  aktiv = aktiv.filter((a) => a.ende > jetzt);

  if (jetzt >= naechste && index < epochenDaten.length && aktiv.length < ec.maxGleichzeitig) {
    const daten = epochenDaten[index];
    const startFaktor = r2(folgen.reduce((f, x) => f * x, 1));
    const basis = Object.fromEntries(aufgabenProbleme(daten).filter((p) => zustand.probleme[p]).map((p) => [p, zustand.probleme[p].wert]));
    aktiv = [...aktiv, { id: daten.id, start: jetzt, ende: jetzt + ec.dauerJahre * 12, wege: [], basis, startFaktor, kurswechsel: 0 }];
    folgen = [];
    const a = abstand(rngZustand);
    rngZustand = a.rngZustand;
    naechste = jetzt + a.monate;
    index += 1;
    titelseite = daten.id;
    ereignisse.push(`Neue Epoche: ${daten.name}. Streitfrage: ${daten.streitfrage.text}${startFaktor < 1 ? ' Sie beginnt mit Rückenwind.' : startFaktor > 1 ? ' Sie beginnt mit einer Hypothek.' : ''}`);
  }

  // fällige Epochenprobleme: Startwert × Startfaktor (Rückenwind/Hypothek); Basis der Aufgaben merken
  const probleme = { ...zustand.probleme };
  aktiv = aktiv.map((a) => {
    let basis = a.basis ?? {};
    for (const p of faelligeProbleme(epoche(a.id), a.start, jetzt)) {
      if (probleme[p.id]) continue;
      const start = r2(Math.max(0, Math.min(100, p.start * (a.startFaktor ?? 1))));
      probleme[p.id] = { wert: start, verlauf: [start] };
      if (aufgabenProbleme(epoche(a.id)).includes(p.id)) basis = { ...basis, [p.id]: start };
      ereignisse.push(`Neues Problem der Epoche „${epoche(a.id).name}“: ${p.name}`);
    }
    return { ...a, basis };
  });
  const z = { ...zustand, rngZustand, probleme, epochen: { aktiv, vorbei, naechste, index, titelseite, folgen } };
  // Weiche: automatische Wahl (Aufschub vorbei, oder die Regierung der anderen); Stärken und Schwächen auf die Gruppen
  const auto = wegeAutomatisch({ ...z, jahr, monat });
  return { state: { ...auto.state, jahr: zustand.jahr, monat: zustand.monat, gruppen: wegGruppenMonat(auto.state) }, ereignisse: [...ereignisse, ...auto.ereignisse] };
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
