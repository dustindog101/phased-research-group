import Link from "next/link";
import { ShieldCheck, CheckCircle2, Truck, Lock, AlertTriangle, FlaskConical } from "lucide-react";
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
        <div className="prg-container relative z-10 py-20 px-6 max-w-[1000px] mx-auto">
          <h1
            className="text-center mb-4 text-[clamp(32px,5vw,52px)] font-bold uppercase tracking-[3px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Phased Research Group
          </h1>
          <p className="text-center text-[17px] text-white/80 max-w-[640px] mx-auto mb-12 leading-[1.7]">
            Precision synthesis. Verified purity.{" "}
            <em className="not-italic text-[var(--prg-teal)] font-medium">Scientific integrity</em>{" "}
            at every phase of production.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              {
                title: "Exceptional Purity",
                desc: (
                  <>
                    Every batch meets a <strong className="text-white">99%+ purity threshold</strong>{" "}
                    verified by independent analytical testing.
                  </>
                ),
              },
              {
                title: "Rigorous Standards",
                desc: (
                  <>
                    Third-party labs verify identity and purity using HPLC and mass spectrometry for{" "}
                    <strong className="text-white">reliable documentation</strong>.
                  </>
                ),
              },
              {
                title: "Transparent Sourcing",
                desc: (
                  <>
                    From synthesis to delivery, our process prioritizes{" "}
                    <strong className="text-white">precision and transparency</strong> at every stage.
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
              Important Notice
            </h2>
          </div>
          <ul className="text-sm text-white/75 leading-[1.8] space-y-1.5">
            <li className="pl-4 relative">
              <span className="absolute left-0 text-[var(--prg-teal)]">•</span>
              Users must be <strong className="text-white">21 years of age or older</strong>.
            </li>
            <li className="pl-4 relative">
              <span className="absolute left-0 text-[var(--prg-teal)]">•</span>
              All products are sold <strong className="text-white">for laboratory research use only</strong>.
            </li>
            <li className="pl-4 relative">
              <span className="absolute left-0 text-[var(--prg-teal)]">•</span>
              Products are not medications and are not evaluated by the FDA.
            </li>
            <li className="pl-4 relative">
              <span className="absolute left-0 text-[var(--prg-teal)]">•</span>
              Customers are responsible for lawful handling and compliance with regulations.
            </li>
          </ul>
          <p className="mt-4 text-[13px] text-white/60">
            Please review our{" "}
            <Link href="/about#terms" className="text-[var(--prg-teal)] underline">
              Terms of Service
            </Link>{" "}
            for full conditions.
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
              Frequently selected research peptides
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
                <span>Quality verified on every lot</span>
              </div>
            </div>
            <div className="prg-trust-item">
              <CheckCircle2 size={26} />
              <div>
                <strong>99%+ Purity</strong>
                <span>HPLC verified threshold</span>
              </div>
            </div>
            <div className="prg-trust-item">
              <Truck size={26} />
              <div>
                <strong>Discreet US Shipping</strong>
                <span>Tracking on every order</span>
              </div>
            </div>
            <div className="prg-trust-item">
              <Lock size={26} />
              <div>
                <strong>Secure Checkout</strong>
                <span>Encrypted payments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
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
              Find peptides organized by their primary research application
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
    </>
  );
}
