"use client";

import { Lead } from "@/lib/types";
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Star,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    "#6366f1","#8b5cf6","#ec4899","#ef4444",
    "#f97316","#eab308","#22c55e","#14b8a6",
    "#3b82f6","#06b6d4",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

export default function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (lead) {
      setSaved(lead.saved);
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lead]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!lead) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Profile Header */}
        <div className="modal-profile-header">
          <div className="modal-cover-bg" />
          <div className="modal-profile-row">
            <div
              className="modal-avatar"
              style={{ background: getAvatarColor(lead.name) }}
            >
              {getInitials(lead.name)}
              {lead.premium && (
                <span className="modal-premium-badge">
                  <Star size={10} fill="#f59e0b" color="#f59e0b" />
                  Premium
                </span>
              )}
            </div>
            <div className="modal-profile-actions">
              <button
                className={`btn-save-modal ${saved ? "btn-save-modal-saved" : ""}`}
                onClick={() => setSaved(!saved)}
              >
                {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {saved ? "Saved" : "Save Lead"}
              </button>
              <a
                href={lead.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-linkedin"
              >
                <ExternalLink size={14} />
                LinkedIn
              </a>
            </div>
          </div>

          <div className="modal-profile-info">
            <div className="modal-name-row">
              <h2 className="modal-name">{lead.name}</h2>
              {lead.openToWork && (
                <span className="open-to-work-badge-lg">#OpenToWork</span>
              )}
              {lead.isCompany ? (
                <span className="badge badge-indigo" style={{ fontSize: "11px", marginLeft: "10px" }}>Company</span>
              ) : (
                <span className="badge badge-blue" style={{ fontSize: "11px", marginLeft: "10px" }}>Professional</span>
              )}
            </div>
            <p className="modal-headline">{lead.headline}</p>
            <div className="modal-meta-row">
              <span className="modal-meta-item">
                <Building2 size={14} />
                {lead.company}
                {lead.companySize && <span className="text-gray-500">({lead.companySize})</span>}
              </span>
              <span className="modal-meta-item">
                <MapPin size={14} />
                {lead.location}
              </span>
              <span className="modal-meta-item">
                <Users size={14} />
                {lead.connections.toLocaleString()}+ connections
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="modal-cols">
            {/* Left col */}
            <div className="modal-left">
              {/* About */}
              {lead.about && (
                <div className="modal-section">
                  <h3 className="modal-section-title">About</h3>
                  <p className="modal-about">{lead.about}</p>
                </div>
              )}

              {/* Experience */}
              {lead.experience?.length > 0 && (
                <div className="modal-section">
                  <h3 className="modal-section-title">
                    <Briefcase size={15} /> Experience
                  </h3>
                  <div className="modal-timeline">
                    {lead.experience.map((exp, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                          <p className="timeline-title">{exp.title}</p>
                          <p className="timeline-company">{exp.company}</p>
                          <p className="timeline-duration">{exp.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {lead.education?.length > 0 && (
                <div className="modal-section">
                  <h3 className="modal-section-title">
                    <GraduationCap size={15} /> Education
                  </h3>
                  {lead.education.map((edu, i) => (
                    <div key={i} className="edu-item">
                      <p className="edu-school">{edu.school}</p>
                      <p className="edu-degree">{edu.degree} · {edu.field} · {edu.year}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right col */}
            <div className="modal-right">
              {/* Contact Info */}
              <div className="modal-contact-card">
                <h3 className="modal-section-title">Contact Info</h3>
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className="contact-item">
                    <Mail size={14} />
                    <span>{lead.email}</span>
                    <CheckCircle2 size={12} className="text-green-400" />
                  </a>
                ) : (
                  <p className="contact-unavailable">
                    <Mail size={14} />
                    Email not available
                  </p>
                )}
                {lead.phone ? (
                  <div className="contact-item">
                    <Phone size={14} />
                    <span>{lead.phone}</span>
                  </div>
                ) : (
                  <p className="contact-unavailable">
                    <Phone size={14} />
                    Phone not available
                  </p>
                )}
              </div>

              {/* Skills */}
              {lead.skills?.length > 0 && (
                <div className="modal-skills-card">
                  <h3 className="modal-section-title">Top Skills</h3>
                  <div className="modal-skills">
                    {lead.skills.map((skill) => (
                      <span key={skill} className="modal-skill-chip">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="modal-stats-card">
                <div className="modal-stat">
                  <span className="modal-stat-num">{lead.connectionDegree}</span>
                  <span className="modal-stat-label">°Connection</span>
                </div>
                {lead.mutualConnections && (
                  <div className="modal-stat">
                    <span className="modal-stat-num">{lead.mutualConnections}</span>
                    <span className="modal-stat-label">Mutual</span>
                  </div>
                )}
                <div className="modal-stat">
                  <span className="modal-stat-num">{lead.seniority}</span>
                  <span className="modal-stat-label">Seniority</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
