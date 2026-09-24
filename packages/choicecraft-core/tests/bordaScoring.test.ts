import { calculateBordaScores } from '../src/algorithms/bordaScoring';
import { Candidate, Participant } from '../src/types';

describe('Borda Scoring Algorithm', () => {
  const candidates: Candidate[] = [
    { id: 'movie-a', title: 'Movie A', genres: ['Action'] },
    { id: 'movie-b', title: 'Movie B', genres: ['Comedy'] },
    { id: 'movie-c', title: 'Movie C', genres: ['Sci-Fi'] },
  ];

  it('calculates positional Borda points from ranked lists', () => {
    const participants: Participant[] = [
      {
        id: 'p1',
        name: 'Alex',
        rankedCandidateIds: ['movie-a', 'movie-b', 'movie-c'],
      },
      {
        id: 'p2',
        name: 'Jordan',
        rankedCandidateIds: ['movie-b', 'movie-c', 'movie-a'],
      },
    ];

    const scores = calculateBordaScores(candidates, participants);

    // Alex: A: 3, B: 2, C: 1
    // Jordan: B: 3, C: 2, A: 1
    // Totals: A: 4, B: 5, C: 3
    expect(scores['movie-a'].bordaScore).toBe(4);
    expect(scores['movie-b'].bordaScore).toBe(5);
    expect(scores['movie-c'].bordaScore).toBe(3);
  });

  it('incorporates likes, dislikes, and ratings', () => {
    const participants: Participant[] = [
      {
        id: 'p1',
        name: 'Sam',
        likedCandidateIds: ['movie-a'],
        dislikedCandidateIds: ['movie-c'],
        ratings: { 'movie-b': 5 },
      },
    ];

    const scores = calculateBordaScores(candidates, participants);
    expect(scores['movie-a'].preferenceBonus).toBe(2); // like: +2
    expect(scores['movie-c'].preferenceBonus).toBe(-3); // dislike: -3
    expect(scores['movie-b'].preferenceBonus).toBe(5); // 5-star rating: +5
  });
});
