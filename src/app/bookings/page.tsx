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
} from "lucide-react";
import { getBookings } from "@/lib/storage";
import { getLoggedInCreator } from "@/lib/creator-auth";
import { formatPrice } from "@/data/creators";
import { Booking, Creator } from "@/types";

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

export default function BookingsPage() {
  const [creator, setCreator] = useState<Creator | null | undefined>(undefined);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    getLoggedInCreator().then((loggedIn) => {
      setCreator(loggedIn ?? null);
    });
  }, []);

  useEffect(() => {
    if (!creator) {
      setBookings([]);
      return;
    }

    setLoadingBookings(true);
    getBookings(creator.id)
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoadingBookings(false));
  }, [creator]);

  if (creator === undefined) {
    return (
      <div className="mx-auto flex w-full max-w-6xl min-h-[calc(100vh-4rem)] items-center justify-center px-4 sm:px-6 py-8">
        <Loader2 className="animate-spin text-olive-500" size={28} />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="mx-auto flex w-full max-w-6xl min-h-[calc(100vh-4rem)] flex-col px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-olive-900">
            My Bookings
          </h1>
          <p className="mt-1 text-olive-600">
            Track your service bookings with creators across Nigeria.
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
              Log in or create an account to see booking requests, track status,
              and manage your schedule.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signin?next=/bookings"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-olive-600 px-6 py-3 text-sm font-semibold text-milky-50 hover:bg-olive-700"
              >
                <LogIn size={16} />
                Sign In
              </Link>
              <Link
                href="/register?next=/bookings"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-olive-200 bg-white px-6 py-3 text-sm font-semibold text-olive-700 hover:bg-olive-50"
              >
                <UserPlus size={16} />
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl min-h-[calc(100vh-4rem)] flex-col px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-olive-900">
          My Bookings
        </h1>
        <p className="mt-1 text-olive-600">
          Track booking requests for your services across Nigeria.
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
              When clients book your services, they&apos;ll show up here.
            </p>
            <Link
              href={`/creators/${creator.id}`}
              className="inline-block rounded-xl bg-olive-600 px-5 py-2.5 text-sm font-semibold text-milky-50 hover:bg-olive-700"
            >
              View your profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid flex-1 content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bookings.map((booking) => {
            const status = statusConfig[booking.status];
            const StatusIcon = status.icon;
            return (
              <article
                key={booking.id}
                className="rounded-2xl border border-olive-200/70 bg-milky-50 p-5 shadow-sm animate-fade-in"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-olive-900">
                      {booking.serviceName}
                    </h3>
                    <p className="text-sm text-olive-600">
                      Client: {booking.clientName}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.color}`}
                  >
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-olive-600">
                    <Calendar size={14} className="text-olive-400" />
                    {new Date(booking.date).toLocaleDateString("en-NG", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
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
                    {formatPrice(booking.price)}
                  </div>
                </div>

                {booking.notes && (
                  <p className="mt-3 border-t border-olive-100 pt-3 text-sm text-olive-500">
                    {booking.notes}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
