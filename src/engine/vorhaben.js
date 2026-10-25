// Laufende Vorhaben als Zeitstrahl (nur Anzeige, keine eigene Spielregel): Reformwege (Gesetze) mit den Schritten
// Bundestag → Bundesrat → Umsetzung → Ergebnis, Lösungen mit Start → Umsetzung → Ergebnis. Liest nur den Spielstand.
import { weg, ausrichtungName, wegRisiko } from './reformwege.js';
import { loesung, erfolgschance } from './probleme.js';

// Fortschritt der Umsetzung in Monaten. Über Erfolg oder Scheitern wird am Ende des Monats entschieden, in dem die
// Runde fertig erreicht (auch im Haushaltsmonat nach dem Beschluss).
function fortschritt(zustand, fertig, dauer, start = fertig - dauer) {
  const vergangen = Math.max(0, Math.min(dauer, zustand.runde - start));
  return { dauer, vergangen, rest: Math.max(1, fertig - zustand.runde) };
}

export function laufendeVorhaben(zustand) {
  const gesetze = Object.entries(zustand.reformwege ?? {}).filter(([, s]) => s.status === 'umsetzung').map(([id, s]) => {
    const w = weg(id);
    return {
      typ: 'gesetz', id, name: w.name, ausrichtung: ausrichtungName(w), bereich: w.bereich.name,
      bundestag: s.bundestag ?? null, // ältere Spielstände: ohne Stimmenzahl
      bundesrat: !w.bundesrat ? 'nicht nötig' : s.kompromiss ? 'kompromiss' : 'zugestimmt',
      bundesratStimmen: s.bundesrat ?? null,
      ...fortschritt(zustand, s.fertig, w.dauer, s.start),
      risiko: wegRisiko(w), verfassung: Boolean(w.verfassung),
    };
  });
  const loesungen = Object.entries(zustand.loesungen ?? {}).filter(([, s]) => s.status === 'laufend').map(([id, s]) => {
    const l = loesung(id);
    return { typ: 'loesung', id, name: l.name, problem: l.problem.name, ...fortschritt(zustand, s.fertig, l.dauer, s.start), chance: erfolgschance(zustand, l) };
  });
  // zuerst, was bald fertig wird
  return [...gesetze, ...loesungen].sort((a, b) => a.rest - b.rest || a.name.localeCompare(b.name));
}
