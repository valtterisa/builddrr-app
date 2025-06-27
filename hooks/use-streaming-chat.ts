import { useState, useCallback } from 'react';
import { useChatStreamStore } from '@/lib/chat-stream-store';

export const useStreamingChat = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { startStream, updateStream, finishStream } = useChatStreamStore();

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
                                    console.log(`📝 [useStreamingChat] Processing analysis chunk #${chunkCount}:`, data.content?.substring(0, 30) + "...");
                                    updateStream(data.content || '');
                                } else if (data.type === 'progress') {
                                    console.log(`🚀 [useStreamingChat] Deployment progress:`, data.status, data.files);
                                    if (data.status === 'deploying') {
                                        updateStream(`\n\n**🚀 Deploying files:** ${data.files?.join(', ') || 'Unknown files'}`);
                                    } else if (data.status === 'deployed') {
                                        updateStream(`\n\n**✅ Deployment completed successfully!** Files deployed: ${data.files?.join(', ') || 'Unknown files'}`);
                                    }
                                } else if (data.type === 'error') {
                                    console.error('❌ [useStreamingChat] Streaming error:', data.error);
                                    updateStream(`\n\n**Error:** ${data.error}`);
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
                updateStream(`\n\n**Error:** ${error instanceof Error ? error.message : 'Unknown error'}`);
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