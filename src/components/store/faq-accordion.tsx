"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQ {
  q: string;
  a: string;
}

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={`bg-white border rounded-[var(--prg-radius-lg)] overflow-hidden transition-all ${
              isOpen ? "border-[var(--prg-accent)]" : "border-[var(--prg-border)]"
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-[var(--prg-bg-alt)]"
            >
              <span className="text-[15px] font-medium">{faq.q}</span>
              <ChevronDown
                size={20}
                className={`text-[var(--prg-text-muted)] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className="overflow-hidden transition-all"
              style={{ maxHeight: isOpen ? "400px" : "0" }}
            >
              <p className="px-6 pb-5 text-sm text-[var(--prg-text-secondary)] leading-[1.8]">
                {faq.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
