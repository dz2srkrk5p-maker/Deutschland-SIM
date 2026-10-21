import { laender, bundesratMehrheit } from '../data/laender.js';

// Abstimmung im Bundesrat: Ein Land stimmt zu, wenn alle seine Regierungsparteien in der Bundeskoalition sind;
// sonst enthält es sich (zählt wie Nein). Ohne Zufall.
export function bundesratAbstimmung(koalitionsParteien) {
  const stimmen = laender.map((land) => ({ ...land, stimmtZu: land.regierung.every((id) => koalitionsParteien.includes(id)) }));
  const ja = stimmen.filter((l) => l.stimmtZu).reduce((s, l) => s + l.bundesratStimmen, 0);
  return { laender: stimmen, ja, noetig: bundesratMehrheit, mehrheit: ja >= bundesratMehrheit };
}
