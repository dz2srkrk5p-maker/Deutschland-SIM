import { config } from '../data/config.js';
import { parteien } from '../data/parteien.js';
import { ministerien } from '../data/ministerien.js';
import { zufall } from './rng.js';
import { ansprueche } from './kabinett.js';
import { zurueckInDenWahlkampf } from './state.js';

const ko = config.koalition;
const partei = (id) => parteien.find((p) => p.id === id);
const sitzSumme = (sitze, ids) => ids.reduce((s, id) => s + (sitze[id] ?? 0), 0);

// Mehrheit der Mitglieder: mehr als die Hälfte aller Sitze
export function mehrheit(sitze) {
  return Math.floor(sitzSumme(sitze, Object.keys(sitze)) / 2) + 1;
}

// Chance, dass Partei b einer Koalition mit Partei a (Kanzlerpartei) zustimmt.
// Mit sitze: Ist b größer als a, sinkt die Chance im Verhältnis Sitze a / Sitze b (Größenfaktor, Balancing 2026-10-21).
export function chance(a, b, sitze) {
  if (ko.brandmauer.includes(a) || ko.brandmauer.includes(b)) return 0;
  const abstand = Math.abs(partei(a).sitzordnung - partei(b).sitzordnung);
  const grund = ko.chanceNachAbstand[abstand] ?? ko.chanceWeit;
  return sitze && sitze[b] > sitze[a] ? (grund * sitze[a]) / sitze[b] : grund;
}

// Parteien, die der Spieler noch fragen kann: im Bundestag, nicht abgelehnt, nicht hinter der Brandmauer
export function moeglichePartner(zustand) {
  const spieler = zustand.spielerParteiId;
  return parteien
    .map((p) => p.id)
    .filter((id) => id !== spieler && zustand.sitze[id] > 0 && !zustand.abgelehnt.includes(id) && chance(spieler, id) > 0);
}

// Gibt es noch irgendeine Koalition mit Mehrheit? (Wenn alle möglichen Partner zusammen reichen, reicht auch eine Teilmenge.)
export function mehrheitMoeglich(zustand) {
  const eigene = zustand.sitze[zustand.spielerParteiId] ?? 0;
  return eigene > 0 && eigene + sitzSumme(zustand.sitze, moeglichePartner(zustand)) >= mehrheit(zustand.sitze);
}

// Kanzlerwahl: jeder Koalitionsabgeordnete weicht mit fester Wahrscheinlichkeit ab.
function kanzlerwahl(zustand, koalitionsSitze) {
  let rngZustand = zustand.rngZustand;
  const noetig = mehrheit(zustand.sitze);
  const ereignisse = [];
  for (let gang = 1; gang <= ko.kanzlerWahlgaenge; gang++) {
    let ja = 0;
    for (let i = 0; i < koalitionsSitze; i++) {
      const r = zufall(rngZustand);
      rngZustand = r.rngZustand;
      if (r.wert >= ko.abweichlerWahrscheinlichkeit) ja++;
    }
    if (ja >= noetig) {
      ereignisse.push(`Kanzlerwahl, ${gang}. Wahlgang: gewählt mit ${ja} Stimmen (nötig ${noetig})`);
      const statistik = { ...zustand.statistik, regierungenGebildet: zustand.statistik.regierungenGebildet + 1 };
      const gewaehlt = { ...zustand, rngZustand, kanzlerParteiId: zustand.spielerParteiId, statistik };
      const a = ansprueche(gewaehlt);
      const state = { ...gewaehlt, rngZustand: a.rngZustand, phase: 'kabinett', kabinett: { anspruch: a.anspruch, verteilung: null } };
      // Alleinregierung: nichts zu verteilen, alle Ministerien an den Spieler
      if (zustand.koalition.partner.length === 0) {
        const alle = Object.fromEntries(ministerien.map((m) => [m.id, zustand.spielerParteiId]));
        return { state: { ...state, phase: 'regierung', kabinett: { ...state.kabinett, verteilung: alle } }, ereignisse: [...ereignisse, 'Kabinett vereidigt'] };
      }
      return { state, ereignisse };
    }
    ereignisse.push(`Kanzlerwahl, ${gang}. Wahlgang: durchgefallen mit ${ja} Stimmen (nötig ${noetig})`);
  }
  ereignisse.push('Neuwahl: Kein Kanzler gewählt, zurück in den Wahlkampf');
  return { state: zurueckInDenWahlkampf({ ...zustand, rngZustand }), ereignisse };
}

// Aktion: mit den gewählten Partnern verhandeln; gelingt es, folgt sofort die Kanzlerwahl.
export function verhandeln(zustand, { partner }) {
  if (zustand.phase !== 'koalition') throw new Error('Keine Koalitionsverhandlung');
  const erlaubt = moeglichePartner(zustand);
  const ungueltig = partner.filter((id) => !erlaubt.includes(id));
  if (ungueltig.length) throw new Error(`Ungültige Partner: ${ungueltig.join(', ')}`);
  const beteiligte = [zustand.spielerParteiId, ...partner];
  if (sitzSumme(zustand.sitze, beteiligte) < mehrheit(zustand.sitze)) throw new Error('Keine Mehrheit');

  // Reihenfolge wie in parteien.js, damit die Auswahlreihenfolge den Zufall nicht ändert
  const reihenfolge = parteien.map((p) => p.id).filter((id) => partner.includes(id));
  let rngZustand = zustand.rngZustand;
  const absagen = [];
  const ereignisse = [];
  for (const id of reihenfolge) {
    const r = zufall(rngZustand);
    rngZustand = r.rngZustand;
    const zusage = r.wert < chance(zustand.spielerParteiId, id, zustand.sitze);
    ereignisse.push(`${partei(id).name} ${zusage ? 'stimmt zu' : 'lehnt ab'}`);
    if (!zusage) absagen.push(id);
  }

  if (absagen.length) {
    const state = { ...zustand, rngZustand, abgelehnt: [...zustand.abgelehnt, ...absagen] };
    if (mehrheitMoeglich(state)) return { state, ereignisse };
    return { state: { ...state, phase: 'opposition' }, ereignisse: [...ereignisse, 'Keine Mehrheit mehr möglich: Opposition'] };
  }

  const namen = [zustand.spielerParteiId, ...reihenfolge].map((id) => partei(id).name);
  const name = partner.length ? `Koalition aus ${namen.join(', ')}` : 'Alleinregierung';
  // startAnteile: Umfragewerte der Partner bei Regierungsbildung, Maßstab für den Koalitionsbruch (M10)
  const startAnteile = Object.fromEntries(reihenfolge.map((id) => [id, zustand.anteile[id]]));
  const mitKoalition = { ...zustand, rngZustand, koalition: { partner: reihenfolge, startAnteile } };
  const wahl = kanzlerwahl(mitKoalition, sitzSumme(zustand.sitze, beteiligte));
  return { state: wahl.state, ereignisse: [...ereignisse, `${name} steht`, ...wahl.ereignisse] };
}
