import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { ministerien, kanzleramt } from '../../data/ministerien.js';
import { koalitionsParteien, vorschlag, pruefeVerteilung } from '../../engine/kabinett.js';
import { karte } from '../components/basis.js';
import { schritteHtml } from '../shell.js';

const partei = (id) => parteien.find((p) => p.id === id);

// Kabinettsbildung: jedes Ministerium einer Koalitionspartei zuordnen.
export function kabinettScreen(el, zustand, { onBestaetigen }) {
  const koalition = koalitionsParteien(zustand);
  const start = vorschlag(zustand);
  const optionen = (gewaehlt) =>
    koalition.map((id) => `<option value="${id}" ${id === gewaehlt ? 'selected' : ''}>${partei(id).name}</option>`).join('');

  el.innerHTML = `<div class="ansicht">
    ${schritteHtml('kabinett')}
    <h1>Kabinett</h1>
    ${hinweisHtml('kabinett')}
    <p>${kanzleramt.name}: ${partei(zustand.kanzlerParteiId).name}. Verteile die ${ministerien.length} Ministerien.</p>
    ${karte(`
      <p id="stand" class="zahl"></p>
      <div class="ministerien">
        ${ministerien.map((m) => `<label class="ministerium"><span title="${m.name}">${m.kurz}</span><select data-ministerium="${m.id}">${optionen(start[m.id])}</select></label>`).join('')}
      </div>
      <ul id="fehler" class="fehler"></ul>
      <div class="knoepfe"><button id="bestaetigen" class="primaer">Kabinett vereidigen</button></div>`)}
  </div>`;

  const verteilung = () => Object.fromEntries([...el.querySelectorAll('[data-ministerium]')].map((s) => [s.dataset.ministerium, s.value]));
  const aktualisieren = () => {
    const v = verteilung();
    el.querySelector('#stand').textContent = koalition
      .map((id) => `${partei(id).name}: ${Object.values(v).filter((x) => x === id).length} von ${zustand.kabinett.anspruch[id]}`)
      .join(' · ');
    const fehler = pruefeVerteilung(zustand, v);
    el.querySelector('#fehler').innerHTML = fehler.map((f) => `<li>✗ ${f}</li>`).join('');
    el.querySelector('#bestaetigen').disabled = fehler.length > 0;
  };
  el.querySelectorAll('select').forEach((s) => s.addEventListener('change', aktualisieren));
  el.querySelector('#bestaetigen').addEventListener('click', () => onBestaetigen({ verteilung: verteilung() }));
  aktualisieren();
}
