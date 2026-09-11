"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Hourglass,
  LogIn,
  UserPlus,
  Loader2,
  Star,
} from "lucide-react";
import { getBookings, submitReview } from "@/lib/storage";
import { getLoggedInCreator } from "@/lib/creator-auth";
import { getLoggedInClient } from "@/lib/client-auth";
import { RatingStars } from "@/components/RatingStars";
import { formatPrice } from "@/data/creators";
import { Booking, ClientProfile, Creator } from "@/types";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Hourglass,
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-olive-600 bg-olive-50 border-olive-200",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "text-olive-700 bg-olive-100 border-olive-300",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600 bg-red-50 border-red-200",
  },
};

function StatusBadge({ status }: { status: Booking["status"] }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.color}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** A client's booking, with the rating they can leave or change. */
function ClientBookingCard({ booking }: { booking: Booking }) {
  const [rating, setRating] = useState(booking.reviewRating ?? 0);
  const [comment, setComment] = useState(booking.reviewComment ?? "");
  const [editing, setEditing] = useState(!booking.reviewRating);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(Boolean(booking.reviewRating));
  const [error, setError] = useState("");

  const rateable =
    booking.status === "confirmed" || booking.status === "completed";

  const save = async (nextRating: number) => {
    setRating(nextRating);
    setError("");
    setSaving(true);
    try {
      await submitReview({
        bookingId: booking.id,
        rating: nextRating,
        comment,
      });
      setSaved(true);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save rating.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="rounded-2xl border border-olive-200/70 bg-milky-50 p-5 shadow-sm animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-olive-900">{booking.serviceName}</h3>
          <Link
            href={`/creators/${booking.creatorId}`}
            className="text-sm text-olive-600 hover:text-olive-800 hover:underline"
          >
            with {booking.creatorName}
          </Link>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-olive-600">
          <Calendar size={14} className="text-olive-400" />
          {formatDate(booking.date)}
        </div>
        <div className="flex items-center gap-2 text-olive-600">
          <Clock size={14} className="text-olive-400" />
          {booking.time}
        </div>
        <div className="font-semibold text-olive-800">
          {formatPrice(booking.price)}
        </div>
        {booking.paymentStatus === "paid" && (
          <div className="text-xs font-medium text-olive-500">Paid</div>
        )}
      </div>

      {booking.notes && (
        <p className="mt-3 border-t border-olive-100 pt-3 text-sm text-olive-500">
          {booking.notes}
        </p>
      )}

      <div className="mt-4 border-t border-olive-100 pt-4">
        {!rateable ? (
          <p className="text-xs text-olive-500">
            You can rate {booking.creatorName.split(" ")[0]} once this booking
            is confirmed.
          </p>
        ) : !editing ? (
          <div className="flex flex-wrap items-center gap-3">
            <RatingStars value={rating} size={18} />
            <span className="text-xs text-olive-500">
              {saved ? "Your rating" : ""}
            </span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs font-semibold text-olive-700 hover:underline"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium text-olive-700">
                Rate {booking.creatorName.split(" ")[0]}
              </p>
              <RatingStars
                value={rating}
                onChange={(next) => void save(next)}
                size={20}
                disabled={saving}
              />
              {saving && (
                <Loader2 size={14} className="animate-spin text-olive-500" />
              )}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onBlur={() => rating > 0 && void save(rating)}
              rows={2}
              maxLength={600}
              placeholder="Anything you'd tell another client? (optional)"
              className="w-full rounded-xl border border-olive-200 bg-white px-3 py-2 text-sm text-olive-900 placeholder:text-olive-400 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
            />
          </div>
        )}

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </article>
  );
}

/** A booking for one of the signed-in creator's services. */
function CreatorBookingCard({ booking }: { booking: Booking }) {
  return (
    <article className="rounded-2xl border border-olive-200/70 bg-milky-50 p-5 shadow-sm animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-olive-900">{booking.serviceName}</h3>
          <p className="text-sm text-olive-600">Client: {booking.clientName}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-olive-600">
          <Calendar size={14} className="text-olive-400" />
          {formatDate(booking.date)}
        </div>
        <div className="flex items-center gap-2 text-olive-600">
          <Clock size={14} className="text-olive-400" />
          {booking.time}
        </div>
        <div className="flex items-center gap-2 text-olive-600">
          <User size={14} className="text-olive-400" />
          {booking.clientPhone}
        </div>
        <div className="font-semibold text-olive-800">
          {formatPrice(booking.creatorPayout ?? booking.price)}
        </div>
      </div>

      {booking.notes && (
        <p className="mt-3 border-t border-olive-100 pt-3 text-sm text-olive-500">
          {booking.notes}
        </p>
      )}
    </article>
  );
}

export default function BookingsPage() {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [resolved, setResolved] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    void (async () => {
      const [loggedInCreator, loggedInClient] = await Promise.all([
        getLoggedInCreator(),
        getLoggedInClient(),
      ]);
      setCreator(loggedInCreator ?? null);
      setClient(loggedInClient ?? null);
      setResolved(true);
    })();
  }, []);

  useEffect(() => {
    if (!resolved || (!creator && !client)) {
      setBookings([]);
      return;
    }

    setLoadingBookings(true);
    getBookings()
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoadingBookings(false));
  }, [resolved, creator, client]);

  if (!resolved) {
    return (
      <div className="mx-auto flex w-full max-w-6xl min-h-[calc(100vh-4rem)] items-center justify-center px-4 sm:px-6 py-8">
        <Loader2 className="animate-spin text-olive-500" size={28} />
      </div>
    );
  }

  if (!creator && !client) {
    return (
      <div className="mx-auto flex w-full max-w-6xl min-h-[calc(100vh-4rem)] flex-col px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-olive-900">
            My Bookings
          </h1>
          <p className="mt-1 text-olive-600">
            Track your bookings with creatives across Nigeria.
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full rounded-3xl border border-olive-200/70 bg-milky-50 px-6 py-14 sm:px-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-olive-100 text-olive-700">
              <Calendar size={28} aria-hidden />
            </div>
            <h2 className="text-xl font-bold text-olive-900">
              Sign in to view your bookings
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm sm:text-base text-olive-600 leading-relaxed">
              Log in to see your bookings, track their status, and rate the
              creatives you worked with.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/client/signin?next=/bookings"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-olive-600 px-6 py-3 text-sm font-semibold text-milky-50 hover:bg-olive-700"
              >
                <LogIn size={16} />
                I booked a creative
              </Link>
              <Link
                href="/signin?next=/bookings"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-olive-200 bg-white px-6 py-3 text-sm font-semibold text-olive-700 hover:bg-olive-50"
              >
                <UserPlus size={16} />
                I am a creative
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isClientView = Boolean(client && !creator);

  return (
    <div className="mx-auto flex w-full max-w-6xl min-h-[calc(100vh-4rem)] flex-col px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-olive-900">
          My Bookings
        </h1>
        <p className="mt-1 text-olive-600">
          {isClientView
            ? "Everything you've booked — and a place to rate the creatives you worked with."
            : "Track booking requests for your services across Nigeria."}
        </p>
      </div>

      {loadingBookings ? (
        <div className="flex flex-1 items-center justify-center text-olive-500">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full rounded-3xl border border-olive-200/70 bg-milky-50 px-6 py-14 text-center shadow-sm">
            <Calendar size={48} className="mx-auto mb-4 text-olive-300" />
            <p className="font-medium text-olive-700">No bookings yet</p>
            <p className="mt-1 mb-5 text-sm text-olive-500">
              {isClientView
                ? "Once you book a creative, it'll show up here so you can track and rate it."
                : "When clients book your services, they'll show up here."}
            </p>
            <Link
              href={isClientView ? "/brief" : `/creators/${creator?.id}`}
              className="inline-block rounded-xl bg-olive-600 px-5 py-2.5 text-sm font-semibold text-milky-50 hover:bg-olive-700"
            >
              {isClientView ? "Start a brief" : "View your profile"}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid flex-1 content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bookings.map((booking) =>
            isClientView ? (
              <ClientBookingCard key={booking.id} booking={booking} />
            ) : (
              <CreatorBookingCard key={booking.id} booking={booking} />
            )
          )}
        </div>
      )}

      {isClientView && bookings.length > 0 && (
        <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-olive-500">
          <Star size={14} className="text-amber-400" />
          Your ratings feed each creative&apos;s public score.
        </p>
      )}
    </div>
  );
}
