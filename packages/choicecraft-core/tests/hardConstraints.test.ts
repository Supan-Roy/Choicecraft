import { filterHardConstraints } from '../src/algorithms/hardConstraints';
import { Candidate, Participant } from '../src/types';

describe('HardConstraints Algorithm', () => {
  const sampleCandidates: Candidate[] = [
    {
      id: 'zombie-night',
      title: 'Zombie Night',
      genres: ['Horror', 'Action'],
      runtimeMinutes: 125,
      contentRating: 'TV-MA',
    },
    {
      id: 'family-cats',
      title: 'Family Cats',
      genres: ['Comedy', 'Family'],
      runtimeMinutes: 85,
      contentRating: 'TV-G',
    },
    {
      id: 'waiting-room',
      title: 'Waiting Room',
      genres: ['Documentary'],
      runtimeMinutes: 95,
      contentRating: 'TV-PG',
    },
  ];

  it('eliminates candidate matching a vetoed genre', () => {
    const participants: Participant[] = [
      {
        id: 'user-1',
        name: 'Alice',
        hardConstraints: {
          vetoedGenres: ['Horror'],
        },
      },
    ];

    const result = filterHardConstraints(sampleCandidates, participants);
    expect(result.eligible).toHaveLength(2);
    expect(result.eligible.map(c => c.id)).not.toContain('zombie-night');
    expect(result.eliminated).toHaveLength(1);
    expect(result.eliminated[0].rule).toBe('veto_genre');
    expect(result.eliminated[0].candidateId).toBe('zombie-night');
    expect(result.eliminated[0].participantName).toBe('Alice');
  });

  it('eliminates candidate exceeding maximum runtime', () => {
    const participants: Participant[] = [
      {
        id: 'user-2',
        name: 'Bob',
        hardConstraints: {
          maxRuntimeMinutes: 90,
        },
      },
    ];

    const result = filterHardConstraints(sampleCandidates, participants);
    expect(result.eligible).toHaveLength(1);
    expect(result.eligible[0].id).toBe('family-cats');
    expect(result.eliminated.map(e => e.candidateId)).toEqual(
      expect.arrayContaining(['zombie-night', 'waiting-room'])
    );
  });

  it('eliminates candidate violating allowed content rating', () => {
    const participants: Participant[] = [
      {
        id: 'user-3',
        name: 'Kids Parent',
        hardConstraints: {
          allowedContentRatings: ['TV-G'],
        },
      },
    ];

    const result = filterHardConstraints(sampleCandidates, participants);
    expect(result.eligible).toHaveLength(1);
    expect(result.eligible[0].id).toBe('family-cats');
    expect(result.eliminated.map(e => e.candidateId)).toEqual(
      expect.arrayContaining(['zombie-night', 'waiting-room'])
    );
  });

  it('relaxes constraints gracefully if all candidates are eliminated', () => {
    const participants: Participant[] = [
      {
        id: 'user-strict',
        name: 'Impossible Constraint User',
        hardConstraints: {
          maxRuntimeMinutes: 30, // None of the candidates are <= 30m
        },
      },
    ];

    const result = filterHardConstraints(sampleCandidates, participants);
    expect(result.relaxedConstraintsApplied).toBe(true);
    expect(result.eligible.length).toBeGreaterThan(0);
    expect(result.eliminated.length).toBe(3);
  });
});
