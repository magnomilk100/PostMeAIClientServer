// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as OIDCStrategy } from "passport-openidconnect";
import { Strategy as GitHubStrategy } from "passport-github2";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import cors from "cors";

import { storage } from "./storage";
import { pool } from "./db";
import dotenv from "dotenv";
dotenv.config();
import { authConfig, createAuthMiddleware } from "./authConfig";

export function setupAuth(app: Express) {
  // Skip auth setup if authentication is disabled
  if (!authConfig.enabled) {
    console.log('🔓 Authentication is DISABLED - All users will be anonymous');
    return;
  }

  console.log('🔐 Authentication is ENABLED');

  // ─── 1) CORS ───────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5000",
      credentials: true,
    })
  );

  // ─── 2) Sessions ────────────────────────────────────────────────────────
// Trust the first proxy (Heroku's reverse proxy)
app.set('trust proxy', 1);

// Session store setup
const pgStore = connectPg(session);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-this-in-prod",
    store: new pgStore({
      pool,
      tableName: "sessions",
      ttl: 7 * 24 * 60 * 60, // 7 days
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // secure only in prod
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);  
  // const pgStore = connectPg(session);
  // app.use(
  //   session({
  //     secret: process.env.SESSION_SECRET || "change-this-in-prod",
  //     store: new pgStore({ pool, tableName: "sessions", ttl: 7 * 24 * 60 * 60 }),
  //     resave: false,
  //     saveUninitialized: false,
  //     cookie: {
  //       httpOnly: true,
  //       secure: false,
  //       sameSite: "lax",
  //       maxAge: 7 * 24 * 60 * 60 * 1000,
  //     },
  //   })
  // );

 // secure: process.env.NODE_ENV === "production",
 // sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

  // ─── 3) Passport init ───────────────────────────────────────────────────
  app.use(passport.initialize());
  app.use(passport.session());

  // Middleware to handle stale sessions
  app.use((req, res, next) => {
    // If passport attempted to deserialize but couldn't find the user
    if (req.session && req.session.passport && req.session.passport.user && !req.user) {
      // Destroy the invalid session
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying stale session:', err);
        }
      });
    }
    next();
  });

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        // User was deleted from database but session still exists
        // Return null to invalidate session without throwing error
        done(null, null);
        return;
      }
      done(null, user);
    } catch (error) {
      // Handle any other errors gracefully
      console.error('Session deserialization error:', error);
      done(null, null); // Invalidate session instead of throwing error
    }
  });

  // ─── 4) Local Strategy ──────────────────────────────────────────────────
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await storage.authenticateUser(email, password);
          return done(null, user || false, user ? undefined : { message: "Invalid credentials" });
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );


}

// ─── 7) Route-level middleware ───────────────────────────────────────────
export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Authentication required" });
};
export const optionalAuth: RequestHandler = (_req, _res, next) => next();