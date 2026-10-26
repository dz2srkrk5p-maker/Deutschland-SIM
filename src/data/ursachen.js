// Ursache je Ansatz (Epochen-Etappe 5, docs/epochen-spec.md): „Geld, Regeln oder Angebot“. VORSCHLAG, vom Nutzer zu prüfen:
// eingeordnet nach dem Kern des Ansatzes – geld = Geldleistung, Zuschuss, Förderung, Kapitalstock; regeln = Gesetz, Vorschrift,
// Verfahren, Steuerrecht; angebot = der Staat schafft oder baut etwas (Plätze, Netze, Personal, Einrichtungen).
// Schlüssel: Id eines Reformwegs (src/data/reformwege.js) oder einer Lösung (src/data/probleme.js, epochen.js, generationen.js).
export const ursachen = {
  // Reformwege
  r_kapital: 'geld', r_umlage: 'geld', r_buerger: 'regeln', r_eintritt: 'regeln', r_generationenkapital: 'geld', r_mindestrente: 'geld',
  st_einfach: 'regeln', st_mitte: 'regeln', st_oeko: 'regeln', st_vermoegen: 'regeln', st_unternehmen: 'regeln',
  g_buerger: 'regeln', g_wettbewerb: 'regeln', g_planung: 'angebot', g_praevention: 'angebot', g_einheitskasse: 'geld',
  b_bund: 'regeln', b_leistung: 'regeln', b_ganztag: 'angebot', b_digital: 'angebot',
  a_flex: 'regeln', a_grundsicherung: 'geld', a_mindestlohn: 'regeln', a_jobgarantie: 'angebot', a_einwanderung: 'regeln',
  e_markt: 'regeln', e_turbo: 'angebot', e_staat: 'geld', e_kern: 'angebot', e_netze: 'angebot', e_wasserstoff: 'angebot', e_smr: 'angebot',
  m_steuerung: 'regeln', m_grenze: 'regeln', m_integration: 'angebot', m_eu: 'regeln',
  v_wehrpflicht: 'regeln', v_aufruestung: 'geld', v_europa: 'regeln', v_diplomatie: 'regeln', v_euruestung: 'angebot',
  w_bauen: 'regeln', w_deckel: 'regeln', w_gemeinnuetzig: 'angebot', w_eigentum: 'geld', w_bodenfonds: 'angebot',
  d_staat: 'regeln', d_markt: 'regeln', d_souveraen: 'angebot',
  // Lösungen
  fk_einwanderung: 'regeln', fk_ausbildung: 'angebot', fk_arbeitszeit: 'geld',
  wohnen1: 'angebot', wohnen2: 'regeln', wohn_deregulierung: 'regeln',
  pflege1: 'geld', pflege2: 'angebot', pflege_markt: 'geld',
  rente_zuschuss: 'geld', rente_flexi: 'regeln',
  energie_netze: 'geld', energie_ausbau: 'angebot', energie_angebot: 'angebot',
  klima_anpassung: 'geld', klima_sofort: 'geld',
  schiene1: 'angebot', schiene2: 'angebot', infra_ppp: 'regeln',
  bildung_startchancen: 'geld', bildung_standards: 'regeln',
  digital_verwaltung: 'angebot', digital_netze: 'angebot',
  inflation_entlastung: 'geld', inflation_disziplin: 'regeln',
  rezession_investitionen: 'geld', rezession_industrie: 'geld', rezession_buerokratie: 'regeln',
  schulden_konsolidierung: 'regeln', schulden_steuern: 'regeln',
  cyber_bsi: 'angebot', cyber_eu: 'regeln',
  migration_integration: 'angebot', migration_begrenzung: 'regeln', migration_eu: 'regeln',
  spaltung_mindestlohn: 'regeln', spaltung_aufstieg: 'angebot',
  polar_demokratie: 'angebot', polar_plattformen: 'regeln',
  sicherheit_polizei: 'angebot', sicherheit_praevention: 'angebot',
  gesundheit_studienplaetze: 'angebot', gesundheit_klinikreform: 'regeln',
  bw_beschaffung: 'regeln', bw_wehrdienst: 'regeln', bw_europa: 'regeln',
  geo_diversifizierung: 'angebot', geo_diplomatie: 'regeln',
  agrar_entlastung: 'regeln', agrar_tierwohl: 'geld',
  kommunen_altschulden: 'geld', kommunen_konnexitaet: 'regeln',
  vertrauen_buergerraete: 'regeln', vertrauen_leistung: 'angebot',
  pandemie_eindaemmung: 'angebot', pandemie_offen: 'regeln',
  demografie_familie: 'geld', demografie_zuwanderung: 'regeln',
  // Platzhalter (Epochen, Generationen)
  rw_uebergang: 'regeln', rw_beitragszahler: 'angebot', kz_programm: 'geld', kz_monitoring: 'regeln',
  ve_gemeinsam: 'regeln',
};

export const ursachenNamen = { geld: 'Geld', regeln: 'Regeln', angebot: 'Angebot' };
