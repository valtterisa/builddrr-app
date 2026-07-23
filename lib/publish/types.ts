import { z } from "zod";
import { customAlphabet } from "nanoid";
import { AppError } from "@/lib/errors";

export const publishStatusSchema = z.enum([
  "idle",
  "publishing",
  "published",
  "error",
]);

export const domainStatusSchema = z.enum([
  "initializing",
  "pending",
  "active",
  "deactivated",
  "blocked",
  "error",
]);

export const publishRequestSchema = z.object({
  projectId: z.string().min(1),
});

export const publishAcceptedSchema = z.object({
  ok: z.literal(true),
});

export const domainAddRequestSchema = z.object({
  projectId: z.string().min(1),
  domain: z.string().min(1),
});

export const domainDeleteRequestSchema = z.object({
  projectId: z.string().min(1),
});

export const domainGetQuerySchema = z.object({
  projectId: z.string().min(1),
});

export const dnsRecordSchema = z.object({
  type: z.enum(["CNAME", "TXT"]),
  name: z.string(),
  value: z.string(),
  hint: z.string().optional(),
});

export const domainInfoSchema = z.object({
  name: z.string(),
  status: domainStatusSchema,
  cnameTarget: z.string(),
  records: z.array(dnsRecordSchema),
  validationMethod: z.enum(["http", "txt"]).optional(),
  errorMessage: z.string().optional(),
});

export const domainsResponseSchema = z.object({
  publishedUrl: z.string().url().nullable(),
  cfProjectName: z.string().nullable(),
  domain: domainInfoSchema.nullable(),
});

export const apiErrorBodySchema = z.object({
  error: z.string(),
  code: z.string().optional(),
});

export type PublishStatus = z.infer<typeof publishStatusSchema>;
export type DomainStatus = z.infer<typeof domainStatusSchema>;
export type DomainInfo = z.infer<typeof domainInfoSchema>;
export type DomainsResponse = z.infer<typeof domainsResponseSchema>;
export type DnsRecord = z.infer<typeof dnsRecordSchema>;

export const FLORAS_SITES_DOMAIN =
  process.env.FLORAS_SITES_DOMAIN?.trim() || "floras.app";

const SUBDOMAIN_ID_LENGTH = 32;
const generateSubdomainId = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  SUBDOMAIN_ID_LENGTH
);

export function generateFlorasHostname(): string {
  return `${generateSubdomainId()}.${FLORAS_SITES_DOMAIN}`;
}

export function isFlorasHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  return (
    host.endsWith(`.${FLORAS_SITES_DOMAIN}`) && host !== FLORAS_SITES_DOMAIN
  );
}

const HOSTNAME_RE =
  /^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

export function parseHostname(input: string): string {
  let raw = input.trim().toLowerCase();
  raw = raw.replace(/^https?:\/\//, "");
  raw = raw.split("/")[0] ?? raw;
  raw = raw.split("?")[0] ?? raw;
  raw = raw.replace(/\.$/, "");

  if (!raw || raw.includes(" ") || raw.includes(":")) {
    throw new AppError("domain", "Enter a valid domain name.", {
      detail: `invalid hostname: ${input}`,
    });
  }

  if (
    raw.endsWith(".pages.dev") ||
    raw.endsWith(".on.ascii.dev") ||
    raw === FLORAS_SITES_DOMAIN ||
    raw.endsWith(`.${FLORAS_SITES_DOMAIN}`) ||
    raw.includes("localhost")
  ) {
    throw new AppError(
      "domain",
      "Use your own domain, not a Floras or preview host.",
      { detail: `rejected hostname: ${raw}` }
    );
  }

  if (!HOSTNAME_RE.test(raw)) {
    throw new AppError("domain", "Enter a valid domain name.", {
      detail: `invalid hostname: ${raw}`,
    });
  }

  return raw;
}

export function pagesProjectName(projectId: string): string {
  const id = projectId.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const name = `floras-${id}`;
  return name.length > 58 ? name.slice(0, 58) : name;
}

export function visitUrl(project: {
  customDomain?: string | null;
  customDomainStatus?: DomainStatus | null;
  publishedUrl?: string | null;
}): string | null {
  if (
    project.customDomain &&
    project.customDomainStatus === "active"
  ) {
    return `https://${project.customDomain}`;
  }
  return project.publishedUrl ?? null;
}
