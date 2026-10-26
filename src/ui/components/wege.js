// Wege einer Epoche in der Oberfläche (Epochen-Etappe 3): Weiche, Aufgabe mit Fortschritt und Prognose, Kurswechsel.
import { AUSRICHTUNGEN } from '../../data/reformwege.js';
import { merkmale } from '../../data/merkmale.js';
import { config } from '../../data/config.js';
import { weg as reformweg } from '../../engine/reformwege.js';
import { loesung } from '../../engine/probleme.js';
import { wegDaten, fortschritt, angebot, passenderWeg, kurswechselSperre, kurswechselFrei, zweiterWegSperre } from '../../engine/weichen.js';
import { systemAn } from '../../engine/spielstufe.js';
import { parteien } from '../../data/parteien.js';
import { balken, status } from './basis.js';

const ec = config.epochen;
const pz = (x) => `${Math.round(x * 100)} %`;
const ansatzName = (id) => reformweg(id)?.name ?? loesung(id)?.name ?? id;
const merkmalName = (id) => merkmale.find((m) => m.id === id)?.name ?? id;

// Kurzbeschreibung eines Wegs (für die Weiche und den gewählten Weg)
export const wegBeschreibungHtml = (w) => `
  <p class="klein">${AUSRICHTUNGEN[w.ausrichtung].name}</p>
  <p><strong>Aufgabe:</strong> ${w.aufgabe.text}</p>
  <p><strong>Stärke:</strong> ${w.staerke.text}<br><strong>Schwäche:</strong> ${w.schwaeche.text}</p>
  <p class="klein"><strong>Schwerpunkt</strong> (wirkt ${Math.round(ec.schwerpunktBonus * 100)} % stärker): ${w.schwerpunkt.map(ansatzName).join(', ')}<br>
  <strong>Merkmal</strong> bei gelungener Aufgabe: ${merkmalName(w.merkmal)}</p>`;

// Aufgabe mit Fortschrittsbalken und Prognose „bei diesem Tempo“
export function aufgabeHtml(zustand, a, wegId, { kurz = false } = {}) {
  const w = wegDaten(wegId);
  const f = fortschritt(zustand, a, wegId);
  const gelingt = f.prognose !== null && f.prognose >= ec.aufgabeErfuelltAb;
  return `<div class="aufgabe">
    <p><strong>${w.name}</strong>${kurz ? ` – ${w.aufgabe.text}` : ''}</p>
    ${balken(f.anteil * 100, 'var(--akzent)', { label: `Aufgabe zu ${pz(f.anteil)} erreicht` })}
    <p class="klein">Erreicht: ${pz(f.anteil)}${f.wert === null ? '' : ` (Wert ${Math.round(f.wert)}, Ziel höchstens ${f.ziel})`}.
    ${f.prognose === null ? 'Das Problem ist noch nicht da.' : `Bei diesem Tempo am Ende der Epoche: ${pz(f.prognose)} – ${gelingt ? status('ok', 'die Aufgabe gelingt') : status('rot', 'die Aufgabe wird verfehlt')}`}</p>
  </div>`;
}

// Weiche (noch kein Weg) bzw. gewählte Wege mit Kurswechsel / zweitem Weg
export function wegeHtml(zustand, a) {
  const eigene = zustand.phase === 'regierung';
  const wege = a.wege ?? [];
  if (!wege.length) {
    const passend = passenderWeg(zustand, a.id, zustand.spielerParteiId);
    const rest = Math.max(0, a.start + ec.aufschubMonate - (zustand.jahr * 12 + zustand.monat - 1));
    return `<h3>Weiche: Welchen Weg geht euer Land?</h3>
      <p class="klein">${eigene ? `Ihr könnt die Wahl aufschieben. ${rest > 0 ? `In ${rest} ${rest === 1 ? 'Monat' : 'Monaten'}` : 'Mit dem nächsten Monat'} nimmt ${parteien.find((p) => p.id === zustand.spielerParteiId).name} den Weg, der zum Programm passt: „${passend.name}“.` : 'In der Opposition wählt die Regierung den Weg.'}</p>
      <div class="wege">${angebot(zustand, a.id).map((w) => `<div class="weg">
        <h4>${w.name}</h4>${wegBeschreibungHtml(w)}
        ${eigene ? `<div class="knoepfe"><button class="primaer" data-weg="${w.id}" data-epoche="${a.id}">Diesen Weg gehen</button></div>` : ''}
      </div>`).join('')}</div>`;
  }
  const andere = angebot(zustand, a.id).filter((w) => !wege.includes(w.id));
  const kw = systemAn(zustand, 'kurswechsel') && eigene && andere.length;
  const zw = systemAn(zustand, 'zweiterWeg') && eigene && andere.length;
  const kwSperre = kw ? kurswechselSperre(zustand, a.id) : null;
  const zwSperre = zw ? zweiterWegSperre(zustand, a.id) : null;
  return `<h3>${wege.length > 1 ? 'Eure Wege' : 'Euer Weg'}</h3>
    ${wege.map((id) => `<div class="weg">${aufgabeHtml(zustand, a, id)}<details><summary>Stärke, Schwäche, Schwerpunkt</summary>${wegBeschreibungHtml(wegDaten(id))}</details></div>`).join('')}
    ${kw ? `<h4>Kurswechsel</h4><p class="klein">${kurswechselFrei(zustand) ? 'Neue Regierung: Im ersten Jahr ist ein Wechsel kostenlos.' : `Einmal je Epoche. Kostet ${ec.kurswechselKapital} Kapital, ${String(ec.kurswechselUmfrage).replace('.', ',')} Umfragepunkte und Zustimmung der Gruppen, die vom bisherigen Weg profitieren; der Rückenwind halbiert sich.`}${kwSperre ? ` ${status('gelb', kwSperre)}` : ''}</p>
      <div class="knoepfe">${andere.map((w) => `<button data-kurswechsel="${w.id}" data-epoche="${a.id}" ${kwSperre ? 'disabled' : ''}>Wechseln zu „${w.name}“</button>`).join('')}</div>` : ''}
    ${zw ? `<h4>Zweiter Weg</h4><p class="klein">Beide Aufgaben zählen, beide Merkmale sind möglich; die Schwerpunkt-Gesetze beider Wege kosten das ${String(ec.zweiterWegKostenFaktor).replace('.', ',')}-Fache.${zwSperre ? ` ${status('gelb', zwSperre)}` : ''}</p>
      <div class="knoepfe">${andere.map((w) => `<button data-zweiterweg="${w.id}" data-epoche="${a.id}" ${zwSperre ? 'disabled' : ''}>„${w.name}“ dazunehmen</button>`).join('')}</div>` : ''}`;
}
