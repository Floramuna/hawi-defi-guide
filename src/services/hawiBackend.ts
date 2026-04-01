import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

// IDL factory for your HAWI backend canister
const idlFactory = ({ IDL }: any) => {
  return IDL.Service({
    'askQuestion': IDL.Func([IDL.Text], [IDL.Text], []),
  });
};

interface HawiBackendActor {
  askQuestion: (question: string) => Promise<string>;
}

class HawiBackendService {
  private actor: HawiBackendActor | null = null;
  private initialized = false;

  async initialize(): Promise<boolean> {
    try {
      const canisterId = import.meta.env.VITE_LLM_CANISTER_ID || "rdmx6-jaaaa-aaaah-qdrva-cai";
      const isLocal = import.meta.env.DEV;
      const host = isLocal ? "http://localhost:4943" : "https://ic0.app";

      const agent = new HttpAgent({ host });

      if (isLocal) {
        await agent.fetchRootKey();
      }

      this.actor = Actor.createActor<HawiBackendActor>(idlFactory, {
        agent,
        canisterId: Principal.fromText(canisterId),
      });

      this.initialized = true;
      console.log("HAWI Backend initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize HAWI backend:", error);
      return false;
    }
  }

  async askQuestion(question: string): Promise<string> {
    if (!this.actor) {
      // Try to initialize if not done yet
      const success = await this.initialize();
      if (!success || !this.actor) {
        throw new Error("Backend not available. Please try again later.");
      }
    }

    try {
      const response = await this.actor.askQuestion(question);
      return response;
    } catch (error) {
      console.error("Error calling askQuestion:", error);
      throw new Error("Failed to get response from AI. Please try again.");
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const hawiBackend = new HawiBackendService();
