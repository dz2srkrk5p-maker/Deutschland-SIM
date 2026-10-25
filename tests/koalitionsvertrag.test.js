import { test, expect } from 'vitest';
import { config } from '../src/data/config.js';
import { ministerien } from '../src/data/ministerien.js';
import { weg } from '../src/engine/reformwege.js';
import { neuesSpiel } from '../src/engine/state.js';
import { bestaetigen, vorschlag, vorhabenVorschlag } from '../src/engine/kabinett.js';
import { vertragsVorschlaege, vertragNachBeschluss, vertragHaushalt, faellig } from '../src/engine/koalitionsvertrag.js';
import { wegBeschliessen } from '../src/engine/reformwege.js';
import { haushaltBeschliessen, koalitionsbruch } from '../src/engine/haushalt.js';

const kv = config.koalitionsvertrag;
// Kabinettsbildung Union + SPD
const kabinett = () => ({
  ...neuesSpiel('union', 2), phase: 'kabinett', kanzlerParteiId: 'union', sitze: { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 },
  koalition: { partner: ['spd'], startAnteile: { spd: 16.4 }, minderheit: false, fehlschlaege: 0 },
  kabinett: { anspruch: { union: 10, spd: 6 }, verteilung: null },
});

test('Feature 7: Vorschläge je Partner aus verschiedenen Bereichen, nahe am Partnerprofil', () => {
  const v = vertragsVorschlaege(kabinett());
  expect(v.spd).toHaveLength(kv.vorschlaegeJePartner);
  expect(new Set(v.spd.map((id) => weg(id).bereich.id)).size).toBe(v.spd.length);
  expect(v.spd.every((id) => !weg(id).braucht)).toBe(true);
  // SPD-nahe Wege, keine marktliberalen oder nationalen
  expect(v.spd.every((id) => !['marktliberal', 'national'].includes(weg(id).richtung))).toBe(true);
});

test('Feature 7: Vereidigen legt den Vertrag an, Prüfung der Auswahl', () => {
  const z = kabinett();
  const { state, ereignisse } = bestaetigen(z, { verteilung: vorschlag(z) });
  expect(state.koalition.vertrag.vorhaben).toEqual(vorhabenVorschlag(z).map((v) => ({ ...v, status: 'offen' })));
  expect(Object.values(state.koalition.vertrag.ressorts).every((id) => id === 'spd')).toBe(true);
  expect(Object.keys(state.koalition.vertrag.ressorts)).toHaveLength(6);
  expect(ereignisse.some((e) => e.startsWith('Koalitionsvertrag unterzeichnet'))).toBe(true);
  expect(() => bestaetigen(z, { verteilung: vorschlag(z), vorhaben: [] })).toThrow('1 bis');
  expect(() => bestaetigen(z, { verteilung: vorschlag(z), vorhaben: [{ wegId: 'a_flex', partei: 'spd' }] })).toThrow('Vorschlägen');
});

test('Feature 7: Erfüllen belohnt, anderer Weg im Bereich bricht den Vertrag', () => {
  const z = kabinett();
  const imAmt = { ...bestaetigen(z, { verteilung: vorschlag(z) }).state, quartal: 1, kapital: 100, runde: 1 };
  const [v] = imAmt.koalition.vertrag.vorhaben;
  const erfuellt = vertragNachBeschluss(imAmt, v.wegId);
  expect(erfuellt.vertrag.vorhaben[0].status).toBe('umgesetzt');
  expect(erfuellt.posten).toEqual([{ ursache: `Koalitionsvertrag erfüllt: ${weg(v.wegId).name}`, partei: 'spd', wert: kv.bonusUmsetzung }]);
  const anderer = weg(v.wegId).bereich.wege.find((w) => !w.braucht && w.id !== v.wegId);
  const gebrochen = vertragNachBeschluss(imAmt, anderer.id);
  expect(gebrochen.vertrag.vorhaben[0].status).toBe('gebrochen');
  expect(gebrochen.posten[0].wert).toBe(-kv.strafeBruch);
  // im echten Beschluss: Umfrage-Bilanz zeigt die Vertragsfolge
  const r = wegBeschliessen(imAmt, { wegId: anderer.id, kompromiss: true });
  if (r.state.reformwege[anderer.id]) expect(r.state.umfrageBilanz.at(-1).posten.some((p) => p.ursache.startsWith('Koalitionsvertrag gebrochen'))).toBe(true);
});

test('Feature 7: Haushalt – Kürzung im Partner-Ressort und Rückstand kosten den Partner; Bruch entfernt seine Vorhaben', () => {
  const z = kabinett();
  const imAmt = { ...bestaetigen(z, { verteilung: vorschlag(z) }).state, quartal: 4 };
  const partnerRessort = Object.keys(imAmt.koalition.vertrag.ressorts)[0];
  const posten = vertragHaushalt({ ...imAmt, haushalt: { ...imAmt.haushalt, jahr: 2 } }, { [partnerRessort]: -kv.kuerzungAbProzent / config.haushalt.ministerSchrittProzent });
  expect(posten.some((p) => p.ursache.includes('deutlich gekürzt') && p.wert === -kv.strafeKuerzung)).toBe(true);
  expect(faellig(1, 1)).toBe(0);
  expect(faellig(1, 4)).toBe(1);
  expect(faellig(2, 2)).toBe(1);
  expect(posten.some((p) => p.ursache.includes('Rückstand'))).toBe(false); // ein Vorhaben ist in Jahr 2 noch nicht fällig
  expect(vertragHaushalt({ ...imAmt, haushalt: { ...imAmt.haushalt, jahr: 4 } }).find((p) => p.ursache.includes('Rückstand')).wert).toBeCloseTo(-kv.strafeRueckstand, 6);
  // im Haushaltsbeschluss sichtbar
  const r = haushaltBeschliessen({ ...imAmt, haushalt: { ...imAmt.haushalt, jahr: 4 } }, {});
  expect(r.ereignisse.some((e) => e.startsWith('Koalitionsvertrag: 1 Vorhaben im Rückstand'))).toBe(true);
  // Bruch: Vorhaben und Ressorts des Partners entfallen
  const bruch = koalitionsbruch({ ...imAmt, anteile: { ...imAmt.anteile, spd: 10 } });
  expect(bruch.state.koalition.vertrag).toEqual({ vorhaben: [], ressorts: {} });
});
