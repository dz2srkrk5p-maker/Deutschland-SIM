import { laender, bundesratMehrheit } from '../data/laender.js';
import { config } from '../data/config.js';

// Abstimmung im Bundesrat: Ein Land stimmt zu, wenn alle seine Regierungsparteien in der Bundeskoalition sind;
// sonst enthält es sich (zählt wie Nein). Ohne Zufall. stand: Landesregierungen aus dem Spielstand (Landtagswahlen,
// Feature 5); ohne stand gelten die Daten aus laender.js.
export function bundesratAbstimmung(koalitionsParteien, stand = null) {
  const stimmen = laender.map((l) => ({ ...l, ...(stand?.[l.id] ?? {}) }))
    .map((land) => ({ ...land, stimmtZu: land.regierung.every((id) => koalitionsParteien.includes(id)) }));
  const ja = stimmen.filter((l) => l.stimmtZu).reduce((s, l) => s + l.bundesratStimmen, 0);
  return { laender: stimmen, ja, noetig: bundesratMehrheit, mehrheit: ja >= bundesratMehrheit };
}

// Kompromiss im Bundesrat (Feature 6): möglich, wenn höchstens config.kompromiss.maxFehlend Stimmen fehlen
export const kompromissMoeglich = (abstimmung) => !abstimmung.mehrheit && abstimmung.noetig - abstimmung.ja <= config.kompromiss.maxFehlend;
