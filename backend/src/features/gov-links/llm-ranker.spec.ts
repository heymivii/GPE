import { clampRankResult } from './llm-ranker';

describe('clampRankResult', () => {
  const candidates = [{ url: 'a', title: 't', snippet: 's' }, { url: 'b', title: 't', snippet: 's' }];
  it('keeps a valid index', () => {
    expect(clampRankResult({ index: 1, label: 'B', confidence: 0.9 }, candidates)).toEqual({ index: 1, label: 'B', confidence: 0.9 });
  });
  it('rejects an out-of-range index → null (no hallucination)', () => {
    expect(clampRankResult({ index: 5, label: 'X', confidence: 0.9 }, candidates)).toBeNull();
    expect(clampRankResult({ index: -1, label: 'X', confidence: 0.9 }, candidates)).toBeNull();
  });
  it('clamps confidence to 0..1', () => {
    expect(clampRankResult({ index: 0, label: 'A', confidence: 5 }, candidates)?.confidence).toBe(1);
  });
});
