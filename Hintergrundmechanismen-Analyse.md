# Hintergrundmechanismen-Analyse (Victoria-3-Perspektive)

Stand 2026-10-24, Code-Stand Commit 27cb831. Ergänzt `Feature-Analyse.md`. Nur Analyse, kein Spielcode geändert.

Verifikationsstatus:
- **[Bestätigt]**: im Code gelesen bzw. sicheres Wissen
- **[Wahrscheinlich]**: gut begründet, ohne Quellenprüfung
- **[Vermutung]**: Einschätzung

Alle neuen Wirkungswerte, die hier vorkommen, wären **Spielwerte**. Ich nenne bewusst keine Zahlen.

## 1. Ist-Zustand der Hintergrundschicht

### Was schon im Hintergrund läuft
| Mechanismus | Wie er heute arbeitet | Status |
|---|---|---|
| Problem-Netz (System 3) | 25 Problemwerte mit Treibern aus Kennzahlen, anderen Problemen (Schwellen und Gewichte), Gruppenstimmung, Etatkürzungen und Richtungsprofil. Dazu Schocks und Jahresfolgen auf Kennzahlen und Gruppen. Es ist echtes Netz-Verhalten, zum Beispiel Polarisierung ↔ Vertrauensverlust, Energiepreise → Inflation → Rezession. | [Bestätigt, `probleme.js`] |
| Wirtschaft | Trägheit 0,5 bei Wachstum und Inflation, Rückkehr zu Potenzial und Zielwerten, Okun, Zufall. Steuerbasis folgt dem realen BIP, Zinsen dem Schuldenstand. | [Bestätigt, `config.wirtschaft`] |
| Gruppen | 6 Gruppen (0–100). Wirkungen kommen aus Steuern, Reformen, Lösungen und Problemfolgen, je Jahr kehren 15 % zur 50 zurück. | [Bestätigt] |
| Akteure | 6 Verbände und die EU mit festem Profilvektor. Sie reagieren **nur im Moment eines Reformbeschlusses** und ziehen dann ihre Gruppe mit. Kein Gedächtnis, keine eigene Stimmung. | [Bestätigt, `reformwege.js:45`, `wegBeschliessen`] |
| Trägheit und Verzögerung | Lösungen und Reformwege mit Dauer und Umsetzungsrisiko, Einnahmen mit Verzögerung, Problemtrends wirken dauerhaft. | [Bestätigt] |
| Richtungsprofil | Mittel der beschlossenen Wege. Wirkt auf Wachstum, Gini, Partner, Kanzlerpartei, Lösungserfolg und 5 Ereignisse. | [Bestätigt] |
| Politisches Kapital | Ressource (+8 je Quartal), die Vorhaben begrenzt. | [Bestätigt] |

### Wie die Kennzahlen entstehen

- **Umfragen:** größtenteils **direkt** ohne Zwischenschicht. [Bestätigt] Direkte Spielwerte sind:
  - Etat eines Ministeriums → Partei des Ressorts (0,02 bzw. 0,05 je Mrd.)
  - Steuern → Partei des Finanzministers
  - Ereignisfolgen
  - Beschlussbonus, Unmut, Zugeständnis
  - Erfolg einer Lösung oder eines Reformwegs

  Über Zwischenschichten laufen nur zwei Kanäle:
  - Lage → Kanzlerpartei (`lageUmfrage`: Wachstum, Arbeitslosigkeit, Inflation, **Durchschnitt** aller Gruppen)
  - prominente ernste Probleme → Kanzlerpartei, als Pauschale je Stufe
- **Wohin verlorene Stimmen gehen:** Was eine Partei verliert, verteilt `umverteilen` auf **alle übrigen Parteien nach Größe**, unabhängig von Profil, Gruppe oder Thema. [Bestätigt, `wahlkampf.js:15`] Das ist die größte Realismuslücke der Hintergrundschicht: Eine Mietenkrise unter einer Union-Regierung stärkt die AfD und die Linke im gleichen Verhältnis wie die FDP.
- **Gruppen wirken nur schwach:** Sie haben keine Verbindung zu einzelnen Parteien. Nur ihr Durchschnitt wirkt mit Gewicht 0,06 auf die Kanzlerpartei. [Bestätigt, `config.wirtschaft.umfrage.gruppen`]
- **Kennzahlen des Landes:** Sie entstehen über eine Zwischenschicht, nämlich die Wirkungen der Einnahmen, die Folgen der Probleme und das Profil, verrechnet im Jahresschritt mit Trägheit. [Bestätigt]
- **Probleme:** Sie werden vollständig aus der Zwischenschicht berechnet. Der Spieler wirkt nur über Lösungen, Reformwege und Etats ein. [Bestätigt]
- **Vertrauen und Polarisierung:** Beide existieren als **Problemwerte**, wirken aber nur auf zwei Gruppen (−2) und als Umfragepauschale. Auf Kapital, Reformrisiko oder Wählerwanderung wirken sie nicht. [Bestätigt]
- **Rating-Ereignis:** Es hängt am Richtungsprofil (`wirtschaft < −1`), nicht an der Schuldenquote. [Bestätigt, `ereignisse.js`] Das ist kein Hintergrundmechanismus, aber ein Plausibilitätsbruch.

## 2. Rangliste nach Nutzen und Aufwand

Skala 1–5:
- R = Realismusgewinn
- E = Erklärbarkeit (hoch ist gut)
- U = sichtbare Zusatzkomplexität in der Oberfläche (hoch ist schlecht)
- A = Aufwand
- B = Balancing-Risiko
- P = Rechenaufwand je Runde (hoch ist schlecht)

V = Vertiefung eines bestehenden Systems, N = neues System.

| # | Kandidat | R | E | U | A | B | P | V/N |
|---|---|---|---|---|---|---|---|---|
| 1 | **Wählerwanderung nach Nähe**: Verluste und Gewinne fließen nach Profilabstand (CHES) und Gruppenbindung statt nach Größe | 5 | 4 | 1 | 2 | 4 | 1 | V (umverteilen, profil) |
| 2 | **Gruppen mit Parteibindung**: Gruppenstimmung wirkt auf die Parteien, die diese Gruppe stark wählen, statt als Durchschnitt auf den Kanzler | 4 | 4 | 1 | 2 | 4 | 1 | V (Gruppen, lageUmfrage) |
| 3 | **Akteure mit Gedächtnis**: Verbände sammeln Unmut über Reformen, Etats und Probleme; ab einer Schwelle kommen Streik oder Protest als Ereignis | 4 | 5 | 1 | 2 | 3 | 1 | V (Akteure, Ereignisse) |
| 4 | **Vertrauen als Puffer**: der vorhandene Problemwert Vertrauensverlust bremst den Kapitalzuwachs und erhöht das Umsetzungsrisiko | 3 | 4 | 1 | 1 | 3 | 1 | V (Probleme, Kapital) |
| 5 | **Themen-Salienz**: Probleme, die gerade schnell steigen oder in den Schlagzeilen sind, wiegen in der Umfrage schwerer als gleich hohe, ruhige | 3 | 4 | 1 | 2 | 2 | 1 | V (Probleme, Ticker) |
| 6 | **Rating und Zinsen an der Schuldenquote** (Auslöser statt Profil) | 3 | 5 | 0 | 1 | 2 | 1 | V (Ereignisse; überschneidet sich mit dem Zinsaufschlag der Feature-Analyse) |
| 7 | **Konjunkturzyklus**: weiches Auf und Ab statt reinem Rauschen um das Potenzialwachstum | 2 | 3 | 0 | 1 | 3 | 1 | V (wirtschaft.js) |
| 8 | **Umsetzungswiderstand der Länder**: Reformwege mit Länderbezug bekommen ein höheres Risiko, wenn die Landesregierungen nicht zur Koalition gehören | 3 | 3 | 1 | 2 | 2 | 1 | V (Reformwege, Bundesrat; profitiert von Landtagswahlen) |
| 9 | **Gewöhnung bei Gruppen**: eine dauerhafte Belastung verliert über Zeit an Wirkung, ein neuer Einschnitt wirkt stark | 2 | 3 | 0 | 1 | 2 | 1 | V; existiert teilweise über die Rückkehr zu 50 [Bestätigt] |
| 10 | **Protestventil**: hohe Polarisierung und Vertrauensverlust lassen Stimmen gezielt zu Parteien mit großem Abstand zur Regierung fließen | 3 | 3 | 1 | 1 | 4 | 1 | V; das ist ein Sonderfall von #1, getrennt nur bauen, falls #1 nicht kommt |

## 3. Top-3-Empfehlungen

### 3.1 Wählerwanderung nach Nähe (Rang 1)
**Im Hintergrund:** Verliert eine Partei Zustimmung, bekommen nicht alle anderen anteilig nach Größe, sondern gewichtet nach Nähe im CHES-Profil. Gewinne werden ebenso von den nächsten Parteien genommen. Größe bleibt ein Faktor, damit kleine Parteien nicht überreagieren. Den Profilabstand gibt es schon (`profil.js abstand`, `parteiPosition`). [Bestätigt]

**Was der Spieler sieht:** Die Umfrage-Bilanz zeigt zum Beispiel „Union −0,4: davon an AfD 0,15, an SPD 0,10, an FDP 0,08 …“. Tooltip in der Kopfzeile: „Verlorene Stimmen gehen vor allem an Parteien mit ähnlichem Programm.“ Keine neue Entscheidung.

**Wo es angezeigt wird:** Umfrage-Bilanz (Feature-Analyse Rang 1), Chronik, Wahlabend-Tabelle.

Abhängigkeiten:
```
CHES-Positionen (Quelle) ─┐
Parteigrößen (Zustand)  ──┼─► Wanderungsgewichte (Zwischenschicht, Spielwert) ─► umverteilen ─► Umfragen, Wahl, Koalitionsbruch
Verlust/Gewinn je Aktion ─┘
```
Gespeist bzw. ersetzt wird die Umverteilung nach Größe in `umverteilen`. Diese Funktion nutzen Wahlkampf, Haushalt, Probleme, Ereignisse und Reformwege, also alle Kanäle. [Bestätigt]

**Achtung:** `umverteilen` steckt auch im Wahlkampf, dort gilt Angriff +0,3 und Rest anteilig. Die Änderung verschiebt das gesamte Wahlkampf-Balancing und die Schwierigkeitsstufen. Ein Schalter in der Konfiguration (Gewicht 0 = altes Verhalten) erlaubt den A/B-Vergleich.

### 3.2 Gruppen mit Parteibindung (Rang 2)
**Im Hintergrund:** Jede Partei bekommt eine Bindung an die 6 Gruppen, zum Beispiel stärker bei Rentnern, Unternehmen oder Geringverdienern. Sinkt die Stimmung einer Gruppe, verlieren vor allem die Regierungsparteien mit starker Bindung an diese Gruppe, nicht pauschal die Kanzlerpartei.
- Wahlforschungsdaten zur Wählerschaft nach Alter und Beruf gibt es, etwa von der Forschungsgruppe Wahlen und infratest dimap. [Wahrscheinlich] Ich kenne die Zahlen für 2025 nicht sicher. [Bestätigt, dass ich sie nicht kenne]
- Die Bindungen müssten daher entweder aus einer geprüften Quelle übernommen oder als Spielwerte gekennzeichnet werden.

**Was der Spieler sieht:** In der Detailansicht der Gruppen (Probleme/Haushalt) steht je Gruppe „wählt vor allem: …“. Die Umfrage-Bilanz zeigt etwa „Rentner unzufrieden (Pflege, Inflation) → Union −0,2, SPD −0,1“.

**Wo es angezeigt wird:** Haushalt-Reiter „Übersicht“ (Wirkung), Umfrage-Bilanz, Tooltip an der Gruppe.

Abhängigkeiten:
```
Steuern, Reformwege, Lösungen, Problemfolgen ─► Gruppenstimmung (gibt es) ─► × Parteibindung (neu, Quelle oder Spielwert) ─► Umfrage je Partei ─► Wanderung (#1)
```
Das ersetzt den Term `gruppen` in `lageUmfrage` (heute Durchschnitt × 0,06 auf den Kanzler). [Bestätigt]

### 3.3 Akteure mit Gedächtnis (Rang 3)
**Im Hintergrund:** Jeder Akteur hat einen Unmutswert (0–100), der langsam abklingt.
- **Er steigt** bei Reformwegen gegen sein Profil, wenn seine Gruppe absinkt, und bei Etatkürzungen in seinem Feld, zum Beispiel Bauernverband und Agraretat.
- **Er sinkt** bei passenden Wegen und Zugeständnissen.
- **Ab einer Schwelle** löst er ein vorhandenes oder neues Ereignis aus: Streik, Bauernprotest, Klage der Verbände, Beschwerde der EU-Kommission. Das ersetzt einen Teil der heute zufälligen bzw. profilgebundenen Ereignisse (Generalstreik, EU-Verfahren). [Bestätigt, dass diese heute am Profil hängen]

**Was der Spieler sieht:** Im Reiter „Verbände und EU“ (gibt es schon im Parlament) steht ein Unmutsbalken je Akteur mit den 3 letzten Ursachen. Das Ereignis nennt die Vorgeschichte, etwa „Nach der Arbeitsmarktreform und den Kürzungen im Arbeitsetat rufen die Gewerkschaften zum Streik auf“.

**Wo es angezeigt wird:** Parlament → Verbände und EU, Ereigniskarte auf der Lage, Wegekarte („erhöht Unmut der Gewerkschaften“).

Abhängigkeiten:
```
Reformbeschlüsse, Etats, Gruppen ─► Unmut je Akteur (neu, Zustand, Spielwert, Abklingen) ─► Schwelle ─► Ereignis (gibt es) ─► Umfrage, Probleme, Gruppen
```

## 4. Rückkopplungsrisiken und Dämpfer

| Schleife | Wie sie sich aufschaukelt | Dämpfer |
|---|---|---|
| Vertrauen ↔ Polarisierung (gibt es schon) | Polarisierung erhöht ab 50 den Vertrauensverlust, der ab 50 die Polarisierung erhöht. [Bestätigt] Mit #4 käme hinzu: Vertrauensverlust → weniger Kapital → weniger Lösungen → mehr Probleme → mehr Vertrauensverlust | Untergrenze für den Kapitalzuwachs (nie unter einen Mindestwert), Wirkung erst ab Stufe „ernst“, Problem-Obergrenze 100 gibt es [Bestätigt] |
| Akteur-Unmut → Streik → Rezession → Gruppen → Unmut | Ein Streik drückt das Wachstum, das drückt die Gruppe, das erhöht wieder den Unmut | Nach dem Ereignis wird der Unmut teilweise abgebaut (Druck entladen), Abklingzeit je Akteur, höchstens ein Akteurereignis je Quartal |
| Wanderung (#1) × Koalitionsbruch | Fließen Verluste der Kanzlerpartei gezielt zum Partner, entspannt sich die Koalition. Fließen Verluste des Partners zu Nachbarparteien statt anteilig, bricht er schneller | Bruchquoten mit dem Schalter A/B messen; die Bruchgrenze in Block 2 ggf. nachjustieren |
| Gruppenbindung (#2) × Zugeständnis/Beschlussbonus | Eine Partei mit Bindung an eine Gruppe kann diese gezielt bedienen, dann entsteht eine dominante Strategie | Gruppen kehren zu 50 zurück (gibt es) [Bestätigt]; Obergrenze für die Umfragewirkung je Gruppe und Jahr |
| Salienz (#5) × Problemdruck | Ein schnell steigendes Problem wiegt mehr, kostet Umfrage, die Regierung verliert Kapital und Spielraum, das Problem steigt weiter | Salienz klingt nach wenigen Quartalen von selbst ab (Themen-Konjunktur); Summe der Salienz-Gewichte begrenzt |
| Zins und Rating (#6) × Schuldenquote | Mehr Schulden, höhere Zinsen, mehr Schulden | Der gedämpfte Aufschlag mit Obergrenze aus der Feature-Analyse; Rating als Ereignis höchstens einmal je Wahlperiode (gibt es schon für alle Ereignisse) [Bestätigt] |

Allgemeine Regel: Jeder neue Zustandswert bekommt ein Abklingen zur Mitte, eine Obergrenze und eine Höchstwirkung je Runde. Alles als Spielwert in `config.js`.

## 5. Bewusst nicht empfehlen

| Kandidat | Warum nicht |
|---|---|
| Märkte mit Preisbildung (Wohnungs-, Energie-, Arbeitsmarkt mit Angebot und Nachfrage) | Die Problemwerte Wohnungsnot, Energiepreise und Fachkräfte sind schon eine gute Näherung mit Treibern [Bestätigt]. Ein Markt bräuchte Mengen und Preise, die der Spieler nicht steuert und kaum versteht. Hohe Gefahr von Todesspiralen. |
| Bevölkerungsschichten nach Victoria-3-Art (Pops mit Lebensstandard, Einkommen, Wohnort) | Die 6 Gruppen reichen für Glaubwürdigkeit, wenn sie an Parteien gebunden sind (#2). Mehr Schichten vervielfachen die Spielwerte ohne Quellen. |
| Region Ost/West, Stadt/Land als eigene Achse | Interessant bei Landtagswahlen. Ohne belegbare Wählerdaten wären es aber erfundene Werte; als Text in Ereignissen reicht es. [Vermutung] |
| Demografiemodell (Alterspyramide, Zuwanderungsströme) | Demografie existiert als langsamer Problemtreiber [Bestätigt]. Mehr Modell ändert in 12 Spieljahren wenig Sichtbares. |
| Medien als Akteure (Sender, Zeitungen, Agenda-Setting mit eigenem Willen) | Erklärbarkeit gering, Gefahr parteipolitischer Wertung; Salienz (#5) bildet den Kern ab. |
| Weltwirtschaft, Handelspartner, Exportnachfrage als Umweltvariablen | Geopolitik- und Energiepreis-Schocks decken das ab [Bestätigt]; zusätzliche Umweltvariablen ohne Steuerung sind für den Spieler Zufall in anderer Verkleidung. |
| Gerichte als System (Instanzen, Verfahrensdauer) | Das Verfassungsrisiko als Wahrscheinlichkeit genügt; mehr wäre Verwaltungsarbeit ohne Entscheidung. |
| Gegner-Parteien als handelnde KI | Steht schon in der Feature-Analyse unter „nicht empfehlen“; Wanderung (#1) erzeugt das Gefühl reagierender Gegner billiger. |

## 6. Umsetzungsreihenfolge

Jeder Punkt ist ein eigener Auftrag:
1. **Wählerwanderung nach Nähe (#1).** Zuerst, weil sie die Grundlage für #2, #10 und jede spätere Umfragewirkung ist. Mit Schalter (Gewicht 0 = altes Verhalten).
2. **Gruppen mit Parteibindung (#2).** Baut auf #1 auf, sonst landen die Gruppeneffekte wieder in der Größenverteilung.
3. **Rating und Zinsen an der Schuldenquote (#6).** Unabhängig; vorher mit dem Zinsaufschlag der Feature-Analyse abstimmen, damit nicht zwei Zinsmechanismen entstehen.
4. **Akteure mit Gedächtnis (#3).** Unabhängig von #1/#2; profitiert von der Umfrage-Bilanz (Feature-Analyse Rang 1) für die Erklärung.
5. **Vertrauen als Puffer (#4)** und **Salienz (#5).** Zuletzt, weil sie bestehende Schleifen verstärken und erst nach den anderen sicher gemessen werden können.

Voraussetzung für 1–3: Die **Umfrage-Bilanz** aus der Feature-Analyse sollte vorher gebaut sein. Ohne sie sind Hintergrundmechanismen für den Spieler unsichtbar, und das widerspricht dem Victoria-Prinzip.

## 7. Prüfbarkeit mit der bestehenden Simulation

- **Schalter-Vergleich:** Jedes Gewicht kommt in `config.js`. Ein Lauf mit Gewicht 0 muss Ergebnisse liefern, die mit der Baseline identisch sind (gleiche Seeds 1–200). Das ist ein Regressionstest, der beweist, dass nur der Mechanismus wirkt.
- **Wirkung nachweisen:**
  - #1: Bei der Strategie „marktliberal“ sollten Verluste der Kanzlerpartei messbar mehr zur Nachbarpartei fließen als heute. Messen über die Summe der Anteilsverschiebung je Partei über die Partie.
  - #2: Korrelation zwischen Gruppenstimmung und Umfrage der gebundenen Partei, mit und ohne Mechanismus.
  - #3: Ereignisse „Streik/Protest“ treten bei Strategien gegen das Akteurprofil häufiger auf (z. B. SPD marktliberal gegenüber SPD sozialdemokratisch).
  - #4/#5: Verteilung des Kapitals (wie oft am Minimum) und maximale Problemwerte gegen die Baseline.
- **Balancing-Grenzen:** wie beim letzten Auftrag:
  - keine Siegquote über 75 % oder unter 5 %, die vorher anders lag
  - Bruchquoten, Schuldenquote, keine NaN
  - Schwierigkeitsabgleich in BALANCING.md ohne „anpassen“
- **Todesspiralen:** Extremstrategien wie bei Block 3 (alles maximal, nichts tun, nur Kürzungen, nur eine Ausrichtung, keine Lösungen) über 12 Jahre. Gemessen werden der Anteil Partien mit 3 oder mehr Krisen gleichzeitig und das Minimum des Kapitals.
- **Lücke im Messwerkzeug:** Die Simulation wählt Ereignisse immer mit „erste Möglichkeit“ [Bestätigt]. Für #3 braucht es eine zweite Ereignisstrategie, sonst misst man nur einen Pfad.

## 8. Offene Fragen an dich

1. **Wahlkampf mitbetroffen?** Soll die Wählerwanderung (#1) auch im Wahlkampf gelten? Das verändert die Schwierigkeit aller Parteien. Alternativ gilt sie nur in der Regierungszeit.
2. **Parteibindung der Gruppen (#2):** aus einer Quelle (Wahltagsbefragung 2025, die ich vor Übernahme prüfen müsste) oder bewusst als Spielwert?
3. **Ereignisse:** Sollen Akteurereignisse (#3) die heutigen profilgebundenen Ereignisse ersetzen oder ergänzen?
4. **Sichtbarkeit:** Wie viel Hintergrund soll sichtbar sein: nur Ergebnis und Ursache (Victoria-nah) oder auch die Zwischenwerte als Zahl (z. B. „Unmut Gewerkschaften 64“)?
5. **Reihenfolge:** Soll die Umfrage-Bilanz (Feature-Analyse) wie empfohlen zwingend vor jedem Hintergrundmechanismus kommen?
6. **Noch offen aus dem vorigen Auftrag:** Der Arbeitsbaum ist nicht sauber (jetzt zwei untracked Analysedateien), und die vier Abweichungen zwischen Auftrag und Feature-Analyse sind noch nicht entschieden. Ohne das starte ich die Umsetzung nicht.

## Nicht geprüft
- **Inhalte:** Texte und Werte der 58 Lösungen, 49 Wege und 13 Ereignisse habe ich nicht einzeln gelesen, nur Struktur, Treiber und Bedingungen.
- **Daten:** Reale Daten zur Wählerschaft nach Gruppen (für #2) habe ich nicht recherchiert.
- **Rechenaufwand:** Ich habe die Performance nicht gemessen. Die Schätzung (alle P = 1) beruht darauf, dass jeder Mechanismus nur über 6–8 Parteien oder Akteure je Quartal rechnet. [Wahrscheinlich]
- **Rückkopplungen:** Die Dämpfer sind Vorschläge, keine Messergebnisse.

## Kurzfassung
1. Die Hintergrundschicht ist bei Problemen, Wirtschaft und Trägheit schon gut, ein echtes Netz mit 25 verknüpften Problemen.
2. Größte Lücke: Verlorene Stimmen fließen allen Parteien nach Größe zu, egal wie nah sie inhaltlich sind (`umverteilen`).
3. Gruppen wirken nur als Durchschnitt auf die Kanzlerpartei, nicht auf die Parteien, die sie wählen.
4. Verbände reagieren nur im Moment eines Beschlusses, ohne Gedächtnis.
5. Top 3: Wählerwanderung nach Nähe, Gruppen mit Parteibindung, Akteure mit Gedächtnis. Alle drei vertiefen Bestehendes und brauchen keine neuen Menüs.
6. Billig und plausibel: Rating und Zinsen an die Schuldenquote koppeln (heute hängt das Rating am Profil).
7. Nicht empfehlen: Märkte mit Preisbildung, Pops, Ost/West-Modell, Medien-Akteure, Weltwirtschaft, Gegner-KI.
8. Reihenfolge: Umfrage-Bilanz → Wanderung → Gruppenbindung; Dämpfer (Abklingen, Obergrenzen) sind Pflicht.
9. Messbar per Schalter in `config.js`: Gewicht 0 muss die Baseline exakt reproduzieren.
