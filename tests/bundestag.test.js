import { test, expect } from 'vitest';
import { sitzPositionen, fraktionen, bundestagSvg } from '../src/ui/components/bundestag.js';
import { parteien } from '../src/data/parteien.js';
import { abstimmung, abstimmen } from '../src/engine/bundestag.js';
import { neuesSpiel } from '../src/engine/state.js';

test('so viele Plätze wie Sitze, für viele Größen', () => {
  for (const n of [1, 2, 3, 7, 50, 299, 630, 736]) {
    expect(sitzPositionen(n).plaetze).toHaveLength(n);
  }
  expect(sitzPositionen(0).plaetze).toHaveLength(0);
});

test('Plätze liegen im oberen Halbkreis und laufen von links nach rechts', () => {
  const { plaetze, punktRadius } = sitzPositionen(630);
  expect(punktRadius).toBeGreaterThan(0);
  for (const p of plaetze) {
    expect(p.y).toBeGreaterThanOrEqual(-1e-9);
    expect(Math.hypot(p.x, p.y)).toBeLessThanOrEqual(1 + 1e-9);
  }
  for (let i = 1; i < plaetze.length; i++) expect(plaetze[i].winkel).toBeLessThanOrEqual(plaetze[i - 1].winkel);
});

test('Punkte überlappen nicht', () => {
  const { plaetze, punktRadius } = sitzPositionen(630);
  let minAbstand = Infinity;
  for (let i = 0; i < plaetze.length; i++) {
    for (let j = i + 1; j < plaetze.length; j++) {
      minAbstand = Math.min(minAbstand, Math.hypot(plaetze[i].x - plaetze[j].x, plaetze[i].y - plaetze[j].y));
    }
  }
  expect(minAbstand).toBeGreaterThan(2 * punktRadius);
});

test('Fraktionen in Sitzordnung, ohne Parteien ohne Sitze', () => {
  const liste = fraktionen({ union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 }, parteien);
  expect(liste.map((p) => p.id)).toEqual(['linke', 'gruene', 'spd', 'union', 'afd']);
});

test('SVG enthält einen Punkt je Sitz', () => {
  const svg = bundestagSvg({ union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 }, parteien);
  expect(svg.match(/<circle/g)).toHaveLength(630);
});

// F10: Abstimmungen. Sitze wie nach der Wahl mit den Startwerten 2025
const SITZE_2025 = { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 };
const regierung = (spieler, partner, sitze = SITZE_2025) => ({ ...neuesSpiel(spieler, 1), sitze, koalition: { partner, startAnteile: {} } });
const stimmen = (a) => Object.fromEntries(a.fraktionen.map((f) => [f.id, f.stimme]));

test('Abstimmung: Koalition mit Mehrheit nimmt an, Opposition nach Abstand zur nächsten Koalitionspartei', () => {
  const a = abstimmung(regierung('union', ['spd']), 'haushalt');
  expect(a.angenommen).toBe(true);
  // Union (6) + SPD (4): Grüne (3) Abstand 1 → Ja, AfD (7) Abstand 1 → Ja, Linke (1) Abstand 3 → Nein
  expect(stimmen(a)).toEqual({ union: 'ja', afd: 'ja', spd: 'ja', gruene: 'ja', linke: 'nein' });
  expect([a.ja, a.nein, a.enthaltung]).toEqual([566, 64, 0]);
});

test('Abstimmung: Minderheit der Grünen scheitert, Enthaltungen zählen nicht', () => {
  const a = abstimmung(regierung('gruene', []), 'haushalt');
  // SPD Abstand 1 → Ja, Linke 2 → Enthaltung, Union 3 und AfD 4 → Nein
  expect(stimmen(a)).toEqual({ union: 'nein', afd: 'nein', spd: 'ja', gruene: 'ja', linke: 'enthaltung' });
  expect([a.ja, a.nein, a.enthaltung, a.angenommen]).toEqual([205, 361, 64, false]);
});

test('Abstimmung: Brandmauer – AfD-Stimmen zählen, eine Union-Minderheit kommt mit ihnen durch', () => {
  const a = abstimmung(regierung('union', []), 'haushalt');
  expect(stimmen(a).afd).toBe('ja');
  expect([a.ja, a.nein, a.angenommen]).toEqual([361, 149, true]);
});

test('Abstimmung: Gleichstand Ja und Nein ist abgelehnt', () => {
  const a = abstimmung(regierung('gruene', [], { gruene: 100, union: 100 }), 'haushalt');
  expect([a.ja, a.nein, a.angenommen]).toEqual([100, 100, false]);
});

// F11: Brandmauer bei Abstimmungen
test('Brandmauer: für eine AfD-Regierung stimmt keine andere Fraktion (Vorschau)', () => {
  const a = abstimmung(regierung('afd', []), 'haushalt');
  expect(stimmen(a)).toEqual({ union: 'nein', afd: 'ja', spd: 'nein', gruene: 'nein', linke: 'nein' });
  expect([a.ja, a.nein, a.abweichler, a.angenommen]).toEqual([152, 478, 0, false]);
});

test('abstimmen ohne Brandmauer-Regierung: wie die Vorschau, kein Zufall verbraucht', () => {
  const z = regierung('union', ['spd']);
  const a = abstimmen(z, 'haushalt');
  expect(a).toMatchObject({ ja: 566, nein: 64, angenommen: true, rngZustand: z.rngZustand });
});

test('abstimmen mit AfD-Regierung: nur Abgeordnete der Nachbarfraktion (Union) weichen ab, selten', () => {
  let summe = 0;
  for (let seed = 1; seed <= 1000; seed++) {
    const z = { ...regierung('afd', []), rngZustand: seed };
    const a = abstimmen(z, 'haushalt');
    const andere = a.fraktionen.filter((f) => f.id !== 'union');
    expect(andere.every((f) => !f.abweichler)).toBe(true);
    expect(a.ja).toBe(152 + a.abweichler);
    expect(a.nein).toBe(478 - a.abweichler);
    summe += a.abweichler;
  }
  // erwartet 1000 · 209 · 0,001 ≈ 209
  expect(summe).toBeGreaterThan(130);
  expect(summe).toBeLessThan(300);
  // gleicher Seed, gleiches Ergebnis
  const z = { ...regierung('afd', []), rngZustand: 7 };
  expect(abstimmen(z, 'haushalt')).toEqual(abstimmen(z, 'haushalt'));
});

test('Minderheitsregierung im Amt: Opposition eine Stufe strenger (Abstand 1 Enthaltung, sonst Nein)', () => {
  const z = regierung('union', []);
  const a = abstimmung({ ...z, koalition: { ...z.koalition, minderheit: true } }, 'haushalt');
  // Union (6): AfD (7) Abstand 1 → Enthaltung, SPD (4) Abstand 2 → Nein, Grüne und Linke → Nein
  expect(stimmen(a)).toEqual({ union: 'ja', afd: 'enthaltung', spd: 'nein', gruene: 'nein', linke: 'nein' });
  expect([a.ja, a.nein, a.enthaltung, a.angenommen]).toEqual([209, 269, 152, false]);
});
