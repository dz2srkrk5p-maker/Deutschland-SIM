import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { bundestagSvg } from '../components/bundestag.js';
import { mehrheit, chance, moeglichePartner, moeglicheKoalitionen, minderheitMoeglich, minderheitsKanzlerwahl } from '../../engine/koalition.js';
import { abstimmungHtml } from '../components/abstimmung.js';
import { karte, aufklapp, punkt, zahl, leer } from '../components/basis.js';
import { schritteHtml } from '../shell.js';

// Regierungsbildung: mögliche Mehrheiten zuerst (direkt verhandeln), eigene Partnerwahl und Minderheitsregierung aufklappbar.
export function koalitionScreen(el, zustand, { onVerhandeln, onMinderheit, onWahlabend }) {
  const spieler = parteien.find((p) => p.id === zustand.spielerParteiId);
  const eigene = zustand.sitze[spieler.id] ?? 0;
  const noetig = mehrheit(zustand.sitze);
  const moeglich = moeglichePartner(zustand);
  const andere = parteien.filter((p) => p.id !== spieler.id && zustand.sitze[p.id] > 0);
  const koalitionen = moeglicheKoalitionen(zustand);

  const kombi = (k, i) => {
    const mit = k.partner.map((id) => parteien.find((p) => p.id === id));
    const titel = mit.length ? [spieler, ...mit].map((p) => p.name).join(', ') : 'Alleinregierung';
    return `<div class="kombi">
      <span>${[spieler, ...mit].map((p) => punkt(p.farbe)).join('')} ${titel}</span>
      <span>${k.sitze} Sitze</span>
      <span>Chance ${Math.round(k.chance * 100)} %</span>
      <button data-kombi="${i}" class="${i === 0 ? 'primaer' : ''}" aria-label="${titel}: ${mit.length ? 'verhandeln' : 'bilden'}">${mit.length ? 'Verhandeln' : 'Bilden'}</button>
    </div>`;
  };

  const zeile = (p) => {
    const frei = moeglich.includes(p.id);
    const grund = zustand.abgelehnt.includes(p.id) ? 'hat abgelehnt' : chance(spieler.id, p.id) === 0 ? 'Brandmauer' : '';
    return `<label class="partner${frei ? '' : ' gesperrt'}">
      <input type="checkbox" value="${p.id}" ${frei ? '' : 'disabled'}>
      <span>${punkt(p.farbe)}${p.name}</span>
      <span>${zustand.sitze[p.id]} Sitze</span>
      <span>${frei ? `Chance ${Math.round(chance(spieler.id, p.id, zustand.sitze) * 100)} %` : grund}</span>
    </label>`;
  };

  // Minderheitsregierung (F11): nur die stärkste Fraktion, Kanzlerwahl im letzten Wahlgang nach der Abstimmungsregel
  const staerkste = eigene >= Math.max(...Object.values(zustand.sitze));
  const mk = config.minderheit;
  const kanzlerwahl = minderheitsKanzlerwahl(zustand);
  const minderheit = staerkste ? `
    <ul>
      <li>${spieler.name} regiert ohne eigene Mehrheit und besetzt alle Ministerien.</li>
      <li>Jeder Haushalt und jede Reform braucht mehr Ja- als Nein-Stimmen. Die Opposition stimmt strenger ab: direkte Nachbarn enthalten sich, alle anderen stimmen mit Nein.</li>
      <li>Scheitert ein Haushalt, gilt der des Vorjahres weiter und ${spieler.name} verliert ${zahl(mk.umfrageVerlustHaushaltGescheitert, 1)} Punkte. Nach ${mk.fehlschlaegeBisNeuwahl} gescheiterten Haushalten in einer Wahlperiode ist das Spiel verloren.</li>
      ${config.koalition.brandmauer.includes(spieler.id) ? `<li class="rot">⚠ Brandmauer: Keine andere Fraktion stimmt für euch, nur sehr selten einzelne Abweichler (${zahl(config.bundestag.brandmauerAbweichler * 100, 1)} % je Abgeordnetem). Scheitert die Kanzlerwahl, ist das Spiel vorbei.</li>` : ''}
    </ul>
    ${abstimmungHtml(kanzlerwahl, 'Kanzlerwahl im letzten Wahlgang', true)}
    <div class="knoepfe"><button id="minderheit" ${minderheitMoeglich(zustand) ? '' : 'disabled'}>${kanzlerwahl.angenommen ? 'Minderheitsregierung bilden' : 'Kanzlerwahl trotzdem versuchen'}</button></div>`
    : leer('Nur die stärkste Fraktion kann eine Minderheitsregierung bilden.');

  el.innerHTML = `<div class="ansicht">
    ${schritteHtml('koalition')}
    <h1>Regierungsbildung</h1>
    ${hinweisHtml('koalition')}
    <p>${punkt(spieler.farbe)}<strong>${spieler.name}: ${eigene} Sitze.</strong> Mehrheit ab <strong>${noetig}</strong> Sitzen.
      <button id="zum-wahlabend" class="klein">Wahlergebnis ansehen</button></p>
    ${karte(`<div class="kombiliste">${koalitionen.map(kombi).join('') || leer('Keine Koalition mit Mehrheit mehr möglich.')}</div>`, { titel: 'Mögliche Mehrheiten' })}
    ${karte(`
      ${aufklapp('Partner selbst wählen', `<div class="partnerliste">${andere.map(zeile).join('')}</div>
        <p id="summe" class="zahl"></p><div class="knoepfe"><button id="verhandeln">Verhandeln</button></div>`)}
      ${aufklapp('Minderheitsregierung', minderheit)}
      ${aufklapp('Sitze im Bundestag', bundestagSvg(zustand.sitze, parteien))}`)}
  </div>`;

  const knopf = el.querySelector('#verhandeln');
  const gewaehlt = () => [...el.querySelectorAll('.partnerliste input:checked')].map((i) => i.value);
  const aktualisieren = () => {
    const summe = eigene + gewaehlt().reduce((s, id) => s + zustand.sitze[id], 0);
    el.querySelector('#summe').textContent = `Zusammen: ${summe} von ${noetig} Sitzen`;
    knopf.disabled = summe < noetig;
    knopf.textContent = gewaehlt().length ? 'Verhandeln' : 'Alleinregierung bilden';
  };
  el.querySelectorAll('.partnerliste input').forEach((i) => i.addEventListener('change', aktualisieren));
  el.querySelectorAll('[data-kombi]').forEach((b) => b.addEventListener('click', () => onVerhandeln({ partner: koalitionen[Number(b.dataset.kombi)].partner })));
  knopf.addEventListener('click', () => onVerhandeln({ partner: gewaehlt() }));
  el.querySelector('#minderheit')?.addEventListener('click', () => onMinderheit());
  el.querySelector('#zum-wahlabend').addEventListener('click', onWahlabend);
  aktualisieren();
}
