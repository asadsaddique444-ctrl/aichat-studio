import type {
  backendInterface,
  _ImmutableObjectStorageCreateCertificateResult,
  _ImmutableObjectStorageRefillResult,
} from "../backend";
import { UserRole } from "../backend";

const now = BigInt(Date.now()) * BigInt(1_000_000);

const sampleConversations = [
  {
    id: BigInt(1),
    title: "Getting started with AI",
    snippet: "Hello! How can I help you today?",
    updatedAt: now,
  },
  {
    id: BigInt(2),
    title: "Image generation ideas",
    snippet: "Sure, I can generate an image of a sunset over the ocean.",
    updatedAt: now - BigInt(3_600_000_000_000),
  },
  {
    id: BigInt(3),
    title: "Code review assistance",
    snippet: "Here's what I found in your TypeScript code...",
    updatedAt: now - BigInt(86_400_000_000_000),
  },
];

const sampleMessages = [
  {
    id: BigInt(1),
    conversationId: BigInt(1),
    createdAt: now - BigInt(60_000_000_000),
    kind: { __kind__: "userText" as const, userText: "Hello! How can I help you today?" },
  },
  {
    id: BigInt(2),
    conversationId: BigInt(1),
    createdAt: now - BigInt(30_000_000_000),
    kind: {
      __kind__: "aiText" as const,
      aiText:
        "Hi there! I'm your AI assistant. I can help you with answering questions, generating images, reviewing code, and much more. What would you like to explore today?",
    },
  },
  {
    id: BigInt(3),
    conversationId: BigInt(1),
    createdAt: now,
    kind: {
      __kind__: "userText" as const,
      userText: "Can you generate an image of a futuristic city at night?",
    },
  },
];

export const mockBackend: backendInterface = {
  _immutableObjectStorageBlobsAreLive: async (hashes) =>
    hashes.map(() => true),

  _immutableObjectStorageBlobsToDelete: async () => [],

  _immutableObjectStorageConfirmBlobDeletion: async () => undefined,

  _immutableObjectStorageCreateCertificate: async (
    blobHash,
  ): Promise<_ImmutableObjectStorageCreateCertificateResult> => ({
    method: "GET",
    blob_hash: blobHash,
  }),

  _immutableObjectStorageRefillCashier: async (): Promise<_ImmutableObjectStorageRefillResult> => ({
    success: true,
    topped_up_amount: BigInt(0),
  }),

  _immutableObjectStorageUpdateGatewayPrincipals: async () => undefined,

  _initializeAccessControl: async () => undefined,

  appendMessage: async (req) => ({
    id: BigInt(Math.floor(Math.random() * 10000)),
    conversationId: req.conversationId,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    kind: req.kind,
  }),

  assignCallerUserRole: async () => undefined,

  createConversation: async (req) => ({
    id: BigInt(Math.floor(Math.random() * 10000)),
    title: req.title,
    owner: { toText: () => "aaaaa-aa" } as any,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    updatedAt: BigInt(Date.now()) * BigInt(1_000_000),
  }),

  deleteConversation: async () => true,

  generateImage: async (req) => ({
    rawJson: JSON.stringify({ url: "https://placehold.co/512x512/1a1a2e/cyan?text=AI+Generated" }),
    messageId: BigInt(Math.floor(Math.random() * 10000)),
  }),

  getCallerUserRole: async () => UserRole.user,

  getMessages: async () => sampleMessages,

  isCallerAdmin: async () => false,

  listConversations: async () => ({
    total: BigInt(sampleConversations.length),
    conversations: sampleConversations,
  }),

  transform: async (input) => ({
    status: BigInt(200),
    body: new Uint8Array(),
    headers: [],
  }),

  transformChat: async (input) => ({
    status: BigInt(200),
    body: new Uint8Array(),
    headers: [],
  }),
};
