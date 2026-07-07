interface ParsedQuery {
  keyword: string
  city: string
  countryCode: string
  countryName: string
}

const cityToCountry: Record<string, { code: string; name: string }> = {
  'paris': { code: 'fr', name: 'France' },
  'lyon': { code: 'fr', name: 'France' },
  'marseille': { code: 'fr', name: 'France' },
  'toulouse': { code: 'fr', name: 'France' },
  'nice': { code: 'fr', name: 'France' },
  'nantes': { code: 'fr', name: 'France' },
  'strasbourg': { code: 'fr', name: 'France' },
  'bordeaux': { code: 'fr', name: 'France' },
  'lille': { code: 'fr', name: 'France' },
  'rennes': { code: 'fr', name: 'France' },
  'montpellier': { code: 'fr', name: 'France' },
  'grenoble': { code: 'fr', name: 'France' },
  'la defense': { code: 'fr', name: 'France' },
  'new york': { code: 'us', name: 'États-Unis' },
  'los angeles': { code: 'us', name: 'États-Unis' },
  'chicago': { code: 'us', name: 'États-Unis' },
  'san francisco': { code: 'us', name: 'États-Unis' },
  'seattle': { code: 'us', name: 'États-Unis' },
  'austin': { code: 'us', name: 'États-Unis' },
  'boston': { code: 'us', name: 'États-Unis' },
  'miami': { code: 'us', name: 'États-Unis' },
  'denver': { code: 'us', name: 'États-Unis' },
  'houston': { code: 'us', name: 'États-Unis' },
  'dallas': { code: 'us', name: 'États-Unis' },
  'washington': { code: 'us', name: 'États-Unis' },
  'atlanta': { code: 'us', name: 'États-Unis' },
  'phoenix': { code: 'us', name: 'États-Unis' },
  'philadelphia': { code: 'us', name: 'États-Unis' },
  'san diego': { code: 'us', name: 'États-Unis' },
  'portland': { code: 'us', name: 'États-Unis' },
  'silicon valley': { code: 'us', name: 'États-Unis' },
  'geneve': { code: 'ch', name: 'Suisse' },
  'genève': { code: 'ch', name: 'Suisse' },
  'geneva': { code: 'ch', name: 'Suisse' },
  'zurich': { code: 'ch', name: 'Suisse' },
  'zürich': { code: 'ch', name: 'Suisse' },
  'berne': { code: 'ch', name: 'Suisse' },
  'bern': { code: 'ch', name: 'Suisse' },
  'lausanne': { code: 'ch', name: 'Suisse' },
  'bale': { code: 'ch', name: 'Suisse' },
  'basel': { code: 'ch', name: 'Suisse' },
  'tokyo': { code: 'jp', name: 'Japon' },
  'osaka': { code: 'jp', name: 'Japon' },
  'kyoto': { code: 'jp', name: 'Japon' },
  'london': { code: 'gb', name: 'Royaume-Uni' },
  'londres': { code: 'gb', name: 'Royaume-Uni' },
  'manchester': { code: 'gb', name: 'Royaume-Uni' },
  'birmingham': { code: 'gb', name: 'Royaume-Uni' },
  'edinburgh': { code: 'gb', name: 'Royaume-Uni' },
  'toronto': { code: 'ca', name: 'Canada' },
  'montreal': { code: 'ca', name: 'Canada' },
  'montréal': { code: 'ca', name: 'Canada' },
  'vancouver': { code: 'ca', name: 'Canada' },
  'ottawa': { code: 'ca', name: 'Canada' },
  'quebec': { code: 'ca', name: 'Canada' },
  'québec': { code: 'ca', name: 'Canada' },
  'calgary': { code: 'ca', name: 'Canada' },
  'berlin': { code: 'de', name: 'Allemagne' },
  'munich': { code: 'de', name: 'Allemagne' },
  'münchen': { code: 'de', name: 'Allemagne' },
  'hamburg': { code: 'de', name: 'Allemagne' },
  'francfort': { code: 'de', name: 'Allemagne' },
  'frankfurt': { code: 'de', name: 'Allemagne' },
  'cologne': { code: 'de', name: 'Allemagne' },
  'köln': { code: 'de', name: 'Allemagne' },
  'madrid': { code: 'es', name: 'Espagne' },
  'barcelona': { code: 'es', name: 'Espagne' },
  'barcelone': { code: 'es', name: 'Espagne' },
  'rome': { code: 'it', name: 'Italie' },
  'roma': { code: 'it', name: 'Italie' },
  'milan': { code: 'it', name: 'Italie' },
  'milano': { code: 'it', name: 'Italie' },
  'amsterdam': { code: 'nl', name: 'Pays-Bas' },
  'bruxelles': { code: 'be', name: 'Belgique' },
  'brussels': { code: 'be', name: 'Belgique' },
  'sydney': { code: 'au', name: 'Australie' },
  'melbourne': { code: 'au', name: 'Australie' },
  'singapore': { code: 'sg', name: 'Singapour' },
  'singapour': { code: 'sg', name: 'Singapour' },
  'mumbai': { code: 'in', name: 'Inde' },
  'bangalore': { code: 'in', name: 'Inde' },
  'delhi': { code: 'in', name: 'Inde' },
  'sao paulo': { code: 'br', name: 'Brésil' },
  'são paulo': { code: 'br', name: 'Brésil' },
  'rio de janeiro': { code: 'br', name: 'Brésil' },
  'mexico city': { code: 'mx', name: 'Mexique' },
  'mexico': { code: 'mx', name: 'Mexique' },
  'warsaw': { code: 'pl', name: 'Pologne' },
  'varsovie': { code: 'pl', name: 'Pologne' },
  'auckland': { code: 'nz', name: 'Nouvelle-Zélande' },
  'wellington': { code: 'nz', name: 'Nouvelle-Zélande' },
  'cape town': { code: 'za', name: 'Afrique du Sud' },
  'johannesburg': { code: 'za', name: 'Afrique du Sud' },
  'vienna': { code: 'at', name: 'Autriche' },
  'vienne': { code: 'at', name: 'Autriche' },
}

const countryAliases: Record<string, { code: string; name: string }> = {
  'france': { code: 'fr', name: 'France' },
  'états-unis': { code: 'us', name: 'États-Unis' },
  'etats-unis': { code: 'us', name: 'États-Unis' },
  'etats unis': { code: 'us', name: 'États-Unis' },
  'usa': { code: 'us', name: 'États-Unis' },
  'us': { code: 'us', name: 'États-Unis' },
  'united states': { code: 'us', name: 'États-Unis' },
  'america': { code: 'us', name: 'États-Unis' },
  'amérique': { code: 'us', name: 'États-Unis' },
  'amerique': { code: 'us', name: 'États-Unis' },
  'suisse': { code: 'ch', name: 'Suisse' },
  'switzerland': { code: 'ch', name: 'Suisse' },
  'japon': { code: 'jp', name: 'Japon' },
  'japan': { code: 'jp', name: 'Japon' },
  'canada': { code: 'ca', name: 'Canada' },
  'allemagne': { code: 'de', name: 'Allemagne' },
  'germany': { code: 'de', name: 'Allemagne' },
  'royaume-uni': { code: 'gb', name: 'Royaume-Uni' },
  'royaume uni': { code: 'gb', name: 'Royaume-Uni' },
  'uk': { code: 'gb', name: 'Royaume-Uni' },
  'united kingdom': { code: 'gb', name: 'Royaume-Uni' },
  'england': { code: 'gb', name: 'Royaume-Uni' },
  'angleterre': { code: 'gb', name: 'Royaume-Uni' },
  'espagne': { code: 'es', name: 'Espagne' },
  'spain': { code: 'es', name: 'Espagne' },
  'italie': { code: 'it', name: 'Italie' },
  'italy': { code: 'it', name: 'Italie' },
  'pays-bas': { code: 'nl', name: 'Pays-Bas' },
  'netherlands': { code: 'nl', name: 'Pays-Bas' },
  'hollande': { code: 'nl', name: 'Pays-Bas' },
  'belgique': { code: 'be', name: 'Belgique' },
  'belgium': { code: 'be', name: 'Belgique' },
  'australie': { code: 'au', name: 'Australie' },
  'australia': { code: 'au', name: 'Australie' },
  'singapour': { code: 'sg', name: 'Singapour' },
  'singapore': { code: 'sg', name: 'Singapour' },
  'inde': { code: 'in', name: 'Inde' },
  'india': { code: 'in', name: 'Inde' },
  'brésil': { code: 'br', name: 'Brésil' },
  'bresil': { code: 'br', name: 'Brésil' },
  'brazil': { code: 'br', name: 'Brésil' },
  'mexique': { code: 'mx', name: 'Mexique' },
  'mexico': { code: 'mx', name: 'Mexique' },
  'pologne': { code: 'pl', name: 'Pologne' },
  'poland': { code: 'pl', name: 'Pologne' },
  'nouvelle-zélande': { code: 'nz', name: 'Nouvelle-Zélande' },
  'nouvelle zelande': { code: 'nz', name: 'Nouvelle-Zélande' },
  'new zealand': { code: 'nz', name: 'Nouvelle-Zélande' },
  'afrique du sud': { code: 'za', name: 'Afrique du Sud' },
  'south africa': { code: 'za', name: 'Afrique du Sud' },
  'autriche': { code: 'at', name: 'Autriche' },
  'austria': { code: 'at', name: 'Autriche' },
}

const multiWordCities = Object.keys(cityToCountry)
  .filter(c => c.includes(' '))
  .sort((a, b) => b.length - a.length)

const multiWordCountries = Object.keys(countryAliases)
  .filter(c => c.includes(' ') || c.includes('-'))
  .sort((a, b) => b.length - a.length)

export function parseSmartQuery(rawQuery: string, currentCountryFilter?: string): ParsedQuery {
  if (!rawQuery || !rawQuery.trim()) {
    return { keyword: '', city: '', countryCode: '', countryName: '' }
  }

  let remaining = rawQuery.trim().toLowerCase()
  let detectedCity = ''
  let detectedCountryCode = ''
  let detectedCountryName = ''

  for (const phrase of multiWordCountries) {
    if (remaining.includes(phrase)) {
      const match = countryAliases[phrase]
      detectedCountryCode = match.code
      detectedCountryName = match.name
      remaining = remaining.replace(phrase, ' ').trim()
      break
    }
  }

  if (!detectedCountryCode) {
    for (const phrase of multiWordCities) {
      if (remaining.includes(phrase)) {
        const match = cityToCountry[phrase]
        detectedCity = phrase.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        detectedCountryCode = match.code
        detectedCountryName = match.name
        remaining = remaining.replace(phrase, ' ').trim()
        break
      }
    }
  }

  const words = remaining.split(/\s+/).filter(Boolean)
  const keywordParts: string[] = []

  for (const word of words) {
    if (!detectedCountryCode && countryAliases[word]) {
      const match = countryAliases[word]
      detectedCountryCode = match.code
      detectedCountryName = match.name
      continue
    }

    if (!detectedCity && cityToCountry[word]) {
      const match = cityToCountry[word]
      detectedCity = word.charAt(0).toUpperCase() + word.slice(1)
      if (!detectedCountryCode) {
        detectedCountryCode = match.code
        detectedCountryName = match.name
      }
      continue
    }

    keywordParts.push(word)
  }

  if (!detectedCountryCode && currentCountryFilter) {
    const alias = countryAliases[currentCountryFilter.toLowerCase()]
    if (alias) {
      detectedCountryCode = alias.code
      detectedCountryName = alias.name
    }
  }

  return {
    keyword: keywordParts.join(' '),
    city: detectedCity,
    countryCode: detectedCountryCode,
    countryName: detectedCountryName,
  }
}

export function isAdzunaSupported(countryCode: string): boolean {
  const supported = new Set([
    'gb', 'us', 'au', 'br', 'ca', 'de', 'fr', 'in', 'it',
    'nl', 'nz', 'pl', 'sg', 'za', 'at', 'be', 'ch', 'mx', 'es',
  ])
  return supported.has(countryCode.toLowerCase())
}

export function getCountryCodeFromName(name: string): string {
  const normalized = name.trim().toLowerCase()
  const alias = countryAliases[normalized]
  if (alias) return alias.code
  // Destination detail links pass a raw ISO2 code (e.g. ?country=ch). Accept it directly
  // so ch→Suisse, de→Allemagne, jp→Japon, ca→Canada resolve instead of falling back to fr.
  if (isAdzunaSupported(normalized)) return normalized
  return ''
}
