"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  FolderSearch,
  Globe,
  Info,
  Link2,
  PencilLine,
  TerminalSquare,
} from "lucide-react";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import { Shimmer } from "@/components/ai-elements/shimmer";

export interface Step {
  kind: string;
  label: string;
  detail?: string;
}

const ICONS: Record<string, typeof Info> = {
  plan: Info,
  write: PencilLine,
  read: FileText,
  command: TerminalSquare,
  preview: Globe,
  domain: Link2,
  note: Info,
  inspect: FolderSearch,
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

  const headerText = active
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
      <ChainOfThoughtHeader active={Boolean(active)} showChevron={hasBody}>
        {active ? (
          <Shimmer duration={1.2} className="text-sm">
            {headerText}
          </Shimmer>
        ) : (
          headerText
        )}
      </ChainOfThoughtHeader>
      {hasBody ? (
        <ChainOfThoughtContent>
          {hasReasoning ? (
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {trimmedReasoning}
              {active && !hasSteps ? (
                <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-muted-foreground/70 align-middle" />
              ) : null}
            </p>
          ) : null}
          {steps.map((step, i) => {
            const Icon = ICONS[step.kind] ?? Info;
            const status = active && i === lastIndex ? "active" : "complete";
            const label =
              status === "active" ? (
                <Shimmer duration={1.2} className="text-sm">
                  {step.label}
                </Shimmer>
              ) : (
                step.label
              );
            return (
              <ChainOfThoughtStep
                key={`${step.kind}-${i}-${step.label}`}
                icon={Icon}
                label={label}
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
