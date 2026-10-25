import { test, expect } from 'vitest';
import { neuesSpiel, speichern, laden } from '../src/engine/state.js';
import { wahlkampfWoche } from '../src/engine/wahlkampf.js';
import { verhandeln, moeglichePartner, mehrheit, mehrheitMoeglich, minderheitAntreten } from '../src/engine/koalition.js';
import { vorschlag, bestaetigen } from '../src/engine/kabinett.js';
import { haushaltBeschliessen, kuerzungsVorschlag } from '../src/engine/haushalt.js';
import { monatBeenden, haushaltsMonat } from '../src/engine/regierung.js';
import { ereignisEntscheiden } from '../src/engine/ereignisse.js';
import { oppositionMonat } from '../src/engine/opposition.js';

// Einfacher Spieler: Plakate, Partner nach Größe bis zur Mehrheit, Kabinettsvorschlag, Haushalt unverändert
function zug(z) {
  if (z.phase === 'wahlkampf') return wahlkampfWoche(z, { aktion: 'plakate' });
  // ohne mögliche Mehrheit bleibt seit F11 die Minderheitsregierung
  if (z.phase === 'koalition' && !mehrheitMoeglich(z)) return minderheitAntreten(z);
  if (z.phase === 'koalition') {
    const partner = [];
    let sitze = z.sitze[z.spielerParteiId];
    for (const id of moeglichePartner(z).sort((a, b) => z.sitze[b] - z.sitze[a])) {
      if (sitze >= mehrheit(z.sitze)) break;
      partner.push(id);
      sitze += z.sitze[id];
    }
    return verhandeln(z, { partner });
  }
  if (z.phase === 'kabinett') return bestaetigen(z, { verteilung: vorschlag(z) });
  if (z.phase === 'opposition') return oppositionMonat(z);
  if (z.offenesEreignis) return ereignisEntscheiden(z, { wahl: 0 });
  if (!haushaltsMonat(z)) return monatBeenden(z);
  // unverändert, sonst so wenig kürzen, dass die Schuldenbremse hält (System 2)
  return haushaltBeschliessen(z, kuerzungsVorschlag(z) ?? {});
}

// Partie über so viele Kalenderjahre (Etappe 0b: die Partie endet nicht, in der Opposition geht es weiter)
function durchlauf(parteiId, seed, jahre = 12) {
  let z = neuesSpiel(parteiId, seed);
  const ende = z.jahr + jahre;
  const phasen = new Set();
  for (let i = 0; i < 5000 && z.jahr < ende; i++) {
    phasen.add(z.phase);
    z = zug(z).state;
    // nach jedem Zug: Zustand übersteht Speichern und Laden unverändert
    expect(laden(speichern(z))).toEqual(z);
  }
  return { z, phasen };
}

test('Durchlauf über 12 Jahre durch alle Phasen, die Partie endet nicht', () => {
  const { z, phasen } = durchlauf('union', 1);
  expect(z.jahr).toBeGreaterThanOrEqual(neuesSpiel('union', 1).jahr + 12);
  for (const p of ['wahlkampf', 'koalition', 'regierung']) expect(phasen.has(p)).toBe(true);
  expect(phasen.has('sieg')).toBe(false);
});

test('jede Partei spielt 12 Jahre ohne Fehler; kleine Parteien erleben die Opposition', () => {
  const start = neuesSpiel('union', 7).jahr;
  const phasenAlle = {};
  for (const partei of ['union', 'afd', 'spd', 'gruene', 'linke', 'bsw', 'fdp']) {
    const { z, phasen } = durchlauf(partei, 7);
    expect(z.jahr).toBeGreaterThanOrEqual(start + 12);
    phasenAlle[partei] = phasen;
  }
  expect(phasenAlle.linke.has('opposition')).toBe(true);
});

test('gleicher Seed, gleicher Durchlauf', () => {
  expect(durchlauf('spd', 3).z).toEqual(durchlauf('spd', 3).z);
});

test('geteilter Seed (F07): gleicher Seed und gleiche Züge ergeben denselben Endzustand, der Seed bleibt erhalten', () => {
  const a = durchlauf('gruene', 4242).z;
  expect(a).toEqual(durchlauf('gruene', 4242).z);
  expect(a.seed).toBe(4242);
});
