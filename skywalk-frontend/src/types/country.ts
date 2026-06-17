export interface Country {
  idCountry: number;
  countryName: string;
  isoCode?: string;
  currency?: string;
  language?: string;
  visaInfo?: string;
  flagUrl?: string;
  continentId: number; // FK to continent (matches the backend Country entity)
  createdAt: string;
  capital?: string;
  continent?: {
    idContinent: number;
    name: string;
    continentName?: string;
  };
}
