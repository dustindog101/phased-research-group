/**
 * Email service — uses Resend for transactional emails
 * Free tier: 3,000 emails/month, 100/day
 *
 * If RESEND_API_KEY is not set, emails are logged but not sent (dev mode).
 */

import { db } from "@/db";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  type: string;
  orderId?: string;
}

async function logEmail(params: EmailParams) {
  try {
    await db.emailLog.create({
      data: {
        to: params.to,
        subject: params.subject,
        type: params.type,
        orderId: params.orderId ?? null,
      },
    });
  } catch (e) {
    console.error("Failed to log email:", e);
  }
}

async function sendEmail(params: EmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM ?? "Phased Research Group <noreply@phasedresearchgroup.com>";

  if (!apiKey) {
    console.log(`[EMAIL] (dev mode, not sent) To: ${params.to} | Subject: ${params.subject}`);
    await logEmail(params);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[EMAIL] Resend API error ${res.status}:`, err);
      return false;
    }

    await logEmail(params);
    return true;
  } catch (e) {
    console.error("[EMAIL] Send failed:", e);
    return false;
  }
}

// ============ Email Templates ============

interface OrderItemSnapshot {
  name: string;
  dosage: string;
  quantity: number;
  isKit: boolean;
  price: number;
}

function formatPrice(n: number): string {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export async function sendOrderConfirmation(params: {
  to: string;
  orderNumber: string;
  orderId: string;
  items: OrderItemSnapshot[];
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  shippingAddress: { fullName: string; line1: string; city: string; state: string; zip: string };
}) {
  const itemsHtml = params.items
    .map(
      (i) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;">
            ${i.name} ${i.dosage} ${i.isKit ? "(5-vial kit)" : ""}
          </td>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${i.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatPrice(i.price * i.quantity)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0f172a;">
      <div style="background:#1e3a5f;padding:20px;text-align:center;">
        <h1 style="color:#fff;font-size:22px;margin:0;text-transform:uppercase;letter-spacing:2px;">Phased Research Group</h1>
      </div>
      <div style="padding:24px;">
        <h2 style="color:#1e3a5f;font-size:18px;">Order Confirmation</h2>
        <p>Thank you for your order. We've received it and are processing it now.</p>
        <p><strong>Order Number:</strong> ${params.orderNumber}</p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:8px;text-align:left;border-bottom:2px solid #e2e8f0;">Product</th>
              <th style="padding:8px;text-align:center;border-bottom:2px solid #e2e8f0;">Qty</th>
              <th style="padding:8px;text-align:right;border-bottom:2px solid #e2e8f0;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="text-align:right;font-size:14px;">
          <p>Subtotal: ${formatPrice(params.subtotal)}</p>
          ${params.discount > 0 ? `<p>Discount: -${formatPrice(params.discount)}</p>` : ""}
          <p>Shipping: ${params.shipping === 0 ? "FREE" : formatPrice(params.shipping)}</p>
          <p style="font-size:18px;font-weight:bold;color:#1e3a5f;">Total: ${formatPrice(params.total)}</p>
        </div>

        <div style="margin-top:24px;padding:16px;background:#f8fafc;border-radius:8px;">
          <p style="margin:0;font-weight:bold;">Ship to:</p>
          <p style="margin:4px 0;">
            ${params.shippingAddress.fullName}<br>
            ${params.shippingAddress.line1}<br>
            ${params.shippingAddress.city}, ${params.shippingAddress.state} ${params.shippingAddress.zip}
          </p>
        </div>

        <p style="margin-top:24px;font-size:12px;color:#64748b;">
          All products are for laboratory research use only. Not for human consumption.
          You will receive a shipping confirmation with tracking once your order ships.
        </p>
      </div>
    </div>`;

  return sendEmail({
    to: params.to,
    subject: `Order Confirmation — ${params.orderNumber}`,
    html,
    type: "order_confirmation",
    orderId: params.orderId,
  });
}

export async function sendPaymentReceived(params: {
  to: string;
  orderNumber: string;
  orderId: string;
  asset: string;
  amount: string;
  total: number;
}) {
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0f172a;">
      <div style="background:#16a34a;padding:20px;text-align:center;">
        <h1 style="color:#fff;font-size:22px;margin:0;text-transform:uppercase;letter-spacing:2px;">Payment Confirmed</h1>
      </div>
      <div style="padding:24px;">
        <h2 style="color:#1e3a5f;">Your crypto payment has been confirmed</h2>
        <p>We've received your payment and your order is now being processed.</p>
        <p><strong>Order Number:</strong> ${params.orderNumber}</p>
        <p><strong>Payment Method:</strong> ${params.asset}</p>
        <p><strong>Amount Paid:</strong> ${params.amount}</p>
        <p><strong>Order Total:</strong> ${formatPrice(params.total)}</p>
        <p style="margin-top:16px;">Your order will ship within 1-2 business days. You'll receive a tracking number via email once it ships.</p>
        <p style="margin-top:24px;font-size:12px;color:#64748b;">
          All products are for laboratory research use only. Not for human consumption.
        </p>
      </div>
    </div>`;

  return sendEmail({
    to: params.to,
    subject: `Payment Confirmed — ${params.orderNumber}`,
    html,
    type: "payment_received",
    orderId: params.orderId,
  });
}

export async function sendShippingNotification(params: {
  to: string;
  orderNumber: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
}) {
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0f172a;">
      <div style="background:#1e3a5f;padding:20px;text-align:center;">
        <h1 style="color:#fff;font-size:22px;margin:0;text-transform:uppercase;letter-spacing:2px;">Your Order Has Shipped</h1>
      </div>
      <div style="padding:24px;">
        <h2 style="color:#1e3a5f;">Your order is on the way!</h2>
        <p><strong>Order Number:</strong> ${params.orderNumber}</p>
        <p><strong>Carrier:</strong> ${params.carrier}</p>
        <p><strong>Tracking Number:</strong> <span style="font-family:monospace;font-weight:bold;">${params.trackingNumber}</span></p>
        <p style="margin-top:16px;">You can track your package on the carrier's website. Delivery typically takes 3-5 business days for ground shipping.</p>
        <p style="margin-top:24px;font-size:12px;color:#64748b;">
          All products are for laboratory research use only. Not for human consumption.
        </p>
      </div>
    </div>`;

  return sendEmail({
    to: params.to,
    subject: `Your Order Has Shipped — ${params.orderNumber}`,
    html,
    type: "shipping_notification",
    orderId: params.orderId,
  });
}
