// Protokoll der Ereignisse, neueste oben.
export function protokollHtml(protokoll) {
  const eintraege = [...protokoll].reverse().map((t) => `<li>${t}</li>`).join('') || '<li>Noch nichts passiert.</li>';
  return `<h2>Protokoll</h2><ul>${eintraege}</ul>`;
}
