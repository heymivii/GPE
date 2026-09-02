import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

import api from '../lib/api';
import { buddyContactApi } from './buddy-contact';

const mockedGet = api.get as ReturnType<typeof vi.fn>;
const mockedPost = api.post as ReturnType<typeof vi.fn>;
const mockedPatch = api.patch as ReturnType<typeof vi.fn>;

describe('buddyContactApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sendRequest() POSTs the recipient, procedure and optional message', async () => {
    mockedPost.mockResolvedValue({ data: { id: 1, status: 'pending' } });
    const result = await buddyContactApi.sendRequest(2, 5, 'Salut !');
    expect(mockedPost).toHaveBeenCalledWith('/buddy-contact/request', {
      recipientId: 2,
      procedureId: 5,
      message: 'Salut !',
    });
    expect(result).toEqual({ id: 1, status: 'pending' });
  });

  it('sendRequest() omits the message when not provided', async () => {
    mockedPost.mockResolvedValue({ data: { id: 1 } });
    await buddyContactApi.sendRequest(2, 5);
    expect(mockedPost).toHaveBeenCalledWith('/buddy-contact/request', {
      recipientId: 2,
      procedureId: 5,
      message: undefined,
    });
  });

  it('respond() PATCHes the request with accept/decline', async () => {
    mockedPatch.mockResolvedValue({ data: { id: 1, status: 'accepted' } });
    const result = await buddyContactApi.respond(1, true);
    expect(mockedPatch).toHaveBeenCalledWith('/buddy-contact/request/1', {
      accept: true,
    });
    expect(result).toEqual({ id: 1, status: 'accepted' });
  });

  it('getMyRequests() GETs /buddy-contact/requests', async () => {
    mockedGet.mockResolvedValue({ data: [{ id: 1 }] });
    const result = await buddyContactApi.getMyRequests();
    expect(mockedGet).toHaveBeenCalledWith('/buddy-contact/requests');
    expect(result).toEqual([{ id: 1 }]);
  });
});
