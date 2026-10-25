// Vergleich einer Messung mit der Baseline: Rohzahlen vorher/nachher je Abschnitt und Zeile, nur geänderte Zeilen.
// Prüft die Abnahmegrenze: keine Siegquote über 75 % oder unter 5 %, die vorher innerhalb lag.
// Aufruf: node qa/vergleich.mjs f2-zins [baseline]
import { readFileSync } from 'node:fs';

const lese = (n) => JSON.parse(readFileSync(new URL(`./${n}.json`, import.meta.url), 'utf8'));
const neu = lese(process.argv[2]);
const alt = lese(process.argv[3] ?? 'baseline');
const schluessel = (z) => Object.entries(z).filter(([, v]) => typeof v === 'string').map(([, v]) => v).join(' / ');
let geaendert = 0;
const verletzt = [];
for (const [titel, zeilen] of Object.entries(alt.abschnitte)) {
  const nz = neu.abschnitte[titel] ?? [];
  const ausgabe = [];
  zeilen.forEach((z, i) => {
    const n = nz[i];
    if (!n) return ausgabe.push(`  FEHLT: ${schluessel(z)}`);
    const diff = Object.keys(z).filter((k) => typeof z[k] === 'number' && z[k] !== n[k]);
    if (!diff.length) return;
    geaendert++;
    ausgabe.push(`  ${schluessel(z)}: ${diff.map((k) => `${k} ${z[k]} → ${n[k]}`).join(', ')}`);
    if ('Sieg' in z && typeof n.Sieg === 'number' && z.Sieg >= 5 && z.Sieg <= 75 && (n.Sieg > 75 || n.Sieg < 5)) verletzt.push(`${titel}: ${schluessel(z)} Sieg ${z.Sieg} → ${n.Sieg}`);
  });
  if (ausgabe.length) console.log(`## ${titel}\n${ausgabe.join('\n')}`);
}
console.log(`\nGeänderte Zeilen: ${geaendert}; NaN-Funde: ${alt.nanFunde} → ${neu.nanFunde}`);
console.log(verletzt.length ? `ABNAHMEGRENZE VERLETZT:\n${verletzt.join('\n')}` : 'Abnahmegrenze (5–75 %) eingehalten.');
