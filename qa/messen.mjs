// QA-Messung: führt die bestehende Simulation aus (scripts/balancing.js, 200 Partien je Partei und Strategie,
// Seeds 1–200) und speichert alle Ergebnistabellen aus docs/BALANCING.md als Rohzahlen in qa/<name>.json.
// Aufruf: node qa/messen.mjs baseline
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const name = process.argv[2] ?? 'messung';
const start = Date.now();
execFileSync(process.execPath, [fileURLToPath(new URL('../scripts/balancing.js', import.meta.url))], { stdio: ['ignore', 'ignore', 'inherit'] });
const md = readFileSync(new URL('../docs/BALANCING.md', import.meta.url), 'utf8');

// Abschnitte mit Tabellen: Überschrift → Liste von Zeilen-Objekten (Spaltenname → Wert)
const zahl = (t) => {
  const m = t.replace(/\*\*/g, '').match(/^(-?[\d.]+)\s*%?$/);
  return m ? Number(m[1]) : t;
};
const abschnitte = {};
for (const teil of md.split(/^## /m).slice(1)) {
  const titel = teil.split('\n')[0].trim();
  if (titel.startsWith('Alle Konstanten')) continue;
  const zeilen = teil.split('\n').filter((l) => l.startsWith('|'));
  if (zeilen.length < 3) continue;
  const kopf = zeilen[0].split('|').slice(1, -1).map((s) => s.trim());
  abschnitte[titel] = zeilen.slice(2).map((l) => Object.fromEntries(l.split('|').slice(1, -1).map((s, i) => [kopf[i], zahl(s.trim())])));
}
const nan = (md.match(/NaN|undefined|Infinity/g) ?? []).length;
const ergebnis = { erzeugt: new Date().toISOString(), partienJeStrategie: 200, seeds: '1–200', dauerSekunden: Math.round((Date.now() - start) / 1000), nanFunde: nan, abschnitte };
writeFileSync(new URL(`./${name}.json`, import.meta.url), JSON.stringify(ergebnis, null, 1));
console.log(`${name}: ${Object.keys(abschnitte).length} Abschnitte, ${Object.values(abschnitte).reduce((s, a) => s + a.length, 0)} Zeilen, NaN-Funde ${nan}, ${ergebnis.dauerSekunden} s`);
