import { Candidate, Participant } from '../types';

export interface BordaScoreMap {
  [candidateId: string]: {
    candidate: Candidate;
    bordaScore: number;
    preferenceBonus: number;
    supporterCount: number;
    reasons: string[];
  };
}

/**
 * Computes Borda count scores across all eligible candidates.
 * For each participant with ranked candidates:
 * If there are K ranked candidates:
 *   #1 rank receives K points
 *   #2 rank receives K-1 points
 *   ...
 *   #K rank receives 1 point
 *
 * Also factors in thumbs-up likes, ratings, and genre weights.
 */
export function calculateBordaScores(
  candidates: Candidate[],
  participants: Participant[]
): BordaScoreMap {
  const scoreMap: BordaScoreMap = {};

  for (const candidate of candidates) {
    scoreMap[candidate.id] = {
      candidate,
      bordaScore: 0,
      preferenceBonus: 0,
      supporterCount: 0,
      reasons: [],
    };
  }

  for (const participant of participants) {
    const rankedIds = participant.rankedCandidateIds || [];
    const numRanked = rankedIds.length;

    // 1. Positional Borda Points from Ranked List
    rankedIds.forEach((id, index) => {
      if (scoreMap[id]) {
        const points = numRanked - index;
        scoreMap[id].bordaScore += points;
        scoreMap[id].supporterCount += 1;
        scoreMap[id].reasons.push(
          `${participant.name} ranked #${index + 1} (+${points} pts)`
        );
      }
    });

    // 2. Thumbs-up Likes (+2 pts)
    const likedIds = participant.likedCandidateIds || [];
    for (const id of likedIds) {
      if (scoreMap[id]) {
        // If not already counted in rankings, add to supporter count
        if (!rankedIds.includes(id)) {
          scoreMap[id].supporterCount += 1;
        }
        scoreMap[id].preferenceBonus += 2;
        scoreMap[id].reasons.push(`${participant.name} liked this (+2 pts)`);
      }
    }

    // 3. Thumbs-down Dislikes (-3 pts penalty)
    const dislikedIds = participant.dislikedCandidateIds || [];
    for (const id of dislikedIds) {
      if (scoreMap[id]) {
        scoreMap[id].preferenceBonus -= 3;
        scoreMap[id].reasons.push(`${participant.name} disliked this (-3 pts)`);
      }
    }

    // 4. Star Ratings (1-5 scale)
    const ratings = participant.ratings || {};
    for (const [id, rating] of Object.entries(ratings)) {
      if (scoreMap[id]) {
        scoreMap[id].preferenceBonus += rating;
        scoreMap[id].reasons.push(
          `${participant.name} gave ${rating} stars (+${rating} pts)`
        );
      }
    }

    // 5. Genre Alignment Bonus
    const genrePrefs = participant.genrePreferences || {};
    for (const candidate of candidates) {
      if (!candidate.genres) continue;
      let genreBonus = 0;
      for (const genre of candidate.genres) {
        if (genrePrefs[genre]) {
          genreBonus += genrePrefs[genre];
        }
      }
      if (genreBonus !== 0) {
        scoreMap[candidate.id].preferenceBonus += genreBonus;
        scoreMap[candidate.id].reasons.push(
          `${participant.name} genre preference match (${genreBonus > 0 ? '+' : ''}${genreBonus} pts)`
        );
      }
    }
  }

  return scoreMap;
}
