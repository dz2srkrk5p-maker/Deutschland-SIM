# F02: Mögliche Mehrheiten

## Ziel
Auf dem Koalitionsbildschirm stehen alle Partner-Kombinationen, die zusammen die Mehrheit haben, mit Sitzen und Gesamtchance. Ein Klick darauf setzt die Häkchen. Heute muss man ausprobieren, und jede Absage sperrt den Partner.

## Ausgangslage
- `mehrheit()`, `chance()`, `moeglichePartner()` in `src/engine/koalition.js`.
- Bildschirm: `src/ui/screens/koalition.js` (Checkboxen, laufende Summe).

## Vorab entscheiden (Nutzer fragen)
1. Nur „minimale“ Kombinationen zeigen (kein Partner überflüssig) oder alle? Vorschlag: nur minimale, sonst wird die Liste lang.
2. Gesamtchance = Produkt der Einzelchancen. So rechnet `verhandeln()` tatsächlich (jeder Partner würfelt einzeln). Bitte bestätigen, dass das so angezeigt werden soll.
3. Sortierung: nach Gesamtchance absteigend (Vorschlag) oder nach Sitzen?
4. Eigene Mehrheit: Zeile „Allein regieren“ zuerst.

## Umsetzung
1. Engine: reine Funktion `moeglicheKoalitionen(zustand)` in `src/engine/koalition.js`. Teilmengen von `moeglichePartner(zustand)` bilden (höchstens 2^6), Summe Sitze ≥ `mehrheit`, Gesamtchance, sortiert.
2. UI: Liste über den Checkboxen, jede Zeile mit Parteipunkten, Sitzen, Chance; Button „Auswählen“ setzt die Checkboxen (nicht direkt verhandeln, damit der Spieler bestätigt).
3. Abgelehnte Parteien (`zustand.abgelehnt`) und Brandmauer fallen automatisch heraus.

## Tests
`tests/koalition.test.js`: Startwerte 2025 → erwartete Kombinationen; minimal bedeutet, keine Kombination enthält eine andere; abgelehnte Partner fehlen; Chance = Produkt.

## Im Browser prüfen
Nach der Wahl Liste sichtbar, Klick setzt Häkchen, Summe stimmt; nach einer Absage verschwinden Kombinationen mit dieser Partei.

## Fertig, wenn
Tests grün, SPEC-Abschnitt „Oberfläche“ ergänzt.

## Nicht enthalten
Keine Änderung an den Chancen, keine Koalitionsinhalte.
