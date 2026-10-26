// Großprojekte (Etappe 1, 2026-10-26). PLATZHALTER: Welche Großprojekte es gibt und was sie kosten, entscheidet der Nutzer
// (docs/epochen-spec.md). Die beiden Namen stammen aus den Beispielen der Spec; alle Zahlen hier sind TODO-BALANCE.
//
// Felder je Großprojekt:
//   startDurch: Ansatz, der das Projekt startet (Spec: „manche Aufbaugesetze“; Aufbaugesetze gibt es noch nicht, daher vorerst
//               eine vorhandene Lösung bzw. ein Reformweg)
//   baukostenJeJahr: tausend €/Jahr laut Plan (TODO-BALANCE)
//   meilensteine: [{ name, monate (ab Start, laut Plan), wirkung: { probleme: { problemId: dauerhafter Trend je Monat, negativ = lindert } } }]

export const grossprojekte = [
  {
    id: 'deutschlandtakt', platzhalter: true, quelle: 'Spielwert', name: 'Deutschlandtakt',
    text: 'Ein abgestimmter Taktfahrplan für das ganze Land, mit neuen Strecken und Knoten.',
    startDurch: 'schiene2',
    baukostenJeJahr: 3000000, // TODO-BALANCE: 3 Mrd. € je Jahr
    meilensteine: [
      { name: 'Erste Knoten fertig', monate: 48, wirkung: { probleme: { infrastruktur: -0.05 } } },
      { name: 'Hauptstrecken im Takt', monate: 96, wirkung: { probleme: { infrastruktur: -0.05, klimafolgen: -0.02 } } },
      { name: 'Ganzes Netz im Takt', monate: 144, wirkung: { probleme: { infrastruktur: -0.1 } } },
    ],
  },
  {
    id: 'fernwasserverbund', platzhalter: true, quelle: 'Spielwert', name: 'Fernwasserverbund',
    text: 'Leitungen verbinden wasserreiche und trockene Regionen.',
    startDurch: 'klima_anpassung',
    baukostenJeJahr: 1500000, // TODO-BALANCE: 1,5 Mrd. € je Jahr
    meilensteine: [
      { name: 'Erste Verbundleitung', monate: 36, wirkung: { probleme: { klimafolgen: -0.03 } } },
      { name: 'Verbund im Süden und Osten', monate: 84, wirkung: { probleme: { klimafolgen: -0.05, landwirtschaftsproteste: -0.02 } } },
    ],
  },
];
