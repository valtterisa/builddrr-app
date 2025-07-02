import next from "next";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { parse } from "url";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

function getProxy(appName: string) {
  return createProxyMiddleware({
    target: `https://${appName}.fly.dev`,
    changeOrigin: true,
    ws: true, // Let http-proxy-middleware handle WebSocket upgrades (not needed if not using HMR)
    pathRewrite: {
      [`^/api/preview/${appName}`]: "",
    },
  });
}

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
      console.log("REFERRER PATH:", refererPath);
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
      return getProxy(appName)(req, res, () => {});
    }
    // All other requests: let Next.js handle (for static, SSR, etc)
    return handle(req, res, parse(url, true));
  });

  // WebSocket upgrade handling removed as it's not necessary if Fly.io dev mode is handling updates

  server.listen(port, () => {
    console.log(`> Server ready on http://localhost:${port}`);
    console.log(
      `> Use /api/preview/<appName>/<path> to proxy to https://<appName>.fly.dev/<path>`
    );
  });
});
