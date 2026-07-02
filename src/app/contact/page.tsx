"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, Clock, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate send (no backend email yet — would use Resend)
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
    toast.success("Message sent! We'll respond within 1 business day.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <>
      <section className="py-14 border-b border-[var(--prg-border)] prg-page-hero-gradient">
        <div className="prg-container max-w-[800px]">
          <span className="prg-eyebrow">Get in Touch</span>
          <h1 className="text-[clamp(32px,4vw,42px)] font-bold uppercase tracking-[2px] mb-3 mt-2" style={{ fontFamily: "var(--font-display)" }}>
            Contact Us
          </h1>
          <p className="text-[17px] text-[var(--prg-text-secondary)] leading-[1.7] max-w-[600px]">
            Questions about an order, product, or COA? We&apos;re here to help.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="prg-container max-w-[1000px] grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <h2 className="text-[22px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Send a Message
            </h2>
            <p className="text-sm text-[var(--prg-text-muted)] mb-6">
              We typically respond within one business day.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Subject *</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3.5 py-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5">Message *</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3.5 py-3 border border-[var(--prg-border)] rounded-[var(--prg-radius)] text-sm focus:outline-none focus:border-[var(--prg-accent)]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--prg-accent)] text-white text-[13px] font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)] disabled:opacity-50"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : sent ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Send size={16} />
                )}
                {loading ? "Sending..." : sent ? "Sent!" : "Send Message"}
              </button>
            </form>
          </div>

          {/* Contact info */}
          <div>
            <h2 className="text-[22px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Contact Information
            </h2>
            <p className="text-sm text-[var(--prg-text-muted)] mb-6">
              Direct channels for order inquiries and support.
            </p>

            <div className="space-y-3">
              <div className="flex gap-4 p-5 border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] prg-card-hover">
                <Mail size={22} className="text-[var(--prg-accent)] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-[1.5px] text-[var(--prg-text-muted)] mb-1">
                    Email Support
                  </span>
                  <a href="mailto:support@phasedresearchgroup.com" className="text-sm font-medium hover:text-[var(--prg-accent)]">
                    support@phasedresearchgroup.com
                  </a>
                  <p className="text-xs text-[var(--prg-text-muted)] mt-1">
                    For order questions, include your order number
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-5 border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] prg-card-hover">
                <Clock size={22} className="text-[var(--prg-accent)] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-[1.5px] text-[var(--prg-text-muted)] mb-1">
                    Business Hours
                  </span>
                  <p className="text-sm font-medium">Monday – Friday</p>
                  <p className="text-sm text-[var(--prg-text-muted)]">9:00 AM – 5:00 PM CST</p>
                  <p className="text-xs text-[var(--prg-text-muted)] mt-1">
                    Closed weekends and US holidays
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-5 border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] prg-card-hover">
                <MapPin size={22} className="text-[var(--prg-accent)] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-[1.5px] text-[var(--prg-text-muted)] mb-1">
                    Shipping
                  </span>
                  <p className="text-sm font-medium">Select US States</p>
                  <p className="text-xs text-[var(--prg-text-muted)] mt-1">
                    See checkout for available states
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-5 bg-[var(--prg-bg-alt)] rounded-[var(--prg-radius-lg)]">
              <h4 className="text-[13px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Response Times
              </h4>
              <ul className="text-xs text-[var(--prg-text-secondary)] space-y-1">
                <li>• Order inquiries: within 4 hours during business hours</li>
                <li>• Product questions: within 1 business day</li>
                <li>• COA requests: within 1 business day</li>
                <li>• Payment issues: priority handling</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
