# F05: Wahlabend mit Veränderung und Wahlkampfbilanz

## Ziel
Nach der Wahl sieht der Spieler je Partei die Veränderung zur letzten Wahl und, was sein Wahlkampf netto gebracht hat.

## Ausgangslage
- Wahl: `wahl()` in `src/engine/wahl.js`, danach Bildschirm `src/ui/screens/koalition.js`.
- Der Spielzustand kennt kein früheres Ergebnis. Erste Wahl: Vergleich mit den Startwerten 2025 aus `src/data/parteien.js`.
- Der Wahlkampf beginnt bei Woche 1 (`zurueckInDenWahlkampf` in `src/engine/state.js`).

## Vorab entscheiden (Nutzer fragen)
1. Vergleich bei der ersten Wahl: gegen das Ergebnis 2025 (Vorschlag)?
2. Bilanz „Wahlkampf“: Anteil am Ende von Woche 8 minus Anteil vor Woche 1. Diese Zahl enthält auch die Schwankung, ist also nicht „nur dein Verdienst“. Reicht das (Vorschlag), oder soll die feste Wirkung der Aktionen getrennt von der Schwankung gezählt werden (mehr Aufwand)?
3. Neue Felder im Spielstand → `ZUSTAND_VERSION` steigt, gespeicherte Spiele gehen verloren. In Ordnung?

## Umsetzung
1. `state.js`: Felder `letzteWahl` (Anteile der letzten Wahl, Start: Werte 2025) und `wahlkampfStart` (Anteile bei Woche 1). Version erhöhen.
2. `zurueckInDenWahlkampf` und `neuesSpiel` setzen `wahlkampfStart`; `wahl()` schreibt nach der Auswertung `letzteWahl` — aber erst **nachdem** der Bildschirm den Vergleich anzeigen konnte. Dafür `vorigeWahl` getrennt speichern oder den Vergleich in `wahl()` als Feld `wahlergebnis: { anteile, veraenderung }` ablegen. Einfachste saubere Lösung wählen und begründen.
3. UI `koalition.js`: Tabelle Partei | Stimmen | ± | Sitze, darüber „Euer Wahlkampf: +x,xx Punkte“.

## Tests
`tests/wahl.test.js`: Veränderung bei der ersten Wahl gegen 2025, bei der zweiten gegen die erste; `tests/state.test.js`: neue Version, alte Spielstände werden abgelehnt.

## Im Browser prüfen
Eine Wahlperiode durchspielen, zweite Wahl zeigt Veränderung gegenüber der ersten.

## Fertig, wenn
Tests grün, SPEC ergänzt (Spielzustand und Oberfläche).

## Nicht enthalten
Keine Wahlbeteiligung, keine Wählerwanderung, keine Hochrechnung als Animation.
