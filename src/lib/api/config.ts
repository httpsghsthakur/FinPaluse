/**
 * FinPaluse API Configuration
 * 
 * Changing USE_MOCK to false allows this frontend client to switch
 * seamlessly to a real REST/WebSocket backend without modifying any UI components.
 */
export const API_CONFIG = {
  USE_MOCK: false,
  BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1',
  WS_URL: (import.meta as any).env?.VITE_WS_URL || '/ws',
  SIMULATED_LATENCY_MIN_MS: 200,
  SIMULATED_LATENCY_MAX_MS: 500,
};
