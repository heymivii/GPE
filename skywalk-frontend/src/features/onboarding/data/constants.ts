
export const COUNTRIES = [
  { value: 'FR', label: 'France' },
  { value: 'CA', label: 'Canada' },
  { value: 'CH', label: 'Suisse' },
  { value: 'DE', label: 'Allemagne' },
  { value: 'ES', label: 'Espagne' },
  { value: 'IT', label: 'Italie' },
  { value: 'PT', label: 'Portugal' },
  { value: 'BE', label: 'Belgique' },
  { value: 'NL', label: 'Pays-Bas' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'GB', label: 'Royaume-Uni' },
  { value: 'IE', label: 'Irlande' },
  { value: 'US', label: 'États-Unis' },
  { value: 'AU', label: 'Australie' },
  { value: 'NZ', label: 'Nouvelle-Zélande' },
  { value: 'JP', label: 'Japon' },
  { value: 'SG', label: 'Singapour' },
  { value: 'AE', label: 'Émirats arabes unis' },
  { value: 'MX', label: 'Mexique' },
  { value: 'BR', label: 'Brésil' }
]

export const LANGUAGE_LEVELS = [
  { value: 'A1', label: 'A1 - Débutant' },
  { value: 'A2', label: 'A2 - Élémentaire' },
  { value: 'B1', label: 'B1 - Intermédiaire' },
  { value: 'B2', label: 'B2 - Intermédiaire avancé' },
  { value: 'C1', label: 'C1 - Avancé' },
  { value: 'C2', label: 'C2 - Maîtrise' }
]

export const STATUS_OPTIONS = [
  { value: 'student', label: 'Étudiant' },
  { value: 'employee', label: 'Salarié' },
  { value: 'self_employed', label: 'Indépendant' },
  { value: 'unemployed', label: 'Demandeur d\'emploi' },
  { value: 'retired', label: 'Retraité' },
  { value: 'other', label: 'Autre' }
]

export const TRAVEL_PARTY_OPTIONS = [
  { value: 'alone', label: 'Seul' },
  { value: 'couple', label: 'En couple' },
  { value: 'family', label: 'En famille' },
  { value: 'friends', label: 'Avec des amis' }
]

export const GOAL_OPTIONS = [
  { value: 'studies', label: 'Études' },
  { value: 'work', label: 'Travail' },
  { value: 'discovery', label: 'Découverte' },
  { value: 'family', label: 'Famille' },
  { value: 'internship', label: 'Stage' },
  { value: 'other', label: 'Autre' }
]

export const STAY_DURATION_OPTIONS = [
  { value: 'less_6_months', label: 'Moins de 6 mois' },
  { value: '6_12_months', label: '6 à 12 mois' },
  { value: '1_3_years', label: '1 à 3 ans' },
  { value: 'more_3_years', label: 'Plus de 3 ans' }
]

export const STEPS_DONE_OPTIONS = [
  { value: 'school_registration', label: 'Inscription école' },
  { value: 'housing_search', label: 'Recherche logement' },
  { value: 'job_search', label: 'Recherche emploi' },
  { value: 'visa_application', label: 'Demande visa' },
  { value: 'other', label: 'Autre' },
  { value: 'none', label: 'Aucune démarche' }
]

export const PRIORITY_OPTIONS = [
  { value: 'housing', label: 'Logement' },
  { value: 'employment', label: 'Emploi' },
  { value: 'transport', label: 'Transport' },
  { value: 'admin_help', label: 'Aides administratives' },
  { value: 'health', label: 'Santé' },
  { value: 'social_integration', label: 'Intégration sociale' }
]

export const ONBOARDING_STEPS = [
  { id: 1, label: 'Destination', state: 'current' as const },
  { id: 2, label: 'Profil', state: 'todo' as const },
  { id: 3, label: 'Objectif', state: 'todo' as const },
  { id: 4, label: 'Préparation', state: 'todo' as const },
  { id: 5, label: 'Besoins', state: 'todo' as const },
  { id: 6, label: 'Résumé', state: 'todo' as const }
]