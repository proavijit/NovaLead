"use client";

import { Lead } from "@/lib/types";
import { AlertCircle, CheckCircle2, Linkedin, Loader2, X, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ScrapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (query: string, leads: Lead[]) => void;
  query?: string;
}

interface ScrapeStep {
  label: string;
  status: "pending" | "running" | "done" | "error";
}

const INITIAL_STEPS: ScrapeStep[] = [
  { label: "Targeting LinkedIn profiles via AI...", status: "pending" },
  { label: "Bypassing anti-bot with ZenRows...", status: "pending" },
  { label: "Scraping page content (Markdown)...", status: "pending" },
  { label: "Depth parsing with Trinity AI...", status: "pending" },
  { label: "Structuring real lead data...", status: "pending" },
];

export default function ScrapeModal({ isOpen, onClose, onComplete, query: propQuery }: ScrapeModalProps) {
  const [query, setQuery] = useState(propQuery || "");
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<ScrapeStep[]>(INITIAL_STEPS);
  const [currentStep, setCurrentStep] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [foundCount, setFoundCount] = useState(0);

  const updateStep = useCallback((index: number, status: ScrapeStep["status"]) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status } : s))
    );
  }, []);

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleScrape = useCallback(async (q: string = query) => {
    if (!q.trim()) return;
    setIsRunning(true);
    setError(null);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "pending" })));

    try {
      // Step 0
      setCurrentStep(0);
      updateStep(0, "running");
      const scrapePromise = fetch("/api/real-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      await delay(1000);
      updateStep(0, "done");

      // Step 1
      setCurrentStep(1);
      updateStep(1, "running");
      await delay(800);
      updateStep(1, "done");

      // Step 2
      setCurrentStep(2);
      updateStep(2, "running");
      await delay(1200);
      updateStep(2, "done");

      // Step 3
      setCurrentStep(3);
      updateStep(3, "running");
      const responsePromise = scrapePromise.then((r) => r.json());
      await delay(2000);
      updateStep(3, "done");

      // Step 4
      setCurrentStep(4);
      updateStep(4, "running");
      const data = await responsePromise;

      if (data.error) {
        throw new Error(data.error);
      }

      updateStep(4, "done");
      setFoundCount(data.leads?.length || 0);

      await delay(500);
      setIsRunning(false);
      onComplete(q, data.leads || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Scraping failed";
      setError(msg);
      updateStep(currentStep, "error");
      setIsRunning(false);
    }
  }, [query, onComplete, currentStep, updateStep]);

  useEffect(() => {
    if (isOpen) {
      if (propQuery) {
        setQuery(propQuery);
        handleScrape(propQuery);
      }
    } else {
      setIsRunning(false);
      setSteps(INITIAL_STEPS);
      setCurrentStep(-1);
      setError(null);
    }
  }, [isOpen, propQuery, handleScrape]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isRunning) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, isRunning]);

  if (!isOpen) return null;

  const progress = steps.filter((s) => s.status === "done").length;
  const progressPct = Math.round((progress / steps.length) * 100);

  return (
    <div className="modal-overlay" onClick={!isRunning ? onClose : undefined}>
      <div className="scrape-modal" onClick={(e) => e.stopPropagation()}>
        {!isRunning && (
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        )}

        {/* Header */}
        <div className="scrape-modal-header">
          <div className="scrape-icon">
            <Zap size={22} fill="white" />
          </div>
          <h2 className="scrape-title">Real LinkedIn Data Pipeline</h2>
          <p className="scrape-subtitle">
            Powered by <strong className="text-blue-400">ZenRows</strong> +{" "}
            <strong className="text-purple-400">StepFun AI</strong>
          </p>
        </div>

        {!isRunning && !error ? (
          <div className="scrape-form">
            <div className="form-group">
              <label className="form-label">
                <Linkedin size={13} style={{ display: "inline", marginRight: 5 }} />
                LinkedIn Prospecting Query
              </label>
              <textarea
                className="form-input scrape-textarea"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Examples:\n• "Top 10 Indian software companies"\n• "CTO of AI companies in London"`}
                rows={4}
              />
            </div>

            <div className="scrape-info-box">
              <div className="scrape-info-row">
                <span className="scrape-info-label">🕷 Scraper</span>
                <span className="scrape-info-val">ZenRows AI Bypass</span>
              </div>
              <div className="scrape-info-row">
                <span className="scrape-info-label">🤖 AI Model</span>
                <span className="scrape-info-val">stepfun/step-3.5-flash:free</span>
              </div>
            </div>

            <button
              className="scrape-run-btn"
              onClick={() => handleScrape()}
              disabled={!query.trim()}
            >
              <Zap size={16} fill="white" />
              Start Prospecting
            </button>
          </div>
        ) : isRunning ? (
          <div className="scrape-progress">
            {/* Progress bar */}
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="progress-percent">{progressPct}%</div>

            {/* Live steps */}
            <div className="scrape-logs">
              {steps.map((step, i) => (
                <div key={i} className={`log-line ${step.status === "running" ? "log-line-active" : ""}`}>
                  {step.status === "running" && (
                    <Loader2 size={12} className="animate-spin text-blue-400" />
                  )}
                  {step.status === "done" && (
                    <CheckCircle2 size={12} className="text-green-400" />
                  )}
                  {step.status === "error" && (
                    <AlertCircle size={12} className="text-red-400" />
                  )}
                  {step.status === "pending" && (
                    <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: "var(--border)" }} />
                  )}
                  <span style={{ opacity: step.status === "pending" ? 0.4 : 1 }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="scrape-query-pill">
              🔍 &quot;{query}&quot;
            </p>
          </div>
        ) : error ? (
          <div className="scrape-error">
            <AlertCircle size={40} className="text-red-400" style={{ margin: "0 auto 12px", display: "block" }} />
            <h3 className="scrape-error-title">Scraping Failed</h3>
            <p className="scrape-error-msg">{error}</p>
            {error.includes("ZenRows") && (
              <div className="scrape-error-hint">
                <strong>Fix: </strong>Your ZenRows credits may be exhausted or your API key is invalid. 
                <br />
                Check your dashboard at{" "}
                <a href="https://www.zenrows.com/dashboard" target="_blank" rel="noreferrer" className="link-blue">
                  zenrows.com
                </a>
              </div>
            )}
            {error.includes("OpenRouter") && (
              <div className="scrape-error-hint">
                <strong>Fix: </strong>Add your OpenRouter API key to{" "}
                <code>.env.local</code> as{" "}
                <code>OPENROUTER_API_KEY=sk-or-...</code>
                <br />
                Get your key at{" "}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="link-blue">
                  openrouter.ai/keys
                </a>
              </div>
            )}
            <button
              className="scrape-run-btn"
              style={{ marginTop: 16 }}
              onClick={() => { setError(null); setSteps(INITIAL_STEPS); }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="scrape-success">
            <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>✅</div>
            <h3 className="scrape-success-title">Scraped {foundCount} leads!</h3>
            <p className="scrape-success-msg">Real LinkedIn data extracted and displayed in your dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}
