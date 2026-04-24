import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useAppendMessage, useGetMessages } from "../hooks/useBackend";
import type { ConversationId } from "../types/chat";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";

interface MessageThreadProps {
  conversationId: ConversationId;
}

const PROMPT_SUGGESTIONS = [
  {
    icon: "✍️",
    label: "Write a professional email",
    prompt:
      "Help me write a professional email to schedule a meeting with a new client.",
  },
  {
    icon: "💡",
    label: "Brainstorm ideas",
    prompt:
      "Give me 5 creative ideas for a side project I can build over a weekend.",
  },
  {
    icon: "🖼️",
    label: "Generate an image",
    prompt:
      "Generate an image of a futuristic cityscape at sunset with neon lights.",
  },
  {
    icon: "📝",
    label: "Summarize text",
    prompt: "Summarize the following text for me:",
  },
];

function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {[false, true, false, true].map((isUser, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
          key={i}
          className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
        >
          {!isUser && (
            <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
          )}
          <Skeleton
            className={`h-10 rounded-2xl ${isUser ? "w-48" : "w-64"}`}
          />
        </div>
      ))}
    </div>
  );
}

export function MessageThread({ conversationId }: MessageThreadProps) {
  const {
    data: messages,
    isLoading,
    isError,
    refetch,
  } = useGetMessages(conversationId);
  const appendMessage = useAppendMessage();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message count and pending state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length, appendMessage.isPending]);

  const handleSend = useCallback(
    async (text: string, file?: File) => {
      if (!text.trim() && !file) return;

      try {
        if (file) {
          const bytes = new Uint8Array(await file.arrayBuffer());
          const blob = ExternalBlob.fromBytes(bytes);
          await appendMessage.mutateAsync({
            conversationId,
            kind: {
              __kind__: "fileAttachment",
              fileAttachment: {
                blob,
                mimeType: file.type,
                filename: file.name,
              },
            },
          });
        } else {
          await appendMessage.mutateAsync({
            conversationId,
            kind: { __kind__: "userText", userText: text },
          });
        }
      } catch {
        toast.error("Failed to send message. Please try again.");
      }
    },
    [conversationId, appendMessage],
  );

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="flex-1 overflow-y-auto"
          data-ocid="message.loading_state"
        >
          <MessageSkeleton />
        </div>
        <MessageInput onSend={handleSend} disabled />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8"
          data-ocid="message.error_state"
        >
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="font-display font-semibold text-foreground">
              Failed to load messages
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Check your connection and try again.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="gap-2"
            data-ocid="message.retry_button"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </Button>
        </div>
        <MessageInput onSend={handleSend} disabled />
      </div>
    );
  }

  const hasMessages = messages && messages.length > 0;
  const isSending = appendMessage.isPending;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Message list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scroll-smooth py-4"
        data-ocid="message.list"
      >
        {!hasMessages ? (
          /* Empty state with prompt suggestions */
          <div
            className="h-full flex flex-col items-center justify-center gap-6 px-6 text-center"
            data-ocid="message.empty_state"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Start a conversation
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ask anything, generate images, or upload a file.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {PROMPT_SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handleSend(s.prompt)}
                  className="flex items-center gap-2.5 text-left px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/60 transition-smooth text-sm text-foreground"
                  data-ocid={`message.suggestion.${s.label.toLowerCase().replace(/\s+/g, "_")}`}
                >
                  <span className="text-base flex-shrink-0">{s.icon}</span>
                  <span className="font-medium truncate">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <>
            {messages.map((msg, i) => (
              <MessageBubble key={msg.id.toString()} message={msg} index={i} />
            ))}

            {/* Typing indicator */}
            {isSending && <TypingIndicator />}

            {/* Append error inline */}
            {appendMessage.isError && (
              <div
                className="flex items-center gap-2 px-4 py-2 mx-4 mb-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                data-ocid="message.error_state"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">Message failed to send.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-destructive hover:text-destructive/80 text-xs"
                  onClick={() => appendMessage.reset()}
                  data-ocid="message.dismiss_error_button"
                >
                  Dismiss
                </Button>
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input bar */}
      <MessageInput
        onSend={handleSend}
        disabled={isSending}
        placeholder="Type a message…"
      />
    </div>
  );
}
