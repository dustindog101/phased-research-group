import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Phased Research Group — research peptide supplier.",
};

const LAST_UPDATED = "January 2025";

export default function TermsPage() {
  return (
    <article className="py-12">
      <div className="prg-container max-w-[800px]">
        <span className="prg-eyebrow">Legal</span>
        <h1 className="text-[clamp(28px,4vw,36px)] font-bold uppercase tracking-[2px] mb-2 mt-1" style={{ fontFamily: "var(--font-display)" }}>
          Terms of Service
        </h1>
        <p className="text-sm text-[var(--prg-text-muted)] mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-slate max-w-none space-y-8 text-[var(--prg-text-secondary)] leading-[1.8]">
          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              1. Acceptance of Terms
            </h2>
            <p className="mb-3">
              Welcome to Phased Research Group (&ldquo;PRG,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
              By accessing or using our website at phasedresearchgroup.com (the &ldquo;Site&rdquo;), purchasing any
              products, or creating an account, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;).
              If you do not agree to these Terms, please do not use our Site or purchase our products.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you and PRG. We may update these
              Terms at any time without prior notice. Continued use of the Site after changes constitutes
              acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              2. Age Requirement
            </h2>
            <p>
              You must be at least <strong>21 years of age</strong> to access this website, create an account,
              or purchase any products from PRG. By using this Site, you represent and warrant that you are
              at least 21 years old and legally permitted to purchase laboratory research materials in your
              jurisdiction. We reserve the right to request proof of age at any time.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              3. Research Use Only — Critical Disclaimer
            </h2>
            <div className="bg-[var(--prg-bg-alt)] border-l-4 border-[var(--prg-accent)] rounded-r-[4px] p-4 mb-4">
              <p className="text-sm font-semibold text-[var(--prg-accent)] mb-2">READ CAREFULLY</p>
              <p className="mb-2">
                All products sold by Phased Research Group are intended <strong>solely for laboratory
                research purposes</strong>. Our products are:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Not intended for human consumption, medical use, diagnostic procedures, or therapeutic purposes</li>
                <li>Not intended for veterinary use</li>
                <li>Not approved by the FDA or any regulatory authority for clinical use</li>
                <li>Not to be used in food, drugs, cosmetics, dietary supplements, or medical devices</li>
                <li>Not designed, manufactured, or supplied for household use</li>
              </ul>
            </div>
            <p className="mb-3">
              Products must be handled only by qualified professionals in controlled laboratory settings.
              Bodily introduction of any kind into humans or animals is strictly forbidden by law.
            </p>
            <p className="mb-3">
              <strong>FDA Disclaimer:</strong> The statements made within this website have not been evaluated
              by the US Food and Drug Administration. The statements and the products of this company are not
              intended to diagnose, treat, cure, or prevent any disease. All products are sold for research,
              laboratory, or analytical purposes only, and are not for human consumption.
            </p>
            <p>
              <strong>Regulatory Status:</strong> Phased Research Group is a chemical supplier. PRG is{" "}
              <strong>not a compounding pharmacy or chemical compounding facility</strong> as defined under
              503A of the Federal Food, Drug, and Cosmetic Act. PRG is <strong>not an outsourcing facility</strong>{" "}
              as defined under 503B of the Federal Food, Drug, and Cosmetic Act.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              4. Customer Responsibilities
            </h2>
            <p className="mb-3">By purchasing from PRG, you acknowledge and agree that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are a qualified research professional or institutional user purchasing for legitimate laboratory research</li>
              <li>You assume full responsibility for the safe handling, storage, and disposal of all products</li>
              <li>Products will only be used in compliance with all applicable federal, state, and local laws</li>
              <li>You will not resell, distribute, or transfer products to unauthorized persons</li>
              <li>You will maintain proper chain-of-custody records as required by applicable regulations</li>
              <li>You understand that misuse of these products may present significant health and safety risks</li>
              <li>You will not use products for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              5. Product Information &amp; Accuracy
            </h2>
            <p className="mb-3">
              We strive to ensure product descriptions, specifications, and other information on this Site are
              accurate. However, we do not warrant that product descriptions or other content is accurate,
              complete, reliable, current, or error-free.
            </p>
            <p className="mb-3">
              All products are tested by third-party laboratories and accompanied by Certificates of Analysis
              (COAs). Purity levels of 99%+ are verified by HPLC and mass spectrometry. However, product
              specifications may vary between lots, and we reserve the right to modify products without notice.
            </p>
            <p>
              Information provided on this website, including product descriptions, is intended for
              informational and research purposes only. Nothing on this site should be interpreted as medical
              advice or as a substitute for consultation with a licensed medical professional.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              6. Pricing &amp; Payment
            </h2>
            <p className="mb-3">
              All prices are listed in US Dollars (USD) and are subject to change without notice. We reserve
              the right to modify or discontinue any product at any time. Payment is required in full at the
              time of purchase.
            </p>
            <p className="mb-3">
              We accept cryptocurrency payments including Bitcoin (BTC), Litecoin (LTC), Solana (SOL), and
              USD Coin (USDC) on Ethereum, Polygon, Base, and Solana networks. All crypto payments are
              processed directly to our self-hosted wallets — no third-party payment processor is involved.
            </p>
            <p>
              Orders are not confirmed until payment is verified on the blockchain. Crypto payment invoices
              expire after 48 hours. If an invoice expires before payment is received, a new invoice must be
              generated.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              7. Shipping &amp; Delivery
            </h2>
            <p className="mb-3">
              We ship to select US states only. See our{" "}
              <Link href="/shipping" className="text-[var(--prg-accent)] underline">Shipping Policy</Link> for
              detailed information about shipping methods, delivery times, and state restrictions. Orders are
              processed within 1-2 business days after payment confirmation.
            </p>
            <p>
              PRG is not responsible for packages lost, stolen, or delayed after tracking shows delivery to
              the address provided at checkout. Risk of loss passes to the customer upon delivery.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              8. Returns &amp; Refunds
            </h2>
            <p className="mb-3">
              Due to the nature of research chemicals, we have a limited return policy. See our{" "}
              <Link href="/refund" className="text-[var(--prg-accent)] underline">Refund Policy</Link> for
              complete details. Unopened products in original packaging may be returned within 14 days for a
              full refund, less shipping costs. Opened or reconstituted products cannot be returned.
            </p>
            <p>
              If you receive a damaged or incorrect item, contact us within 48 hours of delivery with photos
              and your order number.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              9. Limitation of Liability
            </h2>
            <p className="mb-3">PRG shall not be held liable for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Any damages, injuries, or losses arising from the purchase, use, or misuse of our products</li>
              <li>Any consequences of the purchaser&apos;s failure to comply with these Terms and disclaimers</li>
              <li>Any indirect, incidental, special, or consequential damages related to product handling or experimentation</li>
              <li>Any losses resulting from cryptocurrency payment errors, including sending to wrong addresses or insufficient gas fees</li>
              <li>Any claims arising from product use in violation of these Terms or applicable law</li>
            </ul>
            <p className="mt-3">
              The purchaser agrees to indemnify and hold harmless PRG, its owners, employees, and affiliates
              from any claims, liabilities, damages, or expenses (including attorney fees) resulting from
              product use, misuse, or the purchaser&apos;s violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              10. Account &amp; Security
            </h2>
            <p className="mb-3">
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activities under your account. Notify us immediately of any unauthorized use. We may suspend or
              terminate accounts that violate these Terms.
            </p>
            <p>
              We reserve the right to refuse service, terminate accounts, or cancel orders at our sole
              discretion, including orders that do not meet buyer qualification criteria.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              11. Intellectual Property
            </h2>
            <p>
              All content on this Site, including text, graphics, logos, and software, is the property of PRG
              and protected by US and international copyright laws. You may not reproduce, distribute, or
              create derivative works without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              12. Governing Law &amp; Dispute Resolution
            </h2>
            <p className="mb-3">
              These Terms are governed by the laws of the State of Texas, without regard to conflict of law
              principles. Any disputes arising from these Terms or your use of the Site shall be resolved
              through binding arbitration administered by the American Arbitration Association in Houston,
              Texas.
            </p>
            <p>You waive any right to participate in a class action lawsuit or class-wide arbitration.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              13. No Medical Advice
            </h2>
            <p>
              Information provided on this website is for educational and research purposes only. Nothing on
              this site constitutes medical advice, and PRG does not provide medical consultations. Always
              consult a licensed healthcare professional for medical advice, diagnosis, or treatment.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              14. Contact
            </h2>
            <p>
              Questions about these Terms? Contact us at{" "}
              <a href="mailto:support@phasedresearchgroup.com" className="text-[var(--prg-accent)] underline">
                support@phasedresearchgroup.com
              </a>{" "}
              or see our <Link href="/contact" className="text-[var(--prg-accent)] underline">Contact page</Link>.
            </p>
          </section>

          <div className="border-t border-[var(--prg-border)] pt-6 mt-10">
            <p className="text-xs text-[var(--prg-text-muted)]">
              These Terms were last updated on {LAST_UPDATED}. By using this Site, you acknowledge that you
              have read, understood, and agree to be bound by these Terms.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
