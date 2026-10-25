// Abstand der Partner zum Koalitionsbruch (F01): jetzt und optional nach einem geplanten Haushalt.
import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { bruchAbstand, ultimatumRest } from '../../engine/haushalt.js';
import { zahl, status } from './basis.js';

const name = (id) => parteien.find((p) => p.id === id).name;
export const bruchStufe = (a) => (a.geht ? 'rot' : a.verlust >= a.grenze * config.spielende.warnAnteil ? 'gelb' : 'ok');
// drei Stellen, weil die Grenze in Tausendsteln gilt: −1,503 geht, würde mit zwei Stellen aber als −1,50 erscheinen
const punkte = (v) => (v > 0 ? '−' : '+') + Math.abs(v).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 3 });

// Ultimatum (Block 2): Text mit Restfrist, oder leer
export const ultimatumText = (zustand, id) => {
  const rest = ultimatumRest(zustand, id);
  return rest === null ? '' : rest === 1 ? 'Ultimatum läuft am Ende dieses Monats ab' : `Ultimatum: noch ${rest} Monate`;
};

// Warnung für Kopfzeile und Lage: Ultimatum vor Unmut, null wenn alles stabil
export function koalitionsWarnung(zustand) {
  const partner = zustand.koalition?.partner ?? [];
  const ultimatum = partner.filter((id) => ultimatumRest(zustand, id) !== null);
  if (ultimatum.length) return { stufe: 'rot', text: `Ultimatum ${ultimatum.map(name).join(', ')}` };
  const unruhig = bruchAbstand(zustand).filter((a) => bruchStufe(a) !== 'ok');
  if (unruhig.length) return { stufe: 'gelb', text: `${unruhig.map((a) => name(a.id)).join(', ')} unzufrieden` };
  return null;
}

export function koalitionslageHtml(zustand, anteileNachher = null) {
  const jetzt = bruchAbstand(zustand);
  if (!jetzt.length) return `<p class="leer">${zustand.koalition.minderheit ? 'Minderheitsregierung' : 'Alleinregierung'} – keine Partner, kein Koalitionsbruch möglich.</p>`;
  const nachher = anteileNachher ? bruchAbstand(zustand, anteileNachher) : null;
  return `
    <table>
      <thead><tr><th scope="col">Partner</th><th scope="col">seit Regierungsbildung</th>${nachher ? '<th scope="col">nach diesem Haushalt</th>' : ''}</tr></thead>
      <tbody>${jetzt.map((a, i) => `<tr><th scope="row">${name(a.id)}</th>
        <td>${status(ultimatumRest(zustand, a.id) !== null ? 'rot' : bruchStufe(a), punkte(a.verlust))}${ultimatumText(zustand, a.id) ? ` <strong class="rot">${ultimatumText(zustand, a.id)}</strong>` : ''}</td>
        ${nachher ? `<td>${status(bruchStufe(nachher[i]), punkte(nachher[i].verlust))}${nachher[i].geht ? ' <strong class="rot">verlässt die Koalition</strong>' : ''}</td>` : ''}</tr>`).join('')}
      </tbody>
    </table>
    <p><small>Ab ${zahl(config.spielende.koalitionsbruchPunkte * config.koalitionsbruch.ultimatumAnteil, 1)} Punkten Verlust stellt ein Partner ein Ultimatum. Liegt er nach ${config.koalitionsbruch.fristMonate} Monaten mehr als ${zahl(config.spielende.koalitionsbruchPunkte, 1)} Punkte unter seinem Wert bei der Regierungsbildung, verlässt er die Koalition.${nachher ? ` Ohne die zufällige Schwankung von ±${zahl(config.wahlkampf.schwankungMax, 1)} Punkten.` : ''}</small></p>`;
}
