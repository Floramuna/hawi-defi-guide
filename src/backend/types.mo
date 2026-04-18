import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Int "mo:base/Int";

// Message types for chat
public type Message = {
  role: Text;
  content: Text;
  timestamp: Int;
};

// Chat session
public type ChatSession = {
  id: Text;
  userId: Principal;
  title: Text;
  messages: [Message];
  createdAt: Int;
  updatedAt: Int;
};

// AI response
public type AIResponse = {
  content: Text;
  error: ?Text;
  success: Bool;
};

// Configuration
public type Config = {
  maxTokens: Nat64;
  temperature: Float;
  model: Text;
};

// Input for chat completion
public type CompletionInput = {
  prompt: Text;
  systemPrompt: ?Text;
  temperature: ?Float;
  maxTokens: ?Nat64;
};

// Custom error types
public type Error = {
  #NotFound;
  #Unauthorized;
  #InvalidInput;
  #LLMError: Text;
};

// Result type
public type Result<T> = {
  #ok: T;
  #err: Error;
};