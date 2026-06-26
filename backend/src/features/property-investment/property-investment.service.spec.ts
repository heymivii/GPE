jest.mock('./numbeo-property-parser');
import { PropertyInvestmentService } from './property-investment.service';
import * as parser from './numbeo-property-parser';
import type { PropertyInvestmentData } from './numbeo-property-parser';

const mockedParser = parser as jest.Mocked<typeof parser>;

const emptyData = (
  over: Partial<PropertyInvestmentData> = {},
): PropertyInvestmentData => ({
  priceToIncomeRatio: null,
  mortgageAsPctIncome: null,
  loanAffordabilityIndex: null,
  priceToRentCityCentre: null,
  priceToRentOutside: null,
  grossRentalYieldCityCentre: null,
  grossRentalYieldOutside: null,
  gdpPerCapita: null,
  gdpGrowthRate: null,
  populationGrowthRate: null,
  ...over,
});

describe('PropertyInvestmentService', () => {
  let service: PropertyInvestmentService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    service = new PropertyInvestmentService({} as never, {} as never); // country path only — city repos unused here
  });

  it('rejects an unsupported country (no outbound fetch)', async () => {
    await expect(service.getByCountry('Narnia')).rejects.toThrow();
    expect(mockedParser.fetchPropertyInvestmentHtml).not.toHaveBeenCalled();
  });

  it('maps an ISO code to the Numbeo name, parses, and tags provenance', async () => {
    mockedParser.fetchPropertyInvestmentHtml.mockResolvedValue('<html/>');
    mockedParser.parsePropertyInvestment.mockReturnValue(
      emptyData({ priceToIncomeRatio: 8.26 }),
    );

    const res = await service.getByCountry('FR');

    expect(mockedParser.fetchPropertyInvestmentHtml).toHaveBeenCalledWith(
      'France',
    );
    expect(res.country).toBe('France');
    expect(res.source).toBe('Numbeo');
    expect(res.sourceUrl).toContain('France');
    expect(res.priceToIncomeRatio).toBe(8.26);
  });

  it('serves the in-memory cache on the second call', async () => {
    mockedParser.fetchPropertyInvestmentHtml.mockResolvedValue('<html/>');
    mockedParser.parsePropertyInvestment.mockReturnValue(emptyData());

    await service.getByCountry('JP');
    await service.getByCountry('JP');

    expect(mockedParser.fetchPropertyInvestmentHtml).toHaveBeenCalledTimes(1);
  });
});
