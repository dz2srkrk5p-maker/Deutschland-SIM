import { test, expect } from 'vitest';
import { ansprueche, vorschlag, pruefeVerteilung, bestaetigen } from '../src/engine/kabinett.js';
import { verhandeln } from '../src/engine/koalition.js';
import { neuesSpiel } from '../src/engine/state.js';
import { ministerien } from '../src/data/ministerien.js';

const summe = (o) => Object.values(o).reduce((s, n) => s + n, 0);

// Zustand in Phase Kabinett: SPD 132 + Union 191 (Beispiel aus der Browserprüfung von M6)
const imKabinett = () => {
  const z = { ...neuesSpiel('spd', 1), phase: 'kabinett', sitze: { union: 191, afd: 138, spd: 132, gruene: 74, linke: 60, bsw: 35 }, koalition: { partner: ['union'] } };
  return { ...z, kabinett: { anspruch: ansprueche(z).anspruch, verteilung: null } };
};

test('Ansprüche nach Sainte-Laguë: SPD 132 + Union 191 → SPD 7, Union 9', () => {
  expect(imKabinett().kabinett.anspruch).toEqual({ spd: 7, union: 9 });
});

test('Ansprüche ergeben immer 16, auch bei drei Partnern', () => {
  const z = { ...neuesSpiel('spd', 1), sitze: { spd: 150, gruene: 90, linke: 80 }, koalition: { partner: ['gruene', 'linke'] } };
  expect(summe(ansprueche(z).anspruch)).toBe(ministerien.length);
});

test('Vorschlag hält die Ansprüche ein und ist gültig', () => {
  const z = imKabinett();
  const v = vorschlag(z);
  expect(Object.keys(v)).toHaveLength(16);
  expect(pruefeVerteilung(z, v)).toEqual([]);
  expect(v.finanzen).toBe('spd'); // Spieler wählt zuerst
});

test('ungültige Verteilungen werden abgelehnt', () => {
  const z = imKabinett();
  const v = vorschlag(z);
  expect(() => bestaetigen(z, { verteilung: { ...v, finanzen: 'union', inneres: 'union' } })).toThrow(); // falsche Anzahl
  expect(() => bestaetigen(z, { verteilung: { ...v, finanzen: 'afd' } })).toThrow(); // nicht in der Koalition
  const ohne = { ...v };
  delete ohne.finanzen;
  expect(() => bestaetigen(z, { verteilung: ohne })).toThrow(); // Ministerium ohne Partei
  expect(() => bestaetigen({ ...z, phase: 'regierung' }, { verteilung: v })).toThrow();
});

test('Bestätigen startet die Regierung', () => {
  const z = imKabinett();
  const { state } = bestaetigen(z, { verteilung: vorschlag(z) });
  expect(state.phase).toBe('regierung');
  expect(state.kabinett.verteilung).toEqual(vorschlag(z));
});

test('Alleinregierung: alle 16 Ministerien an den Spieler, direkt Regierung', () => {
  const z = { ...neuesSpiel('union', 1), phase: 'koalition', sitze: { union: 400, spd: 230 } };
  const { state } = verhandeln(z, { partner: [] });
  expect(state.phase).toBe('regierung');
  expect(state.kabinett.anspruch).toEqual({ union: 16 });
  expect(Object.values(state.kabinett.verteilung).every((id) => id === 'union')).toBe(true);
});

test('Koalition nach erfolgreicher Kanzlerwahl: Phase Kabinett mit Ansprüchen', () => {
  for (let seed = 1; seed < 50; seed++) {
    const z = { ...neuesSpiel('spd', seed), phase: 'koalition', sitze: { union: 191, afd: 138, spd: 132, gruene: 74, linke: 60, bsw: 35 } };
    const { state } = verhandeln(z, { partner: ['union', 'gruene'] });
    if (state.phase === 'kabinett') {
      expect(summe(state.kabinett.anspruch)).toBe(16);
      expect(Object.keys(state.kabinett.anspruch).sort()).toEqual(['gruene', 'spd', 'union']);
      return;
    }
  }
  throw new Error('kein passender Seed gefunden');
});
