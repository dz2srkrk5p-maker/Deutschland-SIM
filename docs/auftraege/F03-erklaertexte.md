# F03: Erklärtexte je Bildschirm

## Ziel
Oben auf jedem Bildschirm 1–2 Sätze: was hier zu tun ist und worauf es ankommt. Auf dem Startbildschirm das Spielziel. Ausblendbar.

## Ausgangslage
- Bildschirme: `src/ui/screens/start.js`, `wahlkampf.js`, `koalition.js`, `kabinett.js`, `haushalt.js`, `ende.js`.
- Das Ziel „12 Jahre Kanzler“ steht heute nur auf dem Endbildschirm.

## Vorab entscheiden (Nutzer fragen)
1. Die Texte schreibt der Nutzer oder Claude schlägt sie vor und der Nutzer gibt frei? Vorschlag: Claude schlägt vor, alle Texte auf einmal zur Freigabe zeigen.
2. Ausblenden: ein Schalter „Hinweise aus“ für alle (Vorschlag) oder je Bildschirm?
3. Wo gemerkt: `localStorage`, eigener Schlüssel `desim-hinweise` (Vorschlag), nicht im Spielstand.

## Umsetzung
1. Texte als Daten in `src/data/hinweise.js` (ein Eintrag je Phase). Zahlen in den Texten (8 Wochen, 316 Sitze, 12 Jahre) aus `config.js` einsetzen, nicht hart schreiben.
2. Kleine Komponente `src/ui/components/hinweis.js`, die Box mit Text und „Ausblenden“-Knopf (min. 44 px).
3. Speichern/Lesen in `src/storage/speicher.js` mit try/catch wie die übrigen Funktionen.
4. Auf dem Startbildschirm Knopf „Hinweise wieder anzeigen“, wenn ausgeblendet.

## Tests
`tests/speicher.test.js`: Schalter wird gemerkt, gesperrter Speicher bricht nichts. Optional `tests/daten.test.js`: jede Phase hat einen Hinweis.

## Im Browser prüfen
Neues Spiel → Hinweise sichtbar; ausblenden → nach Neuladen weg; wieder einblenden geht.

## Fertig, wenn
Texte freigegeben, Tests grün.

## Nicht enthalten
Keine geführte Tour, keine Checkliste, keine Pfeile auf Elemente.
