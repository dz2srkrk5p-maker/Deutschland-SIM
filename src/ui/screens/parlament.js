import { parteien } from '../../data/parteien.js';
import { ministerien, kanzleramt } from '../../data/ministerien.js';
import { mehrheit } from '../../engine/koalition.js';
import { koalitionsParteien } from '../../engine/kabinett.js';
import { bundesratAbstimmung } from '../../engine/bundesrat.js';
import { bundestagSvg } from '../components/bundestag.js';
import { bundesratHtml } from '../components/bundesrat.js';
import { koalitionslageHtml } from '../components/koalitionslage.js';
import { karte, tabs, punkt, badge, status } from '../components/basis.js';
import { akteure } from '../../data/reformwege.js';
import { richtungsprofil } from '../../engine/reformwege.js';
import { abstand } from '../../engine/profil.js';
import { profilHtml } from '../components/profil.js';

const partei = (id) => parteien.find((p) => p.id === id);
const TABS = [
  { id: 'bundestag', text: 'Bundestag' },
  { id: 'koalition', text: 'Koalition' },
  { id: 'bundesrat', text: 'Bundesrat' },
  { id: 'akteure', text: 'Verbände und EU' },
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
    bundesrat: () => karte(bundesratHtml(bundesratAbstimmung(regierung, zustand.laender)), { titel: 'Länder' }),
    // Haltung der Akteure zum Kurs des Landes (System 1): 2 − 2 × Abstand zum Richtungsprofil
    akteure: () => {
      const p = richtungsprofil(zustand);
      return karte(`${profilHtml(p)}<table><thead><tr><th scope="col">Akteur</th><th scope="col">Haltung zum Kurs</th></tr></thead><tbody>${akteure.map((a) => {
        // ohne beschlossene Wege gibt es noch keinen Kurs, den man bewerten könnte
        const h = Object.keys(zustand.reformwege).length ? Math.max(-2, Math.min(2, 2 - 2 * abstand(a.vektor, p))) : 0;
        return `<tr><th scope="row">${a.name}</th><td>${h >= 0.5 ? status('ok', 'zufrieden') : h <= -0.5 ? status('rot', 'unzufrieden') : '<span class="klein">abwartend</span>'}</td></tr>`;
      }).join('')}</tbody></table><p class="klein">Zu jedem einzelnen Reformweg steht die Reaktion im Wegevergleich unter Reformen.</p>`, { titel: 'Verbände und EU' });
    },
  }[tab];
  el.innerHTML = `<div class="ansicht"><h1>Parlament</h1>${tabs(TABS, tab, 'Parlament')}${inhalt()}</div>`;
  el.querySelectorAll('[data-tab]').forEach((t) => t.addEventListener('click', () => onTab(t.dataset.tab)));
}
