export class AdzunaJobDto {
  id: string;
  title: string;
  company: string;
  location: {
    city?: string;
    country: string;
    displayName: string;
  };
  description: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: 'month' | 'year';
  };
  contract_type?: string;
  remote?: boolean;
  redirect_url: string;
  created_at: Date;
  category?: string;
  company_logo?: string;
}

export class AdzunaSearchResponseDto {
  results: AdzunaJobDto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
