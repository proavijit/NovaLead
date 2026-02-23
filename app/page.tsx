import { Download, Search, Shield, TrendingUp, Users, Zap } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Search,
    title: "Smart LinkedIn Search",
    desc: "Type any query — name, title, company, or skill — and get matching leads instantly from LinkedIn.",
  },
  {
    icon: Users,
    title: "Rich Lead Profiles",
    desc: "View full profiles: experience, education, skills, contact info, connection degree, and mutual connections.",
  },
  {
    icon: TrendingUp,
    title: "Advanced Filters",
    desc: "Filter by industry, seniority, company size, location, and connection degree to find the perfect prospects.",
  },
  {
    icon: Download,
    title: "Export to CSV",
    desc: "Download your leads list as CSV with one click. Ready for your CRM, email campaigns, or sales team.",
  },
  {
    icon: Zap,
    title: "Lightning Fast Scraper",
    desc: "Our intelligent scraper collects leads in seconds with real-time progress tracking and smart deduplication.",
  },
  {
    icon: Shield,
    title: "Enriched Data",
    desc: "Every lead comes enriched with verified email guesses, company data, industry tags, and seniority levels.",
  },
];

const stats = [
  { value: "50K+", label: "Leads Scraped" },
  { value: "500+", label: "Companies Covered" },
  { value: "98%", label: "Data Accuracy" },
  { value: "2s", label: "Avg Scrape Time" },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="navbar-logo">
            <div className="logo-icon">
              <Zap size={16} fill="white" />
            </div>
            <span className="logo-text">NovaLead</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#stats" className="landing-nav-link">Stats</a>
            <Link href="/dashboard" className="landing-cta-btn">
              <Zap size={14} fill="white" />
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />

        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={12} fill="#6366f1" color="#6366f1" />
            <span>LinkedIn Lead Intelligence Platform</span>
          </div>

          <h1 className="hero-title">
            Find Your Next
            <span className="hero-title-gradient"> Dream Client </span>
            on LinkedIn
          </h1>

          <p className="hero-desc">
            Search, scrape, and export LinkedIn leads in seconds. Filter by title,
            company, location, seniority, and more. Turn LinkedIn into your
            most powerful lead generation machine.
          </p>

          <div className="hero-actions">
            <Link href="/dashboard" className="hero-primary-btn">
              <Zap size={18} fill="white" />
              Open Scraper Dashboard
            </Link>
          </div>

          {/* Mini search demo */}
          <div className="hero-search-demo">
            <Search size={16} className="demo-search-icon" />
            <span className="demo-search-text">
              Try: &quot;VP of Product at Stripe&quot; or &quot;CTO Startup AI&quot;...
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="landing-stats" id="stats">
        {stats.map(({ value, label }) => (
          <div key={label} className="landing-stat">
            <span className="landing-stat-value">{value}</span>
            <span className="landing-stat-label">{label}</span>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <h2 className="features-title">Everything you need to generate leads</h2>
        <p className="features-subtitle">
          NovaLead gives you a full LinkedIn intelligence suite — search, filter, profile view, and export.
        </p>
        <div className="features-grid">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="feature-card">
              <div className="feature-icon">
                <Icon size={22} />
              </div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-glow" />
        <h2 className="cta-title">Ready to supercharge your lead generation?</h2>
        <p className="cta-desc">
          Jump into the dashboard and start finding LinkedIn leads right now.
        </p>
        <Link href="/dashboard" className="hero-primary-btn">
          <Zap size={16} fill="white" />
          Open Dashboard
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="navbar-logo">
          <div className="logo-icon">
            <Zap size={14} fill="white" />
          </div>
          <span className="logo-text">NovaLead</span>
        </div>
        <p className="footer-note">© 2024 NovaLead. For educational purposes only.</p>
      </footer>
    </div>
  );
}
