import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ListConversationsResponse {
    total: bigint;
    conversations: Array<ConversationPreview>;
}
export interface AppendMessageRequest {
    kind: MessageKind;
    conversationId: ConversationId;
}
export interface ListConversationsRequest {
    offset: bigint;
    limit: bigint;
}
export interface CreateConversationRequest {
    title: string;
}
export interface ConversationPreview {
    id: ConversationId;
    title: string;
    snippet: string;
    updatedAt: Timestamp;
}
export interface http_header {
    value: string;
    name: string;
}
export type MessageKind = {
    __kind__: "aiImage";
    aiImage: ExternalBlob;
} | {
    __kind__: "userText";
    userText: string;
} | {
    __kind__: "aiText";
    aiText: string;
} | {
    __kind__: "fileAttachment";
    fileAttachment: FileAttachmentMeta;
};
export type UserId = Principal;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ImageGenResponse {
    rawJson: string;
    messageId: MessageId;
}
export interface FileAttachmentMeta {
    blob: ExternalBlob;
    mimeType: string;
    filename: string;
}
export type MessageId = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type ConversationId = bigint;
export interface Message {
    id: MessageId;
    kind: MessageKind;
    createdAt: Timestamp;
    conversationId: ConversationId;
}
export interface ImageGenRequest {
    conversationId: ConversationId;
    prompt: string;
}
export interface Conversation {
    id: ConversationId;
    title: string;
    owner: UserId;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    appendMessage(req: AppendMessageRequest): Promise<Message>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createConversation(req: CreateConversationRequest): Promise<Conversation>;
    deleteConversation(id: ConversationId): Promise<boolean>;
    generateImage(req: ImageGenRequest): Promise<ImageGenResponse>;
    getCallerUserRole(): Promise<UserRole>;
    getMessages(conversationId: ConversationId): Promise<Array<Message>>;
    isCallerAdmin(): Promise<boolean>;
    listConversations(req: ListConversationsRequest): Promise<ListConversationsResponse>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    transformChat(input: TransformationInput): Promise<TransformationOutput>;
}
