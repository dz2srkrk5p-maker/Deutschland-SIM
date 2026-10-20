// ============================================================
// MINISTER-LOGIC.JS — Generierung, Kompetenz-Modifikatoren, Events
//
// Was: Generiert Minister-Objekte, berechnet Kompetenz-Effekte
//      auf Gesetze/Haushalt, rollt Skandale/Initiativen/Konflikte.
//
// Nutzt: minister-data.js (MINISTRY_DEFS, INITIATIVE_TEMPLATES,
//        SCANDAL_TYPES, Namensdaten)
//
// Erweiterungspunkte:
//   - MINISTRY_DEFS in minister-data.js um neue Ministerien erweitern
//   - INITIATIVE_TEMPLATES für neue Persönlichkeitstypen ergänzen
//   - getMinisterLawModifier() für weitere Gesetzeskategorien erweitern
// ============================================================

import {
  MALE_FIRST, FEMALE_FIRST, LAST_NAMES, TITLES,
  PERSONALITY_PROFILES, MINISTRY_DEFS,
  INITIATIVE_TEMPLATES, SCANDAL_TYPES,
} from './minister-data.js';

// ── ZUFALLS-HELFER ────────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const PERSONALITIES = ['Pragmatiker', 'Karrierist', 'Idealist', 'Hardliner'];

// ── MINISTER GENERIEREN ───────────────────────────────────────

export function generateMinister(ministryDef, party) {
  const isFemale   = Math.random() < 0.36;
  const firstName  = pick(isFemale ? FEMALE_FIRST : MALE_FIRST);
  const lastName   = pick(LAST_NAMES);
  const titleRaw   = pick(TITLES);
  const title      = titleRaw ? titleRaw + ' ' : '';
  const fullName   = `${title}${firstName} ${lastName}`;
  const personality = pick(PERSONALITIES);
  const competence  = rnd(22, 96);
  const profile     = pick(PERSONALITY_PROFILES[personality]);

  return {
    ministry:           ministryDef.name,
    name:               fullName,
    firstName,
    lastName,
    title:              title.trim(),
    gender:             isFemale ? 'f' : 'm',
    party,
    competence,
    personality,
    profile,
    satisfaction:       70,
    inScandal:          false,
    scandalType:        null,
    investigationQuartersLeft: 0,
    dismissalWarning:   false,
    termSuccesses:      0,
    termFailures:       0,
    lastActionLabel:    null,
    lastActionQuarter:  null,
    firingCount:        0,   // Entlassungen im Ressort diese Legislatur
  };
}

export function generateAllMinisters(state) {
  const ministryAssignments = state.government.ministries ?? {};
  const ministers = [];

  for (const def of MINISTRY_DEFS) {
    const party = ministryAssignments[def.name] ?? state.government.chancellorParty ?? '';
    ministers.push(generateMinister(def, party));
  }

  return ministers;
}

export function createReplacementMinister(oldMinister, state) {
  const def   = MINISTRY_DEFS.find(d => d.name === oldMinister.ministry) ?? MINISTRY_DEFS[0];
  const party = oldMinister.party;
  const newMin = generateMinister(def, party);
  // 60% Chance der Nachfolger ist schwächer
  if (Math.random() < 0.60) {
    newMin.competence = Math.max(10, oldMinister.competence - rnd(5, 25));
  }
  newMin.firingCount = (oldMinister.firingCount || 0) + 1;
  return newMin;
}

// ── BUDGET-ZUFRIEDENHEIT ─────────────────────────────────────

function _computeBudgetSatisfaction(minister, state) {
  const def = MINISTRY_DEFS.find(d => d.name === minister.ministry);
  if (!def || !def.ressortKey) return 70; // Ministerien ohne Haushalt-Ressort

  const alloc = state.scheduling?.lastHaushaltAllocation;
  if (!alloc) return 70;

  const actualFrac = alloc[def.ressortKey] ?? 0;
  const neutral    = def.neutralFrac ?? 0.1;

  if (actualFrac >= neutral * 1.3) return 95;
  if (actualFrac >= neutral)       return 80;
  if (actualFrac >= neutral * 0.7) return 55;
  if (actualFrac >= neutral * 0.4) return 30;
  return 15;
}

// ── MINISTER-STATUS ────────────────────────────────────────────

export function computeMinisterStatus(minister, state) {
  if (minister.inScandal || minister.investigationQuartersLeft > 0) return 'kritisch';
  const budgetSat = _computeBudgetSatisfaction(minister, state);
  if (minister.competence < 35 || budgetSat < 35 || minister.satisfaction < 30) return 'kritisch';
  if (minister.competence < 55 || budgetSat < 55 || minister.satisfaction < 50) return 'angespannt';
  return 'stabil';
}

export function getMinisterBudgetSatisfaction(minister, state) {
  return _computeBudgetSatisfaction(minister, state);
}

// ── KOMPETENZ-MODIFIER FÜR GESETZE ────────────────────────────

const CATEGORY_TO_MINISTRY = {
  wirtschaft:   ['Wirtschaft', 'Finanzen'],
  soziales:     ['Soziales', 'Arbeit', 'Gesundheit'],
  klima:        ['Umwelt'],
  sicherheit:   ['Innen', 'Justiz', 'Verteidigung'],
  international:['Außen', 'Verteidigung'],
};

export function getMinisterLawModifier(law, state) {
  const ministryNames = CATEGORY_TO_MINISTRY[law.category] ?? [];
  const ministers = state.ministers ?? [];
  for (const mn of ministryNames) {
    const m = ministers.find(mi => mi.ministry === mn);
    if (!m) continue;
    if (m.competence > 70) return { multiplier: 1.20, minister: m };
    if (m.competence < 40) return { multiplier: 0.80, minister: m };
    return { multiplier: 1.00, minister: m };
  }
  return { multiplier: 1.00, minister: null };
}

// ── POLICY-EFFEKT-MODIFIER ────────────────────────────────────

export function getMinisterEffectMultiplier(minister) {
  if (!minister) return 1.0;
  if (minister.competence > 70) return 1.15;
  if (minister.competence < 40) return 0.85;
  return 1.0;
}

// ── INITIATIVE-EVENTS ─────────────────────────────────────────

export function rollInitiativeEvent(state, hasMainEvent) {
  if (hasMainEvent && Math.random() < 0.70) return null; // Hauptereignis hat Vorrang
  if (Math.random() < 0.55) return null; // ~45% Chance pro Quartal

  const ministers = state.ministers ?? [];
  if (ministers.length === 0) return null;

  // Nicht-skandalisierte Minister wählen
  const eligible = ministers.filter(m => !m.inScandal && m.investigationQuartersLeft === 0);
  if (eligible.length === 0) return null;

  const minister = pick(eligible);
  const miniDef  = MINISTRY_DEFS.find(d => d.name === minister.ministry);

  // Passende Vorlage finden (Ministry-spezifisch)
  const templates = INITIATIVE_TEMPLATES.filter(t => t.ministry === minister.ministry);
  if (templates.length === 0) return null;

  // Persönlichkeits-präferierte Vorlage bevorzugen, sonst zufällig
  const preferred = templates.filter(t => t.personalities?.includes(minister.personality));
  const tmpl = pick(preferred.length > 0 ? preferred : templates);

  const tq = state.government.termQuarter ?? 0;

  // Label und Description interpolieren
  const titleName = minister.title ? `${minister.title} ${minister.lastName}` : minister.lastName;
  const interp = (s) => s
    ?.replace(/{name}/g, minister.name)
    ?.replace(/{titleName}/g, titleName)
    ?.replace(/{lastName}/g, minister.lastName)
    ?.replace(/{title}/g, minister.title || '')
    ?? '';

  return {
    id:          `init-${minister.ministry}-q${tq}-${Date.now()}`,
    type:        'minister-initiative',
    label:       interp(tmpl.label),
    description: interp(tmpl.description),
    ministerId:  minister.ministry,
    ministerName: minister.name,
    personality: minister.personality,
    icon:        miniDef?.icon ?? '📋',
    choices:     tmpl.choices.map(c => ({
      ...c,
      label:       c.label,
      description: c.desc ?? '',
    })),
  };
}

// ── SKANDAL-EVENTS ────────────────────────────────────────────

export function rollScandalEvents(state) {
  const events  = [];
  const ministers = state.ministers ?? [];

  for (const minister of ministers) {
    if (minister.inScandal || minister.investigationQuartersLeft > 0) continue;

    // Basiswahr.: 8%, höher bei niedrigerer Kompetenz
    const baseChance = 0.08;
    const compBonus  = Math.max(0, (50 - minister.competence) / 50) * 0.08;
    if (Math.random() >= baseChance + compBonus) continue;

    // Skandaltyp auswählen (niedrige Kompetenz → schwerere Typen)
    const suitable = SCANDAL_TYPES.filter(s =>
      minister.competence < s.competenceThreshold
    );
    const pool = suitable.length > 0 ? suitable : SCANDAL_TYPES;
    const scandal = pick(pool);

    const titleName = minister.title ? `${minister.title} ${minister.lastName}` : minister.lastName;
    const interp = (s) => s
      ?.replace(/{name}/g, minister.name)
      ?.replace(/{titleName}/g, titleName)
      ?.replace(/{lastName}/g, minister.lastName)
      ?.replace(/{ministry}/g, minister.ministry)
      ?? '';

    const tq = state.government.termQuarter ?? 0;

    events.push({
      id:          `scandal-${minister.ministry}-q${tq}-${Date.now()}`,
      type:        'minister-scandal',
      label:       interp(scandal.eventLabel),
      description: interp(scandal.description),
      scandalTypeId: scandal.id,
      scandalLabel:  scandal.label,
      ministerId:    minister.ministry,
      ministerName:  minister.name,
      choices:       scandal.choices.map(c => ({
        ...c,
        description: c.desc ?? '',
      })),
    });

    // Nur 1 Skandal pro Quartal insgesamt
    break;
  }

  return events;
}

// ── RESSORTSTREIT-EVENT ───────────────────────────────────────

export function rollConflictEvent(state, hasMainEvent) {
  if (hasMainEvent) return null;
  if (Math.random() >= 0.20) return null;

  const ministers = state.ministers ?? [];
  const finMin  = ministers.find(m => m.ministry === 'Finanzen');
  const sozMin  = ministers.find(m => m.ministry === 'Soziales');
  if (!finMin || !sozMin || finMin.party === sozMin.party) return null;

  const tq = state.government.termQuarter ?? 0;
  return {
    id:          `conflict-fin-soz-q${tq}`,
    type:        'minister-conflict',
    label:       `Ressortstreit: ${finMin.lastName} vs. ${sozMin.lastName}`,
    description: `Finanzminister ${finMin.name} (${finMin.party}) und Sozialminister ${sozMin.name} (${sozMin.party}) streiten öffentlich über die Haushaltsverteilung. Die Medien greifen den Konflikt auf.`,
    ministerId:  null,
    choices: [
      {
        id: 'fin', label: `${finMin.lastName} Recht geben`,
        description: 'Sparsamkeit hat Vorrang. Der Sozialminister ist unzufrieden.',
        immediateEffects: { 'economy.debtRatio': -2, 'society.socialJustice': -4 },
        coalitionStabilityDelta: -6,
        ministerSatisfactionByMinistry: { 'Finanzen': +10, 'Soziales': -18 },
      },
      {
        id: 'soz', label: `${sozMin.lastName} Recht geben`,
        description: 'Soziale Gerechtigkeit hat Vorrang. Der Finanzminister ist unzufrieden.',
        immediateEffects: { 'society.socialJustice': +4, 'economy.debtRatio': +2 },
        coalitionStabilityDelta: -6,
        ministerSatisfactionByMinistry: { 'Finanzen': -18, 'Soziales': +10 },
      },
      {
        id: 'kompromiss', label: 'Kompromiss vermitteln',
        description: 'Beide Seiten machen Zugeständnisse. Niemand ist begeistert, aber der Koalitionsfrieden wird gewahrt.',
        immediateEffects: {},
        coalitionStabilityDelta: -2,
        ministerSatisfactionByMinistry: { 'Finanzen': -6, 'Soziales': -6 },
      },
    ],
  };
}

// ── UNTERSUCHUNGS-RESOLUTION ──────────────────────────────────

export function checkInvestigationResolutions(state) {
  const events   = [];
  const ministers = state.ministers ?? [];

  for (const minister of ministers) {
    if (minister.investigationQuartersLeft <= 0) continue;
    if (minister.investigationQuartersLeft > 1) continue; // Noch nicht fertig

    // Ausschuss beendet → Ergebnis
    const freispruch = Math.random() < 0.55;
    const tq = state.government.termQuarter ?? 0;
    const titleName = minister.title ? `${minister.title} ${minister.lastName}` : minister.lastName;

    events.push({
      id:          `investigation-result-${minister.ministry}-q${tq}`,
      type:        'minister-resolution',
      label:       freispruch
        ? `Untersuchungsausschuss entlastet ${titleName}`
        : `Untersuchungsausschuss belastet ${titleName}`,
      description: freispruch
        ? `Der parlamentarische Untersuchungsausschuss kommt zu dem Ergebnis, dass ${minister.name} keine Dienstpflichtverletzung begangen hat. Der Minister ist entlastet.`
        : `Der Ausschuss stellt erhebliche Pflichtverletzungen durch ${minister.name} fest. Der politische Druck auf die Bundesregierung wächst.`,
      ministerId:   minister.ministry,
      ministerName: minister.name,
      freispruch,
      choices: freispruch
        ? [{
            id: 'ok', label: 'Zur Kenntnis nehmen',
            immediateEffects: { 'politics.mediaRelations': +5 },
            coalitionStabilityDelta: +3, clearInvestigation: true, clearScandal: true,
          }]
        : [
            { id: 'keep', label: 'Trotzdem im Amt lassen',
              immediateEffects: { 'politics.mediaRelations': -12 },
              coalitionStabilityDelta: -5, clearInvestigation: true, clearScandal: true },
            { id: 'fire', label: 'Jetzt entlassen',
              immediateEffects: { 'politics.mediaRelations': +4 },
              coalitionStabilityDelta: -12, firesMinister: true, clearInvestigation: true, clearScandal: true },
          ],
    });
  }

  return events;
}

// ── STERNE-RENDER ─────────────────────────────────────────────

export function competenceToStars(competence) {
  const filled = Math.round(competence / 20); // 0–5
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="min-star ${i < filled ? 'min-star--on' : ''}">${i < filled ? '★' : '☆'}</span>`
  ).join('');
}

export function competenceLabel(competence) {
  if (competence >= 80) return 'Hervorragend';
  if (competence >= 65) return 'Gut';
  if (competence >= 50) return 'Durchschnittlich';
  if (competence >= 35) return 'Schwach';
  return 'Inkompetent';
}
