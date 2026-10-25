import { test, expect } from 'vitest';
import { mehrheit, chance, moeglichePartner, mehrheitMoeglich, verhandeln, moeglicheKoalitionen, minderheitMoeglich, minderheitAntreten, minderheitsKanzlerwahl, regierungMoeglich } from '../src/engine/koalition.js';
import { neuesSpiel } from '../src/engine/state.js';
import { wahl } from '../src/engine/wahl.js';

// Bundestag mit den Startwerten 2025: CDU/CSU 209, AfD 152, SPD 120, Grüne 85, Linke 64
const nachWahl = (spieler, seed = 1) => wahl(neuesSpiel(spieler, seed)).state;
const mitSitzen = (spieler, sitze, seed = 1) => ({ ...neuesSpiel(spieler, seed), sitze, phase: 'koalition' });

test('Mehrheit bei 630 Sitzen ist 316', () => {
  expect(mehrheit(nachWahl('spd').sitze)).toBe(316);
});

test('Chance nach Abstand in der Sitzordnung', () => {
  expect(chance('spd', 'gruene')).toBe(0.9); // Abstand 1
  expect(chance('union', 'spd')).toBe(0.7); // Abstand 2
  expect(chance('union', 'gruene')).toBe(0.4); // Abstand 3
  expect(chance('linke', 'union')).toBe(0.15); // Abstand 5
});

test('Brandmauer: niemand koaliert mit der AfD, auch nicht als Spielerpartei', () => {
  expect(chance('union', 'afd')).toBe(0);
  expect(chance('afd', 'union')).toBe(0);
  expect(moeglichePartner(nachWahl('union'))).not.toContain('afd');
  // AfD mit 152 Sitzen hat keine Partner: sofort Opposition nach der Wahl
  expect(nachWahl('afd').phase).toBe('opposition');
});

test('gleicher Seed ergibt gleiches Verhandlungsergebnis, Auswahlreihenfolge egal', () => {
  const a = verhandeln(nachWahl('union', 3), { partner: ['spd'] });
  const b = verhandeln(nachWahl('union', 3), { partner: ['spd'] });
  expect(a).toEqual(b);
  const c = verhandeln(nachWahl('spd', 3), { partner: ['union', 'gruene'] });
  const d = verhandeln(nachWahl('spd', 3), { partner: ['gruene', 'union'] });
  expect(c).toEqual(d);
});

test('Absage sperrt den Partner für diese Wahlperiode', () => {
  // Seed suchen, bei dem die Linke der Union absagt (Chance 15 %)
  for (let seed = 1; seed < 100; seed++) {
    const { state } = verhandeln(nachWahl('union', seed), { partner: ['spd', 'linke'] });
    if (state.abgelehnt.includes('linke')) {
      expect(moeglichePartner(state)).not.toContain('linke');
      expect(() => verhandeln(state, { partner: ['linke', 'spd'] })).toThrow();
      return;
    }
  }
  throw new Error('kein passender Seed gefunden');
});

test('Absage ohne verbleibende Mehrheit führt in die Opposition', () => {
  // Linke (64) + alle möglichen Partner: SPD 120, Grüne 85, Union 209 → genug; nach Absage der Union nicht mehr
  const zustand = { ...mitSitzen('linke', { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 }), abgelehnt: [] };
  for (let seed = 1; seed < 200; seed++) {
    const { state } = verhandeln({ ...zustand, rngZustand: seed }, { partner: ['union', 'spd'] });
    if (state.abgelehnt.includes('union')) {
      expect(state.phase).toBe('opposition');
      return;
    }
  }
  throw new Error('kein passender Seed gefunden');
});

test('Verhandeln ohne Mehrheit oder mit ungültigem Partner wird abgelehnt', () => {
  expect(() => verhandeln(nachWahl('spd'), { partner: ['gruene'] })).toThrow(); // 205 Sitze
  expect(() => verhandeln(nachWahl('spd'), { partner: ['afd', 'union'] })).toThrow(); // Brandmauer
  expect(() => verhandeln(nachWahl('spd'), { partner: ['fdp', 'union'] })).toThrow(); // FDP nicht im Bundestag
});

test('Alleinregierung ohne Partner, Kanzler gewählt, direkt Regierung (M7)', () => {
  const z = mitSitzen('union', { union: 400, spd: 230 });
  const { state, ereignisse } = verhandeln(z, { partner: [] });
  expect(state.phase).toBe('regierung');
  expect(state.kanzlerParteiId).toBe('union');
  expect(state.koalition).toEqual({ partner: [], startAnteile: {}, minderheit: false, fehlschlaege: 0 });
  expect(ereignisse).toContain('Alleinregierung steht');
});

test('zwei gescheiterte Wahlgänge führen zur Neuwahl', () => {
  // genau 316 Sitze: schon ein Abweichler lässt die Wahl scheitern (bei 2 % pro Kopf fast sicher)
  for (let seed = 1; seed < 50; seed++) {
    const z = { ...mitSitzen('union', { union: 316, spd: 314 }, seed) };
    const { state, ereignisse } = verhandeln(z, { partner: [] });
    if (state.phase === 'wahlkampf') {
      expect(state.wahlkampfWoche).toBe(1);
      expect(state.sitze).toBeNull();
      expect(state.abgelehnt).toEqual([]);
      expect(ereignisse.filter((e) => e.includes('durchgefallen'))).toHaveLength(2);
      return;
    }
  }
  throw new Error('kein passender Seed gefunden');
});

test('mehrheitMoeglich: Spieler ohne Sitze kann nicht regieren', () => {
  expect(mehrheitMoeglich(mitSitzen('fdp', { union: 330, spd: 300 }))).toBe(false);
});

test('Größenfaktor: größerer Partner sagt seltener zu, kleinerer unverändert', () => {
  const sitze = { fdp: 50, union: 200, spd: 120 };
  expect(chance('fdp', 'union', sitze)).toBeCloseTo(0.9 * 50 / 200, 9); // Abstand 1, Union 4× so groß
  expect(chance('union', 'fdp', sitze)).toBe(0.9); // Partner kleiner: keine Änderung
  expect(chance('spd', 'union', sitze)).toBeCloseTo(0.7 * 120 / 200, 9);
  expect(chance('fdp', 'union')).toBe(0.9); // ohne Sitze: Grundchance (für die Anzeige der Brandmauer)
});

test('mögliche Koalitionen mit den Startwerten 2025: minimal, nach Chance sortiert, Chance = Produkt', () => {
  const z = nachWahl('union');
  const liste = moeglicheKoalitionen(z);
  expect(liste.map((k) => k.partner)).toEqual([['spd'], ['gruene', 'linke']]);
  expect(liste[0]).toEqual({ partner: ['spd'], sitze: 329, chance: 0.7 });
  expect(liste[1].chance).toBeCloseTo(chance('union', 'gruene', z.sitze) * chance('union', 'linke', z.sitze), 10);
  // minimal: keine Kombination enthält eine andere
  for (const a of liste) for (const b of liste) if (a !== b) expect(b.partner.every((id) => a.partner.includes(id))).toBe(false);
  // SPD: nur mit der Union, Größenfaktor in der Chance
  expect(moeglicheKoalitionen(nachWahl('spd'))).toEqual([{ partner: ['union'], sitze: 329, chance: chance('spd', 'union', nachWahl('spd').sitze) }]);
});

test('mögliche Koalitionen: abgelehnte Partner fehlen, eigene Mehrheit zuerst mit Alleinregierung', () => {
  const z = nachWahl('union');
  expect(moeglicheKoalitionen({ ...z, abgelehnt: ['spd'] }).map((k) => k.partner)).toEqual([['gruene', 'linke']]);
  const allein = moeglicheKoalitionen(mitSitzen('union', { union: 400, spd: 100, gruene: 80, afd: 50 }));
  expect(allein.map((k) => k.partner)).toEqual([[], ['spd'], ['gruene']]);
  expect(allein[0].chance).toBe(1);
});

test('F11: Minderheitsregierung nur für die stärkste Fraktion und nur, wenn die Kanzlerwahl durchgeht', () => {
  // Startwerte 2025: Union ist stärkste Fraktion, AfD (Abstand 1) stimmt mit Ja: 361 Ja gegen 149 Nein
  const union = nachWahl('union');
  expect(minderheitsKanzlerwahl(union)).toMatchObject({ ja: 361, nein: 149, angenommen: true });
  expect(minderheitMoeglich(union)).toBe(true);
  expect(minderheitMoeglich(nachWahl('spd'))).toBe(false); // nicht stärkste Fraktion
  // stärkste Fraktion, aber die Wahl geht nicht durch: Grüne 200 vs. Union 190 + AfD 150 (Abstand 3 und 4 → Nein)
  expect(minderheitMoeglich(mitSitzen('gruene', { gruene: 200, union: 190, afd: 150 }))).toBe(false);
});

test('F11: als Minderheit antreten: Regierung, alle Ministerien, gezählt als gebildete Regierung', () => {
  const { state, ereignisse } = minderheitAntreten(nachWahl('union'));
  expect(state.phase).toBe('regierung');
  expect(state.koalition).toEqual({ partner: [], startAnteile: {}, minderheit: true, fehlschlaege: 0 });
  expect(Object.values(state.kabinett.verteilung).every((id) => id === 'union')).toBe(true);
  expect(state.statistik.regierungenGebildet).toBe(1);
  expect(ereignisse[0]).toContain('361 Ja gegen 149 Nein');
  expect(() => minderheitAntreten(nachWahl('spd'))).toThrow();
});

test('F11: Spiel endet erst, wenn weder Mehrheit noch Minderheitsregierung möglich ist', () => {
  // Union nach Absage aller Partner: keine Mehrheit mehr, aber Minderheit möglich → bleibt in der Regierungsbildung
  const z = { ...nachWahl('union'), abgelehnt: ['spd', 'gruene', 'linke'] };
  expect(mehrheitMoeglich(z)).toBe(false);
  expect(regierungMoeglich(z)).toBe(true);
  expect(regierungMoeglich({ ...nachWahl('spd'), abgelehnt: ['union', 'gruene', 'linke'] })).toBe(false);
});

test('F11 Brandmauer: AfD als stärkste Fraktion darf die Minderheits-Kanzlerwahl versuchen, scheitert sie: Opposition', () => {
  const z = mitSitzen('afd', { afd: 250, union: 200, spd: 180 });
  expect(minderheitsKanzlerwahl(z)).toMatchObject({ ja: 250, nein: 380, angenommen: false });
  expect(minderheitMoeglich(z)).toBe(true);
  expect(regierungMoeglich(z)).toBe(true);
  const { state, ereignisse } = minderheitAntreten(z);
  expect(state.phase).toBe('opposition');
  expect(state.rngZustand).not.toBe(z.rngZustand);
  expect(ereignisse[0]).toContain('gescheitert');
  // nicht stärkste Fraktion: kein Versuch
  expect(minderheitMoeglich(mitSitzen('afd', { afd: 150, union: 200 }))).toBe(false);
});
