# F10: Abstimmungen im Bundestag (Grundlage)

## Ziel
Ein wiederverwendbarer Baustein: „Wie stimmt der Bundestag über Vorlage X ab?“ Gebraucht von der Minderheitsregierung (F11) und den Reformpfaden (F13). Für sich allein kaum sichtbar.

## Ausgangslage
- Heute wird im Bundestag nur der Kanzler gewählt (`src/engine/koalition.js`). Der Haushalt gilt ohne Abstimmung als beschlossen.
- Bundesrat-Abstimmung als Vorbild: `src/engine/bundesrat.js` (ohne Zufall, klar nachvollziehbar).

## Vorab entscheiden (Nutzer fragen)
1. Stimmen die Koalitionsfraktionen immer geschlossen mit Ja? Vorschlag: ja (Abweichler gibt es schon bei der Kanzlerwahl, hier nicht nötig).
2. Wie stimmen Oppositionsfraktionen? Möglichkeiten:
   a) immer Nein (einfach, macht F11 sinnlos),
   b) nach Abstand in der Sitzordnung, wie die Koalitionschance (passt zum bestehenden System),
   c) nach Inhalt der Vorlage (braucht Positionen je Partei, erst mit F13 sinnvoll).
   Vorschlag: b) jetzt, c) später als Erweiterung.
3. Zufall oder fest? Vorschlag: fest wie der Bundesrat, damit der Spieler das Ergebnis vorher sehen kann.
4. Brandmauer: Darf eine Vorlage mit AfD-Stimmen durchgehen? Spielentscheidung, Nutzer fragen.
5. Soll der Haushalt ab jetzt auch im Bundestag abgestimmt werden? Bei Koalition mit Mehrheit ändert sich nichts; wichtig erst mit F11.

## Umsetzung
1. `src/engine/bundestag.js`: reine Funktion `abstimmung(zustand, vorlage)` → `{ ja, nein, enthaltung, angenommen, fraktionen: [{ id, sitze, stimme }] }`. Mehrheit = einfache Mehrheit der abgegebenen Stimmen oder `mehrheit()` (Nutzer fragen; der Haushalt braucht echt nur die einfache Mehrheit).
2. Zahlen in `config.bundestag`.
3. UI-Komponente `src/ui/components/abstimmung.js`: Fraktionen mit Ja/Nein, Summe, Ergebnis. Später in F11/F13 eingebunden.

## Tests
`tests/bundestag.test.js` erweitern: Koalition mit Mehrheit nimmt immer an; Beispiele für b); Brandmauer-Regel.

## Fertig, wenn
Tests grün, SPEC-Abschnitt „System: Bundestag-Abstimmung“ angelegt.

## Nicht enthalten
Keine Ausschüsse, keine Lesungen, keine Fraktionsdisziplin-Werte.
