import { rankCandidatesByProximity } from './proximity-ranking';

describe('rankCandidatesByProximity', () => {
  it('prioritizes shorter geographic distances', () => {
    const ranked = rankCandidatesByProximity(
      [
        { id: 'longe', latitude: -25.4284, longitude: -49.2733 },
        { id: 'perto', latitude: -23.5617, longitude: -46.6559 },
      ],
      { latitude: -23.5505, longitude: -46.6333 },
    );

    expect(ranked.map(({ id }) => id)).toEqual(['perto', 'longe']);
  });

  it('uses city and state when a profile has no coordinates yet', () => {
    const ranked = rankCandidatesByProximity(
      [
        { id: 'outro-estado', city: 'Curitiba', state: 'PR' },
        { id: 'mesmo-estado', city: 'Campinas', state: 'SP' },
        { id: 'mesma-cidade', city: 'São Paulo', state: 'SP' },
      ],
      { city: 'Sao Paulo', state: 'SP' },
    );

    expect(ranked.map(({ id }) => id)).toEqual([
      'mesma-cidade',
      'mesmo-estado',
      'outro-estado',
    ]);
  });
});
