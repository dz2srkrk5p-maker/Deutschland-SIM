import { config } from '../data/config.js';
import { parteien } from '../data/parteien.js';
import { koalitionsParteien } from './kabinett.js';

const bt = config.bundestag;
const platz = (id) => parteien.find((p) => p.id === id).sitzordnung;

// Abstimmung im Bundestag über eine Vorlage (z. B. 'haushalt'). Ohne Zufall, damit das Ergebnis vorher sichtbar ist.
// Koalition stimmt geschlossen Ja, die Opposition nach Abstand zur nächsten Koalitionspartei. AfD-Stimmen zählen mit.
export function abstimmung(zustand, vorlage) {
  const koalition = koalitionsParteien(zustand);
  const fraktionen = parteien
    .filter((p) => zustand.sitze[p.id] > 0)
    .map((p) => {
      const abstand = Math.min(...koalition.map((id) => Math.abs(p.sitzordnung - platz(id))));
      const stimme = koalition.includes(p.id) ? 'ja' : (bt.stimmeNachAbstand[abstand] ?? bt.stimmeWeit);
      return { id: p.id, sitze: zustand.sitze[p.id], stimme };
    });
  const summe = (stimme) => fraktionen.filter((f) => f.stimme === stimme).reduce((s, f) => s + f.sitze, 0);
  const ja = summe('ja');
  const nein = summe('nein');
  return { vorlage, ja, nein, enthaltung: summe('enthaltung'), angenommen: ja > nein, fraktionen };
}
