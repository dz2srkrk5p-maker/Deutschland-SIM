// Großprojekte (Epochen-Etappe 7, docs/epochen-spec.md), ab Stufe 3 (config.spielstufen: grossprojekte).
// Manche Ansätze starten ein Großprojekt (src/data/grossprojekte.js, startDurch): Das Gesetz wirkt wie immer, das Projekt läuft
// daneben über mehrere Legislaturen, kostet jedes Jahr Baukosten im Bundeshaushalt und bringt mit jedem Meilenstein dauerhaft mehr
// Wirkung. Nach einem Meilenstein kann der nächste Abschnitt teurer werden; liegt ein Projekt 30 % über Plan, fordert die
// Opposition einen Untersuchungsausschuss. Höchstens zwei laufen gleichzeitig. Übernimmt eine neue Regierung ein Projekt einer
// anderen, entscheidet sie: weiterführen, umbauen (ein Viertel billiger, ein Jahr später) oder stoppen.
import { config } from '../data/config.js';
import { grossprojekte as daten } from '../data/grossprojekte.js';
import { parteien } from '../data/parteien.js';
import { zufall } from './rng.js';
import { systemAn } from './spielstufe.js';
import { umverteilen, runden } from './wahlkampf.js';
import { mitVerlauf } from './state.js';
import { umfrageBuchen } from './umfragebilanz.js';

const gc = config.grossprojekte;
const r3 = (x) => Math.round(x * 1000) / 1000 + 0;
const jetztVon = (z) => z.jahr * 12 + z.monat - 1;
export const projektDaten = (id) => daten.find((g) => g.id === id);
const name = (id) => parteien.find((p) => p.id === id).name;

export const laufende = (zustand) => (zustand.grossprojekte ?? []).filter((p) => p.status === 'laufend');
// Monat (seit Start), in dem der nächste Meilenstein fällig ist, oder null
export const naechsterMeilenstein = (p) => {
  const m = projektDaten(p.id).meilensteine[p.erreicht];
  return m ? m.monate + p.verzoegerung : null;
};

// Start beim Beschluss bzw. Start des Ansatzes (aufgerufen von reformwege.js und probleme.js)
export function projektStarten(zustand, ansatzId) {
  const d = daten.find((g) => g.startDurch === ansatzId);
  if (!d || !systemAn(zustand, 'grossprojekte')) return { state: zustand, ereignisse: [] };
  if ((zustand.grossprojekte ?? []).some((p) => p.id === d.id)) return { state: zustand, ereignisse: [] };
  if (laufende(zustand).length >= gc.max) return { state: zustand, ereignisse: [`Das Großprojekt „${d.name}“ startet nicht: Es laufen schon ${gc.max} Großprojekte.`] };
  const p = { id: d.id, start: jetztVon(zustand), status: 'laufend', erreicht: 0, kostenFaktor: 1, verzoegerung: 0, traeger: zustand.kanzlerParteiId, ausschuss: false, uebernahme: null };
  return {
    state: { ...zustand, grossprojekte: [...(zustand.grossprojekte ?? []), p] },
    ereignisse: [`Großprojekt gestartet: „${d.name}“ (${d.meilensteine.length} Meilensteine, Baukosten ${(d.baukostenJeJahr / 1e6).toLocaleString('de-DE')} Mrd. € je Jahr)`],
  };
}

// Baukosten laufender Projekte für den Bundeshaushalt (tausend €/Jahr)
export const baukosten = (zustand) => laufende(zustand).reduce((s, p) => s + Math.round(projektDaten(p.id).baukostenJeJahr * p.kostenFaktor), 0);

// Dauerhafte Wirkung erreichter Meilensteine als Trend je Monat (für die Problem-Engine)
export const projektTrends = (zustand, problemId) => (zustand.grossprojekte ?? []).flatMap((p) => {
  const summe = projektDaten(p.id).meilensteine.slice(0, p.erreicht).reduce((s, m) => s + (m.wirkung.probleme?.[problemId] ?? 0), 0);
  return summe ? [{ text: `Großprojekt „${projektDaten(p.id).name}“ (${p.erreicht} Meilensteine)`, beitrag: r3(summe) }] : [];
});

// Am Monatsanfang (jetzt): Meilensteine, Kostensteigerung, Untersuchungsausschuss, Abschluss
export function grossprojekteMonat(zustand, jetzt) {
  if (!(zustand.grossprojekte ?? []).length) return { state: zustand, ereignisse: [] };
  const ereignisse = [];
  let rngZustand = zustand.rngZustand;
  let z = zustand;
  const liste = zustand.grossprojekte.map((alt) => {
    let p = alt;
    const d = projektDaten(p.id);
    while (p.status === 'laufend' && naechsterMeilenstein(p) !== null && jetzt - p.start >= naechsterMeilenstein(p)) {
      const m = d.meilensteine[p.erreicht];
      p = { ...p, erreicht: p.erreicht + 1 };
      ereignisse.push(`Großprojekt „${d.name}“: Meilenstein erreicht – ${m.name}`);
      if (p.erreicht >= d.meilensteine.length) {
        p = { ...p, status: 'fertig' };
        ereignisse.push(`Großprojekt „${d.name}“ ist fertig. Die Baukosten enden, die Wirkung bleibt.`);
        break;
      }
      const w = zufall(rngZustand);
      rngZustand = w.rngZustand;
      if (w.wert < gc.kostensteigerungChance) {
        p = { ...p, kostenFaktor: r3(p.kostenFaktor * (1 + gc.kostensteigerung)) };
        ereignisse.push(`Großprojekt „${d.name}“: Der nächste Abschnitt wird teurer (jetzt ${Math.round((p.kostenFaktor - 1) * 100)} % über Plan).`);
      }
      if (!p.ausschuss && p.kostenFaktor - 1 >= gc.untersuchungAbUeberPlan - 1e-9) {
        p = { ...p, ausschuss: true };
        ereignisse.push(`Großprojekt „${d.name}“ liegt ${Math.round((p.kostenFaktor - 1) * 100)} % über Plan: Die Opposition setzt einen Untersuchungsausschuss durch.`);
        const k = z.kanzlerParteiId;
        if (k) {
          z = umfrageBuchen(z, mitVerlauf({ ...z, kapital: z.phase === 'regierung' ? Math.max(0, z.kapital - gc.ausschussKapital) : z.kapital, anteile: runden(umverteilen(z.anteile, { [k]: -gc.ausschussUmfrage })) }),
            [{ ursache: `Untersuchungsausschuss „${d.name}“`, partei: k, wert: -gc.ausschussUmfrage }]);
        }
      }
    }
    return p;
  });
  return { state: { ...z, rngZustand, grossprojekte: liste }, ereignisse };
}

// Neue eigene Regierung: laufende Projekte einer anderen Regierung warten auf die Übernahme-Entscheidung
export function uebernahmenAnlegen(zustand) {
  const liste = (zustand.grossprojekte ?? []).map((p) => (p.status === 'laufend' && p.traeger !== zustand.kanzlerParteiId ? { ...p, uebernahme: 'offen' } : p));
  return { ...zustand, grossprojekte: liste };
}

// Aktion: Übernahme entscheiden – weiterführen, umbauen (ein Viertel billiger, ein Jahr später) oder stoppen
export function projektEntscheiden(zustand, { projektId, wahl }) {
  if (zustand.phase !== 'regierung') throw new Error('Nur die eigene Regierung entscheidet');
  const p = (zustand.grossprojekte ?? []).find((x) => x.id === projektId);
  if (!p || p.uebernahme !== 'offen') throw new Error('Keine offene Übernahme-Entscheidung');
  const d = projektDaten(projektId);
  const neu = {
    weiterfuehren: { ...p, uebernahme: null, traeger: zustand.kanzlerParteiId },
    umbauen: { ...p, uebernahme: null, traeger: zustand.kanzlerParteiId, kostenFaktor: r3(p.kostenFaktor * gc.umbauKostenFaktor), verzoegerung: p.verzoegerung + gc.umbauVerzoegerungMonate },
    stoppen: { ...p, uebernahme: null, status: 'gestoppt' },
  }[wahl];
  if (!neu) throw new Error('Unbekannte Entscheidung');
  const text = { weiterfuehren: 'wird weitergeführt', umbauen: 'wird umgebaut: ein Viertel billiger, ein Jahr später', stoppen: 'wird gestoppt; erreichte Meilensteine wirken weiter' }[wahl];
  return {
    state: { ...zustand, grossprojekte: zustand.grossprojekte.map((x) => (x.id === projektId ? neu : x)) },
    ereignisse: [`Großprojekt „${d.name}“ (begonnen von ${name(p.traeger)}) ${text}.`],
  };
}
