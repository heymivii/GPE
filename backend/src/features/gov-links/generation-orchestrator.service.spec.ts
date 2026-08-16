import { GenerationOrchestratorService } from './generation-orchestrator.service';

/** Build a minimal GovLinkResult */
function makeGen(overrides: Record<string, unknown> = {}): any {
  return {
    url: 'https://service-public.fr/visa',
    label: 'Visa France',
    confidence: 0.9,
    summary: ['Étape 1', 'Étape 2'],
    actions: ['Remplir le formulaire', 'Déposer le dossier'],
    status: 'active',
    ...overrides,
  };
}

function makeService(genResult: any = makeGen()) {
  const runs = {
    findOne: jest.fn(async () => ({
      id: 1,
      results: [
        {
          category: 'visa',
          result: null,
          url: null,
          confidence: null,
          message: null,
        },
      ],
    })),
    update: jest.fn(async () => undefined),
    save: jest.fn(async (r: any) => ({ id: 1, ...r })),
    create: jest.fn((r: any) => ({ id: 1, ...r })),
    query: jest.fn(async () => undefined), // atomic updateResult (jsonb replace + heartbeat)
  };
  const govLinkRepo = {
    update: jest.fn(async () => undefined),
  };
  const govLinks = {
    generate: jest.fn(async () => genResult),
  };
  const generator = {
    generateFromGovLinks: jest.fn(async () => []),
  };
  return { runs, govLinkRepo, govLinks, generator };
}

function buildOrchestrator(
  mocks: ReturnType<typeof makeService>,
): GenerationOrchestratorService {
  return new GenerationOrchestratorService(
    mocks.runs as never,
    mocks.govLinkRepo as never,
    mocks.govLinks as never,
    mocks.generator as never,
  );
}

// ── verify mapping ───────────────────────────────────────────────────────────────────
describe('GenerationOrchestratorService.verify (via processCategory)', () => {
  it('url=null → result=failed (no gov_link update)', async () => {
    const mocks = makeService(makeGen({ url: null }));
    const svc = buildOrchestrator(mocks);
    const item = await svc.processCategory(1, 'FR', 'visa');
    expect(item.result).toBe('failed');
    expect(mocks.govLinkRepo.update).not.toHaveBeenCalled();
  });

  it('low confidence → result=needs_review', async () => {
    const mocks = makeService(makeGen({ confidence: 0.3 }));
    const svc = buildOrchestrator(mocks);
    const item = await svc.processCategory(1, 'FR', 'visa');
    expect(item.result).toBe('needs_review');
  });

  it('no actions → result=needs_review', async () => {
    const mocks = makeService(makeGen({ actions: [] }));
    const svc = buildOrchestrator(mocks);
    const item = await svc.processCategory(1, 'FR', 'visa');
    expect(item.result).toBe('needs_review');
  });

  it('clean gen (high confidence, actions present) → result=verified', async () => {
    const mocks = makeService(makeGen()); // confidence=0.9, actions=[...] by default
    const svc = buildOrchestrator(mocks);
    const item = await svc.processCategory(1, 'FR', 'visa');
    expect(item.result).toBe('verified');
  });

  it('AME mention in sante → result=needs_review', async () => {
    const mocks = makeService(
      makeGen({
        summary: ["L'AME couvre les soins."],
        actions: ["Demander l'AME"],
        confidence: 0.9,
      }),
    );
    const svc = buildOrchestrator(mocks);
    const item = await svc.processCategory(1, 'FR', 'sante');
    expect(item.result).toBe('needs_review');
    expect(item.message).toMatch(/AME/);
  });
});

// ── processCategory: status is set FROM verdict ──────────────────────────────────────
describe('GenerationOrchestratorService.processCategory — gov_link status update', () => {
  it('verified → orchestrator does NOT override the status (generate/persist owns it: pending_review for new, active preserved on re-run)', async () => {
    const mocks = makeService(makeGen()); // verified
    const svc = buildOrchestrator(mocks);
    await svc.processCategory(1, 'FR', 'visa');
    // No downgrade write for a verified verdict — persist() already set the correct status.
    expect(mocks.govLinkRepo.update).not.toHaveBeenCalled();
  });

  it('needs_review → gov_link forced to "needs_review"', async () => {
    const mocks = makeService(makeGen({ confidence: 0.3 }));
    const svc = buildOrchestrator(mocks);
    await svc.processCategory(1, 'FR', 'visa');
    expect(mocks.govLinkRepo.update).toHaveBeenCalledWith(
      { countryCode: 'FR', category: 'visa' },
      { status: 'needs_review' },
    );
  });

  it('re-run: a needs_review verdict still downgrades; a verified one leaves the persisted status untouched', async () => {
    // First run: needs_review → forced downgrade
    const mocks = makeService(makeGen({ confidence: 0.3 }));
    const svc = buildOrchestrator(mocks);
    await svc.processCategory(1, 'FR', 'visa');
    expect(mocks.govLinkRepo.update).toHaveBeenLastCalledWith(
      { countryCode: 'FR', category: 'visa' },
      { status: 'needs_review' },
    );
    const callsAfterFirst = mocks.govLinkRepo.update.mock.calls.length;

    // Re-run verified → orchestrator makes NO further status write (no un-publishing).
    mocks.govLinks.generate.mockResolvedValueOnce(makeGen()); // clean
    await svc.processCategory(1, 'FR', 'visa');
    expect(mocks.govLinkRepo.update.mock.calls.length).toBe(callsAfterFirst);
  });

  it('url=null → govLinkRepo.update NOT called', async () => {
    const mocks = makeService(makeGen({ url: null }));
    const svc = buildOrchestrator(mocks);
    await svc.processCategory(1, 'FR', 'visa');
    expect(mocks.govLinkRepo.update).not.toHaveBeenCalled();
  });
});

// ── rerunCategory: re-syncs publication ──────────────────────────────────────────────
describe('GenerationOrchestratorService.rerunCategory', () => {
  it('calls processCategory, generateFromGovLinks, then findById (run finished)', async () => {
    const mocks = makeService(makeGen());
    // Make findById work for the rerunCategory call at the end — rerun only allowed once done
    const run = {
      id: 1,
      countryCode: 'FR',
      status: 'done',
      total: 11,
      results: [],
    };
    mocks.runs.findOne.mockResolvedValue(run);
    const svc = buildOrchestrator(mocks);

    const result = await svc.rerunCategory(1, 'FR', 'visa');

    // govLinks.generate was called (via processCategory)
    expect(mocks.govLinks.generate).toHaveBeenCalledWith('FR', 'visa');
    // generateFromGovLinks was called (re-sync)
    expect(mocks.generator.generateFromGovLinks).toHaveBeenCalledWith('FR');
    // Returns the run
    expect(result).not.toBeNull();
  });

  it('is REFUSED while the run is still running (would race the background loop)', async () => {
    const mocks = makeService(makeGen());
    const running = {
      id: 1,
      countryCode: 'FR',
      status: 'running',
      total: 11,
      results: [],
      startedAt: new Date(),
      lastHeartbeatAt: new Date(),
    };
    mocks.runs.findOne.mockResolvedValue(running as never);
    const svc = buildOrchestrator(mocks);
    await expect(svc.rerunCategory(1, 'FR', 'visa')).rejects.toThrow(
      /encore en cours/,
    );
    expect(mocks.govLinks.generate).not.toHaveBeenCalled();
  });
});

// ── createRun: double-run guard + heartbeat ──────────────────────────────────────────
describe('GenerationOrchestratorService.createRun', () => {
  it('refuses to start when a run is already running for the country', async () => {
    const mocks = makeService(makeGen());
    const running = {
      id: 7,
      countryCode: 'FR',
      status: 'running',
      total: 11,
      results: [],
      startedAt: new Date(),
      lastHeartbeatAt: new Date(),
    };
    mocks.runs.findOne.mockResolvedValue(running as never);
    const svc = buildOrchestrator(mocks);
    await expect(svc.createRun('FR')).rejects.toThrow(/déjà en cours/);
    expect(mocks.runs.save).not.toHaveBeenCalled();
  });

  it('starts normally when the latest run is finished, with an initial heartbeat', async () => {
    const mocks = makeService(makeGen());
    const done = {
      id: 7,
      countryCode: 'FR',
      status: 'done',
      total: 11,
      results: [],
    };
    mocks.runs.findOne.mockResolvedValue(done as never);
    const svc = buildOrchestrator(mocks);
    const run = await svc.createRun('FR');
    expect(run.status).toBe('running');
    expect(mocks.runs.create.mock.calls[0][0].lastHeartbeatAt).toBeInstanceOf(
      Date,
    );
  });

  it('a stale running run (dead heartbeat) does NOT block a new run forever', async () => {
    const mocks = makeService(makeGen());
    const dead = new Date(Date.now() - 30 * 60 * 1000); // heartbeat 30 min ago
    const stale = {
      id: 7,
      countryCode: 'FR',
      status: 'running',
      total: 11,
      results: [],
      startedAt: dead,
      lastHeartbeatAt: dead,
    };
    mocks.runs.findOne.mockResolvedValue(stale as never);
    const svc = buildOrchestrator(mocks);
    const run = await svc.createRun('FR'); // findLatest flips the stale run to 'failed' first
    expect(run.status).toBe('running');
  });
});
