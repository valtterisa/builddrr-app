"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { Check, Copy, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { AccountSection } from "@/components/account/account-section";
import { Button } from "@/components/ui/button";
import { AppError, assertOk } from "@/lib/errors";
import { cn } from "@/lib/utils";
import type { DomainStatus, PublishStatus } from "@/lib/publish/types";

type ProjectRow = {
  _id: string;
  publishStatus?: PublishStatus;
  cfSubdomain?: string;
  publishedUrl?: string;
  customDomain?: string;
  customDomainStatus?: DomainStatus;
  customDomainError?: string;
};

function statusLabel(status: DomainStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "pending":
    case "initializing":
      return "Pending DNS";
    case "error":
      return "Error";
    case "blocked":
      return "Blocked";
    case "deactivated":
      return "Off";
    default: {
      const _exhaustive: never = status;
      return String(_exhaustive);
    }
  }
}

async function mutateDomain(
  method: "POST" | "DELETE" | "GET",
  projectId: string,
  domain?: string
): Promise<void> {
  const res =
    method === "GET"
      ? await fetch(
          `/api/domains?projectId=${encodeURIComponent(projectId)}`
        )
      : await fetch("/api/domains", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            method === "POST" ? { projectId, domain } : { projectId }
          ),
        });
  await assertOk(res);
}

function ProjectDomainCard({ project }: { project: ProjectRow }) {
  const [domainInput, setDomainInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const subdomain = project.cfSubdomain ?? null;
  const customDomain = project.customDomain ?? null;
  const status = project.customDomainStatus;
  const publishedUrl =
    project.publishedUrl ??
    (subdomain ? `https://${subdomain}` : null);

  async function run(action: () => Promise<void>) {
    setLoading(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(AppError.from(e).message);
    } finally {
      setLoading(false);
    }
  }

  function connectDomain() {
    void run(async () => {
      await mutateDomain("POST", project._id, domainInput);
      setDomainInput("");
    });
  }

  async function copyCname() {
    if (!customDomain || !subdomain) return;
    await navigator.clipboard.writeText(`${customDomain} ${subdomain}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="border border-border/60 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {customDomain ? (
            <>
              <p className="truncate font-mono text-sm font-medium text-foreground">
                {customDomain}
              </p>
              {subdomain && publishedUrl ? (
                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block truncate font-mono text-[11px] text-muted-foreground underline-offset-4 hover:underline"
                >
                  {subdomain}
                </a>
              ) : null}
            </>
          ) : subdomain && publishedUrl ? (
            <a
              href={publishedUrl}
              target="_blank"
              rel="noreferrer"
              className="block truncate font-mono text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              {subdomain}
            </a>
          ) : (
            <p className="text-sm font-medium text-foreground">Published site</p>
          )}
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/build/${project._id}`}>Open</Link>
        </Button>
      </div>

      {!customDomain ? (
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label
              htmlFor={`domain-${project._id}`}
              className="text-xs font-medium text-muted-foreground"
            >
              Custom domain
            </label>
            <input
              id={`domain-${project._id}`}
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="www.example.com"
              disabled={loading}
              className="mt-1.5 flex h-10 w-full border border-border bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter") connectDomain();
              }}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div>
            <Button
              onClick={connectDomain}
              disabled={loading || !domainInput.trim()}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Connecting…
                </>
              ) : (
                "Connect domain"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {status ? (
              <p
                className={cn(
                  "text-xs",
                  status === "active"
                    ? "text-foreground"
                    : status === "error" || status === "blocked"
                      ? "text-destructive"
                      : "text-muted-foreground"
                )}
              >
                {statusLabel(status)}
              </p>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() =>
                  void run(() => mutateDomain("GET", project._id))
                }
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Check status"
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() =>
                  void run(() => mutateDomain("DELETE", project._id))
                }
              >
                Remove
              </Button>
            </div>
          </div>

          {project.customDomainError ? (
            <p className="text-sm text-destructive">
              {project.customDomainError}
            </p>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {subdomain ? (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                DNS records
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Point your domain at the Floras subdomain. Apex needs
                ALIAS/ANAME or CNAME flattening.
              </p>
              <div className="mt-3 border border-border/60 bg-background/60 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    CNAME
                  </span>
                  <button
                    type="button"
                    className="inline-flex size-7 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                    onClick={() => void copyCname()}
                    aria-label="Copy CNAME record"
                  >
                    {copied ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 break-all font-mono text-[12px]">
                  <span className="text-muted-foreground">Name </span>
                  {customDomain}
                </p>
                <p className="mt-0.5 break-all font-mono text-[12px]">
                  <span className="text-muted-foreground">Value </span>
                  {subdomain}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function DomainsSection() {
  const projects = useQuery((api as any).projects.list, {}) as
    | ProjectRow[]
    | undefined;

  const published = projects?.filter(
    (p) =>
      p.publishStatus === "published" &&
      Boolean(p.cfSubdomain || p.publishedUrl)
  );

  return (
    <AccountSection
      id="domains"
      title="Domains"
      description="Connect custom hostnames to sites published on Cloudflare Pages."
    >
      {projects === undefined ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : published && published.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No published sites yet. Publish a site from the workspace, then
          connect a domain here.
        </p>
      ) : (
        <div className="flex max-w-2xl flex-col gap-3">
          {published?.map((project) => (
            <ProjectDomainCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </AccountSection>
  );
}
