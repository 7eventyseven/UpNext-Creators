import { Booking, ChatMessage, Conversation } from "@/types";
import { apiGet, apiSend } from "@/lib/api-client";

export async function getBookings(creatorId?: string): Promise<Booking[]> {
  const qs = creatorId ? `?creatorId=${encodeURIComponent(creatorId)}` : "";
  const data = await apiGet<{ bookings: Booking[] }>(`/api/bookings${qs}`);
  return data.bookings;
}

export async function saveBooking(booking: Omit<Booking, "id" | "createdAt" | "status"> & Partial<Pick<Booking, "id" | "createdAt" | "status">>) {
  const data = await apiSend<{ booking: Booking }>("/api/bookings", "POST", booking);
  return data.booking;
}

export async function updateBookingStatus(
  id: string,
  status: Booking["status"]
): Promise<Booking | undefined> {
  try {
    const data = await apiSend<{ booking: Booking }>("/api/bookings", "PATCH", {
      id,
      status,
    });
    return data.booking;
  } catch {
    return undefined;
  }
}

export async function deleteBooking(id: string) {
  await apiSend(`/api/bookings?id=${encodeURIComponent(id)}`, "DELETE");
}

export async function getConversations(): Promise<Conversation[]> {
  const data = await apiGet<{ conversations: Conversation[] }>("/api/conversations");
  return data.conversations;
}

export async function getOrCreateConversation(
  creatorId: string,
  creatorName: string,
  creatorAvatar: string
): Promise<Conversation> {
  const data = await apiSend<{ conversation: Conversation }>(
    "/api/conversations",
    "POST",
    {
      action: "ensure",
      creatorId,
      creatorName,
      creatorAvatar,
    }
  );
  return data.conversation;
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const data = await apiGet<{ messages: ChatMessage[] }>(
    `/api/conversations?conversationId=${encodeURIComponent(conversationId)}`
  );
  return data.messages;
}

export async function deleteConversation(id: string) {
  await apiSend("/api/conversations", "POST", { action: "delete", id });
}

export async function sendMessage(
  conversationId: string,
  text: string,
  creatorId: string,
  creatorName: string
): Promise<ChatMessage> {
  const data = await apiSend<{ message: ChatMessage; reply: ChatMessage }>(
    "/api/conversations",
    "POST",
    {
      action: "message",
      conversationId,
      text,
      creatorId,
      creatorName,
    }
  );
  return data.message;
}
