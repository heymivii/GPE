interface TranslationMap {
  en: string;
  de?: string;
  es?: string;
  it?: string;
}

const commonJobTerms: Record<string, TranslationMap> = {
  'développeur': { en: 'developer', de: 'entwickler', es: 'desarrollador', it: 'sviluppatore' },
  'developpeur': { en: 'developer', de: 'entwickler', es: 'desarrollador', it: 'sviluppatore' },
  'dev': { en: 'developer', de: 'entwickler' },
  'ingénieur': { en: 'engineer', de: 'ingenieur', es: 'ingeniero', it: 'ingegnere' },
  'ingenieur': { en: 'engineer', de: 'ingenieur', es: 'ingeniero', it: 'ingegnere' },
  'programmeur': { en: 'programmer', de: 'programmierer', es: 'programador' },
  'architecte': { en: 'architect', de: 'architekt', es: 'arquitecto', it: 'architetto' },
  'analyste': { en: 'analyst', de: 'analyst', es: 'analista', it: 'analista' },
  'consultant': { en: 'consultant', de: 'berater', es: 'consultor', it: 'consulente' },
  'technicien': { en: 'technician', de: 'techniker', es: 'técnico' },
  'chef de projet': { en: 'project manager', de: 'projektleiter', es: 'jefe de proyecto' },
  'product owner': { en: 'product owner', de: 'product owner' },
  'scrum master': { en: 'scrum master', de: 'scrum master' },
  'data scientist': { en: 'data scientist', de: 'datenwissenschaftler', es: 'científico de datos' },
  'data analyst': { en: 'data analyst', de: 'datenanalyst', es: 'analista de datos' },
  'devops': { en: 'devops', de: 'devops' },
  'designer': { en: 'designer', de: 'designer', es: 'diseñador', it: 'designer' },
  'ux designer': { en: 'ux designer', de: 'ux designer' },
  'ui designer': { en: 'ui designer', de: 'ui designer' },
  'frontend': { en: 'frontend', de: 'frontend' },
  'backend': { en: 'backend', de: 'backend' },
  'fullstack': { en: 'fullstack', de: 'fullstack' },
  'full stack': { en: 'full stack', de: 'full stack' },
  'mobile': { en: 'mobile', de: 'mobil' },
  'web': { en: 'web', de: 'web' },
  'cloud': { en: 'cloud', de: 'cloud' },
  'cybersécurité': { en: 'cybersecurity', de: 'cybersicherheit', es: 'ciberseguridad' },
  'cybersecurite': { en: 'cybersecurity', de: 'cybersicherheit', es: 'ciberseguridad' },
  'intelligence artificielle': { en: 'artificial intelligence', de: 'künstliche intelligenz' },
  'machine learning': { en: 'machine learning', de: 'maschinelles lernen' },
  'junior': { en: 'junior', de: 'junior' },
  'senior': { en: 'senior', de: 'senior' },
  'confirmé': { en: 'experienced', de: 'erfahren' },
  'confirme': { en: 'experienced', de: 'erfahren' },
  'débutant': { en: 'beginner', de: 'anfänger' },
  'debutant': { en: 'beginner', de: 'anfänger' },
  'stagiaire': { en: 'intern', de: 'praktikant', es: 'pasante' },
  'alternant': { en: 'apprentice', de: 'auszubildender' },
  'alternance': { en: 'apprenticeship', de: 'ausbildung' },
  'comptable': { en: 'accountant', de: 'buchhalter', es: 'contador' },
  'commercial': { en: 'sales', de: 'vertrieb', es: 'comercial' },
  'vendeur': { en: 'salesperson', de: 'verkäufer', es: 'vendedor' },
  'marketing': { en: 'marketing', de: 'marketing' },
  'communication': { en: 'communication', de: 'kommunikation', es: 'comunicación' },
  'ressources humaines': { en: 'human resources', de: 'personalwesen' },
  'rh': { en: 'hr', de: 'hr' },
  'manager': { en: 'manager', de: 'manager' },
  'directeur': { en: 'director', de: 'direktor', es: 'director' },
  'assistant': { en: 'assistant', de: 'assistent', es: 'asistente' },
  'assistante': { en: 'assistant', de: 'assistent', es: 'asistente' },
  'secrétaire': { en: 'secretary', de: 'sekretär', es: 'secretario' },
  'secretaire': { en: 'secretary', de: 'sekretär', es: 'secretario' },
  'réceptionniste': { en: 'receptionist', de: 'empfangsmitarbeiter' },
  'receptionniste': { en: 'receptionist', de: 'empfangsmitarbeiter' },
  'infirmier': { en: 'nurse', de: 'krankenpfleger', es: 'enfermero' },
  'infirmière': { en: 'nurse', de: 'krankenpfleger', es: 'enfermera' },
  'infirmiere': { en: 'nurse', de: 'krankenpfleger', es: 'enfermera' },
  'médecin': { en: 'doctor', de: 'arzt', es: 'médico', it: 'medico' },
  'medecin': { en: 'doctor', de: 'arzt', es: 'médico', it: 'medico' },
  'pharmacien': { en: 'pharmacist', de: 'apotheker', es: 'farmacéutico' },
  'aide-soignant': { en: 'nursing assistant', de: 'pflegehelfer' },
  'professeur': { en: 'teacher', de: 'lehrer', es: 'profesor' },
  'enseignant': { en: 'teacher', de: 'lehrer', es: 'profesor' },
  'formateur': { en: 'trainer', de: 'ausbilder', es: 'formador' },
  'électricien': { en: 'electrician', de: 'elektriker', es: 'electricista' },
  'electricien': { en: 'electrician', de: 'elektriker', es: 'electricista' },
  'plombier': { en: 'plumber', de: 'klempner', es: 'fontanero' },
  'maçon': { en: 'mason', de: 'maurer', es: 'albañil' },
  'macon': { en: 'mason', de: 'maurer', es: 'albañil' },
  'menuisier': { en: 'carpenter', de: 'tischler', es: 'carpintero' },
  'serveur': { en: 'waiter', de: 'kellner', es: 'camarero' },
  'serveuse': { en: 'waitress', de: 'kellnerin', es: 'camarera' },
  'cuisinier': { en: 'cook', de: 'koch', es: 'cocinero' },
  'chef': { en: 'chef', de: 'chefkoch', es: 'chef' },
  'barman': { en: 'bartender', de: 'barkeeper', es: 'bartender' },
  'barmaid': { en: 'bartender', de: 'barkeeper', es: 'bartender' },
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

export function enhanceSearchKeyword(keyword: string, country?: string): string {
  if (!keyword || !keyword.trim()) {
    return '';
  }
  
  const lowerKeyword = keyword.toLowerCase().trim();
  const targetLanguages = country ? (countryLanguages[country] || ['en']) : ['en'];
  
  if (commonJobTerms[lowerKeyword]) {
    const translations = commonJobTerms[lowerKeyword];
    return buildSearchQuery(keyword, translations, targetLanguages);
  }
  
  for (const [frenchTerm, translations] of Object.entries(commonJobTerms)) {
    if (lowerKeyword.includes(frenchTerm)) {
      return buildSearchQuery(keyword, translations, targetLanguages);
    }
  }
  
  return keyword;
}

function buildSearchQuery(
  original: string,
  translations: TranslationMap,
  targetLanguages: string[]
): string {
  const terms = new Set<string>();
  terms.add(original);
  
  for (const lang of targetLanguages) {
    if (lang === 'fr') continue;
    
    if (lang === 'en' && translations.en) {
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
