// ============================================================
// GAME.JS — Hauptorchestrator der Spiellogik
//
// Was: Enthält die Game-Klasse die alle Systeme verbindet.
//      Verwaltet State-Transitionen (governing → campaign → coalition),
//      delegiert an engine.js/tick() für Simulation.
//
// Nutzt: engine/state.js, engine/engine.js, parties/election.js,
//        parties/coalition.js, events/events.js, scheduler.js,
//        ministers/minister-logic.js
//
// Erweiterungspunkte:
//   - Neue Phasen (z.B. 'bundesrat') als state.phase eintragen
//   - _checkMinisterEvents() um weitere Event-Typen erweitern
//   - enactLaw() für Bundesrat-Prüfung um Bundesrat-Hook erweitern
// ============================================================

import { createInitialState, PARTY_POSITIONS } from './engine/state.js';
import { tick, applyDecision, checkGameOver } from './engine/engine.js';
import { conductElection, findPossibleCoalitions } from './parties/election.js';
import { conductExploratoryTalks, negotiateCoalitionContract, distributeMinistries, conductVoteOfNoConfidence } from './parties/coalition.js';
import { checkForEvents } from './events/events.js';
import { runScheduler   } from './scheduler.js';
import {
  generateAllMinisters, createReplacementMinister,
  rollInitiativeEvent, rollScandalEvents, rollConflictEvent,
  checkInvestigationResolutions, getMinisterLawModifier,
} from './ministers/minister-logic.js';

export class Game {
  constructor(playerParty = 'CDU') {
    this.state = createInitialState();
    this.playerParty = playerParty;

    // Startkoalition simulieren (Spieler startet in der Regierung)
    this.setupStartingGovernment();
  }

  // ── SETUP ─────────────────────────────────────────────────
  setupStartingGovernment() {
    // Startwahl simulieren
    const election = conductElection(this.state);
    this.state.parliament.seats = election.seats;

    const coalitions = findPossibleCoalitions(election.seats, election.majorityNeeded);

    // Spielerpartei in größtmöglicher kompatibler Koalition
    const playerCoalition = coalitions.find(c =>
      c.parties.includes(this.playerParty) && c.compatibility > 40
    );

    if (playerCoalition) {
      const ministries = distributeMinistries(playerCoalition.parties, election.seats);
      this.state.government.coalition = playerCoalition.parties;
      this.state.government.ministries = ministries.assignments;
      this.state.government.chancellorParty = ministries.chancellorParty;
      this.state.ministers = generateAllMinisters(this.state);
    } else {
      // Notlösung: Spielerpartei + stärkste kompatible Partei
      this.state.government.coalition = [this.playerParty];
      this.state.government.chancellorParty = this.playerParty;
      this.state.ministers = generateAllMinisters(this.state);
    }
  }

  // ── NÄCHSTE RUNDE ─────────────────────────────────────────
  nextTurn() {
    if (this.state.phase !== 'governing') return this.state;

    // 1. Tick (erhöht termQuarter, wendet Flows an)
    this.state = tick(this.state);

    // 2. Scheduler entscheidet was in diesem Quartal passiert
    //    Priorität: Haushalt > Ereignis > Stellungnahme (max. 1)
    const rawEvents = checkForEvents(this.state);
    const { events, update } = runScheduler(this.state, rawEvents);

    // 3. Scheduling-State aktualisieren
    this.state.scheduling = { ...this.state.scheduling, ...update };

    // 4. Events in die Queue aufnehmen
    this.state.activeEvents = [...this.state.activeEvents, ...events];

    // 5. Minister-Events: Initiativen, Skandale, Konflikte, Untersuchungsresolutionen
    const ministerEvents = this._checkMinisterEvents(events.length > 0);
    this.state.activeEvents = [...this.state.activeEvents, ...ministerEvents];

    // 6. Wenn Wahl fällig: Campaign-Phase starten
    if (this.state.phase === 'campaign') {
      this.startCampaign();
    }

    return this.state;
  }

  _checkMinisterEvents(hasMainEvent) {
    const all = [];

    // Immer: Untersuchungsresolutionen prüfen (Ausschüsse die fertig sind)
    const resolutions = checkInvestigationResolutions(this.state);
    all.push(...resolutions);

    // Investigation-Counter dekrementieren
    if (this.state.ministers) {
      this.state.ministers = this.state.ministers.map(m =>
        m.investigationQuartersLeft > 0
          ? { ...m, investigationQuartersLeft: m.investigationQuartersLeft - 1 }
          : m
      );
    }

    // Skandale: immer rollen (8% pro Minister)
    const scandals = rollScandalEvents(this.state);
    if (scandals.length > 0) {
      // Skandal auf Minister merken
      for (const sc of scandals) {
        if (sc.ministerId && this.state.ministers) {
          const idx = this.state.ministers.findIndex(m => m.ministry === sc.ministerId);
          if (idx !== -1) {
            this.state.ministers = [...this.state.ministers];
            this.state.ministers[idx] = {
              ...this.state.ministers[idx],
              inScandal: true,
              scandalType: sc.scandalLabel,
            };
          }
        }
      }
      all.push(...scandals);
    }

    // Ressortstreit: nur wenn kein Hauptereignis
    if (!hasMainEvent && scandals.length === 0) {
      const conflict = rollConflictEvent(this.state, hasMainEvent);
      if (conflict) all.push(conflict);
    }

    // Initiative: nur wenn kein Hauptereignis und kein Skandal
    if (!hasMainEvent && scandals.length === 0 && all.length === resolutions.length) {
      const init = rollInitiativeEvent(this.state, hasMainEvent);
      if (init) all.push(init);
    }

    return all;
  }

  // ── ENTSCHEIDUNG TREFFEN ───────────────────────────────────
  makeDecision(eventId, choiceId) {
    const event = this.state.activeEvents.find(e => e.id === eventId);
    if (!event) return this.state;

    const choice = event.choices?.find(c => c.id === choiceId);
    if (!choice) return this.state;

    const MINISTER_TYPES = [
      'minister-initiative', 'minister-scandal',
      'minister-conflict',   'minister-resolution',
    ];

    if (MINISTER_TYPES.includes(event.type)) {
      this.state = this._applyMinisterDecision(this.state, event, choice);
    } else {
      this.state = applyDecision(this.state, { ...choice, id: choiceId });
    }
    this.state.activeEvents = this.state.activeEvents.filter(e => e.id !== eventId);

    return this.state;
  }

  _applyMinisterDecision(state, event, choice) {
    const s = structuredClone(state);

    // Soforteffekte (path-basiert)
    for (const [path, value] of Object.entries(choice.immediateEffects || {})) {
      const parts = path.split('.');
      let obj = s;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      const key = parts[parts.length - 1], cur = obj[key] ?? 0;
      obj[key] = key === 'debtRatio'      ? Math.max(0, Math.min(120, cur + value))
               : key === 'budgetBalance'  ? cur + value
               : Math.max(0, Math.min(100, cur + value));
    }

    // Koalitionsstabilität
    if (choice.coalitionStabilityDelta) {
      s.politics.coalitionStability = Math.max(0, Math.min(100,
        (s.politics.coalitionStability ?? 60) + choice.coalitionStabilityDelta
      ));
    }

    // Verzögerte Effekte
    for (const de of (choice.delayedEffects || [])) {
      s.delayedEffects.push({
        id:               `minister-${event.id}-${de.quartersDelay}`,
        appliesInQuarter: s.government.termQuarter + de.quartersDelay,
        effects:          de.effects,
        label:            de.label,
      });
    }

    // Minister-spezifische Effekte
    const ministerId = event.ministerId;
    if (ministerId && s.ministers) {
      const idx = s.ministers.findIndex(m => m.ministry === ministerId);
      if (idx !== -1) {
        const m = { ...s.ministers[idx] };

        if (choice.ministerSatisfactionDelta) {
          m.satisfaction = Math.max(0, Math.min(100, m.satisfaction + choice.ministerSatisfactionDelta));
        }
        if (choice.ministerCompetenceDelta) {
          m.competence = Math.max(0, Math.min(100, m.competence + choice.ministerCompetenceDelta));
        }
        if (choice.clearScandal)      { m.inScandal = false; m.scandalType = null; }
        if (choice.clearInvestigation){ m.investigationQuartersLeft = 0; }
        if (choice.startsInvestigation){ m.investigationQuartersLeft = choice.startsInvestigation; m.inScandal = false; }

        // Initiative-Bilanz tracken
        if (event.type === 'minister-initiative') {
          if (choice.id === 'support') { m.termSuccesses++; m.lastActionLabel = `Initiative unterstützt`; }
          else if (choice.id === 'reject') { m.termFailures++; m.lastActionLabel = `Initiative abgelehnt`; }
          else { m.lastActionLabel = `Initiative modifiziert`; }
          m.lastActionQuarter = s.government.termQuarter;
        }

        if (choice.firesMinister) {
          // Minister ersetzen
          const replacement = createReplacementMinister(m, s);
          s.ministers = [...s.ministers];
          s.ministers[idx] = replacement;
          // Koalitionspartner-Strafe
          s.politics.coalitionStability = Math.max(0,
            (s.politics.coalitionStability ?? 60) - 10
          );
        } else {
          s.ministers = [...s.ministers];
          s.ministers[idx] = m;
        }
      }
    }

    // Konflikt-Ereignis: Satisfaction mehrerer Minister anpassen
    if (choice.ministerSatisfactionByMinistry && s.ministers) {
      s.ministers = s.ministers.map(m => {
        const delta = choice.ministerSatisfactionByMinistry[m.ministry];
        if (!delta) return m;
        return { ...m, satisfaction: Math.max(0, Math.min(100, m.satisfaction + delta)) };
      });
    }

    return s;
  }

  // ── WAHL ──────────────────────────────────────────────────
  startCampaign() {
    this.electionResult = conductElection(this.state);
    this.state.parliament.seats = this.electionResult.seats;
    this.state.phase = 'coalition';
  }

  // ── KOALITIONSVERHANDLUNG ─────────────────────────────────
  startCoalitionNegotiation(chosenCoalition, playerPolicyChoices = {}) {
    const result = negotiateCoalitionContract(chosenCoalition, playerPolicyChoices);
    const ministries = distributeMinistries(chosenCoalition, this.electionResult.seats);

    if (result.overallSuccess || result.successChance > 50) {
      // Koalition bildet sich
      this.state.government.coalition = chosenCoalition;
      this.state.government.ministries = ministries.assignments;
      this.state.government.chancellorParty = ministries.chancellorParty;
      this.state.government.coalitionContract = result.contract;
      this.state.government.termQuarter = 0;
      this.state.turnsUntilElection = 16;
      this.state.politics.coalitionStability = 65 + result.successChance * 0.2;
      this.state.scheduling = { lastStellungnahmeQuarter: 0, usedStellungnahmeTopics: [], lastQuarterType: null, lastEventQuarter: -10, eventCount: 0 };
      this.state.ministers = generateAllMinisters(this.state);

      // Koalitionsvertrag-Effekte anwenden
      for (const [path, value] of Object.entries(result.finalPosition)) {
        // Direkte Anwendung auf State
      }

      this.state.phase = 'governing';
    } else {
      // Verhandlungen gescheitert: Neuwahlen oder andere Koalition suchen
      this.state.activeEvents.push({
        id: 'coalition-failed',
        type: 'coalition-failure',
        label: 'Koalitionsverhandlungen gescheitert',
        conflicts: result.conflicts,
      });
    }

    return result;
  }

  // ── MISSTRAUENSVOTUM ──────────────────────────────────────
  handleVoteOfNoConfidence(initiatingParty) {
    const result = conductVoteOfNoConfidence(this.state, initiatingParty);

    if (result.passed) {
      this.state.phase = 'campaign';
      this.state.turnsUntilElection = 0;
      this.startCampaign();
    }

    return result;
  }

  // ── GESETZ VERABSCHIEDEN ──────────────────────────────────
  enactLaw(law, immediateEffects, delayedEffects, effMult = 1.0) {
    const s = structuredClone(this.state);

    // Soforteffekte (skaliert)
    for (const [path, rawVal] of Object.entries(immediateEffects || {})) {
      const value = rawVal * effMult;
      const parts = path.split('.');
      let obj = s;
      for (let i = 0; i < parts.length - 1; i++) { obj = obj[parts[i]] ?? (obj[parts[i]] = {}); }
      const key = parts[parts.length - 1], cur = obj[key] ?? 0;
      obj[key] = key === 'debtRatio' ? Math.max(0, Math.min(120, cur + value))
               : key === 'budgetBalance' ? cur + value
               : Math.max(0, Math.min(100, cur + value));
    }

    // Verzögerte Effekte
    for (const de of (delayedEffects || [])) {
      const scaledEffects = {};
      for (const [p, v] of Object.entries(de.effects || {})) scaledEffects[p] = v * effMult;
      s.delayedEffects.push({
        id:               `law-${law.id}-${de.quartersDelay}`,
        appliesInQuarter: s.government.termQuarter + de.quartersDelay,
        effects:          scaledEffects,
        label:            de.label,
      });
    }

    // Gesetz in enacted-Liste aufnehmen
    s.legislation = s.legislation ?? {};
    s.legislation.enactedLaws = [...(s.legislation.enactedLaws ?? []), {
      lawId: law.id, termQuarter: s.government.termQuarter, year: s.year,
    }];
    s.legislation.lastLegislationQuarter = s.government.termQuarter;

    this.state = s;
    return this.state;
  }

  recordLawFailed(law, reason) {
    this.state = structuredClone(this.state);
    this.state.legislation = this.state.legislation ?? {};
    this.state.legislation.failedLaws = [...(this.state.legislation.failedLaws ?? []), {
      lawId: law.id, termQuarter: this.state.government.termQuarter,
      year: this.state.year, reason,
    }];
    this.state.legislation.lastLegislationQuarter = this.state.government.termQuarter;
    // Häufige Niederlagen → Parlamentsrückhalt sinkt
    const recentFails = this.state.legislation.failedLaws.filter(
      f => f.termQuarter >= this.state.government.termQuarter - 4
    ).length;
    if (recentFails >= 2) {
      this.state.politics.parliamentarySupport = Math.max(0,
        this.state.politics.parliamentarySupport - 5
      );
      this.state.politics.coalitionStability = Math.max(0,
        this.state.politics.coalitionStability - 8
      );
      this.state.politics.mediaRelations = Math.max(0,
        this.state.politics.mediaRelations - 4
      );
    }
    return this.state;
  }

  removeFromMinistry(ministryName) {
    this.state = structuredClone(this.state);
    const idx = this.state.ministers.findIndex(m => m.ministry === ministryName);
    if (idx !== -1) {
      const old = this.state.ministers[idx];
      const replacement = createReplacementMinister(old, this.state);
      this.state.ministers[idx] = replacement;
      this.state.politics.coalitionStability = Math.max(0,
        (this.state.politics.coalitionStability ?? 60) - 10
      );
    }
    return this.state;
  }

  removeFromCoalition(party) {
    this.state = structuredClone(this.state);
    this.state.government.coalition = this.state.government.coalition.filter(p => p !== party);
    this.state.politics.coalitionStability = Math.max(0, this.state.politics.coalitionStability - 25);
    return this.state;
  }

  // ── HAUSHALTSEFFEKTE ANWENDEN ─────────────────────────────
  // Wendet vorberechnete Haushalt-Effekte an (kein extra tick).
  applyHaushaltsEffects(immediateEffects, delayedEffects) {
    const s = structuredClone(this.state);

    // Wende Soforteffekte an (path-basiert, mit Clamping)
    for (const [path, value] of Object.entries(immediateEffects || {})) {
      const parts = path.split('.');
      let obj = s;
      for (let i = 0; i < parts.length - 1; i++) {
        if (obj[parts[i]] == null) obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      const key = parts[parts.length - 1];
      const cur = obj[key] ?? 0;
      // debtRatio erlaubt bis 120, budgetBalance unbegrenzt, Rest 0-100
      if (key === 'debtRatio') {
        obj[key] = Math.max(0, Math.min(120, cur + value));
      } else if (key === 'budgetBalance') {
        obj[key] = cur + value;
      } else {
        obj[key] = Math.max(0, Math.min(100, cur + value));
      }
    }

    // Verzögerte Effekte in Queue
    for (const de of (delayedEffects || [])) {
      s.delayedEffects.push({
        id:              `haushalt-${s.government.termQuarter}-${de.label}`.replace(/\s+/g, '-'),
        appliesInQuarter: s.government.termQuarter + de.quartersDelay,
        effects:          de.effects,
        label:            de.label,
      });
    }

    this.state = s;
    return this.state;
  }

  // ── SAVE / LOAD ───────────────────────────────────────────
  serialize() {
    return JSON.stringify({ state: this.state, playerParty: this.playerParty });
  }

  static deserialize(json) {
    const { state, playerParty } = JSON.parse(json);
    const game = new Game(playerParty);
    game.state = state;
    return game;
  }
}
