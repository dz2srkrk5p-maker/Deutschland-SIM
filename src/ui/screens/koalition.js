import { parteien } from '../../data/parteien.js';
import { bundestagSvg } from '../components/bundestag.js';
import { mehrheit, chance, moeglichePartner } from '../../engine/koalition.js';
import { protokollHtml } from '../components/protokoll.js';

// Wahlergebnis und Koalitionsbildung.
export function koalitionScreen(el, zustand, protokoll, { onVerhandeln }) {
  const spieler = parteien.find((p) => p.id === zustand.spielerParteiId);
  const eigene = zustand.sitze[spieler.id] ?? 0;
  const noetig = mehrheit(zustand.sitze);
  const moeglich = moeglichePartner(zustand);
  const andere = parteien.filter((p) => p.id !== spieler.id && zustand.sitze[p.id] > 0);

  const zeile = (p) => {
    const frei = moeglich.includes(p.id);
    const grund = zustand.abgelehnt.includes(p.id) ? 'hat abgelehnt' : chance(spieler.id, p.id) === 0 ? 'Brandmauer' : '';
    return `<label class="partner${frei ? '' : ' gesperrt'}">
      <input type="checkbox" value="${p.id}" ${frei ? '' : 'disabled'}>
      <span><span class="punkt" style="background:${p.farbe}"></span>${p.name}</span>
      <span>${zustand.sitze[p.id]} Sitze</span>
      <span>${frei ? `Chance ${Math.round(chance(spieler.id, p.id, zustand.sitze) * 100)} %` : grund}</span>
    </label>`;
  };

  el.innerHTML = `
    <h1>Regierungsbildung</h1>
    <p>${spieler.name} hat <strong>${eigene} Sitze</strong>. Für eine Mehrheit braucht es <strong>${noetig}</strong>.</p>
    ${bundestagSvg(zustand.sitze, parteien)}
    <h2>Partner wählen</h2>
    <div class="partnerliste">${andere.map(zeile).join('')}</div>
    <p id="summe"></p>
    <div class="knoepfe"><button id="verhandeln">Verhandeln</button></div>
    ${protokollHtml(protokoll)}`;

  const knopf = el.querySelector('#verhandeln');
  const gewaehlt = () => [...el.querySelectorAll('input:checked')].map((i) => i.value);
  const aktualisieren = () => {
    const summe = eigene + gewaehlt().reduce((s, id) => s + zustand.sitze[id], 0);
    el.querySelector('#summe').textContent = `Zusammen: ${summe} von ${noetig} Sitzen`;
    knopf.disabled = summe < noetig;
    knopf.textContent = gewaehlt().length ? 'Verhandeln' : 'Allein regieren';
  };
  el.querySelectorAll('input').forEach((i) => i.addEventListener('change', aktualisieren));
  knopf.addEventListener('click', () => onVerhandeln({ partner: gewaehlt() }));
  aktualisieren();
}
