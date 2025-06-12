// Canister configuration
export const CANISTER_CONFIG = {
  // Replace with your actual LLM canister ID
  LLM_CANISTER_ID: import.meta.env.VITE_LLM_CANISTER_ID || "rdmx6-jaaaa-aaaah-qdrva-cai",
  
  // Network configuration
  IS_LOCAL: import.meta.env.DEV,
  IC_HOST: import.meta.env.DEV ? "http://localhost:4943" : "https://ic0.app",
  
  // Other canister IDs if needed
  BACKEND_CANISTER_ID: import.meta.env.VITE_BACKEND_CANISTER_ID,
};

// Helper to get canister URL
export const getCanisterUrl = (canisterId: string, isLocal: boolean = CANISTER_CONFIG.IS_LOCAL): string => {
  if (isLocal) {
    return `http://localhost:4943/?canisterId=${canisterId}`;
  }
  return `https://${canisterId}.ic0.app`;
};
