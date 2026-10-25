import { hinweise } from '../../data/hinweise.js';
import { hinweiseAn } from '../../storage/speicher.js';

// Erklärbox oben auf dem Bildschirm; leer, wenn ausgeblendet. Der Knopf wird in app.js behandelt.
export function hinweisHtml(schluessel) {
  if (!hinweiseAn()) return '';
  return `<div class="hinweis"><p>${hinweise[schluessel]}</p><button data-hinweise="aus">Hinweise ausblenden</button></div>`;
}
