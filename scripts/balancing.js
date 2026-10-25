// Balancing-Bericht: spielt viele Partien mit einfachen Strategien und schreibt docs/BALANCING.md.
// Start: npm run balancing
import { writeFileSync } from 'node:fs';
import { config } from '../src/data/config.js';
import { parteien } from '../src/data/parteien.js';
import { neuesSpiel } from '../src/engine/state.js';
import { wahlkampfWoche, ertragFaktor } from '../src/engine/wahlkampf.js';
import { verhandeln, moeglichePartner, chance, mehrheit, mehrheitMoeglich, minderheitMoeglich, minderheitAntreten } from '../src/engine/koalition.js';
import { vorschlag as kabinettVorschlag, bestaetigen } from '../src/engine/kabinett.js';
import { haushaltBeschliessen, kuerzungsVorschlag, zugestaendnis, zugestaendnisSperre } from '../src/engine/haushalt.js';
import { monatBeenden, haushaltsMonat } from '../src/engine/regierung.js';
import { loesungStarten, loesungSperre, erfolgschance, problemListe, loesung } from '../src/engine/probleme.js';
import { ereignisEntscheiden } from '../src/engine/ereignisse.js';
import { ministerien } from '../src/data/ministerien.js';
import { bereiche, AUSRICHTUNGEN } from '../src/data/reformwege.js';
import { wegSperre, wegVorschau, wegBeschliessen, wegVektor } from '../src/engine/reformwege.js';
import { parteiPosition, abstand } from '../src/engine/profil.js';
import { einnahmearten } from '../src/data/einnahmen.js';
import { spielraum } from '../src/engine/einnahmen.js';
import { oppositionMonat } from '../src/engine/opposition.js';
// Seit Etappe 0b endet die Partie nicht: gemessen wird über FENSTER_JAHRE Kalenderjahre (in der Opposition geht es
// weiter); „Sieg“ heißt jetzt ZIEL_KANZLERJAHRE Kanzlerjahre innerhalb dieses Fensters (wie das frühere Spielziel).
const ZIEL_KANZLERJAHRE = 12;
const FENSTER_JAHRE = 20;
const zielErreicht = (z) => z.statistik.jahreKanzler >= ZIEL_KANZLERJAHRE;
const partieVorbei = (z) => zielErreicht(z) || z.jahr >= config.kalender.startJahr + FENSTER_JAHRE;


const PARTIEN = Number(process.env.PARTIEN) || 200; // kleiner für schnelle Läufe: PARTIEN=40 npm run balancing
const MAX_ZUEGE = 8000; // Schutz gegen Endlosschleifen
let festgefahren = 0; // Partien ohne gültigen Haushalt (siehe beschliessen)

// Partner nach Chance absteigend wählen, bis die Mehrheit reicht
function partnerWaehlen(z) {
  const noetig = mehrheit(z.sitze);
  let sitze = z.sitze[z.spielerParteiId];
  const partner = [];
  const kandidaten = moeglichePartner(z).sort((a, b) => chance(z.spielerParteiId, b, z.sitze) - chance(z.spielerParteiId, a, z.sitze) || z.sitze[b] - z.sitze[a]);
  for (const id of kandidaten) {
    if (sitze >= noetig) break;
    partner.push(id);
    sitze += z.sitze[id];
  }
  return partner;
}

const STRATEGIEN = {
  'Haushalt unverändert': () => ({}),
  // jedes Ministerium eines Partners jedes Jahr −5 %
  'Partner kürzen': (z) => ({
    stufen: Object.fromEntries(Object.entries(z.kabinett.verteilung).filter(([, id]) => id !== z.spielerParteiId).map(([m]) => [m, -5 / config.haushalt.ministerSchrittProzent])),
  }),
};

// Wahlkampf-Strategien (F08): zeigt, ob eine Dauerstrategie klar die beste ist
const staerksterGegner = (z) =>
  parteien.filter((p) => !p.sonstige && p.id !== z.spielerParteiId).sort((a, b) => z.anteile[b.id] - z.anteile[a.id])[0].id;
const wk = config.wahlkampf;
const AKTION_SCHNITT = { plakate: wk.plakateGewinn, kundgebung: (wk.kundgebungMin + wk.kundgebungMax) / 2, angriff: wk.angriffEigenGewinn };
const WAHLKAMPF = {
  'immer Plakate': () => ({ aktion: 'plakate' }),
  'immer Kundgebung': () => ({ aktion: 'kundgebung' }),
  'immer Angriff (Stärkster)': (z) => ({ aktion: 'angriff', ziel: staerksterGegner(z) }),
  abwechselnd: (z) => ({ aktion: ['plakate', 'kundgebung', 'angriff'][z.wahlkampfWoche % 3], ziel: staerksterGegner(z) }),
  // jede Woche die Aktion mit dem höchsten erwarteten eigenen Gewinn nach abnehmendem Ertrag
  klug: (z) => ({
    aktion: Object.keys(AKTION_SCHNITT).sort((a, b) => ertragFaktor(z, b) * AKTION_SCHNITT[b] - ertragFaktor(z, a) * AKTION_SCHNITT[a])[0],
    ziel: staerksterGegner(z),
  }),
};

// Regierungsbildung (F11): Minderheitsregierung nur, wenn keine Mehrheit mehr möglich ist, oder immer, wenn sie möglich ist
const KOALITION = {
  'Minderheit nur ohne Mehrheit': (z) => (mehrheitMoeglich(z) ? verhandeln(z, { partner: partnerWaehlen(z) }) : minderheitAntreten(z)),
  'Minderheit wenn möglich': (z) => (minderheitMoeglich(z) ? minderheitAntreten(z) : verhandeln(z, { partner: partnerWaehlen(z) })),
};

function partie(parteiId, seed, haushaltZug, wahlkampfZug = WAHLKAMPF['immer Plakate'], koalitionZug = KOALITION['Minderheit nur ohne Mehrheit']) {
  let z = neuesSpiel(parteiId, seed);
  let bruch = false;
  for (let zug = 0; zug < MAX_ZUEGE; zug++) {
    if (partieVorbei(z)) break;
    let r;
    if (z.phase === 'wahlkampf') r = wahlkampfWoche(z, wahlkampfZug(z));
    else if (z.phase === 'koalition') r = koalitionZug(z);
    else if (z.phase === 'kabinett') r = bestaetigen(z, { verteilung: kabinettVorschlag(z) });
    else if (z.phase === 'regierung' && z.offenesEreignis) r = ereignisEntscheiden(z, { wahl: 0 });
        else if (z.phase === 'regierung' && !haushaltsMonat(z)) r = monatBeenden(z);
        else if (z.phase === 'regierung') r = beschliessen(z, haushaltZug(z));
    else if (z.phase === 'opposition') r = oppositionMonat(z);
    else break;
    if (r.ereignisse.some((e) => e.startsWith('Koalitionsbruch'))) bruch = true;
    z = r.state;
  }
  return { z, bruch };
}

const prozent = (n) => `${Math.round((n / PARTIEN) * 100)} %`;
const spielbar = parteien.filter((p) => !p.sonstige);
const zeilen = [];
const abgleich = []; // F06: eingetragene Schwierigkeit gegen gemessene Siegquote
const stufe = (quote) => Object.entries(config.schwierigkeit).find(([, ab]) => quote >= ab)?.[0] ?? 'fast unmöglich';
for (const [name, zugFn] of Object.entries(STRATEGIEN)) {
  for (const p of spielbar) {
    let regiert = 0, brueche = 0, siege = 0, jahre = 0;
    for (let seed = 1; seed <= PARTIEN; seed++) {
      const { z, bruch } = partie(p.id, seed, zugFn);
      if (z.statistik.regierungenGebildet > 0) regiert++;
      if (bruch) brueche++;
      if (zielErreicht(z)) siege++;
      jahre += z.statistik.jahreKanzler;
    }
    zeilen.push(`| ${name} | ${p.name} | ${prozent(regiert)} | ${prozent(brueche)} | ${prozent(siege)} | ${(jahre / PARTIEN).toFixed(1)} |`);
  }
}

// Siege je Wahlkampf-Strategie (Haushalt unverändert); beste Strategie je Partei fett
const wahlkampfZeilen = spielbar.map((p) => {
  const quoten = Object.values(WAHLKAMPF).map((wz) => {
    let siege = 0;
    for (let seed = 1; seed <= PARTIEN; seed++) if (zielErreicht(partie(p.id, seed, STRATEGIEN['Haushalt unverändert'], wz).z)) siege++;
    return (siege / PARTIEN) * 100;
  });
  const beste = Math.max(...quoten);
  // F06: Schwierigkeit an der besten Wahlkampf-Strategie gemessen (freigegeben mit F08)
  const gemessen = stufe(beste / 100);
  const passt = gemessen === p.schwierigkeit;
  abgleich.push(`| ${p.name} | ${beste.toFixed(1)} % | ${gemessen} | ${p.schwierigkeit} | ${passt ? 'passt' : '**anpassen**'} |`);
  if (!passt) console.warn(`Schwierigkeit veraltet: ${p.name} eingetragen „${p.schwierigkeit}“, gemessen „${gemessen}“`);
  return `| ${p.name} | ${quoten.map((q) => (q === beste && q > 0 ? `**${q.toFixed(1)}**` : q.toFixed(1))).join(' | ')} |`;
});

// F11: Siege und Minderheitsregierungen je Koalitionsstrategie (Wahlkampf abwechselnd, Haushalt unverändert)
const minderheitZeilen = spielbar.flatMap((p) =>
  Object.entries(KOALITION).map(([name, kz]) => {
    let siege = 0, minderheiten = 0, neuwahlen = 0;
    for (let seed = 1; seed <= PARTIEN; seed++) {
      let z = neuesSpiel(p.id, seed), war = false;
      for (let zug = 0; zug < MAX_ZUEGE; zug++) {
        if (partieVorbei(z)) break;
        let r;
        if (z.phase === 'wahlkampf') r = wahlkampfWoche(z, WAHLKAMPF.abwechselnd(z));
        else if (z.phase === 'koalition') r = kz(z);
        else if (z.phase === 'kabinett') r = bestaetigen(z, { verteilung: kabinettVorschlag(z) });
        else if (z.phase === 'regierung' && z.offenesEreignis) r = ereignisEntscheiden(z, { wahl: 0 });
        else if (z.phase === 'regierung' && !haushaltsMonat(z)) r = monatBeenden(z);
        else if (z.phase === 'regierung') r = beschliessen(z, {});
        else if (z.phase === 'opposition') r = oppositionMonat(z);
        else break;
        if (r.state.koalition?.minderheit) war = true;
        if (r.ereignisse.some((e) => e.includes('gescheiterter Haushalt'))) neuwahlen++;
        z = r.state;
      }
      if (zielErreicht(z)) siege++;
      if (war) minderheiten++;
    }
    return `| ${p.name} | ${name} | ${prozent(minderheiten)} | ${neuwahlen} | ${prozent(siege)} |`;
  }),
);

// F13: Reformen. „mit Reformen“: je Quartal die erste Reform mit Mehrheit in der Vorschau.
// Haushalt wie geplant; reißt er die Schuldenbremse (System 2), so wenig wie nötig kürzen (Partner zuerst)
// Reicht auch die größte Kürzung nicht (lange Partien seit Etappe 0b), erhöht der Mess-Spieler alle Steuern des
// Bundeshaushalts so weit, wie es in diesem Jahr erlaubt ist, und kürzt dann. Geht auch das nicht, ist er festgefahren.
function beschliessen(z, p) {
  const k = kuerzungsVorschlag(z, p);
  if (k) return haushaltBeschliessen(z, k);
  const einnahmen = Object.fromEntries(einnahmearten.filter((a) => !a.keinBund && !a.sondervermoegen && a.aufkommenJeStufe > 0).map((a) => [a.id, spielraum(z, a.id).max]));
  const mitSteuern = kuerzungsVorschlag(z, { ...p, einnahmen }) ?? { ...p, einnahmen };
  try {
    return haushaltBeschliessen(z, mitSteuern);
  } catch {
    festgefahren++;
    return { state: { ...z, phase: 'festgefahren' }, ereignisse: [] };
  }
}

// System 3: Lösungsstrategien. Je Quartal so viele Lösungen wie Aufmerksamkeit und Kapital erlauben.
// „größtes Problem“: für das Problem mit dem höchsten Wert die Lösung mit der besten Erfolgschance.
// „billigste“: unter allen startbaren Lösungen die mit den niedrigsten laufenden Kosten.
const startbar = (z) => problemListe(z).flatMap((e) => e.problem.loesungen.filter((l) => !loesungSperre(z, l.id)).map((l) => ({ e, l })));
const LOESUNG = {
  'keine Lösungen': () => null,
  'größtes Problem zuerst': (z) => startbar(z).filter((x) => x.e.prominent).sort((a, b) => b.e.wert - a.e.wert || erfolgschance(z, b.l) - erfolgschance(z, a.l))[0]?.l,
  'billigste zuerst': (z) => startbar(z).sort((a, b) => a.l.kosten - b.l.kosten)[0]?.l,
};
const regierenMit = (wahl) => (z) => {
  if (haushaltsMonat(z)) return beschliessen(z, {});
  const l = wahl(z);
  return l ? loesungStarten(z, { loesungId: l.id }) : monatBeenden(z);
};
const loesungZeilen = spielbar.flatMap((p) =>
  Object.entries(LOESUNG).map(([name, wahl]) => {
    let siege = 0, erfolge = 0, wert = 0, krisen = 0, quote = 0, brueche = 0;
    for (let seed = 1; seed <= PARTIEN; seed++) {
      let z = neuesSpiel(p.id, seed), bruch = false;
      for (let zug = 0; zug < MAX_ZUEGE; zug++) {
        if (partieVorbei(z)) break;
        let r;
        if (z.phase === 'wahlkampf') r = wahlkampfWoche(z, WAHLKAMPF.abwechselnd(z));
        else if (z.phase === 'koalition') r = KOALITION['Minderheit nur ohne Mehrheit'](z);
        else if (z.phase === 'kabinett') r = bestaetigen(z, { verteilung: kabinettVorschlag(z) });
        else if (z.phase === 'regierung' && z.offenesEreignis) r = ereignisEntscheiden(z, { wahl: 0 });
        else if (z.phase === 'regierung') r = regierenMit(wahl)(z);
        else if (z.phase === 'opposition') r = oppositionMonat(z);
        else break;
        if (r.ereignisse.some((e) => e.startsWith('Koalitionsbruch'))) bruch = true;
        z = r.state;
      }
      if (zielErreicht(z)) siege++;
      if (bruch) brueche++;
      erfolge += Object.values(z.loesungen).filter((l) => l.status === 'erfolg').length;
      const liste = problemListe(z);
      wert += liste.reduce((s2, e) => s2 + e.wert, 0) / liste.length;
      krisen += liste.filter((e) => e.stufe.id === 'krise').length;
      quote += z.land.schuldenquote;
    }
    const n = (x, d = 1) => (x / PARTIEN).toFixed(d);
    return `| ${p.name} | ${name} | ${prozent(siege)} | ${prozent(brueche)} | ${n(erfolge)} | ${n(wert, 0)} | ${n(krisen)} | ${n(quote, 0)} % |`;
  }),
);

// System 1: Reformwege nach Ausrichtung. Je Quartal zuerst ein Weg der Ausrichtung, der laut Vorschau angenommen wird
// (Anschlussreformen vor Grundwegen), sonst eine Lösung für das größte Problem. „beliebig“: der Weg mit dem kleinsten Risiko.
const alleWege = bereiche.flatMap((b) => b.wege);
// Feature 6: ein Weg, der nur am Bundesrat scheitert, wird als Kompromiss beschlossen, wenn das möglich ist
const frei = (z, id) => !wegSperre(z, id) || !wegSperre(z, id, { kompromiss: true });
const wegWahl = (passt) => (z) => alleWege
  .filter((w) => passt(w) && !z.reformwege[w.id] && frei(z, w.id) && wegVorschau(z, w.id).abstimmung.angenommen && !wegVorschau(z, w.id).revision)
  .sort((a, b) => !!b.braucht - !!a.braucht || a.risiko - b.risiko)[0];
// Feature 7: wer Reformwege beschließt, setzt zuerst die offenen Vorhaben des Koalitionsvertrags um
const vertragZuerst = (wahl) => (z) => (z.koalition?.vertrag?.vorhaben ?? [])
  .filter((v) => v.status === 'offen' && !z.reformwege[v.wegId] && frei(z, v.wegId) && wegVorschau(z, v.wegId).abstimmung.angenommen && !wegVorschau(z, v.wegId).revision)
  .map((v) => alleWege.find((w) => w.id === v.wegId))[0] ?? wahl(z);
const REFORM_ROH = {
  'keine Reformwege': () => null,
  ...Object.fromEntries(Object.keys(AUSRICHTUNGEN).map((r) => [r, wegWahl((w) => w.richtung === r)])),
  // Wege nahe an der Position der Kanzlerpartei (Abstand bis 1), der nächste zuerst
  passend: (z) => alleWege
    .filter((w) => abstand(wegVektor(w), parteiPosition(z.kanzlerParteiId)) <= 1 && !z.reformwege[w.id] && frei(z, w.id) && wegVorschau(z, w.id).abstimmung.angenommen && !wegVorschau(z, w.id).revision)
    .sort((a, b) => abstand(wegVektor(a), parteiPosition(z.kanzlerParteiId)) - abstand(wegVektor(b), parteiPosition(z.kanzlerParteiId)))[0],
  beliebig: wegWahl(() => true),
};
const REFORM = Object.fromEntries(Object.entries(REFORM_ROH).map(([n, f]) => [n, n === 'keine Reformwege' ? f : vertragZuerst(f)]));
const REFORM_PARTEIEN = ['union', 'spd', 'gruene'];
// Block 2: „reagieren“ = auf ein Ultimatum mit einem Zugeständnis antworten, sobald möglich; fehlt nur Kapital, wird gespart
const drohend = (z) => z.koalition.partner.filter((p) => z.koalition.ultimatum?.[p] !== undefined && z.koalition.zugestaendnisse?.[p] !== z.haushalt.jahr);
function reformZeile(id, name, wahl, reagieren) {
    let siege = 0, wege = 0, gescheitert = 0, krisen = 0, quote = 0, brueche = 0;
    for (let seed = 1; seed <= PARTIEN; seed++) {
      let z = neuesSpiel(id, seed), bruch = false;
      for (let zug = 0; zug < MAX_ZUEGE; zug++) {
        if (partieVorbei(z)) break;
        let r;
        if (z.phase === 'wahlkampf') r = wahlkampfWoche(z, WAHLKAMPF.abwechselnd(z));
        else if (z.phase === 'koalition') r = KOALITION['Minderheit nur ohne Mehrheit'](z);
        else if (z.phase === 'kabinett') r = bestaetigen(z, { verteilung: kabinettVorschlag(z) });
        else if (z.phase === 'regierung' && z.offenesEreignis) r = ereignisEntscheiden(z, { wahl: 0 });
        else if (z.phase === 'regierung' && reagieren && drohend(z).length) {
          const frei = drohend(z).find((p) => !zugestaendnisSperre(z, p));
          if (frei) r = zugestaendnis(z, { partnerId: frei });
          else r = haushaltsMonat(z) ? beschliessen(z, {}) : monatBeenden(z);
        }
        else if (z.phase === 'regierung' && haushaltsMonat(z)) r = beschliessen(z, {});
        else if (z.phase === 'regierung') {
          const w = wahl(z);
          r = w ? wegBeschliessen(z, { wegId: w.id, kompromiss: Boolean(wegSperre(z, w.id)) }) : regierenMit(LOESUNG['größtes Problem zuerst'])(z);
          if (w && r.state === z) r = monatBeenden(z);
        } else if (z.phase === 'opposition') r = oppositionMonat(z);
        else break;
        if (r.ereignisse.some((e) => e.startsWith('Koalitionsbruch'))) bruch = true;
        z = r.state;
      }
      if (zielErreicht(z)) siege++;
      if (bruch) brueche++;
      wege += Object.values(z.reformwege).filter((w) => w.status === 'beschlossen').length;
      gescheitert += Object.values(z.reformwege).filter((w) => w.status === 'gescheitert').length;
      krisen += problemListe(z).filter((e) => e.stufe.id === 'krise').length;
      quote += z.land.schuldenquote;
    }
    const n = (x, d = 1) => (x / PARTIEN).toFixed(d);
    return `| ${parteien.find((p) => p.id === id).name} | ${name} | ${prozent(siege)} | ${prozent(brueche)} | ${n(wege)} | ${n(gescheitert)} | ${n(krisen)} | ${n(quote, 0)} % |`;
}
const reformZeilen = REFORM_PARTEIEN.flatMap((id) => Object.entries(REFORM).map(([name, wahl]) => reformZeile(id, name, wahl, false)));
const bruchZeilen = REFORM_PARTEIEN.flatMap((id) => Object.entries(REFORM).map(([name, wahl]) => reformZeile(id, name, wahl, true)));

// Alle Konstanten aus config.js, verschachtelte Werte mit Punkt-Namen
const flach = (obj, vor = '') =>
  Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? flach(v, `${vor}${k}.`) : [[`${vor}${k}`, v]]));
const HERKUNFT = { kalender: 'Etappe 0b', ki: 'Etappe 0b (TODO-BALANCE)', zeit: 'Etappe 0a', spielstufen: 'Etappe 0c', verbaendeSteuern: 'UI2 (2026-10-25)', wahlkampf: 'M5', koalition: 'M6', haushalt: 'M8 (Zahlen 2026: Quelle in config.js)', spielende: 'M10', schwierigkeit: 'F06', bundestag: 'F10 (Art. 42 GG)', minderheit: 'F11', regierung: 'F12', probleme: 'System 3', ereignisse: 'F14', ticker: 'F15', kapital: 'Erweiterung', wirtschaft: 'System 2', reformwege: 'System 1', koalitionsbruch: 'Block 2', umfrageBilanz: 'Paket Klein', landtagswahlen: 'Paket Mittel', verfassungsrisiko: 'Paket Klein', kompromiss: 'Paket Mittel', koalitionsvertrag: 'Paket Groß', krisenketten: 'Paket Groß' };
const konstanten = flach(config).map(([name, wert]) => `| \`${name}\` | ${JSON.stringify(wert)} | ${HERKUNFT[name.split('.')[0]] ?? 'M1/M3 (Quelle in config.js)'} |`);

const bericht = `# Balancing-Bericht

Erzeugt mit \`npm run balancing\` am ${new Date().toISOString().slice(0, 10)}. ${PARTIEN} Partien je Partei und Strategie (Seeds 1–${PARTIEN}).

## Strategien der Simulation
- Wahlkampf: jede Woche Plakate und Werbung (Hauptergebnisse); weitere Wahlkampf-Strategien siehe eigener Abschnitt.
- Koalition: Partner nach Zustimmungschance absteigend, bis die Mehrheit reicht; nach Absagen erneut.
- Kabinett: der vorausgefüllte Vorschlag.
- Haushalt: siehe Spalte „Strategie“. Keine Steueränderungen.
- Ereignisse (F14): immer die erste Möglichkeit.
- Gemessen über ${FENSTER_JAHRE} Kalenderjahre; „Sieg“ = ${ZIEL_KANZLERJAHRE} Kanzlerjahre in diesem Zeitraum (die Partie selbst endet nicht). In der Opposition regieren die anderen weiter.
- Festgefahren (auch mit allen Kürzungen und Steuererhöhungen kein Haushalt innerhalb der Schuldenbremse): ${festgefahren} Partien über alle Tabellen.

## Ergebnisse
| Strategie | Partei | Regierung gebildet | Koalitionsbruch | Sieg | Ø Jahre Kanzler |
|---|---|---|---|---|---|
${zeilen.join('\n')}

## Wahlkampf-Strategien (F08)
Siege in Prozent, Haushalt unverändert. „klug“: jede Woche die Aktion mit dem höchsten erwarteten eigenen Gewinn nach abnehmendem Ertrag. Fett: beste Strategie je Partei. Maßstab (freigegeben): keine „immer …“-Strategie ist bei einer Partei die beste.

| Partei | ${Object.keys(WAHLKAMPF).join(' | ')} |
|---|${Object.keys(WAHLKAMPF).map(() => '---').join('|')}|
${wahlkampfZeilen.join('\n')}

## Minderheitsregierung (F11)
Wahlkampf abwechselnd, Haushalt unverändert. „Minderheit“: Anteil der Partien mit mindestens einer Minderheitsregierung. „Gescheitert“: Zahl der Partien, die durch gescheiterte Haushalte einer Minderheitsregierung enden.

| Partei | Regierungsbildung | Minderheit | Gescheitert | Sieg |
|---|---|---|---|---|
${minderheitZeilen.join('\n')}

## Probleme und Lösungen (System 3)
Wahlkampf abwechselnd, Minderheit nur ohne Mehrheit, Haushalt mit Kürzungen nur wenn nötig. Je Quartal bis zu ${config.probleme.aktionenJeMonat} Lösungen nach Strategie (siehe Skript). Werte am Partieende: Problemwert im Mittel über alle Bereiche, Zahl der Krisen, Schuldenquote.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø erfolgreiche Lösungen | Ø Problemwert | Ø Krisen | Ø Schuldenquote |
|---|---|---|---|---|---|---|---|
${loesungZeilen.join('\n')}

## Reformwege nach Ausrichtung (System 1)
Wie bei den Lösungen; je Quartal zuerst ein Reformweg der Ausrichtung, der laut Vorschau eine Mehrheit hat, sonst eine Lösung für das größte Problem. „passend“: Wege mit Abstand bis 1 zur eigenen Parteiposition. Maßstab: keine Ausrichtung dominiert klar, „passend“ liegt 3–8 Punkte über „keine Reformwege“, die Schuldenquote läuft nicht davon.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø beschlossene Wege | Ø gescheitert | Ø Krisen | Ø Schuldenquote |
|---|---|---|---|---|---|---|---|
${reformZeilen.join('\n')}

## Koalitionsbruch mit Gegenmaßnahme (Block 2)
Wie der Abschnitt davor, aber der Spieler reagiert auf jedes Ultimatum mit einem Zugeständnis, sobald es geht (fehlt nur Kapital, wird gespart). Ziele (vor der Änderung festgelegt): klar koalitionsfeindlicher Kurs (SPD marktliberal, konservativ, beliebig) bleibt bei mindestens 25 % Bruch; moderater Kurs (SPD passend, grün, pragmatisch; CDU/CSU marktliberal, konservativ, passend) mindestens halbiert gegenüber dem Abschnitt davor.

| Partei | Strategie | Sieg | Koalitionsbruch | Ø beschlossene Wege | Ø gescheitert | Ø Krisen | Ø Schuldenquote |
|---|---|---|---|---|---|---|---|
${bruchZeilen.join('\n')}

## Schwierigkeitsanzeige (F06)
Gemessen an der besten Wahlkampf-Strategie je Partei (Haushalt unverändert), Grenzen aus \`config.schwierigkeit\`, eingetragen in \`src/data/parteien.js\`.

| Partei | Siege | gemessen | eingetragen | Abgleich |
|---|---|---|---|---|
${abgleich.join('\n')}

## Alle Konstanten (\`src/data/config.js\`)
| Name | Wert | Freigegeben in |
|---|---|---|
${konstanten.join('\n')}

Änderungen an diesen Werten nur nach Entscheidung des Nutzers.
`;
writeFileSync(new URL('../docs/BALANCING.md', import.meta.url), bericht);
console.log(bericht);
