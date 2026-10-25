import { test, expect } from 'vitest';
import { ministerien } from '../src/data/ministerien.js';
import { neuesSpiel } from '../src/engine/state.js';
import { wegBeschliessen, weg, wegRisiko } from '../src/engine/reformwege.js';
import { loesungStarten } from '../src/engine/probleme.js';
import { monatBeenden } from '../src/engine/regierung.js';
import { laufendeVorhaben } from '../src/engine/vorhaben.js';

const regierung = () => ({
  ...neuesSpiel('union', 1), phase: 'regierung', monat: 1, kanzlerParteiId: 'union', kapital: 100,
  sitze: { union: 209, afd: 152, spd: 120, gruene: 85, linke: 64 },
  koalition: { partner: ['spd'], startAnteile: { spd: 16.4 }, minderheit: false, fehlschlaege: 0 },
  kabinett: { anspruch: {}, verteilung: Object.fromEntries(ministerien.map((m) => [m.id, 'union'])) },
});

test('Zeitstrahl: Gesetz mit Bundestag, Bundesrat und Fortschritt der Umsetzung, Lösung mit Erfolgschance', () => {
  // Union+SPD fehlt die Bundesratsmehrheit: als Kompromiss beschließen
  let z = wegBeschliessen(regierung(), { wegId: 'st_einfach', kompromiss: true }).state;
  z = loesungStarten({ ...z, aktionenImMonat: 0 }, { loesungId: 'wohnen1' }).state;
  let liste = laufendeVorhaben(z);
  const g = liste.find((v) => v.id === 'st_einfach');
  expect(g).toMatchObject({ typ: 'gesetz', dauer: weg('st_einfach').dauer, vergangen: 0, rest: weg('st_einfach').dauer, risiko: wegRisiko(weg('st_einfach')) });
  expect(g.bundestag.ja).toBeGreaterThan(g.bundestag.nein);
  expect(g.bundesrat).toBe('kompromiss');
  expect(g.bundesratStimmen.ja).toBeLessThan(g.bundesratStimmen.noetig);
  expect(liste.find((v) => v.id === 'wohnen1')).toMatchObject({ typ: 'loesung', vergangen: 0 });
  // einen Monat später: ein Monat Umsetzung vergangen
  z = monatBeenden({ ...z, offenesEreignis: null }).state;
  liste = laufendeVorhaben(z);
  expect(liste.find((v) => v.id === 'st_einfach')).toMatchObject({ vergangen: 1, rest: weg('st_einfach').dauer - 1 });
});

test('Zeitstrahl: ältere Spielstände ohne Start und Stimmen funktionieren, fertige Vorhaben fehlen', () => {
  const z = { ...regierung(), runde: 2, reformwege: { st_einfach: { status: 'umsetzung', fertig: weg('st_einfach').dauer }, st_mitte: { status: 'beschlossen', fertig: 1 } } };
  const [g] = laufendeVorhaben(z);
  expect(g.id).toBe('st_einfach');
  expect(g.bundestag).toBeNull();
  expect(g.vergangen).toBe(2); // Start aus fertig − Dauer (= 0)
  expect(g.rest).toBe(weg('st_einfach').dauer - 2);
});
