"use client";

import { companySizes, industries, locations, seniorityLevels } from "@/lib/data";
import { SearchFilters } from "@/lib/types";
import { Filter, X } from "lucide-react";

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: string | boolean) => void;
  onClearFilters: () => void;
  totalResults: number;
}

interface SelectFilterProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

function SelectFilter({ label, options, value, onChange }: SelectFilterProps) {
  return (
    <div className="filter-group">
      <label className="filter-label">{label}</label>
      <select
        className="filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default function FilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  totalResults,
}: FilterPanelProps) {
  const hasActiveFilters =
    (filters.industry && filters.industry !== "All") ||
    (filters.location && filters.location !== "All") ||
    (filters.seniority && filters.seniority !== "All") ||
    (filters.companySize && filters.companySize !== "All") ||
    filters.openToWork;

  return (
    <aside className="filter-panel">
      <div className="filter-panel-header">
        <div className="filter-panel-title">
          <Filter size={16} />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={onClearFilters}>
            <X size={13} />
            Clear
          </button>
        )}
      </div>

      <div className="filter-results-count">
        <span className="results-num">{totalResults}</span> leads found
      </div>

      <div className="filter-groups">
        <SelectFilter
          label="Industry"
          options={industries}
          value={filters.industry || "All"}
          onChange={(v) => onFilterChange("industry", v)}
        />

        <SelectFilter
          label="Location"
          options={locations}
          value={filters.location || "All"}
          onChange={(v) => onFilterChange("location", v)}
        />

        <SelectFilter
          label="Seniority"
          options={seniorityLevels}
          value={filters.seniority || "All"}
          onChange={(v) => onFilterChange("seniority", v)}
        />

        <SelectFilter
          label="Company Size"
          options={companySizes}
          value={filters.companySize || "All"}
          onChange={(v) => onFilterChange("companySize", v)}
        />

        <div className="filter-group">
          <label className="filter-label">Connection Degree</label>
          <div className="degree-btns">
            {["All", "1", "2", "3"].map((d) => (
              <button
                key={d}
                className={`degree-btn ${(filters.connectionDegree || "All") === d ? "degree-btn-active" : ""}`}
                onClick={() => onFilterChange("connectionDegree" as keyof SearchFilters, d)}
              >
                {d === "All" ? "All" : `${d}${d === "1" ? "st" : d === "2" ? "nd" : "rd"}`}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-checkbox-label">
            <input
              type="checkbox"
              className="filter-checkbox"
              checked={!!filters.openToWork}
              onChange={(e) => onFilterChange("openToWork", e.target.checked)}
            />
            <span>Open to Work Only</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
