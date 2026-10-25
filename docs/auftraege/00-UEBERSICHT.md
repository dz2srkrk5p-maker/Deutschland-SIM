# Aufträge für neue Features

Jede Datei hier ist ein eigener Auftrag für Claude Code. Immer nur **einen** Auftrag pro Sitzung geben, in der Reihenfolge unten.

## So startest du einen Auftrag
In Claude Code (im Ordner `deutschland-sim-v2`) schreiben:

> Lies `docs/auftraege/F01-koalitionsbruch-warnung.md` und setze den Auftrag um. Halte dich an CLAUDE.md.

Claude stellt zuerst die Fragen aus dem Abschnitt „Vorab entscheiden“. Erst wenn du sie beantwortet hast, wird gebaut. Die Antworten kommen in `docs/SPEC.md`.

## Regeln, die für alle Aufträge gelten
- `CLAUDE.md` geht vor. Vor allem: nichts erfinden, Zahlen nur nach deiner Freigabe, alle Zahlen in `src/data/config.js`, Engine ohne UI und ohne `Math.random`.
- Die Zahlen und Texte in den Aufträgen sind **Vorschläge**, keine Freigaben.
- Nichts aus anderen Spielen übernehmen (Texte, Namen, Zahlen). Nur eigene Ideen.
- Nach jedem Auftrag: `npm test` grün, im Browser geprüft, `docs/PLAN.md` ergänzt, dann stoppen.
- Ändert sich die Form des Spielzustands: `ZUSTAND_VERSION` in `src/engine/state.js` erhöhen. **Folge: Alle gespeicherten Spiele werden verworfen.** Claude muss dich vorher darauf hinweisen.
- Nach Aufträgen, die Spielregeln ändern: `npm run balancing` laufen lassen und die Ergebnisse zeigen, bevor die Zahlen festgelegt werden.

## Reihenfolge

| Nr | Auftrag | Größe | Ändert Regeln? | Ändert Spielstand? |
|----|---------|-------|----------------|--------------------|
| F01 | Warnung vor Koalitionsbruch | S | nein | nein |
| F02 | Mögliche Mehrheiten | S | nein | nein |
| F03 | Erklärtexte je Bildschirm | S | nein | nein |
| F04 | Bedienbarkeit (Fokus, Screenreader) | S | nein | nein |
| F05 | Wahlabend mit Veränderung und Bilanz | S–M | nein | ja |
| F06 | Schwierigkeitsanzeige je Partei | S | nein | nein |
| F07 | Partie teilen über den Seed | S | nein | nein |
| F08 | Wahlkampf ohne Dauerstrategie | M | ja | evtl. |
| F09 | Umfrageverlauf als Linie | M | nein | ja |
| F10 | Abstimmungen im Bundestag (Grundlage) | M | ja | ja |
| F11 | Minderheitsregierung | M | ja | ja |
| F12 | Regierungsjahr in Runden (Grundlage) | M | ja | ja |
| F13 | Reformpfade | L | ja | ja |
| F14 | Ereignisse in der Regierungszeit | L | ja | ja |
| F15 | Nachrichtenticker | M | nein | ja |

F10 und F12 sind keine sichtbaren Features, sondern Grundlagen: F11 braucht F10, F13 braucht F10 und F12, F14 braucht F12, F15 lohnt sich erst nach F14.

Vorschlag: F05, F09 und F10 gemeinsam planen, damit die Spielstand-Version nicht dreimal hintereinander erhöht wird. Oder bewusst in Kauf nehmen, solange niemand außer dir spielt.

## Grobe Dauer
F01–F07: 1–2 Wochen. F08–F12: 2–3 Wochen. F13–F15: 4–6 Wochen, vor allem wegen Inhalt und Balancing.
