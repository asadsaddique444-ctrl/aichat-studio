import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import AccessControl "mo:caffeineai-authorization/access-control";
import ChatLib "../lib/chat";
import Types "../types/chat";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  conversationStore : ChatLib.ConversationStore,
  messageStore : ChatLib.MessageStore,
  userConversations : ChatLib.UserConversations,
  nextConversationId : { var value : Nat },
  nextMessageId : { var value : Nat },
) {
  /// IC HTTP transform callback for chat text API outcalls.
  public query func transformChat(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  /// Create a new conversation for the authenticated caller.
  public shared ({ caller }) func createConversation(req : Types.CreateConversationRequest) : async Types.Conversation {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    let id = nextConversationId.value;
    nextConversationId.value += 1;
    let now = Time.now();
    ChatLib.createConversation(conversationStore, userConversations, id, caller, req.title, now);
  };

  /// Delete a conversation owned by the caller.
  public shared ({ caller }) func deleteConversation(id : Common.ConversationId) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    ChatLib.deleteConversation(conversationStore, messageStore, userConversations, caller, id);
  };

  /// Paginated list of conversations with preview snippet and timestamp.
  public query ({ caller }) func listConversations(req : Types.ListConversationsRequest) : async Types.ListConversationsResponse {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    ChatLib.listConversations(conversationStore, messageStore, userConversations, caller, req.offset, req.limit);
  };

  /// Append a message to a conversation. For #userText messages, an AI reply is
  /// fetched via HTTP outcall and stored as an #aiText message automatically.
  public shared ({ caller }) func appendMessage(req : Types.AppendMessageRequest) : async Types.Message {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    let id = nextMessageId.value;
    nextMessageId.value += 1;
    let now = Time.now();
    let userMsg = ChatLib.appendMessage(messageStore, conversationStore, id, caller, req, now);

    // Only trigger AI reply for plain user text messages.
    switch (req.kind) {
      case (#userText prompt) {
        let encoded = ChatLib.urlEncode(prompt);
        let url = "https://text.pollinations.ai/" # encoded # "?model=openai&stream=false";
        try {
          let aiText = await OutCall.httpGetRequest(url, [], transformChat);
          let aiId = nextMessageId.value;
          nextMessageId.value += 1;
          let aiNow = Time.now();
          let aiReq : Types.AppendMessageRequest = {
            conversationId = req.conversationId;
            kind = #aiText aiText;
          };
          let _ = ChatLib.appendMessage(messageStore, conversationStore, aiId, caller, aiReq, aiNow);
        } catch (_err) {
          // Silently ignore AI call failures — user message is already stored.
        };
      };
      case (_) {};
    };

    userMsg;
  };

  /// Retrieve the full message thread for a conversation.
  public query ({ caller }) func getMessages(conversationId : Common.ConversationId) : async [Types.Message] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    ChatLib.getMessages(messageStore, conversationStore, caller, conversationId);
  };
};
