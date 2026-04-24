import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Menu, MessageSquare, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useCreateConversation,
  useDeleteConversation,
  useListConversations,
} from "../hooks/useBackend";
import type { ConversationId, ConversationPreview } from "../types/chat";
import { ConversationItem } from "./ConversationItem";

interface ConversationSidebarProps {
  selectedConversationId: ConversationId | null;
  onSelectConversation: (id: ConversationId) => void;
}

interface SidebarContentProps extends ConversationSidebarProps {
  onClose?: () => void;
}

function SidebarContent({
  selectedConversationId,
  onSelectConversation,
  onClose,
}: SidebarContentProps) {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<ConversationId | null>(null);

  const { data, isLoading } = useListConversations();
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();

  const conversations: ConversationPreview[] = data?.conversations ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.snippet.toLowerCase().includes(q),
    );
  }, [conversations, search]);

  async function handleCreate() {
    try {
      const result = await createConversation.mutateAsync({
        title: "New Chat",
      });
      onSelectConversation(result.id);
      onClose?.();
    } catch {
      toast.error("Failed to create conversation");
    }
  }

  async function handleConfirmDelete() {
    if (!deletingId) return;
    try {
      await deleteConversation.mutateAsync(deletingId);
      toast.success("Conversation deleted");
      if (
        selectedConversationId !== null &&
        deletingId.toString() === selectedConversationId.toString()
      ) {
        const remaining = conversations.filter(
          (c) => c.id.toString() !== deletingId.toString(),
        );
        if (remaining.length > 0) onSelectConversation(remaining[0].id);
      }
    } catch {
      toast.error("Failed to delete conversation");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col h-full" data-ocid="sidebar.panel">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <span className="font-display font-semibold text-sm text-foreground tracking-tight">
          Chats
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
          onClick={handleCreate}
          disabled={createConversation.isPending}
          aria-label="New conversation"
          data-ocid="sidebar.new_conversation_button"
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 shrink-0">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 pr-7 h-8 text-xs bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-ring"
            data-ocid="sidebar.search_input"
          />
          {search && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {isLoading ? (
          <div
            className="space-y-2 px-1 pt-2"
            data-ocid="sidebar.loading_state"
          >
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-1 px-1 py-2">
                <Skeleton className="h-3.5 w-3/4 rounded" />
                <Skeleton className="h-3 w-full rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-40 px-4 text-center"
            data-ocid="sidebar.empty_state"
          >
            <MessageSquare
              size={28}
              className="text-muted-foreground/50 mb-2"
            />
            <p className="text-sm font-medium text-muted-foreground">
              {search ? "No results found" : "No conversations yet"}
            </p>
            {!search && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                Start a new chat to get going
              </p>
            )}
          </div>
        ) : (
          filtered.map((conv, idx) => (
            <div key={conv.id.toString()} data-ocid={`sidebar.item.${idx + 1}`}>
              <ConversationItem
                conversation={conv}
                isActive={
                  selectedConversationId !== null &&
                  conv.id.toString() === selectedConversationId.toString()
                }
                onSelect={() => {
                  onSelectConversation(conv.id);
                  onClose?.();
                }}
                onDelete={() => setDeletingId(conv.id)}
              />
            </div>
          ))
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent data-ocid="sidebar.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the conversation and all its
              messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="sidebar.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
              data-ocid="sidebar.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function ConversationSidebar({
  selectedConversationId,
  onSelectConversation,
}: ConversationSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <div className="md:hidden" data-ocid="sidebar.mobile_trigger">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              aria-label="Open conversation list"
              data-ocid="sidebar.open_modal_button"
            >
              <Menu size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 p-0 bg-card border-r border-border"
            data-ocid="sidebar.sheet"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Conversations</SheetTitle>
            </SheetHeader>
            <SidebarContent
              selectedConversationId={selectedConversationId}
              onSelectConversation={onSelectConversation}
              onClose={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 h-full bg-card border-r border-border"
        data-ocid="sidebar.panel"
      >
        <SidebarContent
          selectedConversationId={selectedConversationId}
          onSelectConversation={onSelectConversation}
        />
      </aside>
    </>
  );
}
