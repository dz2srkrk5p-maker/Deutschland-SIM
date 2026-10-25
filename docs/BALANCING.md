# Balancing-Bericht

Erzeugt mit `npm run balancing` am 2026-10-25. 40 Partien je Partei und Strategie (Seeds 1–40).

## Strategien der Simulation
- Wahlkampf: jede Woche Plakate und Werbung (Hauptergebnisse); weitere Wahlkampf-Strategien siehe eigener Abschnitt.
- Koalition: Partner nach Zustimmungschance absteigend, bis die Mehrheit reicht; nach Absagen erneut.
- Kabinett: der vorausgefüllte Vorschlag.
- Haushalt: siehe Spalte „Strategie“. Keine Steueränderungen.
- Ereignisse (F14): immer die erste Möglichkeit.
- Gemessen über 20 Kalenderjahre; „Sieg“ = 12 Kanzlerjahre in diesem Zeitraum (die Partie selbst endet nicht). In der Opposition regieren die anderen weiter.
- Festgefahren (auch mit allen Kürzungen und Steuererhöhungen kein Haushalt innerhalb der Schuldenbremse): 23 Partien über alle Tabellen.

## Ergebnisse
| Strategie | Partei | Regierung gebildet | Koalitionsbruch | Sieg | Ø Jahre Kanzler |
|---|---|---|---|---|---|
| Haushalt unverändert | CDU/CSU | 100 % | 20 % | 98 % | 12.0 |
| Haushalt unverändert | AfD | 13 % | 70 % | 0 % | 0.3 |
| Haushalt unverändert | SPD | 100 % | 63 % | 38 % | 9.5 |
| Haushalt unverändert | Grüne | 90 % | 25 % | 3 % | 4.3 |
| Haushalt unverändert | Linke | 40 % | 45 % | 3 % | 1.6 |
| Haushalt unverändert | BSW | 63 % | 85 % | 0 % | 2.3 |
| Haushalt unverändert | FDP | 50 % | 78 % | 0 % | 2.0 |
| Partner kürzen | CDU/CSU | 100 % | 83 % | 100 % | 12.0 |
| Partner kürzen | AfD | 13 % | 70 % | 0 % | 0.3 |
| Partner kürzen | SPD | 100 % | 88 % | 18 % | 8.9 |
| Partner kürzen | Grüne | 90 % | 40 % | 0 % | 4.1 |
| Partner kürzen | Linke | 40 % | 53 % | 0 % | 1.4 |
| Partner kürzen | BSW | 63 % | 90 % | 0 % | 2.3 |
| Partner kürzen | FDP | 50 % | 83 % | 0 % | 2.0 |

## Wahlkampf-Strategien (F08)
Siege in Prozent, Haushalt unverändert. „klug“: jede Woche die Aktion mit dem höchsten erwarteten eigenen Gewinn nach abnehmendem Ertrag. Fett: beste Strategie je Partei. Maßstab (freigegeben): keine „immer …“-Strategie ist bei einer Partei die beste.

| Partei | immer Plakate | immer Kundgebung | immer Angriff (Stärkster) | abwechselnd | klug |
|---|---|---|---|---|---|
| CDU/CSU | 97.5 | **100.0** | **100.0** | **100.0** | **100.0** |
| AfD | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| SPD | 37.5 | 55.0 | 47.5 | **92.5** | 82.5 |
| Grüne | 2.5 | 2.5 | 2.5 | **55.0** | 22.5 |
| Linke | **2.5** | 0.0 | 0.0 | **2.5** | 0.0 |
| BSW | 0.0 | 0.0 | 0.0 | **10.0** | 7.5 |
| FDP | 0.0 | 0.0 | 0.0 | **15.0** | 12.5 |

## Minderheitsregierung (F11)
Wahlkampf abwechselnd, Haushalt unverändert. „Minderheit“: Anteil der Partien mit mindestens einer Minderheitsregierung. „Gescheitert“: Zahl der Partien, die durch gescheiterte Haushalte einer Minderheitsregierung enden.

| Partei | Regierungsbildung | Minderheit | Gescheitert | Sieg |
|---|---|---|---|---|
| CDU/CSU | Minderheit nur ohne Mehrheit | 55 % | 33 | 100 % |
| CDU/CSU | Minderheit wenn möglich | 100 % | 203 | 100 % |
| AfD | Minderheit nur ohne Mehrheit | 15 % | 0 | 0 % |
| AfD | Minderheit wenn möglich | 78 % | 0 | 0 % |
| SPD | Minderheit nur ohne Mehrheit | 50 % | 24 | 93 % |
| SPD | Minderheit wenn möglich | 80 % | 144 | 93 % |
| Grüne | Minderheit nur ohne Mehrheit | 35 % | 12 | 55 % |
| Grüne | Minderheit wenn möglich | 75 % | 110 | 55 % |
| Linke | Minderheit nur ohne Mehrheit | 75 % | 29 | 3 % |
| Linke | Minderheit wenn möglich | 78 % | 36 | 3 % |
| BSW | Minderheit nur ohne Mehrheit | 45 % | 6 | 10 % |
| BSW | Minderheit wenn möglich | 50 % | 21 | 8 % |
| FDP | Minderheit nur ohne Mehrheit | 45 % | 1 | 15 % |
| FDP | Minderheit wenn möglich | 63 % | 29 | 15 % |

## Probleme und Lösungen (System 3)
Wahlkampf abwechselnd, Minderheit nur ohne Mehrheit, Haushalt mit Kürzungen nur wenn nötig. Je Quartal bis zu 1 Lösungen nach Strategie (siehe Skript). Werte am Partieende: Problemwert im Mittel über alle Bereiche, Zahl der Krisen, Schuldenquote.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø erfolgreiche Lösungen | Ø Problemwert | Ø Krisen | Ø Schuldenquote |
|---|---|---|---|---|---|---|---|
| CDU/CSU | keine Lösungen | 100 % | 15 % | 0.0 | 58 | 4.0 | 81 % |
| CDU/CSU | größtes Problem zuerst | 100 % | 8 % | 30.4 | 35 | 0.1 | 73 % |
| CDU/CSU | billigste zuerst | 100 % | 3 % | 32.2 | 36 | 0.6 | 76 % |
| AfD | keine Lösungen | 0 % | 65 % | 0.0 | 72 | 12.2 | 94 % |
| AfD | größtes Problem zuerst | 0 % | 65 % | 9.2 | 69 | 11.1 | 93 % |
| AfD | billigste zuerst | 0 % | 65 % | 8.4 | 69 | 11.2 | 94 % |
| SPD | keine Lösungen | 93 % | 48 % | 0.0 | 67 | 8.7 | 91 % |
| SPD | größtes Problem zuerst | 100 % | 30 % | 33.0 | 41 | 1.6 | 77 % |
| SPD | billigste zuerst | 100 % | 28 % | 35.8 | 42 | 2.6 | 83 % |
| Grüne | keine Lösungen | 55 % | 40 % | 0.0 | 74 | 13.3 | 96 % |
| Grüne | größtes Problem zuerst | 83 % | 28 % | 32.5 | 50 | 3.8 | 83 % |
| Grüne | billigste zuerst | 65 % | 33 % | 35.1 | 52 | 6.6 | 91 % |
| Linke | keine Lösungen | 3 % | 80 % | 0.0 | 74 | 13.2 | 97 % |
| Linke | größtes Problem zuerst | 5 % | 75 % | 18.6 | 65 | 9.0 | 92 % |
| Linke | billigste zuerst | 3 % | 73 % | 19.2 | 65 | 10.5 | 95 % |
| BSW | keine Lösungen | 10 % | 73 % | 0.0 | 73 | 12.0 | 95 % |
| BSW | größtes Problem zuerst | 25 % | 55 % | 27.3 | 58 | 5.8 | 87 % |
| BSW | billigste zuerst | 15 % | 65 % | 28.1 | 58 | 8.1 | 94 % |
| FDP | keine Lösungen | 15 % | 88 % | 0.0 | 75 | 13.4 | 97 % |
| FDP | größtes Problem zuerst | 33 % | 68 % | 29.0 | 59 | 6.3 | 89 % |
| FDP | billigste zuerst | 28 % | 75 % | 30.5 | 59 | 8.9 | 95 % |

## Reformwege nach Ausrichtung (System 1)
Wie bei den Lösungen; je Quartal zuerst ein Reformweg der Ausrichtung, der laut Vorschau eine Mehrheit hat, sonst eine Lösung für das größte Problem. „passend“: Wege mit Abstand bis 1 zur eigenen Parteiposition. Maßstab: keine Ausrichtung dominiert klar, „passend“ liegt 3–8 Punkte über „keine Reformwege“, die Schuldenquote läuft nicht davon.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø beschlossene Wege | Ø gescheitert | Ø Krisen | Ø Schuldenquote |
|---|---|---|---|---|---|---|---|
| CDU/CSU | keine Reformwege | 100 % | 8 % | 0.0 | 0.0 | 0.1 | 73 % |
| CDU/CSU | marktliberal | 100 % | 15 % | 6.7 | 1.5 | 0.3 | 74 % |
| CDU/CSU | konservativ | 100 % | 5 % | 4.9 | 1.3 | 0.1 | 74 % |
| CDU/CSU | sozialdemokratisch | 100 % | 0 % | 4.1 | 0.8 | 0.1 | 75 % |
| CDU/CSU | gruen | 100 % | 5 % | 3.0 | 0.8 | 0.1 | 75 % |
| CDU/CSU | links | 100 % | 5 % | 2.2 | 1.2 | 0.2 | 76 % |
| CDU/CSU | national | 100 % | 5 % | 2.0 | 1.1 | 0.1 | 74 % |
| CDU/CSU | pragmatisch | 100 % | 3 % | 4.4 | 1.3 | 0.1 | 74 % |
| CDU/CSU | passend | 100 % | 10 % | 7.3 | 1.9 | 0.3 | 74 % |
| CDU/CSU | beliebig | 100 % | 8 % | 8.5 | 1.9 | 0.2 | 74 % |
| SPD | keine Reformwege | 100 % | 30 % | 2.8 | 0.2 | 1.6 | 77 % |
| SPD | marktliberal | 100 % | 45 % | 8.0 | 1.3 | 1.5 | 78 % |
| SPD | konservativ | 100 % | 57 % | 7.5 | 1.3 | 1.4 | 78 % |
| SPD | sozialdemokratisch | 100 % | 28 % | 7.1 | 1.5 | 1.4 | 79 % |
| SPD | gruen | 98 % | 28 % | 7.4 | 1.0 | 1.6 | 78 % |
| SPD | links | 100 % | 30 % | 6.4 | 1.3 | 1.5 | 78 % |
| SPD | national | 100 % | 45 % | 6.8 | 1.2 | 1.6 | 78 % |
| SPD | pragmatisch | 100 % | 33 % | 8.0 | 1.5 | 1.6 | 78 % |
| SPD | passend | 98 % | 30 % | 9.4 | 2.0 | 1.4 | 79 % |
| SPD | beliebig | 100 % | 50 % | 9.5 | 1.8 | 1.9 | 79 % |
| Grüne | keine Reformwege | 83 % | 28 % | 5.9 | 0.3 | 3.8 | 83 % |
| Grüne | marktliberal | 80 % | 68 % | 9.1 | 1.1 | 4.2 | 84 % |
| Grüne | konservativ | 83 % | 57 % | 8.2 | 1.1 | 4.2 | 84 % |
| Grüne | sozialdemokratisch | 83 % | 33 % | 9.1 | 1.2 | 4.9 | 86 % |
| Grüne | gruen | 85 % | 35 % | 8.3 | 1.0 | 4.2 | 85 % |
| Grüne | links | 85 % | 25 % | 7.7 | 1.4 | 4.8 | 86 % |
| Grüne | national | 85 % | 38 % | 8.0 | 1.0 | 4.2 | 84 % |
| Grüne | pragmatisch | 85 % | 38 % | 8.4 | 1.1 | 4.8 | 85 % |
| Grüne | passend | 88 % | 43 % | 8.9 | 1.5 | 4.0 | 85 % |
| Grüne | beliebig | 80 % | 75 % | 9.9 | 1.1 | 4.4 | 86 % |

## Koalitionsbruch mit Gegenmaßnahme (Block 2)
Wie der Abschnitt davor, aber der Spieler reagiert auf jedes Ultimatum mit einem Zugeständnis, sobald es geht (fehlt nur Kapital, wird gespart). Ziele (vor der Änderung festgelegt): klar koalitionsfeindlicher Kurs (SPD marktliberal, konservativ, beliebig) bleibt bei mindestens 25 % Bruch; moderater Kurs (SPD passend, grün, pragmatisch; CDU/CSU marktliberal, konservativ, passend) mindestens halbiert gegenüber dem Abschnitt davor.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø beschlossene Wege | Ø gescheitert | Ø Krisen | Ø Schuldenquote |
|---|---|---|---|---|---|---|---|
| CDU/CSU | keine Reformwege | 100 % | 8 % | 0.0 | 0.0 | 0.1 | 73 % |
| CDU/CSU | marktliberal | 100 % | 3 % | 6.8 | 1.4 | 0.3 | 74 % |
| CDU/CSU | konservativ | 100 % | 3 % | 4.9 | 1.3 | 0.1 | 74 % |
| CDU/CSU | sozialdemokratisch | 100 % | 0 % | 4.2 | 0.8 | 0.1 | 75 % |
| CDU/CSU | gruen | 100 % | 0 % | 2.9 | 0.8 | 0.1 | 75 % |
| CDU/CSU | links | 100 % | 3 % | 2.2 | 1.2 | 0.2 | 76 % |
| CDU/CSU | national | 100 % | 0 % | 2.0 | 1.1 | 0.1 | 74 % |
| CDU/CSU | pragmatisch | 100 % | 0 % | 4.4 | 1.3 | 0.1 | 74 % |
| CDU/CSU | passend | 100 % | 5 % | 7.3 | 1.9 | 0.3 | 74 % |
| CDU/CSU | beliebig | 100 % | 5 % | 8.4 | 1.9 | 0.3 | 75 % |
| SPD | keine Reformwege | 98 % | 20 % | 2.9 | 0.2 | 1.9 | 78 % |
| SPD | marktliberal | 100 % | 30 % | 8.0 | 1.3 | 1.4 | 78 % |
| SPD | konservativ | 100 % | 43 % | 7.7 | 1.2 | 1.8 | 79 % |
| SPD | sozialdemokratisch | 100 % | 25 % | 7.2 | 1.5 | 1.6 | 79 % |
| SPD | gruen | 100 % | 28 % | 7.3 | 1.0 | 1.7 | 79 % |
| SPD | links | 100 % | 25 % | 6.5 | 1.3 | 1.5 | 79 % |
| SPD | national | 100 % | 28 % | 6.9 | 1.2 | 1.7 | 78 % |
| SPD | pragmatisch | 100 % | 20 % | 8.0 | 1.6 | 1.8 | 78 % |
| SPD | passend | 98 % | 23 % | 9.3 | 2.1 | 1.4 | 79 % |
| SPD | beliebig | 100 % | 38 % | 9.3 | 1.9 | 1.9 | 79 % |
| Grüne | keine Reformwege | 80 % | 28 % | 5.9 | 0.3 | 3.8 | 84 % |
| Grüne | marktliberal | 73 % | 40 % | 9.4 | 0.9 | 5.2 | 86 % |
| Grüne | konservativ | 80 % | 43 % | 8.7 | 1.0 | 4.7 | 86 % |
| Grüne | sozialdemokratisch | 85 % | 25 % | 9.2 | 1.2 | 5.2 | 86 % |
| Grüne | gruen | 85 % | 28 % | 8.3 | 1.0 | 4.1 | 85 % |
| Grüne | links | 85 % | 25 % | 7.7 | 1.4 | 4.8 | 86 % |
| Grüne | national | 85 % | 33 % | 8.0 | 1.0 | 4.5 | 84 % |
| Grüne | pragmatisch | 85 % | 28 % | 8.4 | 1.1 | 4.8 | 85 % |
| Grüne | passend | 88 % | 23 % | 9.1 | 1.5 | 4.6 | 86 % |
| Grüne | beliebig | 73 % | 45 % | 9.9 | 1.3 | 5.7 | 86 % |

## Schwierigkeitsanzeige (F06)
Gemessen an der besten Wahlkampf-Strategie je Partei (Haushalt unverändert), Grenzen aus `config.schwierigkeit`, eingetragen in `src/data/parteien.js`.

| Partei | Siege | gemessen | eingetragen | Abgleich |
|---|---|---|---|---|
| CDU/CSU | 100.0 % | leicht | leicht | passt |
| AfD | 0.0 % | fast unmöglich | fast unmöglich | passt |
| SPD | 92.5 % | leicht | mittel | **anpassen** |
| Grüne | 55.0 % | leicht | schwer | **anpassen** |
| Linke | 2.5 % | schwer | fast unmöglich | **anpassen** |
| BSW | 10.0 % | mittel | fast unmöglich | **anpassen** |
| FDP | 15.0 % | mittel | fast unmöglich | **anpassen** |

## Alle Konstanten (`src/data/config.js`)
| Name | Wert | Freigegeben in |
|---|---|---|
| `sitzeBundestag` | 630 | M1/M3 (Quelle in config.js) |
| `sperrklauselProzent` | 5 | M1/M3 (Quelle in config.js) |
| `legislaturJahre` | 4 | M1/M3 (Quelle in config.js) |
| `regierung.monateJeJahr` | 12 | F12 |
| `kalender.startJahr` | 2026 | Etappe 0b |
| `ki.reformChanceJeMonat` | 0.1 | Etappe 0b (TODO-BALANCE) |
| `zeit.anteilJeMonat` | 0.25 | Etappe 0a |
| `kapital.start` | 50 | Erweiterung |
| `kapital.max` | 100 | Erweiterung |
| `kapital.jeMonat` | 2 | Erweiterung |
| `reformwege.jaAbstand` | 0.9 | System 1 |
| `reformwege.enthaltungAbstand` | 1.5 | System 1 |
| `reformwege.vetoAbstand` | 1.7 | System 1 |
| `reformwege.partnerUnmutJePunkt` | 0.3 | System 1 |
| `reformwege.akteurGruppenJeHaltung` | 1.5 | System 1 |
| `reformwege.beschlussBonus` | 1 | System 1 |
| `reformwege.revisionKapital` | 25 | System 1 |
| `reformwege.revisionUmfrage` | 0.5 | System 1 |
| `reformwege.verfassungsRisiko` | 0.2 | System 1 |
| `reformwege.fehlschlagUmfrage` | 0.3 | System 1 |
| `reformwege.abgelehntKapitalAnteil` | 0.5 | System 1 |
| `reformwege.profil.wachstumJePunkt` | 0.08 | System 1 |
| `reformwege.profil.giniJePunkt` | 0.15 | System 1 |
| `reformwege.profil.euKritisch` | -1 | System 1 |
| `reformwege.profil.euWachstum` | 0.15 | System 1 |
| `reformwege.profil.partnerJePunkt` | 0.15 | System 1 |
| `reformwege.profil.kanzlerJePunkt` | 0.1 | System 1 |
| `wirtschaft.potenzialWachstum` | 0.8 | System 2 |
| `wirtschaft.zielInflation` | 2 | System 2 |
| `wirtschaft.natArbeitslosigkeit` | 5.5 | System 2 |
| `wirtschaft.giniBasis` | 30 | System 2 |
| `wirtschaft.traegheit` | 0.5 | System 2 |
| `wirtschaft.rueckkehr` | 0.2 | System 2 |
| `wirtschaft.okun` | 0.4 | System 2 |
| `wirtschaft.schwankungWachstum` | 0.5 | System 2 |
| `wirtschaft.schwankungInflation` | 0.3 | System 2 |
| `wirtschaft.uebrigesDefizitBip` | 0.6 | System 2 |
| `wirtschaft.gruppenRueckkehr` | 0.15 | System 2 |
| `wirtschaft.umfrage.wachstum` | 0.15 | System 2 |
| `wirtschaft.umfrage.arbeitslosigkeit` | 0.3 | System 2 |
| `wirtschaft.umfrage.inflationUeber` | 3 | System 2 |
| `wirtschaft.umfrage.inflation` | 0.15 | System 2 |
| `wirtschaft.umfrage.gruppen` | 0.06 | System 2 |
| `wirtschaft.anzeigeGrenzen.inflation` | 3 | System 2 |
| `wirtschaft.anzeigeGrenzen.arbeitslosigkeit` | 6 | System 2 |
| `wirtschaft.anzeigeGrenzen.schuldenquote` | 65 | System 2 |
| `probleme.stufen` | [{"id":"ruhig","name":"ruhig","ab":0,"folgen":0},{"id":"angespannt","name":"angespannt","ab":40,"folgen":0.25},{"id":"ernst","name":"ernst","ab":60,"folgen":0.6},{"id":"krise","name":"Krise","ab":80,"folgen":1}] | System 3 |
| `probleme.maxAktiv` | 6 | System 3 |
| `probleme.fruehwarnungAb` | 32 | System 3 |
| `probleme.umfrageJeMonat.ernst` | 0.005 | System 3 |
| `probleme.umfrageJeMonat.krise` | 0.0125 | System 3 |
| `probleme.schwankung` | 0.5 | System 3 |
| `probleme.aktionenJeMonat` | 1 | System 3 |
| `probleme.fehlschlagWirkung` | 0.3 | System 3 |
| `probleme.fehlschlagUmfrage` | 0.2 | System 3 |
| `probleme.gewinnJeWertpunkt` | 0.01 | System 3 |
| `probleme.gewinnRegierungJeWertpunkt` | 0.015 | System 3 |
| `probleme.passungBonus` | 0.15 | System 3 |
| `probleme.verlaufLaenge` | 48 | System 3 |
| `ereignisse.chanceJeMonat` | 0.085 | F14 |
| `krisenketten.faktor` | 40 | Paket Groß |
| `krisenketten.verzoegerung` | 6 | Paket Groß |
| `krisenketten.daempfung` | 0.5 | Paket Groß |
| `krisenketten.maxTiefe` | 2 | Paket Groß |
| `krisenketten.maxAktiv` | 3 | Paket Groß |
| `krisenketten.abklingMonate` | 24 | Paket Groß |
| `krisenketten.verlaufLaenge` | 6 | Paket Groß |
| `koalitionsvertrag.vorschlaegeJePartner` | 2 | Paket Groß |
| `koalitionsvertrag.maxJePartner` | 2 | Paket Groß |
| `koalitionsvertrag.bonusUmsetzung` | 0.3 | Paket Groß |
| `koalitionsvertrag.strafeBruch` | 0.5 | Paket Groß |
| `koalitionsvertrag.kuerzungAbProzent` | 10 | Paket Groß |
| `koalitionsvertrag.strafeKuerzung` | 0.2 | Paket Groß |
| `koalitionsvertrag.strafeRueckstand` | 0.15 | Paket Groß |
| `verbaendeSteuern.quellen.gewerkschaften.gruppe` | "arbeitnehmer" | UI2 (2026-10-25) |
| `verbaendeSteuern.quellen.gewerkschaften.teiler` | 3 | UI2 (2026-10-25) |
| `verbaendeSteuern.quellen.wirtschaftsverbaende.gruppe` | "unternehmen" | UI2 (2026-10-25) |
| `verbaendeSteuern.quellen.wirtschaftsverbaende.teiler` | 3 | UI2 (2026-10-25) |
| `verbaendeSteuern.quellen.sozialverbaende.gruppe` | "geringverdiener" | UI2 (2026-10-25) |
| `verbaendeSteuern.quellen.sozialverbaende.teiler` | 3 | UI2 (2026-10-25) |
| `verbaendeSteuern.quellen.bauernverband.gruppe` | "landwirtschaft" | UI2 (2026-10-25) |
| `verbaendeSteuern.quellen.bauernverband.teiler` | 3 | UI2 (2026-10-25) |
| `verbaendeSteuern.quellen.umweltverbaende.problem` | "klimafolgen" | UI2 (2026-10-25) |
| `verbaendeSteuern.quellen.umweltverbaende.teiler` | -2 | UI2 (2026-10-25) |
| `verbaendeSteuern.dagegenAb` | -1 | UI2 (2026-10-25) |
| `verbaendeSteuern.dafuerAb` | 1 | UI2 (2026-10-25) |
| `verbaendeSteuern.kapitalDagegen` | 3 | UI2 (2026-10-25) |
| `verbaendeSteuern.kapitalDafuer` | 1 | UI2 (2026-10-25) |
| `kompromiss.maxFehlend` | 15 | Paket Mittel |
| `kompromiss.wirkungFaktor` | 0.6 | Paket Mittel |
| `kompromiss.kapital` | 10 | Paket Mittel |
| `kompromiss.laenderAusgleich` | 2000000 | Paket Mittel |
| `landtagswahlen.basis` | 0.35 | Paket Mittel |
| `landtagswahlen.jePunkt` | 0.08 | Paket Mittel |
| `landtagswahlen.min` | 0.1 | Paket Mittel |
| `landtagswahlen.max` | 0.85 | Paket Mittel |
| `landtagswahlen.verlustUmfrage` | 0.15 | Paket Mittel |
| `landtagswahlen.gewinnUmfrage` | 0.1 | Paket Mittel |
| `verfassungsrisiko.dauerMonate` | 12 | Paket Klein |
| `verfassungsrisiko.verlustUmfrage` | 0.3 | Paket Klein |
| `umfrageBilanz.runden` | 12 | Paket Klein |
| `ticker.anzahl` | 3 | F15 |
| `ticker.trendSchritte` | 3 | F15 |
| `ticker.trendPunkte` | 0.5 | F15 |
| `ticker.huerdeAbstand` | 0.5 | F15 |
| `wahlkampf.wochen` | 8 | M5 |
| `wahlkampf.plakateGewinn` | 0.4 | M5 |
| `wahlkampf.kundgebungMin` | -0.5 | M5 |
| `wahlkampf.kundgebungMax` | 1.5 | M5 |
| `wahlkampf.angriffZielVerlust` | 0.8 | M5 |
| `wahlkampf.angriffEigenGewinn` | 0.3 | M5 |
| `wahlkampf.schwankungMax` | 0.3 | M5 |
| `wahlkampf.abnahmeJeWiederholung` | 0.25 | M5 |
| `wahlkampf.mindestFaktor` | 0.25 | M5 |
| `koalition.chanceNachAbstand.1` | 0.9 | M6 |
| `koalition.chanceNachAbstand.2` | 0.7 | M6 |
| `koalition.chanceNachAbstand.3` | 0.4 | M6 |
| `koalition.chanceWeit` | 0.15 | M6 |
| `koalition.brandmauer` | ["afd"] | M6 |
| `koalition.abweichlerWahrscheinlichkeit` | 0.02 | M6 |
| `koalition.kanzlerWahlgaenge` | 2 | M6 |
| `haushalt.ministerSchrittProzent` | 1 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.ministerMaxProzent` | 25 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.schuldenbremseGrenze` | 40390000 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.verteidigungsFreigrenze` | 25107174 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.konjunkturJePunkt` | 4000000 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.zinsaufschlag.quoteAb` | 70 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.zinsaufschlag.jePunktQuote` | 0.01 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.zinsaufschlag.defizitAb` | 1.5 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.zinsaufschlag.jePunktDefizit` | 0.04 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.zinsaufschlag.max` | 0.3 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.zinsaufschlag.anpassung` | 0.3 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.wirkungMehrausgabeProMrd` | 0.02 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.wirkungKuerzungProMrd` | 0.05 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.wirkungSteuerErhoehungProMrd` | 0.03 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.wirkungSteuerSenkungProMrd` | 0.02 | M8 (Zahlen 2026: Quelle in config.js) |
| `bundestag.stimmeNachAbstand.1` | "ja" | F10 (Art. 42 GG) |
| `bundestag.stimmeNachAbstand.2` | "enthaltung" | F10 (Art. 42 GG) |
| `bundestag.stimmeWeit` | "nein" | F10 (Art. 42 GG) |
| `bundestag.brandmauerAbweichler` | 0.001 | F10 (Art. 42 GG) |
| `bundestag.stimmeNachAbstandMinderheit.1` | "enthaltung" | F10 (Art. 42 GG) |
| `minderheit.umfrageVerlustHaushaltGescheitert` | 0.5 | F11 |
| `minderheit.fehlschlaegeBisNeuwahl` | 2 | F11 |
| `schwierigkeit.leicht` | 0.3 | F06 |
| `schwierigkeit.mittel` | 0.1 | F06 |
| `schwierigkeit.schwer` | 0.01 | F06 |
| `spielende.koalitionsbruchPunkte` | 1.5 | M10 |
| `spielende.warnAnteil` | 0.5 | M10 |
| `koalitionsbruch.ultimatumAnteil` | 0.8 | Block 2 |
| `koalitionsbruch.fristMonate` | 6 | Block 2 |
| `koalitionsbruch.zugestaendnisKapital` | 15 | Block 2 |
| `koalitionsbruch.zugestaendnisPunkte` | 0.4 | Block 2 |
| `koalitionsbruch.zugestaendnisKanzler` | 0.2 | Block 2 |

Änderungen an diesen Werten nur nach Entscheidung des Nutzers.
