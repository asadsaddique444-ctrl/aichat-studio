import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import AccessControl "mo:caffeineai-authorization/access-control";
import ChatLib "../lib/chat";
import ImageGenLib "../lib/imagegen";
import Types "../types/chat";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  conversationStore : ChatLib.ConversationStore,
  messageStore : ChatLib.MessageStore,
  nextMessageId : { var value : Nat },
) {
  /// IC HTTP transform callback required for outcalls.
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  /// Trigger AI image generation and store the result reference as a message in the conversation.
  public shared ({ caller }) func generateImage(req : Types.ImageGenRequest) : async Types.ImageGenResponse {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: must be logged in");
    };
    // Verify caller owns the conversation
    switch (conversationStore.get(req.conversationId)) {
      case null Runtime.trap("Conversation not found");
      case (?conv) {
        if (not Principal.equal(conv.owner, caller)) {
          Runtime.trap("Unauthorized: not conversation owner");
        };
      };
    };

    let url = ImageGenLib.buildImageGenUrl(req.prompt);

    // Make HTTP GET outcall to Pollinations.ai to validate the image is ready.
    // We pass the URL itself back to the frontend via rawJson so it can display the image.
    let _ = await OutCall.httpGetRequest(url, [], transform);

    // Store the image URL encoded as a Blob reference in the conversation.
    // The frontend will decode this blob as UTF-8 to get the image URL.
    let blob : Blob = url.encodeUtf8();
    let msgId = nextMessageId.value;
    nextMessageId.value += 1;
    let now = Time.now();
    let req2 : Types.AppendMessageRequest = {
      conversationId = req.conversationId;
      kind = #aiImage blob;
    };
    let _ = ChatLib.appendMessage(messageStore, conversationStore, msgId, caller, req2, now);

    { messageId = msgId; rawJson = url };
  };
};
