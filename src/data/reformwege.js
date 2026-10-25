// Reformwege mit politischer Ausrichtung (System 1, freigegeben automatisch nach Empfehlung 2026-10-24). Spielwerte.
// Jede Ausrichtung bekommt realistische Vor- und Nachteile; keine Wertung einzelner Parteien.
// quelle: Herkunft der Werte des Eintrags, „Quelle: <Name, Jahr>“ oder „Spielwert“ (Block 4).
//
// Weg-Felder:
//   richtung: Schlüssel aus AUSRICHTUNGEN (Name und Achsenprofil); vektor: Abweichungen davon je Achse
//   kosten: laufend in tausend €/Jahr ab Beschluss (negativ = Einsparung); einnahmen: { einnahmeartId: tausend €/Jahr }
//   kurz: Wirkung beim Beschluss (Kennzahlen im Jahresschritt, Gruppen und Probleme sofort)
//   lang: Wirkung bei erfolgreicher Umsetzung: einmalig (Kennzahlen, Gruppen, probleme) und dauerhaft trend { problemId: je Quartal geeicht, wirkt je Monat mit config.zeit.anteilJeMonat }
//   dauer: Monate bis zur Umsetzung (seit 2026-10-25; früher Quartale, ×3); risiko: Chance des Scheiterns bei der Umsetzung; kapital: politisches Kapital
//   bundesrat: Zustimmungsgesetz; verfassung: verfassungsrechtlich umstritten (zusätzliches Risiko in Karlsruhe)
//   haushalt: braucht Spielraum in der Schuldenbremse in Höhe der Kosten; braucht: Folgeweg, nur nach diesem Weg
// Gewinner und Verlierer werden aus den Gruppenwirkungen abgeleitet.

export const AUSRICHTUNGEN = {
  marktliberal: { quelle: 'Spielwert', name: 'marktliberal', vektor: { wirtschaft: 1.8, gesellschaft: -0.3, oekologie: -0.5, eu: 0.8 } },
  konservativ: { quelle: 'Spielwert', name: 'konservativ', vektor: { wirtschaft: 0.8, gesellschaft: 1.2, oekologie: -0.3, eu: 0.5 } },
  sozialdemokratisch: { quelle: 'Spielwert', name: 'sozialdemokratisch', vektor: { wirtschaft: -1.2, gesellschaft: -0.5, oekologie: 0.3, eu: 1 } },
  gruen: { quelle: 'Spielwert', name: 'grün-ökologisch', vektor: { wirtschaft: -0.6, gesellschaft: -1.3, oekologie: 2, eu: 1.3 } },
  links: { quelle: 'Spielwert', name: 'links-sozialistisch', vektor: { wirtschaft: -2, gesellschaft: -1, oekologie: 0.6, eu: -0.3 } },
  national: { quelle: 'Spielwert', name: 'national-konservativ', vektor: { wirtschaft: 0.4, gesellschaft: 1.9, oekologie: -1.5, eu: -1.8 } },
  pragmatisch: { quelle: 'Spielwert', name: 'technokratisch-pragmatisch', vektor: { wirtschaft: 0.2, gesellschaft: 0, oekologie: 0.2, eu: 0.5 } },
};

// Akteure, die auf Reformwege reagieren: Haltung aus der Nähe ihres Profils zum Weg. gruppe: wessen Stimmung sie mitziehen.
export const akteure = [
  { id: 'gewerkschaften', quelle: 'Spielwert', name: 'Gewerkschaften', vektor: { wirtschaft: -1.5, gesellschaft: -0.5 }, gruppe: 'arbeitnehmer' },
  { id: 'wirtschaftsverbaende', quelle: 'Spielwert', name: 'Wirtschaftsverbände', vektor: { wirtschaft: 1.6, eu: 0.8 }, gruppe: 'unternehmen' },
  { id: 'sozialverbaende', quelle: 'Spielwert', name: 'Sozialverbände', vektor: { wirtschaft: -1.6, gesellschaft: -0.6 }, gruppe: 'geringverdiener' },
  { id: 'umweltverbaende', quelle: 'Spielwert', name: 'Umweltverbände', vektor: { oekologie: 2, eu: 0.8 }, gruppe: null },
  { id: 'bauernverband', quelle: 'Spielwert', name: 'Bauernverband', vektor: { oekologie: -1, gesellschaft: 1 }, gruppe: 'landwirtschaft' },
  { id: 'eu', quelle: 'Spielwert', name: 'EU-Kommission', vektor: { eu: 2, oekologie: 0.8 }, gruppe: null },
];

export const bereiche = [
  {
    id: 'rente', quelle: 'Spielwert', name: 'Rente', ministerium: 'arbeit', probleme: ['rentenluecke', 'demografie'],
    wege: [
      { id: 'r_kapital', quelle: 'Spielwert', name: 'Aktienrente (Kapitaldeckung)', richtung: 'marktliberal', text: 'Ein Staatsfonds legt am Kapitalmarkt an; ein Teil der Beiträge fließt in persönliche Depots.', kosten: 3000000, kurz: { gruppen: { unternehmen: 2, rentner: -1 } }, lang: { probleme: { rentenluecke: -10 }, trend: { rentenluecke: -0.25 }, wachstum: 0.05 }, dauer: 18, risiko: 0.15, kapital: 15 },
      { id: 'r_umlage', quelle: 'Spielwert', name: 'Umlage stärken, Rentenniveau garantieren', richtung: 'sozialdemokratisch', text: 'Haltelinie für das Rentenniveau, finanziert über Beiträge und Bundeszuschuss.', kosten: 8000000, kurz: { gruppen: { rentner: 5, arbeitnehmer: -2 } }, lang: { probleme: { rentenluecke: -12 }, trend: { rentenluecke: 0.1 } }, dauer: 9, risiko: 0.1, kapital: 10, haushalt: true },
      { id: 'r_buerger', quelle: 'Spielwert', name: 'Bürgerversicherung Rente', richtung: 'links', text: 'Alle zahlen ein, auch Beamte, Selbstständige und Abgeordnete.', kosten: -2000000, kurz: { gruppen: { unternehmen: -3, geringverdiener: 3 } }, lang: { probleme: { rentenluecke: -15, soziale_spaltung: -5 }, trend: { rentenluecke: -0.15 }, gini: -0.2 }, dauer: 24, risiko: 0.25, kapital: 18, bundesrat: true, verfassung: true },
      { id: 'r_eintritt', quelle: 'Spielwert', name: 'Renteneintritt an Lebenserwartung koppeln', richtung: 'konservativ', vektor: { gesellschaft: 0.5 }, text: 'Das Rentenalter steigt mit der Lebenserwartung, Ausnahmen für harte Berufe.', kosten: -4000000, kurz: { gruppen: { arbeitnehmer: -4, rentner: -1, unternehmen: 2 } }, lang: { probleme: { rentenluecke: -15, fachkraefte: -4 }, trend: { rentenluecke: -0.2 } }, dauer: 12, risiko: 0.15, kapital: 20 },
      { id: 'r_generationenkapital', quelle: 'Spielwert', name: 'Generationenkapital ausbauen', richtung: 'marktliberal', braucht: 'r_kapital', text: 'Fonds wird zur zweiten Säule für alle, mit Opt-out.', kosten: 4000000, kurz: { gruppen: { arbeitnehmer: 1 } }, lang: { probleme: { rentenluecke: -10 }, trend: { rentenluecke: -0.2 }, wachstum: 0.05 }, dauer: 18, risiko: 0.15, kapital: 10 },
      { id: 'r_mindestrente', quelle: 'Spielwert', name: 'Mindestrente gegen Altersarmut', richtung: 'sozialdemokratisch', braucht: 'r_umlage', text: 'Wer lange gearbeitet hat, bekommt deutlich mehr als die Grundsicherung.', kosten: 4000000, kurz: { gruppen: { rentner: 4, geringverdiener: 3 } }, lang: { probleme: { soziale_spaltung: -6 }, gini: -0.2 }, dauer: 9, risiko: 0.1, kapital: 8, haushalt: true },
    ],
  },
  {
    id: 'steuern', quelle: 'Spielwert', name: 'Steuern', ministerium: 'finanzen', probleme: ['soziale_spaltung', 'rezession'],
    wege: [
      { id: 'st_einfach', quelle: 'Spielwert', name: 'Einfaches Steuerrecht mit Stufentarif', richtung: 'marktliberal', text: 'Wenige Stufen, weniger Ausnahmen, niedrigere Sätze.', kosten: 0, einnahmen: { einkommensteuer: -12000000 }, kurz: { wachstum: 0.15, gini: 0.3, gruppen: { unternehmen: 4, arbeitnehmer: 2, geringverdiener: -1 } }, lang: { trend: { rezession: -0.15, soziale_spaltung: 0.1 } }, dauer: 12, risiko: 0.1, kapital: 14, bundesrat: true },
      { id: 'st_mitte', quelle: 'Spielwert', name: 'Mitte entlasten, Spitze belasten', richtung: 'sozialdemokratisch', text: 'Höherer Grundfreibetrag, höherer Spitzensatz für sehr hohe Einkommen.', kosten: 0, einnahmen: { einkommensteuer: -2000000 }, kurz: { gini: -0.3, gruppen: { arbeitnehmer: 3, geringverdiener: 2, unternehmen: -2 } }, lang: { trend: { soziale_spaltung: -0.1 } }, dauer: 9, risiko: 0.1, kapital: 10, bundesrat: true },
      { id: 'st_oeko', quelle: 'Spielwert', name: 'Ökologische Steuerreform', richtung: 'gruen', text: 'Energie höher besteuern, Arbeit entsprechend entlasten.', kosten: 0, einnahmen: { energie: 6000000, einkommensteuer: -6000000 }, kurz: { inflation: 0.2, gruppen: { landwirtschaft: -3, geringverdiener: -1, arbeitnehmer: 1 } }, lang: { trend: { klimafolgen: -0.2, energiepreise: 0.1 } }, dauer: 12, risiko: 0.15, kapital: 12, bundesrat: true },
      { id: 'st_vermoegen', quelle: 'Spielwert', name: 'Vermögensteuer wieder erheben', richtung: 'links', text: 'Ein Prozent auf große Vermögen, Aufkommen an die Länder.', kosten: 0, kurz: { gini: -0.4, wachstum: -0.1, gruppen: { unternehmen: -6, geringverdiener: 2 } }, lang: { probleme: { soziale_spaltung: -10, kommunalfinanzen: -5 }, trend: { soziale_spaltung: -0.1 } }, dauer: 18, risiko: 0.2, kapital: 16, bundesrat: true, verfassung: true },
      { id: 'st_unternehmen', quelle: 'Spielwert', name: 'Unternehmensteuern senken', richtung: 'konservativ', vektor: { wirtschaft: 1.3 }, text: 'Körperschaftsteuer schrittweise auf 10 %, Abschreibungen verbessern.', kosten: 0, einnahmen: { koerperschaft: -5000000 }, kurz: { wachstum: 0.15, gini: 0.1, gruppen: { unternehmen: 5 } }, lang: { probleme: { rezession: -8 }, trend: { rezession: -0.2 } }, dauer: 9, risiko: 0.1, kapital: 12, bundesrat: true },
    ],
  },
  {
    id: 'gesundheit', quelle: 'Spielwert', name: 'Gesundheit und Pflege', ministerium: 'gesundheit', probleme: ['aerztemangel', 'pflegenotstand'],
    wege: [
      { id: 'g_buerger', quelle: 'Spielwert', name: 'Bürgerversicherung', richtung: 'sozialdemokratisch', vektor: { wirtschaft: -1.5 }, text: 'Gesetzliche und private Krankenversicherung werden zusammengeführt.', kosten: 2000000, kurz: { gruppen: { geringverdiener: 4, unternehmen: -2 } }, lang: { probleme: { aerztemangel: -8, pflegenotstand: -5 }, trend: { aerztemangel: -0.1 }, gini: -0.1 }, dauer: 24, risiko: 0.25, kapital: 16, bundesrat: true, verfassung: true },
      { id: 'g_wettbewerb', quelle: 'Spielwert', name: 'Mehr Wettbewerb und Wahltarife', richtung: 'marktliberal', text: 'Kassen dürfen Tarife gestalten, Selbstbehalte, mehr private Anbieter.', kosten: -1000000, kurz: { gruppen: { geringverdiener: -3, unternehmen: 2 } }, lang: { probleme: { aerztemangel: -6 }, trend: { aerztemangel: -0.05 }, wachstum: 0.03 }, dauer: 12, risiko: 0.15, kapital: 10 },
      { id: 'g_planung', quelle: 'Spielwert', name: 'Klinikplanung und Primärarztsystem', richtung: 'pragmatisch', text: 'Spezialisierte Kliniken, Hausarzt als Lotse, weniger Doppeluntersuchungen.', kosten: 1500000, kurz: { gruppen: { rentner: -1 } }, lang: { probleme: { aerztemangel: -12, pflegenotstand: -4 }, trend: { aerztemangel: -0.1 } }, dauer: 18, risiko: 0.2, kapital: 12, bundesrat: true },
      { id: 'g_praevention', quelle: 'Spielwert', name: 'Prävention und Gesundheitsregionen', richtung: 'gruen', text: 'Vorsorge, Gesundheitskioske, gesunde Ernährung fördern.', kosten: 1000000, kurz: { gruppen: { familien: 1 } }, lang: { probleme: { aerztemangel: -5 }, trend: { pandemie: -0.1, aerztemangel: -0.05 } }, dauer: 18, risiko: 0.15, kapital: 8 },
      { id: 'g_einheitskasse', quelle: 'Spielwert', name: 'Einheitliche Pflegevollversicherung', richtung: 'sozialdemokratisch', braucht: 'g_buerger', text: 'Pflegekosten werden voll übernommen, Eigenanteile entfallen.', kosten: 5000000, kurz: { gruppen: { rentner: 5, familien: 3 } }, lang: { probleme: { pflegenotstand: -12 } }, dauer: 12, risiko: 0.15, kapital: 10, haushalt: true },
    ],
  },
  {
    id: 'bildung', quelle: 'Spielwert', name: 'Bildung', ministerium: 'bildung', probleme: ['bildungskrise', 'fachkraefte'],
    wege: [
      { id: 'b_bund', quelle: 'Spielwert', name: 'Kooperationsverbot aufheben', richtung: 'pragmatisch', vektor: { wirtschaft: -0.5 }, text: 'Der Bund darf Schulen dauerhaft mitfinanzieren; gemeinsame Standards.', kosten: 4000000, kurz: { gruppen: { familien: 2 } }, lang: { probleme: { bildungskrise: -12 }, trend: { bildungskrise: -0.2 } }, dauer: 18, risiko: 0.2, kapital: 14, bundesrat: true, verfassung: true },
      { id: 'b_leistung', quelle: 'Spielwert', name: 'Leistung und Gymnasium stärken', richtung: 'konservativ', text: 'Mehr Leistungstests, Förderung der Besten, verbindliche Schulempfehlung.', kosten: 1000000, kurz: { gruppen: { familien: 1 } }, lang: { probleme: { bildungskrise: -8 }, trend: { soziale_spaltung: 0.05 } }, dauer: 12, risiko: 0.15, kapital: 8 },
      { id: 'b_ganztag', quelle: 'Spielwert', name: 'Gemeinschaftsschule und Ganztag', richtung: 'gruen', vektor: { oekologie: 0.3 }, text: 'Längeres gemeinsames Lernen, Ganztag für alle, kleinere Klassen.', kosten: 5000000, kurz: { gruppen: { familien: 3 } }, lang: { probleme: { bildungskrise: -10 }, trend: { soziale_spaltung: -0.15, bildungskrise: -0.1 } }, dauer: 24, risiko: 0.25, kapital: 12, bundesrat: true, haushalt: true },
      { id: 'b_digital', quelle: 'Spielwert', name: 'Digitalpakt und KI in Schulen', richtung: 'marktliberal', vektor: { wirtschaft: 0.8 }, text: 'Geräte, Lernplattformen und Fortbildung, mit privaten Anbietern.', kosten: 2000000, kurz: { gruppen: { familien: 1, unternehmen: 1 } }, lang: { probleme: { bildungskrise: -8, digitalisierung: -5 } }, dauer: 12, risiko: 0.2, kapital: 8 },
    ],
  },
  {
    id: 'arbeit', quelle: 'Spielwert', name: 'Arbeitsmarkt', ministerium: 'arbeit', probleme: ['fachkraefte', 'soziale_spaltung'],
    wege: [
      { id: 'a_flex', quelle: 'Spielwert', name: 'Arbeitsmarkt flexibilisieren', richtung: 'marktliberal', text: 'Lockerer Kündigungsschutz für Neue, Wochen- statt Tageshöchstarbeitszeit.', kosten: 0, kurz: { gini: 0.2, gruppen: { arbeitnehmer: -3, unternehmen: 4 } }, lang: { arbeitslosigkeit: -0.3, trend: { fachkraefte: -0.1, soziale_spaltung: 0.05 } }, dauer: 9, risiko: 0.15, kapital: 14 },
      { id: 'a_grundsicherung', quelle: 'Spielwert', name: 'Grundsicherung mit Fördern und Fordern', richtung: 'konservativ', text: 'Strengere Mitwirkungspflichten, Hinzuverdienst lohnt sich mehr.', kosten: -3000000, kurz: { gruppen: { geringverdiener: -3, arbeitnehmer: 1 } }, lang: { arbeitslosigkeit: -0.2 }, dauer: 9, risiko: 0.15, kapital: 10 },
      { id: 'a_mindestlohn', quelle: 'Spielwert', name: 'Mindestlohn 15 € und Tariftreue', richtung: 'sozialdemokratisch', text: 'Höherer Mindestlohn, öffentliche Aufträge nur mit Tarif.', kosten: 300000, kurz: { gini: -0.3, gruppen: { geringverdiener: 5, unternehmen: -3 } }, lang: { probleme: { soziale_spaltung: -8 } }, dauer: 6, risiko: 0.1, kapital: 10 },
      { id: 'a_jobgarantie', quelle: 'Spielwert', name: 'Öffentliche Beschäftigung', richtung: 'links', text: 'Staatlich finanzierte Stellen für Langzeitarbeitslose in Kommunen.', kosten: 6000000, kurz: { gruppen: { geringverdiener: 4, unternehmen: -2 } }, lang: { arbeitslosigkeit: -0.5, probleme: { soziale_spaltung: -6, kommunalfinanzen: -4 } }, dauer: 12, risiko: 0.2, kapital: 12, haushalt: true },
      { id: 'a_einwanderung', quelle: 'Spielwert', name: 'Punktesystem für Fachkräfte', richtung: 'pragmatisch', vektor: { gesellschaft: -0.5, eu: 0.8 }, text: 'Einwanderung nach Qualifikation, Sprache und Bedarf.', kosten: 500000, kurz: { gruppen: { unternehmen: 3 } }, lang: { probleme: { fachkraefte: -12, migration: 3 }, trend: { fachkraefte: -0.15 } }, dauer: 12, risiko: 0.15, kapital: 12 },
    ],
  },
  {
    id: 'energie', quelle: 'Spielwert', name: 'Energie und Klima', ministerium: 'wirtschaft', probleme: ['energiepreise', 'klimafolgen'],
    wege: [
      { id: 'e_markt', quelle: 'Spielwert', name: 'Technologieoffenheit und Emissionshandel', richtung: 'marktliberal', text: 'Der CO2-Preis steuert, Förderprogramme laufen aus, keine Verbote.', kosten: -1000000, kurz: { gruppen: { unternehmen: 3 } }, lang: { trend: { klimafolgen: -0.1, energiepreise: 0.05 } }, dauer: 12, risiko: 0.15, kapital: 10 },
      { id: 'e_turbo', quelle: 'Spielwert', name: 'Erneuerbare-Turbo und Kohleausstieg 2030', richtung: 'gruen', text: 'Ausbau verdoppeln, Planungsrecht beschleunigen, Kohle früher vom Netz.', kosten: 4000000, kurz: { gruppen: { unternehmen: -2 }, probleme: { energiepreise: 3 } }, lang: { probleme: { klimafolgen: -10, energiepreise: -8 }, trend: { klimafolgen: -0.25 } }, dauer: 24, risiko: 0.2, kapital: 14, haushalt: true },
      { id: 'e_staat', quelle: 'Spielwert', name: 'Staatliche Versorger und Preisdeckel', richtung: 'links', text: 'Netze und Teile der Erzeugung in öffentliche Hand, Preisobergrenzen.', kosten: 7000000, kurz: { wachstum: -0.05, gruppen: { geringverdiener: 4, unternehmen: -3 }, probleme: { energiepreise: -10 } }, lang: { probleme: { energiepreise: -10 } }, dauer: 18, risiko: 0.3, kapital: 16, haushalt: true, verfassung: true },
      { id: 'e_kern', quelle: 'Spielwert', name: 'Kernkraft prüfen, Gas sichern', richtung: 'national', vektor: { gesellschaft: 1, eu: -0.8 }, text: 'Rückbau stoppen, neue Gaskraftwerke, heimische Förderung.', kosten: 3000000, kurz: { gruppen: { unternehmen: 2 } }, lang: { probleme: { energiepreise: -8 }, trend: { energiepreise: -0.1, klimafolgen: 0.1 } }, dauer: 24, risiko: 0.4, kapital: 14 },
      { id: 'e_netze', quelle: 'Spielwert', name: 'Netze und Speicher zuerst', richtung: 'pragmatisch', text: 'Netzausbau, Speicher und flexible Kraftwerke vor weiterem Zubau.', kosten: 3000000, kurz: {}, lang: { probleme: { energiepreise: -10, klimafolgen: -5 }, trend: { energiepreise: -0.05 } }, dauer: 18, risiko: 0.15, kapital: 10 },
      { id: 'e_wasserstoff', quelle: 'Spielwert', name: 'Wasserstoffnetz und grüne Industrie', richtung: 'gruen', braucht: 'e_turbo', text: 'Kernnetz für Wasserstoff, Klimaschutzverträge für die Industrie.', kosten: 3000000, kurz: { gruppen: { unternehmen: 2 } }, lang: { probleme: { rezession: -6, klimafolgen: -6 }, trend: { klimafolgen: -0.1 } }, dauer: 24, risiko: 0.25, kapital: 10 },
      { id: 'e_smr', quelle: 'Spielwert', name: 'Kleine Reaktoren entwickeln', richtung: 'konservativ', braucht: 'e_kern', text: 'Forschung und Genehmigung modularer Reaktoren.', kosten: 2000000, kurz: {}, lang: { probleme: { energiepreise: -6 }, trend: { energiepreise: -0.05 } }, dauer: 30, risiko: 0.45, kapital: 10 },
    ],
  },
  {
    id: 'migration', quelle: 'Spielwert', name: 'Migration', ministerium: 'inneres', probleme: ['migration', 'polarisierung'],
    wege: [
      { id: 'm_steuerung', quelle: 'Spielwert', name: 'Steuerung und Begrenzung', richtung: 'konservativ', text: 'Schnellere Verfahren, sichere Herkunftsstaaten, Rückführungsabkommen.', kosten: 1000000, kurz: { gruppen: { arbeitnehmer: 1 } }, lang: { probleme: { migration: -12 }, trend: { migration: -0.1 } }, dauer: 12, risiko: 0.2, kapital: 12 },
      { id: 'm_grenze', quelle: 'Spielwert', name: 'Zurückweisungen an den Grenzen', richtung: 'national', text: 'Dauerhafte Grenzkontrollen, Zurückweisung auch von Asylsuchenden.', kosten: 1500000, kurz: { wachstum: -0.03, gruppen: { unternehmen: -2 } }, lang: { probleme: { migration: -15, fachkraefte: 3 }, trend: { migration: -0.15, polarisierung: 0.1 } }, dauer: 6, risiko: 0.35, kapital: 16, verfassung: true },
      { id: 'm_integration', quelle: 'Spielwert', name: 'Einwanderungsland gestalten', richtung: 'gruen', vektor: { oekologie: 0 }, text: 'Spurwechsel, Sprachkurse ab Tag eins, Arbeitserlaubnis sofort.', kosten: 2500000, kurz: { gruppen: { unternehmen: 2 } }, lang: { probleme: { migration: -8, fachkraefte: -6 }, trend: { migration: -0.05, fachkraefte: -0.1 } }, dauer: 18, risiko: 0.2, kapital: 12 },
      { id: 'm_eu', quelle: 'Spielwert', name: 'Europäische Asylreform umsetzen', richtung: 'pragmatisch', vektor: { eu: 1.8 }, text: 'Gemeinsame Verfahren an den Außengrenzen, Verteilung in der EU.', kosten: 800000, kurz: {}, lang: { probleme: { migration: -10 }, trend: { migration: -0.1 } }, dauer: 18, risiko: 0.25, kapital: 10 },
    ],
  },
  {
    id: 'verteidigung', quelle: 'Spielwert', name: 'Verteidigung', ministerium: 'verteidigung', probleme: ['bundeswehr', 'geopolitik'],
    wege: [
      { id: 'v_wehrpflicht', quelle: 'Spielwert', name: 'Wehrpflicht zurück', richtung: 'konservativ', vektor: { gesellschaft: 1.5 }, text: 'Allgemeine Wehrpflicht mit Ersatzdienst.', kosten: 4000000, kurz: { gruppen: { familien: -3 } }, lang: { probleme: { bundeswehr: -15 }, trend: { bundeswehr: -0.15 } }, dauer: 18, risiko: 0.2, kapital: 16, haushalt: true },
      { id: 'v_aufruestung', quelle: 'Spielwert', name: 'Verteidigungsausgaben stark erhöhen', richtung: 'konservativ', vektor: { wirtschaft: 1 }, text: 'Dauerhaft deutlich mehr Geld für Material und Personal.', kosten: 15000000, kurz: { gruppen: { arbeitnehmer: -1 } }, lang: { probleme: { bundeswehr: -18, geopolitik: -4 }, trend: { bundeswehr: -0.2 } }, dauer: 12, risiko: 0.15, kapital: 12 },
      { id: 'v_europa', quelle: 'Spielwert', name: 'Europäische Verteidigungsunion', richtung: 'pragmatisch', vektor: { eu: 2 }, text: 'Gemeinsame Beschaffung, integrierte Verbände mit EU-Partnern.', kosten: 3000000, kurz: {}, lang: { probleme: { bundeswehr: -10, geopolitik: -6 }, trend: { bundeswehr: -0.1 } }, dauer: 24, risiko: 0.25, kapital: 12 },
      { id: 'v_diplomatie', quelle: 'Spielwert', name: 'Diplomatie und Rüstungskontrolle', richtung: 'links', vektor: { gesellschaft: -0.5 }, text: 'Vorrang für Verhandlungen, Exportstopps, Abrüstungsinitiativen.', kosten: -2000000, kurz: { gruppen: { familien: 1 } }, lang: { probleme: { geopolitik: -6 }, trend: { bundeswehr: 0.2 } }, dauer: 12, risiko: 0.3, kapital: 10 },
      { id: 'v_euruestung', quelle: 'Spielwert', name: 'Gemeinsame europäische Rüstungsindustrie', richtung: 'pragmatisch', vektor: { eu: 2, wirtschaft: 0.8 }, braucht: 'v_europa', text: 'Europäische Großprojekte, gemeinsame Munitionsproduktion.', kosten: 2000000, kurz: { gruppen: { unternehmen: 2 } }, lang: { probleme: { bundeswehr: -8, rezession: -3 } }, dauer: 24, risiko: 0.2, kapital: 8 },
    ],
  },
  {
    id: 'wohnen', quelle: 'Spielwert', name: 'Wohnen', ministerium: 'bauen', probleme: ['wohnungsnot'],
    wege: [
      { id: 'w_bauen', quelle: 'Spielwert', name: 'Bauen erleichtern', richtung: 'marktliberal', text: 'Bauordnungen entschlacken, Sonderabschreibung, schnellere Genehmigung.', kosten: 1000000, kurz: { gruppen: { unternehmen: 3 } }, lang: { probleme: { wohnungsnot: -12 }, trend: { wohnungsnot: -0.15, klimafolgen: 0.03 } }, dauer: 12, risiko: 0.15, kapital: 10 },
      { id: 'w_deckel', quelle: 'Spielwert', name: 'Bundesweiter Mietendeckel', richtung: 'links', text: 'Mieten werden für fünf Jahre eingefroren.', kosten: 0, kurz: { gruppen: { geringverdiener: 5, familien: 3, unternehmen: -4 }, probleme: { wohnungsnot: -8 } }, lang: { trend: { wohnungsnot: 0.1 } }, dauer: 6, risiko: 0.35, kapital: 14, verfassung: true },
      { id: 'w_gemeinnuetzig', quelle: 'Spielwert', name: 'Neue Wohngemeinnützigkeit', richtung: 'sozialdemokratisch', text: 'Steuervorteile für Vermieter, die dauerhaft günstig vermieten.', kosten: 2000000, kurz: { gruppen: { geringverdiener: 2 } }, lang: { probleme: { wohnungsnot: -10 }, trend: { wohnungsnot: -0.1 } }, dauer: 18, risiko: 0.2, kapital: 10 },
      { id: 'w_eigentum', quelle: 'Spielwert', name: 'Wohneigentum fördern', richtung: 'konservativ', text: 'Grunderwerbsteuer-Freibetrag, Baukindergeld.', kosten: 3000000, kurz: { gruppen: { familien: 4 } }, lang: { probleme: { wohnungsnot: -6 }, trend: { wohnungsnot: -0.05 } }, dauer: 12, risiko: 0.15, kapital: 8, bundesrat: true },
      { id: 'w_bodenfonds', quelle: 'Spielwert', name: 'Bodenfonds für bezahlbares Bauland', richtung: 'sozialdemokratisch', braucht: 'w_gemeinnuetzig', text: 'Bund kauft Bauland und vergibt es in Erbpacht.', kosten: 2000000, kurz: {}, lang: { probleme: { wohnungsnot: -10 }, trend: { wohnungsnot: -0.1 } }, dauer: 24, risiko: 0.2, kapital: 8 },
    ],
  },
  {
    id: 'digital', quelle: 'Spielwert', name: 'Digitalisierung', ministerium: 'digitales', probleme: ['digitalisierung', 'cyberangriffe'],
    wege: [
      { id: 'd_staat', quelle: 'Spielwert', name: 'Digitalministerium mit Durchgriff', richtung: 'pragmatisch', text: 'Zentrales Budget, verbindliche Standards für Bund, Länder und Kommunen.', kosten: 1500000, kurz: {}, lang: { probleme: { digitalisierung: -15, vertrauensverlust: -4 }, trend: { digitalisierung: -0.15 } }, dauer: 18, risiko: 0.2, kapital: 12, bundesrat: true },
      { id: 'd_markt', quelle: 'Spielwert', name: 'Private Plattformen und Deregulierung', richtung: 'marktliberal', text: 'Staat kauft Lösungen ein, weniger eigene IT, Datenschutz entschlacken.', kosten: 500000, kurz: { gruppen: { unternehmen: 3 } }, lang: { probleme: { digitalisierung: -12 }, trend: { cyberangriffe: 0.05 }, wachstum: 0.05 }, dauer: 12, risiko: 0.2, kapital: 10 },
      { id: 'd_souveraen', quelle: 'Spielwert', name: 'Digitale Souveränität (Open Source)', richtung: 'gruen', vektor: { eu: 1.5, oekologie: 0.5 }, text: 'Eigene Cloud, offene Software, europäische Anbieter bevorzugen.', kosten: 2000000, kurz: {}, lang: { probleme: { digitalisierung: -10, cyberangriffe: -6 }, trend: { cyberangriffe: -0.1 } }, dauer: 24, risiko: 0.25, kapital: 10 },
    ],
  },
];
