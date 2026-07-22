"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { cn } from "@/lib/utils";

export interface PromptComposerProps {
  onSubmit: (text: string) => void | boolean | Promise<void | boolean>;
  suggestions?: string[];
  placeholder?: string;
  pending?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function PromptComposer({
  onSubmit,
  suggestions = [],
  placeholder = "Describe the site you want to build…",
  pending = false,
  autoFocus = false,
  className,
}: PromptComposerProps) {
  const [text, setText] = useState("");

  const submit = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || pending) return;
    const result = await onSubmit(trimmed);
    if (result !== false) setText("");
  };

  return (
    <div className={cn("w-full", className)}>
      <PromptInput
        className="rounded-3xl border-border/70 bg-card/90 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        onSubmit={(message: PromptInputMessage) => submit(message.text ?? "")}
      >
        <PromptInputBody>
          <PromptInputTextarea
            autoFocus={autoFocus}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="min-h-[88px] px-5 pt-4 text-base"
          />
        </PromptInputBody>
        <PromptInputFooter className="px-3 pb-3">
          <PromptInputSubmit
            status={pending ? "submitted" : undefined}
            disabled={pending}
            className="size-9 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <ArrowUp className="size-4" />
          </PromptInputSubmit>
        </PromptInputFooter>
      </PromptInput>

      {suggestions.length > 0 && (
        <Suggestions className="mt-4 justify-start">
          {suggestions.map((s) => (
            <Suggestion
              key={s}
              suggestion={s}
              onClick={() => submit(s)}
              className="rounded-full border-border/70 bg-card/50 text-muted-foreground transition-colors hover:border-border hover:text-foreground active:scale-[0.98]"
            />
          ))}
        </Suggestions>
      )}
    </div>
  );
}
