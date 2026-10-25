import { test, expect } from 'vitest';
import { neuesSpiel, speichern, laden } from '../src/engine/state.js';
import { wahlkampfWoche } from '../src/engine/wahlkampf.js';
import { verhandeln, moeglichePartner, mehrheit, mehrheitMoeglich, minderheitAntreten } from '../src/engine/koalition.js';
import { vorschlag, bestaetigen } from '../src/engine/kabinett.js';
import { haushaltBeschliessen, kuerzungsVorschlag } from '../src/engine/haushalt.js';
import { monatBeenden, haushaltsMonat } from '../src/engine/regierung.js';
import { ereignisEntscheiden } from '../src/engine/ereignisse.js';

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
  if (z.offenesEreignis) return ereignisEntscheiden(z, { wahl: 0 });
  if (!haushaltsMonat(z)) return monatBeenden(z);
  // unverändert, sonst so wenig kürzen, dass die Schuldenbremse hält (System 2)
  return haushaltBeschliessen(z, kuerzungsVorschlag(z) ?? {});
}

function durchlauf(parteiId, seed) {
  let z = neuesSpiel(parteiId, seed);
  const phasen = new Set();
  for (let i = 0; i < 2000 && !['sieg', 'opposition'].includes(z.phase); i++) {
    phasen.add(z.phase);
    z = zug(z).state;
    // nach jedem Zug: Zustand übersteht Speichern und Laden unverändert
    expect(laden(speichern(z))).toEqual(z);
  }
  return { z, phasen };
}

test('kompletter Durchlauf mit festem Seed bis zum Sieg, durch alle Phasen', () => {
  // Seed so gewählt, dass die Union über drei Wahlperioden regiert
  for (let seed = 1; seed < 50; seed++) {
    const { z, phasen } = durchlauf('union', seed);
    if (z.phase === 'sieg') {
      expect([...phasen].sort()).toEqual(['kabinett', 'koalition', 'regierung', 'wahlkampf']);
      expect(z.statistik.jahreKanzler).toBe(12);
      return;
    }
  }
  throw new Error('kein Seed mit Sieg gefunden');
});

test('Durchlauf endet für jede Partei ohne Fehler mit Sieg oder Opposition', () => {
  for (const partei of ['union', 'afd', 'spd', 'gruene', 'linke', 'bsw', 'fdp']) {
    expect(['sieg', 'opposition']).toContain(durchlauf(partei, 7).z.phase);
  }
});

test('gleicher Seed, gleicher Durchlauf', () => {
  expect(durchlauf('spd', 3).z).toEqual(durchlauf('spd', 3).z);
});

test('geteilter Seed (F07): gleicher Seed und gleiche Züge ergeben denselben Endzustand, der Seed bleibt erhalten', () => {
  const a = durchlauf('gruene', 4242).z;
  expect(a).toEqual(durchlauf('gruene', 4242).z);
  expect(a.seed).toBe(4242);
});
