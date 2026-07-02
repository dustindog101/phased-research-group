import Link from "next/link";

export function Footer() {
  return (
    <footer className="prg-footer-dark mt-auto">
      <div className="prg-container py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 lg:gap-10 pb-10 lg:pb-12">
          <div className="sm:col-span-2 lg:col-span-1">
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
            <p className="text-[13px] leading-[1.7] text-white/65 mb-4">
              Phased Research Group is a research chemical supplier and is not a compounding pharmacy
              or chemical compounding facility as defined under 503A of the Federal Food, Drug, and
              Cosmetic Act. We are not an outsourcing facility as defined under 503B.
            </p>
            <p className="text-[11px] text-white/40 leading-[1.6]">
              All products are for laboratory research use only. Not for human consumption, diagnostic,
              or therapeutic use. Not evaluated by the FDA.
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
              <li><Link href="/track" className="hover:text-white">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[2px] text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Policies
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/shipping" className="hover:text-white">Shipping Policy</Link></li>
              <li><Link href="/refund" className="hover:text-white">Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[2px] text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Contact
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li><a href="mailto:support@phasedresearchgroup.com" className="hover:text-white break-all">support@phasedresearchgroup.com</a></li>
              <li className="text-white/55">Mon–Fri, 9am–5pm CST</li>
              <li className="pt-2">
                <span className="inline-block px-2 py-1 bg-white/10 rounded text-[10px] uppercase tracking-[1px] text-white/70">
                  Crypto Accepted
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-[12px]">
          <p className="text-white/55 text-center md:text-left">
            &copy; {new Date().getFullYear()} Phased Research Group. All rights reserved.
          </p>
          <p className="text-white/55 text-center md:text-right max-w-md">
            For research use only. Not for human consumption. 21+ required. Customers responsible for lawful handling.
          </p>
        </div>
      </div>
    </footer>
  );
}
