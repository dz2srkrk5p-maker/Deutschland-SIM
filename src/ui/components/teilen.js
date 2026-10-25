// Partie teilen (F07): Link mit Seed, kopieren mit Rückfall auf Markieren.
// id: Präfix, damit das Feld im Spielmenü und auf dem Endbildschirm gleichzeitig vorkommen kann.
export const teilenLink = (zustand) => `${location.origin}${location.pathname}?seed=${zustand.seed}`;

export function teilenHtml(zustand, id = 'teilen') {
  return `
    <p>Gleicher Start, gleicher Zufall: Bei gleichen Entscheidungen verläuft die Partie genau gleich.</p>
    <p><label for="${id}-link">Link zu dieser Partie (Seed ${zustand.seed})</label></p>
    <div class="teilen"><input id="${id}-link" readonly value="${teilenLink(zustand)}"><button id="${id}-kopieren">Link kopieren</button></div>
    <p id="${id}-status" role="status"></p>`;
}

export function teilenBinden(el, zustand, id = 'teilen') {
  const feld = el.querySelector(`#${id}-link`);
  if (!feld) return;
  const melden = (text) => (el.querySelector(`#${id}-status`).textContent = text);
  feld.addEventListener('focus', () => feld.select());
  // Rückfall ohne Zwischenablage (z. B. ohne HTTPS): Link markieren, damit man ihn selbst kopieren kann
  el.querySelector(`#${id}-kopieren`).addEventListener('click', () =>
    (navigator.clipboard?.writeText(teilenLink(zustand)) ?? Promise.reject(new Error('keine Zwischenablage')))
      .then(() => melden('✓ Link kopiert.'))
      .catch(() => {
        feld.focus();
        feld.select(); // focus allein markiert nicht, wenn das Feld schon fokussiert war
        melden('Kopieren nicht möglich. Der Link ist markiert, bitte selbst kopieren (Strg+C).');
      }),
  );
}
