"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { apiGet, apiSend } from "@/lib/api-client";
import { formatPrice } from "@/data/creators";

type RequestSummary = {
  id: string;
  creatorName: string;
  serviceName: string;
  clientName: string;
  date: string;
  time: string;
  notes: string;
  price: number;
  creatorPayout: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

type Outcome = "accept" | "decline" | null;

function RespondInner() {
  const token = useSearchParams().get("token") ?? "";
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(token ? "" : "This link is missing its token.");
  const [booking, setBooking] = useState<RequestSummary | null>(null);
  const [busy, setBusy] = useState<Outcome>(null);
  const [done, setDone] = useState<Outcome>(null);
  const [refundFailed, setRefundFailed] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiGet<{ booking: RequestSummary }>(
      `/api/bookings/respond?token=${encodeURIComponent(token)}`
    )
      .then((data) => setBooking(data.booking))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load booking.")
      )
      .finally(() => setLoading(false));
  }, [token]);

  const respond = async (action: "accept" | "decline") => {
    setBusy(action);
    setError("");
    try {
      const data = await apiSend<{ refundFailed: boolean }>(
        "/api/bookings/respond",
        "POST",
        { token, action }
      );
      setRefundFailed(data.refundFailed);
      setDone(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin text-olive-600" size={32} />
      </div>
    );
  }

  if (done) {
    const accepted = done === "accept";
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center animate-fade-in">
        <div
          className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${accepted ? "bg-olive-100" : "bg-red-50"}`}
        >
          {accepted ? (
            <CheckCircle size={32} className="text-olive-600" />
          ) : (
            <XCircle size={32} className="text-red-500" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-olive-900">
          {accepted ? "Booking accepted" : "Booking declined"}
        </h1>
        <p className="mt-3 text-olive-600 leading-relaxed">
          {accepted
            ? `${booking ? formatPrice(booking.creatorPayout) : "Your share"} has been added to your earnings and the client has been notified.`
            : "The client has been notified and refunded."}
        </p>
        {refundFailed && (
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            The automatic refund didn&apos;t go through. UpNext will refund the
            client manually.
          </p>
        )}
        <Link
          href="/dashboard/earnings"
          className="mt-6 inline-block rounded-xl bg-olive-600 px-6 py-3 font-semibold text-milky-50 hover:bg-olive-700"
        >
          Go to my dashboard
        </Link>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-olive-900">Link not valid</h1>
        <p className="mt-3 text-olive-600">{error}</p>
        <Link
          href="/dashboard/bookings"
          className="mt-6 inline-block font-semibold text-olive-700 underline"
        >
          Open my bookings
        </Link>
      </div>
    );
  }

  const answered = booking.status !== "pending";
  const rows: [string, string][] = [
    ["Service", booking.serviceName],
    ["Client", booking.clientName],
    ["Date", booking.date],
    ["Time", booking.time],
    ["Client paid", formatPrice(booking.price)],
    ["You receive", formatPrice(booking.creatorPayout)],
  ];
  if (booking.notes) rows.push(["Notes", booking.notes]);

  return (
    <div className="mx-auto max-w-lg px-4 py-12 animate-fade-in">
      <h1 className="text-2xl font-bold text-olive-900">New booking request</h1>
      <p className="mt-1 text-olive-600">
        Hi {booking.creatorName}, please accept or decline this booking.
      </p>

      <dl className="mt-6 divide-y divide-olive-100 rounded-2xl border border-olive-200/70 bg-milky-50 px-5 shadow-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-3 text-sm">
            <dt className="text-olive-500">{label}</dt>
            <dd className="text-right font-semibold text-olive-900">{value}</dd>
          </div>
        ))}
      </dl>

      {answered ? (
        <p className="mt-6 rounded-xl bg-olive-50 px-4 py-3 text-sm text-olive-700">
          This booking has already been{" "}
          {booking.status === "cancelled" ? "declined" : "accepted"}.
        </p>
      ) : (
        <>
          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => respond("accept")}
              className="flex items-center justify-center gap-2 rounded-xl bg-olive-600 py-3 font-semibold text-milky-50 hover:bg-olive-700 disabled:opacity-60"
            >
              {busy === "accept" ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              Accept
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => respond("decline")}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-3 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              {busy === "decline" ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
              Decline
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-olive-500">
            Declining refunds the client automatically.
          </p>
        </>
      )}
    </div>
  );
}

export default function BookingRespondPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-olive-600" size={32} />
        </div>
      }
    >
      <RespondInner />
    </Suspense>
  );
}
