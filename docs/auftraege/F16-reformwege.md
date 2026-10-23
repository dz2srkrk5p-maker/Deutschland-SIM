# F16: Reformwege mit politischer Ausrichtung

Auftrag des Nutzers vom 2026-10-23: drei große Systeme. Teil 1 sind die Reformwege. Der Auftragstext bricht bei System 2 ab („Die Einnahmenseite wird von einer Summe zu …“), System 3 fehlt ganz. Beide werden erst gebaut, wenn der Text vollständig vorliegt.

## Phase 0: Analyse des Bestands (Stand Spielstand-Version 9)
- **Haushalt** (`engine/haushalt.js`): ein Haushalt je Jahr im 4. Quartal. Ausgaben = 16 Ministeriumsetats + feste Posten + laufende Reformkosten (F13). Einnahmen = **eine** Steuersumme (±5 %/Jahr, braucht den Bundesrat) + feste sonstige Einnahmen. Schuldenbremse mit Verteidigungsausnahme. Etatänderungen wirken auf die Umfrage der Ministeriumspartei.
- **Probleme und Ereignisse**: 3 Probleme mit Druck 0–100 (`data/probleme.js`), +1 je Quartal, ab 70 je −0,1 für die Kanzlerpartei. 8 Ereignisse (`data/ereignisse.js`), 30 % je Quartal, mit Bedingung, 2–3 Möglichkeiten, Folgen auf Umfragen und Druck.
- **Politikfelder**: die 16 Ministerien. Wer eines hält, trägt Gewinne und Verluste aus Etat, Reform und Ereignis.
- **Zustimmung/Stabilität**: keine eigene Kennzahl. Zustimmung = Umfrageanteile der Parteien (`umverteilen` hält die Summe bei 100). Stabilität = Abstand der Partner zur Bruchgrenze (1,5 Punkte unter dem Startwert) und Mehrheit im Bundestag (Abstimmung nach Sitzordnungs-Abstand).
- **Runde**: Quartal. Q1–Q3: höchstens eine Reform, dann „Nächstes Quartal“ (Druck steigt, vielleicht ein Ereignis). Q4: Haushalt, danach nächstes Jahr; nach 4 Jahren Wahlkampf.
- **Speichern**: `laden()` verwirft jeden Stand mit anderer Version. Für F16 kommt deshalb erstmals eine **Migration** dazu.
- **F13-Reformen**: 3 Probleme × 2 Stufen, ein Knopf je Reform – genau das, was die Reformwege ablösen.

## Vorschlag: Einbau
- **Datenmodell**: `src/data/reformwege.js` mit 11 Bereichen (die 10 aus dem Auftrag + Verkehr, damit das bestehende Problem Bahn einen Weg hat). Jeder Bereich hat ein Problem (Druck) und ein Ministerium. Je Bereich 3–5 Grundwege und 1–2 Anschlussreformen. Ausrichtungen mit festem Profil auf 4 Achsen.
- **Zustand**: `reformwege: { bereichId: [{ id, rest }] }` (`rest` = Quartale bis zur Umsetzung, 0 = umgesetzt), `einmaligeKosten` (Revisionskosten bis zum nächsten Haushalt). Das Richtungsprofil wird aus den Wegen berechnet und nicht gespeichert. Version 10 mit Migration von Version 9.
- **Menü**: Der bestehende Hauptpunkt „Reformen“ zeigt jetzt die Bereiche. Das Richtungsprofil steht in der Lage (Dashboard). F13-Reformen kann man nicht mehr neu einbringen; schon beschlossene kosten in alten Spielständen weiter.
- **Rundenablauf**: Ein Weg wird in Q1–Q3 beschlossen und belegt dafür die Reform des Quartals. Bei jedem „Nächstes Quartal“ rückt die Umsetzung vor; am Ende wird das Scheitern ausgewürfelt, sonst greifen die langfristigen Wirkungen.

Regeln und Zahlen: `docs/SPEC.md`, Abschnitt „System: Reformwege (F16)“.
