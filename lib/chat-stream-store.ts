import { create } from "zustand";

export type ChatMessage = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
};

type Store = {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamedContent: string;
  deploymentUrl?: string;
  setMessages: (msgs: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;
  startStream: () => void;
  updateStream: (chunk: string) => void;
  finishStream: () => void;
  setDeploymentUrl: (url: string) => void;
  clear: () => void;
  clearStreamedContent: () => void;
};

export const useChatStreamStore = create<Store>((set, get) => ({
  messages: [],
  isStreaming: false,
  streamedContent: "",
  deploymentUrl: undefined,
  setMessages: (msgs) => {
    set({ messages: msgs });
  },
  addMessage: (msg) => {
    set((s) => ({ messages: [...s.messages, msg] }));
  },
  startStream: () => {
    set({ isStreaming: true, streamedContent: "" });
  },
  updateStream: (chunk) => {
    const currentState = get();
    set((s) => ({ streamedContent: s.streamedContent + chunk }));
  },
  finishStream: () => {
    const currentState = get();

    set({ isStreaming: false });
  },
  setDeploymentUrl: (url) => {
    set({ deploymentUrl: url });
  },
  clear: () => {
    set({
      messages: [],
      streamedContent: "",
      isStreaming: false,
      deploymentUrl: undefined,
    });
  },
  clearStreamedContent: () => {
    set({ streamedContent: "" });
  },
}));
