import { Booking, ChatMessage, Conversation } from "@/types";

const BOOKINGS_KEY = "upnext_bookings";
const MESSAGES_KEY = "upnext_messages";
const CONVERSATIONS_KEY = "upnext_conversations";

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getBookings(): Booking[] {
  return safeParse<Booking[]>(BOOKINGS_KEY, []);
}

export function saveBooking(booking: Booking) {
  const bookings = getBookings();
  bookings.unshift(booking);
  safeSet(BOOKINGS_KEY, bookings);
}

export function updateBookingStatus(
  id: string,
  status: Booking["status"]
): Booking | undefined {
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx < 0) return undefined;
  bookings[idx] = { ...bookings[idx], status };
  safeSet(BOOKINGS_KEY, bookings);
  return bookings[idx];
}

export function deleteBooking(id: string) {
  safeSet(
    BOOKINGS_KEY,
    getBookings().filter((b) => b.id !== id)
  );
}

export function deleteConversation(id: string) {
  safeSet(
    CONVERSATIONS_KEY,
    getConversations().filter((c) => c.id !== id)
  );
  const all = safeParse<Record<string, ChatMessage[]>>(MESSAGES_KEY, {});
  delete all[id];
  safeSet(MESSAGES_KEY, all);
}

export function getConversations(): Conversation[] {
  return safeParse<Conversation[]>(CONVERSATIONS_KEY, []);
}

export function getOrCreateConversation(
  creatorId: string,
  creatorName: string,
  creatorAvatar: string
): Conversation {
  const conversations = getConversations();
  const existing = conversations.find((c) => c.creatorId === creatorId);
  if (existing) return existing;

  const newConvo: Conversation = {
    id: `convo-${creatorId}`,
    creatorId,
    creatorName,
    creatorAvatar,
    lastMessage: "Start a conversation...",
    lastMessageTime: new Date().toISOString(),
    unread: 0,
  };
  conversations.unshift(newConvo);
  safeSet(CONVERSATIONS_KEY, conversations);
  return newConvo;
}

export function getMessages(conversationId: string): ChatMessage[] {
  const all = safeParse<Record<string, ChatMessage[]>>(MESSAGES_KEY, {});
  return all[conversationId] ?? getSeedMessages(conversationId);
}

function getSeedMessages(conversationId: string): ChatMessage[] {
  const seeds: Record<string, ChatMessage[]> = {
    "convo-1": [
      {
        id: "m1",
        conversationId: "convo-1",
        senderId: "1",
        senderName: "Amina Ibrahim",
        text: "Hi! Thanks for checking out my profile. How can I help you today?",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isOwn: false,
      },
    ],
    "convo-2": [
      {
        id: "m2",
        conversationId: "convo-2",
        senderId: "2",
        senderName: "David Okafor",
        text: "Hey! Ready to work on your next hit? Let me know what vibe you're going for.",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isOwn: false,
      },
    ],
  };
  return seeds[conversationId] ?? [];
}

export function sendMessage(
  conversationId: string,
  text: string,
  creatorId: string,
  creatorName: string
): ChatMessage {
  const all = safeParse<Record<string, ChatMessage[]>>(MESSAGES_KEY, {});
  const messages = all[conversationId] ?? getSeedMessages(conversationId);

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId: "user",
    senderName: "You",
    text,
    timestamp: new Date().toISOString(),
    isOwn: true,
  };

  messages.push(newMessage);
  all[conversationId] = messages;
  safeSet(MESSAGES_KEY, all);

  const conversations = getConversations();
  const idx = conversations.findIndex((c) => c.id === conversationId);
  if (idx >= 0) {
    conversations[idx].lastMessage = text;
    conversations[idx].lastMessageTime = newMessage.timestamp;
    safeSet(CONVERSATIONS_KEY, conversations);
  } else {
    getOrCreateConversation(creatorId, creatorName, "");
  }

  setTimeout(() => {
    const reply: ChatMessage = {
      id: `msg-${Date.now()}-reply`,
      conversationId,
      senderId: creatorId,
      senderName: creatorName,
      text: getAutoReply(text),
      timestamp: new Date().toISOString(),
      isOwn: false,
    };
    const updated = safeParse<Record<string, ChatMessage[]>>(MESSAGES_KEY, {});
    const thread = updated[conversationId] ?? [];
    thread.push(reply);
    updated[conversationId] = thread;
    safeSet(MESSAGES_KEY, updated);

    const convos = getConversations();
    const cIdx = convos.findIndex((c) => c.id === conversationId);
    if (cIdx >= 0) {
      convos[cIdx].lastMessage = reply.text;
      convos[cIdx].lastMessageTime = reply.timestamp;
      safeSet(CONVERSATIONS_KEY, convos);
    }
  }, 1500);

  return newMessage;
}

function getAutoReply(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("price") || lower.includes("cost") || lower.includes("how much")) {
    return "Great question! You can see all my service prices on my profile. Some are currently discounted — feel free to book directly or let me know which service you're interested in.";
  }
  if (lower.includes("book") || lower.includes("available")) {
    return "I'd love to work with you! You can book a service from my profile, or tell me your preferred date and I'll check my availability.";
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hello! Welcome to UpNext Creators. How can I help you today?";
  }
  return "Thanks for your message! I'll get back to you shortly. In the meantime, feel free to browse my services and book directly from my profile.";
}
