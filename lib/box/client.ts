import {
  BoxApi,
  BoxStateEnum,
  Configuration,
  waitUntilReady,
} from "@asciidev/box-sdk";
import { AppError } from "@/lib/errors";

/**
 * Thin wrapper around the Box (box.ascii.dev) sandbox provider. All generated
 * Astro projects live in the `site/` working directory inside a Box, and are
 * served on a stable public HTTPS URL via the in-box `host` command.
 */

const SITE_DIR = "site";
const CF_ENV_PATH = "floras-cf.env";
const PREVIEW_PORT = 4321;
const TEMPLATE_REPO_URL = "https://github.com/valtterisa/astro-template.git";

export type BoxFile = {
  path: string;
  content: string;
};

export type BoxState = (typeof BoxStateEnum)[keyof typeof BoxStateEnum];

export { BoxStateEnum };

export function getPreviewPort() {
  return PREVIEW_PORT;
}

export function boxConfigured(): boolean {
  return Boolean(process.env.BOX_API_KEY);
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
  const box = getBox();
  const created = await box.create({
    createBoxRequest: { ttlSeconds: 3600, noEnv: true },
  });
  const boxId = created.box.id;
  await box.update({ boxId, updateBoxRequest: { name } });
  await waitUntilReady(box, boxId);
  const subdomain = await getBoxSubdomain(boxId);
  await pullTemplate(boxId);
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

export function previewUrlForBox(
  subdomain: string,
  port: number = PREVIEW_PORT
): string {
  return `https://${subdomain}-${port}.on.ascii.dev`;
}

export async function pullTemplate(boxId: string): Promise<void> {
  const quoted = shellQuote(TEMPLATE_REPO_URL);
  const res = await runCommand(
    boxId,
    `rm -rf ${SITE_DIR} && git clone --depth 1 ${quoted} ${SITE_DIR}`,
    { cwd: ".", timeoutSeconds: 180 }
  );
  if (!res.success || res.exitCode !== 0) {
    throw new AppError("preview", "Could not pull Astro template repo.", {
      detail: res.stderr || res.stdout || `exit ${res.exitCode}`,
    });
  }
}

export async function getBoxState(boxId: string): Promise<BoxState> {
  const box = getBox();
  const res = await box.get({ boxId });
  return res.box.state;
}

export async function ensureBoxReady(boxId: string): Promise<void> {
  const box = getBox();
  const state = await getBoxState(boxId);

  switch (state) {
    case BoxStateEnum.Ready:
    case BoxStateEnum.Idle:
    case BoxStateEnum.Running:
      return;
    case BoxStateEnum.Archiving:
      await waitUntilArchived(box, boxId);
      await box.resume({ boxId, resumeRequest: { noEnv: true } });
      await waitUntilReady(box, boxId);
      return;
    case BoxStateEnum.Archived:
      await box.resume({ boxId, resumeRequest: { noEnv: true } });
      await waitUntilReady(box, boxId);
      return;
    case BoxStateEnum.Init:
    case BoxStateEnum.Provisioning:
    case BoxStateEnum.Provisioned:
    case BoxStateEnum.Cloning:
      await waitUntilReady(box, boxId);
      return;
    case BoxStateEnum.Error:
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

export async function runCommand(
  boxId: string,
  command: string,
  opts: { cwd?: string; timeoutSeconds?: number } = {}
): Promise<CommandResult> {
  const box = getBox();
  const res = await box.command({
    boxId,
    commandRequest: {
      command,
      cwd: opts.cwd ?? SITE_DIR,
      timeoutSeconds: opts.timeoutSeconds ?? 120,
    },
  });
  return {
    exitCode: res.exitCode,
    stdout: res.stdout ?? "",
    stderr: res.stderr ?? "",
    success: Boolean(res.success),
  };
}

/**
 * Docs flow: start app on 0.0.0.0 → host <port> --public → open URL.
 * https://docs.ascii.dev/box/hosting.md
 */
export async function startPreview(boxId: string): Promise<string> {
  await ensureBoxReady(boxId);

  const url = previewUrlForBox(await getBoxSubdomain(boxId));

  if (
    (await isPreviewPortReady(boxId, PREVIEW_PORT)) &&
    (await probePublicPreview(url))
  ) {
    return url;
  }

  await ensureSiteDeps(boxId);

  if (!(await isPreviewPortReady(boxId, PREVIEW_PORT))) {
    await startAstroDev(boxId);
    await waitForPreviewPort(boxId, PREVIEW_PORT);
  }

  return await publishHost(boxId, PREVIEW_PORT);
}

async function ensureSiteDeps(boxId: string): Promise<void> {
  const ready = await runCommand(
    boxId,
    "test -d node_modules && test -x node_modules/.bin/astro",
    { timeoutSeconds: 30 }
  );
  if (ready.success && ready.exitCode === 0) return;

  const install = await runCommand(
    boxId,
    "corepack enable && pnpm install --frozen-lockfile",
    { timeoutSeconds: 300 }
  );
  if (!install.success || install.exitCode !== 0) {
    throw new AppError("preview", "Could not install site dependencies.", {
      detail: install.stderr || install.stdout || `exit ${install.exitCode}`,
    });
  }
}

function extractHttpCode(stdout: string): string | null {
  const marked = stdout.match(/PROBE:(\d{3})/);
  if (marked?.[1]) return marked[1];
  const trailing = stdout.trim().match(/(\d{3})\s*$/);
  return trailing?.[1] ?? null;
}

async function isPreviewPortReady(boxId: string, port: number): Promise<boolean> {
  const probe = await runCommand(
    boxId,
    `code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 3 http://127.0.0.1:${port}/ 2>/dev/null || echo 000); echo PROBE:$code`,
    { cwd: ".", timeoutSeconds: 20 }
  );
  const code = extractHttpCode(probe.stdout || "");
  return Boolean(code && code !== "000");
}

async function isPreviewPortFree(boxId: string, port: number): Promise<boolean> {
  const check = await runCommand(
    boxId,
    `ss -ltn 2>/dev/null | grep -q ':${port}' && echo BUSY || echo FREE`,
    { cwd: ".", timeoutSeconds: 15 }
  );
  return (check.stdout || "").includes("FREE");
}

async function waitForPortFree(boxId: string, port: number): Promise<void> {
  for (let attempt = 1; attempt <= 20; attempt++) {
    if (await isPreviewPortFree(boxId, port)) return;
    if (attempt < 20) await new Promise((r) => setTimeout(r, 500));
  }
}

async function stopAstroDev(boxId: string): Promise<void> {
  await runCommand(
    boxId,
    [
      "pkill -f '[a]stro dev' >/dev/null 2>&1 || true",
      "pkill -f 'node.*astro' >/dev/null 2>&1 || true",
      "pkill -f 'vite' >/dev/null 2>&1 || true",
      `fuser -k ${PREVIEW_PORT}/tcp >/dev/null 2>&1 || true`,
    ].join("; "),
    { cwd: ".", timeoutSeconds: 30 }
  );
  await waitForPortFree(boxId, PREVIEW_PORT);
}

async function startAstroDev(boxId: string): Promise<void> {
  await runCommand(boxId, ": > /tmp/astro-dev.log", {
    cwd: ".",
    timeoutSeconds: 15,
  });
  await runCommand(
    boxId,
    `pnpm exec astro dev --host 0.0.0.0 --port ${PREVIEW_PORT} >>/tmp/astro-dev.log 2>&1 &`,
    { timeoutSeconds: 30 }
  );
}

async function waitForPreviewPort(boxId: string, port: number): Promise<void> {
  const url = previewUrlForBox(await getBoxSubdomain(boxId), port);
  for (let attempt = 1; attempt <= 45; attempt++) {
    if (await isPreviewPortReady(boxId, port)) return;
    if (attempt > 2 && (await probePublicPreview(url))) return;
    if (attempt < 45) await new Promise((r) => setTimeout(r, 2_000));
  }

  const log = await runCommand(
    boxId,
    "tail -n 80 /tmp/astro-dev.log 2>/dev/null || true",
    { cwd: ".", timeoutSeconds: 15 }
  );
  throw new AppError("preview", "Astro preview did not become ready.", {
    detail: (log.stdout || log.stderr || "").trim() || `port ${port} never answered`,
  });
}

async function publishHost(boxId: string, port: number): Promise<string> {
  const url = previewUrlForBox(await getBoxSubdomain(boxId), port);

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

  for (;;) {
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
  await ensureBoxReady(boxId);
  await ensureSiteDeps(boxId);
  await stopAstroDev(boxId);
  await startAstroDev(boxId);
  await waitForPreviewPort(boxId, PREVIEW_PORT);
  return await publishHost(boxId, PREVIEW_PORT);
}

export async function stopSandbox(boxId: string): Promise<void> {
  const box = getBox();
  await box.stop({ boxId });
}

export async function buildSite(boxId: string): Promise<void> {
  const res = await runCommand(boxId, "pnpm run build", { timeoutSeconds: 300 });
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

export type WranglerDeployCreds = {
  apiToken: string;
  accountId: string;
  projectName: string;
};

async function writeCfEnvFile(
  boxId: string,
  creds: Pick<WranglerDeployCreds, "apiToken" | "accountId">
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
      path: CF_ENV_PATH,
      content,
      encoding: "utf8",
    },
  });
}

export async function scrubCfEnv(boxId: string): Promise<void> {
  await runCommand(boxId, `rm -f ../${CF_ENV_PATH} ${CF_ENV_PATH}`, {
    cwd: SITE_DIR,
    timeoutSeconds: 30,
  });
}

export async function deployDistWithWrangler(
  boxId: string,
  creds: WranglerDeployCreds
): Promise<void> {
  await writeCfEnvFile(boxId, creds);
  try {
    const res = await runCommand(
      boxId,
      `set -a && . ../${CF_ENV_PATH} && set +a && pnpm dlx wrangler@4 pages deploy dist --project-name=${shellQuote(creds.projectName)} --commit-dirty=true`,
      { timeoutSeconds: 300 }
    );
    if (!res.success || res.exitCode !== 0) {
      throw new AppError("publish", "Deploy to Cloudflare failed.", {
        detail: res.stderr || res.stdout || `exit ${res.exitCode}`,
      });
    }
  } finally {
    await scrubCfEnv(boxId);
  }
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
