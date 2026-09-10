import type {
  Creator as DbCreator,
  Service as DbService,
  CreatorVideo as DbVideo,
  Booking as DbBooking,
  Conversation as DbConversation,
  Message as DbMessage,
} from "@prisma/client";
import type {
  Creator,
  Service,
  CreatorVideo,
  Booking,
  Conversation,
  ChatMessage,
} from "@/types";

type CreatorWithRelations = DbCreator & {
  services: DbService[];
  videos: DbVideo[];
};

export function mapService(s: DbService): Service {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    price: s.price,
    discountPrice: s.discountPrice ?? undefined,
    duration: s.duration,
  };
}

export function mapVideo(v: DbVideo): CreatorVideo {
  return {
    id: v.id,
    title: v.title,
    url: v.url,
    earnings: v.earnings,
  };
}

export function mapCreator(c: CreatorWithRelations): Creator {
  let tags: string[] = [];
  try {
    tags = JSON.parse(c.tags) as string[];
  } catch {
    tags = [];
  }

  return {
    id: c.id,
    name: c.name,
    username: c.username,
    email: c.email ?? undefined,
    avatar: c.avatar,
    coverImage: c.coverImage,
    category: c.category,
    city: c.city,
    location: c.location,
    bio: c.bio,
    rating: c.rating,
    reviewCount: c.reviewCount,
    completedBookings: c.completedBookings,
    rank: c.rank,
    isSubscribed: c.isSubscribed,
    subscriptionTier: c.subscriptionTier as Creator["subscriptionTier"],
    whatsapp: c.whatsapp,
    tags,
    services: c.services.map(mapService),
    videos: c.videos.map(mapVideo),
  };
}

export function mapBooking(b: DbBooking): Booking {
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
    status: b.status as Booking["status"],
    createdAt: b.createdAt.toISOString(),
  };
}

export function mapConversation(c: DbConversation): Conversation {
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

export function mapMessage(m: DbMessage): ChatMessage {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    senderName: m.senderName,
    text: m.text,
    timestamp: m.timestamp.toISOString(),
    isOwn: m.isOwn,
  };
}

export const creatorInclude = {
  services: true,
  videos: true,
} as const;
