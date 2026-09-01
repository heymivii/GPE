import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

import apiClient from '../lib/api';
import { ratingsApi } from './ratings';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedDelete = apiClient.delete as ReturnType<typeof vi.fn>;

describe('ratingsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rate() POSTs stars and comment to /forum-message/:id/rate', async () => {
    mockedPost.mockResolvedValue({ data: { ok: true } });
    const result = await ratingsApi.rate(6, 5, 'great');
    expect(mockedPost).toHaveBeenCalledWith('/forum-message/6/rate', {
      stars: 5,
      comment: 'great',
    });
    expect(result).toEqual({ ok: true });
  });

  it('unrate() DELETEs /forum-message/:id/rate', async () => {
    mockedDelete.mockResolvedValue({});
    await ratingsApi.unrate(6);
    expect(mockedDelete).toHaveBeenCalledWith('/forum-message/6/rate');
  });

  it('myTopicRatings() GETs with the topicId query param', async () => {
    mockedGet.mockResolvedValue({ data: [{ messageId: 6, stars: 5 }] });
    const result = await ratingsApi.myTopicRatings(3);
    expect(mockedGet).toHaveBeenCalledWith('/forum-message/ratings/mine?topicId=3');
    expect(result).toEqual([{ messageId: 6, stars: 5 }]);
  });

  it('userRating() GETs /users/:id/rating', async () => {
    mockedGet.mockResolvedValue({ data: { average: 4.5, count: 10 } });
    const result = await ratingsApi.userRating(1);
    expect(mockedGet).toHaveBeenCalledWith('/users/1/rating');
    expect(result).toEqual({ average: 4.5, count: 10 });
  });
});
