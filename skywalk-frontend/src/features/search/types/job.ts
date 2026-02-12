export interface AdzunaJobDto {
  id: string;
  title: string;
  company: string;
  location: {
    city: string;
    country: string;
    displayName: string;
  };
  description: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
    period?: 'month' | 'year';
  };
  contract_type?: string;
  remote: boolean;
  redirect_url: string;
  created_at: string;
  category?: string;
  company_logo?: string;
}

export interface AdzunaSearchResponse {
  results: AdzunaJobDto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface JobSearchParams {
  country?: string;
  city?: string;
  keyword?: string;
  category?: string;
  remote?: boolean;
  page?: number;
  resultsPerPage?: number;
  salaryMin?: number;
  sortBy?: 'relevance' | 'date' | 'salary';
  salaryMax?: number;
  fullTime?: boolean;
  partTime?: boolean;
  contract?: boolean;
  permanent?: boolean;
  what_exclude?: string;
  max_days_old?: number;
}
