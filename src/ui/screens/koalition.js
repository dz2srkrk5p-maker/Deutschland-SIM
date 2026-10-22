import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { bundestagSvg } from '../components/bundestag.js';
import { mehrheit, chance, moeglichePartner, moeglicheKoalitionen, minderheitMoeglich, minderheitsKanzlerwahl } from '../../engine/koalition.js';
import { abstimmungHtml } from '../components/abstimmung.js';
import { protokollHtml } from '../components/protokoll.js';

// Wahlergebnis und Koalitionsbildung.
export function koalitionScreen(el, zustand, protokoll, { onVerhandeln, onMinderheit }) {
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

  const koalitionen = moeglicheKoalitionen(zustand);
  const punkt = (p) => `<span class="punkt" style="background:${p.farbe}"></span>`;
  const kombi = (k, i) => {
    const mit = k.partner.map((id) => parteien.find((p) => p.id === id));
    const titel = mit.length ? [spieler, ...mit].map((p) => p.name).join(', ') : 'Allein regieren';
    return `<div class="kombi">
      <span>${[spieler, ...mit].map(punkt).join('')} ${titel}</span>
      <span>${k.sitze} Sitze</span>
      <span>Chance ${Math.round(k.chance * 100)} %</span>
      <button data-kombi="${i}" aria-label="${titel} auswählen">Auswählen</button>
    </div>`;
  };

  // Wahlabend: Stimmen, Veränderung zur vorigen Wahl (bei der ersten: 2025), Sitze
  const w = zustand.wahlergebnis;
  const zahl = (x) => x.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const plusMinus = (x) => (Math.round(x * 100) === 0 ? '±0,00' : (x > 0 ? '+' : '−') + zahl(Math.abs(x)));
  const wahlabend = `
    <h2>Wahlergebnis</h2>
    <p>Euer Wahlkampf: <strong>${plusMinus(w.wahlkampf)} Punkte</strong> <small>(Umfrage am Ende von Woche ${config.wahlkampf.wochen} minus vor Woche 1, mit Schwankung)</small></p>
    <table class="wahlergebnis">
      <thead><tr><th scope="col">Partei</th><th scope="col">Stimmen</th><th scope="col">±</th><th scope="col">Sitze</th></tr></thead>
      <tbody>${parteien.map((p) => `
        <tr${p.id === spieler.id ? ' class="eigene"' : ''}><th scope="row">${punkt(p)}${p.name}</th><td>${zahl(w.anteile[p.id])} %</td><td>${plusMinus(w.anteile[p.id] - w.vorher[p.id])}</td><td>${zustand.sitze[p.id] ?? '–'}</td></tr>`).join('')}
      </tbody>
    </table>`;

  // Minderheitsregierung (F11): nur die stärkste Fraktion, Kanzlerwahl im letzten Wahlgang nach der Abstimmungsregel
  const staerkste = eigene >= Math.max(...Object.values(zustand.sitze));
  const mk = config.minderheit;
  const minderheit = `
    <h2>Minderheitsregierung</h2>
    ${staerkste ? `
      <p>${spieler.name} regiert allein ohne eigene Mehrheit und besetzt alle Ministerien. Jeder Haushalt braucht im Bundestag mehr Ja- als Nein-Stimmen; gegenüber einer Minderheitsregierung stimmt die Opposition strenger ab (direkte Nachbarn enthalten sich, alle anderen stimmen mit Nein).
      Fällt er durch, gilt der Vorjahreshaushalt weiter und ${spieler.name} verliert ${mk.umfrageVerlustHaushaltGescheitert.toLocaleString('de-DE')} Punkte; nach ${mk.fehlschlaegeBisSpielende} gescheiterten Haushalten in einer Wahlperiode ist die Regierung am Ende und das Spiel verloren.</p>
      ${config.koalition.brandmauer.includes(spieler.id) ? `<p class="rot">Brandmauer: Keine andere Fraktion stimmt für euch. Nur einzelne Abgeordnete einer benachbarten Fraktion weichen sehr selten ab
      (${(config.bundestag.brandmauerAbweichler * 100).toLocaleString('de-DE')} % je Abgeordnetem). Scheitert die Kanzlerwahl, ist das Spiel vorbei.</p>` : ''}
      ${abstimmungHtml(minderheitsKanzlerwahl(zustand), 'Kanzlerwahl im letzten Wahlgang', false)}
      <div class="knoepfe"><button id="minderheit" ${minderheitMoeglich(zustand) ? '' : 'disabled'}>${minderheitsKanzlerwahl(zustand).angenommen ? 'Als Minderheitsregierung antreten' : 'Kanzlerwahl trotzdem versuchen'}</button></div>`
    : `<p>Nur die stärkste Fraktion kann eine Minderheitsregierung bilden.</p>`}`;

  el.innerHTML = `
    <h1>Regierungsbildung</h1>
    ${hinweisHtml('koalition')}
    ${wahlabend}
    <p>${spieler.name} hat <strong>${eigene} Sitze</strong>. Für eine Mehrheit braucht es <strong>${noetig}</strong>.</p>
    ${bundestagSvg(zustand.sitze, parteien)}
    <h2>Mögliche Mehrheiten</h2>
    <div class="kombiliste">${koalitionen.map(kombi).join('') || '<p>Keine Koalition mit Mehrheit mehr möglich.</p>'}</div>
    <h2>Partner wählen</h2>
    <div class="partnerliste">${andere.map(zeile).join('')}</div>
    <p id="summe"></p>
    <div class="knoepfe"><button id="verhandeln">Verhandeln</button></div>
    ${minderheit}
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
  // setzt nur die Häkchen; verhandelt wird erst mit dem Knopf
  el.querySelectorAll('[data-kombi]').forEach((b) =>
    b.addEventListener('click', () => {
      const { partner } = koalitionen[Number(b.dataset.kombi)];
      el.querySelectorAll('input').forEach((i) => (i.checked = partner.includes(i.value)));
      aktualisieren();
    }),
  );
  knopf.addEventListener('click', () => onVerhandeln({ partner: gewaehlt() }));
  el.querySelector('#minderheit')?.addEventListener('click', () => onMinderheit());
  aktualisieren();
}
