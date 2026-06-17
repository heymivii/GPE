import { BadRequestException } from '@nestjs/common';
import { GovLinksController } from './gov-links.controller';

describe('GovLinksController', () => {
  const mockService = {
    generate: jest.fn(async (cc: string, cat: string) => ({ countryCode: cc, category: cat, url: null, label: null, confidence: 0, status: 'needs_review' })),
    list: jest.fn(async (filter: object) => [{ id: 1, ...filter }]),
  };
  let ctrl: GovLinksController;

  beforeEach(() => {
    jest.clearAllMocks();
    ctrl = new GovLinksController(mockService as never);
  });

  it('throws BadRequestException for unsupported country', () => {
    expect(() => ctrl.generate('XX', 'visa')).toThrow(BadRequestException);
  });

  it('throws BadRequestException for unknown category', () => {
    expect(() => ctrl.generate('fr', 'nope')).toThrow(BadRequestException);
  });

  it('delegates valid (fr, visa) → service.generate("FR", "visa")', async () => {
    await ctrl.generate('fr', 'visa');
    expect(mockService.generate).toHaveBeenCalledWith('FR', 'visa');
  });

  it('list delegates to service.list and returns its value', async () => {
    const result = await ctrl.list('FR', 'visa', 'active');
    expect(mockService.list).toHaveBeenCalledWith({ countryCode: 'FR', category: 'visa', status: 'active' });
    expect(result).toEqual([{ id: 1, countryCode: 'FR', category: 'visa', status: 'active' }]);
  });
});
