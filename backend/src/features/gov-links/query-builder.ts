const CATEGORY_TERMS: Record<string, { terms: string; keywords: string[] }> = {
  visa:               { terms: 'official visa application',           keywords: ['visa', 'immigration'] },
  demarches:          { terms: 'official residence permit procedure', keywords: ['residence', 'permit', 'immigration'] },
  'demarches-admin':  { terms: 'official administrative procedures',  keywords: ['administration', 'official'] },
  logement:           { terms: 'official housing rental information', keywords: ['housing', 'rental'] },
  sante:              { terms: 'official health insurance system',    keywords: ['health', 'insurance'] },
  emploi:             { terms: 'official employment work permit',     keywords: ['work', 'employment'] },
  banque:             { terms: 'open a bank account official guide',  keywords: ['bank', 'account'] },
  transport:          { terms: 'official public transport authority', keywords: ['transport'] },
  education:          { terms: 'official education enrollment',        keywords: ['education', 'school'] },
};

export function buildQuery(
  countryName: string,
  category: string,
): { query: string; keywords: string[] } {
  const entry = CATEGORY_TERMS[category] ?? { terms: 'official government information', keywords: [] };
  return {
    query: `${countryName} ${entry.terms} official government site`,
    keywords: entry.keywords,
  };
}
