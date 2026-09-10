import type {
  Booking,
  ChatMessage,
  Conversation,
  Creator,
  CreatorVideo,
  Service,
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
  clientName: string;
  clientPhone: string;
  notes: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
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
    clientName: b.clientName,
    clientPhone: b.clientPhone,
    notes: b.notes,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
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
