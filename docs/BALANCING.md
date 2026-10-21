# Balancing-Bericht

Erzeugt mit `npm run balancing` am 2026-10-21. 200 Partien je Partei und Strategie (Seeds 1–200).

## Strategien der Simulation
- Wahlkampf: jede Woche Plakate und Werbung.
- Koalition: Partner nach Zustimmungschance absteigend, bis die Mehrheit reicht; nach Absagen erneut.
- Kabinett: der vorausgefüllte Vorschlag.
- Haushalt: siehe Spalte „Strategie“. Keine Steueränderungen.
- Spiel endet bei Sieg, Opposition oder nach 2000 Zügen.

## Ergebnisse
| Strategie | Partei | Regierung gebildet | Koalitionsbruch | Sieg | Ø Jahre Kanzler |
|---|---|---|---|---|---|
| Haushalt unverändert | CDU/CSU | 70 % | 0 % | 43 % | 6.5 |
| Haushalt unverändert | AfD | 0 % | 0 % | 0 % | 0.0 |
| Haushalt unverändert | SPD | 42 % | 0 % | 19 % | 3.4 |
| Haushalt unverändert | Grüne | 11 % | 0 % | 2 % | 0.6 |
| Haushalt unverändert | Linke | 2 % | 0 % | 0 % | 0.1 |
| Haushalt unverändert | BSW | 1 % | 0 % | 1 % | 0.1 |
| Haushalt unverändert | FDP | 4 % | 0 % | 1 % | 0.2 |
| Partner kürzen | CDU/CSU | 70 % | 23 % | 43 % | 6.7 |
| Partner kürzen | AfD | 0 % | 0 % | 0 % | 0.0 |
| Partner kürzen | SPD | 42 % | 42 % | 18 % | 3.5 |
| Partner kürzen | Grüne | 11 % | 6 % | 2 % | 0.6 |
| Partner kürzen | Linke | 2 % | 1 % | 0 % | 0.1 |
| Partner kürzen | BSW | 1 % | 1 % | 0 % | 0.0 |
| Partner kürzen | FDP | 4 % | 3 % | 1 % | 0.2 |

## Schwierigkeitsanzeige (F06)
Gemessen mit „Haushalt unverändert“, Grenzen aus `config.schwierigkeit`, eingetragen in `src/data/parteien.js`.

| Partei | Siege | gemessen | eingetragen | Abgleich |
|---|---|---|---|---|
| CDU/CSU | 42.5 % | leicht | leicht | passt |
| AfD | 0.0 % | fast unmöglich | fast unmöglich | passt |
| SPD | 19.0 % | mittel | mittel | passt |
| Grüne | 2.0 % | schwer | schwer | passt |
| Linke | 0.0 % | fast unmöglich | fast unmöglich | passt |
| BSW | 0.5 % | fast unmöglich | fast unmöglich | passt |
| FDP | 0.5 % | fast unmöglich | fast unmöglich | passt |

## Alle Konstanten (`src/data/config.js`)
| Name | Wert | Freigegeben in |
|---|---|---|
| `sitzeBundestag` | 630 | M1/M3 (Quelle in config.js) |
| `sperrklauselProzent` | 5 | M1/M3 (Quelle in config.js) |
| `legislaturJahre` | 4 | M1/M3 (Quelle in config.js) |
| `wahlkampf.wochen` | 8 | M5 |
| `wahlkampf.plakateGewinn` | 0.4 | M5 |
| `wahlkampf.kundgebungMin` | -0.5 | M5 |
| `wahlkampf.kundgebungMax` | 1.5 | M5 |
| `wahlkampf.angriffZielVerlust` | 0.8 | M5 |
| `wahlkampf.angriffEigenGewinn` | 0.3 | M5 |
| `wahlkampf.schwankungMax` | 0.3 | M5 |
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
| `schwierigkeit.leicht` | 0.3 | F06 |
| `schwierigkeit.mittel` | 0.1 | F06 |
| `schwierigkeit.schwer` | 0.01 | F06 |
| `spielende.koalitionsbruchPunkte` | 1.5 | M10 |
| `spielende.warnAnteil` | 0.5 | M10 |
| `spielende.siegJahreKanzler` | 12 | M10 |

Änderungen an diesen Werten nur nach Entscheidung des Nutzers.
