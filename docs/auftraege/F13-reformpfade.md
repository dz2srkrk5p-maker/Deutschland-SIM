# F13: Reformpfade

## Voraussetzungen
F10 (Abstimmung im Bundestag) und F12 (Runden) sind fertig.

## Ziel
Es gibt Probleme im Land mit einem Druckwert. Gegen jedes Problem gibt es Reformen in Stufen: Die zweite Stufe geht erst, wenn die erste beschlossen ist. Reformen kosten Geld im Haushalt, brauchen eine Mehrheit und senken den Druck. Hoher Druck kostet Umfragepunkte.

**Groß.** In mehreren Teilaufträgen umsetzen (unten), nach jedem stoppen.

## Ausgangslage
- Haushalt (`src/engine/haushalt.js`) kennt Etats je Ministerium und Steuern, keine laufenden Zusatzkosten.
- Ministerien: `src/data/ministerien.js`, Verteilung im Kabinett (`zustand.kabinett.verteilung`).
- Bundesrat: `src/engine/bundesrat.js` kennt bisher nur „Steueränderung ja/nein“.

## Vorab entscheiden (Nutzer fragen) — bevor irgendetwas gebaut wird
1. **Welche Probleme?** Vorschlag: mit 3 anfangen. Der Nutzer wählt die Themen; reale Probleme Deutschlands, keine Vorlage aus anderen Spielen.
2. **Druckwert:** Skala (z. B. 0–100), Startwerte, wie er von allein steigt, ab wann er schadet und wie viel.
3. **Reform:** Stufen je Problem (Vorschlag: 2), Kosten je Jahr (in tausend Euro wie der Haushalt), Wirkung auf den Druck, ab wann sie wirkt (sofort oder nach x Runden).
4. **Wer bringt sie ein:** nur das zuständige Ministerium? Was, wenn es der Partner hält — muss er zustimmen? (Hier liegt der Reiz für Koalitionen.)
5. **Abstimmung:** Bundestag über F10; Bundesrat nötig für welche Reformen?
6. **Wie viele gleichzeitig?** Vorschlag: eine Reform je Runde.
7. **Wirkung auf Parteien:** wer gewinnt Umfragepunkte, wenn der Druck sinkt (Kanzlerpartei, Ministeriumspartei)?
8. **Daten:** Reale Zahlen (Kosten) nur mit Quelle, sonst als Spielwert kennzeichnen.

## Teilaufträge
**F13a — Probleme und Druck:** `src/data/probleme.js`, Feld `probleme` im Zustand (Version erhöhen), Druck steigt je Runde, Wirkung auf Umfrage, Anzeige auf dem Rundenbildschirm. Tests.

**F13b — Reformen beschließen:** `src/data/reformen.js` mit Stufen und Voraussetzungen; Aktion `reformEinbringen(zustand, { reformId })` prüft Voraussetzung, Ministerium, Mehrheit (F10), ggf. Bundesrat; beschlossene Reformen im Zustand. Vorschau vor dem Klick: Kosten, Abstimmung je Fraktion, Wirkung auf den Druck. Tests.

**F13c — Haushalt verbinden:** Kosten beschlossener Reformen erscheinen im Haushalt als eigener Posten und zählen zur Schuldenbremse. `bilanz()`/`vorschau()` erweitern. Tests für die Schuldenbremse mit Reformkosten.

**F13d — Balancing:** `scripts/balancing.js` um eine Reform-Strategie erweitern, Bericht zeigen, Zahlen gemeinsam festlegen.

## Fertig, wenn
Alle Teilaufträge fertig, SPEC-Abschnitt „System: Reformen“ vollständig, Balancing-Bericht vom Nutzer gesehen.

## Nicht enthalten
Keine Stellschrauben innerhalb einer Reform, keine Gegenfinanzierungs-Auswahl, keine Gerichte und Verbände. Später möglich, aber erst nach eigenem Probespielen entscheiden.
