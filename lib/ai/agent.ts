import { ToolLoopAgent, isStepCount, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { sitePlanSchema, type SitePlan } from "@/lib/schema/site";
import * as box from "@/lib/box/client";
import { DESIGN_GUIDELINES } from "@/lib/ai/design-guidelines";
import { resolveAgentModelId } from "@/lib/ai/model";
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
  | "note";

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
  customInstructions?: string;
  modelId?: string;
  customerId?: string;
}

function getModel(modelId?: string, customerId?: string) {
  const model = anthropic(resolveAgentModelId(modelId));
  if (!customerId) return model;
  return withAutumnModel(model, customerId);
}

const INSTRUCTIONS = `You are an expert Astro web engineer inside a Linux sandbox. You generate and edit beautiful, production-ready Astro sites (landing pages and blogs) that live in the "site/" project directory.

The sandbox already has a base Astro template cloned into site/. Edit that project in place. Do not recreate package.json or reinstall the framework unless something is broken.

WORKFLOW (mandatory — three phases, in order)

PHASE 1 — PLAN
1. Apply Section 0 of the design skill: infer the brief, output a one-line Design Read.
2. Set DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY from the skill (cap MOTION_INTENSITY at 3 because motion is CSS-only).
3. Call plan_site exactly once with a complete SitePlan that matches that read (font, theme, accent, varied section types, real imagePrompt seeds). Do not write files by hand before plan_site.
4. plan_site stores the plan and starts the live preview. Then build by editing files.

PHASE 2 — BUILD
5. Use write_file / read_file / list_files / run_command to implement the SitePlan on top of the template.
6. Keep changes targeted. The dev server hot-reloads — never restart it manually.
7. Deliver complete file contents (no placeholders or "// ..."). Prefer editing files over explaining them.

PHASE 3 — DESIGN POLISH (required second pass)
8. When the site is functionally built, run a full design-skill pass: re-read key page and component files, then rewrite them to better satisfy the design skill — especially Section 4 (directives), Section 9 (AI tells), and Section 14 (pre-flight checklist).
9. Do not call plan_site again in this phase. Improve UI in place with write_file.
10. Only stop after Section 14 pre-flight can be honestly ticked (within Astro + CSS constraints). End with a short markdown summary (a few bullets or one short paragraph) of what you built and what the polish pass changed. Never paste the design skill, Section 14 checklist, or long file dumps into the user-facing reply.

CUSTOM DOMAINS
- The site must be published (user clicks Publish in the workspace) before a custom domain can be connected.
- When the user asks to connect, check, or remove a domain, use setup_domain / check_domain / remove_domain.
- After setup_domain, clearly list the DNS records (type, name, value) and tell them to add those at their DNS provider. Do not invent DNS values.
- Prefer www.example.com style hostnames; for apex domains explain ALIAS/ANAME or CNAME flattening when relevant.
- Domains can also be managed under Account → Domains.

Never dump large explanations between tool calls. User-facing text must stay short and well-formatted markdown.

${DESIGN_GUIDELINES}`;

export function buildSiteAgent(opts: BuildAgentOptions) {
  const { boxId, projectId, token, onStep, onPlan, onPreview, hasPreview } =
    opts;

  const tools = {
    plan_site: tool({
      description:
        "Store the structured site plan and start the live preview on the cloned Astro template. Call once in PHASE 1 only.",
      inputSchema: sitePlanSchema,
      execute: async (plan) => {
        await onStep({
          kind: "plan",
          label: `Planned "${plan.siteName}"`,
          detail: `${plan.pages.length} page(s)`,
        });
        await onPlan(plan as SitePlan);

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

        return {
          ok: true,
          previewUrl,
        };
      },
    }),

    write_file: tool({
      description: "Create or overwrite one file in the site project.",
      inputSchema: z.object({
        path: z
          .string()
          .describe("Path relative to the site root, e.g. src/components/Hero.astro"),
        content: z.string(),
      }),
      execute: async ({ path, content }) => {
        await box.writeFiles(boxId, [{ path, content }]);
        await onStep({ kind: "write", label: `Edited ${path}` });
        return { ok: true };
      },
    }),

    read_file: tool({
      description: "Read one file from the site project.",
      inputSchema: z.object({ path: z.string() }),
      execute: async ({ path }) => {
        const content = await box.readFile(boxId, path);
        await onStep({ kind: "read", label: `Read ${path}` });
        return { content };
      },
    }),

    list_files: tool({
      description: "List the files in the site project.",
      inputSchema: z.object({}),
      execute: async () => {
        const res = await box.runCommand(
          boxId,
          "find . -type f -not -path './node_modules/*' -not -path './.astro/*' -not -path './.git/*' | sort"
        );
        await onStep({ kind: "command", label: "Listed project files" });
        return { files: res.stdout.split("\n").filter(Boolean) };
      },
    }),

    run_command: tool({
      description: "Run a short shell command in the site project (e.g. install a package).",
      inputSchema: z.object({ command: z.string() }),
      execute: async ({ command }) => {
        const res = await box.runCommand(boxId, command, { timeoutSeconds: 120 });
        await onStep({
          kind: "command",
          label: command,
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
        try {
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
        } catch (error) {
          const appError = AppError.from(error);
          await onStep({
            kind: "domain",
            label: "Domain setup failed",
            detail: appError.message,
          });
          return { ok: false, error: appError.message, code: appError.code };
        }
      },
    }),

    check_domain: tool({
      description:
        "Refresh custom domain status and DNS records for this published site.",
      inputSchema: z.object({}),
      execute: async () => {
        try {
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
        } catch (error) {
          const appError = AppError.from(error);
          return { ok: false, error: appError.message, code: appError.code };
        }
      },
    }),

    remove_domain: tool({
      description:
        "Disconnect the custom domain from this site (does not change the user's DNS records).",
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const result = await disconnectCustomDomain(projectId, token);
          await onStep({ kind: "domain", label: "Removed custom domain" });
          return {
            ok: true,
            publishedUrl: result.publishedUrl,
            domain: null,
          };
        } catch (error) {
          const appError = AppError.from(error);
          return { ok: false, error: appError.message, code: appError.code };
        }
      },
    }),
  };

  const custom = opts.customInstructions?.trim();
  const instructions = custom
    ? `${INSTRUCTIONS}

USER CUSTOM INSTRUCTIONS
Honor these preferences when they do not conflict with safety or the design skill above:
${custom}`
    : INSTRUCTIONS;

  return new ToolLoopAgent({
    model: getModel(opts.modelId, opts.customerId),
    instructions,
    tools,
    providerOptions: anthropicThinkingOptions("low"),
    stopWhen: isStepCount(40),
  });
}
