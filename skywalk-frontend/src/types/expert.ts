export interface Expert {
  idUser: number;
  fullName: string;
  expertTitle: string | null;
  expertBio: string | null;
  expertCountry: { idCountry: number; countryName: string } | null;
  expertVerifiedAt: string | null;
  // F4
  averageRating?: number;
  ratingCount?: number;
}

export interface VerifyExpertDto {
  expertTitle?: string;
  expertBio?: string;
  expertCountryId?: number;
}
