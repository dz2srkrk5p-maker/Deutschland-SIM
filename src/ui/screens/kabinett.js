import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { ministerien, kanzleramt } from '../../data/ministerien.js';
import { koalitionsParteien, vorschlag, pruefeVerteilung } from '../../engine/kabinett.js';
import { vertragsVorschlaege, vertragPruefen } from '../../engine/koalitionsvertrag.js';
import { weg, ausrichtungName } from '../../engine/reformwege.js';
import { erklaerungen } from '../../data/hinweise.js';
import { karte } from '../components/basis.js';
import { schritteHtml } from '../shell.js';

const partei = (id) => parteien.find((p) => p.id === id);

// Kabinettsbildung: jedes Ministerium einer Koalitionspartei zuordnen.
export function kabinettScreen(el, zustand, { onBestaetigen }) {
  const koalition = koalitionsParteien(zustand);
  const start = vorschlag(zustand);
  const vorschlaege = vertragsVorschlaege(zustand);
  const mitVertrag = zustand.koalition.partner.length > 0;
  const optionen = (gewaehlt) =>
    koalition.map((id) => `<option value="${id}" ${id === gewaehlt ? 'selected' : ''}>${partei(id).name}</option>`).join('');

  el.innerHTML = `<div class="ansicht">
    ${schritteHtml('kabinett')}
    <h1>${mitVertrag ? 'Koalitionsvertrag und Kabinett' : 'Kabinett'}</h1>
    ${hinweisHtml('kabinett')}
    ${mitVertrag ? karte(`<p class="klein">${erklaerungen.vertrag}</p>
      ${zustand.koalition.partner.map((id) => `<fieldset><legend>Vorhaben von ${partei(id).name}</legend>${vorschlaege[id].map((wegId, i) => `<label class="vorhaben"><input type="checkbox" data-vorhaben="${wegId}" data-partei="${id}" ${i === 0 ? 'checked' : ''}> ${weg(wegId).name} <small>(${weg(wegId).bereich.name}, ${ausrichtungName(weg(wegId))})</small></label>`).join('')}</fieldset>`).join('')}`, { titel: 'Koalitionsvertrag: Vorhaben der Partner' }) : ''}
    <p>${kanzleramt.name}: ${partei(zustand.kanzlerParteiId).name}. Verteile die ${ministerien.length} Ministerien${mitVertrag ? ' (wird Teil des Vertrags)' : ''}.</p>
    ${karte(`
      <p id="stand" class="zahl"></p>
      <div class="ministerien">
        ${ministerien.map((m) => `<label class="ministerium"><span title="${m.name}">${m.kurz}</span><select data-ministerium="${m.id}">${optionen(start[m.id])}</select></label>`).join('')}
      </div>
      <ul id="fehler" class="fehler"></ul>
      <div class="knoepfe"><button id="bestaetigen" class="primaer">${mitVertrag ? 'Vertrag unterzeichnen und Kabinett vereidigen' : 'Kabinett vereidigen'}</button></div>`)}
  </div>`;

  const verteilung = () => Object.fromEntries([...el.querySelectorAll('[data-ministerium]')].map((s) => [s.dataset.ministerium, s.value]));
  const vorhaben = () => [...el.querySelectorAll('[data-vorhaben]:checked')].map((c) => ({ wegId: c.dataset.vorhaben, partei: c.dataset.partei }));
  const aktualisieren = () => {
    const v = verteilung();
    el.querySelector('#stand').textContent = koalition
      .map((id) => `${partei(id).name}: ${Object.values(v).filter((x) => x === id).length} von ${zustand.kabinett.anspruch[id]}`)
      .join(' · ');
    const fehler = [...pruefeVerteilung(zustand, v), ...(mitVertrag ? vertragPruefen(zustand, vorschlaege, vorhaben()) : [])];
    el.querySelector('#fehler').innerHTML = fehler.map((f) => `<li>✗ ${f}</li>`).join('');
    el.querySelector('#bestaetigen').disabled = fehler.length > 0;
  };
  el.querySelectorAll('select, [data-vorhaben]').forEach((s) => s.addEventListener('change', aktualisieren));
  el.querySelector('#bestaetigen').addEventListener('click', () => onBestaetigen({ verteilung: verteilung(), ...(mitVertrag ? { vorhaben: vorhaben() } : {}) }));
  aktualisieren();
}
