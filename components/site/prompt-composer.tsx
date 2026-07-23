"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { ModelSelector } from "@/components/site/model-selector";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DEFAULT_AGENT_MODEL_ID,
  type AgentModelId,
} from "@/lib/ai/models";
import { cn } from "@/lib/utils";

export type ComposerMode = "ask" | "build";

export interface PromptComposerProps {
  onSubmit: (
    text: string,
    modelId: AgentModelId,
    mode: ComposerMode
  ) => void | boolean | Promise<void | boolean>;
  suggestions?: string[];
  placeholder?: string;
  pending?: boolean;
  autoFocus?: boolean;
  className?: string;
  defaultModelId?: AgentModelId;
  mode?: ComposerMode;
  defaultMode?: ComposerMode;
  onModeChange?: (mode: ComposerMode) => void;
  submitLabel?: string;
  pendingLabel?: string;
  showModeToggle?: boolean;
}

export function PromptComposer({
  onSubmit,
  suggestions = [],
  placeholder,
  pending = false,
  autoFocus = false,
  className,
  defaultModelId = DEFAULT_AGENT_MODEL_ID,
  mode: controlledMode,
  defaultMode = "build",
  onModeChange,
  submitLabel,
  pendingLabel,
  showModeToggle = true,
}: PromptComposerProps) {
  const [text, setText] = useState("");
  const [modelId, setModelId] = useState<AgentModelId>(defaultModelId);
  const [uncontrolledMode, setUncontrolledMode] =
    useState<ComposerMode>(defaultMode);
  const [modKey, setModKey] = useState("Ctrl");
  const mode = controlledMode ?? uncontrolledMode;

  useEffect(() => {
    const mac =
      /Mac|iPhone|iPad/.test(navigator.platform) ||
      navigator.userAgent.includes("Mac");
    setModKey(mac ? "⌘" : "Ctrl");
  }, []);

  const setMode = (next: ComposerMode) => {
    if (controlledMode === undefined) setUncontrolledMode(next);
    onModeChange?.(next);
  };

  const resolvedPlaceholder =
    placeholder ??
    (mode === "ask"
      ? "Ask about structure, tone, pages…"
      : "Ask for changes: copy, sections, colors, a blog…");
  const resolvedSubmitLabel =
    submitLabel ?? (mode === "ask" ? "Ask" : "Build");
  const resolvedPendingLabel =
    pendingLabel ?? (mode === "ask" ? "Asking…" : "Building…");

  const submit = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || pending) return;
    setText("");
    try {
      const result = await onSubmit(trimmed, modelId, mode);
      if (result === false) setText(trimmed);
    } catch {
      setText(trimmed);
    }
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
          {mode === "ask" ? "Ask Floras" : "Describe the site to build"}
        </label>
        <textarea
          id="prompt-composer"
          name="message"
          autoFocus={autoFocus}
          value={text}
          disabled={pending}
          rows={3}
          placeholder={resolvedPlaceholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void submit(text);
            }
          }}
          className="min-h-[88px] w-full resize-none bg-transparent px-5 pt-4 pb-3 text-sm leading-relaxed text-foreground placeholder:text-sm placeholder:text-muted-foreground/45 focus:outline-none disabled:opacity-50"
        />
        <div className="flex flex-nowrap items-center gap-2 border-t border-border px-3 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {showModeToggle ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={pending}
                  aria-label="Composer mode"
                  className={cn(
                    "inline-flex h-9 w-[4.75rem] shrink-0 cursor-pointer items-center justify-between gap-1.5 border border-border bg-background px-2.5 text-left text-muted-foreground transition-colors",
                    "hover:bg-card hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
                    "focus:outline-none data-[state=open]:bg-card data-[state=open]:text-foreground"
                  )}
                >
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-foreground">
                    {mode === "ask" ? "Ask" : "Build"}
                  </span>
                  <ChevronDown className="size-3.5 shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={6}
                  className="w-64 rounded-none border-border p-0 shadow-none"
                >
                  <DropdownMenuItem
                    onSelect={() => setMode("build")}
                    className={cn(
                      "cursor-pointer gap-3 rounded-none px-3 py-2.5 focus:bg-card",
                      "border-b border-border",
                      mode === "build" && "bg-card"
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        Build
                      </span>
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Generate or edit the site
                      </span>
                    </span>
                    {mode === "build" ? (
                      <Check className="size-4 shrink-0 text-brand" />
                    ) : (
                      <span className="size-4 shrink-0" aria-hidden />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setMode("ask")}
                    className={cn(
                      "cursor-pointer gap-3 rounded-none px-3 py-2.5 focus:bg-card",
                      mode === "ask" && "bg-card"
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        Ask
                      </span>
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Plan without building
                      </span>
                    </span>
                    {mode === "ask" ? (
                      <Check className="size-4 shrink-0 text-brand" />
                    ) : (
                      <span className="size-4 shrink-0" aria-hidden />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            <ModelSelector
              value={modelId}
              onChange={setModelId}
              disabled={pending}
              className="min-w-0 max-w-[7.5rem] shrink"
            />
          </div>
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className={cn(
              "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 px-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-[filter] active:scale-[0.98]",
              "bg-brand text-brand-foreground hover:brightness-110",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
            )}
          >
            {pending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                <span className="whitespace-nowrap">{resolvedPendingLabel}</span>
              </>
            ) : (
              <>
                <span className="whitespace-nowrap">{resolvedSubmitLabel}</span>
                <KbdGroup className="inline-flex gap-0.5">
                  <Kbd className="h-5 min-w-5 border-brand-foreground/30 bg-brand-foreground/15 px-1 text-[10px] text-brand-foreground normal-case">
                    {modKey}
                  </Kbd>
                  <Kbd className="h-5 border-brand-foreground/30 bg-brand-foreground/15 px-1 text-[10px] text-brand-foreground">
                    Enter
                  </Kbd>
                </KbdGroup>
              </>
            )}
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
