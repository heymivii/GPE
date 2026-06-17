import axios from 'axios';
import { clampRankResult, OllamaRanker } from './llm-ranker';

jest.mock('axios');

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

describe('OllamaRanker.health()', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => jest.clearAllMocks());

  it('returns true when GET /models resolves', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({ data: {} });
    const ranker = new OllamaRanker('http://localhost:11434/v1', 'qwen2.5:7b-instruct', 'ollama');
    expect(await ranker.health()).toBe(true);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:11434/v1/models',
      expect.objectContaining({ timeout: 3000 }),
    );
  });

  it('returns false when GET /models rejects', async () => {
    mockedAxios.get = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    const ranker = new OllamaRanker('http://localhost:11434/v1', 'qwen2.5:7b-instruct', 'ollama');
    expect(await ranker.health()).toBe(false);
  });
});

describe('OllamaRanker.summarize()', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  beforeEach(() => jest.clearAllMocks());

  it('returns the grounded points parsed from the model', async () => {
    mockedAxios.post = jest.fn().mockResolvedValue({
      data: { choices: [{ message: { content: JSON.stringify({ points: ['Inscription obligatoire', 'Gratuit'] }) } }] },
    });
    const ranker = new OllamaRanker('http://localhost:11434/v1', 'm', 'ollama');
    expect(await ranker.summarize('Page parlant de sécurité sociale...', { country: 'France', category: 'sante' }))
      .toEqual(['Inscription obligatoire', 'Gratuit']);
  });

  it('returns [] for empty page text WITHOUT calling the model', async () => {
    mockedAxios.post = jest.fn();
    const ranker = new OllamaRanker('http://localhost:11434/v1', 'm', 'ollama');
    expect(await ranker.summarize('   ', { country: 'France', category: 'sante' })).toEqual([]);
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('returns [] when the model call rejects', async () => {
    mockedAxios.post = jest.fn().mockRejectedValue(new Error('down'));
    const ranker = new OllamaRanker('http://localhost:11434/v1', 'm', 'ollama');
    expect(await ranker.summarize('du contenu réel', { country: 'France', category: 'sante' })).toEqual([]);
  });
});
