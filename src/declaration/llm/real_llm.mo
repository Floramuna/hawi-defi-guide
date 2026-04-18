import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Float "mo:base/Float";
import Nat64 "mo:base/Nat64";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";

persistent actor RealLLM {
  // Configuration
  private stable var config : Config = {
    apiKey = "";  // You'll set this via environment
    model = "gpt-3.5-turbo";
    maxTokens = 2000;
    temperature = 0.7;
  };
  
  // Cache for responses (optional)
  private let cache = HashMap.HashMap<Text, Response>(100, Text.equal, Text.hash);
  
  // Types
  public type Config = {
    apiKey: Text;
    model: Text;
    maxTokens: Nat64;
    temperature: Float;
  };
  
  public type Message = {
    role: Text;  // "user", "assistant", "system"
    content: Text;
  };
  
  public type Response = {
    text: Text;
    usage: {
      promptTokens: Nat64;
      completionTokens: Nat64;
      totalTokens: Nat64;
    };
    model: Text;
    finishReason: Text;
  };
  
  public type StreamingResponse = {
    text: Text;
    finished: Bool;
    id: Text;
  };
  
  // Set configuration (call this once with your API key)
  public func setConfig(newConfig: Config) : async () {
    config := newConfig;
    Debug.print("Config updated: model=" # config.model);
  };
  
  // Get current config
  public query func getConfig() : async Config {
    config
  };
  
  // Simple chat completion
  public func chat(messages: [Message], temperature: ?Float) : async Response {
    // Check cache first
    let cacheKey = generateCacheKey(messages);
    switch (cache.get(cacheKey)) {
      case (?cached) { return cached; };
      case null { /* Continue to API call */ };
    };
    
    // Prepare the request
    let requestBody = {
      model = config.model;
      messages = messages;
      max_tokens = config.maxTokens;
      temperature = switch (temperature) {
        case null { config.temperature };
        case (?t) { t };
      };
    };
    
    try {
      // This would be a real HTTPS outcalls to OpenAI
      // For now, we'll simulate with a realistic response
      let response = await mockAPI(requestBody);
      
      // Cache the response
      cache.put(cacheKey, response);
      
      return response;
    } catch (e) {
      Debug.print("LLM API error: " # Error.message(e));
      throw e;
    };
  };
  
  // Stream chat completion (for real-time)
  public func streamChat(messages: [Message], onChunk: (Text) -> async ()) : async () {
    // In a real implementation, this would stream chunks from the API
    let fullResponse = await chat(messages, null);
    for (chunk in splitIntoChunks(fullResponse.text, 50)) {
      await onChunk(chunk);
    };
  };
  
  // Generate embeddings for semantic search
  public func embed(text: Text) : async [Float] {
    // Real implementation would call OpenAI's embedding API
    // For now, return a mock embedding vector
    let dimension = 1536;  // OpenAI embedding dimension
    let embedding = Array.init<Float>(dimension, 0.0);
    let hash = Text.hash(text);
    
    for (i in Array.range(0, dimension - 1)) {
      embedding[i] := Float.fromInt((hash + i) % 100) / 100.0;
    };
    
    Array.freeze(embedding);
  };
  
  // Semantic search across documents
  public func semanticSearch(query: Text, documents: [Text], topK: Nat) : async [(Text, Float)] {
    let queryEmbedding = await embed(query);
    let results = Array.init<(Text, Float)>(documents.size(), ("", 0.0));
    
    for (i in Array.range(0, documents.size() - 1)) {
      let docEmbedding = await embed(documents[i]);
      let similarity = cosineSimilarity(queryEmbedding, docEmbedding);
      results[i] := (documents[i], similarity);
    };
    
    // Sort by similarity and return top K
    let sorted = Array.sort(results, func(a: (Text, Float), b: (Text, Float)) : Int {
      if (a.1 > b.1) return -1;
      if (a.1 < b.1) return 1;
      return 0;
    });
    
    Array.take(sorted, topK);
  };
  
  // Helper: Generate cache key
  private func generateCacheKey(messages: [Message]) : Text {
    var key = "";
    for (msg in messages.vals()) {
      key := key # msg.role # ":" # msg.content # "|";
    };
    key # Float.toText(config.temperature) # Nat64.toText(config.maxTokens);
  };
  
  // Helper: Mock API call (replace with real HTTPS outcalls)
  private func mockAPI(requestBody: { model: Text; messages: [Message]; max_tokens: Nat64; temperature: Float }) : async Response {
    // Simulate API latency
    await async {
      for (i in Array.range(0, 100)) { /* Simulate work */ };
    };
    
    let lastMessage = switch (requestBody.messages.last()) {
      case null { "Hello" };
      case (?msg) { msg.content };
    };
    
    let responseText = "AI Response to: " # lastMessage # "\n\nThis is a simulated response from the LLM. In production, this would call OpenAI's API.";
    
    {
      text = responseText;
      usage = {
        promptTokens = 150;
        completionTokens = 50;
        totalTokens = 200;
      };
      model = requestBody.model;
      finishReason = "stop";
    }
  };
  
  // Helper: Split text into chunks
  private func splitIntoChunks(text: Text, chunkSize: Nat) : [Text] {
    let chars = text.chars();
    let chunks = Array.init<Text>(Text.size(text) / chunkSize + 1, "");
    var chunkIndex = 0;
    var currentChunk = "";
    
    for (char in chars) {
      currentChunk := currentChunk # Text.fromChar(char);
      if (Text.size(currentChunk) >= chunkSize) {
        chunks[chunkIndex] := currentChunk;
        chunkIndex += 1;
        currentChunk := "";
      };
    };
    
    if (currentChunk != "") {
      chunks[chunkIndex] := currentChunk;
    };
    
    Array.freeze(chunks);
  };
  
  // Helper: Cosine similarity for embeddings
  private func cosineSimilarity(a: [Float], b: [Float]) : Float {
    var dotProduct = 0.0;
    var normA = 0.0;
    var normB = 0.0;
    
    for (i in Array.range(0, a.size() - 1)) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    };
    
    dotProduct / Float.sqrt(normA * normB);
  };
  
  // Health check
  public query func health() : async Text {
    if (config.apiKey != "") {
      "healthy - API key configured"
    } else {
      "degraded - API key not configured"
    };
  };
  
  // Clear cache
  public func clearCache() : async () {
    cache.clear();
  };
}