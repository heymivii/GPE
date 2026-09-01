import { Test, TestingModule } from '@nestjs/testing';
import { JobOfferService } from './job-offer.service';

describe('JobOfferService', () => {
  let service: JobOfferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobOfferService],
    }).compile();

    service = module.get<JobOfferService>(JobOfferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() should return the placeholder message', () => {
    expect(service.create({} as any)).toBe('This action adds a new jobOffer');
  });

  it('findAll() should return the placeholder message', () => {
    expect(service.findAll()).toBe('This action returns all jobOffer');
  });

  it('findOne() should return the placeholder message with the id', () => {
    expect(service.findOne(5)).toBe('This action returns a #5 jobOffer');
  });

  it('update() should return the placeholder message with the id', () => {
    expect(service.update(5, {} as any)).toBe(
      'This action updates a #5 jobOffer',
    );
  });

  it('remove() should return the placeholder message with the id', () => {
    expect(service.remove(5)).toBe('This action removes a #5 jobOffer');
  });
});
