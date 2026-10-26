# Paket Schnell: Vorschlag zur Freigabe

Stand 2026-10-26, Grundlage: Branch `claude/epochen-system` (Monatstakt, Spielstand-Version 28). Herkunft der Ideen: Abgleich mit
dem Änderungsprotokoll von kabinett-spiel.de/neu. Übernommen sind nur Ideen, keine Texte und keine Zahlen von dort.

Noch nichts davon ist gebaut. Alle Zahlen sind **Spielwerte** und gehen nach der Freigabe in `config.js`. Je Punkt steht eine
Empfehlung. Wo du entscheiden musst, steht **Frage**.

Reihenfolge der Umsetzung: einzeln, jeder Punkt mit Tests und Commit, Messung nur bei Punkten mit Spielwirkung.

| # | Punkt | Spielwirkung | Spielstand | Aufwand |
|---|---|---|---|---|
| S1 | „Vor dem nächsten Monat“: Liste offener Möglichkeiten | keine (Anzeige) | – | klein |
| S2 | Halbjahres- und Jahresbilanz | keine (Anzeige) | neues Feld | klein |
| S3 | Erfolgskarte bei großer Wirkung | keine (Anzeige) | neues Feld | klein |
| S4 | Karlsruhe mit Frist zur Neuregelung | ja | Feld am Verfahren | klein |
| S5 | Regierungsauftrag ausschlagen | ja (Entscheidung) | – | klein |
| S6 | Ereignisse im Wahlkampf | ja | neues Feld | mittel |
| S7 | Acht neue Ereignisse | ja | – | mittel (Texte) |
| S8 | Vorbilder im Ausland | keine (Anzeige) | – | mittel (Quellen) |
| S9 | Glossar | keine (Anzeige) | – | klein |
| S10 | Drei Spielstände | keine | Speicher | klein |
| S11 | Zahlen zählen hoch, leuchten grün/rot | keine (Anzeige) | – | klein |

---

## S1 „Vor dem nächsten Monat“
**Was der Spieler sieht:** Auf der Lage über dem Knopf „Nächster Monat“ steht die Karte „Vor dem nächsten Monat“. Sie hat höchstens 5 Zeilen, jede mit einem Knopf in den passenden Bereich, in dieser Reihenfolge:
1. Ultimatum eines Partners mit Restfrist → Parlament/Koalition.
2. Offene Weiche einer Epoche → Euer Land.
3. Vertragsvorhaben, die beim nächsten Haushalt fällig sind und noch nicht beschlossen → Reformen.
4. Landtagswahl im nächsten Monat → Lage-Karte Landtagswahlen.
5. Problem in „Krise“ ohne laufende Lösung oder laufenden Reformweg → Problem-Detail.
6. Freies Vorhaben in diesem Monat, wenn das Kapital für mindestens eine Lösung oder einen Weg reicht → Reformen.

Ohne Zeilen fehlt die Karte.

**Regel:** Reine Anzeige aus dem Spielstand, keine Sperre. „Nächster Monat“ bleibt immer klickbar.

**„Zur Entscheidung“:** Gesperrt ist im Spiel nur der Fall „offenes Ereignis“. Es steht schon oben auf der Lage. Neu: Auf allen anderen Bildschirmen zeigt die Kopfzeile ein Badge „⚠ Entscheidung offen“, das zur Lage springt.

**Dateien:** `src/engine/todo.js` (reine Funktion, testbar), `lage.js`, `shell.js`.

**Empfehlung:** so bauen.

## S2 Halbjahres- und Jahresbilanz
**Was der Spieler sieht:** Nach dem Haushalt im Dezember erscheint auf der Lage die Karte „Bilanz des Jahres <Jahr>“. In der ersten Wahlperiode der Partie kommt zusätzlich Ende Juni „Bilanz des Halbjahres“. Inhalt:
- Umfrage der eigenen Partei damals und jetzt.
- Die 3 größten Posten Rückenwind und die 3 größten Posten Gegenwind aus der Umfrage-Bilanz, zusammengefasst nach Ursache.
- Probleme, die eine Stufe auf- oder abgestiegen sind.
- Beschlossene und gescheiterte Vorhaben.

Die Karte bleibt, bis man sie mit „Gelesen“ schließt.

**Regel:** Keine neue Berechnung. Die Umfrage-Bilanz hält nur 8 Einträge (`config.umfrageBilanz.runden`), seit dem Monatstakt also 8 Monate. Deshalb zählt ein neues Feld die Posten seit der letzten Bilanz zusammen.

**Zahlen:** `config.bilanzkarte` { posten: 3, halbjahrMonat: 6, halbjahrNurErsteWahlperiode: true }.

**Spielstand:** Version 29: `bilanzkarte` { seit, posten: { ursache: wert }, offen }. Alte Stände starten leer.

**Frage:** Halbjahresbilanz nur in der ersten Wahlperiode (wie bei Kabinett) oder immer? **Empfehlung:** nur in der ersten, danach jährlich, sonst wird es Routine.

## S3 Erfolgskarte
**Was der Spieler sieht:** Ist eine Lösung oder ein Reformweg erfolgreich umgesetzt und hat sie Probleme um zusammen mindestens 10 Punkte gesenkt, erscheint auf der Lage die Karte „Erfolg: <Name>“. Sie zeigt:
- Problemverlauf als kleine Linie, ab dem Start des Vorhabens.
- Die Gruppen, deren Stimmung durch das Vorhaben gestiegen ist.
- Den Umfragegewinn für Ressort und Regierung (aus der Umfrage-Bilanz).

Höchstens 2 Karten gleichzeitig, die älteste fällt weg. Schließen mit „Gelesen“.

**Zahlen:** `config.erfolgskarte` { abSenkung: 10, max: 2 }.

**Spielstand:** Version 29 (zusammen mit S2): `erfolge` [{ id, art, runde }].

**Empfehlung:** so bauen. Schwelle 10, damit nicht jedes kleine Programm eine Karte bekommt.

## S4 Karlsruhe mit Frist
**Heute:** Ein gekipptes Steuergesetz wird sofort zurückgenommen, die Kanzlerpartei verliert 0,3.

**Neu:** Kippt das Gericht, entscheidet ein zweiter Zufallswurf über die Art des Urteils:
- **Nichtig** (50 %): wie heute, sofortige Rücknahme, −0,3.
- **Unvereinbar mit Frist** (50 %): Die Änderung gilt weiter, die Einnahmen fließen, Frist 12 Monate zur Neuregelung. Kanzlerpartei −0,1 beim Urteil.
  - Neuregelung: Nimmt ein Haushalt innerhalb der Frist mindestens die Hälfte der beanstandeten Stufen zurück (bzw. schaltet die Ausgestaltung ab), ist das Verfahren erledigt, ohne weiteren Verlust.
  - Verstreicht die Frist: Rücknahme wie bei „nichtig“ und −0,3.

**Anzeige:** Haushalt → Übersicht: anhängige Fristen mit Restmonaten und dem, was zurückzunehmen ist. Dazu eine Zeile in S1 („Frist aus Karlsruhe läuft in x Monaten ab“).

**Zahlen:** `config.verfassungsrisiko` + { fristAnteil: 0.5, fristMonate: 12, verlustFrist: 0.1, neuregelungMindestens: 0.5 }.

**Spielstand:** optionales Feld `frist` am Verfahren, keine neue Version.

**Messung:** Keine Simulationsstrategie nutzt riskante Steuern, Ergebnis daher voraussichtlich unverändert. Geprüft wird über Tests.

**Frage:** Auch für verfassungsrechtlich umstrittene Reformwege, oder nur für Steuern? **Empfehlung:** erst nur Steuern. Reformwege haben keine Stufen, die man „halb zurücknehmen“ kann.

## S5 Regierungsauftrag ausschlagen
**Was der Spieler sieht:** In der Regierungsbildung steht unter „Mögliche Mehrheiten“ ein Knopf „In die Opposition gehen“, mit Bestätigung.

**Regel:** Es regieren die anderen nach der bestehenden Regel aus Etappe 0b (`regierungDerAnderen`). Keine Umfragewirkung, kein Kapital.

**Frage:** Ab wann? Kabinett erlaubt es erst ab der zweiten Bundestagswahl. **Empfehlung:** ab der zweiten. Bei der ersten Wahl wäre es meist ein Fehlklick, und man verpasst den Kern des Spiels.

**Messung:** keine Strategie nutzt es, Simulation unverändert.

## S6 Ereignisse im Wahlkampf
**Widerspricht der SPEC** (Wahlkampf: „Nicht enthalten (bewusst): … Zufallsereignisse“). Deshalb nur mit deinem ausdrücklichen Ja.

**Regel:**
- In Woche 5 mit 30 % Chance ein Wahlkampf-Ereignis, höchstens eines je Wahlkampf, gezogen über den Seed.
- Es ersetzt die Aktion der Woche nicht. Es ist eine zusätzliche Entscheidung mit 2 Möglichkeiten und Folgen vor dem Klick, wie bei F14.
- Folgen nur auf Umfragepunkte (eigene Partei, Kanzlerpartei, Opposition als Ganzes), 0,2–0,8 Punkte.

**Vier Ereignisse** (eigene Texte, keine echten Personen, keine Ereignisse gegen einzelne reale Parteien):
1. **Hochwasser im Wahlkampf** (Bedingung: Klimafolgen ≥ 40): „Vor Ort helfen“ (eigene +0,4, eine Woche ohne Wirkung der nächsten Aktion) oder „Wahlkampf fortsetzen“ (eigene −0,3).
2. **Spendenvorwurf gegen eure Partei:** „Offenlegen“ (eigene −0,3) oder „Abstreiten“ (50 %: ±0, 50 %: −0,8).
3. **Schlechte Wirtschaftsdaten** (Bedingung: Wachstum < 0,5): trifft die Kanzlerpartei −0,4. Ist man selbst Kanzlerpartei: „Konjunkturprogramm ankündigen“ (−0,2, +5 Staatsverschuldung) oder „Zur Ruhe mahnen“ (−0,4).
4. **Fernsehdebatte kurzfristig angesetzt:** „Zusagen“ (Zufall −0,3 bis +0,7) oder „Absagen“ (−0,2).

**Zahlen:** `config.wahlkampfEreignisse` { woche: 5, chance: 0.3 }.

**Spielstand:** Version 29: `wahlkampfEreignis` (offen/erledigt).

**Messung:** Siegquoten je Wahlkampf-Strategie vorher/nachher. Abnahmegrenze: keine Partei verschiebt sich um mehr als 3 Punkte.

**Empfehlung:** bauen, aber erst nach S7. Wenn dir der Wahlkampf ohne Zufall wichtig ist: weglassen.

## S7 Acht neue Ereignisse
Gleiche Regeln wie F14: an ein Problem gebunden, kommen ab Problemwert 30, je Wahlperiode einmal, 2–3 Möglichkeiten, Folgen 0,05–0,3 Punkte und 2–8 Problempunkte. Damit 21 statt 13 Ereignisse.

| id | Titel | Problem | Bedingung | Möglichkeiten (Kurz) |
|---|---|---|---|---|
| oelpreis | Ölpreis springt nach Konflikt am Golf | energiepreise | Geopolitik ≥ 40 | Tankrabatt (Energie −6, Finanzen −0,2) / strategische Reserve freigeben (Energie −3) / abwarten (Energie +6, Kanzler −0,2) |
| gasspeicher | Gasspeicher vor dem Winter halb leer | energiepreise | – | teuer nachkaufen (Energie −4, Finanzen −0,15) / Sparappell (Energie +3) |
| gesetzblatt | Panne im Gesetzblatt: falsche Fassung verkündet | vertrauensverlust | mindestens ein beschlossener Reformweg | Korrektur sofort (Vertrauen −2, Kanzler −0,1) / kleinreden (Vertrauen +5) |
| solarnetz | Streit um Netzentgelte für Solarhaushalte | energiepreise | – | Entlastung Solarhaushalte (Klima −3, Energie +2) / gleiche Entgelte für alle (Energie −2, Umweltverbände unzufrieden: Klima +2) |
| pharma | Pharmakonzern legt Investition auf Eis | aerztemangel | – | Preisregeln lockern (Ärzte −4, Gesundheit −0,1) / hart bleiben (Rezession +3) |
| jugendprotest | Jugend demonstriert für mehr Klimaschutz | klimafolgen | Klimafolgen ≥ 45 | Gespräch und Zusagen (Polarisierung −4, Kanzler +0,1) / ignorieren (Polarisierung +5) |
| windpacht | Bauern streiten über Windrad-Pachten | landwirtschaftsproteste | – | Pachten teilen per Gesetz (Landwirtschaft −5) / den Ländern überlassen (Landwirtschaft +3) |
| lehrkraefte | Schulen melden tausende freie Lehrerstellen | bildungskrise | Bildungskrise ≥ 40 | Quereinstieg öffnen (Bildung −4, Kanzler −0,05) / Sofortprogramm (Bildung −6, Finanzen −0,2) |

Die Werte in Klammern sind Problempunkte bzw. Umfragepunkte für die Partei, die das Ministerium hält. Die genauen Texte schreibe ich bei der Umsetzung.

**Messung:** Strategie „immer die erste Möglichkeit“ wie bei F14. Abnahmegrenze: Siegquoten und Krisen am Ende verschieben sich um höchstens 3 Punkte bzw. 0,3 Krisen.

**Empfehlung:** so bauen. Die Ereignischance je Monat (8,5 %) bleibt, es gibt nur mehr Auswahl.

## S8 Vorbilder im Ausland
**Was der Spieler sieht:** An einem Reformweg oder einer Lösung eine Zeile „Vorbild: <Land> – <ein Satz>“.

**Regel:** Projektregel 2 gilt, reale Fakten nur mit geprüfter Quelle. Deshalb nur dort, wo ich ein Vorbild an einer Quelle belegen kann, mit Feld `vorbild` { land, text, quelle }. Ich rechne mit 8–12 Wegen, z. B. Generationenkapital/Schweden, Bürgerversicherung/Niederlande, Mietpreisregulierung/Wien.

**Kein Einfluss auf Zahlen:** Das Vorbild beweist nicht, dass der Spielwert stimmt. Das steht so in der Hilfe.

**Frage:** Lohnt der Aufwand (Quellenprüfung je Eintrag)? **Empfehlung:** ja, aber als letzter Punkt des Pakets.

## S9 Glossar
**Was der Spieler sieht:** In der Hilfe ein neuer Abschnitt „Begriffe A–Z“. Er enthält:
- Die 11 vorhandenen Erklärtexte aus `hinweise.js` (`erklaerungen`).
- Etwa 15 neue Begriffe, z. B. Zustimmungsgesetz, Einspruchsgesetz, Konstruktives Misstrauensvotum, Sainte-Laguë, Brandmauer, Ultimatum, Richtungsprofil, Krisenkette, Weiche, Merkmal, Zinsaufschlag, vorläufige Haushaltsführung, Kompromiss im Bundesrat.

Jeder Tooltip mit Erklärtext bekommt den Link „Im Glossar“.

**Regel:** Jeder Begriff erklärt, **wie es im Spiel ist**. Eine Zeile „In echt“ gibt es nur, wenn sie an einer Quelle geprüft ist (Projektregel 2). Sonst fehlt sie.

**Empfehlung:** erst ohne „In echt“ bauen. Die Zeilen kommen nach und nach mit Quelle dazu.

## S10 Drei Spielstände
**Was der Spieler sieht:** Der Startbildschirm zeigt 3 Plätze, je mit Partei, Stufe, Jahr und Phase oder „leer“. „Neues Spiel“ fragt nach dem Platz, ein belegter Platz wird erst nach Rückfrage überschrieben.

**Regel:** Schlüssel `desim-zustand-1..3` und `desim-protokoll-1..3`, dazu `desim-platz` für den zuletzt gespielten Platz. Der bisherige Spielstand wandert beim ersten Laden auf Platz 1. Geteilte Links fragen nach dem Platz.

**Zahlen:** `config.speicher` { plaetze: 3 }.

**Empfehlung:** so bauen.

## S11 Zahlen zählen hoch
**Was der Spieler sieht:** Nach einer Aktion zählen geänderte Werte vom alten zum neuen Wert hoch und leuchten kurz grün (besser für den Spieler) bzw. rot. Gilt in der Kopfzeile für Umfrage und Kapital und auf der Lage für die Kennzahlen.

**Regel:** 300 ms, abgeschaltet bei `prefers-reduced-motion` (wie die bestehenden Übergänge). Die Live-Region aus F04 sagt weiter nur den Endwert an. Die Animation verzögert keine Eingabe.

**Empfehlung:** so bauen.

---

## Bewusst nicht im Paket
- **Empfohlene Koalition:** gibt es schon („Mögliche Mehrheiten“, sortiert nach Chance, F02).
- **Gesetzentwurf als Grafik:** Die Wegevorschau zeigt Kosten und Wirkung schon. Eine Grafik wäre Politur, kein Gewinn.
- **Wochen-Challenge mit Bestenliste:** braucht einen Server. Kann als eigenes Paket mit „Seed der Woche“ ohne Bestenliste kommen.

## Freigabe
Antworte mit „alle nach Empfehlung“ oder je Punkt mit Ja/Nein/Änderung. Offene Fragen mit Empfehlung:
1. S2: Halbjahresbilanz nur in der ersten Wahlperiode → **ja**
2. S4: Frist nur für Steuern → **ja**
3. S5: Ausschlagen ab der zweiten Bundestagswahl → **ja**
4. S6: Ereignisse im Wahlkampf trotz SPEC-Auslassung → **ja, nach S7**
5. S8: Vorbilder mit Quellenprüfung → **ja, zuletzt**
