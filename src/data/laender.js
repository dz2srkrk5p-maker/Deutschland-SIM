// Bundesratsstimmen je Land, Quelle: https://de.wikipedia.org/wiki/Bundesrat_(Deutschland)
// Summe 69 und Mehrheit 35 bestätigt durch bundesrat.de.
// regierung: Regierungsparteien (Spiel-IDs aus parteien.js, CSU = union; sonst IDs aus andereParteien).
// Quelle: Wikipedia, Tabelle „Stimmenverteilung im Bundesrat“, Stand 24.09.2026; BW und RP zusätzlich
// geprüft bei baden-wuerttemberg.de und zdfheute.de (abgerufen 2026-10-21).
// geschaeftsfuehrend: Regierung hat bei der Landtagswahl im September 2026 ihre Mehrheit verloren und ist nur
// noch geschäftsführend im Amt; sie stimmt im Bundesrat bis zur Neubildung trotzdem ab.
export const laender = [
  { id: 'bw', name: 'Baden-Württemberg', bundesratStimmen: 6, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['gruene', 'union'] },
  { id: 'by', name: 'Bayern', bundesratStimmen: 6, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['union', 'fw'] },
  { id: 'be', name: 'Berlin', bundesratStimmen: 4, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['union', 'spd'], geschaeftsfuehrend: true },
  { id: 'bb', name: 'Brandenburg', bundesratStimmen: 4, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['spd', 'union'] },
  { id: 'hb', name: 'Bremen', bundesratStimmen: 3, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['spd', 'gruene', 'linke'] },
  { id: 'hh', name: 'Hamburg', bundesratStimmen: 3, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['spd', 'gruene'] },
  { id: 'he', name: 'Hessen', bundesratStimmen: 5, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['union', 'spd'] },
  { id: 'mv', name: 'Mecklenburg-Vorpommern', bundesratStimmen: 3, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['spd', 'linke'], geschaeftsfuehrend: true },
  { id: 'ni', name: 'Niedersachsen', bundesratStimmen: 6, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['spd', 'gruene'] },
  { id: 'nw', name: 'Nordrhein-Westfalen', bundesratStimmen: 6, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['union', 'gruene'] },
  { id: 'rp', name: 'Rheinland-Pfalz', bundesratStimmen: 4, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['union', 'spd'] },
  { id: 'sl', name: 'Saarland', bundesratStimmen: 3, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['spd'] },
  { id: 'sn', name: 'Sachsen', bundesratStimmen: 4, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['union', 'spd'] },
  { id: 'st', name: 'Sachsen-Anhalt', bundesratStimmen: 4, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['union', 'spd', 'fdp'], geschaeftsfuehrend: true },
  { id: 'sh', name: 'Schleswig-Holstein', bundesratStimmen: 4, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['union', 'gruene'] },
  { id: 'th', name: 'Thüringen', bundesratStimmen: 4, quelle: 'Quelle: Wikipedia, Stimmenverteilung im Bundesrat, 2026', regierung: ['union', 'tg', 'spd'] },
];

// Regierungsparteien in Ländern, die es im Spiel nicht gibt; nie Teil einer Bundeskoalition
export const andereParteien = {
  fw: { name: 'Freie Wähler', farbe: '#F39200' },
  tg: { name: 'Thüringen.Gerecht', farbe: '#7D254F' }, // Abspaltung des BSW Thüringen, gegründet September 2026
};

export const bundesratGesamt = laender.reduce((summe, land) => summe + land.bundesratStimmen, 0);
// Absolute Mehrheit: mehr als die Hälfte aller Stimmen
export const bundesratMehrheit = Math.floor(bundesratGesamt / 2) + 1;
