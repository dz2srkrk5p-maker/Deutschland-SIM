// Einfacher Mess-Spieler für Durchlauf-Tests: Plakate, Partner nach Größe bis zur Mehrheit, Kabinettsvorschlag,
// Haushalt unverändert (sonst Kürzungsvorschlag, sonst vorläufige Haushaltsführung), Ereignisse mit der ersten Möglichkeit.
import { wahlkampfWoche } from '../../src/engine/wahlkampf.js';
import { verhandeln, moeglichePartner, mehrheit, mehrheitMoeglich, minderheitAntreten } from '../../src/engine/koalition.js';
import { vorschlag, bestaetigen } from '../../src/engine/kabinett.js';
import { haushaltBeschliessen, kuerzungsVorschlag, vorlaeufigMoeglich } from '../../src/engine/haushalt.js';
import { monatBeenden, haushaltsMonat } from '../../src/engine/regierung.js';
import { ereignisEntscheiden } from '../../src/engine/ereignisse.js';
import { oppositionMonat } from '../../src/engine/opposition.js';
import { titelseiteGelesen } from '../../src/engine/epochen.js';

export function zug(z) {
  if (z.epochen?.titelseite) return titelseiteGelesen(z);
  if (z.phase === 'wahlkampf') return wahlkampfWoche(z, { aktion: 'plakate' });
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
  if (vorlaeufigMoeglich(z)) return haushaltBeschliessen(z, { vorlaeufig: true });
  return haushaltBeschliessen(z, kuerzungsVorschlag(z) ?? {});
}
