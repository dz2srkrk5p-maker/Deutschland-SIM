import { parteien } from '../../data/parteien.js';
import { ministerien, kanzleramt } from '../../data/ministerien.js';
import { mehrheit } from '../../engine/koalition.js';
import { koalitionsParteien } from '../../engine/kabinett.js';
import { bundesratAbstimmung } from '../../engine/bundesrat.js';
import { bundestagSvg } from '../components/bundestag.js';
import { bundesratHtml } from '../components/bundesrat.js';
import { koalitionslageHtml } from '../components/koalitionslage.js';
import { karte, tabs, punkt, badge } from '../components/basis.js';

const partei = (id) => parteien.find((p) => p.id === id);
const TABS = [
  { id: 'bundestag', text: 'Bundestag' },
  { id: 'koalition', text: 'Koalition' },
  { id: 'bundesrat', text: 'Bundesrat' },
];

// Parlament (nur Nachschlagen): Sitze, Koalition mit Kabinett, Bundesrat.
export function parlamentScreen(el, zustand, { tab, onTab }) {
  const regierung = koalitionsParteien(zustand);
  const art = zustand.koalition.minderheit ? 'Minderheitsregierung' : zustand.koalition.partner.length ? 'Koalition' : 'Alleinregierung';
  const inhalt = {
    bundestag: () => karte(`${bundestagSvg(zustand.sitze, parteien)}
      <table><thead><tr><th scope="col">Fraktion</th><th scope="col">Sitze</th><th scope="col">Rolle</th></tr></thead><tbody>
      ${parteien.filter((p) => zustand.sitze[p.id] > 0).map((p) => `<tr><th scope="row">${punkt(p.farbe)}${p.name}</th><td>${zustand.sitze[p.id]}</td><td>${regierung.includes(p.id) ? badge('Regierung', 'ok') : 'Opposition'}</td></tr>`).join('')}
      </tbody></table><p class="klein">Mehrheit ab ${mehrheit(zustand.sitze)} Sitzen.</p>`, { titel: 'Sitze' }),
    koalition: () => karte(`<p><strong>${art}:</strong> ${regierung.map((id) => `${punkt(partei(id).farbe)}${partei(id).name}`).join(', ')}</p>${koalitionslageHtml(zustand)}`, { titel: 'Regierung' })
      + karte(`<table><thead><tr><th scope="col">Ressort</th><th scope="col">Partei</th></tr></thead><tbody>
        <tr><th scope="row">${kanzleramt.kurz}</th><td>${partei(zustand.kanzlerParteiId).name}</td></tr>
        ${ministerien.map((m) => `<tr><th scope="row" title="${m.name}">${m.kurz}</th><td>${punkt(partei(zustand.kabinett.verteilung[m.id]).farbe)}${partei(zustand.kabinett.verteilung[m.id]).name}</td></tr>`).join('')}
      </tbody></table>`, { titel: 'Kabinett' }),
    bundesrat: () => karte(bundesratHtml(bundesratAbstimmung(regierung)), { titel: 'Länder' }),
  }[tab];
  el.innerHTML = `<div class="ansicht"><h1>Parlament</h1>${tabs(TABS, tab, 'Parlament')}${inhalt()}</div>`;
  el.querySelectorAll('[data-tab]').forEach((t) => t.addEventListener('click', () => onTab(t.dataset.tab)));
}
