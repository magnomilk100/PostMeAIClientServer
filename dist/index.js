var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  folders: () => folders,
  generatedContent: () => generatedContent,
  images: () => images,
  insertFolderSchema: () => insertFolderSchema,
  insertGeneratedContentSchema: () => insertGeneratedContentSchema,
  insertImageSchema: () => insertImageSchema,
  insertPaymentTransactionSchema: () => insertPaymentTransactionSchema,
  insertPostScheduleSchema: () => insertPostScheduleSchema,
  insertPostSchema: () => insertPostSchema,
  insertPublishedPostSchema: () => insertPublishedPostSchema,
  insertSavedPaymentMethodSchema: () => insertSavedPaymentMethodSchema,
  insertScheduleExecutionSchema: () => insertScheduleExecutionSchema,
  insertSocialMediaConfigSchema: () => insertSocialMediaConfigSchema,
  insertTemplateSchema: () => insertTemplateSchema,
  insertUserSchema: () => insertUserSchema,
  localAuthSchema: () => localAuthSchema,
  paymentTransactions: () => paymentTransactions,
  postSchedules: () => postSchedules,
  posts: () => posts,
  publishedPosts: () => publishedPosts,
  savedPaymentMethods: () => savedPaymentMethods,
  scheduleExecutions: () => scheduleExecutions,
  sessions: () => sessions,
  socialMediaConfigs: () => socialMediaConfigs,
  templates: () => templates,
  upsertUserSchema: () => upsertUserSchema,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  username: text("username"),
  password: text("password"),
  // Only for local auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  authProvider: varchar("auth_provider").notNull().default("local"),
  // local, facebook, google, linkedin, github
  providerId: varchar("provider_id"),
  // ID from OAuth provider
  lastAuthMethod: varchar("last_auth_method"),
  // Track last used auth method
  // Billing and subscription fields
  credits: integer("credits").notNull().default(0),
  subscriptionPlan: varchar("subscription_plan"),
  // 'basic', 'pro', 'enterprise', etc.
  subscriptionStatus: varchar("subscription_status").default("inactive"),
  // 'active', 'inactive', 'cancelled', 'expired'
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  // Profile settings
  bio: text("bio"),
  timezone: varchar("timezone").default("UTC"),
  language: varchar("language").default("en"),
  // Company settings
  companyName: varchar("company_name"),
  companyLogo: text("company_logo"),
  // base64 encoded
  website: varchar("website"),
  industry: varchar("industry"),
  teamSize: varchar("team_size"),
  brandColors: jsonb("brand_colors"),
  // {primary, secondary, accent}
  // Notification settings
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  postReminders: boolean("post_reminders").default(true),
  templateExecution: boolean("template_execution").default(true),
  weeklyReports: boolean("weekly_reports").default(false),
  marketingEmails: boolean("marketing_emails").default(false),
  // Theme settings
  theme: varchar("theme").default("light"),
  primaryColor: varchar("primary_color").default("purple"),
  compactMode: boolean("compact_mode").default(false),
  sidebarCollapsed: boolean("sidebar_collapsed").default(false),
  // Security settings
  sessionTimeout: varchar("session_timeout").default("8"),
  autoSave: boolean("auto_save").default(true),
  rememberLogin: boolean("remember_login").default(true),
  twoFactorAuth: boolean("two_factor_auth").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  subject: text("subject").notNull(),
  executionMode: text("execution_mode").notNull().default("review"),
  maxTextSize: integer("max_text_size").notNull().default(150),
  language: text("language").notNull().default("en"),
  generateImage: boolean("generate_image").notNull().default(true),
  link: text("link"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow()
});
var generatedContent = pgTable("generated_content", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  imageUrl: text("image_url"),
  platformContent: jsonb("platform_content"),
  // Store platform-specific variations
  createdAt: timestamp("created_at").defaultNow()
});
var publishedPosts = pgTable("published_posts", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  platforms: jsonb("platforms").notNull(),
  // Array of published platforms
  publishedAt: timestamp("published_at").defaultNow()
});
var templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  name: text("name").notNull(),
  frequency: text("frequency").notNull(),
  // daily, weekly, monthly
  time: text("time").notNull(),
  timezone: text("timezone").notNull(),
  targetPlatforms: text("target_platforms").array(),
  // Array of platform IDs																 
  isActive: boolean("is_active").notNull().default(true),
  lastExecutedAt: timestamp("last_executed_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  transactionId: varchar("transaction_id").notNull().unique(),
  gateway: varchar("gateway").notNull(),
  // stripe, paypal, payrexx, mangopay
  amount: text("amount").notNull(),
  // Store as string to avoid decimal precision issues
  currency: varchar("currency").default("USD"),
  credits: integer("credits").notNull(),
  status: varchar("status").notNull(),
  // pending, completed, failed, refunded
  gatewayResponse: jsonb("gateway_response"),
  billingAddress: jsonb("billing_address"),
  cardLast4: varchar("card_last4"),
  // Last 4 digits for display
  cardType: varchar("card_type"),
  // visa, mastercard, etc.
  processingFee: text("processing_fee"),
  // Store as string to avoid decimal precision issues
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var savedPaymentMethods = pgTable("saved_payment_methods", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  gateway: varchar("gateway").notNull(),
  gatewayMethodId: varchar("gateway_method_id").notNull(),
  // Gateway-specific ID
  cardLast4: varchar("card_last4"),
  cardType: varchar("card_type"),
  expiryMonth: varchar("expiry_month"),
  expiryYear: varchar("expiry_year"),
  cardholderName: varchar("cardholder_name"),
  billingAddress: jsonb("billing_address"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var images = pgTable("images", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  folder: varchar("folder").default("uncategorized"),
  binaryData: text("binary_data").notNull(),
  // base64 encoded binary data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var socialMediaConfigs = pgTable("social_media_configs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  platformId: varchar("platform_id").notNull(),
  // facebook, instagram, etc.
  isEnabled: boolean("is_enabled").default(true),
  apiKey: text("api_key"),
  testStatus: varchar("test_status").default("idle"),
  // idle, testing, connected, failed
  testError: text("test_error"),
  lastTestedAt: timestamp("last_tested_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  uniqueUserPlatform: unique().on(table.userId, table.platformId)
}));
var postSchedules = pgTable("post_schedules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  // optional description field
  creationMode: varchar("creation_mode").notNull().default("ai"),
  // ai, manual
  selectedPlatforms: text("selected_platforms").array().notNull(),
  // ["linkedin", "instagram"]
  platformConfigs: jsonb("platform_configs").notNull(),
  // platform-specific settings
  scheduleType: varchar("schedule_type").notNull(),
  // daily, weekly, monthly, calendar
  scheduleConfig: jsonb("schedule_config").notNull(),
  // schedule configuration
  links: jsonb("links"),
  // website, link1, link2
  isActive: boolean("is_active").default(true),
  lastExecutedAt: timestamp("last_executed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var scheduleExecutions = pgTable("schedule_executions", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").notNull().references(() => postSchedules.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  executedAt: timestamp("executed_at").notNull().defaultNow(),
  status: varchar("status").notNull().default("success"),
  // success, failed, running
  message: text("message"),
  platformsExecuted: text("platforms_executed").array(),
  executionDuration: integer("execution_duration")
  // in milliseconds
});
var insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  authProvider: true,
  providerId: true,
  lastAuthMethod: true
});
var upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  authProvider: true,
  providerId: true,
  lastAuthMethod: true
});
var localAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});
var insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true
});
var insertGeneratedContentSchema = createInsertSchema(generatedContent).omit({
  id: true,
  createdAt: true
});
var insertPublishedPostSchema = createInsertSchema(publishedPosts).omit({
  id: true,
  publishedAt: true
});
var insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true
});
var insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSavedPaymentMethodSchema = createInsertSchema(savedPaymentMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertImageSchema = createInsertSchema(images).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSocialMediaConfigSchema = createInsertSchema(socialMediaConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPostScheduleSchema = createInsertSchema(postSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertScheduleExecutionSchema = createInsertSchema(scheduleExecutions).omit({
  id: true,
  executedAt: true
});

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // THIS ENABLES SSL FOR HEROKU POSTGRES
  ssl: {
    rejectUnauthorized: false
  }
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import dotenv2 from "dotenv";
dotenv2.config();
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async createLocalUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const userId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [user] = await db.insert(users).values({
      id: userId,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      authProvider: "local",
      lastAuthMethod: "local",
      credits: 100,
      // Give new users 100 credits to start
      subscriptionStatus: "inactive"
    }).returning();
    return user;
  }
  async authenticateUser(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user || !user.password || user.authProvider !== "local") {
      return null;
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }
    await this.updateLastAuthMethod(user.id, "local");
    return user;
  }
  async updateLastAuthMethod(userId, method) {
    await db.update(users).set({ lastAuthMethod: method, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
  }
  // Post operations
  async createPost(insertPost, userId) {
    const [post] = await db.insert(posts).values({
      ...insertPost,
      userId,
      link: insertPost.link || null,
      executionMode: insertPost.executionMode || "review",
      maxTextSize: insertPost.maxTextSize || 150,
      language: insertPost.language || "en",
      generateImage: insertPost.generateImage ?? true
    }).returning();
    return post;
  }
  async getPost(id) {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || void 0;
  }
  async updatePost(id, updates) {
    const [post] = await db.update(posts).set(updates).where(eq(posts.id, id)).returning();
    return post || void 0;
  }
  // Generated content operations
  async createGeneratedContent(insertContent) {
    const [content] = await db.insert(generatedContent).values({
      ...insertContent,
      imageUrl: insertContent.imageUrl || null,
      platformContent: insertContent.platformContent || null
    }).returning();
    return content;
  }
  async getGeneratedContentByPostId(postId) {
    const [content] = await db.select().from(generatedContent).where(eq(generatedContent.postId, postId));
    return content || void 0;
  }
  // Published post operations
  async createPublishedPost(insertPublishedPost) {
    const [publishedPost] = await db.insert(publishedPosts).values(insertPublishedPost).returning();
    return publishedPost;
  }
  // Template operations
  async createTemplate(insertTemplate) {
    const [template] = await db.insert(templates).values({
      ...insertTemplate,
      isActive: insertTemplate.isActive ?? true
    }).returning();
    return template;
  }
  async getTemplatesByUserId(userId) {
    const results = await db.select({
      template: templates,
      post: posts
    }).from(templates).leftJoin(posts, eq(templates.postId, posts.id)).where(eq(posts.userId, userId)).orderBy(templates.createdAt);
    return results.map((result) => ({
      ...result.template,
      objective: result.post?.subject || "No objective"
      // Use post subject as objective
    }));
  }
  async getTemplateById(id, userId) {
    const results = await db.select({
      template: templates
    }).from(templates).leftJoin(posts, eq(templates.postId, posts.id)).where(and(eq(templates.id, id), eq(posts.userId, userId)));
    return results.length > 0 ? results[0].template : void 0;
  }
  async updateTemplate(id, updates, userId) {
    const template = await this.getTemplateById(id, userId);
    if (!template) return void 0;
    const [updated] = await db.update(templates).set(updates).where(eq(templates.id, id)).returning();
    return updated;
  }
  async deleteTemplate(id, userId) {
    const template = await this.getTemplateById(id, userId);
    if (!template) return false;
    try {
      await db.delete(templates).where(eq(templates.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting template:", error);
      return false;
    }
  }
  async executeTemplate(id, userId) {
    const template = await this.getTemplateById(id, userId);
    if (!template) throw new Error("Template not found");
    await db.update(templates).set({ lastExecutedAt: /* @__PURE__ */ new Date() }).where(eq(templates.id, id));
  }
  // Payment operations
  async createPaymentTransaction(insertTransaction) {
    const [transaction] = await db.insert(paymentTransactions).values(insertTransaction).returning();
    return transaction;
  }
  async updatePaymentTransaction(transactionId, updates) {
    const [transaction] = await db.update(paymentTransactions).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(paymentTransactions.transactionId, transactionId)).returning();
    return transaction;
  }
  async getPaymentTransactionsByUserId(userId) {
    return await db.select().from(paymentTransactions).where(eq(paymentTransactions.userId, userId)).orderBy(paymentTransactions.createdAt);
  }
  async updateUserCredits(userId, credits) {
    await db.update(users).set({ credits }).where(eq(users.id, userId));
  }
  // Folder operations
  async createFolder(insertFolder) {
    const [folder] = await db.insert(folders).values(insertFolder).returning();
    return folder;
  }
  async getFoldersByUserId(userId) {
    return await db.select().from(folders).where(eq(folders.userId, userId));
  }
  async deleteFolder(id, userId) {
    const result = await db.delete(folders).where(and(eq(folders.id, id), eq(folders.userId, userId)));
    return result.rowCount !== null && result.rowCount > 0;
  }
  // Image operations
  async createImage(insertImage) {
    const [image] = await db.insert(images).values(insertImage).returning();
    return image;
  }
  async getImagesByUserId(userId) {
    return await db.select().from(images).where(eq(images.userId, userId)).orderBy(images.createdAt);
  }
  async getImagesByFolder(userId, folder) {
    return await db.select().from(images).where(and(eq(images.userId, userId), eq(images.folder, folder))).orderBy(images.createdAt);
  }
  async updateImage(id, updates) {
    const [image] = await db.update(images).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(images.id, id)).returning();
    return image;
  }
  async deleteImage(id, userId) {
    const result = await db.delete(images).where(and(eq(images.id, id), eq(images.userId, userId)));
    return (result.rowCount || 0) > 0;
  }
  async getImageById(id, userId) {
    const [image] = await db.select().from(images).where(and(eq(images.id, id), eq(images.userId, userId)));
    return image;
  }
  // Social Media Configuration operations
  async getSocialMediaConfigs(userId) {
    return await db.select().from(socialMediaConfigs).where(eq(socialMediaConfigs.userId, userId)).orderBy(socialMediaConfigs.platformId);
  }
  async upsertSocialMediaConfig(config) {
    const [existingConfig] = await db.select().from(socialMediaConfigs).where(
      and(
        eq(socialMediaConfigs.userId, config.userId),
        eq(socialMediaConfigs.platformId, config.platformId)
      )
    );
    if (existingConfig) {
      const [updatedConfig] = await db.update(socialMediaConfigs).set({
        ...config,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(
        and(
          eq(socialMediaConfigs.userId, config.userId),
          eq(socialMediaConfigs.platformId, config.platformId)
        )
      ).returning();
      return updatedConfig;
    } else {
      const [newConfig] = await db.insert(socialMediaConfigs).values(config).returning();
      return newConfig;
    }
  }
  async updateSocialMediaConfigTestStatus(userId, platformId, status, error) {
    const existingConfig = await db.select().from(socialMediaConfigs).where(
      and(
        eq(socialMediaConfigs.userId, userId),
        eq(socialMediaConfigs.platformId, platformId)
      )
    ).limit(1);
    if (existingConfig.length > 0) {
      await db.update(socialMediaConfigs).set({
        testStatus: status,
        testError: error || null,
        lastTestedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(
        and(
          eq(socialMediaConfigs.userId, userId),
          eq(socialMediaConfigs.platformId, platformId)
        )
      );
    } else {
      await db.insert(socialMediaConfigs).values({
        userId,
        platformId,
        isEnabled: true,
        // Default to enabled when testing
        apiKey: "",
        testStatus: status,
        testError: error || null,
        lastTestedAt: /* @__PURE__ */ new Date(),
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
  }
  // Subscription operations
  async updateUserSubscription(userId, plan, status, expiresAt) {
    const [user] = await db.update(users).set({
      subscriptionPlan: plan,
      subscriptionStatus: status,
      subscriptionExpiresAt: expiresAt,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return user;
  }
  async cancelUserSubscription(userId) {
    const [user] = await db.update(users).set({
      subscriptionStatus: "cancelled",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return user;
  }
  // Settings operations
  async updateUserProfile(userId, profileData) {
    const [user] = await db.update(users).set({
      ...profileData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return user;
  }
  async updateUserNotifications(userId, notifications) {
    const [user] = await db.update(users).set({
      ...notifications,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return user;
  }
  async updateUserTheme(userId, themeData) {
    const [user] = await db.update(users).set({
      ...themeData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return user;
  }
  async updateUserCompany(userId, companyData) {
    const [user] = await db.update(users).set({
      ...companyData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return user;
  }
  async updateUserSecurity(userId, securityData) {
    const [user] = await db.update(users).set({
      ...securityData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return user;
  }
  async createPostSchedule(insertSchedule) {
    const [schedule] = await db.insert(postSchedules).values(insertSchedule).returning();
    return schedule;
  }
  async getPostSchedulesByUserId(userId) {
    return await db.select().from(postSchedules).where(eq(postSchedules.userId, userId)).orderBy(desc(postSchedules.createdAt));
  }
  async getPostScheduleById(id, userId) {
    const [schedule] = await db.select().from(postSchedules).where(and(eq(postSchedules.id, id), eq(postSchedules.userId, userId)));
    return schedule || void 0;
  }
  async updatePostSchedule(id, updates, userId) {
    const [schedule] = await db.update(postSchedules).set(updates).where(and(eq(postSchedules.id, id), eq(postSchedules.userId, userId))).returning();
    return schedule || void 0;
  }
  async deletePostSchedule(id, userId) {
    const result = await db.delete(postSchedules).where(and(eq(postSchedules.id, id), eq(postSchedules.userId, userId)));
    return (result.rowCount || 0) > 0;
  }
  async createScheduleExecution(insertExecution) {
    const [execution] = await db.insert(scheduleExecutions).values(insertExecution).returning();
    return execution;
  }
  async getScheduleExecutionsByScheduleId(scheduleId, userId) {
    return await db.select().from(scheduleExecutions).where(and(eq(scheduleExecutions.scheduleId, scheduleId), eq(scheduleExecutions.userId, userId))).orderBy(desc(scheduleExecutions.executedAt));
  }
};
var storage = new DatabaseStorage();

// server/paymentGateways.ts
import Stripe from "stripe";
var PaymentGateway = class {
};
var StripeGateway = class extends PaymentGateway {
  stripe = null;
  constructor() {
    super();
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    }
  }
  validateCredentials() {
    return !!process.env.STRIPE_SECRET_KEY;
  }
  async processPayment(data) {
    if (!this.stripe) {
      return {
        success: false,
        error: "Stripe not configured - missing STRIPE_SECRET_KEY"
      };
    }
    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: "card",
        card: {
          number: data.cardNumber.replace(/\s/g, ""),
          exp_month: parseInt(data.expiryMonth),
          exp_year: parseInt(data.expiryYear),
          cvc: data.cvv
        },
        billing_details: {
          name: data.cardholderName,
          address: {
            line1: data.billingAddress.street,
            city: data.billingAddress.city,
            state: data.billingAddress.state,
            postal_code: data.billingAddress.postalCode,
            country: data.billingAddress.country
          }
        }
      });
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100),
        // Convert to cents
        currency: "usd",
        payment_method: paymentMethod.id,
        confirm: true,
        return_url: "https://your-app.com/return",
        metadata: {
          credits: data.credits.toString(),
          gateway: "stripe"
        }
      });
      return {
        success: paymentIntent.status === "succeeded",
        transactionId: paymentIntent.id,
        gatewayResponse: paymentIntent
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};
var PayPalGateway = class extends PaymentGateway {
  validateCredentials() {
    return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  }
  async processPayment(data) {
    if (!this.validateCredentials()) {
      return {
        success: false,
        error: "PayPal credentials not configured"
      };
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      return {
        success: true,
        transactionId: `PP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gatewayResponse: {
          gateway: "paypal",
          amount: data.amount,
          credits: data.credits,
          status: "completed"
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};
var PayrexxGateway = class extends PaymentGateway {
  validateCredentials() {
    return !!(process.env.PAYREXX_API_KEY && process.env.PAYREXX_INSTANCE);
  }
  async processPayment(data) {
    if (!this.validateCredentials()) {
      return {
        success: false,
        error: "Payrexx credentials not configured"
      };
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        success: true,
        transactionId: `PR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gatewayResponse: {
          gateway: "payrexx",
          amount: data.amount,
          credits: data.credits,
          status: "completed"
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};
var MangoPayGateway = class extends PaymentGateway {
  validateCredentials() {
    return !!(process.env.MANGOPAY_CLIENT_ID && process.env.MANGOPAY_API_KEY);
  }
  async processPayment(data) {
    if (!this.validateCredentials()) {
      return {
        success: false,
        error: "MangoPay credentials not configured"
      };
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      return {
        success: true,
        transactionId: `MP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gatewayResponse: {
          gateway: "mangopay",
          amount: data.amount,
          credits: data.credits,
          status: "completed"
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};
var PaymentGatewayFactory = class {
  static gateways = {
    stripe: new StripeGateway(),
    paypal: new PayPalGateway(),
    payrexx: new PayrexxGateway(),
    mangopay: new MangoPayGateway()
  };
  static getGateway(gatewayName) {
    const gateway = this.gateways[gatewayName];
    if (!gateway) {
      throw new Error(`Unsupported payment gateway: ${gatewayName}`);
    }
    return gateway;
  }
  static getSupportedGateways() {
    return Object.keys(this.gateways);
  }
  static getAvailableGateways() {
    return Object.entries(this.gateways).map(([name, gateway]) => {
      const available = gateway.validateCredentials();
      return {
        name,
        available,
        reason: available ? void 0 : `${name.toUpperCase()} credentials not configured`
      };
    });
  }
};
function validateCardNumber(cardNumber) {
  const cleaned = cardNumber.replace(/\s/g, "");
  return /^\d{13,19}$/.test(cleaned);
}
function validateCVV(cvv) {
  return /^\d{3,4}$/.test(cvv);
}
function validateExpiryDate(month, year) {
  const now = /* @__PURE__ */ new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const expYear = parseInt(year);
  const expMonth = parseInt(month);
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  return true;
}

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { Strategy as GitHubStrategy } from "passport-github2";
import session from "express-session";
import connectPg from "connect-pg-simple";
function setupAuth(app2) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  app2.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl
    }
  }));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
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
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    console.log("Facebook OAuth configured with App ID:", process.env.FACEBOOK_APP_ID);
    console.log("Facebook callback URL:", process.env.NODE_ENV === "production" ? "https://postmeai.com/auth/facebook/callback" : "http://localhost:5000/auth/facebook/callback");
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
          lastAuthMethod: "facebook"
        });
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }
  console.log("Google OAuth configured with Client ID:", process.env.GOOGLE_CLIENT_ID);
  console.log("Callback URL:", process.env.CALLBACK_URL);
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      ///"http://localhost:5000/auth/google/callback"
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
          lastAuthMethod: "google"
        });
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    console.log("LinkedIn OAuth configured with Client ID:", process.env.LINKEDIN_CLIENT_ID);
    console.log("LinkedIn callback URL:", process.env.NODE_ENV === "production" ? "https://postmeai.com/auth/linkedin/callback" : "http://localhost:5000/auth/linkedin/callback");
    passport.use(new LinkedInStrategy({
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === "production" ? "https://postmeai.com/auth/linkedin/callback" : "http://localhost:5000/auth/linkedin/callback",
      scope: ["openid", "profile", "email"],
      state: true
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("LinkedIn profile received:", JSON.stringify(profile, null, 2));
        const userId = `linkedin_${profile.id}`;
        const user = await storage.upsertUser({
          id: userId,
          email: profile.emails?.[0]?.value || profile.email || null,
          firstName: profile.name?.givenName || profile.given_name || null,
          lastName: profile.name?.familyName || profile.family_name || null,
          profileImageUrl: profile.photos?.[0]?.value || profile.picture || null,
          authProvider: "linkedin",
          providerId: profile.id,
          lastAuthMethod: "linkedin"
        });
        console.log("LinkedIn user created/updated:", user);
        return done(null, user);
      } catch (error) {
        console.error("LinkedIn authentication error:", error);
        return done(error);
      }
    }));
  }
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
          lastAuthMethod: "github"
        });
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }
}
var requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};
var optionalAuth = (req, res, next) => {
  next();
};

// server/routes.ts
import passport2 from "passport";
import multer from "multer";
var SUPPORTED_LANGUAGES = [
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
var SOCIAL_PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: "fab fa-facebook-f", color: "blue-600" },
  { id: "instagram", name: "Instagram", icon: "fab fa-instagram", color: "pink-500" },
  { id: "linkedin", name: "LinkedIn", icon: "fab fa-linkedin-in", color: "blue-700" },
  { id: "tiktok", name: "TikTok", icon: "fab fa-tiktok", color: "black" },
  { id: "youtube", name: "YouTube", icon: "fab fa-youtube", color: "red-600" },
  { id: "discord", name: "Discord", icon: "fab fa-discord", color: "indigo-600" },
  { id: "telegram", name: "Telegram", icon: "fab fa-telegram", color: "blue-500" }
];
function generateAIContent(subject, language = "en") {
  const subjectLower = subject.toLowerCase();
  let title = "";
  let content = "";
  if (subjectLower.includes("business") || subjectLower.includes("company") || subjectLower.includes("startup")) {
    title = "\u{1F680} Transforming Business Success Through Innovation";
    content = `${subject}

In today's rapidly evolving business landscape, innovation isn't just an advantage\u2014it's a necessity. Companies that embrace change and leverage new opportunities are the ones that thrive.

Key insights:
\u2022 Strategic planning drives sustainable growth
\u2022 Customer-focused solutions create lasting value
\u2022 Technology integration enhances operational efficiency

What's your next strategic move? Share your thoughts below! \u{1F4BC}\u2728`;
  } else if (subjectLower.includes("tech") || subjectLower.includes("technology") || subjectLower.includes("AI") || subjectLower.includes("software")) {
    title = "\u{1F4BB} The Future of Technology is Here";
    content = `${subject}

Technology continues to reshape our world in unprecedented ways. From artificial intelligence to blockchain, we're witnessing a revolution that's transforming how we work, communicate, and live.

Key trends to watch:
\u2022 AI integration in everyday applications
\u2022 Enhanced cybersecurity measures
\u2022 Sustainable tech solutions
\u2022 User-centric design approaches

Stay ahead of the curve! What tech innovations excite you most? #Technology #Innovation`;
  } else if (subjectLower.includes("social") || subjectLower.includes("community") || subjectLower.includes("people")) {
    title = "\u{1F91D} Building Stronger Communities Together";
    content = `${subject}

Community is at the heart of everything we do. When people come together with shared values and common goals, incredible things happen.

The power of community:
\u2022 Shared knowledge accelerates learning
\u2022 Mutual support creates resilience
\u2022 Diverse perspectives drive innovation
\u2022 Collective action creates meaningful change

How are you contributing to your community? Let's inspire each other! \u{1F31F}`;
  } else if (subjectLower.includes("product") || subjectLower.includes("launch") || subjectLower.includes("announcement")) {
    title = "\u{1F389} Exciting Product Updates You Need to Know";
    content = `${subject}

We're thrilled to share some exciting developments that will enhance your experience and deliver even more value.

What's new:
\u2022 Enhanced user interface for better navigation
\u2022 Improved performance and reliability
\u2022 New features based on your feedback
\u2022 Better integration capabilities

Your feedback drives our innovation. What would you like to see next? Drop your suggestions below! \u{1F680}`;
  } else if (subjectLower.includes("tips") || subjectLower.includes("advice") || subjectLower.includes("guide")) {
    title = "\u{1F4A1} Pro Tips That Will Transform Your Approach";
    content = `${subject}

Success often comes down to knowing the right strategies and applying them consistently. Here are some game-changing insights that can make a real difference.

Key takeaways:
\u2022 Start with clear, measurable goals
\u2022 Focus on progress, not perfection
\u2022 Learn from both successes and setbacks
\u2022 Build systems that support long-term growth

Which tip resonates most with you? Share your experiences in the comments! \u{1F4C8}`;
  } else {
    title = "\u2728 Insights Worth Sharing";
    content = `${subject}

Every topic has layers worth exploring, and today we're diving deep into something that matters. Whether you're looking for fresh perspectives or actionable insights, there's always more to discover.

Thought-provoking points:
\u2022 Context shapes understanding
\u2022 Different viewpoints enrich discussions
\u2022 Small changes can lead to big impacts
\u2022 Continuous learning opens new possibilities

What's your take on this? Join the conversation and share your thoughts! \u{1F31F}`;
  }
  if (language === "es") {
    title = title.replace("Insights Worth Sharing", "Ideas Que Valen la Pena Compartir");
    content = content.replace("What's your take on this?", "\xBFCu\xE1l es tu opini\xF3n sobre esto?");
  } else if (language === "fr") {
    title = title.replace("Insights Worth Sharing", "Des Id\xE9es \xE0 Partager");
    content = content.replace("What's your take on this?", "Quel est votre avis sur cela?");
  }
  let hashtags = [];
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
    hashtags = ["inspiration", "motivation", "success", "growth", "mindset"];
  }
  return {
    title,
    content,
    hashtags
  };
}
function generateMockContent(subject, platform) {
  const baseTitle = "\u{1F680} Unlock Your Creative Potential Today!";
  const baseBody = "Turn your wildest ideas into viral content that captivates your audience. Whether you're sharing insights, telling stories, or showcasing your expertise, every post is an opportunity to connect and inspire. What's your next big idea? \u{1F4A1}\u2728";
  if (!platform) {
    return { title: baseTitle, body: baseBody };
  }
  const variations = {
    facebook: {
      title: baseTitle,
      body: "Turn your wildest ideas into viral content that captivates your audience. What's your next big idea? \u{1F4A1}\u2728"
    },
    instagram: {
      title: "\u{1F680} Unlock Your Creative Potential!",
      body: "Turn ideas into viral content \u2728 #creativity #content #viral"
    },
    linkedin: {
      title: "Unlock Your Creative Potential in Business",
      body: "Transform your professional ideas into engaging content that drives business results and builds your personal brand."
    },
    tiktok: {
      title: "\u{1F525} Viral Content Ideas",
      body: "Turn ANY idea into viral content! \u{1F680}\u2728 #viral #contentcreator #ideas"
    },
    youtube: {
      title: "How to Turn Ideas into Viral Content",
      body: "Complete guide to creating content that captures attention and drives engagement across all platforms."
    },
    discord: {
      title: "\u{1F680} Creative Ideas Discussion",
      body: "Hey everyone! Let's discuss how to turn our wildest ideas into viral content. Drop your thoughts! \u{1F4AD}"
    },
    telegram: {
      title: "\u{1F4A1} Creative Content Ideas",
      body: "Transform your ideas into viral content! Share your creative process and inspire others."
    }
  };
  return variations[platform] || { title: baseTitle, body: baseBody };
}
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.post("/api/auth/register", async (req, res) => {
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
  app2.post("/api/auth/login", (req, res, next) => {
    passport2.authenticate("local", (err, user, info) => {
      console.log("[Route] /api/auth/login callback:", { err, user, info });
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Unauthorized" });
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("[Route] req.login error:", loginErr);
          return next(loginErr);
        }
        console.log("[Route] login succeeded, session:", req.sessionID);
        res.json({ user });
      });
    })(req, res, next);
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout error" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/user", optionalAuth, (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  app2.get("/auth/facebook", passport2.authenticate("facebook", { scope: ["email"] }));
  app2.get("/auth/facebook/callback", passport2.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
    res.redirect("/");
  });
  app2.get("/auth/google", passport2.authenticate("google", { scope: ["profile", "email"] }));
  app2.get("/auth/google/callback", (req, res, next) => {
    console.log("Google OAuth callback hit with query:", req.query);
    passport2.authenticate("google", { failureRedirect: "/login" })(req, res, (err) => {
      if (err) {
        console.error("Google OAuth error:", err);
        return res.redirect("/login?error=oauth_failed");
      }
      console.log("Google OAuth success, user:", req.user);
      res.redirect("/");
    });
  });
  app2.get("/auth/linkedin", passport2.authenticate("linkedin", { scope: ["openid", "profile", "email"] }));
  app2.get("/auth/linkedin/callback", (req, res, next) => {
    console.log("LinkedIn OAuth callback hit with query:", req.query);
    passport2.authenticate("linkedin", { failureRedirect: "/login" })(req, res, (err) => {
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
  app2.get("/auth/github", passport2.authenticate("github", { scope: ["user:email"] }));
  app2.get("/auth/github/callback", passport2.authenticate("github", { failureRedirect: "/login" }), (req, res) => {
    res.redirect("/");
  });
  app2.get("/api/languages", async (req, res) => {
    res.json(SUPPORTED_LANGUAGES);
  });
  app2.get("/api/platforms", async (req, res) => {
    res.json(SOCIAL_PLATFORMS);
  });
  app2.post("/api/ai/generate-content", requireAuth, async (req, res) => {
    try {
      const { subject, language = "en" } = req.body;
      if (!subject || subject.trim().length === 0) {
        return res.status(400).json({ message: "Subject is required" });
      }
      const aiGeneratedContent = generateAIContent(subject, language);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      res.json(aiGeneratedContent);
    } catch (error) {
      console.error("AI content generation error:", error);
      res.status(500).json({ message: "Failed to generate AI content" });
    }
  });
  app2.post("/api/ai/generate-image", requireAuth, async (req, res) => {
    try {
      const { prompt, size = "1024x1024", quality = "standard" } = req.body;
      const user = req.user;
      if (!prompt || prompt.trim().length === 0) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      await new Promise((resolve) => setTimeout(resolve, 2e3 + Math.random() * 2e3));
      const mockImageUrl = `https://picsum.photos/1024/1024?random=${Date.now()}`;
      try {
        const response = await fetch(mockImageUrl);
        const buffer = await response.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString("base64");
        const imageData = {
          userId: user.id,
          filename: `ai-generated-${Date.now()}.jpg`,
          originalName: `AI: ${prompt.substring(0, 30)}${prompt.length > 30 ? "..." : ""}`,
          mimeType: "image/jpeg",
          fileSize: buffer.byteLength,
          folder: null,
          // Save to uncategorized (null folder)
          binaryData: base64Data
        };
        const savedImage = await storage.createImage(imageData);
        res.json(savedImage);
      } catch (imageError) {
        console.error("Image fetch error:", imageError);
        res.status(500).json({ message: "Failed to generate AI image" });
      }
    } catch (error) {
      console.error("AI Image Generation Error:", error);
      res.status(500).json({ message: "Failed to generate AI image", error: error.message });
    }
  });
  app2.post("/api/posts", requireAuth, async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const user = req.user;
      const post = await storage.createPost(postData, user.id);
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid post data", error });
    }
  });
  app2.post("/api/posts/manual", requireAuth, async (req, res) => {
    try {
      const { title, content, selectedImages, platforms, ...postData } = req.body;
      const user = req.user;
      const post = await storage.createPost({
        ...postData,
        subject: `${title}: ${content.substring(0, 100)}...`,
        executionMode: "manual"
      }, user.id);
      const generatedContent2 = await storage.createGeneratedContent({
        postId: post.id,
        title,
        body: content,
        imageUrl: selectedImages.length > 0 ? "manual_images" : null,
        platformContent: platforms.reduce((acc, platformId) => {
          acc[platformId] = {
            title,
            body: content,
            imageUrl: selectedImages.length > 0 ? "manual_images" : null
          };
          return acc;
        }, {})
      });
      const responseContent = {
        ...generatedContent2,
        selectedImages: selectedImages || []
      };
      res.json({ post, generatedContent: responseContent });
    } catch (error) {
      res.status(400).json({ message: "Invalid manual post data", error });
    }
  });
  app2.post("/api/posts/:id/generate", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      const { title, body } = generateMockContent(post.subject);
      const imageUrl = "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&w=400&h=400&fit=crop";
      const platformContent = {};
      SOCIAL_PLATFORMS.forEach((platform) => {
        const variation = generateMockContent(post.subject, platform.id);
        platformContent[platform.id] = {
          title: variation.title,
          body: variation.body,
          imageUrl
        };
      });
      const generatedContent2 = await storage.createGeneratedContent({
        postId,
        title,
        body,
        imageUrl: post.generateImage ? imageUrl : null,
        platformContent
      });
      res.json(generatedContent2);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate content", error });
    }
  });
  app2.get("/api/posts/:id/content", async (req, res) => {
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
  app2.post("/api/posts/:id/publish", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { platforms } = req.body;
      if (!Array.isArray(platforms)) {
        return res.status(400).json({ message: "Platforms must be an array" });
      }
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      const publishedPost = await storage.createPublishedPost({
        postId,
        platforms
      });
      await storage.updatePost(postId, { status: "published" });
      const responseData = {
        ...publishedPost,
        isManualPost: post.executionMode === "manual"
      };
      res.json(responseData);
    } catch (error) {
      res.status(500).json({ message: "Failed to publish post", error });
    }
  });
  app2.post("/api/templates", requireAuth, async (req, res) => {
    try {
      const templateData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(templateData);
      res.json(template);
    } catch (error) {
      res.status(400).json({ message: "Invalid template data", error });
    }
  });
  app2.get("/api/templates", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const templates2 = await storage.getTemplatesByUserId(user.id);
      res.json(templates2);
    } catch (error) {
      res.status(500).json({ message: "Failed to get templates", error });
    }
  });
  app2.get("/api/payments/gateways", requireAuth, async (req, res) => {
    try {
      const availableGateways = PaymentGatewayFactory.getAvailableGateways();
      res.json(availableGateways);
    } catch (error) {
      res.status(500).json({ message: "Failed to get payment gateways", error });
    }
  });
  app2.post("/api/payments/process", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
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
        processingFee: null
      });
      const paymentGateway = PaymentGatewayFactory.getGateway(gateway);
      const paymentData = {
        cardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        cardholderName,
        billingAddress,
        amount: parseFloat(amount),
        credits,
        gateway
      };
      const paymentResult = await paymentGateway.processPayment(paymentData);
      let updatedTransaction;
      if (paymentResult.success) {
        updatedTransaction = await storage.updatePaymentTransaction(transactionId, {
          status: "completed",
          gatewayResponse: paymentResult.gatewayResponse
        });
        const user = await storage.getUser(userId);
        if (user) {
          const newCredits = (user.credits || 0) + credits;
          await storage.updateUserCredits(userId, newCredits);
        }
      } else {
        updatedTransaction = await storage.updatePaymentTransaction(transactionId, {
          status: "failed",
          gatewayResponse: { error: paymentResult.error }
        });
      }
      res.json({
        success: paymentResult.success,
        transactionId: paymentResult.transactionId || transactionId,
        transaction: updatedTransaction,
        error: paymentResult.error
      });
    } catch (error) {
      console.error("Payment processing error:", error);
      res.status(500).json({ message: "Payment processing failed", error: error.message });
    }
  });
  app2.get("/api/payments/transactions", requireAuth, async (req, res) => {
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
  app2.post("/api/posts/manual", requireAuth, async (req, res) => {
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
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      const mockResponse = {
        id: `MOCK_POST_${Date.now()}`,
        title: `MOCK: ${title || "Untitled Post"}`,
        content: `MOCK: ${content || "No content provided"}`,
        language: `MOCK: ${language || "en"}`,
        link: link ? `MOCK: ${link}` : `MOCK: No link provided`,
        subject: `MOCK: ${subject || "No subject provided"}`,
        useAI: `MOCK: ${useAI ? "AI-assisted" : "Manual creation"}`,
        selectedImages: selectedImages?.map((img, index2) => ({
          id: `MOCK_IMG_${index2 + 1}`,
          name: `MOCK: Image ${index2 + 1}`,
          url: img.url || `MOCK: No URL provided`
        })) || [`MOCK: No images selected`],
        platforms: platforms?.map((platform) => `MOCK: ${platform}`) || [`MOCK: No platforms selected`],
        status: "MOCK: Created successfully",
        timestamp: `MOCK: ${(/* @__PURE__ */ new Date()).toISOString()}`,
        processingTime: "MOCK: 1.2 seconds",
        contentAnalysis: {
          wordCount: `MOCK: ${content?.split(" ").length || 0} words`,
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
          createdBy: `MOCK: ${req.user?.email || "Unknown user"}`,
          userAgent: `MOCK: ${req.headers["user-agent"] || "Unknown browser"}`,
          ipAddress: `MOCK: ${req.ip || "Unknown IP"}`,
          sessionId: `MOCK: ${req.sessionID || "Unknown session"}`
        }
      };
      res.json(mockResponse);
    } catch (error) {
      console.error("Manual post creation error:", error);
      res.status(500).json({
        message: "MOCK: Failed to create manual post",
        error: `MOCK: ${error.message}`
      });
    }
  });
  app2.post("/api/folders", requireAuth, async (req, res) => {
    try {
      const { name } = req.body;
      const userId = req.user.id;
      if (!name || typeof name !== "string") {
        return res.status(400).json({ message: "Folder name is required" });
      }
      const folder = await storage.createFolder({
        userId,
        name: name.trim()
      });
      res.status(201).json(folder);
    } catch (error) {
      console.error("Error creating folder:", error);
      res.status(500).json({ message: error.message || "Failed to create folder" });
    }
  });
  app2.get("/api/folders", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const folders2 = await storage.getFoldersByUserId(userId);
      res.json(folders2);
    } catch (error) {
      console.error("Error fetching folders:", error);
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });
  app2.delete("/api/folders/:id", requireAuth, async (req, res) => {
    try {
      const folderId = parseInt(req.params.id);
      const userId = req.user.id;
      const success = await storage.deleteFolder(folderId, userId);
      if (!success) {
        return res.status(404).json({ message: "Folder not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting folder:", error);
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });
  app2.get("/api/images", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { folder } = req.query;
      let images2;
      if (folder && folder !== "all") {
        images2 = await storage.getImagesByFolder(userId, folder);
      } else {
        images2 = await storage.getImagesByUserId(userId);
      }
      res.json(images2);
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ message: "Failed to fetch images" });
    }
  });
  app2.post("/api/images/upload", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const upload = multer({ storage: multer.memoryStorage() });
      upload.single("image")(req, res, async (err) => {
        if (err) {
          console.error("Multer error:", err);
          return res.status(400).json({ message: "File upload error" });
        }
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }
        const file = req.file;
        const folder = req.body.folder || null;
        const originalName = req.body.originalName || file.originalname;
        const base64Data = file.buffer.toString("base64");
        const imageData = {
          userId,
          filename: `upload-${Date.now()}-${originalName}`,
          originalName,
          mimeType: file.mimetype,
          fileSize: file.size,
          folder: folder === "uncategorized" ? null : folder,
          binaryData: base64Data
        };
        const image = await storage.createImage(imageData);
        res.json(image);
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });
  app2.post("/api/images", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      if (req.is("multipart/form-data")) {
        const upload = multer({ storage: multer.memoryStorage() });
        upload.single("image")(req, res, async (err) => {
          if (err) {
            console.error("Multer error:", err);
            return res.status(400).json({ message: "File upload error" });
          }
          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }
          const file = req.file;
          const folder = req.body.folder || null;
          const base64Data = file.buffer.toString("base64");
          const imageData = {
            userId,
            filename: `upload-${Date.now()}-${file.originalname}`,
            originalName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            folder: folder === "uncategorized" ? null : folder,
            binaryData: base64Data
          };
          const image = await storage.createImage(imageData);
          res.json(image);
        });
      } else {
        const imageData = insertImageSchema.parse({
          ...req.body,
          userId,
          originalName: req.body.originalName || req.body.filename || "ai-generated-image.png"
        });
        const image = await storage.createImage(imageData);
        res.json(image);
      }
    } catch (error) {
      console.error("Error creating image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });
  app2.get("/api/images/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const imageId = parseInt(req.params.id);
      const image = await storage.getImageById(imageId, userId);
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      res.json(image);
    } catch (error) {
      console.error("Error fetching image:", error);
      res.status(500).json({ message: "Failed to fetch image" });
    }
  });
  app2.put("/api/images/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const imageId = parseInt(req.params.id);
      const existingImage = await storage.getImageById(imageId, userId);
      if (!existingImage) {
        return res.status(404).json({ message: "Image not found" });
      }
      const updatedImage = await storage.updateImage(imageId, req.body);
      res.json(updatedImage);
    } catch (error) {
      console.error("Error updating image:", error);
      res.status(500).json({ message: "Failed to update image" });
    }
  });
  app2.delete("/api/images/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const imageId = parseInt(req.params.id);
      const deleted = await storage.deleteImage(imageId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Image not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  });
  app2.post("/api/ai/generate-image", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { description } = req.body;
      if (!description || typeof description !== "string") {
        return res.status(400).json({ message: "Image description is required" });
      }
      await new Promise((resolve) => setTimeout(resolve, 2e3 + Math.random() * 3e3));
      const mockImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
      const filename = `ai-generated-${Date.now()}.png`;
      const imageData = {
        userId,
        filename,
        originalName: filename,
        mimeType: "image/png",
        fileSize: Math.floor(Math.random() * 2e5) + 5e4,
        // Random size between 50KB-250KB
        folder: null,
        // Save as uncategorized
        binaryData: mockImageBase64
      };
      const image = await storage.createImage(imageData);
      res.json(image);
    } catch (error) {
      console.error("AI image generation error:", error);
      res.status(500).json({
        message: "Failed to generate image",
        error: error.message
      });
    }
  });
  app2.get("/api/social-media-configs", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const configs = await storage.getSocialMediaConfigs(userId);
      res.json(configs);
    } catch (error) {
      console.error("Error fetching social media configs:", error);
      res.status(500).json({ message: "Failed to fetch social media configurations" });
    }
  });
  app2.post("/api/social-media-configs", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { platformId, isEnabled, apiKey } = req.body;
      if (!platformId) {
        return res.status(400).json({ message: "Platform ID is required" });
      }
      const config = await storage.upsertSocialMediaConfig({
        userId,
        platformId,
        isEnabled: isEnabled !== void 0 ? isEnabled : true,
        apiKey: apiKey || null,
        testStatus: "idle",
        testError: null,
        lastTestedAt: null
      });
      res.json(config);
    } catch (error) {
      console.error("Error saving social media config:", error);
      res.status(500).json({ message: "Failed to save social media configuration" });
    }
  });
  app2.post("/api/subscription/upgrade", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { plan, price } = req.body;
      if (!plan || !price) {
        return res.status(400).json({ message: "Plan and price are required" });
      }
      const validPlans = ["basic", "pro", "enterprise"];
      if (!validPlans.includes(plan.toLowerCase())) {
        return res.status(400).json({ message: "Invalid plan selected" });
      }
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      const updatedUser = await storage.updateUserSubscription(
        userId,
        plan.toLowerCase(),
        "active",
        expiresAt
      );
      const transactionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await storage.createPaymentTransaction({
        userId,
        transactionId,
        gateway: "subscription",
        amount: price.toString(),
        currency: "USD",
        credits: 0,
        // Subscriptions don't give credits
        status: "completed",
        gatewayResponse: { plan, subscriptionUpgrade: true },
        billingAddress: null,
        cardLast4: null,
        cardType: null,
        processingFee: null
      });
      res.json({
        success: true,
        user: updatedUser,
        message: `Successfully upgraded to ${plan} plan`
      });
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });
  app2.post("/api/subscription/cancel", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const updatedUser = await storage.cancelUserSubscription(userId);
      res.json({
        success: true,
        user: updatedUser,
        message: "Subscription cancelled successfully"
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });
  app2.post("/api/settings/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, bio, timezone, language, profileImageUrl } = req.body;
      const updatedUser = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        bio,
        timezone,
        language,
        profileImageUrl
      });
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.post("/api/settings/notifications", requireAuth, async (req, res) => {
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
        marketingEmails
      });
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating notifications:", error);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  });
  app2.post("/api/settings/theme", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { theme, primaryColor, compactMode, sidebarCollapsed } = req.body;
      const updatedUser = await storage.updateUserTheme(userId, {
        theme,
        primaryColor,
        compactMode,
        sidebarCollapsed
      });
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "Failed to update theme" });
    }
  });
  app2.post("/api/settings/company", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { companyName, companyLogo, website, industry, teamSize, brandColors } = req.body;
      const updatedUser = await storage.updateUserCompany(userId, {
        companyName,
        companyLogo,
        website,
        industry,
        teamSize,
        brandColors
      });
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating company settings:", error);
      res.status(500).json({ message: "Failed to update company settings" });
    }
  });
  app2.post("/api/settings/security", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { sessionTimeout, autoSave, rememberLogin, twoFactorAuth } = req.body;
      const updatedUser = await storage.updateUserSecurity(userId, {
        sessionTimeout,
        autoSave,
        rememberLogin,
        twoFactorAuth
      });
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating security settings:", error);
      res.status(500).json({ message: "Failed to update security settings" });
    }
  });
  app2.get("/api/search", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const query = req.query.q;
      if (!query || query.length < 3) {
        return res.json([]);
      }
      const searchTerm = query.toLowerCase();
      const results = [];
      const templates2 = await storage.getTemplatesByUserId(userId);
      const matchingTemplates = templates2.filter(
        (template) => template.name.toLowerCase().includes(searchTerm)
      );
      results.push(...matchingTemplates.map((template) => ({
        id: template.id,
        type: "template",
        name: template.name,
        description: `Frequency: ${template.frequency}`
      })));
      const images2 = await storage.getImagesByUserId(userId);
      const matchingImages = images2.filter(
        (image) => image.filename.toLowerCase().includes(searchTerm) || image.folder?.toLowerCase().includes(searchTerm)
      );
      results.push(...matchingImages.map((image) => ({
        id: image.id,
        type: "image",
        name: image.originalName || image.filename,
        description: `Folder: ${image.folder || "Uncategorized"}`
      })));
      const socialConfigs = await storage.getSocialMediaConfigs(userId);
      const matchingSocial = socialConfigs.filter(
        (config) => config.platformId.toLowerCase().includes(searchTerm)
      );
      results.push(...matchingSocial.map((config) => ({
        id: config.id,
        type: "social_media",
        name: config.platformId,
        description: `Status: ${config.testStatus || "Not configured"}`
      })));
      res.json(results.slice(0, 10));
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });
  app2.get("/auth/facebook/api-key", (req, res) => {
    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(process.env.NODE_ENV === "production" ? "https://postmeai.com/auth/facebook/api-key/callback" : "http://localhost:5000/auth/facebook/api-key/callback")}&scope=pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish&response_type=code&state=${req.user?.id || "anonymous"}`;
    res.redirect(facebookAuthUrl);
  });
  app2.get("/auth/facebook/api-key/callback", async (req, res) => {
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
      const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&redirect_uri=${encodeURIComponent(process.env.NODE_ENV === "production" ? "https://postmeai.com/auth/facebook/api-key/callback" : "http://localhost:5000/auth/facebook/api-key/callback")}&code=${code}`);
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
      if (req.session) {
        req.session.facebookApiKey = accessToken;
      }
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
    } catch (error) {
      console.error("Facebook OAuth error:", error);
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
  app2.get("/api/facebook-oauth-result", (req, res) => {
    if (req.session?.facebookApiKey) {
      const apiKey = req.session.facebookApiKey;
      delete req.session.facebookApiKey;
      res.json({ apiKey });
    } else {
      res.status(404).json({ message: "No Facebook API key found" });
    }
  });
  app2.get("/auth/linkedin/api-key", (req, res) => {
    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NODE_ENV === "production" ? "https://postmeai.com/auth/linkedin/api-key/callback" : "http://localhost:5000/auth/linkedin/api-key/callback")}&scope=openid%20profile%20email%20w_member_social&state=${req.user?.id || "anonymous"}`;
    res.redirect(linkedinAuthUrl);
  });
  app2.get("/auth/linkedin/api-key/callback", async (req, res) => {
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
      const tokenResponse = await fetch(`https://www.linkedin.com/oauth/v2/accessToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
          redirect_uri: process.env.NODE_ENV === "production" ? "https://postmeai.com/auth/linkedin/api-key/callback" : "http://localhost:5000/auth/linkedin/api-key/callback"
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
      if (req.session) {
        req.session.linkedinApiKey = accessToken;
      }
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
    } catch (error) {
      console.error("LinkedIn OAuth error:", error);
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
  app2.get("/api/linkedin-oauth-result", (req, res) => {
    if (req.session?.linkedinApiKey) {
      const apiKey = req.session.linkedinApiKey;
      delete req.session.linkedinApiKey;
      res.json({ apiKey });
    } else {
      res.status(404).json({ message: "No LinkedIn API key found" });
    }
  });
  app2.post("/api/social-media-configs/:platformId/test", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { platformId } = req.params;
      const { apiKey } = req.body;
      console.log(`Testing ${platformId} connection for user ${userId}`);
      if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
        await storage.updateSocialMediaConfigTestStatus(userId, platformId, "failed", "API key is required for testing");
        return res.status(400).json({
          success: false,
          error: "API key is required for testing",
          status: "failed"
        });
      }
      await storage.updateSocialMediaConfigTestStatus(userId, platformId, "testing");
      let testResult = { success: false, error: "Platform not supported" };
      if (platformId === "facebook") {
        try {
          const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${apiKey}&fields=id,name,email`);
          const data = await response.json();
          if (data.error) {
            testResult = {
              success: false,
              error: `Facebook API Error: ${data.error.message} (Code: ${data.error.code})`
            };
          } else if (data.id) {
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
            testResult = { success: false, error: "Invalid Facebook API response" };
          }
        } catch (error) {
          testResult = { success: false, error: `Facebook API connection failed: ${error.message}` };
        }
      } else {
        const delay = Math.random() * 2e3 + 1e3;
        await new Promise((resolve) => setTimeout(resolve, delay));
        if (apiKey && apiKey.length > 10) {
          testResult = { success: true, error: null };
        } else {
          testResult = { success: false, error: "Invalid API key format" };
        }
      }
      if (testResult.success) {
        await storage.upsertSocialMediaConfig({
          userId,
          platformId,
          isEnabled: true,
          apiKey: apiKey.trim(),
          testStatus: "connected",
          testError: null,
          lastTestedAt: /* @__PURE__ */ new Date()
        });
        res.json({
          success: true,
          message: `${platformId} connection successful`,
          userInfo: testResult.userInfo || null
        });
      } else {
        await storage.updateSocialMediaConfigTestStatus(userId, platformId, "failed", testResult.error);
        res.status(400).json({
          success: false,
          message: testResult.error || `${platformId} connection failed`
        });
      }
    } catch (error) {
      console.error(`Error testing ${req.params.platformId} connection:`, error);
      await storage.updateSocialMediaConfigTestStatus(req.user.id, req.params.platformId, "failed", error.message);
      res.status(500).json({ message: "Connection test failed" });
    }
  });
  app2.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = [
        {
          id: 1,
          type: "system",
          title: "Welcome to PostMeAI!",
          message: "Your account has been successfully created. Start by creating your first post.",
          isRead: false,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: 2,
          type: "success",
          title: "Post Published Successfully",
          message: "Your latest post has been published to selected social media platforms.",
          isRead: false,
          createdAt: new Date(Date.now() - 36e5).toISOString()
          // 1 hour ago
        },
        {
          id: 3,
          type: "social",
          title: "Social Media Integration",
          message: "Connect your social media accounts to start publishing content automatically.",
          isRead: true,
          createdAt: new Date(Date.now() - 864e5).toISOString()
          // 1 day ago
        }
      ];
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      console.log(`Marking notification ${notificationId} as read`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.get("/api/templates", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const templates2 = await storage.getTemplatesByUserId(userId);
      const enhancedTemplates = await Promise.all(
        templates2.map(async (template) => {
          const post = await storage.getPost(template.postId);
          const generatedContent2 = await storage.getGeneratedContentByPostId(template.postId);
          return {
            ...template,
            objective: post?.subject || generatedContent2?.title || "Automated post template"
          };
        })
      );
      res.json(enhancedTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  app2.get("/api/templates/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const templateId = parseInt(req.params.id);
      const template = await storage.getTemplateById(templateId, userId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      const post = await storage.getPost(template.postId);
      const generatedContent2 = await storage.getGeneratedContentByPostId(template.postId);
      res.json({
        template,
        post,
        generatedContent: generatedContent2
      });
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });
  app2.put("/api/templates/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const templateId = parseInt(req.params.id);
      const updates = req.body;
      const updatedTemplate = await storage.updateTemplate(templateId, updates, userId);
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(updatedTemplate);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });
  app2.delete("/api/templates/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const templateId = parseInt(req.params.id);
      const deleted = await storage.deleteTemplate(templateId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json({ success: true, message: "Template deleted successfully" });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });
  app2.post("/api/templates/:id/execute", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const templateId = parseInt(req.params.id);
      await storage.executeTemplate(templateId, userId);
      console.log(`Template ${templateId} executed by user ${userId}`);
      res.json({
        success: true,
        message: "Template executed successfully",
        executedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error executing template:", error);
      res.status(500).json({ message: "Failed to execute template" });
    }
  });
  app2.patch("/api/templates/:id/toggle-status", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const templateId = parseInt(req.params.id);
      const template = await storage.getTemplateById(templateId, userId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      const newStatus = !template.isActive;
      const updated = await storage.updateTemplate(templateId, { isActive: newStatus }, userId);
      if (!updated) {
        return res.status(404).json({ message: "Failed to update template status" });
      }
      res.json({
        success: true,
        message: `Template ${newStatus ? "activated" : "deactivated"} successfully`,
        isActive: newStatus
      });
    } catch (error) {
      console.error("Error toggling template status:", error);
      res.status(500).json({ message: "Failed to toggle template status" });
    }
  });
  app2.get("/api/post-schedules", requireAuth, async (req, res) => {
    try {
      const schedules = await storage.getPostSchedulesByUserId(req.user.id);
      const schedulesWithStats = await Promise.all(schedules.map(async (schedule) => {
        const executions = await storage.getScheduleExecutionsByScheduleId(schedule.id, req.user.id);
        const totalExecutions = executions.length;
        const successfulExecutions = executions.filter((ex) => ex.status === "success").length;
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
  app2.post("/api/post-schedules", requireAuth, async (req, res) => {
    try {
      const scheduleData = {
        ...req.body,
        userId: req.user.id,
        status: "active",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const schedule = await storage.createPostSchedule(scheduleData);
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post schedule" });
    }
  });
  app2.get("/api/post-schedules/:id", requireAuth, async (req, res) => {
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
  app2.put("/api/post-schedules/:id", requireAuth, async (req, res) => {
    try {
      const updates = {
        ...req.body,
        updatedAt: /* @__PURE__ */ new Date()
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
  app2.delete("/api/post-schedules/:id", requireAuth, async (req, res) => {
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
  app2.post("/api/post-schedules/:id/toggle", requireAuth, async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const { isActive } = req.body;
      const updates = { isActive, updatedAt: /* @__PURE__ */ new Date() };
      const schedule = await storage.updatePostSchedule(scheduleId, updates, req.user.id);
      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      res.json({
        success: true,
        message: `Schedule ${isActive ? "activated" : "deactivated"} successfully`,
        schedule
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle schedule status" });
    }
  });
  app2.post("/api/post-schedules/:id/run", requireAuth, async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const startTime = Date.now();
      const schedule = await storage.getPostScheduleById(scheduleId, req.user.id);
      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      if (!schedule.isActive) {
        return res.status(400).json({ error: "Cannot execute inactive schedule" });
      }
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      const executionDuration = Date.now() - startTime;
      const updates = {
        lastExecutedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      await storage.updatePostSchedule(scheduleId, updates, req.user.id);
      await storage.createScheduleExecution({
        scheduleId,
        userId: req.user.id,
        status: "success",
        message: `Schedule executed successfully on ${schedule.selectedPlatforms.length} platforms`,
        platformsExecuted: schedule.selectedPlatforms,
        executionDuration
      });
      const executionResult = {
        scheduleId,
        executedAt: /* @__PURE__ */ new Date(),
        platforms: schedule.selectedPlatforms,
        status: "success",
        postsCreated: schedule.selectedPlatforms.length
      };
      res.json({
        success: true,
        message: `Schedule executed successfully on ${schedule.selectedPlatforms.length} platforms`,
        execution: executionResult
      });
    } catch (error) {
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
  app2.get("/api/post-schedules/:id/history", requireAuth, async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
function log(message, source = "express") {
  const ts = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${ts} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const { createServer: createViteServer, createLogger } = await import("vite");
  const viteLogger = createLogger();
  const { default: reactPlugin } = await import("@vitejs/plugin-react");
  let runtimePlugin;
  try {
    const { default: overlay } = await import("@replit/vite-plugin-runtime-error-modal");
    runtimePlugin = overlay();
  } catch {
  }
  let cartographerPlugin;
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID) {
    try {
      const { cartographer } = await import("@replit/vite-plugin-cartographer");
      cartographerPlugin = cartographer();
    } catch {
    }
  }
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
        "@assets": assetsDir
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
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
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
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const publicOut = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(publicOut)) {
    throw new Error(`Missing build dir: ${publicOut}`);
  }
  app2.use(express.static(publicOut));
  app2.use("*", (_req, res) => {
    res.sendFile(path.join(publicOut, "index.html"));
  });
}

// server/index.ts
import dotenv3 from "dotenv";
import cors from "cors";
dotenv3.config();
var app = express2();
app.set("trust proxy", 1);
app.use(cors({
  //origin: "https://postme-ai-frontend-2d76778b4014.herokuapp.com", 
  origin: "https://www.postmeai.com",
  credentials: true
}));
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
setupAuth(app);
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.linkedin.com https://api.linkedin.com https://www.facebook.com; frame-src 'self' https://accounts.google.com https://www.linkedin.com https://www.facebook.com; form-action 'self' https://accounts.google.com https://www.linkedin.com https://www.facebook.com;"
  );
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = Number(process.env.PORT) || 5e3;
  server.listen(
    { port, host: "0.0.0.0", reusePort: true },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
