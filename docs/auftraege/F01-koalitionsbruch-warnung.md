# F01: Warnung vor Koalitionsbruch

## Ziel
Der Spieler sieht im Haushalt, wie nah jeder Partner am Koalitionsbruch ist, und ob der geplante Haushalt ihn darüber schiebt. Heute kommt der Bruch ohne Vorwarnung, obwohl die Regel fest ist (SPEC, „Spielende“).

## Ausgangslage
- Regel: Partner geht, wenn `koalition.startAnteile[id] − anteile[id]` größer als `config.spielende.koalitionsbruchPunkte` (1,5) ist, geprüft in `koalitionsbruch()` in `src/engine/haushalt.js`, gerechnet in Tausendsteln.
- `vorschau()` in `src/engine/haushalt.js` liefert schon die Wirkung je Partei.
- Bildschirm: `src/ui/screens/haushalt.js`.

## Vorab entscheiden (Nutzer fragen)
1. Wo soll die Anzeige stehen: eigener Block „Koalition“ über „Wirkung auf die Umfragen“ (Vorschlag) oder je Partei in der Wirkungszeile?
2. Ab wann gilt ein Partner als „gefährdet“ (gelb)? Vorschlag: ab der Hälfte der Grenze. Die Zahl käme als `warnAnteil` in `config.spielende`.
3. Die Vorschau zeigt nur die **feste** Wirkung; danach kommt noch die zufällige Schwankung ±0,3. Soll das als Hinweis dastehen („kann durch Schwankung abweichen“)? Vorschlag: ja.

## Umsetzung
1. Engine: reine Funktion `bruchAbstand(zustand, anteile)` in `src/engine/haushalt.js`, gibt je Partner `{ id, verlust, grenze }` zurück. Dieselbe Rechnung wie `koalitionsbruch()` nutzen, nicht doppelt schreiben (`koalitionsbruch()` darauf umstellen).
2. Engine: Vorschau um die Anteile nach fester Wirkung erweitern, falls noch nicht vorhanden, damit `bruchAbstand` auf dem Plan-Zustand rechnen kann.
3. UI: je Partner eine Zeile „SPD: −0,8 von −1,5 Punkten“ jetzt und nach diesem Haushalt, Farbe grün/gelb/rot. Text bei Rot: „würde die Koalition verlassen“.
4. Bei Alleinregierung den Block nicht anzeigen.

## Tests
- `tests/haushalt.test.js`: `bruchAbstand` liefert dieselben Grenzfälle wie `koalitionsbruch` (−1,50 bleibt, −1,51 geht).
- Kein bestehender Test darf sich ändern.

## Im Browser prüfen
Partie mit Koalition, beim Partner-Ministerium stark kürzen: Zeile wird gelb bzw. rot, bevor man beschließt.

## Fertig, wenn
Tests grün, Anzeige stimmt mit dem tatsächlichen Bruch nach Beschluss überein (ohne Schwankung), SPEC-Abschnitt „Oberfläche“ ergänzt.

## Nicht enthalten
Keine neue Regel, kein Einspruch der Partner, keine Änderung an der Grenze.
