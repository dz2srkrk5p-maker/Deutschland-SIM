import { config } from '../data/config.js';
import { parteien } from '../data/parteien.js';
import { bereiche, AUSRICHTUNGEN, akteure } from '../data/reformwege.js';
import { achsen } from '../data/kennzahlen.js';
import { zufall } from './rng.js';
import { umverteilen, runden } from './wahlkampf.js';
import { mitVerlauf } from './state.js';
import { abstimmung, abstimmen } from './bundestag.js';
import { bundesratAbstimmung } from './bundesrat.js';
import { koalitionsParteien } from './kabinett.js';
import { parteiPosition, abstand, richtungsprofil } from './profil.js';
import { wirkungSumme } from './wirtschaft.js';
import { vorschau } from './haushalt.js';

// Reformwege (System 1): verbindliche Wegentscheidungen je Bereich mit politischer Ausrichtung.
const rw = config.reformwege;
const r2 = (x) => Math.round(x * 100) / 100 + 0;
const name = (id) => parteien.find((p) => p.id === id).name;

export const bereich = (id) => bereiche.find((b) => b.id === id);
export function weg(id) {
  for (const b of bereiche) {
    const w = b.wege.find((x) => x.id === id);
    if (w) return { ...w, bereich: b };
  }
  return null;
}
export const wegVektor = (w) => ({ ...AUSRICHTUNGEN[w.richtung].vektor, ...(w.vektor ?? {}) });
export const ausrichtungName = (w) => AUSRICHTUNGEN[w.richtung].name;
const aktiv = (stand) => stand && (stand.status === 'umsetzung' || stand.status === 'beschlossen');

// Status eines Bereichs: offen / umsetzung / beschlossen (nach dem Grundweg; Folgewege zählen extra)
export function bereichStatus(zustand, b) {
  const grund = b.wege.filter((w) => !w.braucht).map((w) => ({ w, stand: zustand.reformwege[w.id] })).find((x) => aktiv(x.stand));
  return grund ? { status: grund.stand.status, weg: grund.w } : { status: 'offen', weg: null };
}

// Gewinner und Verlierer: aus den Gruppenwirkungen kurz und lang abgeleitet
export function gewinnerVerlierer(w) {
  const g = wirkungSumme({ gruppen: w.kurz?.gruppen }, { gruppen: w.lang?.gruppen }).gruppen;
  return { gewinner: Object.keys(g).filter((id) => g[id] > 0), verlierer: Object.keys(g).filter((id) => g[id] < 0) };
}

// Reaktionen der Akteure: Haltung −2 … +2 (2 − Abstand), nur auf Achsen, die sie interessieren
export const akteurReaktionen = (w) => akteure.map((a) => ({ akteur: a, haltung: r2(Math.max(-2, Math.min(2, 2 - 2 * abstand(a.vektor, wegVektor(w))))) }));

// Reaktion der Koalitionspartner: Zustimmung bis zum Veto-Abstand, Unmut über Abstand 1
export const partnerReaktionen = (zustand, w) => zustand.koalition.partner.map((id) => {
  const d = abstand(parteiPosition(id), wegVektor(w));
  return { id, abstand: r2(d), veto: d > rw.vetoAbstand, unmut: r2(Math.max(0, d - 1) * rw.partnerUnmutJePunkt) };
});

// Laufende Kosten (tausend €/Jahr) und Einnahmeeffekte der Wege in Umsetzung oder beschlossen
export const wegKosten = (zustand) => Object.entries(zustand.reformwege ?? {}).filter(([, s]) => aktiv(s)).reduce((s, [id]) => s + weg(id).kosten, 0);
export function wegEinnahmen(zustand) {
  const posten = {};
  for (const [id, s] of Object.entries(zustand.reformwege ?? {})) {
    if (!aktiv(s)) continue;
    for (const [art, betrag] of Object.entries(weg(id).einnahmen ?? {})) (posten[art] ??= []).push({ quelle: weg(id).name, betrag });
  }
  return posten;
}

// Dauerhafte Trends beschlossener Wege auf Probleme (für die Problem-Engine)
export const wegTrends = (zustand, problemId) => Object.entries(zustand.reformwege ?? {})
  .filter(([id, s]) => s.status === 'beschlossen' && weg(id).lang?.trend?.[problemId])
  .map(([id]) => ({ text: `Reform: ${weg(id).name}`, beitrag: weg(id).lang.trend[problemId] }));

// Warum ein Weg jetzt nicht gewählt werden kann (oder null). revision: true, wenn ein anderer Grundweg den Bereich belegt.
export function wegSperre(zustand, wegId) {
  const w = weg(wegId);
  if (!w) return { grund: 'unbekannt' };
  const stand = zustand.reformwege[wegId];
  if (aktiv(stand)) return { grund: stand.status === 'umsetzung' ? 'in Umsetzung' : 'beschlossen' };
  if (w.braucht && zustand.reformwege[w.braucht]?.status !== 'beschlossen') return { grund: `erst „${weg(w.braucht).name}“ umsetzen` };
  if (zustand.phase !== 'regierung') return { grund: 'keine Regierung' };
  if (zustand.offenesEreignis) return { grund: 'erst auf das Ereignis reagieren' };
  if (zustand.quartal === config.regierung.quartaleJeJahr) return { grund: 'im Haushaltsquartal nicht möglich' };
  if (zustand.aktionenImQuartal >= config.probleme.aktionenJeQuartal) return { grund: `höchstens ${config.probleme.aktionenJeQuartal} Vorhaben je Quartal` };
  const belegt = !w.braucht && bereichStatus(zustand, w.bereich).weg;
  const kapital = w.kapital + (belegt ? rw.revisionKapital : 0);
  if (zustand.kapital < kapital) return { grund: `zu wenig politisches Kapital (${kapital} nötig)` };
  if (w.bundesrat && !bundesratAbstimmung(koalitionsParteien(zustand)).mehrheit) return { grund: 'keine Mehrheit im Bundesrat' };
  if (w.haushalt) {
    const b = vorschau(zustand, {}).bilanz;
    if (b.grenze - b.schuldenbremse < w.kosten) return { grund: 'kein Spielraum in der Schuldenbremse für die Kosten' };
  }
  return null;
}

// Vorschau für den Vergleich und den Bestätigungsdialog (ohne Zufall)
export function wegVorschau(zustand, wegId) {
  const w = weg(wegId);
  const belegt = !w.braucht ? bereichStatus(zustand, w.bereich).weg : null;
  return {
    weg: w,
    vektor: wegVektor(w),
    ausrichtung: ausrichtungName(w),
    abstimmung: abstimmung(zustand, { id: w.id, vektor: wegVektor(w) }),
    bundesrat: w.bundesrat ? bundesratAbstimmung(koalitionsParteien(zustand)) : null,
    partner: partnerReaktionen(zustand, w),
    akteure: akteurReaktionen(w),
    ...gewinnerVerlierer(w),
    risiko: r2(w.risiko + (w.verfassung ? rw.verfassungsRisiko : 0)),
    kapital: w.kapital + (belegt ? rw.revisionKapital : 0),
    revision: belegt && belegt.id !== w.id ? belegt : null,
    sperre: wegSperre(zustand, wegId),
  };
}

// Aktion: Weg verbindlich beschließen. Bundestag stimmt nach Inhalt ab. Angenommen: Kurzwirkung, Kosten laufen,
// Umsetzung beginnt; ein vorher gewählter Weg im Bereich wird gegen Revisionskosten ersetzt.
export function wegBeschliessen(zustand, { wegId }) {
  const sperre = wegSperre(zustand, wegId);
  if (sperre) throw new Error(`Reform nicht möglich: ${sperre.grund}`);
  const v = wegVorschau(zustand, wegId);
  const w = v.weg;
  const wahl = abstimmen(zustand, { id: w.id, vektor: v.vektor });
  const stimmen = `${wahl.ja} Ja, ${wahl.nein} Nein${wahl.abweichler ? `, davon ${wahl.abweichler} Abweichler` : ''}`;
  if (!wahl.angenommen) {
    return {
      state: { ...zustand, rngZustand: wahl.rngZustand, aktionenImQuartal: zustand.aktionenImQuartal + 1, kapital: zustand.kapital - Math.round(v.kapital * rw.abgelehntKapitalAnteil) },
      ereignisse: [`Reform „${w.name}“ im Bundestag abgelehnt (${stimmen})`],
    };
  }
  const reformwege = { ...zustand.reformwege };
  const umfrage = {};
  const dazu = (id, x) => (umfrage[id] = (umfrage[id] ?? 0) + x);
  const ereignisse = [`Reform beschlossen: „${w.name}“ (${v.ausrichtung}, ${stimmen}); Umsetzung in ${w.dauer} Quartalen`];
  if (v.revision) {
    // alter Weg und seine Folgewege fallen weg
    for (const x of w.bereich.wege) if (x.id === v.revision.id || x.braucht === v.revision.id) delete reformwege[x.id];
    dazu(zustand.kanzlerParteiId, -rw.revisionUmfrage);
    ereignisse.push(`Kurswechsel: „${v.revision.name}“ wird zurückgenommen (Glaubwürdigkeit −${rw.revisionUmfrage.toLocaleString('de-DE')})`);
  }
  reformwege[w.id] = { status: 'umsetzung', fertig: zustand.runde + w.dauer };
  for (const p of v.partner) if (p.unmut) dazu(p.id, -p.unmut);

  // Kurzwirkung: Gruppen und Probleme sofort, Kennzahlen im Jahresschritt; Akteure ziehen ihre Gruppen mit
  const gruppen = { ...zustand.gruppen };
  const plus = (g, x) => (gruppen[g] = Math.max(0, Math.min(100, r2(gruppen[g] + x))));
  for (const [g, x] of Object.entries(w.kurz?.gruppen ?? {})) plus(g, x);
  for (const r of v.akteure) if (r.akteur.gruppe) plus(r.akteur.gruppe, r.haltung * rw.akteurGruppenJeHaltung * 0.5);
  const probleme = { ...zustand.probleme };
  for (const [pid, x] of Object.entries(w.kurz?.probleme ?? {})) probleme[pid] = { ...probleme[pid], wert: Math.max(0, Math.min(100, probleme[pid].wert + x)) };

  let state = {
    ...zustand,
    rngZustand: wahl.rngZustand,
    reformwege,
    gruppen,
    probleme,
    kapital: zustand.kapital - v.kapital,
    aktionenImQuartal: zustand.aktionenImQuartal + 1,
    jahresWirkung: wirkungSumme(zustand.jahresWirkung, { ...w.kurz, gruppen: {}, probleme: {} }),
  };
  if (Object.keys(umfrage).length) {
    state = mitVerlauf({ ...state, anteile: runden(umverteilen(zustand.anteile, umfrage)) });
    const unmut = v.partner.filter((p) => p.unmut);
    if (unmut.length) ereignisse.push(`Unmut beim Partner: ${unmut.map((p) => `${name(p.id)} −${p.unmut.toLocaleString('de-DE')}`).join(', ')}`);
  }
  const eu = v.akteure.find((r) => r.akteur.id === 'eu');
  if (eu.haltung <= -1) ereignisse.push('Die EU-Kommission äußert Bedenken gegen die Reform.');
  return { state, ereignisse };
}

// Am Ende eines Quartals: fertige Umsetzungen. Scheitern nach Risiko (umstrittene Wege zusätzlich in Karlsruhe).
export function reformwegeQuartal(zustand) {
  let rngZustand = zustand.rngZustand;
  const reformwege = { ...zustand.reformwege };
  const ereignisse = [];
  let probleme = zustand.probleme;
  let gruppen = zustand.gruppen;
  let jahresWirkung = zustand.jahresWirkung;
  const umfrage = {};
  const dazu = (id, x) => (umfrage[id] = (umfrage[id] ?? 0) + x);
  for (const [id, s] of Object.entries(zustand.reformwege)) {
    if (s.status !== 'umsetzung' || s.fertig > zustand.runde) continue;
    const w = weg(id);
    const a = zufall(rngZustand);
    rngZustand = a.rngZustand;
    const karlsruhe = w.verfassung && a.wert < rw.verfassungsRisiko;
    const b = zufall(rngZustand);
    rngZustand = b.rngZustand;
    if (karlsruhe || b.wert < w.risiko) {
      reformwege[id] = { ...s, status: 'gescheitert' };
      dazu(zustand.kanzlerParteiId, -rw.fehlschlagUmfrage);
      ereignisse.push(karlsruhe ? `Das Bundesverfassungsgericht kippt „${w.name}“.` : `Umsetzung gescheitert: „${w.name}“.`);
      continue;
    }
    reformwege[id] = { ...s, status: 'beschlossen' };
    probleme = { ...probleme };
    for (const [pid, x] of Object.entries(w.lang?.probleme ?? {})) probleme[pid] = { ...probleme[pid], wert: Math.max(0, Math.min(100, Math.round((probleme[pid].wert + x) * 10) / 10)) };
    gruppen = { ...gruppen };
    for (const [g, x] of Object.entries(w.lang?.gruppen ?? {})) gruppen[g] = Math.max(0, Math.min(100, r2(gruppen[g] + x)));
    jahresWirkung = wirkungSumme(jahresWirkung, { ...w.lang, gruppen: {}, probleme: {} });
    // Erfolg wie bei Lösungen: Ressort und Regierung gewinnen je gesenktem Problempunkt
    const senkung = Object.values(w.lang?.probleme ?? {}).reduce((sum, x) => sum + Math.max(0, -x), 0);
    const pc = config.probleme;
    const halter = zustand.kabinett.verteilung[w.bereich.ministerium];
    if (halter) dazu(halter, senkung * pc.gewinnJeWertpunkt);
    const regierung = [zustand.kanzlerParteiId, ...zustand.koalition.partner];
    const summe = regierung.reduce((sum, p) => sum + zustand.anteile[p], 0);
    for (const p of regierung) dazu(p, (senkung * pc.gewinnRegierungJeWertpunkt * zustand.anteile[p]) / summe);
    ereignisse.push(`Reform umgesetzt: „${w.name}“`);
  }
  let state = { ...zustand, rngZustand, reformwege, probleme, gruppen, jahresWirkung };
  if (Object.keys(umfrage).length) state = mitVerlauf({ ...state, anteile: runden(umverteilen(zustand.anteile, umfrage)) });
  return { state, ereignisse };
}

// Wirkung des Richtungsprofils je Haushaltsjahr: Wirtschaft, EU-Kurs, Partner und Kanzlerpartei
export function profilWirkung(zustand) {
  const p = richtungsprofil(zustand);
  const pk = rw.profil;
  const leer = Object.values(p).every((x) => x === 0);
  if (leer) return { wirkung: wirkungSumme(), umfrage: {} };
  const wirkung = {
    wachstum: pk.wachstumJePunkt * p.wirtschaft - (p.eu < pk.euKritisch ? pk.euWachstum : 0),
    gini: pk.giniJePunkt * p.wirtschaft,
  };
  const umfrage = {};
  for (const id of zustand.koalition.partner) {
    const d = abstand(parteiPosition(id), p);
    if (d > 1) umfrage[id] = -r2((d - 1) * pk.partnerJePunkt);
  }
  // Kanzlerpartei: Glaubwürdigkeit, wenn das Land in ihre Richtung geht, Verlust, wenn nicht
  umfrage[zustand.kanzlerParteiId] = r2(pk.kanzlerJePunkt * (1 - abstand(parteiPosition(zustand.kanzlerParteiId), p)));
  return { wirkung: wirkungSumme(wirkung), umfrage };
}

export { richtungsprofil, achsen };
