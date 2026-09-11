export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  duration: string;
}

export interface CreatorVideo {
  id: string;
  title: string;
  url: string;
  earnings: number;
}

export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage: string;
  category: string;
  city: string;
  location: string;
  bio: string;
  rating: number;
  reviewCount: number;
  completedBookings: number;
  rank: number;
  isSubscribed: boolean;
  subscriptionTier: "free" | "pro" | "premium";
  whatsapp: string;
  services: Service[];
  tags: string[];
  videos?: CreatorVideo[];
  email?: string;
}

export interface CreatorAccount {
  id: string;
  email: string;
  password: string;
  creatorId: string;
  createdAt: string;
}

export type BookingPaymentStatus = "unpaid" | "paid";

export interface Booking {
  id: string;
  creatorId: string;
  creatorName: string;
  serviceId: string;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  clientId?: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  notes: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  /** Star rating this client left for the booking, when they've rated it. */
  reviewRating?: number;
  reviewComment?: string;
  paymentReference?: string;
  paymentStatus?: BookingPaymentStatus;
  commissionPercent?: number;
  commission?: number;
  creatorPayout?: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

export interface Conversation {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

export type BriefInviteStatus = "pending" | "accepted" | "declined";

export interface BriefInvite {
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  category: string;
  city: string;
  rating: number;
  status: BriefInviteStatus;
  /** Subscribed creatives are notified in the first wave. */
  priority?: boolean;
  respondedAt?: string;
}

export interface Brief {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  category: string;
  occasion: string;
  state: string;
  date: string;
  budget: string;
  notes: string;
  status: "open" | "matched" | "closed";
  invites: BriefInvite[];
  createdAt: string;
  /** Free creatives see this brief after this time, unless all priority invites have replied. */
  priorityUntil?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  creatorId: string;
  clientId: string;
  /** 1–5 stars. */
  rating: number;
  comment: string;
  createdAt: string;
}
