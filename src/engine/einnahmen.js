import { einnahmearten } from '../data/einnahmen.js';
import { startBip } from '../data/kennzahlen.js';
import { wirkungSumme, skaliert } from './wirtschaft.js';
import { wegEinnahmen } from './reformwege.js';

export const einnahmeart = (id) => einnahmearten.find((e) => e.id === id);

// Reales Wachstum seit Spielbeginn: Steuerbasis wächst mit der Wirtschaft (preisbereinigt, weil die Etats nominal fest sind)
export const basisFaktor = (zustand) => zustand.land.bip / startBip / (zustand.land.preise ?? 1);

// Verlust durch Ausweichen (Steuerflucht, Konsumrückgang) bei hohen Stufen: je Stufe über ausweichenAb ein wachsender Anteil
function ausweichVerlust(art, stufe) {
  if (stufe <= art.ausweichenAb) return 0; // nur bei Erhöhungen über der Schwelle
  let verlust = 0;
  for (let k = art.ausweichenAb + 1; k <= stufe; k++) verlust += art.aufkommenJeStufe * art.ausweichen * (k - art.ausweichenAb);
  return Math.min(verlust, stufe * art.aufkommenJeStufe);
}

// Prüft einen Entwurf: { einnahmen: { artId: Änderung in Stufen }, ausgestaltung: { schalterId: true|false } }
export function entwurfPruefen(zustand, entwurf = {}) {
  const e = zustand.haushalt.einnahmen;
  for (const [id, d] of Object.entries(entwurf.einnahmen ?? {})) {
    const art = einnahmeart(id);
    if (!art || !Number.isInteger(d)) throw new Error(`Ungültige Einnahmeänderung: ${id}`);
    const p = art.parameter;
    const neu = (p.einmalig ? 0 : (e.stufen[id] ?? 0)) + d;
    const wert = p.startwert + neu * p.schritt;
    if (Math.abs(d) > p.maxJeJahr || wert < p.min - 1e-9 || wert > p.max + 1e-9) throw new Error(`${art.name}: höchstens ${p.maxJeJahr} Stufen je Jahr, zwischen ${p.min} und ${p.max}`);
  }
  for (const id of Object.keys(entwurf.ausgestaltung ?? {})) {
    if (!einnahmearten.some((a) => a.ausgestaltung.some((s) => s.id === id))) throw new Error(`Unbekannte Ausgestaltung: ${id}`);
  }
}

const aktiv = (zustand, entwurf, schalterId) => entwurf.ausgestaltung?.[schalterId] ?? zustand.haushalt.einnahmen.ausgestaltung.includes(schalterId);

// Aufstellung aller Einnahmearten mit Herleitung (für Haushalt, Vorschau und Prognose). Beträge in tausend €.
// reformPosten: { artId: [{ quelle, betrag }] } aus beschlossenen Reformwegen
export function aufstellung(zustand, entwurf = {}, reformPosten = wegEinnahmen(zustand)) {
  const e = zustand.haushalt.einnahmen;
  const faktor = basisFaktor(zustand);
  const zeilen = einnahmearten.map((art) => {
    const p = art.parameter;
    const alt = p.einmalig ? 0 : (e.stufen[art.id] ?? 0);
    const neu = alt + (entwurf.einnahmen?.[art.id] ?? 0);
    const steuer = art.gruppe !== 'Sonstige' && !art.sondervermoegen;
    const basis = Math.round(art.start * (steuer ? e.altFaktor : 1) * faktor);
    const stufen = Math.round(neu * art.aufkommenJeStufe * faktor);
    const ausweichen = -Math.round(ausweichVerlust(art, neu) * faktor) || 0;
    // Verzögerung: Neu Beschlossenes wirkt im ersten Jahr nur anteilig
    const verzoegerung = -Math.round((neu - alt) * art.aufkommenJeStufe * faktor * (1 - art.verzoegerung)) || 0;
    const schalter = art.ausgestaltung.filter((s) => aktiv(zustand, entwurf, s.id));
    const ausgestaltung = Math.round(schalter.reduce((s, x) => s + x.kosten, 0) * faktor)
      + (art.sondervermoegen ? Math.round(schalter.reduce((s, x) => s + (x.ktfAnteil ?? 0), 0) * (basis + stufen)) : 0);
    const reformen = reformPosten[art.id] ?? [];
    const summe = basis + stufen + ausweichen + verzoegerung + ausgestaltung + reformen.reduce((s, r) => s + r.betrag, 0);
    return {
      art, stufe: neu, wert: p.startwert + neu * p.schritt, geaendert: neu !== alt,
      basis, stufen, ausweichen, verzoegerung, ausgestaltung, reformen, summe,
      imKernhaushalt: !art.keinBund && !art.sondervermoegen,
    };
  });
  const kern = zeilen.filter((z) => z.imKernhaushalt).reduce((s, z) => s + z.summe, 0);
  return { zeilen, kern, ktf: zeilen.find((z) => z.art.sondervermoegen)?.summe ?? 0 };
}

// Spielraum des Reglers einer Einnahmeart in diesem Jahr: Änderung in Stufen gegenüber dem beschlossenen Stand,
// begrenzt durch maxJeJahr und die absoluten Grenzen min/max des Parameters
export function spielraum(zustand, id) {
  const p = einnahmeart(id).parameter;
  const wert = p.startwert + (p.einmalig ? 0 : (zustand.haushalt.einnahmen.stufen[id] ?? 0)) * p.schritt;
  return {
    min: Math.max(-p.maxJeJahr, Math.ceil((p.min - wert) / p.schritt - 1e-9)) || 0, // || 0: kein −0
    max: Math.min(p.maxJeJahr, Math.floor((p.max - wert) / p.schritt + 1e-9)),
  };
}

// Geschätztes Aufkommen einer Einnahmeart im Entwurf und die Änderung gegenüber dem beschlossenen Stand (tausend €):
// erstesJahr mit Verzögerung und Ausweichen, dauerhaft ab dem Folgejahr (0 bei einmaligen Posten).
// Bei heutiger Wirtschaft: Rückwirkungen der Änderung auf Wachstum und Steuerbasis sind nicht enthalten.
export function aufkommensSchaetzung(zustand, entwurf, id) {
  const zeile = (e) => aufstellung(zustand, e).zeilen.find((z) => z.art.id === id);
  const mit = zeile(entwurf);
  const ohne = zeile({ ...entwurf, einnahmen: { ...entwurf.einnahmen, [id]: 0 } });
  const dauerhaft = (z) => z.stufen + z.ausweichen;
  return {
    aufkommen: mit.summe,
    erstesJahr: mit.summe - ohne.summe,
    dauerhaft: mit.art.parameter.einmalig ? 0 : dauerhaft(mit) - dauerhaft(ohne),
  };
}

// Wirkung eines Entwurfs auf Kennzahlen, Gruppen und Probleme (einmalig beim Beschluss) und ob der Bundesrat zustimmen muss
export function entwurfWirkung(zustand, entwurf = {}) {
  const teile = [];
  let bundesrat = false;
  for (const [id, d] of Object.entries(entwurf.einnahmen ?? {})) {
    if (!d) continue;
    const art = einnahmeart(id);
    teile.push(skaliert(art.wirkungJeStufe, d));
    bundesrat ||= art.bundesrat;
  }
  for (const [id, an] of Object.entries(entwurf.ausgestaltung ?? {})) {
    const vorher = zustand.haushalt.einnahmen.ausgestaltung.includes(id);
    if (an === vorher) continue;
    const art = einnahmearten.find((a) => a.ausgestaltung.some((s) => s.id === id));
    teile.push(skaliert(art.ausgestaltung.find((s) => s.id === id).wirkung, an ? 1 : -1));
    bundesrat ||= art.bundesrat;
  }
  const risiken = rechtsrisiken(zustand, entwurf);
  return { wirkung: wirkungSumme(...teile), bundesrat, rechtsrisiken: risiken, verfassung: risiken.length > 0 };
}

// Rechtsrisiken eines Entwurfs (Feature 3): Erhöhungen riskanter Einnahmearten, neu eingeschaltete riskante Ausgestaltungen
export function rechtsrisiken(zustand, entwurf = {}) {
  const liste = [];
  for (const [id, d] of Object.entries(entwurf.einnahmen ?? {})) {
    const art = einnahmeart(id);
    if (d > 0 && art.rechtsrisiko) liste.push({ typ: 'einnahme', id, name: `${art.name} erhöht`, stufen: d, ...art.rechtsrisiko });
  }
  for (const [id, an] of Object.entries(entwurf.ausgestaltung ?? {})) {
    if (!an || zustand.haushalt.einnahmen.ausgestaltung.includes(id)) continue;
    const s = einnahmearten.flatMap((a) => a.ausgestaltung).find((x) => x.id === id);
    if (s.rechtsrisiko) liste.push({ typ: 'ausgestaltung', id, name: s.name, ...s.rechtsrisiko });
  }
  return liste;
}

// Neuer Einnahmenstand nach dem Beschluss (einmalige Posten wie Privatisierungen werden nicht gespeichert)
export function einnahmenUebernehmen(zustand, entwurf = {}) {
  const e = zustand.haushalt.einnahmen;
  const stufen = { ...e.stufen };
  for (const [id, d] of Object.entries(entwurf.einnahmen ?? {})) if (!einnahmeart(id).parameter.einmalig) stufen[id] = (stufen[id] ?? 0) + d;
  let ausgestaltung = [...e.ausgestaltung];
  for (const [id, an] of Object.entries(entwurf.ausgestaltung ?? {})) ausgestaltung = an ? [...new Set([...ausgestaltung, id])] : ausgestaltung.filter((x) => x !== id);
  return { ...e, stufen, ausgestaltung };
}

// Gegenfinanzierung: welche einzelne Kernhaushalts-Einnahme schließt eine Lücke (tausend €) mit den wenigsten Stufen,
// sortiert nach Wachstumsverlust je Mrd. Nur Vorschläge, nichts wird festgelegt.
export function gegenfinanzierung(zustand, entwurf, luecke) {
  if (luecke <= 0) return [];
  const faktor = basisFaktor(zustand);
  return einnahmearten
    .filter((a) => !a.keinBund && !a.sondervermoegen && a.aufkommenJeStufe > 0)
    .map((a) => {
      const p = a.parameter;
      const jetzt = (p.einmalig ? 0 : (zustand.haushalt.einnahmen.stufen[a.id] ?? 0)) + (entwurf.einnahmen?.[a.id] ?? 0);
      const frei = Math.min(p.maxJeJahr - Math.abs(entwurf.einnahmen?.[a.id] ?? 0), Math.floor((p.max - (p.startwert + jetzt * p.schritt)) / p.schritt + 1e-9));
      const jeStufe = a.aufkommenJeStufe * faktor * a.verzoegerung;
      const stufen = Math.ceil(luecke / jeStufe);
      return { art: a, stufen, moeglich: stufen <= frei, wachstum: (a.wirkungJeStufe.wachstum ?? 0) * stufen };
    })
    .filter((v) => v.moeglich)
    .sort((x, y) => y.wachstum - x.wachstum);
}
