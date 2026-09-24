/**
 * Domain-agnostic types for Choicecraft Core Consensus Engine.
 */

export interface Candidate {
  id: string;
  title: string;
  category?: string;
  genres?: string[];
  runtimeMinutes?: number;
  contentRating?: string;
  attributes?: Record<string, unknown>;
}

export interface HardConstraints {
  vetoedGenres?: string[];
  maxRuntimeMinutes?: number;
  allowedContentRatings?: string[];
  vetoedCandidateIds?: string[];
  customFilter?: (candidate: Candidate) => { allowed: boolean; reason?: string };
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  hardConstraints?: HardConstraints;
  rankedCandidateIds?: string[];
  likedCandidateIds?: string[];
  dislikedCandidateIds?: string[];
  genrePreferences?: Record<string, number>;
  ratings?: Record<string, number>;
}

export type EliminationRule =
  | 'veto_genre'
  | 'max_runtime'
  | 'content_rating'
  | 'veto_candidate'
  | 'custom';

export interface EliminationReason {
  candidateId: string;
  candidateTitle: string;
  participantId: string;
  participantName: string;
  rule: EliminationRule;
  explanation: string;
}

export interface CandidateScore {
  candidate: Candidate;
  bordaScore: number;
  minimaxRegret: number;
  preferenceBonus: number;
  finalScore: number;
  rank: number;
  supporterCount: number;
  reasons: string[];
}

export interface ParticipantSatisfaction {
  participantId: string;
  participantName: string;
  satisfactionScore: number; // 0 - 100
  topPickWon: boolean;
  topChoiceTitle?: string;
  sacrifices: string[];
  wins: string[];
}

export interface GroupFairnessMetrics {
  groupSatisfactionScore: number; // 0 - 100
  leastSatisfiedScore: number;
  mostSatisfiedScore: number;
  leastSatisfiedParticipant: ParticipantSatisfaction;
  mostSatisfiedParticipant: ParticipantSatisfaction;
  participantBreakdown: Record<string, ParticipantSatisfaction>;
  compromisesMade: string[];
  isUnanimous: boolean;
  varianceScore: number; // Low variance = high fairness
}

export interface ConsensusResult {
  winner: Candidate;
  runnerUp?: Candidate;
  rankings: CandidateScore[];
  eliminated: EliminationReason[];
  fairness: GroupFairnessMetrics;
  algorithmUsed: 'borda' | 'minimax_regret' | 'hybrid';
  decisionSummary: {
    headline: string;
    whyItWon: string;
    compromisesDescription: string;
    vetoesHonoredCount: number;
  };
  timestamp: string;
}

export interface EngineOptions {
  algorithm?: 'borda' | 'minimax_regret' | 'hybrid';
  bordaWeight?: number; // default 0.6
  minimaxWeight?: number; // default 0.4
  tieBreaker?: 'least_misery' | 'highest_average_rating' | 'first_submitted';
}
