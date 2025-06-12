
import { useState, useEffect } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";
import { llmCanisterService } from "@/services/llmCanister";

export const useLLMCanister = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPrincipal, setUserPrincipal] = useState<Principal | null>(null);

  useEffect(() => {
    const initializeCanister = async () => {
      try {
        setIsLoading(true);
        
        // Get the canister ID from environment or use a default
        // You should replace this with your actual LLM canister ID
        const canisterId = import.meta.env.VITE_LLM_CANISTER_ID || "rdmx6-jaaaa-aaaah-qdrva-cai";
        const isLocal = import.meta.env.DEV;
        
        const success = await llmCanisterService.initialize(canisterId, isLocal);
        
        if (success) {
          setIsInitialized(true);
          
          // Get user principal if authenticated
          const authClient = await AuthClient.create();
          const isAuthenticated = await authClient.isAuthenticated();
          
          if (isAuthenticated) {
            const identity = authClient.getIdentity();
            setUserPrincipal(identity.getPrincipal());
          }
        } else {
          setError("Failed to initialize LLM canister");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    initializeCanister();
  }, []);

  const generateResponse = async (prompt: string): Promise<string> => {
    if (!isInitialized) {
      throw new Error("LLM canister not initialized");
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await llmCanisterService.generateResponse(prompt);
      
      // Save the conversation to the canister
      await llmCanisterService.saveChatMessage(prompt, response, userPrincipal || undefined);
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate response";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getChatHistory = async () => {
    if (!isInitialized) {
      return [];
    }

    try {
      return await llmCanisterService.getChatHistory(userPrincipal || undefined);
    } catch (err) {
      console.error("Failed to get chat history:", err);
      return [];
    }
  };

  return {
    isInitialized,
    isLoading,
    error,
    generateResponse,
    getChatHistory,
    userPrincipal,
  };
};
