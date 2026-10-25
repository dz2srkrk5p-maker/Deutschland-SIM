import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { kategorien, probleme } from '../../data/probleme.js';
import { ministerien } from '../../data/ministerien.js';
import { achsen, gruppen, kennzahlen } from '../../data/kennzahlen.js';
import { problemListe, ursachen, loesungSperre, erfolgschance, problem as problemVon } from '../../engine/probleme.js';
import { mrd } from '../../engine/haushalt.js';
import { bereiche } from '../../data/reformwege.js';
import { erklaerungen } from '../../data/hinweise.js';
import { kettenZiele } from '../../engine/krisenketten.js';
import { karte, badge, balken, zahl, plusMinus, leer, aufklapp } from '../components/basis.js';

const gName = (id) => gruppen.find((g) => g.id === id)?.name ?? id;
const kName = (id) => (id === 'gini' ? 'Gini' : kennzahlen.find((k) => k.id === id)?.name ?? id);

const pc = config.probleme;
const partei = (id) => parteien.find((p) => p.id === id);
const STUFE_ART = { ruhig: 'ok', angespannt: 'gelb', ernst: 'rot', krise: 'rot' };
const stufeBadge = (s) => badge(s.name, STUFE_ART[s.id]);
const farbe = (w) => (w >= pc.stufen[2].ab ? 'var(--gefahr)' : w >= pc.stufen[1].ab ? 'var(--warn)' : 'var(--akzent)');
const pfeil = (t) => (t > 0.05 ? '<span class="rot" title="steigend">▲</span>' : t < -0.05 ? '<span class="ok" title="fallend">▼</span>' : '<span class="klein" title="gleich">►</span>');
const ausrichtungText = (a = {}) => Object.entries(a).map(([id, v]) => {
  const ax = achsen.find((x) => x.id === id);
  return `${v > 0 ? ax.plus : ax.minus}${Math.abs(v) >= 1.5 ? ' (stark)' : ''}`;
}).join(', ') || 'pragmatisch';

// Kleiner Verlauf als Linie (Werte 0–100)
function verlaufSvg(werte) {
  if (werte.length < 2) return '<span class="klein">noch kein Verlauf</span>';
  const B = 120, H = 30;
  const pkt = werte.map((w, i) => `${((i / (werte.length - 1)) * B).toFixed(1)},${(H - (w / 100) * H).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${B} ${H}" width="${B}" height="${H}" role="img" aria-label="Verlauf: ${werte.map((w) => Math.round(w)).join(', ')}" class="mini">
    <line x1="0" x2="${B}" y1="${H - (pc.stufen[2].ab / 100) * H}" y2="${H - (pc.stufen[2].ab / 100) * H}" class="huerde-linie"/>
    <polyline points="${pkt}" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
}

function zeile(e, zustand) {
  const kommt = (zustand.ketten?.aktiv ?? []).filter((g) => g.nach === e.problem.id);
  return `<li class="problem-zeile">
    <button data-problem="${e.problem.id}" class="problem-knopf">
      <span class="problem-kopf"><strong>${e.problem.name}</strong><span class="zahl">${pfeil(e.trend)} ${Math.round(e.wert)}</span></span>
      ${balken(e.wert, farbe(e.wert), { marke: pc.stufen[2].ab, label: `${e.problem.name}: ${Math.round(e.wert)} von 100` })}
      <span class="klein">${e.problem.kategorie} · ${stufeBadge(e.stufe)}${e.fruehwarnung ? ' ' + badge('Frühwarnung', 'gelb') : ''}${kommt.length ? ' ' + badge(`Krisenkette: +${zahl(kommt.reduce((s, g) => s + g.staerke, 0), 1)} droht`, 'rot') : ''}</span>
    </button></li>`;
}

// Krisenketten (Feature 8): was dieses Problem in der Krise auslöst, was ihm droht, was zuletzt gewirkt hat
function kettenHtml(zustand, p) {
  const k = zustand.ketten ?? { aktiv: [], zuletzt: {}, verlauf: [] };
  const n = (id) => problemVon(id).name;
  const ziele = kettenZiele(p.id);
  const kommt = k.aktiv.filter((g) => g.nach === p.id);
  const geht = k.aktiv.filter((g) => g.von === p.id);
  const war = k.verlauf.filter((g) => g.nach === p.id || g.von === p.id);
  const sperre = k.zuletzt[p.id] !== undefined && zustand.runde - k.zuletzt[p.id] < config.krisenketten.abklingMonate;
  return `<p class="klein">${erklaerungen.ketten}</p>
    <p>${ziele.length ? `In der Krise verschärft es: ${ziele.map((z) => `${n(z.nach)} (+${zahl(z.staerke, 1)})`).join(', ')}.` : 'In der Krise löst es keine Kette aus.'}</p>
    ${kommt.length ? `<p class="rot">Droht: ${kommt.map((g) => `+${zahl(g.staerke, 1)} in ${Math.max(1, g.faellig - zustand.runde)} Monaten wegen der Krise bei ${n(g.von)}`).join('; ')}.</p>` : ''}
    ${geht.length ? `<p class="gelb">Läuft: Die Krise hier verschärft bald ${geht.map((g) => `${n(g.nach)} (+${zahl(g.staerke, 1)})`).join(', ')}.</p>` : ''}
    ${war.length ? `<p class="klein">Zuletzt gewirkt: ${war.map((g) => `${n(g.von)} → ${n(g.nach)} +${zahl(g.staerke, 1)}`).join('; ')}.</p>` : ''}
    ${sperre ? '<p class="klein">Abklingzeit: Dieses Problem löst vorerst keine neue Kette aus.</p>' : ''}`;
}

function detail(zustand, id) {
  const e = problemListe(zustand).find((x) => x.problem.id === id);
  const p = e.problem;
  const halter = zustand.kabinett.verteilung[p.ministerium];
  const u = ursachen(zustand, p).filter((x) => Math.abs(x.beitrag) >= 0.01);
  const treibtAndere = probleme.filter((q) => q.treiber.some((t) => t.problem === p.id));
  const loesungen = p.loesungen.map((l) => {
    const sperre = loesungSperre(zustand, l.id);
    const stand = zustand.loesungen[l.id];
    const zustandText = stand?.status === 'laufend' ? badge(`läuft bis Runde ${stand.fertig}`, 'gelb') : stand?.status === 'erfolg' ? badge('umgesetzt', 'ok') : stand?.status === 'gescheitert' ? badge('gescheitert', 'rot') : '';
    return `<div class="reform">
      <h3>${l.name} ${zustandText}</h3>
      <p class="klein">${l.text} Ausrichtung: ${ausrichtungText(l.ausrichtung)}.</p>
      <table><tbody>
        <tr><th scope="row">Wirkung bei Erfolg</th><td>−${l.wirkung} Punkte</td></tr>
        <tr><th scope="row">Erfolgschance</th><td>${Math.round(erfolgschance(zustand, l) * 100)} %</td></tr>
        <tr><th scope="row">Kosten</th><td>${l.kosten >= 0 ? `${zahl(mrd(l.kosten), 1)} Mrd. je Jahr` : `spart ${zahl(mrd(-l.kosten), 1)} Mrd. je Jahr`}</td></tr>
        <tr><th scope="row">Dauer</th><td>${l.dauer} Monate</td></tr>
        <tr><th scope="row">Politisches Kapital</th><td>${l.kapital}</td></tr>
        ${l.nebenwirkung ? `<tr><th scope="row">Nebenwirkungen</th><td>${[
          ...['wachstum', 'inflation', 'gini'].filter((k) => l.nebenwirkung[k]).map((k) => `${kName(k)} ${plusMinus(l.nebenwirkung[k])}`),
          ...Object.entries(l.nebenwirkung.gruppen ?? {}).map(([g, v]) => `${gName(g)} ${plusMinus(v, 0)}`),
          ...Object.entries(l.nebenwirkung.probleme ?? {}).map(([q, v]) => `${problemVon(q).name} ${plusMinus(v, 0)}`),
        ].join(' · ')}</td></tr>` : ''}
      </tbody></table>
      ${sperre ? (stand ? '' : `<p class="klein">✗ ${sperre}</p>`) : `<div class="knoepfe"><button class="primaer" data-loesung="${l.id}">Starten</button></div>`}
    </div>`;
  }).join('');
  return `<button id="zurueck">← Alle Probleme</button>
    ${karte(`<div class="problem-kopf"><h2>${p.name}</h2><span class="zahl">${pfeil(e.trend)} ${Math.round(e.wert)} von 100</span></div>
      ${balken(e.wert, farbe(e.wert), { marke: pc.stufen[2].ab, label: `${Math.round(e.wert)} von 100` })}
      <p>${p.text}</p>
      <p class="klein">${p.kategorie} · ${stufeBadge(e.stufe)} · zuständig: ${ministerien.find((m) => m.id === p.ministerium).kurz} (${halter ? partei(halter).name : '–'})</p>
      <p>Verlauf: ${verlaufSvg(e.verlauf)}</p>`)}
    ${karte(`<table><thead><tr><th scope="col">Ursache</th><th scope="col">je Monat</th></tr></thead><tbody>
      ${u.map((x) => `<tr><th scope="row">${x.text}</th><td class="${x.beitrag > 0 ? 'rot' : 'ok'}">${plusMinus(x.beitrag)}</td></tr>`).join('')}
      <tr><th scope="row"><strong>Trend</strong></th><td><strong>${plusMinus(e.trend)}</strong></td></tr></tbody></table>
      ${treibtAndere.length ? `<p class="klein">Verschärft bei hohem Wert: ${treibtAndere.map((q) => q.name).join(', ')}.</p>` : ''}
      <p class="klein">Folgen je Jahr in der Krise: ${[
        ...['wachstum', 'inflation', 'arbeitslosigkeit', 'gini'].filter((k) => p.folgen[k]).map((k) => `${kName(k)} ${plusMinus(p.folgen[k])}`),
        ...Object.entries(p.folgen.gruppen ?? {}).map(([g, v]) => `${gName(g)} ${plusMinus(v, 0)}`),
      ].join(' · ') || 'keine'}.</p>`, { titel: 'Ursachen und Wechselwirkungen' })}
    ${karte(kettenHtml(zustand, p), { titel: 'Krisenketten' })}
    ${karte(loesungen, { titel: 'Lösungsoptionen' })}
    ${bereiche.some((b) => b.probleme.includes(p.id)) ? karte(`<p>Dauerhaft wirken Reformwege: ${bereiche.filter((b) => b.probleme.includes(p.id)).map((b) => `<button data-reformbereich="${b.id}">${b.name}</button>`).join(' ')}</p>
      <p class="klein">Lösungen helfen schnell; Reformwege verändern den Trend dauerhaft und prägen das Richtungsprofil.</p>`, { titel: 'Reformen' }) : ''}`;
}

// Probleme (System 3): Liste nach Schweregrad mit Filter, Detail mit Ursachen, Verlauf, Wechselwirkungen und Lösungen
export function problemeScreen(el, zustand, { auswahl, filter, onAuswahl, onFilter, onLoesung, onReformbereich }) {
  const liste = problemListe(zustand);
  const gefiltert = liste.filter((e) => !filter || e.problem.kategorie === filter);
  const prominent = gefiltert.filter((e) => e.prominent);
  const beobachtung = gefiltert.filter((e) => !e.prominent);
  el.innerHTML = `<div class="ansicht">
    <h1>Probleme</h1>
    <p class="klein">Politisches Kapital: <strong>${zustand.kapital}</strong> · Vorhaben in diesem Monat: ${zustand.aktionenImMonat} von ${pc.aktionenJeMonat}. Ignorierte Probleme eskalieren; ernste Probleme und Krisen kosten Zustimmung.</p>
    ${auswahl ? detail(zustand, auswahl) : `
      <div class="tabs" role="group" aria-label="Kategorie">
        <button data-filter="" aria-pressed="${!filter}">Alle</button>
        ${kategorien.map((k) => `<button data-filter="${k}" aria-pressed="${filter === k}">${k}</button>`).join('')}
      </div>
      ${karte(prominent.length ? `<ul class="liste">${prominent.map((e) => zeile(e, zustand)).join('')}</ul>` : leer('Keine drängenden Probleme in dieser Kategorie.'), { titel: `Drängend (${prominent.length})` })}
      <p class="klein">${erklaerungen.beobachtung}</p>
      ${karte(beobachtung.length ? aufklapp(`Beobachtungsliste (${beobachtung.length}${beobachtung.some((e) => e.fruehwarnung) ? `, ${beobachtung.filter((e) => e.fruehwarnung).length} mit Frühwarnung` : ''})`, `<ul class="liste">${beobachtung.map((e) => zeile(e, zustand)).join('')}</ul>`, beobachtung.some((e) => e.fruehwarnung)) : leer('Nichts auf der Beobachtungsliste.'))}`}
  </div>`;
  el.querySelectorAll('[data-problem]').forEach((b) => b.addEventListener('click', () => onAuswahl(b.dataset.problem)));
  el.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => onFilter(b.dataset.filter || null)));
  el.querySelector('#zurueck')?.addEventListener('click', () => onAuswahl(null));
  el.querySelectorAll('[data-loesung]').forEach((b) => b.addEventListener('click', () => onLoesung({ loesungId: b.dataset.loesung })));
  el.querySelectorAll('[data-reformbereich]').forEach((b) => b.addEventListener('click', () => onReformbereich(b.dataset.reformbereich)));
}

// Für Lage und Kopfzeile: Top-Probleme und Zahl der ernsten Probleme
export const topProbleme = (zustand, n = 3) => problemListe(zustand).slice(0, n);
export const warnZahl = (zustand) => problemListe(zustand).filter((e) => e.prominent && e.wert >= pc.stufen[2].ab).length;
