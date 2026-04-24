// Re-export backend types for use throughout the app
export type {
  ConversationId,
  ConversationPreview,
  FileAttachmentMeta,
  Message,
  MessageId,
  MessageKind,
  Timestamp,
  Conversation,
  ImageGenRequest,
  ImageGenResponse,
  AppendMessageRequest,
  ListConversationsRequest,
  ListConversationsResponse,
} from "../backend";
export { ExternalBlob } from "../backend";
