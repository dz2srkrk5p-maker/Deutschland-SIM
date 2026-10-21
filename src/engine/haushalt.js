import { config } from '../data/config.js';
import { parteien } from '../data/parteien.js';
import { ministerien } from '../data/ministerien.js';
import { festeAusgaben2026, sonstigeEinnahmen2026 } from '../data/haushalt.js';
import { umverteilen, schwankung, runden } from './wahlkampf.js';
import { bundesratAbstimmung } from './bundesrat.js';
import { koalitionsParteien } from './kabinett.js';
import { mehrheit } from './koalition.js';
import { zurueckInDenWahlkampf, mitVerlauf } from './state.js';

const hh = config.haushalt;
const festeSumme = Object.values(festeAusgaben2026).reduce((s, x) => s + x, 0);
const MRD = 1e6; // tausend Euro je Mrd.
export const mrd = (tausend) => tausend / MRD;

// Einnahmen, Ausgaben und Schuldenbremse für einen Haushalt (Beträge in tausend Euro)
export function bilanz(etats, steuern) {
  const ausgaben = Object.values(etats).reduce((s, x) => s + x, 0) + festeSumme;
  const einnahmen = steuern + sonstigeEinnahmen2026;
  const neueSchulden = ausgaben - einnahmen;
  const ausnahme = Math.max(0, etats.verteidigung - hh.verteidigungsFreigrenze);
  const schuldenbremse = Math.max(0, neueSchulden - ausnahme);
  return { ausgaben, einnahmen, neueSchulden, ausnahme, schuldenbremse, eingehalten: schuldenbremse <= hh.schuldenbremseGrenze };
}

const stufeOk = (stufe, max) => Number.isInteger(stufe) && Math.abs(stufe) <= max;

// Haushalt nach den gewählten Stufen und seine Wirkung auf die Umfragen (vor der Schwankung).
// stufen: { ministeriumId: ganzzahlige Stufe } (fehlend = 0), steuerStufe: ganzzahlig
export function vorschau(zustand, { stufen = {}, steuerStufe = 0 }) {
  const maxMinister = hh.ministerMaxProzent / hh.ministerSchrittProzent;
  const maxSteuer = hh.steuerMaxProzent / hh.steuerSchrittProzent;
  for (const [id, stufe] of Object.entries(stufen)) {
    if (!(id in zustand.haushalt.etats) || !stufeOk(stufe, maxMinister)) throw new Error(`Ungültige Stufe für ${id}: ${stufe}`);
  }
  if (!stufeOk(steuerStufe, maxSteuer)) throw new Error(`Ungültige Steuerstufe: ${steuerStufe}`);

  const verteilung = zustand.kabinett.verteilung;
  const wirkung = {};
  const dazu = (id, wert) => (wirkung[id] = (wirkung[id] ?? 0) + wert);

  const etats = {};
  for (const m of ministerien) {
    const alt = zustand.haushalt.etats[m.id];
    etats[m.id] = Math.round(alt * (1 + ((stufen[m.id] ?? 0) * hh.ministerSchrittProzent) / 100));
    const delta = mrd(etats[m.id] - alt);
    if (delta) dazu(verteilung[m.id], delta * (delta > 0 ? hh.wirkungMehrausgabeProMrd : hh.wirkungKuerzungProMrd));
  }
  const steuern = Math.round(zustand.haushalt.steuern * (1 + (steuerStufe * hh.steuerSchrittProzent) / 100));
  const steuerDelta = mrd(steuern - zustand.haushalt.steuern);
  if (steuerDelta) {
    dazu(verteilung.finanzen, -steuerDelta * (steuerDelta > 0 ? hh.wirkungSteuerErhoehungProMrd : hh.wirkungSteuerSenkungProMrd));
  }
  // Steueränderungen brauchen die Zustimmung des Bundesrats (Art. 105 GG), der übrige Haushalt nicht
  const bundesrat = steuerStufe ? bundesratAbstimmung(koalitionsParteien(zustand)) : null;
  // anteile: nach fester Wirkung, ohne Schwankung (für die Vorschau des Koalitionsbruchs)
  return { etats, steuern, bilanz: bilanz(etats, steuern), wirkung, bundesrat, anteile: runden(umverteilen(zustand.anteile, wirkung)) };
}

// Aktion: Haushalt des laufenden Jahres beschließen. Nach dem letzten Jahr der Wahlperiode folgt der Wahlkampf.
export function haushaltBeschliessen(zustand, params) {
  if (zustand.phase !== 'regierung') throw new Error('Keine Regierung im Amt');
  const v = vorschau(zustand, params);
  if (!v.bilanz.eingehalten) throw new Error('Schuldenbremse überschritten');
  if (v.bundesrat && !v.bundesrat.mehrheit) throw new Error('Keine Mehrheit im Bundesrat für die Steueränderung');

  const s = schwankung(umverteilen(zustand.anteile, v.wirkung), zustand.rngZustand);
  const jahr = zustand.haushalt.jahr;
  const haushalt = {
    jahr: jahr + 1,
    etats: v.etats,
    steuern: v.steuern,
    neueSchuldenSeitStart: zustand.haushalt.neueSchuldenSeitStart + v.bilanz.neueSchulden,
  };
  const name = (id) => parteien.find((p) => p.id === id).name;
  const wirkungText = Object.entries(v.wirkung)
    .map(([id, w]) => `${name(id)} ${w >= 0 ? '+' : '−'}${Math.abs(w).toLocaleString('de-DE', { maximumFractionDigits: 2 })}`)
    .join(', ');
  const ereignisse = [
    `Haushalt Jahr ${jahr} beschlossen: neue Schulden ${mrd(v.bilanz.neueSchulden).toLocaleString('de-DE', { maximumFractionDigits: 2 })} Mrd.` +
      (wirkungText ? ` Wirkung: ${wirkungText}` : ''),
  ];
  const statistik = { ...zustand.statistik, jahreKanzler: zustand.statistik.jahreKanzler + 1 };
  const state = mitVerlauf({ ...zustand, anteile: runden(s.anteile), rngZustand: s.rngZustand, haushalt, statistik });

  // Reihenfolge bei gleichzeitigem Eintreten: Sieg vor Koalitionsbruch vor Ende der Wahlperiode
  if (statistik.jahreKanzler >= config.spielende.siegJahreKanzler) {
    return { state: { ...state, phase: 'sieg' }, ereignisse: [...ereignisse, `Sieg: ${statistik.jahreKanzler} Jahre als Kanzler`] };
  }
  const bruch = koalitionsbruch(state);
  if (bruch.neuwahl) return { state: zurueckInDenWahlkampf(bruch.state), ereignisse: [...ereignisse, ...bruch.ereignisse] };
  if (jahr < config.legislaturJahre) return { state: bruch.state, ereignisse: [...ereignisse, ...bruch.ereignisse] };
  return {
    state: zurueckInDenWahlkampf(bruch.state),
    ereignisse: [...ereignisse, ...bruch.ereignisse, 'Wahlperiode vorbei: Wahlkampf für die nächste Bundestagswahl'],
  };
}

// Verlust jedes Partners seit der Regierungsbildung und die Bruchgrenze, in Prozentpunkten. Gerechnet in Tausendsteln.
export function bruchAbstand(zustand, anteile = zustand.anteile) {
  const { partner, startAnteile } = zustand.koalition;
  const grenze = Math.round(config.spielende.koalitionsbruchPunkte * 1000);
  return partner.map((id) => {
    const verlust = Math.round((startAnteile[id] - anteile[id]) * 1000);
    return { id, verlust: verlust / 1000, grenze: grenze / 1000, geht: verlust > grenze };
  });
}

// Partner, deren Umfrage mehr als koalitionsbruchPunkte unter dem Wert bei Regierungsbildung liegt, verlassen die Koalition.
// Ihre Ministerien gehen an die Spielerpartei. Ohne verbleibende Mehrheit: vorgezogene Neuwahl.
export function koalitionsbruch(zustand) {
  const { partner } = zustand.koalition;
  const gehen = bruchAbstand(zustand).filter((a) => a.geht).map((a) => a.id);
  if (!gehen.length) return { state: zustand, ereignisse: [], neuwahl: false };

  const spieler = zustand.spielerParteiId;
  const bleiben = partner.filter((id) => !gehen.includes(id));
  const verteilung = Object.fromEntries(Object.entries(zustand.kabinett.verteilung).map(([m, id]) => [m, gehen.includes(id) ? spieler : id]));
  const anspruch = { ...zustand.kabinett.anspruch };
  for (const id of gehen) {
    anspruch[spieler] += anspruch[id];
    delete anspruch[id];
  }
  const state = { ...zustand, koalition: { ...zustand.koalition, partner: bleiben }, kabinett: { anspruch, verteilung } };
  const ereignisse = gehen.map((id) => `Koalitionsbruch: ${parteien.find((p) => p.id === id).name} verlässt die Koalition`);
  const sitze = [spieler, ...bleiben].reduce((s, id) => s + zustand.sitze[id], 0);
  if (sitze >= mehrheit(zustand.sitze)) return { state, ereignisse: [...ereignisse, `Regierung behält die Mehrheit (${sitze} Sitze)`], neuwahl: false };
  return { state, ereignisse: [...ereignisse, `Keine Mehrheit mehr (${sitze} Sitze): vorgezogene Neuwahl`], neuwahl: true };
}
