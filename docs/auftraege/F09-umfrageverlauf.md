# F09: Umfrageverlauf als Linie

## Ziel
Eine kleine Liniengrafik zeigt, wie sich der eigene Umfragewert über die Partie entwickelt hat, mit den Wahlen als Markierung. Sichtbar im Wahlkampf, im Haushalt und auf dem Endbildschirm.

## Ausgangslage
- Umfragewerte ändern sich in `wahlkampfWoche()` und `haushaltBeschliessen()`; ein Verlauf wird nicht gespeichert.
- Grafik-Vorbild im Projekt: `src/ui/components/bundestag.js` (SVG ohne Bibliothek).

## Vorab entscheiden (Nutzer fragen)
1. Nur eigene Partei (Vorschlag) oder alle Parteien?
2. Wie viele Punkte maximal? Eine lange Partie hat viele Wochen und Jahre; Vorschlag: alle behalten (ein Wert je Schritt ist klein), sonst die letzten 100.
3. Neues Feld → Version erhöhen, Spielstände gehen verloren. In Ordnung? (Am besten zusammen mit F05 und F10.)

## Umsetzung
1. `state.js`: Feld `verlauf: [{ schritt, anteil, wahl?: true }]`.
2. Engine: nach jeder Aktion, die `anteile` ändert, einen Eintrag anhängen — an einer Stelle, nicht in jeder Aktion einzeln (z. B. kleine Hilfsfunktion in `state.js`, von den Aktionen aufgerufen).
3. `src/ui/components/verlauf.js`: SVG-Linie, 5-%-Linie gestrichelt, Wahlen als Punkte, `role="img"` und `aria-label` mit Start- und Endwert.

## Tests
`tests/state.test.js`: Verlauf wächst um einen Eintrag je Aktion; Wahl ist markiert.

## Im Browser prüfen
Zwei Wochen spielen → Linie mit drei Punkten; auf 375 px Breite lesbar.

## Fertig, wenn
Tests grün, SPEC ergänzt.

## Nicht enthalten
Kein Zoom, keine Tooltips je Punkt.
