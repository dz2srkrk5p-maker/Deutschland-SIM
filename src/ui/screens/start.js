import { parteien } from '../../data/parteien.js';

const PHASEN = {
  wahlkampf: (z) => `Wahlkampf, Woche ${z.wahlkampfWoche}`,
  koalition: () => 'Regierungsbildung',
  kabinett: () => 'Kabinettsbildung',
  regierung: (z) => `Haushaltsjahr ${z.haushalt.jahr}`,
  sieg: () => 'Sieg',
  opposition: () => 'Opposition',
};

// Startbildschirm: gespeichertes Spiel fortsetzen oder Partei für ein neues Spiel wählen.
export function startScreen(el, { gespeichert, onStart, onWeiter }) {
  const waehlbar = parteien.filter((p) => !p.sonstige);
  const alt = gespeichert && parteien.find((p) => p.id === gespeichert.spielerParteiId);
  el.innerHTML = `
    <h1>Deutschland-Simulator</h1>
    ${alt ? `
      <div class="knoepfe"><button id="weiter"><span class="punkt" style="background:${alt.farbe}"></span>Weiterspielen: ${alt.name} · ${PHASEN[gespeichert.phase](gespeichert)} · ${gespeichert.statistik.jahreKanzler} Jahre Kanzler</button></div>
      <p>Oder ein neues Spiel beginnen (der gespeicherte Stand wird dabei überschrieben):</p>` : '<p>Wähle die Partei, die du in den Wahlkampf führst.</p>'}
    <div class="knoepfe">
      ${waehlbar.map((p) => `<button data-partei="${p.id}"><span class="punkt" style="background:${p.farbe}"></span>${p.name}</button>`).join('')}
    </div>`;
  el.querySelectorAll('[data-partei]').forEach((b) => b.addEventListener('click', () => onStart(b.dataset.partei)));
  el.querySelector('#weiter')?.addEventListener('click', onWeiter);
}
