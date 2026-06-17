import { parsePropertyInvestment } from './numbeo-property-parser';

// Mirrors Numbeo's property-investment table: <td>label:</td><td>value</td> rows.
// Covers the tricky bits: GDP label carries a "($)" suffix, GDP value has thousands
// separators, percentages, and a negative population growth.
const FIXTURE = `
  <table>
    <tr><td>Price to Income Ratio:</td><td>8.26</td></tr>
    <tr><td>Mortgage as Percentage of Income:</td><td>58.88%</td></tr>
    <tr><td>Loan Affordability Index:</td><td>1.70</td></tr>
    <tr><td>Price to Rent Ratio - City Centre:</td><td>29.17</td></tr>
    <tr><td>Price to Rent Ratio - Outside of Centre:</td><td>24.72</td></tr>
    <tr><td>Gross Rental Yield (City Centre):</td><td>3.43%</td></tr>
    <tr><td>Gross Rental Yield (Outside of Centre):</td><td>4.05%</td></tr>
    <tr><td>GDP Per Capita ($) :</td><td>55,400.00</td></tr>
    <tr><td>GDP Growth Rate:</td><td>0.94%</td></tr>
    <tr><td>Population Growth Rate:</td><td>-0.43%</td></tr>
  </table>
`;

describe('numbeo-property-parser', () => {
  it('parses every indicator (handles %, thousands separators, the "($)" GDP label, negatives)', () => {
    expect(parsePropertyInvestment(FIXTURE)).toEqual({
      priceToIncomeRatio: 8.26,
      mortgageAsPctIncome: 58.88,
      loanAffordabilityIndex: 1.7,
      priceToRentCityCentre: 29.17,
      priceToRentOutside: 24.72,
      grossRentalYieldCityCentre: 3.43,
      grossRentalYieldOutside: 4.05,
      gdpPerCapita: 55400,
      gdpGrowthRate: 0.94,
      populationGrowthRate: -0.43,
    });
  });

  it('returns null for indicators absent from the page', () => {
    const partial = '<td>Price to Income Ratio:</td><td>5.00</td>';
    const res = parsePropertyInvestment(partial);
    expect(res.priceToIncomeRatio).toBe(5);
    expect(res.gdpPerCapita).toBeNull();
    expect(res.grossRentalYieldCityCentre).toBeNull();
  });
});
