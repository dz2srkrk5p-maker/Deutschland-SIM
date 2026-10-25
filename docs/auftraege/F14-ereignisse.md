# F14: Ereignisse in der Regierungszeit

## Voraussetzung
F12 (Runden). Mit F13 zusammen deutlich stärker (Ereignisse können Druck auf Probleme erhöhen).

## Ziel
Gelegentlich passiert etwas, auf das der Spieler mit einer von 2–3 Möglichkeiten reagiert. Jede Möglichkeit hat sichtbare Folgen (Umfrage, Haushalt, Koalition, Druck).

## Ausgangslage
- Zufall nur über `src/engine/rng.js`, Zustand im Spielstand.
- SPEC M8 nennt „Konjunktur“ u. a. unter „Nicht enthalten“; prüfen, welche Ereignisse das berühren.

## Vorab entscheiden (Nutzer fragen)
1. **Häufigkeit:** Vorschlag: Chance je Runde (z. B. 30 %), höchstens eins je Runde.
2. **Inhalt:** Der Nutzer legt die Ereignisse fest oder gibt die Vorschläge von Claude frei. Vorschlag: mit 8–10 anfangen. Keine echten Personen, keine Ereignisse, die reale Parteien verunglimpfen.
3. **Folgen:** welche Größen ein Ereignis ändern darf (Umfrage je Partei, Etat, Partner-Zufriedenheit, Druck aus F13). Alle Zahlen je Ereignis in den Daten, nicht im Code.
4. **Bedingungen:** Dürfen Ereignisse an Bedingungen hängen (z. B. „nur wenn Schulden hoch“)? Vorschlag: ja, einfache Bedingung je Ereignis.
5. **Ignorieren:** Muss der Spieler antworten, bevor es weitergeht? Vorschlag: ja, das ist einfacher als automatische Entscheidungen.
6. **Wiederholung:** Kann dasselbe Ereignis mehrmals kommen? Vorschlag: nicht in derselben Wahlperiode.

## Umsetzung
1. `src/data/ereignisse.js`: Liste mit id, Titel, Text, Bedingung, Möglichkeiten mit Folgen.
2. Engine `src/engine/ereignisse.js`: `ereignisZiehen(zustand)` beim Rundenwechsel (F12), `ereignisEntscheiden(zustand, { wahl })`. Folgen über bestehende Funktionen anwenden (`umverteilen`, `runden` aus `wahlkampf.js`), nicht neu erfinden.
3. Zustand: `offenesEreignis`, `ereignisseDieseWahlperiode`; Version erhöhen.
4. UI: Ereigniskarte auf dem Rundenbildschirm; jede Möglichkeit zeigt ihre Folgen **vor** dem Klick.
5. Balancing: Strategie „immer erste Möglichkeit“ und „zufällig“ im Skript.

## Tests
Ziehen ist mit gleichem Seed gleich; Bedingungen wirken; Folgen werden genau angewendet; keine Wiederholung je Wahlperiode.

## Fertig, wenn
Tests grün, SPEC-Abschnitt „System: Ereignisse“, Balancing-Bericht gezeigt.

## Nicht enthalten
Keine Ketten-Ereignisse, keine Affären mit Personen, keine Krisen über mehrere Runden.
