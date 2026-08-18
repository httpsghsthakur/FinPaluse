import { create } from 'zustand';
import { ChatMessage } from '../../types';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-msg-1',
    role: 'assistant',
    content: `👋 **Hi Alex! I'm FinPilot, your AI Financial Copilot.**

I have indexed your **3 connected accounts**, latest cash-flow runway, and 6 months of transaction history.

Here is what you can ask me:
- *"Can I afford a $650 weekend trip?"*
- *"How does my dining spend compare to last month?"*
- *"When will I hit my Emergency Fund target?"*
- *"What are my top 3 recurring subscriptions?"*`,
    timestamp: new Date().toISOString(),
    confidence: 'High',
    quickActions: [
      { label: 'Check Affordability ($500)', action: 'prompt' },
      { label: 'Dining vs Budget', action: 'prompt' },
      { label: 'Cash Runway Status', action: 'prompt' },
    ],
  },
];

const CHAT_STORAGE_KEY = 'finpilot_chat_history_v1';

function loadChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_MESSAGES;
}

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingDraft: string;
  personality: 'concise' | 'balanced' | 'detailed';
  addMessage: (msg: ChatMessage) => void;
  updateStreamingMessage: (id: string, token: string) => void;
  finishStreaming: (id: string, metadata?: Partial<ChatMessage>) => void;
  setStreaming: (isStreaming: boolean) => void;
  setStreamingDraft: (draft: string) => void;
  appendStreamingDraft: (chunk: string) => void;
  setPersonality: (personality: 'concise' | 'balanced' | 'detailed') => void;
  clearMessages: () => void;
  clearHistory: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: loadChatHistory(),
  isStreaming: false,
  streamingDraft: '',
  personality: 'balanced',

  addMessage: (msg) =>
    set((state) => {
      const updated = [...state.messages, msg];
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { messages: updated };
    }),

  updateStreamingMessage: (id, token) =>
    set((state) => {
      const updated = state.messages.map((m) => {
        if (m.id === id) {
          const currentText = m.text || m.content || '';
          const newText = currentText + token;
          return { ...m, text: newText, content: newText, isStreaming: true };
        }
        return m;
      });
      return { messages: updated, isStreaming: true };
    }),

  finishStreaming: (id, metadata) =>
    set((state) => {
      const updated = state.messages.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            ...metadata,
            isStreaming: false,
          };
        }
        return m;
      });
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { messages: updated, isStreaming: false };
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  setStreamingDraft: (streamingDraft) => set({ streamingDraft }),

  appendStreamingDraft: (chunk) =>
    set((state) => ({ streamingDraft: state.streamingDraft + chunk })),

  setPersonality: (personality) => set({ personality }),

  clearMessages: () => {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    set({ messages: INITIAL_MESSAGES, streamingDraft: '', isStreaming: false });
  },

  clearHistory: () => {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    set({ messages: INITIAL_MESSAGES, streamingDraft: '', isStreaming: false });
  },
}));
