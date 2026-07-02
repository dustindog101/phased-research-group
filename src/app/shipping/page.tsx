import { Metadata } from "next";
import { Truck, Package, Clock, MapPin, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Shipping information for Phased Research Group orders.",
};

export default function ShippingPage() {
  return (
    <article className="py-12">
      <div className="prg-container max-w-[800px]">
        <span className="prg-eyebrow">Legal</span>
        <h1 className="text-[clamp(28px,4vw,36px)] font-bold uppercase tracking-[2px] mb-2 mt-1" style={{ fontFamily: "var(--font-display)" }}>
          Shipping Policy
        </h1>
        <p className="text-sm text-[var(--prg-text-muted)] mb-10">Last updated: January 2025</p>

        <div className="space-y-8 text-[var(--prg-text-secondary)] leading-[1.8]">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5">
              <Truck size={24} className="text-[var(--prg-accent)] mb-3" />
              <h3 className="text-sm font-semibold uppercase tracking-[1px] mb-1" style={{ fontFamily: "var(--font-display)" }}>Carriers</h3>
              <p className="text-sm">UPS &amp; USPS for all domestic shipments</p>
            </div>
            <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5">
              <Clock size={24} className="text-[var(--prg-accent)] mb-3" />
              <h3 className="text-sm font-semibold uppercase tracking-[1px] mb-1" style={{ fontFamily: "var(--font-display)" }}>Processing Time</h3>
              <p className="text-sm">1-2 business days after payment confirmation</p>
            </div>
            <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5">
              <Package size={24} className="text-[var(--prg-accent)] mb-3" />
              <h3 className="text-sm font-semibold uppercase tracking-[1px] mb-1" style={{ fontFamily: "var(--font-display)" }}>Discreet Packaging</h3>
              <p className="text-sm">All orders ship in plain, unmarked packaging</p>
            </div>
            <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5">
              <MapPin size={24} className="text-[var(--prg-accent)] mb-3" />
              <h3 className="text-sm font-semibold uppercase tracking-[1px] mb-1" style={{ fontFamily: "var(--font-display)" }}>Free Shipping</h3>
              <p className="text-sm">Free ground shipping on orders over $175</p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Shipping Methods &amp; Rates
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[var(--prg-border)] rounded-[var(--prg-radius)] overflow-hidden">
                <thead className="bg-[var(--prg-bg-alt)]">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Method</th>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Delivery Time</th>
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-[1px] text-[var(--prg-text-muted)]">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[var(--prg-border)]">
                    <td className="py-3 px-4 font-medium">UPS/USPS Ground</td>
                    <td className="py-3 px-4">3-5 business days</td>
                    <td className="py-3 px-4 text-right">$10.75 <span className="text-[var(--prg-text-muted)] text-xs">(free over $175)</span></td>
                  </tr>
                  <tr className="border-t border-[var(--prg-border)]">
                    <td className="py-3 px-4 font-medium">Express (2-Day)</td>
                    <td className="py-3 px-4">2 business days</td>
                    <td className="py-3 px-4 text-right">$22.95 <span className="text-[var(--prg-text-muted)] text-xs">(free over $175)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              States We Ship To
            </h2>
            <p className="mb-4">
              Due to varying state regulations on research chemicals, we currently ship to the following
              states only:
            </p>
            <div className="bg-[var(--prg-bg-alt)] rounded-[var(--prg-radius)] p-4 mb-4">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm font-medium">
                {["TX", "CA", "FL", "NY", "AZ", "CO", "GA", "IL", "NC", "OH", "PA", "WA"].map((s) => (
                  <div key={s} className="text-center py-1 bg-white rounded">{s}</div>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[rgba(217,119,6,0.05)] border border-[rgba(217,119,6,0.2)] rounded-[var(--prg-radius)]">
              <AlertCircle size={18} className="text-[var(--prg-warning)] shrink-0 mt-0.5" />
              <p className="text-sm">
                <strong className="text-[var(--prg-warning)]">State Restrictions:</strong> We do not ship to
                states that classify certain peptides as controlled substances or require specific licensing
                (e.g., California AB 1887, Florida MT2/PT-141 restrictions, Ohio license requirements). This
                list may change as regulations evolve. If your state is not listed, we cannot ship to your
                location at this time.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Order Processing
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Orders are processed Monday–Friday, 9 AM – 5 PM CST (excluding holidays)</li>
              <li>Payment must be confirmed on the blockchain before order processing begins</li>
              <li>Crypto payments typically confirm within 10-30 minutes depending on the asset</li>
              <li>Orders placed after 2 PM CST Friday or on weekends ship the following Monday</li>
              <li>You will receive a tracking number via email once your order ships</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Packaging &amp; Handling
            </h2>
            <p className="mb-3">
              All orders are packaged in discreet, unmarked boxes to protect your privacy. Products are
              sealed in temperature-appropriate packaging with desiccants to maintain stability during
              transit. Each shipment includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Product vials in sealed, labeled containers</li>
              <li>Certificate of Analysis (COA) for each lot (when available)</li>
              <li>Packing slip with order number (no prices on external label)</li>
              <li>Storage and handling instructions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Tracking &amp; Delivery
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tracking numbers are emailed once your order ships</li>
              <li>You can also view tracking in your account under Order History</li>
              <li>Signatures are not required for ground shipping</li>
              <li>PRG is not responsible for packages lost or stolen after delivery confirmation</li>
              <li>If a package is returned to sender due to incorrect address, a re-shipping fee applies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              International Shipping
            </h2>
            <p>
              We do <strong>not ship internationally</strong> at this time. All orders must ship to a US
              address in an approved state. We do not ship to PO boxes for Express shipping (physical
              address required).
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Shipping Issues
            </h2>
            <p>
              If your package is delayed, lost, or damaged, contact us at{" "}
              <a href="mailto:support@phasedresearchgroup.com" className="text-[var(--prg-accent)] underline">support@phasedresearchgroup.com</a>{" "}
              within 48 hours of the expected delivery date. Include your order number and tracking
              information. We will work with the carrier to resolve the issue.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
