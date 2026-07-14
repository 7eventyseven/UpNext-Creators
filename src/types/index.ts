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

export interface Booking {
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
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
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
