// Bundeshaushalt 2026 in tausend Euro, Quelle: Haushaltsgesetz 2026, Gesamtplan Teil I, Spalte „Summe Ausgaben“
// https://www.gesetze-im-internet.de/hg_2026/anlage.html (abgerufen 2026-10-20)
// Einnahmen: Beschluss Haushaltsausschuss, https://www.bundestag.de/presse/hib/kurzmeldungen-1126854

// Etat je Ministerium (IDs wie in ministerien.js), mit Einzelplan-Nummer
export const etats2026 = {
  aeusseres: 6025293, // Epl. 05
  inneres: 15761595, // Epl. 06
  justiz: 1213279, // Epl. 07
  finanzen: 10823140, // Epl. 08
  wirtschaft: 5903305, // Epl. 09
  landwirtschaft: 6993071, // Epl. 10
  arbeit: 197341040, // Epl. 11
  verkehr: 27901360, // Epl. 12
  verteidigung: 82687312, // Epl. 14
  gesundheit: 21773945, // Epl. 15
  umwelt: 2772089, // Epl. 16
  bildung: 16664014, // Epl. 17
  entwicklung: 10055733, // Epl. 23
  digitales: 1359624, // Epl. 24
  bauen: 7745681, // Epl. 25
  forschung: 21818269, // Epl. 30
};

// Im Spiel nicht veränderbar
export const festeAusgaben2026 = {
  bundesschuld: 33649367, // Epl. 32
  finanzverwaltung: 47353984, // Epl. 60 Allgemeine Finanzverwaltung
  // Epl. 01, 02, 03, 04 (Kanzleramt), 19, 20, 21, 22
  verfassungsorgane: 67388 + 1275973 + 40968 + 4998292 + 46423 + 202239 + 52154 + 14600,
};

export const steuern2026 = 387210000; // Steuereinnahmen 387,21 Mrd.
export const sonstigeEinnahmen2026 = 39360000; // sonstige Einnahmen 39,36 Mrd., im Spiel fest

// Herkunft je Wert (Block 4)
export const quellen = {
  etats2026: 'Quelle: Haushaltsgesetz 2026, 2026',
  festeAusgaben2026: 'Quelle: Haushaltsgesetz 2026, 2026',
  steuern2026: 'Quelle: Bundestag, hib-Meldung zum Haushalt 2026, 2025',
  sonstigeEinnahmen2026: 'Quelle: Bundestag, hib-Meldung zum Haushalt 2026, 2025',
};
