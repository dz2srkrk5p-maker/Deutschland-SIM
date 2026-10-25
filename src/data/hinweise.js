import { config } from './config.js';

// Erklärtexte oben auf jedem Bildschirm, freigegeben 2026-10-21 (F03). Zahlen kommen aus config.js.
const mehrheit = Math.floor(config.sitzeBundestag / 2) + 1; // wie mehrheit() in koalition.js bei voller Sitzzahl
const zahl = (x) => x.toLocaleString('de-DE');

// Schlüssel: Phase des Spielzustands, dazu 'start' und 'ende' (Sieg und Opposition)
export const hinweise = {
  start: `Ziel: Führe deine Partei ins Kanzleramt und stelle ${config.spielende.siegJahreKanzler} Haushaltsjahre lang den Kanzler, auch über mehrere Wahlperioden. Findest du nach einer Wahl keine Mehrheit und kannst als stärkste Fraktion auch keine Minderheitsregierung bilden, ist das Spiel vorbei.`,
  wahlkampf: `Bis zur Wahl hast du ${config.wahlkampf.wochen} Wochen, jede Woche eine Aktion. Unter ${zahl(config.sperrklauselProzent)} % kommt eine Partei nicht in den Bundestag. Danach brauchst du mit Partnern mindestens ${mehrheit} Sitze.`,
  koalition: `Wähle Partner, bis ihr zusammen mindestens ${mehrheit} Sitze habt. Wer absagt, ist bis zur nächsten Wahl gesperrt. Je weiter weg eine Partei in der Sitzordnung ist, desto eher sagt sie ab. Als stärkste Fraktion kannst du auch eine Minderheitsregierung bilden – riskant.`,
  kabinett: 'Verteile die Ministerien. Jede Koalitionspartei bekommt so viele, wie ihr nach Sitzen zustehen. Wer ein Ministerium hält, gewinnt oder verliert später Umfragepunkte durch dessen Etat.',
  quartal: `Ein Regierungsjahr hat ${config.regierung.quartaleJeJahr} Quartale; in jedem kannst du bis zu ${config.probleme.aktionenJeQuartal} Vorhaben starten (Lösungen oder Reformwege). Im letzten Quartal stellst du den Haushalt auf.`,
  regierung: `Stelle den Haushalt für dieses Jahr auf, ohne die Schuldenbremse zu brechen; Kürzungen schaden der Partei, die das Ministerium hält. Liegt ein Partner mehr als ${zahl(config.spielende.koalitionsbruchPunkte * config.koalitionsbruch.ultimatumAnteil)} Punkte unter seinem Startwert, stellt er ein Ultimatum, und nach ${config.koalitionsbruch.fristQuartale} Quartalen über ${zahl(config.spielende.koalitionsbruchPunkte)} Punkten verlässt er die Koalition.`,
  ende: 'Die Partie ist vorbei. Mit „Neues Spiel“ beginnst du von vorn, mit derselben oder einer anderen Partei.',
};

// Kurztexte an unklaren Stellen der Oberfläche (Paket Klein, Feature 4), höchstens zwei Sätze, als Tooltip
const fz = (x) => x.toLocaleString('de-DE', { maximumFractionDigits: 1 });
export const erklaerungen = {
  kapital: `Politisches Kapital bezahlt Lösungen, Reformwege und Zugeständnisse. Es wächst um ${config.kapital.jeQuartal} je Quartal, höchstens bis ${config.kapital.max}.`,
  profil: 'Das Richtungsprofil ist der Durchschnitt aller laufenden und beschlossenen Reformwege, je Achse von −2 bis +2. Es wirkt auf Wachstum, Partner, Wählerstimmung, den Erfolg von Lösungen und darauf, welche Ereignisse kommen.',
  beobachtung: `Prominent sind höchstens ${config.probleme.maxAktiv} Probleme ab „angespannt“; nur ernste und kritische unter ihnen kosten Umfragepunkte. Die übrigen stehen auf der Beobachtungsliste, mit Frühwarnung ab ${config.probleme.fruehwarnungAb} bei steigendem Trend.`,
  schuldenbremse: `Spielraum = Grenze der Schuldenbremse minus die zählende Neuverschuldung des aktuellen Haushalts. Verteidigungsausgaben über ${fz(config.haushalt.verteidigungsFreigrenze / 1e6)} Mrd. zählen nicht mit, und in schwachen Jahren erlaubt die Konjunkturkomponente mehr Kredit.`,
  landtagswahl: `Bei einer Landtagswahl bleibt die Landesregierung oder es wechselt genau eine Partei; schlechte Umfragen der Bundesregierung seit der Bundestagswahl erhöhen die Wechselchance dort, wo sie mitregiert (${Math.round(config.landtagswahlen.min * 100)}–${Math.round(config.landtagswahlen.max * 100)} %, Spielwerte). Das verschiebt die Stimmen im Bundesrat, und eine Bundespartei, die eine Landesregierung verliert, verliert ${config.landtagswahlen.verlustUmfrage.toLocaleString('de-DE')} Punkte.`,
  kompromiss: `Fehlen im Bundesrat höchstens ${config.kompromiss.maxFehlend} Stimmen, stimmen die Länder einem Kompromiss zu: Ein Reformweg gilt dann abgeschwächt (${Math.round(config.kompromiss.wirkungFaktor * 100)} % der Wirkung) und kostet ${config.kompromiss.kapital} Kapital mehr. Beim Haushalt verlangen die Länder eine einmalige Ausgleichszahlung von ${fz(config.kompromiss.laenderAusgleich / 1e6)} Mrd., die zur Schuldenbremse zählt, plus ${config.kompromiss.kapital} Kapital (Spielwerte).`,
  abstimmung: 'Jede Fraktion stimmt nach dem Abstand ihres Programms (Chapel Hill Expert Survey) zum Inhalt des Wegs: nah Ja, mittel Enthaltung, weit Nein. Koalitionspartner stimmen zu, außer der Abstand ist sehr groß (Veto).',
};
