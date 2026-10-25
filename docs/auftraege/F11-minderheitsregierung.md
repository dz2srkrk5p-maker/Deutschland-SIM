# F11: Minderheitsregierung

## Voraussetzung
F10 (Abstimmungen im Bundestag) ist fertig.

## Ziel
Wer keine Mehrheit zusammenbekommt, kann trotzdem regieren, muss sich aber für jeden Haushalt Stimmen aus der Opposition holen. Heute endet das Spiel dann mit „Opposition“.

## Ausgangslage
- SPEC M6 nennt „Minderheitsregierung“ unter „Nicht enthalten (bewusst)“. **Änderung einer freigegebenen Entscheidung**, nur mit Zustimmung.
- Betroffen: `src/engine/koalition.js` (`verhandeln`, `mehrheitMoeglich`, Kanzlerwahl), `src/engine/wahl.js` (Übergang zu `opposition`), `src/engine/haushalt.js` (`haushaltBeschliessen`, `koalitionsbruch`), `src/ui/screens/koalition.js`, `haushalt.js`, `ende.js`, `scripts/balancing.js`.

## Vorab entscheiden (Nutzer fragen)
1. **Kanzlerwahl:** Das Grundgesetz kennt einen dritten Wahlgang mit relativer Mehrheit (Art. 63 Abs. 4, vor Übernahme nachprüfen). Im Spiel gibt es bisher nur 2 Wahlgänge. Wie soll ein Minderheitskanzler gewählt werden?
2. **Wer darf es:** Nur die stärkste Fraktion, oder jede Spielerpartei?
3. **Haushalt:** Was passiert, wenn der Haushalt im Bundestag durchfällt? Möglichkeiten: Umfrageverlust und neu versuchen / vorläufige Haushaltsführung (Vorjahr gilt weiter) / Neuwahl nach x Fehlschlägen.
4. **Duldung:** Sollen Oppositionsparteien für Zugeständnisse (z. B. höheres Etat in einem Ministerium) zustimmen? Wenn ja, welche Regel?
5. **Spielende:** Wann ist das Spiel dann noch verloren? Heute: keine Mehrheit = Niederlage. Neu z. B.: Spielerpartei nicht stärkste Kraft / unter 5 % / Neuwahl verloren.
6. **Koalitionsbruch:** Wenn ein Partner geht und die Mehrheit fehlt — heute Neuwahl, neu Weiterregieren als Minderheit?
7. Zahlen für alles oben → `config.minderheit`.

## Umsetzung
1. SPEC-Abschnitte M6, M8, M10 und „Nicht enthalten“ anpassen, Freigabe holen.
2. Engine: Feld `koalition.minderheit: true`; Kanzlerwahl-Erweiterung; `haushaltBeschliessen` ruft bei Minderheit `abstimmung()` (F10) auf und behandelt das Scheitern nach Regel 3.
3. UI Koalition: Knopf „Als Minderheitsregierung antreten“ mit Erklärung der Folgen.
4. UI Haushalt: Abstimmungsvorschau (Komponente aus F10), Beschluss-Knopf zeigt, ob es reicht.
5. `scripts/balancing.js`: Strategie mit Minderheitsregierung ergänzen; FDP/BSW-Siege beobachten (kleine Parteien waren schon einmal zu stark).

## Tests
Kanzlerwahl mit Minderheit; Haushalt besteht/scheitert; Spielende nach neuer Regel; bestehende Opposition-Tests bewusst anpassen.

## Im Browser prüfen
Partie mit kleiner Partei: keine Mehrheit → Minderheitsregierung → Haushalt scheitert bzw. gelingt sichtbar.

## Fertig, wenn
Tests grün, Balancing-Bericht neu erzeugt und vom Nutzer gesehen.

## Nicht enthalten
Kein Misstrauensvotum, keine Vertrauensfrage (eigene spätere Entscheidung).
