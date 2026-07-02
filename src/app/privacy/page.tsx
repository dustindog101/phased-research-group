import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Phased Research Group.",
};

const LAST_UPDATED = "January 2025";

export default function PrivacyPage() {
  return (
    <article className="py-12">
      <div className="prg-container max-w-[800px]">
        <span className="prg-eyebrow">Legal</span>
        <h1 className="text-[clamp(28px,4vw,36px)] font-bold uppercase tracking-[2px] mb-2 mt-1" style={{ fontFamily: "var(--font-display)" }}>
          Privacy Policy
        </h1>
        <p className="text-sm text-[var(--prg-text-muted)] mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8 text-[var(--prg-text-secondary)] leading-[1.8]">
          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              1. Introduction
            </h2>
            <p>
              Phased Research Group (&ldquo;PRG,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects
              your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your
              personal information when you visit phasedresearchgroup.com or purchase products from us. By
              using our Site, you consent to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              2. Information We Collect
            </h2>
            <p className="mb-3"><strong>Information you provide:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account information:</strong> Name, email address, and password when you create an account</li>
              <li><strong>Order information:</strong> Shipping address, phone number, and order details</li>
              <li><strong>Payment information:</strong> Cryptocurrency wallet addresses and transaction hashes (we do not store private keys)</li>
              <li><strong>Communications:</strong> Messages you send via our contact form or email</li>
            </ul>
            <p className="mt-3 mb-3"><strong>Information collected automatically:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Device &amp; usage data:</strong> IP address, browser type, operating system, pages visited, referring URLs</li>
              <li><strong>Cookies &amp; local storage:</strong> Shopping cart contents, age verification status, session tokens</li>
              <li><strong>Order metadata:</strong> Order timestamps, payment status, shipping tracking numbers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process and fulfill orders, including shipping and tracking</li>
              <li>Verify payment status on the blockchain and confirm transactions</li>
              <li>Communicate with you about orders, products, and account matters</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Prevent fraud, abuse, and unauthorized access</li>
              <li>Comply with legal obligations and law enforcement requests</li>
              <li>Improve our website, products, and services</li>
              <li>Send order confirmations and status updates (you can opt out of marketing emails)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              4. Cryptocurrency Payments &amp; Privacy
            </h2>
            <p className="mb-3">
              We use a self-hosted crypto payment gateway. When you pay with cryptocurrency:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your payment goes directly to our wallet — no third-party processor sees your data</li>
              <li>We store the transaction hash and deposit address for order matching and record-keeping</li>
              <li>Blockchain transactions are public and immutable — we cannot delete on-chain records</li>
              <li>We do not collect or store your private keys, seed phrases, or wallet credentials</li>
              <li>A unique payment amount (with random suffix) links your on-chain payment to your order</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              5. Information Sharing &amp; Disclosure
            </h2>
            <p className="mb-3">We do <strong>not sell, rent, or trade</strong> your personal information. We may share data with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service providers:</strong> Hosting (Vercel), database (Neon), email delivery (Resend) — all bound by confidentiality agreements</li>
              <li><strong>Shipping carriers:</strong> UPS, USPS — only the information needed to deliver your package</li>
              <li><strong>Law enforcement:</strong> If required by law, court order, or to protect our rights and safety</li>
              <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or asset sale (with notice)</li>
            </ul>
            <p className="mt-3">
              We never share your data for marketing purposes with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              6. Data Security
            </h2>
            <p className="mb-3">We implement industry-standard security measures:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>HTTPS/TLS encryption for all data in transit</li>
              <li>Bcrypt password hashing (never stored in plaintext)</li>
              <li>HMAC-signed session tokens for authentication</li>
              <li>Encrypted environment variables for secrets</li>
              <li>Regular security reviews and dependency updates</li>
              <li>Role-based access control for admin functions</li>
            </ul>
            <p className="mt-3">
              No system is 100% secure. We cannot guarantee absolute security, but we take reasonable steps
              to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              7. Cookies &amp; Local Storage
            </h2>
            <p className="mb-3">We use the following:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Session cookie:</strong> NextAuth session token (required for login)</li>
              <li><strong>Local storage:</strong> Shopping cart contents, age verification status</li>
              <li><strong>Analytics:</strong> We do not currently use third-party analytics (Google Analytics, etc.)</li>
            </ul>
            <p className="mt-3">
              You can clear cookies and local storage in your browser settings. Note that clearing cart data
              will empty your shopping cart.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              8. Your Rights (CCPA/CPRA)
            </h2>
            <p className="mb-3">If you are a California resident, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Know</strong> what personal information we collect about you</li>
              <li><strong>Delete</strong> your personal information (subject to legal retention requirements)</li>
              <li><strong>Opt out</strong> of the sale of your personal information (we do not sell your data)</li>
              <li><strong>Correct</strong> inaccurate personal information</li>
              <li><strong>Access</strong> your personal information in a portable format</li>
              <li><strong>Non-discrimination</strong> — we will not discriminate against you for exercising these rights</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, email{" "}
              <a href="mailto:support@phasedresearchgroup.com" className="text-[var(--prg-accent)] underline">support@phasedresearchgroup.com</a>{" "}
              with &ldquo;Privacy Request&rdquo; in the subject line.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              9. Data Retention
            </h2>
            <p>
              We retain personal information for as long as your account is active or as needed to provide
              services. Order records are retained for 7 years for legal and tax compliance. After account
              deletion, we anonymize or delete your data within 30 days, except where retention is required
              by law.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              10. Children&apos;s Privacy
            </h2>
            <p>
              Our Site is not intended for anyone under 21. We do not knowingly collect information from
              children. If you believe we have collected data from someone under 21, contact us immediately
              for deletion.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              11. Third-Party Links
            </h2>
            <p>
              Our Site may contain links to third-party websites (blockchain explorers, shipping carriers).
              We are not responsible for their privacy practices. Review their policies before providing
              personal information.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              12. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy at any time. Material changes will be posted on this page
              with an updated date. Continued use of the Site after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-[20px] font-semibold uppercase tracking-[1.5px] text-[var(--prg-text)] mb-3" style={{ fontFamily: "var(--font-display)" }}>
              13. Contact
            </h2>
            <p>
              Privacy questions? Email{" "}
              <a href="mailto:support@phasedresearchgroup.com" className="text-[var(--prg-accent)] underline">support@phasedresearchgroup.com</a>{" "}
              with &ldquo;Privacy&rdquo; in the subject line.
            </p>
          </section>

          <div className="border-t border-[var(--prg-border)] pt-6 mt-10">
            <p className="text-xs text-[var(--prg-text-muted)]">
              This Privacy Policy was last updated on {LAST_UPDATED}.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
