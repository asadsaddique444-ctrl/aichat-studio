import Common "common";
import Storage "mo:caffeineai-object-storage/Storage";

module {
  public type ConversationId = Common.ConversationId;
  public type MessageId = Common.MessageId;
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  public type MessageKind = {
    #userText : Text;
    #aiText : Text;
    #aiImage : Storage.ExternalBlob;
    #fileAttachment : FileAttachmentMeta;
  };

  public type FileAttachmentMeta = {
    filename : Text;
    mimeType : Text;
    blob : Storage.ExternalBlob;
  };

  public type Message = {
    id : MessageId;
    conversationId : ConversationId;
    kind : MessageKind;
    createdAt : Timestamp;
  };

  public type Conversation = {
    id : ConversationId;
    owner : UserId;
    title : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type ConversationPreview = {
    id : ConversationId;
    title : Text;
    snippet : Text;
    updatedAt : Timestamp;
  };

  public type CreateConversationRequest = {
    title : Text;
  };

  public type AppendMessageRequest = {
    conversationId : ConversationId;
    kind : MessageKind;
  };

  public type ListConversationsRequest = {
    offset : Nat;
    limit : Nat;
  };

  public type ListConversationsResponse = {
    conversations : [ConversationPreview];
    total : Nat;
  };

  public type ImageGenRequest = {
    conversationId : ConversationId;
    prompt : Text;
  };

  public type ImageGenResponse = {
    messageId : MessageId;
    rawJson : Text;
  };
};
