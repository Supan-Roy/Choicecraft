import {
  Candidate,
  GroupFairnessMetrics,
  Participant,
  ParticipantSatisfaction,
} from '../types';

/**
 * Evaluates group satisfaction, fairness, and compromise metrics for a given winning candidate.
 */
export function evaluateFairness(
  winner: Candidate,
  candidates: Candidate[],
  participants: Participant[]
): GroupFairnessMetrics {
  const breakdown: Record<string, ParticipantSatisfaction> = {};
  const satisfactionScores: number[] = [];
  const compromisesMade: string[] = [];
  let unanimous = participants.length > 0;

  for (const participant of participants) {
    const ranked = participant.rankedCandidateIds || [];
    const liked = participant.likedCandidateIds || [];
    const disliked = participant.dislikedCandidateIds || [];
    const ratings = participant.ratings || {};
    const genrePrefs = participant.genrePreferences || {};

    const topPickId = ranked[0];
    const topChoiceCandidate = candidates.find(c => c.id === topPickId);
    const topPickWon = topPickId === winner.id;

    if (!topPickWon && ranked.length > 0) {
      unanimous = false;
    }

    const wins: string[] = [];
    const sacrifices: string[] = [];

    // Calculate baseline satisfaction for this winner (0 - 100)
    let score = 50;

    // Check rank
    const rankIndex = ranked.indexOf(winner.id);
    if (rankIndex !== -1) {
      const position = rankIndex + 1;
      const rankBonus = ((ranked.length - rankIndex) / ranked.length) * 40;
      score += rankBonus;
      wins.push(`Ranked #${position} on your ballot`);
      if (rankIndex > 0 && topChoiceCandidate) {
        sacrifices.push(
          `Your #1 pick was "${topChoiceCandidate.title}", but group aligned on "${winner.title}"`
        );
        compromisesMade.push(
          `${participant.name} compromised on top choice "${topChoiceCandidate.title}" (settled for #${position})`
        );
      }
    } else if (ranked.length > 0) {
      score -= 10;
      if (topChoiceCandidate) {
        sacrifices.push(
          `Your #1 pick was "${topChoiceCandidate.title}", but group aligned on "${winner.title}"`
        );
        compromisesMade.push(
          `${participant.name} compromised on top choice "${topChoiceCandidate.title}"`
        );
      }
    }

    // Check likes / dislikes
    if (liked.includes(winner.id)) {
      score += 20;
      wins.push('You gave this a thumbs-up like');
    }
    if (disliked.includes(winner.id)) {
      score -= 30;
      sacrifices.push('You had marked this with a thumbs-down');
    }

    // Check ratings
    if (ratings[winner.id] !== undefined) {
      const userRating = ratings[winner.id];
      score += (userRating - 3) * 15;
      if (userRating >= 4) {
        wins.push(`You rated this ${userRating}/5 stars`);
      } else if (userRating <= 2) {
        sacrifices.push(`You rated this lower (${userRating}/5 stars)`);
      }
    }

    // Check genre alignment
    if (winner.genres) {
      for (const g of winner.genres) {
        if (genrePrefs[g] && genrePrefs[g] > 0) {
          wins.push(`Matches your genre preference for "${g}"`);
        } else if (genrePrefs[g] && genrePrefs[g] < 0) {
          sacrifices.push(`Includes genre "${g}" which you rated lower`);
        }
      }
    }

    // Hard constraints satisfaction
    if (participant.hardConstraints?.maxRuntimeMinutes && winner.runtimeMinutes) {
      wins.push(
        `Runtime (${winner.runtimeMinutes} min) satisfies your ${participant.hardConstraints.maxRuntimeMinutes} min cap`
      );
    }

    const finalParticipantScore = Math.max(0, Math.min(100, Math.round(score)));
    satisfactionScores.push(finalParticipantScore);

    breakdown[participant.id] = {
      participantId: participant.id,
      participantName: participant.name,
      satisfactionScore: finalParticipantScore,
      topPickWon,
      topChoiceTitle: topChoiceCandidate?.title,
      sacrifices,
      wins,
    };
  }

  // Calculate Group Mean & Variance
  const total = satisfactionScores.reduce((sum, s) => sum + s, 0);
  const groupSatisfactionScore =
    participants.length > 0 ? Math.round(total / participants.length) : 100;

  let minScore = 100;
  let maxScore = 0;
  let leastSatisfiedParticipant = Object.values(breakdown)[0];
  let mostSatisfiedParticipant = Object.values(breakdown)[0];

  for (const item of Object.values(breakdown)) {
    if (item.satisfactionScore < minScore) {
      minScore = item.satisfactionScore;
      leastSatisfiedParticipant = item;
    }
    if (item.satisfactionScore > maxScore) {
      maxScore = item.satisfactionScore;
      mostSatisfiedParticipant = item;
    }
  }

  // Variance: sum((x - mean)^2) / N
  const variance =
    participants.length > 0
      ? Math.round(
          satisfactionScores.reduce(
            (acc, s) => acc + Math.pow(s - groupSatisfactionScore, 2),
            0
          ) / participants.length
        )
      : 0;

  return {
    groupSatisfactionScore,
    leastSatisfiedScore: minScore,
    mostSatisfiedScore: maxScore,
    leastSatisfiedParticipant: leastSatisfiedParticipant || {
      participantId: '',
      participantName: 'None',
      satisfactionScore: 100,
      topPickWon: true,
      sacrifices: [],
      wins: [],
    },
    mostSatisfiedParticipant: mostSatisfiedParticipant || {
      participantId: '',
      participantName: 'None',
      satisfactionScore: 100,
      topPickWon: true,
      sacrifices: [],
      wins: [],
    },
    participantBreakdown: breakdown,
    compromisesMade,
    isUnanimous: unanimous,
    varianceScore: variance,
  };
}
