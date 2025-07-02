const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const port = parseInt(process.env.PORT || "8000", 10);
const server = express();

// Increase the max listeners to prevent warnings
require("events").EventEmitter.defaultMaxListeners = 20;

// Serve static files from public
server.use(express.static(path.join(__dirname, "public")));

// Log all requests
server.use((req: any, res: any, next: any) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Simple proxy for /api/preview/:appName/*
server.use("/api/preview/:appName", (req: any, res: any, next: any) => {
  const appName = req.params.appName;

  console.log(`=== PROXY REQUEST ===`);
  console.log(`App Name: ${appName}`);
  console.log(`Original URL: ${req.originalUrl}`);
  console.log(`Target: https://${appName}.fly.dev${req.url}`);

  // Create and apply proxy
  const proxy = createProxyMiddleware({
    target: `https://${appName}.fly.dev`,
    changeOrigin: true,
    ws: true,
    pathRewrite: (path: any, req: any) => {
      // Remove /api/preview/appName from the path
      const newPath = path.replace(`/api/preview/${appName}`, "");
      console.log(`→ Path rewrite: ${path} -> ${newPath}`);
      return newPath;
    },
    onProxyReq: (proxyReq: any, req: any, res: any) => {
      console.log(
        `→ Proxying ${req.method} to https://${appName}.fly.dev${req.url}`
      );
    },
    onProxyReqWs: (proxyReq: any, req: any, socket: any) => {
      console.log(`→ WebSocket proxying to wss://${appName}.fly.dev${req.url}`);
    },
    onError: (err: any, req: any, res: any) => {
      console.error("Proxy error:", err.message);
      if (res && res.writeHead) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Proxy error: " + err.message);
      }
    },
  });

  proxy(req, res, next);
});

// Catch common Next.js assets and redirect to proxy
server.use((req: any, res: any, next: any) => {
  const url = req.url;

  // Check if this looks like a Next.js asset request
  if (url.startsWith("/_next/") || url.startsWith("/favicon.ico")) {
    // For now, assume 'plain-nextjs-app' - in real use you'd determine this from context
    const redirectUrl = `/api/preview/plain-nextjs-app${url}`;
    console.log(`→ Redirecting ${url} to ${redirectUrl}`);
    return res.redirect(redirectUrl);
  }

  // All other requests: 404
  console.log(`404: ${req.url}`);
  res.status(404).send("Not found");
});

// Note: WebSocket upgrades are handled in the 'upgrade' event below

const httpServer = server.listen(port, (err: any) => {
  if (err) throw err;
  console.log(`> Proxy server ready on http://localhost:${port}`);
  console.log(
    `> Use /api/preview/<appName>/<path> to proxy to https://<appName>.fly.dev/<path>`
  );
});

// Enable WebSocket support
httpServer.on("upgrade", (request: any, socket: any, head: any) => {
  console.log("=== WEBSOCKET UPGRADE ===");
  console.log("WebSocket upgrade request:", request.url);
  console.log("WebSocket headers:", request.headers);

  // Handle both /api/preview/appName/_next/webpack-hmr and /_next/webpack-hmr
  if (
    request.url?.startsWith("/api/preview/") ||
    request.url?.startsWith("/_next/")
  ) {
    let appName, restPath;

    if (request.url.startsWith("/api/preview/")) {
      const urlParts = request.url.split("/");
      appName = urlParts[3]; // /api/preview/appName/path
      restPath = "/" + urlParts.slice(4).join("/");
    } else {
      // Direct /_next/ request - assume plain-nextjs-app
      appName = "plain-nextjs-app";
      restPath = request.url;
    }

    console.log(`→ WebSocket upgrade for app: ${appName}, path: ${restPath}`);

    const wsProxy = createProxyMiddleware({
      target: `https://${appName}.fly.dev`,
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        [`^/api/preview/${appName}`]: "",
        "^/_next/": "/_next/", // Direct _next paths should stay as-is
      },
      onProxyReqWs: (proxyReq: any, req: any, socket: any) => {
        console.log(
          `→ WebSocket connected to wss://${appName}.fly.dev${restPath}`
        );
      },
      onError: (err: any) => {
        console.error("WebSocket proxy error:", err.message);
      },
    });

    try {
      if (wsProxy.upgrade) {
        wsProxy.upgrade(request, socket, head);
        console.log(`→ WebSocket upgrade successful for ${request.url}`);
      }
    } catch (error) {
      console.error("WebSocket upgrade error:", error);
      socket.destroy();
    }
  } else {
    console.log("→ WebSocket upgrade rejected (not a proxy request)");
    socket.destroy();
  }
});
