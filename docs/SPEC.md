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
- Nicht enthalten (bewusst): Budget, Themen, Zielgruppen, Regionen, Zufallsereignisse, abnehmender Ertrag, Gegner-KI, Regierungsbilanz.

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
- Nicht enthalten (bewusst): Inhalte/Koalitionsvertrag, Minderheitsregierung, Kanzler aus anderer Partei, 3. Wahlgang, Koalitionen der Gegner.

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

## System: Spielende (freigegeben 2026-10-21, M10)
- Dateien: `src/engine/haushalt.js` (`koalitionsbruch`, Sieg-Prüfung in `haushaltBeschliessen`), `src/engine/state.js` (`zurueckInDenWahlkampf`). Zahlen: `config.spielende`.
- Niederlage „Opposition“: nach einer Wahl oder nach Absagen ist keine Mehrheit für die Spielerpartei möglich (siehe Koalition).
- Koalitionsbruch: nach jedem beschlossenen Haushalt verlässt ein Partner die Koalition, wenn seine Umfrage um mehr als 1,5 Punkte (Balancing 2026-10-21, vorher 2,0) unter dem Wert bei Regierungsbildung (`koalition.startAnteile`) liegt (gerechnet in Tausendstel: −1,50 bleibt, −1,51 geht). Seine Ministerien und sein Anspruch gehen an die Spielerpartei. Behält die Rest-Koalition ≥ Mehrheit: weiterregieren. Sonst vorgezogene Neuwahl (Wahlkampf Woche 1, aktuelle Umfragen).
- Sieg: 12 Haushaltsjahre als Kanzler (`statistik.jahreKanzler`, über Wahlperioden hinweg). Phase `sieg`.
- Reihenfolge, wenn mehreres zugleich eintritt: Sieg vor Koalitionsbruch vor Ende der Wahlperiode.
- Statistik (`statistik`): Jahre als Kanzler, gebildete Regierungen, bestes eigenes Wahlergebnis; dazu neue Schulden seit Start.
- Endbildschirm (`src/ui/screens/ende.js`): Sieg oder Opposition, Statistik, letzter Bundestag, „Neues Spiel“.
- Balancing-Bericht: `npm run balancing` (`scripts/balancing.js`) schreibt `docs/BALANCING.md`. Werte werden nur nach Entscheidung des Nutzers geändert.

## Speichern und Laden (M11)
- Datei: `src/storage/speicher.js` (`spielSichern`, `spielLaden`, `spielLoeschen`), nutzt `speichern`/`laden` aus `src/engine/state.js`.
- Ein Spielstand im Browser (`localStorage`, Schlüssel `desim-zustand` und `desim-protokoll`).
- Automatisch gesichert nach dem Start und nach jeder Aktion. Kein Speichern-Knopf.
- Startbildschirm: „Weiterspielen“ mit Partei, Phase und Kanzlerjahren, wenn ein Stand da ist; ein neues Spiel überschreibt ihn.
- „Neues Spiel“ auf dem Endbildschirm löscht den Stand.
- Kaputte oder veraltete Spielstände (andere `version`) werden verworfen. Gesperrter Speicher (z. B. privates Fenster) bricht das Spiel nicht ab, es wird dann nur nicht gesichert.

## Oberfläche (M5)
- Startbildschirm: Partei wählen (`src/ui/screens/start.js`). Seed wird zufällig gezogen.
- Wahlkampf (`src/ui/screens/wahlkampf.js`): Woche, Umfragebalken mit 5-%-Linie und Hinweis „unter Hürde“, drei Aktionen, Protokoll.
- Regierungsbildung (`src/ui/screens/koalition.js`, ab M6): Sitze, Bundestag-Grafik mit „Mehrheit ab 316“, Partnerliste mit Chance bzw. Sperrgrund, laufende Summe, Knopf „Verhandeln“/„Allein regieren“.
- Regierungsbildung, Liste „Mögliche Mehrheiten“ (F02, freigegeben 2026-10-21): über den Checkboxen alle Partnerkombinationen mit Mehrheit aus den noch möglichen Partnern (ohne abgelehnte, ohne Brandmauer). Nur minimale: Fällt ein Partner weg, fehlt die Mehrheit. Bei eigener Mehrheit zuerst „Allein regieren“ (100 %), darunter je ein einzelner Partner. Gesamtchance = Produkt der Einzelchancen mit Größenfaktor (so würfelt `verhandeln()`). Sortiert nach Chance absteigend, bei Gleichstand nach Sitzen. „Auswählen“ setzt nur die Häkchen, verhandelt wird erst mit dem Knopf. Rechnung: `moeglicheKoalitionen()` in `src/engine/koalition.js`.
- Kabinett (`src/ui/screens/kabinett.js`, ab M7): Auswahlfeld je Ministerium, Stand „x von y“ je Partei, Fehlerliste, Knopf „Kabinett vereidigen“ nur bei gültiger Verteilung.
- Haushalt (`src/ui/screens/haushalt.js`, ab M8): Jahr, Bilanz mit Schuldenbremse (✓/✗), Vorschau der Umfragewirkung je Partei, Steuerzeile, je Ministerium Partei-Farbpunkt, Etat und −/+ Knöpfe; „Haushalt beschließen“ nur bei eingehaltener Schuldenbremse. Ab M9: bei Steueränderung Zeile „Bundesrat: x von 35 Stimmen“ (Knopf gesperrt ohne Mehrheit) und aufklappbare Länderliste mit Regierung, Stimmen und Haltung (statt eines eigenen Bildschirms, damit die Haushaltseingaben beim Nachsehen erhalten bleiben).
- Haushalt, Block „Koalition“ (F01, freigegeben 2026-10-21): über „Wirkung auf die Umfragen“, je Partner der Verlust seit Regierungsbildung jetzt und nach diesem Haushalt (feste Wirkung, ohne Schwankung) gegen die Bruchgrenze, auf Tausendstel genau. Grün, gelb ab `config.spielende.warnAnteil` (0,5) der Grenze, rot mit „würde die Koalition verlassen“, wenn der Beschluss ohne Schwankung den Bruch auslöst. Hinweis, dass die Schwankung ±0,3 das Ergebnis verändern kann. Bei Alleinregierung nicht angezeigt. Rechnung: `bruchAbstand()` in `src/engine/haushalt.js`, dieselbe Funktion wie beim tatsächlichen Bruch.
- Endbildschirm (`src/ui/screens/ende.js`, ab M10) für Sieg und Opposition; ersetzt den früheren Platzhalter.

## Systeme
Noch offen: Koalition, Kabinett, Haushalt, Bundesrat, Game Over. Werden abgefragt, wenn sie laut PLAN.md dran sind.
