export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-2 message-fade-in">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
        <span className="text-primary text-xs font-display font-semibold">
          AI
        </span>
      </div>

      {/* Bubble */}
      <div className="bg-muted border border-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
        <div
          className="flex items-center gap-1.5 h-5"
          aria-label="AI is typing"
        >
          <span
            className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "1s" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: "200ms", animationDuration: "1s" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: "400ms", animationDuration: "1s" }}
          />
        </div>
      </div>
    </div>
  );
}
