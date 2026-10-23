# Balancing-Bericht

Erzeugt mit `npm run balancing` am 2026-10-23. 200 Partien je Partei und Strategie (Seeds 1–200).

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
| Haushalt unverändert | CDU/CSU | 100 % | 0 % | 36 % | 6.9 |
| Haushalt unverändert | AfD | 0 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | SPD | 36 % | 0 % | 5 % | 2.1 |
| Haushalt unverändert | Grüne | 9 % | 0 % | 0 % | 0.4 |
| Haushalt unverändert | Linke | 1 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | BSW | 0 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | FDP | 2 % | 0 % | 0 % | 0.1 |
| Partner kürzen | CDU/CSU | 100 % | 36 % | 28 % | 6.5 |
| Partner kürzen | AfD | 0 % | 0 % | 0 % | 0.0 |
| Partner kürzen | SPD | 36 % | 34 % | 9 % | 2.4 |
| Partner kürzen | Grüne | 9 % | 6 % | 0 % | 0.3 |
| Partner kürzen | Linke | 1 % | 1 % | 0 % | 0.0 |
| Partner kürzen | BSW | 0 % | 0 % | 0 % | 0.0 |
| Partner kürzen | FDP | 2 % | 2 % | 0 % | 0.0 |

## Wahlkampf-Strategien (F08)
Siege in Prozent, Haushalt unverändert. „klug“: jede Woche die Aktion mit dem höchsten erwarteten eigenen Gewinn nach abnehmendem Ertrag. Fett: beste Strategie je Partei. Maßstab (freigegeben): keine „immer …“-Strategie ist bei einer Partei die beste.

| Partei | immer Plakate | immer Kundgebung | immer Angriff (Stärkster) | abwechselnd | klug |
|---|---|---|---|---|---|
| CDU/CSU | 36.0 | 39.0 | 35.5 | 54.0 | **68.0** |
| AfD | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| SPD | 4.5 | 9.5 | 13.0 | **22.0** | 20.5 |
| Grüne | 0.0 | 0.0 | 1.5 | **7.0** | 4.0 |
| Linke | 0.0 | 0.0 | 0.0 | **0.5** | **0.5** |
| BSW | 0.0 | 0.0 | 0.0 | **1.5** | 0.5 |
| FDP | 0.0 | 0.0 | 0.0 | 0.0 | **1.5** |

## Minderheitsregierung (F11)
Wahlkampf abwechselnd, Haushalt unverändert. „Minderheit“: Anteil der Partien mit mindestens einer Minderheitsregierung. „Gescheitert“: Zahl der Partien, die durch gescheiterte Haushalte einer Minderheitsregierung enden.

| Partei | Regierungsbildung | Minderheit | Gescheitert | Sieg |
|---|---|---|---|---|
| CDU/CSU | Minderheit nur ohne Mehrheit | 54 % | 92 | 54 % |
| CDU/CSU | Minderheit wenn möglich | 100 % | 200 | 0 % |
| AfD | Minderheit nur ohne Mehrheit | 0 % | 0 | 0 % |
| AfD | Minderheit wenn möglich | 0 % | 0 | 0 % |
| SPD | Minderheit nur ohne Mehrheit | 16 % | 31 | 22 % |
| SPD | Minderheit wenn möglich | 35 % | 70 | 3 % |
| Grüne | Minderheit nur ohne Mehrheit | 1 % | 2 | 7 % |
| Grüne | Minderheit wenn möglich | 5 % | 9 | 4 % |
| Linke | Minderheit nur ohne Mehrheit | 0 % | 0 | 1 % |
| Linke | Minderheit wenn möglich | 0 % | 0 | 1 % |
| BSW | Minderheit nur ohne Mehrheit | 0 % | 0 | 2 % |
| BSW | Minderheit wenn möglich | 0 % | 0 | 2 % |
| FDP | Minderheit nur ohne Mehrheit | 0 % | 0 | 0 % |
| FDP | Minderheit wenn möglich | 0 % | 0 | 0 % |

## Reformen (F13)
Wahlkampf abwechselnd, Minderheit nur ohne Mehrheit. „mit Reformen“: je Quartal die erste Reform mit Mehrheit, im Haushalt Etats kürzen (Partner zuerst), bis die Schuldenbremse hält. Druck: Durchschnitt der Probleme am Partieende.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø Reformen | Ø Druck am Ende |
|---|---|---|---|---|---|
| CDU/CSU | keine Reformen | 54 % | 0 % | 0.0 | 74 |
| CDU/CSU | mit Reformen | 62 % | 11 % | 4.5 | 50 |
| AfD | keine Reformen | 0 % | 0 % | 0.0 | 55 |
| AfD | mit Reformen | 0 % | 0 % | 0.0 | 55 |
| SPD | keine Reformen | 22 % | 0 % | 0.0 | 65 |
| SPD | mit Reformen | 19 % | 10 % | 2.8 | 48 |
| Grüne | keine Reformen | 7 % | 0 % | 0.0 | 58 |
| Grüne | mit Reformen | 6 % | 2 % | 1.0 | 52 |
| Linke | keine Reformen | 1 % | 0 % | 0.0 | 55 |
| Linke | mit Reformen | 0 % | 1 % | 0.1 | 54 |
| BSW | keine Reformen | 2 % | 0 % | 0.0 | 56 |
| BSW | mit Reformen | 1 % | 1 % | 0.2 | 54 |
| FDP | keine Reformen | 0 % | 0 % | 0.0 | 55 |
| FDP | mit Reformen | 0 % | 1 % | 0.2 | 54 |

## Schwierigkeitsanzeige (F06)
Gemessen an der besten Wahlkampf-Strategie je Partei (Haushalt unverändert), Grenzen aus `config.schwierigkeit`, eingetragen in `src/data/parteien.js`.

| Partei | Siege | gemessen | eingetragen | Abgleich |
|---|---|---|---|---|
| CDU/CSU | 68.0 % | leicht | leicht | passt |
| AfD | 0.0 % | fast unmöglich | fast unmöglich | passt |
| SPD | 22.0 % | mittel | mittel | passt |
| Grüne | 7.0 % | schwer | schwer | passt |
| Linke | 0.5 % | fast unmöglich | fast unmöglich | passt |
| BSW | 1.5 % | schwer | schwer | passt |
| FDP | 1.5 % | schwer | fast unmöglich | **anpassen** |

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
| `reformen.druckAnstiegJeQuartal` | 1 | F13 |
| `reformen.druckMax` | 100 | F13 |
| `reformen.druckSchwelle` | 70 | F13 |
| `reformen.verlustJeQuartal` | 0.1 | F13 |
| `reformen.gewinnJeDruckpunkt` | 0.01 | F13 |
| `ereignisse.chanceJeQuartal` | 0.3 | F14 |
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

Änderungen an diesen Werten nur nach Entscheidung des Nutzers.
