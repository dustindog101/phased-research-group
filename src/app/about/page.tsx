import Link from "next/link";
import { FlaskConical, ShieldCheck, Beaker, FileCheck, Truck, Award } from "lucide-react";

export const metadata = {
  title: "About Phased Research Group",
  description: "Why we started PRG and what we do differently.",
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
            We sell research peptides. We test every lot. We publish the COA before you buy.
            That shouldn&apos;t be unusual, but here we are.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="prg-container max-w-[800px]">
          <span className="prg-eyebrow">Why We Started</span>
          <h2 className="text-[28px] font-bold uppercase tracking-[1.5px] mt-2 mb-5" style={{ fontFamily: "var(--font-display)" }}>
            The Problem We Saw
          </h2>
          <div className="text-[16px] text-[var(--prg-text-secondary)] leading-[1.75] space-y-4">
            <p>
              The peptide supply chain is a mess. Most &ldquo;vendors&rdquo; are resellers who bought from
              someone who bought from someone who bought from a lab in China. By the time the vial
              reaches you, nobody can tell you which batch it came from, when it was tested, or whether
              the purity number on the label came from an actual lab or a marketing department.
            </p>
            <p>
              We watched vendors post COAs with no lot numbers. We watched them say &ldquo;available upon
              request&rdquo; and then ghost the customer. We watched them test one vial from a batch of
              a thousand and call the whole batch &ldquo;verified.&rdquo;
            </p>
            <p>
              So we built PRG to do it the boring, correct way. Every lot gets tested by a lab that
              isn&apos;t us. The COA goes on the product page. The lot number on your vial matches the
              lot number on the document. If we can&apos;t prove it, we don&apos;t ship it.
            </p>
          </div>
        </div>
      </section>

      {/* What we do differently */}
      <section className="py-20 bg-[var(--prg-bg-alt)] border-y border-[var(--prg-border)]">
        <div className="prg-container">
          <div className="text-center mb-12">
            <span className="prg-badge prg-badge--teal">What We Do Differently</span>
            <h2 className="text-[32px] font-bold uppercase tracking-[3px] mt-3.5 mb-3" style={{ fontFamily: "var(--font-display)" }}>
              No Weasel Words
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "We Name the Lab", desc: "The lab that tests our peptides is independent and contactable. Not 'in-house.' Not 'a partner lab.' A real lab with a real name you can look up." },
              { icon: Beaker, title: "Every Lot, Not Samples", desc: "We test the actual lot your vial came from. Not a 'representative sample.' Not a single unit from a batch of a thousand. The lot." },
              { icon: FileCheck, title: "COA Before You Buy", desc: "The COA is on the product page. No email back-and-forth. No 'available upon request.' You see the purity and lot number before you pay." },
              { icon: Truck, title: "Same Day Shipping", desc: "Order before 2PM CST, it ships today. Tracking emailed same day. No '3-5 business day processing' games." },
              { icon: Award, title: "Lot Numbers Match", desc: "The lot number printed on your vial matches the lot number on the COA. Every time. If it doesn't, something is wrong." },
              { icon: FlaskConical, title: "Lyophilized Powder", desc: "Ships as freeze-dried powder, not pre-dissolved solution. Pre-dissolved has hydrolysis and oxidation risk. We don't do that." },
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
                Legal &amp; Compliance
              </h2>
            </div>
            <ul className="space-y-3 mb-5">
              {[
                "Phased Research Group is a chemical supplier, not a compounding pharmacy under 503A of the FD&C Act.",
                "We are not an outsourcing facility under 503B.",
                "All products are for laboratory research use only. Not for human consumption, diagnostic, or therapeutic use.",
                "Purchasers must be 21+ and qualified research personnel.",
                "Products are not evaluated by the FDA and are not medications.",
              ].map((item, i) => (
                <li key={i} className="pl-4 relative text-white/75 text-sm leading-[1.7]">
                  <span className="absolute left-0 text-[var(--prg-teal)]">•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[13px] text-white/55 leading-[1.7]">
              Full details in our{" "}
              <Link href="/terms" className="text-[var(--prg-teal)] underline">Terms of Service</Link>,{" "}
              <Link href="/privacy" className="text-[var(--prg-teal)] underline">Privacy Policy</Link>,{" "}
              <Link href="/shipping" className="text-[var(--prg-teal)] underline">Shipping Policy</Link>, and{" "}
              <Link href="/refund" className="text-[var(--prg-teal)] underline">Refund Policy</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
