// Balancing-Bericht: spielt viele Partien mit einfachen Strategien und schreibt docs/BALANCING.md.
// Start: npm run balancing
import { writeFileSync } from 'node:fs';
import { config } from '../src/data/config.js';
import { parteien } from '../src/data/parteien.js';
import { neuesSpiel } from '../src/engine/state.js';
import { wahlkampfWoche, ertragFaktor } from '../src/engine/wahlkampf.js';
import { verhandeln, moeglichePartner, chance, mehrheit, mehrheitMoeglich, minderheitMoeglich, minderheitAntreten } from '../src/engine/koalition.js';
import { vorschlag as kabinettVorschlag, bestaetigen } from '../src/engine/kabinett.js';
import { haushaltBeschliessen } from '../src/engine/haushalt.js';
import { quartalBeenden, haushaltsQuartal } from '../src/engine/regierung.js';

const PARTIEN = 200;
const MAX_ZUEGE = 8000; // Schutz gegen Endlosschleifen

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
    stufen: Object.fromEntries(Object.entries(z.kabinett.verteilung).filter(([, id]) => id !== z.spielerParteiId).map(([m]) => [m, -1])),
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
    let r;
    if (z.phase === 'wahlkampf') r = wahlkampfWoche(z, wahlkampfZug(z));
    else if (z.phase === 'koalition') r = koalitionZug(z);
    else if (z.phase === 'kabinett') r = bestaetigen(z, { verteilung: kabinettVorschlag(z) });
    else if (z.phase === 'regierung' && !haushaltsQuartal(z)) r = quartalBeenden(z);
        else if (z.phase === 'regierung') r = haushaltBeschliessen(z, haushaltZug(z));
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
      if (z.phase === 'sieg') siege++;
      jahre += z.statistik.jahreKanzler;
    }
    zeilen.push(`| ${name} | ${p.name} | ${prozent(regiert)} | ${prozent(brueche)} | ${prozent(siege)} | ${(jahre / PARTIEN).toFixed(1)} |`);
  }
}

// Siege je Wahlkampf-Strategie (Haushalt unverändert); beste Strategie je Partei fett
const wahlkampfZeilen = spielbar.map((p) => {
  const quoten = Object.values(WAHLKAMPF).map((wz) => {
    let siege = 0;
    for (let seed = 1; seed <= PARTIEN; seed++) if (partie(p.id, seed, STRATEGIEN['Haushalt unverändert'], wz).z.phase === 'sieg') siege++;
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
        let r;
        if (z.phase === 'wahlkampf') r = wahlkampfWoche(z, WAHLKAMPF.abwechselnd(z));
        else if (z.phase === 'koalition') r = kz(z);
        else if (z.phase === 'kabinett') r = bestaetigen(z, { verteilung: kabinettVorschlag(z) });
        else if (z.phase === 'regierung' && !haushaltsQuartal(z)) r = quartalBeenden(z);
        else if (z.phase === 'regierung') r = haushaltBeschliessen(z, {});
        else break;
        if (r.state.koalition?.minderheit) war = true;
        if (r.ereignisse.some((e) => e.includes('gescheiterter Haushalt'))) neuwahlen++;
        z = r.state;
      }
      if (z.phase === 'sieg') siege++;
      if (war) minderheiten++;
    }
    return `| ${p.name} | ${name} | ${prozent(minderheiten)} | ${neuwahlen} | ${prozent(siege)} |`;
  }),
);

// Alle Konstanten aus config.js, verschachtelte Werte mit Punkt-Namen
const flach = (obj, vor = '') =>
  Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? flach(v, `${vor}${k}.`) : [[`${vor}${k}`, v]]));
const HERKUNFT = { wahlkampf: 'M5', koalition: 'M6', haushalt: 'M8 (Zahlen 2026: Quelle in config.js)', spielende: 'M10', schwierigkeit: 'F06', bundestag: 'F10 (Art. 42 GG)', minderheit: 'F11', regierung: 'F12' };
const konstanten = flach(config).map(([name, wert]) => `| \`${name}\` | ${JSON.stringify(wert)} | ${HERKUNFT[name.split('.')[0]] ?? 'M1/M3 (Quelle in config.js)'} |`);

const bericht = `# Balancing-Bericht

Erzeugt mit \`npm run balancing\` am ${new Date().toISOString().slice(0, 10)}. ${PARTIEN} Partien je Partei und Strategie (Seeds 1–${PARTIEN}).

## Strategien der Simulation
- Wahlkampf: jede Woche Plakate und Werbung (Hauptergebnisse); weitere Wahlkampf-Strategien siehe eigener Abschnitt.
- Koalition: Partner nach Zustimmungschance absteigend, bis die Mehrheit reicht; nach Absagen erneut.
- Kabinett: der vorausgefüllte Vorschlag.
- Haushalt: siehe Spalte „Strategie“. Keine Steueränderungen.
- Spiel endet bei Sieg, Opposition oder nach ${MAX_ZUEGE} Zügen.

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
