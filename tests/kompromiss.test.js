import { test, expect } from 'vitest';
import { einnahmearten } from '../src/data/einnahmen.js';
import { config } from '../src/data/config.js';
import { ministerien } from '../src/data/ministerien.js';
import { neuesSpiel } from '../src/engine/state.js';
import { bundesratAbstimmung, kompromissMoeglich } from '../src/engine/bundesrat.js';
import { weg, wegSperre, wegVorschau, wegBeschliessen, reformwegeQuartal, wegEinnahmen } from '../src/engine/reformwege.js';
import { vorschau, haushaltBeschliessen } from '../src/engine/haushalt.js';

// Steueränderung in früheren (geeichten) Stufen → Reglerschritte (feinere Schritte seit 2026-10-25)
const fein = (id, stufen) => { const p = einnahmearten.find((a) => a.id === id).parameter; return Math.round((stufen * (p.eichSchritt ?? p.schritt)) / p.schritt); };

const km = config.kompromiss;
// Union + SPD: 24 von 35 Bundesratsstimmen, es fehlen 11 – Kompromiss möglich
const regierung = (partner = ['spd'], extra = {}) => ({
  ...neuesSpiel('union', 1), phase: 'regierung', quartal: 1, runde: 4, kanzlerParteiId: 'union', kapital: 100,
  sitze: { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 },
  koalition: { partner, startAnteile: Object.fromEntries(partner.map((p) => [p, 15])), minderheit: false, fehlschlaege: 0 },
  kabinett: { anspruch: {}, verteilung: Object.fromEntries(ministerien.map((m) => [m.id, 'union'])) },
  ...extra,
});

test('Feature 6: Kompromiss nur bei höchstens maxFehlend fehlenden Stimmen', () => {
  expect(kompromissMoeglich(bundesratAbstimmung(['union', 'spd']))).toBe(true); // 24 von 35
  expect(kompromissMoeglich(bundesratAbstimmung(['spd', 'gruene', 'linke']))).toBe(km.maxFehlend >= 35 - 18);
  expect(kompromissMoeglich(bundesratAbstimmung(['union', 'spd', 'gruene']))).toBe(false); // Mehrheit vorhanden
  const z = regierung();
  expect(wegSperre(z, 'r_buerger')).toMatchObject({ grund: 'keine Mehrheit im Bundesrat', kompromiss: true });
  expect(wegSperre(z, 'r_buerger', { kompromiss: true })).toBeNull();
  // Kapital für den Kompromiss reicht nicht
  const knapp = { ...z, kapital: weg('r_buerger').kapital + km.kapital - 1 };
  expect(wegSperre(knapp, 'r_buerger', { kompromiss: true }).grund).toContain('Kapital');
});

test('Feature 6: Reformweg als Kompromiss – abgeschwächt, teurer, gekennzeichnet', () => {
  const z = regierung();
  const w = weg('r_buerger');
  const v = wegVorschau(z, 'r_buerger');
  expect(v.kompromissKapital).toBe(w.kapital + km.kapital);
  const { state, ereignisse } = wegBeschliessen(z, { wegId: 'r_buerger', kompromiss: true });
  expect(state.reformwege.r_buerger).toBeDefined(); // Union + SPD tragen den Weg im Bundestag
  expect(state.reformwege.r_buerger.kompromiss).toBe(true);
  expect(state.kapital).toBe(100 - w.kapital - km.kapital);
  expect(ereignisse.some((e) => e.startsWith('Kompromiss im Bundesrat'))).toBe(true);
  // Einnahmen abgeschwächt (Unternehmensteuern senken: Körperschaftsteuer)
  const st = wegBeschliessen(z, { wegId: 'st_unternehmen', kompromiss: true }).state;
  expect(wegEinnahmen(st).koerperschaft[0]).toEqual({ quelle: 'Unternehmensteuern senken (Kompromiss)', betrag: Math.round(weg('st_unternehmen').einnahmen.koerperschaft * km.wirkungFaktor) });
  // Langwirkung bei Erfolg abgeschwächt
  const fertig = { ...state, runde: 99 };
  const laeufe = Array.from({ length: 20 }, (_, i) => reformwegeQuartal({ ...fertig, rngZustand: i * 11 + 5 }).state);
  const ok = laeufe.find((s) => s.reformwege.r_buerger.status === 'beschlossen');
  for (const [pid, x] of Object.entries(w.lang?.probleme ?? {})) {
    expect(ok.probleme[pid].wert).toBeCloseTo(Math.max(0, fertig.probleme[pid].wert + x * km.wirkungFaktor), 0);
  }
});

test('Feature 6: Haushalt mit Steueränderung – Ausgleichszahlung und Kapital statt Scheitern', () => {
  const z = { ...regierung(), quartal: 4 };
  const entwurf = { einnahmen: { umsatz: fein('umsatz', 1) } };
  expect(vorschau(z, entwurf).bundesrat.mehrheit).toBe(false);
  expect(() => haushaltBeschliessen(z, entwurf)).toThrow('Bundesrat');
  const mit = vorschau(z, { ...entwurf, kompromiss: true });
  expect(mit.bundesrat).toMatchObject({ mehrheit: true, kompromiss: true });
  expect(mit.ausgleich).toBe(km.laenderAusgleich);
  expect(mit.bilanz.neueSchulden - vorschau(z, entwurf).bilanz.neueSchulden).toBe(km.laenderAusgleich);
  const { state, ereignisse } = haushaltBeschliessen(z, { ...entwurf, kompromiss: true });
  expect(state.kapital).toBe(100 - km.kapital);
  expect(ereignisse.some((e) => e.startsWith('Kompromiss im Bundesrat'))).toBe(true);
  expect(state.haushalt.einnahmen.stufen.umsatz).toBe(fein('umsatz', 1));
});
