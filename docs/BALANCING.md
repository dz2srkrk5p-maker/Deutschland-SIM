# Balancing-Bericht

Erzeugt mit `npm run balancing` am 2026-10-24. 200 Partien je Partei und Strategie (Seeds 1–200).

## Strategien der Simulation
- Wahlkampf: jede Woche Plakate und Werbung (Hauptergebnisse); weitere Wahlkampf-Strategien siehe eigener Abschnitt.
- Koalition: Partner nach Zustimmungschance absteigend, bis die Mehrheit reicht; nach Absagen erneut.
- Kabinett: der vorausgefüllte Vorschlag.
- Haushalt: siehe Spalte „Strategie“. Keine Steueränderungen.
- Ereignisse (F14): immer die erste Möglichkeit.
- Spiel endet bei Sieg, Opposition oder nach 8000 Zügen.

## Ergebnisse
| Strategie | Partei | Regierung gebildet | Koalitionsbruch | Sieg | Ø Jahre Kanzler |
|---|---|---|---|---|---|
| Haushalt unverändert | CDU/CSU | 100 % | 2 % | 24 % | 6.4 |
| Haushalt unverändert | AfD | 0 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | SPD | 36 % | 0 % | 2 % | 2.0 |
| Haushalt unverändert | Grüne | 9 % | 0 % | 0 % | 0.4 |
| Haushalt unverändert | Linke | 1 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | BSW | 0 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | FDP | 2 % | 0 % | 0 % | 0.1 |
| Partner kürzen | CDU/CSU | 100 % | 32 % | 15 % | 6.1 |
| Partner kürzen | AfD | 0 % | 0 % | 0 % | 0.0 |
| Partner kürzen | SPD | 36 % | 34 % | 3 % | 2.1 |
| Partner kürzen | Grüne | 9 % | 6 % | 0 % | 0.3 |
| Partner kürzen | Linke | 1 % | 1 % | 0 % | 0.0 |
| Partner kürzen | BSW | 0 % | 0 % | 0 % | 0.0 |
| Partner kürzen | FDP | 2 % | 2 % | 0 % | 0.0 |

## Wahlkampf-Strategien (F08)
Siege in Prozent, Haushalt unverändert. „klug“: jede Woche die Aktion mit dem höchsten erwarteten eigenen Gewinn nach abnehmendem Ertrag. Fett: beste Strategie je Partei. Maßstab (freigegeben): keine „immer …“-Strategie ist bei einer Partei die beste.

| Partei | immer Plakate | immer Kundgebung | immer Angriff (Stärkster) | abwechselnd | klug |
|---|---|---|---|---|---|
| CDU/CSU | 23.5 | 28.0 | 21.0 | 49.5 | **54.0** |
| AfD | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| SPD | 2.0 | 5.5 | 6.0 | **19.0** | 12.5 |
| Grüne | 0.0 | 0.0 | 0.0 | **3.5** | 1.0 |
| Linke | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| BSW | 0.0 | 0.0 | 0.0 | 0.0 | **0.5** |
| FDP | 0.0 | 0.0 | 0.0 | 0.0 | **1.0** |

## Minderheitsregierung (F11)
Wahlkampf abwechselnd, Haushalt unverändert. „Minderheit“: Anteil der Partien mit mindestens einer Minderheitsregierung. „Gescheitert“: Zahl der Partien, die durch gescheiterte Haushalte einer Minderheitsregierung enden.

| Partei | Regierungsbildung | Minderheit | Gescheitert | Sieg |
|---|---|---|---|---|
| CDU/CSU | Minderheit nur ohne Mehrheit | 56 % | 101 | 50 % |
| CDU/CSU | Minderheit wenn möglich | 100 % | 200 | 0 % |
| AfD | Minderheit nur ohne Mehrheit | 0 % | 0 | 0 % |
| AfD | Minderheit wenn möglich | 0 % | 0 | 0 % |
| SPD | Minderheit nur ohne Mehrheit | 9 % | 17 | 19 % |
| SPD | Minderheit wenn möglich | 21 % | 41 | 7 % |
| Grüne | Minderheit nur ohne Mehrheit | 1 % | 1 | 4 % |
| Grüne | Minderheit wenn möglich | 2 % | 4 | 2 % |
| Linke | Minderheit nur ohne Mehrheit | 0 % | 0 | 0 % |
| Linke | Minderheit wenn möglich | 0 % | 0 | 0 % |
| BSW | Minderheit nur ohne Mehrheit | 0 % | 0 | 0 % |
| BSW | Minderheit wenn möglich | 0 % | 0 | 0 % |
| FDP | Minderheit nur ohne Mehrheit | 0 % | 0 | 0 % |
| FDP | Minderheit wenn möglich | 0 % | 0 | 0 % |

## Probleme und Lösungen (System 3)
Wahlkampf abwechselnd, Minderheit nur ohne Mehrheit, Haushalt mit Kürzungen nur wenn nötig. Je Quartal bis zu 2 Lösungen nach Strategie (siehe Skript). Werte am Partieende: Problemwert im Mittel über alle Bereiche, Zahl der Krisen, Schuldenquote.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø erfolgreiche Lösungen | Ø Problemwert | Ø Krisen | Ø Schuldenquote |
|---|---|---|---|---|---|---|---|
| CDU/CSU | keine Lösungen | 50 % | 4 % | 0.0 | 51 | 1.6 | 75 % |
| CDU/CSU | größtes Problem zuerst | 65 % | 0 % | 21.3 | 36 | 0.1 | 70 % |
| CDU/CSU | billigste zuerst | 62 % | 0 % | 19.6 | 38 | 0.5 | 74 % |
| AfD | keine Lösungen | 0 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| AfD | größtes Problem zuerst | 0 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| AfD | billigste zuerst | 0 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| SPD | keine Lösungen | 19 % | 1 % | 0.0 | 46 | 0.6 | 69 % |
| SPD | größtes Problem zuerst | 24 % | 1 % | 10.3 | 38 | 0.0 | 67 % |
| SPD | billigste zuerst | 20 % | 1 % | 8.7 | 40 | 0.1 | 68 % |
| Grüne | keine Lösungen | 4 % | 1 % | 0.0 | 44 | 0.2 | 65 % |
| Grüne | größtes Problem zuerst | 8 % | 2 % | 3.2 | 42 | 0.0 | 65 % |
| Grüne | billigste zuerst | 7 % | 0 % | 2.7 | 42 | 0.0 | 65 % |
| Linke | keine Lösungen | 0 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| Linke | größtes Problem zuerst | 0 % | 1 % | 0.3 | 43 | 0.0 | 64 % |
| Linke | billigste zuerst | 0 % | 0 % | 0.3 | 43 | 0.0 | 64 % |
| BSW | keine Lösungen | 0 % | 1 % | 0.0 | 43 | 0.0 | 64 % |
| BSW | größtes Problem zuerst | 1 % | 1 % | 0.5 | 43 | 0.0 | 64 % |
| BSW | billigste zuerst | 1 % | 0 % | 0.4 | 43 | 0.0 | 64 % |
| FDP | keine Lösungen | 0 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| FDP | größtes Problem zuerst | 1 % | 1 % | 0.4 | 42 | 0.0 | 64 % |
| FDP | billigste zuerst | 1 % | 0 % | 0.4 | 43 | 0.0 | 64 % |

## Reformwege nach Ausrichtung (System 1)
Wie bei den Lösungen; je Quartal zuerst ein Reformweg der Ausrichtung, der laut Vorschau eine Mehrheit hat, sonst eine Lösung für das größte Problem. „passend“: Wege mit Abstand bis 1 zur eigenen Parteiposition. Maßstab: keine Ausrichtung dominiert klar, „passend“ liegt 3–8 Punkte über „keine Reformwege“, die Schuldenquote läuft nicht davon.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø beschlossene Wege | Ø gescheitert | Ø Krisen | Ø Schuldenquote |
|---|---|---|---|---|---|---|---|
| CDU/CSU | keine Reformwege | 65 % | 0 % | 0.0 | 0.0 | 0.1 | 70 % |
| CDU/CSU | marktliberal | 62 % | 8 % | 5.1 | 1.0 | 0.1 | 70 % |
| CDU/CSU | konservativ | 68 % | 7 % | 4.1 | 0.9 | 0.1 | 70 % |
| CDU/CSU | sozialdemokratisch | 63 % | 1 % | 2.6 | 0.5 | 0.1 | 71 % |
| CDU/CSU | gruen | 59 % | 0 % | 2.3 | 0.5 | 0.1 | 71 % |
| CDU/CSU | links | 57 % | 0 % | 1.5 | 0.8 | 0.1 | 71 % |
| CDU/CSU | national | 57 % | 14 % | 1.0 | 0.7 | 0.1 | 70 % |
| CDU/CSU | pragmatisch | 68 % | 1 % | 3.5 | 0.8 | 0.0 | 70 % |
| CDU/CSU | passend | 69 % | 8 % | 7.0 | 1.4 | 0.0 | 70 % |
| CDU/CSU | beliebig | 67 % | 5 % | 7.9 | 1.5 | 0.1 | 71 % |
| SPD | keine Reformwege | 24 % | 1 % | 0.0 | 0.0 | 0.0 | 67 % |
| SPD | marktliberal | 22 % | 43 % | 3.2 | 0.7 | 0.0 | 67 % |
| SPD | konservativ | 21 % | 45 % | 2.7 | 0.5 | 0.0 | 67 % |
| SPD | sozialdemokratisch | 27 % | 6 % | 2.0 | 0.5 | 0.0 | 69 % |
| SPD | gruen | 27 % | 11 % | 1.7 | 0.4 | 0.0 | 68 % |
| SPD | links | 24 % | 5 % | 0.6 | 0.3 | 0.0 | 68 % |
| SPD | national | 19 % | 28 % | 0.5 | 0.4 | 0.0 | 67 % |
| SPD | pragmatisch | 23 % | 10 % | 2.5 | 0.7 | 0.0 | 67 % |
| SPD | passend | 28 % | 21 % | 4.0 | 0.9 | 0.0 | 68 % |
| SPD | beliebig | 23 % | 39 % | 4.1 | 0.8 | 0.0 | 67 % |
| Grüne | keine Reformwege | 8 % | 2 % | 0.0 | 0.0 | 0.0 | 65 % |
| Grüne | marktliberal | 6 % | 16 % | 1.1 | 0.2 | 0.0 | 64 % |
| Grüne | konservativ | 7 % | 13 % | 0.9 | 0.2 | 0.0 | 65 % |
| Grüne | sozialdemokratisch | 5 % | 4 % | 0.6 | 0.2 | 0.0 | 65 % |
| Grüne | gruen | 9 % | 9 % | 0.6 | 0.2 | 0.0 | 65 % |
| Grüne | links | 6 % | 3 % | 0.2 | 0.1 | 0.0 | 65 % |
| Grüne | national | 5 % | 7 % | 0.2 | 0.2 | 0.0 | 65 % |
| Grüne | pragmatisch | 8 % | 5 % | 0.8 | 0.2 | 0.0 | 65 % |
| Grüne | passend | 10 % | 10 % | 1.1 | 0.2 | 0.0 | 65 % |
| Grüne | beliebig | 5 % | 15 % | 1.3 | 0.2 | 0.0 | 65 % |

## Koalitionsbruch mit Gegenmaßnahme (Block 2)
Wie der Abschnitt davor, aber der Spieler reagiert auf jedes Ultimatum mit einem Zugeständnis, sobald es geht (fehlt nur Kapital, wird gespart). Ziele (vor der Änderung festgelegt): klar koalitionsfeindlicher Kurs (SPD marktliberal, konservativ, beliebig) bleibt bei mindestens 25 % Bruch; moderater Kurs (SPD passend, grün, pragmatisch; CDU/CSU marktliberal, konservativ, passend) mindestens halbiert gegenüber dem Abschnitt davor.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø beschlossene Wege | Ø gescheitert | Ø Krisen | Ø Schuldenquote |
|---|---|---|---|---|---|---|---|
| CDU/CSU | keine Reformwege | 65 % | 0 % | 0.0 | 0.0 | 0.1 | 70 % |
| CDU/CSU | marktliberal | 65 % | 4 % | 5.1 | 1.0 | 0.1 | 70 % |
| CDU/CSU | konservativ | 71 % | 3 % | 4.1 | 0.9 | 0.1 | 70 % |
| CDU/CSU | sozialdemokratisch | 63 % | 0 % | 2.5 | 0.5 | 0.1 | 71 % |
| CDU/CSU | gruen | 59 % | 0 % | 2.3 | 0.5 | 0.1 | 71 % |
| CDU/CSU | links | 57 % | 0 % | 1.5 | 0.8 | 0.1 | 71 % |
| CDU/CSU | national | 61 % | 2 % | 1.0 | 0.7 | 0.1 | 71 % |
| CDU/CSU | pragmatisch | 68 % | 0 % | 3.5 | 0.8 | 0.0 | 70 % |
| CDU/CSU | passend | 70 % | 3 % | 7.1 | 1.4 | 0.1 | 71 % |
| CDU/CSU | beliebig | 67 % | 4 % | 7.9 | 1.5 | 0.1 | 71 % |
| SPD | keine Reformwege | 23 % | 0 % | 0.0 | 0.0 | 0.0 | 67 % |
| SPD | marktliberal | 22 % | 26 % | 3.2 | 0.7 | 0.1 | 68 % |
| SPD | konservativ | 20 % | 28 % | 2.6 | 0.5 | 0.0 | 67 % |
| SPD | sozialdemokratisch | 26 % | 2 % | 2.0 | 0.5 | 0.0 | 69 % |
| SPD | gruen | 26 % | 1 % | 1.7 | 0.4 | 0.0 | 68 % |
| SPD | links | 25 % | 0 % | 0.6 | 0.3 | 0.0 | 68 % |
| SPD | national | 19 % | 11 % | 0.5 | 0.4 | 0.0 | 67 % |
| SPD | pragmatisch | 23 % | 1 % | 2.5 | 0.7 | 0.0 | 67 % |
| SPD | passend | 32 % | 2 % | 4.0 | 1.0 | 0.1 | 69 % |
| SPD | beliebig | 22 % | 28 % | 3.9 | 0.9 | 0.0 | 67 % |
| Grüne | keine Reformwege | 7 % | 0 % | 0.0 | 0.0 | 0.0 | 65 % |
| Grüne | marktliberal | 5 % | 9 % | 1.1 | 0.2 | 0.0 | 65 % |
| Grüne | konservativ | 5 % | 5 % | 0.9 | 0.2 | 0.0 | 65 % |
| Grüne | sozialdemokratisch | 4 % | 1 % | 0.6 | 0.2 | 0.0 | 65 % |
| Grüne | gruen | 7 % | 3 % | 0.6 | 0.2 | 0.0 | 65 % |
| Grüne | links | 7 % | 0 % | 0.2 | 0.1 | 0.0 | 65 % |
| Grüne | national | 5 % | 3 % | 0.2 | 0.2 | 0.0 | 65 % |
| Grüne | pragmatisch | 7 % | 2 % | 0.8 | 0.2 | 0.0 | 65 % |
| Grüne | passend | 7 % | 1 % | 1.1 | 0.2 | 0.0 | 65 % |
| Grüne | beliebig | 3 % | 9 % | 1.3 | 0.2 | 0.0 | 65 % |

## Schwierigkeitsanzeige (F06)
Gemessen an der besten Wahlkampf-Strategie je Partei (Haushalt unverändert), Grenzen aus `config.schwierigkeit`, eingetragen in `src/data/parteien.js`.

| Partei | Siege | gemessen | eingetragen | Abgleich |
|---|---|---|---|---|
| CDU/CSU | 54.0 % | leicht | leicht | passt |
| AfD | 0.0 % | fast unmöglich | fast unmöglich | passt |
| SPD | 19.0 % | mittel | mittel | passt |
| Grüne | 3.5 % | schwer | schwer | passt |
| Linke | 0.0 % | fast unmöglich | fast unmöglich | passt |
| BSW | 0.5 % | fast unmöglich | fast unmöglich | passt |
| FDP | 1.0 % | schwer | fast unmöglich | **anpassen** |

## Alle Konstanten (`src/data/config.js`)
| Name | Wert | Freigegeben in |
|---|---|---|
| `sitzeBundestag` | 630 | M1/M3 (Quelle in config.js) |
| `sperrklauselProzent` | 5 | M1/M3 (Quelle in config.js) |
| `legislaturJahre` | 4 | M1/M3 (Quelle in config.js) |
| `regierung.quartaleJeJahr` | 4 | F12 |
| `kapital.start` | 50 | Erweiterung |
| `kapital.max` | 100 | Erweiterung |
| `kapital.jeQuartal` | 8 | Erweiterung |
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
| `probleme.stufen` | [{"id":"ruhig","name":"ruhig","ab":0,"folgen":0},{"id":"angespannt","name":"angespannt","ab":40,"folgen":0.25},{"id":"ernst","name":"ernst","ab":60,"folgen":0.6},{"id":"krise","name":"Krise","ab":80,"folgen":1}] | System 3 |
| `probleme.maxAktiv` | 6 | System 3 |
| `probleme.fruehwarnungAb` | 32 | System 3 |
| `probleme.umfrageJeQuartal.ernst` | 0.02 | System 3 |
| `probleme.umfrageJeQuartal.krise` | 0.05 | System 3 |
| `probleme.schwankung` | 1 | System 3 |
| `probleme.aktionenJeQuartal` | 2 | System 3 |
| `probleme.fehlschlagWirkung` | 0.3 | System 3 |
| `probleme.fehlschlagUmfrage` | 0.2 | System 3 |
| `probleme.gewinnJeWertpunkt` | 0.01 | System 3 |
| `probleme.gewinnRegierungJeWertpunkt` | 0.015 | System 3 |
| `probleme.passungBonus` | 0.15 | System 3 |
| `probleme.verlaufLaenge` | 16 | System 3 |
| `ereignisse.chanceJeQuartal` | 0.3 | F14 |
| `umfrageBilanz.runden` | 8 | Paket Klein |
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
| `haushalt.ministerSchrittProzent` | 5 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.ministerMaxProzent` | 20 | M8 (Zahlen 2026: Quelle in config.js) |
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
| `minderheit.fehlschlaegeBisSpielende` | 2 | F11 |
| `schwierigkeit.leicht` | 0.3 | F06 |
| `schwierigkeit.mittel` | 0.1 | F06 |
| `schwierigkeit.schwer` | 0.01 | F06 |
| `spielende.koalitionsbruchPunkte` | 1.5 | M10 |
| `spielende.warnAnteil` | 0.5 | M10 |
| `spielende.siegJahreKanzler` | 12 | M10 |
| `koalitionsbruch.ultimatumAnteil` | 0.8 | Block 2 |
| `koalitionsbruch.fristQuartale` | 2 | Block 2 |
| `koalitionsbruch.zugestaendnisKapital` | 15 | Block 2 |
| `koalitionsbruch.zugestaendnisPunkte` | 0.4 | Block 2 |
| `koalitionsbruch.zugestaendnisKanzler` | 0.2 | Block 2 |

Änderungen an diesen Werten nur nach Entscheidung des Nutzers.
