import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Crown, BadgeCheck } from "lucide-react";
import { Creator } from "@/types";
import { formatPrice } from "@/data/creators";

interface CreatorCardProps {
  creator: Creator;
  index?: number;
}

export function CreatorCard({ creator, index = 0 }: CreatorCardProps) {
  const lowestPrice = Math.min(
    ...creator.services.map((s) => s.discountPrice ?? s.price)
  );
  const hasDiscount = creator.services.some((s) => s.discountPrice);

  return (
    <Link
      href={`/creators/${creator.id}`}
      className="group block animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <article className="overflow-hidden rounded-2xl border border-olive-200/70 bg-milky-50 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-olive-300 hover:-translate-y-0.5">
        <div className="relative h-36 overflow-hidden bg-olive-100">
          <Image
            src={creator.coverImage}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-olive-900/50 to-transparent" />

          {creator.isSubscribed && (
            <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-olive-600/90 px-2.5 py-1 text-xs font-semibold text-milky-50 backdrop-blur-sm">
              <Crown size={12} />
              {creator.subscriptionTier === "premium" ? "Top Creator" : "Pro"}
            </div>
          )}

          <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-milky-100/95 text-sm font-bold text-olive-700 shadow-sm">
            #{creator.rank}
          </div>

          <div className="absolute -bottom-6 left-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-xl border-3 border-milky-50 shadow-md bg-milky-100">
              <Image
                src={creator.avatar}
                alt={creator.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 pt-9">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-olive-900 group-hover:text-olive-600 transition-colors flex items-center gap-1">
                {creator.name}
                {creator.isSubscribed && (
                  <BadgeCheck size={16} className="text-olive-500 shrink-0" />
                )}
              </h3>
              <p className="text-sm text-olive-500">@{creator.username}</p>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-olive-50 px-2 py-1 text-sm">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="font-medium text-olive-800">{creator.rating}</span>
            </div>
          </div>

          <p className="mt-1 text-xs font-medium text-olive-600 bg-olive-50 inline-block rounded-md px-2 py-0.5">
            {creator.category}
          </p>

          <div className="mt-2 flex items-center gap-1 text-xs text-olive-500">
            <MapPin size={12} />
            {creator.location}
          </div>

          <p className="mt-2 text-sm text-olive-600 line-clamp-2 leading-relaxed">
            {creator.bio}
          </p>

          <div className="mt-3 flex items-center justify-between border-t border-olive-100 pt-3">
            <div>
              <span className="text-xs text-olive-500">From</span>
              <p className="font-semibold text-olive-800">{formatPrice(lowestPrice)}</p>
            </div>
            {hasDiscount && (
              <span className="rounded-full bg-olive-600 px-2.5 py-0.5 text-xs font-semibold text-milky-50">
                Deals
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
