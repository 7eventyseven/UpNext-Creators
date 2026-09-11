"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { apiSend } from "@/lib/api-client";
import { formatPrice } from "@/data/creators";
import type { Booking } from "@/types";

function BookingConfirmationInner() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "error">(
    reference ? "loading" : "error"
  );
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState(
    reference ? "" : "No payment reference was found."
  );

  useEffect(() => {
    if (!reference) return;

    (async () => {
      try {
        const data = await apiSend<{
          ok: boolean;
          kind: string;
          booking?: Booking;
        }>("/api/payments/verify", "POST", { reference });
        if (data.kind !== "booking" || !data.booking) {
          throw new Error("This payment is not a booking.");
        }
        setBooking(data.booking);
        setStatus("ok");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not confirm payment."
        );
        setStatus("error");
      }
    })();
  }, [reference]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-olive-600" size={32} />
          <p className="text-olive-600">Confirming your payment…</p>
        </div>
      )}

      {status === "ok" && booking && (
        <div className="animate-fade-in">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-olive-100">
            <CheckCircle size={32} className="text-olive-600" />
          </div>
          <h1 className="text-2xl font-bold text-olive-900">Booking confirmed</h1>
          <p className="mt-3 text-olive-600 leading-relaxed">
            Payment of {formatPrice(booking.price)} went to UpNext via Paystack.
            {booking.creatorName} has been booked for {booking.serviceName}.
          </p>
          <Link
            href={`/creators/${booking.creatorId}`}
            className="mt-6 inline-block rounded-xl bg-olive-600 px-6 py-3 font-semibold text-milky-50 hover:bg-olive-700"
          >
            Back to profile
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="animate-fade-in">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <XCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-olive-900">Payment not confirmed</h1>
          <p className="mt-3 text-olive-600">{error}</p>
          <Link
            href="/"
            className="mt-6 inline-block font-semibold text-olive-700 underline"
          >
            Go home
          </Link>
        </div>
      )}
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-olive-600" size={32} />
        </div>
      }
    >
      <BookingConfirmationInner />
    </Suspense>
  );
}
