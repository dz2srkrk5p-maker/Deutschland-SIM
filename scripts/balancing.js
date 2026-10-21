// Balancing-Bericht: spielt viele Partien mit einfachen Strategien und schreibt docs/BALANCING.md.
// Start: npm run balancing
import { writeFileSync } from 'node:fs';
import { config } from '../src/data/config.js';
import { parteien } from '../src/data/parteien.js';
import { neuesSpiel } from '../src/engine/state.js';
import { wahlkampfWoche } from '../src/engine/wahlkampf.js';
import { verhandeln, moeglichePartner, chance, mehrheit } from '../src/engine/koalition.js';
import { vorschlag as kabinettVorschlag, bestaetigen } from '../src/engine/kabinett.js';
import { haushaltBeschliessen } from '../src/engine/haushalt.js';

const PARTIEN = 200;
const MAX_ZUEGE = 2000; // Schutz gegen Endlosschleifen

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

function partie(parteiId, seed, haushaltZug) {
  let z = neuesSpiel(parteiId, seed);
  let bruch = false;
  for (let zug = 0; zug < MAX_ZUEGE; zug++) {
    let r;
    if (z.phase === 'wahlkampf') r = wahlkampfWoche(z, { aktion: 'plakate' });
    else if (z.phase === 'koalition') r = verhandeln(z, { partner: partnerWaehlen(z) });
    else if (z.phase === 'kabinett') r = bestaetigen(z, { verteilung: kabinettVorschlag(z) });
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
    if (name === 'Haushalt unverändert') {
      const gemessen = stufe(siege / PARTIEN);
      const passt = gemessen === p.schwierigkeit;
      abgleich.push(`| ${p.name} | ${((siege / PARTIEN) * 100).toFixed(1)} % | ${gemessen} | ${p.schwierigkeit} | ${passt ? 'passt' : '**anpassen**'} |`);
      if (!passt) console.warn(`Schwierigkeit veraltet: ${p.name} eingetragen „${p.schwierigkeit}“, gemessen „${gemessen}“`);
    }
    zeilen.push(`| ${name} | ${p.name} | ${prozent(regiert)} | ${prozent(brueche)} | ${prozent(siege)} | ${(jahre / PARTIEN).toFixed(1)} |`);
  }
}

// Alle Konstanten aus config.js, verschachtelte Werte mit Punkt-Namen
const flach = (obj, vor = '') =>
  Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? flach(v, `${vor}${k}.`) : [[`${vor}${k}`, v]]));
const HERKUNFT = { wahlkampf: 'M5', koalition: 'M6', haushalt: 'M8 (Zahlen 2026: Quelle in config.js)', spielende: 'M10', schwierigkeit: 'F06' };
const konstanten = flach(config).map(([name, wert]) => `| \`${name}\` | ${JSON.stringify(wert)} | ${HERKUNFT[name.split('.')[0]] ?? 'M1/M3 (Quelle in config.js)'} |`);

const bericht = `# Balancing-Bericht

Erzeugt mit \`npm run balancing\` am ${new Date().toISOString().slice(0, 10)}. ${PARTIEN} Partien je Partei und Strategie (Seeds 1–${PARTIEN}).

## Strategien der Simulation
- Wahlkampf: jede Woche Plakate und Werbung.
- Koalition: Partner nach Zustimmungschance absteigend, bis die Mehrheit reicht; nach Absagen erneut.
- Kabinett: der vorausgefüllte Vorschlag.
- Haushalt: siehe Spalte „Strategie“. Keine Steueränderungen.
- Spiel endet bei Sieg, Opposition oder nach ${MAX_ZUEGE} Zügen.

## Ergebnisse
| Strategie | Partei | Regierung gebildet | Koalitionsbruch | Sieg | Ø Jahre Kanzler |
|---|---|---|---|---|---|
${zeilen.join('\n')}

## Schwierigkeitsanzeige (F06)
Gemessen mit „Haushalt unverändert“, Grenzen aus \`config.schwierigkeit\`, eingetragen in \`src/data/parteien.js\`.

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
