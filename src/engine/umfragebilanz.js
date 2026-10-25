// Umfrage-Bilanz (Paket Klein, Feature 1): macht nachvollziehbar, welche Entscheidungen die Umfragen bewegt haben.
// Keine eigene Berechnung: Die Aktionen übergeben ihre festen Teilbeiträge (posten), der Rest der tatsächlichen
// Änderung (Zufall, Verschiebung durch Gewinne und Verluste anderer Parteien, Rundung) wird als eigener Posten gebucht.
import { config } from '../data/config.js';
import { monatsname } from '../data/kalender.js';

const r3 = (x) => Math.round(x * 1000) / 1000 + 0;

// Zeitangabe der Runde, in der eine Aktion stattfindet
export function zeitText(zustand) {
  if (zustand.phase === 'wahlkampf') return `Wahlkampf, Woche ${zustand.wahlkampfWoche}`;
  return `Jahr ${zustand.haushalt.jahr}, ${monatsname(zustand.monat)}`;
}

// posten: [{ ursache, partei, wert }]. Bucht für die Spielerpartei und die Koalitionspartner zusätzlich den Rest.
// Behält die Einträge der letzten config.umfrageBilanz.runden Zeitangaben.
export function umfrageBuchen(alt, neu, posten, zeit = zeitText(alt)) {
  const beteiligt = [...new Set([alt.spielerParteiId, ...(alt.koalition?.partner ?? []), ...posten.map((p) => p.partei)])];
  const liste = posten.filter((p) => Math.abs(p.wert) >= 0.0005).map((p) => ({ ...p, wert: r3(p.wert) }));
  for (const id of beteiligt) {
    const fest = posten.filter((p) => p.partei === id).reduce((s, p) => s + p.wert, 0);
    const rest = neu.anteile[id] - alt.anteile[id] - fest;
    if (Math.abs(rest) >= 0.0005) liste.push({ ursache: 'Zufall und Verschiebung durch andere Parteien', partei: id, wert: r3(rest), rest: true });
  }
  if (!liste.length) return neu;
  const bisher = neu.umfrageBilanz ?? [];
  const eintraege = [...bisher, { zeit, posten: liste }];
  const zeiten = [...new Set(eintraege.map((e) => e.zeit))].slice(-config.umfrageBilanz.runden);
  return { ...neu, umfrageBilanz: eintraege.filter((e) => zeiten.includes(e.zeit)) };
}
