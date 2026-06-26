/** Review workflow: an addition stays 'pending_review' (invisible user-side) until another admin approves it. */
export type ContentReviewStatus = 'pending_review' | 'active' | 'archived' | 'rejected';

/** Display-only author/reviewer info (sanitized server-side — never the full user row). */
export interface ReviewUserRef {
  idUser: number;
  firstName?: string;
  lastName?: string;
}

export interface Country {
  idCountry: number;
  countryName: string;
  isoCode?: string;
  currency?: string;
  language?: string;
  visaInfo?: string;
  flagUrl?: string;
  continentId: number; // FK to continent (matches the backend Country entity)
  status?: ContentReviewStatus;
  createdAt: string;
  capital?: string;
  continent?: {
    idContinent: number;
    name: string;
    continentName?: string;
  };
  govLinkEnabled?: boolean;
  officialDomains?: string[];
  createdBy?: ReviewUserRef | null;
  reviewedBy?: ReviewUserRef | null;
  reviewedAt?: string | null;
}
