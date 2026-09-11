"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Crown,
  MapPin,
  Star,
  XCircle,
  Phone,
} from "lucide-react";
import { budgetLabel, getBriefById, inviteIsVisible } from "@/lib/briefs";
import type { Brief } from "@/types";

export default function BriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [brief, setBrief] = useState<Brief | null>(null);

  useEffect(() => {
    setBrief(getBriefById(id) ?? null);
    const timer = setInterval(() => {
      setBrief(getBriefById(id) ?? null);
    }, 2000);
    return () => clearInterval(timer);
  }, [id]);

  if (!brief) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-olive-600">Brief not found.</p>
        <Link href="/brief" className="mt-4 inline-block text-olive-700 underline">
          Start a new brief
        </Link>
      </div>
    );
  }

  const accepted = brief.invites.filter((i) => i.status === "accepted");
  const pending = brief.invites.filter(
    (i) => i.status === "pending" && inviteIsVisible(brief, i)
  );
  const declined = brief.invites.filter((i) => i.status === "declined");
  const priorityCount = brief.invites.filter((i) => i.priority).length;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <Link
        href="/client"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-olive-600 hover:text-olive-800"
      >
        <ArrowLeft size={16} />
        My briefs
      </Link>

      <div className="rounded-2xl border border-olive-200/70 bg-milky-50 p-6 shadow-sm mb-6">
        <p className="text-sm font-medium text-olive-500">Your brief</p>
        <h1 className="mt-1 text-2xl font-bold text-olive-900">
          {brief.category} · {brief.occasion}
        </h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-olive-600">
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} />
            {brief.state}
          </span>
          <span>{brief.date === "Flexible" ? "Date flexible" : brief.date}</span>
          <span>{budgetLabel(brief.budget)}</span>
        </div>
        {brief.notes && (
          <p className="mt-3 text-sm text-olive-600 border-t border-olive-100 pt-3">
            {brief.notes}
          </p>
        )}
        <p className="mt-4 text-sm text-olive-700 bg-olive-50 rounded-xl px-4 py-3">
          {priorityCount > 0 ? (
            <>
              Subscribed creatives were notified first
              {priorityCount === 1
                ? " — 1 Pro/Premium match."
                : ` — ${priorityCount} Pro/Premium matches.`}{" "}
              If they don&apos;t reply in time, we open the brief to more
              creatives. Accepted ones appear below so you can book.
            </>
          ) : (
            <>
              We alerted <strong>{brief.invites.length}</strong> matching
              creative{brief.invites.length !== 1 ? "s" : ""}. They can accept
              or decline — accepted ones appear below so you can book.
            </>
          )}
        </p>
      </div>

      {accepted.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-olive-900 mb-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-olive-600" />
            Ready to book ({accepted.length})
          </h2>
          <div className="space-y-3">
            {accepted.map((invite) => (
              <article
                key={invite.creatorId}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-olive-300 bg-olive-50/50 p-4"
              >
                <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-olive-100 shrink-0">
                  {invite.creatorAvatar.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={invite.creatorAvatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={invite.creatorAvatar}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-olive-900">{invite.creatorName}</p>
                  <p className="text-sm text-olive-600">
                    {invite.category} · {invite.city}
                  </p>
                  <p className="text-sm text-olive-600 inline-flex items-center gap-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    {invite.rating || "New"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/creators/${invite.creatorId}`}
                    className="rounded-xl bg-olive-600 px-4 py-2 text-sm font-semibold text-milky-50 hover:bg-olive-700"
                  >
                    View & book
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-olive-900 mb-3 flex items-center gap-2">
            <Clock size={18} className="text-amber-600" />
            Waiting for reply ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((invite) => (
              <article
                key={invite.creatorId}
                className="flex items-center gap-4 rounded-2xl border border-olive-200/70 bg-milky-50 p-4"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-olive-100 shrink-0">
                  {invite.creatorAvatar.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={invite.creatorAvatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={invite.creatorAvatar}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-olive-900 inline-flex items-center gap-1.5">
                    {invite.creatorName}
                    {invite.priority && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-olive-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-olive-700">
                        <Crown size={10} />
                        Priority
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-olive-500">Brief sent · awaiting response</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {declined.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-olive-500 mb-2 flex items-center gap-2">
            <XCircle size={14} />
            Declined ({declined.length})
          </h2>
          <p className="text-sm text-olive-500">
            {declined.map((i) => i.creatorName).join(", ")}
          </p>
        </section>
      )}

      {accepted.length === 0 && pending.length === 0 && (
        <div className="rounded-2xl border border-dashed border-olive-300 p-8 text-center">
          <p className="text-olive-600">No creatives matched yet.</p>
          <Link
            href="/brief"
            className="mt-4 inline-block font-semibold text-olive-700 underline"
          >
            Try another brief
          </Link>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-olive-500 flex items-center justify-center gap-1">
        <Phone size={14} />
        Creatives may also reach you on WhatsApp at {brief.clientPhone}
      </p>
    </div>
  );
}
