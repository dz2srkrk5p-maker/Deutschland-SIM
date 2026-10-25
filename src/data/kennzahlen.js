// Landeskennzahlen (Erweiterung „drei Systeme“, Schritt 1). Startwerte = Ist 2025 aus amtlichen Quellen, abgerufen 2026-10-23.
// Wie Steuern, Reformen und Probleme darauf wirken, sind Spielwerte (config.wirtschaft).
export const kennzahlen = [
  // Destatis, Pressemitteilung Nr. 017 vom 15.01.2026: BIP 2025 preisbereinigt +0,2 %
  { id: 'wachstum', name: 'Wachstum', einheit: '%', start: 0.2, gut: 'hoch', quelle: 'Quelle: Destatis, 2026' },
  // Destatis, Pressemitteilung Nr. 019 vom 16.01.2026: Verbraucherpreise 2025 +2,2 % im Jahresdurchschnitt
  { id: 'inflation', name: 'Inflation', einheit: '%', start: 2.2, gut: 'mittel', quelle: 'Quelle: Destatis, 2026' },
  // Bundesagentur für Arbeit, Jahresdurchschnitt 2025: 6,3 % (zitiert nach DSGV-Finanzbericht 2025, Finanzteil)
  { id: 'arbeitslosigkeit', name: 'Arbeitslosenquote', einheit: '%', start: 6.3, gut: 'niedrig', quelle: 'Quelle: Bundesagentur für Arbeit, 2025' },
  // Eurostat ilc_di12 (EU-SILC), Deutschland 2025: Gini 30,1 (Skala 0–100)
  { id: 'gini', name: 'Ungleichheit (Gini)', einheit: '', start: 30.1, gut: 'niedrig', quelle: 'Quelle: Eurostat EU-SILC, 2025' },
  // Deutsche Bundesbank, Pressemitteilung März 2026: Schuldenstand Ende 2025 2,84 Bio. €, 63,5 % des BIP
  { id: 'schuldenquote', name: 'Schuldenquote', einheit: '% BIP', start: 63.5, gut: 'niedrig', quelle: 'Quelle: Deutsche Bundesbank, 2026' },
];

// Grundgrößen für die Schuldenquote, in Mrd. €. BIP abgeleitet aus Schuldenstand / Schuldenquote (2840 / 0,635).
export const startSchulden = 2840;
export const startBip = 4472;
export const startQuellen = { startSchulden: 'Quelle: Deutsche Bundesbank, 2026', startBip: 'Spielwert' }; // BIP abgeleitet, nicht amtlich

// Bevölkerungs- und Wirtschaftsgruppen mit Zustimmung zur Regierung (Index 0–100, Start 50, Spielwert)
export const gruppen = [
  { id: 'arbeitnehmer', name: 'Arbeitnehmer', quelle: 'Spielwert' },
  { id: 'rentner', name: 'Rentner', quelle: 'Spielwert' },
  { id: 'familien', name: 'Familien', quelle: 'Spielwert' },
  { id: 'geringverdiener', name: 'Geringverdiener', quelle: 'Spielwert' },
  { id: 'unternehmen', name: 'Unternehmen', quelle: 'Spielwert' },
  { id: 'landwirtschaft', name: 'Landwirtschaft', quelle: 'Spielwert' },
];

// Politische Achsen für Reformwege, Parteipositionen und das Richtungsprofil, jeweils −2 bis +2
export const achsen = [
  { id: 'wirtschaft', name: 'Wirtschaft', minus: 'staatlich', plus: 'marktliberal', quelle: 'Spielwert' },
  { id: 'gesellschaft', name: 'Gesellschaft', minus: 'progressiv', plus: 'konservativ', quelle: 'Spielwert' },
  { id: 'oekologie', name: 'Ökologie', minus: 'wachstumsorientiert', plus: 'ökologisch', quelle: 'Spielwert' },
  { id: 'eu', name: 'Europa', minus: 'national-souverän', plus: 'EU-orientiert', quelle: 'Spielwert' },
];
