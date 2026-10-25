import { test, expect } from 'vitest';
import { neuesSpiel, laden, speichern, ZUSTAND_VERSION } from '../src/engine/state.js';
import { config } from '../src/data/config.js';

// Spielstand der Version 9 (vor der Erweiterung „drei Systeme“) nachbauen: ohne die neuen Felder
function version9() {
  const { land, gruppen, kapital, ...rest } = neuesSpiel('spd', 4);
  const { einnahmen, ...haushalt } = rest.haushalt;
  return { ...rest, haushalt: { ...haushalt, steuern: 387210000 * 1.02 }, version: 9 };
}

test('Migration: Version 9 wird auf die aktuelle Version gehoben, alte Felder bleiben unverändert', () => {
  const alt = { ...version9(), phase: 'regierung', anteile: { ...version9().anteile, spd: 20 } };
  const z = laden(JSON.stringify(alt));
  expect(z.version).toBe(ZUSTAND_VERSION);
  expect(z.anteile.spd).toBe(20);
  expect(z.phase).toBe('regierung');
  expect(z.land).toMatchObject({ wachstum: 0.2, inflation: 2.2, arbeitslosigkeit: 6.3, schuldenquote: 63.5 });
  expect(Object.values(z.gruppen).every((g) => g === 50)).toBe(true);
  expect(z.kapital).toBe(config.kapital.start);
  // Version 11: die alte Steuersumme (+2 %) wird als Faktor auf alle Steuerarten übertragen
  expect(z.haushalt.steuern).toBeUndefined();
  expect(z.haushalt.einnahmen).toEqual({ stufen: {}, ausgestaltung: [], altFaktor: 1.02 });
  expect(z.land.preise).toBe(1);
  // migrierter Stand übersteht erneutes Speichern und Laden
  expect(laden(speichern(z))).toEqual(z);
});

test('Migration: zu alte oder kaputte Spielstände werden weiter abgelehnt', () => {
  expect(() => laden(JSON.stringify({ ...version9(), version: 8 }))).toThrow();
  expect(() => laden('{"kein":"spielstand"}')).toThrow();
});

test('Migration: Version 18 bekommt einen Wirtschaftsverlauf, der mit dem aktuellen Stand beginnt', () => {
  const { wirtschaftVerlauf, ...rest } = neuesSpiel('union', 2);
  const alt = { ...rest, version: 18, land: { ...rest.land, wachstum: 1.4, schuldenquote: 70.2 } };
  const z = laden(JSON.stringify(alt));
  expect(z.version).toBe(ZUSTAND_VERSION);
  expect(z.wirtschaftVerlauf).toHaveLength(1);
  expect(z.wirtschaftVerlauf[0]).toMatchObject({ wachstum: 1.4, schuldenquote: 70.2 });
});

test('Migration 21 → 22: Quartal wird Monat, Rundenzähler und Fristen ×3, Landtagswahl im Monat der Daten', () => {
  const { monat, aktionenImMonat, ...rest } = neuesSpiel('union', 3);
  const nw = rest.laender.nw;
  const alt = {
    ...rest, version: 21, quartal: 4, aktionenImQuartal: 2, runde: 5,
    reformwege: { st_einfach: { status: 'umsetzung', fertig: 7, start: 3 } },
    loesungen: { wohnen1: { status: 'laufend', fertig: 6 } },
    verfahren: [{ typ: 'einnahme', id: 'vermoegen', stufen: 10, faellig: 8 }],
    koalition: { partner: ['spd'], ultimatum: { spd: 6 } },
    laender: { ...rest.laender, nw: { ...nw, wahl: { jahr: 2027, quartal: 2 } } },
  };
  const z = laden(JSON.stringify(alt));
  expect(z.version).toBe(ZUSTAND_VERSION);
  expect(z.monat).toBe(12); // Haushaltsquartal → Haushaltsmonat
  expect(z.quartal).toBeUndefined();
  expect(z.aktionenImMonat).toBe(1);
  expect(z.runde).toBe(15);
  expect(z.reformwege.st_einfach).toMatchObject({ fertig: 21, start: 9 });
  expect(z.loesungen.wohnen1.fertig).toBe(18);
  expect(z.verfahren[0].faellig).toBe(24);
  expect(z.koalition.ultimatum.spd).toBe(18);
  expect(z.laender.nw.wahl).toEqual({ jahr: 2027, monat: 4 });
  expect(laden(JSON.stringify({ ...alt, quartal: 2 })).monat).toBe(4);
});
