import {
  BoxApi,
  BoxStateEnum,
  Configuration,
  ResponseError,
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

export async function createSandbox(name: string): Promise<string> {
  const box = getBox();
  const created = await box.create({
    createBoxRequest: { ttlSeconds: 3600, noEnv: true },
  });
  const boxId = created.box.id;
  await box.update({ boxId, updateBoxRequest: { name } });
  await waitUntilReady(box, boxId);
  await pullTemplate(boxId);
  return boxId;
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
    case BoxStateEnum.Archived:
    case BoxStateEnum.Archiving:
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
 * Install dependencies, start the Astro dev server detached, wait until it
 * answers on the preview port, then expose it on a public HTTPS URL.
 */
export async function startPreview(boxId: string): Promise<string> {
  await ensureBoxReady(boxId);
  await ensureSiteDeps(boxId);
  await startAstroDev(boxId, PREVIEW_PORT);
  await waitForPreviewPort(boxId, PREVIEW_PORT);
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

async function startAstroDev(boxId: string, port: number): Promise<void> {
  await runCommand(
    boxId,
    [
      "pkill -f '[a]stro dev' >/dev/null 2>&1 || true",
      `pnpm exec astro dev --host 0.0.0.0 --port ${port} >/tmp/astro-dev.log 2>&1 &`,
      "sleep 1",
    ].join("; "),
    { timeoutSeconds: 30 }
  );
}

async function readAstroLog(boxId: string): Promise<string> {
  const log = await runCommand(boxId, "tail -n 120 /tmp/astro-dev.log 2>/dev/null || true", {
    cwd: ".",
    timeoutSeconds: 15,
  });
  return (log.stdout || log.stderr || "").trim();
}

async function waitForPreviewPort(boxId: string, port: number): Promise<void> {
  const maxAttempts = 40;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const probe = await runCommand(
      boxId,
      `curl -s -o /dev/null -w '%{http_code}' --max-time 2 http://127.0.0.1:${port}/ || true`,
      { cwd: ".", timeoutSeconds: 15 }
    );
    const code = (probe.stdout || "").trim();
    if (/^\d{3}$/.test(code) && code !== "000") return;

    if (attempt < maxAttempts) {
      await runCommand(boxId, "sleep 2", { cwd: ".", timeoutSeconds: 10 });
    }
  }

  const log = await readAstroLog(boxId);
  throw new AppError("preview", "Astro preview did not become ready.", {
    detail: log || `port ${port} never answered`,
  });
}

async function publishHost(boxId: string, port: number): Promise<string> {
  const hosted = await runCommand(
    boxId,
    `host ${port} --public --title Floras`,
    { cwd: ".", timeoutSeconds: 60 }
  );
  const url = extractUrl(hosted.stdout) ?? extractUrl(hosted.stderr);
  if (!url) {
    throw new AppError("preview", "Could not determine preview URL.", {
      detail: hosted.stdout || hosted.stderr || "no on.ascii.dev URL in host output",
    });
  }
  return url.replace(/\?.*$/, "");
}

async function waitForBoxState(
  boxId: string,
  states: BoxState[],
  opts: { timeoutMs?: number; label?: string } = {}
): Promise<void> {
  const box = getBox();
  const timeoutMs = opts.timeoutMs ?? 180_000;
  const deadline = Date.now() + timeoutMs;
  let lastState: BoxState | "unknown" = "unknown";
  while (Date.now() < deadline) {
    const state = (await box.get({ boxId })).box.state;
    lastState = state;
    if (states.includes(state)) return;
    if (state === BoxStateEnum.Error) {
      throw new AppError("preview", "Sandbox entered an error state.", {
        detail: `box ${boxId} state=error`,
      });
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new AppError("preview", opts.label ?? "Sandbox state wait timed out.", {
    detail: `box ${boxId} wanted ${states.join("|")}, last saw ${lastState}`,
  });
}

async function toBoxAppError(err: unknown, message: string): Promise<AppError> {
  if (err instanceof AppError) return err;
  if (err instanceof ResponseError) {
    let body = "";
    try {
      const json = (await err.response.clone().json()) as {
        message?: string;
        code?: string;
        error?: { message?: string; code?: string };
      };
      body =
        json.error?.message ||
        json.message ||
        json.error?.code ||
        json.code ||
        JSON.stringify(json);
    } catch {
      body = await err.response
        .clone()
        .text()
        .catch(() => "");
    }
    return new AppError("preview", message, {
      detail: `HTTP ${err.response.status}: ${body || err.message}`,
      cause: err,
    });
  }
  return AppError.from(err);
}

/** Hard reboot: stop → poll archived → resume → poll ready → Astro + host. */
export async function restartPreview(boxId: string): Promise<string> {
  const box = getBox();

  try {
    await box.stop({ boxId });
  } catch (err) {
    throw await toBoxAppError(err, "Could not stop the sandbox.");
  }

  await waitForBoxState(boxId, [BoxStateEnum.Archived], {
    timeoutMs: 240_000,
    label: "Sandbox did not finish stopping.",
  });

  try {
    await box.resume({ boxId, resumeRequest: { noEnv: true } });
  } catch (err) {
    throw await toBoxAppError(err, "Could not resume the sandbox.");
  }

  await waitForBoxState(
    boxId,
    [BoxStateEnum.Ready, BoxStateEnum.Idle, BoxStateEnum.Running],
    { label: "Sandbox did not become ready after resume." }
  );

  await ensureSiteDeps(boxId);
  await startAstroDev(boxId, PREVIEW_PORT);
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

function extractUrl(text: string): string | undefined {
  const match = text.match(/https:\/\/[^\s"']+on\.ascii\.dev[^\s"']*/);
  return match?.[0];
}
