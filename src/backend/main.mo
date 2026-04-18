import LLM "canister:real_llm";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Result "mo:base/Result";

persistent actor EnhancedBackend {

  // -----------------------------
  // Types
  // -----------------------------
  public type Message = {
    id: Text;
    role: Text; // "user" or "assistant"
    content: Text;
    timestamp: Int;
    context: ?[Text];
  };

  public type Conversation = {
    id: Text;
    userId: Principal;
    title: Text;
    messages: [Message];
    createdAt: Int;
    updatedAt: Int;
    metadata: {
      model: Text;
      tokensUsed: Nat;
    };
  };

  public type AIRequest = {
    message: Text;
    conversationId: Text;
    context: ?[Text];
    temperature: ?Float;
    stream: Bool;
  };

  public type AIResponse = {
    text: Text;
    tokensUsed: Nat;
    model: Text;
    finishReason: Text;
  };

  // -----------------------------
  // State
  // -----------------------------
  private let conversations = HashMap.HashMap<Text, Conversation>(100, Text.equal, Text.hash);
  private stable var nextId: Nat = 0;
  private var stats = {
    totalMessages = 0;
    totalTokens = 0;
    totalConversations = 0;
  };

  // -----------------------------
  // Helpers
  // -----------------------------
  private func generateId() : Text {
    nextId += 1;
    let timestamp = Int.abs(Time.now());
    return Nat.toText(timestamp) # "-" # Nat.toText(nextId);
  };

  private func splitIntoChunks(text: Text, chunkSize: Nat) : [Text] {
    let totalSize = Text.size(text);
    let numChunks = totalSize / chunkSize + 1;
    let chunks = Array.init<Text>(numChunks, "");
    var position = 0;

    for (i in Array.range(0, numChunks - 1)) {
      let end = if (position + chunkSize > totalSize) totalSize else position + chunkSize;
      chunks[i] := Text.sub(text, position, end - position);
      position := end;
    };
    Array.freeze(chunks);
  };

  private func buildLLMMessages(messages: [Message], context: ?[Text]) : [LLM.Message] {
    var llmMessages: [LLM.Message] = [];

    var systemContent = "You are a helpful AI assistant.";
    switch (context) {
      case null {};
      case (?ctx) {
        systemContent := systemContent # "\n\nContext information:\n";
        for (item in ctx.vals()) {
          systemContent := systemContent # "- " # item # "\n";
        };
      };
    };

    llmMessages := Array.append(llmMessages, [{
      role = "system";
      content = systemContent;
    }]);

    for (msg in messages.vals()) {
      llmMessages := Array.append(llmMessages, [{
        role = msg.role;
        content = msg.content;
      }]);
    };
    llmMessages;
  };

  // -----------------------------
  // Public API
  // -----------------------------
  public shared(msg) func createConversation(title: Text) : async Text {
    let id = generateId();
    let conversation: Conversation = {
      id = id;
      userId = msg.caller;
      title = title;
      messages = [];
      createdAt = Time.now();
      updatedAt = Time.now();
      metadata = {
        model = "";
        tokensUsed = 0;
      };
    };
    conversations.put(id, conversation);
    stats := {
      totalMessages = stats.totalMessages;
      totalTokens = stats.totalTokens;
      totalConversations = stats.totalConversations + 1;
    };
    Debug.print("Conversation created: " # id);
    return id;
  };

  public shared(msg) func getConversations() : async [Conversation] {
    let all = Iter.toArray(conversations.vals());
    let userConvs = Array.filter(all, func(c: Conversation) : Bool {
      Principal.equal(c.userId, msg.caller)
    });
    Array.sort(userConvs, func(a: Conversation, b: Conversation) : Int {
      if (a.updatedAt > b.updatedAt) return -1;
      if (a.updatedAt < b.updatedAt) return 1;
      return 0;
    });
    userConvs;
  };

  public shared(msg) func getConversation(id: Text) : async ?Conversation {
    switch (conversations.get(id)) {
      case null { return null; };
      case (?conv) {
        if (Principal.equal(conv.userId, msg.caller)) {
          return ?conv;
        } else {
          return null;
        };
      };
    };
  };

  public shared(msg) func sendMessage(request: AIRequest) : async Result.Result<AIResponse, Text> {
    switch (conversations.get(request.conversationId)) {
      case null { return #err("Conversation not found"); };
      case (?conversation) {
        if (not Principal.equal(conversation.userId, msg.caller)) {
          return #err("Unauthorized");
        };

        let userMessageId = generateId();
        let userMessage: Message = {
          id = userMessageId;
          role = "user";
          content = request.message;
          timestamp = Time.now();
          context = request.context;
        };
        let updatedMessages = Array.append(conversation.messages, [userMessage]);
        let llmMessages = buildLLMMessages(updatedMessages, request.context);

        try {
          let startTime = Time.now();
          let llmResponse = await LLM.chat(llmMessages, request.temperature);
          let endTime = Time.now();

          let assistantMessageId = generateId();
          let assistantMessage: Message = {
            id = assistantMessageId;
            role = "assistant";
            content = llmResponse.text;
            timestamp = Time.now();
            context = null;
          };

          let finalMessages = Array.append(updatedMessages, [assistantMessage]);

          let updatedConversation: Conversation = {
            id = conversation.id;
            userId = conversation.userId;
            title = conversation.title;
            messages = finalMessages;
            createdAt = conversation.createdAt;
            updatedAt = Time.now();
            metadata = {
              model = llmResponse.model;
              tokensUsed = conversation.metadata.tokensUsed + llmResponse.usage.totalTokens;
            };
          };
          conversations.put(request.conversationId, updatedConversation);

          stats := {
            totalMessages = stats.totalMessages + 2;
            totalTokens = stats.totalTokens + llmResponse.usage.totalTokens;
            totalConversations = stats.totalConversations;
          };

          Debug.print("AI responded in " # Nat64.toText(endTime - startTime) # "ms");

          #ok({
            text = llmResponse.text;
            tokensUsed = llmResponse.usage.totalTokens;
            model = llmResponse.model;
            finishReason = llmResponse.finishReason;
          });
        } catch (e) {
          #err("LLM error: " # Error.message(e));
        };
      };
    };
  };

  public shared(msg) func health() : async Text {
    let llmHealth = await LLM.health();
    return "Backend: healthy, LLM: " # llmHealth;
  };
};