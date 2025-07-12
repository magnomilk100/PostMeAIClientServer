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

export function setupAuth(app: Express) {
  // ─── 1) CORS ───────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5000",
      credentials: true,
    })
  );

  // ─── 2) Sessions ────────────────────────────────────────────────────────
  const pgStore = connectPg(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "change-this-in-prod",
      store: new pgStore({ pool, tableName: "sessions", ttl: 7 * 24 * 60 * 60 }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    })
  );

  // ─── 3) Passport init ───────────────────────────────────────────────────
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const u = await storage.getUser(id);
      done(null, u);
    } catch (e) {
      done(e as Error, null);
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

  // ─── 5) Facebook, Google, GitHub (unchanged) ────────────────────────────
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    const FB_CB = process.env.FACEBOOK_CALLBACK_URL;
      //process.env.NODE_ENV === "production"
      //  ? "https://postmeai.com/auth/facebook/callback"
      //  : "http://localhost:5000/auth/facebook/callback";
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID!,
          clientSecret: process.env.FACEBOOK_APP_SECRET!,
          callbackURL: FB_CB,
          profileFields: ["id", "emails", "name", "picture.type(large)"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const userId = `facebook_${profile.id}`;
            const u = await storage.upsertUser({
              id: userId,
              email: profile.emails?.[0]?.value || null,
              firstName: profile.name?.givenName || null,
              lastName: profile.name?.familyName || null,
              profileImageUrl: profile.photos?.[0]?.value || null,
              authProvider: "facebook",
              providerId: profile.id,
              lastAuthMethod: "facebook",
            });
            done(null, u);
          } catch (e) {
            done(e as Error);
          }
        }
      )
    );
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.CALLBACK_URL!,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const userId = `google_${profile.id}`;
            const u = await storage.upsertUser({
              id: userId,
              email: profile.emails?.[0]?.value || null,
              firstName: profile.name?.givenName || null,
              lastName: profile.name?.familyName || null,
              profileImageUrl: profile.photos?.[0]?.value || null,
              authProvider: "google",
              providerId: profile.id,
              lastAuthMethod: "google",
            });
            done(null, u);
          } catch (e) {
            done(e as Error);
          }
        }
      )
    );
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: "/auth/github/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const userId = `github_${profile.id}`;
            const u = await storage.upsertUser({
              id: userId,
              email: profile.emails?.[0]?.value || null,
              firstName: profile.displayName?.split(" ")[0] || null,
              lastName: profile.displayName?.split(" ").slice(1).join(" ") || null,
              profileImageUrl: profile.photos?.[0]?.value || null,
              authProvider: "github",
              providerId: profile.id,
              lastAuthMethod: "github",
            });
            done(null, u);
          } catch (e) {
            done(e as Error);
          }
        }
      )
    );
  }

  // ─── 6) LinkedIn OIDC Strategy ──────────────────────────────────────────
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    const LN_CB = process.env.LINKEDIN_CALLBACK_URL;
      //process.env.NODE_ENV === "production"
      //  ? "https://postmeai.com/auth/linkedin/callback"
      //  : "http://localhost:5000/auth/linkedin/callback";

    passport.use(
      "linkedin-oidc",
      new OIDCStrategy(
        {
          issuer: "https://www.linkedin.com/oauth",        // ← must match the token's `iss`
          authorizationURL: "https://www.linkedin.com/oauth/v2/authorization",
          tokenURL: "https://www.linkedin.com/oauth/v2/accessToken",
          userInfoURL: "https://api.linkedin.com/v2/userinfo",
          clientID: process.env.LINKEDIN_CLIENT_ID!,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
          callbackURL: LN_CB,
          scope: ["openid", "profile", "email"],
          state: true,
        },
        // note the exact signature: issuer, claims, profile, accessToken, refreshToken, params, done
        async function (
          issuer: string,
          claims: any,
          profile: any,
          accessToken: string,
          refreshToken: string,
          params: any,
          done: (err: Error | null, user?: any) => void
        ) {
          console.log("[LinkedIn Strat] issuer=", issuer);
          console.log("[LinkedIn Strat] claims =", claims);
          console.log("[LinkedIn Strat] raw profile =", profile);

          try {
            // LinkedIn may fold everything into `claims` rather than a separate `profile` object
            const data = profile || claims;

            // grab id, name, email
            const providerId = data.id || claims.sub;
            const firstName =
              data.localizedFirstName ||
              data.name?.givenName ||
              data.given_name ||
              null;
            const lastName =
              data.localizedLastName ||
              data.name?.familyName ||
              data.family_name ||
              null;
            const email = data.emails?.[0]?.value || data.email || null;

            const userId = `linkedin_${providerId}`;
            const u = await storage.upsertUser({
              id: userId,
              email,
              firstName,
              lastName,
              profileImageUrl:
                data.profilePicture?.["displayImage~"]?.elements?.[0]?.identifiers?.[0]
                  .identifier || null,
              authProvider: "linkedin",
              providerId,
              lastAuthMethod: "linkedin",
            });

            console.log("[LinkedIn Strat] upsertUser OK", u.id);
            done(null, u);
          } catch (err) {
            console.error("[LinkedIn Strat] verify error:", err);
            done(err as Error);
          }
        }
      )
    );
  }
}

// ─── 7) Route-level middleware ───────────────────────────────────────────
export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Authentication required" });
};
export const optionalAuth: RequestHandler = (_req, _res, next) => next();
