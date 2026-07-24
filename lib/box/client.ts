import {
  BoxApi,
  BoxStateEnum,
  Configuration,
  ResponseError,
  waitUntilReady,
} from "@asciidev/box-sdk";
import { AppError } from "@/lib/errors";

import {
  SITE_DIR,
  PREVIEW_PORT,
  goldenBoxId,
  boxLog,
  cfEnvPath,
} from "@/lib/box/config";

export type BoxFile = {
  path: string;
  content: string;
};

export type BoxState = (typeof BoxStateEnum)[keyof typeof BoxStateEnum];

export { BoxStateEnum };

export function boxConfigured(): boolean {
  return Boolean(process.env.BOX_API_KEY && process.env.BOX_GOLDEN_BOX_ID?.trim());
}

export function getBox(): BoxApi {
  const accessToken = process.env.BOX_API_KEY;
  if (!accessToken) {
    throw new Error("BOX_API_KEY is not set. Add it in the environment secrets.");
  }
  return new BoxApi(
    new Configuration({
      basePath: process.env.BOX_BASE_URL ?? "https://ascii.dev/api/box/v1",
      accessToken,
    })
  );
}

export async function createSandbox(
  name: string
): Promise<{ boxId: string; subdomain: string }> {
  const goldenId = goldenBoxId();
  if (!goldenId) {
    throw new AppError("config", "BOX_GOLDEN_BOX_ID is not set.");
  }

  const box = getBox();
  boxLog(goldenId, "create", "forking golden box", { name });
  const forked = await box.fork({
    boxId: goldenId,
    forkRequest: { noEnv: true },
  });
  const boxId = forked.box?.id ?? forked.id;
  if (!boxId) {
    throw new AppError("preview", "Forked sandbox did not return an id.");
  }
  await box.update({ boxId, updateBoxRequest: { name } });
  await waitUntilReady(box, boxId);
  boxLog(boxId, "create", "fork ready");
  const subdomain = await getBoxSubdomain(boxId);
  return { boxId, subdomain };
}

export async function getBoxSubdomain(boxId: string): Promise<string> {
  const box = getBox();
  const res = await box.get({ boxId });
  const subdomain = res.box.subdomain?.trim();
  if (!subdomain) {
    throw new AppError("preview", "Box subdomain is not assigned yet.", {
      detail: `box ${boxId}`,
    });
  }
  return subdomain;
}

export async function getBoxState(boxId: string): Promise<BoxState> {
  const box = getBox();
  const res = await box.get({ boxId });
  return res.box.state;
}

export async function ensureBoxReady(boxId: string): Promise<void> {
  const box = getBox();
  const state = await getBoxState(boxId);
  boxLog(boxId, "ready", "ensureBoxReady", { state });

  switch (state) {
    case BoxStateEnum.Ready:
    case BoxStateEnum.Idle:
    case BoxStateEnum.Running:
      boxLog(boxId, "ready", "already live", { state });
      return;
    case BoxStateEnum.Archiving:
      boxLog(boxId, "ready", "waiting for archive then resume");
      await waitUntilArchived(box, boxId);
      await box.resume({ boxId, resumeRequest: { noEnv: true } });
      await waitUntilReady(box, boxId);
      await new Promise((r) => setTimeout(r, 1500));
      boxLog(boxId, "ready", "resumed after archiving");
      return;
    case BoxStateEnum.Archived:
      boxLog(boxId, "ready", "resuming archived box");
      await box.resume({ boxId, resumeRequest: { noEnv: true } });
      await waitUntilReady(box, boxId);
      await new Promise((r) => setTimeout(r, 1500));
      boxLog(boxId, "ready", "resume complete");
      return;
    case BoxStateEnum.Init:
    case BoxStateEnum.Provisioning:
    case BoxStateEnum.Provisioned:
    case BoxStateEnum.Cloning:
      boxLog(boxId, "ready", "waiting until ready", { state });
      await waitUntilReady(box, boxId);
      boxLog(boxId, "ready", "provision finished");
      return;
    case BoxStateEnum.Error:
      boxLog(boxId, "ready", "box in error state");
      throw new AppError("preview", "Sandbox is in an error state.", {
        detail: `box ${boxId} state=error`,
      });
    default: {
      const _exhaustive: never = state;
      throw new AppError("preview", "Unknown sandbox state.", {
        detail: `box ${boxId} state=${String(_exhaustive)}`,
      });
    }
  }
}

export async function writeFiles(boxId: string, files: BoxFile[]): Promise<void> {
  const box = getBox();
  for (const file of files) {
    await box.writeFile({
      boxId,
      fileWriteRequest: {
        path: `${SITE_DIR}/${file.path}`,
        content: file.content,
        encoding: "utf8",
      },
    });
  }
}

export async function readFile(boxId: string, path: string): Promise<string> {
  const box = getBox();
  const res = await box.readFile({
    boxId,
    path: `${SITE_DIR}/${path}`,
    encoding: "utf8",
  });
  return res.content ?? "";
}

export interface CommandResult {
  exitCode: number | null | undefined;
  stdout: string;
  stderr: string;
  success: boolean;
}

async function readBoxCommandError(error: unknown): Promise<{
  message: string;
  status?: number;
  code?: string;
  body?: string;
}> {
  if (!(error instanceof ResponseError)) {
    return {
      message: error instanceof Error ? error.message : String(error),
    };
  }
  let body = "";
  let code: string | undefined;
  try {
    body = await error.response.clone().text();
    const parsed = JSON.parse(body) as { code?: string; error?: { code?: string } };
    code = parsed.code ?? parsed.error?.code;
  } catch {
    // ignore
  }
  return {
    message: error.message,
    status: error.response.status,
    code,
    body: body.slice(0, 400),
  };
}

function isBoxDirectFailed(info: {
  message: string;
  status?: number;
  code?: string;
  body?: string;
}): boolean {
  if (info.code === "box_direct_failed") return true;
  const haystack = `${info.body ?? ""} ${info.message}`;
  return /box_direct_failed/i.test(haystack);
}

function isRetryableBoxCommandError(info: {
  message: string;
  status?: number;
  code?: string;
  body?: string;
}): boolean {
  if (info.status === 502 || info.status === 503 || info.status === 504) {
    return true;
  }
  return isBoxDirectFailed(info);
}

export async function runCommand(
  boxId: string,
  command: string,
  opts: {
    cwd?: string;
    timeoutSeconds?: number;
    retries?: number;
  } = {}
): Promise<CommandResult> {
  const cwd = opts.cwd ?? SITE_DIR;
  const timeoutSeconds = opts.timeoutSeconds ?? 120;
  const retries = opts.retries ?? 3;
  const box = getBox();
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const t0 = Date.now();
    boxLog(boxId, "cmd", "start", {
      cwd,
      timeoutSeconds,
      attempt: attempt + 1,
      command: command.length > 160 ? `${command.slice(0, 160)}…` : command,
    });
    try {
      const res = await box.command({
        boxId,
        commandRequest: {
          command,
          cwd,
          timeoutSeconds,
        },
      });
      const result = {
        exitCode: res.exitCode,
        stdout: res.stdout ?? "",
        stderr: res.stderr ?? "",
        success: Boolean(res.success),
      };
      boxLog(boxId, "cmd", "done", {
        ms: Date.now() - t0,
        cwd,
        exit: result.exitCode,
        success: result.success,
        timedOut: Boolean(res.timedOut),
        stdout: result.stdout.trim().slice(0, 240),
        stderr: result.stderr.trim().slice(0, 240),
      });
      return result;
    } catch (error) {
      lastError = error;
      const info = await readBoxCommandError(error);
      boxLog(boxId, "cmd", "error", {
        ms: Date.now() - t0,
        cwd,
        attempt: attempt + 1,
        httpStatus: info.status ?? null,
        code: info.code ?? null,
        rawMessage: info.message,
        rawBody: info.body ?? null,
      });

      const retryable = isRetryableBoxCommandError(info);
      if (!retryable || attempt >= retries) {
        if (isBoxDirectFailed(info) || info.status === 502) {
          throw new AppError(
            "preview",
            "Sandbox is up but Box commands are failing. Try again in a moment.",
            {
              detail: [
                info.status != null ? `HTTP ${info.status}` : null,
                info.code ?? null,
                info.body || info.message,
              ]
                .filter(Boolean)
                .join(" — "),
              cause: error,
            }
          );
        }
        throw error;
      }

      if (attempt === 1) {
        await ensureBoxReady(boxId).catch(() => { });
      }
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/**
 * Docs flow: start app on 0.0.0.0 → host <port> --public → open URL.
 * https://docs.ascii.dev/box/hosting.md
 */
export async function startPreview(boxId: string): Promise<string> {
  const t0 = Date.now();
  boxLog(boxId, "start", "begin");
  await ensureBoxReady(boxId);
  await ensureSiteDeps(boxId);

  await stopAstroDev(boxId);
  await startAstroDev(boxId);
  const hosted = await publishHost(boxId, PREVIEW_PORT);
  boxLog(boxId, "start", "complete", { url: hosted, ms: Date.now() - t0 });
  return hosted;
}

async function ensureSiteDeps(boxId: string): Promise<void> {
  const hasAstro = await runCommand(
    boxId,
    "test -x node_modules/.bin/astro",
    { timeoutSeconds: 30 }
  );
  if (hasAstro.success && hasAstro.exitCode === 0) {
    boxLog(boxId, "deps", "astro binary present — skip install");
    return;
  }

  boxLog(boxId, "deps", "pnpm install");
  const install = await runCommand(
    boxId,
    "corepack enable >/dev/null 2>&1 || true; pnpm install --frozen-lockfile",
    { timeoutSeconds: 300 }
  );
  if (!install.success || install.exitCode !== 0) {
    throw new AppError("preview", "Could not install site dependencies.", {
      detail: install.stderr || install.stdout || `exit ${install.exitCode}`,
    });
  }
  boxLog(boxId, "deps", "ok");
}

async function stopAstroDev(boxId: string): Promise<void> {
  try {
    await runCommand(
      boxId,
      `fuser -k ${PREVIEW_PORT}/tcp >/dev/null 2>&1 || true`,
      { cwd: ".", timeoutSeconds: 30, retries: 1 }
    );
  } catch {
    // ignore — box may already be going down
  }
  try {
    await runCommand(boxId, "pkill -f '[a]stro dev' >/dev/null 2>&1 || true", {
      cwd: ".",
      timeoutSeconds: 30,
      retries: 1,
    });
  } catch {
    // ignore
  }
}

async function startAstroDev(boxId: string): Promise<void> {
  boxLog(boxId, "astro", "start");
  await runCommand(boxId, ": > /tmp/astro-dev.log", {
    cwd: ".",
    timeoutSeconds: 15,
  });
  await runCommand(
    boxId,
    `pnpm run dev -- --host 0.0.0.0 --port ${PREVIEW_PORT} >>/tmp/astro-dev.log 2>&1 &`,
    { timeoutSeconds: 30 }
  );
}

async function publishHost(boxId: string, port: number): Promise<string> {
  const hosted = await runCommand(
    boxId,
    `host ${port} --public --title Floras`,
    { cwd: ".", timeoutSeconds: 60 }
  );
  if (!hosted.success || hosted.exitCode !== 0) {
    throw new AppError("preview", "Could not expose public preview URL.", {
      detail: hosted.stderr || hosted.stdout || `exit ${hosted.exitCode}`,
    });
  }

  const subdomain = await getBoxSubdomain(boxId);
  const url = `https://${subdomain}-${port}.on.ascii.dev`;
  await waitForPublicPreview(url);
  return url;
}

export async function probePublicPreview(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: { Accept: "text/html" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return false;
    const body = await res.text();
    if (/upstream unavailable/i.test(body)) return false;
    return body.length > 0;
  } catch {
    return false;
  }
}

async function waitForPublicPreview(url: string): Promise<void> {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (await probePublicPreview(url)) return;
    await new Promise((r) => setTimeout(r, 2_000));
  }
  throw new AppError("preview", "Preview URL did not become ready.", {
    detail: url,
  });
}

async function waitUntilArchived(
  api: BoxApi,
  boxId: string,
  options?: { timeoutMs?: number; intervalMs?: number }
): Promise<void> {
  const timeoutMs = options?.timeoutMs ?? 300_000;
  const intervalMs = options?.intervalMs ?? 2_000;
  const deadline = Date.now() + timeoutMs;

  for (; ;) {
    const state = (await api.get({ boxId })).box.state;
    if (state === BoxStateEnum.Archived) return;
    if (state === BoxStateEnum.Error) {
      throw new AppError("preview", "Sandbox entered an error state.", {
        detail: `box ${boxId} state=error`,
      });
    }
    if (Date.now() >= deadline) {
      throw new AppError("preview", "Sandbox did not finish stopping.", {
        detail: `box ${boxId} last state=${state}`,
      });
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

/** Restart Astro + re-publish host. Does not stop/archive the VM. */
export async function restartPreview(boxId: string): Promise<string> {
  const t0 = Date.now();
  boxLog(boxId, "restart", "begin");
  await ensureBoxReady(boxId);
  await ensureSiteDeps(boxId);
  await stopAstroDev(boxId);
  await startAstroDev(boxId);
  const url = await publishHost(boxId, PREVIEW_PORT);
  boxLog(boxId, "restart", "complete", { url, ms: Date.now() - t0 });
  return url;
}

async function removeNodeModulesForStop(boxId: string): Promise<void> {
  boxLog(boxId, "stop", "removing node_modules before archive");
  const res = await runCommand(boxId, "rm -rf node_modules", {
    cwd: SITE_DIR,
    timeoutSeconds: 180,
    retries: 3,
  });
  if (!res.success || res.exitCode !== 0) {
    throw new AppError(
      "preview",
      "Could not remove node_modules — sandbox left running.",
      {
        detail: res.stderr || res.stdout || `exit ${res.exitCode}`,
      }
    );
  }
  boxLog(boxId, "stop", "node_modules removed");
}

export async function stopSandbox(
  boxId: string,
  opts: { scrub?: boolean } = {}
): Promise<void> {
  const scrub = opts.scrub ?? true;
  const t0 = Date.now();
  const box = getBox();
  try {
    const state = await getBoxState(boxId).catch(() => "unknown");
    boxLog(boxId, "stop", "begin", { state, scrub });

    try {
      await stopAstroDev(boxId);
    } catch (error) {
      boxLog(boxId, "stop", "astro stop failed — continuing to node_modules", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    await removeNodeModulesForStop(boxId);

    await box.stop({ boxId });
    boxLog(boxId, "stop", "box.stop requested", { ms: Date.now() - t0 });

    try {
      await waitUntilArchived(box, boxId, {
        timeoutMs: 120_000,
        intervalMs: 2_000,
      });
      boxLog(boxId, "stop", "archived", { ms: Date.now() - t0 });
    } catch (error) {
      boxLog(boxId, "stop", "archive wait ended", {
        error: error instanceof Error ? error.message : String(error),
        ms: Date.now() - t0,
      });
    }
  } catch (error) {
    boxLog(boxId, "stop", "aborted — box not stopped", {
      error: error instanceof Error ? error.message : String(error),
      ms: Date.now() - t0,
    });
    throw error;
  }
}

export async function buildSite(boxId: string): Promise<void> {
  const res = await runCommand(boxId, "pnpm run build", {
    timeoutSeconds: 300,
  });
  if (!res.success || res.exitCode !== 0) {
    throw new AppError("publish", "Site build failed.", {
      detail: res.stderr || res.stdout || `exit ${res.exitCode}`,
    });
  }
}

export async function assertDistPresent(boxId: string): Promise<void> {
  const res = await runCommand(boxId, "test -f dist/index.html");
  if (!res.success || res.exitCode !== 0) {
    throw new AppError("publish", "Build output is missing.", {
      detail: "dist/index.html not found after build",
    });
  }
}

const EXPORT_ZIP_PATH = ".floras-export.zip";
const EXPORT_SCRIPT_PATH = ".floras-export.py";

const EXPORT_ZIP_SCRIPT = `import os
import sys
import zipfile

root = "site"
out = ${JSON.stringify(EXPORT_ZIP_PATH)}
skip_dirs = {"node_modules", ".git", ".astro", "dist"}
skip_files = {".DS_Store"}

if not os.path.isdir(root):
    print("site directory missing", file=sys.stderr)
    sys.exit(1)

with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [
            d for d in dirnames
            if d not in skip_dirs and not d.startswith(".floras-")
        ]
        for name in filenames:
            if name in skip_files or name.startswith(".floras-"):
                continue
            full = os.path.join(dirpath, name)
            arc = os.path.relpath(full, root)
            zf.write(full, arc)
print("ok")
`;

export async function exportSiteZip(boxId: string): Promise<Blob> {
  await ensureBoxReady(boxId);

  const box = getBox();
  await runCommand(
    boxId,
    `rm -f ${shellQuote(EXPORT_ZIP_PATH)} ${shellQuote(EXPORT_SCRIPT_PATH)}`,
    { cwd: ".", timeoutSeconds: 30 }
  );

  await box.writeFile({
    boxId,
    fileWriteRequest: {
      path: EXPORT_SCRIPT_PATH,
      content: EXPORT_ZIP_SCRIPT,
      encoding: "utf8",
    },
  });

  try {
    const zip = await runCommand(
      boxId,
      `python3 ${shellQuote(EXPORT_SCRIPT_PATH)}`,
      { cwd: ".", timeoutSeconds: 180 }
    );

    if (!zip.success || zip.exitCode !== 0) {
      throw new AppError("unknown", "Couldn't create the project zip.", {
        detail: zip.stderr || zip.stdout || `exit ${zip.exitCode}`,
      });
    }

    return await box.artifact({ boxId, path: EXPORT_ZIP_PATH });
  } finally {
    await runCommand(
      boxId,
      `rm -f ${shellQuote(EXPORT_ZIP_PATH)} ${shellQuote(EXPORT_SCRIPT_PATH)}`,
      { cwd: ".", timeoutSeconds: 30 }
    ).catch((error) => {
      console.error("[box] export zip cleanup failed", error);
    });
  }
}

export type WranglerDeployCreds = {
  apiToken: string;
  accountId: string;
  projectName: string;
};

export async function scrubCfEnv(boxId: string, envPath?: string): Promise<void> {
  if (envPath) {
    await runCommand(boxId, `rm -f ${shellQuote(envPath)}`, {
      cwd: ".",
      timeoutSeconds: 30,
    });
    return;
  }
  await runCommand(boxId, "rm -f .floras-cf-*.env floras-cf.env", {
    cwd: ".",
    timeoutSeconds: 30,
  });
}

export async function deployDistWithWrangler(
  boxId: string,
  creds: WranglerDeployCreds
): Promise<void> {
  const envPath = cfEnvPath(boxId);
  try {
    await writeCfEnvFile(boxId, creds, envPath);
    const res = await runCommand(
      boxId,
      `set -a && . ${shellQuote(`../${envPath}`)} && set +a && pnpm dlx wrangler@4 pages deploy dist --project-name=${shellQuote(creds.projectName)} --commit-dirty=true`,
      { timeoutSeconds: 300 }
    );
    if (!res.success || res.exitCode !== 0) {
      throw new AppError("publish", "Deploy to Cloudflare failed.", {
        detail: res.stderr || res.stdout || `exit ${res.exitCode}`,
      });
    }
  } finally {
    await scrubCfEnv(boxId, envPath).catch((error) => {
      console.error("[box] scrubCfEnv failed", error);
    });
  }
}

async function writeCfEnvFile(
  boxId: string,
  creds: Pick<WranglerDeployCreds, "apiToken" | "accountId">,
  envPath: string
): Promise<void> {
  const box = getBox();
  const content = [
    `CLOUDFLARE_API_TOKEN=${creds.apiToken}`,
    `CLOUDFLARE_ACCOUNT_ID=${creds.accountId}`,
    "",
  ].join("\n");
  await box.writeFile({
    boxId,
    fileWriteRequest: {
      path: envPath,
      content,
      encoding: "utf8",
    },
  });
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
