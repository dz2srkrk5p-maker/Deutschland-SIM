# SPEC: Freigegebene Spielregeln

Jede Regel hier ist vom Nutzer freigegeben (Datum dabei). Was hier nicht steht, gibt es im Spiel nicht.

## Grundentscheidungen (freigegeben 2026-10-20)
- Spielerrolle: Der Spieler führt eine Partei, die er vor Spielbeginn frei wählt.
- Ablauf: Wahlkampf → Wahl → Koalition → Kabinett → vier Regierungsjahre (Haushalt jährlich, Bundesrat) → nächste Wahl.
- Bundestag: feste Sitzzahl (630, vor Übernahme zu prüfen), 5-%-Sperrklausel, nur Zweitstimme, Sitzverteilung nach Sainte-Laguë. Gleichstand bei der letzten Zuteilung: Los über den Seed-Zufallsgenerator. Erststimmen/Wahlkreise später.
- Parteien: reale Parteien, Startwerte aus dem Ergebnis der Bundestagswahl 2025 (vor Übernahme zu prüfen).
- Speichern: im Browser (`localStorage`).
- Technik: Vite, reines JavaScript, Vitest.

## Daten (freigegeben 2026-10-20, M1)
- Bundestag: 630 Sitze (Bundeswahlleiterin, BTW 2025).
- Parteien: CDU/CSU als eine Partei (28,6 %), AfD 20,8, SPD 16,4, Grüne 11,6, Linke 8,8, BSW 4,981, FDP 4,3, Sonstige 4,519 (Rest auf 100, bekommt nie Sitze). SSW weggelassen (keine Minderheiten-Sonderregel). Farben sind Spielfarben. Dateien: `src/data/parteien.js`.
- Länder: 16 Länder mit Bundesratsstimmen, Summe 69, Mehrheit 35 (wird aus der Tabelle berechnet). Landesregierungen in M9. Datei: `src/data/laender.js`.
- Ministerien: die 16 echten Bundesministerien mit offiziellem Namen und Kurznamen, Kanzleramt als Sonderfall. Verteilung in M7. Datei: `src/data/ministerien.js`.
- Legislaturperiode: 4 Jahre. Konstanten: `src/data/config.js`.

## Spielzustand (M2)
- Neues Spiel: Spieler wählt eine Partei (nicht „Sonstige“) und einen Seed. Start in Phase `wahlkampf` mit den Startanteilen aus `parteien.js`.
- Felder: `version`, `phase`, `spielerParteiId`, `anteile` (Prozent je Partei), `rngZustand`. Weitere Felder kommen mit ihren Meilensteinen.
- Speichern als JSON-Text. Laden lehnt kaputte Spielstände und solche mit anderer `version` ab.
- Zufall: Mulberry32 in `src/engine/rng.js`, Generatorzustand liegt im Spielzustand.
- Version 2 (F05, freigegeben 2026-10-21): `wahlkampfStart` (eigener Anteil vor Woche 1; gesetzt bei neuem Spiel und bei Rückkehr in den Wahlkampf) und `wahlergebnis` (`null` bis zur ersten Wahl, danach `{ anteile, vorher, wahlkampf }`). `wahl()` schreibt es: `vorher` = Anteile der vorigen Wahl der Partie, bei der ersten Wahl die Ergebnisse 2025 aus `parteien.js`; `wahlkampf` = eigener Anteil bei der Wahl minus `wahlkampfStart` (enthält die Schwankung). Spielstände der Version 1 werden verworfen.
- Version 5 (F09, freigegeben 2026-10-21): `verlauf` = Liste `{ schritt, anteil, wahl? }` der eigenen Partei, Start mit Schritt 0 und Startanteil. `mitVerlauf()` in `src/engine/state.js` hängt einen Eintrag an; aufgerufen von `wahlkampfWoche` (letzte Woche mit `wahl: true`, weil die Wahl genau diese Anteile nimmt) und `haushaltBeschliessen`. Alle Einträge bleiben erhalten. (Version 3: `seed`, F07; Version 4: `wahlkampfSerie`, F08.)

## System: Wahl und Sitzverteilung (freigegeben 2026-10-20, M3)
- Datei: `src/engine/wahl.js` (`sainteLague`, Aktion `wahl`).
- Die Wahl nimmt genau die aktuellen Anteile, ohne Zufallsabweichung.
- Sperrklausel: Sitze ab genau 5,0 % (`>=`). „Sonstige“ bekommen nie Sitze. Keine Grundmandatsklausel.
- Sainte-Laguë: Sitz für Sitz an die höchste Höchstzahl Stimmen / (2 · Sitze + 1). Gleichstand: Los über den Seed-Zufall (nur bei echtem Gleichstand wird gezogen).
- Gerechnet in ganzen Tausendstel-Prozent, ohne Rundungsfehler.
- Ergebnis: `sitze` im Spielzustand, danach Phase `koalition` – oder sofort `opposition`, wenn für den Spieler keine Mehrheit möglich ist (siehe Koalition).
- Keine Partei über der Hürde: Fehler (keine Spielregel dafür).
- Abgleich: Mit den Startwerten 2025 gibt es CDU/CSU 209, AfD 152, SPD 120, Grüne 85, Linke 64. Echt: Union 208 + SSW 1 (SSW fehlt im Spiel).

## Oberfläche: Bundestag-Grafik (freigegeben 2026-10-20, M4)
- Datei: `src/ui/components/bundestag.js`. SVG-Halbkreis, ein Punkt je Sitz, Mitte zeigt die Gesamtzahl, Legende darunter, Tooltip je Fraktion.
- Sitzordnung von links nach rechts (Feld `sitzordnung` in `parteien.js`): Linke, BSW, Grüne, SPD, FDP, CDU/CSU, AfD. Spielentscheidung, keine offizielle Sitzordnung.

## System: Wahlkampf (freigegeben 2026-10-20, M5)
- Datei: `src/engine/wahlkampf.js` (Aktion `wahlkampfWoche`). Zahlen: `config.wahlkampf`.
- 8 Wochen, pro Woche genau eine Aktion des Spielers. Nach Woche 8 automatisch die Wahl (M3), danach Phase `koalition`.
- Plakate und Werbung: eigene Partei sicher +0,4.
- Großkundgebung: eigene Partei gleichverteilt zufällig zwischen −0,5 und +1,5.
- Angriff auf eine wählbare Partei (nicht sich selbst, nicht „Sonstige“): Ziel −0,8, eigene Partei +0,3. Hat das Ziel weniger als 0,8, verliert es nur, was es hat; der eigene Gewinn ist höchstens dieser Verlust.
- Umverteilung: Was feste Änderungen netto gewinnen oder verlieren, tragen die übrigen Parteien (inkl. „Sonstige“) im Verhältnis ihrer Größe. Kein Anteil unter 0.
- Schwankung nach jeder Aktion: jede Partei (auch die eigene) zufällig ±0,3 (gleichverteilt), danach Rückrechnung auf 100 %.
- Danach Rundung auf Tausendstel-Prozent; der Rundungsrest (wenige Tausendstel) geht an die größte Partei, damit die Summe genau 100 ist.
- Zufallsreihenfolge: erst Kundgebung (falls gewählt), dann Schwankung in der Reihenfolge von `parteien.js`.
- Abnehmender Ertrag (F08, freigegeben 2026-10-21, ändert die frühere Entscheidung „nicht enthalten“): Wird dieselbe Aktion in Folge gewählt, wirkt sie je Wiederholung 25 % schwächer, nie unter 25 % (100, 75, 50, 25, 25 … %). Gilt für alle festen Änderungen der Aktion (Plakate, Kundgebung samt Minus-Risiko, Angriff für Ziel und eigene Partei). Angriff auf ein anderes Ziel zählt als dieselbe Aktion. Eine andere Aktion oder ein neuer Wahlkampf setzt zurück. Zahlen: `config.wahlkampf.abnahmeJeWiederholung`, `mindestFaktor`. Feld `wahlkampfSerie` ({ aktion, anzahl }), Spielstand-Version 4. Die Knöpfe zeigen die Wirkung für diese Woche, das Protokoll nennt die Abnahme.
- Begründung: Ohne Abnahme gewann je Partei eine Dauerstrategie (CDU/CSU immer Kundgebung 55 %, SPD und Grüne immer Angriff 28,5 % bzw. 16 %). Mit Abnahme ist keine „immer …“-Strategie mehr die beste (freigegebener Maßstab), siehe BALANCING.md.
- Nicht enthalten (bewusst): Budget, Themen, Zielgruppen, Regionen, Zufallsereignisse, Gegner-KI, Regierungsbilanz.

## System: Koalition und Kanzlerwahl (freigegeben 2026-10-20, M6)
- Datei: `src/engine/koalition.js` (Aktion `verhandeln`). Zahlen: `config.koalition`.
- Mehrheit: mehr als die Hälfte aller Sitze (Art. 63 GG), bei 630 also 316. Wird aus den Sitzen berechnet.
- Der Spieler wählt Partner aus den Parteien im Bundestag (oder keine bei eigener Mehrheit). Verhandeln nur, wenn zusammen ≥ Mehrheit.
- Jeder Partner stimmt zufällig zu, Chance nach Abstand in der Sitzordnung: 1 → 90 %, 2 → 70 %, 3 → 40 %, ab 4 → 15 %. Zufall in der Reihenfolge von `parteien.js`, unabhängig von der Klickreihenfolge.
- Größenfaktor (Balancing, freigegeben 2026-10-21): Hat der Partner mehr Sitze als die Spielerpartei, wird die Chance mit Sitze Spieler / Sitze Partner multipliziert. Der Koalitionsbildschirm zeigt die so verringerte Chance.
- Brandmauer: Niemand koaliert mit der AfD (Chance 0), auch nicht, wenn der Spieler die AfD führt.
- Absage: Partei ist für diese Wahlperiode gesperrt. Ist danach keine Mehrheit mehr möglich: Phase `opposition` (Spielende, ausgestaltet in M10).
- Spieler ohne Sitze oder ohne mögliche Mehrheit gleich nach der Wahl: Phase `opposition`.
- Den Kanzler stellt immer die Spielerpartei.
- Kanzlerwahl: bis zu 2 Wahlgänge; jeder Koalitionsabgeordnete weicht je Wahlgang mit 2 % ab; gewählt bei ≥ Mehrheit. Danach Phase `kabinett` (Alleinregierung: direkt `regierung`, siehe Kabinett). Scheitern beide: Neuwahl (Phase `wahlkampf`, Woche 1, aktuelle Umfragewerte, Sperren aufgehoben).
- Neue Zustandsfelder: `abgelehnt`, `koalition` ({ partner }), `kanzlerParteiId`.
- Nicht enthalten (bewusst): Inhalte/Koalitionsvertrag, Kanzler aus anderer Partei, Koalitionen der Gegner. Minderheitsregierung und Kanzlerwahl im letzten Wahlgang: seit F11.

## System: Kabinett (freigegeben 2026-10-20, M7)
- Datei: `src/engine/kabinett.js` (Aktion `bestaetigen`). Sainte-Laguë liegt jetzt in `src/engine/hoechstzahl.js` (für Sitze und Ministerien).
- Kanzleramt: immer die Spielerpartei.
- Anzahl Ministerien je Koalitionspartei: Sainte-Laguë nach Sitzen über die 16 Ministerien, Los bei Gleichstand. Wird direkt nach der erfolgreichen Kanzlerwahl berechnet und als `kabinett.anspruch` gespeichert.
- Alleinregierung: alle 16 an den Spieler, ohne Auswahl; direkt Phase `regierung`.
- Koalition: Spieler ordnet jedes Ministerium einer Koalitionspartei zu. Gültig nur, wenn jede Partei genau ihren Anspruch erhält. Danach Phase `regierung`.
- Vorschlag zum Vorausfüllen: Parteien wählen abwechselnd (Spieler zuerst, dann Partner in Reihenfolge von `parteien.js`), Ministerien in Listenreihenfolge; Parteien mit erfülltem Anspruch werden übersprungen.
- Neues Zustandsfeld: `kabinett` ({ anspruch, verteilung }). Wird bei Wahl und Neuwahl zurückgesetzt.
- Wirkung auf andere Systeme: Haushalt (M8) – Budgetänderungen eines Ministeriums wirken auf die Umfrage der Partei, die es hält.
- Nicht enthalten (bewusst): Minister als Personen, Rücktritte/Skandale/Umbildung, Ressortwünsche der Partner.

## System: Haushalt (freigegeben 2026-10-20, M8)
- Datei: `src/engine/haushalt.js` (Aktion `haushaltBeschliessen`, Hilfen `bilanz`, `vorschau`). Zahlen: `config.haushalt`, Startwerte: `src/data/haushalt.js`.
- Beträge intern in tausend Euro (ganze Zahlen).
- Startwerte: Bundeshaushalt 2026 (Haushaltsgesetz 2026, Gesamtplan): Etat je Ministerium = Einzelplan; fest: Bundesschuld 33,65 Mrd., Allgemeine Finanzverwaltung 47,35 Mrd., Kanzleramt und Verfassungsorgane 6,70 Mrd.; Steuern 387,21 Mrd.; sonstige Einnahmen 39,36 Mrd. (fest). Ausgaben 524,54 Mrd., neue Schulden 97,97 Mrd.
- Ablauf: Phase `regierung` hat 4 Haushaltsjahre (`legislaturJahre`). Je Jahr: Ministeriumsetats in 5-%-Schritten bis ±20 %, Steuern in 1-%-Schritten bis ±5 %, jeweils gegenüber dem Vorjahr. Der beschlossene Haushalt ist Ausgangspunkt fürs nächste Jahr und gilt auch über die Wahl hinaus.
- Schuldenbremse: zählende Schulden = neue Schulden − max(0, Verteidigung − Freigrenze 25,107 Mrd.); Grenze 40,39 Mrd. Darüber kann nicht beschlossen werden. Die Freigrenze ist so kalibriert, dass der Haushalt 2026 genau an der Grenze liegt.
- Wirkung je Mrd. Änderung auf die Partei, die das Ministerium hält: Mehrausgabe +0,02, Kürzung −0,05 Prozentpunkte (Balancing 2026-10-21, vorher −0,03). Steuern auf die Partei mit dem Finanzministerium: Erhöhung −0,03, Senkung +0,02 je Mrd. Verteilung über `umverteilen` (wie Wahlkampf), danach Schwankung ±0,3 und Rundung wie im Wahlkampf.
- Mitgezählt: `haushalt.neueSchuldenSeitStart` (für M10).
- Nach Jahr 4: Phase `wahlkampf`, Woche 1, Sitze/Koalition/Kabinett/Kanzler zurückgesetzt, Haushaltsjahr wieder 1.
- Neues Zustandsfeld: `haushalt` ({ jahr, etats, steuern, neueSchuldenSeitStart }).
- Nicht enthalten (bewusst): Konjunktur, mit den Schulden steigende Zinsen, Sondervermögen, Einspruch der Partner, Game Over wegen Schulden (M10).

## System: Bundesrat (freigegeben 2026-10-21, M9)
- Datei: `src/engine/bundesrat.js` (`bundesratAbstimmung`). Daten: `src/data/laender.js` (Feld `regierung`, `geschaeftsfuehrend`; `andereParteien` für Freie Wähler und Thüringen.Gerecht).
- Landesregierungen: Stand 24.09.2026 (Wikipedia, Stimmenverteilung im Bundesrat), BW und RP zusätzlich geprüft. Berlin, Sachsen-Anhalt und Mecklenburg-Vorpommern nur geschäftsführend; sie stimmen bis zur Neubildung ab.
- Wirkung: Ein Haushalt mit Steueränderung braucht die Zustimmung des Bundesrats (Art. 105 GG), mindestens 35 von 69 Stimmen. Der übrige Haushalt braucht den Bundesrat nicht (echt nur Einspruch, überstimmbar).
- Abstimmung ohne Zufall: Ein Land stimmt zu, wenn alle seine Regierungsparteien in der Bundeskoalition sind; sonst Enthaltung (zählt wie Nein). Freie Wähler und Thüringen.Gerecht sind nie in der Bundeskoalition.
- Beispiele: Union+SPD 24, Union+SPD+Grüne 49, SPD+Grüne+Linke 18 Stimmen.
- Nicht enthalten (bewusst): Landtagswahlen im Spiel, Vermittlungsausschuss, weitere Gesetze.

## System: Bundestag-Abstimmung (freigegeben 2026-10-21, F10)
- Datei: `src/engine/bundestag.js` (`abstimmung(zustand, vorlage)` → `{ vorlage, ja, nein, enthaltung, angenommen, fraktionen: [{ id, sitze, stimme }] }`). Zahlen: `config.bundestag`. Anzeige: `src/ui/components/abstimmung.js`.
- Ohne Zufall, damit das Ergebnis vorher sichtbar ist. Koalitionsfraktionen stimmen geschlossen Ja.
- Opposition nach Abstand in der Sitzordnung zur nächsten Koalitionspartei: Abstand 1 → Ja, 2 → Enthaltung, ab 3 → Nein.
- Angenommen bei mehr Ja- als Nein-Stimmen; Enthaltungen zählen nicht; Gleichstand ist abgelehnt (Art. 42 Abs. 2 GG, Bundestag-Glossar „Mehrheit, einfache“, geprüft 2026-10-21).
- Brandmauer: AfD-Stimmen für Vorlagen anderer zählen wie alle anderen (Abstimmung ist keine Koalition). Für eine Regierung mit AfD stimmt seit F11 keine andere Fraktion (siehe dort).
- Haushalt: wird im Bundestag abgestimmt; der Knopf „Haushalt beschließen“ ist ohne Mehrheit gesperrt. Mit Koalitionsmehrheit immer angenommen, wichtig erst mit F11. Der Haushaltsbildschirm zeigt die Zeile „Bundestag: x Ja, y Nein“ und die aufklappbare Liste der Fraktionen.
- Beispiel mit Sitzen 2025: Union+SPD 566 Ja / 64 Nein; Grüne allein 205 Ja / 361 Nein / 64 Enthaltung (abgelehnt); Union allein 361 Ja (mit AfD) / 149 Nein.
- Nicht enthalten (bewusst): Ausschüsse, Lesungen, Fraktionsdisziplin-Werte, Abstimmung nach Inhalt der Vorlage (später mit F13 möglich).

## System: Minderheitsregierung (F11; Grundregeln freigegeben 2026-10-21, Brandmauer und Balancing 2026-10-22)
- Dateien: `src/engine/koalition.js` (`minderheitMoeglich`, `minderheitsKanzlerwahl`, Aktion `minderheitAntreten`, `regierungMoeglich`), `src/engine/bundestag.js` (`abstimmen`), `src/engine/haushalt.js`. Zahlen: `config.minderheit`, `config.bundestag`.
- Wer: nur die stärkste Fraktion (gleich stark zählt mit), jederzeit während der Regierungsbildung. Sie regiert allein und besetzt alle Ministerien.
- Kanzlerwahl im letzten Wahlgang (Art. 63 Abs. 4 GG) nach der Abstimmungsregel aus F10, normale Stufen (Abstand 1 Ja, 2 Enthaltung, ab 3 Nein); gewählt bei mehr Ja als Nein. Möglich nur, wenn die Vorschau eine Mehrheit zeigt – außer bei der AfD (Brandmauer, unten).
- Im Amt: Bei jedem Haushalt stimmt die Opposition eine Stufe strenger ab (Abstand 1 → Enthaltung, sonst Nein; freigegeben 2026-10-22). Beispiel Union allein mit Sitzen 2025: 209 Ja / 269 Nein / 152 Enthaltung.
- Gescheiterter Haushalt: vorläufige Haushaltsführung, der Vorjahreshaushalt gilt weiter (Schulden wie im Vorjahr), die Kanzlerpartei verliert 0,5 Punkte (danach Schwankung wie üblich), das Jahr zählt als Kanzlerjahr. Nach 2 gescheiterten Haushalten in einer Wahlperiode ist die Regierung am Ende: Phase `opposition`, Spiel verloren (Balancing 2026-10-22, vorher Neuwahl – damit gewann CDU/CSU 100 % der Partien, weil sie als stärkste Fraktion immer wieder als Minderheit antreten konnte).
- Koalitionsbruch ohne verbleibende Mehrheit: Ist die Spielerpartei stärkste Fraktion, regiert sie als Minderheit weiter; sonst vorgezogene Neuwahl wie bisher.
- Spielende „Opposition“, wenn weder eine Koalition mit Mehrheit noch eine Minderheitsregierung möglich ist.
- Brandmauer bei Abstimmungen (freigegeben 2026-10-22): Für eine Regierung mit AfD stimmt keine andere Fraktion. Nur einzelne Abgeordnete einer Nachbarfraktion (Abstand 1, also die Union) weichen mit 0,1 % je Abgeordnetem ab und stimmen Ja (`config.bundestag.brandmauerAbweichler`, Zufall über den Seed, nur in der echten Abstimmung `abstimmen`, nicht in der Vorschau). Die AfD darf als stärkste Fraktion die Kanzlerwahl trotzdem versuchen; scheitert sie, Phase `opposition`.
- Neue Zustandsfelder: `koalition.minderheit`, `koalition.fehlschlaege` (Spielstand-Version 6).
- Balancing (`docs/BALANCING.md`, 2026-10-22): CDU/CSU 28–62 % Siege je Wahlkampf-Strategie (vorher mit F11-Rohfassung 100 %), AfD 0 %. Wer ohne Not als Minderheit antritt, scheitert fast immer.
- Nicht enthalten (bewusst): Duldung gegen Zugeständnisse, Misstrauensvotum, Vertrauensfrage, Minderheitskoalitionen aus mehreren Parteien.

## System: Regierungsjahr in Quartalen (F12, freigegeben automatisch nach Empfehlung 2026-10-22)
- Dateien: `src/engine/regierung.js` (Aktion `quartalBeenden`, `haushaltsQuartal`), `src/ui/screens/regierung.js`. Zahl: `config.regierung.quartaleJeJahr` = 4.
- Ein Haushaltsjahr hat 4 Quartale. In Quartal 1–3 zeigt der Regierungsbildschirm Jahr, Quartal, Regierung, Umfrage und Verlauf, Knopf „Nächstes Quartal“ bzw. „Weiter zum Haushalt“. Im 4. Quartal wird der Haushalt beschlossen (`haushaltBeschliessen` wirft sonst), danach beginnt das nächste Jahr mit Quartal 1.
- Die Zeit allein ändert nichts: kein Zufall, keine Umfrageänderung. Sieg, Koalitionsbruch, Spielende der Minderheitsregierung und Ende der Wahlperiode hängen weiter am Haushalt.
- Grundlage für Reformen (F13) und Ereignisse (F14), die in den Quartalen stattfinden.
- Neues Zustandsfeld: `quartal` (Spielstand-Version 7); bei Wahlkampf und nach jedem Haushalt 1.
- Nicht enthalten (bewusst): Monate, Wirkung der Zeit auf Umfragen.

## System: Probleme und Reformen (F13, freigegeben automatisch nach Empfehlung 2026-10-22; seit 2026-10-24 in der Problem-Engine aufgegangen, siehe dort)
- Dateien: `src/data/probleme.js` (Probleme, Reformen), `src/engine/reformen.js` (Aktion `reformEinbringen`, `reformVorschau`, `sperrgrund`, `reformKosten`, `druckSteigt`), Anzeige im Regierungsbildschirm (`src/ui/screens/regierung.js`). Zahlen: `config.reformen`.
- Probleme (reale Baustellen, Werte sind Spielwerte ohne Quelle): Mieten und Wohnraum (Bauen, Start-Druck 60), Pflege (Gesundheit, 55), Bahn und Schiene (Verkehr, 50). Druck 0–100.
- Druck steigt bei jedem beendeten Quartal um 1 (höchstens 100), also 3 je Haushaltsjahr. Ab Druck 70 kostet jedes Problem die Kanzlerpartei 0,1 Punkte je beendetem Quartal (über `umverteilen`, ohne Schwankung).
- Je Problem 2 Reformen in Stufen (Stufe 2 erst nach Stufe 1): Wohnen 2,0 / 1,0 Mrd., Pflege 3,0 / 1,5 Mrd., Schiene 4,0 / 2,0 Mrd. je Jahr; Druck −20 / −15.
- Einbringen: höchstens eine Reform je Quartal, nicht im Haushaltsquartal. Der Bundestag stimmt nach F10/F11 ab (Minderheitsregierung strenger, Brandmauer mit Abweichlern). Angenommen: Druck sinkt sofort, die Partei des zuständigen Ministeriums gewinnt 0,01 Punkte je gesenktem Druckpunkt, die Kosten zählen ab dem nächsten Haushalt dauerhaft als Ausgaben und zur Schuldenbremse. Abgelehnt: nichts passiert, das Quartal ist verbraucht.
- Weil der Haushalt 2026 genau an der Schuldenbremse liegt, muss jede Reform im Haushalt durch Kürzungen (oder Steuern mit Bundesrat) ausgeglichen werden – Kürzungen schaden der Ministeriumspartei, bei Partnern bis zum Koalitionsbruch.
- Probleme und beschlossene Reformen gelten über Wahlperioden hinweg.
- Neue Zustandsfelder: `probleme`, `reformen`, `reformImQuartal` (Spielstand-Version 8).
- Balancing (`docs/BALANCING.md`, Abschnitt Reformen): CDU/CSU mit Reformen 62 % Siege statt 53 %, Druck am Ende 55 statt 81.
- Nicht enthalten (bewusst): Stellschrauben innerhalb einer Reform, Wahl der Gegenfinanzierung, Bundesrat bei Reformen, Zustimmung der Partner, verzögerte Wirkung, Gerichte, Verbände.

## System: Ereignisse (F14, freigegeben automatisch nach Empfehlung 2026-10-22)
- Dateien: `src/data/ereignisse.js` (8 Ereignisse mit Text, Bedingung, 2–3 Möglichkeiten und Folgen), `src/engine/ereignisse.js` (`ereignisZiehen`, Aktion `ereignisEntscheiden`, `folgen`), Karte im Regierungsbildschirm. Zahl: `config.ereignisse.chanceJeQuartal` = 0,3.
- Bei jedem beendeten Quartal (nach dem Druckanstieg) mit 30 % Chance ein Ereignis, gezogen über den Seed-Zufall aus denen, deren Bedingung erfüllt ist und die in dieser Wahlperiode noch nicht kamen. Höchstens eines je Quartal.
- Solange ein Ereignis offen ist, gehen weder Quartalswechsel noch Reform noch Haushalt; ein Ereignis beim Wechsel ins Haushaltsquartal wird vor dem Haushalt beantwortet.
- Folgen ohne Zufall: Umfragepunkte für die Kanzlerpartei, für jeden Partner oder für die Partei, die ein bestimmtes Ministerium hält (über `umverteilen`), und Druckänderungen bei Problemen (F13, begrenzt auf 0–100). Jede Möglichkeit zeigt ihre Folgen vor dem Klick.
- Eigene Texte, keine echten Personen, keine Ereignisse gegen einzelne reale Parteien. Werte sind Spielwerte (0,05–0,3 Punkte, 2–8 Druckpunkte).
- Neue Zustandsfelder: `offenesEreignis`, `ereignisseWahlperiode` (zurückgesetzt im Wahlkampf), Spielstand-Version 9.
- Balancing: Strategie „immer die erste Möglichkeit“; CDU/CSU 31–65 % Siege je Wahlkampf-Strategie, keine Änderung der Schwierigkeitsstufen.
- Nicht enthalten (bewusst): Ketten-Ereignisse, Krisen über mehrere Quartale, Affären mit Personen, Ereignisse im Wahlkampf, einmalige Kosten im Haushalt.

## System: Grundlagen der Erweiterung „drei Systeme“ (freigegeben automatisch nach Empfehlung 2026-10-23)
Entscheidungen des Nutzers (2026-10-23): Haushalt bleibt Bund mit echten Anteilen; F13/F14 gehen in der neuen Problem-Engine auf; echte Startwerte, Spielwirkungen; Parteipositionen aus dem Chapel Hill Expert Survey.
- Landeskennzahlen (`src/data/kennzahlen.js`, Zustand `land`): Wachstum 0,2 %, Inflation 2,2 %, Arbeitslosenquote 6,3 %, Gini 30,1, Schuldenquote 63,5 % (Ist 2025; Quellen in der Datei), dazu Schulden 2 840 Mrd. und BIP 4 472 Mrd. (abgeleitet).
- Gruppen (Zustand `gruppen`, 0–100, Start 50): Arbeitnehmer, Rentner, Familien, Geringverdiener, Unternehmen, Landwirtschaft.
- Politisches Kapital (Zustand `kapital`, 0–100, Start 50, +8 je Quartal, `config.kapital`): Ressource für Reformwege und Lösungen.
- Achsen −2 … +2: Wirtschaft (staatlich ↔ marktliberal), Gesellschaft (progressiv ↔ konservativ), Ökologie (wachstumsorientiert ↔ ökologisch), Europa (national-souverän ↔ EU-orientiert).
- Parteipositionen: CHES 2024 (`parteien.js`, Feld `ches`), CDU/CSU nach Sitzen gewichtet; Umrechnung in `src/engine/profil.js`.
- Speichern: Spielstand-Version 10. Ältere Stände ab Version 9 werden beim Laden schrittweise migriert (`MIGRATIONEN` in `state.js`) statt verworfen; neue Felder bekommen ihre Startwerte.

## System: Einnahmen, Wirtschaft und Schulden (System 2, freigegeben automatisch nach Empfehlung 2026-10-23)
- Dateien: `src/data/einnahmen.js` (Einnahmearten, Quellen in der Datei), `src/engine/einnahmen.js` (Aufstellung mit Herleitung, Prüfung, Wirkung, Gegenfinanzierung), `src/engine/wirtschaft.js` (Jahresschritt), `src/engine/haushalt.js` (Bilanz, Vorschau, Beschluss, Prognose, Kürzungsvorschlag), Oberfläche `src/ui/screens/haushalt.js`. Zahlen: `config.wirtschaft`, `config.haushalt`.
- Einnahmearten mit eigenem Parameter, Grenzen je Jahr und absolut: Einkommensteuer (Tarif ±Pp, inkl. Soli), Kapitalertragsteuer (Abgeltungsteuersatz 25 %), Körperschaftsteuer (15 %), Umsatzsteuer (19 %), Gewerbesteuer (Messzahl; Gemeinden), Energie- und Verbrauchsteuern (±%), Erbschaftsteuer (Länder), Vermögensteuer (0 %, Länder, verfassungsrechtlich heikel), Sozialversicherungsbeiträge (Rentenbeitrag 18,6 %; wirkt über den Bundeszuschuss), CO2-Bepreisung (55 €/t; Sondervermögen KTF, nicht im Kernhaushalt), sonstige Einnahmen (Privatisierungen einmalig). Die Neuverschuldung ist der Saldo.
- Startbeträge: Bundesanteile 2024 (BMF-Kassenstatistik) skaliert auf die 387,21 Mrd. Steuern des Haushalts 2026; Summe Kernhaushalt 426,57 Mrd. wie bisher.
- Je Stufe (Spielwerte): Mehr- oder Mindereinnahme, Wirkung auf Wachstum, Inflation, Gini, Gruppen und Probleme; Ausweichen ab einer Schwelle (wachsender Anteil des Mehraufkommens geht verloren); Verzögerung (im ersten Jahr nur ein Anteil). Ausgestaltungs-Schalter (Freibeträge, Familien, Branchen, Lebensmittel, Klimageld u. a.) mit Kosten und Wirkung.
- Bundesrat: nötig bei Änderungen an Gemeinschafts-, Länder- und Gemeindesteuern (Einkommen, Kapitalertrag, Körperschaft, Umsatz, Gewerbe, Erbschaft, Vermögen); nicht bei Bundessteuern, Beiträgen, CO2-Preis und sonstigen Einnahmen.
- Wirtschaft je Haushaltsjahr: Wachstum und Inflation kehren zur Hälfte zu 0,8 % bzw. 2,0 % zurück, dazu Wirkungen und Zufall (±0,5 / ±0,3); Arbeitslosigkeit nach Okun (0,4) und Rückkehr zu 5,5 %; Gini zurück zu 30; BIP nominal; Schulden = Vorjahr + Neuverschuldung Bund + 0,6 % BIP (übrige Ebenen). Gruppen: Wirkung, dann 15 % zurück Richtung 50. Die Lage wirkt auf die Kanzlerpartei (`config.wirtschaft.umfrage`).
- Steuerbasis wächst mit dem realen BIP; Zinsen (Epl. 32) wachsen mit dem Schuldenstand; die Grenze der Schuldenbremse wächst mit dem nominalen BIP, die Konjunkturkomponente gibt 4 Mrd. je Prozentpunkt Wachstum unter 0,2 % (und nimmt in guten Jahren entsprechend).
- Oberfläche: Haushalt mit Übersicht (Einnahmen und Ausgaben nebeneinander, Saldo, Schuldenbremse, Schuldenquote, Wirkung, Koalition, Einbringen), Einnahmen (je Art Parameter, Herleitung zum Aufklappen, Ausgestaltung, Gegenfinanzierungs-Vorschläge), Ausgaben, Schulden, Prognose (5 Jahre ohne Zufall, beschlossener Stand gegen Entwurf). Der Entwurf wird erst mit „Haushalt einbringen“ festgelegt.
- Spielstand-Version 11: `haushalt.einnahmen` statt `haushalt.steuern` (alte Steueränderungen als Faktor übernommen), `land.preise`.
- Balancing: Ein unveränderter Haushalt hält die Schuldenbremse in 93 % der Partien über 12 Jahre; sonst muss gegenfinanziert werden. Siegquoten CDU/CSU 36–68 % je Wahlkampf-Strategie.
- Nicht enthalten (bewusst): eigene Haushalte der Länder und Gemeinden, Zinsänderungen am Markt, Steuerschätzung mit Abweichungen, Sondervermögen außer KTF.

## System: Problem-Engine (System 3, freigegeben automatisch nach Empfehlung 2026-10-23/24; ersetzt die F13-Probleme)
- Dateien: `src/data/probleme.js` (25 Problembereiche mit Kategorie, Startwert, Grundtrend, Treibern, Schocks, Folgen, 2–3 Lösungen), `src/engine/probleme.js` (Ursachen, Trend, Liste, Quartalsschritt, Lösungen, Jahresfolgen, laufende Kosten), Oberfläche `src/ui/screens/probleme.js`. Alle Schwellen und Gewichte: `config.probleme`.
- Problembereiche: Fachkräftemangel, Wohnungsnot, Pflegenotstand, Rentenlücke, Energiepreise, Klimafolgen, Infrastruktur, Bildungskrise, Digitalisierung, Inflation, Rezession, Staatsverschuldung, Cyberangriffe, Migration, soziale Spaltung, Polarisierung, Kriminalität, Ärztemangel, Bundeswehr, Geopolitik, Landwirtschaftsproteste, Kommunalfinanzen, Vertrauensverlust, Pandemie, Demografie.
- Wert 0–100, Stufen: ruhig, angespannt ab 40, ernst ab 60, Krise ab 80. Je beendetem Quartal: Wert + Grundtrend + Treiber (Kennzahlen, andere Probleme als Wechselwirkung, Gruppenstimmung, Etatkürzungen gegenüber 2026, Richtungsprofil) ± Zufall 1; seltene Schocks (Pandemie, Cyberangriffe, Geopolitik, Energie, Extremwetter). Eskalationen auf „ernst“/„Krise“ werden gemeldet.
- Höchstens 6 Probleme ab „angespannt“ sind prominent, der Rest steht auf der Beobachtungsliste (Frühwarnung ab 32 bei steigendem Trend). Prominente ernste Probleme kosten die Kanzlerpartei 0,02, Krisen 0,05 Punkte je Quartal. Folgen je Haushaltsjahr (Kennzahlen, Gruppen) mit 25/60/100 % je Stufe.
- Lösungen: Regierungsprogramme ohne Bundestagsabstimmung. Kosten politisches Kapital und Aufmerksamkeit (zusammen mit Reformwegen höchstens 2 Vorhaben je Quartal, nicht im Haushaltsquartal), laufende Kosten im Haushalt solange sie laufen oder wirken, Dauer in Quartalen. Danach Erfolg nach Erfolgschance (± 0,15 je nach Nähe zum Richtungsprofil, 5–95 %): Problem sinkt um die Wirkung, Nebenwirkungen greifen, die Partei des zuständigen Ministeriums gewinnt 0,01 und die Regierung 0,015 je Punkt (nach Umfrageanteil verteilt). Fehlschlag: nur 30 % der Wirkung, Kanzlerpartei −0,2, Kosten enden.
- Ressourcen: politisches Kapital (+8 je Quartal, höchstens 100), Aufmerksamkeit (2 Vorhaben je Quartal), Haushalt (laufende Kosten).
- F13 geht darin auf: Wohnen/Pflege/Schiene sind jetzt Wohnungsnot/Pflegenotstand/Infrastruktur; die sechs F13-Reformen sind Lösungen mit gleicher ID und gleichen Kosten. F14-Ereignisse sind an Probleme gebunden (kommen nur ab Problemwert 30) und wirken auf Problemwerte.
- Spielstand-Version 12: `probleme` { wert, verlauf }, `loesungen`, `runde`, `aktionenImQuartal`, `jahresWirkung`; Migration von F13 (Druck → Wert, beschlossene Reformen → erfolgreiche Lösungen).
- Balancing (`docs/BALANCING.md`, Abschnitt Probleme und Lösungen): ohne Lösungen im Mittel 1,6 Krisen am Ende, mit Lösungen 0,1–0,5; CDU/CSU gewinnt mit Lösungen 60–66 % statt 51 %, keine Lösungsstrategie dominiert.
- Nicht enthalten (bewusst): Probleme der Länder, Krisen über mehrere Ereignisketten, Lösungen mit Bundestagsabstimmung (das sind die Reformwege).

## System: Reformwege mit politischer Ausrichtung (System 1, freigegeben automatisch nach Empfehlung 2026-10-24)
- Dateien: `src/data/reformwege.js` (Ausrichtungen, Akteure, 10 Bereiche mit Wegen), `src/engine/reformwege.js` (Sperren, Vorschau, Beschluss, Umsetzung, Kosten, Einnahmen, Trends, Profilwirkung), `src/engine/profil.js` (CHES-Achsen, Abstand, Richtungsprofil), Oberfläche `src/ui/screens/reformen.js` und `src/ui/components/profil.js`. Zahlen: `config.reformwege`.
- Bereiche: Rente, Steuern, Gesundheit, Bildung, Arbeit, Energie, Migration, Verteidigung, Wohnen, Digitales; je 3–5 Grundwege mit mindestens drei Ausrichtungen (marktliberal, konservativ, sozialdemokratisch, grün, links, national, pragmatisch). Je Weg: Text, Ausrichtung (Vektor auf den vier Achsen), laufende Kosten, Einnahmeänderungen, Sofort- und Langwirkung (Kennzahlen, Gruppen, Problemwerte, dauerhafte Problemtrends), Dauer, Risiko, politisches Kapital, Voraussetzungen (Bundesrat, Haushaltsspielraum, Grundweg).
- Pfadabhängigkeit: Anschlussreformen (Generationenkapital, Mindestrente, Einheitskasse, Wasserstoff, kleine Reaktoren, EU-Rüstung, Bodenfonds) nur nach dem passenden Grundweg.
- Beschluss ist verbindlich: Bundestag stimmt nach Inhalt ab (Opposition Ja bis Abstand 0,9, Enthaltung bis 1,5; Koalitionspartner Veto ab 1,7, sonst Unmut 0,3 je Punkt Abstand; Brandmauer bleibt). Abgelehnt: die Hälfte des Kapitals ist trotzdem verbraucht. Kurswechsel in einem Bereich: +25 Kapital, Kanzlerpartei −0,5, alter Weg und seine Anschlussreformen fallen weg.
- Umsetzung: nach der Dauer Erfolg oder Scheitern nach Risiko (verfassungsrechtlich umstrittene Wege +0,2, Karlsruhe); bei Erfolg Langwirkung und Trends, dazu Umfragegewinn wie bei Lösungen (Ressort 0,01, Regierung 0,015 je gesenktem Problempunkt); beim Scheitern Kanzlerpartei −0,3.
- Balancing (`docs/BALANCING.md`, Abschnitt Reformwege nach Ausrichtung): keine Ausrichtung dominiert (CDU/CSU 54–62 %, SPD 16–26 %); Wege weit weg vom Partner führen häufig zum Koalitionsbruch (SPD mit marktliberalem Kurs 43 %). Reformwege sind gegenüber reinen Lösungen gleichauf bis leicht schlechter, weil sie Kapital und Aufmerksamkeit binden; ihr Nutzen liegt in dauerhaften Trends.
- Reaktionen: Koalitionspartner (Unmut/Veto), Opposition (Abstimmung), Verbände, Gewerkschaften, Umwelt- und Sozialverbände, Bauernverband und EU (Haltung nach Abstand; bewegen die Gruppenstimmung), Bundesverfassungsgericht (Warnung und Risiko).
- Richtungsprofil: Mittel der Vektoren aller Wege in Umsetzung oder beschlossen, gedämpft mit n/(n+2). Wirkt je Haushaltsjahr auf Wachstum und Gini, EU-kritischer Kurs auf Wachstum, Partner und Kanzlerpartei nach Abstand, auf die Erfolgschance von Lösungen (±0,15) und auf profilabhängige Ereignisse (EU-Verfahren, Investoren, Generalstreik, Klimaklage, Rating).
- Lösungen und Reformwege teilen sich Kapital und Aufmerksamkeit (2 Vorhaben je Quartal). Kosten und Einnahmen der Wege erscheinen im Haushalt mit Herleitung („Reform: …“).
- Oberfläche: Menüpunkt Reformen (Übersicht mit Status offen/in Umsetzung/beschlossen und Richtungsprofil, Wegevergleich nebeneinander, Bestätigungsdialog), Richtungsprofil auf der Lage, Problem-Detail verweist auf passende Reformbereiche, Parlament mit Reiter „Verbände und EU“.
- Spielstand-Version 13: `reformwege` { [wegId]: { status, fertig } }; ältere Stände bekommen `{}`.
- Nicht enthalten (bewusst): Gesetzentwürfe mit Änderungsanträgen, Vermittlungsausschuss, Volksabstimmungen.

## System: Spielende (freigegeben 2026-10-21, M10)
- Dateien: `src/engine/haushalt.js` (`koalitionsbruch`, Sieg-Prüfung in `haushaltBeschliessen`), `src/engine/state.js` (`zurueckInDenWahlkampf`). Zahlen: `config.spielende`.
- Niederlage „Opposition“: nach einer Wahl oder nach Absagen ist keine Mehrheit für die Spielerpartei möglich (siehe Koalition) und seit F11 auch keine Minderheitsregierung; oder eine Minderheitsregierung scheitert an 2 Haushalten (siehe Minderheitsregierung).
- Koalitionsbruch: nach jedem beschlossenen Haushalt verlässt ein Partner die Koalition, wenn seine Umfrage um mehr als 1,5 Punkte (Balancing 2026-10-21, vorher 2,0) unter dem Wert bei Regierungsbildung (`koalition.startAnteile`) liegt (gerechnet in Tausendstel: −1,50 bleibt, −1,51 geht). Seine Ministerien und sein Anspruch gehen an die Spielerpartei. Behält die Rest-Koalition ≥ Mehrheit: weiterregieren. Sonst vorgezogene Neuwahl (Wahlkampf Woche 1, aktuelle Umfragen).
- Sieg: 12 Haushaltsjahre als Kanzler (`statistik.jahreKanzler`, über Wahlperioden hinweg). Phase `sieg`.
- Reihenfolge, wenn mehreres zugleich eintritt: Sieg vor Koalitionsbruch vor Ende der Wahlperiode.
- Statistik (`statistik`): Jahre als Kanzler, gebildete Regierungen, bestes eigenes Wahlergebnis; dazu neue Schulden seit Start.
- Endbildschirm (`src/ui/screens/ende.js`): Sieg oder Opposition, Statistik, letzter Bundestag, „Neues Spiel“.
- Balancing-Bericht: `npm run balancing` (`scripts/balancing.js`) schreibt `docs/BALANCING.md`. Werte werden nur nach Entscheidung des Nutzers geändert.

## Oberfläche: Nachrichtenticker (F15, freigegeben automatisch nach Empfehlung 2026-10-22)
- Dateien: `src/engine/schlagzeilen.js` (`schlagzeilen(zustand)`), `src/ui/components/ticker.js`; im Wahlkampf-, Regierungs- und Haushaltsbildschirm unter dem Hinweis. Zahlen: `config.ticker`.
- Reine Anzeige ohne Spielwirkung. Die Schlagzeilen werden aus dem aktuellen Spielstand abgeleitet (kein eigenes Zustandsfeld, kein Zufall, keine neue Spielstand-Version): gleicher Zustand, gleiche Schlagzeilen.
- In dieser Reihenfolge, höchstens 3, keine doppelten: Partner ab der Warnstufe des Koalitionsbruchs (F01); Probleme ab Druck 70, höchster zuerst (F13); Minderheitsregierung (F11); Umfragetrend der eigenen Partei über die letzten 3 Verlaufsschritte ab ±0,5 Punkten; Parteien mit höchstens 0,5 Punkten Abstand zur Sperrklausel.
- Feste Liste, keine Laufschrift, keine Live-Region (die Ansage aus F04 bleibt), keine erfundenen Zeitungsnamen, eigene Formulierungen.
- Nicht enthalten (bewusst): Zeitungsseite, Interviews, Presse als Spielsystem, Schlagzeilen-Varianten per Zufall, Meldungen aus dem Protokoll.

## Speichern und Laden (M11)
- Datei: `src/storage/speicher.js` (`spielSichern`, `spielLaden`, `spielLoeschen`), nutzt `speichern`/`laden` aus `src/engine/state.js`.
- Ein Spielstand im Browser (`localStorage`, Schlüssel `desim-zustand` und `desim-protokoll`).
- Automatisch gesichert nach dem Start und nach jeder Aktion. Kein Speichern-Knopf.
- Startbildschirm: „Weiterspielen“ mit Partei, Phase und Kanzlerjahren, wenn ein Stand da ist; ein neues Spiel überschreibt ihn.
- „Neues Spiel“ auf dem Endbildschirm löscht den Stand.
- Kaputte oder veraltete Spielstände (andere `version`) werden verworfen. Gesperrter Speicher (z. B. privates Fenster) bricht das Spiel nicht ab, es wird dann nur nicht gesichert.
- Partie teilen (F07, freigegeben 2026-10-21): Spielstand-Version 3 mit Feld `seed` (Start-Seed, bleibt unverändert). Endbildschirm zeigt den Link `…/?seed=<seed>` (nur Seed, keine Partei), Knopf „Link kopieren“ (Zwischenablage; geht das nicht, wird der Link im Feld markiert) und den Satz „Gleicher Start, gleicher Zufall: Bei gleichen Entscheidungen verläuft die Partie genau gleich.“ Öffnen des Links: Seed wird mit `seedAusAdresse()` (`src/engine/state.js`) geprüft, ganze Zahl 0 bis 2^32 − 1, ungültige Werte werden ignoriert. Danach wird der Parameter aus der Adresse entfernt (`history.replaceState`). Gibt es einen Spielstand, fragt der Startbildschirm „Gespeichertes Spiel überschreiben?“ (Nein: weiterspielen). Dann Parteiwahl mit diesem Seed.

## Oberfläche: App-Shell und Navigation (UI-Umbau, freigegeben automatisch nach Empfehlung 2026-10-22)
Ersetzt die Bildschirmbeschreibungen in „Oberfläche (M5)“ und den F-Abschnitten, wo sie abweichen. Keine Spielregel geändert, Spielstand unverändert (Version 9).
- Technik: reines JavaScript wie bisher (kein React, siehe CLAUDE.md). Design-Tokens und alle Stile zentral in `src/ui/stil.css` (Farben, Schriftgrade, 8-px-Raster, Radien, Schatten; hell und dunkel nach Systemeinstellung). Bausteine in `src/ui/components/basis.js` (Karte, Kennzahl, Knopf primär/sekundär/gefährlich, Tabs, Badge, Status mit Symbol, Balken, Aufklappbereich, Rückmeldung, leerer Zustand). Gerüst in `src/ui/shell.js`, Steuerung in `src/ui/app.js`.
- Kopfzeile (immer): Partei, Zeit, Umfrage mit Trendpfeil, Kanzlerjahre; Knopf „☰ Spiel“ öffnet das Spielmenü (Modal): Chronik (im geführten Ablauf und am Ende), Hinweise ein/aus, Partie teilen, „Neues Spiel …“ mit Bestätigung.
- Geführter Ablauf mit Schrittanzeige: 1 Wahlkampf (Aktionen zuerst, Umfrage, Verlauf aufklappbar) → 2 Wahlabend (Ergebnis, Sitze; neu, nur Anzeige) → 3 Regierungsbildung (mögliche Mehrheiten mit direktem „Verhandeln“/„Bilden“; aufklappbar: Partner selbst wählen, Minderheitsregierung, Sitze) → 4 Kabinett.
- Regierung mit Hauptnavigation: Lage (offenes Ereignis zuerst, vier Kennzahlen: Regierung, Mehrheit im Bundestag, Schuldenbremse-Spielraum, größtes Problem; Schlagzeilen; Hauptaktion „Nächstes Quartal“ bzw. „Zum Haushalt“), Reformen (Problemliste → Detail mit Stufen, Kosten, Wirkung, einer Abstimmung), Haushalt (Überblick, Ausgaben, Einnahmen, Abstimmungen; in Quartal 1–3 nur lesen; Eingaben bleiben beim Bereichswechsel), Parlament (Bundestag, Koalition mit Kabinett, Bundesrat), Chronik (Umfrageverlauf, letzte Wahl, Protokoll seitenweise je 20).
- Rückmeldung: Die Meldungen der letzten Aktion stehen oben im Hauptbereich; wirft die Engine (ungültige Aktion), erscheint der Grund als Fehlermeldung, der Spielstand bleibt unverändert.
- Begriffe: Alleinregierung = eigene Mehrheit, Minderheitsregierung = ohne Mehrheit; „Einbringen“ für Reform und Haushalt (beide werden abgestimmt); „Punkte“ = Prozentpunkte; Status immer mit Symbol (✓ ⚠ ✗).
- Handy: Kopfzeile scrollt mit, die Navigation bleibt oben; Touch-Ziele mindestens 44 px. Übergänge 180 ms, abgeschaltet bei reduzierter Bewegung.
- Nicht enthalten (bewusst): Suche (bei 3 Problemen und 6 Reformen ohne Nutzen), Kontextpanel rechts, manueller Hell/Dunkel-Schalter.

## Oberfläche (M5)
- Startbildschirm: Partei wählen (`src/ui/screens/start.js`). Seed wird zufällig gezogen.
- Wahlkampf (`src/ui/screens/wahlkampf.js`): Woche, Umfragebalken mit 5-%-Linie und Hinweis „unter Hürde“, drei Aktionen, Protokoll.
- Regierungsbildung (`src/ui/screens/koalition.js`, ab M6): Sitze, Bundestag-Grafik mit „Mehrheit ab 316“, Partnerliste mit Chance bzw. Sperrgrund, laufende Summe, Knopf „Verhandeln“/„Allein regieren“.
- Regierungsbildung, Liste „Mögliche Mehrheiten“ (F02, freigegeben 2026-10-21): über den Checkboxen alle Partnerkombinationen mit Mehrheit aus den noch möglichen Partnern (ohne abgelehnte, ohne Brandmauer). Nur minimale: Fällt ein Partner weg, fehlt die Mehrheit. Bei eigener Mehrheit zuerst „Allein regieren“ (100 %), darunter je ein einzelner Partner. Gesamtchance = Produkt der Einzelchancen mit Größenfaktor (so würfelt `verhandeln()`). Sortiert nach Chance absteigend, bei Gleichstand nach Sitzen. „Auswählen“ setzt nur die Häkchen, verhandelt wird erst mit dem Knopf. Rechnung: `moeglicheKoalitionen()` in `src/engine/koalition.js`.
- Kabinett (`src/ui/screens/kabinett.js`, ab M7): Auswahlfeld je Ministerium, Stand „x von y“ je Partei, Fehlerliste, Knopf „Kabinett vereidigen“ nur bei gültiger Verteilung.
- Haushalt (`src/ui/screens/haushalt.js`, ab M8): Jahr, Bilanz mit Schuldenbremse (✓/✗), Vorschau der Umfragewirkung je Partei, Steuerzeile, je Ministerium Partei-Farbpunkt, Etat und −/+ Knöpfe; „Haushalt beschließen“ nur bei eingehaltener Schuldenbremse. Ab M9: bei Steueränderung Zeile „Bundesrat: x von 35 Stimmen“ (Knopf gesperrt ohne Mehrheit) und aufklappbare Länderliste mit Regierung, Stimmen und Haltung (statt eines eigenen Bildschirms, damit die Haushaltseingaben beim Nachsehen erhalten bleiben).
- Haushalt, Block „Koalition“ (F01, freigegeben 2026-10-21): über „Wirkung auf die Umfragen“, je Partner der Verlust seit Regierungsbildung jetzt und nach diesem Haushalt (feste Wirkung, ohne Schwankung) gegen die Bruchgrenze, auf Tausendstel genau. Grün, gelb ab `config.spielende.warnAnteil` (0,5) der Grenze, rot mit „würde die Koalition verlassen“, wenn der Beschluss ohne Schwankung den Bruch auslöst. Hinweis, dass die Schwankung ±0,3 das Ergebnis verändern kann. Bei Alleinregierung nicht angezeigt. Rechnung: `bruchAbstand()` in `src/engine/haushalt.js`, dieselbe Funktion wie beim tatsächlichen Bruch.
- Endbildschirm (`src/ui/screens/ende.js`, ab M10) für Sieg und Opposition; ersetzt den früheren Platzhalter.
- Erklärtexte (F03, freigegeben 2026-10-21): unter der Überschrift jedes Bildschirms eine Box mit 1–3 Sätzen (Texte in `src/data/hinweise.js`, Zahlen aus `config.js`), auf dem Startbildschirm das Spielziel. Ein Knopf „Hinweise ausblenden“ blendet alle aus; auf dem Startbildschirm dann „Hinweise wieder anzeigen“. Gemerkt in `localStorage` unter `desim-hinweise`, nicht im Spielstand (bleibt bei neuem Spiel). Gesperrter Speicher: Hinweise bleiben an.
- Bedienbarkeit (F04, freigegeben 2026-10-21): Nach jeder Aktion (auch Spielstart, Weiterspielen, Neues Spiel, Hinweise aus/ein) bekommt die Überschrift (`h1`, `tabindex=-1`) den Fokus, beim ersten Laden nicht. Der neueste Protokolleintrag einer Aktion wird über die Live-Region `#ansage` (`aria-live="polite"`, visuell versteckt) angesagt. Haushalt: Bei −/+ bleibt der Fokus auf demselben Knopf; an der Grenze ist er `aria-disabled` statt `disabled`, damit der Fokus nicht verloren geht. Kontrast: gesperrte Partner `#666` statt `#888` (5,7:1 statt 3,5:1); `.ok`, `.rot`, `.gelb` liegen über 4,5:1.
- Wahlabend (F05, freigegeben 2026-10-21): oben im Koalitionsbildschirm „Euer Wahlkampf: ±x,xx Punkte“ und Tabelle Partei | Stimmen | ± (zur vorigen Wahl, bei der ersten zu 2025) | Sitze, alle Parteien in der Reihenfolge von `parteien.js`, eigene fett. Führt die Wahl direkt in die Opposition, gibt es den Bildschirm nicht und damit auch keinen Wahlabend.
- Schwierigkeitsanzeige (F06, freigegeben 2026-10-21): auf dem Startbildschirm unter jedem Parteinamen die Stufe aus `parteien.js` (Feld `schwierigkeit`, fest eingetragen). Stufen nach Siegquote im Balancing mit der besten Wahlkampf-Strategie je Partei (seit F08; vorher „immer Plakate“): leicht ab 30 %, mittel ab 10 %, schwer ab 1 %, sonst fast unmöglich (`config.schwierigkeit`). Parteien hinter der Brandmauer zusätzlich „keine Partei koaliert mit euch (Brandmauer)“. `npm run balancing` vergleicht eingetragene und gemessene Stufe, meldet Abweichungen auf der Konsole und im Bericht. Stand 2026-10-21 nach F08: CDU/CSU leicht, SPD mittel, Grüne und FDP schwer, alle anderen fast unmöglich.
- Umfrageverlauf (F09, freigegeben 2026-10-21): `src/ui/components/verlauf.js`, SVG-Linie der eigenen Partei in Parteifarbe, 5-%-Hürde rot gestrichelt, Wahlen als Punkte, `role="img"` mit `aria-label` (Start- und Endwert, Zahl der Wahlen). Im Wahlkampf, im Haushalt und auf dem Endbildschirm. Kein Zoom, keine Tooltips je Punkt (nur ein `title` an den Wahlpunkten).

## Systeme
Noch offen: Koalition, Kabinett, Haushalt, Bundesrat, Game Over. Werden abgefragt, wenn sie laut PLAN.md dran sind.
