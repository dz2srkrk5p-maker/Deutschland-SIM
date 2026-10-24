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

  // Reformwege (System 1, freigegeben automatisch nach Empfehlung 2026-10-24). Spielwerte; Inhalte in src/data/reformwege.js.
  reformwege: {
    // Abstimmung nach Inhalt: Abstand der Parteiposition (CHES) zum Weg, Mittel der Achsen 0–4
    jaAbstand: 0.9, // Opposition stimmt zu bis zu diesem Abstand
    enthaltungAbstand: 1.5, // darüber Nein, dazwischen Enthaltung
    vetoAbstand: 1.7, // Koalitionspartner stimmt ab diesem Abstand mit Nein
    partnerUnmutJePunkt: 0.3, // Partner verliert je Abstandspunkt über 1 so viele Umfragepunkte beim Beschluss
    akteurGruppenJeHaltung: 1.5, // Akteure ziehen „ihre“ Gruppe je Haltungspunkt mit (zur Hälfte beim Beschluss)
    beschlussBonus: 1.0, // Kanzlerpartei gewinnt beim Beschluss so viel × (1 − Abstand), wenn der Weg zu ihr passt (Block 1)
    revisionKapital: 25, // anderen Weg im selben Bereich beschließen: zusätzliches Kapital
    revisionUmfrage: 0.5, // und Glaubwürdigkeitsverlust der Kanzlerpartei
    verfassungsRisiko: 0.2, // zusätzliches Risiko, dass Karlsruhe einen umstrittenen Weg kippt
    fehlschlagUmfrage: 0.3, // gescheiterte Umsetzung: Kanzlerpartei verliert
    abgelehntKapitalAnteil: 0.5, // im Bundestag abgelehnt: so viel des Kapitals ist trotzdem verbraucht
    // Richtungsprofil je Haushaltsjahr: Wirtschaft (Wachstum, Gini), EU-Kurs, Partner und Kanzlerpartei
    profil: { wachstumJePunkt: 0.08, giniJePunkt: 0.15, euKritisch: -1, euWachstum: 0.15, partnerJePunkt: 0.15, kanzlerJePunkt: 0.1 },
  },

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

  // Problem-Engine (System 3, freigegeben automatisch nach Empfehlung 2026-10-23; ersetzt die F13-Probleme). Alle Schwellen
  // und Gewichte, Spielwerte. Inhalte (Treiber, Folgen, Lösungen je Problem) stehen in src/data/probleme.js.
  probleme: {
    stufen: [
      { id: 'ruhig', name: 'ruhig', ab: 0, folgen: 0 },
      { id: 'angespannt', name: 'angespannt', ab: 40, folgen: 0.25 },
      { id: 'ernst', name: 'ernst', ab: 60, folgen: 0.6 },
      { id: 'krise', name: 'Krise', ab: 80, folgen: 1 },
    ],
    maxAktiv: 6, // so viele Probleme ab „angespannt“ stehen prominent, der Rest auf der Beobachtungsliste
    fruehwarnungAb: 32, // Beobachtungsliste: Frühwarnung ab diesem Wert bei steigendem Trend
    umfrageJeQuartal: { ernst: 0.02, krise: 0.05 }, // Verlust der Kanzlerpartei je Quartal und prominentem Problem
    schwankung: 1, // zufällig ± je Quartal und Problem
    aktionenJeQuartal: 2, // Aufmerksamkeit: Lösungen und Reformwege zusammen je Quartal
    fehlschlagWirkung: 0.3, // gescheiterte Lösung senkt das Problem nur um diesen Anteil
    fehlschlagUmfrage: 0.2, // und kostet die Kanzlerpartei so viele Punkte
    gewinnJeWertpunkt: 0.01, // Umfragegewinn der Ministeriumspartei je gesenktem Punkt (wie F13)
    gewinnRegierungJeWertpunkt: 0.015, // dazu für die Regierung, verteilt nach Umfrageanteil der Koalitionsparteien; Balancing 2026-10-24
    passungBonus: 0.15, // Erfolgschance ± je nach Nähe der Lösung zum Richtungsprofil (System 1)
    verlaufLaenge: 16, // so viele Quartale Verlauf je Problem
  },

  // Ereignisse (F14, freigegeben automatisch nach Empfehlung 2026-10-22): Chance je beendetem Quartal, höchstens eines;
  // dasselbe Ereignis höchstens einmal je Wahlperiode. Folgen stehen in src/data/ereignisse.js.
  ereignisse: { chanceJeQuartal: 0.3 },

  // Umfrage-Bilanz (Paket Klein, Feature 1): reine Anzeige, wie viele Runden zurück die Ursachen gezeigt werden. Spielwert.
  umfrageBilanz: { runden: 8 },

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
    // Zinsaufschlag (Paket Klein, Feature 2, Spielwerte): Die Zinslast steigt um einen Aufschlag, wenn die Schuldenquote
    // über quoteAb liegt und wenn der Bund mehr als defizitAb % des BIP neu leiht (Haushaltsdisziplin). Der Aufschlag
    // nähert sich je Haushaltsjahr nur um den Anteil anpassung seinem Ziel (gedämpft), sinkt ebenso wieder, wenn die Lage
    // sich bessert (Abklingen), und ist bei max gedeckelt (keine Todesspirale). Kein Zinsmarkt.
    zinsaufschlag: { quoteAb: 70, jePunktQuote: 0.01, defizitAb: 1.5, jePunktDefizit: 0.04, max: 0.3, anpassung: 0.3 },
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

  // Vorhersehbarer Koalitionsbruch (Schwächen-Bearbeitung Block 2, freigegeben automatisch nach Empfehlung 2026-10-24). Spielwerte.
  koalitionsbruch: {
    ultimatumAnteil: 0.8, // ab diesem Anteil der Bruchgrenze stellt ein Partner ein Ultimatum
    fristQuartale: 2, // so viele Quartalsenden später wird gebrochen, wenn er dann noch über der Grenze liegt
    zugestaendnisKapital: 15, // Gegenmaßnahme Zugeständnis: kostet Kapital und ein Vorhaben, einmal je Partner und Jahr
    zugestaendnisPunkte: 0.4, // Partner gewinnt so viele Umfragepunkte
    zugestaendnisKanzler: 0.2, // Kanzlerpartei verliert so viele
  },
};

// Herkunft der Konstanten (Block 4): nur die hier genannten Werte sind belegt, alle übrigen in config sind Spielwerte.
export const quellen = {
  sitzeBundestag: 'Quelle: Bundeswahlleiterin, 2025',
  sperrklauselProzent: 'Quelle: § 6 BWahlG, 2025',
  legislaturJahre: 'Quelle: Art. 39 GG, 2025',
  'haushalt.schuldenbremseGrenze': 'Quelle: Bundestag, hib 622/2025, 2025',
};
