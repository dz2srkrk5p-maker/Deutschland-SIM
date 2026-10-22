// Bundestag als Halbkreis aus Punkten (SVG). Bekommt nur Sitzverteilung und Parteidaten.
import { mehrheit } from '../../engine/koalition.js';

const INNEN = 0.4; // innerer Radius relativ zum äußeren: Platz für die Lücke in der Mitte

// Sitzplätze im Halbkreis (Einheitsradius), von links nach rechts sortiert.
// Reihenzahl so gewählt, dass Abstand zwischen Reihen ≈ Abstand der Punkte in einer Reihe.
export function sitzPositionen(anzahl) {
  if (anzahl <= 0) return { plaetze: [], punktRadius: 0 };
  const reihen = Math.max(1, Math.round(Math.sqrt((anzahl * 2 * (1 - INNEN)) / (Math.PI * (1 + INNEN)))));
  const radien = Array.from({ length: reihen }, (_, i) => (reihen === 1 ? 1 : INNEN + ((1 - INNEN) * i) / (reihen - 1)));
  const radiusSumme = radien.reduce((s, r) => s + r, 0);

  // Sitze je Reihe proportional zum Radius; Rundungsrest geht an die äußerste Reihe
  const proReihe = radien.map((r) => Math.round((anzahl * r) / radiusSumme));
  proReihe[reihen - 1] += anzahl - proReihe.reduce((s, n) => s + n, 0);

  const plaetze = [];
  radien.forEach((r, i) => {
    const n = proReihe[i];
    for (let j = 0; j < n; j++) {
      const winkel = n === 1 ? Math.PI / 2 : Math.PI * (1 - j / (n - 1));
      plaetze.push({ x: r * Math.cos(winkel), y: r * Math.sin(winkel), winkel, r });
    }
  });
  // links (Winkel π) zuerst; bei gleichem Winkel innen vor außen
  plaetze.sort((a, b) => b.winkel - a.winkel || a.r - b.r);

  const reihenAbstand = reihen === 1 ? 1 : (1 - INNEN) / (reihen - 1);
  const punktAbstand = Math.min(...radien.map((r, i) => (proReihe[i] > 1 ? (Math.PI * r) / (proReihe[i] - 1) : 1)));
  return { plaetze, punktRadius: 0.45 * Math.min(reihenAbstand, punktAbstand) };
}

// Fraktionen in Sitzordnung (links → rechts), nur Parteien mit Sitzen
export function fraktionen(sitze, parteien) {
  return parteien
    .filter((p) => sitze[p.id] > 0)
    .sort((a, b) => a.sitzordnung - b.sitzordnung)
    .map((p) => ({ ...p, sitze: sitze[p.id] }));
}

export function bundestagSvg(sitze, parteien) {
  const liste = fraktionen(sitze, parteien);
  const gesamt = liste.reduce((s, p) => s + p.sitze, 0);
  const { plaetze, punktRadius } = sitzPositionen(gesamt);
  const R = 95; // äußerer Radius in SVG-Einheiten
  const zahl = (v) => v.toFixed(2);

  let index = 0;
  const gruppen = liste.map((p) => {
    const punkte = plaetze.slice(index, (index += p.sitze)).map(
      (s) => `<circle cx="${zahl(100 + s.x * R)}" cy="${zahl(100 - s.y * R)}" r="${zahl(punktRadius * R)}"/>`,
    );
    return `<g fill="${p.farbe}"><title>${p.name}: ${p.sitze} Sitze</title>${punkte.join('')}</g>`;
  });

  const beschreibung = liste.map((p) => `${p.name} ${p.sitze}`).join(', ');
  return `
    <svg class="sitze" viewBox="0 0 200 104" role="img" aria-label="Bundestag, ${gesamt} Sitze: ${beschreibung}" style="width:100%;max-width:640px;display:block">
      ${gruppen.join('')}
      <text x="100" y="86" text-anchor="middle" font-size="12" font-weight="bold">${gesamt}</text>
      <text x="100" y="98" text-anchor="middle" font-size="6">Mehrheit ab ${mehrheit(sitze)}</text>
    </svg>
    <ul style="list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:0.5em 1.2em">
      ${liste.map((p) => `<li><span style="display:inline-block;width:0.8em;height:0.8em;border-radius:50%;background:${p.farbe};border:1px solid var(--text-2)"></span> ${p.name} ${p.sitze}</li>`).join('')}
    </ul>`;
}
