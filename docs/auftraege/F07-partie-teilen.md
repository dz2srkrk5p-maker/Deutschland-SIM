# F07: Partie teilen über den Seed

## Ziel
Wer `…/?seed=12345&partei=spd` öffnet, startet genau dieselbe Partie. Der Endbildschirm zeigt einen Link zum Kopieren. So können zwei Leute dieselbe Partie vergleichen, ganz ohne Server.

## Ausgangslage
- Der Seed wird in `starten()` in `src/ui/app.js` zufällig gezogen; die Engine ist damit vollständig reproduzierbar (`src/engine/rng.js`).
- Achtung: Der Seed muss im Spielzustand auffindbar sein. Heute liegt nur `rngZustand` darin, der sich verändert. **Prüfen**, ob der Start-Seed erhalten bleibt; falls nicht, Feld `seed` ergänzen (dann Version erhöhen, Nutzer fragen).

## Vorab entscheiden (Nutzer fragen)
1. Link enthält auch die Partei (Vorschlag) oder nur den Seed?
2. Gibt es bereits einen Spielstand: vorher fragen „Gespeichertes Spiel überschreiben?“ (Vorschlag).
3. Gleiche Partie heißt nur bei gleichen Entscheidungen gleicher Verlauf. Soll das auf dem Endbildschirm erklärt werden?

## Umsetzung
1. `app.js`: beim Laden `URLSearchParams` lesen, Seed als ganze Zahl prüfen, Partei gegen `parteien.js` prüfen. Ungültige Werte ignorieren, nicht abstürzen. Danach Parameter aus der Adresse entfernen (`history.replaceState`), damit ein Neuladen nicht erneut startet.
2. `ende.js`: Link anzeigen und Knopf „Link kopieren“ (`navigator.clipboard`, mit Rückfall: Link markierbar anzeigen).
3. Die Seed-Prüfung als reine Funktion, damit sie testbar ist.

## Tests
Gültiger/ungültiger Seed und Partei; gleicher Seed + gleiche Aktionen = gleicher Endzustand (es gibt dafür vermutlich schon `tests/spielablauf.test.js`, ergänzen).

## Im Browser prüfen
Link vom Endbildschirm in neuem Fenster öffnen → gleiche Startpartei, gleiche Umfrage nach Woche 1 bei gleicher Aktion.

## Fertig, wenn
Tests grün, SPEC „Speichern und Laden“ ergänzt.

## Nicht enthalten
Keine Bestenliste, kein Server, keine Wochenaufgabe.
