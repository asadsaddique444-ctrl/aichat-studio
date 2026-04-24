import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Download, Maximize2, X } from "lucide-react";
import { useState } from "react";
import type { ExternalBlob } from "../types/chat";

interface ImageMessageProps {
  blob: ExternalBlob;
  alt?: string;
}

export function ImageMessage({
  blob,
  alt = "AI generated image",
}: ImageMessageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const imageUrl = blob.getDirectURL();

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(imageUrl);
      const arrayBuf = await res.arrayBuffer();
      const objUrl = URL.createObjectURL(new Blob([arrayBuf]));
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = "generated-image.png";
      a.click();
      URL.revokeObjectURL(objUrl);
    } catch {
      // Fallback: open in new tab
      window.open(imageUrl, "_blank");
    }
  };

  const handleDownloadFromDialog = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await handleDownload(e);
  };

  return (
    <>
      <div
        className="relative group max-w-sm"
        data-ocid="imagegen.image_message"
      >
        <button
          type="button"
          className="relative block w-full cursor-pointer rounded-xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setLightboxOpen(true)}
          aria-label="View full size image"
        >
          <img
            src={imageUrl}
            alt={alt}
            className="rounded-xl max-w-full w-full object-cover transition-smooth group-hover:brightness-90"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-smooth rounded-xl pointer-events-none" />

          {/* Expand icon (top-right) */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none">
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-1.5 border border-border">
              <Maximize2 className="w-3.5 h-3.5 text-foreground" />
            </div>
          </div>
        </button>

        {/* Download button (bottom-right, outside the click-to-expand button) */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-smooth bg-background/80 backdrop-blur-sm hover:bg-background border border-border"
          onClick={handleDownload}
          aria-label="Download image"
          data-ocid="imagegen.download_button"
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden border-border bg-background/95 backdrop-blur-md">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <div className="relative flex items-center justify-center min-h-[50vh]">
            <img
              src={imageUrl}
              alt={alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              data-ocid="imagegen.lightbox_image"
            />

            {/* Lightbox controls */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 bg-background/80 backdrop-blur-sm border border-border hover:bg-card"
                onClick={handleDownloadFromDialog}
                aria-label="Download image"
                data-ocid="imagegen.lightbox_download_button"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 bg-background/80 backdrop-blur-sm border border-border hover:bg-card"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close"
                data-ocid="imagegen.lightbox_close_button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
