"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle, Crown, Loader2, Zap } from "lucide-react";
import {
  AppSettings,
  defaultAppSettings,
  formatNaira,
} from "@/lib/app-settings";
import { fetchAppSettings } from "@/lib/app-settings-client";
import { apiSend } from "@/lib/api-client";
import { openPaystackCheckout } from "@/lib/paystack-inline";
import type { Creator } from "@/types";

function formatDate(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** What each paid plan adds, without the "Everything in …" line. */
function perks(plan: AppSettings["subscriptions"]["pro"]) {
  return plan.features.filter((f) => !f.toLowerCase().startsWith("everything in"));
}

type PaidTier = "pro" | "premium";

/**
 * "Your plan" card for the creator dashboard. Shows where the creator is now
 * and lets them upgrade or renew right here, without leaving the dashboard.
 */
export function PlanPanel({
  creator,
  onSubscribed,
}: {
  creator: Creator;
  /** Called after a successful payment so the dashboard can reload the creator. */
  onSubscribed: () => void | Promise<void>;
}) {
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [paying, setPaying] = useState<PaidTier | null>(null);
  const [error, setError] = useState("");
  const [paidPlan, setPaidPlan] = useState<PaidTier | null>(null);

  useEffect(() => {
    fetchAppSettings().then(setSettings);
  }, []);

  const tier = creator.subscriptionTier;
  const { pro, premium } = settings.subscriptions;
  const endsOn = formatDate(creator.subscriptionEndsAt);

  const pay = async (planId: PaidTier) => {
    setError("");
    setPaidPlan(null);
    setPaying(planId);
    try {
      const checkout = await apiSend<{
        authorizationUrl: string;
        accessCode: string;
        reference: string;
        publicKey: string;
        email: string;
        amountKobo: number;
        channels: string[];
      }>("/api/payments/initialize", "POST", { tier: planId });

      const paid = await openPaystackCheckout({
        publicKey: checkout.publicKey,
        email: checkout.email,
        amountKobo: checkout.amountKobo,
        reference: checkout.reference,
        accessCode: checkout.accessCode,
        authorizationUrl: checkout.authorizationUrl,
        channels: checkout.channels ?? ["card"],
      });

      await apiSend("/api/payments/verify", "POST", {
        reference: paid.reference,
      });
      await onSubscribed();
      setPaidPlan(planId);
    } catch (err) {
      // Closing the payment window isn't an error.
      if (!(err instanceof Error && err.message === "Checkout closed")) {
        setError(
          err instanceof Error
            ? err.message
            : "We couldn't complete the payment. Please try again."
        );
      }
    } finally {
      setPaying(null);
    }
  };

  const upgradeOptions: { id: PaidTier; plan: typeof pro; icon: typeof Zap }[] =
    tier === "free"
      ? [
          { id: "pro", plan: pro, icon: Zap },
          { id: "premium", plan: premium, icon: Crown },
        ]
      : tier === "pro"
        ? [{ id: "premium", plan: premium, icon: Crown }]
        : [];

  return (
    <section className="mt-6 rounded-2xl border border-olive-200/70 bg-milky-50 p-4 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-olive-100 text-olive-700">
          <Crown size={20} />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-olive-900">
            {tier === "free"
              ? "Get seen by more clients"
              : `You're on the ${tier === "pro" ? "Pro" : "Premium"} plan`}
          </h2>
          <p className="mt-0.5 text-sm text-olive-600">
            {tier === "free"
              ? "Paying creators are shown above Free creators when clients search. Upgrade to move up."
              : endsOn
                ? `Active until ${endsOn}. Renew before then to keep your spot.`
                : "Your plan is active."}
          </p>
        </div>
      </div>

      {paidPlan && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-olive-50 px-4 py-3 text-sm text-olive-700">
          <CheckCircle size={18} className="mt-0.5 shrink-0 text-olive-600" />
          Payment received. Your {paidPlan === "pro" ? "Pro" : "Premium"} plan is
          active for the next 30 days.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {upgradeOptions.length > 0 && (
        <div
          className={`mt-4 grid gap-3 ${upgradeOptions.length > 1 ? "sm:grid-cols-2" : ""}`}
        >
          {upgradeOptions.map(({ id, plan, icon: Icon }) => (
            <div
              key={id}
              className="flex flex-col rounded-xl border border-olive-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 font-semibold text-olive-900">
                  <Icon size={16} className="text-olive-600" />
                  {plan.name}
                </p>
                <p className="text-sm font-bold text-olive-900">
                  {formatNaira(plan.price)}
                  <span className="font-normal text-olive-500"> / 30 days</span>
                </p>
              </div>
              <ul className="mt-3 flex-1 space-y-1.5">
                {perks(plan).map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-2 text-sm text-olive-700"
                  >
                    <Check size={14} className="mt-0.5 shrink-0 text-olive-500" />
                    {perk}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => pay(id)}
                disabled={paying !== null}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-olive-600 py-2.5 text-sm font-semibold text-milky-50 hover:bg-olive-700 disabled:opacity-60"
              >
                {paying === id && <Loader2 size={16} className="animate-spin" />}
                {paying === id
                  ? "Opening payment..."
                  : tier === "free"
                    ? `Get ${plan.name}`
                    : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      )}

      {tier !== "free" && endsOn && (
        <button
          type="button"
          onClick={() => pay(tier as PaidTier)}
          disabled={paying !== null}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-olive-300 py-2.5 text-sm font-semibold text-olive-700 hover:bg-olive-50 disabled:opacity-60 sm:inline-flex sm:w-auto sm:px-6"
        >
          {paying === tier && <Loader2 size={16} className="animate-spin" />}
          {paying === tier ? "Opening payment..." : "Renew (+30 days)"}
        </button>
      )}

      <p className="mt-4 text-xs text-olive-500">
        You pay with your debit card, safely through Paystack. Each payment
        gives you 30 days.
        {process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.startsWith("pk_test") && (
          <>
            {" "}
            <span className="font-medium text-olive-700">Test mode:</span> use
            card 4084 0840 8408 4081, any future date and any 3 digits.
          </>
        )}
      </p>
    </section>
  );
}
