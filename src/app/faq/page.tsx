import { FAQAccordion } from "@/components/store/faq-accordion";

export const metadata = {
  title: "Frequently Asked Questions",
  description: "Common questions about ordering, shipping, payments, and product quality.",
};

const FAQS = [
  {
    q: "What payment methods do you accept?",
    a: "We accept cryptocurrency payments including Bitcoin (BTC), Litecoin (LTC), Solana (SOL), and USDC on Ethereum, Polygon, Base, and Solana networks. All payments are processed directly to our self-hosted wallets — no third-party payment processor is involved. This ensures maximum privacy and security for your transactions.",
  },
  {
    q: "How long does shipping take?",
    a: "Orders are processed within 1-2 business days after payment confirmation. UPS/USPS Ground shipping takes 3-5 business days. Express shipping (2-Day) is available for an additional fee. You'll receive a tracking number via email once your order ships. Free ground shipping is included on orders over $175.",
  },
  {
    q: "Are your products tested?",
    a: "Yes. Every product batch undergoes third-party laboratory testing using HPLC (High-Performance Liquid Chromatography) and mass spectrometry to verify purity (99%+ threshold) and molecular identity. Certificates of Analysis (COAs) are available for download on our COA page. If you need a COA for a specific lot, contact us with your order number.",
  },
  {
    q: "Do I need an account to order?",
    a: "No, you can checkout as a guest with just your email address. However, creating an account lets you track order history, save shipping addresses for faster checkout, and receive order status updates. Account holders can also resume incomplete crypto payments from their order history.",
  },
  {
    q: "How does crypto payment work?",
    a: "When you select a crypto asset at checkout, we generate a unique payment invoice with a specific amount tied to your order. You send the exact amount to our deposit address (shown as a QR code). Our payment watcher monitors the blockchain and automatically marks your order as paid once the required confirmations are reached. The whole process typically takes 10-30 minutes depending on the asset.",
  },
  {
    q: "What if I send the wrong amount?",
    a: "Always send the exact amount shown on your invoice. The unique amount (with a small random suffix) is how we match your payment to your order. If you underpay, your order will not be marked as paid. If you overpay, contact support with your order number and tx hash — we'll assist with reconciliation. Never send from an exchange wallet if the exact amount matters; use a personal wallet where you control the precise amount sent.",
  },
  {
    q: "What is your return policy?",
    a: "Due to the nature of research chemicals, we cannot accept returns of opened products. If you receive a damaged or incorrect item, contact us within 48 hours of delivery with photos and your order number. We'll arrange a replacement or refund at our discretion. Unopened products in original packaging may be returned within 14 days for a full refund, less shipping costs.",
  },
  {
    q: "Are these products safe for human use?",
    a: "No. All products are sold exclusively for laboratory research use by qualified personnel. They are not medications, supplements, or food additives. They have not been evaluated by the FDA for safety, efficacy, or quality. Purchasers must be 21+ and are responsible for ensuring lawful handling, storage, and disposal in compliance with all applicable regulations.",
  },
  {
    q: "Which states do you ship to?",
    a: "We currently ship to select US states. Available states are shown in the checkout shipping address form. If your state is not listed, we cannot ship to your location at this time. We do not ship internationally. All shipments require a physical address (no PO boxes for express shipping).",
  },
  {
    q: "How can I contact support?",
    a: "Email us at support@phasedresearchgroup.com. We typically respond within one business day (Mon-Fri, 9am-5pm CST). For urgent order-related questions, include your order number in the subject line. You can also use our contact form on the Contact page.",
  },
];

export default function FAQPage() {
  return (
    <>
      <section className="py-14 border-b border-[var(--prg-border)] prg-page-hero-gradient">
        <div className="prg-container max-w-[800px]">
          <span className="prg-eyebrow">Support</span>
          <h1 className="text-[clamp(32px,4vw,42px)] font-bold uppercase tracking-[2px] mb-3 mt-2" style={{ fontFamily: "var(--font-display)" }}>
            Frequently Asked Questions
          </h1>
          <p className="text-[17px] text-[var(--prg-text-secondary)] leading-[1.7] max-w-[600px]">
            Common questions about ordering, payments, shipping, and product quality.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="prg-container max-w-[800px]">
          <FAQAccordion faqs={FAQS} />
        </div>
      </section>
    </>
  );
}
