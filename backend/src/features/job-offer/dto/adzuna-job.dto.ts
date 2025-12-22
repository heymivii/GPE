export class AdzunaJobDto {
  id: string; // ID Adzuna
  title: string; // Titre du poste
  company: string; // Nom de l'entreprise
  location: {
    city?: string;
    country: string;
    displayName: string; // Localisation formatée
  };
  description: string; // Description du poste
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  contract_type?: string; // Type de contrat (permanent, contract, etc.)
  remote?: boolean; // Télétravail
  redirect_url: string; // URL vers l'offre complète
  created_at: Date; // Date de publication
  category?: string; // Catégorie d'emploi
  company_logo?: string; // Logo de l'entreprise (si disponible)
}

export class AdzunaSearchResponseDto {
  results: AdzunaJobDto[]; // Liste des offres
  total: number; // Nombre total de résultats
  page: number; // Page actuelle
  perPage: number; // Résultats par page
  totalPages: number; // Nombre total de pages
}
