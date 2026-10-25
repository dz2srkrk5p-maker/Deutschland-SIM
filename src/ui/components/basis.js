// Gemeinsame Bausteine der Oberfläche (UI-Umbau). Liefern HTML-Text; Aussehen kommt aus stil.css.

// Zahlen deutsch formatiert
export const zahl = (x, stellen = 0) =>
  x.toLocaleString('de-DE', { minimumFractionDigits: stellen, maximumFractionDigits: stellen });
export const prozent = (x) => `${zahl(x, 2)} %`;
// Änderung mit Vorzeichen (echtes Minuszeichen); null wird „±0“
export const plusMinus = (x, stellen = 2) =>
  Math.round(x * 10 ** stellen) === 0 ? `±${zahl(0, stellen)}` : `${x > 0 ? '+' : '−'}${zahl(Math.abs(x), stellen)}`;

// Status: Farbe immer zusammen mit Symbol, damit sie nicht allein die Bedeutung trägt
const SYMBOL = { ok: '✓', gelb: '⚠', rot: '✗' };
export const status = (art, text) => `<span class="${art}">${SYMBOL[art]} ${text}</span>`;
export const badge = (text, art = '') => `<span class="badge ${art}">${art ? `${SYMBOL[art]} ` : ''}${text}</span>`;

// Trendpfeil mit Text für Screenreader
export function trend(wert, schwelle = 0.05) {
  if (wert >= schwelle) return `<span class="ok" title="steigend">▲<span class="nur-screenreader"> steigend</span></span>`;
  if (wert <= -schwelle) return `<span class="rot" title="fallend">▼<span class="nur-screenreader"> fallend</span></span>`;
  return `<span class="klein" title="gleichbleibend">►<span class="nur-screenreader"> gleichbleibend</span></span>`;
}

export const punkt = (farbe, titel = '') => `<span class="punkt" style="background:${farbe}"${titel ? ` title="${titel}"` : ''}></span>`;

// Knopf: art 'primaer' | 'sekundaer' | 'gefahr'; attrs als fertiger Attribut-Text
export const knopf = (text, { art = 'sekundaer', attrs = '' } = {}) =>
  `<button class="${art === 'sekundaer' ? '' : art}" ${attrs}>${text}</button>`;

export const karte = (inhalt, { titel = '', klasse = '', attrs = '' } = {}) =>
  `<section class="karte ${klasse}" ${attrs}>${titel ? `<h2>${titel}</h2>` : ''}${inhalt}</section>`;

// Kennzahl-Karte für das Dashboard
export const kennzahl = (titel, wert, zusatz = '') =>
  `<div class="karte kennzahl"><span class="titel">${titel}</span><span class="wert">${wert}</span>${zusatz ? `<span class="klein">${zusatz}</span>` : ''}</div>`;

// Fortschrittsbalken; marke = Position einer Markierung in % (z. B. Hürde, Schwelle)
export const balken = (anteil, farbe, { marke = null, label = '' } = {}) =>
  `<span class="balken" role="img" aria-label="${label}"><span style="width:${Math.max(0, Math.min(100, anteil))}%;background:${farbe}"></span>${
    marke === null ? '' : `<i class="huerde" style="left:${marke}%"></i>`}</span>`;

// Tabs: eintraege [{ id, text }]; die Klicks behandelt der Aufrufer über data-tab
export const tabs = (eintraege, aktiv, name) =>
  `<div class="tabs" role="tablist" aria-label="${name}">${eintraege
    .map((t) => `<button role="tab" data-tab="${t.id}" aria-selected="${t.id === aktiv}">${t.text}</button>`)
    .join('')}</div>`;

export const aufklapp = (titel, inhalt, offen = false, klasse = '') =>
  `<details class="${klasse}" ${offen ? 'open' : ''}><summary>${titel}</summary>${inhalt}</details>`;

export const leer = (text) => `<p class="leer">${text}</p>`;

// Rückmeldung nach der letzten Aktion (oder Fehler), oben im Hauptbereich
export function meldungHtml(meldung) {
  if (!meldung) return '';
  const { texte, fehler } = meldung;
  if (!texte.length) return '';
  return `<div class="meldung ${fehler ? 'rot' : ''}" role="status">${fehler ? '<strong>✗ Nicht möglich:</strong> ' : ''}${
    texte.length === 1 ? texte[0] : `<ul>${texte.map((t) => `<li>${t}</li>`).join('')}</ul>`}</div>`;
}
