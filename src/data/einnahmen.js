// Einnahmearten des Bundes (Erweiterung „drei Systeme“, System 2, freigegeben automatisch nach Empfehlung 2026-10-23).
//
// Herkunft der Startbeträge: BMF, „Steuereinnahmen 4. Vierteljahr 2024“ (Kassenstatistik, veröffentlicht 30.01.2025):
// Bundesanteile 2024 in Mrd. € – Lohnsteuer 105,79 (42,5 %), veranlagte Einkommensteuer 31,81 (42,5 %),
// Solidaritätszuschlag 12,63, nicht veranlagte Steuern vom Ertrag 17,01 (50 %), Abgeltungsteuer 8,48 (44 %),
// Körperschaftsteuer 19,88 (50 %), Steuern vom Umsatz 145,33, Bundessteuern ohne Soli 90,91.
// Diese Struktur wird auf die Steuereinnahmen des Bundeshaushalts 2026 (387,21 Mrd., data/haushalt.js) skaliert
// (Faktor 387,21 / 431,84); der Unterschied sind EU-Eigenmittel, Bundesergänzungszuweisungen u. a., anteilig verteilt.
// Geltende Sätze 2026: Spitzensteuersatz 42 %, Abgeltungsteuer 25 %, Körperschaftsteuer 15 %, Umsatzsteuer 19 %,
// Rentenbeitrag 18,6 % (BMAS), nationaler CO2-Preis 55 €/t (BEHG-Korridor 2026: 55–65 €).
// Keine Bundeseinnahme: Gewerbesteuer (Gemeinden), Erbschaftsteuer (Länder, Aufkommen 2024 geschätzt rund 10 Mrd.),
// Vermögensteuer (Länder, seit 1997 nicht erhoben). Sie sind per Bundesgesetz regelbar und wirken über Gruppen,
// Verteilung und Probleme. CO2-Preis: Erlöse fließen in den Klima- und Transformationsfonds (Sondervermögen, nicht im
// Kernhaushalt; 2025 Planansatz national 15,4 Mrd., BT-Drs. 21/1664).
//
// quelle je Art (Block 4): start = Startbetrag, satz = Startwert des Parameters, wirkung = alle Werte je Stufe und Ausgestaltung.
// Sozialversicherung: Startbetrag 0, weil die Beiträge an die Sozialkassen gehen (Spielmodell).
//
// Alles ab hier je Stufe sind Spielwerte (Größenordnung abgeschätzt, nicht amtlich):
// aufkommenJeStufe: Änderung der Bundeseinnahme in tausend € je Stufe (bei Startniveau der Wirtschaft)
// wirkungJeStufe: einmalige Wirkung bei Beschluss je Stufe auf Kennzahlen (Prozentpunkte) und Gruppen (Indexpunkte)
// ausweichenAb: ab so vielen Stufen Erhöhung gehen je weiterer Stufe ausweichen (Anteil) des Mehraufkommens verloren
// verzoegerung: Anteil des Mehr- oder Minderaufkommens, der im ersten Jahr schon wirkt
// bundesrat: Änderung braucht die Zustimmung des Bundesrats (Gemeinschafts-, Länder- und Gemeindesteuern)
// ausgestaltung: Schalter zur Differenzierung, je mit Kosten (tausend €/Jahr, negativ = Mindereinnahme) und Wirkung
// rechtsrisiko (Feature 3, Spielwerte, keine Rechtsauskunft): Chance, dass eine Klage gegen die Erhöhung einer Einnahmeart
// bzw. das Einschalten einer Ausgestaltung vor dem Bundesverfassungsgericht Erfolg hat; art siehe RECHTSARTEN.

const SKALA = 387.21 / 431.84;
const anteil = (mrd) => Math.round(mrd * SKALA * 1e6); // Mrd. 2024 → tausend € 2026

// Art des Rechtsrisikos (Feature 3). Rückwirkung kommt im Spiel nicht vor: alle Änderungen gelten erst ab dem Beschluss.
export const RECHTSARTEN = {
  eigentum: { name: 'Eingriff in das Eigentum', grundlage: 'Art. 14 GG', quelle: 'Quelle: Grundgesetz, 2026' },
  gleichheit: { name: 'Gleichbehandlung', grundlage: 'Art. 3 GG', quelle: 'Quelle: Grundgesetz, 2026' },
};

export const einnahmearten = [
  {
    id: 'einkommensteuer', name: 'Einkommensteuer', gruppe: 'Einkommen', bundesrat: true,
    erklaerung: 'Lohn- und veranlagte Einkommensteuer (Bundesanteil 42,5 %) plus Solidaritätszuschlag.',
    start: anteil(105.79 + 31.81 + 12.63),
    quelle: { start: 'Quelle: BMF-Kassenstatistik, 2024', satz: 'Spielwert', wirkung: 'Spielwert' },
    parameter: { name: 'Tarif (alle Stufen)', einheit: 'Pp', startwert: 0, schritt: 1, min: -3, max: 3, maxJeJahr: 2 },
    aufkommenJeStufe: 3000000, ausweichenAb: 2, ausweichen: 0.15, verzoegerung: 0.8,
    wirkungJeStufe: { wachstum: -0.06, gini: -0.15, gruppen: { arbeitnehmer: -3, familien: -2, unternehmen: -1 } },
    ausgestaltung: [
      { id: 'grundfreibetrag', name: 'Grundfreibetrag deutlich anheben', kosten: -6000000, wirkung: { gini: -0.3, gruppen: { geringverdiener: 6, arbeitnehmer: 2 } } },
      { id: 'familien', name: 'Kinderfreibetrag und Kindergeld erhöhen', kosten: -4000000, wirkung: { gini: -0.2, gruppen: { familien: 7 } } },
      { id: 'spitzensatz', name: 'Spitzensteuersatz +3 Pp für hohe Einkommen', kosten: 2500000, wirkung: { gini: -0.25, wachstum: -0.03, gruppen: { unternehmen: -4, geringverdiener: 2 } } },
      { id: 'mittelstandsbauch', name: 'Mittelstandsbauch abflachen', kosten: -5000000, wirkung: { wachstum: 0.04, gruppen: { arbeitnehmer: 5 } } },
    ],
  },
  {
    id: 'kapitalertrag', name: 'Kapitalertragsteuer', gruppe: 'Einkommen', bundesrat: true,
    erklaerung: 'Abgeltungsteuer und nicht veranlagte Steuern vom Ertrag (Bundesanteil 44–50 %).',
    start: anteil(17.01 + 8.48),
    quelle: { start: 'Quelle: BMF-Kassenstatistik, 2024', satz: 'Quelle: § 32d EStG, 2026', wirkung: 'Spielwert' },
    parameter: { name: 'Abgeltungsteuersatz', einheit: '%', startwert: 25, schritt: 2, min: 21, max: 35, maxJeJahr: 2 },
    aufkommenJeStufe: 900000, ausweichenAb: 1, ausweichen: 0.25, verzoegerung: 0.9,
    wirkungJeStufe: { wachstum: -0.02, gini: -0.1, gruppen: { unternehmen: -2, rentner: -1 } },
    ausgestaltung: [
      { id: 'sparerfreibetrag', name: 'Sparerfreibetrag verdoppeln', kosten: -800000, wirkung: { gruppen: { rentner: 3, arbeitnehmer: 1 } } },
    ],
  },
  {
    id: 'koerperschaft', name: 'Körperschaftsteuer', gruppe: 'Unternehmen', bundesrat: true,
    erklaerung: 'Steuer auf Gewinne von Kapitalgesellschaften (Bundesanteil 50 %).',
    start: anteil(19.88),
    quelle: { start: 'Quelle: BMF-Kassenstatistik, 2024', satz: 'Quelle: § 23 KStG, 2026', wirkung: 'Spielwert' },
    parameter: { name: 'Körperschaftsteuersatz', einheit: '%', startwert: 15, schritt: 1, min: 10, max: 20, maxJeJahr: 2 },
    aufkommenJeStufe: 1200000, ausweichenAb: 1, ausweichen: 0.2, verzoegerung: 0.7,
    wirkungJeStufe: { wachstum: -0.07, gini: -0.05, gruppen: { unternehmen: -5, arbeitnehmer: 1 } },
    ausgestaltung: [
      { id: 'forschung', name: 'Steuerbonus für Forschung', kosten: -1500000, wirkung: { wachstum: 0.05, gruppen: { unternehmen: 3 } } },
      { id: 'mittelstand', name: 'Entlastung für Mittelstand und Handwerk', kosten: -1200000, wirkung: { wachstum: 0.02, gruppen: { unternehmen: 3 } }, rechtsrisiko: { art: 'gleichheit', chance: 0.1, quelle: 'Spielwert' } },
    ],
  },
  {
    id: 'umsatz', name: 'Umsatzsteuer', gruppe: 'Konsum', bundesrat: true,
    erklaerung: 'Mehrwert- und Einfuhrumsatzsteuer (Bundesanteil rund 48 %).',
    start: anteil(145.33),
    quelle: { start: 'Quelle: BMF-Kassenstatistik, 2024', satz: 'Quelle: § 12 UStG, 2026', wirkung: 'Spielwert' },
    parameter: { name: 'Regelsatz', einheit: '%', startwert: 19, schritt: 1, min: 16, max: 22, maxJeJahr: 1 },
    aufkommenJeStufe: 7000000, ausweichenAb: 3, ausweichen: 0.05, verzoegerung: 1,
    wirkungJeStufe: { wachstum: -0.08, inflation: 0.35, gini: 0.12, gruppen: { geringverdiener: -4, familien: -3, rentner: -2 } },
    ausgestaltung: [
      { id: 'lebensmittel', name: 'Lebensmittel von der Umsatzsteuer befreien', kosten: -5500000, wirkung: { inflation: -0.3, gini: -0.2, gruppen: { geringverdiener: 6, familien: 4, landwirtschaft: 2 } } },
      { id: 'gastronomie', name: 'Ermäßigter Satz für Gastronomie', kosten: -1800000, wirkung: { gruppen: { unternehmen: 2 } }, rechtsrisiko: { art: 'gleichheit', chance: 0.1, quelle: 'Spielwert' } },
    ],
  },
  {
    id: 'gewerbe', name: 'Gewerbesteuer', gruppe: 'Unternehmen', bundesrat: true, keinBund: 'Gemeinden',
    erklaerung: 'Gemeindesteuer; der Bund regelt Bemessung und Mindesthebesatz. Wirkt auf die Kommunalfinanzen, nicht auf den Bundeshaushalt.',
    start: 0,
    quelle: { start: 'Quelle: Art. 106 GG, 2026', satz: 'Quelle: § 11 GewStG, 2026', wirkung: 'Spielwert' },
    parameter: { name: 'Messzahl', einheit: '%', startwert: 3.5, schritt: 0.5, min: 2, max: 5, maxJeJahr: 1 },
    aufkommenJeStufe: 0, ausweichenAb: 2, ausweichen: 0.1, verzoegerung: 1,
    wirkungJeStufe: { wachstum: -0.04, gruppen: { unternehmen: -4 }, probleme: { kommunalfinanzen: -6 } },
    ausgestaltung: [],
  },
  {
    id: 'energie', name: 'Energie- und Verbrauchsteuern', gruppe: 'Konsum', bundesrat: false,
    erklaerung: 'Bundessteuern: Energie-, Strom-, Tabak-, Versicherung-, Kfz-Steuer u. a.',
    start: anteil(90.91),
    quelle: { start: 'Quelle: BMF-Kassenstatistik, 2024', satz: 'Spielwert', wirkung: 'Spielwert' },
    parameter: { name: 'Sätze', einheit: '%', startwert: 0, schritt: 5, min: -20, max: 20, maxJeJahr: 2 },
    aufkommenJeStufe: 3500000, ausweichenAb: 2, ausweichen: 0.1, verzoegerung: 1,
    wirkungJeStufe: { wachstum: -0.03, inflation: 0.12, gini: 0.05, gruppen: { geringverdiener: -2, landwirtschaft: -3, unternehmen: -1 }, probleme: { klimafolgen: -1 } },
    ausgestaltung: [
      { id: 'industriestrom', name: 'Stromsteuer für Industrie auf EU-Minimum', kosten: -3000000, wirkung: { wachstum: 0.05, gruppen: { unternehmen: 4 }, probleme: { rezession: -3, energiepreise: -3 } }, rechtsrisiko: { art: 'gleichheit', chance: 0.1, quelle: 'Spielwert' } },
      { id: 'agrardiesel', name: 'Agrardiesel-Rückvergütung', kosten: -450000, wirkung: { gruppen: { landwirtschaft: 6 }, probleme: { landwirtschaftsproteste: -6 } }, rechtsrisiko: { art: 'gleichheit', chance: 0.1, quelle: 'Spielwert' } },
    ],
  },
  {
    id: 'erbschaft', name: 'Erbschaft- und Schenkungsteuer', gruppe: 'Vermögen', bundesrat: true, keinBund: 'Länder',
    erklaerung: 'Ländersteuer; der Bund regelt Sätze und Freibeträge. Wirkt auf Verteilung und Länder, nicht auf den Bundeshaushalt.',
    start: 0,
    quelle: { start: 'Quelle: Art. 106 GG, 2026', satz: 'Spielwert', wirkung: 'Spielwert' },
    parameter: { name: 'Sätze', einheit: 'Stufe', startwert: 0, schritt: 1, min: -2, max: 3, maxJeJahr: 1 },
    aufkommenJeStufe: 0, ausweichenAb: 2, ausweichen: 0.2, verzoegerung: 1,
    wirkungJeStufe: { gini: -0.12, wachstum: -0.01, gruppen: { unternehmen: -2, familien: -1 }, probleme: { soziale_spaltung: -2 } },
    ausgestaltung: [
      { id: 'betriebsvermoegen', name: 'Verschonung für Betriebsvermögen streichen', kosten: 0, wirkung: { gini: -0.15, wachstum: -0.03, gruppen: { unternehmen: -6 }, probleme: { soziale_spaltung: -3 } } },
    ],
  },
  {
    id: 'vermoegen', name: 'Vermögensteuer', gruppe: 'Vermögen', bundesrat: true, keinBund: 'Länder', rechtsrisiko: { art: 'eigentum', chance: 0.35, quelle: 'Spielwert' },
    erklaerung: 'Seit 1997 nicht erhoben. Wiedereinführung als Ländersteuer per Bundesgesetz; verfassungsrechtlich heikel (Bewertung).',
    start: 0,
    quelle: { start: 'Quelle: Art. 106 GG, 2026', satz: 'Quelle: BVerfG, 2 BvL 37/91, 1995', wirkung: 'Spielwert' },
    parameter: { name: 'Satz auf große Vermögen', einheit: '%', startwert: 0, schritt: 0.5, min: 0, max: 2, maxJeJahr: 2 },
    aufkommenJeStufe: 0, ausweichenAb: 1, ausweichen: 0.3, verzoegerung: 0.5,
    wirkungJeStufe: { gini: -0.3, wachstum: -0.05, gruppen: { unternehmen: -6, geringverdiener: 2 }, probleme: { soziale_spaltung: -4, rezession: 2 } },
    ausgestaltung: [
      { id: 'vermoegensabgabe', name: 'Einmalige Vermögensabgabe an den Bund (über 10 Jahre)', kosten: 8000000, wirkung: { gini: -0.4, wachstum: -0.08, gruppen: { unternehmen: -8 }, probleme: { soziale_spaltung: -4 } }, rechtsrisiko: { art: 'eigentum', chance: 0.4, quelle: 'Spielwert' } },
    ],
  },
  {
    id: 'sozialversicherung', name: 'Sozialversicherungsbeiträge', gruppe: 'Sozialversicherung', bundesrat: false, keinBund: 'Sozialkassen',
    erklaerung: 'Beiträge fließen an die Rentenversicherung. Wirkung auf den Bund: ein höherer Beitrag senkt den nötigen Bundeszuschuss (rund 1,7 Mrd. je 0,1 Pp, Spielwert).',
    start: 0,
    quelle: { start: 'Spielwert', satz: 'Quelle: BMAS, 2026', wirkung: 'Spielwert' },
    parameter: { name: 'Rentenbeitrag', einheit: '%', startwert: 18.6, schritt: 0.1, min: 17.5, max: 20.5, maxJeJahr: 5 },
    aufkommenJeStufe: 1700000, ausweichenAb: 99, ausweichen: 0, verzoegerung: 1,
    wirkungJeStufe: { wachstum: -0.02, gruppen: { arbeitnehmer: -1, unternehmen: -1, rentner: 0.5 }, probleme: { rentenluecke: -1.5, fachkraefte: 0.5 } },
    ausgestaltung: [],
  },
  {
    id: 'co2', name: 'CO2-Bepreisung', gruppe: 'Klima', bundesrat: false, sondervermoegen: 'Klima- und Transformationsfonds',
    erklaerung: 'Nationaler CO2-Preis für Wärme und Verkehr. Erlöse sind zweckgebunden (Sondervermögen KTF) und zählen nicht zum Kernhaushalt.',
    start: 15400000,
    quelle: { start: 'Quelle: BT-Drs. 21/1664, 2025', satz: 'Quelle: BEHG, 2026', wirkung: 'Spielwert' },
    parameter: { name: 'Preis je Tonne', einheit: '€', startwert: 55, schritt: 5, min: 30, max: 120, maxJeJahr: 3 },
    aufkommenJeStufe: 1400000, ausweichenAb: 6, ausweichen: 0.1, verzoegerung: 1,
    wirkungJeStufe: { inflation: 0.08, wachstum: -0.01, gini: 0.05, gruppen: { geringverdiener: -2, landwirtschaft: -1, arbeitnehmer: -1 }, probleme: { klimafolgen: -2, energiepreise: 1.5 } },
    ausgestaltung: [
      { id: 'klimageld', name: 'Klimageld: Erlöse pro Kopf zurückzahlen', kosten: 0, wirkung: { gini: -0.3, gruppen: { geringverdiener: 6, familien: 4 } }, ktfAnteil: -0.5 },
    ],
  },
  {
    id: 'sonstige', name: 'Sonstige Einnahmen', gruppe: 'Sonstige', bundesrat: false,
    erklaerung: 'Verwaltungseinnahmen, Bundesbankgewinn, EU-Mittel, Beteiligungen (Haushalt 2026: 39,36 Mrd.). Privatisierungen wirken nur im Jahr des Verkaufs.',
    start: 39360000,
    quelle: { start: 'Quelle: Bundestag, hib-Meldung zum Haushalt 2026, 2025', satz: 'Spielwert', wirkung: 'Spielwert' },
    parameter: { name: 'Privatisierungserlöse (einmalig)', einheit: 'Mrd.', startwert: 0, schritt: 2, min: 0, max: 8, maxJeJahr: 4, einmalig: true },
    aufkommenJeStufe: 2000000, ausweichenAb: 99, ausweichen: 0, verzoegerung: 1,
    wirkungJeStufe: { gruppen: { arbeitnehmer: -1 } },
    ausgestaltung: [],
  },
];
