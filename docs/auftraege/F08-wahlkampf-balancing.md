# F08: Wahlkampf ohne Dauerstrategie

## Ziel
„Jede Woche Plakate“ soll nicht mehr die beste Strategie sein. Laut `docs/BALANCING.md` gewinnt CDU/CSU damit 43 % der Partien (auch als offene Frage in `docs/OFFENE-FRAGEN.md`).

## Ausgangslage
- `src/engine/wahlkampf.js` (`wirkung`, `wahlkampfWoche`), Zahlen in `config.wahlkampf`.
- SPEC M5 nennt „abnehmender Ertrag“ ausdrücklich unter „Nicht enthalten (bewusst)“. **Dieser Auftrag ändert also eine freigegebene Entscheidung.** Nur nach ausdrücklicher Zustimmung.

## Vorab entscheiden (Nutzer fragen)
Claude stellt diese Möglichkeiten mit Vor- und Nachteilen vor, der Nutzer wählt eine (oder keine):
1. **Abnehmender Ertrag:** dieselbe Aktion in Folge wirkt jedes Mal schwächer. Einfach, braucht ein Feld „letzte Aktionen“ im Spielstand.
2. **Lage-abhängig:** Angriff wirkt stärker auf Parteien, die gerade zugelegt haben; Kundgebung besser, wenn man knapp an der Hürde ist. Interessanter, schwerer zu balancieren.
3. **Budget:** Aktionen kosten Wahlkampfgeld, Plakate am teuersten. Neue Ressource, mehr UI.
4. **Nichts ändern**, nur die Schwierigkeitsanzeige (F06) ehrlich machen.

Danach: konkrete Zahlen vorschlagen, `npm run balancing` mit neuer Strategie-Spalte („abwechselnd“) laufen lassen, Ergebnis zeigen, erst dann freigeben.

## Umsetzung (je nach Wahl)
- Zahlen in `config.wahlkampf`, Regel in SPEC M5, „Nicht enthalten“ anpassen.
- Bei neuem Feld: Version erhöhen.
- UI `wahlkampf.js`: die erwartete Wirkung jeder Aktion **für diese Woche** anzeigen (nicht nur die Grundwerte), sonst merkt der Spieler den Effekt nicht.
- `scripts/balancing.js`: weitere Strategien, damit man sieht, dass keine eine klar beste ist.

## Tests
`tests/wahlkampf.test.js` für die neue Regel; bestehende Tests mit geänderten Zahlen bewusst anpassen und das im Bericht nennen.

## Fertig, wenn
Balancing-Bericht zeigt keine klar dominante Strategie mehr (Maßstab mit dem Nutzer festlegen), Tests grün.

## Nicht enthalten
Keine Themen, keine Regionen, keine Gegner-KI (bleiben bewusst draußen, außer der Nutzer entscheidet anders).
