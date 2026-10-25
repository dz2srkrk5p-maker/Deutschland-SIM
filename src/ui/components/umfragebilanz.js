// Umfrage-Bilanz (Paket Klein, Feature 1): welche Entscheidungen die Umfragen der letzten Runden bewegt haben.
import { parteien } from '../../data/parteien.js';
import { aufklapp, plusMinus, punkt } from './basis.js';

const partei = (id) => parteien.find((p) => p.id === id);
const summe = (posten) => posten.reduce((s, p) => s + p.wert, 0);

// Einträge gleicher Zeitangabe zusammenfassen, neueste zuerst
function nachZeit(bilanz) {
  const zeiten = [];
  for (const e of bilanz) {
    const z = zeiten.find((x) => x.zeit === e.zeit) ?? (zeiten.push({ zeit: e.zeit, posten: [] }), zeiten.at(-1));
    z.posten.push(...e.posten);
  }
  return zeiten.reverse();
}

// gleiche Ursache je Partei zusammenfassen (z. B. Zufall aus mehreren Aktionen eines Monats)
function verdichten(posten) {
  const m = new Map();
  for (const p of posten) {
    const k = `${p.partei}|${p.ursache}`;
    m.set(k, { ...p, wert: (m.get(k)?.wert ?? 0) + p.wert });
  }
  return [...m.values()].filter((p) => Math.round(Math.abs(p.wert) * 100) >= 1).sort((a, b) => Math.abs(b.wert) - Math.abs(a.wert));
}

function parteiListe(id, posten) {
  const eigene = verdichten(posten.filter((p) => p.partei === id));
  if (!eigene.length) return '';
  return `<p><strong>${punkt(partei(id).farbe)}${partei(id).name} ${plusMinus(summe(eigene))}</strong></p>
    <ul class="liste">${eigene.map((p) => `<li><span>${p.ursache}</span> <span class="zahl">${plusMinus(p.wert)}</span></li>`).join('')}</ul>`;
}

export function umfrageBilanzHtml(zustand) {
  const zeiten = nachZeit(zustand.umfrageBilanz ?? []);
  if (!zeiten.length) return '<p class="leer">Noch keine Umfrageänderungen in dieser Partie.</p>';
  const ids = [zustand.spielerParteiId, ...(zustand.koalition?.partner ?? [])];
  return `<p class="klein">Feste Wirkungen der Entscheidungen und Ereignisse. „Zufall und Verschiebung durch andere Parteien“ ist der Rest: die zufällige Schwankung und das, was andere Parteien gewinnen oder verlieren.</p>
    ${zeiten.map((z, i) => aufklapp(z.zeit, ids.map((id) => parteiListe(id, z.posten)).join('') || '<p class="leer">Keine Änderung bei der Regierung.</p>', i === 0)).join('')}`;
}

// Kurztext für den Tooltip in der Kopfzeile: die drei stärksten Ursachen der letzten Runde für die eigene Partei
export function umfrageBilanzKurz(zustand) {
  const z = nachZeit(zustand.umfrageBilanz ?? [])[0];
  if (!z) return '';
  const top = verdichten(z.posten.filter((p) => p.partei === zustand.spielerParteiId)).slice(0, 3);
  return top.length ? `${z.zeit}: ${top.map((p) => `${p.ursache} ${plusMinus(p.wert)}`).join('; ')}` : '';
}
