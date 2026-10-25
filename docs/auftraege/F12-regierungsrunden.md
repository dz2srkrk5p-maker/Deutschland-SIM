# F12: Regierungsjahr in Runden (Grundlage)

## Ziel
Ein Regierungsjahr besteht nicht mehr nur aus dem Haushalt, sondern aus mehreren Runden, in denen etwas passiert. Grundlage für Reformpfade (F13) und Ereignisse (F14). Ohne diesen Schritt haben beide keinen Platz im Ablauf.

## Ausgangslage
- Phase `regierung` = genau ein Bildschirm (`src/ui/screens/haushalt.js`) und eine Aktion (`haushaltBeschliessen`), viermal je Wahlperiode.
- Zählung: `haushalt.jahr`, `statistik.jahreKanzler` (Sieg bei 12).

## Vorab entscheiden (Nutzer fragen)
1. Wie viele Runden je Jahr? Vorschläge: 4 Quartale (übersichtlich) oder 12 Monate (feiner, aber viele Klicks). Vorschlag: 4 Quartale, Haushalt im letzten Quartal.
2. Was tut der Spieler in einer Runde, solange F13/F14 fehlen? Vorschlag: nur „Weiter“; damit ist F12 allein noch kein Gewinn, aber auch kein Schaden. Alternative: F12 erst zusammen mit F13 ausliefern.
3. Wirkt Zeit allein auf die Umfrage (z. B. Schwankung je Runde)? Vorschlag: nein, nur die bisherige Schwankung beim Haushalt.

## Umsetzung
1. `state.js`: Feld `runde` innerhalb des Jahres; Version erhöhen.
2. Engine: Aktion `rundeBeenden(zustand)`; in der letzten Runde des Jahres ist nur `haushaltBeschliessen` erlaubt. Alle bestehenden Abläufe (Sieg, Koalitionsbruch, Ende der Wahlperiode) bleiben am Haushalt hängen.
3. UI: neuer Bildschirm `src/ui/screens/regierung.js` als Übersicht der Runde (Jahr, Runde, Koalition, Umfrage, Knopf „Weiter“); im letzten Quartal öffnet er den Haushalt. Weiche in `src/ui/app.js` anpassen.
4. Protokoll mit Rundenangabe.

## Tests
`tests/spielablauf.test.js`: Jahr = n Runden + Haushalt; Sieg weiterhin nach 12 Haushaltsjahren; Wahlperiode endet nach 4 Jahren.

## Im Browser prüfen
Ein Jahr durchklicken, Haushalt kommt im letzten Quartal, alles Weitere wie bisher.

## Fertig, wenn
Alle bestehenden Tests grün (nötige Anpassungen im Bericht genannt), SPEC ergänzt.

## Nicht enthalten
Noch keine Inhalte in den Runden — die kommen mit F13 und F14.
