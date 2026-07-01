"use client";

import { Service } from "@/types";
import { formatPrice, getDiscountPercent } from "@/data/creators";
import { Clock, Tag } from "lucide-react";

interface ServiceCardProps {
  service: Service;
  selected?: boolean;
  onSelect?: () => void;
  showBookButton?: boolean;
}

export function ServiceCard({
  service,
  selected,
  onSelect,
  showBookButton = true,
}: ServiceCardProps) {
  const hasDiscount = service.discountPrice != null;
  const displayPrice = hasDiscount ? service.discountPrice! : service.price;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        selected
          ? "border-olive-500 bg-olive-50 ring-2 ring-olive-300"
          : "border-olive-200/70 bg-milky-50 hover:border-olive-300"
      } ${onSelect ? "cursor-pointer" : ""}`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.()}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-olive-900">{service.name}</h4>
          <p className="mt-1 text-sm text-olive-600 leading-relaxed">
            {service.description}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-olive-500">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {service.duration}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          {hasDiscount && (
            <p className="text-sm text-olive-400 line-through">
              {formatPrice(service.price)}
            </p>
          )}
          <p className="text-lg font-bold text-olive-800">
            {formatPrice(displayPrice)}
          </p>
          {hasDiscount && (
            <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-olive-600 px-2 py-0.5 text-xs font-semibold text-milky-50">
              <Tag size={10} />
              {getDiscountPercent(service.price, service.discountPrice!)}% off
            </span>
          )}
        </div>
      </div>

      {showBookButton && onSelect && (
        <button
          type="button"
          className={`mt-3 w-full rounded-lg py-2 text-sm font-medium transition-colors ${
            selected
              ? "bg-olive-600 text-milky-50"
              : "bg-olive-100 text-olive-700 hover:bg-olive-200"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {selected ? "Selected" : "Select Service"}
        </button>
      )}
    </div>
  );
}
