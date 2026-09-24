import { evaluateFairness } from '../src/algorithms/fairnessIndex';
import { Candidate, Participant } from '../src/types';

describe('Fairness Index Algorithm', () => {
  const candidates: Candidate[] = [
    { id: 'movie-1', title: 'Cosmic Voyage', genres: ['Sci-Fi'] },
    { id: 'movie-2', title: 'Laugh Out Loud', genres: ['Comedy'] },
    { id: 'movie-3', title: 'Deep Ocean', genres: ['Documentary'] },
  ];

  it('detects unanimous agreement when all voters share the top pick', () => {
    const participants: Participant[] = [
      { id: 'p1', name: 'Alice', rankedCandidateIds: ['movie-1', 'movie-2'] },
      { id: 'p2', name: 'Bob', rankedCandidateIds: ['movie-1', 'movie-3'] },
    ];

    const metrics = evaluateFairness(candidates[0], candidates, participants);

    expect(metrics.isUnanimous).toBe(true);
    expect(metrics.groupSatisfactionScore).toBeGreaterThanOrEqual(80);
    expect(metrics.compromisesMade).toHaveLength(0);
    expect(metrics.participantBreakdown['p1'].topPickWon).toBe(true);
    expect(metrics.participantBreakdown['p2'].topPickWon).toBe(true);
  });

  it('accurately identifies compromises when group compromise wins over personal #1', () => {
    const participants: Participant[] = [
      {
        id: 'p1',
        name: 'Alice',
        rankedCandidateIds: ['movie-1', 'movie-3'],
      },
      {
        id: 'p2',
        name: 'Bob',
        rankedCandidateIds: ['movie-2', 'movie-3'],
      },
    ];

    // Movie 3 (Deep Ocean) is chosen as compromise
    const metrics = evaluateFairness(candidates[2], candidates, participants);

    expect(metrics.isUnanimous).toBe(false);
    expect(metrics.compromisesMade.length).toBeGreaterThan(0);
    expect(metrics.participantBreakdown['p1'].sacrifices.length).toBeGreaterThan(0);
    expect(metrics.participantBreakdown['p2'].sacrifices.length).toBeGreaterThan(0);
  });

  it('reflects participant thumbs-down as lower satisfaction and sacrifice', () => {
    const participants: Participant[] = [
      {
        id: 'p1',
        name: 'Charlie',
        dislikedCandidateIds: ['movie-2'],
      },
      {
        id: 'p2',
        name: 'Dana',
        likedCandidateIds: ['movie-2'],
      },
    ];

    const metrics = evaluateFairness(candidates[1], candidates, participants);

    expect(metrics.leastSatisfiedParticipant.participantId).toBe('p1');
    expect(metrics.mostSatisfiedParticipant.participantId).toBe('p2');
    expect(metrics.participantBreakdown['p1'].satisfactionScore).toBeLessThan(
      metrics.participantBreakdown['p2'].satisfactionScore
    );
  });
});
