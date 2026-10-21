// Alle Balancing-Zahlen des Spiels. Jeder Wert mit Kommentar: Herkunft (Quelle oder Freigabe in SPEC.md).
export const config = {
  // Bundestagswahl 2025: 630 Sitze laut Bundeswahlleiterin (bund-99.html), freigegeben 2026-10-20
  sitzeBundestag: 630,
  // Sperrklausel in Prozent der Zweitstimmen, freigegeben 2026-10-20
  sperrklauselProzent: 5,
  // Legislaturperiode in Jahren, freigegeben 2026-10-20
  legislaturJahre: 4,

  // Wahlkampf, alle Werte in Prozentpunkten, freigegeben 2026-10-20 (M5)
  wahlkampf: {
    wochen: 8, // eine Aktion pro Woche, danach automatisch Wahl
    plakateGewinn: 0.4, // sicher
    kundgebungMin: -0.5, // gleichverteilt zwischen Min und Max
    kundgebungMax: 1.5,
    angriffZielVerlust: 0.8,
    angriffEigenGewinn: 0.3, // Rest des Zielverlusts geht an die übrigen Parteien
    schwankungMax: 0.3, // jede Partei pro Woche zufällig ± bis zu diesem Wert
    // Abnehmender Ertrag (F08, freigegeben 2026-10-21): dieselbe Aktion in Folge wirkt je Wiederholung um
    // diesen Anteil schwächer, aber nie unter mindestFaktor. Andere Aktion oder neuer Wahlkampf setzt zurück.
    abnahmeJeWiederholung: 0.25,
    mindestFaktor: 0.25,
  },

  // Koalition und Kanzlerwahl, freigegeben 2026-10-20 (M6). Mehrheit = mehr als die Hälfte der Sitze (Art. 63 GG), wird berechnet.
  koalition: {
    // Chance, dass ein Partner zustimmt, nach Abstand in der Sitzordnung (parteien.js)
    chanceNachAbstand: { 1: 0.9, 2: 0.7, 3: 0.4 },
    chanceWeit: 0.15, // Abstand 4 oder mehr
    brandmauer: ['afd'], // mit diesen Parteien koaliert niemand
    abweichlerWahrscheinlichkeit: 0.02, // je Koalitionsabgeordnetem und Wahlgang
    kanzlerWahlgaenge: 2, // scheitern alle: Neuwahl
  },

  // Haushalt, freigegeben 2026-10-20 (M8). Geldbeträge in tausend Euro. Ein Haushalt pro Jahr, legislaturJahre Jahre.
  haushalt: {
    ministerSchrittProzent: 5,
    ministerMaxProzent: 20, // je Jahr gegenüber Vorjahr
    steuerSchrittProzent: 1,
    steuerMaxProzent: 5,
    // Für die Schuldenbremse zählende Kreditaufnahme 2026: 40,39 Mrd. = Obergrenze (Haushaltsausschuss, hib 622/2025)
    schuldenbremseGrenze: 40390000,
    // Verteidigungsausgaben über dieser Freigrenze zählen nicht zur Schuldenbremse. Kalibriert, damit der echte
    // Haushalt 2026 genau an der Grenze liegt (echt: 1 % BIP plus weitere Sicherheitsausgaben, hier zusammengefasst).
    verteidigungsFreigrenze: 25107174,
    // Wirkung auf die Umfrage der Partei, die das Ministerium hält, in Prozentpunkten je Mrd. Euro
    wirkungMehrausgabeProMrd: 0.02,
    wirkungKuerzungProMrd: 0.05, // Balancing 2026-10-21 (vorher 0,03): Kürzungen bei Partnern sollen die Koalition gefährden
    // Steuern wirken auf die Partei mit dem Finanzministerium
    wirkungSteuerErhoehungProMrd: 0.03,
    wirkungSteuerSenkungProMrd: 0.02,
  },

  // Schwierigkeitsanzeige auf dem Startbildschirm (F06, freigegeben 2026-10-21): Stufe ab dieser Siegquote mit der
  // besten Wahlkampf-Strategie im Balancing (seit F08), darunter „fast unmöglich“. Prüft scripts/balancing.js.
  schwierigkeit: { leicht: 0.3, mittel: 0.1, schwer: 0.01 },

  // Spielende, freigegeben 2026-10-21 (M10)
  spielende: {
    // Partner verlässt die Koalition, wenn seine Umfrage um mehr als diese Prozentpunkte unter dem Wert bei Regierungsbildung liegt
    koalitionsbruchPunkte: 1.5, // Balancing 2026-10-21 (vorher 2,0)
    warnAnteil: 0.5, // Haushalt zeigt einen Partner gelb ab diesem Anteil der Bruchgrenze (F01, freigegeben 2026-10-21)
    siegJahreKanzler: 12, // Haushaltsjahre als Kanzler, über Wahlperioden hinweg
  },
};
