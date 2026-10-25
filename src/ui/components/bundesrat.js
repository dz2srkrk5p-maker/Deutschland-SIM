// Bundesrat: Länder, Landesregierung, Stimmen und Haltung bei Steueränderungen (Haushalt und Parlament).
import { parteien } from '../../data/parteien.js';
import { andereParteien } from '../../data/laender.js';
import { punkt, status } from './basis.js';

const info = (id) => parteien.find((p) => p.id === id) ?? andereParteien[id];

export function bundesratHtml(abstimmung) {
  return `
    <p>${status(abstimmung.mehrheit ? 'ok' : 'rot', `${abstimmung.ja} von ${abstimmung.noetig} nötigen Stimmen`)} für Steueränderungen. Ein Land stimmt zu, wenn alle seine Regierungsparteien in der Bundesregierung sind.</p>
    ${abstimmung.laender.map((l) => `
      <div class="land">
        <span>${l.name}${l.geschaeftsfuehrend ? ' <small>(geschäftsführend)</small>' : ''}${l.wahl ? ` <small>· Wahl ${l.wahl.jahr}</small>` : ''}</span>
        <span>${l.regierung.map((id) => punkt(info(id).farbe, info(id).name)).join('')}<small>${l.regierung.map((id) => info(id).name).join(', ')}</small></span>
        <span class="zahl">${l.bundesratStimmen}</span>
        <span>${l.stimmtZu ? status('ok', 'Ja') : '<span class="klein">Enthaltung</span>'}</span>
      </div>`).join('')}`;
}
