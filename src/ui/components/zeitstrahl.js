// Zeitstrahl der laufenden Vorhaben (engine/vorhaben.js): je Gesetz Bundestag → Bundesrat → Umsetzung → Ergebnis,
// je Lösung Start → Umsetzung → Ergebnis. Zustand jedes Schritts mit Symbol und Text, nicht nur über Farbe.
import { laufendeVorhaben } from '../../engine/vorhaben.js';
import { badge } from './basis.js';

const prozent = (x) => `${Math.round(x * 100)} %`;
const quartale = (n) => `${n} ${n === 1 ? 'Quartal' : 'Quartalen'}`;
const schritt = (zustand, titel, text, symbol) => `<li class="${zustand}"><span class="marke" aria-hidden="true">${symbol}</span>
  <span class="schritt-titel">${titel}<span class="nur-screenreader"> (${{ erledigt: 'erledigt', aktiv: 'läuft', offen: 'offen', entfaellt: 'entfällt' }[zustand]})</span></span>
  <small>${text}</small></li>`;

function umsetzung(v) {
  const aktuell = Math.min(v.vergangen + 1, v.dauer);
  const segmente = Array.from({ length: v.dauer }, (_, i) => `<i class="${i < v.vergangen ? 'voll' : i === v.vergangen ? 'jetzt' : ''}"></i>`).join('');
  return `<li class="aktiv"><span class="marke" aria-hidden="true">●</span>
    <span class="schritt-titel">Umsetzung<span class="nur-screenreader"> (läuft)</span></span>
    <span class="segmente" role="img" aria-label="Quartal ${aktuell} von ${v.dauer}">${segmente}</span>
    <small>Quartal ${aktuell} von ${v.dauer}</small></li>`;
}

function gesetz(v) {
  const bt = v.bundestag ? `${v.bundestag.ja} Ja, ${v.bundestag.nein} Nein` : 'angenommen';
  const br = v.bundesrat === 'nicht nötig' ? schritt('entfaellt', 'Bundesrat', 'nicht zustimmungspflichtig', '–')
    : schritt('erledigt', 'Bundesrat', `${v.bundesrat === 'kompromiss' ? 'Kompromiss, Wirkung abgeschwächt' : 'zugestimmt'}${v.bundesratStimmen ? ` (${v.bundesratStimmen.ja} von ${v.bundesratStimmen.noetig})` : ''}`, '✓');
  return `<div class="vorhaben">
    <p class="vorhaben-kopf"><strong>${v.name}</strong> ${badge('Gesetz')} <small>${v.ausrichtung} · ${v.bereich}</small></p>
    <ol class="zeitstrahl">
      ${schritt('erledigt', 'Bundestag', bt, '✓')}
      ${br}
      ${umsetzung(v)}
      ${schritt('offen', 'Ergebnis', `am Ende in ${quartale(v.rest)} · Risiko des Scheiterns ${prozent(v.risiko)}${v.verfassung ? ', Klage möglich' : ''}`, '○')}
    </ol></div>`;
}

function loesung(v) {
  return `<div class="vorhaben">
    <p class="vorhaben-kopf"><strong>${v.name}</strong> ${badge('Lösung')} <small>gegen ${v.problem}</small></p>
    <ol class="zeitstrahl">
      ${schritt('erledigt', 'Gestartet', 'ohne Abstimmung (Regierungsprogramm)', '✓')}
      ${umsetzung(v)}
      ${schritt('offen', 'Ergebnis', `am Ende in ${quartale(v.rest)} · Erfolgschance ${prozent(v.chance)}`, '○')}
    </ol></div>`;
}

// leer: '' wenn nichts läuft (die Karte entfällt dann)
export function zeitstrahlHtml(zustand) {
  const liste = laufendeVorhaben(zustand);
  if (!liste.length) return '';
  return `${liste.map((v) => (v.typ === 'gesetz' ? gesetz(v) : loesung(v))).join('')}
    <p class="klein">Über Erfolg oder Scheitern wird am Ende des letzten Umsetzungsquartals entschieden. Liegt es im Haushaltsquartal, fällt die Entscheidung am Ende des folgenden Quartals.</p>`;
}
