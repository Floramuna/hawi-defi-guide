
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

// Define the interface for your LLM canister
export interface LLMCanister {
  generate_response: (prompt: string) => Promise<string>;
  get_chat_history: (user_id?: Principal) => Promise<Array<{ prompt: string; response: string; timestamp: bigint }>>;
  save_chat_message: (prompt: string, response: string, user_id?: Principal) => Promise<boolean>;
}

// IDL factory for your LLM canister - you'll need to update this based on your actual Motoko interface
const idlFactory = ({ IDL }: any) => {
  return IDL.Service({
    'generate_response': IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'get_chat_history': IDL.Func([IDL.Opt(IDL.Principal)], [IDL.Vec(IDL.Record({
      'prompt': IDL.Text,
      'response': IDL.Text,
      'timestamp': IDL.Nat64
    }))], ['query']),
    'save_chat_message': IDL.Func([IDL.Text, IDL.Text, IDL.Opt(IDL.Principal)], [IDL.Bool], []),
  });
};

class LLMCanisterService {
  private actor: LLMCanister | null = null;
  private agent: HttpAgent | null = null;

  // Initialize the canister connection
  async initialize(canisterId: string, isLocal: boolean = false) {
    try {
      const host = isLocal ? "http://localhost:4943" : "https://ic0.app";
      
      this.agent = new HttpAgent({ host });
      
      // Only fetch root key in local development
      if (isLocal) {
        await this.agent.fetchRootKey();
      }

      this.actor = Actor.createActor<LLMCanister>(idlFactory, {
        agent: this.agent,
        canisterId: Principal.fromText(canisterId),
      });

      console.log("LLM Canister initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize LLM canister:", error);
      return false;
    }
  }

  // Generate AI response using the LLM canister
  async generateResponse(prompt: string): Promise<string> {
    if (!this.actor) {
      throw new Error("LLM canister not initialized");
    }

    try {
      const response = await this.actor.generate_response(prompt);
      return response;
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  // Get chat history from the canister
  async getChatHistory(userId?: Principal): Promise<Array<{ prompt: string; response: string; timestamp: bigint }>> {
    if (!this.actor) {
      throw new Error("LLM canister not initialized");
    }

    try {
      const history = await this.actor.get_chat_history(userId ? [userId] : []);
      return history;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }
  }

  // Save chat message to the canister
  async saveChatMessage(prompt: string, response: string, userId?: Principal): Promise<boolean> {
    if (!this.actor) {
      throw new Error("LLM canister not initialized");
    }

    try {
      const success = await this.actor.save_chat_message(prompt, response, userId ? [userId] : []);
      return success;
    } catch (error) {
      console.error("Error saving chat message:", error);
      return false;
    }
  }
}

export const llmCanisterService = new LLMCanisterService();
