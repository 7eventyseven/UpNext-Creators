"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, User, CheckCircle, XCircle, Hourglass } from "lucide-react";
import { getBookings } from "@/lib/storage";
import { formatPrice } from "@/data/creators";
import { Booking } from "@/types";

const statusConfig = {
  pending: { label: "Pending", icon: Hourglass, color: "text-amber-600 bg-amber-50 border-amber-200" },
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "text-olive-600 bg-olive-50 border-olive-200" },
  completed: { label: "Completed", icon: CheckCircle, color: "text-olive-700 bg-olive-100 border-olive-300" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setBookings(getBookings());
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-olive-900 mb-2">My Bookings</h1>
      <p className="text-olive-600 mb-8">Track your service bookings with creators across Nigeria.</p>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-olive-200/70 bg-milky-50 p-12 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-olive-300" />
          <p className="text-olive-600 font-medium">No bookings yet</p>
          <p className="text-sm text-olive-500 mt-1 mb-5">
            Browse creators and book a service to get started.
          </p>
          <Link
            href="/"
            className="inline-block rounded-xl bg-olive-600 px-5 py-2.5 text-sm font-semibold text-milky-50 hover:bg-olive-700"
          >
            Browse Creators
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
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
                    <Link
                      href={`/creators/${booking.creatorId}`}
                      className="text-sm text-olive-600 hover:text-olive-800"
                    >
                      with {booking.creatorName}
                    </Link>
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
                    {booking.clientName}
                  </div>
                  <div className="font-semibold text-olive-800">
                    {formatPrice(booking.price)}
                  </div>
                </div>

                {booking.notes && (
                  <p className="mt-3 text-sm text-olive-500 border-t border-olive-100 pt-3">
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
