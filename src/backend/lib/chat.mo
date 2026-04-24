import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Nat32 "mo:core/Nat32";
import Nat8 "mo:core/Nat8";
import Types "../types/chat";
import Common "../types/common";

module {
  public type ConversationStore = Map.Map<Common.ConversationId, Types.Conversation>;
  public type MessageStore = Map.Map<Common.MessageId, Types.Message>;
  public type UserConversations = Map.Map<Common.UserId, List.List<Common.ConversationId>>;

  public func createConversation(
    store : ConversationStore,
    userIndex : UserConversations,
    nextId : Nat,
    owner : Common.UserId,
    title : Text,
    now : Common.Timestamp,
  ) : Types.Conversation {
    let conv : Types.Conversation = {
      id = nextId;
      owner;
      title;
      createdAt = now;
      updatedAt = now;
    };
    store.add(nextId, conv);
    let existing = switch (userIndex.get(owner)) {
      case (?list) list;
      case null {
        let list = List.empty<Common.ConversationId>();
        userIndex.add(owner, list);
        list;
      };
    };
    existing.add(nextId);
    conv;
  };

  public func deleteConversation(
    store : ConversationStore,
    messageStore : MessageStore,
    userIndex : UserConversations,
    caller : Common.UserId,
    id : Common.ConversationId,
  ) : Bool {
    switch (store.get(id)) {
      case null false;
      case (?conv) {
        if (not Principal.equal(conv.owner, caller)) {
          Runtime.trap("Unauthorized: not conversation owner");
        };
        store.remove(id);
        // Remove all messages belonging to this conversation
        let toDelete = List.empty<Common.MessageId>();
        messageStore.forEach(func(msgId, msg) {
          if (msg.conversationId == id) {
            toDelete.add(msgId);
          };
        });
        toDelete.forEach(func(msgId) {
          messageStore.remove(msgId);
        });
        // Remove from user index
        switch (userIndex.get(caller)) {
          case null {};
          case (?list) {
            let filtered = list.filter(func(cid) { cid != id });
            list.clear();
            list.append(filtered);
          };
        };
        true;
      };
    };
  };

  public func listConversations(
    store : ConversationStore,
    messageStore : MessageStore,
    userIndex : UserConversations,
    caller : Common.UserId,
    offset : Nat,
    limit : Nat,
  ) : Types.ListConversationsResponse {
    let ids : List.List<Common.ConversationId> = switch (userIndex.get(caller)) {
      case null List.empty();
      case (?list) list;
    };
    let total = ids.size();
    // Build previews sorted by updatedAt descending
    let all = List.empty<Types.ConversationPreview>();
    ids.forEach(func(cid) {
      switch (store.get(cid)) {
        case null {};
        case (?conv) {
          let snippet = snippetFromMessages(messageStore, cid);
          all.add({
            id = conv.id;
            title = conv.title;
            snippet;
            updatedAt = conv.updatedAt;
          });
        };
      };
    });
    // Sort by updatedAt descending
    all.sortInPlace(func(a, b) {
      if (a.updatedAt > b.updatedAt) #less
      else if (a.updatedAt < b.updatedAt) #greater
      else #equal;
    });
    let page = all.sliceToArray(offset, offset + limit);
    { conversations = page; total };
  };

  public func appendMessage(
    messageStore : MessageStore,
    store : ConversationStore,
    nextId : Nat,
    caller : Common.UserId,
    req : Types.AppendMessageRequest,
    now : Common.Timestamp,
  ) : Types.Message {
    switch (store.get(req.conversationId)) {
      case null Runtime.trap("Conversation not found");
      case (?conv) {
        if (not Principal.equal(conv.owner, caller)) {
          Runtime.trap("Unauthorized: not conversation owner");
        };
        let msg : Types.Message = {
          id = nextId;
          conversationId = req.conversationId;
          kind = req.kind;
          createdAt = now;
        };
        messageStore.add(nextId, msg);
        // Update conversation updatedAt
        let updated : Types.Conversation = { conv with updatedAt = now };
        store.add(conv.id, updated);
        msg;
      };
    };
  };

  public func getMessages(
    messageStore : MessageStore,
    store : ConversationStore,
    caller : Common.UserId,
    conversationId : Common.ConversationId,
  ) : [Types.Message] {
    switch (store.get(conversationId)) {
      case null Runtime.trap("Conversation not found");
      case (?conv) {
        if (not Principal.equal(conv.owner, caller)) {
          Runtime.trap("Unauthorized: not conversation owner");
        };
        let msgs = List.empty<Types.Message>();
        messageStore.forEach(func(_, msg) {
          if (msg.conversationId == conversationId) {
            msgs.add(msg);
          };
        });
        msgs.sortInPlace(func(a, b) {
          if (a.createdAt < b.createdAt) #less
          else if (a.createdAt > b.createdAt) #greater
          else #equal;
        });
        msgs.toArray();
      };
    };
  };

  public func getConversation(
    store : ConversationStore,
    caller : Common.UserId,
    id : Common.ConversationId,
  ) : ?Types.Conversation {
    switch (store.get(id)) {
      case null null;
      case (?conv) {
        if (not Principal.equal(conv.owner, caller)) null
        else ?conv;
      };
    };
  };

  public func snippetFromMessages(
    messageStore : MessageStore,
    conversationId : Common.ConversationId,
  ) : Text {
    let msgs = List.empty<Types.Message>();
    messageStore.forEach(func(_, msg) {
      if (msg.conversationId == conversationId) {
        msgs.add(msg);
      };
    });
    msgs.sortInPlace(func(a, b) {
      if (a.createdAt > b.createdAt) #less
      else if (a.createdAt < b.createdAt) #greater
      else #equal;
    });
    switch (msgs.first()) {
      case null "";
      case (?msg) {
        switch (msg.kind) {
          case (#userText t) truncate(t, 80);
          case (#aiText t) truncate(t, 80);
          case (#aiImage _) "[Image]";
          case (#fileAttachment f) "[File: " # f.filename # "]";
        };
      };
    };
  };

  func truncate(text : Text, maxLen : Nat) : Text {
    if (text.size() <= maxLen) text
    else {
      let chars = text.toArray();
      let slice = chars.sliceToArray(0, maxLen);
      Text.fromArray(slice) # "...";
    };
  };

  /// Percent-encode a text string for safe embedding in a URL path.
  /// Unreserved characters (A-Z a-z 0-9 - _ . ~) are passed through unchanged;
  /// everything else is encoded as %XX hex pairs.
  public func urlEncode(text : Text) : Text {
    let hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
    var result = "";
    for (c in text.toIter()) {
      let n = c.toNat32();
      // Unreserved: A-Z (65-90), a-z (97-122), 0-9 (48-57), - (45), _ (95), . (46), ~ (126)
      if (
        (n >= 65 and n <= 90) or
        (n >= 97 and n <= 122) or
        (n >= 48 and n <= 57) or
        n == 45 or n == 95 or n == 46 or n == 126
      ) {
        result #= Text.fromChar(c);
      } else if (n <= 127) {
        // ASCII non-unreserved: encode as %XX
        let hi = hexChars[(n / 16).toNat()];
        let lo = hexChars[(n % 16).toNat()];
        result #= "%" # Text.fromChar(hi) # Text.fromChar(lo);
      } else {
        // Multi-byte UTF-8: encode each byte of the UTF-8 representation
        // For simplicity, encode the raw bytes of the UTF-8 encoding
        let blob = Text.fromChar(c).encodeUtf8();
        for (byte in blob.toArray().values()) {
          let b = byte.toNat();
          let hi = hexChars[b / 16];
          let lo = hexChars[b % 16];
          result #= "%" # Text.fromChar(hi) # Text.fromChar(lo);
        };
      };
    };
    result;
  };
};
