import { calculateMinimaxRegret } from '../src/algorithms/minimaxRegret';
import { Candidate, Participant } from '../src/types';

describe('Minimax Regret Algorithm', () => {
  const candidates: Candidate[] = [
    { id: 'movie-polarizing', title: 'Polarizing Movie' },
    { id: 'movie-consensus', title: 'Crowd Pleaser Movie' },
  ];

  it('favors candidate that prevents maximum voter misery', () => {
    // 2 voters love Polarizing (1st choice), 1 voter intensely dislikes Polarizing.
    // Crowd Pleaser is everyone's acceptable 2nd choice.
    const participants: Participant[] = [
      {
        id: 'p1',
        name: 'Voter 1',
        rankedCandidateIds: ['movie-polarizing', 'movie-consensus'],
      },
      {
        id: 'p2',
        name: 'Voter 2',
        rankedCandidateIds: ['movie-polarizing', 'movie-consensus'],
      },
      {
        id: 'p3',
        name: 'Voter 3',
        rankedCandidateIds: ['movie-consensus'],
        dislikedCandidateIds: ['movie-polarizing'],
      },
    ];

    const regretMap = calculateMinimaxRegret(candidates, participants);

    // Polarizing Movie has huge regret for Voter 3
    expect(regretMap['movie-polarizing'].maxRegret).toBeGreaterThan(
      regretMap['movie-consensus'].maxRegret
    );
    expect(regretMap['movie-polarizing'].leastSatisfiedParticipantName).toBe('Voter 3');
  });
});
