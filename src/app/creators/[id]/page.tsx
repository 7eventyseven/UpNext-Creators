"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  MapPin,
  MessageCircle,
  Phone,
  Crown,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { getCreatorById, getWhatsAppLink, formatPrice } from "@/data/creators";
import { ServiceCard } from "@/components/ServiceCard";
import { BookingModal } from "@/components/BookingModal";
import { getOrCreateConversation } from "@/lib/storage";
import { Service } from "@/types";

export default function CreatorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const creator = getCreatorById(id);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  if (!creator) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-olive-600 text-lg">Creator not found.</p>
        <Link href="/" className="mt-4 inline-block text-olive-600 underline">
          Back to creators
        </Link>
      </div>
    );
  }

  const whatsappMessage = `Hi ${creator.name}, I found you on UpNext Creators and I'd like to inquire about your services.`;

  const handleChat = () => {
    getOrCreateConversation(creator.id, creator.name, creator.avatar);
    window.location.href = `/chat?creator=${creator.id}`;
  };

  const handleBook = () => {
    if (selectedService) {
      setShowBooking(true);
    }
  };

  return (
    <div className="pb-24">
      <div className="relative h-48 sm:h-64 bg-olive-100">
        <Image
          src={creator.coverImage}
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-olive-900/60 to-olive-900/20" />
        <Link
          href="/"
          className="absolute top-4 left-4 flex items-center gap-1.5 rounded-lg bg-milky-100/90 px-3 py-1.5 text-sm font-medium text-olive-700 backdrop-blur-sm hover:bg-milky-50"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative -mt-16 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-milky-100 shadow-lg bg-milky-100">
            <Image
              src={creator.avatar}
              alt={creator.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-olive-900">
                {creator.name}
              </h1>
              {creator.isSubscribed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-olive-600 px-2.5 py-0.5 text-xs font-semibold text-milky-50">
                  <Crown size={12} />
                  {creator.subscriptionTier === "premium" ? "Top Creator" : "Pro"}
                </span>
              )}
              <span className="rounded-full bg-olive-100 px-2.5 py-0.5 text-xs font-bold text-olive-700">
                Rank #{creator.rank}
              </span>
            </div>
            <p className="text-olive-500">@{creator.username}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-olive-600">
          <span className="flex items-center gap-1">
            <Star size={16} className="fill-amber-400 text-amber-400" />
            <strong className="text-olive-800">{creator.rating}</strong>
            ({creator.reviewCount} reviews)
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle size={16} className="text-olive-500" />
            {creator.completedBookings} bookings
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={16} />
            {creator.location}
          </span>
        </div>

        <p className="mt-1 text-sm font-medium text-olive-600">{creator.category}</p>

        <p className="mt-4 text-olive-700 leading-relaxed max-w-2xl">
          {creator.bio}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {creator.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-olive-50 border border-olive-200 px-3 py-0.5 text-xs font-medium text-olive-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleChat}
            className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-5 py-2.5 text-sm font-semibold text-milky-50 hover:bg-olive-700 transition-colors"
          >
            <MessageCircle size={18} />
            Chat
          </button>
          <a
            href={getWhatsAppLink(creator.whatsapp, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-olive-300 bg-milky-50 px-5 py-2.5 text-sm font-semibold text-olive-700 hover:bg-olive-50 transition-colors"
          >
            <Phone size={18} />
            WhatsApp
          </a>
        </div>

        {booked && (
          <div className="mt-4 rounded-xl bg-olive-50 border border-olive-200 px-4 py-3 text-sm text-olive-700 flex items-center gap-2">
            <CheckCircle size={18} className="text-olive-600 shrink-0" />
            Booking confirmed! Check your bookings tab for details.
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-xl font-bold text-olive-900 mb-4">Services & Pricing</h2>
          <div className="space-y-3">
            {creator.services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                selected={selectedService?.id === service.id}
                onSelect={() =>
                  setSelectedService(
                    selectedService?.id === service.id ? null : service
                  )
                }
              />
            ))}
          </div>
        </section>
      </div>

      {selectedService && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-olive-200 bg-milky-100/95 backdrop-blur-md p-4">
          <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-olive-500">Selected</p>
              <p className="font-semibold text-olive-900">{selectedService.name}</p>
              <p className="text-olive-700 font-bold">
                {formatPrice(selectedService.discountPrice ?? selectedService.price)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleBook}
              className="shrink-0 rounded-xl bg-olive-600 px-6 py-3 font-semibold text-milky-50 hover:bg-olive-700 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      )}

      {showBooking && selectedService && (
        <BookingModal
          creator={creator}
          service={selectedService}
          onClose={() => setShowBooking(false)}
          onSuccess={() => setBooked(true)}
        />
      )}
    </div>
  );
}
