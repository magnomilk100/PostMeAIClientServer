// server/vite.ts
import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";

// simple logger that works in prod or dev
export function log(message: string, source = "express") {
  const ts = new Date().toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true
  });
  console.log(`${ts} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // 1) dynamically import Vite itself
  const { createServer: createViteServer, createLogger } = await import("vite");
  const viteLogger = createLogger();

  // 2) dynamically load the React plugin
  const { default: reactPlugin } = await import("@vitejs/plugin-react");

  // 3) optionally load the Replit runtime‐error overlay (only if installed)
  let runtimePlugin;
  try {
    const { default: overlay } = await import("@replit/vite-plugin-runtime-error-modal");
    runtimePlugin = overlay();
  } catch {
    // devDependencies might not include this—no problem
  }

  // 4) optionally load the Cartographer plugin in REPL/dev
  let cartographerPlugin;
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID) {
    try {
      const { cartographer } = await import("@replit/vite-plugin-cartographer");
      cartographerPlugin = cartographer();
    } catch {
      // likewise optional
    }
  }

  // 5) assemble your Vite config inline
  const rootDir = path.resolve(import.meta.dirname, "..", "client");
  const sharedDir = path.resolve(import.meta.dirname, "..", "shared");
  const assetsDir = path.resolve(import.meta.dirname, "..", "attached_assets");
  const publicOut = path.resolve(import.meta.dirname, "..", "dist", "public");

  const vite = await createViteServer({
    root: rootDir,
    configFile: false,
    plugins: [
      reactPlugin(),
      runtimePlugin,
      cartographerPlugin
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.join(rootDir, "src"),
        "@shared": sharedDir,
        "@assets": assetsDir,
      }
    },
    build: {
      outDir: publicOut,
      emptyOutDir: true
    },
    server: {
      fs: { strict: true, deny: ["**/.*"] },
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true
    },
    appType: "custom",
    customLogger: {
      ...viteLogger,
      error: (msg, opts) => {
        viteLogger.error(msg, opts);
        process.exit(1);
      }
    }
  });

  // 6) hook into Vite’s connect-style middleware
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const indexHtml = path.join(rootDir, "index.html");
      let template = await fs.promises.readFile(indexHtml, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

// production‐only static serve, no Vite at all
export function serveStatic(app: Express) {
  const publicOut = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(publicOut)) {
    throw new Error(`Missing build dir: ${publicOut}`);
  }
  app.use(express.static(publicOut));
  app.use("*", (_req, res) => {
    res.sendFile(path.join(publicOut, "index.html"));
  });
}
