import api from '../lib/api';
import type { AdzunaSearchResponse, JobSearchParams } from '../features/search/types/job';

/**
 * Search for job offers using Adzuna API
 */
export async function searchJobs(params: JobSearchParams): Promise<AdzunaSearchResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.country) queryParams.append('country', params.country);
  if (params.city) queryParams.append('city', params.city);
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.category) queryParams.append('category', params.category);
  if (params.remote !== undefined) queryParams.append('remote', params.remote.toString());
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.resultsPerPage) queryParams.append('resultsPerPage', params.resultsPerPage.toString());
  if (params.salaryMin) queryParams.append('salaryMin', params.salaryMin.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);

  const response = await api.get<AdzunaSearchResponse>(`/job-offer/search?${queryParams.toString()}`);
  return response.data;
}
