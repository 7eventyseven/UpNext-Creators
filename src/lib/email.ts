import nodemailer, { type Transporter } from "nodemailer";

type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let transport: Transporter | null = null;

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
}

function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT ?? 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      // 465 = implicit TLS, 587 = STARTTLS.
      secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === "true"
        : port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

/**
 * Sends one email. Without SMTP settings (local dev) the message is logged
 * instead so the accept/decline links can still be copied from the console.
 * Throws when SMTP is configured but the send fails, so callers can retry.
 */
export async function sendEmail(mail: Mail) {
  if (!smtpConfigured()) {
    console.warn(
      `[email] SMTP is not configured — not sending to ${mail.to}.\n` +
        `Subject: ${mail.subject}\n${mail.text}`
    );
    return { sent: false as const };
  }

  const from =
    process.env.EMAIL_FROM || `UpNext Creators <${process.env.SMTP_USER}>`;
  await getTransport().sendMail({
    from,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
  return { sent: true as const };
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function naira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5f4ee;font-family:Arial,Helvetica,sans-serif;color:#2b3320;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="font-weight:700;font-size:18px;margin-bottom:16px;">UpNext Creators</div>
    <div style="background:#ffffff;border:1px solid #dfe3d0;border-radius:16px;padding:24px;">
      <h1 style="margin:0 0 12px;font-size:20px;">${escapeHtml(title)}</h1>
      ${body}
    </div>
  </div></body></html>`;
}

function button(href: string, label: string, color: string) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;margin-right:8px;">${escapeHtml(label)}</a>`;
}

export type BookingEmailInfo = {
  creatorName: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  creatorPayout: number;
  notes: string;
};

function details(info: BookingEmailInfo, showPayout: boolean) {
  const rows: [string, string][] = [
    ["Service", info.serviceName],
    ["Client", info.clientName],
    ["Date", info.date],
    ["Time", info.time],
    ["Price", naira(info.price)],
  ];
  if (showPayout) rows.push(["You receive", naira(info.creatorPayout)]);
  if (info.notes) rows.push(["Notes", info.notes]);
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0 20px;">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#6b7458;width:110px;">${escapeHtml(k)}</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(v)}</td></tr>`
    )
    .join("")}</table>`;
}

export function creatorBookingRequestEmail(input: {
  to: string;
  info: BookingEmailInfo;
  respondUrl: string;
}): Mail {
  const { info } = input;
  return {
    to: input.to,
    subject: `New booking request: ${info.serviceName} on ${info.date}`,
    text:
      `Hi ${info.creatorName}, ${info.clientName} has booked and paid for "${info.serviceName}" ` +
      `on ${info.date} at ${info.time}. You receive ${naira(info.creatorPayout)}.\n\n` +
      `Accept or decline here: ${input.respondUrl}\n\n` +
      `You have 30 minutes to respond. If you decline, or do not answer in time, ` +
      `the booking is cancelled and the client is refunded automatically.`,
    html: layout(
      "You have a new booking request",
      `<p style="margin:0 0 4px;">Hi ${escapeHtml(info.creatorName)}, a client has booked and paid. Please accept or decline.</p>
       ${details(info, true)}
       <div>${button(input.respondUrl, "Accept or decline", "#5b6b2f")}</div>
       <p style="font-size:12px;color:#6b7458;margin-top:20px;"><strong>Please respond within 30 minutes.</strong> If you decline, or do not answer in time, the booking is cancelled and the client is refunded automatically.</p>`
    ),
  };
}

export function clientBookingOutcomeEmail(input: {
  to: string;
  info: BookingEmailInfo;
  outcome: "accepted" | "declined" | "expired";
}): Mail {
  const { info } = input;
  const accepted = input.outcome === "accepted";
  const expired = input.outcome === "expired";
  const why = expired
    ? `${info.creatorName} did not respond within 30 minutes`
    : `${info.creatorName} is unable to take this booking`;
  return {
    to: input.to,
    subject: accepted
      ? `${info.creatorName} accepted your booking`
      : expired
        ? `Your booking with ${info.creatorName} was refunded`
        : `${info.creatorName} could not take your booking`,
    text: accepted
      ? `Good news ${info.clientName}! ${info.creatorName} accepted your booking for "${info.serviceName}" on ${info.date} at ${info.time}.`
      : `Hi ${info.clientName}, unfortunately ${why}, so your booking for "${info.serviceName}" was cancelled. Your payment of ${naira(info.price)} is being refunded to your original payment method.`,
    html: layout(
      accepted
        ? "Your booking is confirmed"
        : expired
          ? "Your booking expired and was refunded"
          : "Your booking was declined",
      accepted
        ? `<p style="margin:0;">Good news ${escapeHtml(info.clientName)}! ${escapeHtml(info.creatorName)} accepted your booking.</p>${details(info, false)}`
        : `<p style="margin:0;">Hi ${escapeHtml(info.clientName)}, unfortunately ${escapeHtml(why)}, so this booking was cancelled.</p>${details(info, false)}<p style="margin:0;font-weight:600;">Your payment of ${naira(info.price)} is being refunded to your original payment method. Refunds can take a few business days to appear.</p>`
    ),
  };
}

export function clientBookingReceivedEmail(input: {
  to: string;
  info: BookingEmailInfo;
}): Mail {
  const { info } = input;
  return {
    to: input.to,
    subject: `Booking request sent to ${info.creatorName}`,
    text: `Hi ${info.clientName}, we received your payment of ${naira(info.price)} for "${info.serviceName}". ${info.creatorName} has been notified and has 30 minutes to accept or decline. If they decline, or do not respond in time, you are refunded automatically.`,
    html: layout(
      "Booking request sent",
      `<p style="margin:0;">Hi ${escapeHtml(info.clientName)}, we received your payment. ${escapeHtml(info.creatorName)} has been notified and has 30 minutes to accept or decline.</p>${details(info, false)}<p style="margin:0;">If they decline, or do not respond in time, you are refunded automatically.</p>`
    ),
  };
}
