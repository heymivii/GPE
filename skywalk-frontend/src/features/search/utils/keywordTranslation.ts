interface TranslationMap {
  fr: string;
  en: string;
  de?: string;
  es?: string;
  it?: string;
}

const commonJobTerms: Record<string, TranslationMap> = {
  'développeur': { fr: 'développeur', en: 'developer', de: 'entwickler', es: 'desarrollador', it: 'sviluppatore' },
  'developpeur': { fr: 'developpeur', en: 'developer', de: 'entwickler', es: 'desarrollador', it: 'sviluppatore' },
  'dev': { fr: 'dev', en: 'developer', de: 'entwickler' },
  'ingénieur': { fr: 'ingénieur', en: 'engineer', de: 'ingenieur', es: 'ingeniero', it: 'ingegnere' },
  'ingenieur': { fr: 'ingenieur', en: 'engineer', de: 'ingenieur', es: 'ingeniero', it: 'ingegnere' },
  'programmeur': { fr: 'programmeur', en: 'programmer', de: 'programmierer', es: 'programador' },
  'architecte': { fr: 'architecte', en: 'architect', de: 'architekt', es: 'arquitecto', it: 'architetto' },
  'analyste': { fr: 'analyste', en: 'analyst', de: 'analyst', es: 'analista', it: 'analista' },
  'consultant': { fr: 'consultant', en: 'consultant', de: 'berater', es: 'consultor', it: 'consulente' },
  'technicien': { fr: 'technicien', en: 'technician', de: 'techniker', es: 'técnico' },
  'chef de projet': { fr: 'chef de projet', en: 'project manager', de: 'projektleiter', es: 'jefe de proyecto' },
  'product owner': { fr: 'product owner', en: 'product owner', de: 'product owner' },
  'scrum master': { fr: 'scrum master', en: 'scrum master', de: 'scrum master' },
  'data scientist': { fr: 'data scientist', en: 'data scientist', de: 'datenwissenschaftler', es: 'científico de datos' },
  'data analyst': { fr: 'data analyst', en: 'data analyst', de: 'datenanalyst', es: 'analista de datos' },
  'devops': { fr: 'devops', en: 'devops', de: 'devops' },
  'designer': { fr: 'designer', en: 'designer', de: 'designer', es: 'diseñador', it: 'designer' },
  'ux designer': { fr: 'ux designer', en: 'ux designer', de: 'ux designer' },
  'ui designer': { fr: 'ui designer', en: 'ui designer', de: 'ui designer' },
  'frontend': { fr: 'frontend', en: 'frontend', de: 'frontend' },
  'backend': { fr: 'backend', en: 'backend', de: 'backend' },
  'fullstack': { fr: 'fullstack', en: 'fullstack', de: 'fullstack' },
  'full stack': { fr: 'full stack', en: 'full stack', de: 'full stack' },
  'mobile': { fr: 'mobile', en: 'mobile', de: 'mobil' },
  'web': { fr: 'web', en: 'web', de: 'web' },
  'cloud': { fr: 'cloud', en: 'cloud', de: 'cloud' },
  'cybersécurité': { fr: 'cybersécurité', en: 'cybersecurity', de: 'cybersicherheit', es: 'ciberseguridad' },
  'cybersecurite': { fr: 'cybersecurite', en: 'cybersecurity', de: 'cybersicherheit', es: 'ciberseguridad' },
  'intelligence artificielle': { fr: 'intelligence artificielle', en: 'artificial intelligence', de: 'künstliche intelligenz' },
  'machine learning': { fr: 'machine learning', en: 'machine learning', de: 'maschinelles lernen' },
  'junior': { fr: 'junior', en: 'junior', de: 'junior' },
  'senior': { fr: 'senior', en: 'senior', de: 'senior' },
  'confirmé': { fr: 'confirmé', en: 'experienced', de: 'erfahren' },
  'confirme': { fr: 'confirme', en: 'experienced', de: 'erfahren' },
  'débutant': { fr: 'débutant', en: 'beginner', de: 'anfänger' },
  'debutant': { fr: 'debutant', en: 'beginner', de: 'anfänger' },
  'stagiaire': { fr: 'stagiaire', en: 'intern', de: 'praktikant', es: 'pasante' },
  'alternant': { fr: 'alternant', en: 'apprentice', de: 'auszubildender' },
  'alternance': { fr: 'alternance', en: 'apprenticeship', de: 'ausbildung' },
  'comptable': { fr: 'comptable', en: 'accountant', de: 'buchhalter', es: 'contador' },
  'commercial': { fr: 'commercial', en: 'sales', de: 'vertrieb', es: 'comercial' },
  'vendeur': { fr: 'vendeur', en: 'salesperson', de: 'verkäufer', es: 'vendedor' },
  'marketing': { fr: 'marketing', en: 'marketing', de: 'marketing' },
  'communication': { fr: 'communication', en: 'communication', de: 'kommunikation', es: 'comunicación' },
  'ressources humaines': { fr: 'ressources humaines', en: 'human resources', de: 'personalwesen' },
  'rh': { fr: 'rh', en: 'hr', de: 'hr' },
  'manager': { fr: 'manager', en: 'manager', de: 'manager' },
  'directeur': { fr: 'directeur', en: 'director', de: 'direktor', es: 'director' },
  'assistant': { fr: 'assistant', en: 'assistant', de: 'assistent', es: 'asistente' },
  'assistante': { fr: 'assistante', en: 'assistant', de: 'assistent', es: 'asistente' },
  'secrétaire': { fr: 'secrétaire', en: 'secretary', de: 'sekretär', es: 'secretario' },
  'secretaire': { fr: 'secretaire', en: 'secretary', de: 'sekretär', es: 'secretario' },
  'réceptionniste': { fr: 'réceptionniste', en: 'receptionist', de: 'empfangsmitarbeiter' },
  'receptionniste': { fr: 'receptionniste', en: 'receptionist', de: 'empfangsmitarbeiter' },
  'infirmier': { fr: 'infirmier', en: 'nurse', de: 'krankenpfleger', es: 'enfermero' },
  'infirmière': { fr: 'infirmière', en: 'nurse', de: 'krankenpfleger', es: 'enfermera' },
  'infirmiere': { fr: 'infirmiere', en: 'nurse', de: 'krankenpfleger', es: 'enfermera' },
  'médecin': { fr: 'médecin', en: 'doctor', de: 'arzt', es: 'médico', it: 'medico' },
  'medecin': { fr: 'medecin', en: 'doctor', de: 'arzt', es: 'médico', it: 'medico' },
  'pharmacien': { fr: 'pharmacien', en: 'pharmacist', de: 'apotheker', es: 'farmacéutico' },
  'aide-soignant': { fr: 'aide-soignant', en: 'nursing assistant', de: 'pflegehelfer' },
  'professeur': { fr: 'professeur', en: 'teacher', de: 'lehrer', es: 'profesor' },
  'enseignant': { fr: 'enseignant', en: 'teacher', de: 'lehrer', es: 'profesor' },
  'formateur': { fr: 'formateur', en: 'trainer', de: 'ausbilder', es: 'formador' },
  'électricien': { fr: 'électricien', en: 'electrician', de: 'elektriker', es: 'electricista' },
  'electricien': { fr: 'electricien', en: 'electrician', de: 'elektriker', es: 'electricista' },
  'plombier': { fr: 'plombier', en: 'plumber', de: 'klempner', es: 'fontanero' },
  'maçon': { fr: 'maçon', en: 'mason', de: 'maurer', es: 'albañil' },
  'macon': { fr: 'macon', en: 'mason', de: 'maurer', es: 'albañil' },
  'menuisier': { fr: 'menuisier', en: 'carpenter', de: 'tischler', es: 'carpintero' },
  'serveur': { fr: 'serveur', en: 'waiter', de: 'kellner', es: 'camarero' },
  'serveuse': { fr: 'serveuse', en: 'waitress', de: 'kellnerin', es: 'camarera' },
  'cuisinier': { fr: 'cuisinier', en: 'cook', de: 'koch', es: 'cocinero' },
  'chef': { fr: 'chef', en: 'chef', de: 'chefkoch', es: 'chef' },
  'barman': { fr: 'barman', en: 'bartender', de: 'barkeeper', es: 'bartender' },
  'barmaid': { fr: 'barmaid', en: 'bartender', de: 'barkeeper', es: 'bartender' },
}

const englishToFrenchKey: Record<string, string> = {};
for (const [frKey, tr] of Object.entries(commonJobTerms)) {
  const enLower = tr.en.toLowerCase();
  if (!englishToFrenchKey[enLower]) {
    englishToFrenchKey[enLower] = frKey;
  }
}

const countryLanguages: Record<string, string[]> = {
  'France': ['fr', 'en'],
  'Suisse': ['fr', 'de', 'en'],
  'Allemagne': ['de', 'en'],
  'Autriche': ['de', 'en'],
  'Canada': ['en', 'fr'],
  'États-Unis': ['en'],
  'Royaume-Uni': ['en'],
  'Belgique': ['fr', 'en', 'de'],
  'Luxembourg': ['fr', 'de', 'en'],
  'Espagne': ['es', 'en'],
  'Italie': ['it', 'en'],
}

export function enhanceSearchKeyword(keyword: string, country?: string, locale: string = 'fr'): string {
  if (!keyword || !keyword.trim()) {
    return '';
  }
  
  const lowerKeyword = keyword.toLowerCase().trim();
  const targetLanguages = country ? (countryLanguages[country] || ['en']) : ['en'];

  if (locale === 'fr') {
    if (commonJobTerms[lowerKeyword]) {
      const translations = commonJobTerms[lowerKeyword];
      return buildSearchQuery(keyword, translations, targetLanguages, locale);
    }

    for (const [frenchTerm, translations] of Object.entries(commonJobTerms)) {
      if (lowerKeyword.includes(frenchTerm)) {
        return buildSearchQuery(keyword, translations, targetLanguages, locale);
      }
    }

    return keyword;
  }

  if (englishToFrenchKey[lowerKeyword]) {
    const frKey = englishToFrenchKey[lowerKeyword];
    const translations = commonJobTerms[frKey];
    return buildSearchQuery(keyword, translations, targetLanguages, locale);
  }

  for (const [, translations] of Object.entries(commonJobTerms)) {
    if (lowerKeyword.includes(translations.en.toLowerCase())) {
      return buildSearchQuery(keyword, translations, targetLanguages, locale);
    }
  }

  return keyword;
}

function buildSearchQuery(
  original: string,
  translations: TranslationMap,
  targetLanguages: string[],
  locale: string = 'fr'
): string {
  const terms = new Set<string>();
  terms.add(original);
  
  for (const lang of targetLanguages) {
    if (lang === locale) continue;
    
    if (lang === 'fr' && translations.fr) {
      terms.add(translations.fr);
    } else if (lang === 'en' && translations.en) {
      terms.add(translations.en);
    } else if (lang === 'de' && translations.de) {
      terms.add(translations.de);
    } else if (lang === 'es' && translations.es) {
      terms.add(translations.es);
    } else if (lang === 'it' && translations.it) {
      terms.add(translations.it);
    }
  }
  
  const uniqueTerms = Array.from(terms);
  return uniqueTerms.length > 1 ? uniqueTerms.join(' OR ') : uniqueTerms[0];
}

export function isFrenchKeyword(keyword: string): boolean {
  if (!keyword) return false;
  
  const lowerKeyword = keyword.toLowerCase();
  
  for (const frenchTerm of Object.keys(commonJobTerms)) {
    if (lowerKeyword.includes(frenchTerm)) {
      return true;
    }
  }
  
  return false;
}

export function getEnglishTranslation(frenchTerm: string): string | undefined {
  const translations = commonJobTerms[frenchTerm.toLowerCase()];
  return translations?.en;
}
