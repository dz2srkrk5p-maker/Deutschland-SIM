import { zufall } from './rng.js';

// Sainte-Laguë als Höchstzahlverfahren (Bundestagssitze, Ministerien): Sitz für Sitz an die Partei mit der höchsten Höchstzahl
// stimmen / (2 · bisherigeSitze + 1). Gleichstand entscheidet das Los (Seed-Zufall).
// stimmen: { parteiId: ganze Zahl > 0 }
export function sainteLague(stimmen, sitzeGesamt, rngZustand) {
  const ids = Object.keys(stimmen);
  if (ids.length === 0) throw new Error('Keine Partei für die Sitzverteilung');

  const sitze = Object.fromEntries(ids.map((id) => [id, 0]));
  // a hat die höhere Höchstzahl, wenn a.stimmen/(2a+1) > b.stimmen/(2b+1); über Kreuz multipliziert, ganzzahlig
  const vergleich = (a, b) => stimmen[a] * (2 * sitze[b] + 1) - stimmen[b] * (2 * sitze[a] + 1);

  for (let n = 0; n < sitzeGesamt; n++) {
    let beste = [ids[0]];
    for (const id of ids.slice(1)) {
      const v = vergleich(id, beste[0]);
      if (v > 0) beste = [id];
      else if (v === 0) beste.push(id);
    }
    let gewinner = beste[0];
    if (beste.length > 1) {
      const los = zufall(rngZustand);
      rngZustand = los.rngZustand;
      gewinner = beste[Math.floor(los.wert * beste.length)];
    }
    sitze[gewinner]++;
  }
  return { sitze, rngZustand };
}
