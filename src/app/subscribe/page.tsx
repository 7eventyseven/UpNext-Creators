"use client";

import { useEffect, useState } from "react";
import { Crown, Check, Zap, Star, TrendingUp } from "lucide-react";
import {
  AppSettings,
  defaultAppSettings,
  formatNaira,
} from "@/lib/app-settings";
import { fetchAppSettings } from "@/lib/app-settings-client";

const icons = {
  free: Star,
  pro: Zap,
  premium: Crown,
} as const;

export default function SubscribePage() {
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [selected, setSelected] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchAppSettings()
      .then(setSettings)
      .finally(() => setReady(true));
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

  const handleSubscribe = (planId: string) => {
    if (planId === "free") return;
    setSelected(planId);
    setTimeout(() => setSubscribed(true), 800);
  };

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-olive-600 border-t-transparent" />
      </div>
    );
  }

  if (subscribed && selected) {
    const plan = plans.find((p) => p.id === selected);
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-olive-100">
          <Check size={32} className="text-olive-600" />
        </div>
        <h1 className="text-2xl font-bold text-olive-900">
          Welcome to {plan?.name}!
        </h1>
        <p className="mt-3 text-olive-600 leading-relaxed">
          Your subscription is active. You&apos;re now ranked higher and ready to
          receive more bookings from clients across Nigeria.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-xl bg-olive-600 px-6 py-3 font-semibold text-milky-50 hover:bg-olive-700"
        >
          View Your Ranking
        </a>
      </div>
    );
  }

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

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
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
                disabled={plan.id === "free" || selected === plan.id}
                className={`w-full rounded-xl py-3 font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-olive-600 text-milky-50 hover:bg-olive-700"
                    : plan.id === "free"
                      ? "bg-olive-100 text-olive-500 cursor-default"
                      : "border border-olive-300 text-olive-700 hover:bg-olive-50"
                } disabled:opacity-60`}
              >
                {plan.id === "free"
                  ? "Current Plan"
                  : selected === plan.id
                    ? "Processing..."
                    : "Subscribe Now"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-olive-500">
        Subscriptions renew monthly. Cancel anytime. Payment integration coming
        soon.
      </p>
    </div>
  );
}
