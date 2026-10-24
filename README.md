# Deutschland-Simulator v2

Browserbasierte politische Strategiesimulation: Wahlkampf, Regierungsbildung, Haushalt, Reformwege und Problemlagen der
Bundesrepublik. Reines JavaScript mit Vite, Tests mit Vitest, Spielstand im `localStorage`.

## Befehle
- Starten: `npm run dev`
- Tests: `npm test`
- Build: `npm run build`
- Balancing-Bericht (viele simulierte Partien, schreibt `docs/BALANCING.md`): `npm run balancing`
- Obsidian-Graph des Projekts: `npm run graph`

## Dokumente
- `docs/SPEC.md`: freigegebene Spielregeln
- `docs/PLAN.md`: Meilensteine und Stand
- `docs/BALANCING.md`: Ergebnisse der Simulation und alle Konstanten

## Herkunft der Werte
Startwerte (Wirtschaftskennzahlen 2025, Bundeshaushalt 2026, Steuereinnahmen, Wahlergebnis 2025, Bundesrat) und
Parteipositionen (Chapel Hill Expert Survey 2024) beruhen auf Quellen. Alle Wirkungen sind Spielwerte. Jeder Dateneintrag
in `src/data/` trägt dazu ein Feld `quelle` („Quelle: <Name, Jahr>“ oder „Spielwert“); im Spiel unter
Spielmenü → „Hilfe: Herkunft der Werte“.

## Bewusste Vereinfachungen
Diese Teile fehlen absichtlich, damit das Modell überschaubar bleibt:
- **Haushalte von Ländern und Gemeinden.** Gespielt wird nur der Bund. Gewerbe-, Erbschaft- und Vermögensteuer lassen sich
  per Bundesgesetz ändern, ihr Aufkommen fließt aber nicht in den Bundeshaushalt; sie wirken nur über Gruppen, Verteilung
  und Probleme. Das Defizit der übrigen Ebenen ist ein fester Anteil des BIP (`config.wirtschaft.uebrigesDefizitBip`).
- **Zinsmarkt.** Die Zinsausgaben wachsen mit dem Schuldenstand zu einem festen Satz. Es gibt keine Risikoaufschläge,
  keine Zinswende und keine Reaktion der Märkte auf hohe Schulden.
- **Vermittlungsausschuss.** Fehlt im Bundesrat die Mehrheit für ein Zustimmungsgesetz, ist das Vorhaben gescheitert;
  es gibt keine Kompromissrunde.

Mögliche Verzerrung (Empfehlung, nicht umgesetzt): Weil hohe Schulden keine steigenden Zinsen auslösen, ist Verschuldung
im Spiel billiger als in der Wirklichkeit. Besonders sichtbar bei Verteidigungsausgaben über der Freigrenze, die nicht
zur Schuldenbremse zählen: Jährlich maximal erhöht steigt die Schuldenquote in 12 Jahren auf über 90 %, ohne dass die
Zinslast überproportional wächst. Ein Zinsaufschlag ab einer Schuldenquote (oder eine Obergrenze für die Ausnahme)
würde das Balancing realistischer machen.
