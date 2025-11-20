// Types pour les pays

export interface Country {
  idCountry: number;
  countryName: string;
  isoCode?: string;
  currency?: string;
  language?: string;
  visaInfo?: string;
  flagUrl?: string;
  idContinent: number;
  createdAt: string;
}
