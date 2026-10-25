// Wahlergebnis-Tabelle (Wahlabend und Chronik): Stimmen, Veränderung zur Wahl davor (bei der ersten: 2025), Sitze.
import { parteien } from '../../data/parteien.js';
import { zahl, plusMinus, punkt } from './basis.js';

export function wahlergebnisHtml(zustand, sitze) {
  const w = zustand.wahlergebnis;
  return `<table>
    <thead><tr><th scope="col">Partei</th><th scope="col">Stimmen</th><th scope="col">± Punkte</th><th scope="col">Sitze</th></tr></thead>
    <tbody>${parteien.map((p) => `
      <tr${p.id === zustand.spielerParteiId ? ' class="eigene"' : ''}><th scope="row">${punkt(p.farbe)}${p.name}</th><td>${zahl(w.anteile[p.id], 2)} %</td><td>${plusMinus(w.anteile[p.id] - w.vorher[p.id])}</td><td>${sitze?.[p.id] ?? '–'}</td></tr>`).join('')}
    </tbody>
  </table>`;
}
