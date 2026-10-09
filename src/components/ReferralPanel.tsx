"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle, Clock, Copy, Gift, Share2 } from "lucide-react";
import { apiGet } from "@/lib/api-client";

type ReferralData = {
  code: string;
  rewardDays: number;
  joined: number;
  rewarded: number;
  daysEarned: number;
  referred: {
    name: string;
    joinedAt: string;
    rewarded: boolean;
    rewardDays: number | null;
  }[];
};

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * "Invite creators" card for the creator dashboard: the creator's own link,
 * what they earn, and who has joined through it.
 */
export function ReferralPanel() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiGet<ReferralData>("/api/referrals")
      .then(setData)
      .catch(() => setData(null));
  }, []);

  // Not loaded yet, or the admin has switched referrals off.
  if (!data || data.rewardDays <= 0) return null;

  const link = `${window.location.origin}/register?ref=${data.code}`;
  const shareText = `I'm on UpNext Creators, where clients in Nigeria find and book creatives. Join with my link: ${link}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the link is still visible to copy by hand.
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "UpNext Creators", text: shareText });
        return;
      } catch {
        // Cancelled, or not supported: fall back to WhatsApp below.
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  return (
    <section className="mt-6 rounded-2xl border border-olive-200/70 bg-milky-50 p-4 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-olive-100 text-olive-700">
          <Gift size={20} />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-olive-900">
            Invite creators, get {data.rewardDays} free days
          </h2>
          <p className="mt-0.5 text-sm text-olive-600">
            When a creator you invite pays for their first plan, you get{" "}
            {data.rewardDays} days free. Free creators get Pro. If you already
            have a plan, the days are added to the end of it.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-olive-200 bg-white p-3">
        <p className="text-xs font-medium text-olive-500">Your invite link</p>
        <p className="mt-1 break-all text-sm font-medium text-olive-900">{link}</p>
        <p className="mt-1 text-xs text-olive-500">
          Your code: <span className="font-semibold text-olive-700">{data.code}</span>
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={copy}
          className="flex items-center justify-center gap-2 rounded-xl border border-olive-300 py-2.5 text-sm font-semibold text-olive-700 hover:bg-olive-50"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={share}
          className="flex items-center justify-center gap-2 rounded-xl bg-olive-600 py-2.5 text-sm font-semibold text-milky-50 hover:bg-olive-700"
        >
          <Share2 size={16} />
          Share
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: "Joined", value: data.joined },
          { label: "Paid", value: data.rewarded },
          { label: "Days earned", value: data.daysEarned },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-olive-200/70 bg-white p-3 text-center"
          >
            <p className="text-xl font-bold text-olive-900 sm:text-2xl">
              {stat.value}
            </p>
            <p className="text-xs text-olive-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {data.referred.length > 0 && (
        <ul className="mt-4 divide-y divide-olive-100 rounded-xl border border-olive-200/70 bg-white">
          {data.referred.map((r) => (
            <li
              key={`${r.name}-${r.joinedAt}`}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-olive-900">{r.name}</p>
                <p className="text-xs text-olive-500">
                  Joined {formatDate(r.joinedAt)}
                </p>
              </div>
              {r.rewarded ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-olive-200 bg-olive-50 px-2.5 py-0.5 text-xs font-semibold text-olive-700">
                  <CheckCircle size={12} />+{r.rewardDays ?? data.rewardDays} days
                </span>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  <Clock size={12} />
                  Not paid yet
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
