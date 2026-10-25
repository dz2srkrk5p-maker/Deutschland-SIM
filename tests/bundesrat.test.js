import { test, expect } from 'vitest';
import { einnahmearten } from '../src/data/einnahmen.js';
import { bundesratAbstimmung } from '../src/engine/bundesrat.js';
import { haushaltBeschliessen, vorschau } from '../src/engine/haushalt.js';
import { neuesSpiel } from '../src/engine/state.js';
import { laender, andereParteien, bundesratGesamt, bundesratMehrheit } from '../src/data/laender.js';
import { parteien } from '../src/data/parteien.js';
import { ministerien } from '../src/data/ministerien.js';
import { quartalBeenden, haushaltsQuartal } from '../src/engine/regierung.js';
import { ereignisEntscheiden } from '../src/engine/ereignisse.js';

// Steueränderung in früheren (geeichten) Stufen → Reglerschritte (feinere Schritte seit 2026-10-25)
const fein = (id, stufen) => { const p = einnahmearten.find((a) => a.id === id).parameter; return Math.round((stufen * (p.eichSchritt ?? p.schritt)) / p.schritt); };
// F12: bis zum Haushaltsquartal weiterschalten, dann beschließen
const beschliessen = (z, p) => {
  // F14: offene Ereignisse mit der ersten Möglichkeit beantworten
  while (!haushaltsQuartal(z) || z.offenesEreignis) z = (z.offenesEreignis ? ereignisEntscheiden(z, { wahl: 0 }) : quartalBeenden(z)).state;
  return haushaltBeschliessen(z, p);
};


test('69 Stimmen, Mehrheit 35', () => {
  expect(bundesratGesamt).toBe(69);
  expect(bundesratMehrheit).toBe(35);
});

test('jede Regierungspartei ist eine Spielpartei oder in andereParteien', () => {
  const bekannt = [...parteien.map((p) => p.id), ...Object.keys(andereParteien)];
  for (const land of laender) for (const id of land.regierung) expect(bekannt).toContain(id);
});

test('Beispiele: Union+SPD 24, Union+SPD+Grüne 49, SPD+Grüne+Linke 18', () => {
  expect(bundesratAbstimmung(['union', 'spd']).ja).toBe(24);
  expect(bundesratAbstimmung(['union', 'spd']).mehrheit).toBe(false);
  expect(bundesratAbstimmung(['union', 'spd', 'gruene']).ja).toBe(49);
  expect(bundesratAbstimmung(['union', 'spd', 'gruene']).mehrheit).toBe(true);
  expect(bundesratAbstimmung(['spd', 'gruene', 'linke']).ja).toBe(18);
});

test('Land mit Partei außerhalb der Koalition enthält sich', () => {
  const r = bundesratAbstimmung(['union', 'spd', 'gruene']);
  expect(r.laender.find((l) => l.id === 'by').stimmtZu).toBe(false); // Freie Wähler
  expect(r.laender.find((l) => l.id === 'hb').stimmtZu).toBe(false); // Linke
  expect(r.laender.find((l) => l.id === 'nw').stimmtZu).toBe(true);
});

// Regierung Union (Kanzler) + SPD
const imAmt = (partner) => ({
  ...neuesSpiel('union', 1),
  phase: 'regierung',
  sitze: { union: 300, spd: 200, gruene: 130 },
  koalition: { partner, startAnteile: Object.fromEntries(partner.map((id) => [id, neuesSpiel('union', 1).anteile[id]])) },
  kanzlerParteiId: 'union',
  kabinett: { anspruch: {}, verteilung: Object.fromEntries(ministerien.map((m) => [m.id, 'union'])) },
});

test('Steueränderung ohne Bundesratsmehrheit wird abgelehnt', () => {
  const z = imAmt(['spd']);
  expect(vorschau(z, { einnahmen: { einkommensteuer: fein('einkommensteuer', 1) } }).bundesrat.mehrheit).toBe(false);
  expect(() => beschliessen(z, { einnahmen: { einkommensteuer: fein('einkommensteuer', 1) } })).toThrow(/Bundesrat/);
  // Bundessteuern (Energie- und Verbrauchsteuern) brauchen den Bundesrat nicht
  expect(vorschau(z, { einnahmen: { energie: fein('energie', 1) } }).bundesrat).toBeNull();
});

test('Steueränderung mit Bundesratsmehrheit geht durch', () => {
  const z = imAmt(['spd', 'gruene']);
  expect(beschliessen(z, { einnahmen: { einkommensteuer: fein('einkommensteuer', 1) } }).state.haushalt.jahr).toBe(2);
});

test('Haushalt ohne Steueränderung braucht den Bundesrat nicht', () => {
  const z = imAmt(['spd']);
  expect(vorschau(z, { stufen: { arbeit: -1 } }).bundesrat).toBeNull();
  expect(() => beschliessen(z, { stufen: { arbeit: -1 } })).not.toThrow();
});
