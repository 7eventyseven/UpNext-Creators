"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { getAllCreators } from "@/data/creators";
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} from "@/lib/storage";
import { Conversation, ChatMessage } from "@/types";

function ChatContent() {
  const searchParams = useSearchParams();
  const creatorParam = searchParams.get("creator");

  const [creators, setCreators] = useState<Awaited<ReturnType<typeof getAllCreators>>>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const allCreators = await getAllCreators();
      if (cancelled) return;
      setCreators(allCreators);

      let convos = await getConversations();
      if (convos.length === 0 && allCreators.length > 0) {
        for (const c of allCreators.slice(0, 2)) {
          await getOrCreateConversation(c.id, c.name, c.avatar);
        }
        convos = await getConversations();
      }

      if (creatorParam) {
        const creator = allCreators.find((c) => c.id === creatorParam);
        if (creator) {
          const convo = await getOrCreateConversation(
            creator.id,
            creator.name,
            creator.avatar
          );
          if (!cancelled) setActiveId(convo.id);
          convos = await getConversations();
        }
      } else if (convos.length > 0 && !activeId) {
        if (!cancelled) setActiveId(convos[0].id);
      }

      if (!cancelled) setConversations(convos);
    })().catch(() => undefined);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorParam]);

  useEffect(() => {
    if (!activeId) return;
    getMessages(activeId).then(setMessages).catch(() => undefined);
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeId) return;
    const interval = setInterval(() => {
      getMessages(activeId).then(setMessages).catch(() => undefined);
      getConversations().then(setConversations).catch(() => undefined);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeId]);

  const activeConvo = conversations.find((c) => c.id === activeId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConvo) return;

    const text = input.trim();
    setInput("");
    await sendMessage(
      activeConvo.id,
      text,
      activeConvo.creatorId,
      activeConvo.creatorName
    );
    setMessages(await getMessages(activeConvo.id));
    setConversations(await getConversations());
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) {
      return d.toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold text-olive-900 mb-4">Messages</h1>

      <div className="flex h-[calc(100%-3rem)] rounded-2xl border border-olive-200/70 bg-milky-50 overflow-hidden shadow-sm">
        <aside
          className={`w-full sm:w-80 border-r border-olive-200/70 bg-milky-100 flex flex-col ${
            activeId ? "hidden sm:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b border-olive-200/70">
            <p className="text-sm text-olive-500">Your conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="p-4 text-sm text-olive-500">No conversations yet.</p>
            ) : (
              conversations.map((convo) => (
                <button
                  key={convo.id}
                  type="button"
                  onClick={() => setActiveId(convo.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors border-b border-olive-100/50 ${
                    activeId === convo.id
                      ? "bg-olive-50"
                      : "hover:bg-olive-50/50"
                  }`}
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-olive-100">
                    <Image
                      src={convo.creatorAvatar}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-olive-900 truncate">
                      {convo.creatorName}
                    </p>
                    <p className="text-xs text-olive-500 truncate">
                      {convo.lastMessage}
                    </p>
                  </div>
                  <span className="text-xs text-olive-400 shrink-0">
                    {formatTime(convo.lastMessageTime)}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="p-3 border-t border-olive-200/70">
            <p className="text-xs text-olive-500 mb-2">Start a new chat</p>
            <div className="flex flex-wrap gap-1">
              {creators.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={async () => {
                    const convo = await getOrCreateConversation(
                      c.id,
                      c.name,
                      c.avatar
                    );
                    setActiveId(convo.id);
                    setConversations(await getConversations());
                  }}
                  className="rounded-full bg-olive-100 px-2.5 py-1 text-xs font-medium text-olive-700 hover:bg-olive-200"
                >
                  {c.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div
          className={`flex-1 flex flex-col ${
            activeId ? "flex" : "hidden sm:flex"
          }`}
        >
          {activeConvo ? (
            <>
              <div className="flex items-center gap-3 border-b border-olive-200/70 px-4 py-3 bg-milky-100">
                <button
                  type="button"
                  className="sm:hidden rounded-lg p-1 text-olive-600 hover:bg-olive-100"
                  onClick={() => setActiveId(null)}
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="relative h-9 w-9 overflow-hidden rounded-full bg-olive-100">
                  <Image
                    src={activeConvo.creatorAvatar}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-olive-900">
                    {activeConvo.creatorName}
                  </p>
                  <Link
                    href={`/creators/${activeConvo.creatorId}`}
                    className="text-xs text-olive-500 hover:text-olive-700"
                  >
                    View profile
                  </Link>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-milky-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        msg.isOwn
                          ? "bg-olive-600 text-milky-50 rounded-br-md"
                          : "bg-milky-200 text-olive-800 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.isOwn ? "text-olive-200" : "text-olive-400"
                        }`}
                      >
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 border-t border-olive-200/70 p-3 bg-milky-100"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-olive-200 bg-milky-50 px-4 py-2.5 text-sm text-olive-900 placeholder:text-olive-400 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="rounded-xl bg-olive-600 p-2.5 text-milky-50 hover:bg-olive-700 disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-olive-500 p-8">
              <MessageCircle size={48} className="mb-3 text-olive-300" />
              <p className="font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Or start chatting with a creator</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <p className="text-olive-500">Loading messages...</p>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
