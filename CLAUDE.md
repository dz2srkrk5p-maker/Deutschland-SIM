# CLAUDE.md: Deutschland-Simulator v2

## Projekt
Browserbasierte politische Strategiesimulation zu Deutschland. Neubau eines früheren Spiels, dessen Code verloren ist. Es gibt keine Vorlage: Spielregeln entstehen hier neu, nach Entscheidungen des Nutzers.

## Nutzer
Solo-Entwickler ohne Softwarehintergrund. Antworte auf Deutsch, knapp, ohne Füllsätze. Erkläre Entscheidungen in einfachen Worten. Sag offen, wenn du etwas nicht weißt.

## Harte Regeln
1. Nichts erfinden. Spielregeln, Formeln und Zahlen werden vorgeschlagen und vom Nutzer freigegeben, bevor sie in den Code kommen. Jede freigegebene Regel steht in `docs/SPEC.md`. Unklares kommt in `docs/OFFENE-FRAGEN.md`.
2. Reale Fakten (Sitzzahl, Wahlergebnisse, Bundesratsstimmen) vor der Übernahme an einer Quelle prüfen, nicht aus dem Gedächtnis. Quelle in `config.js` bzw. der Datendatei als Kommentar.
3. Engine und UI strikt trennen. Der Ordner `src/engine/` importiert nichts aus `src/ui/`, nichts aus dem DOM, keine UI-Bibliothek. Abgesichert durch `tests/architektur.test.js`.
4. Alle Balancing-Zahlen stehen in `src/data/config.js`. Keine Magic Numbers im Code.
5. Der Spielzustand ist ein reines, serialisierbares Objekt (JSON). Aktionen sind Funktionen `(state, params) => { state, ereignisse }`, ohne versteckte Seiteneffekte.
6. Zufall läuft über einen Seed-fähigen Zufallsgenerator in `src/engine/rng.js`, damit Tests reproduzierbar sind. Kein `Math.random` in der Engine.
7. Nach jedem Meilenstein stoppen, in 3 bis 5 Sätzen sagen, was jetzt geht und wie der Nutzer es im Browser prüft, dann auf Freigabe warten.
8. Nie behaupten, etwas funktioniere, ohne es ausgeführt oder getestet zu haben.
9. Regeln für ein System erst abfragen, wenn das System laut `docs/PLAN.md` dran ist.

## Technik
Vite, reines JavaScript (kein React), Vitest. Speichern über `localStorage`.

## Befehle
- Starten: `npm run dev`
- Tests: `npm test`
- Build: `npm run build`

## Dokumente
- `../Anweisungen/` – ursprüngliches Bauplan-Paket. Gilt für Aufbau und Systemliste; alle Stellen „aus dem Altcode zu extrahieren“ werden stattdessen als Fragen an den Nutzer behandelt. Paritätsprüfung (Datei 10, Teil 2) entfällt.
- `docs/SPEC.md` – freigegebene Spielregeln.
- `docs/PLAN.md` – Meilensteine und Stand.
- `docs/OFFENE-FRAGEN.md` – ungeklärte Punkte.
