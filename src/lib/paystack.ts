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
  setCreatorSubscription,
} from "@/lib/repository";
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

  await setCreatorSubscription(creatorId, tier);
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
