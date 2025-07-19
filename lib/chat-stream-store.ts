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
    clearStreamedContent: () => void;
};

export const useChatStreamStore = create<Store>((set, get) => ({
    messages: [],
    isStreaming: false,
    streamedContent: "",
    setMessages: (msgs) => {
        console.log("📝 [ChatStore] Setting messages:", msgs.length, "messages");
        set({ messages: msgs });
    },
    addMessage: (msg) => {
        console.log("💬 [ChatStore] Adding message:", msg.content.substring(0, 30) + "...");
        set((s) => ({ messages: [...s.messages, msg] }));
    },
    startStream: () => {
        console.log("🌊 [ChatStore] Starting stream");
        set({ isStreaming: true, streamedContent: "" });
        console.log("🌊 [ChatStore] Stream started, isStreaming set to true");
    },
    updateStream: (chunk) => {
        const currentState = get();
        console.log("📝 [ChatStore] Updating stream, current length:", currentState.streamedContent.length, "new chunk length:", chunk.length);
        console.log("📝 [ChatStore] New chunk preview:", chunk.substring(0, 50) + "...");
        console.log("📝 [ChatStore] Full chunk content:", chunk);
        set((s) => ({ streamedContent: s.streamedContent + chunk }));
        console.log("📝 [ChatStore] Stream updated, new total length:", get().streamedContent.length);
        console.log("📝 [ChatStore] New total content preview:", get().streamedContent.substring(0, 100) + "...");
    },
    finishStream: () => {
        const currentState = get();
        console.log("🏁 [ChatStore] Finishing stream, final content length:", currentState.streamedContent.length);
        console.log("🏁 [ChatStore] Final content preview:", currentState.streamedContent.substring(0, 100) + "...");
        // Don't clear streamedContent here - it needs to be preserved for saving
        set({ isStreaming: false });
        console.log("🏁 [ChatStore] Stream finished, isStreaming set to false");
    },
    clear: () => {
        console.log("🗑️ [ChatStore] Clearing all state");
        set({ messages: [], streamedContent: "", isStreaming: false });
    },
    clearStreamedContent: () => {
        console.log("🗑️ [ChatStore] Clearing streamed content");
        set({ streamedContent: "" });
    },
})); 