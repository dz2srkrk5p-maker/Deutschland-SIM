import { config } from '../data/config.js';
import { probleme } from '../data/probleme.js';
import { parteien } from '../data/parteien.js';
import { ministerien } from '../data/ministerien.js';
import { etats2026 } from '../data/haushalt.js';
import { kennzahlen, gruppen, achsen } from '../data/kennzahlen.js';
import { zufall } from './rng.js';
import { umverteilen, runden } from './wahlkampf.js';
import { mitVerlauf } from './state.js';
import { richtungsprofil, abstand } from './profil.js';
import { wirkungSumme, skaliert } from './wirtschaft.js';
import { umfrageBuchen } from './umfragebilanz.js';
import { kettenSchritt } from './krisenketten.js';
import { wegTrends } from './reformwege.js';

// Problem-Engine (System 3): Probleme entstehen und eskalieren aus dem Zustand des Landes, Lösungen senken sie.
const pc = config.probleme;
const r1 = (x) => Math.round(x * 10) / 10 + 0; // + 0: aus −0 wird 0 (sonst ändert Speichern und Laden den Stand)
const r2 = (x) => Math.round(x * 100) / 100 + 0;
const r3 = (x) => Math.round(x * 1000) / 1000 + 0;
const anteil = config.zeit.anteilJeMonat; // Treiber, Trends und Schocks sind je Quartal geeicht
// Wahrscheinlichkeit je Quartal → je Monat, so dass sie je Jahr gleich bleibt
export const chanceJeMonat = (p) => 1 - (1 - p) ** anteil;
// je Quartal geeichter Trend (Daten) → Wirkung je Monat (Anzeige der Reformwege)
export const trendJeMonat = (x) => r3(x * anteil);
const begrenzt = (x) => Math.max(0, Math.min(100, x));
const name = (id) => parteien.find((p) => p.id === id).name;

export const problem = (id) => probleme.find((p) => p.id === id);
export function loesung(id) {
  for (const p of probleme) {
    const l = p.loesungen.find((x) => x.id === id);
    if (l) return { ...l, problem: p };
  }
  return null;
}
export const stufeVon = (wert) => [...pc.stufen].reverse().find((s) => wert >= s.ab);
export const startProbleme = () => Object.fromEntries(probleme.map((p) => [p.id, { wert: p.start, verlauf: [p.start] }]));

// Ursachen: Beitrag jedes Treibers zum Trend je Monat (für die Detailansicht und den Monatsschritt). Die Daten sind je
// Quartal geeicht; je Monat wirkt der Anteil config.zeit.anteilJeMonat.
export function ursachen(zustand, p) {
  const liste = [{ text: 'Grundtrend', beitrag: p.trend }];
  for (const t of p.treiber) {
    if (t.land !== undefined) {
      liste.push({ text: kennzahlen.find((k) => k.id === t.land).name, beitrag: t.gewicht * (zustand.land[t.land] - t.ab) });
    } else if (t.problem) {
      const w = zustand.probleme[t.problem]?.wert ?? 0;
      liste.push({ text: problem(t.problem).name, beitrag: w > t.ab ? (t.gewicht * (w - t.ab)) / 10 : 0, problem: t.problem });
    } else if (t.gruppe) {
      liste.push({ text: `Stimmung: ${gruppen.find((g) => g.id === t.gruppe).name}`, beitrag: (t.gewicht * (50 - zustand.gruppen[t.gruppe])) / 10 });
    } else if (t.etat) {
      const kuerzung = 1 - zustand.haushalt.etats[t.etat] / etats2026[t.etat];
      liste.push({ text: `Etat ${ministerien.find((m) => m.id === t.etat).kurz}`, beitrag: t.gewicht * kuerzung * 10 });
    } else if (t.profil) {
      liste.push({ text: `Richtungsprofil: ${achsen.find((a) => a.id === t.profil).name}`, beitrag: t.gewicht * richtungsprofil(zustand)[t.profil] });
    }
  }
  liste.push(...wegTrends(zustand, p.id));
  return liste.map((u) => ({ ...u, beitrag: r3(u.beitrag * anteil) }));
}
export const trend = (zustand, p) => r3(ursachen(zustand, p).reduce((s, u) => s + u.beitrag, 0));

// Liste aller Probleme nach Wert: prominent (höchstens maxAktiv ab „angespannt“), sonst Beobachtung mit Frühwarnung
export function problemListe(zustand) {
  const liste = probleme
    .map((p) => {
      const { wert, verlauf } = zustand.probleme[p.id];
      return { problem: p, wert, verlauf, stufe: stufeVon(wert), trend: trend(zustand, p) };
    })
    .sort((a, b) => b.wert - a.wert);
  let aktiv = 0;
  return liste.map((e) => {
    const prominent = e.wert >= pc.stufen[1].ab && aktiv < pc.maxAktiv;
    if (prominent) aktiv++;
    return { ...e, prominent, fruehwarnung: !prominent && e.wert >= pc.fruehwarnungAb && e.trend > 0 };
  });
}

// Laufende Kosten aller Lösungen, die laufen oder gewirkt haben (tausend €/Jahr; negativ = Einsparung)
export const laufendeKosten = (zustand) =>
  Object.entries(zustand.loesungen).filter(([, l]) => l.status !== 'gescheitert').reduce((s, [id]) => s + loesung(id).kosten, 0);

// Erfolgschance: Grundwert ± Passung zum Richtungsprofil (ein marktliberaler Staat setzt marktliberale Lösungen besser um)
export function erfolgschance(zustand, l) {
  const profil = richtungsprofil(zustand);
  const hatAusrichtung = Object.keys(l.ausrichtung ?? {}).length > 0;
  const bonus = hatAusrichtung ? Math.max(-pc.passungBonus, Math.min(pc.passungBonus, pc.passungBonus * (1 - abstand(l.ausrichtung, profil) / 2))) : 0;
  return r2(Math.max(0.05, Math.min(0.95, l.erfolg + bonus)));
}

// Warum eine Lösung jetzt nicht gestartet werden kann, oder null
export function loesungSperre(zustand, id) {
  const l = loesung(id);
  if (!l) return 'unbekannt';
  const st = zustand.loesungen[id]?.status;
  if (st === 'laufend') return 'läuft schon';
  if (st === 'erfolg') return 'umgesetzt';
  if (l.braucht && zustand.loesungen[l.braucht]?.status !== 'erfolg') return `erst „${loesung(l.braucht).name}“`;
  if (zustand.phase !== 'regierung') return zustand.phase === 'opposition' ? 'in der Opposition' : 'keine Regierung';
  if (zustand.offenesEreignis) return 'erst auf das Ereignis reagieren';
  if (zustand.monat === config.regierung.monateJeJahr) return 'im Haushaltsmonat nicht möglich';
  if (zustand.aktionenImMonat >= pc.aktionenJeMonat) return `höchstens ${pc.aktionenJeMonat} Vorhaben je Monat`;
  if (zustand.kapital < l.kapital) return `zu wenig politisches Kapital (${l.kapital} nötig)`;
  return null;
}

// Aktion: Lösung starten. Kostet politisches Kapital und Aufmerksamkeit; die laufenden Kosten zählen ab dem nächsten
// Haushalt. Nach der Dauer wird über Erfolg oder Fehlschlag entschieden (problemeMonat).
export function loesungStarten(zustand, { loesungId }) {
  const grund = loesungSperre(zustand, loesungId);
  if (grund) throw new Error(`Lösung nicht möglich: ${grund}`);
  const l = loesung(loesungId);
  return {
    state: {
      ...zustand,
      kapital: zustand.kapital - l.kapital,
      aktionenImMonat: zustand.aktionenImMonat + 1,
      loesungen: { ...zustand.loesungen, [loesungId]: { status: 'laufend', fertig: zustand.runde + l.dauer, start: zustand.runde } },
    },
    ereignisse: [`Lösung gestartet: „${l.name}“ gegen ${l.problem.name} (fertig in ${l.dauer} Monaten, Chance ${Math.round(erfolgschance(zustand, l) * 100)} %)`],
  };
}

// Folgen der Probleme für das Haushaltsjahr (Wirkung auf Kennzahlen und Gruppen) plus Wirkungen aus dem Jahr
export function jahresFolgen(zustand) {
  return wirkungSumme(zustand.jahresWirkung, ...probleme.map((p) => skaliert(p.folgen, stufeVon(zustand.probleme[p.id].wert).folgen)));
}

// Am Ende eines Monats: Werte entwickeln sich, Schocks, Eskalationen, fertige Lösungen, Wirkung auf die Kanzlerpartei.
// Danach wächst das politische Kapital, die Aufmerksamkeit ist wieder frei.
export function problemeMonat(zustand) {
  let rngZustand = zustand.rngZustand;
  const zieh = () => {
    const z = zufall(rngZustand);
    rngZustand = z.rngZustand;
    return z.wert;
  };
  const ereignisse = [];
  const neu = {};
  for (const p of probleme) {
    const alt = zustand.probleme[p.id];
    let w = alt.wert + trend(zustand, p) + (zieh() * 2 - 1) * pc.schwankung;
    if (p.schock && zieh() < chanceJeMonat(p.schock.chance)) {
      w += p.schock.staerke;
      ereignisse.push(`Plötzliche Verschärfung: ${p.name}`);
    }
    w = r2(begrenzt(w));
    if (stufeVon(w).ab > stufeVon(alt.wert).ab && w >= pc.stufen[2].ab) ereignisse.push(`Eskalation: ${p.name} ist jetzt „${stufeVon(w).name}“`);
    neu[p.id] = { wert: w, verlauf: [...alt.verlauf, w].slice(-pc.verlaufLaenge) };
  }

  // fertige Lösungen: Erfolg würfeln, Wirkung anwenden
  const loesungen = { ...zustand.loesungen };
  const umfrage = {};
  const posten = []; // Umfrage-Bilanz
  const dazu = (id, x, ursache) => ((umfrage[id] = (umfrage[id] ?? 0) + x), posten.push({ ursache, partei: id, wert: x }));
  let jahresWirkung = zustand.jahresWirkung;
  let gruppenNeu = { ...zustand.gruppen };
  for (const [id, stand] of Object.entries(zustand.loesungen)) {
    if (stand.status !== 'laufend' || stand.fertig > zustand.runde + 1) continue;
    const l = loesung(id);
    const erfolg = zieh() < erfolgschance(zustand, l);
    const senkung = Math.min(neu[l.problem.id].wert, erfolg ? l.wirkung : l.wirkung * pc.fehlschlagWirkung);
    neu[l.problem.id] = { ...neu[l.problem.id], wert: r2(neu[l.problem.id].wert - senkung) };
    loesungen[id] = { ...stand, status: erfolg ? 'erfolg' : 'gescheitert' };
    if (erfolg) {
      const halter = zustand.kabinett.verteilung[l.problem.ministerium];
      if (halter) dazu(halter, senkung * pc.gewinnJeWertpunkt, `Lösung wirkt: ${l.name} (zuständiges Ressort)`);
      // gemeinsamer Regierungserfolg: auf alle Koalitionsparteien nach Umfrageanteil verteilt
      const regierung = [zustand.kanzlerParteiId, ...zustand.koalition.partner];
      const summe = regierung.reduce((s, id) => s + zustand.anteile[id], 0);
      for (const id of regierung) dazu(id, (senkung * pc.gewinnRegierungJeWertpunkt * zustand.anteile[id]) / summe, `Lösung wirkt: ${l.name} (Regierungserfolg)`);
      if (l.nebenwirkung) {
        jahresWirkung = wirkungSumme(jahresWirkung, { ...l.nebenwirkung, gruppen: {}, probleme: {} });
        for (const [g, v] of Object.entries(l.nebenwirkung.gruppen ?? {})) gruppenNeu[g] = Math.max(0, Math.min(100, gruppenNeu[g] + v));
        for (const [pid, v] of Object.entries(l.nebenwirkung.probleme ?? {})) neu[pid] = { ...neu[pid], wert: r2(begrenzt(neu[pid].wert + v)) };
      }
      ereignisse.push(`Lösung wirkt: „${l.name}“ – ${l.problem.name} −${r1(senkung)}`);
    } else {
      dazu(zustand.kanzlerParteiId, -pc.fehlschlagUmfrage, `Lösung gescheitert: ${l.name}`);
      ereignisse.push(`Lösung gescheitert: „${l.name}“ – ${l.problem.name} nur −${r1(senkung)}`);
    }
  }

  // Krisenketten (Feature 8): Krisen verschärfen abhängige Probleme, verzögert und gedämpft
  const kette = kettenSchritt(zustand, neu);
  Object.assign(neu, kette.probleme);
  ereignisse.push(...kette.ereignisse);

  // prominente ernste Probleme und Krisen kosten die Kanzlerpartei
  const zwischen = { ...zustand, probleme: neu };
  const belastend = problemListe(zwischen).filter((e) => e.prominent && pc.umfrageJeMonat[e.stufe.id]);
  const verlust = belastend.reduce((s, e) => s + pc.umfrageJeMonat[e.stufe.id], 0);
  for (const e of belastend) posten.push({ ursache: `Problem „${e.problem.name}“ (${e.stufe.name})`, partei: zustand.kanzlerParteiId, wert: -pc.umfrageJeMonat[e.stufe.id] });
  if (verlust) umfrage[zustand.kanzlerParteiId] = (umfrage[zustand.kanzlerParteiId] ?? 0) - verlust;

  let state = {
    ...zustand,
    rngZustand,
    probleme: neu,
    ketten: kette.ketten,
    loesungen,
    jahresWirkung,
    gruppen: gruppenNeu,
    runde: zustand.runde + 1,
    aktionenImMonat: 0,
    kapital: Math.min(config.kapital.max, zustand.kapital + config.kapital.jeMonat),
  };
  if (Object.keys(umfrage).length) {
    state = umfrageBuchen(zustand, mitVerlauf({ ...state, anteile: runden(umverteilen(zustand.anteile, umfrage)) }), posten);
    const text = Object.entries(umfrage).map(([id, x]) => `${name(id)} ${x >= 0 ? '+' : '−'}${Math.abs(r3(x)).toLocaleString('de-DE', { maximumFractionDigits: 3 })}`).join(', '); // Monatswerte sind klein
    if (verlust) ereignisse.push(`Ungelöste Probleme belasten die Regierung: ${text}`);
  }
  return { state, ereignisse };
}
