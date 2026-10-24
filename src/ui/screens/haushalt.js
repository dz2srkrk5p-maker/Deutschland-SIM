import { hinweisHtml } from '../components/hinweis.js';
import { parteien } from '../../data/parteien.js';
import { ministerien } from '../../data/ministerien.js';
import { config } from '../../data/config.js';
import { gruppen as gruppenListe } from '../../data/kennzahlen.js';
import { festeAusgaben2026 } from '../../data/haushalt.js';
import { vorschau, mrd, prognose, kuerzungsVorschlag } from '../../engine/haushalt.js';
import { gegenfinanzierung } from '../../engine/einnahmen.js';
import { haushaltsQuartal } from '../../engine/regierung.js';
import { bundesratAbstimmung } from '../../engine/bundesrat.js';
import { koalitionsParteien } from '../../engine/kabinett.js';
import { abstimmungHtml } from '../components/abstimmung.js';
import { bundesratHtml } from '../components/bundesrat.js';
import { koalitionslageHtml } from '../components/koalitionslage.js';
import { karte, tabs, status, punkt, zahl, plusMinus, badge, aufklapp, leer } from '../components/basis.js';

const hh = config.haushalt;
const partei = (id) => parteien.find((p) => p.id === id);
const euro = (tausend, n = 2) => `${zahl(mrd(tausend), n)} Mrd.`;
const prozentStufe = (stufe, schritt) => (stufe ? ` <small>(${plusMinus(stufe * schritt, 0)} %)</small>` : '');
const TABS = [
  { id: 'ueberblick', text: 'Übersicht' },
  { id: 'einnahmen', text: 'Einnahmen' },
  { id: 'ausgaben', text: 'Ausgaben' },
  { id: 'schulden', text: 'Schulden' },
  { id: 'prognose', text: 'Prognose' },
];
const KENNZAHL_TEXT = { wachstum: 'Wachstum', inflation: 'Inflation', arbeitslosigkeit: 'Arbeitslosigkeit', gini: 'Ungleichheit (Gini)' };
const gruppeName = (id) => gruppenListe.find((g) => g.id === id)?.name ?? id;

// Wirkung eines Entwurfs auf Kennzahlen und Gruppen als kurze Liste
function wirkungListe(w) {
  const teile = [
    ...Object.entries(KENNZAHL_TEXT).filter(([k]) => Math.abs(w[k] ?? 0) >= 0.005).map(([k, t]) => `${t} ${plusMinus(w[k])}${k === 'gini' ? '' : ' Pp'}`),
    ...Object.entries(w.gruppen ?? {}).filter(([, v]) => Math.abs(v) >= 0.05).map(([g, v]) => `${gruppeName(g)} ${plusMinus(v, 1)}`),
  ];
  return teile.length ? teile.join(' · ') : 'keine';
}

// Haushalt (System 2): Übersicht mit Bilanz und Einbringen, Einnahmen je Art, Ausgaben, Schulden und Mehrjahresprognose.
// Außerhalb des Haushaltsquartals nur lesbar. entwurf: { jahr, stufen, einnahmen, ausgestaltung, tab } aus app.js.
export function haushaltScreen(el, zustand, { entwurf, onBeschliessen }) {
  if (entwurf.jahr !== zustand.haushalt.jahr) Object.assign(entwurf, { jahr: zustand.haushalt.jahr, stufen: {}, einnahmen: {}, ausgestaltung: {} });
  const bearbeitbar = haushaltsQuartal(zustand) && !zustand.offenesEreignis;
  const maxMinister = hh.ministerMaxProzent / hh.ministerSchrittProzent;
  const verteilung = zustand.kabinett.verteilung;
  const params = () => ({ stufen: entwurf.stufen, einnahmen: entwurf.einnahmen, ausgestaltung: entwurf.ausgestaltung });

  const etatZeile = (m, v) => {
    const stufe = entwurf.stufen[m.id] ?? 0;
    return `
    <div class="posten ${bearbeitbar ? '' : 'nurlesen'}">
      <span>${punkt(partei(verteilung[m.id]).farbe)}${m.kurz}</span>
      <span class="betrag">${euro(v.etats[m.id])}${prozentStufe(stufe, hh.ministerSchrittProzent)}</span>
      ${bearbeitbar ? `
      <button data-etat="${m.id}" data-dir="-1" ${stufe <= -maxMinister ? 'aria-disabled="true"' : ''} aria-label="${m.kurz} senken">−</button>
      <button data-etat="${m.id}" data-dir="1" ${stufe >= maxMinister ? 'aria-disabled="true"' : ''} aria-label="${m.kurz} erhöhen">+</button>` : ''}
    </div>`;
  };

  function einnahmeZeile(z) {
    const a = z.art;
    const p = a.parameter;
    const d = entwurf.einnahmen[a.id] ?? 0;
    const ganz = p.startwert + (z.stufe) * p.schritt;
    const grenzeUnten = Math.abs(d - 1) > p.maxJeJahr || ganz - p.schritt < p.min - 1e-9;
    const grenzeOben = Math.abs(d + 1) > p.maxJeJahr || ganz + p.schritt > p.max + 1e-9;
    const ort = a.sondervermoegen ? badge(`Sondervermögen: ${a.sondervermoegen}`) : a.keinBund ? badge(`Aufkommen bei: ${a.keinBund}`) : '';
    const herleitung = `<table><tbody>
      <tr><th scope="row">Basis (Haushalt 2026, mit Wirtschaftsentwicklung)</th><td>${euro(z.basis)}</td></tr>
      ${z.stufen ? `<tr><th scope="row">Satzänderungen (${plusMinus(z.stufe, 0)} Stufen)</th><td>${euro(z.stufen)}</td></tr>` : ''}
      ${z.ausweichen ? `<tr><th scope="row">Ausweichen (Steuerflucht, Gestaltung)</th><td>${euro(z.ausweichen)}</td></tr>` : ''}
      ${z.verzoegerung ? `<tr><th scope="row">Verzögerung im ersten Jahr</th><td>${euro(z.verzoegerung)}</td></tr>` : ''}
      ${z.ausgestaltung ? `<tr><th scope="row">Ausgestaltung</th><td>${euro(z.ausgestaltung)}</td></tr>` : ''}
      ${z.reformen.map((r) => `<tr><th scope="row">Reform: ${r.quelle}</th><td>${euro(r.betrag)}</td></tr>`).join('')}
      <tr><th scope="row"><strong>Summe</strong></th><td><strong>${euro(z.summe)}</strong></td></tr>
    </tbody></table>
    <p class="klein">${a.erklaerung} Je Stufe: ${a.aufkommenJeStufe ? euro(a.aufkommenJeStufe) : 'keine Bundeseinnahme'}; Wirkung: ${wirkungListe(a.wirkungJeStufe)}.
      ${a.bundesrat ? 'Änderungen brauchen den Bundesrat.' : 'Ohne Bundesrat änderbar.'}${a.verfassung ? ' ⚠ Verfassungsrechtlich umstritten.' : ''}</p>
    ${a.ausgestaltung.length ? `<h4>Ausgestaltung</h4>${a.ausgestaltung.map((s) => {
      const an = entwurf.ausgestaltung[s.id] ?? zustand.haushalt.einnahmen.ausgestaltung.includes(s.id);
      return `<div class="posten nurlesen"><span>${s.name}<br><small>${s.kosten ? euro(s.kosten) + ' je Jahr · ' : ''}${wirkungListe(s.wirkung)}${s.verfassung ? ' · ⚠ verfassungsrechtlich umstritten' : ''}</small></span>
        ${bearbeitbar ? `<button data-schalter="${s.id}" aria-pressed="${an}">${an ? '✓ aktiv' : 'aktivieren'}</button>` : `<span>${an ? status('ok', 'aktiv') : 'aus'}</span>`}</div>`;
    }).join('')}` : ''}`;
    return `<div class="einnahme">
      <div class="posten ${bearbeitbar ? '' : 'nurlesen'}">
        <span><strong>${a.name}</strong> ${ort}<br><small>${p.name}: ${zahl(z.wert, p.schritt < 1 ? 1 : 0)} ${p.einheit}${d ? ` (${plusMinus(d * p.schritt, p.schritt < 1 ? 1 : 0)})` : ''}</small></span>
        <span class="betrag">${z.imKernhaushalt || a.sondervermoegen ? euro(z.summe) : '–'}</span>
        ${bearbeitbar ? `
        <button data-einnahme="${a.id}" data-dir="-1" ${grenzeUnten ? 'aria-disabled="true"' : ''} aria-label="${p.name} senken">−</button>
        <button data-einnahme="${a.id}" data-dir="1" ${grenzeOben ? 'aria-disabled="true"' : ''} aria-label="${p.name} erhöhen">+</button>` : ''}
      </div>
      ${aufklapp('Herleitung und Wirkung', herleitung)}
    </div>`;
  }

  function ueberblick(v) {
    const b = v.bilanz;
    const wirkung = Object.entries(v.wirkung).filter(([, w]) => w);
    const durchfallen = !v.bundestag.angenommen && zustand.koalition.minderheit;
    const kannEinbringen = durchfallen || (b.eingehalten && v.bundesrat?.mehrheit !== false);
    const etatSumme = Object.values(v.etats).reduce((s, x) => s + x, 0);
    const feste = b.ausgaben - etatSumme - b.zinsen - b.reformen;
    return `
      <div class="kennzahlen">
        ${karte(`<div class="bilanz">
          ${v.einnahmen.zeilen.filter((z) => z.imKernhaushalt).map((z) => `<span>${z.art.name}</span><span>${euro(z.summe, 1)}</span>`).join('')}
          <span><strong>Einnahmen</strong></span><span><strong>${euro(b.einnahmen)}</strong></span></div>`, { titel: 'Einnahmen' })}
        ${karte(`<div class="bilanz">
          <span>Ministerien</span><span>${euro(etatSumme, 1)}</span>
          <span>Zinsen</span><span>${euro(b.zinsen, 1)}</span>
          <span>Feste Posten</span><span>${euro(feste, 1)}</span>
          ${b.reformen ? `<span>Lösungen und Reformen</span><span>${euro(b.reformen, 1)}</span>` : ''}
          <span><strong>Ausgaben</strong></span><span><strong>${euro(b.ausgaben)}</strong></span></div>`, { titel: 'Ausgaben' })}
      </div>
      ${karte(`<div class="bilanz">
        <span>Saldo (Neuverschuldung)</span><span>${euro(-b.neueSchulden)}</span>
        <span>davon Verteidigungsausnahme</span><span>${euro(b.ausnahme)}</span>
        <span>Schuldenbremse</span><span>${status(b.eingehalten ? 'ok' : 'rot', `${euro(b.schuldenbremse)} von ${euro(b.grenze)}`)}</span>
        <span>Schuldenquote (Vorjahr)</span><span>${zahl(zustand.land.schuldenquote, 1)} %</span>
        <span>Bundestag</span><span>${status(v.bundestag.angenommen ? 'ok' : 'rot', `${v.bundestag.ja} Ja, ${v.bundestag.nein} Nein`)}</span>
        ${v.bundesrat ? `<span>Bundesrat (Steueränderung)</span><span>${status(v.bundesrat.mehrheit ? 'ok' : 'rot', `${v.bundesrat.ja} von ${v.bundesrat.noetig} Stimmen`)}</span>` : ''}
      </div>
      ${v.verfassung ? '<p class="gelb">⚠ Der Entwurf enthält verfassungsrechtlich umstrittene Abgaben.</p>' : ''}
      ${aufklapp('Abstimmungen im Detail', abstimmungHtml(v.bundestag, 'Bundestag über den Haushalt', true) + bundesratHtml(bundesratAbstimmung(koalitionsParteien(zustand))))}`, { titel: 'Saldo und Schuldenbremse' })}
      ${karte(`<p><strong>Umfragen:</strong> ${wirkung.length ? wirkung.map(([id, w]) => `${partei(id).name} ${plusMinus(w)}`).join(' · ') : 'keine Änderung'}</p>
        <p><strong>Kennzahlen und Gruppen:</strong> ${wirkungListe(v.kennzahlWirkung)}</p>`, { titel: 'Wirkung des Entwurfs' })}
      ${karte(koalitionslageHtml(zustand, v.anteile), { titel: 'Koalition' })}
      ${bearbeitbar ? karte(`
        ${durchfallen ? `<p class="rot">✗ Keine Mehrheit. Einbringen heißt: Der Vorjahreshaushalt gilt weiter, ${partei(zustand.kanzlerParteiId).name} ${plusMinus(-config.minderheit.umfrageVerlustHaushaltGescheitert, 1)} Punkte (Fehlschlag ${(zustand.koalition.fehlschlaege ?? 0) + 1} von ${config.minderheit.fehlschlaegeBisSpielende} bis zum Spielende).</p>` : ''}
        ${!b.eingehalten && !durchfallen ? '<p class="rot">✗ Schuldenbremse überschritten: unter „Einnahmen“ gibt es Vorschläge zur Gegenfinanzierung.</p>' : ''}
        ${v.bundesrat?.mehrheit === false && !durchfallen ? '<p class="rot">✗ Für die Steueränderung fehlt die Mehrheit im Bundesrat.</p>' : ''}
        <div class="knoepfe"><button id="beschliessen" class="${durchfallen ? 'gefahr primaer' : 'primaer'}" ${kannEinbringen ? '' : 'disabled'}>${durchfallen ? 'Trotzdem einbringen' : 'Haushalt einbringen'}</button></div>`) : ''}`;
  }

  function einnahmenTab(v) {
    const luecke = v.bilanz.schuldenbremse - v.bilanz.grenze;
    const vorschlaege = bearbeitbar && luecke > 0 ? gegenfinanzierung(zustand, params(), luecke).slice(0, 4) : [];
    const gruppen = [...new Set(v.einnahmen.zeilen.map((z) => z.art.gruppe))];
    return `
      ${luecke > 0 && bearbeitbar ? karte(`<p>Es fehlen ${euro(luecke)} bis zur Schuldenbremse. Möglichkeiten (nichts wird festgelegt):</p>
        <ul class="liste">${vorschlaege.map((x) => `<li>${x.art.name}: ${plusMinus(x.stufen, 0)} ${x.stufen === 1 ? 'Stufe' : 'Stufen'} (${zahl(x.stufen * x.art.parameter.schritt, 1)} ${x.art.parameter.einheit}), Wachstum ${plusMinus(x.wachstum)} Pp
          <button data-gegen="${x.art.id}" data-stufen="${x.stufen}">Übernehmen</button></li>`).join('') || '<li>Keine einzelne Einnahme reicht.</li>'}
          <li>Ausgaben kürzen (Partner-Ministerien zuerst) <button id="kuerzen">Kürzungen vorschlagen</button></li></ul>`, { titel: 'Gegenfinanzierung', klasse: 'ereignis' }) : ''}
      <p class="klein">Bundeshaushalt: ${euro(v.einnahmen.kern)}. Klima- und Transformationsfonds (zweckgebunden): ${euro(v.einnahmen.ktf)}.</p>
      ${gruppen.map((g) => karte(v.einnahmen.zeilen.filter((z) => z.art.gruppe === g).map(einnahmeZeile).join(''), { titel: g })).join('')}`;
  }

  function ausgabenTab(v) {
    const b = v.bilanz;
    return karte(ministerien.map((m) => etatZeile(m, v)).join(''), { titel: `Ministerien <small>(je Schritt ${hh.ministerSchrittProzent} %, höchstens ±${hh.ministerMaxProzent} %)</small>` })
      + karte(`<div class="bilanz">
        <span>Zinsen (Bundesschuld, wächst mit dem Schuldenstand)</span><span>${euro(b.zinsen)}</span>
        <span>Allgemeine Finanzverwaltung</span><span>${euro(festeAusgaben2026.finanzverwaltung)}</span>
        <span>Kanzleramt und Verfassungsorgane</span><span>${euro(festeAusgaben2026.verfassungsorgane)}</span>
        ${b.reformen ? `<span>Laufende Lösungen und Reformen</span><span>${euro(b.reformen)}</span>` : ''}
      </div>`, { titel: 'Feste Ausgaben' });
  }

  function schuldenTab(v) {
    const b = v.bilanz;
    const l = zustand.land;
    return karte(`<div class="bilanz">
      <span>Schulden des Staates (Ende Vorjahr)</span><span>${zahl(l.schulden)} Mrd.</span>
      <span>Bruttoinlandsprodukt</span><span>${zahl(l.bip)} Mrd.</span>
      <span>Schuldenquote</span><span>${zahl(l.schuldenquote, 1)} % ${l.schuldenquote > 60 ? '<small class="gelb">⚠ über 60 % (Maastricht)</small>' : ''}</span>
      <span>Neuverschuldung Bund (Entwurf)</span><span>${euro(b.neueSchulden)}</span>
      <span>Neue Schulden seit Spielbeginn</span><span>${euro(zustand.haushalt.neueSchuldenSeitStart)}</span>
      <span>Zinsausgaben des Bundes</span><span>${euro(b.zinsen)}</span>
    </div>`, { titel: 'Schuldenstand' })
      + karte(`<p>Die Schuldenbremse begrenzt die Neuverschuldung des Bundes ohne Verteidigungsausgaben über ${euro(hh.verteidigungsFreigrenze)}.
        Die Grenze wächst mit dem BIP; in schwachen Jahren erlaubt die Konjunkturkomponente mehr Kredit (${euro(hh.konjunkturJePunkt)} je Prozentpunkt Wachstum unter 0,2 %).</p>
        <div class="bilanz"><span>Grenze dieses Jahr</span><span>${euro(b.grenze)}</span><span>Zählt zur Schuldenbremse</span><span>${status(b.eingehalten ? 'ok' : 'rot', euro(b.schuldenbremse))}</span></div>
        <p class="klein">Zur Schuldenquote zählen auch Länder, Gemeinden und Sozialversicherung (${zahl(config.wirtschaft.uebrigesDefizitBip, 1)} % des BIP je Jahr, Spielwert).</p>`, { titel: 'Schuldenbremse' });
  }

  function prognoseTab() {
    const plan = prognose(zustand, {});
    const neu = prognose(zustand, params());
    const geaendert = Object.values(entwurf.stufen).some(Boolean) || Object.values(entwurf.einnahmen).some(Boolean) || Object.keys(entwurf.ausgestaltung).length;
    const zelle = (p) => `${euro(p.saldo, 1)} ${p.eingehalten ? '✓' : '<span class="rot">✗</span>'}`;
    return karte(`
      <p class="klein">Ohne Zufall, ohne neue Reformen und Probleme. ${geaendert ? 'Vergleich: beschlossener Stand gegen deinen Entwurf.' : 'Ändere Einnahmen oder Ausgaben, um einen Entwurf zu vergleichen.'}</p>
      <table><thead><tr><th scope="col">Jahr</th><th scope="col">Saldo Plan</th>${geaendert ? '<th scope="col">Saldo Entwurf</th>' : ''}<th scope="col">Schuldenquote Plan</th>${geaendert ? '<th scope="col">Entwurf</th>' : ''}<th scope="col">Wachstum ${geaendert ? 'Entwurf' : ''}</th></tr></thead>
      <tbody>${plan.map((p, i) => `<tr><th scope="row">+${i}</th><td>${zelle(p)}</td>${geaendert ? `<td>${zelle(neu[i])}</td>` : ''}<td>${zahl(p.schuldenquote, 1)} %</td>${geaendert ? `<td>${zahl(neu[i].schuldenquote, 1)} %</td>` : ''}<td>${zahl((geaendert ? neu[i] : p).wachstum, 1)} %</td></tr>`).join('')}</tbody></table>
      <p class="klein">✓ / ✗: Schuldenbremse eingehalten. Saldo negativ = Neuverschuldung.</p>`, { titel: 'Mehrjahresprognose (5 Jahre)' });
  }

  function zeichne() {
    let v;
    try {
      v = vorschau(zustand, params());
    } catch (fehler) {
      Object.assign(entwurf, { stufen: {}, einnahmen: {}, ausgestaltung: {} });
      v = vorschau(zustand, params());
    }
    const inhalt = { ueberblick: () => ueberblick(v), einnahmen: () => einnahmenTab(v), ausgaben: () => ausgabenTab(v), schulden: () => schuldenTab(v), prognose: prognoseTab }[entwurf.tab] ?? (() => leer('Nichts zu zeigen.'));
    el.innerHTML = `<div class="ansicht">
      <h1>Haushalt Jahr ${zustand.haushalt.jahr}</h1>
      ${hinweisHtml('regierung')}
      ${bearbeitbar ? '' : zustand.offenesEreignis ? '<div class="meldung">Erst auf das Ereignis in der Lage reagieren.</div>'
        : `<div class="meldung">Nur lesen: Der Haushalt wird im ${config.regierung.quartaleJeJahr}. Quartal aufgestellt. Gezeigt wird der laufende Haushalt.</div>`}
      ${tabs(TABS, entwurf.tab, 'Haushalt')}
      ${inhalt()}
    </div>`;
    binden();
  }

  // Nach einer Änderung neu zeichnen und den Fokus auf denselben Knopf zurücksetzen
  const neuZeichnen = (selektor) => { zeichne(); el.querySelector(selektor)?.focus(); };

  function binden() {
    el.querySelectorAll('[data-tab]').forEach((t) => t.addEventListener('click', () => ((entwurf.tab = t.dataset.tab), neuZeichnen(`[data-tab="${t.dataset.tab}"]`))));
    el.querySelectorAll('[data-etat]').forEach((k) => k.addEventListener('click', () => {
      if (k.getAttribute('aria-disabled') === 'true') return;
      entwurf.stufen[k.dataset.etat] = (entwurf.stufen[k.dataset.etat] ?? 0) + Number(k.dataset.dir);
      neuZeichnen(`[data-etat="${k.dataset.etat}"][data-dir="${k.dataset.dir}"]`);
    }));
    el.querySelectorAll('[data-einnahme]').forEach((k) => k.addEventListener('click', () => {
      if (k.getAttribute('aria-disabled') === 'true') return;
      entwurf.einnahmen[k.dataset.einnahme] = (entwurf.einnahmen[k.dataset.einnahme] ?? 0) + Number(k.dataset.dir);
      neuZeichnen(`[data-einnahme="${k.dataset.einnahme}"][data-dir="${k.dataset.dir}"]`);
    }));
    el.querySelectorAll('[data-schalter]').forEach((k) => k.addEventListener('click', () => {
      const id = k.dataset.schalter;
      const jetzt = entwurf.ausgestaltung[id] ?? zustand.haushalt.einnahmen.ausgestaltung.includes(id);
      if (!jetzt === zustand.haushalt.einnahmen.ausgestaltung.includes(id)) delete entwurf.ausgestaltung[id];
      else entwurf.ausgestaltung[id] = !jetzt;
      neuZeichnen(`[data-schalter="${id}"]`);
    }));
    el.querySelectorAll('[data-gegen]').forEach((k) => k.addEventListener('click', () => {
      entwurf.einnahmen[k.dataset.gegen] = (entwurf.einnahmen[k.dataset.gegen] ?? 0) + Number(k.dataset.stufen);
      entwurf.tab = 'ueberblick';
      neuZeichnen('#beschliessen');
    }));
    el.querySelector('#kuerzen')?.addEventListener('click', () => {
      const vorschlag = kuerzungsVorschlag(zustand, params());
      if (vorschlag) entwurf.stufen = vorschlag.stufen;
      entwurf.tab = 'ausgaben';
      neuZeichnen('[data-tab="ausgaben"]');
    });
    el.querySelector('#beschliessen')?.addEventListener('click', () => onBeschliessen(params()));
  }
  zeichne();
}
