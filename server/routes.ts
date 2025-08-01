import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertGeneratedContentSchema, insertPublishedPostSchema, insertTemplateSchema, insertImageSchema, type InsertImage, users, userWorkspaces, userOrganizations, workspaces, workspaceRoles, userWorkspaceRoles } from "@shared/schema";
import { PaymentGatewayFactory, type PaymentData, validateCardNumber, validateCVV, validateExpiryDate } from "./paymentGateways";
import { z } from "zod";
import { setupAuth, requireAuth, optionalAuth } from "./auth";
import passport from "passport";
import multer from "multer";
import { generateVerificationToken, sendVerificationEmail, sendWelcomeEmail, generatePasswordResetToken, sendPasswordResetEmail, sendUserInvitationEmail as sendInvitationEmail } from "./email";
import { insertUserInvitationSchema } from "@shared/schema";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

import dotenv from "dotenv";
dotenv.config();


// Extend Express session to include invitationKey
declare module 'express-session' {
  interface SessionData {
    invitationKey?: string;
  }
}

// Local authentication schema for registration
const localAuthSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Enhanced multi-tenancy middleware for enforcing organization and workspace isolation
// Following best practices: ALL API requests are scoped by organization_id and workspace_id
function enforceMultiTenancy(req: any): { organizationId: number; workspaceId: number } {
  // Always enforce organization/workspace scoping - never allow implicit cross-organization queries
  if (!req.user?.currentWorkspaceId || !req.user?.currentOrganizationId) {
    if (req.user?.id === 'anonymous') {
      return { organizationId: 1, workspaceId: 2 }; // Default organization and workspace for anonymous users
    }
    throw new Error("No organization/workspace context available");
  }
  
  // Additional validation: ensure workspace belongs to the current organization
  if (req.user.currentWorkspaceId && req.user.currentOrganizationId) {
    // This validation should be done at the database level for security
    // The middleware ensures we never allow cross-organization access
    return { 
      organizationId: req.user.currentOrganizationId, 
      workspaceId: req.user.currentWorkspaceId 
    };
  }
  
  throw new Error("Invalid organization/workspace context");
}

// Validate that user has access to the specified organization and workspace
async function validateTenantAccess(req: any, organizationId: number, workspaceId: number): Promise<boolean> {
  // Check if user has access to the organization
  const userOrganization = await storage.getUserOrganization(req.user.id, organizationId);
  if (!userOrganization) {
    return false;
  }
  
  // Check if user has access to the workspace
  const userWorkspace = await storage.getUserWorkspaceMembership(req.user.id, workspaceId);
  if (!userWorkspace) {
    return false;
  }
  
  // Ensure workspace belongs to the organization
  const workspace = await storage.getWorkspace(workspaceId);
  if (!workspace || workspace.organizationId !== organizationId) {
    return false;
  }
  
  return true;
}

// Helper function to get current organization and workspace context for authenticated user
function getCurrentContext(req: any): { organizationId: number; workspaceId: number } {
  return enforceMultiTenancy(req);
}

// Legacy helper functions for backward compatibility
function getCurrentWorkspaceId(req: any): number {
  return getCurrentContext(req).workspaceId;
}

function getCurrentOrganizationId(req: any): number {
  return getCurrentContext(req).organizationId;
}

// Helper function to check if user has admin access (organization owner OR workspace administrator)
async function hasAdminAccess(userId: string, organizationId: number): Promise<boolean> {
  try {
    console.log('🔍 hasAdminAccess DEBUG - UserId:', userId, 'OrgId:', organizationId);
    
    // Check if user is organization owner
    const orgRole = await storage.getUserOrganization(userId, organizationId);
    console.log('🔍 hasAdminAccess - OrgRole:', orgRole);
    if (orgRole && orgRole.role === 'owner' && orgRole.isActive) {
      console.log('🔍 hasAdminAccess - Organization owner detected, granting access');
      return true;
    }

    // Check if user has administrator role in any workspace within this organization
    const workspaceRoles = await storage.getUserWorkspaceRoles(userId, organizationId);
    console.log('🔍 hasAdminAccess - WorkspaceRoles:', workspaceRoles);
    
    const hasAdministratorRole = workspaceRoles.some(role => {
      console.log('🔍 hasAdminAccess - Checking role:', JSON.stringify(role, null, 2));
      // Handle different possible structures based on how getUserWorkspaceRoles is called:
      // 1. Direct role string in role.role
      // 2. Nested object in role.role.name  
      // 3. Role might be directly available as a string field
      let roleStr = '';
      
      if (typeof role.role === 'string') {
        roleStr = role.role;
        console.log('🔍 hasAdminAccess - Found role.role as string:', roleStr);
      } else if (role.role && typeof role.role === 'object' && role.role.name) {
        roleStr = role.role.name;
        console.log('🔍 hasAdminAccess - Found role.role.name:', roleStr);
      } else if (role.roleName) {
        roleStr = role.roleName;
        console.log('🔍 hasAdminAccess - Found role.roleName:', roleStr);
      } else if (role.name) {
        roleStr = role.name;
        console.log('🔍 hasAdminAccess - Found role.name:', roleStr);
      } else {
        console.log('🔍 hasAdminAccess - No recognizable role field found in:', Object.keys(role));
      }
      
      const isActive = role.isActive !== false; // Default to true if undefined
      console.log('🔍 hasAdminAccess - Role string extracted:', roleStr, 'IsActive:', isActive, 'Is Administrator?:', roleStr === 'administrator');
      return roleStr === 'administrator' && isActive;
    });

    console.log('🔍 hasAdminAccess - Has administrator role:', hasAdministratorRole);
    return hasAdministratorRole;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "tr", name: "Turkish" },
  { code: "pl", name: "Polish" },
  { code: "nl", name: "Dutch" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "no", name: "Norwegian" },
  { code: "fi", name: "Finnish" },
  { code: "th", name: "Thai" }
];

const SOCIAL_PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: "fab fa-facebook-f", color: "blue-600" },
  { id: "instagram", name: "Instagram", icon: "fab fa-instagram", color: "pink-500" },
  { id: "linkedin", name: "LinkedIn", icon: "fab fa-linkedin-in", color: "blue-700" },
  { id: "tiktok", name: "TikTok", icon: "fab fa-tiktok", color: "black" },
  { id: "youtube", name: "YouTube", icon: "fab fa-youtube", color: "red-600" },
  { id: "discord", name: "Discord", icon: "fab fa-discord", color: "indigo-600" },
  { id: "telegram", name: "Telegram", icon: "fab fa-telegram", color: "blue-500" }
];

function generateAIContent(subject: string, language: string = "en") {
  // Mock AI content generation based on subject
  // In production, this would interface with OpenAI, Claude, or other LLM APIs
  
  const subjectLower = subject.toLowerCase();
  
  // Generate contextual titles based on subject keywords
  let title = "";
  let content = "";
  
  if (subjectLower.includes("business") || subjectLower.includes("company") || subjectLower.includes("startup")) {
    title = "🚀 Transforming Business Success Through Innovation";
    content = `${subject}\n\nIn today's rapidly evolving business landscape, innovation isn't just an advantage—it's a necessity. Companies that embrace change and leverage new opportunities are the ones that thrive.\n\nKey insights:\n• Strategic planning drives sustainable growth\n• Customer-focused solutions create lasting value\n• Technology integration enhances operational efficiency\n\nWhat's your next strategic move? Share your thoughts below! 💼✨`;
  } else if (subjectLower.includes("tech") || subjectLower.includes("technology") || subjectLower.includes("AI") || subjectLower.includes("software")) {
    title = "💻 The Future of Technology is Here";
    content = `${subject}\n\nTechnology continues to reshape our world in unprecedented ways. From artificial intelligence to blockchain, we're witnessing a revolution that's transforming how we work, communicate, and live.\n\nKey trends to watch:\n• AI integration in everyday applications\n• Enhanced cybersecurity measures\n• Sustainable tech solutions\n• User-centric design approaches\n\nStay ahead of the curve! What tech innovations excite you most? #Technology #Innovation`;
  } else if (subjectLower.includes("social") || subjectLower.includes("community") || subjectLower.includes("people")) {
    title = "🤝 Building Stronger Communities Together";
    content = `${subject}\n\nCommunity is at the heart of everything we do. When people come together with shared values and common goals, incredible things happen.\n\nThe power of community:\n• Shared knowledge accelerates learning\n• Mutual support creates resilience\n• Diverse perspectives drive innovation\n• Collective action creates meaningful change\n\nHow are you contributing to your community? Let's inspire each other! 🌟`;
  } else if (subjectLower.includes("product") || subjectLower.includes("launch") || subjectLower.includes("announcement")) {
    title = "🎉 Exciting Product Updates You Need to Know";
    content = `${subject}\n\nWe're thrilled to share some exciting developments that will enhance your experience and deliver even more value.\n\nWhat's new:\n• Enhanced user interface for better navigation\n• Improved performance and reliability\n• New features based on your feedback\n• Better integration capabilities\n\nYour feedback drives our innovation. What would you like to see next? Drop your suggestions below! 🚀`;
  } else if (subjectLower.includes("tips") || subjectLower.includes("advice") || subjectLower.includes("guide")) {
    title = "💡 Pro Tips That Will Transform Your Approach";
    content = `${subject}\n\nSuccess often comes down to knowing the right strategies and applying them consistently. Here are some game-changing insights that can make a real difference.\n\nKey takeaways:\n• Start with clear, measurable goals\n• Focus on progress, not perfection\n• Learn from both successes and setbacks\n• Build systems that support long-term growth\n\nWhich tip resonates most with you? Share your experiences in the comments! 📈`;
  } else {
    // Generic AI-generated content
    title = "✨ Insights Worth Sharing";
    content = `${subject}\n\nEvery topic has layers worth exploring, and today we're diving deep into something that matters. Whether you're looking for fresh perspectives or actionable insights, there's always more to discover.\n\nThought-provoking points:\n• Context shapes understanding\n• Different viewpoints enrich discussions\n• Small changes can lead to big impacts\n• Continuous learning opens new possibilities\n\nWhat's your take on this? Join the conversation and share your thoughts! 🌟`;
  }
  
  // Adjust content based on language (basic localization)
  if (language === "es") {
    title = title.replace("Insights Worth Sharing", "Ideas Que Valen la Pena Compartir");
    content = content.replace("What's your take on this?", "¿Cuál es tu opinión sobre esto?");
  } else if (language === "fr") {
    title = title.replace("Insights Worth Sharing", "Des Idées à Partager");
    content = content.replace("What's your take on this?", "Quel est votre avis sur cela?");
  }
  
  // Generate relevant hashtags based on subject
  let hashtags: string[] = [];
  
  if (subjectLower.includes("business") || subjectLower.includes("company") || subjectLower.includes("startup")) {
    hashtags = ["business", "entrepreneurship", "innovation", "success", "growth"];
  } else if (subjectLower.includes("tech") || subjectLower.includes("technology") || subjectLower.includes("AI") || subjectLower.includes("software")) {
    hashtags = ["technology", "innovation", "AI", "digital", "future"];
  } else if (subjectLower.includes("social") || subjectLower.includes("community") || subjectLower.includes("people")) {
    hashtags = ["community", "social", "networking", "collaboration", "teamwork"];
  } else if (subjectLower.includes("product") || subjectLower.includes("launch") || subjectLower.includes("announcement")) {
    hashtags = ["product", "launch", "announcement", "innovation", "exciting"];
  } else if (subjectLower.includes("marketing") || subjectLower.includes("brand")) {
    hashtags = ["marketing", "branding", "digital", "content", "strategy"];
  } else if (subjectLower.includes("education") || subjectLower.includes("learning") || subjectLower.includes("training")) {
    hashtags = ["education", "learning", "training", "knowledge", "development"];
  } else if (subjectLower.includes("health") || subjectLower.includes("wellness") || subjectLower.includes("fitness")) {
    hashtags = ["health", "wellness", "fitness", "lifestyle", "mindfulness"];
  } else {
    // Default hashtags for general content
    hashtags = ["inspiration", "motivation", "success", "growth", "mindset"];
  }

  return {
    title: title,
    content: content,
    hashtags: hashtags
  };
}

function generateMockImageBase64(description: string): string {
  // Generate a simple colored rectangle as a placeholder image
  // In production, this would be replaced with actual AI image generation
  
  // Create a minimal PNG image in base64 (1x1 pixel purple square)
  // This is a valid PNG file that can be displayed in browsers
  const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
  
  return pngBase64;
}

function generateMockContent(subject: string, platform?: string) {
  const baseTitle = "🚀 Unlock Your Creative Potential Today!";
  const baseBody = "Turn your wildest ideas into viral content that captivates your audience. Whether you're sharing insights, telling stories, or showcasing your expertise, every post is an opportunity to connect and inspire. What's your next big idea? 💡✨";
  
  if (!platform) {
    return { title: baseTitle, body: baseBody };
  }

  // Platform-specific variations
  const variations: Record<string, { title: string; body: string }> = {
    facebook: {
      title: baseTitle,
      body: "Turn your wildest ideas into viral content that captivates your audience. What's your next big idea? 💡✨"
    },
    instagram: {
      title: "🚀 Unlock Your Creative Potential!",
      body: "Turn ideas into viral content ✨ #creativity #content #viral"
    },
    linkedin: {
      title: "Unlock Your Creative Potential in Business",
      body: "Transform your professional ideas into engaging content that drives business results and builds your personal brand."
    },
    tiktok: {
      title: "🔥 Viral Content Ideas",
      body: "Turn ANY idea into viral content! 🚀✨ #viral #contentcreator #ideas"
    },
    youtube: {
      title: "How to Turn Ideas into Viral Content",
      body: "Complete guide to creating content that captures attention and drives engagement across all platforms."
    },
    discord: {
      title: "🚀 Creative Ideas Discussion",
      body: "Hey everyone! Let's discuss how to turn our wildest ideas into viral content. Drop your thoughts! 💭"
    },
    telegram: {
      title: "💡 Creative Content Ideas",
      body: "Transform your ideas into viral content! Share your creative process and inspire others."
    }
  };

  return variations[platform] || { title: baseTitle, body: baseBody };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to get the correct base URL
  const getBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      return 'https://postmeai.com';
    }
    if (process.env.REPLIT_DEV_DOMAIN) {
      return `https://${process.env.REPLIT_DEV_DOMAIN}`;
    }
    return 'http://localhost:5000';
  };
  // Setup authentication
  setupAuth(app);

  // Consent audit logging endpoint - placed before auth endpoints as it needs to be accessible without authentication
  app.post("/api/consent/log", async (req: any, res) => {
    try {
      const { 
        userId, 
        email,
        sessionId,
        consentAction,
        privacyPolicyAccepted,
        termsOfUseAccepted,
        mandatoryCookies,
        analyticsCookies,
        personalizationCookies,
        marketingCookies,
        consentData 
      } = req.body;

      if (!consentAction || (!userId && !email && !sessionId)) {
        return res.status(400).json({ 
          message: "Missing required fields: consentAction and at least one of (userId, email, sessionId)" 
        });
      }

      const auditEntry = await storage.logConsentDecision({
        userId: userId || null,
        email: email || null,
        sessionId: sessionId || null,
        consentAction,
        privacyPolicyAccepted: Boolean(privacyPolicyAccepted),
        termsOfUseAccepted: Boolean(termsOfUseAccepted),
        mandatoryCookies: Boolean(mandatoryCookies),
        analyticsCookies: Boolean(analyticsCookies),
        personalizationCookies: Boolean(personalizationCookies),
        marketingCookies: Boolean(marketingCookies),
        userAgent: req.get('User-Agent') || null,
        ipAddress: req.ip || req.connection.remoteAddress || null,
        consentTimestamp: new Date(),
        consentData: consentData || null
      });

      res.json({ success: true, id: auditEntry.id });
    } catch (error) {
      console.error("Error logging consent decision:", error);
      res.status(500).json({ message: "Failed to log consent decision" });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log('Registration request body:', req.body);
      const userData = localAuthSchema.parse(req.body);
      console.log('Parsed userData:', userData);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      const user = await storage.createLocalUser(userData);
      
      // Generate verification token and send email (non-blocking)
      const verificationToken = generateVerificationToken();
      
      // Set verification token in background
      storage.setVerificationToken(user.id, verificationToken).then(() => {
        console.log('Verification token set for user:', user.email);
        
        // Try to send email (non-blocking, won't fail registration if email fails)
        sendVerificationEmail(user.email, verificationToken)
          .then((emailSent) => {
            if (!emailSent) {
              console.error('Failed to send verification email to:', user.email);
            } else {
              console.log('Verification email sent successfully to:', user.email);
            }
          })
          .catch((error) => {
            console.error('Error sending verification email:', error);
          });
      }).catch((error) => {
        console.error('Error setting verification token:', error);
      });
      
      res.json({ 
        message: "Registration successful! Please check your email to verify your account.",
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, emailVerified: false }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: "Invalid registration data", error: error.message });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid email or password" });
      }
      
      // Check if user's email is verified
      if (!user.emailVerified) {
        return res.status(403).json({ 
          message: "Email not verified. Please check your email and click the verification link.",
          requiresVerification: true,
          userId: user.id 
        });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Login error:", loginErr);
          return res.status(500).json({ message: "Login error" });
        }

        // Ensure session is saved before responding
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ message: "Session save error" });
          }
          
          console.log("✅ User logged in successfully:", user.email, "Session ID:", req.sessionID);
          res.json({ user: req.user });
        });  
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout error" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", optionalAuth, (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      // Check if there's a session but no user (user was deleted)
      if (req.session && req.session.passport && req.session.passport.user) {
        // Session exists but user doesn't - destroy the session
        req.session.destroy((err) => {
          if (err) {
            console.error('Error destroying invalid session:', err);
          }
        });
      }
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Email verification routes
  app.get("/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #e74c3c;">Invalid Verification Link</h1>
              <p>The verification link is invalid or missing.</p>
              <a href="${process.env.NODE_ENV === 'production' ? 'https://postmeai.com' : 'http://localhost:5000'}" 
                 style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Go to PostMeAI
              </a>
            </body>
          </html>
        `);
      }
      
      const user = await storage.verifyEmail(token);
      
      if (!user) {
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #e74c3c;">Verification Failed</h1>
              <p>The verification link is invalid or has expired.</p>
              <p>Please request a new verification email.</p>
              <a href="${process.env.NODE_ENV === 'production' ? 'https://postmeai.com' : 'http://localhost:5000'}" 
                 style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Go to PostMeAI
              </a>
            </body>
          </html>
        `);
      }
      
      // Send welcome email
      await sendWelcomeEmail(user.email, user.firstName);
      
      // Auto-login the user after verification
      req.login(user, (err) => {
        if (err) {
          console.error('Auto-login error after verification:', err);
        }
      });
      
      res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #27ae60;">Email Verified Successfully!</h1>
            <p>Welcome to PostMeAI, ${user.firstName || 'User'}!</p>
            <p>Your account is now active and you can start creating amazing content.</p>
            <a href="${process.env.NODE_ENV === 'production' ? 'https://postmeai.com' : 'http://localhost:5000'}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Start Creating Content
            </a>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #e74c3c;">Verification Error</h1>
            <p>An error occurred during email verification.</p>
            <a href="${process.env.NODE_ENV === 'production' ? 'https://postmeai.com' : 'http://localhost:5000'}" 
               style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Go to PostMeAI
            </a>
          </body>
        </html>
      `);
    }
  });

  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }
      
      // Generate new verification token
      const verificationToken = generateVerificationToken();
      await storage.setVerificationToken(user.id, verificationToken);
      
      const emailSent = await sendVerificationEmail(user.email, verificationToken);
      
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification email" });
      }
      
      res.json({ message: "Verification email sent successfully" });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  });

  // Password reset routes
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      console.log('🔐 Password reset request received for:', email);
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      console.log('👤 User lookup result:', user ? 'User found' : 'User not found');
      
      if (!user) {
        console.log('❌ User not found, returning security message');
        // For security, don't reveal if email exists
        return res.json({ message: "If an account with that email exists, you'll receive password reset instructions." });
      }
      
      // Generate password reset token
      const resetToken = generatePasswordResetToken();
      console.log('🔑 Generated reset token:', resetToken);
      
      const tokenSet = await storage.setPasswordResetToken(email, resetToken);
      console.log('💾 Token set in storage:', tokenSet);
      
      if (!tokenSet) {
        console.log('❌ Failed to set token in storage');
        return res.status(500).json({ message: "Failed to generate reset token" });
      }
      
      console.log('📧 Attempting to send password reset email...');
      const emailSent = await sendPasswordResetEmail(email, resetToken);
      console.log('📧 Email sent result:', emailSent);
      
      if (!emailSent) {
        console.log('❌ Failed to send reset email');
        return res.status(500).json({ message: "Failed to send reset email" });
      }
      
      console.log('✅ Password reset process completed successfully');
      res.json({ message: "If an account with that email exists, you'll receive password reset instructions." });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      
      const resetSuccess = await storage.resetPassword(token, password);
      
      if (!resetSuccess) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Get user's organization role
  app.get("/api/user/organization-role", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      
      const organizationRole = await storage.getUserOrganization(userId, organizationId);
      if (!organizationRole) {
        return res.status(404).json({ message: "Organization role not found" });
      }
      
      res.json(organizationRole);
    } catch (error) {
      console.error('Get organization role error:', error);
      res.status(500).json({ message: "Failed to fetch organization role" });
    }
  });

  // Get user's workspace roles
  app.get("/api/user/workspace-roles", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      
      const workspaceRoles = await storage.getUserWorkspaceRoles(userId, organizationId);
      
      res.json(workspaceRoles || []);
    } catch (error) {
      console.error('Get workspace roles error:', error);
      res.status(500).json({ message: "Failed to fetch workspace roles" });
    }
  });

  // Email validation endpoint for invitations
  app.post("/api/admin/validate-email", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      
      // Check if user has admin privileges
      if (!(await hasAdminAccess(userId, organizationId))) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user already exists in the database
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          exists: true,
          message: "This email is already registered in the system",
          userInfo: {
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            accountStatus: existingUser.accountStatus,
            userRole: existingUser.userRole
          }
        });
      }

      // Check if there's already a pending invitation for this email
      const existingInvitations = await storage.getUserInvitationsByEmail(email, organizationId);
      const pendingInvitation = existingInvitations.find(inv => inv.status === 'pending' || inv.status === 'password_set');
      
      if (pendingInvitation) {
        return res.status(400).json({ 
          exists: true,
          message: "There is already a pending invitation for this email",
          invitationInfo: {
            status: pendingInvitation.status,
            invitedAt: pendingInvitation.invitedAt,
            expiresAt: pendingInvitation.expiresAt
          }
        });
      }

      // Email is available for invitation
      res.json({ 
        exists: false,
        message: "Email is available for invitation" 
      });
    } catch (error) {
      console.error('Email validation error:', error);
      res.status(500).json({ message: "Failed to validate email" });
    }
  });

  // Admin User Invitation API endpoints
  app.post("/api/admin/invite-user", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      
      // Check if user has admin privileges
      if (!(await hasAdminAccess(userId, organizationId))) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      const { email, expirationMinutes, workspaceRoles } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      if (!expirationMinutes || expirationMinutes < 10 || expirationMinutes > 60) {
        return res.status(400).json({ message: "Expiration time must be between 10 and 60 minutes" });
      }

      if (!workspaceRoles || !Array.isArray(workspaceRoles) || workspaceRoles.length === 0) {
        return res.status(400).json({ message: "At least one workspace role assignment is required" });
      }

      // Enhanced multi-tenancy validation for invitations      
      const inviter = await storage.getUser(userId);
      
      // Get all workspaces for the organization to validate workspace IDs
      const organizationWorkspaces = await storage.getWorkspacesByOrganizationId(organizationId);
      const validWorkspaceIds = organizationWorkspaces.map(w => w.id);
      
      // Validate all workspace IDs in the request
      for (const assignment of workspaceRoles) {
        if (!validWorkspaceIds.includes(assignment.workspaceId)) {
          return res.status(400).json({ message: `Invalid workspace ID: ${assignment.workspaceId}` });
        }
      }
      
      // Check if user is already a member of any workspace
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        // Check if user is already a member of any workspace in this organization
        for (const assignment of workspaceRoles) {
          const existingMembership = await storage.getUserWorkspaceMembership(existingUser.id, assignment.workspaceId);
          if (existingMembership) {
            const workspace = organizationWorkspaces.find(w => w.id === assignment.workspaceId);
            return res.status(400).json({ message: `User is already a member of workspace: ${workspace?.name}` });
          }
        }
      }

      // Check if invitation already exists for this email
      const existingInvitations = await storage.getUserInvitationsByUserId(userId, workspaceRoles[0].workspaceId);
      const existingInvitation = existingInvitations.find(inv => inv.email === email && inv.status !== 'expired');
      if (existingInvitation) {
        return res.status(400).json({ message: "Invitation already sent to this email" });
      }

      // Generate unique invitation key
      const invitationKey = crypto.randomBytes(32).toString('hex');

      // Create invitation record with enforced multi-tenancy context
      const invitation = await storage.createUserInvitation({
        organizationId,
        email,
        invitationKey,
        invitedByUserId: userId,
        expirationMinutes,
        status: 'pending',
        invitedAt: new Date(),
        expiresAt: new Date(Date.now() + expirationMinutes * 60 * 1000), // X minutes from now
      });

      // Create workspace role assignments for the invitation
      const roleAssignments = workspaceRoles.map(assignment => ({
        invitationId: invitation.id,
        workspaceId: assignment.workspaceId,
        roles: assignment.roles, // Array of role names
      }));

      await storage.createInvitationWorkspaceRoles(roleAssignments);

      // Send invitation email with workspace information
      console.log('📧 Attempting to send invitation email to:', email, 'with key:', invitationKey.substring(0, 8) + '...');
      const emailResult = await sendInvitationEmail(
        email,
        invitationKey,
        expirationMinutes
      );

      console.log('📧 Email sending result:', emailResult);
      if (!emailResult.success) {
        console.error('📧 Failed to send invitation email to:', email, 'Error:', emailResult.error);
        return res.status(500).json({ 
          message: emailResult.error || "Failed to send invitation email"
        });
      }
      console.log('✅ Successfully sent invitation email to:', email);

      res.json({
        message: "Invitation with workspace role assignments sent successfully",
        invitation: {
          id: invitation.id,
          email: invitation.email,
          status: invitation.status,
          invitedAt: invitation.invitedAt,
          expiresAt: invitation.expiresAt,
          workspaceAssignments: workspaceRoles.length
        }
      });
    } catch (error) {
      console.error('Admin invite user error:', error);
      res.status(500).json({ message: "Failed to send invitation" });
    }
  });

  // Get workspaces for invitation page
  app.get("/api/admin/workspaces", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      
      console.log('🔑 ADMIN WORKSPACES ACCESS ATTEMPT - UserId:', userId, 'OrgId:', organizationId);
      
      // Check if user has admin privileges
      const hasAccess = await hasAdminAccess(userId, organizationId);
      console.log('🔑 ADMIN WORKSPACES - hasAdminAccess result:', hasAccess);
      
      if (!hasAccess) {
        console.log('🚫 ADMIN WORKSPACES ACCESS DENIED for user:', userId);
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      console.log('✅ ADMIN WORKSPACES ACCESS GRANTED for user:', userId);
      
      // Check if user is organization owner
      const orgRole = await storage.getUserOrganization(userId, organizationId);
      console.log('🔍 DEBUG - User:', userId, 'OrgRole:', orgRole, 'CurrentOrgId:', organizationId);
      
      let workspaces;
      if (orgRole && orgRole.role === 'owner' && orgRole.isActive) {
        console.log('🔍 Owner detected - fetching all workspaces for organization:', organizationId);
        // Organization owners see all workspaces with their actual roles
        const allWorkspaces = await storage.getWorkspacesByOrganizationId(organizationId);
        
        // Get user's detailed workspace roles for proper role calculation
        const userWorkspaceRoles = await storage.getUserWorkspaceRoles(userId, organizationId);
        console.log('🎯 DEBUG 4 - Owner workspace roles:', userWorkspaceRoles);
        
        // Format response with workspace details and user's actual role
        workspaces = await Promise.all(allWorkspaces.map(async (workspace) => {
          console.log('🎯 DEBUG 4a - Processing workspace for owner:', { id: workspace.id, name: workspace.name });
          const members = await storage.getWorkspaceMembers(workspace.id);
          
          // Find detailed roles for this specific workspace
          const workspaceRoles = userWorkspaceRoles.filter(role => role.workspaceId === workspace.id);
          const role = workspaceRoles.length > 0 ? workspaceRoles[0].role : 'owner';
          console.log('🎯 DEBUG 4b - Determined role:', role, 'type:', typeof role);
          
          const workspaceResponse = {
            id: workspace.id,
            organizationId: workspace.organizationId,
            name: workspace.name,
            description: workspace.description,
            uniqueId: workspace.uniqueId,
            currentUserRole: role, // Show actual workspace role
            memberCount: members.length,
            activeMemberCount: members.filter(m => m.isActive).length,
            ownerId: workspace.ownerId,
            ownerName: workspace.ownerName || 'Unknown',
            ownerEmail: workspace.ownerEmail || 'Unknown',
            createdAt: workspace.createdAt,
            updatedAt: workspace.updatedAt,
            isActive: false // Will be set correctly by frontend
          };
          
          console.log('🎯 DEBUG 4c - Final workspace response for owner:', workspaceResponse);
          return workspaceResponse;
        }));
      } else {
        console.log('🔍 Member detected - fetching only administrator workspaces for user:', userId);
        // Members only see workspaces where they have ADMINISTRATOR role specifically
        const userWorkspaceRoles = await storage.getUserWorkspaceRoles(userId, organizationId);
        console.log('🔍 User workspace roles for admin filter:', userWorkspaceRoles);
        
        // Filter to only workspaces where user has administrator role
        const administratorWorkspaceIds = userWorkspaceRoles
          .filter(role => {
            let roleStr = '';
            if (typeof role.role === 'string') {
              roleStr = role.role;
            } else if (role.role && typeof role.role === 'object' && role.role.name) {
              roleStr = role.role.name;
            }
            return roleStr === 'administrator' && role.isActive !== false;
          })
          .map(role => role.workspaceId);
        
        console.log('🔍 Administrator workspace IDs:', administratorWorkspaceIds);
        
        if (administratorWorkspaceIds.length === 0) {
          console.log('🔍 No administrator workspaces found - returning empty array');
          workspaces = [];
        } else {
          // Fetch only workspaces where user is administrator
          workspaces = await storage.getWorkspacesByIds(administratorWorkspaceIds, organizationId);
        }
      }
      
      console.log('🔍 Found workspaces:', workspaces?.length, workspaces?.map(w => ({ id: w.id, name: w.name })));
      res.json(workspaces);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });

  app.get("/api/admin/invitations", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      
      // Check if user has admin privileges
      if (!(await hasAdminAccess(userId, organizationId))) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      const invitations = await storage.getUserInvitationsByUserId(userId, organizationId);
      res.json(invitations);
    } catch (error) {
      console.error('Get invitations error:', error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.get("/api/admin/pending-approvals", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      
      // Check if user has admin privileges
      if (!(await hasAdminAccess(userId, organizationId))) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      const pendingApprovals = await storage.getPendingApprovalsForAdmin(userId, organizationId);
      res.json(pendingApprovals);
    } catch (error) {
      console.error('Get pending approvals error:', error);
      res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
  });

  // Get pending invitations that need role/workspace assignment
  app.get("/api/admin/pending-invitations", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      
      // Check if user has admin privileges
      if (!(await hasAdminAccess(userId, organizationId))) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const pendingInvitations = await storage.getPendingInvitationsWithoutRoles(organizationId);
      res.json(pendingInvitations);
    } catch (error) {
      console.error('Get pending invitations error:', error);
      res.status(500).json({ message: "Failed to fetch pending invitations" });
    }
  });

  // Search users across organization
  app.get("/api/admin/search-users", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      
      // Check if user has admin privileges
      if (!(await hasAdminAccess(userId, organizationId))) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      console.log('🔍 Search query:', query);
      console.log('🔍 Organization ID:', organizationId);
      
      const searchResults = await storage.searchUsersInOrganization(organizationId, query);
      console.log('🔍 Search results:', searchResults);
      
      res.json(searchResults);
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Assign role to invited user
  app.post("/api/admin/assign-invited-user", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      
      // Check if user has admin privileges
      if (!(await hasAdminAccess(userId, organizationId))) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      const { invitedUserId, workspaceId, roleId } = req.body;
      
      if (!invitedUserId || !workspaceId || !roleId) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Assign role to user
      await storage.assignRoleToInvitedUser(invitedUserId, workspaceId, roleId, organizationId);
      
      res.json({ message: "Role assigned successfully" });
    } catch (error) {
      console.error('Assign invited user role error:', error);
      res.status(500).json({ message: "Failed to assign role" });
    }
  });

  app.post("/api/admin/approve-invitation/:id", requireAuth, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const invitationId = parseInt(req.params.id);
      const organizationId = getCurrentOrganizationId(req);
      
      // Check if user has admin privileges
      if (!(await hasAdminAccess(adminId, organizationId))) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      const approvedInvitation = await storage.approveUserInvitation(invitationId, adminId);
      if (!approvedInvitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      // Update the user's role and status
      if (approvedInvitation.userId) {
        await storage.updateUserRoleAndStatus(
          approvedInvitation.userId,
          'creator', // Default role for newly approved users
          'active'
        );
        
        // Assign user to ALL workspaces in the organization
        await storage.assignUserToAllWorkspaces(
          approvedInvitation.userId,
          approvedInvitation.organizationId
        );
      }

      res.json({
        message: "Invitation approved successfully",
        invitation: approvedInvitation
      });
    } catch (error) {
      console.error('Approve invitation error:', error);
      res.status(500).json({ message: "Failed to approve invitation" });
    }
  });

  // Resend invitation with fresh expiration
  app.post("/api/admin/resend-invitation/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const invitationId = parseInt(req.params.id);
      const organizationId = getCurrentOrganizationId(req);
      const { expirationMinutes = 10 } = req.body;
      
      // Check if user has admin privileges
      if (!(await hasAdminAccess(userId, organizationId))) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      // Get existing invitation to verify it exists and belongs to this organization
      const existingInvitation = await storage.getInvitationById(invitationId, organizationId);
      if (!existingInvitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      // Update the invitation with fresh expiration time
      const newExpiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
      
      const updatedInvitation = await storage.resendInvitation(invitationId, organizationId, newExpiresAt, expirationMinutes);

      // Send new invitation email
      await sendInvitationEmail(
        updatedInvitation.email,
        updatedInvitation.invitationKey,
        expirationMinutes
      );

      res.json({ 
        message: "Invitation resent successfully",
        invitation: updatedInvitation
      });
    } catch (error) {
      console.error('Resend invitation error:', error);
      res.status(500).json({ message: "Failed to resend invitation" });
    }
  });

  // Cancel invitation
  app.post("/api/admin/cancel-invitation/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const invitationId = parseInt(req.params.id);
      const organizationId = getCurrentOrganizationId(req);
      
      // Check if user has admin privileges
      if (!(await hasAdminAccess(userId, organizationId))) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      // Verify invitation exists and belongs to this organization
      const existingInvitation = await storage.getInvitationById(invitationId, organizationId);
      if (!existingInvitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      // Cancel the invitation
      const canceledInvitation = await storage.cancelInvitation(invitationId, organizationId, userId);
      
      if (!canceledInvitation) {
        return res.status(500).json({ message: "Failed to cancel invitation" });
      }

      res.json({ 
        message: "Invitation canceled successfully",
        invitation: canceledInvitation
      });
    } catch (error) {
      console.error('Cancel invitation error:', error);
      res.status(500).json({ message: "Failed to cancel invitation" });
    }
  });

  app.get("/join-invitation", async (req, res) => {
    try {
      const { key } = req.query;
      
      if (!key || typeof key !== 'string') {
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #e74c3c;">Invalid Invitation Link</h1>
              <p>The invitation link is invalid or missing.</p>
              <a href="${process.env.NODE_ENV === 'production' ? 'https://postmeai.com' : 'http://localhost:5000'}" 
                 style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Go to PostMeAI
              </a>
            </body>
          </html>
        `);
      }

      const invitation = await storage.getUserInvitationByKey(key);
      
      if (!invitation) {
        return res.status(404).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #e74c3c;">Invitation Not Found</h1>
              <p>The invitation link is invalid or has expired.</p>
              <a href="${process.env.NODE_ENV === 'production' ? 'https://postmeai.com' : 'http://localhost:5000'}" 
                 style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Go to PostMeAI
              </a>
            </body>
          </html>
        `);
      }

      // Check if invitation has expired
      if (invitation.expiresAt && invitation.expiresAt < new Date()) {
        await storage.updateUserInvitation(invitation.id, { status: 'expired' });
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #e74c3c;">Invitation Expired</h1>
              <p>This invitation has expired. Please contact your administrator for a new invitation.</p>
              <a href="${process.env.NODE_ENV === 'production' ? 'https://postmeai.com' : 'http://localhost:5000'}" 
                 style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Go to PostMeAI
              </a>
            </body>
          </html>
        `);
      }

      // Redirect to frontend invitation page
      const baseUrl = process.env.NODE_ENV === 'production' ? 'https://postmeai.com' : 'http://localhost:5000';
      res.redirect(`${baseUrl}/invitation/${key}`);
    } catch (error) {
      console.error('Join invitation error:', error);
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #e74c3c;">Error</h1>
            <p>An error occurred while processing your invitation.</p>
            <a href="${process.env.NODE_ENV === 'production' ? 'https://postmeai.com' : 'http://localhost:5000'}" 
               style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Go to PostMeAI
            </a>
          </body>
        </html>
      `);
    }
  });

  app.post("/api/invitation/set-password", async (req, res) => {
    try {
      const { invitationKey, firstName, lastName, password } = req.body;
      
      if (!invitationKey || !firstName || !lastName || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      const invitation = await storage.getUserInvitationByKey(invitationKey);
      
      if (!invitation) {
        return res.status(404).json({ message: "Invalid invitation key" });
      }

      // Check if invitation has expired
      if (invitation.expiresAt && invitation.expiresAt < new Date()) {
        await storage.updateUserInvitation(invitation.id, { status: 'expired' });
        return res.status(400).json({ message: "Invitation has expired" });
      }

      // Check if user already exists
      let user = await storage.getUserByEmail(invitation.email);
      
      if (user) {
        // User exists, update their password and information
        const hashedPassword = await bcrypt.hash(password, 12);
        const [updatedUser] = await db
          .update(users)
          .set({
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName,
            userRole: invitation.userRole,
            accountStatus: 'active', // Auto-approve invited users
            emailVerified: true,
            onboardingCompleted: true, // Skip onboarding for invited users
            updatedAt: new Date(),
          })
          .where(eq(users.email, invitation.email))
          .returning();
        user = updatedUser;
      } else {
        // Create new user account
        user = await storage.createLocalUser({
          email: invitation.email,
          password,
          firstName,
          lastName,
          userRole: invitation.userRole,
          accountStatus: 'active', // Auto-approve invited users
          emailVerified: true, // Email is pre-verified through invitation
          onboardingCompleted: true, // Skip onboarding for invited users
        });
      }

      // Get all workspace role assignments for this invitation
      const invitationWorkspaceRoles = await storage.getInvitationWorkspaceRoles(invitation.id);
      
      if (invitationWorkspaceRoles.length > 0) {
        // Get the organization ID from the first workspace
        const firstWorkspaceId = invitationWorkspaceRoles[0].workspaceId;
        const workspace = await db.select()
          .from(workspaces)
          .where(eq(workspaces.id, firstWorkspaceId))
          .limit(1);
        
        if (workspace.length > 0) {
          const organizationId = workspace[0].organizationId;
          
          // Check if user is already in the organization
          const existingOrgMembership = await db.select()
            .from(userOrganizations)
            .where(and(
              eq(userOrganizations.userId, user.id),
              eq(userOrganizations.organizationId, organizationId)
            ));
            
          if (existingOrgMembership.length === 0) {
            // Add the user to the organization as a member
            await db.insert(userOrganizations).values({
              userId: user.id,
              organizationId: organizationId,
              role: 'member', // Default organization role for invited users
              isActive: true,
              joinedAt: new Date(),
              lastActiveAt: new Date()
            });
          }
          
          // Set the user's current organization
          await db.update(users)
            .set({
              currentOrganizationId: organizationId,
              updatedAt: new Date()
            })
            .where(eq(users.id, user.id));
        }
        
        // Process each workspace role assignment
        for (const workspaceRole of invitationWorkspaceRoles) {
          // Check if user is already in this workspace
          const existingMembership = await db.select()
            .from(userWorkspaces)
            .where(and(
              eq(userWorkspaces.userId, user.id),
              eq(userWorkspaces.workspaceId, workspaceRole.workspaceId)
            ));
            
          if (existingMembership.length === 0) {
            // Use the first role from the roles array as the primary workspace role for userWorkspaces table
            const primaryRole = workspaceRole.roles[0] || 'creator';
            
            // Add the user to this workspace (legacy userWorkspaces table)
            await db.insert(userWorkspaces).values({
              userId: user.id,
              workspaceId: workspaceRole.workspaceId,
              role: primaryRole,
              isActive: true, // Auto-activate invited users
              joinedAt: new Date()
            });
          }
          
          // Assign ALL selected roles to user_workspace_roles table
          for (const roleName of workspaceRole.roles) {
            // Get the role ID from workspace_roles table
            const roleRecord = await db.select()
              .from(workspaceRoles)
              .where(eq(workspaceRoles.name, roleName))
              .limit(1);
              
            if (roleRecord.length > 0) {
              const roleId = roleRecord[0].id;
              
              // Check if this specific role assignment already exists
              const existingRoleAssignment = await db.select()
                .from(userWorkspaceRoles)
                .where(and(
                  eq(userWorkspaceRoles.userId, user.id),
                  eq(userWorkspaceRoles.workspaceId, workspaceRole.workspaceId),
                  eq(userWorkspaceRoles.roleId, roleId)
                ));
                
              if (existingRoleAssignment.length === 0) {
                // Assign this specific role to the user
                await db.insert(userWorkspaceRoles).values({
                  userId: user.id,
                  workspaceId: workspaceRole.workspaceId,
                  roleId: roleId,
                  assignedAt: new Date(),
                  assignedByUserId: null // System assignment during invitation
                });
                
                console.log(`🎯 INVITATION ROLE ASSIGNMENT - User: ${user.id}, Workspace: ${workspaceRole.workspaceId}, Role: ${roleName} (ID: ${roleId})`);
              }
            } else {
              console.error(`❌ INVITATION ROLE ERROR - Role '${roleName}' not found in workspace_roles table`);
            }
          }
        }
        
        // Set the user's current workspace to the first workspace they were invited to
        const firstWorkspace = invitationWorkspaceRoles[0];
        await db.update(users)
          .set({
            currentWorkspaceId: firstWorkspace.workspaceId,
            onboardingCompleted: true, // Skip onboarding for invited users
            updatedAt: new Date()
          })
          .where(eq(users.id, user.id));
      } else if (invitation.workspaceId) {
        // Fallback to old single-workspace logic if no workspace roles are defined
        // Get the organization ID from the workspace
        const workspace = await db.select()
          .from(workspaces)
          .where(eq(workspaces.id, invitation.workspaceId))
          .limit(1);
        
        if (workspace.length > 0) {
          const organizationId = workspace[0].organizationId;
          
          // Check if user is already in the organization
          const existingOrgMembership = await db.select()
            .from(userOrganizations)
            .where(and(
              eq(userOrganizations.userId, user.id),
              eq(userOrganizations.organizationId, organizationId)
            ));
            
          if (existingOrgMembership.length === 0) {
            // Add the user to the organization as a member
            await db.insert(userOrganizations).values({
              userId: user.id,
              organizationId: organizationId,
              role: 'member', // Default organization role for invited users
              isActive: true,
              joinedAt: new Date(),
              lastActiveAt: new Date()
            });
          }
          
          // Set the user's current organization
          await db.update(users)
            .set({
              currentOrganizationId: organizationId,
              updatedAt: new Date()
            })
            .where(eq(users.id, user.id));
        }
        
        const existingMembership = await db.select()
          .from(userWorkspaces)
          .where(and(
            eq(userWorkspaces.userId, user.id),
            eq(userWorkspaces.workspaceId, invitation.workspaceId)
          ));
          
        if (existingMembership.length === 0) {
          await db.insert(userWorkspaces).values({
            userId: user.id,
            workspaceId: invitation.workspaceId,
            role: invitation.userRole || 'creator',
            isActive: true, // Auto-activate invited users
            joinedAt: new Date()
          });
        }
        
        await db.update(users)
          .set({
            currentWorkspaceId: invitation.workspaceId,
            onboardingCompleted: true,
            updatedAt: new Date()
          })
          .where(eq(users.id, user.id));
      }

      // Update invitation status
      await storage.updateUserInvitation(invitation.id, {
        status: 'password_set',
        passwordSetAt: new Date(),
        userId: user.id,
      });

      res.json({
        message: "Password set successfully. You can now sign in immediately.",
        userId: user.id
      });
    } catch (error) {
      console.error('Set password error:', error);
      res.status(500).json({ message: "Failed to set password" });
    }
  });

  // OAuth routes
  app.get("/auth/facebook", (req, res, next) => {
    // Store invitation key in session if provided
    if (req.query.invitationKey) {
      req.session.invitationKey = req.query.invitationKey as string;
    }
    passport.authenticate("facebook", { scope: ["email"] })(req, res, next);
  });
  app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), async (req, res) => {
    // Handle invitation acceptance if invitation key exists
    if (req.session.invitationKey && req.user) {
      try {
        const invitation = await storage.getUserInvitationByKey(req.session.invitationKey);
        if (invitation && invitation.status === 'pending') {
          // Update invitation with OAuth user
          await storage.updateUserInvitation(invitation.id, {
            status: 'password_set',
            passwordSetAt: new Date(),
            userId: (req.user as any).id,
          });
          
          // Clear the invitation key from session
          delete req.session.invitationKey;
        }
      } catch (error) {
        console.error('Error handling OAuth invitation:', error);
      }
    }
    res.redirect("/");
  });

  app.get("/auth/google", (req, res, next) => {
    // Store invitation key in session if provided
    if (req.query.invitationKey) {
      req.session.invitationKey = req.query.invitationKey as string;
    }
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });
  app.get("/auth/google/callback", (req, res, next) => {
    console.log("Google OAuth callback hit with query:", req.query);
    passport.authenticate("google", { failureRedirect: "/login" })(req, res, async (err) => {
      if (err) {
        console.error("Google OAuth error:", err);
        return res.redirect("/login?error=oauth_failed");
      }
      console.log("Google OAuth success, user:", req.user);
      
      // Handle invitation acceptance if invitation key exists
      if (req.session.invitationKey && req.user) {
        try {
          const invitation = await storage.getUserInvitationByKey(req.session.invitationKey);
          if (invitation && invitation.status === 'pending') {
            // Update invitation with OAuth user
            await storage.updateUserInvitation(invitation.id, {
              status: 'password_set',
              passwordSetAt: new Date(),
              userId: (req.user as any).id,
            });
            
            // Clear the invitation key from session
            delete req.session.invitationKey;
          }
        } catch (error) {
          console.error('Error handling OAuth invitation:', error);
        }
      }
      
      res.redirect("/");
    });
  });

  app.get("/auth/linkedin", (req, res, next) => {
    // Store invitation key in session if provided
    if (req.query.invitationKey) {
      req.session.invitationKey = req.query.invitationKey as string;
    }
    passport.authenticate("linkedin", { scope: ["openid", "profile", "email"] })(req, res, next);
  });
  app.get("/auth/linkedin/callback", (req, res, next) => {
    console.log("LinkedIn OAuth callback hit with query:", req.query);
    passport.authenticate("linkedin", { failureRedirect: "/login" })(req, res, async (err) => {
      if (err) {
        console.error("LinkedIn OAuth error:", err);
        return res.send(`
          <script>
            window.close();
            if (window.opener) {
              window.opener.location.href = '/login?error=linkedin_oauth_failed';
            }
          </script>
        `);
      }
      console.log("LinkedIn OAuth success, user:", req.user);
      
      // Handle invitation acceptance if invitation key exists
      if (req.session.invitationKey && req.user) {
        try {
          const invitation = await storage.getUserInvitationByKey(req.session.invitationKey);
          if (invitation && invitation.status === 'pending') {
            // Update invitation with OAuth user
            await storage.updateUserInvitation(invitation.id, {
              status: 'password_set',
              passwordSetAt: new Date(),
              userId: (req.user as any).id,
            });
            
            // Clear the invitation key from session
            delete req.session.invitationKey;
          }
        } catch (error) {
          console.error('Error handling OAuth invitation:', error);
        }
      }
      
      res.send(`
        <script>
          window.close();
          if (window.opener) {
            window.opener.location.href = '/';
          }
        </script>
      `);
    });
  });

  app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
  app.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/login" }), (req, res) => {
    res.redirect("/");
  });

  // Get supported languages
  app.get("/api/languages", async (req, res) => {
    res.json(SUPPORTED_LANGUAGES);
  });

  // Get social platforms
  app.get("/api/platforms", async (req, res) => {
    res.json(SOCIAL_PLATFORMS);
  });

  // AI Content Generation endpoint (protected)
  app.post("/api/ai/generate-content", requireAuth, async (req, res) => {
    try {
      const { subject, language = "en" } = req.body;
      
      if (!subject || subject.trim().length === 0) {
        return res.status(400).json({ message: "Subject is required" });
      }

      // Mock AI content generation with realistic responses
      // In a real implementation, this would call OpenAI or another LLM service
      const aiGeneratedContent = generateAIContent(subject, language);
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      res.json(aiGeneratedContent);
    } catch (error) {
      console.error("AI content generation error:", error);
      res.status(500).json({ message: "Failed to generate AI content" });
    }
  });

  // AI Image Generation endpoint (protected, mocked)
  app.post("/api/ai/generate-image", requireAuth, async (req, res) => {
    try {
      const { prompt, size = "1024x1024", quality = "standard" } = req.body;
      const user = req.user as any;
      
      if (!prompt || prompt.trim().length === 0) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // Simulate AI processing delay (2-4 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

      // Generate a mock image using a placeholder service
      const mockImageUrl = `https://picsum.photos/1024/1024?random=${Date.now()}`;
      
      try {
        // Download the mock image and convert to base64
        const response = await fetch(mockImageUrl);
        const buffer = await response.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');
        
        // Create image record in database
        const imageData = {
          userId: user.id,
          filename: `ai-generated-${Date.now()}.jpg`,
          originalName: `AI: ${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}`,
          mimeType: 'image/jpeg',
          fileSize: buffer.byteLength,
          folder: null, // Save to uncategorized (null folder)
          binaryData: base64Data
        };

        const { organizationId, workspaceId } = getCurrentContext(req);
        const savedImage = await storage.createImage({...imageData, organizationId, workspaceId}, organizationId, workspaceId);
        
        res.json(savedImage);
      } catch (imageError) {
        console.error('Image fetch error:', imageError);
        res.status(500).json({ message: "Failed to generate AI image" });
      }
    } catch (error) {
      console.error('AI Image Generation Error:', error);
      res.status(500).json({ message: "Failed to generate AI image", error: error.message });
    }
  });

  // Create a new post (protected)
  app.post("/api/posts", requireAuth, async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const user = req.user as any;
      const { organizationId, workspaceId } = getCurrentContext(req);
      const post = await storage.createPost(postData, user.id, organizationId, workspaceId);
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid post data", error });
    }
  });

  // Create a manual post (protected)
  app.post("/api/posts/manual", requireAuth, async (req, res) => {
    try {
      const { title, content, selectedImages, platforms, ...postData } = req.body;
      const user = req.user as any;
      const { organizationId, workspaceId } = getCurrentContext(req);
      
      // Create the post
      const post = await storage.createPost({
        ...postData,
        subject: `${title}: ${content.substring(0, 100)}...`,
        executionMode: "manual"
      }, user.id, organizationId, workspaceId);

      // Create generated content with manual data and include selected images
      const generatedContent = await storage.createGeneratedContent({
        postId: post.id,
        title: title,
        body: content,
        imageUrl: selectedImages.length > 0 ? "manual_images" : null,
        platformContent: platforms.reduce((acc: any, platformId: string) => {
          acc[platformId] = {
            title: title,
            body: content,
            imageUrl: selectedImages.length > 0 ? "manual_images" : null
          };
          return acc;
        }, {})
      }, user.id, organizationId, workspaceId);

      // Include selected images in the response for platform display
      const responseContent = {
        ...generatedContent,
        selectedImages: selectedImages || []
      };

      res.json({ post, generatedContent: responseContent });
    } catch (error) {
      res.status(400).json({ message: "Invalid manual post data", error });
    }
  });

  // Generate content for a post
  app.post("/api/posts/:id/generate", requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const user = req.user as any;
      const { organizationId, workspaceId } = getCurrentContext(req);
      const post = await storage.getPost(postId, user.id, organizationId, workspaceId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Generate mock content based on the post subject
      const { title, body } = generateMockContent(post.subject);
      const imageUrl = "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&w=400&h=400&fit=crop";

      // Generate platform-specific content
      const platformContent: Record<string, any> = {};
      SOCIAL_PLATFORMS.forEach(platform => {
        const variation = generateMockContent(post.subject, platform.id);
        platformContent[platform.id] = {
          title: variation.title,
          body: variation.body,
          imageUrl: imageUrl
        };
      });

      const generatedContent = await storage.createGeneratedContent({
        postId,
        title,
        body,
        imageUrl: post.generateImage ? imageUrl : null,
        platformContent
      }, user.id, organizationId, workspaceId);

      res.json(generatedContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate content", error });
    }
  });

  // Get generated content for a post
  app.get("/api/posts/:id/content", requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const user = req.user as any;
      const { organizationId, workspaceId } = getCurrentContext(req);
      const content = await storage.getGeneratedContentByPostId(postId, user.id, organizationId, workspaceId);
      
      if (!content) {
        return res.status(404).json({ message: "Generated content not found" });
      }

      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to get content", error });
    }
  });

  // Publish post to platforms
  app.post("/api/posts/:id/publish", requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { platforms } = req.body;
      const user = req.user as any;
      const { organizationId, workspaceId } = getCurrentContext(req);

      if (!Array.isArray(platforms)) {
        return res.status(400).json({ message: "Platforms must be an array" });
      }

      // Get the post to check if it's a manual post
      const post = await storage.getPost(postId, user.id, organizationId, workspaceId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const publishedPost = await storage.createPublishedPost({
        postId,
        platforms
      }, user.id, organizationId, workspaceId);

      // Update post status
      await storage.updatePost(postId, { status: "published" }, user.id, organizationId, workspaceId);

      // Include isManualPost flag in response
      const responseData = {
        ...publishedPost,
        isManualPost: post.executionMode === "manual"
      };

      res.json(responseData);
    } catch (error) {
      res.status(500).json({ message: "Failed to publish post", error });
    }
  });

  // Create template with schedule
  app.post("/api/templates", requireAuth, async (req, res) => {
    try {
      const templateData = insertTemplateSchema.parse(req.body);
      const user = req.user as any;
      const { organizationId, workspaceId } = getCurrentContext(req);
      const template = await storage.createTemplate(templateData, user.id, organizationId, workspaceId);
      res.json(template);
    } catch (error) {
      res.status(400).json({ message: "Invalid template data", error });
    }
  });

  // Debug route to test admin access logic
  app.post("/api/debug/test-admin-access", async (req, res) => {
    try {
      const { userId, organizationId } = req.body;
      
      console.log('🔍 DEBUG TESTING - UserId:', userId, 'OrgId:', organizationId);
      
      // Get organization role
      const orgRole = await storage.getUserOrganization(userId, organizationId);
      console.log('🔍 DEBUG TESTING - OrgRole:', orgRole);
      
      // Get workspace roles
      const workspaceRoles = await storage.getUserWorkspaceRoles(userId, organizationId);
      console.log('🔍 DEBUG TESTING - WorkspaceRoles:', JSON.stringify(workspaceRoles, null, 2));
      
      // Test hasAdminAccess function
      const hasAccess = await hasAdminAccess(userId, organizationId);
      console.log('🔍 DEBUG TESTING - hasAdminAccess result:', hasAccess);
      
      res.json({
        userId,
        organizationId,
        orgRole,
        workspaceRoles,
        hasAccess
      });
    } catch (error) {
      console.error('Debug test error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get templates for user
  app.get("/api/templates", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { organizationId, workspaceId } = getCurrentContext(req);
      const templates = await storage.getTemplatesByUserId(user.id, organizationId, workspaceId);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to get templates", error });
    }
  });

  // Payment processing routes
  app.get("/api/payments/gateways", requireAuth, async (req, res) => {
    try {
      const availableGateways = PaymentGatewayFactory.getAvailableGateways();
      res.json(availableGateways);
    } catch (error) {
      res.status(500).json({ message: "Failed to get payment gateways", error });
    }
  });

  app.post("/api/payments/process", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Validate payment data
      const {
        cardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        cardholderName,
        billingAddress,
        gateway,
        amount,
        credits
      } = req.body;

      // Basic validation
      if (!validateCardNumber(cardNumber)) {
        return res.status(400).json({ message: "Invalid card number" });
      }

      if (!validateCVV(cvv)) {
        return res.status(400).json({ message: "Invalid CVV" });
      }

      if (!validateExpiryDate(expiryMonth, expiryYear)) {
        return res.status(400).json({ message: "Invalid expiry date" });
      }

      if (!cardholderName || cardholderName.length < 2) {
        return res.status(400).json({ message: "Cardholder name required" });
      }

      if (!billingAddress || !billingAddress.street || !billingAddress.city) {
        return res.status(400).json({ message: "Billing address required" });
      }

      if (!gateway || !amount || !credits) {
        return res.status(400).json({ message: "Gateway, amount, and credits are required" });
      }

      // Create payment transaction record
      const transactionId = `${gateway.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const paymentTransaction = await storage.createPaymentTransaction({
        userId,
        transactionId,
        gateway,
        amount: amount.toString(),
        currency: "USD",
        credits,
        status: "pending",
        billingAddress,
        cardLast4: cardNumber.slice(-4),
        cardType: cardNumber.startsWith("4") ? "visa" : cardNumber.startsWith("5") ? "mastercard" : "other",
        gatewayResponse: null,
        processingFee: null,
      });

      // Process payment through selected gateway
      const paymentGateway = PaymentGatewayFactory.getGateway(gateway);
      const paymentData: PaymentData = {
        cardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        cardholderName,
        billingAddress,
        amount: parseFloat(amount),
        credits,
        gateway,
      };

      const paymentResult = await paymentGateway.processPayment(paymentData);

      // Update transaction status based on result
      let updatedTransaction;
      if (paymentResult.success) {
        updatedTransaction = await storage.updatePaymentTransaction(transactionId, {
          status: "completed",
          gatewayResponse: paymentResult.gatewayResponse,
        });

        // Update user credits
        const user = await storage.getUser(userId);
        if (user) {
          const newCredits = (user.credits || 0) + credits;
          await storage.updateUserCredits(userId, newCredits);
        }
      } else {
        updatedTransaction = await storage.updatePaymentTransaction(transactionId, {
          status: "failed",
          gatewayResponse: { error: paymentResult.error },
        });
      }

      res.json({
        success: paymentResult.success,
        transactionId: paymentResult.transactionId || transactionId,
        transaction: updatedTransaction,
        error: paymentResult.error,
      });

    } catch (error: any) {
      console.error("Payment processing error:", error);
      res.status(500).json({ message: "Payment processing failed", error: error.message });
    }
  });

  // Get payment transactions for current user
  app.get("/api/payments/transactions", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const transactions = await storage.getPaymentTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get payment transactions", error });
    }
  });

  // Dashboard Analytics Routes
  app.get('/api/dashboard/analytics', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get subscription info
      const subscription = {
        plan: user.subscriptionPlan || 'Free',
        status: user.subscriptionStatus || 'free',
        nextPaymentDate: user.subscriptionPlan !== 'Free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
      };

      // Get pending posts count (mock for now)
      const pendingPosts = Math.floor(Math.random() * 5);

      // Get weekly posts data (mock for now)
      const weeklyPosts = {
        total: Math.floor(Math.random() * 20) + 5,
        aiPosts: Math.floor(Math.random() * 15) + 2,
        manualPosts: Math.floor(Math.random() * 10) + 1
      };

      // Get schedulers status (mock for now)
      const schedulers = {
        active: Math.floor(Math.random() * 8) + 2,
        inactive: Math.floor(Math.random() * 3)
      };

      // Get credits balance
      const credits = {
        balance: user.credits || 0
      };

      // Get performance metrics (mock data for now)
      const performance = {
        engagementRate: Math.floor(Math.random() * 15) + 5, // 5-20%
        totalReach: Math.floor(Math.random() * 50000) + 10000,
        totalClicks: Math.floor(Math.random() * 5000) + 1000
      };

      res.json({
        subscription,
        pendingPosts,
        weeklyPosts,
        schedulers,
        credits,
        performance
      });
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
    }
  });

  // Mock REST API for creating manual posts
  app.post("/api/posts/manual", requireAuth, async (req, res) => {
    try {
      const {
        title,
        content,
        language,
        link,
        useAI,
        subject,
        selectedImages,
        platforms
      } = req.body;

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create mock response with MOCK prefix for all values
      const mockResponse = {
        id: `MOCK_POST_${Date.now()}`,
        title: `MOCK: ${title || 'Untitled Post'}`,
        content: `MOCK: ${content || 'No content provided'}`,
        language: `MOCK: ${language || 'en'}`,
        link: link ? `MOCK: ${link}` : `MOCK: No link provided`,
        subject: `MOCK: ${subject || 'No subject provided'}`,
        useAI: `MOCK: ${useAI ? 'AI-assisted' : 'Manual creation'}`,
        selectedImages: selectedImages?.map((img: any, index: number) => ({
          id: `MOCK_IMG_${index + 1}`,
          name: `MOCK: Image ${index + 1}`,
          url: img.url || `MOCK: No URL provided`
        })) || [`MOCK: No images selected`],
        platforms: platforms?.map((platform: string) => `MOCK: ${platform}`) || [`MOCK: No platforms selected`],
        status: "MOCK: Created successfully",
        timestamp: `MOCK: ${new Date().toISOString()}`,
        processingTime: "MOCK: 1.2 seconds",
        contentAnalysis: {
          wordCount: `MOCK: ${content?.split(' ').length || 0} words`,
          characterCount: `MOCK: ${content?.length || 0} characters`,
          readabilityScore: "MOCK: 8.5/10",
          sentiment: "MOCK: Positive"
        },
        platformOptimization: {
          facebook: {
            status: "MOCK: Optimized for engagement",
            hashtags: [`MOCK: #facebook`, `MOCK: #social`, `MOCK: #content`]
          },
          instagram: {
            status: "MOCK: Image-focused optimization",
            hashtags: [`MOCK: #instagram`, `MOCK: #visual`, `MOCK: #story`]
          },
          linkedin: {
            status: "MOCK: Professional tone enhanced",
            hashtags: [`MOCK: #linkedin`, `MOCK: #professional`, `MOCK: #business`]
          }
        },
        metadata: {
          createdBy: `MOCK: ${req.user?.email || 'Unknown user'}`,
          userAgent: `MOCK: ${req.headers['user-agent'] || 'Unknown browser'}`,
          ipAddress: `MOCK: ${req.ip || 'Unknown IP'}`,
          sessionId: `MOCK: ${req.sessionID || 'Unknown session'}`
        }
      };

      res.json(mockResponse);

    } catch (error: any) {
      console.error("Manual post creation error:", error);
      res.status(500).json({ 
        message: "MOCK: Failed to create manual post", 
        error: `MOCK: ${error.message}` 
      });
    }
  });

  // Folder management routes
  app.post('/api/folders', requireAuth, async (req: any, res) => {
    try {
      const { name } = req.body;
      const userId = req.user.id;
      const workspaceId = getCurrentWorkspaceId(req);

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: "Folder name is required" });
      }

      const folder = await storage.createFolder({
        userId,
        name: name.trim(),
      }, workspaceId);

      res.status(201).json(folder);
    } catch (error: any) {
      console.error("Error creating folder:", error);
      res.status(500).json({ message: error.message || "Failed to create folder" });
    }
  });

  app.get('/api/folders', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      const workspaceId = getCurrentWorkspaceId(req);
      const folders = await storage.getFoldersByUserId(userId, organizationId, workspaceId);
      res.json(folders);
    } catch (error: any) {
      console.error("Error fetching folders:", error);
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  app.delete('/api/folders/:id', requireAuth, async (req: any, res) => {
    try {
      const folderId = parseInt(req.params.id);
      const userId = req.user.id;
      const workspaceId = getCurrentWorkspaceId(req);

      const success = await storage.deleteFolder(folderId, userId, workspaceId);
      if (!success) {
        return res.status(404).json({ message: "Folder not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting folder:", error);
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });

  // Image management routes
  app.get('/api/images', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      const workspaceId = getCurrentWorkspaceId(req);
      const { folder } = req.query;
      
      let images;
      if (folder && folder !== 'all') {
        const folderId = parseInt(folder as string);
        images = await storage.getImagesByFolder(userId, folderId, organizationId, workspaceId);
      } else {
        images = await storage.getImagesByUserId(userId, organizationId, workspaceId);
      }
      
      res.json(images);
    } catch (error: any) {
      console.error('Error fetching images:', error);
      res.status(500).json({ message: 'Failed to fetch images' });
    }
  });

  // Dedicated upload route for file uploads
  app.post('/api/images/upload', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const upload = multer({ storage: multer.memoryStorage() });
      
      upload.single('image')(req, res, async (err: any) => {
        if (err) {
          console.error('Multer error:', err);
          return res.status(400).json({ message: 'File upload error' });
        }
        
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const file = req.file;
        const folder = req.body.folder || null;
        const originalName = req.body.originalName || file.originalname;
        
        // Convert buffer to base64
        const base64Data = file.buffer.toString('base64');
        
        const imageData = {
          userId,
          filename: `upload-${Date.now()}-${originalName}`,
          originalName: originalName,
          mimeType: file.mimetype,
          fileSize: file.size,
          folder: folder === 'uncategorized' ? null : folder,
          binaryData: base64Data
        };
        
        const { organizationId, workspaceId } = getCurrentContext(req);
        const image = await storage.createImage({ ...imageData, organizationId, workspaceId }, organizationId, workspaceId);
        res.json(image);
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });

  app.post('/api/images', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      console.log('Image upload request - Content-Type:', req.headers['content-type']);
      console.log('Image upload request - req.is multipart:', req.is('multipart/form-data'));
      
      // Handle both JSON and FormData uploads
      if (req.is('multipart/form-data')) {
        // For file uploads via FormData
        const upload = multer({ storage: multer.memoryStorage() });
        
        upload.single('image')(req, res, async (err: any) => {
          if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ message: 'File upload error' });
          }
          
          if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
          }
          
          const file = req.file;
          const folder = req.body.folder || null;
          const { organizationId, workspaceId } = getCurrentContext(req);
          
          // Convert buffer to base64
          const base64Data = file.buffer.toString('base64');
          
          const imageData = {
            userId,
            organizationId,
            workspaceId,
            filename: `upload-${Date.now()}-${file.originalname}`,
            originalName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            folder: folder === 'uncategorized' ? null : folder,
            data: base64Data
          };
          
          const image = await storage.createImage(imageData, organizationId, workspaceId);
          res.json(image);
        });
      } else {
        // For direct JSON uploads (like AI-generated images)
        const { organizationId, workspaceId } = getCurrentContext(req);
        const imageData = insertImageSchema.parse({
          ...req.body,
          userId,
          organizationId,
          workspaceId,
          originalName: req.body.originalName || req.body.filename || 'ai-generated-image.png'
        });
        
        const image = await storage.createImage(imageData, organizationId, workspaceId);
        res.json(image);
      }
    } catch (error: any) {
      console.error('Error creating image:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });

  app.get('/api/images/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { organizationId, workspaceId } = getCurrentContext(req);
      const imageId = parseInt(req.params.id);
      
      const image = await storage.getImageById(imageId, userId, organizationId, workspaceId);
      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }
      
      res.json(image);
    } catch (error: any) {
      console.error('Error fetching image:', error);
      res.status(500).json({ message: 'Failed to fetch image' });
    }
  });

  app.put('/api/images/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { organizationId, workspaceId } = getCurrentContext(req);
      const imageId = parseInt(req.params.id);
      
      // First verify the image belongs to the user
      const existingImage = await storage.getImageById(imageId, userId, organizationId, workspaceId);
      if (!existingImage) {
        return res.status(404).json({ message: 'Image not found' });
      }
      
      const updatedImage = await storage.updateImage(imageId, req.body, organizationId, workspaceId);
      res.json(updatedImage);
    } catch (error: any) {
      console.error('Error updating image:', error);
      res.status(500).json({ message: 'Failed to update image' });
    }
  });

  app.delete('/api/images/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { organizationId, workspaceId } = getCurrentContext(req);
      const imageId = parseInt(req.params.id);
      
      const deleted = await storage.deleteImage(imageId, userId, organizationId, workspaceId);
      if (!deleted) {
        return res.status(404).json({ message: 'Image not found' });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting image:', error);
      res.status(500).json({ message: 'Failed to delete image' });
    }
  });

  // AI Image Generation endpoint
  app.post('/api/ai/generate-image', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { description } = req.body;

      if (!description || typeof description !== 'string') {
        return res.status(400).json({ message: "Image description is required" });
      }

      // Simulate AI image generation delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

      // Generate a mock image based on the description
      // In production, this would interface with DALL-E, Midjourney, or Stable Diffusion
      // Create a minimal PNG image in base64 (1x1 pixel purple square)
      const mockImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
      
      const filename = `ai-generated-${Date.now()}.png`;
      const { organizationId, workspaceId } = getCurrentContext(req);
      const imageData: InsertImage = {
        userId,
        organizationId,
        workspaceId,
        filename,
        originalName: filename,
        mimeType: 'image/png',
        fileSize: Math.floor(Math.random() * 200000) + 50000, // Random size between 50KB-250KB
        folder: null, // Save as uncategorized
        binaryData: mockImageBase64
      };

      const image = await storage.createImage(imageData, organizationId, workspaceId);
      res.json(image);

    } catch (error: any) {
      console.error("AI image generation error:", error);
      res.status(500).json({ 
        message: "Failed to generate image", 
        error: error.message 
      });
    }
  });

  // Social Media Configuration routes
  app.get('/api/social-media-configs', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { organizationId, workspaceId } = getCurrentContext(req);
      const configs = await storage.getSocialMediaConfigs(userId, organizationId, workspaceId);
      res.json(configs);
    } catch (error: any) {
      console.error("Error fetching social media configs:", error);
      res.status(500).json({ message: "Failed to fetch social media configurations" });
    }
  });

  app.post('/api/social-media-configs', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { platform, isActive, apiKey } = req.body;

      if (!platform) {
        return res.status(400).json({ message: "Platform is required" });
      }

      const { organizationId, workspaceId } = getCurrentContext(req);
      const config = await storage.upsertSocialMediaConfig({
        userId,
        platform,
        isActive: isActive !== undefined ? isActive : true,
        apiKey: apiKey || null,
        testStatus: 'idle',
        testMessage: null,
        lastTestedAt: null,
        organizationId,
        workspaceId
      }, organizationId, workspaceId);

      res.json(config);
    } catch (error: any) {
      console.error("Error saving social media config:", error);
      res.status(500).json({ message: "Failed to save social media configuration" });
    }
  });



  // Subscription management routes
  app.post('/api/subscription/upgrade', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { plan, price } = req.body;

      if (!plan || !price) {
        return res.status(400).json({ message: "Plan and price are required" });
      }

      // Validate plan
      const validPlans = ['basic', 'pro', 'enterprise'];
      if (!validPlans.includes(plan.toLowerCase())) {
        return res.status(400).json({ message: "Invalid plan selected" });
      }

      // Calculate expiration date (1 month from now)
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // Update user subscription
      const updatedUser = await storage.updateUserSubscription(
        userId, 
        plan.toLowerCase(), 
        'active', 
        expiresAt
      );

      // Create payment transaction record for subscription
      const transactionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await storage.createPaymentTransaction({
        userId,
        transactionId,
        gateway: 'subscription',
        amount: price.toString(),
        currency: 'USD',
        credits: 0, // Subscriptions don't give credits
        status: 'completed',
        gatewayResponse: { plan, subscriptionUpgrade: true },
        billingAddress: null,
        cardLast4: null,
        cardType: null,
        processingFee: null,
      });

      res.json({ 
        success: true, 
        user: updatedUser,
        message: `Successfully upgraded to ${plan} plan`
      });
    } catch (error: any) {
      console.error("Error upgrading subscription:", error);
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });

  app.post('/api/subscription/cancel', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const updatedUser = await storage.cancelUserSubscription(userId);

      res.json({ 
        success: true, 
        user: updatedUser,
        message: "Subscription cancelled successfully"
      });
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Settings management routes
  app.post('/api/settings/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, bio, timezone, language, profileImageUrl } = req.body;

      const updatedUser = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        bio,
        timezone,
        language,
        profileImageUrl,
      });

      res.json({ success: true, user: updatedUser });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post('/api/settings/notifications', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { 
        emailNotifications, 
        pushNotifications, 
        postReminders, 
        templateExecution, 
        weeklyReports, 
        marketingEmails 
      } = req.body;

      const updatedUser = await storage.updateUserNotifications(userId, {
        emailNotifications,
        pushNotifications,
        postReminders,
        templateExecution,
        weeklyReports,
        marketingEmails,
      });

      res.json({ success: true, user: updatedUser });
    } catch (error: any) {
      console.error("Error updating notifications:", error);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  });

  app.post('/api/settings/theme', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { theme, primaryColor, compactMode, sidebarCollapsed } = req.body;

      const updatedUser = await storage.updateUserTheme(userId, {
        theme,
        primaryColor,
        compactMode,
        sidebarCollapsed,
      });

      res.json({ success: true, user: updatedUser });
    } catch (error: any) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "Failed to update theme" });
    }
  });

  app.post('/api/settings/company', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { companyName, companyLogo, website, industry, teamSize, brandColors } = req.body;

      const updatedUser = await storage.updateUserCompany(userId, {
        companyName,
        companyLogo,
        website,
        industry,
        teamSize,
        brandColors,
      });

      res.json({ success: true, user: updatedUser });
    } catch (error: any) {
      console.error("Error updating company settings:", error);
      res.status(500).json({ message: "Failed to update company settings" });
    }
  });

  app.post('/api/settings/security', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { sessionTimeout, autoSave, rememberLogin, twoFactorAuth } = req.body;

      const updatedUser = await storage.updateUserSecurity(userId, {
        sessionTimeout,
        autoSave,
        rememberLogin,
        twoFactorAuth,
      });

      res.json({ success: true, user: updatedUser });
    } catch (error: any) {
      console.error("Error updating security settings:", error);
      res.status(500).json({ message: "Failed to update security settings" });
    }
  });

  // Search API endpoint
  app.get('/api/search', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const workspaceId = getCurrentWorkspaceId(req);
      const query = req.query.q as string;

      if (!query || query.length < 3) {
        return res.json([]);
      }

      const searchTerm = query.toLowerCase();
      const results: any[] = [];

      // Search templates
      const templates = await storage.getTemplatesByUserId(userId, workspaceId);
      const matchingTemplates = templates.filter((template: any) => 
        template.name.toLowerCase().includes(searchTerm)
      );
      results.push(...matchingTemplates.map((template: any) => ({
        id: template.id,
        type: 'template',
        name: template.name,
        description: `Frequency: ${template.frequency}`,
      })));

      // Search images
      const images = await storage.getImagesByUserId(userId, workspaceId);
      const matchingImages = images.filter((image: any) => 
        image.filename.toLowerCase().includes(searchTerm) || 
        image.folder?.toLowerCase().includes(searchTerm)
      );
      results.push(...matchingImages.map((image: any) => ({
        id: image.id,
        type: 'image',
        name: image.originalName || image.filename,
        description: `Folder: ${image.folder || 'Uncategorized'}`,
      })));

      // Search social media configurations
      const socialConfigs = await storage.getSocialMediaConfigs(userId, workspaceId);
      const matchingSocial = socialConfigs.filter((config: any) => 
        config.platformId.toLowerCase().includes(searchTerm)
      );
      results.push(...matchingSocial.map((config: any) => ({
        id: config.id,
        type: 'social_media',
        name: config.platformId,
        description: `Status: ${config.testStatus || 'Not configured'}`,
      })));

      // Limit results to 10 for performance
      res.json(results.slice(0, 10));
    } catch (error: any) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Facebook OAuth2 for API Key retrieval
  app.get('/auth/facebook/api-key', (req, res) => {
    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${process.env.FACEBOOK_APP_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.NODE_ENV === 'production' ? 'https://postmeai.com/auth/facebook/api-key/callback' : 'http://localhost:5000/auth/facebook/api-key/callback')}&` +
      `scope=pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish&` +
      `response_type=code&` +
      `state=${req.user?.id || 'anonymous'}`;

    res.redirect(facebookAuthUrl);
  });

  app.get('/auth/facebook/api-key/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        return res.send(`
          <html>
            <body>
              <script>
                window.opener.postMessage({
                  type: 'FACEBOOK_OAUTH_ERROR',
                  error: 'Authorization code not received from Facebook'
                }, '*');
                window.close();
              </script>
            </body>
          </html>
        `);
      }

      // Exchange code for access token
      const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${process.env.FACEBOOK_APP_ID}&` +
        `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
        `redirect_uri=${encodeURIComponent(process.env.NODE_ENV === 'production' ? 'https://postmeai.com/auth/facebook/api-key/callback' : 'http://localhost:5000/auth/facebook/api-key/callback')}&` +
        `code=${code}`);

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        return res.send(`
          <html>
            <body>
              <script>
                window.opener.postMessage({
                  type: 'FACEBOOK_OAUTH_ERROR',
                  error: 'Failed to exchange code for access token: ${tokenData.error.message}'
                }, '*');
                window.close();
              </script>
            </body>
          </html>
        `);
      }

      const accessToken = tokenData.access_token;
      
      // Store the access token temporarily in session for retrieval
      if (req.session) {
        req.session.facebookApiKey = accessToken;
      }

      // Send success message to parent window
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: 'FACEBOOK_OAUTH_SUCCESS',
                apiKey: '${accessToken}'
              }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error('Facebook OAuth error:', error);
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: 'FACEBOOK_OAUTH_ERROR',
                error: 'Internal server error during OAuth process'
              }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }
  });

  // API endpoint to retrieve Facebook OAuth result
  app.get('/api/facebook-oauth-result', (req, res) => {
    if (req.session?.facebookApiKey) {
      const apiKey = req.session.facebookApiKey;
      delete req.session.facebookApiKey; // Clear it after use
      res.json({ apiKey });
    } else {
      res.status(404).json({ message: 'No Facebook API key found' });
    }
  });

  // LinkedIn OAuth2 for API Key retrieval
  app.get('/auth/linkedin/api-key', (req, res) => {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://postmeai.com' 
      : 'https://4f04f90a-e454-4abd-a22c-6683c4071a1c-00-2psprzejqlsdp.kirk.replit.dev';
    const redirectUri = `${baseUrl}/auth/linkedin/api-key/callback`;
    
    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=openid%20profile%20email%20w_member_social&` +
      `state=${req.user?.id || 'anonymous'}`;

    res.redirect(linkedinAuthUrl);
  });

  app.get('/auth/linkedin/api-key/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        return res.send(`
          <html>
            <body>
              <script>
                window.opener.postMessage({
                  type: 'LINKEDIN_OAUTH_ERROR',
                  error: 'Authorization code not received from LinkedIn'
                }, '*');
                window.close();
              </script>
            </body>
          </html>
        `);
      }

      // Exchange code for access token
      const tokenResponse = await fetch(`https://www.linkedin.com/oauth/v2/accessToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code as string,
          client_id: process.env.LINKEDIN_CLIENT_ID!,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
          redirect_uri: process.env.NODE_ENV === 'production' ? 'https://postmeai.com/auth/linkedin/api-key/callback' : 'https://4f04f90a-e454-4abd-a22c-6683c4071a1c-00-2psprzejqlsdp.kirk.replit.dev/auth/linkedin/api-key/callback'
        })
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        return res.send(`
          <html>
            <body>
              <script>
                window.opener.postMessage({
                  type: 'LINKEDIN_OAUTH_ERROR',
                  error: 'Failed to exchange code for access token: ${tokenData.error_description || tokenData.error}'
                }, '*');
                window.close();
              </script>
            </body>
          </html>
        `);
      }

      const accessToken = tokenData.access_token;
      
      // Store the access token temporarily in session for retrieval
      if (req.session) {
        req.session.linkedinApiKey = accessToken;
      }

      // Send success message to parent window
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: 'LINKEDIN_OAUTH_SUCCESS',
                apiKey: '${accessToken}'
              }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error('LinkedIn OAuth error:', error);
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: 'LINKEDIN_OAUTH_ERROR',
                error: 'Internal server error during OAuth process'
              }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }
  });

  // API endpoint to retrieve LinkedIn OAuth result
  app.get('/api/linkedin-oauth-result', (req, res) => {
    if (req.session?.linkedinApiKey) {
      const apiKey = req.session.linkedinApiKey;
      delete req.session.linkedinApiKey; // Clear it after use
      res.json({ apiKey });
    } else {
      res.status(404).json({ message: 'No LinkedIn API key found' });
    }
  });

  // Organization API routes
  app.get('/api/organization/current', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.currentOrganizationId) {
        return res.status(400).json({ message: 'User has no organization context' });
      }
      
      const organization = await storage.getOrganization(user.currentOrganizationId);
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      
      // Get user's role in the organization
      const userOrganizations = await storage.getUserOrganizations(userId);
      const userOrgRole = userOrganizations.find(uo => uo.organizationId === user.currentOrganizationId);
      const currentUserRole = userOrgRole ? userOrgRole.role : 'member';
      
      res.json({
        ...organization,
        currentUserRole
      });
    } catch (error: any) {
      console.error('Error fetching organization info:', error);
      res.status(500).json({ message: 'Failed to fetch organization information' });
    }
  });

  app.get('/api/organizations', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get all organizations where the user is a member
      const userOrganizations = await storage.getUserOrganizations(userId);
      
      const organizations = await Promise.all(
        userOrganizations.map(async (userOrg) => {
          const org = await storage.getOrganization(userOrg.organizationId);
          if (!org) return null;
          
          const memberCount = await storage.getOrganizationMemberCount(userOrg.organizationId);
          
          return {
            ...org,
            currentUserRole: userOrg.role,
            memberCount: memberCount || 0,
            isActive: userOrg.isActive
          };
        })
      );
      
      res.json(organizations.filter(Boolean));
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
      res.status(500).json({ message: 'Failed to fetch organizations' });
    }
  });

  app.post('/api/organization/switch', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { organizationId } = req.body;
      
      if (!organizationId) {
        return res.status(400).json({ message: 'Organization ID is required' });
      }
      
      // Verify user has access to this organization
      const userOrganizations = await storage.getUserOrganizations(userId);
      const hasAccess = userOrganizations.some(uo => uo.organizationId === organizationId && uo.isActive);
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied to this organization' });
      }
      
      // Update user's current organization
      await storage.updateUser(userId, { currentOrganizationId: organizationId });
      
      // Find first workspace in the organization and set as current
      const workspaces = await storage.getWorkspacesByOrganizationId(organizationId);
      if (workspaces.length > 0) {
        await storage.updateUser(userId, { currentWorkspaceId: workspaces[0].id });
      }
      
      res.json({ success: true, message: 'Organization switched successfully' });
    } catch (error: any) {
      console.error('Error switching organization:', error);
      res.status(500).json({ message: 'Failed to switch organization' });
    }
  });

  // Workspace API routes
  app.get('/api/workspace/current', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get user's current workspace from database (fresh data)
      const user = await storage.getUser(userId);
      if (!user || !user.currentWorkspaceId) {
        return res.status(400).json({ message: 'No current workspace set' });
      }
      
      const workspaceId = user.currentWorkspaceId;
      
      // Get workspace info
      const workspace = await storage.getWorkspace(workspaceId);
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Get workspace members
      const members = await storage.getWorkspaceMembers(workspaceId);
      
      // Get user's organization role to determine proper fallback
      const userOrganizations = await storage.getUserOrganizations(userId);
      const userOrgRole = userOrganizations.find(uo => uo.organizationId === user.currentOrganizationId);
      console.log('🎯 DEBUG CURRENT WS - userOrgRole:', userOrgRole);
      
      // Get current user's detailed workspace roles - same method as /api/workspaces  
      const userWorkspaceRoles = await storage.getUserWorkspaceRoles(userId, user.currentOrganizationId);
      console.log('🎯 DEBUG CURRENT WS - userWorkspaceRoles:', userWorkspaceRoles);
      
      // Find roles for this specific workspace
      const workspaceRoles = userWorkspaceRoles.filter(role => role.workspaceId === workspaceId);
      
      // Use 'owner' fallback for organization owners, 'member' for others
      const fallbackRole = (userOrgRole && userOrgRole.role === 'owner') ? 'owner' : 'member';
      const currentUserRole = workspaceRoles.length > 0 ? workspaceRoles[0].role : fallbackRole;
      console.log('🎯 DEBUG CURRENT WS - determined role:', currentUserRole, 'fallback used:', fallbackRole, 'type:', typeof currentUserRole);
      
      // Format response
      const workspaceInfo = {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        currentUserRole: currentUserRole, // Add current user's workspace role
        members: members.map(member => ({
          id: member.userId,
          email: member.email || 'Unknown',
          role: member.role,
          joinedAt: member.joinedAt
        }))
      };
      
      res.json(workspaceInfo);
    } catch (error: any) {
      console.error('Error fetching workspace info:', error);
      res.status(500).json({ message: 'Failed to fetch workspace information' });
    }
  });

  // Get all workspaces for current user
  app.get('/api/workspaces', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get user's organization and role
      const userOrganizations = await storage.getUserOrganizations(userId);
      const user = await storage.getUser(userId);
      
      if (!user || !user.currentOrganizationId) {
        return res.status(400).json({ message: 'User has no organization context' });
      }
      
      // Find the user's role in the current organization
      const userOrgRole = userOrganizations.find(uo => uo.organizationId === user.currentOrganizationId);
      
      console.log('🔍 DEBUG - User:', userId, 'OrgRole:', userOrgRole, 'CurrentOrgId:', user.currentOrganizationId);
      
      let workspaces;
      
      if (userOrgRole && userOrgRole.role === 'owner') {
        // 🔐 Organization Owner: Show ALL workspaces in the organization
        console.log('🔍 Owner detected - fetching all workspaces for organization:', user.currentOrganizationId);
        const allWorkspaces = await storage.getWorkspacesByOrganizationId(user.currentOrganizationId);
        console.log('🔍 Found workspaces:', allWorkspaces.length, allWorkspaces.map(w => ({ id: w.id, name: w.name })));
        
        // Get user's detailed workspace roles for proper role calculation
        const userWorkspaceRoles = await storage.getUserWorkspaceRoles(userId, user.currentOrganizationId);
        console.log('🎯 DEBUG 4 - Owner workspace roles:', userWorkspaceRoles);
        
        // Format response with workspace details and user's actual detailed role
        workspaces = await Promise.all(allWorkspaces.map(async (workspace) => {
          console.log('🎯 DEBUG 4a - Processing workspace for owner:', { id: workspace.id, name: workspace.name });
          const members = await storage.getWorkspaceMembers(workspace.id);
          
          // Find detailed roles for this specific workspace
          const workspaceRoles = userWorkspaceRoles.filter(role => role.workspaceId === workspace.id);
          const role = workspaceRoles.length > 0 ? workspaceRoles[0].role : 'owner';
          console.log('🎯 DEBUG 4b - Determined role:', role, 'type:', typeof role);
          
          const workspaceResponse = {
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            uniqueId: workspace.uniqueId,
            currentUserRole: role, // Show 'owner' if not a member but owns org
            memberCount: members.length,
            createdAt: workspace.createdAt,
            isActive: workspace.id === user.currentWorkspaceId
          };
          
          console.log('🎯 DEBUG 4c - Final workspace response for owner:', workspaceResponse);
          return workspaceResponse;
        }));
      } else {
        // 🔐 Non-Owner: Show only workspaces where user has explicit roles in the organization
        console.log('🔍 Non-owner detected - fetching user workspace roles for user:', userId);
        const userWorkspaceRoles = await storage.getUserWorkspaceRoles(userId, user.currentOrganizationId);
        console.log('🔍 User workspace roles found:', userWorkspaceRoles);
        
        // Group roles by workspace to avoid duplicates (user may have multiple roles in same workspace)
        const workspaceRoleMap = new Map();
        userWorkspaceRoles.forEach(roleAssignment => {
          const workspaceId = roleAssignment.workspaceId;
          if (!workspaceRoleMap.has(workspaceId)) {
            workspaceRoleMap.set(workspaceId, []);
          }
          workspaceRoleMap.get(workspaceId).push(roleAssignment.role);
        });
        
        console.log('🔍 Deduplicated workspace roles map:', Array.from(workspaceRoleMap.entries()));
        
        // Format response with workspace details and user's primary role (first role)
        const uniqueWorkspaceIds = Array.from(workspaceRoleMap.keys());
        workspaces = await Promise.all(uniqueWorkspaceIds.map(async (workspaceId) => {
          console.log('🎯 DEBUG 3 - Processing workspace ID:', workspaceId);
          const workspace = await storage.getWorkspace(workspaceId);
          const members = await storage.getWorkspaceMembers(workspaceId);
          const userRoles = workspaceRoleMap.get(workspaceId);
          const primaryRole = userRoles[0]; // Use first role as primary
          
          console.log('🎯 DEBUG 3a - Workspace:', workspace ? { id: workspace.id, name: workspace.name } : 'null');
          console.log('🎯 DEBUG 3b - User roles in workspace:', userRoles, 'primary role:', primaryRole);
          
          const workspaceResponse = {
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            uniqueId: workspace.uniqueId,
            currentUserRole: primaryRole,
            memberCount: members.length,
            createdAt: workspace.createdAt,
            isActive: workspace.id === user.currentWorkspaceId
          };
          
          console.log('🎯 DEBUG 3c - Final workspace response:', workspaceResponse);
          return workspaceResponse;
        }));
        console.log('🔍 Final workspaces for non-owner:', workspaces.map(w => ({ id: w.id, name: w.name, role: w.currentUserRole })));
      }
      
      res.json(workspaces);
    } catch (error: any) {
      console.error('Error fetching user workspaces:', error);
      res.status(500).json({ message: 'Failed to fetch workspaces' });
    }
  });

  // Switch workspace
  app.post('/api/workspace/switch', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { workspaceId } = req.body;
      
      if (!workspaceId) {
        return res.status(400).json({ message: 'Workspace ID is required' });
      }
      
      // Verify user has access to this workspace
      const userWorkspaces = await storage.getUserWorkspaces(userId);
      const hasAccess = userWorkspaces.some(uw => uw.workspaceId === workspaceId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied to this workspace' });
      }
      
      // Update user's current workspace
      await storage.updateUserCurrentWorkspace(userId, workspaceId);
      
      res.json({ success: true, message: 'Workspace switched successfully' });
    } catch (error: any) {
      console.error('Error switching workspace:', error);
      res.status(500).json({ message: 'Failed to switch workspace' });
    }
  });

  // User data deletion routes
  app.get('/api/user/data-summary', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get counts of all user data
      const workspaceId = getCurrentWorkspaceId(req);
      const posts = await storage.getPostsByUserId(userId, workspaceId);
      const images = await storage.getImagesByUserId(userId, workspaceId);
      const schedules = await storage.getPostSchedulesByUserId(userId, workspaceId);
      const socialConfigs = await storage.getSocialMediaConfigs(userId, workspaceId);
      const transactions = await storage.getPaymentTransactionsByUserId(userId, workspaceId);
      const templates = await storage.getTemplatesByUserId(userId, workspaceId);
      
      const dataSummary = {
        posts: posts.length,
        media: images.length,
        schedules: schedules.length,
        socialConfigs: socialConfigs.length,
        transactions: transactions.length,
        templates: templates.length
      };
      
      res.json(dataSummary);
    } catch (error: any) {
      console.error("Error fetching user data summary:", error);
      res.status(500).json({ message: "Failed to fetch user data summary" });
    }
  });

  app.delete('/api/user/delete-account', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { confirmation } = req.body;
      
      // Verify confirmation text
      if (confirmation !== "DELETE MY ACCOUNT") {
        return res.status(400).json({ message: "Invalid confirmation text" });
      }
      
      // Delete all user data in the correct order (respecting foreign key constraints)
      
      // Delete data from ALL workspaces for this user (account deletion should be global)
      // We need to get all workspaces this user belongs to and delete data from each
      const userWorkspaces = await storage.getUserWorkspaces(userId);
      
      for (const workspace of userWorkspaces) {
        const workspaceId = workspace.workspaceId;
        
        // 1. Delete schedule executions
        const schedules = await storage.getPostSchedulesByUserId(userId, workspaceId);
        for (const schedule of schedules) {
          await storage.deleteScheduleExecutions(schedule.id);
        }
        
        // 2. Delete post schedules
        for (const schedule of schedules) {
          await storage.deletePostSchedule(schedule.id, userId, workspaceId);
        }
        
        // 3. Delete published posts
        const posts = await storage.getPostsByUserId(userId, workspaceId);
        for (const post of posts) {
          await storage.deletePublishedPostsByPostId(post.id, workspaceId);
        }
        
        // 4. Delete generated content
        for (const post of posts) {
          await storage.deleteGeneratedContentByPostId(post.id, workspaceId);
        }
        
        // 5. Delete templates
        const templates = await storage.getTemplatesByUserId(userId, workspaceId);
        for (const template of templates) {
          await storage.deleteTemplate(template.id, userId, workspaceId);
        }
        
        // 6. Delete posts
        for (const post of posts) {
          await storage.deletePost(post.id, userId, workspaceId);
        }
        
        // 7. Delete images
        const images = await storage.getImagesByUserId(userId, workspaceId);
        for (const image of images) {
          await storage.deleteImage(image.id, userId, workspaceId);
        }
        
        // 8. Delete folders
        const folders = await storage.getFoldersByUserId(userId, workspaceId);
        for (const folder of folders) {
          await storage.deleteFolder(folder.id, userId, workspaceId);
        }
        
        // 9. Delete social media configs
        await storage.deleteSocialMediaConfigs(userId, workspaceId);
      }
      
      // 10. Delete payment transactions
      await storage.deletePaymentTransactions(userId);
      
      // 11. Finally, delete the user account
      await storage.deleteUser(userId);
      
      // Clear session
      req.session.destroy();
      
      res.json({ 
        success: true, 
        message: "Account and all associated data have been permanently deleted" 
      });
    } catch (error: any) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Onboarding routes
  app.post('/api/onboarding', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log('Onboarding data received for user:', userId, req.body);
      
      // Use the storage layer to save onboarding data
      const updatedUser = await storage.saveOnboardingData(userId, req.body);
      
      res.json({ success: true, user: updatedUser });
    } catch (error: any) {
      console.error('Error saving onboarding data:', error);
      res.status(500).json({ message: 'Failed to save onboarding data' });
    }
  });

  app.post('/api/onboarding/complete', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log('Completing onboarding for user:', userId, req.body);
      
      // Use the storage layer to complete onboarding
      const updatedUser = await storage.completeOnboarding(userId, req.body);
      
      res.json({ success: true, user: updatedUser });
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      res.status(500).json({ message: 'Failed to complete onboarding' });
    }
  });

  // Test route to trigger onboarding wizard (for analysis purposes)
  app.post('/api/onboarding/test-trigger', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // Reset onboarding completion to trigger the wizard
      await storage.updateUserProfile(userId, { 
        onboardingCompleted: false,
        onboardingData: null 
      });
      res.json({ success: true, message: 'Onboarding reset - wizard will show on next page load' });
    } catch (error: any) {
      console.error('Error resetting onboarding:', error);
      res.status(500).json({ message: 'Failed to reset onboarding' });
    }
  });

  // Enhanced Facebook API key validation
  app.post('/api/social-media-configs/:platformId/test', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { platformId } = req.params;
      const { apiKey } = req.body;

      console.log(`Testing ${platformId} connection for user ${userId}`);
      
      if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
        const workspaceId = getCurrentWorkspaceId(req);
        await storage.updateSocialMediaConfigTestStatus(userId, platformId, 'failed', workspaceId, 'API key is required for testing');
        return res.status(400).json({ 
          success: false, 
          error: 'API key is required for testing',
          status: 'failed'
        });
      }

      // Set testing status
      await storage.updateSocialMediaConfigTestStatus(userId, platformId, 'testing');

      let testResult = { success: false, error: 'Platform not supported' };
      
      // Enhanced Facebook API validation
      if (platformId === 'facebook') {
        try {
          // Test Facebook Graph API with the provided access token
          const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${apiKey}&fields=id,name,email`);
          const data = await response.json();
          
          if (data.error) {
            testResult = { 
              success: false, 
              error: `Facebook API Error: ${data.error.message} (Code: ${data.error.code})` 
            };
          } else if (data.id) {
            // Also test pages access
            const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${apiKey}`);
            const pagesData = await pagesResponse.json();
            
            if (pagesData.error) {
              testResult = { 
                success: false, 
                error: `Facebook Pages API Error: ${pagesData.error.message}` 
              };
            } else {
              testResult = { 
                success: true, 
                error: null,
                userInfo: {
                  name: data.name,
                  id: data.id,
                  pages: pagesData.data?.length || 0
                }
              };
            }
          } else {
            testResult = { success: false, error: 'Invalid Facebook API response' };
          }
        } catch (error: any) {
          testResult = { success: false, error: `Facebook API connection failed: ${error.message}` };
        }
      } else {
        // Mock validation for other platforms
        const delay = Math.random() * 2000 + 1000; // 1-3 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (apiKey && apiKey.length > 10) {
          testResult = { success: true, error: null };
        } else {
          testResult = { success: false, error: 'Invalid API key format' };
        }
      }

      // Update test status in database and save API key
      const workspaceId = getCurrentWorkspaceId(req);
      if (testResult.success) {
        await storage.upsertSocialMediaConfig({
          userId,
          platformId,
          isEnabled: true,
          apiKey: apiKey.trim(),
          testStatus: 'connected',
          testError: null,
          lastTestedAt: new Date(),
        }, workspaceId);
        
        res.json({ 
          success: true, 
          message: `${platformId} connection successful`,
          userInfo: testResult.userInfo || null
        });
      } else {
        await storage.updateSocialMediaConfigTestStatus(userId, platformId, 'failed', workspaceId, testResult.error);
        res.status(400).json({ 
          success: false, 
          message: testResult.error || `${platformId} connection failed` 
        });
      }
    } catch (error: any) {
      console.error(`Error testing ${req.params.platformId} connection:`, error);
      const workspaceId = getCurrentWorkspaceId(req);
      await storage.updateSocialMediaConfigTestStatus(req.user.id, req.params.platformId, 'failed', workspaceId, error.message);
      res.status(500).json({ message: "Connection test failed" });
    }
  });

  // Notifications API endpoints
  app.get('/api/notifications', requireAuth, async (req: any, res) => {
    try {
      // Mock notifications for now - replace with database implementation later
      const notifications = [
        {
          id: 1,
          type: 'system',
          title: 'Welcome to PostMeAI!',
          message: 'Your account has been successfully created. Start by creating your first post.',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          type: 'success',
          title: 'Post Published Successfully',
          message: 'Your latest post has been published to selected social media platforms.',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        },
        {
          id: 3,
          type: 'social',
          title: 'Social Media Integration',
          message: 'Connect your social media accounts to start publishing content automatically.',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
      ];

      res.json(notifications);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', requireAuth, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      
      // Mock implementation - mark as read
      // In a real implementation, you'd update the database
      console.log(`Marking notification ${notificationId} as read`);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Template Management API endpoints
  app.get('/api/templates', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const workspaceId = getCurrentWorkspaceId(req);
      const templates = await storage.getTemplatesByUserId(userId, workspaceId);
      
      // Enhance templates with post data and objective
      const enhancedTemplates = await Promise.all(
        templates.map(async (template) => {
          const post = await storage.getPost(template.postId, userId, workspaceId);
          const generatedContent = await storage.getGeneratedContentByPostId(template.postId, userId, workspaceId);
          
          return {
            ...template,
            objective: post?.subject || generatedContent?.title || 'Automated post template',
          };
        })
      );
      
      res.json(enhancedTemplates);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/templates/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const workspaceId = getCurrentWorkspaceId(req);
      const templateId = parseInt(req.params.id);
      
      const template = await storage.getTemplateById(templateId, userId, workspaceId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Get associated post and content data
      const post = await storage.getPost(template.postId, userId, workspaceId);
      const generatedContent = await storage.getGeneratedContentByPostId(template.postId, userId, workspaceId);
      
      res.json({
        template,
        post,
        generatedContent,
      });
    } catch (error: any) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.put('/api/templates/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const templateId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedTemplate = await storage.updateTemplate(templateId, updates, userId);
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(updatedTemplate);
    } catch (error: any) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete('/api/templates/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const templateId = parseInt(req.params.id);
      
      const deleted = await storage.deleteTemplate(templateId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json({ success: true, message: "Template deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  app.post('/api/templates/:id/execute', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const templateId = parseInt(req.params.id);
      
      // Execute template and update last execution time
      await storage.executeTemplate(templateId, userId);
      
      // Simulate template execution - in a real implementation, this would:
      // 1. Fetch the template and associated post/content
      // 2. Generate new content based on template parameters
      // 3. Publish to configured social media platforms
      // 4. Record the execution in logs
      
      console.log(`Template ${templateId} executed by user ${userId}`);
      
      res.json({ 
        success: true, 
        message: "Template executed successfully",
        executedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error executing template:", error);
      res.status(500).json({ message: "Failed to execute template" });
    }
  });

  // Toggle template status (Active/Inactive)
  app.patch('/api/templates/:id/toggle-status', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const templateId = parseInt(req.params.id);
      
      // Get current template status
      const template = await storage.getTemplateById(templateId, userId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Toggle the status
      const newStatus = !template.isActive;
      const updated = await storage.updateTemplate(templateId, { isActive: newStatus }, userId);
      
      if (!updated) {
        return res.status(404).json({ message: "Failed to update template status" });
      }
      
      res.json({ 
        success: true, 
        message: `Template ${newStatus ? 'activated' : 'deactivated'} successfully`,
        isActive: newStatus
      });
    } catch (error: any) {
      console.error("Error toggling template status:", error);
      res.status(500).json({ message: "Failed to toggle template status" });
    }
  });

  // Post Schedule Routes
  app.get("/api/post-schedules", requireAuth, async (req: any, res) => {
    try {
      const { organizationId, workspaceId } = getCurrentContext(req);
      const schedules = await storage.getPostSchedulesByUserId(req.user.id, workspaceId);
      
      // Add execution statistics to each schedule
      const schedulesWithStats = await Promise.all(schedules.map(async (schedule: any) => {
        const executions = await storage.getScheduleExecutionsByScheduleId(schedule.id, req.user.id, organizationId, workspaceId);
        const totalExecutions = executions.length;
        const successfulExecutions = executions.filter((ex: any) => ex.status === 'success').length;
        
        return {
          ...schedule,
          totalExecutions,
          successfulExecutions
        };
      }));
      
      res.json(schedulesWithStats);
    } catch (error) {
      console.error("Error fetching post schedules:", error);
      res.status(500).json({ error: "Failed to fetch post schedules" });
    }
  });

  app.post("/api/post-schedules", requireAuth, async (req: any, res) => {
    try {
      console.log("=== POST SCHEDULE DEBUG ===");
      console.log("Raw request body:", JSON.stringify(req.body, null, 2));
      console.log("User ID:", req.user.id);

      const scheduleData = {
        ...req.body,
        userId: req.user.id,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log("Processed schedule data:", JSON.stringify(scheduleData, null, 2));

      const { organizationId, workspaceId } = getCurrentContext(req);
      console.log("Context - organizationId:", organizationId, "workspaceId:", workspaceId);
      
      const schedule = await storage.createPostSchedule(scheduleData, workspaceId);
      res.json(schedule);
    } catch (error) {
      console.error("Error creating post schedule:", error);
      console.error("Error details:", error);
      res.status(500).json({ error: "Failed to create post schedule" });
    }
  });

  app.get("/api/post-schedules/:id", requireAuth, async (req: any, res) => {
    try {
      const { organizationId, workspaceId } = getCurrentContext(req);
      const schedule = await storage.getPostScheduleById(parseInt(req.params.id), req.user.id, organizationId, workspaceId);
      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching post schedule:", error);
      res.status(500).json({ error: "Failed to fetch post schedule" });
    }
  });

  app.put("/api/post-schedules/:id", requireAuth, async (req: any, res) => {
    try {
      const updates = {
        ...req.body,
        updatedAt: new Date(),
      };
      
      const { organizationId, workspaceId } = getCurrentContext(req);
      const schedule = await storage.updatePostSchedule(parseInt(req.params.id), updates, req.user.id, organizationId, workspaceId);
      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      console.error("Error updating post schedule:", error);
      res.status(500).json({ error: "Failed to update post schedule" });
    }
  });

  app.delete("/api/post-schedules/:id", requireAuth, async (req: any, res) => {
    try {
      const { organizationId, workspaceId } = getCurrentContext(req);
      const success = await storage.deletePostSchedule(parseInt(req.params.id), req.user.id, organizationId, workspaceId);
      if (!success) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting post schedule:", error);
      res.status(500).json({ error: "Failed to delete post schedule" });
    }
  });

  // Toggle post schedule activation status
  app.post("/api/post-schedules/:id/toggle", requireAuth, async (req: any, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const updates = { isActive, updatedAt: new Date() };
      const { organizationId, workspaceId } = getCurrentContext(req);
      const schedule = await storage.updatePostSchedule(scheduleId, updates, req.user.id, organizationId, workspaceId);
      
      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      
      res.json({
        success: true,
        message: `Schedule ${isActive ? 'activated' : 'deactivated'} successfully`,
        schedule
      });
    } catch (error) {
      console.error("Error toggling schedule status:", error);
      res.status(500).json({ error: "Failed to toggle schedule status" });
    }
  });

  // Run post schedule immediately
  app.post("/api/post-schedules/:id/run", requireAuth, async (req: any, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const startTime = Date.now();
      
      // Get the schedule to verify ownership
      const { organizationId, workspaceId } = getCurrentContext(req);
      const schedule = await storage.getPostScheduleById(scheduleId, req.user.id, organizationId, workspaceId);
      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }

      if (!schedule.isActive) {
        return res.status(400).json({ error: "Cannot execute inactive schedule" });
      }

      // Simulate content generation and posting process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const executionDuration = Date.now() - startTime;

      // Update last execution time
      const updates = { 
        lastExecutedAt: new Date(), 
        updatedAt: new Date() 
      };
      await storage.updatePostSchedule(scheduleId, updates, req.user.id, organizationId, workspaceId);

      // Record execution in history
      await storage.createScheduleExecution({
        scheduleId: scheduleId,
        userId: req.user.id,
        executedAt: new Date(),
        status: "success",
        message: `Schedule executed successfully on ${schedule.platforms?.length || 0} platforms`,
        platformsExecuted: schedule.platforms || [],
        executionDuration: executionDuration
      }, organizationId, workspaceId);

      const executionResult = {
        scheduleId: scheduleId,
        executedAt: new Date(),
        platforms: schedule.platforms || [],
        status: 'success',
        postsCreated: schedule.platforms?.length || 0
      };

      res.json({
        success: true,
        message: `Schedule executed successfully on ${schedule.platforms?.length || 0} platforms`,
        execution: executionResult
      });
    } catch (error) {
      console.error("Schedule execution error:", error);
      console.error("Error details:", error instanceof Error ? error.message : error);
      
      // Record failed execution
      try {
        const { organizationId, workspaceId } = getCurrentContext(req);
        await storage.createScheduleExecution({
          scheduleId: parseInt(req.params.id),
          userId: req.user.id,
          executedAt: new Date(),
          status: "failed",
          message: error instanceof Error ? error.message : "Unknown error occurred",
          platformsExecuted: [],
          executionDuration: 0
        }, organizationId, workspaceId);
      } catch (recordError) {
        console.error("Failed to record execution error:", recordError);
      }
      
      res.status(500).json({ error: "Failed to execute schedule" });
    }
  });

  // Get schedule execution history
  app.get("/api/post-schedules/:id/history", requireAuth, async (req: any, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const { organizationId, workspaceId } = getCurrentContext(req);
      const schedule = await storage.getPostScheduleById(scheduleId, req.user.id, organizationId, workspaceId);
      
      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }

      const executions = await storage.getScheduleExecutionsByScheduleId(scheduleId, req.user.id, organizationId, workspaceId);
      
      res.json(executions);
    } catch (error) {
      console.error("Error fetching execution history:", error);
      res.status(500).json({ error: "Failed to fetch execution history" });
    }
  });

  // Admin API endpoints
  
  // Check if user has admin privileges
  const requireAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(403).json({ message: 'Admin privileges required' });
      }
      
      const organizationId = getCurrentOrganizationId(req);
      if (!(await hasAdminAccess(userId, organizationId))) {
        return res.status(403).json({ message: 'Admin privileges required' });
      }
      
      next();
    } catch (error) {
      console.error('Error checking admin access:', error);
      return res.status(403).json({ message: 'Admin privileges required' });
    }
  };

  // Admin: Get all workspace members
  app.get('/api/admin/workspace/members', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const workspaceId = getCurrentWorkspaceId(req);
      const members = await storage.getWorkspaceMembers(workspaceId);
      
      // Format response with additional user information
      const membersWithInfo = await Promise.all(members.map(async (member) => {
        const user = await storage.getUser(member.userId);
        return {
          id: member.userId,
          email: user?.email || 'Unknown',
          firstName: user?.firstName || 'Unknown',
          lastName: user?.lastName || 'Unknown',
          role: member.role,
          isAdmin: user?.isAdmin || false,
          userRole: user?.userRole || 'creator',
          accountStatus: user?.accountStatus || 'active',
          joinedAt: member.joinedAt,
          lastActiveAt: user?.lastActiveAt || null,
          isActive: true
        };
      }));
      
      res.json(membersWithInfo);
    } catch (error: any) {
      console.error('Error fetching workspace members:', error);
      res.status(500).json({ message: 'Failed to fetch workspace members' });
    }
  });

  // Admin: Get all organization members (for organization owners)
  app.get('/api/admin/organization/members', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.currentOrganizationId) {
        return res.status(400).json({ message: 'No organization context available' });
      }
      
      // Check if user has admin access (organization owners OR workspace administrators)
      const hasAccess = await hasAdminAccess(userId, user.currentOrganizationId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'Admin privileges required to access organization members' });
      }
      
      // Get organization role for additional context
      const userOrganizations = await storage.getUserOrganizations(userId);
      const userOrgRole = userOrganizations.find(uo => uo.organizationId === user.currentOrganizationId);
      
      // Get all members from the organization
      const organizationMembers = await storage.getOrganizationMembers(user.currentOrganizationId);
      
      // Get current user's workspace context for filtering
      const currentUser = await storage.getUser(userId);
      const currentWorkspaceId = currentUser?.currentWorkspaceId;
      
      // Format response with additional user information
      const membersWithInfo = await Promise.all(organizationMembers.map(async (member) => {
        const user = await storage.getUser(member.userId);
        
        // Get workspace role for CURRENT workspace only - use detailed role lookup
        let currentWorkspaceRole = null;
        if (currentWorkspaceId) {
          // Get user's organization role to determine proper fallback
          const memberOrgRole = organizationMembers.find(om => om.userId === member.userId);
          
          // Get detailed workspace roles for this user
          const userWorkspaceRoles = await storage.getUserWorkspaceRoles(member.userId, currentUser.currentOrganizationId);
          const workspaceRoles = userWorkspaceRoles.filter(role => role.workspaceId === currentWorkspaceId);
          
          // Use 'owner' fallback for organization owners, 'member' for others  
          const fallbackRole = (memberOrgRole && memberOrgRole.role === 'owner') ? 'owner' : null;
          const role = workspaceRoles.length > 0 ? workspaceRoles[0].role : fallbackRole;
          
          if (role) {
            currentWorkspaceRole = {
              workspaceId: currentWorkspaceId,
              role: role,
              workspaceName: `Workspace ${currentWorkspaceId}`
            };
          }
        }
        
        return {
          id: member.userId,
          email: user?.email || 'Unknown',
          firstName: user?.firstName || 'Unknown',
          lastName: user?.lastName || 'Unknown',
          role: member.role,
          isAdmin: user?.isAdmin || false,
          userRole: user?.userRole || 'creator',
          accountStatus: user?.accountStatus || 'active',
          joinedAt: member.joinedAt,
          lastActiveAt: user?.lastActiveAt || null,
          isActive: member.isActive,
          currentWorkspaceRole: currentWorkspaceRole
        };
      }));
      
      res.json(membersWithInfo);
    } catch (error: any) {
      console.error('Error fetching organization members:', error);
      res.status(500).json({ message: 'Failed to fetch organization members' });
    }
  });

  // Admin: Get user details with all workspace roles
  app.get('/api/admin/user-details/:userId', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser || !currentUser.currentOrganizationId) {
        return res.status(400).json({ message: 'No organization context available' });
      }
      
      // Check if current user has admin access
      const hasAccess = await hasAdminAccess(currentUserId, currentUser.currentOrganizationId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'Admin privileges required to view user details' });
      }
      
      // Get the target user
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get all workspaces in the organization
      const allWorkspaces = await storage.getWorkspacesByOrganizationId(currentUser.currentOrganizationId);
      
      // Get user's workspace roles across all workspaces in the organization
      const userWorkspaceRoles = await storage.getUserWorkspaceRoles(userId, currentUser.currentOrganizationId);
      
      // Get user's organization role
      const userOrgRole = await storage.getUserOrganization(userId, currentUser.currentOrganizationId);
      
      // Create workspace details with roles
      const workspaceDetails = allWorkspaces.map(workspace => {
        // Get roles for this specific workspace
        const workspaceRoles = userWorkspaceRoles.filter(role => role.workspaceId === workspace.id);
        
        // If user is organization owner, they have owner access to all workspaces
        const isOrgOwner = userOrgRole && userOrgRole.role === 'owner';
        
        let role = 'No Role';
        if (isOrgOwner) {
          role = 'Owner';
        } else if (workspaceRoles.length > 0) {
          // Get the primary role (first one) or format multiple roles
          role = workspaceRoles.map(wr => {
            // Capitalize first letter and format role name
            const roleName = wr.role;
            return roleName.charAt(0).toUpperCase() + roleName.slice(1);
          }).join(', ');
        }
        
        return {
          workspaceId: workspace.id,
          workspaceName: workspace.name,
          role: role,
          hasAccess: isOrgOwner || workspaceRoles.length > 0
        };
      });
      
      const userDetails = {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        fullName: `${targetUser.firstName} ${targetUser.lastName}`,
        organizationRole: userOrgRole?.role || 'member',
        workspaces: workspaceDetails
      };
      
      res.json(userDetails);
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ message: 'Failed to fetch user details' });
    }
  });

  // Admin: Update user
  app.put('/api/admin/users/:userId', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { role, isAdmin, accountStatus } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get current user's organization context
      const currentOrganizationId = getCurrentOrganizationId(req);
      const targetUserOrganization = await storage.getUserOrganization(userId, currentOrganizationId);
      
      // Check if we're trying to demote an organization owner
      if (targetUserOrganization && targetUserOrganization.role === 'owner' && role && role !== 'owner') {
        // Count total owners in the organization
        const ownerCount = await storage.countOrganizationOwners(currentOrganizationId);
        
        if (ownerCount <= 1) {
          return res.status(400).json({ 
            message: 'Cannot change role of the last organization owner. The organization must have at least one owner.' 
          });
        }
      }
      
      // Update user fields
      const updates: any = {};
      if (role) updates.userRole = role;
      if (typeof isAdmin === 'boolean') updates.isAdmin = isAdmin;
      if (accountStatus) updates.accountStatus = accountStatus;
      updates.updatedAt = new Date();
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      // Also update workspace member role if provided
      if (role) {
        const workspaceId = getCurrentWorkspaceId(req);
        await storage.updateWorkspaceMember(workspaceId, userId, { role });
      }
      
      // If changing organization role, update the organization membership
      if (role && targetUserOrganization) {
        await storage.updateUserOrganization(userId, currentOrganizationId, { role });
      }
      
      res.json({ success: true, user: updatedUser });
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Admin: Remove user from workspace
  app.delete('/api/admin/users/:userId/workspace', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const workspaceId = getCurrentWorkspaceId(req);
      const currentOrganizationId = getCurrentOrganizationId(req);
      
      console.log('🚀 SERVER REMOVE USER DEBUG - DELETE request received');
      console.log('🚀 SERVER REMOVE USER DEBUG - Target user ID:', userId);
      console.log('🚀 SERVER REMOVE USER DEBUG - Current user:', req.user.id);
      console.log('🚀 SERVER REMOVE USER DEBUG - Workspace ID:', workspaceId);
      console.log('🚀 SERVER REMOVE USER DEBUG - Organization ID:', currentOrganizationId);
      
      // Cannot remove self
      if (userId === req.user.id) {
        console.log('🚀 SERVER REMOVE USER DEBUG - ERROR: Cannot remove self');
        return res.status(400).json({ message: 'Cannot remove yourself from workspace' });
      }
      
      // Check if the user being removed is an organization owner
      const targetUserOrganization = await storage.getUserOrganization(userId, currentOrganizationId);
      
      if (targetUserOrganization && targetUserOrganization.role === 'owner') {
        // Count total owners in the organization
        const ownerCount = await storage.countOrganizationOwners(currentOrganizationId);
        
        if (ownerCount <= 1) {
          return res.status(400).json({ 
            message: 'Cannot remove the last organization owner. The organization must have at least one owner. Change their role to member first.' 
          });
        } else {
          return res.status(400).json({ 
            message: 'Cannot remove organization owner. Change their role to member first, then remove them.' 
          });
        }
      }
      
      console.log('🚀 SERVER REMOVE USER DEBUG - Calling storage.removeWorkspaceMember');
      const result = await storage.removeWorkspaceMember(workspaceId, userId);
      console.log('🚀 SERVER REMOVE USER DEBUG - removeWorkspaceMember result:', result);
      
      console.log('🚀 SERVER REMOVE USER DEBUG - User successfully removed from workspace');
      res.json({ success: true, message: 'User removed from workspace' });
    } catch (error: any) {
      console.error('🚀 SERVER REMOVE USER DEBUG - Error removing user from workspace:', error);
      res.status(500).json({ message: 'Failed to remove user from workspace' });
    }
  });

  // Admin: Get all workspaces (with organization-based visibility)
  app.get('/api/admin/workspaces', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get user's organization and role
      const userOrganizations = await storage.getUserOrganizations(userId);
      const user = await storage.getUser(userId);
      
      if (!user || !user.currentOrganizationId) {
        return res.status(400).json({ message: 'User has no organization context' });
      }
      
      // Find the user's role in the current organization
      const userOrgRole = userOrganizations.find(uo => uo.organizationId === user.currentOrganizationId);
      
      console.log('🔍 ADMIN DEBUG - User:', userId, 'OrgRole:', userOrgRole, 'CurrentOrgId:', user.currentOrganizationId);
      
      let workspaces;
      
      if (userOrgRole && userOrgRole.role === 'owner') {
        // 🔐 Organization Owner: Show ALL workspaces in the organization
        console.log('🔍 Admin Owner detected - fetching all workspaces for organization:', user.currentOrganizationId);
        workspaces = await storage.getWorkspacesByOrganizationId(user.currentOrganizationId);
      } else {
        // 🔐 Non-Owner: Show only workspaces where user has administrator role
        console.log('🔍 Non-owner detected - fetching user workspace roles for user:', userId);
        const userWorkspaceRoles = await storage.getUserWorkspaceRoles(userId, user.currentOrganizationId);
        console.log('🔍 User workspace roles found:', userWorkspaceRoles);
        const adminWorkspaceRoles = userWorkspaceRoles.filter(uwr => uwr.role === 'administrator');
        console.log('🔍 Admin workspace roles filtered:', adminWorkspaceRoles);
        workspaces = await Promise.all(adminWorkspaceRoles.map(async (roleAssignment) => {
          return await storage.getWorkspace(roleAssignment.workspaceId);
        }));
        workspaces = workspaces.filter(w => w !== undefined);
        console.log('🔍 Final workspaces for non-owner:', workspaces);
      }
      
      // Get additional information for each workspace
      const workspacesWithInfo = await Promise.all(workspaces.map(async (workspace) => {
        // Get all workspace members (including inactive ones for admin count)
        const allMembers = await storage.getAllWorkspaceMembers(workspace.id);
        const activeMembers = await storage.getWorkspaceMembers(workspace.id);
        
        // Get organization owner as workspace owner
        const organization = await storage.getOrganization(workspace.organizationId);
        const owner = organization ? await storage.getUser(organization.ownerId) : null;
        
        // Generate owner name with fallback logic
        let ownerName = 'Unknown';
        let ownerEmail = 'Unknown';
        if (owner) {
          if (owner.firstName && owner.lastName) {
            ownerName = `${owner.firstName} ${owner.lastName}`;
          } else if (owner.firstName) {
            ownerName = owner.firstName;
          } else if (owner.lastName) {
            ownerName = owner.lastName;
          } else if (owner.username) {
            ownerName = owner.username;
          } else if (owner.email) {
            ownerName = owner.email;
          }
          ownerEmail = owner.email || 'Unknown';
        }

        console.log(`🔍 Workspace ${workspace.name} (ID: ${workspace.id}) - AllMembers: ${allMembers.length}, ActiveMembers: ${activeMembers.length}`);
        
        return {
          id: workspace.id,
          name: workspace.name,
          uniqueId: workspace.uniqueId,
          description: workspace.description,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
          memberCount: allMembers.length,
          activeMemberCount: activeMembers.length,
          ownerId: organization?.ownerId || null,
          ownerName: ownerName,
          ownerEmail: ownerEmail
        };
      }));
      
      res.json(workspacesWithInfo);
    } catch (error: any) {
      console.error('Error fetching admin workspaces:', error);
      res.status(500).json({ message: 'Failed to fetch workspaces' });
    }
  });

  // Admin: Create workspace
  app.post('/api/admin/workspaces', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { name, description } = req.body;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Workspace name is required' });
      }
      
      // Get current organization context
      const { organizationId } = getCurrentContext(req);
      
      // Check for duplicate workspace name
      const existingWorkspace = await storage.getWorkspaceByName(name.trim());
      if (existingWorkspace) {
        return res.status(400).json({ message: 'A workspace with this name already exists' });
      }
      
      const workspace = await storage.createWorkspace({
        name: name.trim(),
        description: description?.trim() || null,
        organizationId: organizationId,
        organizationKey: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ownerUserId: req.user.id,
        uniqueId: `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Add the creator as an administrator member of the workspace
      await storage.createUserWorkspace({
        userId: req.user.id,
        workspaceId: workspace.id,
        role: 'administrator',
        isActive: true
      });
      
      res.json({ success: true, workspace });
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      res.status(500).json({ message: 'Failed to create workspace' });
    }
  });

  // Admin: Update workspace
  app.put('/api/admin/workspaces/:workspaceId', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { workspaceId } = req.params;
      const { name, description } = req.body;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Workspace name is required' });
      }
      
      // Check for duplicate workspace name (except for current workspace)
      const existingWorkspace = await storage.getWorkspaceByName(name.trim());
      if (existingWorkspace && existingWorkspace.id !== parseInt(workspaceId)) {
        return res.status(400).json({ message: 'A workspace with this name already exists' });
      }
      
      const updates = {
        name: name.trim(),
        description: description?.trim() || null,
        updatedAt: new Date()
      };
      
      const updatedWorkspace = await storage.updateWorkspace(parseInt(workspaceId), updates);
      
      if (!updatedWorkspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      res.json({ success: true, workspace: updatedWorkspace });
    } catch (error: any) {
      console.error('Error updating workspace:', error);
      res.status(500).json({ message: 'Failed to update workspace' });
    }
  });

  // Admin: Switch workspace
  app.post('/api/admin/workspaces/:workspaceId/switch', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { workspaceId } = req.params;
      const workspaceIdInt = parseInt(workspaceId);
      
      // Verify workspace exists and user has access
      const workspace = await storage.getWorkspace(workspaceIdInt);
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Update user's current workspace
      await storage.updateUserWorkspace(req.user.id, workspaceIdInt);
      
      // Update the session with the new workspace ID
      req.user.currentWorkspaceId = workspaceIdInt;
      req.user.lastWorkspaceId = workspaceIdInt;
      
      // Save session to ensure persistence
      req.session.save((err: any) => {
        if (err) {
          console.error('Error saving session:', err);
        }
      });
      
      res.json({ success: true, workspace });
    } catch (error: any) {
      console.error('Error switching workspace:', error);
      res.status(500).json({ message: 'Failed to switch workspace' });
    }
  });

  // Admin: Delete workspace
  app.delete('/api/admin/workspaces/:workspaceId', requireAuth, requireAdmin, async (req: any, res) => {
    try {
      const { workspaceId } = req.params;
      const workspaceIdInt = parseInt(workspaceId);
      
      // Cannot delete current workspace
      const currentWorkspaceId = getCurrentWorkspaceId(req);
      if (workspaceIdInt === currentWorkspaceId) {
        return res.status(400).json({ message: 'Cannot delete current workspace. Please switch to another workspace first.' });
      }
      
      // Check if workspace has multiple members (excluding the creator)
      const members = await storage.getWorkspaceMembers(workspaceIdInt);
      if (members.length > 1) {
        return res.status(400).json({ message: `Cannot delete workspace with ${members.length} members. Please remove members first.` });
      }
      
      await storage.deleteWorkspace(workspaceIdInt);
      res.json({ success: true, message: 'Workspace deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting workspace:', error);
      res.status(500).json({ message: 'Failed to delete workspace' });
    }
  });

  // Workspace Role Management API endpoints
  app.get('/api/workspace-roles', requireAuth, async (req: any, res) => {
    try {
      const roles = await storage.getWorkspaceRoles();
      res.json(roles);
    } catch (error: any) {
      console.error('Error fetching workspace roles:', error);
      res.status(500).json({ message: 'Failed to fetch workspace roles' });
    }
  });

  app.post('/api/workspace-roles', requireAuth, async (req: any, res) => {
    try {
      const { name, description, permissions } = req.body;
      
      if (!name || !description || !Array.isArray(permissions)) {
        return res.status(400).json({ message: 'Name, description, and permissions are required' });
      }

      const role = await storage.createWorkspaceRole({
        name,
        description,
        permissions
      });

      res.json(role);
    } catch (error: any) {
      console.error('Error creating workspace role:', error);
      res.status(500).json({ message: 'Failed to create workspace role' });
    }
  });

  app.get('/api/workspace-roles/:name', requireAuth, async (req: any, res) => {
    try {
      const { name } = req.params;
      const role = await storage.getWorkspaceRoleByName(name);
      
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }

      res.json(role);
    } catch (error: any) {
      console.error('Error fetching workspace role:', error);
      res.status(500).json({ message: 'Failed to fetch workspace role' });
    }
  });

  app.put('/api/workspace-roles/:id', requireAuth, async (req: any, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const { name, description, permissions } = req.body;
      
      if (isNaN(roleId)) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }

      const updates: any = {};
      if (name) updates.name = name;
      if (description) updates.description = description;
      if (Array.isArray(permissions)) updates.permissions = permissions;

      const role = await storage.updateWorkspaceRole(roleId, updates);
      
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }

      res.json(role);
    } catch (error: any) {
      console.error('Error updating workspace role:', error);
      res.status(500).json({ message: 'Failed to update workspace role' });
    }
  });

  app.delete('/api/workspace-roles/:id', requireAuth, async (req: any, res) => {
    try {
      const roleId = parseInt(req.params.id);
      
      if (isNaN(roleId)) {
        return res.status(400).json({ message: 'Invalid role ID' });
      }

      const deleted = await storage.deleteWorkspaceRole(roleId);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Role not found' });
      }

      res.json({ success: true, message: 'Role deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting workspace role:', error);
      res.status(500).json({ message: 'Failed to delete workspace role' });
    }
  });

  // User Workspace Role Management API endpoints
  app.get('/api/user-workspace-roles/:workspaceId', requireAuth, async (req: any, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      
      if (isNaN(workspaceId)) {
        return res.status(400).json({ message: 'Invalid workspace ID' });
      }

      const userRoles = await storage.getUserWorkspaceRolesByWorkspace(workspaceId);
      res.json(userRoles);
    } catch (error: any) {
      console.error('Error fetching user workspace roles:', error);
      res.status(500).json({ message: 'Failed to fetch user workspace roles' });
    }
  });

  // Get all workspace role assignments for all users in organization (for admin view)
  app.get('/api/admin/all-user-workspace-roles', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      
      // Check if user has admin privileges
      if (!(await hasAdminAccess(userId, organizationId))) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      // Get all users in the organization
      const organizationUsers = await storage.getUsersByOrganizationId(organizationId);
      
      // Get all workspace role assignments for users in this organization
      const allUserWorkspaceRoles = await storage.getAllUserWorkspaceRolesForOrganization(organizationId);
      
      // Group roles by user ID for easier frontend consumption
      const userRolesMap = new Map();
      
      for (const roleAssignment of allUserWorkspaceRoles) {
        const userId = roleAssignment.userId;
        if (!userRolesMap.has(userId)) {
          userRolesMap.set(userId, []);
        }
        userRolesMap.get(userId).push(roleAssignment);
      }
      
      // Convert map to object for JSON response
      const userRolesObject = Object.fromEntries(userRolesMap);
      
      res.json(userRolesObject);
    } catch (error: any) {
      console.error('Error fetching all user workspace roles:', error);
      res.status(500).json({ message: 'Failed to fetch all user workspace roles' });
    }
  });

  app.post('/api/user-workspace-roles', requireAuth, async (req: any, res) => {
    try {
      const { userId, workspaceId, roleId } = req.body;
      
      if (!userId || !workspaceId || !roleId) {
        return res.status(400).json({ message: 'User ID, workspace ID, and role ID are required' });
      }

      const currentUserId = req.user.id;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser || !currentUser.currentOrganizationId) {
        return res.status(400).json({ message: 'No organization context available' });
      }

      // Check if current user is organization owner
      const userOrganizations = await storage.getUserOrganizations(currentUserId);
      const userOrgRole = userOrganizations.find(uo => uo.organizationId === currentUser.currentOrganizationId);
      const isOrgOwner = userOrgRole && userOrgRole.role === 'owner';

      // If user is organization owner, allow assignment across all workspaces
      if (isOrgOwner) {
        // Verify the target workspace belongs to the same organization
        const targetWorkspace = await storage.getWorkspace(workspaceId);
        if (!targetWorkspace || targetWorkspace.organizationId !== currentUser.currentOrganizationId) {
          return res.status(403).json({ message: 'Target workspace does not belong to your organization' });
        }

        // Verify the target user belongs to the same organization
        const targetUserOrganization = await storage.getUserOrganization(userId, currentUser.currentOrganizationId);
        if (!targetUserOrganization) {
          return res.status(403).json({ message: 'Target user does not belong to your organization' });
        }

        // If user is not already a member of the workspace, add them first
        const existingMembership = await storage.getUserWorkspaceByIds(userId, workspaceId);
        if (!existingMembership) {
          await storage.addUserToWorkspace(userId, workspaceId, 'member');
        }
      } else {
        // For non-owners, verify current user has access to the workspace
        const currentUserWorkspace = await storage.getUserWorkspaceByIds(currentUserId, workspaceId);
        if (!currentUserWorkspace) {
          return res.status(403).json({ message: 'Access denied to this workspace' });
        }
      }

      const assignment = await storage.assignUserWorkspaceRole({
        userId,
        workspaceId,
        roleId,
        assignedByUserId: currentUserId
      });

      res.json(assignment);
    } catch (error: any) {
      console.error('Error assigning user workspace role:', error);
      res.status(500).json({ message: 'Failed to assign user workspace role' });
    }
  });

  app.delete('/api/user-workspace-roles/:userId/:workspaceId/:roleId', requireAuth, async (req: any, res) => {
    try {
      const { userId, workspaceId, roleId } = req.params;
      
      const workspaceIdInt = parseInt(workspaceId);
      const roleIdInt = parseInt(roleId);
      
      console.log('🔥 DELETE REQUEST - UserId:', userId, 'WorkspaceId:', workspaceIdInt, 'RoleId:', roleIdInt);
      
      if (isNaN(workspaceIdInt) || isNaN(roleIdInt)) {
        return res.status(400).json({ message: 'Invalid workspace ID or role ID' });
      }

      // Debug: Check what roles exist for this user in this workspace
      const existingRoles = await storage.getUserWorkspaceRolesByWorkspace(workspaceIdInt);
      const userRoles = existingRoles.filter((role: any) => role.userId === userId);
      console.log('🔍 Existing roles for user:', userRoles);

      const removed = await storage.removeUserWorkspaceRole(userId, workspaceIdInt, roleIdInt);
      console.log('🗑️ Remove result:', removed);
      
      if (!removed) {
        return res.status(404).json({ message: 'Role assignment not found' });
      }

      res.json({ success: true, message: 'Role assignment removed successfully' });
    } catch (error: any) {
      console.error('Error removing user workspace role:', error);
      res.status(500).json({ message: 'Failed to remove user workspace role' });
    }
  });

  app.get('/api/user-workspace-permissions/:userId/:workspaceId', requireAuth, async (req: any, res) => {
    try {
      const { userId, workspaceId } = req.params;
      
      const workspaceIdInt = parseInt(workspaceId);
      
      if (isNaN(workspaceIdInt)) {
        return res.status(400).json({ message: 'Invalid workspace ID' });
      }

      const permissions = await storage.getUserWorkspacePermissions(userId, workspaceIdInt);
      res.json({ permissions });
    } catch (error: any) {
      console.error('Error fetching user workspace permissions:', error);
      res.status(500).json({ message: 'Failed to fetch user workspace permissions' });
    }
  });

  app.post('/api/check-workspace-permission', requireAuth, async (req: any, res) => {
    try {
      const { userId, workspaceId, permission } = req.body;
      
      if (!userId || !workspaceId || !permission) {
        return res.status(400).json({ message: 'User ID, workspace ID, and permission are required' });
      }

      const hasPermission = await storage.hasWorkspacePermission(userId, workspaceId, permission);
      res.json({ hasPermission });
    } catch (error: any) {
      console.error('Error checking workspace permission:', error);
      res.status(500).json({ message: 'Failed to check workspace permission' });
    }
  });

  // Delete user completely endpoint
  app.delete('/api/admin/users/:userId/delete-completely', requireAuth, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id;
      const organizationId = getCurrentOrganizationId(req);
      
      console.log('🗑️ DELETE USER API - Received request for userId:', userId, 'from currentUser:', currentUserId);

      if (!userId || !currentUserId || !organizationId) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }

      // Verify admin access using hasAdminAccess function
      const adminAccess = await hasAdminAccess(currentUserId, organizationId);
      if (!adminAccess) {
        console.log('🗑️ DELETE USER API - Access denied for user:', currentUserId);
        return res.status(403).json({ message: 'Admin access required' });
      }

      // Check if target user is organization owner
      const organizationOwners = await storage.getOrganizationOwners(organizationId);
      const isTargetUserOwner = organizationOwners.some(owner => owner.userId === userId);
      
      if (isTargetUserOwner) {
        console.log('🗑️ DELETE USER API - Cannot delete organization owner:', userId);
        return res.status(403).json({ message: 'Cannot delete organization owners' });
      }

      // Check if current user is trying to delete themselves
      if (currentUserId === userId) {
        console.log('🗑️ DELETE USER API - User trying to delete themselves:', userId);
        return res.status(403).json({ message: 'Cannot delete your own account' });
      }

      console.log('🗑️ DELETE USER API - Starting deletion process for userId:', userId);

      // Step 1: Get user workspaces in this organization
      const userWorkspaces = await storage.getUserWorkspacesByOrganization(userId, organizationId);
      console.log('🗑️ DELETE USER API - Found user workspaces:', userWorkspaces.length);

      // Step 2: Delete all user content and data for each workspace
      for (const workspace of userWorkspaces) {
        const workspaceId = workspace.workspaceId;
        console.log('🗑️ DELETE USER API - Processing workspace:', workspaceId);

        try {
          // Delete posts and related content
          console.log('🗑️ DELETE USER API - Getting posts for user:', userId, 'workspace:', workspaceId);
          const posts = await storage.getPostsByUserId(userId, organizationId, workspaceId);
          console.log('🗑️ DELETE USER API - Found posts:', posts.length);
          
          for (const post of posts) {
            console.log('🗑️ DELETE USER API - Processing post:', post.id);
            
            // Delete schedule executions for this post's schedules
            console.log('🗑️ DELETE USER API - Getting schedules for user:', userId, 'workspace:', workspaceId);
            const schedules = await storage.getPostSchedulesByUserId(userId, workspaceId);
            for (const schedule of schedules) {
              if (schedule.postId === post.id) {
                console.log('🗑️ DELETE USER API - Deleting schedule executions for schedule:', schedule.id);
                await storage.deleteScheduleExecutions(schedule.id);
              }
            }
            
            // Delete published posts
            console.log('🗑️ DELETE USER API - Deleting published posts for post:', post.id);
            await storage.deletePublishedPosts(post.id);
            
            // Delete generated content
            console.log('🗑️ DELETE USER API - Deleting generated content for post:', post.id);
            await storage.deleteGeneratedContent(post.id);
            
            // Delete the post
            console.log('🗑️ DELETE USER API - Deleting post:', post.id, 'userId:', userId, 'orgId:', organizationId, 'workspaceId:', workspaceId);
            await storage.deletePost(post.id, userId, organizationId, workspaceId);
          }

          // Delete post schedules
          console.log('🗑️ DELETE USER API - Deleting remaining schedules');
          const schedules = await storage.getPostSchedulesByUserId(userId, workspaceId);
          for (const schedule of schedules) {
            console.log('🗑️ DELETE USER API - Deleting schedule:', schedule.id, 'userId:', userId, 'orgId:', organizationId, 'workspaceId:', workspaceId);
            await storage.deletePostSchedule(schedule.id, userId, organizationId, workspaceId);
          }

          // Delete templates
          console.log('🗑️ DELETE USER API - Deleting templates');
          const templates = await storage.getTemplatesByUserId(userId, organizationId, workspaceId);
          for (const template of templates) {
            console.log('🗑️ DELETE USER API - Deleting template:', template.id);
            await storage.deleteTemplate(template.id, userId, organizationId, workspaceId);
          }

          // Delete images
          console.log('🗑️ DELETE USER API - Deleting images');
          const images = await storage.getImagesByUserId(userId, organizationId, workspaceId);
          for (const image of images) {
            console.log('🗑️ DELETE USER API - Deleting image:', image.id);
            await storage.deleteImage(image.id, userId, workspaceId);
          }

          // Delete folders
          console.log('🗑️ DELETE USER API - Deleting folders');
          const folders = await storage.getFoldersByUserId(userId, organizationId, workspaceId);
          for (const folder of folders) {
            console.log('🗑️ DELETE USER API - Deleting folder:', folder.id);
            await storage.deleteFolder(folder.id, userId, workspaceId);
          }

          // Delete social media configs
          console.log('🗑️ DELETE USER API - Deleting social media configs');
          const socialConfigs = await storage.getSocialMediaConfigs(userId, workspaceId);
          for (const config of socialConfigs) {
            console.log('🗑️ DELETE USER API - Deleting social config:', config.id);
            await storage.deleteSocialMediaConfig(config.id, userId, workspaceId);
          }

          // Anonymize payment transactions
          console.log('🗑️ DELETE USER API - Anonymizing transactions');
          await storage.anonymizeUserTransactions(userId, workspaceId);
          
        } catch (error) {
          console.error('🗑️ DELETE USER API - Error in workspace processing:', error);
          throw error;
        }
      }

      // Step 3: Delete user workspace roles for this organization
      await storage.deleteUserWorkspaceRoles(userId, organizationId);

      // Step 4: Delete user workspace memberships for this organization
      await storage.deleteUserWorkspaces(userId, organizationId);

      // Step 5: Delete user organization membership
      await storage.deleteUserOrganization(userId, organizationId);

      // Step 6: Delete user invitations for this organization
      await storage.deleteUserInvitations(userId, organizationId);

      // Step 7: Check if user belongs to any other organizations
      const remainingOrganizations = await storage.getUserOrganizations(userId);
      
      // Step 8: If no other organizations, delete the user account completely
      if (remainingOrganizations.length === 0) {
        console.log('🗑️ DELETE USER API - User has no other organizations, deleting account:', userId);
        await storage.deleteUserAccount(userId);
      } else {
        console.log('🗑️ DELETE USER API - User belongs to other organizations, keeping account:', userId, 'OrgCount:', remainingOrganizations.length);
      }

      console.log('🗑️ DELETE USER API - Deletion completed for userId:', userId);
      res.json({ 
        success: true, 
        message: 'User completely deleted from organization',
        deletedAccount: remainingOrganizations.length === 0
      });

    } catch (error: any) {
      console.error('🗑️ DELETE USER API - Error:', error);
      res.status(500).json({ 
        message: 'Failed to delete user completely',
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
