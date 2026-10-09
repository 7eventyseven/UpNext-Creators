"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Wallet,
  XCircle,
} from "lucide-react";
import { apiGet, apiSend } from "@/lib/api-client";
import { getLoggedInCreator } from "@/lib/creator-auth";
import { formatPrice } from "@/data/creators";
import type { Booking } from "@/types";

const statusStyle: Record<Booking["status"], string> = {
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  confirmed: "text-olive-700 bg-olive-50 border-olive-200",
  completed: "text-olive-800 bg-olive-100 border-olive-300",
  cancelled: "text-red-600 bg-red-50 border-red-200",
};

const statusLabel: Record<Booking["status"], string> = {
  pending: "Awaiting your response",
  confirmed: "Accepted",
  completed: "Completed",
  cancelled: "Declined / cancelled",
};

/** Ticks down from the server's seconds-left; the server enforces the deadline. */
function Countdown({
  seconds,
  onDone,
}: {
  seconds: number;
  onDone: () => void;
}) {
  const [left, setLeft] = useState(seconds);
  const fired = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setLeft(seconds);
    fired.current = false;
  }, [seconds]);

  useEffect(() => {
    if (left <= 0) {
      if (!fired.current) {
        fired.current = true;
        onDoneRef.current();
      }
      return;
    }
    const timer = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);

  const m = Math.floor(left / 60);
  const s = String(left % 60).padStart(2, "0");
  return (
    <p
      className={`mt-3 rounded-lg px-3 py-2 text-center text-sm font-semibold ${left <= 300 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}
    >
      Respond within {m}:{s} or it is cancelled and refunded
    </p>
  );
}

export default function CreatorBookingsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const data = await apiGet<{ bookings: Booking[] }>("/api/bookings");
    // Unpaid rows can't exist from checkout, but never show them as requests.
    setBookings(data.bookings.filter((b) => b.paymentStatus === "paid"));
  }, []);

  useEffect(() => {
    getLoggedInCreator().then(async (creator) => {
      if (!creator) {
        router.replace("/signin");
        return;
      }
      setReady(true);
      try {
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load bookings.");
      } finally {
        setLoading(false);
      }
    });
  }, [router, load]);

  const respond = async (id: string, action: "accept" | "decline") => {
    setBusyId(id);
    setError("");
    setNotice("");
    try {
      const data = await apiSend<{ refundFailed?: boolean }>(
        "/api/bookings",
        "PATCH",
        { id, action }
      );
      setNotice(
        action === "accept"
          ? "Booking accepted. Your earnings have been updated."
          : data.refundFailed
            ? "Booking declined, but the automatic refund failed. UpNext will refund the client manually."
            : "Booking declined and the client has been refunded."
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update booking.");
      await load().catch(() => undefined);
    } finally {
      setBusyId(null);
    }
  };

  if (!ready) return null;

  const pending = bookings.filter((b) => b.status === "pending");
  const others = bookings.filter((b) => b.status !== "pending");

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-olive-900 sm:text-2xl">Bookings</h1>
          <p className="text-sm text-olive-600 sm:text-base">
            Accept or decline requests from clients who have already paid.
          </p>
        </div>
        <Link
          href="/dashboard/earnings"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-olive-200 px-4 py-2.5 text-sm font-medium text-olive-700 hover:bg-olive-50"
        >
          <Wallet size={16} />
          Earnings
        </Link>
      </div>

      {notice && (
        <p className="mb-4 rounded-xl bg-olive-50 px-4 py-3 text-sm text-olive-700">
          {notice}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-olive-600" size={28} />
        </div>
      ) : bookings.length === 0 ? (
        <p className="rounded-2xl border border-olive-200/70 bg-milky-50 px-4 py-12 text-center text-olive-500">
          No bookings yet. They will appear here, and in your email, as soon as
          a client books and pays.
        </p>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-700">
                Needs your response ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((b) => (
                  <BookingCard key={b.id} booking={b}>
                    <Countdown
                      seconds={b.secondsLeft ?? 0}
                      onDone={() => {
                        // Time's up: the server cancels + refunds, so reload.
                        load().catch(() => undefined);
                      }}
                    />
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => respond(b.id, "accept")}
                        className="flex items-center justify-center gap-2 rounded-xl bg-olive-600 py-2.5 text-sm font-semibold text-milky-50 hover:bg-olive-700 disabled:opacity-60"
                      >
                        {busyId === b.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Decline this booking? The client will be refunded in full."
                            )
                          ) {
                            respond(b.id, "decline");
                          }
                        }}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        <XCircle size={16} />
                        Decline
                      </button>
                    </div>
                  </BookingCard>
                ))}
              </div>
            </section>
          )}

          {others.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-olive-500">
                History
              </h2>
              <div className="space-y-3">
                {others.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({
  booking,
  children,
}: {
  booking: Booking;
  children?: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-olive-200/70 bg-milky-50 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col-reverse items-start gap-2 sm:flex-row sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h3 className="break-words font-semibold text-olive-900">{booking.serviceName}</h3>
          <p className="break-words text-sm text-olive-600">for {booking.clientName}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyle[booking.status]}`}
        >
          {booking.expired ? "Expired (refunded)" : statusLabel[booking.status]}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="flex items-center gap-2 text-olive-600">
          <Calendar size={14} className="text-olive-400" />
          {booking.date}
        </div>
        <div className="flex items-center gap-2 text-olive-600">
          <Clock size={14} className="text-olive-400" />
          {booking.time}
        </div>
        <div className="text-olive-600">
          Client paid{" "}
          <span className="font-semibold text-olive-800">
            {formatPrice(booking.price)}
          </span>
        </div>
        <div className="text-olive-600">
          You receive{" "}
          <span className="font-semibold text-olive-800">
            {formatPrice(booking.creatorPayout ?? booking.price)}
          </span>
        </div>
      </div>

      {booking.notes && (
        <p className="mt-3 break-words border-t border-olive-100 pt-3 text-sm text-olive-500">
          {booking.notes}
        </p>
      )}

      {booking.status === "cancelled" && booking.refundStatus === "failed" && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          The automatic refund failed; UpNext will refund the client manually.
        </p>
      )}

      {children}
    </article>
  );
}
