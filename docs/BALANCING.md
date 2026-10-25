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
| Haushalt unverändert | CDU/CSU | 100 % | 3 % | 19 % | 6.1 |
| Haushalt unverändert | AfD | 0 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | SPD | 36 % | 1 % | 5 % | 2.1 |
| Haushalt unverändert | Grüne | 9 % | 0 % | 0 % | 0.4 |
| Haushalt unverändert | Linke | 1 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | BSW | 0 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | FDP | 2 % | 0 % | 0 % | 0.1 |
| Partner kürzen | CDU/CSU | 100 % | 47 % | 10 % | 5.7 |
| Partner kürzen | AfD | 0 % | 0 % | 0 % | 0.0 |
| Partner kürzen | SPD | 36 % | 35 % | 1 % | 1.8 |
| Partner kürzen | Grüne | 9 % | 6 % | 0 % | 0.4 |
| Partner kürzen | Linke | 1 % | 1 % | 0 % | 0.0 |
| Partner kürzen | BSW | 0 % | 0 % | 0 % | 0.0 |
| Partner kürzen | FDP | 2 % | 2 % | 0 % | 0.0 |

## Wahlkampf-Strategien (F08)
Siege in Prozent, Haushalt unverändert. „klug“: jede Woche die Aktion mit dem höchsten erwarteten eigenen Gewinn nach abnehmendem Ertrag. Fett: beste Strategie je Partei. Maßstab (freigegeben): keine „immer …“-Strategie ist bei einer Partei die beste.

| Partei | immer Plakate | immer Kundgebung | immer Angriff (Stärkster) | abwechselnd | klug |
|---|---|---|---|---|---|
| CDU/CSU | 19.0 | 25.0 | 18.5 | 41.0 | **53.5** |
| AfD | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| SPD | 4.5 | 6.0 | 6.5 | **22.0** | 15.0 |
| Grüne | 0.0 | 0.0 | 0.0 | **4.0** | 0.0 |
| Linke | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| BSW | 0.0 | 0.0 | 0.0 | **1.5** | 0.0 |
| FDP | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |

## Minderheitsregierung (F11)
Wahlkampf abwechselnd, Haushalt unverändert. „Minderheit“: Anteil der Partien mit mindestens einer Minderheitsregierung. „Gescheitert“: Zahl der Partien, die durch gescheiterte Haushalte einer Minderheitsregierung enden.

| Partei | Regierungsbildung | Minderheit | Gescheitert | Sieg |
|---|---|---|---|---|
| CDU/CSU | Minderheit nur ohne Mehrheit | 64 % | 118 | 41 % |
| CDU/CSU | Minderheit wenn möglich | 100 % | 200 | 0 % |
| AfD | Minderheit nur ohne Mehrheit | 0 % | 0 | 0 % |
| AfD | Minderheit wenn möglich | 0 % | 0 | 0 % |
| SPD | Minderheit nur ohne Mehrheit | 6 % | 11 | 22 % |
| SPD | Minderheit wenn möglich | 20 % | 40 | 9 % |
| Grüne | Minderheit nur ohne Mehrheit | 0 % | 0 | 4 % |
| Grüne | Minderheit wenn möglich | 1 % | 2 | 3 % |
| Linke | Minderheit nur ohne Mehrheit | 0 % | 0 | 0 % |
| Linke | Minderheit wenn möglich | 0 % | 0 | 0 % |
| BSW | Minderheit nur ohne Mehrheit | 0 % | 0 | 2 % |
| BSW | Minderheit wenn möglich | 0 % | 0 | 2 % |
| FDP | Minderheit nur ohne Mehrheit | 0 % | 0 | 0 % |
| FDP | Minderheit wenn möglich | 0 % | 0 | 0 % |

## Probleme und Lösungen (System 3)
Wahlkampf abwechselnd, Minderheit nur ohne Mehrheit, Haushalt mit Kürzungen nur wenn nötig. Je Quartal bis zu 1 Lösungen nach Strategie (siehe Skript). Werte am Partieende: Problemwert im Mittel über alle Bereiche, Zahl der Krisen, Schuldenquote.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø erfolgreiche Lösungen | Ø Problemwert | Ø Krisen | Ø Schuldenquote |
|---|---|---|---|---|---|---|---|
| CDU/CSU | keine Lösungen | 41 % | 6 % | 0.0 | 51 | 1.6 | 75 % |
| CDU/CSU | größtes Problem zuerst | 62 % | 0 % | 21.9 | 36 | 0.1 | 71 % |
| CDU/CSU | billigste zuerst | 60 % | 0 % | 23.6 | 37 | 0.3 | 74 % |
| AfD | keine Lösungen | 0 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| AfD | größtes Problem zuerst | 0 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| AfD | billigste zuerst | 0 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| SPD | keine Lösungen | 22 % | 1 % | 0.0 | 46 | 0.7 | 69 % |
| SPD | größtes Problem zuerst | 25 % | 0 % | 11.1 | 39 | 0.0 | 67 % |
| SPD | billigste zuerst | 21 % | 0 % | 10.8 | 40 | 0.1 | 68 % |
| Grüne | keine Lösungen | 4 % | 0 % | 0.0 | 44 | 0.1 | 65 % |
| Grüne | größtes Problem zuerst | 4 % | 0 % | 3.0 | 42 | 0.0 | 65 % |
| Grüne | billigste zuerst | 5 % | 0 % | 3.2 | 42 | 0.0 | 65 % |
| Linke | keine Lösungen | 0 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| Linke | größtes Problem zuerst | 0 % | 0 % | 0.3 | 43 | 0.0 | 64 % |
| Linke | billigste zuerst | 0 % | 0 % | 0.3 | 43 | 0.0 | 64 % |
| BSW | keine Lösungen | 2 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| BSW | größtes Problem zuerst | 1 % | 0 % | 0.5 | 43 | 0.0 | 64 % |
| BSW | billigste zuerst | 1 % | 0 % | 0.6 | 43 | 0.0 | 64 % |
| FDP | keine Lösungen | 0 % | 0 % | 0.0 | 43 | 0.0 | 64 % |
| FDP | größtes Problem zuerst | 0 % | 0 % | 0.3 | 43 | 0.0 | 64 % |
| FDP | billigste zuerst | 1 % | 0 % | 0.5 | 42 | 0.0 | 64 % |

## Reformwege nach Ausrichtung (System 1)
Wie bei den Lösungen; je Quartal zuerst ein Reformweg der Ausrichtung, der laut Vorschau eine Mehrheit hat, sonst eine Lösung für das größte Problem. „passend“: Wege mit Abstand bis 1 zur eigenen Parteiposition. Maßstab: keine Ausrichtung dominiert klar, „passend“ liegt 3–8 Punkte über „keine Reformwege“, die Schuldenquote läuft nicht davon.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø beschlossene Wege | Ø gescheitert | Ø Krisen | Ø Schuldenquote |
|---|---|---|---|---|---|---|---|
| CDU/CSU | keine Reformwege | 62 % | 0 % | 0.0 | 0.0 | 0.1 | 71 % |
| CDU/CSU | marktliberal | 62 % | 4 % | 5.5 | 1.0 | 0.1 | 72 % |
| CDU/CSU | konservativ | 62 % | 2 % | 4.6 | 1.0 | 0.1 | 72 % |
| CDU/CSU | sozialdemokratisch | 59 % | 0 % | 3.5 | 0.8 | 0.1 | 72 % |
| CDU/CSU | gruen | 52 % | 0 % | 2.7 | 0.8 | 0.1 | 72 % |
| CDU/CSU | links | 53 % | 0 % | 2.1 | 1.0 | 0.1 | 72 % |
| CDU/CSU | national | 56 % | 3 % | 1.6 | 0.9 | 0.1 | 72 % |
| CDU/CSU | pragmatisch | 61 % | 1 % | 3.8 | 1.0 | 0.1 | 72 % |
| CDU/CSU | passend | 68 % | 4 % | 6.1 | 1.5 | 0.1 | 72 % |
| CDU/CSU | beliebig | 62 % | 5 % | 6.9 | 1.6 | 0.2 | 72 % |
| SPD | keine Reformwege | 25 % | 0 % | 0.0 | 0.0 | 0.0 | 67 % |
| SPD | marktliberal | 21 % | 5 % | 2.8 | 0.6 | 0.0 | 67 % |
| SPD | konservativ | 24 % | 6 % | 2.5 | 0.6 | 0.0 | 68 % |
| SPD | sozialdemokratisch | 25 % | 1 % | 2.5 | 0.6 | 0.0 | 68 % |
| SPD | gruen | 26 % | 2 % | 2.2 | 0.6 | 0.0 | 68 % |
| SPD | links | 25 % | 1 % | 2.0 | 0.5 | 0.0 | 68 % |
| SPD | national | 23 % | 1 % | 1.8 | 0.5 | 0.0 | 68 % |
| SPD | pragmatisch | 23 % | 0 % | 2.6 | 0.5 | 0.0 | 68 % |
| SPD | passend | 28 % | 3 % | 3.6 | 0.9 | 0.0 | 68 % |
| SPD | beliebig | 23 % | 9 % | 3.5 | 0.9 | 0.1 | 68 % |
| Grüne | keine Reformwege | 4 % | 0 % | 0.0 | 0.0 | 0.0 | 65 % |
| Grüne | marktliberal | 6 % | 9 % | 0.9 | 0.2 | 0.0 | 65 % |
| Grüne | konservativ | 6 % | 8 % | 0.8 | 0.2 | 0.0 | 65 % |
| Grüne | sozialdemokratisch | 7 % | 1 % | 0.7 | 0.2 | 0.0 | 65 % |
| Grüne | gruen | 7 % | 1 % | 0.7 | 0.1 | 0.0 | 65 % |
| Grüne | links | 6 % | 1 % | 0.5 | 0.2 | 0.0 | 65 % |
| Grüne | national | 3 % | 1 % | 0.4 | 0.2 | 0.0 | 65 % |
| Grüne | pragmatisch | 5 % | 3 % | 0.6 | 0.3 | 0.0 | 65 % |
| Grüne | passend | 9 % | 2 % | 0.9 | 0.2 | 0.0 | 65 % |
| Grüne | beliebig | 8 % | 8 % | 1.3 | 0.3 | 0.0 | 65 % |

## Koalitionsbruch mit Gegenmaßnahme (Block 2)
Wie der Abschnitt davor, aber der Spieler reagiert auf jedes Ultimatum mit einem Zugeständnis, sobald es geht (fehlt nur Kapital, wird gespart). Ziele (vor der Änderung festgelegt): klar koalitionsfeindlicher Kurs (SPD marktliberal, konservativ, beliebig) bleibt bei mindestens 25 % Bruch; moderater Kurs (SPD passend, grün, pragmatisch; CDU/CSU marktliberal, konservativ, passend) mindestens halbiert gegenüber dem Abschnitt davor.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø beschlossene Wege | Ø gescheitert | Ø Krisen | Ø Schuldenquote |
|---|---|---|---|---|---|---|---|
| CDU/CSU | keine Reformwege | 62 % | 0 % | 0.0 | 0.0 | 0.1 | 71 % |
| CDU/CSU | marktliberal | 62 % | 0 % | 5.5 | 1.0 | 0.1 | 72 % |
| CDU/CSU | konservativ | 63 % | 1 % | 4.6 | 1.0 | 0.1 | 72 % |
| CDU/CSU | sozialdemokratisch | 59 % | 0 % | 3.5 | 0.8 | 0.1 | 72 % |
| CDU/CSU | gruen | 52 % | 0 % | 2.7 | 0.8 | 0.1 | 72 % |
| CDU/CSU | links | 53 % | 0 % | 2.1 | 1.0 | 0.1 | 72 % |
| CDU/CSU | national | 57 % | 0 % | 1.6 | 0.9 | 0.1 | 72 % |
| CDU/CSU | pragmatisch | 61 % | 0 % | 3.8 | 1.0 | 0.1 | 72 % |
| CDU/CSU | passend | 68 % | 2 % | 6.2 | 1.5 | 0.1 | 72 % |
| CDU/CSU | beliebig | 61 % | 1 % | 6.9 | 1.6 | 0.2 | 72 % |
| SPD | keine Reformwege | 24 % | 0 % | 0.0 | 0.0 | 0.0 | 67 % |
| SPD | marktliberal | 19 % | 2 % | 2.8 | 0.6 | 0.0 | 67 % |
| SPD | konservativ | 26 % | 1 % | 2.5 | 0.6 | 0.0 | 68 % |
| SPD | sozialdemokratisch | 26 % | 0 % | 2.5 | 0.6 | 0.1 | 68 % |
| SPD | gruen | 27 % | 1 % | 2.2 | 0.6 | 0.0 | 68 % |
| SPD | links | 24 % | 0 % | 1.9 | 0.5 | 0.0 | 68 % |
| SPD | national | 24 % | 0 % | 1.8 | 0.5 | 0.0 | 68 % |
| SPD | pragmatisch | 22 % | 0 % | 2.6 | 0.5 | 0.0 | 68 % |
| SPD | passend | 28 % | 0 % | 3.6 | 0.8 | 0.0 | 68 % |
| SPD | beliebig | 21 % | 3 % | 3.4 | 0.9 | 0.1 | 68 % |
| Grüne | keine Reformwege | 4 % | 0 % | 0.0 | 0.0 | 0.0 | 65 % |
| Grüne | marktliberal | 7 % | 2 % | 0.9 | 0.2 | 0.0 | 65 % |
| Grüne | konservativ | 5 % | 3 % | 0.8 | 0.2 | 0.0 | 65 % |
| Grüne | sozialdemokratisch | 7 % | 0 % | 0.7 | 0.2 | 0.0 | 65 % |
| Grüne | gruen | 7 % | 0 % | 0.7 | 0.1 | 0.0 | 65 % |
| Grüne | links | 6 % | 0 % | 0.5 | 0.2 | 0.0 | 65 % |
| Grüne | national | 5 % | 0 % | 0.5 | 0.2 | 0.0 | 65 % |
| Grüne | pragmatisch | 6 % | 1 % | 0.6 | 0.3 | 0.0 | 65 % |
| Grüne | passend | 8 % | 1 % | 0.9 | 0.2 | 0.0 | 65 % |
| Grüne | beliebig | 6 % | 1 % | 1.1 | 0.3 | 0.0 | 65 % |

## Schwierigkeitsanzeige (F06)
Gemessen an der besten Wahlkampf-Strategie je Partei (Haushalt unverändert), Grenzen aus `config.schwierigkeit`, eingetragen in `src/data/parteien.js`.

| Partei | Siege | gemessen | eingetragen | Abgleich |
|---|---|---|---|---|
| CDU/CSU | 53.5 % | leicht | leicht | passt |
| AfD | 0.0 % | fast unmöglich | fast unmöglich | passt |
| SPD | 22.0 % | mittel | mittel | passt |
| Grüne | 4.0 % | schwer | schwer | passt |
| Linke | 0.0 % | fast unmöglich | fast unmöglich | passt |
| BSW | 1.5 % | schwer | fast unmöglich | **anpassen** |
| FDP | 0.0 % | fast unmöglich | fast unmöglich | passt |

## Alle Konstanten (`src/data/config.js`)
| Name | Wert | Freigegeben in |
|---|---|---|
| `sitzeBundestag` | 630 | M1/M3 (Quelle in config.js) |
| `sperrklauselProzent` | 5 | M1/M3 (Quelle in config.js) |
| `legislaturJahre` | 4 | M1/M3 (Quelle in config.js) |
| `regierung.monateJeJahr` | 12 | F12 |
| `zeit.anteilJeMonat` | 0.25 | M1/M3 (Quelle in config.js) |
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
| `verbaendeSteuern.quellen.gewerkschaften.gruppe` | "arbeitnehmer" | M1/M3 (Quelle in config.js) |
| `verbaendeSteuern.quellen.gewerkschaften.teiler` | 3 | M1/M3 (Quelle in config.js) |
| `verbaendeSteuern.quellen.wirtschaftsverbaende.gruppe` | "unternehmen" | M1/M3 (Quelle in config.js) |
| `verbaendeSteuern.quellen.wirtschaftsverbaende.teiler` | 3 | M1/M3 (Quelle in config.js) |
| `verbaendeSteuern.quellen.sozialverbaende.gruppe` | "geringverdiener" | M1/M3 (Quelle in config.js) |
| `verbaendeSteuern.quellen.sozialverbaende.teiler` | 3 | M1/M3 (Quelle in config.js) |
| `verbaendeSteuern.quellen.bauernverband.gruppe` | "landwirtschaft" | M1/M3 (Quelle in config.js) |
| `verbaendeSteuern.quellen.bauernverband.teiler` | 3 | M1/M3 (Quelle in config.js) |
| `verbaendeSteuern.quellen.umweltverbaende.problem` | "klimafolgen" | M1/M3 (Quelle in config.js) |
| `verbaendeSteuern.quellen.umweltverbaende.teiler` | -2 | M1/M3 (Quelle in config.js) |
| `verbaendeSteuern.dagegenAb` | -1 | M1/M3 (Quelle in config.js) |
| `verbaendeSteuern.dafuerAb` | 1 | M1/M3 (Quelle in config.js) |
| `verbaendeSteuern.kapitalDagegen` | 3 | M1/M3 (Quelle in config.js) |
| `verbaendeSteuern.kapitalDafuer` | 1 | M1/M3 (Quelle in config.js) |
| `kompromiss.maxFehlend` | 15 | Paket Mittel |
| `kompromiss.wirkungFaktor` | 0.6 | Paket Mittel |
| `kompromiss.kapital` | 10 | Paket Mittel |
| `kompromiss.laenderAusgleich` | 2000000 | Paket Mittel |
| `landtagswahlen.startJahr` | 2026 | Paket Mittel |
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
| `minderheit.fehlschlaegeBisSpielende` | 2 | F11 |
| `schwierigkeit.leicht` | 0.3 | F06 |
| `schwierigkeit.mittel` | 0.1 | F06 |
| `schwierigkeit.schwer` | 0.01 | F06 |
| `spielende.koalitionsbruchPunkte` | 1.5 | M10 |
| `spielende.warnAnteil` | 0.5 | M10 |
| `spielende.siegJahreKanzler` | 12 | M10 |
| `koalitionsbruch.ultimatumAnteil` | 0.8 | Block 2 |
| `koalitionsbruch.fristMonate` | 6 | Block 2 |
| `koalitionsbruch.zugestaendnisKapital` | 15 | Block 2 |
| `koalitionsbruch.zugestaendnisPunkte` | 0.4 | Block 2 |
| `koalitionsbruch.zugestaendnisKanzler` | 0.2 | Block 2 |

Änderungen an diesen Werten nur nach Entscheidung des Nutzers.
