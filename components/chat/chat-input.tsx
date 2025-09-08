import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Button } from "../ui/button";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface InputProps {
  onSubmit: () => void;
  value?: string;
  disabled?: boolean;
  setInputValue: (value: string) => void;
  hasExceededLimits: boolean;
  status?: "ready" | "submitted" | "streaming" | "error";
}

export default function ChatInput({
  onSubmit,
  value,
  disabled,
  setInputValue,
  hasExceededLimits,
  status,
}: InputProps) {
  const router = useRouter();
  return (
    <div className="py-4 md:pl-4 md:pr-2">
      {hasExceededLimits ? (
        <div className="flex items-center justify-between w-full rounded-xl bg-muted px-4 py-3 text-sm border border-neutral-200">
          <div className="flex items-center gap-2 text-neutral-700">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            Chat limit exceeded
          </div>
          <Button
            size="sm"
            className="text-xs"
            onClick={() => router.push("/dashboard/account/billing")}
            type="button"
          >
            Upgrade Plan
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      ) : (
        <PromptInput
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="relative"
        >
          <PromptInputTextarea
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            value={value}
          />
          <PromptInputSubmit
            className="absolute right-1 bottom-1"
            disabled={disabled}
            status={status}
          />
        </PromptInput>
      )}
    </div>
  );
}
