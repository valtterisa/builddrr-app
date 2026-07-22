"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ModelSelector } from "@/components/site/model-selector";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { UpgradeProModal } from "@/components/billing/upgrade-pro-modal";
import { TopUpModal } from "@/components/billing/top-up-modal";
import { useCreateSite } from "@/lib/hooks/use-create-site";
import { useGenerationAccess } from "@/lib/hooks/use-generation-access";
import { triggerGeneration } from "@/lib/generate/trigger-generation";
import {
  DEFAULT_AGENT_MODEL_ID,
  type AgentModelId,
} from "@/lib/ai/models";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Website for a solar-panel installer",
  "Simple portfolio for a photographer",
  "Launch site with a blog for a coffee roaster",
  "Booking page for a yoga studio",
  "Boutique hotel site with rooms and rates",
  "Homepage for a local bakery",
];

const ROLLING = [
  "a solar-panel installer website",
  "a simple portfolio for a photographer",
  "a coffee roaster launch site with a blog",
  "a booking page for a yoga studio",
  "a boutique hotel site",
  "a homepage for a local bakery",
];

const TEXTAREA_MIN_PX = 88;
const TEXTAREA_MAX_PX = 240;

export function DashboardPrompt({
  resetKey = 0,
}: {
  resetKey?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createSite = useCreateSite();
  const { getDenyReason, billingReady, hasPaidPlan, refetch } =
    useGenerationAccess();
  const reduce = useReducedMotion();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fromAuthPrompt = useRef(false);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [modelId, setModelId] = useState<AgentModelId>(DEFAULT_AGENT_MODEL_ID);
  const [rollIndex, setRollIndex] = useState(0);
  const [modKey, setModKey] = useState("Ctrl");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);

  useEffect(() => {
    setText("");
    textareaRef.current?.focus();
  }, [resetKey]);

  useEffect(() => {
    const fromAuth = searchParams.get("prompt");
    if (!fromAuth) return;
    fromAuthPrompt.current = true;
    setText(fromAuth);
    router.replace("/dashboard", { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    if (!fromAuthPrompt.current || !billingReady) return;
    fromAuthPrompt.current = false;
    if (!hasPaidPlan) setUpgradeOpen(true);
  }, [billingReady, hasPaidPlan]);

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

  const handle = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || pending) return;

    const reason = getDenyReason();
    if (reason === "no_plan") {
      setUpgradeOpen(true);
      return;
    }
    if (reason === "no_credits") {
      setTopUpOpen(true);
      return;
    }

    setPending(true);
    try {
      const id = await createSite({ prompt: trimmed, modelId });
      await triggerGeneration(id);
      await refetch();
      router.push(`/build/${id}`);
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === "NO_PLAN") {
        setUpgradeOpen(true);
      } else if (err.code === "NO_CREDITS") {
        setTopUpOpen(true);
      } else {
        toast.error(err.message || "Could not start generation");
      }
      setPending(false);
    }
  };

  const showRoll = !text && !pending;

  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 md:px-10">
      <div className="w-full max-w-2xl">
        <h1 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
          What do you want to create?
        </h1>
        <p className="mx-auto mt-3 max-w-[42ch] text-center text-sm leading-relaxed text-muted-foreground">
          Describe a site and Floras builds a live preview you can refine.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handle(text);
          }}
          className="mt-10 border border-border bg-card"
        >
          <label htmlFor="dashboard-prompt" className="sr-only">
            Describe the site to build
          </label>
          <div className="relative">
            <textarea
              ref={textareaRef}
              id="dashboard-prompt"
              name="message"
              autoFocus
              value={text}
              disabled={pending}
              rows={3}
              placeholder=""
              aria-label="Describe the site to build"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  void handle(text);
                }
              }}
              className="min-h-[88px] max-h-[240px] w-full resize-none overflow-y-auto bg-transparent px-5 pt-4 pb-3 text-sm leading-relaxed text-foreground focus:outline-none disabled:opacity-50"
            />
            {showRoll ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-5 top-4 text-sm leading-relaxed text-muted-foreground/45"
              >
                <span>Ask Floras to build </span>
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
            <button
              type="submit"
              disabled={pending || !text.trim()}
              aria-label={pending ? "Building" : "Build site"}
              className={cn(
                "inline-flex size-9 cursor-pointer items-center justify-center gap-2 transition-[filter] active:scale-[0.98] sm:h-9 sm:w-auto sm:px-3",
                "bg-brand text-brand-foreground hover:brightness-110",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
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
        </form>

        <ul className="mt-8 border-t border-border">
          {SUGGESTIONS.map((suggestion) => (
            <li key={suggestion} className="border-b border-border">
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setText(suggestion);
                  void handle(suggestion);
                }}
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

      <UpgradeProModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        onPurchased={() => void refetch()}
      />
      <TopUpModal
        open={topUpOpen}
        onOpenChange={setTopUpOpen}
        onPurchased={() => void refetch()}
      />
    </section>
  );
}
