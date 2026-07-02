import Link from "next/link";
import { ShieldCheck, CheckCircle2, Truck, Lock, AlertTriangle, FlaskConical, FileText } from "lucide-react";
import { getFeaturedProducts } from "@/lib/products";
import { ProductCard } from "@/components/store/product-card";
import { VialSVG } from "@/components/store/VialSVG";
import { CATEGORIES } from "@/lib/constants";

export default async function HomePage() {
  const featured = await getFeaturedProducts(8);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden text-white" style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e3a5f 45%, #1e40af 100%)" }}>
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />
        <div className="prg-container relative z-10 py-16 md:py-20 px-6 max-w-[1000px] mx-auto">
          <h1
            className="text-center mb-4 text-[clamp(32px,5vw,52px)] font-bold uppercase tracking-[3px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Phased Research Group
          </h1>
          <p className="text-center text-[17px] text-white/80 max-w-[600px] mx-auto mb-12 leading-[1.7]">
            Research peptides with lot-specific COAs. Every batch tested by an independent lab.
            No &ldquo;available upon request&rdquo; games.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              {
                title: "99%+ Purity, Verified",
                desc: (
                  <>
                    Every lot is HPLC and mass-spec tested by a third-party lab. The COA goes up{" "}
                    <strong className="text-white">before the vial ships</strong>, with a lot number
                    that matches what&apos;s on the label.
                  </>
                ),
              },
              {
                title: "No Grading Our Own Homework",
                desc: (
                  <>
                    We don&apos;t test in-house and call it third-party. The lab that tests our
                    peptides is <strong className="text-white">independent and contactable</strong>.
                    You can verify the batch ID yourself.
                  </>
                ),
              },
              {
                title: "Ships Same Day If You Order Before 2PM",
                desc: (
                  <>
                    Order before 2PM CST, it goes out today. Tracking emailed same day. No{" "}
                    <strong className="text-white">&ldquo;3-5 business day processing&rdquo;</strong>{" "}
                    nonsense.
                  </>
                ),
              },
            ].map((p) => (
              <div
                key={p.title}
                className="bg-white/[0.06] border border-white/10 rounded-[var(--prg-radius-lg)] p-7 transition-all hover:bg-white/[0.1] hover:-translate-y-0.5"
              >
                <h2
                  className="text-[15px] font-semibold uppercase tracking-[1.5px] mb-2.5 text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p.title}
                </h2>
                <p className="text-sm text-white/75 leading-[1.65]">{p.desc}</p>
              </div>
            ))}
          </div>

          <hr className="border-white/15 my-8" />

          <div className="flex items-center gap-2 mb-3.5">
            <AlertTriangle size={18} className="text-[var(--prg-warning)]" />
            <h2
              className="text-[16px] font-semibold uppercase tracking-[2px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Before You Buy
            </h2>
          </div>
          <ul className="text-sm text-white/75 leading-[1.8] space-y-1.5">
            <li className="pl-4 relative">
              <span className="absolute left-0 text-[var(--prg-teal)]">•</span>
              You must be <strong className="text-white">21 or older</strong> to buy from us.
            </li>
            <li className="pl-4 relative">
              <span className="absolute left-0 text-[var(--prg-teal)]">•</span>
              These are <strong className="text-white">research chemicals, not supplements</strong>.
              Not for human consumption, period.
            </li>
            <li className="pl-4 relative">
              <span className="absolute left-0 text-[var(--prg-teal)]">•</span>
              We are not a pharmacy or compounding facility under 503A or 503B of the FD&amp;C Act.
            </li>
            <li className="pl-4 relative">
              <span className="absolute left-0 text-[var(--prg-teal)]">•</span>
              You are responsible for handling and storing these properly. That&apos;s on you.
            </li>
          </ul>
          <p className="mt-4 text-[13px] text-white/60">
            Read the full <Link href="/terms" className="text-[var(--prg-teal)] underline">Terms of Service</Link>{" "}
            before ordering.
          </p>
        </div>
      </section>

      {/* Vial showcase */}
      <section className="py-16 bg-[var(--prg-bg-alt)]">
        <div className="prg-container">
          <div className="flex justify-center gap-12 flex-wrap">
            <div className="w-[200px] text-center">
              <div className="flex justify-center mb-3">
                <VialSVG capColor="#0d9488" size={180} />
              </div>
              <span className="text-xs text-[var(--prg-text-muted)] uppercase tracking-[1px]">
                Metabolic Peptides
              </span>
            </div>
            <div className="w-[200px] text-center">
              <div className="flex justify-center mb-3">
                <VialSVG capColor="#2563eb" size={180} />
              </div>
              <span className="text-xs text-[var(--prg-text-muted)] uppercase tracking-[1px]">
                Healing & Recovery
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-20">
        <div className="prg-container">
          <div className="text-center mb-12">
            <span className="prg-badge">Our Catalog</span>
            <h2
              className="text-[32px] font-bold uppercase tracking-[3px] mt-3.5 mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Featured Products
            </h2>
            <p className="text-[var(--prg-text-muted)] text-[15px]">
              Each vial ships with a lot number that matches the COA
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-[var(--prg-border-hover)] text-[var(--prg-text)] text-[13px] font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:border-[var(--prg-accent)] hover:text-[var(--prg-accent)] hover:bg-[rgba(30,58,95,0.02)] transition-all"
              style={{ fontFamily: "var(--font-display)" }}
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Trust row */}
      <section className="prg-section--alt border-t border-[var(--prg-border)]">
        <div className="prg-container">
          <div className="prg-trust-row">
            <div className="prg-trust-item">
              <ShieldCheck size={26} />
              <div>
                <strong>Independently Tested</strong>
                <span>Not by us. By a lab you can call.</span>
              </div>
            </div>
            <div className="prg-trust-item">
              <CheckCircle2 size={26} />
              <div>
                <strong>99%+ Purity</strong>
                <span>HPLC verified, not just a number</span>
              </div>
            </div>
            <div className="prg-trust-item">
              <Truck size={26} />
              <div>
                <strong>Ships From the US</strong>
                <span>Tracking on every order, same day if before 2PM</span>
              </div>
            </div>
            <div className="prg-trust-item">
              <Lock size={26} />
              <div>
                <strong>Crypto Checkout</strong>
                <span>Direct to our wallet, no middleman</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why we exist */}
      <section className="py-20">
        <div className="prg-container max-w-[800px]">
          <div className="text-center mb-10">
            <span className="prg-badge prg-badge--teal">Why We Exist</span>
            <h2
              className="text-[32px] font-bold uppercase tracking-[3px] mt-3.5 mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              The Industry Has a Trust Problem
            </h2>
          </div>
          <div className="prose prose-slate max-w-none text-[var(--prg-text-secondary)] leading-[1.8]">
            <p className="mb-4">
              You already know the deal. Half the peptide vendors online post COAs with no lot number.
              Others say &ldquo;available upon request&rdquo; and never send one. Some ship thousands of vials
              while only testing a single unit from the batch. A few got caught forging lab reports.
            </p>
            <p className="mb-4">
              We started PRG because we were tired of it too. Here&apos;s what we do differently:
            </p>
            <ul className="space-y-2 mb-4">
              <li className="pl-6 relative">
                <span className="absolute left-0 text-[var(--prg-teal)]">•</span>
                Every lot gets tested. Not sampled. Not &ldquo;representative.&rdquo; The actual lot.
              </li>
              <li className="pl-6 relative">
                <span className="absolute left-0 text-[var(--prg-teal)]">•</span>
                The COA is on the product page before you buy. No email back-and-forth.
              </li>
              <li className="pl-6 relative">
                <span className="absolute left-0 text-[var(--prg-teal)]">•</span>
                The lot number on the vial matches the lot number on the COA. Always.
              </li>
              <li className="pl-6 relative">
                <span className="absolute left-0 text-[var(--prg-teal)]">•</span>
                We name the lab that does our testing. You can verify it yourself.
              </li>
            </ul>
            <p>
              This isn&apos;t the industry norm. It&apos;s our minimum standard.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-[var(--prg-bg-alt)]">
        <div className="prg-container">
          <div className="text-center mb-12">
            <span className="prg-badge prg-badge--teal">Browse by Category</span>
            <h2
              className="text-[32px] font-bold uppercase tracking-[3px] mt-3.5 mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Research Categories
            </h2>
            <p className="text-[var(--prg-text-muted)] text-[15px]">
              Organized by primary research application
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className="group bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-6 prg-card-hover flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-[var(--prg-radius)] bg-[rgba(30,58,95,0.06)] flex items-center justify-center text-[var(--prg-accent)]">
                  <FlaskConical size={22} />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-[15px] font-semibold uppercase tracking-[1px] mb-1 group-hover:text-[var(--prg-accent)] transition-colors"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {cat.label}
                  </h3>
                  <p className="text-xs text-[var(--prg-text-muted)]">Browse peptides</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COA callout */}
      <section className="py-20">
        <div className="prg-container max-w-[800px] text-center">
          <FileText size={40} className="mx-auto mb-4 text-[var(--prg-accent)]" />
          <h2
            className="text-[28px] font-bold uppercase tracking-[3px] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Every Vial. Every Lot. Every Time.
          </h2>
          <p className="text-[var(--prg-text-secondary)] text-[15px] leading-[1.8] mb-8">
            We publish the COA for every batch on the product page. The lot number on your vial will
            match the lot number on the document. If it doesn&apos;t, something is wrong and we want
            to know about it.
          </p>
          <Link
            href="/coa"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--prg-accent)] text-white text-[13px] font-medium uppercase tracking-[2px] rounded-[var(--prg-radius)] hover:bg-[var(--prg-accent-hover)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            View COA Library
          </Link>
        </div>
      </section>
    </>
  );
}
