export type AppErrorCode =
  | "auth"
  | "not_found"
  | "no_plan"
  | "no_credits"
  | "rate_limit"
  | "timeout"
  | "network"
  | "preview"
  | "publish"
  | "domain"
  | "config"
  | "unknown";

const FRIENDLY: Record<AppErrorCode, string> = {
  auth: "Please sign in and try again.",
  not_found: "We couldn't find that. It may have been deleted.",
  no_plan: "Pro plan required to continue.",
  no_credits: "AI credit balance too low. Top up to continue.",
  rate_limit: "We're getting a lot of requests. Please wait a moment and try again.",
  timeout: "That took too long. Please try again.",
  network: "Couldn't reach the server. Check your connection and try again.",
  preview: "Couldn't start the live preview. Please try again.",
  publish: "Couldn't publish your site. Please try again.",
  domain: "Couldn't update the custom domain. Please try again.",
  config: "This feature isn't available right now. Please try again later.",
  unknown: "Something went wrong. Please try again.",
};

const RULES: Array<{ code: AppErrorCode; test: (text: string) => boolean }> = [
  {
    code: "auth",
    test: (t) =>
      /\b(not authenticated|unauthorized|unauthenticated|forbidden|401)\b/.test(
        t
      ),
  },
  {
    code: "not_found",
    test: (t) => /\b(not found|404)\b/.test(t) && !/\bpreview\b/.test(t),
  },
  {
    code: "no_plan",
    test: (t) =>
      /\bno_plan\b/.test(t) || /\bpro plan (required|needed)\b/.test(t),
  },
  {
    code: "no_credits",
    test: (t) =>
      /\bno_credits\b/.test(t) ||
      /\bcredit\b/.test(t) ||
      /\bbalance too low\b/.test(t),
  },
  {
    code: "rate_limit",
    test: (t) =>
      /\b(rate.?limit|too many requests|overloaded|429|resource.?exhausted)\b/.test(
        t
      ),
  },
  {
    code: "timeout",
    test: (t) =>
      /\b(timeout|timed out|etimedout|econnaborted|abort(ed)?)\b/.test(t),
  },
  {
    code: "network",
    test: (t) =>
      /\b(network|fetch failed|econnrefused|enotfound|socket|dns|offline)\b/.test(
        t
      ),
  },
  {
    code: "preview",
    test: (t) =>
      /\b(preview url|host output|astro dev|on\.ascii\.dev)\b/.test(t),
  },
  {
    code: "publish",
    test: (t) =>
      /\b(publish|wrangler|pages deploy|cloudflare project|build output|dist\/index)\b/.test(
        t
      ),
  },
  {
    code: "domain",
    test: (t) =>
      /\b(custom domain|hostname|cname|domain verification|invalid domain)\b/.test(
        t
      ),
  },
  {
    code: "config",
    test: (t) =>
      /\b(api.?key|box_api_key|cloudflare_api_token|cloudflare_account_id|\.env|not configured|environment secrets|missing secret)\b/.test(
        t
      ),
  },
];

function extractMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }
  if (typeof error === "object" && error !== null) {
    const obj = error as { message?: unknown; error?: unknown };
    if (typeof obj.message === "string" && obj.message.trim()) {
      return obj.message.trim();
    }
    if (typeof obj.error === "string" && obj.error.trim()) {
      return obj.error.trim();
    }
  }
  return "Unknown error";
}

function extractCodeHint(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return undefined;
}

function classify(detail: string, codeHint?: string): AppErrorCode {
  const hint = (codeHint ?? "").toLowerCase();
  if (hint === "no_plan") return "no_plan";
  if (hint === "no_credits") return "no_credits";
  if (hint === "publish") return "publish";
  if (hint === "domain") return "domain";

  const text = `${hint} ${detail}`.toLowerCase();
  for (const rule of RULES) {
    if (rule.test(text)) return rule.code;
  }
  return "unknown";
}

function isSafeCustomerMessage(message: string): boolean {
  if (message.length > 160) return false;
  if (/[\n\r\t]/.test(message)) return false;
  if (
    /\b(api.?key|box_api_key|\.env|stack|exception|at [a-z0-9_./-]+:\d+|anthropic|openai|secret|token=|password)\b/i.test(
      message
    )
  ) {
    return false;
  }
  return true;
}

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly detail: string;

  constructor(
    code: AppErrorCode,
    message?: string,
    options?: { detail?: string; cause?: unknown }
  ) {
    super(message ?? FRIENDLY[code], { cause: options?.cause });
    this.name = "AppError";
    this.code = code;
    this.detail = options?.detail ?? message ?? FRIENDLY[code];
  }

  static from(error: unknown): AppError {
    if (error instanceof AppError) return error;

    const detail = extractMessage(error);
    const codeHint = extractCodeHint(error);
    const code = classify(detail, codeHint);

    if (
      (code === "no_plan" ||
        code === "no_credits" ||
        code === "domain" ||
        code === "publish") &&
      isSafeCustomerMessage(detail)
    ) {
      return new AppError(code, detail, { detail, cause: error });
    }

    if (code !== "unknown") {
      return new AppError(code, FRIENDLY[code], { detail, cause: error });
    }

    if (isSafeCustomerMessage(detail) && detail !== "Unknown error") {
      return new AppError(code, detail, { detail, cause: error });
    }

    return new AppError("unknown", FRIENDLY.unknown, { detail, cause: error });
  }

  static async fromResponse(res: Response): Promise<AppError> {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      return new AppError("network", FRIENDLY.network, {
        detail: `HTTP ${res.status}`,
      });
    }
    return AppError.from(body);
  }
}

export async function assertOk(res: Response): Promise<void> {
  if (res.ok) return;
  throw await AppError.fromResponse(res);
}
