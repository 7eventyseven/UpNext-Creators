import crypto from "node:crypto";
import {
  defaultAppSettings,
  mergeAppSettings,
  splitBookingAmount,
} from "@/lib/app-settings";
import {
  createPaidBooking,
  findCreatorById,
  getAppSettingsRow,
} from "@/lib/repository";
import { activateSubscription } from "@/lib/expiry-repo";
import { notifyBookingCreated } from "@/lib/booking-response";
import type { Booking } from "@/types";

export type PaidTier = "pro" | "premium";

export type BookingCheckoutInput = {
  email: string;
  creatorId: string;
  creatorName: string;
  serviceId: string;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  clientId: string | null;
  clientName: string;
  clientPhone: string;
  notes: string;
  callbackUrl: string;
};

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    customer?: { email?: string };
    metadata?: Record<string, unknown> | null;
  };
};

type SubscriptionResult = {
  ok: true;
  kind: "subscription";
  tier: PaidTier;
  creatorId: string;
};

type BookingResult = {
  ok: true;
  kind: "booking";
  booking: Booking;
};

type FailedResult = { ok: false; reason: string };

export type FulfillResult = SubscriptionResult | BookingResult | FailedResult;

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

export function paystackPublicKey() {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
}

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  return (await res.json()) as T;
}

async function loadSettings() {
  const row = await getAppSettingsRow();
  return row ? mergeAppSettings(row.settings) : defaultAppSettings;
}

export async function getPaidPlan(tier: PaidTier) {
  const settings = await loadSettings();
  const plan = settings.subscriptions[tier];
  if (!plan || plan.price <= 0) {
    throw new Error("Invalid subscription plan");
  }
  return plan;
}

function metaString(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" ? value : value != null ? String(value) : "";
}

export async function initializeSubscription(input: {
  email: string;
  creatorId: string;
  tier: PaidTier;
  callbackUrl: string;
}) {
  const plan = await getPaidPlan(input.tier);
  const amountKobo = plan.price * 100;

  const payload = await paystackFetch<PaystackInitializeResponse>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        amount: amountKobo,
        currency: "NGN",
        callback_url: input.callbackUrl,
        channels: ["card"],
        metadata: {
          kind: "subscription",
          creatorId: input.creatorId,
          tier: input.tier,
        },
      }),
    }
  );

  if (!payload.status || !payload.data) {
    throw new Error(payload.message || "Could not start Paystack checkout");
  }

  return {
    ...payload.data,
    email: input.email,
    amountKobo,
    publicKey: paystackPublicKey(),
    channels: ["card"] as const,
  };
}

export async function initializeBookingCheckout(input: BookingCheckoutInput) {
  const settings = await loadSettings();
  const split = splitBookingAmount(input.price, settings.bookingCommissionPercent);
  const amountKobo = input.price * 100;

  const payload = await paystackFetch<PaystackInitializeResponse>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        amount: amountKobo,
        currency: "NGN",
        callback_url: input.callbackUrl,
        metadata: {
          kind: "booking",
          creatorId: input.creatorId,
          creatorName: input.creatorName,
          serviceId: input.serviceId,
          serviceName: input.serviceName,
          price: String(input.price),
          date: input.date,
          time: input.time,
          clientId: input.clientId ?? "",
          clientName: input.clientName,
          clientPhone: input.clientPhone,
          notes: input.notes.slice(0, 400),
          commissionPercent: String(split.commissionPercent),
          // Used to build the accept/decline link in the creator's email.
          appOrigin: new URL(input.callbackUrl).origin,
        },
      }),
    }
  );

  if (!payload.status || !payload.data) {
    throw new Error(payload.message || "Could not start Paystack checkout");
  }

  return {
    ...payload.data,
    email: input.email,
    amountKobo,
    publicKey: paystackPublicKey(),
    split,
  };
}

/* ------------------------------------------------------------------ */
/* Refunds                                                             */
/* ------------------------------------------------------------------ */

/** Refunds the full amount of a transaction back to the buyer's card/bank. */
export async function refundTransaction(reference: string) {
  const payload = await paystackFetch<{ status: boolean; message: string }>(
    "/refund",
    { method: "POST", body: JSON.stringify({ transaction: reference }) }
  );
  if (!payload.status) {
    throw new Error(payload.message || "Paystack could not refund this payment");
  }
}

/* ------------------------------------------------------------------ */
/* Payouts: banks, recipients, transfers                               */
/* ------------------------------------------------------------------ */

export type PaystackBank = { name: string; code: string };

export async function listNigerianBanks(): Promise<PaystackBank[]> {
  const payload = await paystackFetch<{
    status: boolean;
    message: string;
    data?: { name: string; code: string; active: boolean }[];
  }>("/bank?country=nigeria&currency=NGN&perPage=200");
  if (!payload.status || !payload.data) {
    throw new Error(payload.message || "Could not load banks");
  }
  const seen = new Set<string>();
  return payload.data
    .filter((b) => b.active !== false)
    .filter((b) => (seen.has(b.code) ? false : (seen.add(b.code), true)))
    .map((b) => ({ name: b.name, code: b.code }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Looks up the registered holder name for an account number. */
export async function resolveBankAccount(accountNumber: string, bankCode: string) {
  const payload = await paystackFetch<{
    status: boolean;
    message: string;
    data?: { account_name: string; account_number: string };
  }>(
    `/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`
  );
  if (!payload.status || !payload.data) {
    throw new Error(
      payload.message || "Could not verify this account number"
    );
  }
  return { accountName: payload.data.account_name };
}

export async function createTransferRecipient(input: {
  accountName: string;
  accountNumber: string;
  bankCode: string;
}) {
  const payload = await paystackFetch<{
    status: boolean;
    message: string;
    data?: { recipient_code: string };
  }>("/transferrecipient", {
    method: "POST",
    body: JSON.stringify({
      type: "nuban",
      name: input.accountName,
      account_number: input.accountNumber,
      bank_code: input.bankCode,
      currency: "NGN",
    }),
  });
  if (!payload.status || !payload.data) {
    throw new Error(payload.message || "Could not save this bank account");
  }
  return payload.data.recipient_code;
}

export type TransferOutcome = "processing" | "success" | "failed";

/**
 * Sends money from the UpNext Paystack balance to a creator's bank account.
 * The final result arrives on the `transfer.*` webhook.
 */
export async function initiateTransfer(input: {
  amount: number;
  recipientCode: string;
  reference: string;
  reason: string;
}): Promise<{ outcome: TransferOutcome; message: string }> {
  const payload = await paystackFetch<{
    status: boolean;
    message: string;
    data?: { status: string };
  }>("/transfer", {
    method: "POST",
    body: JSON.stringify({
      source: "balance",
      amount: input.amount * 100,
      recipient: input.recipientCode,
      reference: input.reference,
      reason: input.reason,
      currency: "NGN",
    }),
  });

  if (!payload.status || !payload.data) {
    return { outcome: "failed", message: payload.message };
  }

  const status = payload.data.status;
  if (status === "success") return { outcome: "success", message: "" };
  if (status === "otp") {
    // The Paystack account requires an OTP per transfer, so it can't be automated.
    return {
      outcome: "failed",
      message:
        "Transfers need OTP approval. Disable transfer OTP in the Paystack dashboard (Settings > Preferences).",
    };
  }
  if (status === "failed" || status === "reversed") {
    return { outcome: "failed", message: payload.message };
  }
  return { outcome: "processing", message: "" };
}

/* ------------------------------------------------------------------ */
/* Payment fulfilment                                                  */
/* ------------------------------------------------------------------ */

async function fulfillSubscription(
  tx: NonNullable<PaystackVerifyResponse["data"]>
): Promise<FulfillResult> {
  const metadata = tx.metadata ?? {};
  const creatorId = metaString(metadata, "creatorId");
  const tier = metaString(metadata, "tier");
  if (!creatorId || (tier !== "pro" && tier !== "premium")) {
    throw new Error("Payment is missing subscription details");
  }

  const plan = await getPaidPlan(tier);
  if (tx.amount < plan.price * 100) {
    throw new Error("Paid amount does not match the selected plan");
  }

  const creator = await findCreatorById(creatorId);
  if (!creator) throw new Error("Creator not found for this payment");

  // Idempotent per payment reference: the redirect and the webhook both land here.
  await activateSubscription({ creatorId, tier, reference: tx.reference });
  return { ok: true, kind: "subscription", tier, creatorId };
}

async function fulfillBooking(
  tx: NonNullable<PaystackVerifyResponse["data"]>
): Promise<FulfillResult> {
  const metadata = tx.metadata ?? {};
  const creatorId = metaString(metadata, "creatorId");
  const serviceId = metaString(metadata, "serviceId");
  const price = Number(metaString(metadata, "price"));
  if (!creatorId || !serviceId || !Number.isFinite(price) || price <= 0) {
    throw new Error("Payment is missing booking details");
  }

  if (tx.amount < price * 100) {
    throw new Error("Paid amount does not match the service price");
  }

  const creator = await findCreatorById(creatorId);
  if (!creator) throw new Error("Creator not found for this payment");

  const settings = await loadSettings();
  const storedPercent = Number(metaString(metadata, "commissionPercent"));
  const split = splitBookingAmount(
    price,
    Number.isFinite(storedPercent)
      ? storedPercent
      : settings.bookingCommissionPercent
  );

  const booking = await createPaidBooking({
    creatorId,
    creatorName: metaString(metadata, "creatorName") || creator.name,
    serviceId,
    serviceName: metaString(metadata, "serviceName") || "Service",
    price,
    date: metaString(metadata, "date"),
    time: metaString(metadata, "time"),
    clientId: metaString(metadata, "clientId") || null,
    clientName: metaString(metadata, "clientName"),
    clientPhone: metaString(metadata, "clientPhone"),
    clientEmail: tx.customer?.email || "",
    notes: metaString(metadata, "notes"),
    paymentReference: tx.reference,
    commissionPercent: split.commissionPercent,
    commission: split.commission,
    creatorPayout: split.creatorPayout,
  });

  // Payment can be fulfilled by both the redirect and the webhook; the
  // notification is claimed in the DB so the creator is only emailed once.
  const origin =
    process.env.APP_URL?.replace(/\/$/, "") ||
    metaString(metadata, "appOrigin") ||
    "http://localhost:3000";
  await notifyBookingCreated(booking, origin).catch((err) =>
    console.error("[booking] could not send notifications", err)
  );

  return { ok: true, kind: "booking", booking };
}

export async function fulfillPaystackPayment(reference: string): Promise<FulfillResult> {
  const payload = await paystackFetch<PaystackVerifyResponse>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );

  if (!payload.status || !payload.data) {
    throw new Error(payload.message || "Could not verify payment");
  }

  const tx = payload.data;
  if (tx.status !== "success") {
    return { ok: false, reason: tx.status };
  }

  const kind = metaString(tx.metadata, "kind") || "subscription";
  if (kind === "booking") return fulfillBooking(tx);
  return fulfillSubscription(tx);
}

/** @deprecated use fulfillPaystackPayment */
export async function verifyAndActivate(reference: string) {
  const result = await fulfillPaystackPayment(reference);
  if (!result.ok) return result;
  if (result.kind !== "subscription") {
    throw new Error("This payment is not a subscription");
  }
  return result;
}

export function isValidPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const hash = crypto
    .createHmac("sha512", secretKey())
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}
