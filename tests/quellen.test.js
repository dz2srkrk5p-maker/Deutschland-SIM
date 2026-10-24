import { test, expect } from 'vitest';
import { kennzahlen, gruppen, achsen, startQuellen } from '../src/data/kennzahlen.js';
import { einnahmearten } from '../src/data/einnahmen.js';
import { parteien } from '../src/data/parteien.js';
import { probleme } from '../src/data/probleme.js';
import { bereiche, akteure, AUSRICHTUNGEN } from '../src/data/reformwege.js';
import { ereignisse } from '../src/data/ereignisse.js';
import { laender } from '../src/data/laender.js';
import { ministerien, kanzleramt } from '../src/data/ministerien.js';
import { quellen as haushaltQuellen } from '../src/data/haushalt.js';
import { quellen as configQuellen } from '../src/data/config.js';

// Block 4: jede Herkunftsangabe ist „Quelle: <Name, Jahr>“ oder „Spielwert“
const gueltig = (q) => q === 'Spielwert' || /^Quelle: .+, \d{4}$/.test(q);
const pruefe = (eintrag) => {
  expect(eintrag.quelle, eintrag.id ?? eintrag.name).toBeDefined();
  const werte = typeof eintrag.quelle === 'string' ? [eintrag.quelle] : Object.values(eintrag.quelle);
  for (const q of werte) expect(gueltig(q), `${eintrag.id}: ${q}`).toBe(true);
};

test('Block 4: jeder Dateneintrag hat eine gültige Herkunft', () => {
  const eintraege = [
    ...kennzahlen, ...gruppen, ...achsen, ...einnahmearten, ...parteien, ...laender, ...ministerien, kanzleramt,
    ...probleme, ...probleme.flatMap((p) => p.loesungen), ...bereiche, ...bereiche.flatMap((b) => b.wege), ...akteure,
    ...Object.values(AUSRICHTUNGEN), ...ereignisse,
  ];
  eintraege.forEach(pruefe);
  for (const q of [...Object.values(startQuellen), ...Object.values(haushaltQuellen), ...Object.values(configQuellen)]) expect(gueltig(q), q).toBe(true);
  // Wirkungen sind nie belegt: Probleme, Reformwege, Ereignisse und Einnahmewirkungen bleiben Spielwerte
  expect([...probleme, ...bereiche.flatMap((b) => b.wege), ...ereignisse].every((e) => e.quelle === 'Spielwert')).toBe(true);
  expect(einnahmearten.every((a) => a.quelle.wirkung === 'Spielwert')).toBe(true);
});
