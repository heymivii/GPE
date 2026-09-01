import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn() },
}));

import api from '../lib/api';
import { getBuddies } from './buddies';

const mockedGet = api.get as ReturnType<typeof vi.fn>;

describe('getBuddies()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GETs /procedure-tracking/buddies with the procedure and country as params', async () => {
    mockedGet.mockResolvedValue({ data: [{ idUser: 2, firstname: 'Jane' }] });

    const result = await getBuddies(5, 10);

    expect(mockedGet).toHaveBeenCalledWith('/procedure-tracking/buddies', {
      params: { procedureId: 5, countryId: 10 },
    });
    expect(result).toEqual([{ idUser: 2, firstname: 'Jane' }]);
  });
});
