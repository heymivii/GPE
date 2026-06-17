export interface Country {
  idCountry: number;
  countryName: string;
  isoCode?: string;
  currency?: string;
  language?: string;
  visaInfo?: string;
  flagUrl?: string;
  idContinent: number;
  status?: 'active' | 'archived';
  createdAt: string;
  capital?: string;
  continent?: {
    idContinent: number;
    name: string;
    continentName?: string;
  };
}
