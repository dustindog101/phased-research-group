"use client";

/**
 * Age verification gate — shows on first visit, stores acceptance in localStorage.
 * 21+ requirement is industry standard for research peptide shops.
 */

import { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";

const STORAGE_KEY = "prg-age-verified";
const STORAGE_TIMESTAMP = "prg-age-verified-at";

export function AgeGate() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const verified = localStorage.getItem(STORAGE_KEY);
      const timestamp = localStorage.getItem(STORAGE_TIMESTAMP);
      // Re-verify after 30 days
      if (verified === "true" && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age < 30 * 24 * 60 * 60 * 1000) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setShow(false);
          return;
        }
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      localStorage.setItem(STORAGE_TIMESTAMP, String(Date.now()));
    } catch {
      // localStorage may be blocked
    }
    setShow(false);
  };

  const handleReject = () => {
    window.location.href = "https://www.google.com";
  };

  // Don't render anything during SSR to avoid hydration mismatch
  if (!mounted || !show) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#0f172a]/95 backdrop-blur-sm">
      <div className="bg-white rounded-[var(--prg-radius-lg)] max-w-md w-full p-6 md:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(30,58,95,0.08)] flex items-center justify-center">
            <ShieldCheck size={32} className="text-[var(--prg-accent)]" />
          </div>
          <h1
            className="text-[24px] font-bold uppercase tracking-[2px] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Age Verification
          </h1>
          <p className="text-sm text-[var(--prg-text-secondary)] leading-[1.6] mb-4">
            You must be <strong>21 years of age or older</strong> to access this website.
            All products are sold for laboratory research use only — not for human consumption,
            diagnostic, or therapeutic use.
          </p>
        </div>

        <div className="bg-[var(--prg-bg-alt)] border-l-4 border-[var(--prg-warning)] rounded-r-[4px] p-3 mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-[var(--prg-warning)] shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--prg-text-secondary)] leading-[1.5]">
              Products have not been evaluated by the FDA. They are not intended to diagnose,
              treat, cure, or prevent any disease. By entering, you agree to our{" "}
              <a href="/terms" className="text-[var(--prg-accent)] underline">Terms</a> and{" "}
              <a href="/privacy" className="text-[var(--prg-accent)] underline">Privacy Policy</a>.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleAccept}
            className="w-full py-3.5 bg-[var(--prg-accent)] text-white text-[13px] font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)] transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            I am 21 or older — Enter
          </button>
          <button
            onClick={handleReject}
            className="w-full py-3 border border-[var(--prg-border)] text-[var(--prg-text-muted)] text-[13px] font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-bg-alt)] transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            I am under 21 — Leave
          </button>
        </div>
      </div>
    </div>
  );
}
