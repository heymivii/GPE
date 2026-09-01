import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

import apiClient from '../lib/api';
import { documentsApi, type UserDocument } from './documents';

const mockedGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;
const mockedDelete = apiClient.delete as ReturnType<typeof vi.fn>;

const doc: UserDocument = {
  idDocument: 1,
  originalName: 'passport.pdf',
  docType: 'passport',
  mimeType: 'application/pdf',
  sizeBytes: 100,
  createdAt: '2026-01-01',
};

describe('documentsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listAll() GETs /documents', async () => {
    mockedGet.mockResolvedValue({ data: [] });
    await documentsApi.listAll();
    expect(mockedGet).toHaveBeenCalledWith('/documents');
  });

  it('listByProject() GETs /documents filtered by projectId', async () => {
    mockedGet.mockResolvedValue({ data: [] });
    await documentsApi.listByProject(5);
    expect(mockedGet).toHaveBeenCalledWith('/documents?projectId=5');
  });

  it('listByProcedure() GETs /documents filtered by procedureTrackingId', async () => {
    mockedGet.mockResolvedValue({ data: [] });
    await documentsApi.listByProcedure(9);
    expect(mockedGet).toHaveBeenCalledWith('/documents?procedureTrackingId=9');
  });

  describe('upload', () => {
    it('sends the file and docType as multipart form data', async () => {
      mockedPost.mockResolvedValue({ data: doc });
      const file = new File(['content'], 'passport.pdf', { type: 'application/pdf' });

      await documentsApi.upload(file, 'passport');

      expect(mockedPost).toHaveBeenCalledWith(
        '/documents',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      const form = mockedPost.mock.calls[0][1] as FormData;
      expect(form.get('file')).toBe(file);
      expect(form.get('docType')).toBe('passport');
      expect(form.get('projectId')).toBeNull();
    });

    it('includes projectId and procedureTrackingId when given', async () => {
      mockedPost.mockResolvedValue({ data: doc });
      const file = new File(['content'], 'passport.pdf', { type: 'application/pdf' });

      await documentsApi.upload(file, 'passport', {
        projectId: 3,
        procedureTrackingId: 7,
      });

      const form = mockedPost.mock.calls[0][1] as FormData;
      expect(form.get('projectId')).toBe('3');
      expect(form.get('procedureTrackingId')).toBe('7');
    });
  });

  describe('blobUrl', () => {
    const originalCreate = URL.createObjectURL;

    beforeEach(() => {
      URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    });

    afterEach(() => {
      URL.createObjectURL = originalCreate;
    });

    it('downloads the blob and returns an object URL typed with the document mimeType', async () => {
      mockedGet.mockResolvedValue({ data: new Blob(['bytes']) });

      const result = await documentsApi.blobUrl(doc);

      expect(mockedGet).toHaveBeenCalledWith('/documents/1/download', {
        responseType: 'blob',
      });
      expect(result).toBe('blob:mock-url');
    });
  });

  describe('download', () => {
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;

    beforeEach(() => {
      URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
    });

    it('triggers a browser download with the document original name and revokes the URL', async () => {
      mockedGet.mockResolvedValue({ data: new Blob(['bytes']) });
      const clickSpy = vi
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => {});

      await documentsApi.download(doc);

      expect(mockedGet).toHaveBeenCalledWith('/documents/1/download', {
        responseType: 'blob',
      });
      expect(clickSpy).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      clickSpy.mockRestore();
    });
  });

  it('remove() DELETEs /documents/:id', async () => {
    mockedDelete.mockResolvedValue({});
    await documentsApi.remove(1);
    expect(mockedDelete).toHaveBeenCalledWith('/documents/1');
  });
});
