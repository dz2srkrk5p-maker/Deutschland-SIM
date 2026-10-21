import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from 'vitest';

// Harte Regel: Die Engine kennt weder UI noch DOM noch Math.random.
const engineDir = join(import.meta.dirname, '..', 'src', 'engine');
const verboten = [/from\s+['"][^'"]*\/ui\//, /\bdocument\./, /\bwindow\./, /\bMath\.random\b/];

test('src/engine importiert keine UI, nutzt kein DOM und kein Math.random', () => {
  const dateien = existsSync(engineDir)
    ? readdirSync(engineDir, { recursive: true }).filter((f) => f.endsWith('.js'))
    : [];
  const verstoesse = dateien.flatMap((f) => {
    const code = readFileSync(join(engineDir, f), 'utf8');
    return verboten.filter((re) => re.test(code)).map((re) => `${f}: ${re}`);
  });
  expect(verstoesse).toEqual([]);
});
