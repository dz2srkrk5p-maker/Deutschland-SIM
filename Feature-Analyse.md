# Feature-Analyse: Was fehlt für eine glaubwürdige Politiksimulation?

Stand 2026-10-24, Code-Stand Commit 27cb831. Nur Analyse, kein Spielcode geändert.

Verifikationsstatus:
- **[Bestätigt]**: im Code gelesen bzw. sicheres Wissen über das politische System
- **[Wahrscheinlich]**: gut begründet, aber nicht an einer Quelle geprüft
- **[Vermutung]**: Einschätzung

Für diese Analyse habe ich keine Webquellen geprüft. Alle Aussagen über reale Politik stammen aus meinem Wissen.

## 1. Ist-Zustand

| System | Was ist modelliert, wie tief | Tiefe |
|---|---|---|
| Wahl | Nur Zweitstimme, 630 Sitze, 5-%-Hürde, Sainte-Laguë. Die Wahl übernimmt die aktuellen Umfragewerte ohne Zufall. Keine Wahlkreise, keine Grundmandatsklausel. [Bestätigt] | mittel |
| Wahlkampf | 8 Wochen, je Woche eine von 3 Aktionen (Plakate, Kundgebung, Angriff), Wiederholungen wirken schwächer. Ohne Themen, ohne Gegner-KI und ohne Bezug zur Regierungsbilanz. [Bestätigt, SPEC M5] | flach |
| Regierungsbildung | Zustimmungschance der Partner nach Abstand in der **Sitzordnung**, dazu ein Größenfaktor und die Brandmauer. Kanzlerwahl mit Abweichlern, Minderheitsregierung für die stärkste Fraktion. [Bestätigt, `koalition.js:20`] | mittel |
| Kabinett | Ministerien nach Sainte-Laguë verteilt, der Spieler ordnet sie zu. Die Etats wirken auf die Partei, die das Ressort hält. Keine Personen. [Bestätigt] | mittel |
| Koalitionsalltag | Bruch, wenn ein Partner mehr als 1,5 Punkte unter seinem Startwert liegt, vorher Ultimatum mit Frist. Gegenmaßnahme Zugeständnis. Unmut und Veto bei Reformwegen nach CHES-Abstand. [Bestätigt, Block 2] | gut |
| Bundestag | Abstimmung nach Inhalt (CHES-Abstand) bei Reformwegen, nach Sitzordnung beim Haushalt. Brandmauer mit seltenen Abweichlern, Minderheitsregierung stimmt strenger ab. [Bestätigt] | mittel |
| Bundesrat | 69 Stimmen. Ein Land stimmt zu, wenn alle seine Regierungsparteien in der Bundeskoalition sind. Die Landesregierungen sind **für das ganze Spiel fest** (Stand 09/2026). Nur Zustimmungsgesetze werden abgefragt. [Bestätigt, `bundesrat.js`] | flach |
| Verfassungsgericht | Nur bei Reformwegen mit dem Merkmal „verfassungsrechtlich umstritten“: +20 % Risiko, dass das Gericht den Weg kippt. Bei der Vermögensteuer im Haushalt **nur ein Warnhinweis ohne Folge**. [Bestätigt] | flach |
| Haushalt (System 2) | 16 Etats, 11 Einnahmearten mit Parametern, Ausweichen, Verzögerung und Ausgestaltung. Schuldenbremse mit Konjunkturkomponente und Verteidigungsausnahme. 5-Jahres-Prognose, Gegenfinanzierung. [Bestätigt] | tief |
| Wirtschaft | Jahresschritt: Wachstum und Inflation kehren zu Zielwerten zurück, dazu Zufall. Arbeitslosigkeit nach Okun, Gini, BIP. Zinsen proportional zu den Schulden. Kein Konjunkturzyklus, kein Außenhandel. [Bestätigt, `wirtschaft.js`, `haushalt.js:26`] | mittel |
| Probleme (System 3) | 25 Problembereiche mit Treibern, Wechselwirkungen, Schocks und Folgen, 58 Lösungen. Ursachen je Problem sichtbar. [Bestätigt] | tief |
| Reformwege (System 1) | 10 Bereiche, 49 Wege, Ausrichtung, Pfadabhängigkeit, Richtungsprofil, Reaktionen von Verbänden und EU, Umsetzungsrisiko, Beschlussbonus. [Bestätigt] | tief |
| Ereignisse | 13 Ereignisse, mit 30 % Chance je Quartal, jedes höchstens einmal je Wahlperiode. 5 davon hängen vom Richtungsprofil ab (EU-Verfahren, Investoren, Generalstreik, Klimaklage, Rating). Keine Ketten. [Bestätigt] | flach |
| Gruppen und Verbände | 6 Wählergruppen (0–100) und 6 Akteure. Akteure reagieren nur auf Reformwege und ziehen ihre Gruppe mit. [Bestätigt] | mittel |
| EU und Außenpolitik | EU als Akteur und Profilachse, Wachstumsabzug bei EU-kritischem Kurs, Ereignis Vertragsverletzungsverfahren, Problem Geopolitik und Lieferketten. Keine Fiskalregeln, keine Bündnisse. [Bestätigt] | flach |
| Umfragen | Bewegen sich nur durch Spieleraktionen (Haushalt, Lage, Gruppen, Probleme, Ereignisse, Profil, Boni) und Zufall ±0,3. Oppositionsparteien handeln nicht selbst. [Bestätigt, `lageUmfrage`] | mittel |
| Rückmeldung | Probleme mit Ursachen und Verlauf, Haushalt mit Herleitung, Folgen vor jeder Entscheidung, Schlagzeilen, Chronik, Hilfe „Herkunft der Werte“. Die Umfragewirkung nach dem Haushalt erscheint nur als **Summe je Partei**, ohne Aufschlüsselung nach Ursache. [Bestätigt, `haushalt.js:155–157`] | gut, mit einer Lücke |

Nebenbefund, kein Feature: Die Erklärtexte in `src/data/hinweise.js` sind teils veraltet. Der Regierungs-Hinweis nennt den Bruch ohne Ultimatum, der Koalitions-Hinweis die Sitzordnung. Auch der SPEC-Abschnitt „App-Shell“ beschreibt noch den alten Reformen-Bildschirm. [Bestätigt]

### Bewusste Auslassungen: passen sie noch?
- **Länder- und Kommunalhaushalte:** passt weiterhin. Hoher Aufwand, wenig Entscheidungsgewinn. [Vermutung]
- **Zinsmarkt:** nur teilweise. Ein vollständiger Kapitalmarkt bleibt draußen. Ein **Zinsaufschlag ab einer Schuldenquote** ist aber billig und schließt die Lücke aus Block 3, in der die Quote dank Verteidigungsausnahme auf über 90 % steigt. Empfehlung: Auslassung abschwächen (Rang 2).
- **Vermittlungsausschuss:** als eigenes Verfahren ja, auslassen. Ein Ein-Klick-Kompromiss („abgeschwächte Fassung“) bringt aber einen echten Mechanismus mit wenig Komplexität (Rang 7).
- **Weitere Auslassungen laut SPEC**, die nach wie vor passen:
  - Minister als Personen
  - Erststimme und Wahlkreise
  - Duldung, Misstrauensvotum und Vertrauensfrage (siehe Rang 10)
  - Gegner-KI

## 2. Lückenanalyse nach Dimension

| Dimension | Urteil | Begründung |
|---|---|---|
| Institutionen, Gesetzgebung | zu flach an zwei Stellen | Einspruchsgesetze fehlen ganz: Ohne Zustimmungsbedürftigkeit fragt das Spiel den Bundesrat nicht. Real kann der Bundesrat Einspruch einlegen, den der Bundestag überstimmen kann (Art. 77 GG). [Bestätigt] Außerdem ist der Bundesrat eingefroren. Verfahrensdauer gibt es über die Umsetzungsdauer der Wege. Bundespräsident: siehe „Bewusst nicht empfehlen“. |
| Koalition, Parteien | gut, eine große Lücke | Der Koalitionsvertrag fehlt. Die Partnerwahl folgt der Sitzordnung, nicht den Inhalten, obwohl Abstimmungen schon CHES nutzen. Das ist inkonsequent. [Bestätigt] Fraktionsdisziplin gibt es grob über Abweichler. |
| Wahlen, Öffentlichkeit | große Lücke | Keine Landtagswahlen. Der Wahlkampf kennt die Regierungsbilanz nicht. Die Opposition ist passiv. Medien gibt es nur als Ticker ohne Wirkung. [Bestätigt] |
| Föderalismus | flach, aber vertretbar | Der Bundesrat ist das einzige Föderalismus-Element. Der Finanzausgleich fehlt; das ist für die Glaubwürdigkeit kaum spürbar. [Vermutung] |
| Wirtschaft, Finanzen | ausreichend, eine Lücke | Haushalt und Einnahmen sind tief. Es fehlt ein Zins-Feedback bei hoher Verschuldung. Tarifpartner kommen über Gewerkschaften, Streik-Ereignisse und den Mindestlohn-Weg vor. |
| EU, Außenpolitik | flach, vertretbar | Die EU ist ein Rahmen über Profil und Ereignisse. Die EU-Fiskalregeln fehlen. Die Krisen von außen sind über Probleme und Ereignisse abgedeckt, aber einmalig und kurz. |
| Verzögerung, Trägheit | gut | Lösungen und Reformwege haben eine Dauer, Einnahmen eine Verzögerung, Reformen ein Umsetzungsrisiko, Probleme Trends. [Bestätigt] Widerstand von Verwaltung oder Ländern bei der Umsetzung fehlt; das deckt das Risiko grob ab. |
| Verbände, Straße | ausreichend | 6 Akteure, Streiks als Ereignis. Proteste als wiederkehrende Folge fehlen. Das passt in die Ereignis-Vertiefung. |
| Zufall, Schocks | zu flach | Nur 13 Ereignisse, jedes einmal je Wahlperiode, alle in einem Quartal erledigt. Nach 2–3 Wahlperioden wiederholt sich alles. Es gibt keine Krise, die über mehrere Quartale die Planung durchkreuzt. [Bestätigt] Schocks auf Problemwerte gibt es. |
| Rückmeldung | gut, eine Lücke | Der Spieler sieht nicht, **warum** seine Umfrage sich verändert hat. Ursache sind die Summen je Partei. [Bestätigt] Für ein Spiel, dessen Siegbedingung an der Umfrage hängt, ist das die wichtigste Erklärungslücke. [Vermutung] |
| Ergänzt: Zeitgefühl, Abnutzung | Lücke | Regierungsparteien verlieren real im Lauf einer Wahlperiode oft an Zustimmung. [Wahrscheinlich] Im Spiel entsteht Verlust nur aus den Entscheidungen des Spielers. |

## 3. Rangliste der Lücken (Nutzen-Aufwand-Verhältnis)

Skala 1–5: R = Realismusgewinn, S = Spielspaß und Entscheidungstiefe, K = Zusatzkomplexität (hoch ist schlecht), A = Aufwand, B = Balancing-Risiko. V = Vertiefung eines bestehenden Systems, N = neues System.

| # | Lücke | R | S | K | A | B | V/N | Kurz |
|---|---|---|---|---|---|---|---|---|
| 1 | Umfrage-Bilanz: Ursachen jeder Umfragebewegung aufschlüsseln | 3 | 3 | 1 | 2 | 1 | V (Haushalt, Lage, Chronik) | Erklärt, was schon passiert |
| 2 | Zinsaufschlag ab einer Schuldenquote, Deckel für die Verteidigungsausnahme | 4 | 3 | 1 | 1 | 3 | V (Haushalt) | Schließt die Lücke aus Block 3 |
| 3 | Landtagswahlen als Zwischenzeugnis, Bundesrat verändert sich | 5 | 4 | 2 | 3 | 3 | V (Bundesrat, Umfragen) | Größter Glaubwürdigkeitsgewinn |
| 4 | Koalitionsvertrag: bei der Bildung 2–3 Reformwege vereinbaren | 5 | 5 | 2 | 3 | 4 | V (Koalition, Reformwege, Block 2) | Echte Dilemmata |
| 5 | Krisen über mehrere Quartale, mehr Ereignisse | 4 | 4 | 1 | 3 | 2 | V (Ereignisse, Probleme) | Vor allem Inhalt |
| 6 | Regierungsbilanz im Wahlkampf | 4 | 4 | 2 | 3 | 4 | V (Wahlkampf) | Verbindet die zwei Spielhälften |
| 7 | Einspruchsgesetze und Kompromiss im Bundesrat (Vermittlungsausschuss light) | 3 | 3 | 2 | 2 | 2 | V (Bundesrat, Reformwege) | Ein Knopf statt Sperre |
| 8 | Partnerwahl nach Inhalt (CHES) statt Sitzordnung | 3 | 2 | 1 | 1 | 4 | V (Koalition) | Konsistenz, ändert die Schwierigkeit |
| 9 | Abnutzung der Regierung, Opposition gewinnt passiv | 3 | 3 | 1 | 1 | 4 | V (Umfragen) | Starke Balancing-Wirkung |
| 10 | Vertrauensfrage als Notbremse bei Koalitionskrise | 3 | 3 | 2 | 2 | 3 | V (Block 2) | Selten genutzt |
| 11 | Verfassungsrisiko auch für umstrittene Steuern im Haushalt | 2 | 2 | 1 | 1 | 2 | V (Haushalt) | Konsistenzfehler |
| 12 | EU-Fiskalregeln als zweite Schuldengrenze | 2 | 2 | 2 | 2 | 3 | V (Haushalt, Ereignis EU-Verfahren) | Doppelt zur Schuldenbremse |
| 13 | Proteste und Streiks als Folge von Gruppenstimmung | 3 | 2 | 1 | 2 | 2 | V (Ereignisse, Gruppen) | Passt in Rang 5 |
| 14 | Hinweistexte und SPEC-Drift bereinigen | 1 | 1 | 0 | 1 | 0 | – | Pflege, kein Feature |

## 4. Top-5-Empfehlungen

### 4.1 Umfrage-Bilanz (Rang 1)
- **Was der Spieler sieht:** Nach jedem Haushalt und jedem Quartal steht neben dem Umfragewert ein aufklappbarer Block „Warum ±x?“ mit Zeilen wie:
  - Haushalt (Etats, Steuern)
  - Wirtschaftslage
  - Gruppenstimmung
  - Probleme in Krise
  - Ereignisse
  - Reformwege und Profil
  - Zufall
  Keine neue Entscheidung.
- **Wo es hinpasst:** `haushaltBeschliessen` hat die Teile schon getrennt (`wirkung`, `profil.umfrage`, `lage`, `schwankung`), ebenso `problemeQuartal` und die Ereignisfolgen. [Bestätigt]
- **Was angepasst werden muss:**
  - Die Aktionen geben die Teile als strukturierte Liste zurück, nicht nur als Text.
  - Anzeige auf der Lage und in der Chronik.
  - Kein neues Zustandsfeld nötig, wenn man nur die letzte Aktion erklärt. Für einen Verlauf bräuchte es ein Feld mit Migration.

### 4.2 Zinsaufschlag und Deckel für die Verteidigungsausnahme (Rang 2)
- **Was der Spieler sieht:** In der Haushalt-Ansicht „Schulden“ eine Zeile „Zinsaufschlag wegen hoher Schuldenquote“, dazu Hinweise in der Prognose. Ab einer Schwelle steigen die Zinsausgaben überproportional. Die Ausnahme für Verteidigung gilt nur bis zu einer Obergrenze. Keine neue Entscheidung, aber höhere Kosten für die vorhandene.
- **Wo es hinpasst:** `zinsen()` in `haushalt.js:26` und `bilanz()` mit `verteidigungsFreigrenze`. [Bestätigt]
- **Was angepasst werden muss:**
  - Schwellen in `config.haushalt`.
  - Die Prognose rechnet automatisch mit.
  - Balancing neu messen, denn der unveränderte Haushalt hält schon heute nur in 31 % der Partien.
  - Die realen Zinsmechanismen (Marktzins, Laufzeiten) sind mir nur grob bekannt. Die Werte wären Spielwerte. [Bestätigt, dass es Spielwerte wären]

### 4.3 Landtagswahlen (Rang 3)
- **Was der Spieler sieht:** Ein- bis zweimal je Regierungsjahr kündigt die Lage „Landtagswahl in X im nächsten Quartal“ an. Danach erscheint das Ergebnis: Die Landesregierung kann wechseln, die Bundesratsmehrheit verschiebt sich. Die Regierungsparteien bekommen ein Zwischenzeugnis in Form einer kleinen Umfragewirkung durch Sieg oder Niederlage. Keine eigene Entscheidung, aber man plant Zustimmungsgesetze vor oder nach einer Landtagswahl.
- **Wo es hinpasst:** Das Ereignis entsteht in `quartalBeenden`. Das Ergebnis lässt sich aus den Bundesumfragen plus einem Landesfaktor ableiten. `laender.regierung` würde Teil des Spielzustands statt fester Daten.
- **Was angepasst werden muss:**
  - Neues Zustandsfeld `laender`, Migration mit dem Stand 09/2026 als Startwert.
  - `bundesratAbstimmung` liest aus dem Zustand.
  - Eine einfache Regel für die Regierungsbildung im Land, etwa die stärkste Partei mit dem nächsten Partner nach CHES und Brandmauer.
  - Wahltermine: Die realen Termine für 2026 bis 2029 kenne ich nicht sicher. [Vermutung] Die Termine sollten über Quellen geprüft oder als Spielrhythmus (z. B. 4 Länder je Jahr) freigegeben werden.
- **Risiko:** Die Bundesratsmehrheit ist heute für Steuern und Zustimmungsgesetze ein harter Riegel. Ändert sie sich, verschiebt sich das Balancing aller Steuerstrategien.

### 4.4 Koalitionsvertrag (Rang 4)
- **Was der Spieler sieht:** Bei der Regierungsbildung legt jeder Partner 2 Wunsch-Reformwege vor, aus seinem CHES-Profil gewählt. Der Spieler nimmt einen oder beide in den Vertrag auf. Mehr Zusagen erhöhen die Zustimmungschance.
  - Im Amt zeigt die Lage „Koalitionsvertrag: 1 von 3 umgesetzt“.
  - Bis zum Ende der Wahlperiode nicht umgesetzt: Unmut beim Partner, der in Ultimatum und Bruch einfließt (Block 2).
  - Umgesetzt: kleiner Bonus für den Partner.
  Das erzeugt echte Dilemmata zwischen eigener Linie, Kapital, Schuldenbremse und Partnerfrieden.
- **Wo es hinpasst:** `verhandeln` (Chance), `koalition` (Feld `vertrag`), `wegBeschliessen` (zählt Zusagen), `koalitionPruefen`.
- **Was angepasst werden muss:**
  - Bildschirm Regierungsbildung um eine Auswahlliste erweitern.
  - Migration mit leerem Vertrag.
  - Balancing für den Koalitionsbruch neu messen.
  - Realer Hintergrund: Koalitionsverträge sind politisch, nicht rechtlich bindend. [Bestätigt]

### 4.5 Krisen über mehrere Quartale und mehr Ereignisse (Rang 5)
- **Was der Spieler sieht:** Seltene Großkrisen wie Energiepreisschock, Pandemie, Finanzmarktkrise oder Flutkatastrophe laufen über 2–4 Quartale. Jedes Quartal kommt eine Folgeentscheidung, etwa Sofortpaket mit Schulden, Umschichtung oder Abwarten. Sie bindet Aufmerksamkeit, also eines der 2 Vorhaben, und kann eine Ausnahme von der Schuldenbremse begründen. Dazu 10–15 weitere einfache Ereignisse gegen Wiederholung.
- **Wo es hinpasst:** `ereignisse.js` mit Feld `folgeVon`, die Schock-Mechanik der Probleme, `aktionenImQuartal`. Real gibt es die Notlagen-Ausnahme der Schuldenbremse (Art. 115 Abs. 2 GG). [Bestätigt]
- **Was angepasst werden muss:**
  - Zustand `offenesEreignis` um eine Kettenstufe erweitern.
  - Notlage als Haushaltsoption mit Tilgungspflicht. Die genaue Tilgungsregel wäre ein Spielwert.
  - Vor allem Inhalt: Texte, Folgen.

## 5. Bewusst nicht empfehlen

| Kandidat | Warum nicht |
|---|---|
| Länder- und Kommunalhaushalte, Finanzausgleich | Viele Zahlen, kaum eigene Entscheidungen; Föderalismus wirkt schon über Landtagswahlen und Bundesrat. Hohes Balancing-Risiko für System 2. |
| Vollständiger Kapitalmarkt (Zinskurve, Anleihen, Rating als System) | Der Zinsaufschlag (Rang 2) bringt 80 % des Effekts. Das Rating gibt es schon als Ereignis. [Bestätigt] |
| Vermittlungsausschuss als eigenes Verfahren mit Sitzungen | Mehr Schritte je Gesetz ohne neues Dilemma; die Kompromiss-Variante (Rang 7) reicht. |
| Bundespräsident (Ausfertigung, Prüfungsrecht) | Real wird die Ausfertigung sehr selten verweigert. [Wahrscheinlich] Das wäre ein Ereignis ohne Entscheidung. |
| Minister als Personen, Skandale um Personen, Rücktritte | Viel Inhalt. Die Projektregel erlaubt keine echten Personen, erfundene wirken beliebig. Das Ereignis „Beraterverträge“ deckt das Grundgefühl ab. [Bestätigt] |
| Parteiflügel, Fraktionsdisziplin als Werte | Vervielfacht die Zahlen je Partei; Abweichler und Partner-Veto decken das Gefühl ab. |
| Kanzlerwechsel innerhalb der Partei, konstruktives Misstrauensvotum durch die Opposition | Braucht eine Gegner-KI für Mehrheitsbildung; als Spielende-Variante schwer verständlich. Höchstens die Vertrauensfrage (Rang 10). |
| Gegner-KI für Wahlkampf und Opposition | Großer Aufwand, das Balancing aller Parteien kippt; passive Abnutzung (Rang 9) ist die billige Annäherung. |
| Erststimme, Wahlkreise, Grundmandatsklausel | Bei 2025er Werten ohne Wirkung (Linke über 5 %). [Bestätigt für die Startwerte] Viel Rechenlogik für Randfälle. |
| Außenhandel, Wechselkurs, Exportmodell | Für den Spieler kaum steuerbar; Geopolitik und Energiepreis-Problem decken die Folgen ab. |
| EU-Fiskalregeln als zweite harte Grenze (Rang 12) | Doppelt zur Schuldenbremse, verwirrt mehr als es erklärt; besser als Ereignis-Auslöser lassen. |
| Medien als System (Zeitungen, Interviews, Talkshows) | Neues Menü ohne Entscheidung; der Ticker reicht als Anzeige. |

## 6. Paketvorschlag (jedes Paket unabhängig)

- **Klein** (geschätzt 1–2 Sitzungen [Vermutung]):
  - Umfrage-Bilanz (1)
  - Zinsaufschlag und Verteidigungsdeckel (2)
  - Verfassungsrisiko für umstrittene Steuern (11)
  - Hinweistexte und SPEC aktualisieren (14)

  Keine neuen Menüs, eine neue Anzeige.
- **Mittel** (2–4 Sitzungen [Vermutung]):
  - Landtagswahlen mit veränderlichem Bundesrat (3)
  - Einspruchsgesetze mit Kompromiss-Knopf (7)

  Ein neues Zustandsfeld, keine neue Hauptnavigation.
- **Groß** (4–6 Sitzungen [Vermutung]):
  - Koalitionsvertrag (4)
  - Krisen über mehrere Quartale samt Notlage (5)
  - Regierungsbilanz im Wahlkampf (6)

  Verbindet Regierungsbildung, Regieren und Wahlkampf zu einem Bogen; braucht vollständiges Neu-Balancing.

## 7. Offene Fragen an dich

1. **Spieldauer:** Wie lang soll eine typische Partie sein? Bei mehr als 3 Wahlperioden lohnen sich Ereignisvielfalt (5) und Landtagswahlen (3) deutlich mehr.
2. **Realismus oder Spielbarkeit beim Bundesrat:** Darf ein veränderlicher Bundesrat Steuerpolitik zeitweise ganz blockieren? Falls nein, sinkt der Wert von (3), oder (7) wird Pflicht.
3. **Schwierigkeit:** Sollen Regierungen von selbst an Zustimmung verlieren (9)? Das macht das Spiel schwerer, CDU/CSU läge heute bei 66–70 % Siegen.
4. **Zielgruppe:** Eher politisch Interessierte, die Mechanik verstehen wollen, oder Gelegenheitsspieler? Im ersten Fall steigt der Wert von (1) und (7), im zweiten von (5).
5. **Echte Termine:** Sollen Landtagswahlen den echten Kalender nachbilden (Quellenprüfung nötig) oder einem festen Spielrhythmus folgen?
6. **Koalitionschance:** Soll sie nach Inhalt (8) laufen, auch wenn sich dadurch die Schwierigkeitsstufen der Parteien verschieben?

## Nicht geprüft
- **Bildschirme:** Nicht vollständig gelesen habe ich Regierungsbildung, Wahlkampf, Wahlabend, Ende und Chronik (`src/ui/screens/koalition.js`, `wahlkampf.js`, `wahlabend.js`, `ende.js`, `chronik.js`). Die Aussagen stützen sich auf SPEC und Engine.
- **Inhalte:** Nicht jeder Text der 25 Probleme, 58 Lösungen, 49 Wege und 13 Ereignisse ist einzeln gelesen, nur Struktur und Anzahl.
- **Reale Fakten:** Keine Webquellen geprüft, darunter Landtagswahltermine, Details des Wahlrechts 2023/2024, EU-Fiskalregeln und die Häufigkeit verweigerter Ausfertigungen. Die Statusangaben spiegeln das.
- **Aufwand:** Die Schätzungen sind grob und nicht aus einer Messung abgeleitet.
