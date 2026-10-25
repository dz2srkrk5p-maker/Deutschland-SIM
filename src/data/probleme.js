// Problembereiche (System 3, freigegeben automatisch nach Empfehlung 2026-10-23). Alle Werte sind Spielwerte.
// quelle: Herkunft der Werte des Eintrags, „Quelle: <Name, Jahr>“ oder „Spielwert“ (Block 4).
// Startwerte grob nach der Lage 2025/26 eingeschätzt (0–100); nur wenige liegen über der Schwelle „angespannt“ (40).
//
// Felder je Problem:
//   start, trend: Startwert und Grundtrend je Quartal
//   treiber: was das Problem je Quartal verschärft (+) oder lindert (−):
//     { land: 'arbeitslosigkeit', ab, gewicht }   → gewicht × (Kennzahl − ab)
//     { problem: 'rezession', ab, gewicht }        → gewicht × (Wert − ab) / 10, nur über ab (Wechselwirkung)
//     { gruppe: 'landwirtschaft', gewicht }        → gewicht × (50 − Zustimmung) / 10
//     { etat: 'verkehr', gewicht }                 → gewicht × Kürzung gegenüber 2026 in 10-%-Schritten
//     { profil: 'oekologie', gewicht }             → gewicht × Richtungsprofil auf der Achse (System 1)
//   schock: { chance, staerke }: seltener Sprung je Quartal (Zufall mit Gewichtung)
//   folgen: Wirkung je Haushaltsjahr in voller Krise (bei „ernst“ 60 %, „angespannt“ 25 %) auf Kennzahlen und Gruppen
//   ministerium: zuständiges Ressort; seine Partei gewinnt, wenn eine Lösung wirkt
//   loesungen: { id, name, text, ausrichtung (Achsen −2…+2), kosten (tausend €/Jahr, laufend), dauer (Quartale),
//               erfolg (Chance 0–1), wirkung (Senkung des Werts bei Erfolg), kapital (politisches Kapital),
//               nebenwirkung (einmalig bei Abschluss), braucht (andere Lösung) }
//   Die Lösungen wohnen1/2, pflege1/2, schiene1/2 sind die früheren F13-Reformen (gleiche IDs und Kosten).

export const kategorien = ['Wirtschaft', 'Soziales', 'Gesundheit', 'Infrastruktur', 'Umwelt', 'Sicherheit', 'Gesellschaft', 'Staat'];

export const probleme = [
  {
    id: 'fachkraefte', quelle: 'Spielwert', name: 'Fachkräftemangel', kategorie: 'Wirtschaft', ministerium: 'arbeit', start: 52, trend: 0.15,
    text: 'Betriebe finden kein Personal, besonders in Handwerk, Pflege und IT.',
    treiber: [{ problem: 'demografie', ab: 40, gewicht: 0.25 }, { problem: 'bildungskrise', ab: 40, gewicht: 0.15 }, { land: 'arbeitslosigkeit', ab: 6, gewicht: -0.4 }],
    folgen: { wachstum: -0.4, gruppen: { unternehmen: -5 } },
    loesungen: [
      { id: 'fk_einwanderung', quelle: 'Spielwert', name: 'Fachkräfteeinwanderung erleichtern', text: 'Schnellere Anerkennung, Visa-Offensive.', ausrichtung: { gesellschaft: -1, eu: 1, wirtschaft: 0.5 }, kosten: 600000, dauer: 3, erfolg: 0.7, wirkung: 15, kapital: 12, nebenwirkung: { gruppen: { unternehmen: 3 }, probleme: { migration: 4 } } },
      { id: 'fk_ausbildung', quelle: 'Spielwert', name: 'Ausbildungsoffensive und Weiterbildung', text: 'Ausbildungsprämien, Umschulung, Meisterbonus.', ausrichtung: { wirtschaft: -0.5, gesellschaft: 0.5 }, kosten: 1500000, dauer: 6, erfolg: 0.75, wirkung: 14, kapital: 8, nebenwirkung: { gruppen: { arbeitnehmer: 3 } } },
      { id: 'fk_arbeitszeit', quelle: 'Spielwert', name: 'Anreize für mehr Arbeitsstunden', text: 'Steuerfreie Überstunden, längeres Arbeiten im Alter.', ausrichtung: { wirtschaft: 1.5 }, kosten: 1000000, dauer: 2, erfolg: 0.6, wirkung: 10, kapital: 8, nebenwirkung: { gruppen: { arbeitnehmer: -2, unternehmen: 3 } } },
    ],
  },
  {
    id: 'wohnungsnot', quelle: 'Spielwert', name: 'Wohnungsnot und Mietenkrise', kategorie: 'Soziales', ministerium: 'bauen', start: 60, trend: 0.25,
    text: 'In den Städten fehlen bezahlbare Wohnungen, Mieten steigen schneller als Einkommen.',
    treiber: [{ land: 'inflation', ab: 2, gewicht: 0.3 }, { problem: 'migration', ab: 50, gewicht: 0.15 }, { etat: 'bauen', gewicht: 0.6 }],
    folgen: { gini: 0.3, gruppen: { familien: -6, geringverdiener: -6 } },
    loesungen: [
      { id: 'wohnen1', quelle: 'Spielwert', name: 'Bauoffensive', text: 'Sozialer Wohnungsbau und schnellere Genehmigungen.', ausrichtung: { wirtschaft: -0.5 }, kosten: 2000000, dauer: 4, erfolg: 0.8, wirkung: 20, kapital: 10, nebenwirkung: { wachstum: 0.05, gruppen: { familien: 2 } } },
      { id: 'wohnen2', quelle: 'Spielwert', name: 'Bauland und Mietrecht', text: 'Bauland mobilisieren, Mietrecht nachschärfen.', ausrichtung: { wirtschaft: -1, gesellschaft: -0.5 }, kosten: 1000000, dauer: 3, erfolg: 0.7, wirkung: 15, kapital: 12, braucht: 'wohnen1', nebenwirkung: { gruppen: { geringverdiener: 3, unternehmen: -2 } } },
      { id: 'wohn_deregulierung', quelle: 'Spielwert', name: 'Bauvorschriften entrümpeln', text: 'Gebäudetyp E, weniger Auflagen, private Investitionen.', ausrichtung: { wirtschaft: 1.5, oekologie: -0.5 }, kosten: 200000, dauer: 3, erfolg: 0.65, wirkung: 14, kapital: 8, nebenwirkung: { gruppen: { unternehmen: 3 }, probleme: { klimafolgen: 1 } } },
    ],
  },
  {
    id: 'pflegenotstand', quelle: 'Spielwert', name: 'Pflegenotstand', kategorie: 'Gesundheit', ministerium: 'gesundheit', start: 55, trend: 0.2,
    text: 'Zu wenig Pflegekräfte, steigende Eigenanteile im Heim.',
    treiber: [{ problem: 'demografie', ab: 40, gewicht: 0.2 }, { problem: 'fachkraefte', ab: 50, gewicht: 0.15 }, { etat: 'gesundheit', gewicht: 0.5 }],
    folgen: { gruppen: { rentner: -6, familien: -4 } },
    loesungen: [
      { id: 'pflege1', quelle: 'Spielwert', name: 'Bessere Bezahlung in der Pflege', text: 'Tarifbindung und Zuschläge.', ausrichtung: { wirtschaft: -1 }, kosten: 3000000, dauer: 4, erfolg: 0.8, wirkung: 20, kapital: 10, nebenwirkung: { gruppen: { arbeitnehmer: 2 } } },
      { id: 'pflege2', quelle: 'Spielwert', name: 'Ausbildung und Entlastung', text: 'Pflegeassistenz, Springerpools, Bürokratieabbau.', ausrichtung: {}, kosten: 1500000, dauer: 4, erfolg: 0.75, wirkung: 15, kapital: 8, braucht: 'pflege1' },
      { id: 'pflege_markt', quelle: 'Spielwert', name: 'Private Zusatzvorsorge Pflege', text: 'Verpflichtende kapitalgedeckte Zusatzversicherung.', ausrichtung: { wirtschaft: 1.5 }, kosten: 300000, dauer: 6, erfolg: 0.6, wirkung: 12, kapital: 14, nebenwirkung: { gruppen: { geringverdiener: -3, rentner: 1 } } },
    ],
  },
  {
    id: 'rentenluecke', quelle: 'Spielwert', name: 'Rentenfinanzierungslücke', kategorie: 'Soziales', ministerium: 'arbeit', start: 45, trend: 0.1,
    text: 'Mehr Rentner, weniger Beitragszahler: Beiträge oder Zuschüsse müssen steigen.',
    treiber: [{ problem: 'demografie', ab: 40, gewicht: 0.25 }, { land: 'arbeitslosigkeit', ab: 6, gewicht: 0.4 }],
    folgen: { gruppen: { rentner: -5, arbeitnehmer: -3 } },
    loesungen: [
      { id: 'rente_zuschuss', quelle: 'Spielwert', name: 'Bundeszuschuss erhöhen', text: 'Rentenniveau und Beiträge mit Steuergeld stabilisieren.', ausrichtung: { wirtschaft: -1 }, kosten: 5000000, dauer: 1, erfolg: 0.9, wirkung: 15, kapital: 6, nebenwirkung: { gruppen: { rentner: 4 } } },
      { id: 'rente_flexi', quelle: 'Spielwert', name: 'Flexibler Renteneintritt', text: 'Anreize für längeres Arbeiten, Zuverdienst ohne Abzüge.', ausrichtung: { wirtschaft: 1, gesellschaft: 0.5 }, kosten: 500000, dauer: 3, erfolg: 0.65, wirkung: 10, kapital: 10, nebenwirkung: { gruppen: { arbeitnehmer: -1 }, probleme: { fachkraefte: -3 } } },
    ],
  },
  {
    id: 'energiepreise', quelle: 'Spielwert', name: 'Energiepreiskrise', kategorie: 'Wirtschaft', ministerium: 'wirtschaft', start: 38, trend: -0.3,
    text: 'Hohe Strom- und Gaspreise belasten Haushalte und Industrie.',
    treiber: [{ problem: 'geopolitik', ab: 40, gewicht: 0.3 }, { profil: 'oekologie', gewicht: 0.2 }],
    schock: { chance: 0.02, staerke: 25 },
    folgen: { inflation: 0.5, wachstum: -0.3, gruppen: { geringverdiener: -5, unternehmen: -5 } },
    loesungen: [
      { id: 'energie_netze', quelle: 'Spielwert', name: 'Netzentgelte senken', text: 'Bund übernimmt einen Teil der Netzkosten.', ausrichtung: { wirtschaft: -0.5 }, kosten: 6000000, dauer: 1, erfolg: 0.85, wirkung: 18, kapital: 6 },
      { id: 'energie_ausbau', quelle: 'Spielwert', name: 'Erneuerbare und Speicher beschleunigen', text: 'Ausbaupfad, Speicher, Netze.', ausrichtung: { oekologie: 1.5, eu: 0.5 }, kosten: 2500000, dauer: 8, erfolg: 0.75, wirkung: 22, kapital: 10, nebenwirkung: { probleme: { klimafolgen: -5 } } },
      { id: 'energie_angebot', quelle: 'Spielwert', name: 'Angebot ausweiten (Gas, Kraftwerke)', text: 'Neue Gaskraftwerke, heimische Förderung prüfen.', ausrichtung: { oekologie: -1.5, eu: -0.5 }, kosten: 1500000, dauer: 4, erfolg: 0.7, wirkung: 16, kapital: 10, nebenwirkung: { probleme: { klimafolgen: 4 } } },
    ],
  },
  {
    id: 'klimafolgen', quelle: 'Spielwert', name: 'Klimafolgen und Extremwetter', kategorie: 'Umwelt', ministerium: 'umwelt', start: 35, trend: 0.1,
    text: 'Hitze, Dürre und Starkregen verursachen Schäden; Klimaziele rücken außer Reichweite.',
    treiber: [{ profil: 'oekologie', gewicht: -0.25 }, { etat: 'umwelt', gewicht: 0.3 }],
    schock: { chance: 0.04, staerke: 12 },
    folgen: { wachstum: -0.2, gruppen: { landwirtschaft: -6 } },
    loesungen: [
      { id: 'klima_anpassung', quelle: 'Spielwert', name: 'Klimaanpassung finanzieren', text: 'Hochwasserschutz, Hitzeschutz, Schwammstädte.', ausrichtung: { oekologie: 0.5 }, kosten: 1500000, dauer: 6, erfolg: 0.8, wirkung: 15, kapital: 6 },
      { id: 'klima_sofort', quelle: 'Spielwert', name: 'Klimaschutz-Sofortprogramm', text: 'Verkehr und Gebäude schneller dekarbonisieren.', ausrichtung: { oekologie: 2, wirtschaft: -0.5 }, kosten: 3000000, dauer: 8, erfolg: 0.7, wirkung: 20, kapital: 14, nebenwirkung: { gruppen: { unternehmen: -2, landwirtschaft: -2 }, probleme: { energiepreise: 3 } } },
    ],
  },
  {
    id: 'infrastruktur', quelle: 'Spielwert', name: 'Marode Infrastruktur', kategorie: 'Infrastruktur', ministerium: 'verkehr', start: 50, trend: 0.25,
    text: 'Brücken, Schienen und Schulen verfallen; die Bahn ist unpünktlich.',
    treiber: [{ etat: 'verkehr', gewicht: 0.8 }, { problem: 'kommunalfinanzen', ab: 50, gewicht: 0.15 }],
    folgen: { wachstum: -0.3, gruppen: { arbeitnehmer: -3, unternehmen: -3 } },
    loesungen: [
      { id: 'schiene1', quelle: 'Spielwert', name: 'Netzsanierung', text: 'Generalsanierung der Hauptstrecken.', ausrichtung: { oekologie: 0.5 }, kosten: 4000000, dauer: 6, erfolg: 0.8, wirkung: 20, kapital: 8 },
      { id: 'schiene2', quelle: 'Spielwert', name: 'Deutschlandtakt', text: 'Abgestimmter Taktfahrplan, mehr Kapazität.', ausrichtung: { oekologie: 1 }, kosten: 2000000, dauer: 6, erfolg: 0.7, wirkung: 15, kapital: 8, braucht: 'schiene1' },
      { id: 'infra_ppp', quelle: 'Spielwert', name: 'Öffentlich-private Partnerschaften', text: 'Private Finanzierung für Autobahnen und Brücken.', ausrichtung: { wirtschaft: 1.5 }, kosten: 800000, dauer: 4, erfolg: 0.65, wirkung: 14, kapital: 10, nebenwirkung: { gruppen: { unternehmen: 3 } } },
    ],
  },
  {
    id: 'bildungskrise', quelle: 'Spielwert', name: 'Bildungskrise', kategorie: 'Gesellschaft', ministerium: 'bildung', start: 46, trend: 0.15,
    text: 'Schwache Leistungen in Schulvergleichen, Lehrermangel, sanierungsbedürftige Schulen.',
    treiber: [{ etat: 'bildung', gewicht: 0.6 }, { problem: 'soziale_spaltung', ab: 50, gewicht: 0.1 }, { problem: 'digitalisierung', ab: 50, gewicht: 0.1 }],
    folgen: { wachstum: -0.15, gruppen: { familien: -5 } },
    loesungen: [
      { id: 'bildung_startchancen', quelle: 'Spielwert', name: 'Startchancen ausbauen', text: 'Mehr Geld für Schulen in schwierigen Lagen.', ausrichtung: { wirtschaft: -1, gesellschaft: -0.5 }, kosten: 2000000, dauer: 8, erfolg: 0.75, wirkung: 18, kapital: 8, nebenwirkung: { gini: -0.1 } },
      { id: 'bildung_standards', quelle: 'Spielwert', name: 'Bundesweite Standards und Leistungsvergleich', text: 'Gemeinsame Abschlüsse, Testpflicht, Lehrerbildung.', ausrichtung: { gesellschaft: 1 }, kosten: 500000, dauer: 6, erfolg: 0.6, wirkung: 12, kapital: 12 },
    ],
  },
  {
    id: 'digitalisierung', quelle: 'Spielwert', name: 'Digitalisierungsrückstand', kategorie: 'Staat', ministerium: 'digitales', start: 45, trend: 0.1,
    text: 'Verwaltung auf Papier, Funklöcher, langsames Internet.',
    treiber: [{ etat: 'digitales', gewicht: 0.4 }],
    folgen: { wachstum: -0.15, gruppen: { unternehmen: -3 } },
    loesungen: [
      { id: 'digital_verwaltung', quelle: 'Spielwert', name: 'Digitale Verwaltung (Once-Only)', text: 'Bürgerkonto, Register vernetzen, Leistungen online.', ausrichtung: { eu: 0.5 }, kosten: 1200000, dauer: 6, erfolg: 0.65, wirkung: 18, kapital: 8, nebenwirkung: { probleme: { vertrauensverlust: -3 } } },
      { id: 'digital_netze', quelle: 'Spielwert', name: 'Glasfaser- und Mobilfunkoffensive', text: 'Förderung des Ausbaus in ländlichen Räumen.', ausrichtung: { wirtschaft: -0.5 }, kosten: 1500000, dauer: 6, erfolg: 0.8, wirkung: 14, kapital: 6, nebenwirkung: { wachstum: 0.05 } },
    ],
  },
  {
    id: 'inflation', quelle: 'Spielwert', name: 'Inflation', kategorie: 'Wirtschaft', ministerium: 'finanzen', start: 25, trend: -0.2,
    text: 'Steigende Preise zehren Einkommen und Ersparnisse auf.',
    treiber: [{ land: 'inflation', ab: 2.5, gewicht: 2.5 }, { problem: 'energiepreise', ab: 50, gewicht: 0.2 }],
    folgen: { gruppen: { geringverdiener: -6, rentner: -5 } },
    loesungen: [
      { id: 'inflation_entlastung', quelle: 'Spielwert', name: 'Entlastungspaket', text: 'Einmalzahlungen für niedrige Einkommen.', ausrichtung: { wirtschaft: -1 }, kosten: 5000000, dauer: 1, erfolg: 0.85, wirkung: 12, kapital: 4, nebenwirkung: { inflation: 0.1, gruppen: { geringverdiener: 4 } } },
      { id: 'inflation_disziplin', quelle: 'Spielwert', name: 'Ausgabendisziplin und Wettbewerb', text: 'Subventionen kürzen, Märkte öffnen.', ausrichtung: { wirtschaft: 1.5 }, kosten: -1500000, dauer: 3, erfolg: 0.6, wirkung: 12, kapital: 10, nebenwirkung: { inflation: -0.2, gruppen: { geringverdiener: -2 } } },
    ],
  },
  {
    id: 'rezession', quelle: 'Spielwert', name: 'Rezession und Industrieabwanderung', kategorie: 'Wirtschaft', ministerium: 'wirtschaft', start: 48, trend: -0.2,
    text: 'Industrie verlagert Produktion ins Ausland, Investitionen bleiben aus.',
    treiber: [{ land: 'wachstum', ab: 0.8, gewicht: -0.8 }, { problem: 'energiepreise', ab: 40, gewicht: 0.25 }, { problem: 'geopolitik', ab: 50, gewicht: 0.15 }],
    folgen: { wachstum: -0.4, arbeitslosigkeit: 0.2, gruppen: { unternehmen: -6, arbeitnehmer: -4 } },
    loesungen: [
      { id: 'rezession_investitionen', quelle: 'Spielwert', name: 'Investitionsprämie', text: 'Abschreibungen verbessern, Investitionen fördern.', ausrichtung: { wirtschaft: 1 }, kosten: 4000000, dauer: 2, erfolg: 0.75, wirkung: 16, kapital: 8, nebenwirkung: { wachstum: 0.2 } },
      { id: 'rezession_industrie', quelle: 'Spielwert', name: 'Industriestrategie und Standortgarantie', text: 'Gezielte Hilfen für Schlüsselbranchen.', ausrichtung: { wirtschaft: -1, eu: -0.5 }, kosten: 5000000, dauer: 4, erfolg: 0.65, wirkung: 18, kapital: 10, nebenwirkung: { gruppen: { arbeitnehmer: 3 } } },
      { id: 'rezession_buerokratie', quelle: 'Spielwert', name: 'Bürokratieabbau', text: 'Berichtspflichten streichen, Verfahren beschleunigen.', ausrichtung: { wirtschaft: 1.5, oekologie: -0.5 }, kosten: 100000, dauer: 4, erfolg: 0.55, wirkung: 12, kapital: 12, nebenwirkung: { gruppen: { unternehmen: 4 } } },
    ],
  },
  {
    id: 'staatsverschuldung', quelle: 'Spielwert', name: 'Staatsverschuldung', kategorie: 'Staat', ministerium: 'finanzen', start: 30, trend: 0,
    text: 'Hohe Schulden engen den Spielraum ein und treiben die Zinslast.',
    treiber: [{ land: 'schuldenquote', ab: 66, gewicht: 0.25 }, { problem: 'rezession', ab: 50, gewicht: 0.15 }],
    folgen: { wachstum: -0.1, gruppen: { unternehmen: -3 } },
    loesungen: [
      { id: 'schulden_konsolidierung', quelle: 'Spielwert', name: 'Konsolidierungsprogramm', text: 'Subventionsabbau und Ausgabenbremse.', ausrichtung: { wirtschaft: 1 }, kosten: -4000000, dauer: 4, erfolg: 0.7, wirkung: 15, kapital: 14, nebenwirkung: { wachstum: -0.1, gruppen: { arbeitnehmer: -2, geringverdiener: -3 } } },
      { id: 'schulden_steuern', quelle: 'Spielwert', name: 'Steuerschlupflöcher schließen', text: 'Steuervollzug stärken, Gestaltungen begrenzen.', ausrichtung: { wirtschaft: -1 }, kosten: -2500000, dauer: 4, erfolg: 0.65, wirkung: 12, kapital: 10, nebenwirkung: { gruppen: { unternehmen: -3 } } },
    ],
  },
  {
    id: 'cyberangriffe', quelle: 'Spielwert', name: 'Cyberangriffe', kategorie: 'Sicherheit', ministerium: 'inneres', start: 30, trend: -0.3,
    text: 'Angriffe auf Behörden, Kliniken und Unternehmen nehmen zu.',
    treiber: [{ problem: 'geopolitik', ab: 50, gewicht: 0.15 }, { problem: 'digitalisierung', ab: 50, gewicht: 0.1 }],
    schock: { chance: 0.04, staerke: 18 },
    folgen: { wachstum: -0.05, gruppen: { unternehmen: -2 } },
    loesungen: [
      { id: 'cyber_bsi', quelle: 'Spielwert', name: 'Cyberabwehr stärken', text: 'BSI als Zentralstelle, Meldepflichten.', ausrichtung: { gesellschaft: 0.5 }, kosten: 600000, dauer: 4, erfolg: 0.8, wirkung: 18, kapital: 6 },
      { id: 'cyber_eu', quelle: 'Spielwert', name: 'Europäische Cyberunion', text: 'Gemeinsame Abwehrzentren mit EU-Partnern.', ausrichtung: { eu: 1.5 }, kosten: 400000, dauer: 6, erfolg: 0.7, wirkung: 16, kapital: 8 },
    ],
  },
  {
    id: 'migration', quelle: 'Spielwert', name: 'Migration und Integrationsdruck', kategorie: 'Gesellschaft', ministerium: 'inneres', start: 50, trend: 0.05,
    text: 'Kommunen melden Überlastung bei Unterbringung, Sprachkursen und Schulen.',
    treiber: [{ problem: 'geopolitik', ab: 50, gewicht: 0.2 }, { problem: 'kommunalfinanzen', ab: 50, gewicht: 0.1 }, { profil: 'gesellschaft', gewicht: -0.15 }],
    folgen: { gruppen: { arbeitnehmer: -2, geringverdiener: -3 } },
    loesungen: [
      { id: 'migration_integration', quelle: 'Spielwert', name: 'Integrationsoffensive', text: 'Sprachkurse, Arbeitsmarktzugang, Kita-Plätze.', ausrichtung: { gesellschaft: -1, wirtschaft: -0.5 }, kosten: 2000000, dauer: 6, erfolg: 0.7, wirkung: 16, kapital: 8, nebenwirkung: { probleme: { fachkraefte: -3 } } },
      { id: 'migration_begrenzung', quelle: 'Spielwert', name: 'Zuzug begrenzen, Rückführungen beschleunigen', text: 'Grenzkontrollen, schnellere Verfahren.', ausrichtung: { gesellschaft: 1.5, eu: -1 }, kosten: 1000000, dauer: 3, erfolg: 0.6, wirkung: 16, kapital: 12, nebenwirkung: { probleme: { fachkraefte: 2 } } },
      { id: 'migration_eu', quelle: 'Spielwert', name: 'Europäische Asylreform umsetzen', text: 'GEAS umsetzen, Verteilung in der EU.', ausrichtung: { eu: 1.5 }, kosten: 500000, dauer: 6, erfolg: 0.65, wirkung: 14, kapital: 8 },
    ],
  },
  {
    id: 'soziale_spaltung', quelle: 'Spielwert', name: 'Soziale Spaltung', kategorie: 'Gesellschaft', ministerium: 'arbeit', start: 40, trend: 0,
    text: 'Abstand zwischen Arm und Reich wächst, Abstiegsängste nehmen zu.',
    treiber: [{ land: 'gini', ab: 30.5, gewicht: 0.8 }, { problem: 'rezession', ab: 50, gewicht: 0.15 }, { problem: 'wohnungsnot', ab: 60, gewicht: 0.1 }],
    folgen: { gruppen: { geringverdiener: -5 } },
    loesungen: [
      { id: 'spaltung_mindestlohn', quelle: 'Spielwert', name: 'Mindestlohn und Tarifbindung stärken', text: 'Höherer Mindestlohn, Tariftreue.', ausrichtung: { wirtschaft: -1.5 }, kosten: 200000, dauer: 2, erfolg: 0.75, wirkung: 14, kapital: 10, nebenwirkung: { gini: -0.2, gruppen: { geringverdiener: 4, unternehmen: -3 } } },
      { id: 'spaltung_aufstieg', quelle: 'Spielwert', name: 'Aufstiegs- und Bildungschancen', text: 'Bafög, Meister-Bafög, Chancenkonten.', ausrichtung: { wirtschaft: 0.5 }, kosten: 1200000, dauer: 6, erfolg: 0.7, wirkung: 12, kapital: 6, nebenwirkung: { probleme: { bildungskrise: -3 } } },
    ],
  },
  {
    id: 'polarisierung', quelle: 'Spielwert', name: 'Extremismus und Polarisierung', kategorie: 'Gesellschaft', ministerium: 'inneres', start: 50, trend: 0.05,
    text: 'Verhärtete Lager, Angriffe auf Mandatsträger, Desinformation.',
    treiber: [{ problem: 'soziale_spaltung', ab: 45, gewicht: 0.15 }, { problem: 'vertrauensverlust', ab: 50, gewicht: 0.2 }, { problem: 'migration', ab: 60, gewicht: 0.1 }],
    folgen: { gruppen: { arbeitnehmer: -2 } },
    loesungen: [
      { id: 'polar_demokratie', quelle: 'Spielwert', name: 'Demokratieförderung und politische Bildung', text: 'Programme vor Ort, Präventionsarbeit.', ausrichtung: { gesellschaft: -1 }, kosten: 400000, dauer: 6, erfolg: 0.6, wirkung: 12, kapital: 6 },
      { id: 'polar_plattformen', quelle: 'Spielwert', name: 'Plattformregeln durchsetzen', text: 'Digital Services Act konsequent anwenden.', ausrichtung: { eu: 1, gesellschaft: -0.5 }, kosten: 150000, dauer: 4, erfolg: 0.55, wirkung: 10, kapital: 10 },
    ],
  },
  {
    id: 'kriminalitaet', quelle: 'Spielwert', name: 'Kriminalität und innere Sicherheit', kategorie: 'Sicherheit', ministerium: 'justiz', start: 38, trend: 0,
    text: 'Gefühlte Unsicherheit, überlastete Justiz und Polizei.',
    treiber: [{ problem: 'soziale_spaltung', ab: 50, gewicht: 0.1 }, { etat: 'inneres', gewicht: 0.4 }],
    folgen: { gruppen: { rentner: -3, familien: -2 } },
    loesungen: [
      { id: 'sicherheit_polizei', quelle: 'Spielwert', name: 'Mehr Personal für Polizei und Justiz', text: 'Stellenaufbau, schnellere Verfahren.', ausrichtung: { gesellschaft: 1 }, kosten: 1200000, dauer: 4, erfolg: 0.75, wirkung: 16, kapital: 6 },
      { id: 'sicherheit_praevention', quelle: 'Spielwert', name: 'Prävention und Resozialisierung', text: 'Jugendarbeit, Bewährungshilfe.', ausrichtung: { gesellschaft: -1 }, kosten: 800000, dauer: 6, erfolg: 0.65, wirkung: 14, kapital: 6 },
    ],
  },
  {
    id: 'aerztemangel', quelle: 'Spielwert', name: 'Gesundheitssystem und Ärztemangel', kategorie: 'Gesundheit', ministerium: 'gesundheit', start: 42, trend: 0.15,
    text: 'Lange Wartezeiten, Praxen auf dem Land schließen, Kliniken in Not.',
    treiber: [{ problem: 'demografie', ab: 40, gewicht: 0.15 }, { etat: 'gesundheit', gewicht: 0.5 }],
    folgen: { gruppen: { rentner: -4, familien: -2 } },
    loesungen: [
      { id: 'gesundheit_studienplaetze', quelle: 'Spielwert', name: 'Mehr Medizinstudienplätze, Landarztquote', text: 'Ausbildung ausbauen, Landpraxen fördern.', ausrichtung: { gesellschaft: 0.5 }, kosten: 800000, dauer: 8, erfolg: 0.8, wirkung: 16, kapital: 6 },
      { id: 'gesundheit_klinikreform', quelle: 'Spielwert', name: 'Krankenhausreform', text: 'Spezialisierung, Vorhaltepauschalen.', ausrichtung: { wirtschaft: 0.5 }, kosten: 1500000, dauer: 6, erfolg: 0.6, wirkung: 16, kapital: 12, nebenwirkung: { gruppen: { rentner: -1 } } },
    ],
  },
  {
    id: 'bundeswehr', quelle: 'Spielwert', name: 'Einsatzfähigkeit der Bundeswehr', kategorie: 'Sicherheit', ministerium: 'verteidigung', start: 50, trend: 0.1,
    text: 'Material fehlt, Personal fehlt, Bündnisverpflichtungen wachsen.',
    treiber: [{ etat: 'verteidigung', gewicht: 0.8 }, { problem: 'geopolitik', ab: 50, gewicht: 0.15 }],
    folgen: { gruppen: { arbeitnehmer: -1 } },
    loesungen: [
      { id: 'bw_beschaffung', quelle: 'Spielwert', name: 'Beschaffung beschleunigen', text: 'Vergaberecht vereinfachen, Rahmenverträge.', ausrichtung: { wirtschaft: 0.5 }, kosten: 2000000, dauer: 4, erfolg: 0.7, wirkung: 16, kapital: 6 },
      { id: 'bw_wehrdienst', quelle: 'Spielwert', name: 'Neuer Wehrdienst', text: 'Pflicht zur Musterung, Anreize für Freiwillige.', ausrichtung: { gesellschaft: 1 }, kosten: 1500000, dauer: 6, erfolg: 0.65, wirkung: 18, kapital: 14, nebenwirkung: { gruppen: { familien: -2 } } },
      { id: 'bw_europa', quelle: 'Spielwert', name: 'Europäische Verteidigungsunion', text: 'Gemeinsame Beschaffung und Einheiten mit EU-Partnern.', ausrichtung: { eu: 2 }, kosten: 1000000, dauer: 8, erfolg: 0.6, wirkung: 16, kapital: 10 },
    ],
  },
  {
    id: 'geopolitik', quelle: 'Spielwert', name: 'Geopolitische Krise und Lieferketten', kategorie: 'Wirtschaft', ministerium: 'aeusseres', start: 50, trend: -0.35,
    text: 'Kriege, Sanktionen und Handelskonflikte stören Lieferketten.',
    treiber: [{ profil: 'eu', gewicht: -0.15 }],
    schock: { chance: 0.03, staerke: 20 },
    folgen: { wachstum: -0.3, inflation: 0.3, gruppen: { unternehmen: -3 } },
    loesungen: [
      { id: 'geo_diversifizierung', quelle: 'Spielwert', name: 'Lieferketten diversifizieren', text: 'Rohstoffpartnerschaften, Lagerhaltung.', ausrichtung: { wirtschaft: 0.5 }, kosten: 1000000, dauer: 6, erfolg: 0.7, wirkung: 15, kapital: 6 },
      { id: 'geo_diplomatie', quelle: 'Spielwert', name: 'Diplomatische Offensive mit EU-Partnern', text: 'Gemeinsame Handelspolitik, Vermittlung.', ausrichtung: { eu: 1.5 }, kosten: 300000, dauer: 4, erfolg: 0.55, wirkung: 14, kapital: 10 },
    ],
  },
  {
    id: 'landwirtschaftsproteste', quelle: 'Spielwert', name: 'Landwirtschaftsproteste', kategorie: 'Wirtschaft', ministerium: 'landwirtschaft', start: 30, trend: -0.1,
    text: 'Bauern blockieren Straßen gegen Kürzungen, Auflagen und niedrige Erzeugerpreise.',
    treiber: [{ gruppe: 'landwirtschaft', gewicht: 1.2 }, { etat: 'landwirtschaft', gewicht: 0.8 }],
    folgen: { gruppen: { landwirtschaft: -4 } },
    loesungen: [
      { id: 'agrar_entlastung', quelle: 'Spielwert', name: 'Bürokratie und Auflagen für Höfe senken', text: 'Dokumentationspflichten reduzieren.', ausrichtung: { wirtschaft: 1, oekologie: -1 }, kosten: 200000, dauer: 2, erfolg: 0.75, wirkung: 18, kapital: 6, nebenwirkung: { gruppen: { landwirtschaft: 5 }, probleme: { klimafolgen: 2 } } },
      { id: 'agrar_tierwohl', quelle: 'Spielwert', name: 'Umbau mit Tierwohl-Förderung', text: 'Langfristige Verträge und Förderung für Umbau.', ausrichtung: { oekologie: 1.5, wirtschaft: -0.5 }, kosten: 1500000, dauer: 6, erfolg: 0.7, wirkung: 16, kapital: 8, nebenwirkung: { gruppen: { landwirtschaft: 3 } } },
    ],
  },
  {
    id: 'kommunalfinanzen', quelle: 'Spielwert', name: 'Kommunalfinanzen', kategorie: 'Staat', ministerium: 'finanzen', start: 55, trend: 0.15,
    text: 'Städte und Gemeinden machen Rekorddefizite, Schwimmbäder und Bibliotheken schließen.',
    treiber: [{ problem: 'migration', ab: 50, gewicht: 0.1 }, { problem: 'rezession', ab: 50, gewicht: 0.15 }],
    folgen: { gruppen: { familien: -3 } },
    loesungen: [
      { id: 'kommunen_altschulden', quelle: 'Spielwert', name: 'Altschuldenhilfe', text: 'Bund übernimmt einen Teil der Kassenkredite.', ausrichtung: { wirtschaft: -0.5 }, kosten: 2500000, dauer: 2, erfolg: 0.85, wirkung: 18, kapital: 8 },
      { id: 'kommunen_konnexitaet', quelle: 'Spielwert', name: 'Wer bestellt, bezahlt', text: 'Bund trägt Kosten für Aufgaben, die er den Kommunen gibt.', ausrichtung: {}, kosten: 3000000, dauer: 4, erfolg: 0.75, wirkung: 16, kapital: 10 },
    ],
  },
  {
    id: 'vertrauensverlust', quelle: 'Spielwert', name: 'Vertrauensverlust in Institutionen', kategorie: 'Staat', ministerium: 'inneres', start: 45, trend: 0,
    text: 'Viele trauen Regierung, Parlament und Medien nicht mehr.',
    treiber: [{ problem: 'polarisierung', ab: 50, gewicht: 0.1 }, { problem: 'digitalisierung', ab: 55, gewicht: 0.05 }, { problem: 'staatsverschuldung', ab: 60, gewicht: 0.05 }],
    folgen: { gruppen: { arbeitnehmer: -2, rentner: -2 } },
    loesungen: [
      { id: 'vertrauen_buergerraete', quelle: 'Spielwert', name: 'Bürgerräte und Transparenz', text: 'Lobbyregister schärfen, Bürgerbeteiligung.', ausrichtung: { gesellschaft: -0.5 }, kosten: 100000, dauer: 4, erfolg: 0.6, wirkung: 12, kapital: 8 },
      { id: 'vertrauen_leistung', quelle: 'Spielwert', name: 'Staat, der funktioniert', text: 'Ämter entlasten, Wartezeiten halbieren.', ausrichtung: {}, kosten: 800000, dauer: 6, erfolg: 0.65, wirkung: 14, kapital: 6 },
    ],
  },
  {
    id: 'pandemie', quelle: 'Spielwert', name: 'Pandemie und Gesundheitskrise', kategorie: 'Gesundheit', ministerium: 'gesundheit', start: 10, trend: -0.5,
    text: 'Ein neuer Erreger breitet sich aus, Kliniken füllen sich.',
    treiber: [{ problem: 'aerztemangel', ab: 60, gewicht: 0.05 }],
    schock: { chance: 0.006, staerke: 60 },
    folgen: { wachstum: -1.5, arbeitslosigkeit: 0.5, gruppen: { unternehmen: -6, familien: -4 } },
    loesungen: [
      { id: 'pandemie_eindaemmung', quelle: 'Spielwert', name: 'Eindämmung und Impfkampagne', text: 'Test- und Impfstrategie, Schutz für Risikogruppen.', ausrichtung: { gesellschaft: -0.5 }, kosten: 3000000, dauer: 2, erfolg: 0.8, wirkung: 30, kapital: 10, nebenwirkung: { wachstum: -0.1 } },
      { id: 'pandemie_offen', quelle: 'Spielwert', name: 'Offen bleiben, Risikogruppen schützen', text: 'Wirtschaft offen halten, gezielter Schutz.', ausrichtung: { wirtschaft: 1, gesellschaft: 0.5 }, kosten: 1000000, dauer: 2, erfolg: 0.55, wirkung: 25, kapital: 12, nebenwirkung: { gruppen: { rentner: -3 } } },
    ],
  },
  {
    id: 'demografie', quelle: 'Spielwert', name: 'Demografischer Wandel', kategorie: 'Gesellschaft', ministerium: 'arbeit', start: 48, trend: 0.15,
    text: 'Die Babyboomer gehen in Rente, die Bevölkerung altert.',
    treiber: [{ problem: 'migration', ab: 0, gewicht: -0.01 }],
    folgen: { wachstum: -0.15, gruppen: { arbeitnehmer: -2 } },
    loesungen: [
      { id: 'demografie_familie', quelle: 'Spielwert', name: 'Familien stärken', text: 'Kita-Ausbau, Elterngeld, Vereinbarkeit.', ausrichtung: { gesellschaft: 0.5, wirtschaft: -0.5 }, kosten: 2500000, dauer: 8, erfolg: 0.7, wirkung: 12, kapital: 6, nebenwirkung: { gruppen: { familien: 4 } } },
      { id: 'demografie_zuwanderung', quelle: 'Spielwert', name: 'Gesteuerte Zuwanderung', text: 'Punktesystem, Arbeitsmarktmigration.', ausrichtung: { gesellschaft: -1, wirtschaft: 0.5 }, kosten: 500000, dauer: 6, erfolg: 0.65, wirkung: 12, kapital: 10, nebenwirkung: { probleme: { migration: 3, fachkraefte: -4 } } },
    ],
  },
];
