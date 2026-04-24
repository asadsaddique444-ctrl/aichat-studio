import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { ConversationPreview } from "../types/chat";

interface ConversationItemProps {
  conversation: ConversationPreview;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function formatRelativeTime(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 6)
    return new Date(ms).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  if (days > 1) return `${days}d ago`;
  if (days === 1) return "Yesterday";
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: ConversationItemProps) {
  const [hovered, setHovered] = useState(false);

  const snippet =
    conversation.snippet.length > 0 ? conversation.snippet : "No messages yet";

  return (
    <div
      className={`group relative flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150 ${
        isActive
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-muted/60 border border-transparent"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-ocid="conversation.item"
    >
      <button
        type="button"
        className="flex-1 min-w-0 text-left"
        onClick={onSelect}
        aria-label={`Open conversation: ${conversation.title}`}
        data-ocid="conversation.select_button"
      >
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span
            className={`text-sm font-medium truncate ${
              isActive ? "text-primary" : "text-foreground"
            }`}
          >
            {conversation.title || "Untitled"}
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {formatRelativeTime(conversation.updatedAt)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate leading-snug">
          {snippet}
        </p>
      </button>

      {(hovered || isActive) && (
        <button
          type="button"
          className="shrink-0 p-1 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete conversation"
          data-ocid="conversation.delete_button"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}
