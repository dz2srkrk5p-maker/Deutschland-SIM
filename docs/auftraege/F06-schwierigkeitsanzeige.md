# F06: Schwierigkeitsanzeige je Partei

## Ziel
Auf dem Startbildschirm steht neben jeder Partei, wie schwer sie zu spielen ist. Steht schon als Idee in `docs/OFFENE-FRAGEN.md`.

## Ausgangslage
- Startbildschirm: `src/ui/screens/start.js`.
- Zahlen: `docs/BALANCING.md` (z. B. CDU/CSU 43 % Siege, AfD 0 %, mit Strategie „immer Plakate“).
- Bericht wird von `scripts/balancing.js` erzeugt.

## Vorab entscheiden (Nutzer fragen)
1. Stufen und Grenzen, z. B. „leicht“ ab 30 % Siege, „mittel“ ab 10 %, „schwer“ ab 1 %, sonst „fast unmöglich“. Grenzen sind Spielentscheidungen → `config.js`.
2. Fest eingetragen in `src/data/parteien.js` (Vorschlag, einfach) oder automatisch aus dem Balancing-Skript erzeugt?
3. AfD: Text „Keine Partei koaliert mit euch (Brandmauer)“ statt nur „unmöglich“?

## Umsetzung
1. Feld `schwierigkeit` je Partei in `src/data/parteien.js`, mit Kommentar „aus BALANCING.md vom …“.
2. `scripts/balancing.js`: am Ende prüfen, ob die eingetragene Stufe noch zur gemessenen Siegquote passt, und Abweichungen ausgeben. So veraltet die Anzeige nicht unbemerkt.
3. `start.js`: Stufe unter dem Parteinamen, kleiner Text.

## Tests
`tests/daten.test.js`: jede spielbare Partei hat eine gültige Stufe.

## Im Browser prüfen
Startbildschirm zeigt die Stufen, Knöpfe bleiben ≥ 44 px.

## Fertig, wenn
Tests grün, OFFENE-FRAGEN-Punkt abgehakt.

## Nicht enthalten
Keine wählbaren Schwierigkeitsgrade, keine Freischaltungen.
