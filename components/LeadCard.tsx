"use client";

import { Lead } from "@/lib/types";
import {
    Bookmark,
    BookmarkCheck,
    Briefcase,
    Building2,
    ExternalLink,
    Mail,
    MapPin,
    Phone,
    Star,
    Users,
} from "lucide-react";
import { useState } from "react";

interface LeadCardProps {
  lead: Lead;
  onSave?: (id: string) => void;
  onViewProfile?: (lead: Lead) => void;
}

const seniorityColor: Record<string, string> = {
  "C-Suite": "badge-purple",
  VP: "badge-blue",
  Director: "badge-indigo",
  Senior: "badge-teal",
  Mid: "badge-green",
  Entry: "badge-gray",
};

const degreeLabel: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
    "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#3b82f6", "#06b6d4",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function LeadCard({ lead, onSave, onViewProfile }: LeadCardProps) {
  const [saved, setSaved] = useState(lead.saved);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
    onSave?.(lead.id);
  };

  return (
    <div className="lead-card" onClick={() => onViewProfile?.(lead)}>
      {/* Header */}
      <div className="lead-card-header">
        <div className="lead-avatar" style={{ background: getAvatarColor(lead.name) }}>
          {getInitials(lead.name)}
          {lead.premium && (
            <span className="premium-badge" title="LinkedIn Premium">
              <Star size={8} fill="#f59e0b" color="#f59e0b" />
            </span>
          )}
        </div>

        <div className="lead-info">
          <div className="lead-name-row">
            <h3 className="lead-name">{lead.name}</h3>
            {lead.openToWork && (
              <span className="open-to-work-badge">#OpenToWork</span>
            )}
            {lead.isCompany && (
              <span className="badge badge-indigo" style={{ fontSize: "10px", padding: "1px 6px" }}>
                Company
              </span>
            )}
          </div>
          <p className="lead-title">{lead.title}</p>
          <div className="lead-company-row">
            <Building2 size={12} />
            <span>{lead.company}</span>
          </div>
        </div>

        <button
          className={`save-btn ${saved ? "save-btn-saved" : ""}`}
          onClick={handleSave}
          aria-label={saved ? "Unsave lead" : "Save lead"}
        >
          {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>

      {/* Headline */}
      <p className="lead-headline">{lead.headline}</p>

      {/* Meta */}
      <div className="lead-meta">
        <span className="lead-meta-item">
          <MapPin size={12} />
          {lead.location}
        </span>
        <span className="lead-meta-item">
          <Users size={12} />
          {lead.connections.toLocaleString()} connections
        </span>
      </div>

      {/* Tags */}
      <div className="lead-tags">
        <span className={`badge ${seniorityColor[lead.seniority] || "badge-gray"}`}>
          {lead.seniority}
        </span>
        <span className="badge badge-outline">{lead.industry}</span>
        <span className="badge badge-degree">
          {degreeLabel[lead.connectionDegree]}
        </span>
        {lead.mutualConnections && (
          <span className="badge badge-mutual">
            {lead.mutualConnections} mutual
          </span>
        )}
      </div>

      {/* Skills */}
      <div className="lead-skills">
        {lead.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="skill-chip">{skill}</span>
        ))}
        {lead.skills.length > 3 && (
          <span className="skill-chip skill-chip-more">+{lead.skills.length - 3}</span>
        )}
      </div>

      {/* Actions */}
      <div className="lead-actions">
        <button
          className="btn-sm btn-primary"
          onClick={(e) => { e.stopPropagation(); onViewProfile?.(lead); }}
        >
          <Briefcase size={13} />
          View Profile
        </button>
        {lead.email && (
          <button
            className="btn-sm btn-ghost"
            onClick={(e) => { e.stopPropagation(); window.open(`mailto:${lead.email}`); }}
          >
            <Mail size={13} />
          </button>
        )}
        {lead.phone && (
          <button
            className="btn-sm btn-ghost"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <Phone size={13} />
          </button>
        )}
        <a
          href={lead.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-sm btn-ghost"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
