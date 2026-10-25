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
- **Zinsmarkt.** Es gibt keinen Kapitalmarkt (keine Zinskurve, keine Anleihen, keine Zinswende). Die Zinsausgaben wachsen
  mit dem Schuldenstand; dazu kommt seit Paket Klein ein gedämpfter **Zinsaufschlag** (`config.haushalt.zinsaufschlag`,
  Spielwerte): Er steigt, wenn die Schuldenquote über 70 % liegt oder der Bund mehr als 1,5 % des BIP neu leiht, passt sich
  je Jahr nur zu 30 % an, sinkt wieder, wenn sich die Lage bessert, und ist bei 30 % auf die Zinslast gedeckelt.
- **Vermittlungsausschuss.** Es gibt kein Verfahren mit Sitzungen und Einigungsvorschlag. Stattdessen seit Paket Mittel ein
  vereinfachter **Kompromiss im Bundesrat** (`config.kompromiss`, Spielwerte): Fehlen höchstens 15 Stimmen, stimmen die
  Länder einem Reformweg in abgeschwächter Fassung zu (60 % der Wirkung, 10 Kapital mehr) bzw. einer Steueränderung im
  Haushalt gegen eine einmalige Ausgleichszahlung von 2 Mrd. plus 10 Kapital. Fehlen mehr Stimmen, scheitert das Vorhaben.
- **Landtagswahlen** gibt es seit Paket Mittel (Einzelmodell, echte Termine bis 2030); Länderhaushalte weiterhin nicht.

Verbleibende Verzerrung: Verteidigungsausgaben über der Freigrenze zählen weiter nicht zur Schuldenbremse. Der
Zinsaufschlag verteuert diesen Weg inzwischen (Messung: Schuldenquote nach 12 Jahren im Mittel 82 % statt 84 %, Aufschlag
bis 28 %), eine Obergrenze für die Ausnahme gibt es aber nicht.
