import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, StreamableFile } from '@nestjs/common';
import { DocumentController, documentFileFilter } from './document.controller';
import { DocumentService } from './document.service';

describe('DocumentController', () => {
  let controller: DocumentController;
  let service: jest.Mocked<DocumentService>;

  const req = { user: { userId: 1 } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: {
            create: jest.fn(),
            listByProcedure: jest.fn(),
            listByProject: jest.fn(),
            listAllByUser: jest.fn(),
            getForDownload: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    service = module.get(DocumentService);
  });

  describe('create', () => {
    const file = { originalname: 'x.pdf' } as any;

    it('parses projectId and procedureTrackingId when provided', () => {
      controller.create(req, file, {
        projectId: '5',
        procedureTrackingId: '7',
        docType: 'visa',
      });
      expect(service.create).toHaveBeenCalledWith(1, 5, 7, 'visa', file);
    });

    it('passes undefined ids when not provided', () => {
      controller.create(req, file, {});
      expect(service.create).toHaveBeenCalledWith(
        1,
        undefined,
        undefined,
        undefined,
        file,
      );
    });

    it('falls back to undefined when the id params are not numeric', () => {
      controller.create(req, file, { projectId: 'abc' });
      expect(service.create).toHaveBeenCalledWith(
        1,
        undefined,
        undefined,
        undefined,
        file,
      );
    });
  });

  describe('list', () => {
    it('lists by procedure when procedureTrackingId is given', () => {
      controller.list(req, undefined, '3');
      expect(service.listByProcedure).toHaveBeenCalledWith(1, 3);
    });

    it('lists by project when projectId is given (and no procedure filter)', () => {
      controller.list(req, '9', undefined);
      expect(service.listByProject).toHaveBeenCalledWith(1, 9);
    });

    it('lists all by user when no filter is given', () => {
      controller.list(req, undefined, undefined);
      expect(service.listAllByUser).toHaveBeenCalledWith(1);
    });

    it('prioritizes procedureTrackingId over projectId when both are given', () => {
      controller.list(req, '9', '3');
      expect(service.listByProcedure).toHaveBeenCalledWith(1, 3);
      expect(service.listByProject).not.toHaveBeenCalled();
    });
  });

  describe('download', () => {
    it('streams the file with a sanitized filename and content type', async () => {
      service.getForDownload.mockResolvedValue({
        doc: { originalName: 'my"doc\r\n.pdf', mimeType: 'application/pdf' },
        data: Buffer.from('content'),
      } as any);

      const result = await controller.download(req, 1);

      expect(service.getForDownload).toHaveBeenCalledWith(1, 1);
      expect(result).toBeInstanceOf(StreamableFile);
    });
  });

  it('remove delegates to the service with the authenticated user', () => {
    controller.remove(req, 1);
    expect(service.remove).toHaveBeenCalledWith(1, 1);
  });

  describe('documentFileFilter', () => {
    it('accepts an allowed mimetype', () => {
      const cb = jest.fn();
      documentFileFilter({}, { mimetype: 'application/pdf' }, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('rejects a disallowed mimetype with a BadRequestException', () => {
      const cb = jest.fn();
      documentFileFilter({}, { mimetype: 'text/plain' }, cb);
      expect(cb).toHaveBeenCalledWith(
        expect.any(BadRequestException),
        false,
      );
    });
  });
});
