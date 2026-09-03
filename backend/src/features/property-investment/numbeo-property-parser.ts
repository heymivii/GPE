import { fetchNumbeoPage } from '../../services/numbeo-fetch.util';

// Country-level property / investment indicators scraped from Numbeo's
// property-investment page (deterministic parsing, no AI).
export interface PropertyInvestmentData {
  priceToIncomeRatio: number | null;
  mortgageAsPctIncome: number | null; // %
  loanAffordabilityIndex: number | null;
  priceToRentCityCentre: number | null;
  priceToRentOutside: number | null;
  grossRentalYieldCityCentre: number | null; // %
  grossRentalYieldOutside: number | null; // %
  gdpPerCapita: number | null; // USD
  gdpGrowthRate: number | null; // %
  populationGrowthRate: number | null; // %
}

export async function fetchPropertyInvestmentHtml(
  country: string,
): Promise<string> {
  return fetchNumbeoPage(
    `https://www.numbeo.com/property-investment/country_result.jsp?country=${encodeURIComponent(country)}`,
  );
}

/** CITY page (e.g. /property-investment/in/Paris) — same two-cell rows, same parser. */
export async function fetchCityPropertyInvestmentHtml(
  slug: string,
): Promise<string> {
  return fetchNumbeoPage(`https://www.numbeo.com/property-investment/in/${slug}`);
}

interface Row {
  label: string;
  value: string;
}

// Each indicator is a two-cell <tr>: a label cell ("Price to Income Ratio:")
// and a value cell. We collect every label/value pair, then match by keyword —
// robust to label suffixes like "GDP Per Capita ($) :".
function parseRows(html: string): Row[] {
  const rows: Row[] = [];
  const re = /<td[^>]*>([^<]+?)<\/td>\s*<td[^>]*>([^<]*)<\/td>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    rows.push({
      label: m[1].replace(/\s+/g, ' ').trim(),
      value: m[2].replace(/\s+/g, ' ').trim(),
    });
  }
  return rows;
}

function findValue(rows: Row[], keyword: string): string | undefined {
  const key = keyword.toLowerCase();
  return rows.find((r) => r.label.toLowerCase().includes(key))?.value;
}

// Strip currency symbols, %, thousands separators and Unicode minus, then parse.
function num(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/−/g, '-').replace(/,/g, '');
  const m = cleaned.match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

export function parsePropertyInvestment(html: string): PropertyInvestmentData {
  const rows = parseRows(html);
  return {
    priceToIncomeRatio: num(findValue(rows, 'Price to Income Ratio')),
    mortgageAsPctIncome: num(
      findValue(rows, 'Mortgage as Percentage of Income'),
    ),
    loanAffordabilityIndex: num(findValue(rows, 'Loan Affordability Index')),
    priceToRentCityCentre: num(
      findValue(rows, 'Price to Rent Ratio - City Centre'),
    ),
    priceToRentOutside: num(findValue(rows, 'Price to Rent Ratio - Outside')),
    grossRentalYieldCityCentre: num(
      findValue(rows, 'Gross Rental Yield (City Centre)'),
    ),
    grossRentalYieldOutside: num(
      findValue(rows, 'Gross Rental Yield (Outside'),
    ),
    gdpPerCapita: num(findValue(rows, 'GDP Per Capita')),
    gdpGrowthRate: num(findValue(rows, 'GDP Growth Rate')),
    populationGrowthRate: num(findValue(rows, 'Population Growth Rate')),
  };
}
