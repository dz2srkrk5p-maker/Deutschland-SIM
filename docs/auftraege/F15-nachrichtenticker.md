# F15: Nachrichtenticker

## Voraussetzung
Sinnvoll erst nach F14 (Ereignisse), besser auch nach F13. Vorher würde er nur das Protokoll wiederholen.

## Ziel
Eine Zeile mit Schlagzeilen oben auf dem Bildschirm, die zeigt, was im Land passiert und wie die Presse auf die Regierung reagiert. Reine Anzeige, keine Spielregel.

## Ausgangslage
- Alles, was passiert, landet als Text im Protokoll (`ereignisse` jeder Aktion, `src/ui/components/protokoll.js`). Diese Texte sind nüchtern und nicht nach Art sortiert.

## Vorab entscheiden (Nutzer fragen)
1. **Quelle der Schlagzeilen:** Vorschlag: Engine-Aktionen geben zusätzlich zu den Texten strukturierte Ereignisse zurück (`{ typ: 'koalitionsbruch', partei: 'spd' }`), und die UI macht daraus Schlagzeilen über Vorlagen. Achtung: Das ändert die Form `{ state, ereignisse }` aus CLAUDE.md Regel 5 — entweder `ereignisse` darf Objekte enthalten, oder ein neues Feld `meldungen`. Nutzer entscheiden lassen.
2. **Vorlagen:** Der Nutzer gibt die Schlagzeilen-Vorlagen frei. Erfundene Zeitungsnamen ja/nein?
3. **Wie viele:** Vorschlag: die letzten 5, **keine doppelten Schlagzeilen**.
4. **Bewegung:** Laufschrift oder feste Liste? Vorschlag: feste Liste von 1–3 Zeilen; Laufschrift höchstens, wenn `prefers-reduced-motion` es erlaubt, und mit Pause-Knopf.
5. **Kommentar zum Stillstand:** Soll die Presse auch reagieren, wenn nichts passiert (z. B. Problemdruck hoch, keine Reform)? Das wäre eine kleine Regel; Vorschlag: ja, nur bei hohem Druck aus F13.

## Umsetzung
1. Strukturierte Meldungen in den Engine-Aktionen (nach Entscheidung 1). Bestehende Tests für die Texte bleiben gültig.
2. `src/data/schlagzeilen.js`: Vorlagen je Meldungstyp, mehrere Varianten, Auswahl über den Seed-Zufall **im Zustand** oder deterministisch nach Rundennummer (Engine-Regel: kein `Math.random`, auch nicht in der UI, damit gleiche Seeds gleich aussehen — Nutzer fragen).
3. Zustand: `meldungen` (letzte n); Version erhöhen.
4. `src/ui/components/ticker.js`; in den Regierungs- und Wahlkampfbildschirm einbinden. Für Screenreader nicht als Live-Region (zu laut), die Ansage aus F04 reicht.

## Tests
Jeder Meldungstyp hat eine Vorlage; keine doppelten Schlagzeilen in der Liste; gleicher Seed = gleiche Schlagzeilen.

## Im Browser prüfen
Eine Wahlperiode spielen, Ticker zeigt wechselnde, nie doppelte Meldungen; mit reduzierter Bewegung (Windows: Animationen aus) läuft nichts.

## Fertig, wenn
Tests grün, Vorlagen freigegeben, SPEC „Oberfläche“ ergänzt.

## Nicht enthalten
Keine Zeitungsseite, keine Interviews, keine Presse als eigenes Spielsystem.
