"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Crown, Zap, Star } from "lucide-react";
import { getAllCreators, saveCreator } from "@/data/creators";
import { Creator } from "@/types";
import {
  AppSettings,
  defaultAppSettings,
  formatNaira,
} from "@/lib/app-settings";
import { fetchAppSettings } from "@/lib/app-settings-client";

const tierIcons = {
  free: Star,
  pro: Zap,
  premium: Crown,
} as const;

const tierColors = {
  free: "bg-olive-50 text-olive-600 border-olive-200",
  pro: "bg-olive-100 text-olive-700 border-olive-300",
  premium: "bg-amber-100 text-amber-800 border-amber-300",
} as const;

export default function AdminSubscriptionsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);

  const load = async () => {
    const [list, appSettings] = await Promise.all([
      getAllCreators(),
      fetchAppSettings(),
    ]);
    setCreators(list);
    setSettings(appSettings);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const handleTierChange = async (
    id: string,
    tier: Creator["subscriptionTier"]
  ) => {
    const creator = creators.find((c) => c.id === id);
    if (!creator) return;
    await saveCreator({
      ...creator,
      subscriptionTier: tier,
      isSubscribed: tier === "pro" || tier === "premium",
    });
    await load();
  };

  const counts = {
    free: creators.filter((c) => c.subscriptionTier === "free").length,
    pro: creators.filter((c) => c.subscriptionTier === "pro").length,
    premium: creators.filter((c) => c.subscriptionTier === "premium").length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-olive-900">Subscriptions</h1>
        <p className="text-olive-600">
          Assign subscription tiers to control creator ranking. Edit prices in{" "}
          <a href="/admin/settings" className="underline font-medium">
            Settings
          </a>
          .
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {(Object.keys(settings.subscriptions) as Array<
          keyof AppSettings["subscriptions"]
        >).map((tier) => {
          const plan = settings.subscriptions[tier];
          const Icon = tierIcons[tier];
          return (
            <div
              key={tier}
              className={`rounded-2xl border p-5 ${tierColors[tier]}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={18} />
                <span className="font-semibold">{plan.name}</span>
              </div>
              <p className="text-2xl font-bold">{counts[tier]}</p>
              <p className="text-sm opacity-80">
                {plan.price === 0 ? "Free" : `${formatNaira(plan.price)}/mo`}
              </p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-olive-200/70 bg-milky-50 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-olive-200 bg-olive-50/50 text-left text-olive-600">
                <th className="px-4 py-3 font-medium">Creator</th>
                <th className="px-4 py-3 font-medium">Current Tier</th>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Change Tier</th>
              </tr>
            </thead>
            <tbody>
              {creators.map((creator) => {
                const plan = settings.subscriptions[creator.subscriptionTier];
                const TierIcon = tierIcons[creator.subscriptionTier];
                return (
                  <tr
                    key={creator.id}
                    className="border-b border-olive-100 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={creator.avatar}
                          alt={creator.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <span className="font-medium text-olive-900">
                          {creator.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tierColors[creator.subscriptionTier]}`}
                      >
                        <TierIcon size={10} />
                        {plan.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-olive-700">#{creator.rank}</td>
                    <td className="px-4 py-3">
                      <select
                        value={creator.subscriptionTier}
                        onChange={(e) =>
                          handleTierChange(
                            creator.id,
                            e.target.value as Creator["subscriptionTier"]
                          )
                        }
                        className="rounded-lg border border-olive-200 bg-milky-50 px-2 py-1.5 text-sm text-olive-700 focus:border-olive-500 focus:outline-none"
                      >
                        <option value="free">
                          {settings.subscriptions.free.name}
                        </option>
                        <option value="pro">
                          {settings.subscriptions.pro.name}
                        </option>
                        <option value="premium">
                          {settings.subscriptions.premium.name}
                        </option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
