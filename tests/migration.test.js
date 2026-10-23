import { test, expect } from 'vitest';
import { neuesSpiel, laden, speichern, ZUSTAND_VERSION } from '../src/engine/state.js';
import { config } from '../src/data/config.js';

// Spielstand der Version 9 (vor der Erweiterung „drei Systeme“) nachbauen: ohne die neuen Felder
function version9() {
  const { land, gruppen, kapital, ...rest } = neuesSpiel('spd', 4);
  return { ...rest, version: 9 };
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
  // migrierter Stand übersteht erneutes Speichern und Laden
  expect(laden(speichern(z))).toEqual(z);
});

test('Migration: zu alte oder kaputte Spielstände werden weiter abgelehnt', () => {
  expect(() => laden(JSON.stringify({ ...version9(), version: 8 }))).toThrow();
  expect(() => laden('{"kein":"spielstand"}')).toThrow();
});
