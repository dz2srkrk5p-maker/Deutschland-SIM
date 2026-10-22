import { config } from '../data/config.js';
import { parteien } from '../data/parteien.js';
import { probleme, reformen } from '../data/probleme.js';
import { umverteilen, runden } from './wahlkampf.js';
import { abstimmung, abstimmen } from './bundestag.js';
import { mitVerlauf } from './state.js';

const rf = config.reformen;
const reform = (id) => reformen.find((r) => r.id === id);
const problem = (id) => probleme.find((p) => p.id === id);
const name = (id) => parteien.find((p) => p.id === id).name;

// Laufende Kosten aller beschlossenen Reformen je Haushaltsjahr (tausend Euro)
export const reformKosten = (zustand) => zustand.reformen.reduce((s, id) => s + reform(id).kosten, 0);

// Warum eine Reform gerade nicht eingebracht werden kann, oder null
export function sperrgrund(zustand, id) {
  const r = reform(id);
  if (!r) return 'unbekannt';
  if (zustand.reformen.includes(id)) return 'beschlossen';
  if (r.braucht && !zustand.reformen.includes(r.braucht)) return `erst „${reform(r.braucht).name}“`;
  if (zustand.reformImQuartal) return 'nur eine Reform je Quartal';
  return null;
}

// Vorschau ohne Zufall: Kosten, Abstimmung, Druck danach, Umfragegewinn der Ministeriumspartei
export function reformVorschau(zustand, id) {
  const r = reform(id);
  const partei = zustand.kabinett.verteilung[problem(r.problem).ministerium];
  const senkung = Math.min(r.druck, zustand.probleme[r.problem]);
  return {
    reform: r,
    partei,
    druckVorher: zustand.probleme[r.problem],
    druckNachher: zustand.probleme[r.problem] - senkung,
    gewinn: senkung * rf.gewinnJeDruckpunkt,
    abstimmung: abstimmung(zustand, 'reform'),
  };
}

// Aktion: Reform einbringen (F13). Der Bundestag stimmt ab; angenommen senkt sie den Druck sofort und kostet ab dem
// nächsten Haushalt jedes Jahr. Abgelehnt verbraucht sie nur die Reform dieses Quartals.
export function reformEinbringen(zustand, { reformId }) {
  if (zustand.phase !== 'regierung') throw new Error('Keine Regierung im Amt');
  if (zustand.quartal === config.regierung.quartaleJeJahr) throw new Error('Im Haushaltsquartal keine Reformen');
  if (zustand.offenesEreignis) throw new Error('Erst auf das Ereignis reagieren');
  const grund = sperrgrund(zustand, reformId);
  if (grund) throw new Error(`Reform nicht möglich: ${grund}`);
  const v = reformVorschau(zustand, reformId);
  const wahl = abstimmen(zustand, 'reform');
  const stimmen = `${wahl.ja} Ja, ${wahl.nein} Nein${wahl.abweichler ? `, davon ${wahl.abweichler} Abweichler` : ''}`;
  if (!wahl.angenommen) {
    return {
      state: { ...zustand, rngZustand: wahl.rngZustand, reformImQuartal: true },
      ereignisse: [`Reform „${v.reform.name}“ im Bundestag abgelehnt (${stimmen})`],
    };
  }
  const anteile = runden(umverteilen(zustand.anteile, { [v.partei]: v.gewinn }));
  const state = mitVerlauf({
    ...zustand,
    rngZustand: wahl.rngZustand,
    anteile,
    probleme: { ...zustand.probleme, [v.reform.problem]: v.druckNachher },
    reformen: [...zustand.reformen, reformId],
    reformImQuartal: true,
  });
  const gewinn = v.gewinn.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  return {
    state,
    ereignisse: [`Reform „${v.reform.name}“ beschlossen (${stimmen}): ${problem(v.reform.problem).name} Druck ${v.druckVorher} → ${v.druckNachher}, ${name(v.partei)} +${gewinn}`],
  };
}

// Am Ende eines Quartals: Druck steigt, Probleme über der Schwelle kosten die Kanzlerpartei Umfragepunkte.
export function druckSteigt(zustand) {
  const neu = Object.fromEntries(Object.entries(zustand.probleme).map(([id, d]) => [id, Math.min(rf.druckMax, d + rf.druckAnstiegJeQuartal)]));
  const brennend = probleme.filter((p) => neu[p.id] >= rf.druckSchwelle);
  const basis = { ...zustand, probleme: neu, reformImQuartal: false };
  if (!brennend.length) return { state: basis, ereignisse: [] };
  const verlust = brennend.length * rf.verlustJeQuartal;
  const anteile = runden(umverteilen(zustand.anteile, { [zustand.kanzlerParteiId]: -verlust }));
  return {
    state: mitVerlauf({ ...basis, anteile }),
    ereignisse: [`Ungelöste Probleme (${brennend.map((p) => p.name).join(', ')}): ${name(zustand.kanzlerParteiId)} −${verlust.toLocaleString('de-DE', { maximumFractionDigits: 2 })}`],
  };
}
