"use client";

import { Stats } from "@/lib/types";
import { BarChart3, Bookmark, Globe2, TrendingUp, Users } from "lucide-react";

interface StatsBarProps {
  stats: Stats;
}

export default function StatsBar({ stats }: StatsBarProps) {
  const items = [
    {
      label: "Total Leads",
      value: stats.totalLeads,
      icon: Users,
      color: "stat-blue",
    },
    {
      label: "Saved",
      value: stats.savedLeads,
      icon: Bookmark,
      color: "stat-purple",
    },
    {
      label: "New Today",
      value: stats.newToday,
      icon: TrendingUp,
      color: "stat-green",
    },
    {
      label: "Industries",
      value: stats.industries,
      icon: Globe2,
      color: "stat-orange",
    },
    {
      label: "Conv. Rate",
      value: `${stats.conversionRate}%`,
      icon: BarChart3,
      color: "stat-pink",
    },
  ];

  return (
    <div className="stats-bar">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className={`stat-card ${color}`}>
          <div className="stat-icon">
            <Icon size={18} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
