# Offene Fragen

## Geklärt
- [x] Feste Sitzzahl 630 – bestätigt durch Ergebnis BTW 2025 (Bundeswahlleiterin), 2026-10-20
- [x] Ergebnis BTW 2025 je Partei – übernommen, siehe SPEC.md, 2026-10-20
- [x] Welche Parteien – Union, AfD, SPD, Grüne, Linke, BSW, FDP, Sonstige; SSW weggelassen, 2026-10-20
- [x] Landesregierungen der 16 Länder – Stand 24.09.2026 übernommen, siehe SPEC.md (M9), 2026-10-21
- [x] Balancing: Kleine Parteien zu leicht Kanzler, Kürzen bei Partnern zu billig – gelöst durch Größenfaktor, Kürzung −0,05/Mrd., Bruchgrenze 1,5 (freigegeben 2026-10-21). „Abnutzung im Amt“ abgelehnt. Ergebnis: FDP-Siege 68 % → 1 %, Koalitionsbruch beim Kürzen bis 100 % der SPD-Regierungen.

## Offen
- [ ] Idee des Nutzers (2026-10-21, bei F06): Die Brandmauer soll beendet werden können. Folge je nach Stimmung im Volk: Unruhen und deutlich sinkende Beliebtheit der Partei, die mit der AfD koaliert. Neue Spielregel, eigener Auftrag nötig (Regeln, Zahlen, Stimmungswert). Bis dahin zeigt der Startbildschirm bei der AfD „fast unmöglich – Brandmauer“.
- [ ] Berlin, Sachsen-Anhalt, Mecklenburg-Vorpommern: Neue Landesregierungen nach den Wahlen vom September 2026 stehen noch aus. Bei Bildung `src/data/laender.js` aktualisieren.
- [ ] Nach eigenem Probespielen prüfen: CDU/CSU gewinnt mit „immer Plakate“ 43 % der Partien – zu leicht? Linke, BSW, AfD fast oder ganz chancenlos (bewusst so belassen). Schwierigkeitsanzeige auf dem Startbildschirm: erledigt mit F06 (2026-10-21).
- [ ] Wunsch des Nutzers (2026-10-25): parlamentarischer Prozess für Gesetze. Umgesetzt ist nur der Zeitstrahl der vorhandenen Schritte (Beschluss sofort, dann Umsetzung). Ein echtes Verfahren über mehrere Quartale (1. Lesung, Ausschuss, 2./3. Lesung, Bundesrat, ggf. Vermittlung, Scheitern unterwegs) wäre eine neue Spielregel: Stufen, Dauern und Zahlen müssten vorgeschlagen und freigegeben werden.
- [x] Freigegeben und umgesetzt 2026-10-25 (siehe SPEC), Wunsch des Nutzers „feinere Schritte bei den Steuern“: %-Sätze (Einkommensteuer-Tarif, Abgeltung-, Körperschaft-, Umsatzsteuer, Gewerbe-Messzahl, Vermögensteuer) in 0,1-Punkt-Schritten, Energie-/Verbrauchsteuern 1 %, CO2-Preis 1 €/t, Erbschaftsteuer 0,25 Stufen, Privatisierung 0,5 Mrd., Rentenbeitrag bleibt 0,1. Aufkommen und Wirkung je Schritt anteilig; Ausweichen so umgerechnet, dass an den bisherigen Stufen dieselben Werte entstehen, dazwischen linear. Min/Max und Jahresgrenzen in Punkten unverändert. Spielstand-Version 21 rechnet alte Stufen um.
- [x] Freigegeben und umgesetzt 2026-10-25 (siehe SPEC), Wunsch des Nutzers „Zustimmung der Verbände zu Steueränderungen“ (neue Spielregel, Spielwerte): Haltung −2 bis +2 aus der Gesamtwirkung des Entwurfs – Gewerkschaften = Wirkung auf Arbeitnehmer ÷ 3, Wirtschaftsverbände = Unternehmen ÷ 3, Sozialverbände = Geringverdiener ÷ 3, Bauernverband = Landwirtschaft ÷ 3, Umweltverbände = −(Wirkung auf Klimafolgen) ÷ 2, EU-Kommission neutral. Wirkung beim Beschluss nur auf das politische Kapital (−3 je Verband „dagegen“ ab −1, +1 je Verband „dafür“ ab +1), nicht auf Umfragen, weil die Gruppen dort schon zählen.
