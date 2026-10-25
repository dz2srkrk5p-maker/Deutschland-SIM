// QA Feature 8: Todesspiralen-Test der Krisenketten mit 5 Extremstrategien (alle ohne Lösungen), CDU/CSU, Seeds 1–N,
// jeweils mit Krisenketten (config) und ohne (faktor 0). Aufruf: node qa/ketten.mjs <name> [partien]
import { writeFileSync } from 'node:fs';

const R = new URL('../src/', import.meta.url).href;
const { config } = await import(R + 'data/config.js');
const { parteien } = await import(R + 'data/parteien.js');
const { ministerien } = await import(R + 'data/ministerien.js');
const { bereiche } = await import(R + 'data/reformwege.js');
const { neuesSpiel } = await import(R + 'engine/state.js');
const { wahlkampfWoche } = await import(R + 'engine/wahlkampf.js');
const { verhandeln, moeglichePartner, chance, mehrheit, mehrheitMoeglich, minderheitAntreten } = await import(R + 'engine/koalition.js');
const { vorschlag, bestaetigen } = await import(R + 'engine/kabinett.js');
const H = await import(R + 'engine/haushalt.js');
const { quartalBeenden, haushaltsQuartal } = await import(R + 'engine/regierung.js');
const { ereignisEntscheiden } = await import(R + 'engine/ereignisse.js');
const { wegSperre, wegVorschau, wegBeschliessen } = await import(R + 'engine/reformwege.js');
const { problemListe } = await import(R + 'engine/probleme.js');

const N = Number(process.argv[3] ?? 50);
const MAXS = config.haushalt.ministerMaxProzent / config.haushalt.ministerSchrittProzent;
const partnerWaehlen = (z) => {
  const noetig = mehrheit(z.sitze); let s = z.sitze[z.spielerParteiId]; const p = [];
  for (const k of moeglichePartner(z).sort((a, b) => chance(z.spielerParteiId, b, z.sitze) - chance(z.spielerParteiId, a, z.sitze))) { if (s >= noetig) break; p.push(k); s += z.sitze[k]; }
  return p;
};
const wk = (z) => ({ aktion: ['plakate', 'kundgebung', 'angriff'][z.wahlkampfWoche % 3], ziel: 'afd' });
const nationale = bereiche.flatMap((b) => b.wege).filter((w) => w.richtung === 'national' || w.richtung === 'konservativ');
const STRATEGIEN = {
  'nichts tun': { haushalt: () => ({}) },
  'alle Etats maximal kürzen': { haushalt: () => ({ stufen: Object.fromEntries(ministerien.map((m) => [m.id, -MAXS])) }) },
  'Energiesteuern maximal erhöhen': { haushalt: (z) => ({ einnahmen: { energie: Math.min(2, Math.max(0, 4 - (z.haushalt.einnahmen.stufen.energie ?? 0))) } }) },
  'Verteidigung maximal': { haushalt: () => ({ stufen: { verteidigung: MAXS } }) },
  'nur national-konservative Reformwege': { haushalt: () => ({}), reform: (z) => nationale.find((w) => !z.reformwege[w.id] && !wegSperre(z, w.id) && wegVorschau(z, w.id).abstimmung.angenommen && !wegVorschau(z, w.id).revision) },
};

function partie(seed, s) {
  let z = neuesSpiel('union', seed);
  let maxKrisen = 0, glieder = 0, maxAktiv = 0, maxWert = 0;
  for (let i = 0; i < 8000; i++) {
    let r;
    if (z.phase === 'wahlkampf') r = wahlkampfWoche(z, wk(z));
    else if (z.phase === 'koalition') r = mehrheitMoeglich(z) ? verhandeln(z, { partner: partnerWaehlen(z) }) : minderheitAntreten(z);
    else if (z.phase === 'kabinett') r = bestaetigen(z, { verteilung: vorschlag(z) });
    else if (z.phase === 'regierung' && z.offenesEreignis) r = ereignisEntscheiden(z, { wahl: 0 });
    else if (z.phase === 'regierung' && haushaltsQuartal(z)) {
      const e = s.haushalt(z);
      try { r = H.haushaltBeschliessen(z, e); } catch { r = H.haushaltBeschliessen(z, H.kuerzungsVorschlag(z, e) ?? H.kuerzungsVorschlag(z, {}) ?? {}); }
    } else if (z.phase === 'regierung') {
      const w = s.reform?.(z);
      r = w ? wegBeschliessen(z, { wegId: w.id }) : quartalBeenden(z);
    } else break;
    glieder += r.ereignisse.filter((e) => e.startsWith('Krisenkette wirkt')).length;
    z = r.state;
    if (z.probleme) {
      const liste = problemListe(z);
      maxKrisen = Math.max(maxKrisen, liste.filter((e) => e.stufe.id === 'krise').length);
      maxWert = Math.max(maxWert, ...liste.map((e) => e.wert));
    }
    maxAktiv = Math.max(maxAktiv, z.ketten?.aktiv.length ?? 0);
  }
  const liste = problemListe(z);
  const nan = liste.some((e) => !Number.isFinite(e.wert)) || Object.values(z.anteile).some((a) => !Number.isFinite(a));
  return { sieg: z.phase === 'sieg', krisenEnde: liste.filter((e) => e.stufe.id === 'krise').length, maxKrisen, glieder, maxAktiv, maxWert, nan };
}

const faktor = config.krisenketten.faktor;
const ergebnis = {};
for (const [name, s] of Object.entries(STRATEGIEN)) {
  for (const [variante, f] of [['mit Ketten', faktor], ['ohne Ketten', 0]]) {
    config.krisenketten.faktor = f;
    const p = Array.from({ length: N }, (_, i) => partie(i + 1, s));
    const mittel = (k) => +(p.reduce((a, x) => a + x[k], 0) / N).toFixed(2);
    ergebnis[`${name} / ${variante}`] = {
      sieg: Math.round((p.filter((x) => x.sieg).length / N) * 100), krisenEnde: mittel('krisenEnde'), maxKrisenMittel: mittel('maxKrisen'),
      anteilAb8Krisen: Math.round((p.filter((x) => x.maxKrisen >= 8).length / N) * 100), glieder: mittel('glieder'),
      maxAktiv: Math.max(...p.map((x) => x.maxAktiv)), maxWert: Math.max(...p.map((x) => x.maxWert)), nan: p.some((x) => x.nan),
    };
    console.log(`${name} / ${variante}: ${JSON.stringify(ergebnis[`${name} / ${variante}`])}`);
  }
}
config.krisenketten.faktor = faktor;
writeFileSync(new URL(`./${process.argv[2] ?? 'ketten'}-ketten.json`, import.meta.url), JSON.stringify(ergebnis, null, 1));
