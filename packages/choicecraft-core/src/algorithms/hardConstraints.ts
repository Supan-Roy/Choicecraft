import { Candidate, EliminationReason, Participant } from '../types';

export interface HardConstraintFilterResult {
  eligible: Candidate[];
  eliminated: EliminationReason[];
  relaxedConstraintsApplied: boolean;
}

/**
 * Deterministically filters out candidates that violate any participant's hard constraints.
 * No candidate that violates a veto can pass through this filter unless all candidates are eliminated,
 * in which case a controlled fallback with explicit warnings is provided.
 */
export function filterHardConstraints(
  candidates: Candidate[],
  participants: Participant[]
): HardConstraintFilterResult {
  const eliminated: EliminationReason[] = [];
  const eliminatedMap = new Map<string, EliminationReason[]>();

  for (const candidate of candidates) {
    for (const participant of participants) {
      const constraints = participant.hardConstraints;
      if (!constraints) continue;

      // 1. Vetoed Candidate ID
      if (
        constraints.vetoedCandidateIds &&
        constraints.vetoedCandidateIds.includes(candidate.id)
      ) {
        const reason: EliminationReason = {
          candidateId: candidate.id,
          candidateTitle: candidate.title,
          participantId: participant.id,
          participantName: participant.name,
          rule: 'veto_candidate',
          explanation: `${participant.name} vetoed "${candidate.title}".`,
        };
        eliminated.push(reason);
        if (!eliminatedMap.has(candidate.id)) eliminatedMap.set(candidate.id, []);
        eliminatedMap.get(candidate.id)!.push(reason);
        break;
      }

      // 2. Vetoed Genres
      if (constraints.vetoedGenres && candidate.genres) {
        const matchingVeto = candidate.genres.find(g =>
          constraints.vetoedGenres!.some(vg => vg.toLowerCase() === g.toLowerCase())
        );
        if (matchingVeto) {
          const reason: EliminationReason = {
            candidateId: candidate.id,
            candidateTitle: candidate.title,
            participantId: participant.id,
            participantName: participant.name,
            rule: 'veto_genre',
            explanation: `${participant.name} vetoed the "${matchingVeto}" genre.`,
          };
          eliminated.push(reason);
          if (!eliminatedMap.has(candidate.id)) eliminatedMap.set(candidate.id, []);
          eliminatedMap.get(candidate.id)!.push(reason);
          break;
        }
      }

      // 3. Max Runtime Minutes
      if (
        constraints.maxRuntimeMinutes !== undefined &&
        candidate.runtimeMinutes !== undefined &&
        candidate.runtimeMinutes > constraints.maxRuntimeMinutes
      ) {
        const reason: EliminationReason = {
          candidateId: candidate.id,
          candidateTitle: candidate.title,
          participantId: participant.id,
          participantName: participant.name,
          rule: 'max_runtime',
          explanation: `Runtime (${candidate.runtimeMinutes} min) exceeds ${participant.name}'s cap of ${constraints.maxRuntimeMinutes} min.`,
        };
        eliminated.push(reason);
        if (!eliminatedMap.has(candidate.id)) eliminatedMap.set(candidate.id, []);
        eliminatedMap.get(candidate.id)!.push(reason);
        break;
      }

      // 4. Allowed Content Ratings (e.g. TV-G, TV-PG)
      if (
        constraints.allowedContentRatings &&
        constraints.allowedContentRatings.length > 0 &&
        candidate.contentRating
      ) {
        const isAllowed = constraints.allowedContentRatings.some(
          r => r.toLowerCase() === candidate.contentRating!.toLowerCase()
        );
        if (!isAllowed) {
          const reason: EliminationReason = {
            candidateId: candidate.id,
            candidateTitle: candidate.title,
            participantId: participant.id,
            participantName: participant.name,
            rule: 'content_rating',
            explanation: `Rating "${candidate.contentRating}" is not in ${participant.name}'s allowed ratings (${constraints.allowedContentRatings.join(', ')}).`,
          };
          eliminated.push(reason);
          if (!eliminatedMap.has(candidate.id)) eliminatedMap.set(candidate.id, []);
          eliminatedMap.get(candidate.id)!.push(reason);
          break;
        }
      }

      // 5. Custom Predicate Filter
      if (constraints.customFilter) {
        const check = constraints.customFilter(candidate);
        if (!check.allowed) {
          const reason: EliminationReason = {
            candidateId: candidate.id,
            candidateTitle: candidate.title,
            participantId: participant.id,
            participantName: participant.name,
            rule: 'custom',
            explanation: check.reason || `${participant.name}'s custom filter excluded "${candidate.title}".`,
          };
          eliminated.push(reason);
          if (!eliminatedMap.has(candidate.id)) eliminatedMap.set(candidate.id, []);
          eliminatedMap.get(candidate.id)!.push(reason);
          break;
        }
      }
    }
  }

  const eligible = candidates.filter(c => !eliminatedMap.has(c.id));

  // Edge case: if constraints are so tight that 0 candidates survive,
  // we do NOT crash or return nothing. We return the candidates with relaxed constraints and flag it.
  if (eligible.length === 0 && candidates.length > 0) {
    return {
      eligible: candidates,
      eliminated,
      relaxedConstraintsApplied: true,
    };
  }

  return {
    eligible,
    eliminated,
    relaxedConstraintsApplied: false,
  };
}
