import Link from "next/link";
import { FlaskConical, ShieldCheck, Beaker, FileCheck, Truck, Award } from "lucide-react";

export const metadata = {
  title: "About Phased Research Group",
  description: "Learn about our commitment to research-grade peptide synthesis and quality verification.",
};

export default function AboutPage() {
  return (
    <>
      <section className="py-14 border-b border-[var(--prg-border)] prg-page-hero-gradient">
        <div className="prg-container max-w-[800px]">
          <span className="prg-eyebrow">Our Story</span>
          <h1 className="text-[clamp(32px,4vw,42px)] font-bold uppercase tracking-[2px] mb-3 mt-2" style={{ fontFamily: "var(--font-display)" }}>
            About Phased Research Group
          </h1>
          <p className="text-[17px] text-[var(--prg-text-secondary)] leading-[1.7] max-w-[600px]">
            A research chemical supplier dedicated to precision synthesis, rigorous testing, and
            transparent documentation for the scientific community.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="prg-container max-w-[1000px] grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div>
            <span className="prg-eyebrow">Mission</span>
            <h2 className="text-[28px] font-bold uppercase tracking-[1.5px] mt-2 mb-5" style={{ fontFamily: "var(--font-display)" }}>
              Precision at Every Phase
            </h2>
            <p className="text-[16px] text-[var(--prg-text-secondary)] leading-[1.75] mb-4">
              Phased Research Group was founded on a simple principle: research materials should meet
              the highest standards of purity and consistency. Every peptide we supply undergoes
              multi-stage quality verification using industry-standard analytical methods including
              HPLC and mass spectrometry.
            </p>
            <p className="text-[16px] text-[var(--prg-text-secondary)] leading-[1.75]">
              Our phased production approach means each batch is tracked from synthesis through
              purification, testing, and final packaging — with full documentation available for
              every lot. This isn&apos;t just a marketing claim; it&apos;s a verifiable commitment
              backed by Certificates of Analysis.
            </p>
          </div>
          <div
            className="rounded-[var(--prg-radius-lg)] aspect-[4/3] flex items-center justify-center text-white/30 text-[48px] font-bold tracking-[4px]"
            style={{
              background: "linear-gradient(135deg, var(--prg-accent) 0%, var(--prg-teal) 100%)",
              fontFamily: "var(--font-display)",
            }}
          >
            PRG
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[var(--prg-bg-alt)] border-y border-[var(--prg-border)]">
        <div className="prg-container">
          <div className="text-center mb-12">
            <span className="prg-badge prg-badge--teal">Our Values</span>
            <h2 className="text-[32px] font-bold uppercase tracking-[3px] mt-3.5 mb-3" style={{ fontFamily: "var(--font-display)" }}>
              What Sets Us Apart
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Verified Purity", desc: "Every batch meets 99%+ purity verified by independent HPLC analysis. We don't ship without documentation." },
              { icon: Beaker, title: "Research-Grade", desc: "Synthesized in controlled environments using established protocols. No shortcuts in production." },
              { icon: FileCheck, title: "Full Documentation", desc: "Certificates of Analysis available for every product lot. Traceability from synthesis to delivery." },
              { icon: Truck, title: "Reliable Shipping", desc: "Discreet, tracked shipping on every order. Carefully packaged to maintain product integrity." },
              { icon: Award, title: "Consistent Quality", desc: "Standardized production processes ensure batch-to-batch consistency you can rely on." },
              { icon: FlaskConical, title: "Scientific Integrity", desc: "We supply research materials exclusively to qualified personnel for lawful laboratory use." },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-8 prg-card-hover">
                  <div className="w-14 h-14 rounded-[var(--prg-radius)] bg-[rgba(30,58,95,0.06)] flex items-center justify-center text-[var(--prg-accent)] mb-4">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-[15px] font-semibold uppercase tracking-[1px] mb-2.5" style={{ fontFamily: "var(--font-display)" }}>
                    {v.title}
                  </h3>
                  <p className="text-sm text-[var(--prg-text-secondary)] leading-[1.7]">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-20 bg-[#0f172a]">
        <div className="prg-container max-w-[800px]">
          <div className="p-10 rounded-[var(--prg-radius-lg)] border border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-3 mb-5 text-white">
              <ShieldCheck size={22} />
              <h2 className="text-[18px] uppercase tracking-[2px]" style={{ fontFamily: "var(--font-display)" }}>
                Legal & Compliance Notice
              </h2>
            </div>
            <ul className="space-y-3 mb-5">
              {[
                "Phased Research Group is a research chemical supplier, not a compounding pharmacy or chemical compounding facility under 503A of the FD&C Act.",
                "We are not an outsourcing facility as defined under 503B.",
                "All products are sold for laboratory research use only — not for human consumption, diagnostic, or therapeutic use.",
                "Purchasers must be 21+ and qualified research personnel responsible for lawful handling.",
                "Products are not evaluated by the FDA and are not medications.",
              ].map((item, i) => (
                <li key={i} className="pl-4 relative text-white/75 text-sm leading-[1.7]">
                  <span className="absolute left-0 text-[var(--prg-teal)]">•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[13px] text-white/55 leading-[1.7]">
              For full terms, please review our{" "}
              <Link href="/about#terms" className="text-[var(--prg-teal)] underline">Terms of Service</Link>,{" "}
              <Link href="/about#privacy" className="text-[var(--prg-teal)] underline">Privacy Policy</Link>,{" "}
              <Link href="/about#shipping" className="text-[var(--prg-teal)] underline">Shipping Policy</Link>, and{" "}
              <Link href="/about#refund" className="text-[var(--prg-teal)] underline">Refund Policy</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
