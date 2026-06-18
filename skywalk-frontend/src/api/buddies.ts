// skywalk-frontend/src/api/buddies.ts

import api from '../lib/api';

export interface Buddy {
  firstname: string;
  originCountry: string;
  completedAt: string; // ISO date string YYYY-MM-DD
}

export async function getBuddies(
  procedureId: number,
  countryId: number,
): Promise<Buddy[]> {
  const response = await api.get<Buddy[]>('/procedure-tracking/buddies', {
    params: { procedureId, countryId },
  });
  return response.data;
}