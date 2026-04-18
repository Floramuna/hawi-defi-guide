import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory as BackendIDL } from '../../../.dfx/local/canisters/enhanced_backend/service.did.js';
import { idlFactory as LLMIDL } from '../../../.dfx/local/canisters/real_llm/service.did.js';

export class ICPConnection {
  private static instance: ICPConnection;
  private authClient: AuthClient | null = null;
  private agent: HttpAgent | null = null;
  private backendActor: any = null;
  private llmActor: any = null;

  static getInstance() {
    if (!ICPConnection.instance) {
      ICPConnection.instance = new ICPConnection();
    }
    return ICPConnection.instance;
  }

  async initialize() {
    try {
      this.authClient = await AuthClient.create();
      
      const isAuthenticated = await this.authClient.isAuthenticated();
      const identity = this.authClient.getIdentity();
      
      this.agent = new HttpAgent({
        identity,
        host: import.meta.env.DFX_NETWORK === 'ic' 
          ? 'https://ic0.app' 
          : 'http://localhost:8000'
      });
      
      if (import.meta.env.DFX_NETWORK !== 'ic') {
        await this.agent.fetchRootKey();
      }
      
      const backendCanisterId = import.meta.env.VITE_BACKEND_CANISTER_ID || 'rrkah-fqaaa-aaaaa-aaaaq-cai';
      const llmCanisterId = import.meta.env.VITE_LLM_CANISTER_ID || 'ryjl3-tyaaa-aaaaa-aaaba-cai';
      
      this.backendActor = Actor.createActor(BackendIDL, {
        agent: this.agent,
        canisterId: backendCanisterId,
      });
      
      this.llmActor = Actor.createActor(LLMIDL, {
        agent: this.agent,
        canisterId: llmCanisterId,
      });
      
      console.log('ICP Connection initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize ICP connection:', error);
      return false;
    }
  }

  async login() {
    if (!this.authClient) throw new Error('Auth client not initialized');
    
    return new Promise<void>((resolve, reject) => {
      this.authClient!.login({
        identityProvider: import.meta.env.DFX_NETWORK === 'ic'
          ? 'https://identity.ic0.app'
          : `http://localhost:4943?canisterId=${import.meta.env.VITE_INTERNET_IDENTITY_CANISTER_ID}`,
        onSuccess: () => {
          this.initialize();
          resolve();
        },
        onError: reject,
      });
    });
  }

  async logout() {
    if (this.authClient) {
      await this.authClient.logout();
      await this.initialize();
    }
  }

  getBackendActor() {
    return this.backendActor;
  }

  getLLMActor() {
    return this.llmActor;
  }

  isAuthenticated() {
    return this.authClient?.isAuthenticated() ?? false;
  }

  getIdentity() {
    return this.authClient?.getIdentity();
  }
}