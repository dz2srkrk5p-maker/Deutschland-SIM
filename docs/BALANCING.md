# Balancing-Bericht

Erzeugt mit `npm run balancing` am 2026-10-22. 200 Partien je Partei und Strategie (Seeds 1–200).

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
| Haushalt unverändert | CDU/CSU | 100 % | 0 % | 31 % | 6.7 |
| Haushalt unverändert | AfD | 0 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | SPD | 36 % | 0 % | 5 % | 2.3 |
| Haushalt unverändert | Grüne | 9 % | 0 % | 1 % | 0.4 |
| Haushalt unverändert | Linke | 1 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | BSW | 0 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | FDP | 2 % | 0 % | 0 % | 0.1 |
| Partner kürzen | CDU/CSU | 100 % | 33 % | 36 % | 6.8 |
| Partner kürzen | AfD | 0 % | 0 % | 0 % | 0.0 |
| Partner kürzen | SPD | 36 % | 35 % | 5 % | 2.3 |
| Partner kürzen | Grüne | 9 % | 5 % | 0 % | 0.4 |
| Partner kürzen | Linke | 1 % | 1 % | 0 % | 0.0 |
| Partner kürzen | BSW | 0 % | 0 % | 0 % | 0.0 |
| Partner kürzen | FDP | 2 % | 2 % | 0 % | 0.0 |

## Wahlkampf-Strategien (F08)
Siege in Prozent, Haushalt unverändert. „klug“: jede Woche die Aktion mit dem höchsten erwarteten eigenen Gewinn nach abnehmendem Ertrag. Fett: beste Strategie je Partei. Maßstab (freigegeben): keine „immer …“-Strategie ist bei einer Partei die beste.

| Partei | immer Plakate | immer Kundgebung | immer Angriff (Stärkster) | abwechselnd | klug |
|---|---|---|---|---|---|
| CDU/CSU | 31.0 | 36.0 | 30.5 | 57.5 | **64.5** |
| AfD | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| SPD | 5.0 | 8.5 | 11.0 | **26.5** | 18.0 |
| Grüne | 0.5 | 0.0 | 0.5 | **8.0** | 4.0 |
| Linke | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| BSW | 0.0 | 0.0 | 0.0 | **1.0** | 0.0 |
| FDP | 0.0 | 0.0 | 0.0 | 0.0 | **0.5** |

## Minderheitsregierung (F11)
Wahlkampf abwechselnd, Haushalt unverändert. „Minderheit“: Anteil der Partien mit mindestens einer Minderheitsregierung. „Gescheitert“: Zahl der Partien, die durch gescheiterte Haushalte einer Minderheitsregierung enden.

| Partei | Regierungsbildung | Minderheit | Gescheitert | Sieg |
|---|---|---|---|---|
| CDU/CSU | Minderheit nur ohne Mehrheit | 52 % | 85 | 57 % |
| CDU/CSU | Minderheit wenn möglich | 100 % | 200 | 0 % |
| AfD | Minderheit nur ohne Mehrheit | 0 % | 0 | 0 % |
| AfD | Minderheit wenn möglich | 0 % | 0 | 0 % |
| SPD | Minderheit nur ohne Mehrheit | 14 % | 28 | 27 % |
| SPD | Minderheit wenn möglich | 40 % | 79 | 1 % |
| Grüne | Minderheit nur ohne Mehrheit | 3 % | 5 | 8 % |
| Grüne | Minderheit wenn möglich | 6 % | 11 | 5 % |
| Linke | Minderheit nur ohne Mehrheit | 0 % | 0 | 0 % |
| Linke | Minderheit wenn möglich | 0 % | 0 | 0 % |
| BSW | Minderheit nur ohne Mehrheit | 0 % | 0 | 1 % |
| BSW | Minderheit wenn möglich | 0 % | 0 | 1 % |
| FDP | Minderheit nur ohne Mehrheit | 0 % | 0 | 0 % |
| FDP | Minderheit wenn möglich | 0 % | 0 | 0 % |

## Reformen (F13)
Wahlkampf abwechselnd, Minderheit nur ohne Mehrheit. „mit Reformen“: je Quartal die erste Reform mit Mehrheit, im Haushalt Etats kürzen (Partner zuerst), bis die Schuldenbremse hält. Druck: Durchschnitt der Probleme am Partieende.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø Reformen | Ø Druck am Ende |
|---|---|---|---|---|---|
| CDU/CSU | keine Reformen | 57 % | 0 % | 0.0 | 75 |
| CDU/CSU | mit Reformen | 62 % | 11 % | 4.5 | 50 |
| AfD | keine Reformen | 0 % | 0 % | 0.0 | 55 |
| AfD | mit Reformen | 0 % | 0 % | 0.0 | 55 |
| SPD | keine Reformen | 27 % | 0 % | 0.0 | 65 |
| SPD | mit Reformen | 24 % | 9 % | 2.8 | 49 |
| Grüne | keine Reformen | 8 % | 0 % | 0.0 | 59 |
| Grüne | mit Reformen | 8 % | 5 % | 1.0 | 52 |
| Linke | keine Reformen | 0 % | 0 % | 0.0 | 55 |
| Linke | mit Reformen | 0 % | 1 % | 0.1 | 54 |
| BSW | keine Reformen | 1 % | 0 % | 0.0 | 56 |
| BSW | mit Reformen | 2 % | 1 % | 0.2 | 55 |
| FDP | keine Reformen | 0 % | 0 % | 0.0 | 55 |
| FDP | mit Reformen | 1 % | 1 % | 0.2 | 54 |

## Schwierigkeitsanzeige (F06)
Gemessen an der besten Wahlkampf-Strategie je Partei (Haushalt unverändert), Grenzen aus `config.schwierigkeit`, eingetragen in `src/data/parteien.js`.

| Partei | Siege | gemessen | eingetragen | Abgleich |
|---|---|---|---|---|
| CDU/CSU | 64.5 % | leicht | leicht | passt |
| AfD | 0.0 % | fast unmöglich | fast unmöglich | passt |
| SPD | 26.5 % | mittel | mittel | passt |
| Grüne | 8.0 % | schwer | schwer | passt |
| Linke | 0.0 % | fast unmöglich | fast unmöglich | passt |
| BSW | 1.0 % | schwer | schwer | passt |
| FDP | 0.5 % | fast unmöglich | fast unmöglich | passt |

## Alle Konstanten (`src/data/config.js`)
| Name | Wert | Freigegeben in |
|---|---|---|
| `sitzeBundestag` | 630 | M1/M3 (Quelle in config.js) |
| `sperrklauselProzent` | 5 | M1/M3 (Quelle in config.js) |
| `legislaturJahre` | 4 | M1/M3 (Quelle in config.js) |
| `regierung.quartaleJeJahr` | 4 | F12 |
| `reformen.druckAnstiegJeQuartal` | 1 | F13 |
| `reformen.druckMax` | 100 | F13 |
| `reformen.druckSchwelle` | 70 | F13 |
| `reformen.verlustJeQuartal` | 0.1 | F13 |
| `reformen.gewinnJeDruckpunkt` | 0.01 | F13 |
| `ereignisse.chanceJeQuartal` | 0.3 | F14 |
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
| `haushalt.steuerSchrittProzent` | 1 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.steuerMaxProzent` | 5 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.schuldenbremseGrenze` | 40390000 | M8 (Zahlen 2026: Quelle in config.js) |
| `haushalt.verteidigungsFreigrenze` | 25107174 | M8 (Zahlen 2026: Quelle in config.js) |
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
