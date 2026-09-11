"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Check, Zap, Star, TrendingUp } from "lucide-react";
import {
  AppSettings,
  defaultAppSettings,
  formatNaira,
} from "@/lib/app-settings";
import { fetchAppSettings } from "@/lib/app-settings-client";
import { getLoggedInCreator } from "@/lib/creator-auth";
import { apiSend } from "@/lib/api-client";
import { openPaystackCheckout } from "@/lib/paystack-inline";
import { Creator } from "@/types";

const icons = {
  free: Star,
  pro: Zap,
  premium: Crown,
} as const;

export default function SubscribePage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get(
      "reference"
    );

    (async () => {
      const [appSettings, loggedIn] = await Promise.all([
        fetchAppSettings(),
        getLoggedInCreator(),
      ]);
      setSettings(appSettings);
      setCreator(loggedIn ?? null);

      if (reference && loggedIn) {
        setVerifying(true);
        try {
          const data = await apiSend<{ ok: boolean; tier: string }>(
            "/api/payments/verify",
            "POST",
            { reference }
          );
          setSubscribed(data.tier);
          window.history.replaceState({}, "", "/subscribe");
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Could not confirm payment."
          );
        } finally {
          setVerifying(false);
        }
      }

      setReady(true);
    })();
  }, []);

  const plans = (
    Object.keys(settings.subscriptions) as Array<
      keyof AppSettings["subscriptions"]
    >
  ).map((id) => ({
    id,
    ...settings.subscriptions[id],
    icon: icons[id],
    highlighted: id === "pro",
  }));

  const handleSubscribe = async (planId: string) => {
    if (planId === "free") return;
    setError("");

    if (!creator) {
      router.push("/signin?next=/subscribe");
      return;
    }

    setSelected(planId);
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

      const data = await apiSend<{ ok: boolean; tier: string }>(
        "/api/payments/verify",
        "POST",
        { reference: paid.reference }
      );
      setSubscribed(data.tier);
      setSelected(null);
    } catch (err) {
      if (err instanceof Error && err.message === "Checkout closed") {
        setSelected(null);
        return;
      }
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setSelected(null);
    }
  };

  if (!ready || verifying) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-olive-600 border-t-transparent" />
        {verifying && (
          <p className="text-sm text-olive-600">Confirming your payment…</p>
        )}
      </div>
    );
  }

  if (subscribed) {
    const plan = plans.find((p) => p.id === subscribed);
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-olive-100">
          <Check size={32} className="text-olive-600" />
        </div>
        <h1 className="text-2xl font-bold text-olive-900">
          Welcome to {plan?.name}!
        </h1>
        <p className="mt-3 text-olive-600 leading-relaxed">
          Payment received. You&apos;re now ranked higher and ready to receive
          more bookings from clients across Nigeria.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-xl bg-olive-600 px-6 py-3 font-semibold text-milky-50 hover:bg-olive-700"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  const currentTier = creator?.subscriptionTier ?? "free";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-olive-100 px-4 py-1.5 text-sm font-medium text-olive-700 mb-4">
          <TrendingUp size={14} />
          Creator Subscriptions
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-olive-900">
          Rank Higher, Get More Bookings
        </h1>
        <p className="mt-3 text-olive-600 max-w-xl mx-auto text-sm sm:text-base">
          Subscribe monthly to climb the rankings and appear at the top when
          clients search for creators in your city and category.
        </p>
      </div>

      {error && (
        <p className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = currentTier === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-5 sm:p-6 transition-all ${
                plan.highlighted
                  ? "border-olive-500 bg-olive-50 shadow-lg md:scale-[1.02]"
                  : "border-olive-200/70 bg-milky-50 hover:border-olive-300"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-olive-600 px-3 py-0.5 text-xs font-semibold text-milky-50">
                  Most Popular
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    plan.highlighted
                      ? "bg-olive-600 text-milky-50"
                      : "bg-olive-100 text-olive-600"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-olive-900">{plan.name}</h3>
                  <p className="text-xs text-olive-500">{plan.description}</p>
                </div>
              </div>

              <div className="mb-5">
                {plan.price === 0 ? (
                  <p className="text-3xl font-bold text-olive-900">Free</p>
                ) : (
                  <p className="text-3xl font-bold text-olive-900">
                    {formatNaira(plan.price)}
                    <span className="text-sm font-normal text-olive-500">
                      /month
                    </span>
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-olive-700"
                  >
                    <Check size={16} className="text-olive-500 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleSubscribe(plan.id)}
                disabled={plan.id === "free" || isCurrent || selected === plan.id}
                className={`w-full rounded-xl py-3 font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-olive-600 text-milky-50 hover:bg-olive-700"
                    : plan.id === "free"
                      ? "bg-olive-100 text-olive-500 cursor-default"
                      : "border border-olive-300 text-olive-700 hover:bg-olive-50"
                } disabled:opacity-60`}
              >
                {isCurrent
                  ? "Current plan"
                  : plan.id === "free"
                    ? "Included"
                    : selected === plan.id
                      ? "Enter your card..."
                      : "Pay with card"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-olive-500">
        Subscriptions are card-only via Paystack — no bank transfer or USSD.
        Use a <span className="font-medium text-olive-700">test card</span> while
        keys are in test mode: 4084 0840 8408 4081, any future date, any CVV.
        {!creator && (
          <>
            {" "}
            <Link href="/signin?next=/subscribe" className="font-semibold text-olive-700 underline">
              Sign in
            </Link>{" "}
            as a creator first.
          </>
        )}
      </p>
    </div>
  );
}
