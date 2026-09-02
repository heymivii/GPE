import api from '../lib/api';

export interface Buddy {
  idUser: number;
  firstname: string;
  originCountry: string;
  completedAt: string;
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
