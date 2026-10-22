import { config } from '../data/config.js';
import { parteien } from '../data/parteien.js';
import { probleme } from '../data/probleme.js';
import { bruchAbstand } from './haushalt.js';

const tk = config.ticker;
const name = (id) => parteien.find((p) => p.id === id).name;
const zahl = (x) => x.toLocaleString('de-DE', { maximumFractionDigits: 1 });

// Nachrichtenticker (F15): Schlagzeilen aus dem aktuellen Spielstand, ohne Zufall und ohne eigenes Zustandsfeld.
// Reihenfolge = Wichtigkeit; höchstens tk.anzahl, keine doppelten.
export function schlagzeilen(zustand) {
  const liste = [];
  const spieler = zustand.spielerParteiId;

  if (zustand.phase === 'regierung') {
    // Partner nahe am Koalitionsbruch (Warnstufe wie im Haushalt, F01)
    for (const a of bruchAbstand(zustand)) {
      if (a.verlust >= a.grenze * config.spielende.warnAnteil) liste.push(`Unruhe bei ${name(a.id)}: Basis zweifelt an der Koalition`);
    }
    // brennende Probleme (F13), der höchste Druck zuerst
    probleme
      .filter((p) => zustand.probleme[p.id] >= config.reformen.druckSchwelle)
      .sort((a, b) => zustand.probleme[b.id] - zustand.probleme[a.id])
      .forEach((p) => liste.push(`${p.name}: Druck auf die Bundesregierung wächst (${zustand.probleme[p.id]} von 100)`));
    if (zustand.koalition.minderheit) liste.push(`Minderheitsregierung: ${name(zustand.kanzlerParteiId)} sucht für jedes Vorhaben Stimmen`);
  }

  // Umfragetrend der eigenen Partei über die letzten Schritte
  const verlauf = zustand.verlauf;
  if (verlauf.length > tk.trendSchritte) {
    const trend = verlauf.at(-1).anteil - verlauf.at(-1 - tk.trendSchritte).anteil;
    if (trend >= tk.trendPunkte) liste.push(`Umfragen: ${name(spieler)} legt zu (+${zahl(trend)} Punkte)`);
    if (trend <= -tk.trendPunkte) liste.push(`Umfragen: ${name(spieler)} verliert (−${zahl(-trend)} Punkte)`);
  }

  // Parteien knapp an der Fünf-Prozent-Hürde
  for (const p of parteien.filter((p) => !p.sonstige)) {
    const abstand = Math.abs(zustand.anteile[p.id] - config.sperrklauselProzent);
    if (abstand <= tk.huerdeAbstand) liste.push(`${p.name} zittert um die Fünf-Prozent-Hürde (${zustand.anteile[p.id].toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %)`);
  }

  return [...new Set(liste)].slice(0, tk.anzahl);
}
