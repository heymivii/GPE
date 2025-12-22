// Types for Adzuna API responses
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

// Parameters for job search
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
}
