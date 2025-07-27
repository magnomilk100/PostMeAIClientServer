import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertGeneratedContentSchema, insertPublishedPostSchema, insertTemplateSchema, localAuthSchema, insertImageSchema, type InsertImage } from "@shared/schema";
import { PaymentGatewayFactory, type PaymentData, validateCardNumber, validateCVV, validateExpiryDate } from "./paymentGateways";
import { z } from "zod";
import { setupAuth, requireAuth, optionalAuth } from "./auth";
import passport from "passport";
import multer from "multer";
import { generateVerificationToken, sendVerificationEmail, sendWelcomeEmail, generatePasswordResetToken, sendPasswordResetEmail } from "./email";


import dotenv from "dotenv";
dotenv.config();

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
        res.json({ user: req.user });
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
              <a href="${process.env.POSTMEAI_FE_URL}" 
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
              <a href="${process.env.POSTMEAI_FE_URL}" 
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
            <a href="${process.env.POSTMEAI_FE_URL}" 
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
            <a href="${process.env.POSTMEAI_FE_URL}" 
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
  // OAuth routes
  app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
  app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
    res.redirect("/");
  });

  app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  app.get("/auth/google/callback", (req, res, next) => {
    console.log("Google OAuth callback hit with query:", req.query);
    passport.authenticate("google", { failureRedirect: "/login" })(req, res, (err) => {
      if (err) {
        console.error("Google OAuth error:", err);
        return res.redirect("/login?error=oauth_failed");
      }
      console.log("Google OAuth success, user:", req.user);
      res.redirect("/");
    });
  });


// kick off the flow from CHAT GPT
  // OAuth endpoints
// — Kick off LinkedIn —
app.get("/auth/linkedin", passport.authenticate("linkedin-oidc"));

// — Custom callback so we can log err/user/info —
  // — Custom LinkedIn callback (only one!) —
// kick off the flow
//app.get("/auth/linkedin", passport.authenticate("linkedin-oidc"));

// callback
app.get(
  "/auth/linkedin/callback",
  passport.authenticate("linkedin-oidc", {
    failureRedirect: "/login",
    session: true,
  }),
  (req, res) => {
    const url = process.env.FRONTEND_URL || "http://localhost:5000";
    res.send(`
      <html><body>
      <script>
        if (window.opener) {
          window.opener.location.href = "${url}";
          window.close();
        } else {
          window.location.href = "${url}";
        }
      </script>
      </body></html>
    `);
  }
);
  /*
  app.get("/auth/linkedin", passport.authenticate("linkedin", { scope: ["openid", "profile", "email"] }));
  //app.get("/auth/linkedin", passport.authenticate("linkedin", { scope: ["r_liteprofile", "r_emailaddress"] }));
  app.get("/auth/linkedin/callback", (req, res, next) => {
    console.log("LinkedIn OAuth callback hit with query:", req.query);
    passport.authenticate("linkedin", { failureRedirect: "/login" })(req, res, (err) => {
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
*/


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

        const savedImage = await storage.createImage(imageData);
        
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
      const post = await storage.createPost(postData, user.id);
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
      
      // Create the post
      const post = await storage.createPost({
        ...postData,
        subject: `${title}: ${content.substring(0, 100)}...`,
        executionMode: "manual"
      }, user.id);

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
      });

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
  app.post("/api/posts/:id/generate", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      
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
      });

      res.json(generatedContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate content", error });
    }
  });

  // Get generated content for a post
  app.get("/api/posts/:id/content", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const content = await storage.getGeneratedContentByPostId(postId);
      
      if (!content) {
        return res.status(404).json({ message: "Generated content not found" });
      }

      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to get content", error });
    }
  });

  // Publish post to platforms
  app.post("/api/posts/:id/publish", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { platforms } = req.body;

      if (!Array.isArray(platforms)) {
        return res.status(400).json({ message: "Platforms must be an array" });
      }

      // Get the post to check if it's a manual post
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const publishedPost = await storage.createPublishedPost({
        postId,
        platforms
      });

      // Update post status
      await storage.updatePost(postId, { status: "published" });

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
      const template = await storage.createTemplate(templateData);
      res.json(template);
    } catch (error) {
      res.status(400).json({ message: "Invalid template data", error });
    }
  });

  // Get templates for user
  app.get("/api/templates", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const templates = await storage.getTemplatesByUserId(user.id);
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

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: "Folder name is required" });
      }

      const folder = await storage.createFolder({
        userId,
        name: name.trim(),
      });

      res.status(201).json(folder);
    } catch (error: any) {
      console.error("Error creating folder:", error);
      res.status(500).json({ message: error.message || "Failed to create folder" });
    }
  });

  app.get('/api/folders', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const folders = await storage.getFoldersByUserId(userId);
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

      const success = await storage.deleteFolder(folderId, userId);
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
      const { folder } = req.query;
      
      let images;
      if (folder && folder !== 'all') {
        images = await storage.getImagesByFolder(userId, folder as string);
      } else {
        images = await storage.getImagesByUserId(userId);
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
        
        const image = await storage.createImage(imageData);
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
          
          // Convert buffer to base64
          const base64Data = file.buffer.toString('base64');
          
          const imageData = {
            userId,
            filename: `upload-${Date.now()}-${file.originalname}`,
            originalName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            folder: folder === 'uncategorized' ? null : folder,
            binaryData: base64Data
          };
          
          const image = await storage.createImage(imageData);
          res.json(image);
        });
      } else {
        // For direct JSON uploads (like AI-generated images)
        const imageData = insertImageSchema.parse({
          ...req.body,
          userId,
          originalName: req.body.originalName || req.body.filename || 'ai-generated-image.png'
        });
        
        const image = await storage.createImage(imageData);
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
      const imageId = parseInt(req.params.id);
      
      const image = await storage.getImageById(imageId, userId);
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
      const imageId = parseInt(req.params.id);
      
      // First verify the image belongs to the user
      const existingImage = await storage.getImageById(imageId, userId);
      if (!existingImage) {
        return res.status(404).json({ message: 'Image not found' });
      }
      
      const updatedImage = await storage.updateImage(imageId, req.body);
      res.json(updatedImage);
    } catch (error: any) {
      console.error('Error updating image:', error);
      res.status(500).json({ message: 'Failed to update image' });
    }
  });

  app.delete('/api/images/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const imageId = parseInt(req.params.id);
      
      const deleted = await storage.deleteImage(imageId, userId);
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
      const imageData: InsertImage = {
        userId,
        filename,
        originalName: filename,
        mimeType: 'image/png',
        fileSize: Math.floor(Math.random() * 200000) + 50000, // Random size between 50KB-250KB
        folder: null, // Save as uncategorized
        binaryData: mockImageBase64
      };

      const image = await storage.createImage(imageData);
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
      const configs = await storage.getSocialMediaConfigs(userId);
      res.json(configs);
    } catch (error: any) {
      console.error("Error fetching social media configs:", error);
      res.status(500).json({ message: "Failed to fetch social media configurations" });
    }
  });

  app.post('/api/social-media-configs', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { platformId, isEnabled, apiKey } = req.body;

      if (!platformId) {
        return res.status(400).json({ message: "Platform ID is required" });
      }

      const config = await storage.upsertSocialMediaConfig({
        userId,
        platformId,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        apiKey: apiKey || null,
        testStatus: 'idle',
        testError: null,
        lastTestedAt: null,
      });

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
      const query = req.query.q as string;

      if (!query || query.length < 3) {
        return res.json([]);
      }

      const searchTerm = query.toLowerCase();
      const results: any[] = [];

      // Search templates
      const templates = await storage.getTemplatesByUserId(userId);
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
      const images = await storage.getImagesByUserId(userId);
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
      const socialConfigs = await storage.getSocialMediaConfigs(userId);
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
      `redirect_uri=${encodeURIComponent(process.env.POSTMEAI_FE_URL + '/auth/facebook/api-key/callback')}&` +
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
        `redirect_uri=${encodeURIComponent(process.env.POSTMEAI_FE_URL + '/auth/facebook/api-key/callback')}&` +
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
    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.POSTMEAI_FE_URL + '/auth/linkedin/api-key/callback')}&` +
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
          redirect_uri: process.env.POSTMEAI_FE_URL + '/auth/linkedin/api-key/callback'
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
  // User data deletion routes
  app.get('/api/user/data-summary', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get counts of all user data
      const posts = await storage.getPostsByUserId(userId);
      const images = await storage.getImagesByUserId(userId);
      const schedules = await storage.getPostSchedulesByUserId(userId);
      const socialConfigs = await storage.getSocialMediaConfigs(userId);
      const transactions = await storage.getPaymentTransactionsByUserId(userId);
      const templates = await storage.getTemplatesByUserId(userId);
      
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
      
      // 1. Delete schedule executions
      const schedules = await storage.getPostSchedulesByUserId(userId);
      for (const schedule of schedules) {
        await storage.deleteScheduleExecutions(schedule.id);
      }
      
      // 2. Delete post schedules
      for (const schedule of schedules) {
        await storage.deletePostSchedule(schedule.id, userId);
      }
      
      // 3. Delete published posts
      const posts = await storage.getPostsByUserId(userId);
      for (const post of posts) {
        await storage.deletePublishedPostsByPostId(post.id);
      }
      
      // 4. Delete generated content
      for (const post of posts) {
        await storage.deleteGeneratedContentByPostId(post.id);
      }
      
      // 5. Delete templates
      const templates = await storage.getTemplatesByUserId(userId);
      for (const template of templates) {
        await storage.deleteTemplate(template.id, userId);
      }
      
      // 6. Delete posts
      for (const post of posts) {
        await storage.deletePost(post.id, userId);
      }
      
      // 7. Delete images
      const images = await storage.getImagesByUserId(userId);
      for (const image of images) {
        await storage.deleteImage(image.id, userId);
      }
      
      // 8. Delete folders
      const folders = await storage.getFoldersByUserId(userId);
      for (const folder of folders) {
        await storage.deleteFolder(folder.id, userId);
      }
      
      // 9. Delete social media configs
      await storage.deleteSocialMediaConfigs(userId);
      
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
        await storage.updateSocialMediaConfigTestStatus(userId, platformId, 'failed', 'API key is required for testing');
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
      if (testResult.success) {
        await storage.upsertSocialMediaConfig({
          userId,
          platformId,
          isEnabled: true,
          apiKey: apiKey.trim(),
          testStatus: 'connected',
          testError: null,
          lastTestedAt: new Date(),
        });
        
        res.json({ 
          success: true, 
          message: `${platformId} connection successful`,
          userInfo: testResult.userInfo || null
        });
      } else {
        await storage.updateSocialMediaConfigTestStatus(userId, platformId, 'failed', testResult.error);
        res.status(400).json({ 
          success: false, 
          message: testResult.error || `${platformId} connection failed` 
        });
      }
    } catch (error: any) {
      console.error(`Error testing ${req.params.platformId} connection:`, error);
      await storage.updateSocialMediaConfigTestStatus(req.user.id, req.params.platformId, 'failed', error.message);
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
      const templates = await storage.getTemplatesByUserId(userId);
      
      // Enhance templates with post data and objective
      const enhancedTemplates = await Promise.all(
        templates.map(async (template) => {
          const post = await storage.getPost(template.postId);
          const generatedContent = await storage.getGeneratedContentByPostId(template.postId);
          
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
      const templateId = parseInt(req.params.id);
      
      const template = await storage.getTemplateById(templateId, userId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Get associated post and content data
      const post = await storage.getPost(template.postId);
      const generatedContent = await storage.getGeneratedContentByPostId(template.postId);
      
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
      const schedules = await storage.getPostSchedulesByUserId(req.user.id);
      
      // Add execution statistics to each schedule
      const schedulesWithStats = await Promise.all(schedules.map(async (schedule: any) => {
        const executions = await storage.getScheduleExecutionsByScheduleId(schedule.id, req.user.id);
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
      res.status(500).json({ error: "Failed to fetch post schedules" });
    }
  });

  app.post("/api/post-schedules", requireAuth, async (req: any, res) => {
    try {
      const scheduleData = {
        ...req.body,
        userId: req.user.id,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const schedule = await storage.createPostSchedule(scheduleData);
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post schedule" });
    }
  });

  app.get("/api/post-schedules/:id", requireAuth, async (req: any, res) => {
    try {
      const schedule = await storage.getPostScheduleById(parseInt(req.params.id), req.user.id);
      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post schedule" });
    }
  });

  app.put("/api/post-schedules/:id", requireAuth, async (req: any, res) => {
    try {
      const updates = {
        ...req.body,
        updatedAt: new Date(),
      };
      
      const schedule = await storage.updatePostSchedule(parseInt(req.params.id), updates, req.user.id);
      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to update post schedule" });
    }
  });

  app.delete("/api/post-schedules/:id", requireAuth, async (req: any, res) => {
    try {
      const success = await storage.deletePostSchedule(parseInt(req.params.id), req.user.id);
      if (!success) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post schedule" });
    }
  });

  // Toggle post schedule activation status
  app.post("/api/post-schedules/:id/toggle", requireAuth, async (req: any, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const updates = { isActive, updatedAt: new Date() };
      const schedule = await storage.updatePostSchedule(scheduleId, updates, req.user.id);
      
      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      
      res.json({
        success: true,
        message: `Schedule ${isActive ? 'activated' : 'deactivated'} successfully`,
        schedule
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle schedule status" });
    }
  });

  // Run post schedule immediately
  app.post("/api/post-schedules/:id/run", requireAuth, async (req: any, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const startTime = Date.now();
      
      // Get the schedule to verify ownership
      const schedule = await storage.getPostScheduleById(scheduleId, req.user.id);
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
      await storage.updatePostSchedule(scheduleId, updates, req.user.id);

      // Record execution in history
      await storage.createScheduleExecution({
        scheduleId: scheduleId,
        userId: req.user.id,
        status: "success",
        message: `Schedule executed successfully on ${schedule.selectedPlatforms.length} platforms`,
        platformsExecuted: schedule.selectedPlatforms,
        executionDuration: executionDuration
      });

      const executionResult = {
        scheduleId: scheduleId,
        executedAt: new Date(),
        platforms: schedule.selectedPlatforms,
        status: 'success',
        postsCreated: schedule.selectedPlatforms.length
      };

      res.json({
        success: true,
        message: `Schedule executed successfully on ${schedule.selectedPlatforms.length} platforms`,
        execution: executionResult
      });
    } catch (error) {
      // Record failed execution
      try {
        await storage.createScheduleExecution({
          scheduleId: parseInt(req.params.id),
          userId: req.user.id,
          status: "failed",
          message: error instanceof Error ? error.message : "Unknown error occurred",
          platformsExecuted: [],
          executionDuration: 0
        });
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
      const schedule = await storage.getPostScheduleById(scheduleId, req.user.id);
      
      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }

      const executions = await storage.getScheduleExecutionsByScheduleId(scheduleId, req.user.id);
      
      res.json(executions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch execution history" });
    }
  });
  const httpServer = createServer(app);
  return httpServer;
}
