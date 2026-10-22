# PLAN: Meilensteine

Nach `../Anweisungen/11-meilensteine.md`, ohne Altcode: M12 (Paritätsprüfung) entfällt. Vor jedem System-Meilenstein werden dessen Regeln mit dem Nutzer festgelegt und in SPEC.md eingetragen.

| Nr | Meilenstein | Prüfbar durch | Stand |
|----|-------------|---------------|-------|
| M0 | Projektgerüst: Ordner, Build, Test-Runner, `config.js`, leere Startseite | `npm run dev` zeigt Seite, `npm test` läuft | fertig |
| M1 | Daten: Parteien, Länder, Ministerien, Konstanten (geprüft an Quellen) | Datentabellen stimmen mit SPEC überein | fertig |
| M2 | Zustand und Zufall: Anfangszustand, Serialisierung, Seed-RNG | Test: Zustand speichern und laden | fertig |
| M3 | Wahl und Sitzverteilung | Tests grün, Zahlen auf Seite | fertig |
| M4 | Bundestag-Visualisierung | Grafik zeigt Sitzverteilung aus M3 | fertig |
| M5 | Wahlkampf mit UI | Wahlkampf spielbar, Stimmanteile ändern sich | fertig |
| M6 | Koalition und Kanzlerwahl | Regierungsbildung nach einer Wahl spielbar | fertig |
| M7 | Kabinett | Ministerien verteilbar | fertig |
| M8 | Haushalt | Budget planbar, Folgen sichtbar | fertig |
| M9 | Bundesrat | Bildschirm und Mehrheiten | fertig |
| M10 | Game Over und Balancing | Alle Bedingungen testbar | fertig |
| M11 | Speichern/Laden in der UI, Spielablauf komplett | Durchlauf von Start bis Ende | fertig |

## Features nach M11 (siehe `docs/auftraege/`)

| Nr | Feature | Stand |
|----|---------|-------|
| F01 | Warnung vor Koalitionsbruch im Haushalt | fertig (2026-10-21) |
| F02 | Mögliche Mehrheiten bei der Regierungsbildung | fertig (2026-10-21) |
| F03 | Erklärtexte je Bildschirm | fertig (2026-10-21) |
| F04 | Bedienbarkeit (Fokus, Screenreader-Ansage, Kontrast) | fertig (2026-10-21), Sprachausgabe vom Nutzer geprüft |
| F05 | Wahlabend mit Veränderung und Wahlkampfbilanz (Spielstand-Version 2) | fertig (2026-10-21) |
| F06 | Schwierigkeitsanzeige je Partei | fertig (2026-10-21) |
| F07 | Partie teilen über den Seed (Spielstand-Version 3) | fertig (2026-10-21) |
| F08 | Wahlkampf ohne Dauerstrategie: abnehmender Ertrag (Spielstand-Version 4) | fertig (2026-10-21) |
| F09 | Umfrageverlauf als Linie (Spielstand-Version 5) | fertig (2026-10-21) |
| F10 | Abstimmungen im Bundestag (Grundlage), Haushalt braucht Mehrheit | fertig (2026-10-21) |
| F11 | Minderheitsregierung, Brandmauer bei Abstimmungen (Spielstand-Version 6) | fertig (2026-10-22) |
| F12 | Regierungsjahr in Quartalen, Haushalt im 4. Quartal (Spielstand-Version 7) | fertig (2026-10-22) |
| F13 | Probleme und Reformpfade, Reformkosten im Haushalt (Spielstand-Version 8) | fertig (2026-10-22) |
| F14 | Ereignisse in der Regierungszeit (Spielstand-Version 9) | fertig (2026-10-22) |
| F15 | Nachrichtenticker aus dem Spielstand | fertig (2026-10-22) |
| UI | Umbau der Oberfläche: App-Shell, Navigation, Design-System, Dark Mode | fertig (2026-10-22) |
