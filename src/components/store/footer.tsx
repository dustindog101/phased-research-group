import Link from "next/link";

export function Footer() {
  return (
    <footer className="prg-footer-dark mt-auto">
      <div className="prg-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 pb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white font-bold text-base"
                style={{
                  background: "linear-gradient(135deg, var(--prg-accent) 0%, var(--prg-teal) 100%)",
                  fontFamily: "var(--font-display)",
                }}
              >
                PR
              </div>
              <div>
                <div
                  className="text-[18px] font-semibold uppercase tracking-[2px] text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Phased Research
                </div>
                <div className="text-[10px] tracking-[3px] text-white/50">Group</div>
              </div>
            </div>
            <p className="text-[13px] leading-[1.7] text-white/65">
              Phased Research Group is a research chemical supplier and is not a compounding pharmacy
              or chemical compounding facility as defined under 503A of the Federal Food, Drug, and
              Cosmetic Act. We are not an outsourcing facility as defined under 503B.
            </p>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[2px] text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li><Link href="/shop" className="hover:text-white">Research Products</Link></li>
              <li><Link href="/coa" className="hover:text-white">COAs</Link></li>
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[2px] text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Policies
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li><Link href="/about#terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/about#privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/about#shipping" className="hover:text-white">Shipping Policy</Link></li>
              <li><Link href="/about#refund" className="hover:text-white">Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[2px] text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Contact
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li><a href="mailto:support@phasedresearchgroup.com" className="hover:text-white">support@phasedresearchgroup.com</a></li>
              <li className="text-white/55">Mon–Fri, 9am–5pm CST</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-[12px]">
          <p className="text-white/55">
            &copy; {new Date().getFullYear()} Phased Research Group. All rights reserved.
          </p>
          <p className="text-white/55 text-center md:text-right">
            All products are for research use only. Not for human consumption, diagnostic, or therapeutic use.
          </p>
        </div>
      </div>
    </footer>
  );
}
