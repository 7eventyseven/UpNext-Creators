import { jsonError } from "@/lib/auth-server";
import {
  createMessage,
  deleteConversation,
  ensureConversation,
  listConversations,
  listMessages,
  touchConversation,
} from "@/lib/repository";
import { NextRequest } from "next/server";
import { z } from "zod";

function autoReply(text: string): string {
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (conversationId) {
    const messages = await listMessages(conversationId);
    return Response.json({ messages });
  }

  const conversations = await listConversations();
  return Response.json({ conversations });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const action = body?.action as string | undefined;

  if (action === "ensure") {
    const parsed = z
      .object({
        creatorId: z.string().min(1),
        creatorName: z.string().min(1),
        creatorAvatar: z.string().default(""),
      })
      .safeParse(body);
    if (!parsed.success) return jsonError("Invalid conversation");

    const conversation = await ensureConversation(parsed.data);
    return Response.json({ conversation });
  }

  if (action === "message") {
    const parsed = z
      .object({
        conversationId: z.string().min(1),
        text: z.string().min(1),
        creatorId: z.string().min(1),
        creatorName: z.string().min(1),
      })
      .safeParse(body);
    if (!parsed.success) return jsonError("Invalid message");

    const { conversationId, text, creatorId, creatorName } = parsed.data;
    const now = new Date();

    const message = await createMessage({
      conversationId,
      senderId: "user",
      senderName: "You",
      text,
      isOwn: true,
    });
    await touchConversation(conversationId, text, now);

    const replyText = autoReply(text);
    const reply = await createMessage({
      conversationId,
      senderId: creatorId,
      senderName: creatorName,
      text: replyText,
      isOwn: false,
    });
    await touchConversation(conversationId, replyText, new Date(reply.timestamp));

    return Response.json({ message, reply });
  }

  if (action === "delete") {
    const id = body?.id as string | undefined;
    if (!id) return jsonError("Conversation id is required");
    await deleteConversation(id);
    return Response.json({ ok: true });
  }

  return jsonError("Unknown action");
}
