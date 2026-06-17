import axios from 'axios';

// Country-level Quality of Life indices scraped from Numbeo (deterministic, no AI).
// One page covers the composite index + safety / health / pollution / purchasing
// power / traffic / climate sub-indices — so a single fetch feeds several sections.
export interface QualityOfLifeData {
  qualityOfLife: number | null;
  purchasingPower: number | null;
  safety: number | null;
  healthCare: number | null;
  costOfLiving: number | null;
  propertyPriceToIncome: number | null;
  trafficCommuteTime: number | null;
  pollution: number | null;
  climate: number | null;
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

export async function fetchQualityOfLifeHtml(country: string): Promise<string> {
  const url = `https://www.numbeo.com/quality-of-life/country_result.jsp?country=${encodeURIComponent(country)}`;
  const { data } = await axios.get<string>(url, {
    timeout: 15000,
    headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
  });
  return data;
}

const INDEX_LABELS: { key: keyof QualityOfLifeData; label: string }[] = [
  { key: 'qualityOfLife', label: 'Quality of Life Index' },
  { key: 'purchasingPower', label: 'Purchasing Power Index' },
  { key: 'safety', label: 'Safety Index' },
  { key: 'healthCare', label: 'Health Care Index' },
  { key: 'costOfLiving', label: 'Cost of Living Index' },
  { key: 'propertyPriceToIncome', label: 'Property Price to Income Ratio' },
  { key: 'trafficCommuteTime', label: 'Traffic Commute Time Index' },
  { key: 'pollution', label: 'Pollution Index' },
  { key: 'climate', label: 'Climate Index' },
];

// Each label appears several times (section heading + "... by Country" link) before
// its data row. We take the first occurrence IMMEDIATELY followed by a number —
// headings/links are followed by text, only the data cell by a value.
function grabIndex(text: string, label: string): number | null {
  let from = 0;
  for (;;) {
    const i = text.indexOf(label, from);
    if (i < 0) return null;
    const tail = text.slice(i + label.length, i + label.length + 30);
    const m = tail.match(/^[:\s]*(\d{1,3}\.\d{1,2})/);
    if (m) return parseFloat(m[1]);
    from = i + label.length;
  }
}

export function parseQualityOfLife(html: string): QualityOfLifeData {
  // Strip tags so the label and its value sit next to each other in plain text.
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const out = {} as QualityOfLifeData;
  for (const { key, label } of INDEX_LABELS) {
    out[key] = grabIndex(text, label);
  }
  return out;
}

// Provenance (jury-defensible): Numbeo is crowd-sourced; capture its last-update date.
export function parseLastUpdate(html: string): string | undefined {
  return html.match(
    /Last update:\s*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})/,
  )?.[1];
}
