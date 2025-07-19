import { useState, useCallback, useRef } from 'react';
import { useChatStreamStore } from '@/lib/chat-stream-store';

export const useStreamingChat = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { startStream, updateStream, finishStream } = useChatStreamStore();

    // Debouncing for streaming updates
    const streamBufferRef = useRef("");
    const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedUpdateStream = useCallback((chunk: string) => {
        streamBufferRef.current += chunk;

        if (streamTimeoutRef.current) {
            clearTimeout(streamTimeoutRef.current);
        }

        streamTimeoutRef.current = setTimeout(() => {
            if (streamBufferRef.current) {
                updateStream(streamBufferRef.current);
                streamBufferRef.current = "";
            }
        }, 50); // 50ms debounce
    }, [updateStream]);

    const sendMessage = useCallback(
        async (message: string, appName: string, machineId: string) => {
            console.log("🚀 [useStreamingChat] sendMessage called with:", message.substring(0, 50) + "...");

            if (!message.trim()) {
                console.warn("⚠️ [useStreamingChat] Empty message, returning early");
                return;
            }

            console.log("🔄 [useStreamingChat] Setting loading state and starting stream");
            setIsLoading(true);
            startStream();

            try {
                console.log("🌐 [useStreamingChat] Making request to /api/chat/stream");
                const response = await fetch('/api/chat/stream', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message, appName, machineId }),
                });
                console.log("🔄 [useStreamingChat] Stream response received:", response);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                console.log("✅ [useStreamingChat] Stream response received, starting to read");
                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('No response body');
                }

                const decoder = new TextDecoder();
                let buffer = '';
                let chunkCount = 0;

                console.log("📖 [useStreamingChat] Starting to read stream chunks");
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        console.log("🏁 [useStreamingChat] Stream reading completed");
                        break;
                    }

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                chunkCount++;

                                if (data.type === 'analysis') {
                                    // Use debounced update for smoother streaming
                                    debouncedUpdateStream(data.content || '');
                                } else if (data.type === 'progress') {
                                    console.log(`🚀 [useStreamingChat] Deployment progress:`, data.status, data.files);
                                    if (data.status === 'deploying') {
                                        debouncedUpdateStream(`\n\n**🚀 Deploying your website...**\n\n`);
                                    } else if (data.status === 'deployed') {
                                        debouncedUpdateStream(`\n\n**✅ Deployment completed successfully!**\n\n`);
                                    }
                                } else if (data.type === 'error') {
                                    console.error('❌ [useStreamingChat] Streaming error:', data.error);
                                    debouncedUpdateStream(`\n\n**Error:** ${data.error}\n\n`);
                                } else if (data.type === 'warning') {
                                    console.warn('⚠️ [useStreamingChat] Streaming warning:', data.message);
                                    debouncedUpdateStream(`\n\n**Warning:** ${data.message}\n\n`);
                                } else {
                                    console.log(`🔍 [useStreamingChat] Unknown data type:`, data.type, data);
                                }
                            } catch (parseError) {
                                console.error('❌ [useStreamingChat] Failed to parse streaming data:', parseError, 'Line:', line);
                            }
                        }
                    }
                }

                console.log(`✅ [useStreamingChat] Stream processing completed. Total chunks: ${chunkCount}`);
            } catch (error) {
                console.error('❌ [useStreamingChat] Streaming chat error:', error);
                debouncedUpdateStream(`\n\n**Error:** ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
                console.log("🏁 [useStreamingChat] Finishing stream and clearing loading state");
                setIsLoading(false);
                finishStream();
            }
        },
        [startStream, updateStream, finishStream]
    );

    return {
        sendMessage,
        isLoading,
    };
}; 