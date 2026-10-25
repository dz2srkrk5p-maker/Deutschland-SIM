import { test, expect } from 'vitest';
import { importe, exporte, beschreibung, abschnitte, notizName, link } from '../scripts/obsidian-graph.js';

test('Obsidian-Graph: Importe relativ aufgelöst, Exporte und Beschreibung erkannt', () => {
  const code = `// Haushalt des Bundes\nimport { a } from './state.js';\nimport { b } from '../data/config.js';\nimport './stil.css';\nexport function x() {}\nexport const y = 1;`;
  expect(importe(code, 'src/engine/haushalt.js')).toEqual(['src/engine/state.js', 'src/data/config.js', 'src/engine/stil.css']);
  expect(importe("import { c } from '../src/engine/rng.js';", 'tests/rng.test.js')).toEqual(['src/engine/rng.js']);
  expect(exporte(code)).toEqual(['x', 'y']);
  expect(beschreibung(code)).toBe('Haushalt des Bundes');
});

test('Obsidian-Graph: Notiznamen ohne Endung, Abschnitte aus Markdown', () => {
  expect(notizName('src/engine/haushalt.js')).toBe('Code/engine/haushalt');
  expect(notizName('tests/wahl.test.js')).toBe('Code/tests/wahl.test');
  expect(link('src/ui/stil.css')).toBe('[[Code/ui/stil|ui/stil.css]]');
  expect(abschnitte('# SPEC\n## A (M1)\neins\n## B\nzwei')).toEqual([{ titel: 'A (M1)', text: 'eins' }, { titel: 'B', text: 'zwei' }]);
});
