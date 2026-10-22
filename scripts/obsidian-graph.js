// Projekt als Obsidian-Graph: schreibt je Code-Datei, Spielregel (SPEC.md) und Meilenstein/Feature (PLAN.md) eine Notiz
// mit Links in einen eigenen Vault. Start: npm run graph [-- Zielordner]
// Nur die erzeugten Ordner (Code, Regeln, Meilensteine) werden neu geschrieben; eigene Notizen im Vault bleiben.
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve, extname, posix } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PROJEKT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const STANDARD_ZIEL = resolve(PROJEKT, '../../Obsidian Vault/Deutschland-Simulator');
const ERZEUGT = ['Code', 'Regeln', 'Meilensteine'];
const QUELLEN = ['src', 'scripts', 'tests'];

// Projektpfad (z. B. src/engine/haushalt.js) → Notizname im Vault (Code/engine/haushalt), Link mit lesbarem Text
export const notizName = (pfad) => `Code/${pfad.replace(/^src\//, '').replace(/\.(js|css)$/, '')}`;
export const link = (pfad) => `[[${notizName(pfad)}|${pfad.replace(/^src\//, '')}]]`;

// Relative Importe einer Datei, aufgelöst zu Projektpfaden
export function importe(code, pfad) {
  const treffer = [...code.matchAll(/(?:import|export)\s[^'"]*?from\s+['"](\.{1,2}\/[^'"]+)['"]|import\s+['"](\.{1,2}\/[^'"]+)['"]/g)];
  return [...new Set(treffer.map((t) => posix.join(posix.dirname(pfad), t[1] ?? t[2])))];
}

export const exporte = (code) => [...code.matchAll(/export\s+(?:async\s+)?(?:function|const|let)\s+(\w+)/g)].map((t) => t[1]);

// Erster Kommentar der Datei als Beschreibung
export const beschreibung = (code) => code.match(/^(?:\s*(?:\/\/|\/\*)\s?)(.+)$/m)?.[1].replace(/\*\/\s*$/, '').trim() ?? '';

// Abschnitte „## Titel“ einer Markdown-Datei
export const abschnitte = (text) =>
  text.split(/^## /m).slice(1).map((teil) => {
    const [kopf, ...rest] = teil.split('\n');
    return { titel: kopf.trim(), text: rest.join('\n').trim() };
  });

// Pfade wie `src/engine/haushalt.js` in einem Text, nur existierende
const erwaehnt = (text, vorhanden) => [...new Set([...text.matchAll(/(?:src|scripts|tests)\/[\w./-]+\.(?:js|css)/g)].map((t) => t[0]))].filter((p) => vorhanden.has(p));
// Meilensteine wie M3, F10 in einem Text
const meilensteine = (text) => [...new Set([...text.matchAll(/\b([MF]\d{1,2})\b/g)].map((t) => t[1].replace(/^F(\d)$/, 'F0$1')))];

const dateiname = (titel) => titel.replace(/[\\/:*?"<>|#^[\]`]/g, '').replace(/\s+/g, ' ').trim();
const schicht = (pfad) => (pfad.startsWith('tests/') ? 'test' : pfad.startsWith('scripts/') ? 'skript' : pfad.split('/')[1]);

function alleDateien(ordner) {
  return readdirSync(join(PROJEKT, ordner), { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile() && ['.js', '.css'].includes(extname(d.name)))
    .map((d) => relative(PROJEKT, join(d.parentPath, d.name)).split('\\').join('/'));
}

function schreiben(ziel, name, inhalt) {
  const datei = join(ziel, `${name}.md`);
  mkdirSync(dirname(datei), { recursive: true });
  writeFileSync(datei, inhalt);
}

export function erzeugen(ziel) {
  for (const o of ERZEUGT) rmSync(join(ziel, o), { recursive: true, force: true });
  const dateien = QUELLEN.flatMap(alleDateien);
  const vorhanden = new Set(dateien);
  const plan = readFileSync(join(PROJEKT, 'docs/PLAN.md'), 'utf8');
  const spec = readFileSync(join(PROJEKT, 'docs/SPEC.md'), 'utf8');

  // Meilensteine und Features aus den PLAN-Tabellen, mit Auftrag (docs/auftraege) falls vorhanden
  const auftraege = readdirSync(join(PROJEKT, 'docs/auftraege'));
  const zeilen = [...plan.matchAll(/^\|\s*([MF]\d+|UI)\s*\|\s*([^|]+?)\s*\|(.*)\|\s*$/gm)];
  const mNamen = {};
  for (const [, nr, titel, rest] of zeilen) {
    // ohne Klammerzusatz, gekürzt; trim, weil Windows Leerzeichen am Ende von Dateinamen entfernt
    const name = `Meilensteine/${nr} ${dateiname(titel.replace(/\s*\(.*$/, '')).slice(0, 60).trim()}`;
    mNamen[nr] = name;
    const auftrag = auftraege.find((a) => a.startsWith(`${nr}-`));
    const auftragText = auftrag ? readFileSync(join(PROJEKT, 'docs/auftraege', auftrag), 'utf8') : '';
    const code = erwaehnt(auftragText, vorhanden);
    schreiben(ziel, name, `---\ntags: [meilenstein]\nnr: ${nr}\nstand: "${rest.split('|').at(-1).trim()}"\n---\n# ${nr}: ${titel}\n\n` +
      `Stand: ${rest.split('|').at(-1).trim()}\n\n${code.length ? `## Code\n${code.map((p) => `- ${link(p)}`).join('\n')}\n\n` : ''}` +
      `${auftragText ? `## Auftrag\n${auftragText.replace(/^# .*\n/, '').replace(/^#/gm, '##')}\n` : ''}`);
  }

  // Spielregeln aus SPEC.md: je Abschnitt eine Notiz, verlinkt mit Code und Meilenstein
  for (const { titel, text } of abschnitte(spec)) {
    const kurz = dateiname(titel.replace(/\s*\(.*\)\s*$/, '').replace(/^System:\s*/, ''));
    const code = erwaehnt(text, vorhanden);
    const ms = meilensteine(titel).filter((m) => mNamen[m]);
    schreiben(ziel, `Regeln/${kurz}`, `---\ntags: [regel]\n---\n# ${titel}\n\n` +
      `${ms.length ? `Meilenstein: ${ms.map((m) => `[[${mNamen[m]}|${m}]]`).join(', ')}\n\n` : ''}` +
      `${code.length ? `Code: ${code.map(link).join(', ')}\n\n` : ''}${text}\n`);
  }

  // Code: je Datei eine Notiz mit Schicht, Beschreibung, Exporten und Importen
  for (const pfad of dateien) {
    const code = readFileSync(join(PROJEKT, pfad), 'utf8');
    const imp = importe(code, pfad).filter((p) => vorhanden.has(p));
    const exp = exporte(code);
    schreiben(ziel, notizName(pfad), `---\ntags: [code, ${schicht(pfad)}]\ndatei: ${pfad}\nzeilen: ${code.split('\n').length}\n---\n# ${pfad}\n\n` +
      `${beschreibung(code)}\n\n${exp.length ? `## Exporte\n${exp.map((e) => `- \`${e}\``).join('\n')}\n\n` : ''}` +
      `${imp.length ? `## Importiert\n${imp.map((p) => `- ${link(p)}`).join('\n')}\n` : ''}`);
  }

  // Startnotiz und Graph-Farben je Schicht
  schreiben(ziel, 'Deutschland-Simulator', `# Deutschland-Simulator\n\nErzeugt mit \`npm run graph\` am ${new Date().toISOString().slice(0, 10)} aus \`${PROJEKT}\`.\n\n` +
    `- Regeln: ${abschnitte(spec).length} Abschnitte aus docs/SPEC.md (Ordner Regeln)\n- Meilensteine: ${zeilen.length} aus docs/PLAN.md\n- Code: ${dateien.length} Dateien\n\n` +
    `Die Ordner ${ERZEUGT.join(', ')} werden bei jedem Lauf neu geschrieben. Eigene Notizen außerhalb davon bleiben erhalten.\n\n` +
    `## Einstieg\n- ${link('src/ui/app.js')}\n- ${link('src/engine/state.js')}\n${Object.values(mNamen).map((n) => `- [[${n}]]`).join('\n')}\n`);
  mkdirSync(join(ziel, '.obsidian'), { recursive: true });
  const graph = join(ziel, '.obsidian/graph.json');
  const farben = { 'path:Code/engine': 0xd9534f, 'path:Code/ui': 0x3a7bd5, 'path:Code/data': 0x2e9e5b, 'path:Code/storage': 0x8e5cc4,
    'path:Code/tests': 0x9aa0a6, 'path:Code/scripts': 0xe0a030, 'path:Regeln': 0x16a2b8, 'path:Meilensteine': 0xc2185b };
  const alt = existsSync(graph) ? JSON.parse(readFileSync(graph, 'utf8')) : {};
  writeFileSync(graph, JSON.stringify({ ...alt, colorGroups: Object.entries(farben).map(([query, rgb]) => ({ query, color: { a: 1, rgb } })) }, null, 2));
  return { dateien: dateien.length, regeln: abschnitte(spec).length, meilensteine: zeilen.length };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ziel = resolve(process.argv[2] ?? STANDARD_ZIEL);
  const n = erzeugen(ziel);
  console.log(`Obsidian-Graph in ${ziel}: ${n.dateien} Code-Dateien, ${n.regeln} Regeln, ${n.meilensteine} Meilensteine`);
}
