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
  // Type definitions
  public type Message = {
    id: Text;
    role: Text;  // "user" or "assistant"
    content: Text;
    timestamp: Int;
    context: ?[Text];  // Optional context for RAG
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
    context: ?[Text];  // Additional context from RAG
    temperature: ?Float;
    stream: Bool;
  };
  
  public type AIResponse = {
    text: Text;
    tokensUsed: Nat;
    model: Text;
    finishReason: Text;
  };
  
  // State
  private let conversations = HashMap.HashMap<Text, Conversation>(100, Text.equal, Text.hash);
  private stable var nextId: Nat = 0;
  private var stats = {
    totalMessages = 0;
    totalTokens = 0;
    totalConversations = 0;
  };
  
  // Helper: Generate ID
  private func generateId() : Text {
    nextId += 1;
    let timestamp = Int.abs(Time.now());
    return Nat.toText(timestamp) # "-" # Nat.toText(nextId);
  };
  
  // 1. Create new conversation
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
  
  // 2. Get all conversations for user
  public shared(msg) func getConversations() : async [Conversation] {
    let all = Iter.toArray(conversations.vals());
    let userConvs = Array.filter(all, func(c: Conversation) : Bool {
      Principal.equal(c.userId, msg.caller)
    });
    // Sort by updatedAt descending
    Array.sort(userConvs, func(a: Conversation, b: Conversation) : Int {
      if (a.updatedAt > b.updatedAt) return -1;
      if (a.updatedAt < b.updatedAt) return 1;
      return 0;
    });
  };
  
  // 3. Get conversation with messages
  public shared(msg) func getConversation(id: Text) : async ?Conversation {
    switch (conversations.get(id)) {
      case null { return null };
      case (?conv) {
        if (Principal.equal(conv.userId, msg.caller)) {
          return ?conv;
        } else {
          return null;
        };
      };
    };
  };
  
  // 4. Send message to AI with context
  public shared(msg) func sendMessage(request: AIRequest) : async Result.Result<AIResponse, Text> {
    // Get conversation
    switch (conversations.get(request.conversationId)) {
      case null { return #err("Conversation not found") };
      case (?conversation) {
        if (not Principal.equal(conversation.userId, msg.caller)) {
          return #err("Unauthorized");
        };
        
        // Add user message
        let userMessageId = generateId();
        let userMessage: Message = {
          id = userMessageId;
          role = "user";
          content = request.message;
          timestamp = Time.now();
          context = request.context;
        };
        
        let updatedMessages = Array.append(conversation.messages, [userMessage]);
        
        // Build context for LLM
        let llmMessages = buildLLMMessages(updatedMessages, request.context);
        
        try {
          // Call real LLM
          let startTime = Time.now();
          let llmResponse = await LLM.chat(llmMessages, request.temperature);
          let endTime = Time.now();
          
          // Add assistant response
          let assistantMessageId = generateId();
          let assistantMessage: Message = {
            id = assistantMessageId;
            role = "assistant";
            content = llmResponse.text;
            timestamp = Time.now();
            context = null;
          };
          
          let finalMessages = Array.append(updatedMessages, [assistantMessage]);
          
          // Update conversation
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
          
          // Update stats
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
  
  // 5. Build messages for LLM with proper formatting
  private func buildLLMMessages(messages: [Message], context: ?[Text]) : [LLM.Message] {
    var llmMessages: [LLM.Message] = [];
    
    // Add system message with context
    var systemContent = "You are a helpful AI assistant.";
    switch (context) {
      case null { };
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
    
    // Add conversation history
    for (msg in messages.vals()) {
      llmMessages := Array.append(llmMessages, [{
        role = msg.role;
        content = msg.content;
      }]);
    };
    
    llmMessages;
  };
  
  // 6. Stream response (for real-time chat)
  public shared(msg) func streamMessage(request: AIRequest, callback: (Text) -> async ()) : async Result.Result<(), Text> {
    // Similar to sendMessage but with streaming
    switch (await sendMessage({ request with stream = false })) {
      case (#err(e)) { return #err(e); };
      case (#ok(response)) {
        // Simulate streaming by sending chunks
        let chunks = splitIntoChunks(response.text, 50);
        for (chunk in chunks.vals()) {
          await callback(chunk);
        };
        return #ok(());
      };
    };
  };
  
  // 7. Search conversations by title
  public shared(msg) func searchConversations(query: Text) : async [Conversation] {
    let all = await getConversations();
    let results = Array.filter(all, func(c: Conversation) : Bool {
      Text.contains(c.title, #text query) or Text.contains(c.title, #text Text.toLowercase(query))
    });
    results;
  };
  
  // 8. Delete conversation
  public shared(msg) func deleteConversation(id: Text) : async Bool {
    switch (conversations.get(id)) {
      case null { return false };
      case (?conv) {
        if (Principal.equal(conv.userId, msg.caller)) {
          conversations.delete(id);
          stats := {
            totalMessages = stats.totalMessages - conv.messages.size();
            totalTokens = stats.totalTokens - conv.metadata.tokensUsed;
            totalConversations = stats.totalConversations - 1;
          };
          return true;
        } else {
          return false;
        };
      };
    };
  };
  
  // 9. Get statistics
  public shared(msg) func getStats() : async {
    conversations: Nat;
    messages: Nat;
    tokens: Nat;
    userId: Principal;
  } {
    let userConvs = await getConversations();
    var totalMessages = 0;
    var totalTokens = 0;
    for (conv in userConvs.vals()) {
      totalMessages += conv.messages.size();
      totalTokens += conv.metadata.tokensUsed;
    };
    {
      conversations = userConvs.size();
      messages = totalMessages;
      tokens = totalTokens;
      userId = msg.caller;
    };
  };
  
  // 10. Export conversation data
  public shared(msg) func exportConversation(id: Text) : async ?{
    conversation: Conversation;
    metadata: {
      exportedAt: Int;
      format: Text;
    };
  } {
    switch (await getConversation(id)) {
      case null { return null };
      case (?conv) {
        return ?{
          conversation = conv;
          metadata = {
            exportedAt = Time.now();
            format = "json";
          };
        };
      };
    };
  };
  
  // Helper: Split text into chunks
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
  
  // Health check
  public query func health() : async Text {
    let llmHealth = await LLM.health();
    return "Backend: healthy, LLM: " # llmHealth;
  };
}