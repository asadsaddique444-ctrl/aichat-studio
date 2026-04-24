import Map "mo:core/Map";
import _List "mo:core/List";
import _Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import ChatLib "lib/chat";
import ChatMixin "mixins/chat-api";
import ImageGenMixin "mixins/imagegen-api";

actor {
  // --- Authorization ---
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // --- Object storage (file upload infrastructure) ---
  include MixinObjectStorage();

  // --- Chat state ---
  let conversationStore : ChatLib.ConversationStore = Map.empty();
  let messageStore : ChatLib.MessageStore = Map.empty();
  let userConversations : ChatLib.UserConversations = Map.empty();
  let nextConversationId = { var value : Nat = 0 };
  let nextMessageId = { var value : Nat = 0 };

  // --- Chat API ---
  include ChatMixin(
    accessControlState,
    conversationStore,
    messageStore,
    userConversations,
    nextConversationId,
    nextMessageId,
  );

  // --- Image generation API ---
  include ImageGenMixin(
    accessControlState,
    conversationStore,
    messageStore,
    nextMessageId,
  );
};
