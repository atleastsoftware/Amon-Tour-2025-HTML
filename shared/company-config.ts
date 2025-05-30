// Configuration par entreprise - structure sécurisée
export interface CompanyConfig {
  id: string;
  name: string;
  domain: string;
  tourNinjaApiKey: string;
  tourNinjaCompanyId: string;
  allowedDomains: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TourNinjaApiResponse {
  success: boolean;
  data: TourNinjaTour[];
  message?: string;
}

export interface TourNinjaTour {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  images: string[];
  price: number;
  currency: string;
  duration: string;
  location: string;
  bookingUrl?: string;
  externalId: string;
  isActive: boolean;
  category?: string;
  tags?: string[];
  maxGuests?: number;
  minGuests?: number;
  createdAt: string;
  updatedAt: string;
}

// Configuration par défaut pour cette instance
export const DEFAULT_COMPANY_CONFIG: Partial<CompanyConfig> = {
  id: process.env.COMPANY_ID || "default",
  name: process.env.COMPANY_NAME || "Amon Tour",
  domain: process.env.COMPANY_DOMAIN || "localhost",
  allowedDomains: process.env.ALLOWED_DOMAINS?.split(',') || ["localhost", "127.0.0.1"],
  isActive: true
};