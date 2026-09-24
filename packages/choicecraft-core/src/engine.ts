import { calculateBordaScores } from './algorithms/bordaScoring';
import { evaluateFairness } from './algorithms/fairnessIndex';
import { filterHardConstraints } from './algorithms/hardConstraints';
import { calculateMinimaxRegret } from './algorithms/minimaxRegret';
import {
  Candidate,
  CandidateScore,
  ConsensusResult,
  EngineOptions,
  Participant,
} from './types';

export class ChoicecraftEngine {
  private options: Required<EngineOptions>;

  constructor(options?: EngineOptions) {
    this.options = {
      algorithm: options?.algorithm ?? 'hybrid',
      bordaWeight: options?.bordaWeight ?? 0.6,
      minimaxWeight: options?.minimaxWeight ?? 0.4,
      tieBreaker: options?.tieBreaker ?? 'least_misery',
    };
  }

  /**
   * Evaluates consensus across a set of candidates and participants.
   * Deterministic, transparent, and grounded in social choice theory.
   */
  public evaluate(
    candidates: Candidate[],
    participants: Participant[]
  ): ConsensusResult {
    if (candidates.length === 0) {
      throw new Error('ChoicecraftEngine: At least one candidate is required.');
    }

    // Step 1: Filter Hard Constraints (Vetoes, Runtime caps, Ratings)
    const filterResult = filterHardConstraints(candidates, participants);
    const eligible = filterResult.eligible;
    const eliminated = filterResult.eliminated;

    // Step 2: Calculate Borda Scores
    const bordaMap = calculateBordaScores(eligible, participants);

    // Step 3: Calculate Minimax Regret
    const regretMap = calculateMinimaxRegret(eligible, participants);

    // Step 4: Compute Composite Scores
    const maxBorda = Math.max(
      ...Object.values(bordaMap).map(b => b.bordaScore),
      1
    );

    const scoredCandidates: CandidateScore[] = eligible.map(candidate => {
      const bordaData = bordaMap[candidate.id] || {
        bordaScore: 0,
        preferenceBonus: 0,
        supporterCount: 0,
        reasons: [],
      };
      const regretData = regretMap[candidate.id] || {
        maxRegret: 0,
        leastSatisfiedParticipantId: '',
        leastSatisfiedParticipantName: '',
        satisfactionScores: {},
      };

      // Normalize Borda score to 0-100
      const normalizedBorda = (bordaData.bordaScore / maxBorda) * 100;
      // Invert regret: regret 0 -> 100 satisfaction, regret 100 -> 0 satisfaction
      const regretSatisfaction = Math.max(0, 100 - regretData.maxRegret);

      let finalScore = 0;
      if (this.options.algorithm === 'borda') {
        finalScore = normalizedBorda + bordaData.preferenceBonus;
      } else if (this.options.algorithm === 'minimax_regret') {
        finalScore = regretSatisfaction + bordaData.preferenceBonus;
      } else {
        // Hybrid: Borda + Minimax Regret balance
        finalScore =
          normalizedBorda * this.options.bordaWeight +
          regretSatisfaction * this.options.minimaxWeight +
          bordaData.preferenceBonus;
      }

      const reasons = [...bordaData.reasons];
      if (regretData.maxRegret === 0) {
        reasons.push('Zero regret: acceptable to every participant');
      } else if (regretData.maxRegret <= 20) {
        reasons.push(
          `Low regret: minimal friction for ${regretData.leastSatisfiedParticipantName}`
        );
      }

      return {
        candidate,
        bordaScore: bordaData.bordaScore,
        minimaxRegret: regretData.maxRegret,
        preferenceBonus: bordaData.preferenceBonus,
        finalScore: Math.round(finalScore * 10) / 10,
        rank: 0,
        supporterCount: bordaData.supporterCount,
        reasons,
      };
    });

    // Step 5: Sort Descending by Final Score (with deterministic tie-breaking)
    scoredCandidates.sort((a, b) => {
      if (b.finalScore !== a.finalScore) {
        return b.finalScore - a.finalScore;
      }
      // Tie breaker 1: Minimax regret (least misery)
      if (a.minimaxRegret !== b.minimaxRegret) {
        return a.minimaxRegret - b.minimaxRegret;
      }
      // Tie breaker 2: Raw Borda points
      if (b.bordaScore !== a.bordaScore) {
        return b.bordaScore - a.bordaScore;
      }
      // Tie breaker 3: Stable alphabetical
      return a.candidate.title.localeCompare(b.candidate.title);
    });

    // Assign 1-indexed ranks
    scoredCandidates.forEach((item, index) => {
      item.rank = index + 1;
    });

    const winner = scoredCandidates[0].candidate;
    const runnerUp = scoredCandidates[1]?.candidate;

    // Step 6: Evaluate Group Fairness
    const fairness = evaluateFairness(winner, candidates, participants);

    // Step 7: Formulate Grounded Decision Summary
    const vetoesHonoredCount = eliminated.length;
    let headline = `Consensus Pick: ${winner.title}`;
    if (fairness.isUnanimous) {
      headline = `Unanimous Choice: ${winner.title}!`;
    } else if (fairness.groupSatisfactionScore >= 80) {
      headline = `Strong Consensus: ${winner.title} (${fairness.groupSatisfactionScore}% satisfaction)`;
    }

    const whyItWon =
      `${winner.title} won with a final score of ${scoredCandidates[0].finalScore} pts. ` +
      `Supported by ${scoredCandidates[0].supporterCount} participant(s) while respecting all hard constraints.`;

    const compromisesDescription =
      fairness.compromisesMade.length > 0
        ? fairness.compromisesMade.join('. ') + '.'
        : 'All participants got their preferred choice without major compromise.';

    return {
      winner,
      runnerUp,
      rankings: scoredCandidates,
      eliminated,
      fairness,
      algorithmUsed: this.options.algorithm,
      decisionSummary: {
        headline,
        whyItWon,
        compromisesDescription,
        vetoesHonoredCount,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
