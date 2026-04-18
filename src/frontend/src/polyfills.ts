// Polyfills for browser compatibility
import { Buffer } from 'buffer';

// Add Buffer to global scope for IC agent
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Polyfill for global
if (typeof global === 'undefined') {
  (window as any).global = window;
}

// Polyfill for process
if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}