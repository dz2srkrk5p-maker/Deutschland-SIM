// Großprojekte unter Kabinett › Missionen (Epochen-Etappe 7)
import { projektDaten, naechsterMeilenstein } from '../../engine/grossprojekte.js';
import { systemAn } from '../../engine/spielstufe.js';
import { grossprojekte as daten } from '../../data/grossprojekte.js';
import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { badge, status, balken } from './basis.js';
import { datumText } from './epochen.js';

const STATUS = { laufend: ['läuft', 'gelb'], fertig: ['fertig', 'ok'], gestoppt: ['gestoppt', 'rot'] };
const mrd = (t) => `${(t / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 2 })} Mrd. €`;

export function grossprojekteHtml(zustand) {
  if (!systemAn(zustand, 'grossprojekte')) return '';
  const liste = zustand.grossprojekte ?? [];
  if (!liste.length) return `<p class="klein">Kein Großprojekt. Manche Ansätze starten eines: ${daten.map((d) => `„${d.name}“`).join(', ')}. Höchstens ${config.grossprojekte.max} laufen gleichzeitig.</p>`;
  const eigene = zustand.phase === 'regierung';
  return liste.map((p) => {
    const d = projektDaten(p.id);
    const n = d.meilensteine.length;
    const faellig = naechsterMeilenstein(p);
    const ueber = Math.round((p.kostenFaktor - 1) * 100);
    return `<div class="epoche-weg">
      <h4>${d.name} ${badge(...STATUS[p.status])}${p.ausschuss ? ` ${badge('Untersuchungsausschuss', 'rot')}` : ''}</h4>
      ${balken((p.erreicht / n) * 100, 'var(--akzent)', { label: `${p.erreicht} von ${n} Meilensteinen` })}
      <p class="klein">${p.erreicht} von ${n} Meilensteinen${p.status === 'laufend' && faellig !== null ? ` · nächster: ${d.meilensteine[p.erreicht].name}, geplant ${datumText(p.start + faellig)}` : ''}<br>
      ${p.status === 'laufend' ? `Baukosten ${mrd(Math.round(d.baukostenJeJahr * p.kostenFaktor))} je Jahr · ${ueber > 0 ? status(ueber >= config.grossprojekte.untersuchungAbUeberPlan * 100 ? 'rot' : 'gelb', `${ueber} % über Plan`) : ueber < 0 ? `${-ueber} % unter Plan` : 'im Plan'} · ` : ''}begonnen von ${parteien.find((x) => x.id === p.traeger).name}</p>
      ${p.uebernahme === 'offen' && eigene ? `<p>${status('gelb', 'Ihr habt das Projekt von einer anderen Regierung übernommen. Wie geht es weiter?')}</p>
        <div class="knoepfe"><button data-projekt="${p.id}" data-wahl="weiterfuehren">Weiterführen</button><button data-projekt="${p.id}" data-wahl="umbauen">Umbauen (ein Viertel billiger, ein Jahr später)</button><button data-projekt="${p.id}" data-wahl="stoppen" class="gefahr">Stoppen</button></div>` : ''}
    </div>`;
  }).join('');
}

// Hinweis an einem Ansatz, der ein Großprojekt startet
export const startetProjekt = (zustand, ansatzId) => {
  const d = daten.find((g) => g.startDurch === ansatzId);
  if (!d || !systemAn(zustand, 'grossprojekte')) return '';
  return `<tr><th scope="row">Großprojekt</th><td>startet „${d.name}“: ${d.meilensteine.length} Meilensteine über ${Math.round(d.meilensteine.at(-1).monate / 12)} Jahre, Baukosten ${mrd(d.baukostenJeJahr)} je Jahr</td></tr>`;
};
