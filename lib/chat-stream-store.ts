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
    setMessages: (msgs: ChatMessage[]) => void;
    addMessage: (msg: ChatMessage) => void;
    startStream: () => void;
    updateStream: (chunk: string) => void;
    finishStream: () => void;
    clear: () => void;
};

export const useChatStreamStore = create<Store>((set) => ({
    messages: [],
    isStreaming: false,
    streamedContent: "",
    setMessages: (msgs) => set({ messages: msgs }),
    addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
    startStream: () => set({ isStreaming: true, streamedContent: "" }),
    updateStream: (chunk) => set((s) => ({ streamedContent: s.streamedContent + chunk })),
    finishStream: () => set({ isStreaming: false }),
    clear: () => set({ messages: [], streamedContent: "", isStreaming: false }),
})); 