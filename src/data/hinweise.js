import { config } from './config.js';

// Erklärtexte oben auf jedem Bildschirm, freigegeben 2026-10-21 (F03). Zahlen kommen aus config.js.
const mehrheit = Math.floor(config.sitzeBundestag / 2) + 1; // wie mehrheit() in koalition.js bei voller Sitzzahl
const zahl = (x) => x.toLocaleString('de-DE');

// Schlüssel: Phase des Spielzustands, dazu 'start' und 'ende' (Sieg und Opposition)
export const hinweise = {
  start: `Ziel: Führe deine Partei ins Kanzleramt und stelle ${config.spielende.siegJahreKanzler} Haushaltsjahre lang den Kanzler, auch über mehrere Wahlperioden. Findest du nach einer Wahl keine Mehrheit und kannst auch nicht als stärkste Fraktion allein (Minderheitsregierung) regieren, ist das Spiel vorbei.`,
  wahlkampf: `Bis zur Wahl hast du ${config.wahlkampf.wochen} Wochen, jede Woche eine Aktion. Unter ${zahl(config.sperrklauselProzent)} % kommt eine Partei nicht in den Bundestag. Danach brauchst du mit Partnern mindestens ${mehrheit} Sitze.`,
  koalition: `Wähle Partner, bis ihr zusammen mindestens ${mehrheit} Sitze habt. Wer absagt, ist bis zur nächsten Wahl gesperrt. Je weiter weg eine Partei in der Sitzordnung ist, desto eher sagt sie ab. Als stärkste Fraktion kannst du auch allein ohne Mehrheit regieren – riskant.`,
  kabinett: 'Verteile die Ministerien. Jede Koalitionspartei bekommt so viele, wie ihr nach Sitzen zustehen. Wer ein Ministerium hält, gewinnt oder verliert später Umfragepunkte durch dessen Etat.',
  regierung: `Stelle den Haushalt für dieses Jahr auf, ohne die Schuldenbremse zu brechen. Kürzungen schaden der Partei, die das Ministerium hält. Fällt ein Partner mehr als ${zahl(config.spielende.koalitionsbruchPunkte)} Punkte unter seinen Wert bei Regierungsbildung, verlässt er die Koalition.`,
  ende: 'Die Partie ist vorbei. Mit „Neues Spiel“ beginnst du von vorn, mit derselben oder einer anderen Partei.',
};
