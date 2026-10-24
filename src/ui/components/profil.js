// Richtungsprofil des Landes (System 1): je Achse ein Balken von −2 bis +2 mit Marke
import { achsen } from '../../data/kennzahlen.js';
import { zahl } from './basis.js';

export function profilHtml(profil, { vergleich = null } = {}) {
  return `<div class="profil">${achsen.map((a) => {
    const x = profil[a.id] ?? 0;
    const pos = ((x + 2) / 4) * 100;
    const v = vergleich?.[a.id];
    return `<div class="achse">
      <span class="klein">${a.minus}</span>
      <span class="achse-balken" role="img" aria-label="${a.name}: ${zahl(x, 1)} (−2 ${a.minus} bis +2 ${a.plus})">
        <i class="mitte"></i>${v === undefined ? '' : `<i class="vergleich" style="left:${((v + 2) / 4) * 100}%" title="Weg"></i>`}<i class="marke" style="left:${pos}%"></i>
      </span>
      <span class="klein">${a.plus}</span>
    </div>`;
  }).join('')}</div>`;
}
