import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { GovLinksController } from './gov-links.controller';

const mockRun = (id: number, cc: string) => ({
  id,
  countryCode: cc,
  status: 'running',
  total: 11,
  results: [],
});

describe('GovLinksController', () => {
  const mockService = {
    generate: jest.fn(async (cc: string, cat: string) => ({
      countryCode: cc,
      category: cat,
      url: null,
      label: null,
      confidence: 0,
      status: 'needs_review',
    })),
    list: jest.fn(async (filter: object) => [{ id: 1, ...filter }]),
    // search UP by default — generation pre-flight requires it
    checkHealth: jest.fn(async () => ({
      llm: { ok: true, model: 'm', baseUrl: 'b' },
      search: { ok: true, provider: 'searxng' },
    })),
  };

  const mockOrchestrator = {
    createRun: jest.fn(async (cc: string) => mockRun(42, cc)),
    runForCountry: jest.fn(async () => undefined),
    findById: jest.fn(async (id: number) => mockRun(id, 'FR')),
    findLatest: jest.fn(async (cc: string) => mockRun(10, cc)),
    rerunCategory: jest.fn(async (id: number) => mockRun(id, 'FR')),
  };

  const mockProcedureGenerator = {
    generateFromGovLinks: jest.fn(async () => []),
  };

  let ctrl: GovLinksController;

  beforeEach(() => {
    jest.clearAllMocks();
    ctrl = new GovLinksController(
      mockService as never,
      mockOrchestrator as never,
      mockProcedureGenerator as never,
    );
  });

  // ── Existing generate (pair) endpoint ────────────────────────────────────────────
  it('throws BadRequestException for unsupported country', async () => {
    await expect(ctrl.generate('XX', 'visa')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws BadRequestException for unknown category', async () => {
    await expect(ctrl.generate('fr', 'nope')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('delegates valid (fr, visa) → service.generate("FR", "visa")', async () => {
    await ctrl.generate('fr', 'visa');
    expect(mockService.generate).toHaveBeenCalledWith('FR', 'visa');
  });

  // ── Reliability pre-flight: search engine DOWN → clear 503, nothing launched ──────
  it('generate fails fast with 503 when the search engine is down', async () => {
    mockService.checkHealth.mockResolvedValueOnce({
      llm: { ok: true, model: 'm', baseUrl: 'b' },
      search: { ok: false, provider: 'searxng' },
    });
    await expect(ctrl.generate('fr', 'visa')).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(mockService.generate).not.toHaveBeenCalled();
  });

  it('generate-country fails fast with 503 when the search engine is down (no run created)', async () => {
    mockService.checkHealth.mockResolvedValueOnce({
      llm: { ok: true, model: 'm', baseUrl: 'b' },
      search: { ok: false, provider: 'searxng' },
    });
    await expect(ctrl.generateCountry('FR')).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(mockOrchestrator.createRun).not.toHaveBeenCalled();
  });

  it('list delegates to service.list and returns its value', async () => {
    const result = await ctrl.list('FR', 'visa', 'active');
    expect(mockService.list).toHaveBeenCalledWith({
      countryCode: 'FR',
      category: 'visa',
      status: 'active',
    });
    expect(result).toEqual([
      { id: 1, countryCode: 'FR', category: 'visa', status: 'active' },
    ]);
  });

  it('health delegates to service.checkHealth', async () => {
    const result = await ctrl.health();
    expect(mockService.checkHealth).toHaveBeenCalled();
    expect(result).toEqual({
      llm: { ok: true, model: 'm', baseUrl: 'b' },
      search: { ok: true, provider: 'searxng' },
    });
  });

  // ── generate-country: validate + fire-and-forget ─────────────────────────────────
  it('generate-country throws 400 for unsupported country', async () => {
    await expect(ctrl.generateCountry('XX')).rejects.toThrow(
      BadRequestException,
    );
    expect(mockOrchestrator.createRun).not.toHaveBeenCalled();
  });

  it('generate-country creates run + fires-and-forgets without awaiting', async () => {
    const result = await ctrl.generateCountry('FR');
    expect(mockOrchestrator.createRun).toHaveBeenCalledWith('FR');
    // runForCountry is called but NOT awaited — result is returned before it completes
    expect(mockOrchestrator.runForCountry).toHaveBeenCalledWith(42, 'FR');
    expect(result).toEqual({ runId: 42 });
  });

  it('generate-country upcases the country code', async () => {
    await ctrl.generateCountry('fr');
    expect(mockOrchestrator.createRun).toHaveBeenCalledWith('FR');
  });

  // ── runs/latest vs runs/:id routing ─────────────────────────────────────────────
  it('findLatestRun delegates to orchestrator.findLatest', async () => {
    const result = await ctrl.findLatestRun('FR');
    expect(mockOrchestrator.findLatest).toHaveBeenCalledWith('FR');
    expect(result).toEqual(mockRun(10, 'FR'));
  });

  it('findRun delegates to orchestrator.findById with numeric id', async () => {
    const result = await ctrl.findRun('7');
    expect(mockOrchestrator.findById).toHaveBeenCalledWith(7);
    expect(result).toEqual(mockRun(7, 'FR'));
  });

  // ── rerun delegates with run's countryCode ───────────────────────────────────────
  it('rerunCategory throws 400 for unknown category', async () => {
    await expect(ctrl.rerunCategory('7', 'nope')).rejects.toThrow(
      BadRequestException,
    );
    expect(mockOrchestrator.rerunCategory).not.toHaveBeenCalled();
  });

  it('rerunCategory throws 400 when run not found', async () => {
    mockOrchestrator.findById.mockResolvedValueOnce(null);
    await expect(ctrl.rerunCategory('999', 'visa')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rerunCategory delegates with run.countryCode', async () => {
    // findById returns run with countryCode='FR'
    const result = await ctrl.rerunCategory('7', 'visa');
    expect(mockOrchestrator.rerunCategory).toHaveBeenCalledWith(
      7,
      'FR',
      'visa',
    );
    expect(result).toEqual(mockRun(7, 'FR'));
  });
});
