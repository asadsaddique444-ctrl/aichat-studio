import type { Message, MessageKind } from "../types/chat";

interface MessageBubbleProps {
  message: Message;
  index: number;
}

function formatTime(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isUser(kind: MessageKind): boolean {
  return kind.__kind__ === "userText" || kind.__kind__ === "fileAttachment";
}

function MessageContent({ kind }: { kind: MessageKind }) {
  if (kind.__kind__ === "userText") {
    return (
      <p className="text-sm leading-relaxed break-words">{kind.userText}</p>
    );
  }

  if (kind.__kind__ === "aiText") {
    return (
      <div
        className="prose prose-sm max-w-none dark:prose-invert
          prose-p:my-1 prose-p:leading-relaxed
          prose-headings:font-display prose-headings:font-semibold
          prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-muted prose-pre:text-xs
          prose-a:text-primary prose-a:underline
          prose-ul:my-1 prose-ol:my-1
          prose-li:my-0"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: AI text is trusted markdown rendered server-side
        dangerouslySetInnerHTML={{ __html: renderMarkdown(kind.aiText) }}
      />
    );
  }

  if (kind.__kind__ === "aiImage") {
    const url = kind.aiImage.getDirectURL();
    return (
      <img
        src={url}
        alt="AI generated"
        className="rounded-lg max-w-xs max-h-64 object-cover"
      />
    );
  }

  if (kind.__kind__ === "fileAttachment") {
    const { filename, mimeType } = kind.fileAttachment;
    const isImage = mimeType.startsWith("image/");
    if (isImage) {
      const url = kind.fileAttachment.blob.getDirectURL();
      return (
        <img
          src={url}
          alt={filename}
          className="rounded-lg max-w-xs max-h-48 object-cover"
        />
      );
    }
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-lg">📎</span>
        <span className="truncate max-w-[16rem]">{filename}</span>
      </div>
    );
  }

  return null;
}

/**
 * Minimal inline markdown renderer — converts bold, italic, code, and newlines.
 * For full GFM support a library like `marked` or `remark` would be preferred,
 * but this avoids a bundle dependency while covering the most common patterns.
 */
function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const user = isUser(message.kind);

  return (
    <div
      data-ocid={`message.item.${index + 1}`}
      className={`flex items-end gap-2 px-4 py-1 message-fade-in ${user ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      {!user && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mb-1">
          <span className="text-primary text-[10px] font-display font-bold">
            AI
          </span>
        </div>
      )}

      <div
        className={`flex flex-col gap-1 max-w-[70%] min-w-0 ${user ? "items-end" : "items-start"}`}
      >
        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm break-words min-w-0 ${
            user
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground border border-border rounded-bl-sm"
          }`}
        >
          <MessageContent kind={message.kind} />
        </div>

        {/* Timestamp */}
        <time
          className="text-[10px] text-muted-foreground px-1 tabular-nums"
          dateTime={new Date(
            Number(message.createdAt / BigInt(1_000_000)),
          ).toISOString()}
        >
          {formatTime(message.createdAt)}
        </time>
      </div>
    </div>
  );
}
