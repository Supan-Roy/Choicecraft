import { Candidate, Participant } from '../types';

export interface CandidateRegretMap {
  [candidateId: string]: {
    maxRegret: number;
    leastSatisfiedParticipantId: string;
    leastSatisfiedParticipantName: string;
    satisfactionScores: Record<string, number>;
  };
}

/**
 * Calculates Minimax Regret across candidates.
 * Regret measures how much worse a candidate is for a participant compared to their ideal top pick.
 * By minimizing the maximum regret across all participants (Minimax Regret / Least Misery Principle),
 * we prevent "tyranny of the majority" where 2 people are ecstatic and 1 person is completely alienated.
 */
export function calculateMinimaxRegret(
  candidates: Candidate[],
  participants: Participant[]
): CandidateRegretMap {
  const regretMap: CandidateRegretMap = {};

  if (candidates.length === 0 || participants.length === 0) {
    return regretMap;
  }

  // Step 1: Calculate raw satisfaction score s(i, c) for each participant i on candidate c
  // on a scale of 0 to 100.
  const rawScores: Record<string, Record<string, number>> = {};
  const maxParticipantSatisfaction: Record<string, number> = {};

  for (const participant of participants) {
    rawScores[participant.id] = {};
    const ranked = participant.rankedCandidateIds || [];
    const liked = participant.likedCandidateIds || [];
    const disliked = participant.dislikedCandidateIds || [];
    const ratings = participant.ratings || {};
    const genrePrefs = participant.genrePreferences || {};

    let bestPossibleScore = 0;

    for (const candidate of candidates) {
      let score = 50; // Neutral baseline

      // Ranked position
      const rankIdx = ranked.indexOf(candidate.id);
      if (rankIdx !== -1) {
        // e.g. rank 1 of 5 -> +40 pts; rank 5 of 5 -> -20 pts
        const rankPercentile = (ranked.length - rankIdx) / ranked.length;
        score += rankPercentile * 40;
      }

      // Explicit Likes / Dislikes
      if (liked.includes(candidate.id)) score += 20;
      if (disliked.includes(candidate.id)) score -= 35;

      // Ratings (1-5 stars)
      if (ratings[candidate.id] !== undefined) {
        score += (ratings[candidate.id] - 3) * 15;
      }

      // Genre alignment
      if (candidate.genres) {
        for (const g of candidate.genres) {
          if (genrePrefs[g]) {
            score += genrePrefs[g] * 8;
          }
        }
      }

      // Clamp between 0 and 100
      const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
      rawScores[participant.id][candidate.id] = clampedScore;

      if (clampedScore > bestPossibleScore) {
        bestPossibleScore = clampedScore;
      }
    }

    maxParticipantSatisfaction[participant.id] = Math.max(bestPossibleScore, 1);
  }

  // Step 2: Compute regret r(i, c) = best_i - s(i, c), and find max_i r(i, c) for each candidate c
  for (const candidate of candidates) {
    let maxRegret = -1;
    let worstParticipantId = '';
    let worstParticipantName = '';
    const satisfactionPerParticipant: Record<string, number> = {};

    for (const participant of participants) {
      const satisfaction = rawScores[participant.id][candidate.id] ?? 50;
      satisfactionPerParticipant[participant.id] = satisfaction;

      const ideal = maxParticipantSatisfaction[participant.id];
      const regret = Math.max(0, ideal - satisfaction);

      if (regret > maxRegret) {
        maxRegret = regret;
        worstParticipantId = participant.id;
        worstParticipantName = participant.name;
      }
    }

    regretMap[candidate.id] = {
      maxRegret: Math.round(maxRegret),
      leastSatisfiedParticipantId: worstParticipantId,
      leastSatisfiedParticipantName: worstParticipantName,
      satisfactionScores: satisfactionPerParticipant,
    };
  }

  return regretMap;
}
