/**
 * Default Numbeo city slug from a DB city name: "New York" → "New-York",
 * "Zürich" → "Zurich" (accents stripped). Numbeo uses ENGLISH city names, so
 * French names can still miss ("Genève" → Numbeo wants "Geneva") — every admin
 * fetch endpoint therefore accepts an explicit `slug` override.
 */
export function numbeoCitySlug(cityName: string): string {
  return cityName
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-');
}
