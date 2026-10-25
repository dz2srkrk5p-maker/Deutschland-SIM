# Epochen-System: Analyse des Ist-Stands (Phase 1)

Stand: Branch `claude/relaxed-mayer-me7htc` (= PR #1, Spielstand-Version 21). Zum Vergleich geprüft: `master` (Spiel v1,
React-Reste, eigene Historie) und `wip/f9-regierungsbilanz`. Keiner der Branches enthält Bestände, Stufe 1–4, Monatstakt,
Titelseite, rechte Spalte oder Großprojekte. Die Spec beschreibt offenbar ein anderes Spiel bzw. eine andere Fassung.

## Technik
- Vite, reines JavaScript, **kein React** (v2). React gibt es nur im alten `master`.
- Engine und UI streng getrennt (`src/engine/` importiert keine UI, abgesichert durch `tests/architektur.test.js`).
- Zustand: ein JSON-Objekt; Aktionen `(zustand, params) => { state, ereignisse }`; Zufall nur über `src/engine/rng.js`.
- Alle Balancing-Zahlen in `src/data/config.js`, Inhalte in `src/data/*.js`, je Eintrag Feld `quelle`.

## Wo lebt was (v2)
| Bereich | Ort |
|---|---|
| Takt | **Quartale**, nicht Monate. `src/engine/regierung.js` → `quartalBeenden` (Probleme, Reformwege, Verfahren, Landtagswahlen, Koalitionsprüfung, Ereignis). Q4 = Haushalt (`haushaltBeschliessen` in `src/engine/haushalt.js`), danach Wirtschaftsjahr. Zähler `zustand.runde` (Quartale in Regierung), `zustand.haushalt.jahr` (1–4 je Wahlperiode), `statistik.jahreKanzler`. Kein Kalenderjahr; Landtagswahlen rechnen `2026 + jahreKanzler`. |
| Savegame | `src/engine/state.js` (`ZUSTAND_VERSION = 21`, `MIGRATIONEN` je Version), `src/storage/speicher.js` (localStorage). |
| Probleme | Daten `src/data/probleme.js` (25 Bereiche, je Treiber, Folgen, 1–3 Lösungen), Engine `src/engine/probleme.js` (Wert 0–100, Stufen ruhig/angespannt/ernst/Krise bei 0/40/60/80, höchstens 6 „prominent“, Rest Beobachtungsliste). **Alle 25 sind immer da**; es kommen keine neuen hinzu und keine verschwinden. Krisenketten `src/engine/krisenketten.js`. |
| Gesetze/Ansätze | Zwei Arten: **Reformwege** (`src/data/reformwege.js`: 10 Bereiche, 49 Wege, davon 7 Anschlusswege mit `braucht`; Ausrichtung je Weg aus 7 `AUSRICHTUNGEN`; Bundestagsabstimmung nach Inhalt; Umsetzung über Quartale) und **Lösungen** (in `probleme.js`, 58 Stück, ohne Abstimmung, Erfolgschance). Keine Entwurfsoptionen (z. B. Preiskopplung), keine Aufhebung eines beschlossenen Wegs außer durch Kurswechsel im selben Bereich. |
| Bestände | **existiert nicht**. Am nächsten: `zustand.land` (Wachstum, Inflation, Arbeitslosigkeit, Gini, Schuldenquote, BIP) und `zustand.gruppen` (6 Gruppen 0–100). |
| „Stufe 1–4“ | **existiert nicht**. Es gibt (a) Problemstufen ruhig…Krise und (b) eine Schwierigkeitsanzeige je Partei (leicht/mittel/schwer/fast unmöglich, nur Text). Kein Schwierigkeits- oder Komplexitätsgrad, der Regeln freischaltet. |
| Haushalt | `src/engine/haushalt.js`, `src/engine/einnahmen.js`, `src/data/einnahmen.js`, `src/data/haushalt.js`; UI `src/ui/screens/haushalt.js`. |
| Zustimmung | Umfragen `zustand.anteile` (+ `umfrageBilanz` mit Ursachen), Gruppen `zustand.gruppen`, politisches Kapital `zustand.kapital`, Partner-Verlust bis Koalitionsbruch. |
| Parteiprogramme | `src/data/parteien.js` (CHES-Werte), `src/engine/profil.js` (4 Achsen, Abstand), Ausrichtungen der Wege; Richtungsprofil des Landes = Mittel der beschlossenen Wege. |
| Spielende | Sieg nach 12 Kanzlerjahren; **Opposition = Spielende** (keine Wahl, keine Mehrheit, Minderheitsregierung gescheitert). |

## UI (v2)
| Spec | Ist |
|---|---|
| rechte Spalte | **existiert nicht**. App-Shell: Kopfzeile oben (Partei, Zeit, Umfrage, Kanzlerjahre, Kapital, Koalitionswarnung), Navigation Lage/Probleme/Reformen/Haushalt/Parlament/Chronik (`src/ui/shell.js`). |
| Reiter „Kabinett“ › Missionen | **existiert nicht**. Kabinett ist ein Unterreiter von „Parlament“ (Ressortliste). Ähnlich: Karte „Laufende Vorhaben“ (Zeitstrahl) in Lage/Reformen, Koalitionsvertrag in Lage. |
| Reiter „Zahlen“ | **existiert nicht**. Zahlen stehen in Lage (Wirtschaft-Diagramme), Haushalt › Schulden/Prognose, Chronik. |
| Reiter „Euer Land“ | **existiert nicht**. |
| Bilanz der Legislatur | **existiert nicht** in v2. Wahlabend zeigt die Wahlkampfbilanz; `wip/f9-regierungsbilanz` hat eine unfertige Regierungsbilanz. Ende-Bildschirm mit Statistik. |
| Titelseite/Zeitung | **existiert nicht**. Am nächsten: Schlagzeilen-Ticker (`src/engine/schlagzeilen.js`, `src/ui/components/ticker.js`) und Ereignis-Karte in der Lage. |
| unter dem Datum | Kopfzeile, Feld „Zeit“ (`Jahr n · Quartal q`). |

## Mapping Spec → Code
| Spec-Begriff | Im Code |
|---|---|
| Epoche | existiert nicht |
| Weiche / Weg | existiert nicht. Namensgleich, aber anders: „Reformweg“ = ein Gesetz. |
| Aufgabe, Fortschritt, Prognose | existiert nicht (ähnlich: Vorhaben des Koalitionsvertrags mit „fällig“) |
| Merkmal, Landesprofil | existiert nicht (ähnlich: Richtungsprofil des Landes aus 4 Achsen) |
| Ansatz | Reformweg und/oder Lösung (unklar, siehe Fragen) |
| Schwerpunkt-Ansätze eines Wegs | existiert nicht |
| Aufbaugesetz | existiert nicht (ähnlich: Grundweg vs. Anschlussweg `braucht`) |
| Bestand, Ausbaustufen 40/60/70/85 | existiert nicht |
| Stufe 1–4 | existiert nicht |
| Problem | `probleme` (25 feste Bereiche, Wert 0–100) |
| aktives Problem / Hintergrund | nur „prominent“ (≤ 6) vs. Beobachtungsliste; alle 25 laufen immer |
| Generation | existiert nicht |
| Ursache (Geld/Regeln/Angebot) | existiert nicht. Namensgleich, aber anders: `ursache` in der Umfrage-Bilanz (warum sich die Umfrage bewegt) und `ursachen()` in probleme.js (Treiber eines Problems). |
| Wertverlust von Geldleistungen | existiert nicht |
| Sozialbeiträge, „über Beiträge“ | Einnahmeart `sozialversicherung` (Rentenbeitrag, Aufkommen bei Sozialkassen). Kein Problem „Steigende Sozialbeiträge“ (ähnlich: `rentenluecke`). |
| Großprojekt, Meilenstein, Untersuchungsausschuss | existiert nicht (Lösung „Deutschlandtakt“ existiert als einfache Lösung) |
| Rückenwind, Hypothek | existiert nicht |
| Kurswechsel | existiert für Reformwege (Revision im selben Bereich: +25 Kapital, −0,5 Umfrage) – anderes Konzept |
| Zustimmung | Umfrage, Gruppen, Kapital (welche gemeint ist, ist offen) |
| Streitfrage | existiert nicht |
| Spaltung über 70 | Problem `soziale_spaltung` (0–100) |
| Heißzeit | existiert nicht (ähnlich: Problem `klimafolgen`) |
| Punktesystem | Reformweg `a_einwanderung`, Lösung `demografie_zuwanderung` |
| Energiesystem, Klimaanpassung | Probleme `energiepreise`, `klimafolgen`; Lösung `klima_anpassung` |
| Bevölkerung, Altersgruppen, Auswanderung | existiert nicht (nur Problem `demografie`) |
| Legislatur | Wahlperiode (4 Haushaltsjahre) |
| Entwurf | nur der Haushaltsentwurf; Reformwege haben keinen Entwurf |

## Lücken und Widersprüche
1. **Takt:** Spec rechnet in Monaten („nach drei Monaten“, „jeden Monat“); v2 in Quartalen.
2. **Opposition:** Spec lässt in der Opposition weiterspielen („die Regierung wählt“, „übernehmt ihr ein Projekt einer anderen Regierung“, „neue Regierung“); in v2 ist Opposition das Spielende.
3. **Spieldauer und Kalender:** Spec braucht Jahrzehnte (Epochen alle zehn Jahre, „bis 2060“, „gegen 2029“, Test über 30 Jahre); v2 endet mit Sieg nach 12 Kanzlerjahren und hat kein Kalenderjahr.
4. **Stufe 1–4:** gibt es nicht; die Spec schaltet aber viele Regeln danach frei (Wege 2/3, Kurswechsel, zwei Wege, Generationen, Ursachen, Wertverlust, Großprojekte, Bestände, Altersgruppen).
5. **Bestände:** fehlen ganz, ebenso Ausbaustufen und „Aufbaugesetze brauchen eine Stufe“.
6. **Problemmodell:** Spec hat kommende und gehende Probleme (bis 26 aktiv, epocheneigene Probleme, Generationen lösen ab, Hintergrund). v2 hat 25 feste, immer laufende Probleme. Bei 25 festen ist die Obergrenze 26 nie erreichbar.
7. **Gesetze:** Spec kennt Aufbaugesetze, Schwerpunkt-Ansätze, Ursachen, Geldleistungen mit Preiskopplung, Anpassungsgesetz, Aufheben durch spätere Regierungen. v2 kennt nichts davon; Wege haben nur Ausrichtung, Kosten, Wirkung.
8. **UI-Orte:** rechte Spalte, Reiter Kabinett › Missionen, „Zahlen“, „Euer Land“, Titelseite, Bilanz der Legislatur fehlen.
9. **Bevölkerung:** kein Modell (Zahl, Altersgruppen, Zu-/Auswanderung, Geburten, Erwerbsbeteiligung).
10. **„Steigende Sozialbeiträge“:** gibt es nicht als Problem.
11. **Neutralität:** Die Beispiel-Merkmale „Bürgerversicherung“ und „Wehrhafte Republik“ sind eng an Programme bestimmter Parteien angelehnt. Neutral bleibt es nur, wenn jede Epoche Wege mehrerer Richtungen anbietet.
12. **CLAUDE.md, Regel 1:** Inhalte und Zahlen brauchen Freigabe. Die Spec liefert Regeln; Inhalte und alle `TODO-BALANCE`-Werte müssen vor dem Einbau bestätigt werden.
