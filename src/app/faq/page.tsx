import { FAQAccordion } from "@/components/store/faq-accordion";

export const metadata = {
  title: "FAQ",
  description: "Common questions about ordering, shipping, payments, and product quality.",
};

const FAQS = [
  {
    q: "What payment methods do you accept?",
    a: "Crypto only right now: Bitcoin, Litecoin, Solana, and USDC on Ethereum, Polygon, Base, and Solana. We know crypto-only is a flag for some buyers, but it keeps our costs down and lets us ship faster. Payments go straight to our wallet, no payment processor in the middle taking a cut or holding your data.",
  },
  {
    q: "How fast do you ship?",
    a: "Order before 2PM CST and it goes out the same day. After that, next business day. Ground shipping is 3-5 business days via UPS or USPS. Express is 2-day. You get a tracking number the day it ships, not three days later. Free ground shipping on orders over $175.",
  },
  {
    q: "Are your peptides actually tested?",
    a: "Yes. Every lot gets HPLC and mass-spec testing by a third-party lab, not us. The COA is on the product page before you buy. The lot number on your vial matches the lot number on the COA. If you want to verify the batch with the lab directly, we name the lab on the COA document.",
  },
  {
    q: "Do I need an account to order?",
    a: "Nope. Guest checkout works fine with just your email. But if you make an account, you get order history, saved addresses, and you can resume an unpaid crypto invoice from your dashboard instead of starting over. Up to you.",
  },
  {
    q: "How does the crypto payment actually work?",
    a: "When you check out, we generate a unique amount for your order (the exact total plus a tiny random suffix so we can match your payment to your order). You scan the QR code or copy the address, send from your wallet, and our system watches the blockchain for that exact amount. Once it confirms, your order is marked paid. Usually takes 10-30 minutes depending on the coin.",
  },
  {
    q: "What if I send the wrong amount?",
    a: "Send the exact amount shown. The unique suffix is how we know it's your payment. If you underpay, the system won't match it and your order stays unpaid. If you overpay, email us with your order number and tx hash and we'll sort it out. Use a personal wallet, not an exchange withdrawal, so you control the exact amount sent.",
  },
  {
    q: "What's your return policy?",
    a: "Unopened product in original packaging can be returned within 14 days for a refund (minus shipping). Opened or reconstituted product cannot be returned for safety reasons. If something arrives damaged or wrong, email us within 48 hours with photos and your order number. Full details on the Refund Policy page.",
  },
  {
    q: "Are these safe for human use?",
    a: "No. These are research chemicals, not supplements or medications. They are not evaluated by the FDA. They are not for human consumption, injection, diagnostic use, or therapeutic use. We sell to qualified research personnel for in vitro laboratory work. If that's not you, don't buy from us.",
  },
  {
    q: "Which states do you ship to?",
    a: "We ship to 12 states right now: TX, CA, FL, NY, AZ, CO, GA, IL, NC, OH, PA, WA. Some states have specific restrictions on certain peptides or require licenses we don't hold. If your state isn't listed, we can't ship to you. No international shipping either.",
  },
  {
    q: "How should I store the peptides when they arrive?",
    a: "Store lyophilized powder in the freezer at -20C. Keep away from light and moisture. Once reconstituted with bacteriostatic water, store in the refrigerator at 2-8C and use within a reasonable timeframe. Specific storage instructions come with every order.",
  },
  {
    q: "My vial looks empty. Is that normal?",
    a: "Yes. The peptide is lyophilized (freeze-dried) powder. It can look like a tiny smear or a small disc at the bottom of the vial. That's normal. It's not supposed to fill the vial. Reconstitute according to the instructions included with your order.",
  },
  {
    q: "How do I contact you?",
    a: "Email support@phasedresearchgroup.com. We respond within one business day, usually faster during weekday business hours (9-5 CST). For order-specific questions, include your order number in the subject line. We don't do phone support or Telegram.",
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
            Real questions from real customers. If yours isn&apos;t here, email us.
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
