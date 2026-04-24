import {
  Download,
  File,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Presentation,
} from "lucide-react";
import { useState } from "react";
import type { FileAttachmentMeta } from "../types/chat";

interface FileMessageProps {
  file: FileAttachmentMeta;
}

function getFileIcon(filename: string, mimeType: string) {
  if (mimeType.startsWith("image/")) return null; // handled separately
  if (mimeType === "application/pdf" || /\.pdf$/i.test(filename))
    return <FileText className="w-5 h-5 text-destructive/80 flex-shrink-0" />;
  if (/\.(xls|xlsx|csv)$/i.test(filename) || mimeType.includes("spreadsheet"))
    return <FileSpreadsheet className="w-5 h-5 text-chart-2 flex-shrink-0" />;
  if (/\.(ppt|pptx)$/i.test(filename) || mimeType.includes("presentation"))
    return <Presentation className="w-5 h-5 text-chart-5 flex-shrink-0" />;
  if (/\.(zip|tar|gz|rar|7z)$/i.test(filename))
    return (
      <FileArchive className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    );
  return <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />;
}

async function downloadBlob(file: FileAttachmentMeta) {
  const bytes = await file.blob.getBytes();
  const blob = new Blob([bytes]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function FileMessage({ file }: FileMessageProps) {
  const { filename, mimeType, blob } = file;
  const isImage = mimeType.startsWith("image/");
  const [imgError, setImgError] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadBlob(file);
    } finally {
      setDownloading(false);
    }
  };

  if (isImage && !imgError) {
    return (
      <div
        className="group relative inline-block"
        data-ocid="chat.file_message.image"
      >
        <img
          src={blob.getDirectURL()}
          alt={filename}
          className="rounded-xl max-w-xs max-h-56 object-cover border border-border/40 shadow-sm"
          onError={() => setImgError(true)}
        />
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={downloading}
          aria-label={`Download ${filename}`}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-background/80 backdrop-blur-sm border border-border/60 rounded-md p-1.5 transition-opacity duration-150 hover:bg-card"
          data-ocid="chat.file_message.download_button"
        >
          <Download className="w-3.5 h-3.5 text-foreground" />
        </button>
        <p className="text-[10px] text-muted-foreground mt-1.5 truncate max-w-xs">
          {filename}
        </p>
      </div>
    );
  }

  // Generic file display
  const icon = getFileIcon(filename, mimeType);

  return (
    <div
      className="flex items-center gap-3 bg-muted/40 border border-border/60 rounded-xl px-3 py-2.5 min-w-0 max-w-xs group"
      data-ocid="chat.file_message.card"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-card border border-border/60 flex items-center justify-center">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-foreground truncate leading-tight"
          title={filename}
        >
          {filename}
        </p>
        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
          {mimeType.split("/")[1]?.toUpperCase() ?? "FILE"}
          {" · "}
          <span className="opacity-70">tap to download</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={downloading}
        aria-label={`Download ${filename}`}
        className="flex-shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border/60 transition-colors duration-150"
        data-ocid="chat.file_message.download_button"
      >
        {downloading ? (
          <div className="w-3.5 h-3.5 border border-accent border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
