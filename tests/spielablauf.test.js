import { test, expect } from 'vitest';
import { neuesSpiel, speichern, laden } from '../src/engine/state.js';
import { wahlkampfWoche } from '../src/engine/wahlkampf.js';
import { verhandeln, moeglichePartner, mehrheit } from '../src/engine/koalition.js';
import { vorschlag, bestaetigen } from '../src/engine/kabinett.js';
import { haushaltBeschliessen } from '../src/engine/haushalt.js';

// Einfacher Spieler: Plakate, Partner nach Größe bis zur Mehrheit, Kabinettsvorschlag, Haushalt unverändert
function zug(z) {
  if (z.phase === 'wahlkampf') return wahlkampfWoche(z, { aktion: 'plakate' });
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
  return haushaltBeschliessen(z, {});
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
