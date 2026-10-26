# Epochen-System: Vorgabe des Nutzers (Spieler-Hilfetext)

Vom Nutzer am 2026-10-26 erneut eingefügt (Original vom 2026-10-25). Zahlen und Regeln sind verbindlich; alles, was hier
nicht steht, ist offen und wird nicht still erfunden (`// TODO-BALANCE` in `src/data/config.js`). Antworten auf die
Rückfragen und spätere Freigaben: `docs/SPEC.md`, `docs/OFFENE-FRAGEN.md`.

## Umgang mit Lücken (aus dem Auftrag)
Nicht in der Spec, daher `TODO-BALANCE` mit begründetem Startwert: Stärke von Rückenwind und Hypothek;
Zustimmungsverlust beim Kurswechsel; Stärken, Schwächen und Boni der Merkmale; Kostensteigerung nach einem Meilenstein,
Höhe der jährlichen Baukosten; Kurve des Verblassens (Spec: über zwei Jahre); Auswirkung der Auswanderung pro Jahr.
Inhalte (Epochen, Wege, Merkmale, Großprojekte, Generationenketten) entscheidet der Nutzer; bis dahin kleine,
gekennzeichnete Platzhalter (zwei Epochen, je drei Wege, einige Merkmale, zwei Großprojekte).

## Qualitätsregeln (aus dem Auftrag)
- Neutralität: Wege und Epochen begünstigen oder benachteiligen keine Partei erkennbar; im Zweifel generisch.
- Headless-Lauf über mindestens 30 Spieljahre ohne Fehler; Invarianten: höchstens zwei Epochen, sechs Merkmale, zwei
  Großprojekte, 26 aktive Probleme; Merkmale verschwinden nach Aufhebung der tragenden Gesetze.
- Keine Regressionen an Wahl, Koalition, Haushalt, Bundesrat. Spieltexte auf Deutsch. Kein Umbau ohne Not.
- Bericht je Etappe: erledigt / nicht erledigt, geänderte Dateien, neue `TODO-BALANCE`-Parameter, offene Fragen.

## Etappen (Vorschlag des Nutzers)
1. Konfig und Datenmodell: alle Zahlen aus der Spec in einer Konfigdatei, Inhalte (Epochen, Wege, Merkmale, Großprojekte) in getrennten Datendateien. Keine Magic Numbers im Code.
2. Epochen-Kern: Epochenstart etwa alle zehn Jahre, epocheneigene Probleme verteilt über die ersten Jahre, Streitfrage, höchstens zwei Epochen gleichzeitig, Titelseite, Zeile in der rechten Spalte, Reiter „Euer Land".
3. Weichen, Wege, Aufgabe, Fortschritt: Wahl, Aufschub, automatische Wahl nach drei Monaten, Regierung wählt in der Opposition, Fortschritt samt Prognose „bei diesem Tempo", Rückenwind/Hypothek, Kurswechsel (ab Stufe 3), zweiter Weg (Stufe 4).
4. Merkmale und Landesprofil: Vergabe, Maximum, Stärken/Schwächen, Verblassen.
5. Generationen, Ursachen, Wertverlust: Stammbaum der Probleme, Ergänzungsregel, 3-%-Verlust.
6. Sozialbeiträge: Finanzierung „über Beiträge" außerhalb des Bundeshaushalts, Rückkopplung auf „Steigende Sozialbeiträge".
7. Großprojekte: Laufzeit, Baukosten, Meilensteine, Kostensteigerung, Untersuchungsausschuss, Übernahme-Entscheidung.
8. Bestandsstufen, Bevölkerung, Problem-Obergrenze: Stufen bei 40/60/70/85, Auswanderung, schrumpfendes/wachsendes Land, Obergrenze 26 aktive Probleme.
9. UI-Feinschliff und Bilanz der Legislatur.

## Spezifikation (verbindlich bei Zahlen und Regeln)

### Epochen und euer Land
**Epoche:** Etwa alle zehn Jahre beginnt eine neue Zeit, zum Beispiel die große Verrentung, Festung Europa oder der Endspurt zur Klimaneutralität. Eine Epoche bringt eigene Probleme mit, verteilt über die ersten Jahre, und macht eine Streitfrage laut. Höchstens zwei Epochen laufen gleichzeitig. Eine Titelseite kündigt sie an. Danach steht sie als kurze Zeile in der rechten Spalte, alles Weitere im Reiter „Euer Land".

**Weiche:** Zu Beginn einer Epoche wählt ihr, welchen Weg euer Land geht: drei Wege, auf Stufe 1 zwei. Jeder Weg hat eine Aufgabe bis zum Ende der Epoche, eine Stärke, eine Schwäche und ein Merkmal. Seine Schwerpunkt-Ansätze wirken 10 % stärker. Ihr könnt die Wahl aufschieben; nach drei Monaten nimmt eure Partei den Weg, der zum Programm passt. In der Opposition wählt die Regierung.

**Aufgabe und Fortschritt:** Im Reiter „Euer Land" und unter Kabinett › Missionen seht ihr, wie viel der Aufgabe erreicht ist und wohin es bei diesem Tempo geht. Gelingt sie, beginnt die nächste Epoche mit Rückenwind (ihre Probleme starten leichter), verfehlt ihr sie, mit einer Hypothek. Die Bilanz der Legislatur zeigt, wie eine Epoche ausgegangen ist.

**Kurswechsel und zwei Wege:** Ab Stufe 3 könnt ihr einmal je Epoche den Weg wechseln. Das kostet Zustimmung und halbiert den Rückenwind; eine neue Regierung darf im ersten Jahr kostenlos wechseln. Auf Stufe 4 könnt ihr stattdessen einen zweiten Weg dazunehmen: Beide Aufgaben zählen, beide Merkmale sind möglich, die Schwerpunkt-Gesetze beider Wege kosten das 1,5-Fache.

**Merkmale und Landesprofil:** Gelingt die Aufgabe eines Wegs oder gelten drei passende Aufbaugesetze, bekommt euer Land ein Merkmal wie „Bürgerversicherung" oder „Wehrhafte Republik", höchstens sechs. Merkmale stehen unter dem Datum und im Reiter „Euer Land". Sie stärken passende Ansätze, binden Gruppen und bremsen Probleme, haben aber auch eine Schwäche. Hebt eine spätere Regierung die tragenden Gesetze auf, verblasst das Merkmal über zwei Jahre.

**Generationen:** Manche Probleme kehren in neuer Gestalt zurück, etwa „Bundeswehr unterbesetzt" als „Verteidigung in Europa". Die neue Generation löst die alte ab; Gesetze gegen das alte Problem helfen zur Hälfte weiter. Ab Stufe 2 zeigt die Problemkarte unter „Geschichte" den Stammbaum.

**Ursachen und Ergänzungen:** Ab Stufe 2 steht an jedem Ansatz, welche Ursache er anpackt: Geld, Regeln oder Angebot. Gesetze mit verschiedenen Ursachen ergänzen sich, ein zweites mit derselben Ursache wirkt nur halb.

**Wertverlust von Leistungen:** Ab Stufe 2 verlieren Geldleistungen ohne Anpassung ab dem fünften Jahr jedes Jahr 3 % Wirkung. Koppelt sie im Entwurf an die Preise oder frischt einmal je Legislatur alle mit einem Anpassungsgesetz auf. Regeln und Angebote veralten nicht.

**Sozialbeiträge:** Was Pflege-, Kranken- oder Rentenversicherung bezahlen, steht nicht im Bundeshaushalt. Im Entwurf steht dann „über Beiträge": Beschäftigte und Betriebe zahlen, und der Druck bei „Steigende Sozialbeiträge" steigt. Mehr Einzahler, etwa mit einer Bürgerversicherung, entlasten die Beiträge.

**Großprojekte:** Ab Stufe 3 starten manche Aufbaugesetze ein Großprojekt, etwa den Deutschlandtakt, den Fernwasserverbund oder die Länderneugliederung. Das Gesetz wirkt sofort. Das Projekt läuft über mehrere Legislaturen, kostet jedes Jahr Baukosten und bringt mit jedem Meilenstein dauerhaft mehr Wirkung. Nach einem Meilenstein kann der nächste Abschnitt teurer werden; liegt ein Projekt 30 % über Plan, fordert die Opposition einen Untersuchungsausschuss. Höchstens zwei laufen gleichzeitig. Übernehmt ihr ein Projekt einer anderen Regierung, entscheidet ihr: weiterführen, umbauen (ein Viertel billiger, ein Jahr später) oder stoppen. Ihr seht sie im Reiter „Kabinett" unter den Missionen.

**Ausbaustufen der Bestände:** Jeder Bestand hat Stufen bei 40, 60, 70 und 85. Ab Stufe 3 kommen das Energiesystem und die Klimaanpassung dazu. Gesetze zu Netzen, Energie, Hitze und Wasser stärken sie; manche Aufbaugesetze brauchen eine bestimmte Stufe.

**Bevölkerung und Auswanderung:** Zuwanderung, Geburten und Erwerbsbeteiligung hängen auch an euren Gesetzen; der Entwurf zeigt die Wirkung. Hohe Abgaben, eine Spaltung über 70 und die Heißzeit treiben Menschen ins Ausland, ein Punktesystem hält Fachkräfte. Ab Stufe 3 zeigt der Reiter „Zahlen" die Altersgruppen von heute gegen 2029. Sinkt die Bevölkerung drei Jahre in Folge unter 80 Millionen, beginnt das schrumpfende Land; wächst sie bis 2060 über 84 Millionen, das wachsende.

**Viele Probleme zugleich:** Neue Probleme kommen nach, solange weniger als 26 aktiv sind. Sind es mehr, tritt jeden Monat das leichteste ohne laufendes Gesetz in den Hintergrund.
