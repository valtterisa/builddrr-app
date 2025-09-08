import { useCallback } from "react";
import { useChatStreamStore } from "@/lib/chat-stream-store";

export const useStreamingChat = () => {
  const { startStream, updateStream, finishStream, failStream, setStatus } =
    useChatStreamStore();

  const sendMessage = useCallback(
    async (message: string, appName: string, repoExists: boolean = false) => {
      if (!message.trim()) {
        return;
      }

      setStatus("submitted");

      try {
        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, appName, repoExists }),
        });

        if (!response.ok) {
          setStatus("error");
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          setStatus("error");
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "status") {
                if (data.value === "streaming") startStream();
                else if (data.value === "ready") finishStream();
                else if (data.value === "error") failStream();
                else if (data.value === "submitted") setStatus("submitted");
              } else if (data.type === "analysis") {
                updateStream(data.content || "");
              } else if (data.type === "progress") {
                if (data.status === "deploying") {
                  updateStream(`\n\n**🚀 Deploying your website...**\n\n`);
                } else if (data.status === "deployed") {
                  updateStream(
                    `\n\n**✅ Deployment completed successfully!**\n\n`
                  );
                }
              } else if (data.type === "error") {
                updateStream(`\n\n**Error streaming chat**`);
                failStream();
              }
            } catch {}
          }
        }

        // Ensure we end in ready if server closed cleanly without status frame
        finishStream();
      } catch (error) {
        updateStream(`\n\n**Error streaming chat**`);
        failStream();
      }
    },
    [startStream, updateStream, finishStream, failStream, setStatus]
  );

  return { sendMessage };
};
