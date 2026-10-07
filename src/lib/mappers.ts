import type {
  Booking,
  ChatMessage,
  ClientProfile,
  Conversation,
  Creator,
  CreatorVideo,
  PayoutAccount,
  Review,
  Service,
  Withdrawal,
} from "@/types";

export type SubscriptionTier = "free" | "pro" | "premium";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface AdminRow {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientRow {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryRow {
  id: string;
  name: string;
  createdAt: Date;
}

export interface CreatorRow {
  id: string;
  name: string;
  username: string;
  email: string | null;
  passwordHash: string | null;
  avatar: string;
  coverImage: string;
  categoryName: string;
  categoryId: string | null;
  city: string;
  location: string;
  bio: string;
  rating: number;
  reviewCount: number;
  completedBookings: number;
  rank: number;
  isSubscribed: boolean;
  subscriptionTier: SubscriptionTier;
  whatsapp: string;
  tags: string[];
  subscriptionEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceRow {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  duration: string;
}

export interface VideoRow {
  id: string;
  creatorId: string;
  title: string;
  url: string;
  earnings: number;
}

export interface BookingRow {
  id: string;
  creatorId: string;
  creatorName: string;
  serviceId: string;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  clientId: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
  status: BookingStatus;
  paymentReference: string | null;
  paymentStatus: "unpaid" | "paid";
  commissionPercent: number;
  commission: number;
  creatorPayout: number;
  creatorNotifiedAt: Date | null;
  respondedAt: Date | null;
  expiredAt: Date | null;
  refundStatus: RefundStatus;
  /** Computed in SQL by list queries: seconds left for the creator to respond. */
  secondsLeft?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export type RefundStatus = "none" | "requested" | "failed";

export type WithdrawalStatus =
  | "pending"
  | "processing"
  | "success"
  | "failed"
  | "reversed";

export interface WithdrawalRow {
  id: string;
  creatorId: string;
  amount: number;
  status: WithdrawalStatus;
  reference: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayoutAccountRow {
  creatorId: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  recipientCode: string;
  updatedAt: Date;
}

export function mapWithdrawal(w: WithdrawalRow): Withdrawal {
  return {
    id: w.id,
    amount: w.amount,
    status: w.status,
    reference: w.reference,
    bankName: w.bankName,
    accountNumber: w.accountNumber,
    accountName: w.accountName,
    failureReason: w.failureReason ?? undefined,
    createdAt: w.createdAt.toISOString(),
  };
}

export function mapPayoutAccount(a: PayoutAccountRow): PayoutAccount {
  return {
    bankName: a.bankName,
    bankCode: a.bankCode,
    accountNumber: a.accountNumber,
    accountName: a.accountName,
  };
}

export interface ReviewRow {
  id: string;
  bookingId: string;
  creatorId: string;
  clientId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export function mapReview(r: ReviewRow): Review {
  return {
    id: r.id,
    bookingId: r.bookingId,
    creatorId: r.creatorId,
    clientId: r.clientId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  };
}

export interface ConversationRow {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageRow {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  isOwn: boolean;
  createdAt: Date;
}

export interface SiteSettingsRow {
  id: string;
  content: unknown;
  updatedAt: Date;
}

export interface AppSettingsRow {
  id: string;
  settings: unknown;
  updatedAt: Date;
}

export function mapService(s: ServiceRow): Service {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    price: s.price,
    discountPrice: s.discountPrice ?? undefined,
    duration: s.duration,
  };
}

export function mapVideo(v: VideoRow): CreatorVideo {
  return {
    id: v.id,
    title: v.title,
    url: v.url,
    earnings: v.earnings,
  };
}

export function mapClient(c: ClientRow): ClientProfile {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt.toISOString(),
  };
}

export function mapCreator(
  c: CreatorRow,
  services: ServiceRow[] = [],
  videos: VideoRow[] = []
): Creator {
  return {
    id: c.id,
    name: c.name,
    username: c.username,
    avatar: c.avatar,
    coverImage: c.coverImage,
    category: c.categoryName,
    city: c.city,
    location: c.location,
    bio: c.bio,
    rating: Number(c.rating),
    reviewCount: c.reviewCount,
    completedBookings: c.completedBookings,
    rank: c.rank,
    isSubscribed: c.isSubscribed,
    subscriptionTier: c.subscriptionTier,
    subscriptionEndsAt: c.subscriptionEndsAt
      ? c.subscriptionEndsAt.toISOString()
      : undefined,
    whatsapp: c.whatsapp,
    services: services.map(mapService),
    tags: c.tags ?? [],
    videos: videos.map(mapVideo),
    email: c.email ?? undefined,
  };
}

export function mapBooking(b: BookingRow): Booking {
  return {
    id: b.id,
    creatorId: b.creatorId,
    creatorName: b.creatorName,
    serviceId: b.serviceId,
    serviceName: b.serviceName,
    price: b.price,
    date: b.date,
    time: b.time,
    clientId: b.clientId ?? undefined,
    clientName: b.clientName,
    clientPhone: b.clientPhone,
    clientEmail: b.clientEmail || undefined,
    notes: b.notes,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    paymentReference: b.paymentReference ?? undefined,
    paymentStatus: b.paymentStatus ?? "unpaid",
    commissionPercent: b.commissionPercent ?? 0,
    commission: b.commission ?? 0,
    creatorPayout: b.creatorPayout ?? b.price,
    refundStatus: b.refundStatus ?? "none",
    expired: b.expiredAt ? true : undefined,
    secondsLeft:
      b.status === "pending" && typeof b.secondsLeft === "number"
        ? b.secondsLeft
        : undefined,
  };
}

export function mapConversation(c: ConversationRow): Conversation {
  return {
    id: c.id,
    creatorId: c.creatorId,
    creatorName: c.creatorName,
    creatorAvatar: c.creatorAvatar,
    lastMessage: c.lastMessage,
    lastMessageTime: c.lastMessageTime.toISOString(),
    unread: c.unread,
  };
}

export function mapMessage(m: MessageRow): ChatMessage {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    senderName: m.senderName,
    text: m.text,
    timestamp: m.createdAt.toISOString(),
    isOwn: m.isOwn,
  };
}

export function toTier(value: string): SubscriptionTier {
  if (value === "pro" || value === "premium" || value === "free") return value;
  return "free";
}
