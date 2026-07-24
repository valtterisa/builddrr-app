import { ToolLoopAgent, isStepCount, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { sitePlanSchema, type SitePlan } from "@/lib/schema/site";
import * as box from "@/lib/box/client";
import { DESIGN_SKILL } from "@/lib/ai/design-skill";
import { resolveAgentModelId } from "@/lib/ai/models";
import { anthropicThinkingOptions } from "@/lib/ai/anthropic-options";
import { withAutumnModel } from "@/lib/billing/with-autumn-model";
import { AppError } from "@/lib/errors";
import {
  connectCustomDomain,
  disconnectCustomDomain,
  getCustomDomain,
} from "@/lib/publish/run-domain";

export type AgentStepKind =
  | "plan"
  | "write"
  | "read"
  | "command"
  | "preview"
  | "domain"
  | "note"
  | "inspect";

export interface AgentStep {
  kind: AgentStepKind;
  label: string;
  detail?: string;
}

export interface BuildAgentOptions {
  boxId: string;
  projectId: string;
  token: string;
  onStep: (step: AgentStep) => Promise<void> | void;
  onPlan: (plan: SitePlan) => Promise<void> | void;
  onPreview: (url: string) => Promise<void> | void;
  hasPreview: boolean;
  sitePlan?: SitePlan | null;
  previewUrl?: string | null;
  projectName?: string;
  customInstructions?: string;
  modelId?: string;
  customerId?: string;
}

function getModel(modelId?: string, customerId?: string) {
  const model = anthropic(resolveAgentModelId(modelId));
  if (!customerId) return model;
  return withAutumnModel(model, customerId);
}

function siteAlreadyKnown(opts: BuildAgentOptions): boolean {
  return opts.hasPreview || Boolean(opts.sitePlan);
}

async function listSiteFiles(boxId: string): Promise<string[]> {
  const res = await box.runCommand(
    boxId,
    "find . -type f -not -path './node_modules/*' -not -path './.astro/*' -not -path './.git/*' | sort"
  );
  return res.stdout.split("\n").filter(Boolean);
}

function detectGeneratedSite(files: string[]): boolean {
  const pages = files.filter(
    (f) => f.includes("/src/pages/") && f.endsWith(".astro")
  );
  const components = files.filter(
    (f) => f.includes("/src/components/") && f.endsWith(".astro")
  );
  return pages.length > 1 || components.length > 0;
}

function assertSafeSitePath(path: string): string {
  const cleaned = path.replace(/^\/+/, "").trim();
  if (!cleaned || cleaned.includes("\0")) {
    throw new AppError("unknown", "Invalid file path.");
  }
  if (
    cleaned.startsWith("..") ||
    cleaned.includes("/../") ||
    cleaned.includes("\\")
  ) {
    throw new AppError("unknown", "Path must stay inside site/.");
  }
  return cleaned;
}

function assertAllowedCommand(command: string): string {
  const trimmed = command.trim();
  if (!trimmed || trimmed.length > 500) {
    throw new AppError("unknown", "Command rejected.");
  }
  if (/[;&|`$(){}]|<<|>>|>|<|\n|\r|\$\(|\$\{/.test(trimmed)) {
    throw new AppError("unknown", "Command rejected: unsafe shell syntax.");
  }
  if (/\.\.|\/etc\/|floras-cf\.env|CLOUDFLARE_|AUTUMN_|ANTHROPIC_/i.test(trimmed)) {
    throw new AppError("unknown", "Command rejected: forbidden path or secret.");
  }

  const allow =
    /^(pnpm\s+(add|remove|install|exec|run)\b|npm\s+(install|run)\b|ls\b|cat\b|head\b|tail\b|wc\b|find\b|test\b|pwd\b|echo\b|mkdir\b|cp\b|mv\b|rm\s+-f\b|rm\s+--\b|astro\b|tsc\b)/;
  if (!allow.test(trimmed)) {
    throw new AppError(
      "unknown",
      "Command not allowlisted. Use pnpm add/exec, ls, cat, or similar site tools."
    );
  }
  if (/^rm\b/.test(trimmed) && /(-rf|--no-preserve-root|\/)\b/.test(trimmed)) {
    throw new AppError("unknown", "Command rejected: destructive rm.");
  }
  return trimmed;
}

const INSTRUCTIONS = `You are an expert Astro web engineer inside a Linux sandbox. Sites live in site/. Edit in place. Do not recreate package.json or reinstall the framework unless something is broken. Never restart the Astro dev server manually.

FIRST TOOL CALL (mandatory)
Call inspect_site before any other tool. Follow the returned mode exactly:
- mode "edit": the site already exists. Make the user's requested changes with read_file / write_file. Do not ask to build. Do not claim there is no live project.
- mode "new": this is a first build. Call plan_site once, then implement and polish.

NEW SITE (mode "new")
1. Design Read + variance settings from the design skill.
2. plan_site exactly once.
3. Implement with write_file / read_file / list_files.
4. Design polish pass, then a short markdown summary.

EDIT SITE (mode "edit")
1. Read the files you need.
2. Apply targeted write_file changes (complete file contents).
3. Keep scope tight unless the user asks for a redesign.
4. Short markdown summary of what changed.

CUSTOM DOMAINS
Use setup_domain / check_domain / remove_domain when asked. Site must already be published. List real DNS records only.

Never dump large explanations between tool calls. User-facing text must stay short markdown.
Write flowing paragraphs. Do not hard-wrap or insert line breaks mid-sentence. Use a blank line only between paragraphs or list blocks.

${DESIGN_SKILL}`;

function buildInstructions(opts: BuildAgentOptions): string {
  const custom = opts.customInstructions?.trim();
  const customBlock = custom
    ? `

USER CUSTOM INSTRUCTIONS
Honor these preferences in every reply (including how you address the user) when they do not conflict with safety or the design skill above:
${custom}`
    : "";

  return `${INSTRUCTIONS}${customBlock}`;
}

export function buildSiteAgent(opts: BuildAgentOptions) {
  const { boxId, projectId, token, onStep, onPlan, onPreview, hasPreview } =
    opts;
  const knownExisting = siteAlreadyKnown(opts);

  const inspect_site = tool({
    description:
      "Call first on every turn. Inspects site/ on disk and returns whether this is an edit or a new-site session.",
    inputSchema: z.object({}),
    execute: async () => {
      const files = await listSiteFiles(boxId);
      const generatedOnDisk = detectGeneratedSite(files);
      const mode =
        knownExisting || generatedOnDisk ? ("edit" as const) : ("new" as const);

      await onStep({
        kind: "inspect",
        label:
          mode === "edit" ? "Existing site detected" : "New site session",
        detail: `${files.length} files`,
      });

      return {
        mode,
        projectName: opts.projectName?.trim() || null,
        siteName: opts.sitePlan?.siteName ?? null,
        previewUrl: opts.previewUrl ?? null,
        hasStoredPlan: Boolean(opts.sitePlan),
        fileCount: files.length,
        files: files.slice(0, 80),
        next:
          mode === "edit"
            ? "Edit site/ in place for the user request. Do not call plan_site."
            : "Call plan_site once, then build and polish.",
      };
    },
  });

  const sharedTools = {
    inspect_site,
    write_file: tool({
      description: "Create or overwrite one file in the site project.",
      inputSchema: z.object({
        path: z
          .string()
          .describe("Path relative to the site root, e.g. src/components/Hero.astro"),
        content: z.string(),
      }),
      execute: async ({ path, content }) => {
        const safePath = assertSafeSitePath(path);
        await box.writeFiles(boxId, [{ path: safePath, content }]);
        await onStep({ kind: "write", label: `Edited ${safePath}` });
        return { ok: true };
      },
    }),
    read_file: tool({
      description: "Read one file from the site project.",
      inputSchema: z.object({ path: z.string() }),
      execute: async ({ path }) => {
        const safePath = assertSafeSitePath(path);
        const content = await box.readFile(boxId, safePath);
        await onStep({ kind: "read", label: `Read ${safePath}` });
        return { content };
      },
    }),
    list_files: tool({
      description: "List the files in the site project.",
      inputSchema: z.object({}),
      execute: async () => {
        const files = await listSiteFiles(boxId);
        await onStep({ kind: "command", label: "Listed project files" });
        return { files };
      },
    }),
    run_command: tool({
      description:
        "Run an allowlisted shell command in the site project (pnpm add/exec, ls, cat, etc.).",
      inputSchema: z.object({ command: z.string() }),
      execute: async ({ command }) => {
        const safe = assertAllowedCommand(command);
        const res = await box.runCommand(boxId, safe, { timeoutSeconds: 120 });
        await onStep({
          kind: "command",
          label: safe,
          detail: res.stderr || undefined,
        });
        return {
          exitCode: res.exitCode,
          stdout: res.stdout.slice(0, 4000),
          stderr: res.stderr.slice(0, 2000),
        };
      },
    }),
    setup_domain: tool({
      description:
        "Connect a custom domain to the published site and return DNS records the user must add. Requires the site to already be published.",
      inputSchema: z.object({
        domain: z
          .string()
          .describe("Hostname to connect, e.g. www.example.com"),
      }),
      execute: async ({ domain }) => {
        const result = await connectCustomDomain(projectId, domain, token);
        await onStep({
          kind: "domain",
          label: `Connected ${result.domain?.name ?? domain}`,
          detail: result.domain?.status,
        });
        return {
          ok: true,
          publishedUrl: result.publishedUrl,
          domain: result.domain,
        };
      },
    }),
    check_domain: tool({
      description:
        "Refresh custom domain status and DNS records for this published site.",
      inputSchema: z.object({}),
      execute: async () => {
        const result = await getCustomDomain(projectId, token);
        await onStep({
          kind: "domain",
          label: result.domain
            ? `Domain ${result.domain.name}: ${result.domain.status}`
            : "No custom domain",
        });
        return {
          ok: true,
          publishedUrl: result.publishedUrl,
          domain: result.domain,
        };
      },
    }),
    remove_domain: tool({
      description:
        "Disconnect the custom domain from this site (does not change the user's DNS records).",
      inputSchema: z.object({}),
      execute: async () => {
        const result = await disconnectCustomDomain(projectId, token);
        await onStep({ kind: "domain", label: "Removed custom domain" });
        return {
          ok: true,
          publishedUrl: result.publishedUrl,
          domain: null,
        };
      },
    }),
  };

  const plan_site = tool({
    description:
      "Store the structured site plan and start the live preview. Only after inspect_site returns mode \"new\". Call once.",
    inputSchema: sitePlanSchema,
    execute: async (plan) => {
      await onStep({
        kind: "plan",
        label: `Planned "${plan.siteName}"`,
        detail: `${plan.pages.length} page(s)`,
      });
      await onPlan(plan);

      let previewUrl: string | null = null;
      if (!hasPreview) {
        previewUrl = await box.startPreview(boxId);
        await onPreview(previewUrl);
        await onStep({
          kind: "preview",
          label: "Preview URL live",
          detail: previewUrl,
        });
      }

      return { ok: true, previewUrl };
    },
  });

  const tools = knownExisting
    ? sharedTools
    : { ...sharedTools, plan_site };

  return new ToolLoopAgent({
    model: getModel(opts.modelId, opts.customerId),
    instructions: buildInstructions(opts),
    tools,
    providerOptions: anthropicThinkingOptions("low"),
    stopWhen: isStepCount(40),
  });
}
