import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { Strategy as GitHubStrategy } from "passport-github2";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { pool } from "./db";        // ← import the pool you configured

export function setupAuth(app: Express) {
  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool, 
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Local strategy
  passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
  }, async (email, password, done) => {
    try {
      const user = await storage.authenticateUser(email, password);
      if (!user) {
        return done(null, false, { message: "Invalid email or password" });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Facebook strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    console.log('Facebook OAuth configured with App ID:', process.env.FACEBOOK_APP_ID);
    console.log('Facebook callback URL:', process.env.NODE_ENV === "production" ? "https://postmeai.com/auth/facebook/callback" : "http://localhost:5000/auth/facebook/callback");
    
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.NODE_ENV === "production" ? "https://postmeai.com/auth/facebook/callback" : "http://localhost:5000/auth/facebook/callback",
      profileFields: ["id", "emails", "name", "picture.type(large)"]
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const userId = `facebook_${profile.id}`;
        const user = await storage.upsertUser({
          id: userId,
          email: profile.emails?.[0]?.value || null,
          firstName: profile.name?.givenName || null,
          lastName: profile.name?.familyName || null,
          profileImageUrl: profile.photos?.[0]?.value || null,
          authProvider: "facebook",
          providerId: profile.id,
          lastAuthMethod: "facebook",
        });
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  // Google strategy
  console.log('Google OAuth configured with Client ID:', process.env.GOOGLE_CLIENT_ID);
  console.log('Callback URL:', process.env.CALLBACK_URL);
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    //console.log('Google OAuth configured with Client ID:', process.env.GOOGLE_CLIENT_ID);
    //console.log('Callback URL:', process.env.NODE_ENV === "production" ? "https://postmeai.com/auth/google/callback" : "http://localhost:5000/auth/google/callback");
    //console.log('Callback URL:', process.env.CALLBACK_URL);

    passport.use(new GoogleStrategy({  ///"http://localhost:5000/auth/google/callback"
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      //callbackURL: process.env.NODE_ENV === "production" ? "https://postmeai.com/auth/google/callback" : "http://localhost:5000/auth/google/callback"
      callbackURL: process.env.CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const userId = `google_${profile.id}`;
        const user = await storage.upsertUser({
          id: userId,
          email: profile.emails?.[0]?.value || null,
          firstName: profile.name?.givenName || null,
          lastName: profile.name?.familyName || null,
          profileImageUrl: profile.photos?.[0]?.value || null,
          authProvider: "google",
          providerId: profile.id,
          lastAuthMethod: "google",
        });
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  // LinkedIn strategy
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    console.log('LinkedIn OAuth configured with Client ID:', process.env.LINKEDIN_CLIENT_ID);
    console.log('LinkedIn callback URL:', process.env.NODE_ENV === "production" ? "https://postmeai.com/auth/linkedin/callback" : "http://localhost:5000/auth/linkedin/callback");
    
    passport.use(new LinkedInStrategy({
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === "production" ? "https://postmeai.com/auth/linkedin/callback" : "http://localhost:5000/auth/linkedin/callback",
      scope: ["openid", "profile", "email"],
      state: true
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('LinkedIn profile received:', JSON.stringify(profile, null, 2));
        
        const userId = `linkedin_${profile.id}`;
        const user = await storage.upsertUser({
          id: userId,
          email: profile.emails?.[0]?.value || profile.email || null,
          firstName: profile.name?.givenName || profile.given_name || null,
          lastName: profile.name?.familyName || profile.family_name || null,
          profileImageUrl: profile.photos?.[0]?.value || profile.picture || null,
          authProvider: "linkedin",
          providerId: profile.id,
          lastAuthMethod: "linkedin",
        });
        
        console.log('LinkedIn user created/updated:', user);
        return done(null, user);
      } catch (error) {
        console.error('LinkedIn authentication error:', error);
        return done(error);
      }
    }));
  }

  // GitHub strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const userId = `github_${profile.id}`;
        const user = await storage.upsertUser({
          id: userId,
          email: profile.emails?.[0]?.value || null,
          firstName: profile.displayName?.split(" ")[0] || null,
          lastName: profile.displayName?.split(" ").slice(1).join(" ") || null,
          profileImageUrl: profile.photos?.[0]?.value || null,
          authProvider: "github",
          providerId: profile.id,
          lastAuthMethod: "github",
        });
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

export const optionalAuth: RequestHandler = (req, res, next) => {
  // Always continue, but req.user will be undefined if not authenticated
  next();
};