import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index, decimal, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Updated users table for OAuth and local authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  username: text("username"),
  password: text("password"), // Only for local auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  authProvider: varchar("auth_provider").notNull().default("local"), // local, facebook, google, linkedin, github
  providerId: varchar("provider_id"), // ID from OAuth provider
  lastAuthMethod: varchar("last_auth_method"), // Track last used auth method
  // Billing and subscription fields
  credits: integer("credits").notNull().default(0),
  subscriptionPlan: varchar("subscription_plan"), // 'basic', 'pro', 'enterprise', etc.
  subscriptionStatus: varchar("subscription_status").default("inactive"), // 'active', 'inactive', 'cancelled', 'expired'
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  // Profile settings
  bio: text("bio"),
  timezone: varchar("timezone").default("UTC"),
  language: varchar("language").default("en"),
  // Company settings
  companyName: varchar("company_name"),
  companyLogo: text("company_logo"), // base64 encoded
  website: varchar("website"),
  industry: varchar("industry"),
  teamSize: varchar("team_size"),
  brandColors: jsonb("brand_colors"), // {primary, secondary, accent}
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  subject: text("subject").notNull(),
  executionMode: text("execution_mode").notNull().default("review"),
  maxTextSize: integer("max_text_size").notNull().default(150),
  language: text("language").notNull().default("en"),
  generateImage: boolean("generate_image").notNull().default(true),
  link: text("link"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const generatedContent = pgTable("generated_content", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  imageUrl: text("image_url"),
  platformContent: jsonb("platform_content"), // Store platform-specific variations
  createdAt: timestamp("created_at").defaultNow(),
});

export const publishedPosts = pgTable("published_posts", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  platforms: jsonb("platforms").notNull(), // Array of published platforms
  publishedAt: timestamp("published_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  name: text("name").notNull(),
  frequency: text("frequency").notNull(), // daily, weekly, monthly
  time: text("time").notNull(),
  timezone: text("timezone").notNull(),
  targetPlatforms: text("target_platforms").array(), // Array of platform IDs																 
  isActive: boolean("is_active").notNull().default(true),
  lastExecutedAt: timestamp("last_executed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment transactions table
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  transactionId: varchar("transaction_id").notNull().unique(),
  gateway: varchar("gateway").notNull(), // stripe, paypal, payrexx, mangopay
  amount: text("amount").notNull(), // Store as string to avoid decimal precision issues
  currency: varchar("currency").default("USD"),
  credits: integer("credits").notNull(),
  status: varchar("status").notNull(), // pending, completed, failed, refunded
  gatewayResponse: jsonb("gateway_response"),
  billingAddress: jsonb("billing_address"),
  cardLast4: varchar("card_last4"), // Last 4 digits for display
  cardType: varchar("card_type"), // visa, mastercard, etc.
  processingFee: text("processing_fee"), // Store as string to avoid decimal precision issues
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saved payment methods table
export const savedPaymentMethods = pgTable("saved_payment_methods", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  gateway: varchar("gateway").notNull(),
  gatewayMethodId: varchar("gateway_method_id").notNull(), // Gateway-specific ID
  cardLast4: varchar("card_last4"),
  cardType: varchar("card_type"),
  expiryMonth: varchar("expiry_month"),
  expiryYear: varchar("expiry_year"),
  cardholderName: varchar("cardholder_name"),
  billingAddress: jsonb("billing_address"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  folder: varchar("folder").default("uncategorized"),
  binaryData: text("binary_data").notNull(), // base64 encoded binary data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const socialMediaConfigs = pgTable("social_media_configs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  platformId: varchar("platform_id").notNull(), // facebook, instagram, etc.
  isEnabled: boolean("is_enabled").default(true),
  apiKey: text("api_key"),
  testStatus: varchar("test_status").default("idle"), // idle, testing, connected, failed
  testError: text("test_error"),
  lastTestedAt: timestamp("last_tested_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueUserPlatform: unique().on(table.userId, table.platformId),
}));

export const postSchedules = pgTable("post_schedules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"), // optional description field
  creationMode: varchar("creation_mode").notNull().default("ai"), // ai, manual
  selectedPlatforms: text("selected_platforms").array().notNull(), // ["linkedin", "instagram"]
  platformConfigs: jsonb("platform_configs").notNull(), // platform-specific settings
  scheduleType: varchar("schedule_type").notNull(), // daily, weekly, monthly, calendar
  scheduleConfig: jsonb("schedule_config").notNull(), // schedule configuration
  links: jsonb("links"), // website, link1, link2
  isActive: boolean("is_active").default(true),
  lastExecutedAt: timestamp("last_executed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scheduleExecutions = pgTable("schedule_executions", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").notNull().references(() => postSchedules.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  executedAt: timestamp("executed_at").notNull().defaultNow(),
  status: varchar("status").notNull().default("success"), // success, failed, running
  message: text("message"),
  platformsExecuted: text("platforms_executed").array(),
  executionDuration: integer("execution_duration"), // in milliseconds
});

// Authentication schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  authProvider: true,
  providerId: true,
  lastAuthMethod: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  authProvider: true,
  providerId: true,
  lastAuthMethod: true,
});

export const localAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
});

export const insertGeneratedContentSchema = createInsertSchema(generatedContent).omit({
  id: true,
  createdAt: true,
});

export const insertPublishedPostSchema = createInsertSchema(publishedPosts).omit({
  id: true,
  publishedAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type LocalAuth = z.infer<typeof localAuthSchema>;
export type User = typeof users.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertGeneratedContent = z.infer<typeof insertGeneratedContentSchema>;
export type GeneratedContent = typeof generatedContent.$inferSelect;
export type InsertPublishedPost = z.infer<typeof insertPublishedPostSchema>;
export type PublishedPost = typeof publishedPosts.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// Payment transaction schemas
export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSavedPaymentMethodSchema = createInsertSchema(savedPaymentMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialMediaConfigSchema = createInsertSchema(socialMediaConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostScheduleSchema = createInsertSchema(postSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScheduleExecutionSchema = createInsertSchema(scheduleExecutions).omit({
  id: true,
  executedAt: true,
});
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertSavedPaymentMethod = z.infer<typeof insertSavedPaymentMethodSchema>;
export type SavedPaymentMethod = typeof savedPaymentMethods.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Folder = typeof folders.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;
export type InsertSocialMediaConfig = z.infer<typeof insertSocialMediaConfigSchema>;
export type SocialMediaConfig = typeof socialMediaConfigs.$inferSelect;
export type InsertPostSchedule = z.infer<typeof insertPostScheduleSchema>;
export type PostSchedule = typeof postSchedules.$inferSelect;
export type InsertScheduleExecution = z.infer<typeof insertScheduleExecutionSchema>;
export type ScheduleExecution = typeof scheduleExecutions.$inferSelect;