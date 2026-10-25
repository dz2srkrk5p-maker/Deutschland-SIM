import { config } from '../data/config.js';
import { parteien } from '../data/parteien.js';
import { koalitionsParteien } from './kabinett.js';
import { zufall } from './rng.js';
import { parteiPosition, abstand as abstandPos } from './profil.js';

const bt = config.bundestag;
const platz = (id) => parteien.find((p) => p.id === id).sitzordnung;
const abstand = (id, koalition) => Math.min(...koalition.map((k) => Math.abs(platz(id) - platz(k))));
// Brandmauer (F11): Für eine Regierung mit einer Brandmauer-Partei stimmt keine andere Fraktion
const brandmauerRegierung = (koalition) => koalition.some((id) => config.koalition.brandmauer.includes(id));

function zaehlen(vorlage, fraktionen) {
  const summe = (stimme) => fraktionen.filter((f) => f.stimme === stimme).reduce((s, f) => s + f.sitze, 0);
  const abweichler = fraktionen.reduce((s, f) => s + (f.abweichler ?? 0), 0);
  const ja = summe('ja') + abweichler;
  const nein = summe('nein') - abweichler;
  return { vorlage, ja, nein, enthaltung: summe('enthaltung'), abweichler, angenommen: ja > nein, fraktionen };
}

// Abstimmung im Bundestag über eine Vorlage (z. B. 'haushalt'). Ohne Zufall, damit das Ergebnis vorher sichtbar ist.
// Koalition stimmt geschlossen Ja, die Opposition nach Abstand zur nächsten Koalitionspartei. AfD-Stimmen für andere zählen mit.
// vorlage: Name (z. B. 'haushalt') oder { id, vektor } für einen Reformweg: dann stimmen die Fraktionen nach dem Abstand ihrer
// Position (CHES) zum Weg; Koalitionspartner legen ab dem Veto-Abstand ein Nein ein (System 1).
export function abstimmung(zustand, vorlage) {
  const koalition = koalitionsParteien(zustand);
  const gesperrt = brandmauerRegierung(koalition);
  const vektor = typeof vorlage === 'object' ? vorlage.vektor : null;
  const rw = config.reformwege;
  const nachInhalt = (id) => {
    const d = abstandPos(parteiPosition(id), vektor);
    return d <= rw.jaAbstand ? 'ja' : d <= rw.enthaltungAbstand ? 'enthaltung' : 'nein';
  };
  // Minderheitsregierung im Amt: Opposition eine Stufe strenger (F11)
  const regel = zustand.koalition.minderheit ? bt.stimmeNachAbstandMinderheit : bt.stimmeNachAbstand;
  const fraktionen = parteien
    .filter((p) => zustand.sitze[p.id] > 0)
    .map((p) => {
      const veto = vektor && p.id !== koalition[0] && abstandPos(parteiPosition(p.id), vektor) > rw.vetoAbstand;
      const stimme = koalition.includes(p.id) ? (veto ? 'nein' : 'ja') : gesperrt ? 'nein' : vektor ? nachInhalt(p.id) : (regel[abstand(p.id, koalition)] ?? bt.stimmeWeit);
      return { id: p.id, sitze: zustand.sitze[p.id], stimme };
    });
  return zaehlen(vektor ? vorlage.id : vorlage, fraktionen);
}

// Die echte Abstimmung: wie die Vorschau, nur bei einer Brandmauer-Regierung stimmt jeder Abgeordnete einer Nachbarfraktion
// (Abstand 1) mit Wahrscheinlichkeit bt.brandmauerAbweichler doch mit Ja. Sonst kein Zufall, rngZustand bleibt gleich.
export function abstimmen(zustand, vorlage) {
  const vorschau = abstimmung(zustand, vorlage);
  const koalition = koalitionsParteien(zustand);
  if (!brandmauerRegierung(koalition)) return { ...vorschau, rngZustand: zustand.rngZustand };
  let rngZustand = zustand.rngZustand;
  const fraktionen = vorschau.fraktionen.map((f) => {
    if (koalition.includes(f.id) || abstand(f.id, koalition) !== 1) return f;
    let abweichler = 0;
    for (let i = 0; i < f.sitze; i++) {
      const z = zufall(rngZustand);
      rngZustand = z.rngZustand;
      if (z.wert < bt.brandmauerAbweichler) abweichler++;
    }
    return { ...f, abweichler };
  });
  return { ...zaehlen(vorlage, fraktionen), rngZustand };
}
