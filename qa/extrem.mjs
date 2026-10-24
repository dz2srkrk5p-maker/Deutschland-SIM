// QA: Schuldenquote unter extremen Haushaltsstrategien, CDU/CSU, 50 Partien je Strategie. Aufruf: node qa/extrem.mjs <name>
const R = new URL('../src/', import.meta.url).href;
const { config } = await import(R + 'data/config.js');
const { parteien } = await import(R + 'data/parteien.js');
const { ministerien } = await import(R + 'data/ministerien.js');
const { einnahmearten } = await import(R + 'data/einnahmen.js');
const { neuesSpiel } = await import(R + 'engine/state.js');
const { wahlkampfWoche } = await import(R + 'engine/wahlkampf.js');
const { verhandeln, moeglichePartner, chance, mehrheit, mehrheitMoeglich, minderheitAntreten } = await import(R + 'engine/koalition.js');
const { vorschlag, bestaetigen } = await import(R + 'engine/kabinett.js');
const H = await import(R + 'engine/haushalt.js');
const { quartalBeenden, haushaltsQuartal } = await import(R + 'engine/regierung.js');
const { ereignisEntscheiden } = await import(R + 'engine/ereignisse.js');
const hh = config.haushalt;
const MAXS = hh.ministerMaxProzent / hh.ministerSchrittProzent;
function partnerWaehlen(z) {
  const noetig = mehrheit(z.sitze); let s = z.sitze[z.spielerParteiId]; const p = [];
  for (const k of moeglichePartner(z).sort((a, b) => chance(z.spielerParteiId, b, z.sitze) - chance(z.spielerParteiId, a, z.sitze))) { if (s >= noetig) break; p.push(k); s += z.sitze[k]; }
  return p;
}
const wk = (z) => ({ aktion: ['plakate', 'kundgebung', 'angriff'][z.wahlkampfWoche % 3], ziel: 'afd' });
// Einnahmen so weit senken, wie Grenzen erlauben (null Steuern ist im Spiel nicht einstellbar: min je Parameter)
const steuernRunter = (z) => Object.fromEntries(einnahmearten.filter((a) => !a.parameter.einmalig).map((a) => {
  const p = a.parameter; const st = z.haushalt.einnahmen.stufen[a.id] ?? 0;
  const minStufe = Math.ceil((p.min - p.startwert) / p.schritt - 1e-9);
  return [a.id, Math.max(-p.maxJeJahr, minStufe - st)];
}).filter(([, d]) => d < 0));
const S = {
  'unverändert': () => ({}),
  'alles maximal, Steuern minimal': (z) => ({ stufen: Object.fromEntries(ministerien.map((m) => [m.id, MAXS])), einnahmen: steuernRunter(z) }),
  'Verteidigung maximal (ausgenommen)': () => ({ stufen: { verteidigung: MAXS } }),
};
const ergebnis = {};
for (const [name, f] of Object.entries(S)) {
  let abgelehnt = 0, versuche = 0, quoteEnde = 0, quoteMax = 0, n = 0, endeJahr = [];
  const N = 50;
  for (let seed = 1; seed <= N; seed++) {
    let z = neuesSpiel('union', seed); let maxq = 0; const pfad = [];
    for (let i = 0; i < 8000; i++) {
      let r;
      if (z.phase === 'wahlkampf') r = wahlkampfWoche(z, wk(z));
      else if (z.phase === 'koalition') r = mehrheitMoeglich(z) ? verhandeln(z, { partner: partnerWaehlen(z) }) : minderheitAntreten(z);
      else if (z.phase === 'kabinett') r = bestaetigen(z, { verteilung: vorschlag(z) });
      else if (z.phase === 'regierung' && z.offenesEreignis) r = ereignisEntscheiden(z, { wahl: 0 });
      else if (z.phase === 'regierung' && !haushaltsQuartal(z)) r = quartalBeenden(z);
      else if (z.phase === 'regierung') {
        const e = f(z); versuche++;
        try { r = H.haushaltBeschliessen(z, e); }
        catch (err) {
          abgelehnt++;
          // Spieler muss nachgeben: Kürzungen auf den Wunsch, sonst ganz ohne Änderungen
          const k = H.kuerzungsVorschlag(z, e);
          try { r = H.haushaltBeschliessen(z, k ?? {}); } catch { r = H.haushaltBeschliessen(z, H.kuerzungsVorschlag(z, {}) ?? {}); }
        }
        pfad.push(r.state.land?.schuldenquote ?? z.land.schuldenquote);
      } else break;
      z = r.state;
      if (z.land) maxq = Math.max(maxq, z.land.schuldenquote);
    }
    quoteEnde += z.land.schuldenquote; quoteMax += maxq; n++;
    if (seed === 1) endeJahr = pfad.map((q) => Math.round(q * 10) / 10);
  }
  ergebnis[name] = { quoteEnde: +(quoteEnde / n).toFixed(1), quoteMax: +(quoteMax / n).toFixed(1), abgelehnt, versuche, pfadSeed1: endeJahr, nan: !Number.isFinite(quoteEnde) };
  console.log(`${name}: Ø Quote Ende ${(quoteEnde / n).toFixed(1)} %, Ø Maximum ${(quoteMax / n).toFixed(1)} %, abgelehnt ${abgelehnt} von ${versuche} Haushalten; Pfad Seed 1: ${endeJahr.join(' → ')}`);
}

(await import('node:fs')).writeFileSync(new URL(`./${process.argv[2] ?? 'extrem'}-extrem.json`, import.meta.url), JSON.stringify(ergebnis, null, 1));
