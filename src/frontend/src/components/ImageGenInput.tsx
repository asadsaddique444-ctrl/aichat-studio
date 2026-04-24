import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageIcon, Loader2, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useGenerateImage } from "../hooks/useBackend";
import type { ConversationId } from "../types/chat";

interface ImageGenInputProps {
  conversationId: ConversationId | null;
  onCreateConversation: () => Promise<ConversationId>;
  onGenerated?: () => void;
  className?: string;
}

export function ImageGenInput({
  conversationId,
  onCreateConversation,
  onGenerated,
  className,
}: ImageGenInputProps) {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const generateImage = useGenerateImage();

  const handleGenerate = async () => {
    const text = prompt.trim();
    if (!text || generateImage.isPending) return;

    let convId = conversationId;
    if (!convId) {
      try {
        convId = await onCreateConversation();
      } catch {
        toast.error("Failed to start conversation");
        return;
      }
    }

    try {
      await generateImage.mutateAsync({ conversationId: convId, prompt: text });
      setPrompt("");
      onGenerated?.();
    } catch {
      toast.error("Image generation failed. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleGenerate();
    }
  };

  return (
    <div className={cn("flex items-end gap-3", className)}>
      <div className="flex items-center justify-center w-8 h-8 flex-shrink-0 rounded-lg bg-accent/10 border border-accent/20">
        <ImageIcon className="w-4 h-4 text-accent" />
      </div>
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe the image to generate..."
        rows={1}
        disabled={generateImage.isPending}
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[2rem] max-h-32 py-1 disabled:opacity-50"
        style={{ lineHeight: "1.5" }}
        data-ocid="imagegen.prompt_input"
      />
      <Button
        onClick={() => void handleGenerate()}
        disabled={!prompt.trim() || generateImage.isPending}
        className="h-9 px-4 gap-1.5 rounded-xl flex-shrink-0"
        data-ocid="imagegen.generate_button"
      >
        {generateImage.isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5" />
            Generate
          </>
        )}
      </Button>
    </div>
  );
}
