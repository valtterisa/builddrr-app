"use client";

import { Check, ChevronDown } from "lucide-react";
import { ClaudeLogo } from "@/components/icons/anthropic-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AGENT_MODELS,
  getAgentModel,
  type AgentModelId,
} from "@/lib/ai/models";
import { cn } from "@/lib/utils";

function ModelLogo({
  provider,
  className,
}: {
  provider: (typeof AGENT_MODELS)[number]["provider"];
  className?: string;
}) {
  if (provider === "anthropic") {
    return <ClaudeLogo className={className} />;
  }
  return null;
}

export function ModelSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: AgentModelId;
  onChange: (modelId: AgentModelId) => void;
  disabled?: boolean;
}) {
  const selected = getAgentModel(value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        aria-label="Model"
        className={cn(
          "inline-flex h-9 max-w-full cursor-pointer items-center gap-2 border border-border bg-background px-2.5 text-left transition-colors",
          "hover:bg-card disabled:cursor-not-allowed disabled:opacity-40",
          "focus:outline-none data-[state=open]:bg-card"
        )}
      >
        <ModelLogo provider={selected.provider} className="size-3.5" />
        <span className="truncate text-xs font-medium text-foreground">
          {selected.name}
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-72 rounded-none border-border p-0 shadow-none"
      >
        {AGENT_MODELS.map((model, i) => {
          const active = value === model.id;
          return (
            <DropdownMenuItem
              key={model.id}
              onSelect={() => onChange(model.id)}
              className={cn(
                "cursor-pointer gap-3 rounded-none px-3 py-2.5 focus:bg-card",
                i < AGENT_MODELS.length - 1 && "border-b border-border",
                active && "bg-card"
              )}
            >
              <span className="flex size-8 shrink-0 items-center justify-center border border-border bg-background">
                <ModelLogo provider={model.provider} className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {model.name}
                </span>
                <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {model.hint}
                </span>
              </span>
              {active ? (
                <Check className="size-4 shrink-0 text-brand" />
              ) : (
                <span className="size-4 shrink-0" aria-hidden />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
