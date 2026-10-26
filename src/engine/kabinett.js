import { ministerien } from '../data/ministerien.js';
import { uebernahmenAnlegen } from './grossprojekte.js';
import { parteien } from '../data/parteien.js';
import { vertragsVorschlaege, vertragPruefen, vertragAnlegen } from './koalitionsvertrag.js';
import { sainteLague } from './hoechstzahl.js';

const partei = (id) => parteien.find((p) => p.id === id);

// Regierungsparteien: Kanzlerpartei zuerst (vor der Kanzlerwahl der Spieler), dann Partner in der Reihenfolge von parteien.js.
// Seit Etappe 0b kann die Kanzlerpartei eine andere als die des Spielers sein (Spieler in der Opposition).
export const koalitionsParteien = (zustand) => [zustand.kanzlerParteiId ?? zustand.spielerParteiId, ...zustand.koalition.partner];

// Wie viele Ministerien jeder Koalitionspartei zustehen: Sainte-Laguë nach Sitzen.
export function ansprueche(zustand) {
  const stimmen = Object.fromEntries(koalitionsParteien(zustand).map((id) => [id, zustand.sitze[id]]));
  const { sitze, rngZustand } = sainteLague(stimmen, ministerien.length, zustand.rngZustand);
  return { anspruch: sitze, rngZustand };
}

// Vorschlag zum Vorausfüllen: Parteien wählen abwechselnd (Spieler zuerst) in Listenreihenfolge der Ministerien.
export function vorschlag(zustand) {
  const rest = { ...zustand.kabinett.anspruch };
  const reihe = koalitionsParteien(zustand);
  const verteilung = {};
  let i = 0;
  for (const m of ministerien) {
    while (rest[reihe[i % reihe.length]] === 0) i++;
    const id = reihe[i % reihe.length];
    verteilung[m.id] = id;
    rest[id]--;
    i++;
  }
  return verteilung;
}

// Fehler einer Verteilung als Texte; leere Liste = gültig.
export function pruefeVerteilung(zustand, verteilung) {
  const fehler = [];
  const koalition = koalitionsParteien(zustand);
  for (const m of ministerien) {
    if (!koalition.includes(verteilung[m.id])) fehler.push(`${m.kurz}: keine Koalitionspartei`);
  }
  for (const id of koalition) {
    const anzahl = ministerien.filter((m) => verteilung[m.id] === id).length;
    const soll = zustand.kabinett.anspruch[id];
    if (anzahl !== soll) fehler.push(`${partei(id).name}: ${anzahl} statt ${soll} Ministerien`);
  }
  return fehler;
}

// Aktion: Kabinett bestätigen, danach beginnt die Regierung.
// Koalitionsvertrag (Feature 7): ohne Angabe je Partner der erste Vorschlag
export const vorhabenVorschlag = (zustand) => Object.entries(vertragsVorschlaege(zustand)).flatMap(([partei, wege]) => wege.slice(0, 1).map((wegId) => ({ wegId, partei })));

export function bestaetigen(zustand, { verteilung, vorhaben = vorhabenVorschlag(zustand) }) {
  if (zustand.phase !== 'kabinett') throw new Error('Keine Kabinettsbildung');
  const fehler = [...pruefeVerteilung(zustand, verteilung), ...vertragPruefen(zustand, vertragsVorschlaege(zustand), vorhaben)];
  if (fehler.length) throw new Error(`Ungültige Verteilung: ${fehler.join('; ')}`);
  const sauber = Object.fromEntries(ministerien.map((m) => [m.id, verteilung[m.id]]));
  const mitVertrag = zustand.koalition.partner.length > 0;
  return {
    // regierungSeit: Beginn dieser Regierung (Kurswechsel im ersten Jahr kostenlos, Epochen-Etappe 3)
    // Großprojekte einer anderen Regierung warten auf die Übernahme-Entscheidung (Etappe 7)
    state: uebernahmenAnlegen({ ...zustand, phase: 'regierung', regierungSeit: zustand.jahr * 12 + zustand.monat - 1, kabinett: { ...zustand.kabinett, verteilung: sauber },
      koalition: { ...zustand.koalition, vertrag: mitVertrag ? vertragAnlegen(zustand, vorhaben, sauber) : null } }),
    ereignisse: ['Kabinett vereidigt', ...(mitVertrag ? [`Koalitionsvertrag unterzeichnet: ${vorhaben.length} Vorhaben der Partner, Ressortverteilung festgeschrieben`] : [])],
  };
}
