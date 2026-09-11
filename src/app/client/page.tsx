"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus, MapPin, Clock, CheckCircle } from "lucide-react";
import { clientSignOut, getLoggedInClient } from "@/lib/client-auth";
import { budgetLabel, getClientBriefs } from "@/lib/briefs";
import type { Brief, ClientProfile } from "@/types";

export default function ClientHubPage() {
  const router = useRouter();
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [briefs, setBriefs] = useState<Brief[]>([]);

  useEffect(() => {
    void (async () => {
      const c = await getLoggedInClient();
      if (!c) {
        router.replace("/client/signin?next=/client");
        return;
      }
      setClient(c);
      setBriefs(getClientBriefs(c.id));
    })();
  }, [router]);

  const signOut = async () => {
    await clientSignOut();
    window.location.href = "/";
  };

  if (!client) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-olive-500">Client</p>
          <h1 className="text-2xl font-bold text-olive-900">Hi, {client.name}</h1>
          <p className="text-olive-600 text-sm mt-1">
            Your briefs and creative matches live here.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/brief"
            className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-4 py-2.5 text-sm font-semibold text-milky-50 hover:bg-olive-700"
          >
            <Plus size={16} />
            New brief
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-xl border border-olive-200 px-4 py-2.5 text-sm font-medium text-olive-700 hover:bg-olive-50"
          >
            Sign out
          </button>
        </div>
      </div>

      {briefs.length === 0 ? (
        <div className="rounded-2xl border border-olive-200/70 bg-milky-50 p-12 text-center">
          <FileText size={40} className="mx-auto mb-3 text-olive-300" />
          <p className="font-medium text-olive-700">No briefs yet</p>
          <p className="text-sm text-olive-500 mt-1 mb-5">
            Tell us what you need — we&apos;ll alert the right creatives.
          </p>
          <Link
            href="/brief"
            className="inline-flex rounded-xl bg-olive-600 px-5 py-2.5 text-sm font-semibold text-milky-50 hover:bg-olive-700"
          >
            Start a brief
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {briefs.map((brief) => {
            const accepted = brief.invites.filter((i) => i.status === "accepted").length;
            const pending = brief.invites.filter((i) => i.status === "pending").length;
            return (
              <Link
                key={brief.id}
                href={`/brief/${brief.id}`}
                className="block rounded-2xl border border-olive-200/70 bg-milky-50 p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-olive-900">
                      {brief.category} · {brief.occasion}
                    </h2>
                    <p className="mt-1 text-sm text-olive-600 flex items-center gap-1">
                      <MapPin size={14} />
                      {brief.state} · {budgetLabel(brief.budget)}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-olive-500">
                    {new Date(brief.createdAt).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium">
                  {accepted > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-olive-100 px-2.5 py-1 text-olive-700">
                      <CheckCircle size={12} />
                      {accepted} accepted
                    </span>
                  )}
                  {pending > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                      <Clock size={12} />
                      {pending} waiting
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-center text-sm text-olive-500">
        <Link href="/explore" className="font-medium text-olive-700 hover:underline">
          Explore creatives
        </Link>{" "}
        without a brief
      </p>
    </div>
  );
}
