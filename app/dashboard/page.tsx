"use client";

import LeadCard from "@/components/LeadCard";
import LeadDetailModal from "@/components/LeadDetailModal";
import ScrapeModal from "@/components/ScrapeModal";
import SearchBar from "@/components/SearchBar";
import { Lead } from "@/lib/types";
import { Download, LayoutGrid, List, Zap } from "lucide-react";
import { useState } from "react";


export default function DashboardPage() {
  const [searchInput, setSearchInput] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrapeModal, setShowScrapeModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setQuery(searchInput);
    setShowScrapeModal(true);
  };

  const handleScrapeComplete = (scrapeQuery: string, realLeads: Lead[]) => {
    setShowScrapeModal(false);
    setLeads(realLeads);
    setIsLoading(false);
  };

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["Name", "Title", "Company", "Location", "Industry", "Seniority", "Email", "LinkedIn URL", "Connections"];
    const rows = leads.map((l) => [
      l.name, l.title, l.company, l.location, l.industry, l.seniority,
      l.email || "", l.linkedinUrl, l.connections,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `novalead-scrape-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="dashboard-page" style={{ padding: "40px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Simple Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "10px", background: "linear-gradient(to right, #60a5fa, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            LinkedIn Data Scraper
          </h1>
          <p style={{ color: "var(--text-muted)" }}>Search and extract real leads using ZenRows & AI</p>
        </div>

        {/* Search & Action Bar */}
        <div className="dashboard-toolbar" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", padding: "20px", borderRadius: "16px", marginBottom: "30px", display: "flex", gap: "15px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={handleSearch}
              isLoading={isLoading}
            />
          </div>
          <button className="btn-scrape" onClick={handleSearch} disabled={!searchInput.trim()} style={{ height: "46px" }}>
            <Zap size={16} fill="white" />
            Scrape
          </button>
          
          {leads.length > 0 && (
            <button className="btn-export" onClick={exportCSV} style={{ height: "46px", background: "var(--bg-secondary)" }}>
              <Download size={16} />
              Export
            </button>
          )}
        </div>

        {/* Results Area */}
        <div className="leads-area" style={{ width: "100%" }}>
          {query && (
            <div className="query-label" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                Showing real results for <span className="query-text">&quot;{query}&quot;</span>
                <span className="query-count" style={{ marginLeft: "10px" }}>— {leads.length} found</span>
              </div>
              <div className="view-toggle">
                <button className={`view-btn ${viewMode === "grid" ? "view-btn-active" : ""}`} onClick={() => setViewMode("grid")}><LayoutGrid size={16} /></button>
                <button className={`view-btn ${viewMode === "list" ? "view-btn-active" : ""}`} onClick={() => setViewMode("list")}><List size={16} /></button>
              </div>
            </div>
          )}

          {leads.length > 0 ? (
            <div className={viewMode === "grid" ? "leads-grid" : "leads-list"}>
              {leads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onViewProfile={setSelectedLead}
                />
              ))}
            </div>
          ) : !isLoading && query ? (
            <div className="empty-state" style={{ padding: "60px 0" }}>
              <div className="empty-icon">📂</div>
              <h3 className="empty-title">Ready to scrape</h3>
              <p className="empty-desc">Enter a query and click Scrape to get real LinkedIn data</p>
            </div>
          ) : !isLoading && (
            <div className="empty-state" style={{ padding: "100px 0" }}>
              <div style={{ fontSize: "40px", marginBottom: "20px" }}>🕵️‍♂️</div>
              <h3 className="empty-title">Data Scraper Dashboard</h3>
              <p className="empty-desc">Search for companies, roles, or individuals across LinkedIn.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      <ScrapeModal
        isOpen={showScrapeModal}
        onClose={() => setShowScrapeModal(false)}
        onComplete={handleScrapeComplete}
        query={query}
      />
    </div>
  );
}
