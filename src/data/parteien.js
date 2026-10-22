// Startwerte: Zweitstimmen Bundestagswahl 2025 in Prozent, Quelle:
// https://www.bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/bund-99.html
// Union = CDU 22,6 + CSU 6,0. Sonstige = Rest auf 100. SSW bewusst weggelassen (freigegeben 2026-10-20).
// sitze2025: echte Sitze laut derselben Quelle (Union = CDU 164 + CSU 44), nur zum Vergleich in der Anzeige.
// sitzordnung: Platz im Plenum von links (1) nach rechts, für die Bundestag-Grafik. Spielentscheidung, keine offizielle Sitzordnung.
// Farben sind Spielfarben, nicht offiziell.
// schwierigkeit: Stufe für den Startbildschirm (F06), aus BALANCING.md vom 2026-10-22 (nach F13), gemessen an der besten
// Wahlkampf-Strategie: CDU/CSU 60,5 %, SPD 24 %, Grüne 7,5 %, BSW 1 %, FDP und Linke 0,5 %, AfD 0 %. Grenzen: config.schwierigkeit.
// BSW und FDP liegen an der 1-%-Grenze (1–2 von 200 Partien), ihre Stufe kann bei jeder Messung kippen.
export const parteien = [
  { id: 'union', name: 'CDU/CSU', farbe: '#000000', startanteil: 28.6, sitze2025: 208, sitzordnung: 6, schwierigkeit: 'leicht' },
  { id: 'afd', name: 'AfD', farbe: '#009EE0', startanteil: 20.8, sitze2025: 152, sitzordnung: 7, schwierigkeit: 'fast unmöglich' },
  { id: 'spd', name: 'SPD', farbe: '#E3000F', startanteil: 16.4, sitze2025: 120, sitzordnung: 4, schwierigkeit: 'mittel' },
  { id: 'gruene', name: 'Grüne', farbe: '#1AA037', startanteil: 11.6, sitze2025: 85, sitzordnung: 3, schwierigkeit: 'schwer' },
  { id: 'linke', name: 'Linke', farbe: '#BE3075', startanteil: 8.8, sitze2025: 64, sitzordnung: 1, schwierigkeit: 'fast unmöglich' },
  { id: 'bsw', name: 'BSW', farbe: '#7D254F', startanteil: 4.981, sitze2025: 0, sitzordnung: 2, schwierigkeit: 'schwer' },
  { id: 'fdp', name: 'FDP', farbe: '#FFED00', startanteil: 4.3, sitze2025: 0, sitzordnung: 5, schwierigkeit: 'fast unmöglich' },
  // Sammelposten, bekommt nie Sitze
  { id: 'sonstige', name: 'Sonstige', farbe: '#9E9E9E', startanteil: 4.519, sitze2025: 0, sonstige: true },
];
