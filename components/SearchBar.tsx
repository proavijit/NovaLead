"use client";

import { Search, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

const suggestions = [
  "Software Engineer at Google",
  "Product Manager SaaS",
  "Marketing Director Fintech",
  "VP of Sales Enterprise",
  "Data Scientist AI",
  "CTO Startup",
  "UX Designer Figma",
  "DevOps Engineer AWS",
];

export default function SearchBar({
  value,
  onChange,
  onSearch,
  isLoading,
  placeholder = 'Search by name, title, company, skill... e.g. "VP of Product at Stripe"',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch();
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className="search-bar-wrapper">
      <div className="search-bar">
        <div className="search-icon-left">
          {isLoading ? (
            <div className="search-spinner" />
          ) : (
            <Search size={20} className="text-blue-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
        />
        {value && (
          <button className="search-clear-btn" onClick={handleClear} aria-label="Clear search">
            <X size={16} />
          </button>
        )}
        <button className="search-btn" onClick={onSearch} disabled={isLoading}>
          <Sparkles size={16} />
          <span>Search LinkedIn</span>
        </button>
      </div>

      {/* Quick suggestions */}
      {!value && (
        <div className="search-suggestions">
          <span className="suggestions-label">Try:</span>
          {suggestions.slice(0, 4).map((s) => (
            <button
              key={s}
              className="suggestion-chip"
              onClick={() => { onChange(s); onSearch(); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
