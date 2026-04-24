import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import {
  useAppendMessage,
  useBackend,
  useCreateConversation,
} from "../hooks/useBackend";
import type { ConversationId } from "../types/chat";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface FileUploadButtonProps {
  activeId: ConversationId | null;
  onConversationCreated?: (id: ConversationId) => void;
  disabled?: boolean;
}

export function FileUploadButton({
  activeId,
  onConversationCreated,
  disabled,
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { actor } = useBackend();
  const appendMsg = useAppendMessage();
  const createConv = useCreateConversation();

  const handleClick = () => {
    if (!uploading) inputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!inputRef.current) return;
    inputRef.current.value = "";
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 10 MB.");
      return;
    }

    if (!actor) {
      toast.error("Not connected. Please try again.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setProgress(pct);
      });

      let convId = activeId;
      if (!convId) {
        const conv = await createConv.mutateAsync({
          title: file.name.slice(0, 60),
        });
        convId = conv.id;
        onConversationCreated?.(conv.id);
      }

      await appendMsg.mutateAsync({
        conversationId: convId,
        kind: {
          __kind__: "fileAttachment",
          fileAttachment: {
            blob,
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
          },
        },
      });

      toast.success("File uploaded successfully");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="relative flex-shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx,.zip"
        className="sr-only"
        onChange={(e) => void handleFile(e)}
        aria-label="Upload file"
        data-ocid="chat.file_input"
        tabIndex={-1}
      />

      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors duration-200"
          aria-label={
            uploading ? `Uploading… ${progress}%` : "Attach file (max 10 MB)"
          }
          disabled={disabled || uploading}
          onClick={handleClick}
          data-ocid="chat.upload_button"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {uploading && (
          <span
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-hidden="true"
          >
            <svg
              className="w-8 h-8 -rotate-90"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="16"
                cy="16"
                r="13"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-border"
              />
              <circle
                cx="16"
                cy="16"
                r="13"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={`${2 * Math.PI * 13}`}
                strokeDashoffset={`${2 * Math.PI * 13 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="text-accent transition-all duration-150"
              />
            </svg>
          </span>
        )}
      </div>

      {uploading && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-card border border-border rounded-md px-2 py-1 text-[10px] text-muted-foreground shadow-md"
          data-ocid="chat.upload.loading_state"
          aria-live="polite"
        >
          {progress < 100 ? `Uploading ${progress}%…` : "Processing…"}
        </div>
      )}
    </div>
  );
}
