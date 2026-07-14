"use client";

import { useState } from "react";
import { X, Calendar, Clock, User, Phone, MessageSquare, Loader2 } from "lucide-react";
import { Creator, Service } from "@/types";
import { formatPrice } from "@/data/creators";
import { saveBooking } from "@/lib/storage";

interface BookingModalProps {
  creator: Creator;
  service: Service;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({
  creator,
  service,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    date: "",
    time: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const price = service.discountPrice ?? service.price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.clientName || !form.clientPhone || !form.date || !form.time) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      await saveBooking({
        creatorId: creator.id,
        creatorName: creator.name,
        serviceId: service.id,
        serviceName: service.name,
        price,
        date: form.date,
        time: form.time,
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        notes: form.notes,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create booking.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-olive-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-milky-50 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-olive-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-olive-900">Book Service</h2>
            <p className="text-sm text-olive-500">{service.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-olive-500 hover:bg-olive-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="rounded-xl bg-olive-50 p-4">
            <p className="text-sm text-olive-600">with {creator.name}</p>
            <p className="text-2xl font-bold text-olive-800 mt-1">
              {formatPrice(price)}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-olive-700 mb-1.5">
              <User size={14} />
              Your Name *
            </label>
            <input
              type="text"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              className="w-full rounded-lg border border-olive-200 bg-milky-50 px-3 py-2.5 text-olive-900 placeholder:text-olive-400 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-olive-700 mb-1.5">
              <Phone size={14} />
              Phone Number *
            </label>
            <input
              type="tel"
              value={form.clientPhone}
              onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
              className="w-full rounded-lg border border-olive-200 bg-milky-50 px-3 py-2.5 text-olive-900 placeholder:text-olive-400 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
              placeholder="08012345678"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-olive-700 mb-1.5">
                <Calendar size={14} />
                Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-olive-200 bg-milky-50 px-3 py-2.5 text-olive-900 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-olive-700 mb-1.5">
                <Clock size={14} />
                Time *
              </label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full rounded-lg border border-olive-200 bg-milky-50 px-3 py-2.5 text-olive-900 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-olive-700 mb-1.5">
              <MessageSquare size={14} />
              Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-olive-200 bg-milky-50 px-3 py-2.5 text-olive-900 placeholder:text-olive-400 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 resize-none"
              placeholder="Any special requests or details..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-olive-600 py-3 font-semibold text-milky-50 transition-colors hover:bg-olive-700 disabled:opacity-60"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {submitting ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
