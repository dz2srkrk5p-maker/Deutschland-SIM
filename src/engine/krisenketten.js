// Krisenketten (Paket Groß, Feature 8): Erreicht ein Problem die Stufe „Krise“, verschärft es mit Verzögerung die Probleme,
// die es laut seinen bestehenden Wechselwirkungen treibt (src/data/probleme.js, Treiber { problem }). Kein zweites System:
// Ziel und Stärke kommen aus diesen Treibern (Gewicht × faktor). Dämpfer: Verzögerung, Dämpfung je Kettenstufe, maximale
// Tiefe, Obergrenze gleichzeitig aktiver Glieder, Abklingzeit je auslösendem Problem. Spielwerte: config.krisenketten.
import { config } from '../data/config.js';
import { probleme } from '../data/probleme.js';
import { problem } from './probleme.js';

const kk = config.krisenketten;
const krise = config.probleme.stufen.find((s) => s.id === 'krise').ab;
const r1 = (x) => Math.round(x * 10) / 10 + 0;
const name = (id) => problem(id).name;

export const kettenStart = () => ({ aktiv: [], zuletzt: {}, verlauf: [] });

// Welche Probleme eine Krise bei quelleId verschärft, mit Stärke (ungedämpft)
export const kettenZiele = (quelleId) => probleme
  .flatMap((p) => p.treiber.filter((t) => t.problem === quelleId && t.gewicht > 0).map((t) => ({ nach: p.id, staerke: r1(t.gewicht * kk.faktor) })))
  .sort((a, b) => b.staerke - a.staerke);

// Ein Monat: fällige Glieder wirken, neue Krisen lösen Glieder aus. neu: Problemwerte nach der normalen Entwicklung.
export function kettenSchritt(zustand, neu) {
  const k = zustand.ketten ?? kettenStart();
  const runde = zustand.runde;
  const werte = { ...neu };
  const zuletzt = { ...k.zuletzt };
  let aktiv = [...k.aktiv];
  let verlauf = [...k.verlauf];
  const ereignisse = [];

  const ausloesen = (von, tiefe) => {
    if (tiefe > kk.maxTiefe) return;
    if (zuletzt[von] !== undefined && runde - zuletzt[von] < kk.abklingMonate) return;
    zuletzt[von] = runde;
    const neuGlieder = [];
    for (const z of kettenZiele(von)) {
      if (aktiv.length >= kk.maxAktiv) break;
      const staerke = r1(z.staerke * kk.daempfung ** (tiefe - 1));
      if (staerke <= 0) continue;
      const glied = { von, nach: z.nach, staerke, faellig: runde + kk.verzoegerung, tiefe };
      aktiv.push(glied);
      neuGlieder.push(glied);
    }
    if (neuGlieder.length) ereignisse.push(`Krisenkette: Die Krise bei „${name(von)}“ verschärft in ${kk.verzoegerung} Monaten ${neuGlieder.map((g) => `„${name(g.nach)}“ (+${g.staerke.toLocaleString('de-DE')})`).join(', ')}.`);
  };

  // fällige Glieder wirken; erreicht das Ziel dadurch die Krise, setzt sich die Kette eine Stufe tiefer fort
  const faellig = aktiv.filter((g) => g.faellig <= runde);
  aktiv = aktiv.filter((g) => g.faellig > runde);
  for (const g of faellig) {
    const vorher = werte[g.nach].wert;
    const w = r1(Math.min(100, vorher + g.staerke));
    werte[g.nach] = { ...werte[g.nach], wert: w, verlauf: [...werte[g.nach].verlauf.slice(0, -1), w] };
    verlauf = [...verlauf, { von: g.von, nach: g.nach, staerke: g.staerke, runde }].slice(-kk.verlaufLaenge);
    ereignisse.push(`Krisenkette wirkt: „${name(g.nach)}“ +${g.staerke.toLocaleString('de-DE')} wegen der Krise bei „${name(g.von)}“.`);
    if (vorher < krise && w >= krise) ausloesen(g.nach, g.tiefe + 1);
  }
  // neue Krisen aus der normalen Entwicklung dieses Monats (Werte vor der Kettenwirkung: eine durch eine Kette
  // ausgelöste Krise setzt die Kette nur über die Tiefe fort, sonst ließe sich maxTiefe umgehen)
  for (const p of probleme) {
    if (zustand.probleme[p.id].wert < krise && neu[p.id].wert >= krise) ausloesen(p.id, 1);
  }
  return { probleme: werte, ketten: { aktiv, zuletzt, verlauf }, ereignisse };
}
