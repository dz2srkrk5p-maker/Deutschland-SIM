// Probleme im Land und Reformen dagegen (F13, freigegeben automatisch nach Empfehlung 2026-10-22).
// Themen sind reale Baustellen Deutschlands; Druckwerte, Kosten und Wirkungen sind Spielwerte ohne Quelle.
// ministerium: zuständiges Ressort, es bringt die Reform ein; seine Partei gewinnt Umfragepunkte, wenn der Druck sinkt.
export const probleme = [
  { id: 'wohnen', name: 'Mieten und Wohnraum', ministerium: 'bauen', startDruck: 60 },
  { id: 'pflege', name: 'Pflege', ministerium: 'gesundheit', startDruck: 55 },
  { id: 'schiene', name: 'Bahn und Schiene', ministerium: 'verkehr', startDruck: 50 },
];

// kosten: laufende Kosten je Haushaltsjahr in tausend Euro (wie der Haushalt), ab Beschluss dauerhaft.
// druck: Senkung des Problemdrucks beim Beschluss. braucht: Reform, die vorher beschlossen sein muss.
export const reformen = [
  { id: 'wohnen1', problem: 'wohnen', name: 'Bauoffensive', kosten: 2000000, druck: 20 },
  { id: 'wohnen2', problem: 'wohnen', name: 'Bauland und Mietrecht', kosten: 1000000, druck: 15, braucht: 'wohnen1' },
  { id: 'pflege1', problem: 'pflege', name: 'Bessere Bezahlung in der Pflege', kosten: 3000000, druck: 20 },
  { id: 'pflege2', problem: 'pflege', name: 'Ausbildung und Entlastung', kosten: 1500000, druck: 15, braucht: 'pflege1' },
  { id: 'schiene1', problem: 'schiene', name: 'Netzsanierung', kosten: 4000000, druck: 20 },
  { id: 'schiene2', problem: 'schiene', name: 'Deutschlandtakt', kosten: 2000000, druck: 15, braucht: 'schiene1' },
];
