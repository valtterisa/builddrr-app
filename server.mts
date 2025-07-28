import next from "next";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { parse } from "url";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

// Cache for proxy middleware instances to prevent memory leaks
const proxyCache = new Map<string, any>();

// Cache cleanup interval (every 5 minutes)
const CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000;
const CACHE_MAX_AGE = 10 * 60 * 1000; // 10 minutes

// Track when proxies were last used
const proxyLastUsed = new Map<string, number>();

function getProxy(appName: string) {
  const now = Date.now();

  // Check if we already have a proxy for this app
  if (proxyCache.has(appName)) {
    proxyLastUsed.set(appName, now);
    return proxyCache.get(appName);
  }

  // Create new proxy middleware
  const proxy = createProxyMiddleware({
    target: `https://${appName}.fly.dev`,
    changeOrigin: true,
    ws: true, // Let http-proxy-middleware handle WebSocket upgrades (not needed if not using HMR)
    pathRewrite: {
      [`^/api/preview/${appName}`]: "",
    },
  });

  // Cache the proxy for reuse
  proxyCache.set(appName, proxy);
  proxyLastUsed.set(appName, now);

  return proxy;
}

// Cleanup old proxies periodically
setInterval(() => {
  const now = Date.now();
  const toDelete: string[] = [];

  for (const [appName, lastUsed] of proxyLastUsed.entries()) {
    if (now - lastUsed > CACHE_MAX_AGE) {
      toDelete.push(appName);
    }
  }

  for (const appName of toDelete) {
    proxyCache.delete(appName);
    proxyLastUsed.delete(appName);
  }
}, CACHE_CLEANUP_INTERVAL);

nextApp.prepare().then(() => {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    let url = req.url || "";

    // Dynamically rewrite asset and HMR requests if Referer is /api/preview/{appName}
    if (
      (url.startsWith("/_next/") || url === "/favicon.ico") &&
      req.headers.referer
    ) {
      const referer = req.headers.referer;
      const refererPath = parse(referer).pathname;
      const match =
        refererPath && refererPath.match(/^\/api\/preview\/([^\/]+)/);
      if (match) {
        const appName = match[1];
        req.url = `/api/preview/${appName}${url}`;
        url = req.url;
      }
    }

    // Proxy /api/preview/:appName/*
    const previewMatch = url.match(/^\/api\/preview\/([^\/]+)(.*)$/);
    if (previewMatch) {
      const appName = previewMatch[1];
      try {
        return getProxy(appName)(req, res, (err: any) => {
          if (err) {
            console.error(`[PROXY] Error proxying to ${appName}:`, err);
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end("Proxy error");
          }
        });
      } catch (error) {
        console.error(`[PROXY] Failed to proxy to ${appName}:`, error);
        res.writeHead(502, { "Content-Type": "text/plain" });
        res.end("Proxy setup error");
      }
    }
    return handle(req, res, parse(url, true));
  });

  server.listen(port, () => {
    console.log(`> Server ready on http://localhost:${port}`);
  });
});
