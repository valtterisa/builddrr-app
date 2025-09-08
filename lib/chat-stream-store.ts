import { create } from "zustand";

export type ChatMessage = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
};

type ChatStatus = "ready" | "submitted" | "streaming" | "error";

type Store = {
  messages: ChatMessage[];
  streamedContent: string;
  deploymentUrl?: string;
  status: ChatStatus;
  setMessages: (msgs: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;
  setStatus: (status: ChatStatus) => void;
  startStream: () => void;
  updateStream: (chunk: string) => void;
  finishStream: () => void;
  failStream: () => void;
  clearStreamedContent: () => void;
};

export const useChatStreamStore = create<Store>((set, get) => ({
  messages: [],
  streamedContent: "",
  deploymentUrl: undefined,
  status: "ready",
  setMessages: (msgs) => {
    set({ messages: msgs });
  },
  addMessage: (msg) => {
    set((s) => ({ messages: [...s.messages, msg] }));
  },
  setStatus: (status) => {
    set({ status });
  },
  startStream: () => {
    set({ status: "streaming", streamedContent: "" });
  },
  updateStream: (chunk) => {
    set((s) => ({ streamedContent: s.streamedContent + chunk }));
  },
  finishStream: () => {
    set({ status: "ready" });
  },
  failStream: () => {
    set({ status: "error" });
  },

  clearStreamedContent: () => {
    set({ streamedContent: "" });
  },
}));
