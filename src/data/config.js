// Alle Balancing-Zahlen des Spiels. Jeder Wert mit Kommentar: Herkunft (Quelle oder Freigabe in SPEC.md).
export const config = {
  // Bundestagswahl 2025: 630 Sitze laut Bundeswahlleiterin (bund-99.html), freigegeben 2026-10-20
  sitzeBundestag: 630,
  // Sperrklausel in Prozent der Zweitstimmen, freigegeben 2026-10-20
  sperrklauselProzent: 5,
  // Legislaturperiode in Jahren, freigegeben 2026-10-20
  legislaturJahre: 4,

  // Regierungsjahr in Runden (F12, freigegeben automatisch nach Empfehlung 2026-10-22): je Jahr so viele Quartale,
  // der Haushalt wird im letzten beschlossen.
  regierung: { quartaleJeJahr: 4 },

  // Politisches Kapital (Erweiterung „drei Systeme“, freigegeben automatisch nach Empfehlung 2026-10-23): knappe Ressource
  // für Reformwege und Problemlösungen, wächst je beendetem Quartal nach. Spielwerte.
  kapital: { start: 50, max: 100, jeQuartal: 8 },

  // Wirtschaftsdynamik je Haushaltsjahr (System 2, freigegeben automatisch nach Empfehlung 2026-10-23). Spielwerte.
  wirtschaft: {
    potenzialWachstum: 0.8, // % je Jahr, dahin kehrt das Wachstum ohne Eingriffe zurück
    zielInflation: 2.0,
    natArbeitslosigkeit: 5.5,
    giniBasis: 30,
    traegheit: 0.5, // Anteil des Vorjahreswerts bei Wachstum und Inflation
    rueckkehr: 0.2, // Anteil, um den Arbeitslosigkeit und Gini je Jahr zur Basis zurückgehen
    okun: 0.4, // Arbeitslosenquote sinkt um so viel je Prozentpunkt Wachstum über dem Potenzial
    schwankungWachstum: 0.5, // zufällig ± je Jahr
    schwankungInflation: 0.3,
    uebrigesDefizitBip: 0.6, // Defizit von Ländern, Gemeinden, Sozialversicherung in % des BIP (zählt zur Schuldenquote)
    gruppenRueckkehr: 0.15, // Gruppenzustimmung kehrt je Jahr um diesen Anteil zu 50 zurück
    // Wirkung der Lage auf die Umfrage der Kanzlerpartei je Haushaltsjahr (Punkte)
    umfrage: { wachstum: 0.15, arbeitslosigkeit: 0.3, inflationUeber: 3, inflation: 0.15, gruppen: 0.06 },
  },

  // Probleme und Reformen (F13, freigegeben automatisch nach Empfehlung 2026-10-22). Druck 0–100, Werte in Punkten.
  reformen: {
    druckAnstiegJeQuartal: 1, // jedes Problem, bei jedem beendeten Quartal (nicht im Haushaltsquartal)
    druckMax: 100,
    druckSchwelle: 70, // ab hier schadet das Problem der Kanzlerpartei
    verlustJeQuartal: 0.1, // Umfrageverlust der Kanzlerpartei je Problem über der Schwelle, je beendetem Quartal
    gewinnJeDruckpunkt: 0.01, // Umfragegewinn der Partei des zuständigen Ministeriums je gesenktem Druckpunkt
  },

  // Ereignisse (F14, freigegeben automatisch nach Empfehlung 2026-10-22): Chance je beendetem Quartal, höchstens eines;
  // dasselbe Ereignis höchstens einmal je Wahlperiode. Folgen stehen in src/data/ereignisse.js.
  ereignisse: { chanceJeQuartal: 0.3 },

  // Nachrichtenticker (F15, freigegeben automatisch nach Empfehlung 2026-10-22): reine Anzeige, Schwellen für Schlagzeilen
  ticker: {
    anzahl: 3, // höchstens so viele Schlagzeilen
    trendSchritte: 3, // Umfragetrend über so viele Verlaufsschritte
    trendPunkte: 0.5, // ab dieser Änderung in Punkten eine Schlagzeile
    huerdeAbstand: 0.5, // Partei mit so wenig Abstand zur Sperrklausel (Punkte) gilt als „zittert“
  },

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
    // Für die Schuldenbremse zählende Kreditaufnahme 2026: 40,39 Mrd. = Obergrenze (Haushaltsausschuss, hib 622/2025)
    schuldenbremseGrenze: 40390000,
    // Verteidigungsausgaben über dieser Freigrenze zählen nicht zur Schuldenbremse. Kalibriert, damit der echte
    // Haushalt 2026 genau an der Grenze liegt (echt: 1 % BIP plus weitere Sicherheitsausgaben, hier zusammengefasst).
    verteidigungsFreigrenze: 25107174,
    // System 2 (freigegeben automatisch nach Empfehlung 2026-10-23): Die Grenze wächst mit dem nominalen BIP; die
    // Konjunkturkomponente erlaubt je Prozentpunkt Wachstum unter dem Startwert 2025 (0,2 %) so viel mehr Kredit (Spielwert,
    // Größenordnung: konjunkturbedingte Bundeseinnahmen rund 1 % je Prozentpunkt). Im Start steckt sie in den 40,39 Mrd.
    konjunkturJePunkt: 4000000,
    // Wirkung auf die Umfrage der Partei, die das Ministerium hält, in Prozentpunkten je Mrd. Euro
    wirkungMehrausgabeProMrd: 0.02,
    wirkungKuerzungProMrd: 0.05, // Balancing 2026-10-21 (vorher 0,03): Kürzungen bei Partnern sollen die Koalition gefährden
    // Steuern wirken auf die Partei mit dem Finanzministerium
    wirkungSteuerErhoehungProMrd: 0.03,
    wirkungSteuerSenkungProMrd: 0.02,
  },

  // Abstimmungen im Bundestag (F10, freigegeben 2026-10-21). Koalition stimmt geschlossen Ja. Opposition nach Abstand in der
  // Sitzordnung zur nächsten Koalitionspartei. Angenommen bei mehr Ja als Nein, Enthaltungen zählen nicht
  // (Art. 42 Abs. 2 GG; Bundestag-Glossar „Mehrheit, einfache“).
  bundestag: {
    stimmeNachAbstand: { 1: 'ja', 2: 'enthaltung' },
    stimmeWeit: 'nein', // Abstand 3 oder mehr
    // Brandmauer bei Abstimmungen (F11, freigegeben 2026-10-22): Für eine Regierung mit AfD stimmt keine Fraktion; nur
    // einzelne Abgeordnete einer Nachbarfraktion (Abstand 1) weichen mit dieser Wahrscheinlichkeit je Abgeordnetem ab (0,1 %).
    brandmauerAbweichler: 0.001,
    // Abstimmungen einer Minderheitsregierung im Amt (F11, freigegeben 2026-10-22): Opposition eine Stufe strenger,
    // Abstand 1 → Enthaltung, sonst stimmeWeit. Gilt nicht für die Kanzlerwahl.
    stimmeNachAbstandMinderheit: { 1: 'enthaltung' },
  },

  // Minderheitsregierung (F11, freigegeben 2026-10-21): Scheitert ihr Haushalt im Bundestag, gilt der Vorjahreshaushalt
  // weiter (vorläufige Haushaltsführung), die Kanzlerpartei verliert Umfragepunkte; nach so vielen Fehlschlägen je
  // Wahlperiode ist die Regierung am Ende und das Spiel verloren (Opposition; Balancing 2026-10-22, vorher Neuwahl).
  minderheit: {
    umfrageVerlustHaushaltGescheitert: 0.5,
    fehlschlaegeBisSpielende: 2,
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
