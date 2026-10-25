// Koalitionsvertrag (Paket Groß, Feature 7): Bei der Kabinettsbildung vereinbaren die Koalitionsparteien Vorhaben
// (Reformwege, die die Partner vorschlagen) und die Ressortverteilung. Einhaltung belohnt die Partner, Abweichung kostet
// sie Umfragepunkte und wirkt so über die Ultimatum-Logik (Block 2) auf den Koalitionsfrieden. Spielwerte: config.koalitionsvertrag.
import { config } from '../data/config.js';
import { parteien } from '../data/parteien.js';
import { ministerien } from '../data/ministerien.js';
import { bereiche, AUSRICHTUNGEN } from '../data/reformwege.js';
import { parteiPosition, abstand } from './profil.js';

const kv = config.koalitionsvertrag;
const name = (id) => parteien.find((p) => p.id === id)?.name ?? id;
const alleWege = bereiche.flatMap((b) => b.wege.map((w) => ({ ...w, bereich: b })));
const vektor = (w) => ({ ...AUSRICHTUNGEN[w.richtung].vektor, ...(w.vektor ?? {}) }); // wie wegVektor in reformwege.js

// Vorschläge je Partner: Grundwege aus noch freien Bereichen, inhaltlich am nächsten an seiner Position; jeder Bereich
// höchstens einmal im ganzen Vertrag.
export function vertragsVorschlaege(zustand) {
  const belegt = new Set(Object.keys(zustand.reformwege ?? {}).map((id) => alleWege.find((w) => w.id === id)?.bereich.id));
  const vorschlaege = {};
  for (const id of zustand.koalition.partner) {
    const pos = parteiPosition(id);
    const liste = alleWege.filter((w) => !w.braucht && !belegt.has(w.bereich.id))
      .sort((a, b) => abstand(pos, vektor(a)) - abstand(pos, vektor(b)));
    vorschlaege[id] = [];
    for (const w of liste) {
      if (vorschlaege[id].length >= kv.vorschlaegeJePartner) break;
      if (vorschlaege[id].some((x) => alleWege.find((y) => y.id === x).bereich.id === w.bereich.id)) continue;
      vorschlaege[id].push(w.id);
      belegt.add(w.bereich.id);
    }
  }
  return vorschlaege;
}

// Prüfung der Auswahl: je Partner 1 bis maxJePartner seiner Vorschläge. Gibt Fehlertexte zurück.
export function vertragPruefen(zustand, vorschlaege, vorhaben) {
  const fehler = [];
  for (const id of zustand.koalition.partner) {
    const gewaehlt = vorhaben.filter((v) => v.partei === id);
    if (gewaehlt.some((v) => !vorschlaege[id]?.includes(v.wegId))) fehler.push(`${name(id)}: Vorhaben gehört nicht zu den Vorschlägen`);
    if (vorschlaege[id]?.length && (gewaehlt.length < 1 || gewaehlt.length > kv.maxJePartner)) fehler.push(`${name(id)}: 1 bis ${kv.maxJePartner} Vorhaben aufnehmen`);
  }
  return fehler;
}

// Vertrag beim Vereidigen: Vorhaben und Ressorts der Partner
export const vertragAnlegen = (zustand, vorhaben, verteilung) => ({
  vorhaben: vorhaben.map((v) => ({ wegId: v.wegId, partei: v.partei, status: 'offen' })),
  ressorts: Object.fromEntries(ministerien.filter((m) => zustand.koalition.partner.includes(verteilung[m.id])).map((m) => [m.id, verteilung[m.id]])),
});

// Beim Beschluss eines Reformwegs: Vertragsvorhaben erfüllt (Bonus) oder im selben Bereich ein anderer Weg (gebrochen)
export function vertragNachBeschluss(zustand, wegId) {
  const vertrag = zustand.koalition?.vertrag;
  if (!vertrag) return { vertrag, posten: [] };
  const w = alleWege.find((x) => x.id === wegId);
  const posten = [];
  const vorhaben = vertrag.vorhaben.map((v) => {
    if (v.status !== 'offen') return v;
    if (v.wegId === wegId) {
      posten.push({ ursache: `Koalitionsvertrag erfüllt: ${w.name}`, partei: v.partei, wert: kv.bonusUmsetzung });
      return { ...v, status: 'umgesetzt' };
    }
    const vw = alleWege.find((x) => x.id === v.wegId);
    if (!w.braucht && vw.bereich.id === w.bereich.id) {
      posten.push({ ursache: `Koalitionsvertrag gebrochen: ${w.name} statt ${vw.name}`, partei: v.partei, wert: -kv.strafeBruch });
      return { ...v, status: 'gebrochen' };
    }
    return v;
  });
  return { vertrag: { ...vertrag, vorhaben }, posten };
}

// Bis zu diesem Haushaltsjahr fällige Vorhaben (anteilig über die Wahlperiode, abgerundet: ein einzelnes Vorhaben erst
// zum letzten Haushalt der Wahlperiode)
export const faellig = (anzahl, jahr) => Math.floor((anzahl * jahr) / config.legislaturJahre);

// Beim Haushalt: deutliche Kürzungen in Partner-Ressorts und Rückstand bei den Vorhaben kosten den Partner
export function vertragHaushalt(zustand, stufen = {}) {
  const vertrag = zustand.koalition?.vertrag;
  if (!vertrag) return [];
  const posten = [];
  for (const [m, id] of Object.entries(vertrag.ressorts)) {
    if (!zustand.koalition.partner.includes(id) || (stufen[m] ?? 0) * config.haushalt.ministerSchrittProzent > -kv.kuerzungAbProzent) continue;
    posten.push({ ursache: `Koalitionsvertrag: Ressort ${ministerien.find((x) => x.id === m).kurz} deutlich gekürzt`, partei: id, wert: -kv.strafeKuerzung });
  }
  for (const id of zustand.koalition.partner) {
    const eigene = vertrag.vorhaben.filter((v) => v.partei === id);
    const rueckstand = faellig(eigene.length, zustand.haushalt.jahr) - eigene.filter((v) => v.status === 'umgesetzt').length;
    if (rueckstand > 0) posten.push({ ursache: `Koalitionsvertrag: ${rueckstand} Vorhaben im Rückstand`, partei: id, wert: -kv.strafeRueckstand * rueckstand });
  }
  return posten;
}

// Partner verlässt die Koalition: seine Vorhaben und Ressortzusagen entfallen
export const vertragOhne = (vertrag, gehen) => vertrag && ({
  vorhaben: vertrag.vorhaben.filter((v) => !gehen.includes(v.partei)),
  ressorts: Object.fromEntries(Object.entries(vertrag.ressorts).filter(([, id]) => !gehen.includes(id))),
});
