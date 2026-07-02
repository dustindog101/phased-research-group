import { Metadata } from "next";
import { AlertCircle, RotateCcw, ShieldCheck, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Refund and return policy for Phased Research Group.",
};

export default function RefundPage() {
  return (
    <article className="py-12">
      <div className="prg-container max-w-[800px]">
        <span className="prg-eyebrow">Legal</span>
        <h1 className="text-[clamp(28px,4vw,36px)] font-bold uppercase tracking-[2px] mb-2 mt-1" style={{ fontFamily: "var(--font-display)" }}>
          Refund Policy
        </h1>
        <p className="text-sm text-[var(--prg-text-muted)] mb-10">Last updated: January 2025</p>

        <div className="space-y-8 text-[var(--prg-text-secondary)] leading-[1.8]">
          <div className="flex items-start gap-3 p-4 bg-[rgba(220,38,38,0.05)] border border-[rgba(220,38,38,0.2)] rounded-[var(--prg-radius)]">
            <AlertCircle size={20} className="text-[var(--prg-danger)] shrink-0 mt-0.5" />
            <p className="text-sm">
              <strong className="text-[var(--prg-danger)]">Important:</strong> Due to the nature of research
              chemicals, our refund policy is limited. Please read carefully before purchasing.
            </p>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 text-center">
              <RotateCcw size={28} className="text-[var(--prg-accent)] mx-auto mb-3" />
              <h3 className="text-sm font-semibold uppercase tracking-[1px] mb-1" style={{ fontFamily: "var(--font-display)" }}>14 Days</h3>
              <p className="text-xs text-[var(--prg-text-muted)]">Return window for unopened items</p>
            </div>
            <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 text-center">
              <Clock size={28} className="text-[var(--prg-accent)] mx-auto mb-3" />
              <h3 className="text-sm font-semibold uppercase tracking-[1px] mb-1" style={{ fontFamily: "var(--font-display)" }}>48 Hours</h3>
              <p className="text-xs text-[var(--prg-text-muted)]">Report damaged/incorrect items</p>
            </div>
            <div className="bg-white border border-[var(--prg-border)] rounded-[var(--prg-radius-lg)] p-5 text-center">
              <ShieldCheck size={28} className="text-[var(--prg-accent)] mx-auto mb-3" />
              <h3 className="text-sm font-semibold uppercase tracking-[1px] mb-1" style={{ fontFamily: "var(--font-display)" }}>COA Verified</h3>
              <p className="text-xs text-[var(--prg-text-muted)]">All products third-party tested</p>
            </div>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              1. Unopened Product Returns
            </h2>
            <p className="mb-3">
              Unopened products in their original, sealed packaging may be returned within{" "}
              <strong>14 days</strong> of delivery for a full refund of the product price (shipping costs are
              non-refundable). To be eligible:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Product must be unused and in original packaging</li>
              <li>Seal must not be broken or tampered with</li>
              <li>Product must be in resalable condition</li>
              <li>Return authorization (RMA) must be requested before shipping</li>
            </ul>
            <p className="mt-3">
              To request a return, email{" "}
              <a href="mailto:support@phasedresearchgroup.com" className="text-[var(--prg-accent)] underline">support@phasedresearchgroup.com</a>{" "}
              with your order number and reason for return.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              2. Opened or Reconstituted Products
            </h2>
            <p>
              <strong>Opened, reconstituted, or partially used products cannot be returned</strong> for safety
              and quality reasons. This is industry standard for research chemicals. Once a product seal is
              broken, we cannot verify handling conditions and cannot resell the product.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              3. Damaged or Incorrect Items
            </h2>
            <p className="mb-3">
              If you receive a damaged, defective, or incorrect item, contact us within{" "}
              <strong>48 hours of delivery</strong> with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your order number</li>
              <li>Photos of the damaged/incorrect item and packaging</li>
              <li>A brief description of the issue</li>
            </ul>
            <p className="mt-3">
              We will arrange a replacement or full refund at our discretion. Do not return damaged items
              without authorization — we may ask you to dispose of them safely.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              4. Cryptocurrency Refunds
            </h2>
            <p className="mb-3">
              If a refund is approved, it will be issued in USD at the original order amount. However,
              because we process payments in cryptocurrency:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refunds are issued in the same cryptocurrency used for payment</li>
              <li>The USD amount is converted to crypto at the current exchange rate at time of refund</li>
              <li>We are not responsible for crypto price fluctuations between purchase and refund</li>
              <li>Refunds are sent to the original sending wallet address (verify before receiving)</li>
              <li>Refund processing time: 3-5 business days after approval</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              5. Non-Refundable Items
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Opened or reconstituted products</li>
              <li>Products returned without RMA authorization</li>
              <li>Products returned after the 14-day window</li>
              <li>Shipping costs (original and return)</li>
              <li>Orders cancelled after payment confirmation and before shipping (subject to 15% restocking fee)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              6. Order Cancellation
            </h2>
            <p className="mb-3">
              Orders can be cancelled before payment is confirmed on the blockchain at no charge. Once
              payment is confirmed:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Before shipping:</strong> Full refund minus 15% restocking fee</li>
              <li><strong>After shipping:</strong> Cannot be cancelled — must follow the return process above</li>
            </ul>
            <p className="mt-3">
              To cancel an order, email us immediately with your order number. Crypto payments that have
              already been broadcast cannot be reversed on the blockchain.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              7. Quality Concerns
            </h2>
            <p className="mb-3">
              Every product batch is third-party tested with HPLC and mass spectrometry. If you have a
              quality concern:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact us with your order number and lot number (on the vial label)</li>
              <li>We will provide the COA for that specific lot</li>
              <li>Independent re-testing is at the customer&apos;s expense</li>
              <li>If our COA is inaccurate, we will issue a full refund or replacement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              8. How to Request a Refund
            </h2>
            <p className="mb-3">Email{" "}
              <a href="mailto:support@phasedresearchgroup.com" className="text-[var(--prg-accent)] underline">support@phasedresearchgroup.com</a>{" "}
              with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subject line: &ldquo;Refund Request — [Order Number]&rdquo;</li>
              <li>Order number (found in your order confirmation email or account)</li>
              <li>Reason for refund</li>
              <li>Photos (if applicable — damaged/incorrect items)</li>
              <li>Your preferred refund method (same crypto wallet as original payment)</li>
            </ul>
            <p className="mt-3">
              We respond to refund requests within 1-2 business days.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
