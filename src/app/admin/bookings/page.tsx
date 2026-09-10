"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Trash2,
  CheckCircle,
  XCircle,
  Hourglass,
} from "lucide-react";
import { getBookings, updateBookingStatus, deleteBooking } from "@/lib/storage";
import { formatPrice } from "@/data/creators";
import { Booking } from "@/types";

const statusOptions: Booking["status"][] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

const statusConfig = {
  pending: { label: "Pending", icon: Hourglass, color: "text-amber-600" },
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "text-olive-600" },
  completed: { label: "Completed", icon: CheckCircle, color: "text-olive-700" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-600" },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<Booking["status"] | "all">("all");

  const load = async () => {
    const list = await getBookings();
    setBookings(list);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const handleStatusChange = async (id: string, status: Booking["status"]) => {
    await updateBookingStatus(id, status);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this booking?")) {
      await deleteBooking(id);
      await load();
    }
  };

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-olive-900">Bookings</h1>
        <p className="text-olive-600">Manage and update booking statuses</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", ...statusOptions] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === s
                ? "bg-olive-600 text-milky-50"
                : "bg-olive-100 text-olive-700 hover:bg-olive-200"
            }`}
          >
            {s}
            {s !== "all" && (
              <span className="ml-1 opacity-70">
                ({bookings.filter((b) => b.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-olive-200/70 bg-milky-50 p-12 text-center">
          <Calendar size={40} className="mx-auto mb-3 text-olive-300" />
          <p className="text-olive-600">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const status = statusConfig[booking.status];
            const StatusIcon = status.icon;
            return (
              <article
                key={booking.id}
                className="rounded-2xl border border-olive-200/70 bg-milky-50 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
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
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-medium ${status.color}`}
                    >
                      <StatusIcon size={14} />
                      {status.label}
                    </span>
                    <select
                      value={booking.status}
                      onChange={(e) =>
                        handleStatusChange(
                          booking.id,
                          e.target.value as Booking["status"]
                        )
                      }
                      className="rounded-lg border border-olive-200 bg-milky-50 px-2 py-1.5 text-sm text-olive-700 focus:border-olive-500 focus:outline-none"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDelete(booking.id)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
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
                  <div className="flex items-center gap-2 text-olive-600">
                    <Phone size={14} className="text-olive-400" />
                    {booking.clientPhone}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-olive-100 pt-3">
                  <p className="font-semibold text-olive-800">
                    {formatPrice(booking.price)}
                  </p>
                  {booking.notes && (
                    <p className="text-sm text-olive-500 max-w-md truncate">
                      {booking.notes}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
