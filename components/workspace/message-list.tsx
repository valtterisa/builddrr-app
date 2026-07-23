"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { cn } from "@/lib/utils";
import { AgentSteps, type Step } from "@/components/workspace/agent-steps";

export interface ChatMessage {
  _id: string;
  role: "user" | "assistant" | "system";
  content: string;
  status: "streaming" | "complete" | "error";
  reasoning?: string;
  steps?: Step[];
  thoughtDurationMs?: number;
}

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <Conversation className="flex-1">
      <ConversationContent className="mx-auto w-full max-w-2xl gap-5 px-4 py-6">
        {messages.map((message) => {
          const isUser = message.role === "user";
          const streaming = message.status === "streaming";
          const showSteps =
            !isUser &&
            (streaming ||
              Boolean(message.reasoning?.trim()) ||
              Boolean(message.steps?.length) ||
              typeof message.thoughtDurationMs === "number");

          return (
            <Message from={isUser ? "user" : "assistant"} key={message._id}>
              <div className="w-full">
                {showSteps ? (
                  <AgentSteps
                    steps={message.steps}
                    reasoning={message.reasoning}
                    thoughtDurationMs={message.thoughtDurationMs}
                    active={streaming}
                  />
                ) : null}
                {(isUser || message.content) && (
                  <MessageContent
                    className={cn(
                      isUser
                        ? "rounded-2xl bg-secondary px-4 py-2.5 text-foreground"
                        : "bg-transparent p-0 text-foreground"
                    )}
                  >
                    {isUser ? (
                      message.content
                    ) : (
                      <MessageResponse isAnimating={streaming}>
                        {message.content}
                      </MessageResponse>
                    )}
                  </MessageContent>
                )}
              </div>
            </Message>
          );
        })}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
