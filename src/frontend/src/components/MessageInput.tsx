import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Paperclip } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface MessageInputProps {
  onSend: (text: string, file?: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Message…",
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea — triggered by text state change
  // biome-ignore lint/correctness/useExhaustiveDependencies: text change should trigger resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed && !file) return;
    onSend(trimmed, file ?? undefined);
    setText("");
    setFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, file, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!disabled) handleSend();
      }
    },
    [disabled, handleSend],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    e.target.value = "";
  };

  const removeFile = () => setFile(null);

  const canSend = !disabled && (text.trim().length > 0 || file !== null);

  return (
    <div className="border-t border-border bg-card px-4 pt-3 pb-4">
      {/* File preview pill */}
      {file && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="flex items-center gap-1.5 text-xs bg-muted border border-border rounded-lg px-3 py-1.5 max-w-xs">
            <span className="text-base">
              {file.type.startsWith("image/") ? "🖼️" : "📎"}
            </span>
            <span className="truncate text-foreground">{file.name}</span>
            <button
              type="button"
              onClick={removeFile}
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Remove attachment"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attach button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="Attach file"
          data-ocid="message.upload_button"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.txt,.md,.csv"
          className="hidden"
          onChange={handleFileChange}
          tabIndex={-1}
        />

        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 min-h-[38px] max-h-40 resize-none py-2 text-sm leading-5 border-input focus-visible:ring-ring transition-smooth"
          data-ocid="message.input"
        />

        {/* Send button */}
        <Button
          type="button"
          size="icon"
          className="flex-shrink-0 h-9 w-9"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          data-ocid="message.submit_button"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
        <kbd className="font-mono">Enter</kbd> to send ·{" "}
        <kbd className="font-mono">Shift + Enter</kbd> for new line
      </p>
    </div>
  );
}
