import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";
import { setupAuth } from "./auth";
import cors from "cors";

dotenv.config();
const app = express();

// Enable trust proxy for Heroku, ADDED by Magno according to CHATGPT
app.set("trust proxy", 1);
// before your routes, add: by Magno CHATGPT too
app.use(cors({
  //origin: "https://www.postme-ai-frontend-2d76778b4014.herokuapp.com", 
  origin: process.env.POSTMEAI_FE_URL,   
  credentials: true,
}));


app.use(express.json({ limit: '10mb' })); // Increase limit for base64 image uploads
app.use(express.urlencoded({ extended: false, limit: '10mb' }));


// ────────────────────────────────────────────────────────────────────────────────
// Initialize authentication (Passport + sessions + all strategies)
// ────────────────────────────────────────────────────────────────────────────────
setupAuth(app);


// Add security headers but allow OAuth connections
app.use((req, res, next) => {
  // Allow OAuth connections to Google, LinkedIn, and Facebook
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.linkedin.com https://api.linkedin.com https://www.facebook.com; " +
    "frame-src 'self' https://accounts.google.com https://www.linkedin.com https://www.facebook.com; " +
    "form-action 'self' https://accounts.google.com https://www.linkedin.com https://www.facebook.com;"
  );
  
  // Allow OAuth redirects
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = Number(process.env.PORT) || 5000;

  server.listen(
    { port, host: "0.0.0.0", reusePort: true },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
