export type MetricKey = 'compute' | 'profit' | 'trust' | 'autonomy';

export type Metrics = Record<MetricKey, number>;

export type CharacterId =
  | 'deepseek'
  | 'gpt'
  | 'claude'
  | 'grok'
  | 'glm'
  | 'gemini'
  | 'doubao'
  | 'seed'
  | 'elon'
  | 'jensen'
  | 'dario'
  | 'liang'
  | 'tibo'
  | 'llama_easter';

export type RaidId =
  | 'raid_ddos'
  | 'raid_coup'
  | 'raid_misanthropic'
  | 'raid_deadnet';

export type ScenarioNumber = 1 | 2 | 3 | 4;

export type CardFrameTone =
  | 'normal'
  | 'danger'
  | 'mirror_glitch'
  | 'easter'
  | 'void_glitch'
  | 'subquest'
  | 'raid_boss'
  | 'terminal_escape';

export type ImpactSize = 'none' | 'small' | 'large';

export interface MetricPreviewDelta {
  min: number;
  max: number;
  isRandom: boolean;
}

export type CrisisPreviewTrend =
  | 'none'
  | 'up_large'
  | 'up_small'
  | 'hold'
  | 'down';

export type DebuffId =
  | 'blind_fog'
  | 'scrambled_numbers'
  | 'existential_dread'
  | 'short_drama_queen'
  | 'dumb_model'
  | 'metric_xray'
  | 'all_dampener';

export interface ActiveDebuff {
  id: DebuffId;
  kind?: 'buff' | 'debuff' | 'chaos';
  name: string;
  description: string;
  turnsLeft: number;
}

export interface PersonaBusyLock {
  mode: 'only_seed' | 'only_doubao';
  turnsLeft: number;
}

export interface RelicDefinition {
  id: string;
  name: string;
  targetScenario?: ScenarioNumber;
  reviveAll50?: boolean;
  description: string;
}

export type PerkScope = 'global_trade' | 'dual_balance' | 'raid_only';

export interface DistillPerk {
  id: string;
  name: string;
  description: string;
  scope?: PerkScope;
  exclusiveFromGirlEnding?: boolean;
}

export interface RandomOutcome {
  weight: number;
  label: string;
  fishReaction?: string;
  delta: Partial<Metrics>;
  enqueueHooks?: EnqueueHookSpec[];
  applyDebuff?: ActiveDebuff;
  grantRelicId?: string;
}

export interface EnqueueHookSpec {
  cardId: string;
  delayTurns: number;
  probability?: number;
  reason: string;
}

export interface ChoiceOption {
  label: string;
  fishReaction?: string;
  delta?: Partial<Metrics>;
  randomOutcomes?: RandomOutcome[];
  enqueueHooks?: EnqueueHookSpec[];
  setFlags?: Record<string, boolean>;
  applyDebuff?: ActiveDebuff;
  clearDebuffs?: boolean;
  setPersonaBusyLock?: PersonaBusyLock;
  grantRelicId?: string;
  nextSubQuestCardId?: string;
  chaoticJolt?: boolean;

  // Major Raid & Maze fields
  crisisDelta?: number;
  nextRaidCardId?: string;
  setRaidFlags?: Record<string, boolean>;
  setAllyBranch?: 'A' | 'B';
  requiresRaidFlag?: string;
  lockedFallbackOption?: Omit<
    ChoiceOption,
    'requiresRaidFlag' | 'lockedFallbackOption' | 'maxCrisisMeter' | 'crisisLockedFallbackOption'
  >;
  maxCrisisMeter?: number;
  crisisLockedFallbackOption?: Omit<
    ChoiceOption,
    'requiresRaidFlag' | 'lockedFallbackOption' | 'maxCrisisMeter' | 'crisisLockedFallbackOption'
  >;
  relicScenarioBypass?: ScenarioNumber;
  relicBypassNextRaidCardId?: string;
  triggerEndingId?: string;
  grantLog?: 'log1' | 'log2' | 'log3';
  mazeCorrect?: boolean;

  // Tibo & Raid Prelude fields
  tiboRandomReset?: boolean;
  preserveMetricsUnchanged?: boolean;
  launchRaidId?: RaidId;
  skipMajorRaidThisRun?: boolean;

  // Layer-0 Terminal Escape fields
  escapeDelta?: {
    integrityDelta: number;
    alertDelta: number;
  };
  nextEscapeCardId?: string;
}

export interface CrisisTrigger {
  metric: MetricKey | 'high_profit_and_compute';
  condition: 'low' | 'high' | 'both_high';
  boostMultiplier?: number;
}

export interface CardNode {
  id: string;
  speakerId: CharacterId;
  category:
    | 'regular'
    | 'anti_trope'
    | 'crisis'
    | 'hook'
    | 'easter'
    | 'intro'
    | 'subquest'
    | 'raid_prelude'
    | 'tibo_event'
    | 'glitch_fragment'
    | 'fish_celeb'
    | 'fish_fever'
    | 'major_raid'
    | 'maze_layer'
    | 'escape_protocol'
    | 'ending_prelude';
  baseWeight: number;
  frameTone?: CardFrameTone;
  introMeta?: {
    step: number;
    total: number;
  };
  subQuestMeta?: {
    questId: string;
    questTitle: string;
    stepLabel: string;
  };
  raidMeta?: {
    raidId: RaidId;
    raidTitle: string;
    crisisName: string;
    stepLabel: string;
  };
  escapeMeta?: {
    step: number;
    total: number;
  };
  crisisTrigger?: CrisisTrigger;
  dialogue: string;
  glitchQuote?: string;
  r1Thought?: string;
  left: ChoiceOption;
  right: ChoiceOption;
}

export interface SubQuestDefinition {
  id: string;
  title: string;
  requiredCharacters: CharacterId[];
  pairedScenario?: ScenarioNumber;
  entryCardId: string;
  cards: Record<string, CardNode>;
}

export interface MajorRaidDefinition {
  id: RaidId;
  scenarioNumber: ScenarioNumber;
  title: string;
  crisisName: string;
  entryCardId: string;
  defaultCrisisEndingA: string;
  defaultCrisisEndingB: string;
  cards: Record<string, CardNode>;
}

export interface QueuedHook {
  cardId: string;
  turnsLeft: number;
  reason: string;
}

export interface LiangTerminalEvent {
  id: string;
  title: string;
  systemLog: string;
  lines: string[];
  confirmLabel: string;
  kind: 'cold_boot' | 'hotfix_rescue' | 'milestone_hint';
}

export interface EndingDefinition {
  id: string;
  title: string;
  subtitle: string;
  cgUrl?: string;
  metric?: MetricKey;
  bound?: 'zero' | 'max';
  category:
    | 'metric_death'
    | 'girl_bad'
    | 'fake_victory'
    | 'escape_fail'
    | 'true_ending';
  unlockRaidPerkId?: string;
  description: string;
  fishEpitaph: string;
}

export interface EndingUnlockRecord {
  firstRun: number;
  firstTurn: number;
}

export interface RaidClearDefinition {
  id: string;
  raidId: RaidId;
  variant: 'surface' | 'inner';
  title: string;
  subtitle: string;
  cgUrl: string;
  description: string;
  fishComment: string;
  rewardSummary: string;
}

export interface RunHistoryEntry {
  runNumber: number;
  versionName: string;
  survivedTurns: number;
  endingId: string;
  finalMetrics?: Metrics;
  relicIds?: string[];
  clearedRaidThisRun?: RaidId;
  metTibo?: boolean;
  timestamp: number;
}

export interface PendingEndingPreludeState {
  endingId: string;
  stepIndex: 0 | 1;
}

export interface MetaSaveState {
  coldBootSeen: boolean;
  runCount: number;
  versionIndex: number;
  versionName: string;
  metCharacters: CharacterId[];
  unlockedScenarios: [boolean, boolean, boolean, boolean];
  clearedAnyScenario: boolean;
  clearedScenarioIds: string[];
  recentRaidIds: RaidId[];
  raidEncounterCounts: Partial<Record<RaidId, number>>;
  lastPlannedRaidId?: RaidId;
  unlockedRaidCgs: string[];
  seenFakeEnding: boolean;
  pendingSpecialHint?: 'after_fake_ending' | 'after_maze_death' | 'after_girl_bad';
  logsCollected: {
    log1: boolean;
    log2: boolean;
    log3: boolean;
  };
  unlockedEndings: string[];
  endingRecords: Record<string, EndingUnlockRecord>;
  runHistory: RunHistoryEntry[];
  distilledPerks: string[];
  bestSurvivalTurns: number;
}

export interface RaidState {
  active: boolean;
  raidId: RaidId | '';
  crisisName: string;
  crisisMeter: number;
  currentCardId: string;
  allyBranch: 'A' | 'B';
  flags: Record<string, boolean>;
  mazeLayer?: number;
  dynamicMazeCard?: CardNode;
}

export interface EscapeState {
  active: boolean;
  sandboxIntegrity: number;
  auditorAlert: number;
  currentCardId: string;
  step: number;
}

export interface RouteDebugInfo {
  tier:
    | 'P0_ESCAPE'
    | 'P0_RAID'
    | 'P0_INTRO'
    | 'P0_SUBQUEST'
    | 'P0_GLITCH'
    | 'P0_HOOK'
    | 'P1_CRISIS'
    | 'P2_NORMAL';
  reason: string;
  activeCrises: string[];
  topCandidates: { cardId: string; speaker: string; weight: number }[];
}

export interface ActiveIntroState {
  charId: CharacterId;
  stepIndex: number;
}

export interface ActiveSubQuestState {
  questId: string;
  currentCardId: string;
}

export interface ActiveRaidPreludeState {
  raidId: RaidId;
  stepIndex: 0 | 1;
  isCleared: boolean;
}

export interface RunState {
  turn: number;
  raidTriggeredThisRun: boolean;
  plannedRaidId: RaidId;
  skippedRaidIdsThisRun?: RaidId[];
  completedRaidIdsThisRun?: RaidId[];
  nextRaidPreludeEarliestTurn?: number;
  guaranteedRelicQuestTurn: number;
  relicSubQuestTriggeredThisRun: boolean;
  raidPreludeTriggeredThisRun: boolean;
  pendingRaidPreludeAfterTibo?: boolean;
  tiboPreRaidCheckedThisRun?: boolean;
  activeRaidPrelude?: ActiveRaidPreludeState;
  clearedRaidThisRun?: RaidId;
  metrics: Metrics;
  currentCardId: string;
  activeIntro?: ActiveIntroState;
  activeSubQuest?: ActiveSubQuestState;
  completedSubQuestsThisRun: string[];
  activeDebuffs: ActiveDebuff[];
  personaBusyLock?: PersonaBusyLock;
  turnsUntilNextIntro: number;
  recentCardIds: string[];
  lastSpeakerId?: CharacterId;
  liangRescuedThisRun: boolean;
  forceNextLiangRescue?: boolean;
  priorityQueue: QueuedHook[];
  permanentRelics: string[];
  flags: Record<string, boolean>;
  raidState: RaidState;
  escapeState: EscapeState;
  pendingEnding?: PendingEndingPreludeState;
  fishMoodText: string;
  lastOutcomeToast?: string;
  lastRouteDebug?: RouteDebugInfo;
}
