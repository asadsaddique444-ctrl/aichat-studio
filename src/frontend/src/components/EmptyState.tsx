import { Button } from "@/components/ui/button";
import { MessageSquarePlus, Sparkles } from "lucide-react";

interface EmptyStateProps {
  onNewChat?: () => void;
}

export function EmptyState({ onNewChat }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center"
      data-ocid="chat.empty_state"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-accent" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
          <MessageSquarePlus className="w-3 h-3 text-accent" />
        </div>
      </div>

      <div className="space-y-2 max-w-xs">
        <h2 className="text-xl font-display font-semibold text-foreground">
          Start a conversation
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ask anything, generate images, or upload files. Aura is ready to help.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
        {[
          "Explain quantum computing simply",
          "Generate a futuristic city image",
          "Summarize this document",
        ].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={onNewChat}
            className="text-left px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 text-sm text-muted-foreground hover:text-foreground transition-smooth"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {onNewChat && (
        <Button
          onClick={onNewChat}
          className="gap-2"
          data-ocid="chat.new_chat_button"
        >
          <MessageSquarePlus className="w-4 h-4" />
          New Chat
        </Button>
      )}
    </div>
  );
}
