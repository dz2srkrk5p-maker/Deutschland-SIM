// Opposition (Etappe 0b, 2026-10-25): Die Partie endet nicht. Kann der Spieler keine Regierung bilden, regieren die
// anderen: Die stärkste Fraktion (ohne den Spieler) bildet mit den inhaltlich nächsten Parteien eine Koalition, sonst eine
// Minderheitsregierung. Sie beschließt im Dezember den Haushalt und gelegentlich einen Reformweg (config.ki). Der Spieler
// schaltet Monate weiter bis zur nächsten Wahl (Ende der Wahlperiode oder Neuwahl nach einem Koalitionsbruch).
import { config } from '../data/config.js';
import { parteien } from '../data/parteien.js';
import { bereiche } from '../data/reformwege.js';
import { monatsname } from '../data/kalender.js';
import { zufall } from './rng.js';
import { mehrheit } from './koalition.js';
import { ansprueche, vorschlag } from './kabinett.js';
import { wegVektor, wegSperre, wegVorschau, wegBeschliessen, bereichStatus } from './reformwege.js';
import { parteiPosition, abstand } from './profil.js';
import { haushaltBeschliessen, kuerzungsVorschlag } from './haushalt.js';
import { monatsabschluss } from './regierung.js';
import { zurueckInDenWahlkampf } from './state.js';

const name = (id) => parteien.find((p) => p.id === id).name;
const sitzordnung = (id) => parteien.find((p) => p.id === id).sitzordnung;
const brandmauer = (id) => config.koalition.brandmauer.includes(id);

// Wer regiert ohne den Spieler? Kanzlerpartei in der Reihenfolge der Sitze (Brandmauer-Parteien finden keine Partner),
// Partner nach Nähe in der Sitzordnung, bis die Mehrheit steht. Ohne Mehrheit: Minderheitsregierung der stärksten Partei,
// die nicht hinter der Brandmauer steht.
export function regierungDerAnderen(zustand) {
  const sitze = zustand.sitze;
  const noetig = mehrheit(sitze);
  const andere = parteien.map((p) => p.id).filter((id) => id !== zustand.spielerParteiId && (sitze[id] ?? 0) > 0);
  const nachSitzen = [...andere].sort((a, b) => sitze[b] - sitze[a]);
  for (const kanzler of nachSitzen.filter((id) => !brandmauer(id))) {
    const kandidaten = andere
      .filter((id) => id !== kanzler && !brandmauer(id))
      .sort((a, b) => Math.abs(sitzordnung(a) - sitzordnung(kanzler)) - Math.abs(sitzordnung(b) - sitzordnung(kanzler)) || sitze[b] - sitze[a]);
    const partner = [];
    let summe = sitze[kanzler];
    for (const id of kandidaten) {
      if (summe >= noetig) break;
      partner.push(id);
      summe += sitze[id];
    }
    if (summe >= noetig) return { kanzler, partner: parteien.map((p) => p.id).filter((id) => partner.includes(id)), minderheit: false };
  }
  const kanzler = nachSitzen.find((id) => !brandmauer(id)) ?? nachSitzen[0];
  return { kanzler, partner: [], minderheit: true };
}

// Spieler geht in die Opposition: Die anderen bilden die Regierung, Kabinett nach Sitzen, kein Koalitionsvertrag.
export function inDieOpposition(zustand, ereignisse = []) {
  const r = regierungDerAnderen(zustand);
  const startAnteile = Object.fromEntries(r.partner.map((id) => [id, zustand.anteile[id]]));
  const gebildet = {
    ...zustand, phase: 'opposition', kanzlerParteiId: r.kanzler, offenesEreignis: null,
    koalition: { partner: r.partner, startAnteile, minderheit: r.minderheit, fehlschlaege: 0, vertrag: null },
  };
  const a = ansprueche(gebildet);
  const mitAnspruch = { ...gebildet, rngZustand: a.rngZustand, kabinett: { anspruch: a.anspruch, verteilung: null } };
  const state = { ...mitAnspruch, kabinett: { ...mitAnspruch.kabinett, verteilung: vorschlag(mitAnspruch) } };
  const regierung = [r.kanzler, ...r.partner].map(name).join(', ');
  return {
    state,
    ereignisse: [...ereignisse, `Opposition: ${r.minderheit ? `Minderheitsregierung ${name(r.kanzler)}` : `Regierung aus ${regierung}`}, Kanzlerpartei ${name(r.kanzler)}`],
  };
}

// Die Regierung der anderen wählt mit fester Chance einen Reformweg: den Grundweg eines freien Bereichs, der ihrer
// Kanzlerpartei inhaltlich am nächsten liegt und eine Mehrheit hat (Bundestag, wenn nötig Bundesrat). Gleiche Beschlussregel
// wie für den Spieler; politisches Kapital und Aufmerksamkeit spielen für sie keine Rolle.
function reformDerAnderen(zustand) {
  const ob = zufall(zustand.rngZustand);
  const z = { ...zustand, rngZustand: ob.rngZustand };
  if (ob.wert >= config.ki.reformChanceJeMonat) return { state: z, ereignisse: [] };
  const position = parteiPosition(z.kanzlerParteiId);
  const alsRegierung = { ...z, phase: 'regierung', kapital: config.kapital.max, aktionenImMonat: 0 };
  const kandidat = bereiche
    .filter((b) => !bereichStatus(z, b).weg)
    .flatMap((b) => b.wege.filter((w) => !w.braucht))
    .filter((w) => !wegSperre(alsRegierung, w.id))
    .filter((w) => wegVorschau(alsRegierung, w.id).abstimmung.angenommen)
    .sort((a, b) => abstand(position, wegVektor(a)) - abstand(position, wegVektor(b)))[0];
  if (!kandidat) return { state: z, ereignisse: [] };
  const r = wegBeschliessen(alsRegierung, { wegId: kandidat.id });
  return { state: { ...r.state, phase: 'opposition', kapital: z.kapital, aktionenImMonat: z.aktionenImMonat }, ereignisse: r.ereignisse.map((e) => `Regierung: ${e}`) };
}

// Haushalt der anderen im Dezember: unverändert, sonst mit dem Kürzungsvorschlag; geht beides nicht (Schuldenbremse,
// fehlende Mehrheit), gilt der Vorjahreshaushalt weiter.
function haushaltDerAnderen(zustand) {
  const versuche = [{}, kuerzungsVorschlag(zustand)].filter(Boolean);
  for (const params of versuche) {
    try {
      return haushaltBeschliessen(zustand, params);
    } catch {
      // nächster Versuch
    }
  }
  return haushaltBeschliessen(zustand, { vorlaeufig: true });
}

// Aktion in der Opposition: Monat beenden. Die Welt läuft weiter wie in der eigenen Regierung (Probleme, Umsetzungen,
// Verfahren, Landtagswahlen, Koalitionsprüfung); im Dezember beschließt die Regierung den Haushalt.
export function oppositionMonat(zustand) {
  if (zustand.phase !== 'opposition') throw new Error('Nicht in der Opposition');
  if (zustand.monat === config.regierung.monateJeJahr) return haushaltDerAnderen(zustand);
  const ende = monatsabschluss(zustand);
  const vorher = [`${monatsname(zustand.monat)} ${zustand.jahr} vorbei`, ...ende.ereignisse];
  if (ende.neuwahl) return { state: zurueckInDenWahlkampf(ende.state), ereignisse: [...vorher, 'Neuwahl: Die Regierung hat keine Mehrheit mehr'] };
  const reform = reformDerAnderen({ ...ende.state, monat: zustand.monat + 1 });
  return { state: reform.state, ereignisse: [...vorher, ...reform.ereignisse] };
}
