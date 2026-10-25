import { config } from '../data/config.js';
import { parteien } from '../data/parteien.js';
import { ministerien } from '../data/ministerien.js';
import { festeAusgaben2026 } from '../data/haushalt.js';
import { startSchulden, startBip, kennzahlen } from '../data/kennzahlen.js';
import { umverteilen, schwankung, runden } from './wahlkampf.js';
import { bundesratAbstimmung, kompromissMoeglich } from './bundesrat.js';
import { abstimmung, abstimmen } from './bundestag.js';
import { koalitionsParteien } from './kabinett.js';
import { mehrheit } from './koalition.js';
import { zurueckInDenWahlkampf, mitVerlauf } from './state.js';
import { laufendeKosten as loesungsKosten, jahresFolgen } from './probleme.js';
import { wegKosten, profilWirkung } from './reformwege.js';

// Laufende Kosten von Lösungen (System 3) und Reformwegen (System 1)
export const laufendeKosten = (zustand) => loesungsKosten(zustand) + wegKosten(zustand);
import { aufstellung, entwurfPruefen, entwurfWirkung, einnahmenUebernehmen } from './einnahmen.js';
import { umfrageBuchen } from './umfragebilanz.js';
import { verfahrenAnlegen } from './verfahren.js';
import { verbaendeZuSteuern, verbaendeKapital } from './verbaende.js';
import { vertragHaushalt, vertragOhne } from './koalitionsvertrag.js';
import { jahresSchritt, gruppenSchritt, lageUmfrage, lageTeile, wirkungSumme, wirtschaftWerte } from './wirtschaft.js';

const hh = config.haushalt;
const x0 = (x) => `${x > 0 ? '+' : x < 0 ? '−' : '±'}${Math.abs(x)}`; // Kapital mit Vorzeichen
const festeOhneZinsen = Object.values(festeAusgaben2026).reduce((s, x) => s + x, 0) - festeAusgaben2026.bundesschuld;
const MRD = 1e6; // tausend Euro je Mrd.
export const mrd = (tausend) => tausend / MRD;

// Zinsausgaben (Epl. 32 Bundesschuld) wachsen mit dem Schuldenstand des Staates (System 2)
// Zinsen wachsen mit dem Schuldenstand, dazu der Zinsaufschlag (Feature 2)
export const zinsen = (zustand) => Math.round(((festeAusgaben2026.bundesschuld * zustand.land.schulden) / startSchulden) * (1 + (zustand.land.zinsaufschlag ?? 0)));

// Grenze der Schuldenbremse: wächst mit dem nominalen BIP, plus Konjunkturkomponente (mehr Kredit in schwachen Jahren)
const startWachstum = kennzahlen.find((k) => k.id === 'wachstum').start;
export const schuldenbremseGrenze = (zustand) =>
  Math.round(hh.schuldenbremseGrenze * (zustand.land.bip / startBip) + hh.konjunkturJePunkt * (startWachstum - zustand.land.wachstum));

// Einnahmen, Ausgaben und Schuldenbremse für einen Haushalt (Beträge in tausend Euro).
// einnahmen: Einnahmen des Kernhaushalts; reformen: laufende Kosten von Lösungen und Reformen; zinsAusgaben: Bundesschuld; grenze: Schuldenbremse
export function bilanz(etats, einnahmen, reformen = 0, zinsAusgaben = festeAusgaben2026.bundesschuld, grenze = hh.schuldenbremseGrenze) {
  const ausgaben = Object.values(etats).reduce((s, x) => s + x, 0) + festeOhneZinsen + zinsAusgaben + reformen;
  const neueSchulden = ausgaben - einnahmen;
  const ausnahme = Math.max(0, etats.verteidigung - hh.verteidigungsFreigrenze);
  const schuldenbremse = Math.max(0, neueSchulden - ausnahme);
  return { ausgaben, reformen, zinsen: zinsAusgaben, einnahmen, neueSchulden, ausnahme, schuldenbremse, grenze, eingehalten: schuldenbremse <= grenze };
}

const stufeOk = (stufe, max) => Number.isInteger(stufe) && Math.abs(stufe) <= max;

// Etat nach einer Änderung um stufe Schritte (ministerSchrittProzent je Schritt) gegenüber dem Vorjahr
export const etatNeu = (alt, stufe) => Math.round(alt * (1 + (stufe * hh.ministerSchrittProzent) / 100));

// Haushalt nach dem Entwurf und seine Wirkung auf die Umfragen (vor der Schwankung) und auf Kennzahlen.
// stufen: { ministeriumId: ganzzahlige Stufe }; einnahmen: { artId: Stufenänderung }; ausgestaltung: { schalterId: an/aus }
export function vorschau(zustand, { stufen = {}, einnahmen = {}, ausgestaltung = {}, kompromiss = false } = {}) {
  const maxMinister = hh.ministerMaxProzent / hh.ministerSchrittProzent;
  for (const [id, stufe] of Object.entries(stufen)) {
    if (!(id in zustand.haushalt.etats) || !stufeOk(stufe, maxMinister)) throw new Error(`Ungültige Stufe für ${id}: ${stufe}`);
  }
  const entwurf = { einnahmen, ausgestaltung };
  entwurfPruefen(zustand, entwurf);

  const verteilung = zustand.kabinett.verteilung;
  const wirkung = {};
  const posten = []; // Umfrage-Bilanz: dieselben Beiträge mit Ursache
  const dazu = (id, wert, ursache) => ((wirkung[id] = (wirkung[id] ?? 0) + wert), posten.push({ ursache, partei: id, wert }));

  const etats = {};
  for (const m of ministerien) {
    const alt = zustand.haushalt.etats[m.id];
    etats[m.id] = etatNeu(alt, stufen[m.id] ?? 0);
    const delta = mrd(etats[m.id] - alt);
    if (delta) dazu(verteilung[m.id], delta * (delta > 0 ? hh.wirkungMehrausgabeProMrd : hh.wirkungKuerzungProMrd), `Haushalt: Etat ${m.kurz} ${delta > 0 ? 'erhöht' : 'gekürzt'}`);
  }
  const einnahmenNeu = aufstellung(zustand, entwurf);
  // Mehr- oder Mindereinnahmen wirken auf die Partei mit dem Finanzministerium
  const einnahmenDelta = mrd(einnahmenNeu.kern - aufstellung(zustand).kern);
  if (Math.abs(einnahmenDelta) > 1e-9) dazu(verteilung.finanzen, einnahmenUmfrage(einnahmenDelta), `Haushalt: Einnahmen ${einnahmenDelta > 0 ? 'erhöht' : 'gesenkt'} (Finanzministerium)`);
  const ew = entwurfWirkung(zustand, entwurf);
  // Änderungen an Gemeinschafts-, Länder- und Gemeindesteuern brauchen den Bundesrat (Art. 105 GG)
  const br = ew.bundesrat ? bundesratAbstimmung(koalitionsParteien(zustand), zustand.laender) : null;
  // Kompromiss im Bundesrat (Feature 6): Ausgleichszahlung an die Länder statt Scheitern, wenn nicht zu viele Stimmen fehlen
  const mitKompromiss = Boolean(kompromiss && br && kompromissMoeglich(br));
  const bundesrat = br && { ...br, kompromissMoeglich: kompromissMoeglich(br), ...(mitKompromiss ? { mehrheit: true, kompromiss: true } : {}) };
  const ausgleich = mitKompromiss ? config.kompromiss.laenderAusgleich : 0;
  // Der Haushalt braucht die einfache Mehrheit im Bundestag (F10); mit Koalitionsmehrheit immer erfüllt
  const bundestag = abstimmung(zustand, 'haushalt');
  return {
    etats, einnahmen: einnahmenNeu, bilanz: bilanz(etats, einnahmenNeu.kern, laufendeKosten(zustand) + ausgleich, zinsen(zustand), schuldenbremseGrenze(zustand)), ausgleich,
    // verbaende: Haltung zu den Steueränderungen (nur Einnahmen und Ausgestaltung), Kapital beim Beschluss
    verbaende: verbaendeZuSteuern(ew.wirkung), verbaendeKapital: verbaendeKapital(verbaendeZuSteuern(ew.wirkung)),
    wirkung, posten, kennzahlWirkung: ew.wirkung, verfassung: ew.verfassung, rechtsrisiken: ew.rechtsrisiken, bundesrat, bundestag,
    // anteile: nach fester Wirkung, ohne Schwankung (für die Vorschau des Koalitionsbruchs)
    anteile: runden(umverteilen(zustand.anteile, wirkung)),
  };
}

// Umfragewirkung von Mehr- (positiv) oder Mindereinnahmen in Mrd. auf die Partei mit dem Finanzministerium
const einnahmenUmfrage = (deltaMrd) => -deltaMrd * (deltaMrd > 0 ? hh.wirkungSteuerErhoehungProMrd : hh.wirkungSteuerSenkungProMrd);

// Gesamtwirkung aller Einnahmeänderungen eines Entwurfs (Übersicht unter Haushalt → Einnahmen): Kennzahlen, Gruppen und
// Probleme beim Beschluss, Mehr- oder Mindereinnahmen im 1. Jahr (Kernhaushalt, Klimafonds) und die Umfrage der Partei mit
// dem Finanzministerium – dieselben Rechnungen wie in vorschau, nur ohne die Etats
export function einnahmenWirkung(zustand, { einnahmen = {}, ausgestaltung = {} } = {}) {
  const entwurf = { einnahmen, ausgestaltung };
  const neu = aufstellung(zustand, entwurf);
  const alt = aufstellung(zustand);
  const kern = mrd(neu.kern - alt.kern);
  const partei = zustand.kabinett?.verteilung?.finanzen;
  const wirkung = entwurfWirkung(zustand, entwurf).wirkung;
  const verbaende = verbaendeZuSteuern(wirkung);
  return {
    wirkung, kern, ktf: mrd(neu.ktf - alt.ktf), verbaende, verbaendeKapital: verbaendeKapital(verbaende),
    umfrage: partei && Math.abs(kern) > 1e-9 ? { [partei]: einnahmenUmfrage(kern) } : {},
  };
}

// Mehrjahresprognose ohne Zufall (System 2): der Entwurf gilt ab diesem Jahr, danach bleibt alles unverändert.
// Für den Szenariovergleich „beschlossener Plan“ (entwurf = {}) gegen „Entwurf“. Ändert nichts am Spielstand.
export function prognose(zustand, entwurf = {}, jahre = 5) {
  let z = zustand;
  let e = entwurf;
  const zeilen = [];
  for (let i = 0; i < jahre; i++) {
    const v = vorschau(z, e);
    const w = jahresSchritt(z.land, v.kennzahlWirkung, mrd(v.bilanz.neueSchulden), 0, false);
    zeilen.push({ jahr: i + 1, einnahmen: v.bilanz.einnahmen, ausgaben: v.bilanz.ausgaben, saldo: -v.bilanz.neueSchulden,
      schuldenbremse: v.bilanz.schuldenbremse, grenze: v.bilanz.grenze, eingehalten: v.bilanz.eingehalten,
      wachstum: w.land.wachstum, schuldenquote: w.land.schuldenquote, zinsaufschlag: w.land.zinsaufschlag, zinsen: v.bilanz.zinsen });
    z = { ...z, land: w.land, haushalt: { ...z.haushalt, etats: v.etats, einnahmen: einnahmenUebernehmen(z, e) } };
    e = {};
  }
  return zeilen;
}

// Kürzungsvorschlag, damit die Schuldenbremse hält: Etats je eine Stufe kürzen, Partner-Ministerien zuerst, große Etats
// zuerst, bis es reicht. Ändert nur stufen, die Einnahmen des Entwurfs bleiben. Gibt null zurück, wenn es nicht reicht.
export function kuerzungsVorschlag(zustand, entwurf = {}) {
  const stufen = { ...(entwurf.stufen ?? {}) };
  const eigen = (m) => zustand.kabinett.verteilung[m] === zustand.spielerParteiId;
  const reihenfolge = ministerien.map((m) => m.id).sort((a, b) => eigen(a) - eigen(b) || zustand.haushalt.etats[b] - zustand.haushalt.etats[a]);
  const max = hh.ministerMaxProzent / hh.ministerSchrittProzent;
  const haelt = () => vorschau(zustand, { ...entwurf, stufen }).bilanz.eingehalten;
  for (let runde = 1; runde <= max; runde++) {
    for (const id of reihenfolge) {
      if (haelt()) return { ...entwurf, stufen };
      if ((stufen[id] ?? 0) > -runde) stufen[id] = -runde;
    }
  }
  return haelt() ? { ...entwurf, stufen } : null;
}

const zahl = (x, n = 2) => x.toLocaleString('de-DE', { maximumFractionDigits: n });

// Aktion: Haushalt des laufenden Jahres beschließen. Danach entwickelt sich die Wirtschaft ein Jahr weiter (System 2).
// Nach dem letzten Jahr der Wahlperiode folgt der Wahlkampf.
export function haushaltBeschliessen(zustand, params = {}) {
  if (zustand.phase !== 'regierung') throw new Error('Keine Regierung im Amt');
  if (zustand.quartal !== config.regierung.quartaleJeJahr) throw new Error('Der Haushalt kommt erst im letzten Quartal');
  if (zustand.offenesEreignis) throw new Error('Erst auf das Ereignis reagieren');
  const v = vorschau(zustand, params);
  // echte Abstimmung: gleich der Vorschau, außer bei einer Brandmauer-Regierung (Abweichler per Zufall, F11)
  const bundestag = abstimmen(zustand, 'haushalt');
  // Minderheitsregierung (F11): fällt der Haushalt im Bundestag durch, gilt der Vorjahreshaushalt weiter
  const gescheitert = !bundestag.angenommen;
  if (gescheitert && !zustand.koalition.minderheit) throw new Error('Keine Mehrheit im Bundestag für den Haushalt');
  if (!gescheitert && !v.bilanz.eingehalten) throw new Error('Schuldenbremse überschritten');
  if (!gescheitert && v.bundesrat && !v.bundesrat.mehrheit) throw new Error('Keine Mehrheit im Bundesrat für die Steueränderung');
  const kompromissPreis = !gescheitert && v.bundesrat?.kompromiss ? config.kompromiss.kapital : 0;
  // Verbände (freigegeben 2026-10-25): Zustimmung oder Protest gegen die Steueränderungen kostet oder bringt Kapital
  const verbandKapital = gescheitert ? 0 : v.verbaendeKapital;
  const kapitalNeu = Math.max(0, Math.min(config.kapital.max, zustand.kapital - kompromissPreis + verbandKapital));
  if (zustand.kapital < kompromissPreis) throw new Error(`Für den Kompromiss im Bundesrat fehlt politisches Kapital (${kompromissPreis} nötig)`);

  const jahr = zustand.haushalt.jahr;
  const alt = zustand.haushalt;
  const wirkung = gescheitert ? { [zustand.kanzlerParteiId]: -config.minderheit.umfrageVerlustHaushaltGescheitert } : { ...v.wirkung };
  const posten = gescheitert ? [{ ursache: 'Haushalt im Bundestag gescheitert', partei: zustand.kanzlerParteiId, wert: wirkung[zustand.kanzlerParteiId] }] : [...v.posten];
  const gilt = gescheitert
    ? { etats: alt.etats, einnahmen: alt.einnahmen, neueSchulden: bilanz(alt.etats, aufstellung(zustand).kern, laufendeKosten(zustand), zinsen(zustand)).neueSchulden }
    : { etats: v.etats, einnahmen: einnahmenUebernehmen(zustand, params), neueSchulden: v.bilanz.neueSchulden };

  // Wirtschaft: ein Jahr weiter mit den Wirkungen des Haushalts; die Lage wirkt auf die Kanzlerpartei
  // dazu die Folgen der Probleme, die Wirkungen aus dem Jahr (System 3) und das Richtungsprofil (System 1)
  const profil = profilWirkung(zustand);
  // Koalitionsvertrag (Feature 7): Kürzungen in Partner-Ressorts, Rückstand bei den Vorhaben
  const vertragPosten = vertragHaushalt(zustand, gescheitert ? {} : params.stufen);
  for (const p of vertragPosten) {
    wirkung[p.partei] = (wirkung[p.partei] ?? 0) + p.wert;
    posten.push(p);
  }
  for (const [id, x] of Object.entries(profil.umfrage)) {
    if (!x) continue;
    wirkung[id] = (wirkung[id] ?? 0) + x;
    posten.push({ ursache: 'Richtungsprofil des Landes', partei: id, wert: x });
  }
  const kw = wirkungSumme(gescheitert ? entwurfWirkung(zustand, {}).wirkung : v.kennzahlWirkung, jahresFolgen(zustand), profil.wirkung);
  const w = jahresSchritt(zustand.land, kw, mrd(gilt.neueSchulden), bundestag.rngZustand);
  const gruppen = gruppenSchritt(zustand.gruppen, kw.gruppen);
  const lage = lageUmfrage(zustand.land, w.land, gruppen);
  if (lage) {
    wirkung[zustand.kanzlerParteiId] = (wirkung[zustand.kanzlerParteiId] ?? 0) + lage;
    for (const t of lageTeile(zustand.land, w.land, gruppen)) posten.push({ ...t, partei: zustand.kanzlerParteiId });
  }

  const s = schwankung(umverteilen(zustand.anteile, wirkung), w.rngZustand);
  const haushalt = { jahr: jahr + 1, etats: gilt.etats, einnahmen: gilt.einnahmen, neueSchuldenSeitStart: alt.neueSchuldenSeitStart + gilt.neueSchulden };
  const name = (id) => parteien.find((p) => p.id === id).name;
  const wirkungText = Object.entries(wirkung).map(([id, x]) => `${name(id)} ${x >= 0 ? '+' : '−'}${zahl(Math.abs(x))}`).join(', ');
  const ereignisse = [
    (gescheitert
      ? `Haushalt Jahr ${jahr} im Bundestag gescheitert (${bundestag.ja} Ja, ${bundestag.nein} Nein): vorläufige Haushaltsführung, der Vorjahreshaushalt gilt weiter, neue Schulden ${zahl(mrd(gilt.neueSchulden))} Mrd.`
      : `Haushalt Jahr ${jahr} beschlossen: neue Schulden ${zahl(mrd(gilt.neueSchulden))} Mrd.`) + (wirkungText ? ` Wirkung: ${wirkungText}` : ''),
    ...vertragPosten.map((p) => `${p.ursache}: ${name(p.partei)} −${zahl(Math.abs(p.wert))}`),
    ...(kompromissPreis ? [`Kompromiss im Bundesrat: Ausgleichszahlung an die Länder ${zahl(mrd(v.ausgleich))} Mrd., ${kompromissPreis} Kapital`] : []),
    ...(!gescheitert && v.verbaende.some((x) => x.kapital) ? [`Verbände zu den Steueränderungen: ${v.verbaende.filter((x) => x.kapital).map((x) => `${x.akteur.name} ${x.kapital < 0 ? 'protestieren' : 'stimmen zu'}`).join(', ')} (Kapital ${x0(verbandKapital)})`] : []),
    `Wirtschaft: Wachstum ${zahl(w.land.wachstum, 1)} %, Inflation ${zahl(w.land.inflation, 1)} %, Arbeitslosigkeit ${zahl(w.land.arbeitslosigkeit, 1)} %, Schuldenquote ${zahl(w.land.schuldenquote, 1)} %`,
  ];
  const statistik = { ...zustand.statistik, jahreKanzler: zustand.statistik.jahreKanzler + 1 };
  const fehlschlaege = (zustand.koalition.fehlschlaege ?? 0) + (gescheitert ? 1 : 0);
  const koalition = { ...zustand.koalition, fehlschlaege };
  const state = verfahrenAnlegen(umfrageBuchen(zustand, mitVerlauf({ ...zustand, anteile: runden(s.anteile), rngZustand: s.rngZustand, haushalt, land: w.land, wirtschaftVerlauf: [...(zustand.wirtschaftVerlauf ?? []), wirtschaftWerte(w.land)], gruppen, statistik, koalition, quartal: 1, runde: zustand.runde + 1, jahresWirkung: wirkungSumme(), kapital: kapitalNeu }), posten, `Haushalt Jahr ${jahr}`), gescheitert ? [] : v.rechtsrisiken);

  // Reihenfolge bei gleichzeitigem Eintreten: Sieg vor Koalitionsbruch vor Ende der Wahlperiode
  if (statistik.jahreKanzler >= config.spielende.siegJahreKanzler) {
    return { state: { ...state, phase: 'sieg' }, ereignisse: [...ereignisse, `Sieg: ${statistik.jahreKanzler} Jahre als Kanzler`] };
  }
  if (fehlschlaege >= config.minderheit.fehlschlaegeBisSpielende) {
    return { state: { ...state, phase: 'opposition' }, ereignisse: [...ereignisse, `${fehlschlaege}. gescheiterter Haushalt in dieser Wahlperiode: Die Minderheitsregierung ist am Ende, Opposition`] };
  }
  const bruch = koalitionPruefen(state);
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
// Ihre Ministerien gehen an die Spielerpartei. Ohne verbleibende Mehrheit: als Minderheit weiter, wenn die Spielerpartei
// die stärkste Fraktion ist (F11), sonst vorgezogene Neuwahl.
export function koalitionsbruch(zustand, kandidaten = zustand.koalition.partner) {
  const { partner } = zustand.koalition;
  const gehen = bruchAbstand(zustand).filter((a) => a.geht && kandidaten.includes(a.id)).map((a) => a.id);
  if (!gehen.length) return { state: zustand, ereignisse: [], neuwahl: false };

  const spieler = zustand.spielerParteiId;
  const bleiben = partner.filter((id) => !gehen.includes(id));
  const verteilung = Object.fromEntries(Object.entries(zustand.kabinett.verteilung).map(([m, id]) => [m, gehen.includes(id) ? spieler : id]));
  const anspruch = { ...zustand.kabinett.anspruch };
  for (const id of gehen) {
    anspruch[spieler] += anspruch[id];
    delete anspruch[id];
  }
  const ultimatum = Object.fromEntries(Object.entries(zustand.koalition.ultimatum ?? {}).filter(([id]) => !gehen.includes(id)));
  const state = { ...zustand, koalition: { ...zustand.koalition, partner: bleiben, ultimatum, vertrag: vertragOhne(zustand.koalition.vertrag, gehen) ?? null }, kabinett: { anspruch, verteilung } };
  const ereignisse = gehen.map((id) => `Koalitionsbruch: ${parteien.find((p) => p.id === id).name} verlässt die Koalition`);
  const sitze = [spieler, ...bleiben].reduce((s, id) => s + zustand.sitze[id], 0);
  if (sitze >= mehrheit(zustand.sitze)) return { state, ereignisse: [...ereignisse, `Regierung behält die Mehrheit (${sitze} Sitze)`], neuwahl: false };
  const staerkste = zustand.sitze[spieler] >= Math.max(...Object.values(zustand.sitze));
  if (staerkste) {
    const minderheit = { ...state, koalition: { ...state.koalition, minderheit: true } };
    return { state: minderheit, ereignisse: [...ereignisse, `Keine Mehrheit mehr (${sitze} Sitze): weiter als Minderheitsregierung`], neuwahl: false };
  }
  return { state, ereignisse: [...ereignisse, `Keine Mehrheit mehr (${sitze} Sitze): vorgezogene Neuwahl`], neuwahl: true };
}

// Vorhersehbarer Bruch (Block 2): ab ultimatumAnteil der Grenze stellt ein Partner ein Ultimatum mit Frist. Gebrochen wird
// erst, wenn die Frist abgelaufen ist und er dann über der Grenze liegt. Unter der Warnstufe zieht er das Ultimatum zurück.
// Läuft am Ende jedes Quartals und nach dem Haushalt.
export function koalitionPruefen(zustand) {
  if (zustand.phase !== 'regierung' || !zustand.koalition?.partner.length) return { state: zustand, ereignisse: [], neuwahl: false };
  const kb = config.koalitionsbruch;
  const ultimatum = { ...(zustand.koalition.ultimatum ?? {}) };
  const ereignisse = [];
  const abgelaufen = [];
  for (const a of bruchAbstand(zustand)) {
    const n = parteien.find((p) => p.id === a.id).name;
    if (ultimatum[a.id] === undefined) {
      if (a.verlust > a.grenze * kb.ultimatumAnteil) {
        ultimatum[a.id] = zustand.runde + kb.fristQuartale;
        ereignisse.push(`Ultimatum: ${n} droht mit dem Koalitionsbruch, wenn sie in ${kb.fristQuartale} Quartalen noch mehr als ${a.grenze.toLocaleString('de-DE')} Punkte unter ihrem Start liegt`);
      }
    } else if (a.verlust < a.grenze * config.spielende.warnAnteil) {
      delete ultimatum[a.id];
      ereignisse.push(`${n} zieht das Ultimatum zurück`);
    } else if (a.geht && ultimatum[a.id] <= zustand.runde) abgelaufen.push(a.id);
  }
  const bruch = koalitionsbruch({ ...zustand, koalition: { ...zustand.koalition, ultimatum } }, abgelaufen);
  return { ...bruch, ereignisse: [...ereignisse, ...bruch.ereignisse] };
}

// Quartalsenden bis zur Bruchprüfung (1: am Ende dieses Quartals), null ohne Ultimatum
export const ultimatumRest = (zustand, id) => {
  const frist = zustand.koalition?.ultimatum?.[id];
  return frist === undefined ? null : Math.max(1, frist - zustand.runde);
};

// Gegenmaßnahme Zugeständnis: der Partner bekommt ein Vorhaben durch, das ihm wichtig ist
export function zugestaendnisSperre(zustand, partnerId) {
  const kb = config.koalitionsbruch;
  if (zustand.phase !== 'regierung' || !zustand.koalition.partner.includes(partnerId)) return 'kein Koalitionspartner';
  if (zustand.offenesEreignis) return 'erst auf das Ereignis reagieren';
  if (zustand.koalition.zugestaendnisse?.[partnerId] === zustand.haushalt.jahr) return 'in diesem Jahr schon ein Zugeständnis';
  if (zustand.aktionenImQuartal >= config.probleme.aktionenJeQuartal) return `höchstens ${config.probleme.aktionenJeQuartal} Vorhaben je Quartal`;
  if (zustand.kapital < kb.zugestaendnisKapital) return `zu wenig politisches Kapital (${kb.zugestaendnisKapital} nötig)`;
  return null;
}

export function zugestaendnis(zustand, { partnerId }) {
  const grund = zugestaendnisSperre(zustand, partnerId);
  if (grund) throw new Error(`Zugeständnis nicht möglich: ${grund}`);
  const kb = config.koalitionsbruch;
  const anteile = runden(umverteilen(zustand.anteile, { [partnerId]: kb.zugestaendnisPunkte, [zustand.kanzlerParteiId]: -kb.zugestaendnisKanzler }));
  const koalition = { ...zustand.koalition, zugestaendnisse: { ...zustand.koalition.zugestaendnisse, [partnerId]: zustand.haushalt.jahr } };
  const n = parteien.find((p) => p.id === partnerId).name;
  return {
    state: umfrageBuchen(zustand, mitVerlauf({ ...zustand, anteile, koalition, kapital: zustand.kapital - kb.zugestaendnisKapital, aktionenImQuartal: zustand.aktionenImQuartal + 1 }), [
      { ursache: `Zugeständnis an ${n}`, partei: partnerId, wert: kb.zugestaendnisPunkte },
      { ursache: `Zugeständnis an ${n}`, partei: zustand.kanzlerParteiId, wert: -kb.zugestaendnisKanzler },
    ]),
    ereignisse: [`Zugeständnis an ${n}: +${kb.zugestaendnisPunkte.toLocaleString('de-DE')} für ${n}, −${kb.zugestaendnisKanzler.toLocaleString('de-DE')} für die eigene Partei, Kapital −${kb.zugestaendnisKapital}`],
  };
}
