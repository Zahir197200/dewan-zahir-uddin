export type ServiceCategory = 'all' | 'account' | 'loan' | 'remittance' | 'digital';

export interface BankingServiceItem {
  id: string;
  number: string;
  category: Exclude<ServiceCategory, 'all'>;
  categoryLabel: string;
  title: string;
  description: string;
  highlights: string[];
  featured?: boolean;
}

export interface PosterItem {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  accentColor: 'navy' | 'red' | 'green' | 'purple';
  points: string[];
  footerNote: string;
  customImage?: string;
}

export interface LedgerColumn {
  id: string;
  label: string;
  type: 'text' | 'number';
}

export interface LedgerRow {
  id: string;
  cells: Record<string, string>;
}

export interface LedgerTable {
  id: string;
  name: string;
  createdAt: string;
  columns: LedgerColumn[];
  rows: LedgerRow[];
}

export interface CustomerLead {
  id: string;
  name: string;
  phone: string;
  service: string;
  message: string;
  createdAt: string;
}

export interface SiteConfig {
  businessName: string;
  bankTitle: string;
  branchLocation: string;
  heroKicker: string;
  heroHeadline: string;
  heroDescription: string;
  coverImage: string;
  phones: string[];
  whatsappNumbers: string[];
  email: string;
  hours: string;
  securityNoticeTitle: string;
  securityNoticeBody: string;
  securityNoticeWarning: string;
  services: BankingServiceItem[];
  posters: PosterItem[];
}
