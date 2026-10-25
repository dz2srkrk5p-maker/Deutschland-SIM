// Landtagswahlen (Paket Mittel, Feature 5): Einzelmodell, schlank. Die Landesregierungen sind Teil des Spielstands; bei
// jeder Wahl bleibt die Landesregierung oder es wechselt genau eine Partei. Die Bundesratszählung je Land bleibt dieselbe.
// Alle Gewichte in config.landtagswahlen (Spielwerte); Termine in src/data/laender.js.
import { config } from '../data/config.js';
import { parteien } from '../data/parteien.js';
import { laender } from '../data/laender.js';
import { zufall } from './rng.js';
import { umverteilen, runden } from './wahlkampf.js';
import { mitVerlauf, regierungImAmt } from './state.js';
import { umfrageBuchen } from './umfragebilanz.js';
import { koalitionsParteien } from './kabinett.js';
import { parteiPosition, abstand } from './profil.js';

const lw = config.landtagswahlen;
const name = (id) => parteien.find((p) => p.id === id)?.name ?? id;
const begrenzt = (x) => Math.max(lw.min, Math.min(lw.max, x));
// Parteien, die in eine Landesregierung kommen können: spielbar, mit Position, nicht hinter der Brandmauer und in der
// aktuellen Umfrage mindestens an der Sperrklausel (Spielregel: wer im Bund darunter liegt, ersetzt keine Regierungspartei)
const waehlbar = (zustand) => parteien.filter((p) => !p.sonstige && p.ches && !config.koalition.brandmauer.includes(p.id) && zustand.anteile[p.id] >= config.sperrklauselProzent).map((p) => p.id);

// Startstand der Länder für den Spielstand
export const laenderStart = () => Object.fromEntries(laender.map((l) => [l.id, { regierung: [...l.regierung], geschaeftsfuehrend: !!l.geschaeftsfuehrend, wahl: { jahr: l.wahl.jahr, monat: l.wahl.monat } }]));

// Kalenderjahr: ein Haushaltsjahr je Kanzlerjahr, Start 2026 (das Spiel hat sonst keine absolute Jahreszahl)
// Kalenderjahr des Spielstands (seit Etappe 0b eigenes Feld, zählt mit jedem Dezember weiter)
export const kalenderJahr = (zustand) => zustand.jahr;

// Stimmung: Gewinn (+) oder Verlust (−) der Bundesregierungsparteien seit der Bundestagswahl, in Punkten
export function stimmung(zustand) {
  const basis = zustand.wahlergebnis?.anteile ?? {};
  return koalitionsParteien(zustand).reduce((s, id) => s + zustand.anteile[id] - (basis[id] ?? zustand.anteile[id]), 0);
}

// Wechselchance: Regiert eine Bundesregierungspartei im Land mit, schadet schlechte Stimmung; sonst hilft gute Stimmung
export function wechselChance(zustand, landId) {
  const bund = koalitionsParteien(zustand);
  const s = stimmung(zustand);
  const imLand = zustand.laender[landId].regierung.some((id) => bund.includes(id));
  return Math.round(begrenzt(imLand ? lw.basis - lw.jePunkt * s : lw.basis + lw.jePunkt * s) * 100) / 100;
}

// Wechsel genau einer Partei: Bundesregierungspartei raus (die größte), ersetzt durch die inhaltlich nächste Partei
// außerhalb von Bundes- und Landesregierung; regiert keine Bundespartei mit, kommt die nächste Bundesregierungspartei hinzu.
export function wechsel(zustand, landId) {
  const bund = koalitionsParteien(zustand);
  const regierung = zustand.laender[landId].regierung;
  const drin = regierung.filter((id) => bund.includes(id));
  // inhaltlich nächste Kandidatin; hat der Bezug keine Position (z. B. Freie Wähler), die stärkste nach Umfrage
  const naechste = (zu, kandidaten) => (parteiPosition(zu)
    ? kandidaten.sort((a, b) => abstand(parteiPosition(zu), parteiPosition(a)) - abstand(parteiPosition(zu), parteiPosition(b)))
    : kandidaten.sort((a, b) => zustand.anteile[b] - zustand.anteile[a]))[0];
  if (drin.length) {
    const raus = drin.sort((a, b) => zustand.anteile[b] - zustand.anteile[a])[0];
    const rein = naechste(raus, waehlbar(zustand).filter((id) => !bund.includes(id) && !regierung.includes(id)));
    // ohne Ersatz (alle Parteien über der Hürde regieren schon mit oder stehen hinter der Brandmauer): die Partei scheidet aus
    const rest = regierung.map((id) => (id === raus ? rein : id)).filter(Boolean);
    return rest.length ? { raus, rein, regierung: rest } : { raus: null, rein: null, regierung };
  }
  const bezug = regierung.find((id) => parteien.some((p) => p.id === id && p.ches)) ?? regierung[0];
  const rein = naechste(bezug, bund.filter((id) => waehlbar(zustand).includes(id)));
  return { raus: null, rein, regierung: rein ? [...regierung, rein] : regierung };
}

// Termine der nächsten Monate (für die Ankündigung): [{ land, jahr, monat, inMonaten }]; 0 = am Ende dieses Monats
export function naechsteWahlen(zustand, monate = 6) {
  const jahr = kalenderJahr(zustand);
  const jetzt = jahr * 12 + zustand.monat;
  return laender.map((l) => ({ land: l, ...zustand.laender[l.id].wahl }))
    .map((w) => ({ ...w, inMonaten: w.jahr * 12 + w.monat - jetzt }))
    .filter((w) => w.inMonaten >= 0 && w.inMonaten < monate)
    .sort((a, b) => a.inMonaten - b.inMonaten);
}

// Am Monatsende: geschäftsführende Länder bilden neu (Spielregel), fällige Landtagswahlen finden statt
export function landtagswahlenMonat(zustand) {
  if (!regierungImAmt(zustand) || !zustand.laender) return { state: zustand, ereignisse: [] };
  const jahr = kalenderJahr(zustand);
  const bund = koalitionsParteien(zustand);
  let rngZustand = zustand.rngZustand;
  const neu = { ...zustand.laender };
  const ereignisse = [];
  const posten = [];
  const buchen = (w, land) => {
    if (w.raus && bund.includes(w.raus)) posten.push({ ursache: `Landtagswahl ${land}: Regierungsbeteiligung verloren`, partei: w.raus, wert: -lw.verlustUmfrage });
    if (w.rein && bund.includes(w.rein)) posten.push({ ursache: `Landtagswahl ${land}: Regierungsbeteiligung gewonnen`, partei: w.rein, wert: lw.gewinnUmfrage });
  };
  for (const l of laender) {
    const stand = neu[l.id];
    if (stand.geschaeftsfuehrend) {
      const w = wechsel({ ...zustand, laender: neu }, l.id);
      neu[l.id] = { ...stand, regierung: w.regierung, geschaeftsfuehrend: false };
      ereignisse.push(`${l.name}: neue Landesregierung aus ${w.regierung.map(name).join(', ')} (Neubildung nach der Wahl im September 2026, Spielregel).`);
      continue;
    }
    if (stand.wahl.jahr !== jahr || stand.wahl.monat !== zustand.monat) continue;
    const chance = wechselChance({ ...zustand, laender: neu }, l.id);
    const r = zufall(rngZustand);
    rngZustand = r.rngZustand;
    const naechste = { jahr: jahr + l.wahlperiode, monat: stand.wahl.monat };
    if (r.wert < chance) {
      const w = wechsel({ ...zustand, laender: neu }, l.id);
      neu[l.id] = { ...stand, regierung: w.regierung, wahl: naechste };
      buchen(w, l.name);
      ereignisse.push(`Landtagswahl ${l.name}: Regierungswechsel${w.raus ? `, ${name(w.raus)} verliert die Regierungsbeteiligung` : ''}${w.rein ? `, ${name(w.rein)} regiert mit` : ''}${!w.raus && !w.rein ? ' ohne andere Mehrheit, die Regierung bleibt' : ''}. Neue Landesregierung: ${w.regierung.map(name).join(', ')}.`);
    } else {
      neu[l.id] = { ...stand, wahl: naechste };
      ereignisse.push(`Landtagswahl ${l.name}: Die Landesregierung (${stand.regierung.map(name).join(', ')}) wird bestätigt.`);
    }
  }
  let state = { ...zustand, rngZustand, laender: neu };
  if (posten.length) {
    const umfrage = {};
    for (const p of posten) umfrage[p.partei] = (umfrage[p.partei] ?? 0) + p.wert;
    state = umfrageBuchen(zustand, mitVerlauf({ ...state, anteile: runden(umverteilen(zustand.anteile, umfrage)) }), posten);
  }
  return { state, ereignisse };
}
