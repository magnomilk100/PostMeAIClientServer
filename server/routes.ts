import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertGeneratedContentSchema, insertPublishedPostSchema, insertTemplateSchema, localAuthSchema, insertImageSchema, type InsertImage } from "@shared/schema";
import { PaymentGatewayFactory, type PaymentData, validateCardNumber, validateCVV, validateExpiryDate } from "./paymentGateways";
import { z } from "zod";
import { setupAuth, requireAuth, optionalAuth } from "./auth";
import passport from "passport";

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
  
  return {
    title: title,
    content: content
  };
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
  // Setup authentication
  setupAuth(app);

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = localAuthSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      const user = await storage.createLocalUser(userData);
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error after registration" });
        }
        res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid registration data", error });
    }
  });

  // app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
  //   res.json({ user: req.user });
  // });
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User, info: { message: any; }) => {
      console.log("[Route] /api/auth/login callback:", { err, user, info });
      if (err)   return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Unauthorized" });
      req.login(user, loginErr => {
        if (loginErr) {
          console.error("[Route] req.login error:", loginErr);
          return next(loginErr);
        }
        console.log("[Route] login succeeded, session:", req.sessionID);
        res.json({ user });
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
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // OAuth routes
  app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
  app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
    res.redirect("/");
  });

  app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    res.redirect("/");
  });

  app.get("/auth/linkedin", passport.authenticate("linkedin"));
  app.get("/auth/linkedin/callback", passport.authenticate("linkedin", { failureRedirect: "/login" }), (req, res) => {
    res.redirect("/");
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

  app.post('/api/images', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const imageData = insertImageSchema.parse({
        ...req.body,
        userId
      });
      
      const image = await storage.createImage(imageData);
      res.json(image);
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

  app.post('/api/social-media-configs/:platformId/test', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { platformId } = req.params;
      const { apiKey } = req.body;

      if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
        await storage.updateSocialMediaConfigTestStatus(userId, platformId, 'failed', 'API key is required for testing');
        return res.status(400).json({ 
          success: false, 
          error: 'API key is required for testing',
          status: 'failed'
        });
      }

      // Update status to testing
      await storage.updateSocialMediaConfigTestStatus(userId, platformId, 'testing');

      // Simulate API testing with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      // Mock different test results based on platform for demonstration
      const mockTestResults: Record<string, { success: boolean; error?: string }> = {
        facebook: { success: true },
        instagram: { success: true },
        linkedin: { success: true },
        tiktok: { success: false, error: 'Invalid API credentials' },
        youtube: { success: true },
        discord: { success: false, error: 'Token has expired' },
        telegram: { success: true },
      };

      const testResult = mockTestResults[platformId] || { success: true };

      if (testResult.success) {
        await storage.updateSocialMediaConfigTestStatus(userId, platformId, 'connected');
        res.json({ 
          success: true, 
          status: 'connected',
          message: `Successfully connected to ${platformId.charAt(0).toUpperCase() + platformId.slice(1)}`
        });
      } else {
        await storage.updateSocialMediaConfigTestStatus(userId, platformId, 'failed', testResult.error);
        res.json({ 
          success: false, 
          status: 'failed',
          error: testResult.error || 'Connection test failed'
        });
      }
    } catch (error: any) {
      console.error(`Error testing ${req.params.platformId} connection:`, error);
      await storage.updateSocialMediaConfigTestStatus(req.user.id, req.params.platformId, 'failed', 'Internal server error');
      res.status(500).json({ 
        success: false, 
        status: 'failed',
        error: 'Internal server error during connection test'
      });
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

  const httpServer = createServer(app);
  return httpServer;
}
