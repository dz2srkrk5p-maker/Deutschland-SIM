# Balancing-Bericht

Erzeugt mit `npm run balancing` am 2026-10-25. 200 Partien je Partei und Strategie (Seeds 1–200).

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
| Haushalt unverändert | CDU/CSU | 100 % | 8 % | 17 % | 6.0 |
| Haushalt unverändert | AfD | 0 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | SPD | 36 % | 3 % | 4 % | 2.2 |
| Haushalt unverändert | Grüne | 9 % | 1 % | 0 % | 0.4 |
| Haushalt unverändert | Linke | 1 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | BSW | 0 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | FDP | 2 % | 0 % | 0 % | 0.1 |
| Partner kürzen | CDU/CSU | 100 % | 43 % | 15 % | 5.7 |
| Partner kürzen | AfD | 0 % | 0 % | 0 % | 0.0 |
| Partner kürzen | SPD | 36 % | 35 % | 3 % | 1.8 |
| Partner kürzen | Grüne | 9 % | 6 % | 0 % | 0.3 |
| Partner kürzen | Linke | 1 % | 1 % | 0 % | 0.0 |
| Partner kürzen | BSW | 0 % | 0 % | 0 % | 0.0 |
| Partner kürzen | FDP | 2 % | 2 % | 0 % | 0.0 |

## Wahlkampf-Strategien (F08)
Siege in Prozent, Haushalt unverändert. „klug“: jede Woche die Aktion mit dem höchsten erwarteten eigenen Gewinn nach abnehmendem Ertrag. Fett: beste Strategie je Partei. Maßstab (freigegeben): keine „immer …“-Strategie ist bei einer Partei die beste.

| Partei | immer Plakate | immer Kundgebung | immer Angriff (Stärkster) | abwechselnd | klug |
|---|---|---|---|---|---|
| CDU/CSU | 16.5 | 19.0 | 18.0 | 43.0 | **53.0** |
| AfD | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| SPD | 4.0 | 5.0 | 7.5 | **20.0** | 11.5 |
| Grüne | 0.0 | 0.0 | 0.0 | **3.5** | 1.0 |
| Linke | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| BSW | 0.0 | 0.0 | 0.0 | **0.5** | 0.0 |
| FDP | 0.0 | 0.0 | 0.0 | 0.0 | **1.0** |

## Minderheitsregierung (F11)
Wahlkampf abwechselnd, Haushalt unverändert. „Minderheit“: Anteil der Partien mit mindestens einer Minderheitsregierung. „Gescheitert“: Zahl der Partien, die durch gescheiterte Haushalte einer Minderheitsregierung enden.

| Partei | Regierungsbildung | Minderheit | Gescheitert | Sieg |
|---|---|---|---|---|
| CDU/CSU | Minderheit nur ohne Mehrheit | 62 % | 114 | 43 % |
| CDU/CSU | Minderheit wenn möglich | 100 % | 200 | 0 % |
| AfD | Minderheit nur ohne Mehrheit | 0 % | 0 | 0 % |
| AfD | Minderheit wenn möglich | 0 % | 0 | 0 % |
| SPD | Minderheit nur ohne Mehrheit | 11 % | 20 | 20 % |
| SPD | Minderheit wenn möglich | 24 % | 48 | 7 % |
| Grüne | Minderheit nur ohne Mehrheit | 1 % | 2 | 4 % |
| Grüne | Minderheit wenn möglich | 3 % | 5 | 3 % |
| Linke | Minderheit nur ohne Mehrheit | 0 % | 0 | 0 % |
| Linke | Minderheit wenn möglich | 0 % | 0 | 0 % |
| BSW | Minderheit nur ohne Mehrheit | 0 % | 0 | 1 % |
| BSW | Minderheit wenn möglich | 0 % | 0 | 1 % |
| FDP | Minderheit nur ohne Mehrheit | 0 % | 0 | 0 % |
| FDP | Minderheit wenn möglich | 0 % | 0 | 0 % |

## Probleme und Lösungen (System 3)
Wahlkampf abwechselnd, Minderheit nur ohne Mehrheit, Haushalt mit Kürzungen nur wenn nötig. Je Quartal bis zu 2 Lösungen nach Strategie (siehe Skript). Werte am Partieende: Problemwert im Mittel über alle Bereiche, Zahl der Krisen, Schuldenquote.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø erfolgreiche Lösungen | Ø Problemwert | Ø Krisen | Ø Schuldenquote |
|---|---|---|---|---|---|---|---|
| CDU/CSU | keine Lösungen | 43 % | 9 % | 0.0 | 50 | 1.4 | 74 % |
| CDU/CSU | größtes Problem zuerst | 58 % | 1 % | 20.4 | 36 | 0.1 | 70 % |
| CDU/CSU | billigste zuerst | 55 % | 0 % | 19.0 | 38 | 0.5 | 74 % |
| AfD | keine Lösungen | 0 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| AfD | größtes Problem zuerst | 0 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| AfD | billigste zuerst | 0 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| SPD | keine Lösungen | 20 % | 2 % | 0.0 | 46 | 0.6 | 69 % |
| SPD | größtes Problem zuerst | 26 % | 0 % | 10.5 | 38 | 0.0 | 67 % |
| SPD | billigste zuerst | 24 % | 1 % | 9.2 | 40 | 0.2 | 69 % |
| Grüne | keine Lösungen | 4 % | 1 % | 0.0 | 44 | 0.1 | 65 % |
| Grüne | größtes Problem zuerst | 8 % | 2 % | 3.5 | 42 | 0.0 | 65 % |
| Grüne | billigste zuerst | 5 % | 0 % | 2.6 | 42 | 0.0 | 65 % |
| Linke | keine Lösungen | 0 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| Linke | größtes Problem zuerst | 0 % | 0 % | 0.3 | 43 | 0.0 | 64 % |
| Linke | billigste zuerst | 1 % | 0 % | 0.3 | 43 | 0.0 | 64 % |
| BSW | keine Lösungen | 1 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| BSW | größtes Problem zuerst | 1 % | 1 % | 0.6 | 43 | 0.0 | 64 % |
| BSW | billigste zuerst | 1 % | 0 % | 0.4 | 43 | 0.0 | 64 % |
| FDP | keine Lösungen | 0 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| FDP | größtes Problem zuerst | 0 % | 0 % | 0.3 | 42 | 0.0 | 64 % |
| FDP | billigste zuerst | 0 % | 0 % | 0.3 | 43 | 0.0 | 64 % |

## Reformwege nach Ausrichtung (System 1)
Wie bei den Lösungen; je Quartal zuerst ein Reformweg der Ausrichtung, der laut Vorschau eine Mehrheit hat, sonst eine Lösung für das größte Problem. „passend“: Wege mit Abstand bis 1 zur eigenen Parteiposition. Maßstab: keine Ausrichtung dominiert klar, „passend“ liegt 3–8 Punkte über „keine Reformwege“, die Schuldenquote läuft nicht davon.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø beschlossene Wege | Ø gescheitert | Ø Krisen | Ø Schuldenquote |
|---|---|---|---|---|---|---|---|
| CDU/CSU | keine Reformwege | 58 % | 1 % | 0.0 | 0.0 | 0.1 | 70 % |
| CDU/CSU | marktliberal | 63 % | 8 % | 5.1 | 1.1 | 0.1 | 70 % |
| CDU/CSU | konservativ | 66 % | 12 % | 4.6 | 0.8 | 0.1 | 70 % |
| CDU/CSU | sozialdemokratisch | 56 % | 1 % | 3.3 | 0.5 | 0.1 | 71 % |
| CDU/CSU | gruen | 57 % | 0 % | 2.8 | 0.7 | 0.1 | 71 % |
| CDU/CSU | links | 55 % | 1 % | 1.9 | 1.0 | 0.1 | 71 % |
| CDU/CSU | national | 58 % | 18 % | 1.0 | 0.8 | 0.1 | 70 % |
| CDU/CSU | pragmatisch | 67 % | 2 % | 4.0 | 1.0 | 0.0 | 70 % |
| CDU/CSU | passend | 67 % | 11 % | 6.9 | 1.6 | 0.0 | 70 % |
| CDU/CSU | beliebig | 62 % | 14 % | 8.0 | 1.5 | 0.2 | 70 % |
| SPD | keine Reformwege | 26 % | 0 % | 0.0 | 0.0 | 0.0 | 67 % |
| SPD | marktliberal | 26 % | 44 % | 3.3 | 0.7 | 0.0 | 67 % |
| SPD | konservativ | 21 % | 45 % | 2.7 | 0.5 | 0.0 | 67 % |
| SPD | sozialdemokratisch | 29 % | 4 % | 2.0 | 0.5 | 0.0 | 69 % |
| SPD | gruen | 26 % | 13 % | 1.7 | 0.4 | 0.0 | 68 % |
| SPD | links | 27 % | 5 % | 0.6 | 0.3 | 0.0 | 68 % |
| SPD | national | 24 % | 27 % | 0.5 | 0.4 | 0.0 | 67 % |
| SPD | pragmatisch | 27 % | 9 % | 2.5 | 0.7 | 0.0 | 68 % |
| SPD | passend | 25 % | 19 % | 4.0 | 1.0 | 0.0 | 69 % |
| SPD | beliebig | 23 % | 43 % | 4.0 | 0.8 | 0.0 | 67 % |
| Grüne | keine Reformwege | 8 % | 2 % | 0.0 | 0.0 | 0.0 | 65 % |
| Grüne | marktliberal | 3 % | 16 % | 1.1 | 0.2 | 0.0 | 64 % |
| Grüne | konservativ | 5 % | 12 % | 0.9 | 0.2 | 0.0 | 65 % |
| Grüne | sozialdemokratisch | 6 % | 3 % | 0.6 | 0.2 | 0.0 | 65 % |
| Grüne | gruen | 11 % | 9 % | 0.6 | 0.2 | 0.0 | 65 % |
| Grüne | links | 8 % | 2 % | 0.2 | 0.1 | 0.0 | 65 % |
| Grüne | national | 5 % | 5 % | 0.2 | 0.2 | 0.0 | 64 % |
| Grüne | pragmatisch | 6 % | 6 % | 0.7 | 0.2 | 0.0 | 65 % |
| Grüne | passend | 6 % | 10 % | 1.0 | 0.2 | 0.0 | 65 % |
| Grüne | beliebig | 3 % | 12 % | 1.2 | 0.2 | 0.0 | 64 % |

## Koalitionsbruch mit Gegenmaßnahme (Block 2)
Wie der Abschnitt davor, aber der Spieler reagiert auf jedes Ultimatum mit einem Zugeständnis, sobald es geht (fehlt nur Kapital, wird gespart). Ziele (vor der Änderung festgelegt): klar koalitionsfeindlicher Kurs (SPD marktliberal, konservativ, beliebig) bleibt bei mindestens 25 % Bruch; moderater Kurs (SPD passend, grün, pragmatisch; CDU/CSU marktliberal, konservativ, passend) mindestens halbiert gegenüber dem Abschnitt davor.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø beschlossene Wege | Ø gescheitert | Ø Krisen | Ø Schuldenquote |
|---|---|---|---|---|---|---|---|
| CDU/CSU | keine Reformwege | 58 % | 0 % | 0.0 | 0.0 | 0.1 | 70 % |
| CDU/CSU | marktliberal | 63 % | 6 % | 5.2 | 1.1 | 0.1 | 70 % |
| CDU/CSU | konservativ | 70 % | 3 % | 4.6 | 0.8 | 0.1 | 70 % |
| CDU/CSU | sozialdemokratisch | 56 % | 0 % | 3.4 | 0.5 | 0.1 | 71 % |
| CDU/CSU | gruen | 56 % | 0 % | 2.8 | 0.7 | 0.1 | 71 % |
| CDU/CSU | links | 54 % | 0 % | 1.9 | 1.0 | 0.1 | 71 % |
| CDU/CSU | national | 58 % | 3 % | 1.0 | 0.8 | 0.1 | 71 % |
| CDU/CSU | pragmatisch | 67 % | 0 % | 4.0 | 1.0 | 0.0 | 70 % |
| CDU/CSU | passend | 70 % | 3 % | 6.9 | 1.6 | 0.1 | 70 % |
| CDU/CSU | beliebig | 61 % | 3 % | 8.1 | 1.5 | 0.2 | 71 % |
| SPD | keine Reformwege | 26 % | 0 % | 0.0 | 0.0 | 0.0 | 67 % |
| SPD | marktliberal | 21 % | 24 % | 3.3 | 0.6 | 0.0 | 67 % |
| SPD | konservativ | 26 % | 27 % | 2.6 | 0.5 | 0.0 | 68 % |
| SPD | sozialdemokratisch | 28 % | 1 % | 2.0 | 0.5 | 0.0 | 69 % |
| SPD | gruen | 26 % | 3 % | 1.7 | 0.4 | 0.0 | 68 % |
| SPD | links | 26 % | 1 % | 0.6 | 0.3 | 0.0 | 68 % |
| SPD | national | 23 % | 10 % | 0.5 | 0.4 | 0.0 | 68 % |
| SPD | pragmatisch | 28 % | 0 % | 2.5 | 0.7 | 0.0 | 68 % |
| SPD | passend | 30 % | 1 % | 4.1 | 1.0 | 0.0 | 69 % |
| SPD | beliebig | 26 % | 29 % | 4.2 | 0.9 | 0.1 | 68 % |
| Grüne | keine Reformwege | 7 % | 1 % | 0.0 | 0.0 | 0.0 | 65 % |
| Grüne | marktliberal | 2 % | 9 % | 1.0 | 0.2 | 0.0 | 64 % |
| Grüne | konservativ | 4 % | 5 % | 0.9 | 0.2 | 0.0 | 65 % |
| Grüne | sozialdemokratisch | 6 % | 0 % | 0.6 | 0.2 | 0.0 | 65 % |
| Grüne | gruen | 10 % | 1 % | 0.6 | 0.2 | 0.0 | 65 % |
| Grüne | links | 8 % | 1 % | 0.2 | 0.1 | 0.0 | 65 % |
| Grüne | national | 6 % | 2 % | 0.2 | 0.2 | 0.0 | 65 % |
| Grüne | pragmatisch | 5 % | 1 % | 0.7 | 0.2 | 0.0 | 65 % |
| Grüne | passend | 8 % | 3 % | 1.1 | 0.2 | 0.0 | 65 % |
| Grüne | beliebig | 6 % | 8 % | 1.4 | 0.2 | 0.0 | 65 % |

## Schwierigkeitsanzeige (F06)
Gemessen an der besten Wahlkampf-Strategie je Partei (Haushalt unverändert), Grenzen aus `config.schwierigkeit`, eingetragen in `src/data/parteien.js`.

| Partei | Siege | gemessen | eingetragen | Abgleich |
|---|---|---|---|---|
| CDU/CSU | 53.0 % | leicht | leicht | passt |
| AfD | 0.0 % | fast unmöglich | fast unmöglich | passt |
| SPD | 20.0 % | mittel | mittel | passt |
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
| `kompromiss.maxFehlend` | 15 | M1/M3 (Quelle in config.js) |
| `kompromiss.wirkungFaktor` | 0.6 | M1/M3 (Quelle in config.js) |
| `kompromiss.kapital` | 10 | M1/M3 (Quelle in config.js) |
| `kompromiss.laenderAusgleich` | 2000000 | M1/M3 (Quelle in config.js) |
| `landtagswahlen.startJahr` | 2026 | Paket Mittel |
| `landtagswahlen.basis` | 0.35 | Paket Mittel |
| `landtagswahlen.jePunkt` | 0.08 | Paket Mittel |
| `landtagswahlen.min` | 0.1 | Paket Mittel |
| `landtagswahlen.max` | 0.85 | Paket Mittel |
| `landtagswahlen.verlustUmfrage` | 0.15 | Paket Mittel |
| `landtagswahlen.gewinnUmfrage` | 0.1 | Paket Mittel |
| `verfassungsrisiko.dauerQuartale` | 4 | Paket Klein |
| `verfassungsrisiko.verlustUmfrage` | 0.3 | Paket Klein |
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
