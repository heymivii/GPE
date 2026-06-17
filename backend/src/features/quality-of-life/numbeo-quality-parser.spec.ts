import { parseQualityOfLife, parseLastUpdate } from './numbeo-quality-parser';

// Mirrors Numbeo's real layout: each index label appears as a section heading and a
// "... by Country" link BEFORE the actual data row. The parser must skip those and
// take the occurrence immediately followed by a number.
const FIXTURE = `
  <h2>Quality of Life Index</h2>
  <a href="/quality-of-life/rankings_by_country.jsp">Quality of Life Index by Country</a>
  <table class="table_indices">
    <tr><td>Quality of Life Index:</td><td><span class="indexValueChunk">174.19</span></td></tr>
    <tr><td>Purchasing Power Index:</td><td>118.70</td></tr>
    <tr><td>Safety Index:</td><td>44.23</td></tr>
    <tr><td>Health Care Index:</td><td>76.96</td></tr>
    <tr><td>Cost of Living Index:</td><td>67.85</td></tr>
    <tr><td>Property Price to Income Ratio:</td><td>8.26</td></tr>
    <tr><td>Traffic Commute Time Index:</td><td>34.35</td></tr>
    <tr><td>Pollution Index:</td><td>35.46</td></tr>
    <tr><td>Climate Index:</td><td>89.02</td></tr>
  </table>
  <div class="last_update">Last update: 16 June 2026</div>
`;

describe('numbeo-quality-parser', () => {
  describe('parseQualityOfLife', () => {
    it('extracts every index, skipping heading/link occurrences', () => {
      expect(parseQualityOfLife(FIXTURE)).toEqual({
        qualityOfLife: 174.19,
        purchasingPower: 118.7,
        safety: 44.23,
        healthCare: 76.96,
        costOfLiving: 67.85,
        propertyPriceToIncome: 8.26,
        trafficCommuteTime: 34.35,
        pollution: 35.46,
        climate: 89.02,
      });
    });

    it('returns null for indices absent from the page', () => {
      const partial = '<td>Safety Index:</td><td>50.00</td>';
      const res = parseQualityOfLife(partial);
      expect(res.safety).toBe(50);
      expect(res.qualityOfLife).toBeNull();
      expect(res.pollution).toBeNull();
    });
  });

  describe('parseLastUpdate', () => {
    it('captures the Numbeo last-update date (provenance)', () => {
      expect(parseLastUpdate(FIXTURE)).toBe('16 June 2026');
    });

    it('returns undefined when absent', () => {
      expect(parseLastUpdate('<div>no date here</div>')).toBeUndefined();
    });
  });
});
