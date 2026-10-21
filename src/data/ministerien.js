// Die 16 Bundesministerien mit offiziellem Namen, Quelle:
// https://www.bundesregierung.de/breg-de/bundesregierung/bundesministerien (abgerufen 2026-10-20)
export const ministerien = [
  { id: 'finanzen', kurz: 'Finanzen', name: 'Bundesministerium der Finanzen' },
  { id: 'inneres', kurz: 'Inneres', name: 'Bundesministerium des Innern' },
  { id: 'aeusseres', kurz: 'Äußeres', name: 'Auswärtiges Amt' },
  { id: 'verteidigung', kurz: 'Verteidigung', name: 'Bundesministerium der Verteidigung' },
  { id: 'wirtschaft', kurz: 'Wirtschaft', name: 'Bundesministerium für Wirtschaft und Energie' },
  { id: 'forschung', kurz: 'Forschung', name: 'Bundesministerium für Forschung, Technologie und Raumfahrt' },
  { id: 'justiz', kurz: 'Justiz', name: 'Bundesministerium der Justiz und für Verbraucherschutz' },
  { id: 'bildung', kurz: 'Bildung & Familie', name: 'Bundesministerium für Bildung, Familie, Senioren, Frauen und Jugend' },
  { id: 'arbeit', kurz: 'Arbeit', name: 'Bundesministerium für Arbeit und Soziales' },
  { id: 'digitales', kurz: 'Digitales', name: 'Bundesministerium für Digitales und Staatsmodernisierung' },
  { id: 'verkehr', kurz: 'Verkehr', name: 'Bundesministerium für Verkehr' },
  { id: 'umwelt', kurz: 'Umwelt', name: 'Bundesministerium für Umwelt, Klimaschutz, Naturschutz und nukleare Sicherheit' },
  { id: 'gesundheit', kurz: 'Gesundheit', name: 'Bundesministerium für Gesundheit' },
  { id: 'landwirtschaft', kurz: 'Landwirtschaft', name: 'Bundesministerium für Landwirtschaft, Ernährung und Heimat' },
  { id: 'entwicklung', kurz: 'Entwicklung', name: 'Bundesministerium für wirtschaftliche Zusammenarbeit und Entwicklung' },
  { id: 'bauen', kurz: 'Bauen', name: 'Bundesministerium für Wohnen, Stadtentwicklung und Bauwesen' },
];

// Kein Ministerium: gehört zum Kanzler (Regeln in M7)
export const kanzleramt = { id: 'kanzleramt', kurz: 'Kanzleramt', name: 'Bundeskanzleramt' };
