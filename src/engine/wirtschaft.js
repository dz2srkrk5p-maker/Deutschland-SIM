import { config } from '../data/config.js';
import { gruppen } from '../data/kennzahlen.js';
import { zufall } from './rng.js';

const w = config.wirtschaft;
const begrenzt = (x, min, max) => Math.max(min, Math.min(max, x));
const r2 = (x) => Math.round(x * 100) / 100 + 0;

// Summe mehrerer Wirkungen { wachstum, inflation, arbeitslosigkeit, gini, gruppen: {}, probleme: {} }
// Kennzahlen eines Jahres für den Wirtschaftsverlauf (Anzeige als Diagramm)
export const wirtschaftWerte = (land) => ({ wachstum: land.wachstum, inflation: land.inflation, arbeitslosigkeit: land.arbeitslosigkeit, schuldenquote: land.schuldenquote, gini: land.gini });

export function wirkungSumme(...liste) {
  const s = { wachstum: 0, inflation: 0, arbeitslosigkeit: 0, gini: 0, gruppen: {}, probleme: {} };
  for (const x of liste.filter(Boolean)) {
    for (const k of ['wachstum', 'inflation', 'arbeitslosigkeit', 'gini']) s[k] += x[k] ?? 0;
    for (const bereich of ['gruppen', 'probleme']) for (const [id, v] of Object.entries(x[bereich] ?? {})) s[bereich][id] = (s[bereich][id] ?? 0) + v;
  }
  return s;
}

export const skaliert = (wirkung, f) => {
  const s = wirkungSumme(wirkung);
  for (const k of ['wachstum', 'inflation', 'arbeitslosigkeit', 'gini']) s[k] *= f;
  for (const bereich of ['gruppen', 'probleme']) for (const id in s[bereich]) s[bereich][id] *= f;
  return s;
};

// Ein Haushaltsjahr: Kennzahlen bewegen sich zur Basis zurück, dazu die Wirkungen des Jahres und zufällige Schwankung.
// neueSchuldenMrd: Neuverschuldung des Bundes. mitZufall = false für die Prognose.
// Zinsaufschlag (Feature 2): Ziel aus Schuldenquote und Neuverschuldung des Bundes (% BIP), höchstens max
export function zinsaufschlagZiel(schuldenquote, defizitBip) {
  const z = config.haushalt.zinsaufschlag;
  return Math.min(z.max, z.jePunktQuote * Math.max(0, schuldenquote - z.quoteAb) + z.jePunktDefizit * Math.max(0, defizitBip - z.defizitAb));
}

export function jahresSchritt(land, wirkung, neueSchuldenMrd, rngZustand, mitZufall = true) {
  let zufallW = 0, zufallI = 0;
  if (mitZufall) {
    const a = zufall(rngZustand);
    const b = zufall(a.rngZustand);
    rngZustand = b.rngZustand;
    zufallW = (a.wert * 2 - 1) * w.schwankungWachstum;
    zufallI = (b.wert * 2 - 1) * w.schwankungInflation;
  }
  const wachstum = w.traegheit * land.wachstum + (1 - w.traegheit) * w.potenzialWachstum + wirkung.wachstum + zufallW;
  const inflation = Math.max(-1, w.traegheit * land.inflation + (1 - w.traegheit) * w.zielInflation + wirkung.inflation + zufallI);
  const arbeitslosigkeit = begrenzt(
    land.arbeitslosigkeit - w.okun * (wachstum - w.potenzialWachstum) + (w.natArbeitslosigkeit - land.arbeitslosigkeit) * w.rueckkehr + wirkung.arbeitslosigkeit, 2, 20);
  const gini = begrenzt(land.gini + (w.giniBasis - land.gini) * w.rueckkehr + wirkung.gini, 20, 45);
  const bip = land.bip * (1 + (wachstum + inflation) / 100);
  const schulden = land.schulden + neueSchuldenMrd + (w.uebrigesDefizitBip / 100) * bip;
  const alt = land.zinsaufschlag ?? 0;
  const ziel = zinsaufschlagZiel((schulden / bip) * 100, (neueSchuldenMrd / bip) * 100);
  return {
    land: {
      wachstum: r2(wachstum), inflation: r2(inflation), arbeitslosigkeit: r2(arbeitslosigkeit), gini: r2(gini),
      bip: Math.round(bip), schulden: Math.round(schulden), schuldenquote: r2((schulden / bip) * 100),
      preise: (land.preise ?? 1) * (1 + inflation / 100),
      zinsaufschlag: Math.round((alt + (ziel - alt) * config.haushalt.zinsaufschlag.anpassung) * 1000) / 1000 + 0,
    },
    rngZustand,
  };
}

// Gruppenzustimmung: Wirkung dazu, dann Rückkehr Richtung 50
export function gruppenSchritt(alt, wirkungGruppen = {}) {
  return Object.fromEntries(gruppen.map((g) => {
    const v = (alt[g.id] ?? 50) + (wirkungGruppen[g.id] ?? 0);
    return [g.id, r2(begrenzt(v + (50 - v) * w.gruppenRueckkehr, 0, 100))];
  }));
}

// Teile von lageUmfrage für die Umfrage-Bilanz: je Kennzahl und je Gruppe, ungerundet (die Summe rundet lageUmfrage)
export function lageTeile(altLand, neuLand, gruppenNeu) {
  const u = w.umfrage;
  return [
    { ursache: 'Wirtschaftslage: Wachstum', wert: u.wachstum * (neuLand.wachstum - w.potenzialWachstum) },
    { ursache: 'Wirtschaftslage: Arbeitslosigkeit', wert: -u.arbeitslosigkeit * (neuLand.arbeitslosigkeit - altLand.arbeitslosigkeit) },
    { ursache: 'Wirtschaftslage: Inflation', wert: -u.inflation * Math.max(0, neuLand.inflation - u.inflationUeber) },
    ...gruppen.map((g) => ({ ursache: `Stimmung der Gruppe ${g.name}`, wert: (u.gruppen * ((gruppenNeu[g.id] ?? 50) - 50)) / 50 })),
  ];
}

// Wirkung der Lage auf die Kanzlerpartei (Punkte) nach einem Jahr
export function lageUmfrage(altLand, neuLand, gruppenNeu) {
  const u = w.umfrage;
  const gruppenSchnitt = Object.values(gruppenNeu).reduce((s, v) => s + (v - 50) / 50, 0);
  return r2(
    u.wachstum * (neuLand.wachstum - w.potenzialWachstum)
    - u.arbeitslosigkeit * (neuLand.arbeitslosigkeit - altLand.arbeitslosigkeit)
    - u.inflation * Math.max(0, neuLand.inflation - u.inflationUeber)
    + u.gruppen * gruppenSchnitt,
  );
}
