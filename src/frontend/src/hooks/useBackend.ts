import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  AppendMessageRequest,
  ConversationId,
  ImageGenRequest,
} from "../backend";

function useBackendActor() {
  return useActor(createActor);
}

export function useBackend() {
  const { actor, isFetching } = useBackendActor();
  return { actor, isLoading: isFetching };
}

export function useListConversations() {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return { total: BigInt(0), conversations: [] };
      return actor.listConversations({ offset: BigInt(0), limit: BigInt(50) });
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useGetMessages(conversationId: ConversationId | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery({
    queryKey: ["messages", conversationId?.toString()],
    queryFn: async () => {
      if (!actor || conversationId === null) return [];
      return actor.getMessages(conversationId);
    },
    enabled: !!actor && !isFetching && conversationId !== null,
    refetchInterval: 3000,
  });
}

export function useCreateConversation() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: { title: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createConversation(req);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useDeleteConversation() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: ConversationId) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteConversation(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useAppendMessage() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: AppendMessageRequest) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.appendMessage(req);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["messages", variables.conversationId.toString()],
      });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useGenerateImage() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: ImageGenRequest) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.generateImage(req);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["messages", variables.conversationId.toString()],
      });
    },
  });
}
