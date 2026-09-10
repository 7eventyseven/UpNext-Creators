export { seedCreators } from "@/data/seed-creators";

export {
  getAllCreators,
  getCreatorById,
  getSortedCreators,
  getCities,
  saveCreator,
  deleteCreator,
} from "@/lib/creator-store";

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${cleanPhone}${encodedMessage}`;
}

/** Display a stored WhatsApp number nicely (e.g. +234 803 456 7890). */
export function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return phone;

  if (digits.startsWith("234") && digits.length >= 13) {
    const rest = digits.slice(3);
    return `+234 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`.trim();
  }

  if (digits.startsWith("0") && digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  if (digits.length > 6) {
    return `+${digits}`;
  }

  return phone;
}

export function getDiscountPercent(price: number, discountPrice: number): number {
  return Math.round(((price - discountPrice) / price) * 100);
}
