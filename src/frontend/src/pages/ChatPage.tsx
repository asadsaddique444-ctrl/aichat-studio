import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  ImageIcon,
  Menu,
  MessageSquarePlus,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { FileMessage } from "../components/FileMessage";
import { FileUploadButton } from "../components/FileUploadButton";
import { ImageGenInput } from "../components/ImageGenInput";
import { ImageMessage } from "../components/ImageMessage";
import { Layout } from "../components/Layout";
import { UserMenu } from "../components/UserMenu";
import {
  useAppendMessage,
  useCreateConversation,
  useDeleteConversation,
  useGetMessages,
  useListConversations,
} from "../hooks/useBackend";
import type { ConversationId } from "../types/chat";

function formatTime(ts: bigint): string {
  const d = new Date(Number(ts / BigInt(1_000_000)));
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatRelativeDate(ts: bigint): string {
  const d = new Date(Number(ts / BigInt(1_000_000)));
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 172800000) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ChatPage() {
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<ConversationId | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "image">("text");

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      void navigate({ to: "/login" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const { data: convList, isLoading: loadingConvs } = useListConversations();
  const { data: messages, isLoading: loadingMsgs } = useGetMessages(activeId);
  const createConv = useCreateConversation();
  const deleteConv = useDeleteConversation();
  const appendMsg = useAppendMessage();

  const conversations = convList?.conversations ?? [];

  if (isInitializing) {
    return (
      <Layout>
        <div
          className="flex-1 flex items-center justify-center"
          data-ocid="chat.loading_state"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleNewChat = async () => {
    try {
      const conv = await createConv.mutateAsync({ title: "New Conversation" });
      setActiveId(conv.id);
    } catch {
      toast.error("Failed to create conversation");
    }
  };

  const handleDeleteConversation = async (
    id: ConversationId,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    try {
      await deleteConv.mutateAsync(id);
      if (activeId === id) setActiveId(null);
      toast.success("Conversation deleted");
    } catch {
      toast.error("Failed to delete conversation");
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    let convId = activeId;
    if (!convId) {
      try {
        const conv = await createConv.mutateAsync({ title: text.slice(0, 60) });
        convId = conv.id;
        setActiveId(conv.id);
      } catch {
        toast.error("Failed to start conversation");
        return;
      }
    }

    setInput("");
    setSending(true);
    try {
      await appendMsg.mutateAsync({
        conversationId: convId,
        kind: { __kind__: "userText", userText: text },
      });
    } catch {
      toast.error("Failed to send message");
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const activeConv = conversations.find((c) => c.id === activeId);

  return (
    <Layout>
      <header className="flex items-center justify-between px-4 h-14 bg-card border-b border-border flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
            data-ocid="chat.sidebar_toggle"
          >
            {sidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="font-display font-bold text-base">Aura Chat</span>
          </div>
        </div>
        <UserMenu />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={cn(
            "flex flex-col bg-sidebar border-r border-sidebar-border transition-smooth",
            "w-72 flex-shrink-0",
            !sidebarOpen && "hidden lg:flex",
            sidebarOpen &&
              "flex absolute lg:relative z-20 h-[calc(100vh-3.5rem)] lg:h-auto",
          )}
          data-ocid="chat.sidebar"
        >
          <div className="p-3 border-b border-sidebar-border">
            <Button
              onClick={() => void handleNewChat()}
              className="w-full gap-2 justify-start"
              variant="outline"
              disabled={createConv.isPending}
              data-ocid="chat.new_chat_button"
            >
              <MessageSquarePlus className="w-4 h-4" />
              New Chat
            </Button>
          </div>

          <ScrollArea className="flex-1 px-2 py-2">
            {loadingConvs ? (
              <div
                className="space-y-2 p-2"
                data-ocid="chat.conversations.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 rounded-lg bg-muted/50 animate-pulse"
                  />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div
                className="px-2 py-4 text-center"
                data-ocid="chat.conversations.empty_state"
              >
                <p className="text-xs text-muted-foreground">
                  No conversations yet
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv, idx) => (
                  <button
                    key={conv.id.toString()}
                    type="button"
                    onClick={() => {
                      setActiveId(conv.id);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={cn(
                      "group flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-smooth w-full text-left",
                      activeId === conv.id
                        ? "bg-accent/10 border border-accent/20"
                        : "hover:bg-sidebar-accent",
                    )}
                    data-ocid={`chat.conversation.item.${idx + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            "text-sm font-medium truncate",
                            activeId === conv.id
                              ? "text-accent"
                              : "text-sidebar-foreground",
                          )}
                        >
                          {conv.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {formatRelativeDate(conv.updatedAt)}
                        </span>
                      </div>
                      {conv.snippet && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {conv.snippet}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0 -mr-1"
                      onClick={(e) => void handleDeleteConversation(conv.id, e)}
                      aria-label="Delete conversation"
                      data-ocid={`chat.conversation.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </aside>

        {sidebarOpen && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Close sidebar"
            className="fixed inset-0 bg-background/60 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSidebarOpen(false);
            }}
          />
        )}

        <main
          className="flex flex-col flex-1 overflow-hidden bg-background"
          data-ocid="chat.main"
        >
          {activeConv ? (
            <div className="px-6 py-3 border-b border-border bg-card/50 flex-shrink-0">
              <h1 className="font-display font-semibold text-sm truncate">
                {activeConv.title}
              </h1>
            </div>
          ) : null}

          {!activeId ? (
            <EmptyState onNewChat={() => void handleNewChat()} />
          ) : (
            <ScrollArea className="flex-1 px-4 py-4" data-ocid="chat.messages">
              {loadingMsgs ? (
                <div
                  className="space-y-4"
                  data-ocid="chat.messages.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-3",
                        i % 2 === 0 ? "justify-end" : "",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl p-3 space-y-1",
                          i % 2 === 0 ? "bg-accent/20 w-2/3" : "bg-card w-3/4",
                        )}
                      >
                        <div className="h-3 bg-muted/50 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-muted/50 rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {messages.map((msg, idx) => {
                    const isUser = msg.kind.__kind__ === "userText";
                    const isAiText = msg.kind.__kind__ === "aiText";
                    const isAiImage = msg.kind.__kind__ === "aiImage";
                    const isFile = msg.kind.__kind__ === "fileAttachment";

                    return (
                      <div
                        key={msg.id.toString()}
                        className={cn(
                          "flex gap-3 message-fade-in",
                          isUser ? "justify-end" : "justify-start",
                        )}
                        data-ocid={`chat.message.item.${idx + 1}`}
                      >
                        {!isUser && (
                          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-1">
                            <Sparkles className="w-3.5 h-3.5 text-accent" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-3",
                            isUser
                              ? "bg-card border border-border text-foreground"
                              : "bg-accent/10 border border-accent/20 text-foreground",
                          )}
                        >
                          {isUser && msg.kind.__kind__ === "userText" && (
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.kind.userText}
                            </p>
                          )}
                          {isAiText && msg.kind.__kind__ === "aiText" && (
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.kind.aiText}
                            </p>
                          )}
                          {isAiImage && msg.kind.__kind__ === "aiImage" && (
                            <ImageMessage blob={msg.kind.aiImage} />
                          )}
                          {isFile && msg.kind.__kind__ === "fileAttachment" && (
                            <FileMessage file={msg.kind.fileAttachment} />
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                        {isUser && (
                          <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-xs font-semibold text-muted-foreground">
                              U
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="flex items-center justify-center h-full"
                  data-ocid="chat.messages.empty_state"
                >
                  <p className="text-sm text-muted-foreground">
                    Send a message to start the conversation
                  </p>
                </div>
              )}
            </ScrollArea>
          )}

          <div className="p-4 border-t border-border bg-card/30 flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              {/* Mode Toggle */}
              <div className="flex items-center gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => setInputMode("text")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-smooth",
                    inputMode === "text"
                      ? "bg-accent/15 text-accent border border-accent/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                  data-ocid="chat.input_mode_text.tab"
                >
                  <Send className="w-3 h-3" />
                  Chat
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("image")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-smooth",
                    inputMode === "image"
                      ? "bg-accent/15 text-accent border border-accent/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                  data-ocid="chat.input_mode_image.tab"
                >
                  <ImageIcon className="w-3 h-3" />
                  Generate Image
                </button>
              </div>

              <div className="flex items-end gap-3 bg-card border border-border rounded-2xl px-4 py-3 focus-within:border-accent/50 transition-smooth">
                {inputMode === "text" ? (
                  <>
                    <FileUploadButton
                      activeId={activeId}
                      onConversationCreated={(id) => setActiveId(id)}
                      disabled={sending}
                    />
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask Aura anything..."
                      rows={1}
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[2rem] max-h-32 py-1"
                      style={{ lineHeight: "1.5" }}
                      data-ocid="chat.message_input"
                    />
                    <Button
                      onClick={() => void handleSend()}
                      disabled={!input.trim() || sending}
                      className="h-9 px-4 gap-1.5 rounded-xl flex-shrink-0"
                      data-ocid="chat.send_button"
                    >
                      <Send className="h-3.5 w-3.5" />
                      send
                    </Button>
                  </>
                ) : (
                  <ImageGenInput
                    conversationId={activeId}
                    onCreateConversation={async () => {
                      const conv = await createConv.mutateAsync({
                        title: "Image Generation",
                      });
                      setActiveId(conv.id);
                      return conv.id;
                    }}
                    className="flex-1"
                  />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                {inputMode === "text"
                  ? "Press Enter to send · Shift+Enter for new line"
                  : "Press Enter to generate · Shift+Enter for new line"}
              </p>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
