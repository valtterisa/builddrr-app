"use client";

import { MessageCircleIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Input } from "@/components/ui/input";
import { Message } from "@/components/chat/message";
import { Panel, PanelHeader } from "@/components/panels/panels";
import { Settings } from "@/components/settings/settings";
import { useChat } from "@ai-sdk/react";
import { useLocalStorageValue } from "../../lib/use-local-storage-value";
import { useCallback, useEffect } from "react";
import { useSharedChatContext } from "../../lib/chat-context";
import { useSettings } from "@/components/settings/use-settings";
import { useSandboxStore } from "../../app/state";

interface Props {
  className: string;
  modelId?: string;
}

export function Chat({ className }: Props) {
  const [input, setInput] = useLocalStorageValue("prompt-input");
  const { chat } = useSharedChatContext();
  const { modelId, reasoningEffort } = useSettings();
  const { messages, sendMessage, status } = useChat({ chat });
  const { setChatStatus } = useSandboxStore();

  const validateAndSubmitMessage = useCallback(
    (text: string) => {
      if (text.trim()) {
        sendMessage({ text }, { body: { modelId, reasoningEffort } });
        setInput("");
      }
    },
    [sendMessage, modelId, setInput, reasoningEffort]
  );

  useEffect(() => {
    setChatStatus(status);
  }, [status, setChatStatus]);

  return (
    <Panel className={className}>
      <PanelHeader>
        <div className="flex items-center font-mono font-semibold uppercase">
          <MessageCircleIcon className="mr-2 w-4" />
          Chat
        </div>
        <div className="ml-auto font-mono text-xs opacity-50">[{status}]</div>
      </PanelHeader>

      {/* Messages Area */}
      <Conversation className="relative w-full">
        <ConversationContent className="space-y-4">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <form
        className="flex items-center p-2 space-x-1 border-t border-primary/18 bg-background"
        onSubmit={async (event) => {
          event.preventDefault();
          validateAndSubmitMessage(input);
        }}
      >
        <Settings />
        <Input
          className="w-full font-mono text-sm rounded-sm border-0 bg-background"
          disabled={status === "streaming" || status === "submitted"}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          value={input}
        />
        <Button type="submit" disabled={status !== "ready" || !input.trim()}>
          <SendIcon className="w-4 h-4" />
        </Button>
      </form>
    </Panel>
  );
}
