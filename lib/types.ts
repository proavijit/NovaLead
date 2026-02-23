export interface Lead {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  headline: string;
  title: string;
  company: string;
  companySize?: string;
  location: string;
  country: string;
  industry: string;
  seniority: "Entry" | "Mid" | "Senior" | "Director" | "VP" | "C-Suite";
  connections: number;
  email?: string;
  phone?: string;
  linkedinUrl: string;
  about: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  saved: boolean;
  scrapedAt: string;
  connectionDegree: 1 | 2 | 3;
  mutualConnections?: number;
  openToWork?: boolean;
  premium?: boolean;
  isCompany?: boolean;
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  location?: string;
  description?: string;
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  year: string;
}

export interface SearchFilters {
  query: string;
  industry?: string;
  location?: string;
  seniority?: string;
  companySize?: string;
  connectionDegree?: string;
  openToWork?: boolean;
}

export interface SearchResult {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
  query: string;
}

export interface ScrapeJob {
  id: string;
  query: string;
  filters: SearchFilters;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  totalFound: number;
  startedAt: string;
  completedAt?: string;
}

export interface Stats {
  totalLeads: number;
  savedLeads: number;
  newToday: number;
  industries: number;
  conversionRate: number;
}
