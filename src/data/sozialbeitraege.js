// Sozialbeiträge (Epochen-Etappe 6, docs/epochen-spec.md): „Was Pflege-, Kranken- oder Rentenversicherung bezahlen, steht nicht im
// Bundeshaushalt. Im Entwurf steht dann ‚über Beiträge‘: Beschäftigte und Betriebe zahlen, und der Druck bei ‚Steigende
// Sozialbeiträge‘ steigt. Mehr Einzahler, etwa mit einer Bürgerversicherung, entlasten die Beiträge.“
// VORSCHLAG, vom Nutzer zu prüfen: welche Ansätze die Sozialversicherungen bezahlen (Kosten negativ = Einsparung der Kassen).

// Ansatz-Id (Reformweg oder Lösung) → Kasse, die bezahlt
export const ueberBeitraege = {
  r_umlage: 'Rentenversicherung', r_mindestrente: 'Rentenversicherung', r_eintritt: 'Rentenversicherung', rente_flexi: 'Rentenversicherung', rw_uebergang: 'Rentenversicherung',
  g_wettbewerb: 'Krankenversicherung', g_buerger: 'Krankenversicherung',
  g_einheitskasse: 'Pflegeversicherung', pflege1: 'Pflegeversicherung',
  r_buerger: 'Rentenversicherung',
};

// Ansätze, die mehr Einzahler bringen und so die Beiträge entlasten
export const mehrEinzahler = ['r_buerger', 'g_buerger'];

// Problem „Steigende Sozialbeiträge“: gehört zu jeder Partie (zusätzlich zu den 25), Format wie src/data/probleme.js.
// Startwert grob nach der Lage 2025/26 (Beitragssätze zusammen über 40 %), alle Werte Spielwerte.
export const problemSozialbeitraege = {
  id: 'sozialbeitraege', quelle: 'Spielwert', name: 'Steigende Sozialbeiträge', kategorie: 'Soziales', ministerium: 'arbeit', start: 45, trend: 0.15,
  text: 'Renten-, Kranken- und Pflegeversicherung brauchen mehr Geld. Beschäftigte und Betriebe zahlen höhere Beiträge.',
  treiber: [{ problem: 'demografie', ab: 40, gewicht: 0.2 }, { problem: 'pflegenotstand', ab: 50, gewicht: 0.1 }, { problem: 'rentenwelle', ab: 40, gewicht: 0.2 }],
  folgen: { wachstum: -0.2, gruppen: { arbeitnehmer: -4, unternehmen: -4 } },
  loesungen: [
    { id: 'sb_bundeszuschuss', platzhalter: true, quelle: 'Spielwert', name: 'Bundeszuschuss an die Sozialkassen', text: 'Der Bund übernimmt versicherungsfremde Leistungen aus Steuermitteln.', ausrichtung: { wirtschaft: -0.5 }, kosten: 5000000, dauer: 6, erfolg: 0.8, wirkung: 12, kapital: 8 },
    { id: 'sb_verwaltung', platzhalter: true, quelle: 'Spielwert', name: 'Verwaltung der Kassen verschlanken', text: 'Weniger Kassen, gemeinsame IT, weniger Bürokratie.', ausrichtung: { wirtschaft: 0.5 }, kosten: 100000, dauer: 12, erfolg: 0.6, wirkung: 6, kapital: 10 },
  ],
};
