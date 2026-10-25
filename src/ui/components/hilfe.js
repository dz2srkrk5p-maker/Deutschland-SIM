// Hilfe (Block 4/5): was im Spiel empirisch belegt ist und was Spielwert ist (aus den Feldern quelle der Datendateien),
// dazu die bewussten Vereinfachungen.
import { kennzahlen, gruppen, startQuellen } from '../../data/kennzahlen.js';
import { einnahmearten } from '../../data/einnahmen.js';
import { parteien } from '../../data/parteien.js';
import { probleme } from '../../data/probleme.js';
import { bereiche } from '../../data/reformwege.js';
import { ereignisse } from '../../data/ereignisse.js';
import { laender } from '../../data/laender.js';
import { ministerien } from '../../data/ministerien.js';
import { quellen as haushaltQuellen } from '../../data/haushalt.js';
import { quellen as configQuellen } from '../../data/config.js';
import { zahl, aufklapp } from './basis.js';

const q = (text) => (text === 'Spielwert' ? '<span class="klein">Spielwert</span>' : text.replace(/^Quelle: /, ''));
const zeilen = (liste) => `<table><tbody>${liste.map(([was, wert, quelle]) => `<tr><th scope="row">${was}</th><td>${wert}</td><td>${q(quelle)}</td></tr>`).join('')}</tbody></table>`;
const einheitlich = (liste) => [...new Set(liste)].join('; ');

export function hilfeHtml() {
  const belegt = [
    ...kennzahlen.map((k) => [k.name, `${zahl(k.start, 1)} ${k.einheit}`, k.quelle]),
    ['Schuldenstand', '2 840 Mrd. €', startQuellen.startSchulden],
    ['Bundeshaushalt 2026 (Etats, feste Ausgaben)', '16 Etats', haushaltQuellen.etats2026],
    ['Steuereinnahmen 2026', '387,21 Mrd. €', haushaltQuellen.steuern2026],
    ['Sitze im Bundestag', '630', configQuellen.sitzeBundestag],
    ['Sperrklausel', '5 %', configQuellen.sperrklauselProzent],
    ['Wahlperiode', '4 Jahre', configQuellen.legislaturJahre],
    ['Grenze der Schuldenbremse 2026', '40,39 Mrd. €', configQuellen['haushalt.schuldenbremseGrenze']],
    ['Stimmen im Bundesrat, Landesregierungen', `${laender.length} Länder`, einheitlich(laender.map((l) => l.quelle))],
    ['Ministerien', `${ministerien.length}`, einheitlich(ministerien.map((m) => m.quelle))],
    ['Termine der Landtagswahlen bis 2030, Wahlperioden', `${laender.filter((l) => l.wahl.quelle !== 'Spielwert').length} Länder`, 'Quelle: wahlrecht.de, Termine, 2026'],
  ];
  const einnahmen = einnahmearten.map((a) => [a.name, `Startbetrag: ${q(a.quelle.start)}<br>Satz: ${q(a.quelle.satz)}`, a.quelle.wirkung]);
  const spiel = parteien.filter((p) => !p.sonstige);
  const loesungen = probleme.reduce((n, p) => n + p.loesungen.length, 0);
  const wege = bereiche.reduce((n, b) => n + b.wege.length, 0);
  return `
    <p>Startwerte und Parteipositionen beruhen auf Quellen. Alle Wirkungen (was eine Entscheidung auslöst und wie stark) sind
      Spielwerte: plausibel geschätzt, aber nicht gemessen. Das Spiel ist ein Modell, keine Prognose.</p>
    ${aufklapp('Belegt: Startwerte', zeilen(belegt), true)}
    ${aufklapp('Einnahmen: Startbeträge und Sätze', `${zeilen(einnahmen)}<p class="klein">Die letzte Spalte gilt für alle Wirkungen je Stufe (Aufkommen, Ausweichen, Verzögerung, Wirkung auf Wirtschaft und Gruppen).</p>`)}
    ${aufklapp('Belegt: Parteien', `<p>Startumfragen: Zweitstimmen der Bundestagswahl 2025 (${q(spiel[0].quelle.startanteil)}).
      Positionen: ${q(spiel[0].quelle.ches)}, umgerechnet auf die vier Spielachsen; CDU/CSU als Mittel aus CDU und CSU nach Sitzen.</p>
      <p class="klein">Die Umrechnung auf die Achsen und alle Abstimmungsschwellen sind Spielwerte. Farben sind Spielfarben.</p>`)}
    ${aufklapp('Spielwerte', `<ul>
      <li>${probleme.length} Problembereiche mit Startwerten, Trends, Treibern und ${loesungen} Lösungen</li>
      <li>${wege} Reformwege in ${bereiche.length} Bereichen, Ausrichtungen, Reaktionen der Verbände und der EU</li>
      <li>${ereignisse.length} Ereignisse und ihre Folgen</li>
      <li>Gruppenstimmung (${gruppen.map((g) => g.name).join(', ')}), Start 50</li>
      <li>Wirtschaftsdynamik (Rückkehr zum Potenzialwachstum, Okun, Zinsen und Zinsaufschlag), politisches Kapital, Koalitionsbruch, Wahlkampf</li>
      <li>Landtagswahlen: Wechselchance, wer bei einem Wechsel in die Landesregierung kommt, Termine nach 2030 (Fortschreibung der Wahlperiode), Neubildung in Berlin, Sachsen-Anhalt und Mecklenburg-Vorpommern</li>
      <li>Rechtsrisiken von Steueränderungen (Chance, dass das Bundesverfassungsgericht eine Änderung kippt); belegt sind nur die Grundlagen Art. 3 und Art. 14 GG</li>
      <li>Alle übrigen Konstanten in <code>src/data/config.js</code></li>
    </ul>`)}
    ${aufklapp('Bewusste Vereinfachungen', `<ul>
      <li><strong>Haushalte von Ländern und Gemeinden</strong> fehlen. Gespielt wird nur der Bund. Gewerbe-, Erbschaft- und
        Vermögensteuer lassen sich ändern, ihr Aufkommen fließt aber nicht in den Bundeshaushalt; das Defizit der übrigen
        Ebenen ist ein fester Anteil des BIP.</li>
      <li><strong>Zinsmarkt</strong> fehlt. Zinsen wachsen mit dem Schuldenstand, dazu kommt ein gedämpfter Zinsaufschlag bei
        hoher Schuldenquote oder hoher Neuverschuldung (höchstens 30 %, Spielwerte). Eine Zinskurve oder Reaktionen der Märkte gibt es nicht.</li>
      <li><strong>Vermittlungsausschuss</strong> fehlt. Ohne Mehrheit im Bundesrat lässt sich ein Zustimmungsgesetz nicht beschließen; es gibt keine Kompromissrunde.</li>
    </ul>`)}`;
}
