import { ChoicecraftEngine } from '../src/engine';
import { Candidate, Participant } from '../src/types';

describe('ChoicecraftEngine Orchestrator', () => {
  const candidates: Candidate[] = [
    {
      id: 'horror-flick',
      title: 'Night of the Living Dread',
      genres: ['Horror'],
      runtimeMinutes: 110,
      contentRating: 'R',
    },
    {
      id: 'family-adventure',
      title: 'Island of Wonders',
      genres: ['Adventure', 'Family'],
      runtimeMinutes: 92,
      contentRating: 'PG',
    },
    {
      id: 'fast-action',
      title: 'Velocity Overdrive',
      genres: ['Action'],
      runtimeMinutes: 130,
      contentRating: 'PG-13',
    },
  ];

  it('throws error when no candidates are provided', () => {
    const engine = new ChoicecraftEngine();
    expect(() => engine.evaluate([], [])).toThrow(
      'ChoicecraftEngine: At least one candidate is required.'
    );
  });

  it('runs complete consensus pipeline filtering vetoes and picking balanced consensus', () => {
    const engine = new ChoicecraftEngine({ algorithm: 'hybrid' });

    const participants: Participant[] = [
      {
        id: 'parent',
        name: 'Parent',
        hardConstraints: {
          allowedContentRatings: ['G', 'PG'],
          maxRuntimeMinutes: 100,
        },
        rankedCandidateIds: ['family-adventure'],
      },
      {
        id: 'teen',
        name: 'Teen',
        hardConstraints: {
          vetoedGenres: ['Horror'],
        },
        rankedCandidateIds: ['family-adventure', 'fast-action'],
        likedCandidateIds: ['family-adventure'],
      },
    ];

    const result = engine.evaluate(candidates, participants);

    // Horror flick eliminated by Teen's veto AND Parent's rating cap
    // Velocity Overdrive eliminated by Parent's runtime cap (> 100 min)
    expect(result.eliminated.length).toBeGreaterThanOrEqual(2);
    expect(result.eliminated.map(e => e.candidateId)).toContain('horror-flick');
    expect(result.eliminated.map(e => e.candidateId)).toContain('fast-action');

    // Only Island of Wonders survives hard constraints
    expect(result.winner.id).toBe('family-adventure');
    expect(result.rankings[0].candidate.id).toBe('family-adventure');
    expect(result.rankings[0].rank).toBe(1);
    expect(result.decisionSummary.headline).toContain('Island of Wonders');
    expect(result.decisionSummary.vetoesHonoredCount).toBeGreaterThanOrEqual(2);
    expect(result.fairness.groupSatisfactionScore).toBeGreaterThanOrEqual(70);
  });

  it('supports pure Borda count mode', () => {
    const engine = new ChoicecraftEngine({ algorithm: 'borda' });
    const simpleCandidates: Candidate[] = [
      { id: 'opt-1', title: 'Option 1' },
      { id: 'opt-2', title: 'Option 2' },
    ];
    const participants: Participant[] = [
      { id: 'u1', name: 'User 1', rankedCandidateIds: ['opt-1', 'opt-2'] },
      { id: 'u2', name: 'User 2', rankedCandidateIds: ['opt-1', 'opt-2'] },
    ];

    const result = engine.evaluate(simpleCandidates, participants);
    expect(result.algorithmUsed).toBe('borda');
    expect(result.winner.id).toBe('opt-1');
  });

  it('supports minimax regret mode prioritizing the least polarized candidate', () => {
    const engine = new ChoicecraftEngine({ algorithm: 'minimax_regret' });
    const simpleCandidates: Candidate[] = [
      { id: 'opt-polarizing', title: 'Polarizing Option' },
      { id: 'opt-consensus', title: 'Consensus Option' },
    ];
    const participants: Participant[] = [
      {
        id: 'u1',
        name: 'User 1',
        rankedCandidateIds: ['opt-polarizing', 'opt-consensus'],
      },
      {
        id: 'u2',
        name: 'User 2',
        rankedCandidateIds: ['opt-consensus'],
        dislikedCandidateIds: ['opt-polarizing'],
      },
    ];

    const result = engine.evaluate(simpleCandidates, participants);
    expect(result.algorithmUsed).toBe('minimax_regret');
    expect(result.winner.id).toBe('opt-consensus');
  });
});
