"use client";

import { Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <div className="logo-icon">
            <Zap size={16} fill="white" />
          </div>
          <span className="logo-text">NovaLead</span>
        </Link>

        {/* Simple Nav links */}
        <div className="nav-links">
          <Link
            href="/dashboard"
            className={`nav-link ${pathname === "/dashboard" ? "nav-link-active" : ""}`}
          >
            Scraper Dashboard
          </Link>
        </div>

        {/* Right side */}
        <div className="navbar-right">
          <div className="user-menu">
            <div className="user-avatar">AG</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
