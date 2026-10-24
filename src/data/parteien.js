// Startwerte: Zweitstimmen Bundestagswahl 2025 in Prozent, Quelle:
// https://www.bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/bund-99.html
// Union = CDU 22,6 + CSU 6,0. Sonstige = Rest auf 100. SSW bewusst weggelassen (freigegeben 2026-10-20).
// sitze2025: echte Sitze laut derselben Quelle (Union = CDU 164 + CSU 44), nur zum Vergleich in der Anzeige.
// sitzordnung: Platz im Plenum von links (1) nach rechts, für die Bundestag-Grafik. Spielentscheidung, keine offizielle Sitzordnung.
// Farben sind Spielfarben, nicht offiziell.
// schwierigkeit: Stufe für den Startbildschirm (F06), aus BALANCING.md vom 2026-10-24 (nach den drei Systemen), gemessen an der besten
// Wahlkampf-Strategie: CDU/CSU 54 %, SPD 20 %, Grüne 4,5 %, FDP 0,5 %, BSW, Linke und AfD 0 %. Grenzen: config.schwierigkeit.
// BSW und FDP liegen an der 1-%-Grenze (1–2 von 200 Partien), ihre Stufe kann bei jeder Messung kippen.
// ches: Parteipositionen aus dem Chapel Hill Expert Survey 2024 (Rovny u. a. 2025, CHES_2024_final_v2.csv, chesdata.eu,
// abgerufen 2026-10-23), gerundet: lrecon 0–10 (links→rechts), galtan 0–10 (progressiv→traditionell), eu 1–7 (gegen→für EU),
// umwelt 0–10 (für→gegen Umweltschutz Vorrang). CDU/CSU: Mittel aus CDU und CSU, gewichtet nach Sitzen 2025 (164 : 44).
// Umrechnung auf die Spielachsen in engine/profil.js.
export const parteien = [
  { id: 'union', name: 'CDU/CSU', farbe: '#000000', startanteil: 28.6, sitze2025: 208, sitzordnung: 6, schwierigkeit: 'leicht', ches: { lrecon: 6.62, galtan: 6.76, eu: 6.23, umwelt: 5.93 } },
  { id: 'afd', name: 'AfD', farbe: '#009EE0', startanteil: 20.8, sitze2025: 152, sitzordnung: 7, schwierigkeit: 'fast unmöglich', ches: { lrecon: 7.63, galtan: 9.39, eu: 1.89, umwelt: 9.0 } },
  { id: 'spd', name: 'SPD', farbe: '#E3000F', startanteil: 16.4, sitze2025: 120, sitzordnung: 4, schwierigkeit: 'mittel', ches: { lrecon: 3.47, galtan: 3.61, eu: 6.37, umwelt: 3.4 } },
  { id: 'gruene', name: 'Grüne', farbe: '#1AA037', startanteil: 11.6, sitze2025: 85, sitzordnung: 3, schwierigkeit: 'schwer', ches: { lrecon: 3.37, galtan: 1.61, eu: 6.79, umwelt: 0.9 } },
  { id: 'linke', name: 'Linke', farbe: '#BE3075', startanteil: 8.8, sitze2025: 64, sitzordnung: 1, schwierigkeit: 'fast unmöglich', ches: { lrecon: 1.37, galtan: 2.29, eu: 3.72, umwelt: 2.11 } },
  { id: 'bsw', name: 'BSW', farbe: '#7D254F', startanteil: 4.981, sitze2025: 0, sitzordnung: 2, schwierigkeit: 'fast unmöglich', ches: { lrecon: 2.78, galtan: 7.06, eu: 2.42, umwelt: 7.22 } },
  { id: 'fdp', name: 'FDP', farbe: '#FFED00', startanteil: 4.3, sitze2025: 0, sitzordnung: 5, schwierigkeit: 'fast unmöglich', ches: { lrecon: 7.58, galtan: 3.22, eu: 5.84, umwelt: 6.7 } },
  // Sammelposten, bekommt nie Sitze
  { id: 'sonstige', name: 'Sonstige', farbe: '#9E9E9E', startanteil: 4.519, sitze2025: 0, sonstige: true },
];
