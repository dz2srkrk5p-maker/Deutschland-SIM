import { parteien } from '../../data/parteien.js';
import { config } from '../../data/config.js';
import { hinweisHtml } from '../components/hinweis.js';
import { hinweiseAn } from '../../storage/speicher.js';
import { karte, punkt, zahl } from '../components/basis.js';
import { zeitText } from '../shell.js';
import { spielstufen } from '../../engine/spielstufe.js';

// Startbildschirm: gespeichertes Spiel fortsetzen oder Partei für ein neues Spiel wählen.
// link: { seed, bestaetigt } aus einem geteilten Link (F07), sonst null
export function startScreen(el, { gespeichert, link, onStart, onWeiter, onLinkJa, onLinkNein }) {
  const waehlbar = parteien.filter((p) => !p.sonstige);
  const alt = gespeichert && parteien.find((p) => p.id === gespeichert.spielerParteiId);
  const stand = alt && `${punkt(alt.farbe)}${alt.name} · ${zeitText(gespeichert)} · ${zahl(gespeichert.statistik.jahreKanzler)} Kanzlerjahre · Stufe ${config.spielstufen.stufen[gespeichert.stufe ?? config.spielstufen.standard].name}`;
  const stufen = config.spielstufen.stufen;
  if (link && alt && !link.bestaetigt) {
    el.innerHTML = `<div class="ansicht">
      <h1>Partie aus einem Link</h1>
      ${karte(`<p>Du hast den Link zu einer Partie geöffnet (Seed ${link.seed}). Es gibt schon ein gespeichertes Spiel: ${stand}.</p>
        <p><strong>Gespeichertes Spiel überschreiben?</strong></p>
        <div class="knoepfe"><button id="link-ja" class="gefahr primaer">Ja, neue Partie aus dem Link</button><button id="link-nein">Nein, weiterspielen</button></div>`)}
    </div>`;
    el.querySelector('#link-ja').addEventListener('click', onLinkJa);
    el.querySelector('#link-nein').addEventListener('click', onLinkNein);
    return;
  }
  el.innerHTML = `<div class="ansicht">
    <h1>${alt && !link ? 'Willkommen zurück' : 'Neues Spiel'}</h1>
    ${hinweisHtml('start')}
    ${alt && !link ? karte(`<p>${stand}</p><div class="knoepfe"><button id="weiter" class="primaer">Weiterspielen</button></div>`, { titel: 'Gespeichertes Spiel' }) : ''}
    ${karte(`
      ${link ? `<p>Partie aus einem Link (Seed ${link.seed}).</p>` : alt ? '<p><small>Ein neues Spiel überschreibt den gespeicherten Stand.</small></p>' : ''}
      <fieldset class="stufen"><legend>Spielstufe</legend>
        ${spielstufen.map((n) => `<label class="stufe-wahl"><input type="radio" name="stufe" value="${n}" ${n === config.spielstufen.standard ? 'checked' : ''}>
          <span><strong>${n} · ${stufen[n].name}</strong><br><small>${stufen[n].text}</small></span></label>`).join('')}
      </fieldset>
      <p><small>Die Stufe gilt für die ganze Partie.</small></p>
      <div class="parteien">
        ${waehlbar.map((p) => `<button data-partei="${p.id}" class="partei-wahl"><span>${punkt(p.farbe)}<strong>${p.name}</strong></span>
          <small>${p.schwierigkeit}${config.koalition.brandmauer.includes(p.id) ? ' – keine Partei koaliert mit euch (Brandmauer)' : ''}</small></button>`).join('')}
      </div>`, { titel: 'Stufe und Partei wählen' })}
    ${hinweiseAn() ? '' : '<div class="knoepfe"><button data-hinweise="an">Hinweise einblenden</button></div>'}
  </div>`;
  el.querySelectorAll('[data-partei]').forEach((b) => b.addEventListener('click', () => onStart(b.dataset.partei, Number(el.querySelector('input[name="stufe"]:checked').value))));
  el.querySelector('#weiter')?.addEventListener('click', onWeiter);
}
