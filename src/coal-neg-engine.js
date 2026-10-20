// ============================================================
// COAL-NEG-ENGINE.JS — Spiellogik für Koalitionsverhandlungen
// ============================================================

import { WORKING_GROUPS, PARTY_LEADERS, PARTY_SHOWSTOPPERS, MINISTRY_WISH_LISTS,
         FORMULATIONS, MEDIA_TEMPLATES, LEAK_SUBJECTS } from './coal-neg-data.js';
import { PARTY_POSITIONS, MINISTERIEN } from './engine/state.js';

// ── INITIALISIERUNG ───────────────────────────────────────────

export function createNegotiationState(coalition, playerParty, seats) {
  const partyStates = {};
  for (const party of coalition) {
    const leader = PARTY_LEADERS[party] || { name: party, personality: 'Pragmatiker', icon: '?' };
    partyStates[party] = {
      satisfaction: 75,
      leader: { ...leader },
      originalPersonality: leader.personality,
      hasLeft: false,
      memberVotePending: false,
      leaderChanged: false,
    };
  }

  // AG state: progress + topic resolutions
  const ags = {};
  for (const ag of WORKING_GROUPS) {
    ags[ag.id] = {
      progress: 0,
      topics: Object.fromEntries(ag.subTopics.map(t => [t.id, null])),
      // null = unresolved, { value, formulation } = resolved
    };
  }

  // Ministries: all unassigned
  const ministries = Object.fromEntries(MINISTERIEN.map(m => [m.name, null]));

  return {
    coalition,
    playerParty,
    seats,
    round: 1,
    maxRounds: 8,
    actionPoints: 3,
    maxActionPoints: 3,
    isNachtsitzung: false,
    ags,
    partyStates,
    ministries,
    packageItems: [],  // { agId, topicId, value, formulation }
    mediaComment: 'Verhandlungen beginnen. Die Parteien treffen sich erstmals am Verhandlungstisch.',
    mediaSentiment: 'neutral',
    leakDamping: 1.0,
    pastLeaks: [],
    pendingLeak: null,
    leakReacted: true,
    roundHistory: [],
    view: 'ag-select',  // 'ag-select' | 'topic-detail' | 'package-builder' | 'ministry-offers'
    viewData: {},
    status: 'active',   // 'active' | 'contract-ready' | 'failed-neuwahl' | 'failed-minority' | 'signed'
    ausschussRep: null,
    pendingRoundResults: null,
  };
}

// ── AKTIONSPUNKTE ─────────────────────────────────────────────

// Öffnet das Sub-Topic-Detail-View für eine AG (kostet noch keinen AP)
export function openAGDetail(state, agId) {
  const ag = WORKING_GROUPS.find(g => g.id === agId);
  if (!ag) return;
  // Find next unresolved topic
  const nextTopic = ag.subTopics.find(t => !state.ags[agId].topics[t.id]);
  state.view = 'topic-detail';
  state.viewData = {
    agId,
    topicId: nextTopic?.id || ag.subTopics[0].id,
    playerValue: getPlayerDefaultPosition(state, agId, nextTopic?.id || ag.subTopics[0].id),
    formulation: 'aspiring',
  };
}

export function selectTopicInDetail(state, topicId) {
  state.viewData.topicId = topicId;
  state.viewData.playerValue = getPlayerDefaultPosition(state, state.viewData.agId, topicId);
  state.viewData.formulation = 'aspiring';
}

// Tatsächliches Verhandeln: kostet 1 AP
export function resolveTopic(state, agId, topicId, value, formulation) {
  if (state.actionPoints <= 0 && !state.isNachtsitzung) return { error: 'Keine Aktionspunkte mehr.' };

  const ag = WORKING_GROUPS.find(g => g.id === agId);
  const topic = ag?.subTopics.find(t => t.id === topicId);
  if (!topic) return { error: 'Thema nicht gefunden.' };

  // Resolve the topic
  state.ags[agId].topics[topicId] = { value, formulation };
  state.ags[agId].progress = Math.min(100, state.ags[agId].progress + agTopicIncrement(agId));
  syncAGProgress(state, agId); // guarantee 100% when all done

  if (!state.isNachtsitzung) state.actionPoints--;

  // Calculate party reactions
  const reactions = {};
  for (const party of state.coalition) {
    if (party === state.playerParty) continue;
    reactions[party] = evaluateTopicForParty(state, party, agId, topicId, value, formulation);
    // Apply satisfaction change
    state.partyStates[party].satisfaction += reactions[party].satisfactionDelta;
    state.partyStates[party].satisfaction = Math.max(0, Math.min(100, state.partyStates[party].satisfaction));
  }

  // Check for personality-driven interrupts
  const interrupts = checkPersonalityInterrupts(state);

  // Switch back to AG select
  state.view = 'ag-select';
  state.viewData = {};

  _logReadinessStatus(state);
  return { success: true, reactions, interrupts, agId, topicId };
}

function evaluateTopicForParty(state, party, agId, topicId, value, formulation) {
  const topic = getTopicData(agId, topicId);
  if (!topic) return { accepts: true, reason: '', satisfactionDelta: 0 };

  const partyIdeal = topic.partyPositions[party] ?? 50;
  const distance = Math.abs(partyIdeal - value);
  const leader = state.partyStates[party].leader;
  const formulationData = FORMULATIONS.find(f => f.id === formulation);

  let accepts = true;
  let reason = '';
  let satisfactionDelta = 0;

  // Base satisfaction impact: distance from ideal
  if (distance <= 10) {
    satisfactionDelta = +3;
  } else if (distance <= 25) {
    satisfactionDelta = 0;
  } else if (distance <= 40) {
    satisfactionDelta = -(formulationData?.satisfactionCost || 6);
  } else {
    satisfactionDelta = -(formulationData?.satisfactionCost || 6) * 1.5;
  }

  // Personality modifiers
  switch (leader.personality) {
    case 'Hardliner':
      if (formulation === 'examining') {
        accepts = false;
        reason = `${leader.name} akzeptiert keine unverbindlichen Formulierungen.`;
        satisfactionDelta -= 5;
      } else if (distance > 35) {
        accepts = false;
        reason = `${leader.name}: "Das ist keine tragbare Grundlage."`;
        satisfactionDelta -= 8;
      } else {
        reason = distance <= 15 ? `${leader.name} nickt knapp.` : `${leader.name} akzeptiert widerwillig.`;
      }
      break;

    case 'Pragmatiker':
      accepts = distance <= 45 && formulation !== 'examining';
      reason = accepts
        ? `${leader.name}: "Einverstanden — aber wir brauchen eine Gegenleistung bei [anderem Thema]."` // simplified
        : `${leader.name}: "Das Paket ist noch nicht ausgewogen genug."`;
      if (!accepts) satisfactionDelta -= 4;
      break;

    case 'Egomane':
      // Happier if they have a prestigious ministry
      const hasPrestMin = Object.entries(state.ministries)
        .some(([m, p]) => p === party && (MINISTERIEN.find(x => x.name === m)?.power ?? 0) >= 7);
      const prestigeBonus = hasPrestMin ? 15 : 0;
      satisfactionDelta += prestigeBonus > 0 ? 3 : 0;
      accepts = (distance <= 40 || hasPrestMin) && formulation !== 'examining';
      reason = hasPrestMin
        ? `${leader.name} ist zufrieden — das Ministerium macht vieles erträglicher.`
        : distance > 40
          ? `${leader.name} fühlt sich übergangen. Ein wichtiges Ministerium würde helfen.`
          : `${leader.name} nimmt zur Kenntnis.`;
      break;

    case 'Idealist':
      // Check if any showstopper is violated
      const showstoppers = (PARTY_SHOWSTOPPERS[party] || []).filter(ss => ss.topicId === topicId);
      const violated = showstoppers.some(ss => {
        const condMet = ss.cond === 'gte' ? value >= ss.threshold : value <= ss.threshold;
        return !condMet || !ss.formulations.includes(formulation);
      });
      if (violated) {
        accepts = false;
        reason = `${leader.name} bricht die Verhandlung ab: Kernwert verletzt!`;
        satisfactionDelta -= 20;
      } else {
        accepts = distance <= 35;
        reason = accepts
          ? `${leader.name}: "Das entspricht unseren Werten."`
          : `${leader.name}: "Das kann ich meiner Basis nicht vermitteln."`;
        if (!accepts) satisfactionDelta -= 10;
      }
      break;
  }

  return { accepts, reason, satisfactionDelta: Math.round(satisfactionDelta) };
}

function checkPersonalityInterrupts(state) {
  const interrupts = [];
  for (const party of state.coalition) {
    if (party === state.playerParty) continue;
    const ps = state.partyStates[party];
    if (ps.satisfaction < 15 && !ps.leaderChanged) {
      // Leader change!
      const oldPersonality = ps.leader.personality;
      const personalities = ['Hardliner', 'Pragmatiker', 'Egomane', 'Idealist'];
      const others = personalities.filter(p => p !== oldPersonality);
      ps.leader.personality = others[Math.floor(Math.random() * others.length)];
      ps.leaderChanged = true;
      interrupts.push({ type: 'leader-change', party, oldPersonality, newPersonality: ps.leader.personality });
    } else if (ps.satisfaction < 30 && !ps.memberVotePending && !ps.leaderChanged) {
      ps.memberVotePending = true;
      interrupts.push({ type: 'member-vote', party });
    }
  }
  return interrupts;
}

function getPlayerDefaultPosition(state, agId, topicId) {
  const topic = getTopicData(agId, topicId);
  return topic?.partyPositions[state.playerParty] ?? 50;
}

function getTopicData(agId, topicId) {
  const ag = WORKING_GROUPS.find(g => g.id === agId);
  return ag?.subTopics.find(t => t.id === topicId);
}

// Progress increment per topic: distributes 100% evenly.
// For 3 topics: ceil(100/3)=34 → 34+34+34=102 → min(100)=100 on last topic.
function agTopicIncrement(agId) {
  const ag = WORKING_GROUPS.find(g => g.id === agId);
  return ag ? Math.ceil(100 / ag.subTopics.length) : 34;
}

// Guarantee 100% when every topic is resolved.
function syncAGProgress(state, agId) {
  const ag = WORKING_GROUPS.find(g => g.id === agId);
  if (!ag) return;
  const resolvedCount = ag.subTopics.filter(t => state.ags[agId].topics[t.id] !== null).length;
  if (resolvedCount === ag.subTopics.length) {
    state.ags[agId].progress = 100;
    console.log(`%cAG ${ag.label}: 100%, Status: Completed`, 'color:#3fb950;font-weight:bold');
    _logReadinessStatus(state);
  }
}

// Debug helper: logs what is still blocking the contract (not exported).
function _logReadinessStatus(state) {
  const agsDone   = WORKING_GROUPS.every(ag => (state.ags[ag.id]?.progress ?? 0) === 100);
  const minisDone = MINISTERIEN.every(m => !!state.ministries[m.name]);
  const stoppers  = checkShowstoppers(state);
  const stopsDone = state.coalition.every(p => !(stoppers[p] || []).some(ss => !ss.met));

  if (agsDone && minisDone && stopsDone) {
    console.log('%c✓ KOALITIONSVERTRAG UNTERZEICHNUNGSBEREIT — Submit-Button erscheint jetzt!', 'color:#3fb950;font-weight:bold;font-size:14px');
    // Zeige auto-erfüllte Showstopper zur Transparenz
    for (const p of state.coalition) {
      for (const ss of (stoppers[p] || []).filter(s => s.autoFulfilled)) {
        console.info(`%c[Auto-Erfüllt] ${p} / ${ss.id} "${ss.label}": ${ss.reason}`, 'color:#8b949e');
      }
    }
    return;
  }

  const missing = [];

  if (!agsDone) {
    WORKING_GROUPS.filter(ag => (state.ags[ag.id]?.progress ?? 0) < 100)
      .forEach(ag => missing.push(`AG "${ag.label}" ${state.ags[ag.id]?.progress}%`));
  }

  if (!minisDone) {
    const u = MINISTERIEN.filter(m => !state.ministries[m.name]).map(m => m.name);
    missing.push(`Ministerien nicht vergeben: ${u.join(', ')}`);
  }

  if (!stopsDone) {
    for (const p of state.coalition) {
      for (const ss of (stoppers[p] || []).filter(s => !s.met)) {
        const agProgress = state.ags[ss.agId]?.progress ?? 0;
        const resolved   = state.ags[ss.agId]?.topics[ss.topicId];
        const topicInfo  = resolved
          ? `Wert=${resolved.value}, Formulierung="${resolved.formulation}"`
          : 'Topic noch nicht verhandelt';
        missing.push(
          `${p} / Showstopper "${ss.label}" → AG=${ss.agId} Topic=${ss.topicId} [${topicInfo}] AG-Fortschritt=${agProgress}%`
        );
      }
    }
  }

  console.log('%c[Vertrag noch nicht bereit]', 'color:#d29922', missing.join('\n  '));
}

// ── PACKAGE DEAL ──────────────────────────────────────────────

export function openPackageBuilder(state) {
  state.view = 'package-builder';
  state.viewData = {};
}

export function addToPackage(state, agId, topicId, value, formulation) {
  state.packageItems = state.packageItems.filter(i => !(i.agId === agId && i.topicId === topicId));
  state.packageItems.push({ type: 'topic', agId, topicId, value, formulation });
}

export function removeFromPackage(state, agId, topicId) {
  state.packageItems = state.packageItems.filter(i => !(i.agId === agId && i.topicId === topicId));
}

export function addMinistryToPackage(state, ministry) {
  state.packageItems = state.packageItems.filter(i => !(i.type === 'ministry' && i.ministry === ministry));
  state.packageItems.push({ type: 'ministry', ministry, toParty: '' });
}

export function updateMinistryInPackage(state, ministry, toParty) {
  const item = state.packageItems.find(i => i.type === 'ministry' && i.ministry === ministry);
  if (item) item.toParty = toParty;
}

export function removeMinistryFromPackage(state, ministry) {
  state.packageItems = state.packageItems.filter(i => !(i.type === 'ministry' && i.ministry === ministry));
}

export function evaluatePackage(state) {
  const reactions = {};
  for (const party of state.coalition) {
    if (party === state.playerParty) continue;
    reactions[party] = evaluatePackageForParty(state, party);
  }
  return reactions;
}

function evaluatePackageForParty(state, party) {
  if (!state.packageItems.length) return { accepts: false, reason: 'Paket ist leer.' };

  const leader = state.partyStates[party].leader;
  let positivePoints = 0, negativePoints = 0;
  const violations = [];

  // ── Topic items ──
  const topicItems = state.packageItems.filter(i => i.type !== 'ministry');
  for (const item of topicItems) {
    const topic = getTopicData(item.agId, item.topicId);
    if (!topic) continue;
    const partyIdeal = topic.partyPositions[party] ?? 50;
    const distance = Math.abs(partyIdeal - item.value);
    if (distance < 20) positivePoints += 20 - distance;
    else negativePoints += distance - 20;

    const showstoppers = (PARTY_SHOWSTOPPERS[party] || []).filter(ss => ss.topicId === item.topicId);
    for (const ss of showstoppers) {
      const condMet = ss.cond === 'gte' ? item.value >= ss.threshold : item.value <= ss.threshold;
      if (!condMet || !ss.formulations.includes(item.formulation)) {
        violations.push({ showstopper: ss, item });
      }
    }
  }

  // ── Ministry items — bonus for receiving party ──
  const ministryItems = state.packageItems.filter(i => i.type === 'ministry' && i.toParty);
  let ministryGifts = []; // ministries this party is receiving
  for (const mItem of ministryItems) {
    if (mItem.toParty === party) {
      const min = MINISTERIEN.find(m => m.name === mItem.ministry);
      const wishList = MINISTRY_WISH_LISTS[party];
      const isWished = wishList?.wish.includes(mItem.ministry);
      const power = min?.power ?? 0;
      positivePoints += isWished ? 30 : power >= 7 ? 15 : 8;
      ministryGifts.push({ name: mItem.ministry, isWished, power });
    }
  }

  if (violations.length > 0) {
    return { accepts: false, reason: `${leader.name}: Showstopper verletzt — ${violations[0].showstopper.label}`, counterDemand: null };
  }

  // Hardliner refuses examining formulations in topic items only
  if (leader.personality === 'Hardliner' && topicItems.some(i => i.formulation === 'examining')) {
    return { accepts: false, reason: `${leader.name}: "Unverbindliche Formulierungen sind keine Basis."`, counterDemand: null };
  }

  const ministryNote = ministryGifts.length > 0
    ? ` + ${ministryGifts.map(g => g.name + (g.isWished ? ' ★' : '')).join(', ')}`
    : '';

  switch (leader.personality) {
    case 'Hardliner':
      if (positivePoints - negativePoints < 20) {
        return { accepts: false, reason: `${leader.name}: "Das Paket ist nicht akzeptabel. Mehr Substanz."`, counterDemand: generateCounterDemand(state, party) };
      }
      return { accepts: true, reason: `${leader.name}: "Akzeptiert${ministryNote}. Aber wir erwarten Verlässlichkeit."`, counterDemand: null };

    case 'Pragmatiker':
      if (positivePoints >= negativePoints) {
        const counter = generateCounterDemand(state, party);
        return { accepts: true, reason: `${leader.name}: "Einverstanden${ministryNote}."`, counterDemand: counter };
      }
      return { accepts: false, reason: `${leader.name}: "Das Paket ist unausgewogen."`, counterDemand: generateCounterDemand(state, party) };

    case 'Egomane': {
      const hasPrestInPackage = ministryGifts.some(g => g.power >= 7);
      const hasPrestExisting = Object.entries(state.ministries).some(([m, p]) => p === party && (MINISTERIEN.find(x => x.name === m)?.power ?? 0) >= 7);
      if (hasPrestInPackage || hasPrestExisting || positivePoints - negativePoints >= 0) {
        return { accepts: true, reason: `${leader.name}: "Gut${ministryNote}. Das ist angemessen."`, counterDemand: null };
      }
      return { accepts: false, reason: `${leader.name} fühlt sich übergangen. Ein Prestige-Ministerium würde helfen.`, counterDemand: { type: 'ministry', label: 'Zuweisung eines Prestige-Ministeriums' } };
    }

    case 'Idealist':
      if (negativePoints > positivePoints + 10) {
        return { accepts: false, reason: `${leader.name}: "Das widerspricht unseren Grundwerten."`, counterDemand: null };
      }
      return { accepts: true, reason: `${leader.name}: "Wir stimmen zu${ministryNote}."`, counterDemand: null };
  }

  return { accepts: positivePoints >= negativePoints, reason: '', counterDemand: null };
}

function generateCounterDemand(state, party) {
  // Find most important unresolved topic for this party
  const showstoppers = PARTY_SHOWSTOPPERS[party] || [];
  for (const ss of showstoppers) {
    if (!state.ags[ss.agId]?.topics[ss.topicId]) {
      return { type: 'topic', agId: ss.agId, topicId: ss.topicId, label: ss.label };
    }
  }
  return null;
}

export function sendPackage(state) {
  if (!state.packageItems.length) return { error: 'Paket ist leer.' };
  if (state.actionPoints <= 0 && !state.isNachtsitzung) return { error: 'Keine Aktionspunkte.' };

  const reactions = evaluatePackage(state);
  const allAccept = Object.values(reactions).every(r => r.accepts);

  if (allAccept) {
    // Apply topic items
    for (const item of state.packageItems.filter(i => i.type !== 'ministry')) {
      state.ags[item.agId].topics[item.topicId] = { value: item.value, formulation: item.formulation };
      state.ags[item.agId].progress = Math.min(100, state.ags[item.agId].progress + agTopicIncrement(item.agId));
      syncAGProgress(state, item.agId);
      for (const party of state.coalition) {
        if (party === state.playerParty) continue;
        const r = evaluateTopicForParty(state, party, item.agId, item.topicId, item.value, item.formulation);
        state.partyStates[party].satisfaction += r.satisfactionDelta;
        state.partyStates[party].satisfaction = Math.max(0, Math.min(100, state.partyStates[party].satisfaction));
      }
    }
    // Apply ministry items
    for (const item of state.packageItems.filter(i => i.type === 'ministry' && i.toParty)) {
      const prevParty = state.ministries[item.ministry];
      state.ministries[item.ministry] = item.toParty;
      const wishList = MINISTRY_WISH_LISTS[item.toParty];
      const isWished = wishList?.wish.includes(item.ministry);
      const satGain = isWished ? 12 : (MINISTERIEN.find(m => m.name === item.ministry)?.power ?? 0) >= 7 ? 8 : 4;
      if (state.partyStates[item.toParty]) {
        state.partyStates[item.toParty].satisfaction = Math.min(100,
          state.partyStates[item.toParty].satisfaction + satGain
        );
      }
      if (prevParty && prevParty !== item.toParty && prevParty !== state.playerParty && state.partyStates[prevParty]) {
        state.partyStates[prevParty].satisfaction = Math.max(0,
          state.partyStates[prevParty].satisfaction - 4
        );
      }
    }
    if (!state.isNachtsitzung) state.actionPoints--;
    state.packageItems = [];
    state.view = 'ag-select';

    const interrupts = checkPersonalityInterrupts(state);
    _logReadinessStatus(state);
    return { success: true, allAccept: true, reactions, interrupts };
  }

  // Some reject — don't apply, return reactions for display
  return { success: false, allAccept: false, reactions };
}

// ── MINISTERIEN ANBIETEN ─────────────────────────────────────

export function openMinistryOffers(state) {
  state.view = 'ministry-offers';
  state.viewData = {};
}

export function offerMinistry(state, ministryName, toParty) {
  if (state.actionPoints <= 0 && !state.isNachtsitzung) return { error: 'Keine Aktionspunkte.' };

  const prevParty = state.ministries[ministryName];
  const ministry = MINISTERIEN.find(m => m.name === ministryName);
  const wishList = MINISTRY_WISH_LISTS[toParty];
  const leader = state.partyStates[toParty]?.leader;
  if (!leader) return { error: 'Partei nicht in Koalition.' };

  let accepts = true, reason = '', satisfactionDelta = 0;
  const isWished = wishList?.wish.includes(ministryName);
  const isPrestige = (ministry?.power ?? 0) >= 7;

  switch (leader.personality) {
    case 'Hardliner':
      accepts = isWished;
      reason = isWished ? `${leader.name} akzeptiert — es war auf unserer Liste.` : `${leader.name}: "Das ist nicht was wir gefordert haben."`;
      satisfactionDelta = isWished ? +8 : -3;
      break;
    case 'Pragmatiker':
      accepts = true;
      reason = `${leader.name}: "Danke. Wir werden das in unsere Überlegungen einbeziehen."`;
      satisfactionDelta = isWished ? +10 : (isPrestige ? +5 : +2);
      break;
    case 'Egomane':
      accepts = isPrestige;
      reason = isPrestige ? `${leader.name} ist sichtlich erfreut. "Das ist angemessen."` : `${leader.name}: "Ein wichtigeres Ministerium würde ich bevorzugen."`;
      satisfactionDelta = isPrestige ? +20 : -5;
      break;
    case 'Idealist':
      accepts = true; // idealists care more about policy than ministries
      reason = `${leader.name}: "Wir nehmen das an, wenn die Politikziele stimmen."`;
      satisfactionDelta = isWished ? +6 : +1;
      break;
  }

  if (accepts) {
    // Unassign from previous party
    if (prevParty) {
      state.partyStates[prevParty].satisfaction -= 4;
    }
    state.ministries[ministryName] = toParty;
    if (state.partyStates[toParty]) {
      state.partyStates[toParty].satisfaction = Math.max(0, Math.min(100,
        state.partyStates[toParty].satisfaction + satisfactionDelta
      ));
    }
    if (!state.isNachtsitzung) state.actionPoints--;
  }

  const interrupts = accepts ? checkPersonalityInterrupts(state) : [];
  if (accepts) _logReadinessStatus(state);
  return { accepts, reason, satisfactionDelta, interrupts };
}

// ── LEAK-REAKTION ─────────────────────────────────────────────

export function reactToLeak(state, reaction) {
  if (!state.pendingLeak) return;
  const leak = state.pendingLeak;

  // Stabilize pending leak
  state.leakReacted = true;
  state.pendingLeak = null;

  switch (reaction) {
    case 'apologize':
      // Costs face but saves negotiation
      state.partyStates[leak.partyId].satisfaction += 5;
      state.mediaComment = 'Entschuldigung angenommen — aber die Presse fragt weiter.';
      break;
    case 'search':
      // Costs 1 AP to find leaker, but restores trust
      if (state.actionPoints > 0) {
        state.actionPoints--;
        for (const party of state.coalition) {
          if (state.partyStates[party]) {
            state.partyStates[party].satisfaction += 3;
          }
        }
        state.mediaComment = 'Leaker identifiziert — Vertrauen teilweise wiederhergestellt.';
      } else {
        state.mediaComment = 'Keine Zeit zur Suche — der Leak bleibt ungeklärt.';
      }
      break;
    case 'ignore':
      // Media goes wild, more satisfaction loss
      for (const party of state.coalition) {
        if (party !== state.playerParty && state.partyStates[party]) {
          state.partyStates[party].satisfaction -= 5;
        }
      }
      state.mediaComment = 'Medien drehen durch: Ignorierter Leak belastet Koalitionsgespräche schwer.';
      break;
  }
}

// ── RUNDENABSCHLUSS ───────────────────────────────────────────

export function endRound(state) {
  const results = { leaks: [], agDecays: [], satisfactionChanges: {}, mediaComment: '', interrupts: [] };

  // 1. Stagnate AGs that weren't advanced (track via progress changes)
  const currentProgress = Object.fromEntries(
    Object.entries(state.ags).map(([id, ag]) => [id, ag.progress])
  );

  // AGs with resolved topics this round don't stagnate (simplified: check if any new topics resolved)
  for (const ag of WORKING_GROUPS) {
    const progressNow = state.ags[ag.id].progress;
    // If progress hasn't changed AND no new topics were resolved, decay
    if (progressNow < 100 && progressNow > 0) {
      const prevProgress = state.roundHistory[state.roundHistory.length - 1]?.agProgress[ag.id] ?? 0;
      if (progressNow <= prevProgress) {
        const decay = Math.min(5, progressNow);
        state.ags[ag.id].progress = Math.max(0, state.ags[ag.id].progress - decay);
        if (decay > 0) results.agDecays.push({ agId: ag.id, label: ag.short, decay });
      }
    }
  }

  // 2. Leak check (12% × damping)
  if (!state.leakReacted || state.pendingLeak) {
    // Previous leak wasn't reacted to — extra penalty
    const leakPenalty = 8;
    for (const party of state.coalition) {
      if (party !== state.playerParty && state.partyStates[party]) {
        state.partyStates[party].satisfaction -= leakPenalty;
      }
    }
  }

  const leakRoll = Math.random();
  const leakChance = 0.12 * state.leakDamping;
  if (leakRoll < leakChance && state.round <= 7) {
    const leakSubject = LEAK_SUBJECTS[Math.floor(Math.random() * LEAK_SUBJECTS.length)];
    const leakingParty = state.coalition.filter(p => p !== state.playerParty)[
      Math.floor(Math.random() * (state.coalition.length - 1))
    ] || state.coalition[0];

    const baseDamage = Math.round(-15 * state.leakDamping);
    state.leakDamping = Math.max(0.25, state.leakDamping - 0.3);

    state.pendingLeak = {
      partyId: leakingParty,
      ...leakSubject,
      damage: baseDamage,
      text: `Interner Verhandlungsstand zur ${leakSubject.text} von ${leakingParty} durchgesickert.`,
    };
    state.leakReacted = false;

    // Immediate damage to leaking party's satisfaction
    if (state.partyStates[leakingParty]) {
      state.partyStates[leakingParty].satisfaction = Math.max(0,
        state.partyStates[leakingParty].satisfaction + baseDamage
      );
    }
    results.leaks.push(state.pendingLeak);
  } else {
    state.leakReacted = true;
  }

  // 3. Media comment
  const overallProgress = getOverallProgress(state);
  let sentiment;
  if (results.leaks.length > 0) sentiment = 'leak';
  else if (state.round >= 7 && !isContractReady(state)) sentiment = 'nachtsitzung';
  else if (overallProgress >= 70) sentiment = 'great';
  else if (overallProgress >= 50) sentiment = 'good';
  else if (overallProgress >= 30) sentiment = 'neutral';
  else sentiment = 'bad';

  const templates = MEDIA_TEMPLATES[sentiment] || MEDIA_TEMPLATES.neutral;
  state.mediaComment = templates[Math.floor(Math.random() * templates.length)];
  state.mediaSentiment = sentiment;

  // Poll effect: bad press raises opposition
  results.mediaComment = state.mediaComment;

  // 4. Record history
  state.roundHistory.push({
    round: state.round,
    agProgress: Object.fromEntries(Object.entries(state.ags).map(([id, ag]) => [id, ag.progress])),
    satisfactions: Object.fromEntries(Object.entries(state.partyStates).map(([p, ps]) => [p, ps.satisfaction])),
  });

  // 5. Personality interrupts
  results.interrupts = checkPersonalityInterrupts(state);

  // 6. Advance round
  state.round++;
  state.actionPoints = state.isNachtsitzung ? 99 : 3;

  // 7. Nachtsitzung mode
  if (state.round >= 7 && !isContractReady(state)) {
    state.isNachtsitzung = true;
    state.actionPoints = 99;
  }

  // 8. Game over check
  if (state.round > state.maxRounds && !isContractReady(state)) {
    state.status = 'failed-neuwahl';
  } else if (isContractReady(state)) {
    state.status = 'contract-ready';
  }

  state.pendingRoundResults = results;

  // ── Console-Diagnose ──────────────────────────────────────────
  console.group(`%c[KoalNeg] Runde ${state.round - 1} abgeschlossen`, 'color:#388bfd;font-weight:bold');
  console.log('AP verbraucht:', state.maxActionPoints - (state.isNachtsitzung ? 0 : state.actionPoints));
  console.table(
    Object.fromEntries(WORKING_GROUPS.map(ag => {
      const agState = state.ags[ag.id];
      const resolved = Object.values(agState.topics).filter(Boolean).length;
      const total = ag.subTopics.length;
      return [ag.short, {
        'Fortschritt %': agState.progress,
        'Themen': `${resolved}/${total}`,
        'Stagniert': results.agDecays.some(d => d.agId === ag.id) ? `−${results.agDecays.find(d=>d.agId===ag.id).decay}%` : '—',
      }];
    }))
  );
  if (results.leaks.length > 0) console.warn('Leak:', results.leaks[0].text);
  if (results.agDecays.length > 0) console.warn('Stagnation:', results.agDecays.map(d => `${d.label} −${d.decay}%`).join(', '));
  if (results.interrupts.length > 0) console.warn('Interrupts:', results.interrupts.map(i => `${i.type} @ ${i.party}`).join(', '));
  console.log('Gesamtfortschritt:', getOverallProgress(state) + '%');
  console.log('Vertrag möglich:', isContractReady(state));
  console.groupEnd();

  return results;
}

// ── MEMBER VOTE ───────────────────────────────────────────────

export function resolveMemberVote(state, party) {
  state.partyStates[party].memberVotePending = false;
  const satisfaction = state.partyStates[party].satisfaction;
  // 50% base chance of rejection, modified by satisfaction
  const rejectionChance = Math.max(0.1, 0.5 - (satisfaction - 15) * 0.01);
  const rejected = Math.random() < rejectionChance;

  if (rejected) {
    // Reset some progress to simulate renegotiation
    for (const agId of Object.keys(state.ags)) {
      state.ags[agId].progress = Math.max(0, state.ags[agId].progress - 15);
    }
    state.partyStates[party].satisfaction = 35; // Restored somewhat
    return { rejected: true, party };
  }
  return { rejected: false, party };
}

// ── KOALITIONSAUSSCHUSS ───────────────────────────────────────

export function setAusschussRep(state, repId) {
  state.ausschussRep = repId;
  state.status = 'signed';
}

// ── QUERIES ───────────────────────────────────────────────────

export function getOverallProgress(state) {
  const values = Object.values(state.ags).map(ag => ag.progress);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function checkShowstoppers(state) {
  const results = {};
  for (const party of state.coalition) {
    const showstoppers = PARTY_SHOWSTOPPERS[party] || [];
    results[party] = showstoppers.map(ss => {
      const agProgress = state.ags[ss.agId]?.progress ?? 0;
      const resolved   = state.ags[ss.agId]?.topics[ss.topicId];

      // Topic noch nicht verhandelt
      if (!resolved) {
        // AG abgeschlossen aber Topic fehlt im State → Inkonsistenz, auto-erfüllen
        if (agProgress >= 100) {
          return { ...ss, met: true, autoFulfilled: true, reason: 'Auto-erfüllt: AG abgeschlossen (Topic fehlte im State)' };
        }
        return { ...ss, met: false, autoFulfilled: false, reason: 'Noch nicht verhandelt' };
      }

      const condMet  = ss.cond === 'gte' ? resolved.value >= ss.threshold : resolved.value <= ss.threshold;
      const formulOk = ss.formulations.includes(resolved.formulation);
      const condSymbol = ss.cond === 'gte' ? '≥' : '≤';

      // Detailliertes Console-Logging für jeden nicht-erfüllten Showstopper (nur solange AG < 100%)
      if (!(condMet && formulOk) && agProgress < 100) {
        console.log(
          `%c[Showstopper] ${party}/${ss.id} "${ss.label}" OFFEN: ` +
          `benötigt ${condSymbol}${ss.threshold} mit ${ss.formulations.join('/')}, ` +
          `aktuell Wert=${resolved.value} Formulierung="${resolved.formulation}" ` +
          `→ ${condMet ? '✓Wert' : '✗Wert'} ${formulOk ? '✓Formel' : '✗Formel'} (AG ${agProgress}%)`,
          'color:#d29922'
        );
      }

      // AG bei 100% → Kompromiss wird akzeptiert, kein Deadlock möglich
      if (agProgress >= 100 && !(condMet && formulOk)) {
        const detail = !condMet
          ? `Wert ${resolved.value} vs. Bedingung ${condSymbol}${ss.threshold}`
          : `Formulierung "${resolved.formulation}" (benötigt: ${ss.formulations.join('/')})`;
        return { ...ss, met: true, autoFulfilled: true, reason: `Auto-erfüllt: AG abgeschlossen (${detail})` };
      }

      // Für die UI: requirement-String damit der Spieler genau weiß was gebraucht wird
      const requirementHint = `benötigt ${condSymbol}${ss.threshold} mit "${ss.formulations.join('/')}"`;
      const currentHint     = `aktuell: ${resolved.value} (${resolved.formulation})`;

      return {
        ...ss,
        met: condMet && formulOk,
        autoFulfilled: false,
        requirementHint,
        currentHint,
        reason: condMet && formulOk
          ? 'Erfüllt'
          : !condMet
            ? `${requirementHint} — ${currentHint}`
            : `Formulierung zu unverbindlich — ${requirementHint}, ${currentHint}`,
      };
    });
  }
  return results;
}

export function isContractReady(state) {
  // Bedingung 1: Alle 5 AGs müssen 100% Fortschritt haben
  for (const ag of WORKING_GROUPS) {
    if ((state.ags[ag.id]?.progress ?? 0) < 100) return false;
  }
  // Bedingung 2: Alle Ministerien müssen bindend zugewiesen sein
  for (const m of MINISTERIEN) {
    if (!state.ministries[m.name]) return false;
  }
  // Bedingung 3: Keine offenen Red-Line-Verletzungen (alle Showstopper erfüllt)
  const stoppers = checkShowstoppers(state);
  for (const party of state.coalition) {
    if ((stoppers[party] || []).some(ss => !ss.met)) return false;
  }
  // Keine Partei hat die Koalition verlassen
  if (state.coalition.some(p => state.partyStates[p]?.hasLeft)) return false;
  return true;
}

// Gibt zurück, welche Bedingungen noch fehlen (für UI-Anzeige und Debug).
export function getContractBlockers(state) {
  const blockers = [];
  for (const ag of WORKING_GROUPS) {
    if ((state.ags[ag.id]?.progress ?? 0) < 100) {
      blockers.push({ type: 'ag', label: `${ag.label}: ${state.ags[ag.id]?.progress ?? 0}%` });
    }
  }
  for (const m of MINISTERIEN) {
    if (!state.ministries[m.name]) {
      blockers.push({ type: 'ministry', label: `${m.name}: nicht vergeben` });
    }
  }
  const stoppers = checkShowstoppers(state);
  for (const party of state.coalition) {
    for (const ss of (stoppers[party] || [])) {
      if (!ss.met) {
        blockers.push({
          type: 'showstopper',
          label: `${party}: ${ss.label}`,
          detail: ss.reason,           // z.B. "benötigt ≥70 mit binding/aspiring — aktuell: 45 (aspiring)"
          requirementHint: ss.requirementHint,
          currentHint: ss.currentHint,
        });
      }
    }
  }
  return blockers;
}

export function getUnresolvedTopics(state) {
  const unresolved = [];
  for (const ag of WORKING_GROUPS) {
    for (const topic of ag.subTopics) {
      if (!state.ags[ag.id]?.topics[topic.id]) {
        unresolved.push({ ag, topic });
      }
    }
  }
  return unresolved;
}

export function getContractSummary(state) {
  const summary = [];
  for (const ag of WORKING_GROUPS) {
    for (const topic of ag.subTopics) {
      const resolved = state.ags[ag.id]?.topics[topic.id];
      summary.push({
        agLabel: ag.short,
        topicLabel: topic.label,
        resolved: !!resolved,
        value: resolved?.value ?? null,
        formulation: resolved?.formulation ?? null,
      });
    }
  }
  return summary;
}

export function getAGData(agId) {
  return WORKING_GROUPS.find(g => g.id === agId);
}

export function getTopicDataExport(agId, topicId) {
  return getTopicData(agId, topicId);
}
