"use client";

import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthModal } from "@/components/auth/auth-modal";
import { ModelSelector } from "@/components/site/model-selector";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useCreateSite } from "@/lib/hooks/use-create-site";
import { useGenerationAccess } from "@/lib/hooks/use-generation-access";
import { triggerGeneration } from "@/lib/generate/trigger-generation";
import {
  DEFAULT_AGENT_MODEL_ID,
  type AgentModelId,
} from "@/lib/ai/models";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Landing page for a solar-panel installer",
  "Minimal portfolio for a product designer",
  "Launch site with a blog for an indie coffee roaster",
  "Waitlist page for a developer tool",
];

const ROLLING = [
  "a solar-panel installer landing page",
  "a minimal portfolio for a product designer",
  "a coffee roaster launch site with a blog",
  "a waitlist page for a developer tool",
  "a boutique hotel booking site",
  "a SaaS docs homepage",
];

const TEXTAREA_MIN_PX = 72;
const TEXTAREA_MAX_PX = 280;

export function LandingComposer() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const createSite = useCreateSite();
  const { assertCanGenerate, refetch } = useGenerationAccess();
  const reduce = useReducedMotion();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [modelId, setModelId] = useState<AgentModelId>(DEFAULT_AGENT_MODEL_ID);
  const [rollIndex, setRollIndex] = useState(0);
  const [modKey, setModKey] = useState("Ctrl");

  useEffect(() => {
    const mac =
      /Mac|iPhone|iPad/.test(navigator.platform) ||
      navigator.userAgent.includes("Mac");
    setModKey(mac ? "⌘" : "Ctrl");
  }, []);

  useEffect(() => {
    if (text || reduce) return;
    const id = window.setInterval(() => {
      setRollIndex((i) => (i + 1) % ROLLING.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [text, reduce]);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(
      TEXTAREA_MAX_PX,
      Math.max(TEXTAREA_MIN_PX, el.scrollHeight)
    );
    el.style.height = `${next}px`;
  }, [text]);

  const startGeneration = async (value: string, selectedModel: AgentModelId) => {
    if (!assertCanGenerate()) {
      toast.error("AI credits too low. Upgrade or top up to continue.");
      return;
    }
    setPending(true);
    try {
      const id = await createSite({ prompt: value, modelId: selectedModel });
      await triggerGeneration(id);
      await refetch();
      router.push(`/build/${id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start generation");
      setPending(false);
    }
  };

  const handle = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || pending) return;

    if (!isAuthenticated) {
      setPendingPrompt(trimmed);
      setAuthOpen(true);
      return;
    }
    setText("");
    await startGeneration(trimmed, modelId);
  };

  const showRoll = !text && !pending;

  return (
    <>
      <div className="w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handle(text);
          }}
          className="border border-border bg-card"
        >
          <label htmlFor="landing-prompt" className="sr-only">
            Describe the site to build
          </label>
          <div className="relative">
            <textarea
              ref={textareaRef}
              id="landing-prompt"
              name="message"
              autoFocus
              value={text}
              disabled={pending}
              rows={2}
              placeholder=""
              aria-label="Describe the site to build"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  void handle(text);
                }
              }}
              className="min-h-[72px] max-h-[280px] w-full resize-none overflow-y-auto bg-transparent px-5 pt-4 pb-3 text-sm leading-relaxed text-foreground focus:outline-none disabled:opacity-50"
            />
            {showRoll ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-5 top-4 text-sm leading-relaxed text-muted-foreground/45"
              >
                <span>A site for </span>
                <span className="relative inline-grid overflow-hidden align-baseline">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={ROLLING[rollIndex]}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="col-start-1 row-start-1"
                    >
                      {ROLLING[rollIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
            <ModelSelector
              value={modelId}
              onChange={setModelId}
              disabled={pending}
            />
            <div className="flex items-center gap-3">
              <span
                className="hidden items-center gap-2 sm:inline-flex"
                aria-hidden
              >
                <Kbd className="h-6 border-foreground/20 bg-card px-2 text-[11px] text-foreground">
                  Enter
                </Kbd>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/70">
                  new line
                </span>
              </span>
              <button
                type="submit"
                disabled={pending || !text.trim()}
                aria-label={pending ? "Building" : "Build site"}
                className={cn(
                  "inline-flex size-9 cursor-pointer items-center justify-center gap-2 transition-[filter] active:scale-[0.98] sm:h-9 sm:w-auto sm:px-3",
                  "bg-brand text-brand-foreground hover:brightness-110",
                  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100",
                )}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <>
                    <ArrowUp className="size-4 shrink-0" aria-hidden />
                    <KbdGroup className="hidden gap-1 sm:inline-flex">
                      <Kbd className="h-6 min-w-6 border-brand-foreground/30 bg-brand-foreground/15 px-1.5 text-[11px] text-brand-foreground normal-case">
                        {modKey}
                      </Kbd>
                      <Kbd className="h-6 border-brand-foreground/30 bg-brand-foreground/15 px-1.5 text-[11px] text-brand-foreground">
                        Enter
                      </Kbd>
                    </KbdGroup>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <ul className="mt-10 border-t border-border">
          {SUGGESTIONS.map((suggestion) => (
            <li key={suggestion} className="border-b border-border">
              <button
                type="button"
                disabled={pending}
                onClick={() => void handle(suggestion)}
                className="group flex w-full cursor-pointer items-baseline py-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                  {suggestion}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <AuthModal
        open={authOpen}
        onOpenChange={(open) => {
          setAuthOpen(open);
          if (!open) setPendingPrompt(null);
        }}
        prompt={pendingPrompt}
        modelId={modelId}
      />
    </>
  );
}
