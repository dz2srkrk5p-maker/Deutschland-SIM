// Ursache, Ergänzung und Wertverlust an Ansätzen (Epochen-Etappe 5); erst ab Stufe 2 sichtbar.
import { ursacheVon, ergaenzungFaktor, geldleistungen, anpassungSperre } from '../../engine/ursachen.js';
import { systemAn } from '../../engine/spielstufe.js';
import { problem } from '../../engine/probleme.js';
import { stammbaum } from '../../engine/generationen.js';
import { ursachenNamen } from '../../data/ursachen.js';
import { config } from '../../data/config.js';
import { status } from './basis.js';
import { datumText } from './epochen.js';

// Tabellenzeile „Packt an: Geld“ samt Hinweis, gegen welche Probleme der Ansatz nur halb wirkt
export function ursacheZeile(zustand, ansatzId, problemIds) {
  if (!systemAn(zustand, 'ursachen') || !ursacheVon(ansatzId)) return '';
  const halb = problemIds.filter((p) => zustand.probleme[p] && ergaenzungFaktor(zustand, p, ansatzId) < 1);
  return `<tr><th scope="row" title="Ansätze mit verschiedenen Ursachen ergänzen sich; ein zweiter mit derselben Ursache wirkt nur halb.">Packt an ⓘ</th><td>${ursachenNamen[ursacheVon(ansatzId)]}${
    halb.length ? ` ${status('gelb', `wirkt nur halb gegen ${halb.map((p) => problem(p).name).join(', ')} (schon ein Ansatz mit derselben Ursache)`)}` : ''}${
    ursacheVon(ansatzId) === 'geld' && systemAn(zustand, 'wertverlust') ? '<br><small>Geldleistung: verliert ohne Anpassung ab dem fünften Jahr Wirkung</small>' : ''}</td></tr>`;
}

// Karte „Geldleistungen“ mit Wertverlust und Anpassungsgesetz
export function geldleistungenHtml(zustand) {
  if (!systemAn(zustand, 'wertverlust')) return '';
  const liste = geldleistungen(zustand);
  if (!liste.length) return '';
  const sperre = anpassungSperre(zustand);
  const wv = config.wertverlust;
  return `<ul class="liste">${liste.map((g) => `<li>${g.weg.name}: ${g.preisgekoppelt ? status('ok', 'an die Preise gekoppelt') : g.faktor < 1 ? status('gelb', `noch ${Math.round(g.faktor * 100)} % Wirkung`) : 'volle Wirkung'}</li>`).join('')}</ul>
    <p class="klein">Ohne Anpassung verlieren Geldleistungen ab dem ${wv.abJahr}. Jahr jedes Jahr ${Math.round(wv.jeJahr * 100)} % Wirkung. Ein Anpassungsgesetz frischt alle auf, einmal je Legislatur (${wv.anpassungKapital} Kapital, zählt als Vorhaben).</p>
    <div class="knoepfe"><button id="anpassungsgesetz" ${sperre ? 'disabled' : ''}>Anpassungsgesetz beschließen</button>${sperre ? ` <span class="klein">✗ ${sperre}</span>` : ''}</div>`;
}

// Stammbaum eines Problems (Generationen), ab Stufe 2
export function geschichteHtml(zustand, problemId) {
  if (!systemAn(zustand, 'generationen')) return '';
  const kette = stammbaum(zustand, problemId);
  if (!kette.length) return '';
  return `<ol class="stammbaum">${kette.map((k) => `<li>${k.id === problemId ? `<strong>${problem(k.id).name}</strong>` : problem(k.id).name}${k.abgeloest != null ? ` <small>(abgelöst ${datumText(k.abgeloest)})</small>` : ''}</li>`).join('')}</ol>
    <p class="klein">Gesetze gegen ein früheres Problem helfen zu ${Math.round(config.generationen.altGesetzWirkung * 100)} % weiter.</p>`;
}
