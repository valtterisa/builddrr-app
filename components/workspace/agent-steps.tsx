"use client";

import {
  Brain,
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
  thinking: Brain,
};

export function AgentSteps({
  steps = [],
  reasoning,
  active,
}: {
  steps?: Step[];
  reasoning?: string;
  active?: boolean;
}) {
  const hasReasoning = Boolean(reasoning?.trim());
  if (!steps.length && !hasReasoning) return null;

  const last = steps[steps.length - 1];
  const lastIndex = steps.length - 1;
  const header = active
    ? last?.label ?? "Thinking"
    : hasReasoning && !steps.length
      ? "Chain of thought"
      : `${steps.length} build step${steps.length === 1 ? "" : "s"}`;

  return (
    <ChainOfThought defaultOpen={Boolean(active)} className="mb-3">
      <ChainOfThoughtHeader>{header}</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        {hasReasoning ? (
          <ChainOfThoughtStep
            icon={Brain}
            label="Thinking"
            description={reasoning}
            status={active && steps.length === 0 ? "active" : "complete"}
          />
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
    </ChainOfThought>
  );
}
