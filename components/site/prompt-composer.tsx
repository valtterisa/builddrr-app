"use client";

import { useState } from "react";
import { ModelSelector } from "@/components/site/model-selector";
import {
  DEFAULT_AGENT_MODEL_ID,
  type AgentModelId,
} from "@/lib/ai/models";
import { cn } from "@/lib/utils";

export interface PromptComposerProps {
  onSubmit: (
    text: string,
    modelId: AgentModelId
  ) => void | boolean | Promise<void | boolean>;
  suggestions?: string[];
  placeholder?: string;
  pending?: boolean;
  autoFocus?: boolean;
  className?: string;
  defaultModelId?: AgentModelId;
  submitLabel?: string;
  pendingLabel?: string;
}

export function PromptComposer({
  onSubmit,
  suggestions = [],
  placeholder = "A site for…",
  pending = false,
  autoFocus = false,
  className,
  defaultModelId = DEFAULT_AGENT_MODEL_ID,
  submitLabel = "Build site",
  pendingLabel = "Building…",
}: PromptComposerProps) {
  const [text, setText] = useState("");
  const [modelId, setModelId] = useState<AgentModelId>(defaultModelId);

  const submit = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || pending) return;
    const result = await onSubmit(trimmed, modelId);
    if (result !== false) setText("");
  };

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(text);
        }}
        className="border border-border bg-card"
      >
        <label htmlFor="prompt-composer" className="sr-only">
          Describe the site to build
        </label>
        <textarea
          id="prompt-composer"
          name="message"
          autoFocus={autoFocus}
          value={text}
          disabled={pending}
          rows={5}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void submit(text);
            }
          }}
          className="min-h-[148px] w-full resize-none bg-transparent px-5 pt-5 pb-4 text-sm leading-relaxed text-foreground placeholder:text-sm placeholder:text-muted-foreground/45 focus:outline-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
          <ModelSelector
            value={modelId}
            onChange={setModelId}
            disabled={pending}
          />
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className={cn(
              "h-9 min-w-[7.5rem] cursor-pointer px-4 font-mono text-[11px] uppercase tracking-[0.14em] transition-[filter] active:scale-[0.98]",
              "bg-brand text-brand-foreground hover:brightness-110",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
            )}
          >
            {pending ? pendingLabel : submitLabel}
          </button>
        </div>
      </form>

      {suggestions.length > 0 ? (
        <ul className="mt-8 border-t border-border">
          {suggestions.map((s) => (
            <li key={s} className="border-b border-border">
              <button
                type="button"
                disabled={pending}
                onClick={() => void submit(s)}
                className="group flex w-full cursor-pointer py-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                  {s}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
