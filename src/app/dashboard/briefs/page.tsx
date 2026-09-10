"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Inbox,
  MapPin,
  X,
} from "lucide-react";
import { getLoggedInCreator } from "@/lib/creator-auth";
import {
  budgetLabel,
  getCreatorInvites,
  respondToBrief,
} from "@/lib/briefs";
import type { Brief, BriefInvite, Creator } from "@/types";

type InviteRow = Brief & { myInvite: BriefInvite };

export default function CreativeBriefsPage() {
  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [rows, setRows] = useState<InviteRow[]>([]);

  const load = (creatorId: string) => {
    setRows(getCreatorInvites(creatorId));
  };

  useEffect(() => {
    void (async () => {
      const loggedIn = await getLoggedInCreator();
      if (!loggedIn) {
        router.replace("/signin");
        return;
      }
      setCreator(loggedIn);
      load(loggedIn.id);
    })();
  }, [router]);

  const handleRespond = (briefId: string, status: "accepted" | "declined") => {
    if (!creator) return;
    respondToBrief(briefId, creator.id, status);
    load(creator.id);
  };

  if (!creator) return null;

  const pending = rows.filter((r) => r.myInvite.status === "pending");
  const done = rows.filter((r) => r.myInvite.status !== "pending");

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-olive-600 hover:text-olive-800"
      >
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-olive-900">Incoming briefs</h1>
        <p className="text-olive-600 mt-1">
          Clients who match your craft. Accept to show interest — they&apos;ll book from your profile.
        </p>
      </div>

      {pending.length === 0 && done.length === 0 ? (
        <div className="rounded-2xl border border-olive-200/70 bg-milky-50 p-12 text-center">
          <Inbox size={40} className="mx-auto mb-3 text-olive-300" />
          <p className="font-medium text-olive-700">No briefs yet</p>
          <p className="text-sm text-olive-500 mt-1">
            When a client needs your category, their brief appears here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-olive-500 uppercase tracking-wide">
                Needs your reply
              </h2>
              {pending.map((brief) => (
                <article
                  key={brief.id}
                  className="rounded-2xl border border-olive-200/70 bg-milky-50 p-5 shadow-sm"
                >
                  <h3 className="font-semibold text-olive-900">
                    {brief.category} · {brief.occasion}
                  </h3>
                  <p className="mt-1 text-sm text-olive-600 flex items-center gap-1">
                    <MapPin size={14} />
                    {brief.state} · {brief.date} · {budgetLabel(brief.budget)}
                  </p>
                  <p className="mt-2 text-sm text-olive-700">
                    From <strong>{brief.clientName}</strong>
                  </p>
                  {brief.notes && (
                    <p className="mt-2 text-sm text-olive-500 border-t border-olive-100 pt-2">
                      {brief.notes}
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleRespond(brief.id, "accepted")}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-olive-600 py-2.5 text-sm font-semibold text-milky-50 hover:bg-olive-700"
                    >
                      <Check size={16} />
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespond(brief.id, "declined")}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-olive-200 py-2.5 text-sm font-semibold text-olive-700 hover:bg-olive-50"
                    >
                      <X size={16} />
                      Decline
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}

          {done.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-olive-500 uppercase tracking-wide">
                Responded
              </h2>
              {done.map((brief) => (
                <div
                  key={brief.id}
                  className="rounded-xl border border-olive-100 bg-white px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-olive-900">
                      {brief.occasion} · {brief.clientName}
                    </p>
                    <p className="text-xs text-olive-500">{brief.state}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold capitalize ${
                      brief.myInvite.status === "accepted"
                        ? "text-olive-700"
                        : "text-olive-400"
                    }`}
                  >
                    {brief.myInvite.status}
                  </span>
                </div>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
