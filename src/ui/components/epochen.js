// Epochen in der Oberfläche (Epochen-Etappe 2): Titelseite beim Beginn, kurze Zeile in der Kopfzeile.
import { epoche, alsDatum } from '../../engine/epochen.js';
import { monatsname } from '../../data/kalender.js';

export const datumText = (t) => {
  const d = alsDatum(t);
  return `${monatsname(d.monat)} ${d.jahr}`;
};

// Kurze Zeile: Namen der laufenden Epochen (Spec: „kurze Zeile in der rechten Spalte“; hier in der Kopfzeile)
export const epochenZeile = (zustand) => (zustand.epochen?.aktiv ?? []).map((a) => epoche(a.id).name).join(' · ');

// Titelseite: kündigt eine neue Epoche an, bis sie gelesen ist
export function titelseiteHtml(zustand, { mitLink = true } = {}) {
  const id = zustand.epochen?.titelseite;
  if (!id) return '';
  const e = epoche(id);
  return `<section class="karte titelseite" aria-labelledby="titelseite-kopf">
    <p class="titelseite-marke">Sonderausgabe · ${datumText(zustand.epochen.aktiv.find((a) => a.id === id)?.start ?? 0)}</p>
    <h2 id="titelseite-kopf">${e.name}</h2>
    <p class="titelseite-text">${e.text}</p>
    <p><strong>Die Streitfrage:</strong> ${e.streitfrage.text}</p>
    <p class="klein">Die neuen Probleme kommen über die ersten Jahre.${mitLink ? ' Alles Weitere im Reiter „Euer Land“.' : ''}</p>
    <div class="knoepfe"><button id="titelseite-gelesen" class="primaer">Gelesen</button>${mitLink ? '<button data-gehe="land">Zu „Euer Land“</button>' : ''}</div>
  </section>`;
}

// Dauer in Worten: bis 2 Jahre in Monaten, darüber in Jahren (gerundet)
export const dauerText = (monate) => (monate < 24 ? `${monate} ${monate === 1 ? 'Monat' : 'Monate'}` : `etwa ${Math.round(monate / 12)} Jahre`);
