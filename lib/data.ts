import { Lead } from "./types";

export const mockLeads: Lead[] = [];

export function filterLeads(leads: Lead[], filters: {
  query?: string;
  industry?: string;
  location?: string;
  seniority?: string;
  companySize?: string;
  connectionDegree?: string;
  openToWork?: boolean;
}): Lead[] {
  return leads.filter((lead) => {
    const query = filters.query?.toLowerCase() || "";
    if (query) {
      const searchable = [
        lead.name,
        lead.title,
        lead.company,
        lead.headline,
        lead.location,
        lead.industry,
        ...lead.skills,
      ].join(" ").toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    if (filters.industry && filters.industry !== "All" && lead.industry !== filters.industry) {
      return false;
    }

    if (filters.location && filters.location !== "All") {
      if (!lead.location.toLowerCase().includes(filters.location.toLowerCase()) &&
          !lead.country.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
    }

    if (filters.seniority && filters.seniority !== "All" && lead.seniority !== filters.seniority) {
      return false;
    }

    if (filters.companySize && filters.companySize !== "All" && lead.companySize !== filters.companySize) {
      return false;
    }

    if (filters.connectionDegree && filters.connectionDegree !== "All") {
      const degree = parseInt(filters.connectionDegree);
      if (lead.connectionDegree !== degree) return false;
    }

    if (filters.openToWork && !lead.openToWork) {
      return false;
    }

    return true;
  });
}

export const industries = [
  "All", "Technology", "FinTech", "SaaS", "AI", "Marketing", "Design",
  "E-Commerce", "HealthTech", "HR", "Cybersecurity", "Crypto/Web3",
  "Venture Capital",
];

export const seniorityLevels = ["All", "Entry", "Mid", "Senior", "Director", "VP", "C-Suite"];

export const companySizes = [
  "All", "1-10", "11-50", "51-200", "201-500", "501-1000",
  "1001-5000", "5001-10000", "10001+",
];

export const locations = [
  "All", "United States", "United Kingdom", "Canada", "India", "Nigeria",
  "Germany", "France", "Sweden", "UAE", "Kenya",
];

export function getStats() {
  return {
    totalLeads: mockLeads.length,
    savedLeads: mockLeads.filter((l) => l.saved).length,
    newToday: 8,
    industries: new Set(mockLeads.map((l) => l.industry)).size,
    conversionRate: 24.5,
  };
}
