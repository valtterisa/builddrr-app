"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Globe,
  Info,
  PencilLine,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";

export interface Step {
  kind: string;
  label: string;
  detail?: string;
}

const ICONS: Record<string, typeof Sparkles> = {
  plan: Sparkles,
  write: PencilLine,
  read: FileText,
  command: TerminalSquare,
  preview: Globe,
  note: Info,
};

function formatThoughtDuration(ms: number): string {
  const seconds = Math.max(1, Math.round(ms / 1000));
  return seconds === 1
    ? "Thought for 1 second"
    : `Thought for ${seconds} seconds`;
}

export function AgentSteps({
  steps = [],
  reasoning,
  thoughtDurationMs,
  active,
}: {
  steps?: Step[];
  reasoning?: string;
  thoughtDurationMs?: number;
  active?: boolean;
}) {
  const trimmedReasoning = reasoning?.trim() ?? "";
  const hasReasoning = trimmedReasoning.length > 0;
  const hasSteps = steps.length > 0;
  const hasBody = hasReasoning || hasSteps;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (active) {
      if (hasBody) setOpen(true);
    } else {
      setOpen(false);
    }
  }, [active, hasBody]);

  if (
    !active &&
    !hasReasoning &&
    !hasSteps &&
    typeof thoughtDurationMs !== "number"
  ) {
    return null;
  }

  const last = steps[steps.length - 1];
  const lastIndex = steps.length - 1;

  const header = active
    ? hasSteps
      ? (last?.label ?? "Thinking")
      : "Thinking"
    : typeof thoughtDurationMs === "number"
      ? formatThoughtDuration(thoughtDurationMs)
      : hasSteps
        ? `${steps.length} step${steps.length === 1 ? "" : "s"}`
        : "Thinking";

  return (
    <ChainOfThought
      open={open}
      onOpenChange={setOpen}
      className="mb-3"
    >
      <ChainOfThoughtHeader
        className={active && !hasBody ? "animate-pulse" : undefined}
      >
        {header}
      </ChainOfThoughtHeader>
      {hasBody ? (
        <ChainOfThoughtContent>
          {hasReasoning ? (
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {trimmedReasoning}
            </p>
          ) : null}
          {steps.map((step, i) => {
            const Icon = ICONS[step.kind] ?? Info;
            const status = active && i === lastIndex ? "active" : "complete";
            return (
              <ChainOfThoughtStep
                key={`${step.kind}-${i}-${step.label}`}
                icon={Icon}
                label={step.label}
                description={step.detail}
                status={status}
              />
            );
          })}
        </ChainOfThoughtContent>
      ) : null}
    </ChainOfThought>
  );
}
