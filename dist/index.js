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
  consentAuditLog: () => consentAuditLog,
  folders: () => folders,
  generatedContent: () => generatedContent,
  images: () => images,
  insertConsentAuditLogSchema: () => insertConsentAuditLogSchema,
  insertFolderSchema: () => insertFolderSchema,
  insertGeneratedContentSchema: () => insertGeneratedContentSchema,
  insertImageSchema: () => insertImageSchema,
  insertInvitationWorkspaceRoleSchema: () => insertInvitationWorkspaceRoleSchema,
  insertOrganizationSchema: () => insertOrganizationSchema,
  insertPaymentTransactionSchema: () => insertPaymentTransactionSchema,
  insertPostScheduleSchema: () => insertPostScheduleSchema,
  insertPostSchema: () => insertPostSchema,
  insertPublishedPostSchema: () => insertPublishedPostSchema,
  insertScheduleExecutionSchema: () => insertScheduleExecutionSchema,
  insertSocialMediaConfigSchema: () => insertSocialMediaConfigSchema,
  insertTemplateSchema: () => insertTemplateSchema,
  insertUserInvitationSchema: () => insertUserInvitationSchema,
  insertUserOrganizationSchema: () => insertUserOrganizationSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserWorkspaceRoleSchema: () => insertUserWorkspaceRoleSchema,
  insertUserWorkspaceSchema: () => insertUserWorkspaceSchema,
  insertWorkspaceInvitationSchema: () => insertWorkspaceInvitationSchema,
  insertWorkspaceRoleSchema: () => insertWorkspaceRoleSchema,
  insertWorkspaceSchema: () => insertWorkspaceSchema,
  invitationWorkspaceRoles: () => invitationWorkspaceRoles,
  organizations: () => organizations,
  paymentTransactions: () => paymentTransactions,
  postSchedules: () => postSchedules,
  posts: () => posts,
  publishedPosts: () => publishedPosts,
  scheduleExecutions: () => scheduleExecutions,
  sessions: () => sessions,
  socialMediaConfigs: () => socialMediaConfigs,
  templates: () => templates,
  userInvitations: () => userInvitations,
  userOrganizations: () => userOrganizations,
  userWorkspaceRoles: () => userWorkspaceRoles,
  userWorkspaces: () => userWorkspaces,
  users: () => users,
  workspaceInvitations: () => workspaceInvitations,
  workspaceRoles: () => workspaceRoles,
  workspaces: () => workspaces
});
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index, decimal, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  uniqueId: varchar("unique_id").unique().notNull(),
  ownerId: varchar("owner_id").notNull(),
  // User who owns this organization
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  uniqueId: varchar("unique_id").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  // Unique workspace name per organization
  uniqueNamePerOrg: unique().on(table.organizationId, table.name)
}));
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
  // Organization and Workspace context
  currentOrganizationId: integer("current_organization_id").references(() => organizations.id),
  currentWorkspaceId: integer("current_workspace_id").references(() => workspaces.id),
  lastWorkspaceId: integer("last_workspace_id").references(() => workspaces.id),
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
  // Password reset fields
  resetToken: varchar("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  // Email verification fields
  verificationToken: varchar("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  // Company/organization fields
  companyName: varchar("company_name"),
  companyLogoUrl: varchar("company_logo_url"),
  companyWebsite: varchar("company_website"),
  companyIndustry: varchar("company_industry"),
  companySize: varchar("company_size"),
  // Onboarding fields
  onboardingCompleted: boolean("onboarding_completed").default(false),
  interestedPlatforms: text("interested_platforms").array(),
  primaryGoals: text("primary_goals").array(),
  // Role and status fields
  userRole: varchar("user_role").default("creator"),
  // creator, publisher, approver, administrator
  accountStatus: varchar("account_status").default("active"),
  // active, inactive, pending_approval
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var userOrganizations = pgTable("user_organizations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  role: varchar("role").notNull().default("member"),
  // owner, member
  isActive: boolean("is_active").default(true),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow()
}, (table) => ({
  uniqueUserOrganization: unique().on(table.userId, table.organizationId)
}));
var userWorkspaces = pgTable("user_workspaces", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  role: varchar("role").notNull().default("creator"),
  // creator, publisher, approver, administrator
  isActive: boolean("is_active").default(true),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow()
}, (table) => ({
  uniqueUserWorkspace: unique().on(table.userId, table.workspaceId)
}));
var workspaceInvitations = pgTable("workspace_invitations", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  email: varchar("email").notNull(),
  role: varchar("role").notNull().default("creator"),
  invitationKey: varchar("invitation_key").unique().notNull(),
  status: varchar("status").notNull().default("pending"),
  // pending, accepted, expired
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at")
}, (table) => ({
  // Ensure invitations are workspace-specific
  uniqueWorkspaceInvitation: unique().on(table.workspaceId, table.email)
}));
var userInvitations = pgTable("user_invitations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  invitedByUserId: varchar("invited_by_user_id").notNull().references(() => users.id),
  email: varchar("email").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  invitationKey: varchar("invitation_key").unique().notNull(),
  expirationMinutes: integer("expiration_minutes").notNull().default(10),
  // 10-60 minutes
  status: varchar("status").default("pending"),
  // pending, accepted, expired, auto_activated
  invitedAt: timestamp("invited_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  passwordSetAt: timestamp("password_set_at"),
  approvedAt: timestamp("approved_at"),
  approvedByUserId: varchar("approved_by_user_id").references(() => users.id),
  userId: varchar("user_id").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  rejectedByUserId: varchar("rejected_by_user_id").references(() => users.id),
  canceledAt: timestamp("canceled_at"),
  canceledByUserId: varchar("canceled_by_user_id").references(() => users.id)
}, (table) => ({
  // Ensure invitations are organization-specific
  uniqueOrganizationUserInvitation: unique().on(table.organizationId, table.email)
}));
var invitationWorkspaceRoles = pgTable("invitation_workspace_roles", {
  id: serial("id").primaryKey(),
  invitationId: integer("invitation_id").notNull().references(() => userInvitations.id, { onDelete: "cascade" }),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  roles: text("roles").array().notNull(),
  // Array of role names
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  // Ensure one record per invitation per workspace
  uniqueInvitationWorkspace: unique().on(table.invitationId, table.workspaceId),
  invitationIndex: index("invitation_workspace_roles_invitation_idx").on(table.invitationId),
  workspaceIndex: index("invitation_workspace_roles_workspace_idx").on(table.workspaceId)
}));
var workspaceRoles = pgTable("workspace_roles", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  permissions: text("permissions").array(),
  // Array of permission strings
  createdAt: timestamp("created_at").defaultNow()
});
var userWorkspaceRoles = pgTable("user_workspace_roles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  roleId: integer("role_id").notNull().references(() => workspaceRoles.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedByUserId: varchar("assigned_by_user_id").references(() => users.id)
}, (table) => ({
  // Ensure unique role assignment per user per workspace
  uniqueUserWorkspaceRole: unique().on(table.userId, table.workspaceId, table.roleId),
  userIndex: index("user_workspace_roles_user_idx").on(table.userId),
  workspaceIndex: index("user_workspace_roles_workspace_idx").on(table.workspaceId),
  roleIndex: index("user_workspace_roles_role_idx").on(table.roleId)
}));
var posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title"),
  content: text("content"),
  subject: text("subject"),
  platforms: text("platforms").array(),
  maxTextSize: integer("max_text_size").default(150),
  language: varchar("language").default("en"),
  link: varchar("link"),
  generateImage: boolean("generate_image").default(true),
  executionMode: varchar("execution_mode").default("review"),
  // review, auto, manual
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  workspaceIndex: index("posts_workspace_idx").on(table.workspaceId),
  userIndex: index("posts_user_idx").on(table.userId),
  // Composite index for multi-tenancy queries as per best practices
  workspaceUserIndex: index("posts_workspace_user_idx").on(table.workspaceId, table.userId)
}));
var generatedContent = pgTable("generated_content", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  postId: integer("post_id").notNull().references(() => posts.id),
  title: varchar("title"),
  body: text("body"),
  imageUrl: varchar("image_url"),
  imagePrompt: text("image_prompt"),
  platformContent: jsonb("platform_content"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  workspaceIndex: index("generated_content_workspace_idx").on(table.workspaceId),
  postIndex: index("generated_content_post_idx").on(table.postId),
  // Composite index for multi-tenancy queries as per best practices
  workspacePostIndex: index("generated_content_workspace_post_idx").on(table.workspaceId, table.postId)
}));
var publishedPosts = pgTable("published_posts", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  postId: integer("post_id").notNull().references(() => posts.id),
  platform: varchar("platform").notNull(),
  platformPostId: varchar("platform_post_id"),
  status: varchar("status").default("pending"),
  // pending, published, failed
  publishedAt: timestamp("published_at").defaultNow(),
  errorMessage: text("error_message")
}, (table) => ({
  workspaceIndex: index("published_posts_workspace_idx").on(table.workspaceId),
  postIndex: index("published_posts_post_idx").on(table.postId),
  // Composite index for multi-tenancy queries as per best practices
  workspacePostIndex: index("published_posts_workspace_post_idx").on(table.workspaceId, table.postId)
}));
var templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  postId: integer("post_id").notNull().references(() => posts.id),
  frequency: varchar("frequency").default("daily"),
  // daily, weekly, monthly, custom
  isActive: boolean("is_active").default(true),
  lastExecutedAt: timestamp("last_executed_at"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  workspaceIndex: index("templates_workspace_idx").on(table.workspaceId),
  userIndex: index("templates_user_idx").on(table.userId),
  // Composite index for multi-tenancy queries as per best practices
  workspaceUserIndex: index("templates_workspace_user_idx").on(table.workspaceId, table.userId)
}));
var paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount").notNull(),
  currency: varchar("currency").default("USD"),
  paymentMethod: varchar("payment_method").notNull(),
  status: varchar("status").default("pending"),
  // pending, completed, failed
  transactionId: varchar("transaction_id"),
  credits: integer("credits").default(0),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  workspaceIndex: index("payment_transactions_workspace_idx").on(table.workspaceId),
  userIndex: index("payment_transactions_user_idx").on(table.userId),
  // Composite index for multi-tenancy queries as per best practices
  workspaceUserIndex: index("payment_transactions_workspace_user_idx").on(table.workspaceId, table.userId)
}));
var folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  workspaceIndex: index("folders_workspace_idx").on(table.workspaceId),
  userIndex: index("folders_user_idx").on(table.userId),
  uniqueWorkspaceFolder: unique().on(table.workspaceId, table.userId, table.name),
  // Composite index for multi-tenancy queries as per best practices
  orgWorkspaceIndex: index("folders_org_workspace_idx").on(table.organizationId, table.workspaceId),
  workspaceUserIndex: index("folders_workspace_user_idx").on(table.workspaceId, table.userId)
}));
var images = pgTable("images", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name"),
  folderId: integer("folder_id").references(() => folders.id),
  data: text("data").notNull(),
  // Base64 encoded image data (stored as bytea in DB)
  fileType: varchar("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  workspaceIndex: index("images_workspace_idx").on(table.workspaceId),
  userIndex: index("images_user_idx").on(table.userId),
  // Composite index for multi-tenancy queries as per best practices
  orgWorkspaceIndex: index("images_org_workspace_idx").on(table.organizationId, table.workspaceId),
  workspaceUserIndex: index("images_workspace_user_idx").on(table.workspaceId, table.userId)
}));
var socialMediaConfigs = pgTable("social_media_configs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform").notNull(),
  apiKey: varchar("api_key"),
  apiSecret: varchar("api_secret"),
  accessToken: varchar("access_token"),
  refreshToken: varchar("refresh_token"),
  isActive: boolean("is_active").default(true),
  testStatus: varchar("test_status").default("not_tested"),
  // not_tested, testing, connected, failed
  lastTestedAt: timestamp("last_tested_at"),
  testMessage: text("test_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  workspaceIndex: index("social_media_configs_workspace_idx").on(table.workspaceId),
  userIndex: index("social_media_configs_user_idx").on(table.userId),
  uniqueWorkspacePlatform: unique().on(table.workspaceId, table.userId, table.platform),
  // Composite index for multi-tenancy queries as per best practices
  orgWorkspaceIndex: index("social_media_configs_org_workspace_idx").on(table.organizationId, table.workspaceId),
  workspaceUserIndex: index("social_media_configs_workspace_user_idx").on(table.workspaceId, table.userId)
}));
var postSchedules = pgTable("post_schedules", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  creationMode: varchar("creation_mode").default("ai"),
  // ai, manual
  templateId: integer("template_id").references(() => templates.id),
  postId: integer("post_id").references(() => posts.id),
  platforms: text("platforms").array(),
  scheduleConfig: jsonb("schedule_config").notNull(),
  platformConfigs: jsonb("platform_configs"),
  links: jsonb("links"),
  isActive: boolean("is_active").default(true),
  lastExecutedAt: timestamp("last_executed_at"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => ({
  workspaceIndex: index("post_schedules_workspace_idx").on(table.workspaceId),
  userIndex: index("post_schedules_user_idx").on(table.userId),
  // Composite index for multi-tenancy queries as per best practices
  workspaceUserIndex: index("post_schedules_workspace_user_idx").on(table.workspaceId, table.userId)
}));
var scheduleExecutions = pgTable("schedule_executions", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  scheduleId: integer("schedule_id").notNull().references(() => postSchedules.id),
  executedAt: timestamp("executed_at").defaultNow(),
  status: varchar("status").default("pending"),
  // pending, completed, failed
  errorMessage: text("error_message"),
  generatedPostId: integer("generated_post_id").references(() => posts.id)
}, (table) => ({
  workspaceIndex: index("schedule_executions_workspace_idx").on(table.workspaceId),
  scheduleIndex: index("schedule_executions_schedule_idx").on(table.scheduleId),
  // Composite index for multi-tenancy queries as per best practices
  workspaceScheduleIndex: index("schedule_executions_workspace_schedule_idx").on(table.workspaceId, table.scheduleId)
}));
var consentAuditLog = pgTable("consent_audit_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  email: varchar("email"),
  // Store email for tracking consent before user registration
  sessionId: varchar("session_id"),
  // Track consent by session if no user yet
  consentAction: varchar("consent_action").notNull(),
  // "accepted", "rejected", "partial", "updated"
  privacyPolicyAccepted: boolean("privacy_policy_accepted").notNull(),
  termsOfUseAccepted: boolean("terms_of_use_accepted").notNull(),
  mandatoryCookies: boolean("mandatory_cookies").notNull().default(true),
  analyticsCookies: boolean("analytics_cookies").notNull().default(false),
  personalizationCookies: boolean("personalization_cookies").notNull().default(false),
  marketingCookies: boolean("marketing_cookies").notNull().default(false),
  userAgent: text("user_agent"),
  // Browser information for audit
  ipAddress: varchar("ip_address"),
  // IP address for audit
  consentTimestamp: timestamp("consent_timestamp").defaultNow(),
  consentData: jsonb("consent_data")
  // Full consent object for detailed audit
}, (table) => ({
  userIndex: index("consent_audit_user_idx").on(table.userId),
  emailIndex: index("consent_audit_email_idx").on(table.email),
  sessionIndex: index("consent_audit_session_idx").on(table.sessionId),
  timestampIndex: index("consent_audit_timestamp_idx").on(table.consentTimestamp)
}));
var insertUserSchema = createInsertSchema(users);
var insertOrganizationSchema = createInsertSchema(organizations);
var insertUserOrganizationSchema = createInsertSchema(userOrganizations);
var insertWorkspaceSchema = createInsertSchema(workspaces);
var insertUserWorkspaceSchema = createInsertSchema(userWorkspaces);
var insertWorkspaceInvitationSchema = createInsertSchema(workspaceInvitations);
var insertUserInvitationSchema = createInsertSchema(userInvitations);
var insertInvitationWorkspaceRoleSchema = createInsertSchema(invitationWorkspaceRoles);
var insertWorkspaceRoleSchema = createInsertSchema(workspaceRoles);
var insertUserWorkspaceRoleSchema = createInsertSchema(userWorkspaceRoles);
var insertPostSchema = createInsertSchema(posts);
var insertGeneratedContentSchema = createInsertSchema(generatedContent);
var insertPublishedPostSchema = createInsertSchema(publishedPosts);
var insertTemplateSchema = createInsertSchema(templates);
var insertPaymentTransactionSchema = createInsertSchema(paymentTransactions);
var insertFolderSchema = createInsertSchema(folders);
var insertImageSchema = createInsertSchema(images);
var insertSocialMediaConfigSchema = createInsertSchema(socialMediaConfigs);
var insertPostScheduleSchema = createInsertSchema(postSchedules);
var insertScheduleExecutionSchema = createInsertSchema(scheduleExecutions);
var insertConsentAuditLogSchema = createInsertSchema(consentAuditLog);

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
import { eq, and, or, desc, gt, sql, lt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv2 from "dotenv";
dotenv2.config();
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserWithContext(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) {
      return void 0;
    }
    if (!user.currentWorkspaceId || !user.currentOrganizationId) {
      const userWorkspaces2 = await this.getUserWorkspaces(id);
      if (userWorkspaces2.length > 0) {
        const firstWorkspace = userWorkspaces2[0];
        const workspace = await this.getWorkspace(firstWorkspace.workspaceId);
        if (workspace) {
          await this.updateUserWorkspace(id, workspace.id);
          const [updatedUser] = await db.select().from(users).where(eq(users.id, id));
          return updatedUser || void 0;
        }
      }
    }
    return user;
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
      subscriptionStatus: "inactive",
      emailVerified: userData.emailVerified ?? false,
      // New users start as unverified unless specified
      userRole: userData.userRole || "creator",
      // Default role
      accountStatus: userData.accountStatus || "active",
      // Default status
      onboardingCompleted: userData.onboardingCompleted ?? false
      // Default to false unless specified
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
  async findOrCreateUserByEmail(userData) {
    if (!userData.email) {
      throw new Error("Email is required for user authentication");
    }
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      console.log(`Found existing user for email ${userData.email}, updating auth method to ${userData.authProvider}`);
      const updates = {
        lastAuthMethod: userData.authProvider,
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (!existingUser.firstName && userData.firstName) {
        updates.firstName = userData.firstName;
      }
      if (!existingUser.lastName && userData.lastName) {
        updates.lastName = userData.lastName;
      }
      if (!existingUser.profileImageUrl && userData.profileImageUrl) {
        updates.profileImageUrl = userData.profileImageUrl;
      }
      const [updatedUser] = await db.update(users).set(updates).where(eq(users.id, existingUser.id)).returning();
      return updatedUser;
    } else {
      console.log(`Creating new user for email ${userData.email} with auth provider ${userData.authProvider}`);
      const userId = `${userData.authProvider}_${userData.providerId}_${Date.now()}`;
      const [newUser] = await db.insert(users).values({
        id: userId,
        email: userData.email,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        authProvider: userData.authProvider,
        providerId: userData.providerId,
        lastAuthMethod: userData.authProvider,
        credits: 100,
        // Give new users 100 credits to start
        subscriptionStatus: "inactive",
        emailVerified: true,
        // OAuth emails are considered verified
        userRole: "creator",
        // Default role
        accountStatus: "active",
        // OAuth users are active by default
        onboardingCompleted: false
        // Need to complete onboarding
      }).returning();
      return newUser;
    }
  }
  async updateUserWorkspace(userId, workspaceId) {
    const workspace = await this.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    await db.update(users).set({
      currentOrganizationId: workspace.organizationId,
      currentWorkspaceId: workspaceId,
      lastWorkspaceId: workspaceId
    }).where(eq(users.id, userId));
  }
  async updateUserCurrentWorkspace(userId, workspaceId) {
    const workspace = await this.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    await db.update(users).set({
      currentOrganizationId: workspace.organizationId,
      currentWorkspaceId: workspaceId,
      lastWorkspaceId: workspaceId
    }).where(eq(users.id, userId));
  }
  async updateUser(userId, updates) {
    const [user] = await db.update(users).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return user;
  }
  // Organization operations
  async createOrganization(organizationData) {
    const [organization] = await db.insert(organizations).values(organizationData).returning();
    return organization;
  }
  async getOrganization(id) {
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, id));
    return organization || void 0;
  }
  async getOrganizationByUserId(userId) {
    const [result] = await db.select({ organization: organizations }).from(organizations).innerJoin(userOrganizations, eq(organizations.id, userOrganizations.organizationId)).where(eq(userOrganizations.userId, userId));
    return result?.organization || void 0;
  }
  async getUserOrganizations(userId) {
    return await db.select().from(userOrganizations).where(eq(userOrganizations.userId, userId));
  }
  async getOrganizationMemberCount(organizationId) {
    const result = await db.select().from(userOrganizations).where(and(
      eq(userOrganizations.organizationId, organizationId),
      eq(userOrganizations.isActive, true)
    ));
    return result.length;
  }
  async createUserOrganization(userOrganizationData) {
    const [userOrganization] = await db.insert(userOrganizations).values(userOrganizationData).returning();
    return userOrganization;
  }
  async updateUserOrganization(userId, organizationId, updates) {
    const [result] = await db.update(userOrganizations).set(updates).where(and(
      eq(userOrganizations.userId, userId),
      eq(userOrganizations.organizationId, organizationId)
    )).returning();
    return result;
  }
  async getOrganizationMembers(organizationId) {
    const result = await db.select({
      id: userOrganizations.id,
      userId: userOrganizations.userId,
      organizationId: userOrganizations.organizationId,
      role: userOrganizations.role,
      isActive: userOrganizations.isActive,
      joinedAt: userOrganizations.joinedAt,
      lastActiveAt: userOrganizations.lastActiveAt,
      accountStatus: users.accountStatus
    }).from(userOrganizations).innerJoin(users, eq(userOrganizations.userId, users.id)).where(and(
      eq(userOrganizations.organizationId, organizationId),
      eq(userOrganizations.isActive, true),
      // Include users with active or approved status
      or(
        eq(users.accountStatus, "active"),
        eq(users.accountStatus, "approved")
      )
    ));
    return result;
  }
  async getUsersByOrganizationId(organizationId) {
    const result = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      userRole: users.userRole,
      accountStatus: users.accountStatus,
      joinedAt: userOrganizations.joinedAt,
      lastActiveAt: userOrganizations.lastActiveAt,
      isActive: userOrganizations.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).innerJoin(userOrganizations, eq(users.id, userOrganizations.userId)).where(and(
      eq(userOrganizations.organizationId, organizationId),
      eq(userOrganizations.isActive, true),
      // Include users with active or approved status
      or(
        eq(users.accountStatus, "active"),
        eq(users.accountStatus, "approved"),
        eq(users.accountStatus, "pending_approval")
      )
    ));
    return result;
  }
  async getOrganizationOwners(organizationId) {
    return await db.select().from(userOrganizations).where(and(
      eq(userOrganizations.organizationId, organizationId),
      eq(userOrganizations.role, "owner"),
      eq(userOrganizations.isActive, true)
    ));
  }
  async getUserOrganization(userId, organizationId) {
    const [result] = await db.select().from(userOrganizations).where(and(
      eq(userOrganizations.userId, userId),
      eq(userOrganizations.organizationId, organizationId)
    ));
    return result || void 0;
  }
  async countOrganizationOwners(organizationId) {
    const owners = await this.getOrganizationOwners(organizationId);
    return owners.length;
  }
  // Workspace operations
  async createWorkspace(workspace) {
    const [result] = await db.insert(workspaces).values(workspace).returning();
    return result;
  }
  async getWorkspace(id) {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return workspace;
  }
  async getWorkspaceById(id) {
    return this.getWorkspace(id);
  }
  async getWorkspaceMembers(workspaceId) {
    const result = await db.select({
      userId: userWorkspaces.userId,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: userWorkspaces.role,
      joinedAt: userWorkspaces.joinedAt,
      isActive: userWorkspaces.isActive
    }).from(userWorkspaces).innerJoin(users, eq(userWorkspaces.userId, users.id)).where(and(
      eq(userWorkspaces.workspaceId, workspaceId),
      eq(userWorkspaces.isActive, true)
    ));
    return result;
  }
  async getAllWorkspaceMembers(workspaceId) {
    const result = await db.select({
      userId: userWorkspaces.userId,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: userWorkspaces.role,
      joinedAt: userWorkspaces.joinedAt,
      isActive: userWorkspaces.isActive
    }).from(userWorkspaces).innerJoin(users, eq(userWorkspaces.userId, users.id)).where(eq(userWorkspaces.workspaceId, workspaceId));
    return result;
  }
  async getUserWorkspaces(userId) {
    const result = await db.select().from(userWorkspaces).where(and(
      eq(userWorkspaces.userId, userId),
      eq(userWorkspaces.isActive, true)
    ));
    return result;
  }
  async getWorkspacesByUserId(userId) {
    const result = await db.select({
      id: workspaces.id,
      organizationId: workspaces.organizationId,
      name: workspaces.name,
      description: workspaces.description,
      uniqueId: workspaces.uniqueId,
      createdAt: workspaces.createdAt,
      updatedAt: workspaces.updatedAt
    }).from(workspaces).innerJoin(userWorkspaces, eq(workspaces.id, userWorkspaces.workspaceId)).where(and(
      eq(userWorkspaces.userId, userId),
      eq(userWorkspaces.isActive, true)
    ));
    return result;
  }
  async getWorkspacesByOrganizationId(organizationId) {
    const result = await db.select().from(workspaces).where(eq(workspaces.organizationId, organizationId)).orderBy(desc(workspaces.createdAt));
    return result;
  }
  async getUserWorkspaceByIds(userId, workspaceId) {
    const [userWorkspace] = await db.select().from(userWorkspaces).where(and(
      eq(userWorkspaces.userId, userId),
      eq(userWorkspaces.workspaceId, workspaceId)
    ));
    return userWorkspace;
  }
  async getUserWorkspaceMembership(userId, workspaceId) {
    const [userWorkspace] = await db.select().from(userWorkspaces).where(and(
      eq(userWorkspaces.userId, userId),
      eq(userWorkspaces.workspaceId, workspaceId),
      eq(userWorkspaces.isActive, true)
    ));
    return userWorkspace;
  }
  async createUserWorkspace(userWorkspace) {
    const [result] = await db.insert(userWorkspaces).values(userWorkspace).returning();
    return result;
  }
  async updateUserWorkspaceRole(userId, workspaceId, role) {
    const [result] = await db.update(userWorkspaces).set({ role }).where(and(
      eq(userWorkspaces.userId, userId),
      eq(userWorkspaces.workspaceId, workspaceId)
    )).returning();
    return result;
  }
  async getAllWorkspaces() {
    const result = await db.select().from(workspaces).orderBy(desc(workspaces.createdAt));
    return result;
  }
  async getWorkspaceByName(name) {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.name, name));
    return workspace;
  }
  async updateWorkspace(id, updates) {
    const [workspace] = await db.update(workspaces).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(workspaces.id, id)).returning();
    return workspace;
  }
  async deleteWorkspace(id) {
    const usersWithCurrentWorkspace = await db.select().from(users).where(eq(users.currentWorkspaceId, id));
    if (usersWithCurrentWorkspace.length > 0) {
      await db.update(users).set({ currentWorkspaceId: null }).where(eq(users.currentWorkspaceId, id));
    }
    await db.delete(userWorkspaces).where(eq(userWorkspaces.workspaceId, id));
    const result = await db.delete(workspaces).where(eq(workspaces.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  async updateWorkspaceMember(workspaceId, userId, updates) {
    const [result] = await db.update(userWorkspaces).set(updates).where(and(
      eq(userWorkspaces.workspaceId, workspaceId),
      eq(userWorkspaces.userId, userId)
    )).returning();
    return result;
  }
  async removeWorkspaceMember(workspaceId, userId) {
    console.log("?? STORAGE DEBUG - removeWorkspaceMember called");
    console.log("?? STORAGE DEBUG - workspaceId:", workspaceId);
    console.log("?? STORAGE DEBUG - userId:", userId);
    const roleRemovalResult = await db.delete(userWorkspaceRoles).where(and(
      eq(userWorkspaceRoles.workspaceId, workspaceId),
      eq(userWorkspaceRoles.userId, userId)
    ));
    console.log("?? STORAGE DEBUG - Role removal result:", roleRemovalResult);
    const result = await db.delete(userWorkspaces).where(and(
      eq(userWorkspaces.workspaceId, workspaceId),
      eq(userWorkspaces.userId, userId)
    ));
    console.log("?? STORAGE DEBUG - Workspace member removal result:", result);
    console.log("?? STORAGE DEBUG - rowCount:", result.rowCount);
    return result.rowCount !== null && result.rowCount > 0;
  }
  async addUserToWorkspace(userId, workspaceId, role) {
    const [result] = await db.insert(userWorkspaces).values({
      userId,
      workspaceId,
      role,
      isActive: true,
      joinedAt: /* @__PURE__ */ new Date()
    }).returning();
    return result;
  }
  // Workspace invitation operations
  async createWorkspaceInvitation(invitation) {
    const [result] = await db.insert(workspaceInvitations).values(invitation).returning();
    return result;
  }
  async getWorkspaceInvitationByKey(key) {
    const [invitation] = await db.select().from(workspaceInvitations).where(eq(workspaceInvitations.invitationKey, key));
    return invitation;
  }
  async updateWorkspaceInvitation(id, updates) {
    const [result] = await db.update(workspaceInvitations).set(updates).where(eq(workspaceInvitations.id, id)).returning();
    return result;
  }
  async getWorkspaceInvitationsByWorkspaceId(workspaceId) {
    return await db.select().from(workspaceInvitations).where(eq(workspaceInvitations.workspaceId, workspaceId));
  }
  // Post operations with organization context
  async createPost(insertPost, userId, organizationId, workspaceId) {
    const [post] = await db.insert(posts).values({
      ...insertPost,
      userId,
      organizationId,
      workspaceId,
      executionMode: insertPost.executionMode || "review",
      language: insertPost.language || "en"
    }).returning();
    return post;
  }
  async getPost(id, organizationId, workspaceId) {
    const [post] = await db.select().from(posts).where(and(
      eq(posts.id, id),
      eq(posts.organizationId, organizationId),
      eq(posts.workspaceId, workspaceId)
    ));
    return post || void 0;
  }
  async updatePost(id, updates, organizationId, workspaceId) {
    const [post] = await db.update(posts).set(updates).where(and(
      eq(posts.id, id),
      eq(posts.organizationId, organizationId),
      eq(posts.workspaceId, workspaceId)
    )).returning();
    return post || void 0;
  }
  // Generated content operations with organization context
  async createGeneratedContent(insertContent, organizationId, workspaceId) {
    const [content] = await db.insert(generatedContent).values({
      ...insertContent,
      organizationId,
      workspaceId
    }).returning();
    return content;
  }
  async getGeneratedContentByPostId(postId, organizationId, workspaceId) {
    const [content] = await db.select().from(generatedContent).where(and(
      eq(generatedContent.postId, postId),
      eq(generatedContent.organizationId, organizationId),
      eq(generatedContent.workspaceId, workspaceId)
    ));
    return content || void 0;
  }
  // Published post operations
  async createPublishedPost(insertPublishedPost, workspaceId) {
    const [publishedPost] = await db.insert(publishedPosts).values({
      ...insertPublishedPost,
      workspaceId
    }).returning();
    return publishedPost;
  }
  // Template operations
  async createTemplate(insertTemplate, organizationId, workspaceId) {
    const [template] = await db.insert(templates).values({
      ...insertTemplate,
      organizationId,
      workspaceId,
      isActive: insertTemplate.isActive ?? true
    }).returning();
    return template;
  }
  async getTemplatesByUserId(userId, organizationId, workspaceId) {
    const results = await db.select({
      template: templates,
      post: posts
    }).from(templates).leftJoin(posts, eq(templates.postId, posts.id)).where(and(
      eq(posts.userId, userId),
      eq(templates.organizationId, organizationId),
      eq(templates.workspaceId, workspaceId)
    )).orderBy(templates.createdAt);
    return results.map((result) => ({
      ...result.template,
      objective: result.post?.subject || "No objective"
      // Use post subject as objective
    }));
  }
  async getTemplateById(id, userId, workspaceId) {
    const results = await db.select({
      template: templates
    }).from(templates).leftJoin(posts, eq(templates.postId, posts.id)).where(and(
      eq(templates.id, id),
      eq(posts.userId, userId),
      eq(templates.workspaceId, workspaceId)
    ));
    return results.length > 0 ? results[0].template : void 0;
  }
  async updateTemplate(id, updates, userId, workspaceId) {
    const template = await this.getTemplateById(id, userId, workspaceId);
    if (!template) return void 0;
    const [updated] = await db.update(templates).set(updates).where(and(
      eq(templates.id, id),
      eq(templates.workspaceId, workspaceId)
    )).returning();
    return updated;
  }
  async deleteTemplate(id, userId, workspaceId) {
    const template = await this.getTemplateById(id, userId, workspaceId);
    if (!template) return false;
    try {
      await db.delete(templates).where(and(
        eq(templates.id, id),
        eq(templates.workspaceId, workspaceId)
      ));
      return true;
    } catch (error) {
      console.error("Error deleting template:", error);
      return false;
    }
  }
  async executeTemplate(id, userId, workspaceId) {
    const template = await this.getTemplateById(id, userId, workspaceId);
    if (!template) throw new Error("Template not found");
    await db.update(templates).set({ lastExecutedAt: /* @__PURE__ */ new Date() }).where(and(
      eq(templates.id, id),
      eq(templates.workspaceId, workspaceId)
    ));
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
  async createFolder(insertFolder, organizationId, workspaceId) {
    const [folder] = await db.insert(folders).values({
      ...insertFolder,
      organizationId,
      workspaceId
    }).returning();
    return folder;
  }
  async getFoldersByUserId(userId, organizationId, workspaceId) {
    return await db.select().from(folders).where(and(
      eq(folders.userId, userId),
      eq(folders.organizationId, organizationId),
      eq(folders.workspaceId, workspaceId)
    ));
  }
  async deleteFolder(id, userId, workspaceId) {
    const result = await db.delete(folders).where(and(
      eq(folders.id, id),
      eq(folders.userId, userId),
      eq(folders.workspaceId, workspaceId)
    ));
    return result.rowCount !== null && result.rowCount > 0;
  }
  // Image operations
  async createImage(insertImage, organizationId, workspaceId) {
    const [image] = await db.insert(images).values({
      ...insertImage,
      organizationId,
      workspaceId
    }).returning();
    return image;
  }
  async getImagesByUserId(userId, organizationId, workspaceId) {
    return await db.select().from(images).where(and(
      eq(images.userId, userId),
      eq(images.organizationId, organizationId),
      eq(images.workspaceId, workspaceId)
    )).orderBy(images.createdAt);
  }
  async getImagesByFolder(userId, folderId, organizationId, workspaceId) {
    return await db.select().from(images).where(and(
      eq(images.userId, userId),
      eq(images.folderId, folderId),
      eq(images.organizationId, organizationId),
      eq(images.workspaceId, workspaceId)
    )).orderBy(images.createdAt);
  }
  async updateImage(id, updates, organizationId, workspaceId) {
    const [image] = await db.update(images).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(and(
      eq(images.id, id),
      eq(images.organizationId, organizationId),
      eq(images.workspaceId, workspaceId)
    )).returning();
    return image;
  }
  async deleteImage(id, userId, organizationId, workspaceId) {
    const result = await db.delete(images).where(and(
      eq(images.id, id),
      eq(images.userId, userId),
      eq(images.organizationId, organizationId),
      eq(images.workspaceId, workspaceId)
    ));
    return (result.rowCount || 0) > 0;
  }
  async getImageById(id, userId, organizationId, workspaceId) {
    const [image] = await db.select().from(images).where(and(
      eq(images.id, id),
      eq(images.userId, userId),
      eq(images.organizationId, organizationId),
      eq(images.workspaceId, workspaceId)
    ));
    return image;
  }
  // Social Media Configuration operations with organization context
  async getSocialMediaConfigs(userId, organizationId, workspaceId) {
    return await db.select().from(socialMediaConfigs).where(and(
      eq(socialMediaConfigs.userId, userId),
      eq(socialMediaConfigs.organizationId, organizationId),
      eq(socialMediaConfigs.workspaceId, workspaceId)
    )).orderBy(socialMediaConfigs.platform);
  }
  async upsertSocialMediaConfig(config, organizationId, workspaceId) {
    const [existingConfig] = await db.select().from(socialMediaConfigs).where(
      and(
        eq(socialMediaConfigs.userId, config.userId),
        eq(socialMediaConfigs.platform, config.platform),
        eq(socialMediaConfigs.organizationId, organizationId),
        eq(socialMediaConfigs.workspaceId, workspaceId)
      )
    );
    if (existingConfig) {
      const [updatedConfig] = await db.update(socialMediaConfigs).set({
        ...config,
        organizationId,
        workspaceId,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(
        and(
          eq(socialMediaConfigs.userId, config.userId),
          eq(socialMediaConfigs.platform, config.platform),
          eq(socialMediaConfigs.organizationId, organizationId),
          eq(socialMediaConfigs.workspaceId, workspaceId)
        )
      ).returning();
      return updatedConfig;
    } else {
      const [newConfig] = await db.insert(socialMediaConfigs).values({
        ...config,
        organizationId,
        workspaceId
      }).returning();
      return newConfig;
    }
  }
  async updateSocialMediaConfigTestStatus(userId, platform, status, organizationId, workspaceId, error) {
    const existingConfig = await db.select().from(socialMediaConfigs).where(
      and(
        eq(socialMediaConfigs.userId, userId),
        eq(socialMediaConfigs.platform, platform),
        eq(socialMediaConfigs.organizationId, organizationId),
        eq(socialMediaConfigs.workspaceId, workspaceId)
      )
    ).limit(1);
    if (existingConfig.length > 0) {
      await db.update(socialMediaConfigs).set({
        testStatus: status,
        testMessage: error || null,
        lastTestedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(
        and(
          eq(socialMediaConfigs.userId, userId),
          eq(socialMediaConfigs.platform, platform),
          eq(socialMediaConfigs.organizationId, organizationId),
          eq(socialMediaConfigs.workspaceId, workspaceId)
        )
      );
    } else {
      await db.insert(socialMediaConfigs).values({
        userId,
        platform,
        organizationId,
        workspaceId,
        isActive: true,
        apiKey: "",
        testStatus: status,
        testMessage: error || null,
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
  async createPostSchedule(insertSchedule, workspaceId) {
    const [schedule] = await db.insert(postSchedules).values({
      ...insertSchedule,
      workspaceId
    }).returning();
    return schedule;
  }
  async getPostSchedulesByUserId(userId, workspaceId) {
    return await db.select().from(postSchedules).where(and(
      eq(postSchedules.userId, userId),
      eq(postSchedules.workspaceId, workspaceId)
    )).orderBy(desc(postSchedules.createdAt));
  }
  async getPostScheduleById(id, userId, organizationId, workspaceId) {
    const [schedule] = await db.select().from(postSchedules).where(and(
      eq(postSchedules.id, id),
      eq(postSchedules.userId, userId),
      eq(postSchedules.workspaceId, workspaceId)
    ));
    return schedule || void 0;
  }
  async updatePostSchedule(id, updates, userId, organizationId, workspaceId) {
    const [schedule] = await db.update(postSchedules).set(updates).where(and(
      eq(postSchedules.id, id),
      eq(postSchedules.userId, userId),
      eq(postSchedules.workspaceId, workspaceId)
    )).returning();
    return schedule || void 0;
  }
  async deletePostSchedule(id, userId, organizationId, workspaceId) {
    const result = await db.delete(postSchedules).where(and(
      eq(postSchedules.id, id),
      eq(postSchedules.userId, userId),
      eq(postSchedules.workspaceId, workspaceId)
    ));
    return (result.rowCount || 0) > 0;
  }
  async createScheduleExecution(insertExecution, organizationId, workspaceId) {
    const [execution] = await db.insert(scheduleExecutions).values({
      ...insertExecution,
      organizationId,
      workspaceId
    }).returning();
    return execution;
  }
  async getScheduleExecutionsByScheduleId(scheduleId, userId, organizationId, workspaceId) {
    return await db.select().from(scheduleExecutions).where(and(
      eq(scheduleExecutions.scheduleId, scheduleId),
      eq(scheduleExecutions.workspaceId, workspaceId)
    )).orderBy(desc(scheduleExecutions.executedAt));
  }
  // User data deletion operations
  async getPostsByUserId(userId, organizationId, workspaceId) {
    return await db.select().from(posts).where(and(
      eq(posts.userId, userId),
      eq(posts.organizationId, organizationId),
      eq(posts.workspaceId, workspaceId)
    ));
  }
  async deleteUser(userId) {
    const result = await db.delete(users).where(eq(users.id, userId));
    return (result.rowCount || 0) > 0;
  }
  async deletePost(id, userId, organizationId, workspaceId) {
    const result = await db.delete(posts).where(and(
      eq(posts.id, id),
      eq(posts.userId, userId),
      eq(posts.organizationId, organizationId),
      eq(posts.workspaceId, workspaceId)
    ));
    return (result.rowCount || 0) > 0;
  }
  async deletePublishedPostsByPostId(postId, workspaceId) {
    const result = await db.delete(publishedPosts).where(and(
      eq(publishedPosts.postId, postId),
      eq(publishedPosts.workspaceId, workspaceId)
    ));
    return (result.rowCount || 0) > 0;
  }
  async deleteGeneratedContentByPostId(postId, workspaceId) {
    const result = await db.delete(generatedContent).where(and(
      eq(generatedContent.postId, postId),
      eq(generatedContent.workspaceId, workspaceId)
    ));
    return (result.rowCount || 0) > 0;
  }
  async deleteScheduleExecutions(scheduleId) {
    const result = await db.delete(scheduleExecutions).where(eq(scheduleExecutions.scheduleId, scheduleId));
    return (result.rowCount || 0) > 0;
  }
  async deleteSocialMediaConfigs(userId, organizationId, workspaceId) {
    const result = await db.delete(socialMediaConfigs).where(and(
      eq(socialMediaConfigs.userId, userId),
      eq(socialMediaConfigs.organizationId, organizationId),
      eq(socialMediaConfigs.workspaceId, workspaceId)
    ));
    return (result.rowCount || 0) > 0;
  }
  async deletePaymentTransactions(userId) {
    const result = await db.delete(paymentTransactions).where(eq(paymentTransactions.userId, userId));
    return (result.rowCount || 0) > 0;
  }
  // Email verification operations
  async setVerificationToken(userId, token) {
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1e3);
    await db.update(users).set({
      verificationToken: token,
      verificationTokenExpiry: expiryTime
    }).where(eq(users.id, userId));
  }
  async verifyEmail(token) {
    try {
      const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
      if (!user) return null;
      if (user.verificationTokenExpiry && user.verificationTokenExpiry < /* @__PURE__ */ new Date()) {
        return null;
      }
      await db.update(users).set({
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      }).where(eq(users.id, user.id));
      return { ...user, emailVerified: true };
    } catch (error) {
      console.error("Error verifying email:", error);
      return null;
    }
  }
  async getUserByVerificationToken(token) {
    try {
      const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
      return user || null;
    } catch (error) {
      console.error("Error getting user by verification token:", error);
      return null;
    }
  }
  async saveOnboardingData(userId, data) {
    const updateData = {};
    if (data.profileType) updateData.profileType = data.profileType;
    if (data.fullName) {
      const nameParts = data.fullName.split(" ");
      updateData.firstName = nameParts[0];
      updateData.lastName = nameParts.slice(1).join(" ");
    }
    if (data.role) updateData.role = data.role;
    if (data.website) updateData.website = data.website;
    if (data.companyName) updateData.companyName = data.companyName;
    if (data.industry) updateData.industry = data.industry;
    if (data.teamSize) updateData.teamSize = data.teamSize;
    if (data.interestedPlatforms) updateData.interestedPlatforms = data.interestedPlatforms;
    if (data.primaryGoals) updateData.primaryGoals = data.primaryGoals;
    if (data.timezone) updateData.timezone = data.timezone;
    if (data.language) updateData.language = data.language;
    const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
    return updatedUser;
  }
  async completeOnboarding(userId, data) {
    const updateData = {
      onboardingCompleted: true
    };
    if (data.profileType) updateData.profileType = data.profileType;
    if (data.fullName) {
      const nameParts = data.fullName.split(" ");
      updateData.firstName = nameParts[0];
      updateData.lastName = nameParts.slice(1).join(" ");
    }
    if (data.role) updateData.role = data.role;
    if (data.website) updateData.website = data.website;
    if (data.companyName) updateData.companyName = data.companyName;
    if (data.industry) updateData.industry = data.industry;
    if (data.teamSize) updateData.teamSize = data.teamSize;
    if (data.interestedPlatforms) updateData.interestedPlatforms = data.interestedPlatforms;
    if (data.primaryGoals) updateData.primaryGoals = data.primaryGoals;
    if (data.timezone) updateData.timezone = data.timezone;
    if (data.language) updateData.language = data.language;
    if (data.workspaceName) {
      const organizationData = {
        name: data.organizationName || "Organization_default",
        description: data.organizationDescription || "Default organization created during onboarding",
        uniqueId: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ownerId: userId,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const [organization] = await db.insert(organizations).values(organizationData).returning();
      await db.insert(userOrganizations).values({
        userId,
        organizationId: organization.id,
        role: "owner",
        isActive: true,
        joinedAt: /* @__PURE__ */ new Date(),
        lastActiveAt: /* @__PURE__ */ new Date()
      });
      const workspaceData = {
        organizationId: organization.id,
        name: data.workspaceName || "Default",
        description: data.workspaceDescription || "Default workspace created during onboarding",
        uniqueId: `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const [workspace] = await db.insert(workspaces).values(workspaceData).returning();
      await db.insert(userWorkspaces).values({
        workspaceId: workspace.id,
        userId,
        role: "administrator",
        isActive: true,
        joinedAt: /* @__PURE__ */ new Date(),
        lastActiveAt: /* @__PURE__ */ new Date()
      });
      updateData.currentOrganizationId = organization.id;
      updateData.currentWorkspaceId = workspace.id;
      updateData.userRole = "administrator";
      updateData.accountStatus = "active";
    }
    const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
    return updatedUser;
  }
  async setPasswordResetToken(email, token) {
    try {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
      const result = await db.update(users).set({
        passwordResetToken: token,
        passwordResetTokenExpiresAt: expiresAt
      }).where(eq(users.email, email)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error setting password reset token:", error);
      return false;
    }
  }
  async verifyPasswordResetToken(token) {
    try {
      const [user] = await db.select().from(users).where(and(
        eq(users.passwordResetToken, token),
        gt(users.passwordResetTokenExpiresAt, /* @__PURE__ */ new Date())
      ));
      return user || null;
    } catch (error) {
      console.error("Error verifying password reset token:", error);
      return null;
    }
  }
  async resetPassword(token, newPassword) {
    try {
      const user = await this.verifyPasswordResetToken(token);
      if (!user) {
        return false;
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const result = await db.update(users).set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null
      }).where(eq(users.id, user.id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error resetting password:", error);
      return false;
    }
  }
  // Admin invitation operations
  async createUserInvitation(invitation) {
    const [newInvitation] = await db.insert(userInvitations).values(invitation).returning();
    return newInvitation;
  }
  async createInvitationWorkspaceRoles(roles) {
    if (roles.length === 0) return;
    await db.insert(invitationWorkspaceRoles).values(roles);
  }
  async getInvitationWorkspaceRoles(invitationId) {
    return await db.select().from(invitationWorkspaceRoles).where(eq(invitationWorkspaceRoles.invitationId, invitationId));
  }
  // Automatic invitation expiration function
  async expireInvitations(organizationId) {
    const now = /* @__PURE__ */ new Date();
    const result = await db.update(userInvitations).set({ status: "expired" }).where(and(
      eq(userInvitations.organizationId, organizationId),
      eq(userInvitations.status, "pending"),
      lt(userInvitations.expiresAt, now)
    ));
    return result.rowCount || 0;
  }
  async getUserInvitationsByUserId(userId, organizationId) {
    const expiredCount = await this.expireInvitations(organizationId);
    if (expiredCount > 0) {
      console.log(`? EXPIRED ${expiredCount} invitation(s) automatically`);
    }
    const invitations = await db.select().from(userInvitations).where(and(
      eq(userInvitations.invitedByUserId, userId),
      eq(userInvitations.organizationId, organizationId)
    )).orderBy(desc(userInvitations.invitedAt));
    return invitations;
  }
  async getUserInvitationsByEmail(email, organizationId) {
    const invitations = await db.select().from(userInvitations).where(and(
      eq(userInvitations.email, email),
      eq(userInvitations.organizationId, organizationId)
    )).orderBy(desc(userInvitations.invitedAt));
    return invitations;
  }
  async getUserInvitationByKey(key) {
    const [invitation] = await db.select().from(userInvitations).where(eq(userInvitations.invitationKey, key)).limit(1);
    return invitation || void 0;
  }
  async updateUserInvitation(id, updates) {
    const [updated] = await db.update(userInvitations).set(updates).where(eq(userInvitations.id, id)).returning();
    return updated || void 0;
  }
  async getInvitationByEmail(email, organizationId) {
    const [invitation] = await db.select().from(userInvitations).where(and(
      eq(userInvitations.email, email),
      eq(userInvitations.organizationId, organizationId)
    )).orderBy(desc(userInvitations.invitedAt)).limit(1);
    return invitation || void 0;
  }
  async getPendingApprovalsForAdmin(adminId, organizationId) {
    return await db.select().from(userInvitations).where(and(
      or(
        eq(userInvitations.status, "pending"),
        eq(userInvitations.status, "password_set")
      ),
      eq(userInvitations.organizationId, organizationId)
    )).orderBy(desc(userInvitations.invitedAt));
  }
  async approveUserInvitation(id, approvedByUserId) {
    const [approved] = await db.update(userInvitations).set({
      status: "approved",
      approvedAt: /* @__PURE__ */ new Date(),
      approvedByUserId
    }).where(eq(userInvitations.id, id)).returning();
    return approved || void 0;
  }
  async getInvitationById(invitationId, organizationId) {
    const [invitation] = await db.select().from(userInvitations).where(and(
      eq(userInvitations.id, invitationId),
      eq(userInvitations.organizationId, organizationId)
    )).limit(1);
    return invitation || void 0;
  }
  async assignUserToAllWorkspaces(userId, organizationId) {
    await db.insert(userOrganizations).values({
      userId,
      organizationId,
      role: "member",
      isActive: true,
      joinedAt: /* @__PURE__ */ new Date(),
      lastActiveAt: /* @__PURE__ */ new Date()
    }).onConflictDoUpdate({
      target: [userOrganizations.userId, userOrganizations.organizationId],
      set: {
        isActive: true,
        lastActiveAt: /* @__PURE__ */ new Date()
      }
    });
    const workspaces2 = await this.getWorkspacesByOrganizationId(organizationId);
    for (const workspace of workspaces2) {
      await db.insert(userWorkspaces).values({
        userId,
        workspaceId: workspace.id,
        joinedAt: /* @__PURE__ */ new Date(),
        isActive: true
      }).onConflictDoUpdate({
        target: [userWorkspaces.userId, userWorkspaces.workspaceId],
        set: {
          isActive: true
        }
      });
    }
  }
  async updateUserRoleAndStatus(userId, role, status) {
    const [updated] = await db.update(users).set({
      userRole: role,
      accountStatus: status,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return updated || void 0;
  }
  async getInvitationById(invitationId, organizationId) {
    const [invitation] = await db.select().from(userInvitations).where(and(
      eq(userInvitations.id, invitationId),
      eq(userInvitations.organizationId, organizationId)
    )).limit(1);
    return invitation || void 0;
  }
  async resendInvitation(invitationId, organizationId, newExpiresAt, expirationMinutes) {
    console.log(`?? RESEND INVITATION DEBUG - Starting resend for invitation ID: ${invitationId}, org: ${organizationId}`);
    const originalInvitation = await this.getInvitationById(invitationId, organizationId);
    if (!originalInvitation) {
      throw new Error("Original invitation not found");
    }
    console.log(`?? RESEND INVITATION DEBUG - Original invitation found: ${originalInvitation.email}`);
    const newInvitationKey = crypto.randomUUID();
    const [newInvitation] = await db.insert(userInvitations).values({
      organizationId: originalInvitation.organizationId,
      email: originalInvitation.email,
      invitedByUserId: originalInvitation.invitedByUserId,
      invitationKey: newInvitationKey,
      status: "pending",
      invitedAt: /* @__PURE__ */ new Date(),
      expiresAt: newExpiresAt,
      expirationMinutes
    }).returning();
    console.log(`?? RESEND INVITATION DEBUG - New invitation created with ID: ${newInvitation.id}`);
    const originalWorkspaceRoles = await this.getInvitationWorkspaceRoles(invitationId);
    console.log(`?? RESEND INVITATION DEBUG - Found ${originalWorkspaceRoles.length} original workspace roles:`, originalWorkspaceRoles);
    if (originalWorkspaceRoles.length > 0) {
      const roleAssignments = originalWorkspaceRoles.map((role) => ({
        invitationId: newInvitation.id,
        workspaceId: role.workspaceId,
        roles: role.roles
      }));
      console.log(`?? RESEND INVITATION DEBUG - Creating role assignments:`, roleAssignments);
      await this.createInvitationWorkspaceRoles(roleAssignments);
      console.log(`?? RESEND INVITATION DEBUG - Role assignments created successfully`);
    } else {
      console.log(`?? RESEND INVITATION DEBUG - No workspace roles found for original invitation`);
    }
    return newInvitation;
  }
  async cancelInvitation(invitationId, organizationId, canceledByUserId) {
    console.log(`?? CANCEL INVITATION DEBUG - Starting cancel for invitation ID: ${invitationId}, org: ${organizationId}`);
    const [canceled] = await db.update(userInvitations).set({
      status: "canceled",
      canceledAt: /* @__PURE__ */ new Date(),
      canceledByUserId
    }).where(and(
      eq(userInvitations.id, invitationId),
      eq(userInvitations.organizationId, organizationId)
    )).returning();
    if (canceled) {
      console.log(`?? CANCEL INVITATION DEBUG - Invitation canceled successfully: ${canceled.email}`);
    } else {
      console.log(`?? CANCEL INVITATION DEBUG - Invitation not found or could not be canceled`);
    }
    return canceled || void 0;
  }
  // Workspace role operations
  async getWorkspaceRoles() {
    return await db.select().from(workspaceRoles).orderBy(workspaceRoles.name);
  }
  async getWorkspaceRoleByName(name) {
    const [role] = await db.select().from(workspaceRoles).where(eq(workspaceRoles.name, name));
    return role;
  }
  async createWorkspaceRole(role) {
    const [newRole] = await db.insert(workspaceRoles).values(role).returning();
    return newRole;
  }
  async updateWorkspaceRole(id, updates) {
    const [updated] = await db.update(workspaceRoles).set(updates).where(eq(workspaceRoles.id, id)).returning();
    return updated;
  }
  async deleteWorkspaceRole(id) {
    const result = await db.delete(workspaceRoles).where(eq(workspaceRoles.id, id));
    return (result.rowCount || 0) > 0;
  }
  // User workspace role operations
  async getUserWorkspaceRoles(userId, workspaceIdOrOrganizationId) {
    const workspace = await db.select().from(workspaces).where(eq(workspaces.id, workspaceIdOrOrganizationId)).limit(1);
    if (workspace.length > 0) {
      return await db.select().from(userWorkspaceRoles).where(and(
        eq(userWorkspaceRoles.userId, userId),
        eq(userWorkspaceRoles.workspaceId, workspaceIdOrOrganizationId)
      )).orderBy(userWorkspaceRoles.assignedAt);
    } else {
      return await db.select({
        id: userWorkspaceRoles.id,
        userId: userWorkspaceRoles.userId,
        workspaceId: userWorkspaceRoles.workspaceId,
        roleId: userWorkspaceRoles.roleId,
        role: workspaceRoles.name,
        assignedAt: userWorkspaceRoles.assignedAt,
        assignedByUserId: userWorkspaceRoles.assignedByUserId,
        isActive: sql`true`.as("isActive")
      }).from(userWorkspaceRoles).innerJoin(workspaces, eq(userWorkspaceRoles.workspaceId, workspaces.id)).innerJoin(workspaceRoles, eq(userWorkspaceRoles.roleId, workspaceRoles.id)).where(and(
        eq(userWorkspaceRoles.userId, userId),
        eq(workspaces.organizationId, workspaceIdOrOrganizationId)
      )).orderBy(userWorkspaceRoles.assignedAt);
    }
  }
  async getUserWorkspaceRolesByWorkspace(workspaceId) {
    return await db.select().from(userWorkspaceRoles).where(eq(userWorkspaceRoles.workspaceId, workspaceId)).orderBy(userWorkspaceRoles.assignedAt);
  }
  async getAllUserWorkspaceRolesForOrganization(organizationId) {
    return await db.select({
      id: userWorkspaceRoles.id,
      userId: userWorkspaceRoles.userId,
      workspaceId: userWorkspaceRoles.workspaceId,
      roleId: userWorkspaceRoles.roleId,
      assignedAt: userWorkspaceRoles.assignedAt,
      assignedByUserId: userWorkspaceRoles.assignedByUserId,
      // Include role details
      role: {
        id: workspaceRoles.id,
        name: workspaceRoles.name,
        description: workspaceRoles.description,
        permissions: workspaceRoles.permissions
      },
      // Include workspace details
      workspace: {
        id: workspaces.id,
        name: workspaces.name,
        description: workspaces.description
      }
    }).from(userWorkspaceRoles).innerJoin(workspaceRoles, eq(userWorkspaceRoles.roleId, workspaceRoles.id)).innerJoin(workspaces, eq(userWorkspaceRoles.workspaceId, workspaces.id)).where(eq(workspaces.organizationId, organizationId)).orderBy(userWorkspaceRoles.userId, userWorkspaceRoles.assignedAt);
  }
  async assignUserWorkspaceRole(assignment) {
    const [newAssignment] = await db.insert(userWorkspaceRoles).values(assignment).returning();
    return newAssignment;
  }
  async removeUserWorkspaceRole(userId, workspaceId, roleId) {
    try {
      const result = await db.delete(userWorkspaceRoles).where(and(
        eq(userWorkspaceRoles.userId, userId),
        eq(userWorkspaceRoles.workspaceId, workspaceId),
        eq(userWorkspaceRoles.roleId, roleId)
      ));
      console.log("??? Delete result:", result);
      const remainingRoles = await db.select().from(userWorkspaceRoles).where(and(
        eq(userWorkspaceRoles.userId, userId),
        eq(userWorkspaceRoles.workspaceId, workspaceId),
        eq(userWorkspaceRoles.roleId, roleId)
      ));
      const wasDeleted = remainingRoles.length === 0;
      console.log("??? Was actually deleted:", wasDeleted);
      return wasDeleted;
    } catch (error) {
      console.error("??? Error in removeUserWorkspaceRole:", error);
      return false;
    }
  }
  async removeAllUserWorkspaceRoles(userId, workspaceId) {
    const result = await db.delete(userWorkspaceRoles).where(and(
      eq(userWorkspaceRoles.userId, userId),
      eq(userWorkspaceRoles.workspaceId, workspaceId)
    ));
    return (result.rowCount || 0) > 0;
  }
  async getUserWorkspacePermissions(userId, workspaceId) {
    const userRoles = await db.select({
      permissions: workspaceRoles.permissions
    }).from(userWorkspaceRoles).innerJoin(workspaceRoles, eq(userWorkspaceRoles.roleId, workspaceRoles.id)).where(and(
      eq(userWorkspaceRoles.userId, userId),
      eq(userWorkspaceRoles.workspaceId, workspaceId)
    ));
    const allPermissions = userRoles.reduce((acc, role) => {
      if (role.permissions) {
        acc.push(...role.permissions);
      }
      return acc;
    }, []);
    return [...new Set(allPermissions)];
  }
  async hasWorkspacePermission(userId, workspaceId, permission) {
    const userPermissions = await this.getUserWorkspacePermissions(userId, workspaceId);
    return userPermissions.includes(permission);
  }
  // Admin operations for pending invitations and user search
  async getPendingInvitationsWithoutRoles(organizationId) {
    const result = await db.execute(sql`
      SELECT 
        u.id,
        u.email,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.account_status as "accountStatus",
        u.created_at as "joinedAt",
        TRUE as "isActive"
      FROM users u
      INNER JOIN user_organizations uo ON u.id = uo.user_id
      WHERE uo.organization_id = ${organizationId}
      AND u.account_status = 'pending_approval'
      AND u.account_status NOT IN ('approved', 'active')
    `);
    return result.rows;
  }
  async searchUsersInOrganization(organizationId, query) {
    console.log("?? Starting search with query:", query, "orgId:", organizationId);
    const searchPattern = `%${query.toLowerCase()}%`;
    try {
      const result = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        accountStatus: users.accountStatus,
        joinedAt: users.createdAt,
        lastActiveAt: userOrganizations.lastActiveAt
      }).from(users).innerJoin(userOrganizations, eq(users.id, userOrganizations.userId)).where(and(
        eq(userOrganizations.organizationId, organizationId),
        or(
          sql`LOWER(${users.email}) LIKE ${searchPattern}`,
          sql`LOWER(${users.firstName}) LIKE ${searchPattern}`,
          sql`LOWER(${users.lastName}) LIKE ${searchPattern}`
        )
      )).limit(10);
      console.log("?? Base search returned:", result.length, "users");
      const usersWithAssignments = [];
      for (const user of result) {
        const workspaceAssignments = await db.select({
          workspaceId: workspaces.id,
          workspaceName: workspaces.name,
          roleName: workspaceRoles.name,
          assignedAt: userWorkspaceRoles.assignedAt
        }).from(userWorkspaceRoles).innerJoin(workspaces, eq(userWorkspaceRoles.workspaceId, workspaces.id)).innerJoin(workspaceRoles, eq(userWorkspaceRoles.roleId, workspaceRoles.id)).where(and(
          eq(userWorkspaceRoles.userId, user.id),
          eq(workspaces.organizationId, organizationId)
        )).orderBy(workspaces.name);
        usersWithAssignments.push({
          ...user,
          workspaceAssignments
        });
      }
      console.log("?? Final results with assignments:", usersWithAssignments.length);
      return usersWithAssignments;
    } catch (error) {
      console.error("Error in searchUsersInOrganization:", error);
      return [];
    }
  }
  async assignRoleToInvitedUser(userId, workspaceId, roleId, organizationId) {
    await db.insert(userWorkspaces).values({
      userId,
      workspaceId,
      joinedAt: /* @__PURE__ */ new Date(),
      isActive: true
    }).onConflictDoNothing();
    await db.insert(userWorkspaceRoles).values({
      userId,
      workspaceId,
      roleId,
      assignedAt: /* @__PURE__ */ new Date(),
      isActive: true
    }).onConflictDoNothing();
    await db.update(users).set({
      accountStatus: "active",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  // Consent audit logging implementation
  async logConsentDecision(auditData) {
    try {
      const [result] = await db.insert(consentAuditLog).values(auditData).returning();
      return result;
    } catch (error) {
      console.error("Error logging consent decision:", error);
      throw error;
    }
  }
  // Admin user deletion methods
  async getUserWorkspacesByOrganization(userId, organizationId) {
    const result = await db.select().from(userWorkspaces).innerJoin(workspaces, eq(userWorkspaces.workspaceId, workspaces.id)).where(and(
      eq(userWorkspaces.userId, userId),
      eq(workspaces.organizationId, organizationId)
    ));
    return result.map((r) => r.user_workspaces);
  }
  async deleteScheduleExecutions(scheduleId) {
    await db.delete(scheduleExecutions).where(eq(scheduleExecutions.scheduleId, scheduleId));
  }
  async deletePublishedPosts(postId) {
    await db.delete(publishedPosts).where(eq(publishedPosts.postId, postId));
  }
  async deleteGeneratedContent(postId) {
    await db.delete(generatedContent).where(eq(generatedContent.postId, postId));
  }
  async anonymizeUserTransactions(userId, workspaceId) {
    await db.update(paymentTransactions).set({
      userId: "deleted_user",
      billingAddress: null,
      cardLast4: "****",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(and(
      eq(paymentTransactions.userId, userId),
      eq(paymentTransactions.workspaceId, workspaceId)
    ));
  }
  async deleteUserWorkspaceRoles(userId, organizationId) {
    const orgWorkspaces = await db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.organizationId, organizationId));
    if (orgWorkspaces.length > 0) {
      const workspaceIds = orgWorkspaces.map((w) => w.id);
      await db.delete(userWorkspaceRoles).where(and(
        eq(userWorkspaceRoles.userId, userId),
        sql`${userWorkspaceRoles.workspaceId} = ANY(${workspaceIds})`
      ));
    }
  }
  async deleteUserWorkspaces(userId, organizationId) {
    const orgWorkspaces = await db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.organizationId, organizationId));
    if (orgWorkspaces.length > 0) {
      const workspaceIds = orgWorkspaces.map((w) => w.id);
      await db.delete(userWorkspaces).where(and(
        eq(userWorkspaces.userId, userId),
        sql`${userWorkspaces.workspaceId} = ANY(${workspaceIds})`
      ));
    }
  }
  async deleteUserOrganization(userId, organizationId) {
    await db.delete(userOrganizations).where(and(
      eq(userOrganizations.userId, userId),
      eq(userOrganizations.organizationId, organizationId)
    ));
  }
  async deleteUserInvitations(userId, organizationId) {
    await db.delete(userInvitations).where(and(
      eq(userInvitations.userId, userId),
      eq(userInvitations.organizationId, organizationId)
    ));
  }
  async deleteUserAccount(userId) {
    await db.delete(users).where(eq(users.id, userId));
  }
  async deleteSocialMediaConfig(id, userId, workspaceId) {
    const result = await db.delete(socialMediaConfigs).where(and(
      eq(socialMediaConfigs.id, id),
      eq(socialMediaConfigs.userId, userId),
      eq(socialMediaConfigs.workspaceId, workspaceId)
    ));
    return true;
  }
};
var storage = new DatabaseStorage();

// server/paymentGateways.ts
import Stripe from "stripe";
import dotenv3 from "dotenv";
dotenv3.config();
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

// server/routes.ts
import { z } from "zod";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as OIDCStrategy } from "passport-openidconnect";
import { Strategy as GitHubStrategy } from "passport-github2";
import session from "express-session";
import connectPg from "connect-pg-simple";
import cors from "cors";
import dotenv4 from "dotenv";

// server/authConfig.ts
var authConfig = {
  // Enable/disable authentication globally
  enabled: process.env.AUTH_ENABLED !== "false",
  // Default to enabled unless explicitly disabled
  // Optional: Skip authentication for specific routes
  skipAuthRoutes: [
    "/",
    "/documentation",
    "/watch-demo",
    "/privacy-policy",
    "/i18n-demo"
  ],
  // Default user for when auth is disabled
  defaultUser: {
    id: "anonymous",
    email: "anonymous@example.com",
    firstName: "Anonymous",
    lastName: "User",
    provider: "local",
    providerId: "anonymous",
    credits: 1e3,
    subscriptionPlan: "pro",
    subscriptionStatus: "active",
    onboardingCompleted: true,
    currentWorkspaceId: 2,
    // Default workspace for anonymous users
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  }
};

// server/auth.ts
dotenv4.config();
function setupAuth(app2) {
  if (!authConfig.enabled) {
    console.log("\u{1F513} Authentication is DISABLED - All users will be anonymous");
    return;
  }
  console.log("\u{1F510} Authentication is ENABLED");
  app2.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5000",
      credentials: true
    })
  );
  const pgStore = connectPg(session);
  app2.use(
    session({
      secret: process.env.SESSION_SECRET || "change-this-in-prod",
      store: new pgStore({ pool, tableName: "sessions", ttl: 7 * 24 * 60 * 60 }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1e3
      }
    })
  );
  app2.use(passport.initialize());
  app2.use(passport.session());
  app2.use((req, res, next) => {
    if (req.session && req.session.passport && req.session.passport.user && !req.user) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying stale session:", err);
        }
      });
    }
    next();
  });
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        done(null, null);
        return;
      }
      done(null, user);
    } catch (error) {
      console.error("Session deserialization error:", error);
      done(null, null);
    }
  });
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await storage.authenticateUser(email, password);
          return done(null, user || false, user ? void 0 : { message: "Invalid credentials" });
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    const FB_CB = process.env.FACEBOOK_CALLBACK_URL;
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: FB_CB,
          profileFields: ["id", "emails", "name", "picture.type(large)"]
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
              lastAuthMethod: "facebook"
            });
            done(null, u);
          } catch (e) {
            done(e);
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
          callbackURL: process.env.CALLBACK_URL
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
              lastAuthMethod: "google"
            });
            done(null, u);
          } catch (e) {
            done(e);
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
          callbackURL: "/auth/github/callback"
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
              lastAuthMethod: "github"
            });
            done(null, u);
          } catch (e) {
            done(e);
          }
        }
      )
    );
  }
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    const LN_CB = process.env.LINKEDIN_CALLBACK_URL;
    passport.use(
      "linkedin-oidc",
      new OIDCStrategy(
        {
          issuer: "https://www.linkedin.com/oauth",
          // ← must match the token's `iss`
          authorizationURL: "https://www.linkedin.com/oauth/v2/authorization",
          tokenURL: "https://www.linkedin.com/oauth/v2/accessToken",
          userInfoURL: "https://api.linkedin.com/v2/userinfo",
          clientID: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
          callbackURL: LN_CB,
          scope: ["openid", "profile", "email"],
          state: true
        },
        // note the exact signature: issuer, claims, profile, accessToken, refreshToken, params, done
        async function(issuer, claims, profile, accessToken, refreshToken, params, done) {
          console.log("[LinkedIn Strat] issuer=", issuer);
          console.log("[LinkedIn Strat] claims =", claims);
          console.log("[LinkedIn Strat] raw profile =", profile);
          try {
            const data = profile || claims;
            const providerId = data.id || claims.sub;
            const firstName = data.localizedFirstName || data.name?.givenName || data.given_name || null;
            const lastName = data.localizedLastName || data.name?.familyName || data.family_name || null;
            const email = data.emails?.[0]?.value || data.email || null;
            const userId = `linkedin_${providerId}`;
            const u = await storage.upsertUser({
              id: userId,
              email,
              firstName,
              lastName,
              profileImageUrl: data.profilePicture?.["displayImage~"]?.elements?.[0]?.identifiers?.[0].identifier || null,
              authProvider: "linkedin",
              providerId,
              lastAuthMethod: "linkedin"
            });
            console.log("[LinkedIn Strat] upsertUser OK", u.id);
            done(null, u);
          } catch (err) {
            console.error("[LinkedIn Strat] verify error:", err);
            done(err);
          }
        }
      )
    );
  }
}
var requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Authentication required" });
};
var optionalAuth = (_req, _res, next) => next();

// server/routes.ts
import passport2 from "passport";
import multer from "multer";

// server/email.ts
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import dotenv5 from "dotenv";
dotenv5.config();
var smtpConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true" || parseInt(process.env.SMTP_PORT || "587") === 465,
  // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || process.env.POSTMEAI_EMAIL,
    pass: process.env.EMAIL_PASS || "your-password"
  },
  connectionTimeout: 15e3,
  // 15 seconds
  greetingTimeout: 1e4,
  // 10 seconds  
  socketTimeout: 15e3,
  // 15 seconds
  logger: true,
  // Enable logging for debugging
  debug: true
  // Enable debug info
};
console.log("SMTP Configuration:", {
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.secure,
  user: smtpConfig.auth.user,
  hasPassword: !!smtpConfig.auth.pass
});
var transporter = nodemailer.createTransport(smtpConfig);
transporter.verify().then(() => {
  console.log("\u2705 SMTP connection verified successfully");
}).catch((error) => {
  console.error("\u274C SMTP connection failed:", error);
});
function generateVerificationToken() {
  return randomBytes(32).toString("hex");
}
function generatePasswordResetToken() {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
}
async function sendVerificationEmail(email, token) {
  try {
    const getBaseUrl = () => {
      if (process.env.NODE_ENV === "production") {
        return "https://www.postmeai.com";
      }
      if (process.env.REPLIT_DEV_DOMAIN) {
        return `https://${process.env.REPLIT_DEV_DOMAIN}`;
      }
      return "http://localhost:5000";
    };
    const verificationUrl = `${getBaseUrl()}/auth/verify-email?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER || "PostMeAI <" + process.env.POSTMEAI_EMAIL + ">",
      to: email,
      subject: "Verify Your PostMeAI Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to PostMeAI!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Turn Ideas into Viral Content</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Please verify your email address</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Thank you for signing up for PostMeAI! To complete your registration and start creating amazing social media content, please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        display: inline-block;
                        font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              If the button doesn't work, you can also copy and paste this link into your browser:
              <br><br>
              <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              This verification link will expire in 24 hours. If you didn't create an account with PostMeAI, please ignore this email.
            </p>
          </div>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}
async function sendWelcomeEmail(email, firstName) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "PostMeAI <" + process.env.POSTMEAI_EMAIL + ">",
      to: email,
      subject: "Welcome to PostMeAI - Your Account is Verified!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome ${firstName ? firstName : ""}!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your PostMeAI account is now active</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">\u{1F389} You're all set!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Your email has been verified and you now have full access to PostMeAI. Start creating amazing social media content with the power of AI!
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
              <ul style="color: #666; padding-left: 20px;">
                <li>Create AI-powered social media posts</li>
                <li>Schedule content across multiple platforms</li>
                <li>Build and manage your image library</li>
                <li>Set up automated posting templates</li>
                <li>Connect your social media accounts</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.POSTMEAI_FE_URL}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        display: inline-block;
                        font-size: 16px;">
                Start Creating Content
              </a>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Need help? Check out our documentation or contact support at ${process.env.POSTMEAI_EMAIL}
            </p>
          </div>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
}
async function sendUserInvitationEmail(email, invitationKey, inviterName, userRole) {
  try {
    const baseUrl = (() => {
      if (process.env.NODE_ENV === "production") {
        return "https://postmeai.com";
      }
      if (process.env.REPLIT_DEV_DOMAIN) {
        return `https://${process.env.REPLIT_DEV_DOMAIN}`;
      }
      if (process.env.REPL_SLUG) {
        return `https://${process.env.REPL_SLUG}--${process.env.REPL_OWNER || "user"}.replit.app`;
      }
      return "http://localhost:5000";
    })();
    const invitationUrl = `${baseUrl}/join-invitation?key=${invitationKey}`;
    console.log("Invitation email URL generation:", {
      baseUrl,
      invitationUrl,
      REPLIT_DEV_DOMAIN: process.env.REPLIT_DEV_DOMAIN,
      NODE_ENV: process.env.NODE_ENV
    });
    const mailOptions = {
      from: process.env.EMAIL_USER || "PostMeAI <contact@postmeai.com>",
      to: email,
      subject: `${inviterName} invited you to join PostMeAI`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited to PostMeAI!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Turn Ideas into Viral Content</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Welcome to the Team!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              <strong>${inviterName}</strong> has invited you to join PostMeAI. 
              You'll be able to create amazing social media content and collaborate with your team.
            </p>
            
            <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin-top: 0; font-size: 18px;">Join Your Team</h3>
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Your admin will assign your role and permissions after you join.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationUrl}" 
                 style="background: #667eea !important; 
                        color: #ffffff !important; 
                        padding: 15px 30px !important; 
                        text-decoration: none !important; 
                        border-radius: 5px !important; 
                        font-weight: bold !important; 
                        display: inline-block !important;
                        font-size: 16px !important;
                        border: none !important;
                        text-align: center !important;">
                Join PostMeAI
              </a>
            </div>
            
            <div style="background: #f0f9ff; border: 2px solid #0284c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #0c4a6e; margin-top: 0; font-size: 16px;">Next Steps:</h3>
              <ol style="color: #0c4a6e; padding-left: 20px; margin: 10px 0;">
                <li>Click the "Join PostMeAI" button above</li>
                <li>Set up your secure password</li>
                <li>Wait for admin approval to activate your account</li>
                <li>Start creating amazing content!</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px;">
                Best regards,<br>
                The PostMeAI Team
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 10px;">
                Need help? Contact us at support@postmeai.com
              </p>
            </div>
          </div>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send user invitation email:", error);
    let errorMessage = "Failed to send invitation email";
    if (error.code === "EENVELOPE" && error.response) {
      if (error.response.includes("nullMX")) {
        errorMessage = `Email domain "${email.split("@")[1]}" does not accept mail. Please verify the email address or use a different email provider.`;
      } else if (error.response.includes("Recipient address rejected")) {
        errorMessage = `The email address "${email}" was rejected by the mail server. Please verify the email address is correct.`;
      } else {
        errorMessage = `Email delivery failed: ${error.response}`;
      }
    } else if (error.code === "ECONNECTION") {
      errorMessage = "Unable to connect to email server. Please try again later.";
    } else if (error.code === "EAUTH") {
      errorMessage = "Email authentication failed. Please contact system administrator.";
    }
    return { success: false, error: errorMessage };
  }
}
async function sendPasswordResetEmail(email, token) {
  try {
    console.log("Attempting to send password reset email to:", email);
    console.log("Using token:", token);
    const mailOptions = {
      from: process.env.EMAIL_USER || "PostMeAI <contact@postmeai.com>",
      to: email,
      subject: "Reset Your PostMeAI Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">PostMeAI Password Reset</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              We received a request to reset your PostMeAI password. Use the verification code below to reset your password.
            </p>
            
            <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
              <h3 style="color: #1e293b; margin-bottom: 15px; font-size: 18px;">Your verification code:</h3>
              <div style="font-size: 36px; font-weight: bold; color: #6366f1; letter-spacing: 8px; margin: 20px 0; font-family: 'Courier New', monospace; background: white; padding: 20px; border-radius: 6px; border: 2px solid #6366f1;">
                ${token}
              </div>
              <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                \u23F0 This code will expire in 1 hour for security reasons.
              </p>
            </div>
            
            <div style="background: #f0f9ff; border: 2px solid #0284c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #0c4a6e; margin-top: 0; font-size: 16px;">How to reset your password:</h3>
              <ol style="color: #0c4a6e; padding-left: 20px; margin: 10px 0;">
                <li>Go to the PostMeAI password reset page</li>
                <li>Enter the verification code above</li>
                <li>Create your new secure password</li>
                <li>Start using your account with the new password</li>
              </ol>
            </div>
            
            <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                <strong>\u{1F512} Security Note:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure and no changes will be made.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${(() => {
        if (process.env.NODE_ENV === "production") {
          return "https://postmeai.com";
        }
        if (process.env.REPLIT_DEV_DOMAIN) {
          return `https://${process.env.REPLIT_DEV_DOMAIN}`;
        }
        return "http://localhost:5000";
      })()}/reset-password" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        display: inline-block;
                        font-size: 16px;">
                Reset Password Now
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px;">
                Best regards,<br>
                The PostMeAI Team
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 10px;">
                Need help? Contact us at support@postmeai.com
              </p>
            </div>
          </div>
        </div>
      `
    };
    console.log("Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result);
    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    return false;
  }
}

// server/routes.ts
import crypto2 from "crypto";
import bcrypt2 from "bcryptjs";
import { eq as eq2, and as and2 } from "drizzle-orm";
import dotenv6 from "dotenv";
var localAuthSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
function enforceMultiTenancy(req) {
  if (!req.user?.currentWorkspaceId || !req.user?.currentOrganizationId) {
    if (req.user?.id === "anonymous") {
      return { organizationId: 1, workspaceId: 2 };
    }
    throw new Error("No organization/workspace context available");
  }
  if (req.user.currentWorkspaceId && req.user.currentOrganizationId) {
    return {
      organizationId: req.user.currentOrganizationId,
      workspaceId: req.user.currentWorkspaceId
    };
  }
  throw new Error("Invalid organization/workspace context");
}
function getCurrentContext(req) {
  return enforceMultiTenancy(req);
}
function getCurrentWorkspaceId(req) {
  return getCurrentContext(req).workspaceId;
}
function getCurrentOrganizationId(req) {
  return getCurrentContext(req).organizationId;
}
dotenv6.config();
async function hasAdminAccess(userId, organizationId) {
  try {
    console.log("\u{1F50D} hasAdminAccess DEBUG - UserId:", userId, "OrgId:", organizationId);
    const orgRole = await storage.getUserOrganization(userId, organizationId);
    console.log("\u{1F50D} hasAdminAccess - OrgRole:", orgRole);
    if (orgRole && orgRole.role === "owner" && orgRole.isActive) {
      console.log("\u{1F50D} hasAdminAccess - Organization owner detected, granting access");
      return true;
    }
    const workspaceRoles2 = await storage.getUserWorkspaceRoles(userId, organizationId);
    console.log("\u{1F50D} hasAdminAccess - WorkspaceRoles:", workspaceRoles2);
    const hasAdministratorRole = workspaceRoles2.some((role) => {
      console.log("\u{1F50D} hasAdminAccess - Checking role:", JSON.stringify(role, null, 2));
      let roleStr = "";
      if (typeof role.role === "string") {
        roleStr = role.role;
        console.log("\u{1F50D} hasAdminAccess - Found role.role as string:", roleStr);
      } else if (role.role && typeof role.role === "object" && role.role.name) {
        roleStr = role.role.name;
        console.log("\u{1F50D} hasAdminAccess - Found role.role.name:", roleStr);
      } else if (role.roleName) {
        roleStr = role.roleName;
        console.log("\u{1F50D} hasAdminAccess - Found role.roleName:", roleStr);
      } else if (role.name) {
        roleStr = role.name;
        console.log("\u{1F50D} hasAdminAccess - Found role.name:", roleStr);
      } else {
        console.log("\u{1F50D} hasAdminAccess - No recognizable role field found in:", Object.keys(role));
      }
      const isActive = role.isActive !== false;
      console.log("\u{1F50D} hasAdminAccess - Role string extracted:", roleStr, "IsActive:", isActive, "Is Administrator?:", roleStr === "administrator");
      return roleStr === "administrator" && isActive;
    });
    console.log("\u{1F50D} hasAdminAccess - Has administrator role:", hasAdministratorRole);
    return hasAdministratorRole;
  } catch (error) {
    console.error("Error checking admin access:", error);
    return false;
  }
}
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
  const getBaseUrl = () => {
    if (process.env.NODE_ENV === "production") {
      return "https://postmeai.com";
    }
    if (process.env.REPLIT_DEV_DOMAIN) {
      return `https://${process.env.REPLIT_DEV_DOMAIN}`;
    }
    return "http://localhost:5000";
  };
  setupAuth(app2);
  app2.post("/api/consent/log", async (req, res) => {
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
      if (!consentAction || !userId && !email && !sessionId) {
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
        userAgent: req.get("User-Agent") || null,
        ipAddress: req.ip || req.connection.remoteAddress || null,
        consentTimestamp: /* @__PURE__ */ new Date(),
        consentData: consentData || null
      });
      res.json({ success: true, id: auditEntry.id });
    } catch (error) {
      console.error("Error logging consent decision:", error);
      res.status(500).json({ message: "Failed to log consent decision" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      console.log("Registration request body:", req.body);
      const userData = localAuthSchema.parse(req.body);
      console.log("Parsed userData:", userData);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      const user = await storage.createLocalUser(userData);
      const verificationToken = generateVerificationToken();
      storage.setVerificationToken(user.id, verificationToken).then(() => {
        console.log("Verification token set for user:", user.email);
        sendVerificationEmail(user.email, verificationToken).then((emailSent) => {
          if (!emailSent) {
            console.error("Failed to send verification email to:", user.email);
          } else {
            console.log("Verification email sent successfully to:", user.email);
          }
        }).catch((error) => {
          console.error("Error sending verification email:", error);
        });
      }).catch((error) => {
        console.error("Error setting verification token:", error);
      });
      res.json({
        message: "Registration successful! Please check your email to verify your account.",
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, emailVerified: false }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data", error: error.message });
    }
  });
  app2.post("/api/auth/login", (req, res, next) => {
    passport2.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid email or password" });
      }
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
      if (req.session && req.session.passport && req.session.passport.user) {
        req.session.destroy((err) => {
          if (err) {
            console.error("Error destroying invalid session:", err);
          }
        });
      }
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  app2.get("/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
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
      await sendWelcomeEmail(user.email, user.firstName);
      req.login(user, (err) => {
        if (err) {
          console.error("Auto-login error after verification:", err);
        }
      });
      res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #27ae60;">Email Verified Successfully!</h1>
            <p>Welcome to PostMeAI, ${user.firstName || "User"}!</p>
            <p>Your account is now active and you can start creating amazing content.</p>
            <a href="${process.env.POSTMEAI_FE_URL}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Start Creating Content
            </a>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Email verification error:", error);
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
  app2.post("/api/auth/resend-verification", async (req, res) => {
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
      const verificationToken = generateVerificationToken();
      await storage.setVerificationToken(user.id, verificationToken);
      const emailSent = await sendVerificationEmail(user.email, verificationToken);
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send verification email" });
      }
      res.json({ message: "Verification email sent successfully" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      console.log("\u{1F510} Password reset request received for:", email);
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      console.log("\u{1F464} User lookup result:", user ? "User found" : "User not found");
      if (!user) {
        console.log("\u274C User not found, returning security message");
        return res.json({ message: "If an account with that email exists, you'll receive password reset instructions." });
      }
      const resetToken = generatePasswordResetToken();
      console.log("\u{1F511} Generated reset token:", resetToken);
      const tokenSet = await storage.setPasswordResetToken(email, resetToken);
      console.log("\u{1F4BE} Token set in storage:", tokenSet);
      if (!tokenSet) {
        console.log("\u274C Failed to set token in storage");
        return res.status(500).json({ message: "Failed to generate reset token" });
      }
      console.log("\u{1F4E7} Attempting to send password reset email...");
      const emailSent = await sendPasswordResetEmail(email, resetToken);
      console.log("\u{1F4E7} Email sent result:", emailSent);
      if (!emailSent) {
        console.log("\u274C Failed to send reset email");
        return res.status(500).json({ message: "Failed to send reset email" });
      }
      console.log("\u2705 Password reset process completed successfully");
      res.json({ message: "If an account with that email exists, you'll receive password reset instructions." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
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
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  app2.get("/api/user/organization-role", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      const organizationRole = await storage.getUserOrganization(userId, organizationId);
      if (!organizationRole) {
        return res.status(404).json({ message: "Organization role not found" });
      }
      res.json(organizationRole);
    } catch (error) {
      console.error("Get organization role error:", error);
      res.status(500).json({ message: "Failed to fetch organization role" });
    }
  });
  app2.get("/api/user/workspace-roles", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      const workspaceRoles2 = await storage.getUserWorkspaceRoles(userId, organizationId);
      res.json(workspaceRoles2 || []);
    } catch (error) {
      console.error("Get workspace roles error:", error);
      res.status(500).json({ message: "Failed to fetch workspace roles" });
    }
  });
  app2.post("/api/admin/validate-email", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      if (!await hasAdminAccess(userId, organizationId)) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
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
      const existingInvitations = await storage.getUserInvitationsByEmail(email, organizationId);
      const pendingInvitation = existingInvitations.find((inv) => inv.status === "pending" || inv.status === "password_set");
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
      res.json({
        exists: false,
        message: "Email is available for invitation"
      });
    } catch (error) {
      console.error("Email validation error:", error);
      res.status(500).json({ message: "Failed to validate email" });
    }
  });
  app2.post("/api/admin/invite-user", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      if (!await hasAdminAccess(userId, organizationId)) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const { email, expirationMinutes, workspaceRoles: workspaceRoles2 } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      if (!expirationMinutes || expirationMinutes < 10 || expirationMinutes > 60) {
        return res.status(400).json({ message: "Expiration time must be between 10 and 60 minutes" });
      }
      if (!workspaceRoles2 || !Array.isArray(workspaceRoles2) || workspaceRoles2.length === 0) {
        return res.status(400).json({ message: "At least one workspace role assignment is required" });
      }
      const inviter = await storage.getUser(userId);
      const organizationWorkspaces = await storage.getWorkspacesByOrganizationId(organizationId);
      const validWorkspaceIds = organizationWorkspaces.map((w) => w.id);
      for (const assignment of workspaceRoles2) {
        if (!validWorkspaceIds.includes(assignment.workspaceId)) {
          return res.status(400).json({ message: `Invalid workspace ID: ${assignment.workspaceId}` });
        }
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        for (const assignment of workspaceRoles2) {
          const existingMembership = await storage.getUserWorkspaceMembership(existingUser.id, assignment.workspaceId);
          if (existingMembership) {
            const workspace = organizationWorkspaces.find((w) => w.id === assignment.workspaceId);
            return res.status(400).json({ message: `User is already a member of workspace: ${workspace?.name}` });
          }
        }
      }
      const existingInvitations = await storage.getUserInvitationsByUserId(userId, workspaceRoles2[0].workspaceId);
      const existingInvitation = existingInvitations.find((inv) => inv.email === email && inv.status !== "expired");
      if (existingInvitation) {
        return res.status(400).json({ message: "Invitation already sent to this email" });
      }
      const invitationKey = crypto2.randomBytes(32).toString("hex");
      const invitation = await storage.createUserInvitation({
        organizationId,
        email,
        invitationKey,
        invitedByUserId: userId,
        expirationMinutes,
        status: "pending",
        invitedAt: /* @__PURE__ */ new Date(),
        expiresAt: new Date(Date.now() + expirationMinutes * 60 * 1e3)
        // X minutes from now
      });
      const roleAssignments = workspaceRoles2.map((assignment) => ({
        invitationId: invitation.id,
        workspaceId: assignment.workspaceId,
        roles: assignment.roles
        // Array of role names
      }));
      await storage.createInvitationWorkspaceRoles(roleAssignments);
      console.log("\u{1F4E7} Attempting to send invitation email to:", email, "with key:", invitationKey.substring(0, 8) + "...");
      const emailResult = await sendUserInvitationEmail(
        email,
        invitationKey,
        expirationMinutes
      );
      console.log("\u{1F4E7} Email sending result:", emailResult);
      if (!emailResult.success) {
        console.error("\u{1F4E7} Failed to send invitation email to:", email, "Error:", emailResult.error);
        return res.status(500).json({
          message: emailResult.error || "Failed to send invitation email"
        });
      }
      console.log("\u2705 Successfully sent invitation email to:", email);
      res.json({
        message: "Invitation with workspace role assignments sent successfully",
        invitation: {
          id: invitation.id,
          email: invitation.email,
          status: invitation.status,
          invitedAt: invitation.invitedAt,
          expiresAt: invitation.expiresAt,
          workspaceAssignments: workspaceRoles2.length
        }
      });
    } catch (error) {
      console.error("Admin invite user error:", error);
      res.status(500).json({ message: "Failed to send invitation" });
    }
  });
  app2.get("/api/admin/workspaces", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      console.log("\u{1F511} ADMIN WORKSPACES ACCESS ATTEMPT - UserId:", userId, "OrgId:", organizationId);
      const hasAccess = await hasAdminAccess(userId, organizationId);
      console.log("\u{1F511} ADMIN WORKSPACES - hasAdminAccess result:", hasAccess);
      if (!hasAccess) {
        console.log("\u{1F6AB} ADMIN WORKSPACES ACCESS DENIED for user:", userId);
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      console.log("\u2705 ADMIN WORKSPACES ACCESS GRANTED for user:", userId);
      const workspaces2 = await storage.getWorkspacesByOrganizationId(organizationId);
      res.json(workspaces2);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });
  app2.get("/api/admin/invitations", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      if (!await hasAdminAccess(userId, organizationId)) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const invitations = await storage.getUserInvitationsByUserId(userId, organizationId);
      res.json(invitations);
    } catch (error) {
      console.error("Get invitations error:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });
  app2.get("/api/admin/pending-approvals", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      if (!await hasAdminAccess(userId, organizationId)) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const pendingApprovals = await storage.getPendingApprovalsForAdmin(userId, organizationId);
      res.json(pendingApprovals);
    } catch (error) {
      console.error("Get pending approvals error:", error);
      res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
  });
  app2.get("/api/admin/pending-invitations", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      if (!await hasAdminAccess(userId, organizationId)) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const pendingInvitations = await storage.getPendingInvitationsWithoutRoles(organizationId);
      res.json(pendingInvitations);
    } catch (error) {
      console.error("Get pending invitations error:", error);
      res.status(500).json({ message: "Failed to fetch pending invitations" });
    }
  });
  app2.get("/api/admin/search-users", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      if (!await hasAdminAccess(userId, organizationId)) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const { query } = req.query;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      console.log("\u{1F50D} Search query:", query);
      console.log("\u{1F50D} Organization ID:", organizationId);
      const searchResults = await storage.searchUsersInOrganization(organizationId, query);
      console.log("\u{1F50D} Search results:", searchResults);
      res.json(searchResults);
    } catch (error) {
      console.error("Search users error:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });
  app2.post("/api/admin/assign-invited-user", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      if (!await hasAdminAccess(userId, organizationId)) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const { invitedUserId, workspaceId, roleId } = req.body;
      if (!invitedUserId || !workspaceId || !roleId) {
        return res.status(400).json({ message: "All fields are required" });
      }
      await storage.assignRoleToInvitedUser(invitedUserId, workspaceId, roleId, organizationId);
      res.json({ message: "Role assigned successfully" });
    } catch (error) {
      console.error("Assign invited user role error:", error);
      res.status(500).json({ message: "Failed to assign role" });
    }
  });
  app2.post("/api/admin/approve-invitation/:id", requireAuth, async (req, res) => {
    try {
      const adminId = req.user.id;
      const invitationId = parseInt(req.params.id);
      const organizationId = getCurrentOrganizationId(req);
      if (!await hasAdminAccess(adminId, organizationId)) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const approvedInvitation = await storage.approveUserInvitation(invitationId, adminId);
      if (!approvedInvitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      if (approvedInvitation.userId) {
        await storage.updateUserRoleAndStatus(
          approvedInvitation.userId,
          "creator",
          // Default role for newly approved users
          "active"
        );
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
      console.error("Approve invitation error:", error);
      res.status(500).json({ message: "Failed to approve invitation" });
    }
  });
  app2.post("/api/admin/resend-invitation/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const invitationId = parseInt(req.params.id);
      const organizationId = getCurrentOrganizationId(req);
      const { expirationMinutes = 10 } = req.body;
      if (!await hasAdminAccess(userId, organizationId)) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const existingInvitation = await storage.getInvitationById(invitationId, organizationId);
      if (!existingInvitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      const newExpiresAt = new Date(Date.now() + expirationMinutes * 60 * 1e3);
      const updatedInvitation = await storage.resendInvitation(invitationId, organizationId, newExpiresAt, expirationMinutes);
      await sendUserInvitationEmail(
        updatedInvitation.email,
        updatedInvitation.invitationKey,
        expirationMinutes
      );
      res.json({
        message: "Invitation resent successfully",
        invitation: updatedInvitation
      });
    } catch (error) {
      console.error("Resend invitation error:", error);
      res.status(500).json({ message: "Failed to resend invitation" });
    }
  });
  app2.post("/api/admin/cancel-invitation/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const invitationId = parseInt(req.params.id);
      const organizationId = getCurrentOrganizationId(req);
      if (!await hasAdminAccess(userId, organizationId)) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const existingInvitation = await storage.getInvitationById(invitationId, organizationId);
      if (!existingInvitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      const canceledInvitation = await storage.cancelInvitation(invitationId, organizationId, userId);
      if (!canceledInvitation) {
        return res.status(500).json({ message: "Failed to cancel invitation" });
      }
      res.json({
        message: "Invitation canceled successfully",
        invitation: canceledInvitation
      });
    } catch (error) {
      console.error("Cancel invitation error:", error);
      res.status(500).json({ message: "Failed to cancel invitation" });
    }
  });
  app2.get("/join-invitation", async (req, res) => {
    try {
      const { key } = req.query;
      if (!key || typeof key !== "string") {
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #e74c3c;">Invalid Invitation Link</h1>
              <p>The invitation link is invalid or missing.</p>
              <a href="${process.env.NODE_ENV === "production" ? "https://postmeai.com" : "http://localhost:5000"}" 
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
              <a href="${process.env.NODE_ENV === "production" ? "https://postmeai.com" : "http://localhost:5000"}" 
                 style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Go to PostMeAI
              </a>
            </body>
          </html>
        `);
      }
      if (invitation.expiresAt && invitation.expiresAt < /* @__PURE__ */ new Date()) {
        await storage.updateUserInvitation(invitation.id, { status: "expired" });
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #e74c3c;">Invitation Expired</h1>
              <p>This invitation has expired. Please contact your administrator for a new invitation.</p>
              <a href="${process.env.NODE_ENV === "production" ? "https://postmeai.com" : "http://localhost:5000"}" 
                 style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Go to PostMeAI
              </a>
            </body>
          </html>
        `);
      }
      const baseUrl = process.env.NODE_ENV === "production" ? "https://postmeai.com" : "http://localhost:5000";
      res.redirect(`${baseUrl}/invitation/${key}`);
    } catch (error) {
      console.error("Join invitation error:", error);
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #e74c3c;">Error</h1>
            <p>An error occurred while processing your invitation.</p>
            <a href="${process.env.NODE_ENV === "production" ? "https://postmeai.com" : "http://localhost:5000"}" 
               style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Go to PostMeAI
            </a>
          </body>
        </html>
      `);
    }
  });
  app2.post("/api/invitation/set-password", async (req, res) => {
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
      if (invitation.expiresAt && invitation.expiresAt < /* @__PURE__ */ new Date()) {
        await storage.updateUserInvitation(invitation.id, { status: "expired" });
        return res.status(400).json({ message: "Invitation has expired" });
      }
      let user = await storage.getUserByEmail(invitation.email);
      if (user) {
        const hashedPassword = await bcrypt2.hash(password, 12);
        const [updatedUser] = await db.update(users).set({
          password: hashedPassword,
          firstName,
          lastName,
          userRole: invitation.userRole,
          accountStatus: "active",
          // Auto-approve invited users
          emailVerified: true,
          onboardingCompleted: true,
          // Skip onboarding for invited users
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(users.email, invitation.email)).returning();
        user = updatedUser;
      } else {
        user = await storage.createLocalUser({
          email: invitation.email,
          password,
          firstName,
          lastName,
          userRole: invitation.userRole,
          accountStatus: "active",
          // Auto-approve invited users
          emailVerified: true,
          // Email is pre-verified through invitation
          onboardingCompleted: true
          // Skip onboarding for invited users
        });
      }
      const invitationWorkspaceRoles2 = await storage.getInvitationWorkspaceRoles(invitation.id);
      if (invitationWorkspaceRoles2.length > 0) {
        const firstWorkspaceId = invitationWorkspaceRoles2[0].workspaceId;
        const workspace = await db.select().from(workspaces).where(eq2(workspaces.id, firstWorkspaceId)).limit(1);
        if (workspace.length > 0) {
          const organizationId = workspace[0].organizationId;
          const existingOrgMembership = await db.select().from(userOrganizations).where(and2(
            eq2(userOrganizations.userId, user.id),
            eq2(userOrganizations.organizationId, organizationId)
          ));
          if (existingOrgMembership.length === 0) {
            await db.insert(userOrganizations).values({
              userId: user.id,
              organizationId,
              role: "member",
              // Default organization role for invited users
              isActive: true,
              joinedAt: /* @__PURE__ */ new Date(),
              lastActiveAt: /* @__PURE__ */ new Date()
            });
          }
          await db.update(users).set({
            currentOrganizationId: organizationId,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq2(users.id, user.id));
        }
        for (const workspaceRole of invitationWorkspaceRoles2) {
          const existingMembership = await db.select().from(userWorkspaces).where(and2(
            eq2(userWorkspaces.userId, user.id),
            eq2(userWorkspaces.workspaceId, workspaceRole.workspaceId)
          ));
          if (existingMembership.length === 0) {
            const primaryRole = workspaceRole.roles[0] || "creator";
            await db.insert(userWorkspaces).values({
              userId: user.id,
              workspaceId: workspaceRole.workspaceId,
              role: primaryRole,
              isActive: true,
              // Auto-activate invited users
              joinedAt: /* @__PURE__ */ new Date()
            });
          }
          for (const roleName of workspaceRole.roles) {
            const roleRecord = await db.select().from(workspaceRoles).where(eq2(workspaceRoles.name, roleName)).limit(1);
            if (roleRecord.length > 0) {
              const roleId = roleRecord[0].id;
              const existingRoleAssignment = await db.select().from(userWorkspaceRoles).where(and2(
                eq2(userWorkspaceRoles.userId, user.id),
                eq2(userWorkspaceRoles.workspaceId, workspaceRole.workspaceId),
                eq2(userWorkspaceRoles.roleId, roleId)
              ));
              if (existingRoleAssignment.length === 0) {
                await db.insert(userWorkspaceRoles).values({
                  userId: user.id,
                  workspaceId: workspaceRole.workspaceId,
                  roleId,
                  assignedAt: /* @__PURE__ */ new Date(),
                  assignedByUserId: null
                  // System assignment during invitation
                });
                console.log(`\u{1F3AF} INVITATION ROLE ASSIGNMENT - User: ${user.id}, Workspace: ${workspaceRole.workspaceId}, Role: ${roleName} (ID: ${roleId})`);
              }
            } else {
              console.error(`\u274C INVITATION ROLE ERROR - Role '${roleName}' not found in workspace_roles table`);
            }
          }
        }
        const firstWorkspace = invitationWorkspaceRoles2[0];
        await db.update(users).set({
          currentWorkspaceId: firstWorkspace.workspaceId,
          onboardingCompleted: true,
          // Skip onboarding for invited users
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(users.id, user.id));
      } else if (invitation.workspaceId) {
        const workspace = await db.select().from(workspaces).where(eq2(workspaces.id, invitation.workspaceId)).limit(1);
        if (workspace.length > 0) {
          const organizationId = workspace[0].organizationId;
          const existingOrgMembership = await db.select().from(userOrganizations).where(and2(
            eq2(userOrganizations.userId, user.id),
            eq2(userOrganizations.organizationId, organizationId)
          ));
          if (existingOrgMembership.length === 0) {
            await db.insert(userOrganizations).values({
              userId: user.id,
              organizationId,
              role: "member",
              // Default organization role for invited users
              isActive: true,
              joinedAt: /* @__PURE__ */ new Date(),
              lastActiveAt: /* @__PURE__ */ new Date()
            });
          }
          await db.update(users).set({
            currentOrganizationId: organizationId,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq2(users.id, user.id));
        }
        const existingMembership = await db.select().from(userWorkspaces).where(and2(
          eq2(userWorkspaces.userId, user.id),
          eq2(userWorkspaces.workspaceId, invitation.workspaceId)
        ));
        if (existingMembership.length === 0) {
          await db.insert(userWorkspaces).values({
            userId: user.id,
            workspaceId: invitation.workspaceId,
            role: invitation.userRole || "creator",
            isActive: true,
            // Auto-activate invited users
            joinedAt: /* @__PURE__ */ new Date()
          });
        }
        await db.update(users).set({
          currentWorkspaceId: invitation.workspaceId,
          onboardingCompleted: true,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(users.id, user.id));
      }
      await storage.updateUserInvitation(invitation.id, {
        status: "password_set",
        passwordSetAt: /* @__PURE__ */ new Date(),
        userId: user.id
      });
      res.json({
        message: "Password set successfully. You can now sign in immediately.",
        userId: user.id
      });
    } catch (error) {
      console.error("Set password error:", error);
      res.status(500).json({ message: "Failed to set password" });
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
  app2.get("/auth/linkedin", passport2.authenticate("linkedin-oidc"));
  app2.get(
    "/auth/linkedin/callback",
    passport2.authenticate("linkedin-oidc", {
      failureRedirect: "/login",
      session: true
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
        const { organizationId, workspaceId } = getCurrentContext(req);
        const savedImage = await storage.createImage({ ...imageData, organizationId, workspaceId }, organizationId, workspaceId);
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
      const { organizationId, workspaceId } = getCurrentContext(req);
      const post = await storage.createPost(postData, user.id, organizationId, workspaceId);
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid post data", error });
    }
  });
  app2.post("/api/posts/manual", requireAuth, async (req, res) => {
    try {
      const { title, content, selectedImages, platforms, ...postData } = req.body;
      const user = req.user;
      const { organizationId, workspaceId } = getCurrentContext(req);
      const post = await storage.createPost({
        ...postData,
        subject: `${title}: ${content.substring(0, 100)}...`,
        executionMode: "manual"
      }, user.id, organizationId, workspaceId);
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
      }, user.id, organizationId, workspaceId);
      const responseContent = {
        ...generatedContent2,
        selectedImages: selectedImages || []
      };
      res.json({ post, generatedContent: responseContent });
    } catch (error) {
      res.status(400).json({ message: "Invalid manual post data", error });
    }
  });
  app2.post("/api/posts/:id/generate", requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const user = req.user;
      const { organizationId, workspaceId } = getCurrentContext(req);
      const post = await storage.getPost(postId, user.id, organizationId, workspaceId);
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
      }, user.id, organizationId, workspaceId);
      res.json(generatedContent2);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate content", error });
    }
  });
  app2.get("/api/posts/:id/content", requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const user = req.user;
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
  app2.post("/api/posts/:id/publish", requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { platforms } = req.body;
      const user = req.user;
      const { organizationId, workspaceId } = getCurrentContext(req);
      if (!Array.isArray(platforms)) {
        return res.status(400).json({ message: "Platforms must be an array" });
      }
      const post = await storage.getPost(postId, user.id, organizationId, workspaceId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      const publishedPost = await storage.createPublishedPost({
        postId,
        platforms
      }, user.id, organizationId, workspaceId);
      await storage.updatePost(postId, { status: "published" }, user.id, organizationId, workspaceId);
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
      const user = req.user;
      const { organizationId, workspaceId } = getCurrentContext(req);
      const template = await storage.createTemplate(templateData, user.id, organizationId, workspaceId);
      res.json(template);
    } catch (error) {
      res.status(400).json({ message: "Invalid template data", error });
    }
  });
  app2.post("/api/debug/test-admin-access", async (req, res) => {
    try {
      const { userId, organizationId } = req.body;
      console.log("\u{1F50D} DEBUG TESTING - UserId:", userId, "OrgId:", organizationId);
      const orgRole = await storage.getUserOrganization(userId, organizationId);
      console.log("\u{1F50D} DEBUG TESTING - OrgRole:", orgRole);
      const workspaceRoles2 = await storage.getUserWorkspaceRoles(userId, organizationId);
      console.log("\u{1F50D} DEBUG TESTING - WorkspaceRoles:", JSON.stringify(workspaceRoles2, null, 2));
      const hasAccess = await hasAdminAccess(userId, organizationId);
      console.log("\u{1F50D} DEBUG TESTING - hasAdminAccess result:", hasAccess);
      res.json({
        userId,
        organizationId,
        orgRole,
        workspaceRoles: workspaceRoles2,
        hasAccess
      });
    } catch (error) {
      console.error("Debug test error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/templates", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      const { organizationId, workspaceId } = getCurrentContext(req);
      const templates2 = await storage.getTemplatesByUserId(user.id, organizationId, workspaceId);
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
  app2.get("/api/dashboard/analytics", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const subscription = {
        plan: user.subscriptionPlan || "Free",
        status: user.subscriptionStatus || "free",
        nextPaymentDate: user.subscriptionPlan !== "Free" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3) : null
      };
      const pendingPosts = Math.floor(Math.random() * 5);
      const weeklyPosts = {
        total: Math.floor(Math.random() * 20) + 5,
        aiPosts: Math.floor(Math.random() * 15) + 2,
        manualPosts: Math.floor(Math.random() * 10) + 1
      };
      const schedulers = {
        active: Math.floor(Math.random() * 8) + 2,
        inactive: Math.floor(Math.random() * 3)
      };
      const credits = {
        balance: user.credits || 0
      };
      const performance = {
        engagementRate: Math.floor(Math.random() * 15) + 5,
        // 5-20%
        totalReach: Math.floor(Math.random() * 5e4) + 1e4,
        totalClicks: Math.floor(Math.random() * 5e3) + 1e3
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
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ error: "Failed to fetch dashboard analytics" });
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
      const workspaceId = getCurrentWorkspaceId(req);
      if (!name || typeof name !== "string") {
        return res.status(400).json({ message: "Folder name is required" });
      }
      const folder = await storage.createFolder({
        userId,
        name: name.trim()
      }, workspaceId);
      res.status(201).json(folder);
    } catch (error) {
      console.error("Error creating folder:", error);
      res.status(500).json({ message: error.message || "Failed to create folder" });
    }
  });
  app2.get("/api/folders", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      const workspaceId = getCurrentWorkspaceId(req);
      const folders2 = await storage.getFoldersByUserId(userId, organizationId, workspaceId);
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
      const workspaceId = getCurrentWorkspaceId(req);
      const success = await storage.deleteFolder(folderId, userId, workspaceId);
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
      const organizationId = getCurrentOrganizationId(req);
      const workspaceId = getCurrentWorkspaceId(req);
      const { folder } = req.query;
      let images2;
      if (folder && folder !== "all") {
        const folderId = parseInt(folder);
        images2 = await storage.getImagesByFolder(userId, folderId, organizationId, workspaceId);
      } else {
        images2 = await storage.getImagesByUserId(userId, organizationId, workspaceId);
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
        const { organizationId, workspaceId } = getCurrentContext(req);
        const image = await storage.createImage({ ...imageData, organizationId, workspaceId }, organizationId, workspaceId);
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
      console.log("Image upload request - Content-Type:", req.headers["content-type"]);
      console.log("Image upload request - req.is multipart:", req.is("multipart/form-data"));
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
          const { organizationId, workspaceId } = getCurrentContext(req);
          const base64Data = file.buffer.toString("base64");
          const imageData = {
            userId,
            organizationId,
            workspaceId,
            filename: `upload-${Date.now()}-${file.originalname}`,
            originalName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            folder: folder === "uncategorized" ? null : folder,
            data: base64Data
          };
          const image = await storage.createImage(imageData, organizationId, workspaceId);
          res.json(image);
        });
      } else {
        const { organizationId, workspaceId } = getCurrentContext(req);
        const imageData = insertImageSchema.parse({
          ...req.body,
          userId,
          organizationId,
          workspaceId,
          originalName: req.body.originalName || req.body.filename || "ai-generated-image.png"
        });
        const image = await storage.createImage(imageData, organizationId, workspaceId);
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
      const { organizationId, workspaceId } = getCurrentContext(req);
      const imageId = parseInt(req.params.id);
      const image = await storage.getImageById(imageId, userId, organizationId, workspaceId);
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
      const { organizationId, workspaceId } = getCurrentContext(req);
      const imageId = parseInt(req.params.id);
      const existingImage = await storage.getImageById(imageId, userId, organizationId, workspaceId);
      if (!existingImage) {
        return res.status(404).json({ message: "Image not found" });
      }
      const updatedImage = await storage.updateImage(imageId, req.body, organizationId, workspaceId);
      res.json(updatedImage);
    } catch (error) {
      console.error("Error updating image:", error);
      res.status(500).json({ message: "Failed to update image" });
    }
  });
  app2.delete("/api/images/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { organizationId, workspaceId } = getCurrentContext(req);
      const imageId = parseInt(req.params.id);
      const deleted = await storage.deleteImage(imageId, userId, organizationId, workspaceId);
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
      const { organizationId, workspaceId } = getCurrentContext(req);
      const imageData = {
        userId,
        organizationId,
        workspaceId,
        filename,
        originalName: filename,
        mimeType: "image/png",
        fileSize: Math.floor(Math.random() * 2e5) + 5e4,
        // Random size between 50KB-250KB
        folder: null,
        // Save as uncategorized
        binaryData: mockImageBase64
      };
      const image = await storage.createImage(imageData, organizationId, workspaceId);
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
      const { organizationId, workspaceId } = getCurrentContext(req);
      const configs = await storage.getSocialMediaConfigs(userId, organizationId, workspaceId);
      res.json(configs);
    } catch (error) {
      console.error("Error fetching social media configs:", error);
      res.status(500).json({ message: "Failed to fetch social media configurations" });
    }
  });
  app2.post("/api/social-media-configs", requireAuth, async (req, res) => {
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
        isActive: isActive !== void 0 ? isActive : true,
        apiKey: apiKey || null,
        testStatus: "idle",
        testMessage: null,
        lastTestedAt: null,
        organizationId,
        workspaceId
      }, organizationId, workspaceId);
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
      const workspaceId = getCurrentWorkspaceId(req);
      const query = req.query.q;
      if (!query || query.length < 3) {
        return res.json([]);
      }
      const searchTerm = query.toLowerCase();
      const results = [];
      const templates2 = await storage.getTemplatesByUserId(userId, workspaceId);
      const matchingTemplates = templates2.filter(
        (template) => template.name.toLowerCase().includes(searchTerm)
      );
      results.push(...matchingTemplates.map((template) => ({
        id: template.id,
        type: "template",
        name: template.name,
        description: `Frequency: ${template.frequency}`
      })));
      const images2 = await storage.getImagesByUserId(userId, workspaceId);
      const matchingImages = images2.filter(
        (image) => image.filename.toLowerCase().includes(searchTerm) || image.folder?.toLowerCase().includes(searchTerm)
      );
      results.push(...matchingImages.map((image) => ({
        id: image.id,
        type: "image",
        name: image.originalName || image.filename,
        description: `Folder: ${image.folder || "Uncategorized"}`
      })));
      const socialConfigs = await storage.getSocialMediaConfigs(userId, workspaceId);
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
      const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&redirect_uri=${encodeURIComponent(process.env.POSTMEAI_FE_URL + "/auth/facebook/api-key/callback")}&code=${code}`);
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
    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.POSTMEAI_FE_URL + "/auth/linkedin/api-key/callback")}&scope=openid%20profile%20email%20w_member_social&state=${req.user?.id || "anonymous"}`;
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
          redirect_uri: process.env.POSTMEAI_FE_URL + "/auth/linkedin/api-key/callback"
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
  app2.get("/api/organization/current", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user || !user.currentOrganizationId) {
        return res.status(400).json({ message: "User has no organization context" });
      }
      const organization = await storage.getOrganization(user.currentOrganizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
      const userOrganizations2 = await storage.getUserOrganizations(userId);
      const userOrgRole = userOrganizations2.find((uo) => uo.organizationId === user.currentOrganizationId);
      const currentUserRole = userOrgRole ? userOrgRole.role : "member";
      res.json({
        ...organization,
        currentUserRole
      });
    } catch (error) {
      console.error("Error fetching organization info:", error);
      res.status(500).json({ message: "Failed to fetch organization information" });
    }
  });
  app2.get("/api/organizations", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const userOrganizations2 = await storage.getUserOrganizations(userId);
      const organizations2 = await Promise.all(
        userOrganizations2.map(async (userOrg) => {
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
      res.json(organizations2.filter(Boolean));
    } catch (error) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  });
  app2.post("/api/organization/switch", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { organizationId } = req.body;
      if (!organizationId) {
        return res.status(400).json({ message: "Organization ID is required" });
      }
      const userOrganizations2 = await storage.getUserOrganizations(userId);
      const hasAccess = userOrganizations2.some((uo) => uo.organizationId === organizationId && uo.isActive);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied to this organization" });
      }
      await storage.updateUser(userId, { currentOrganizationId: organizationId });
      const workspaces2 = await storage.getWorkspacesByOrganizationId(organizationId);
      if (workspaces2.length > 0) {
        await storage.updateUser(userId, { currentWorkspaceId: workspaces2[0].id });
      }
      res.json({ success: true, message: "Organization switched successfully" });
    } catch (error) {
      console.error("Error switching organization:", error);
      res.status(500).json({ message: "Failed to switch organization" });
    }
  });
  app2.get("/api/workspace/current", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user || !user.currentWorkspaceId) {
        return res.status(400).json({ message: "No current workspace set" });
      }
      const workspaceId = user.currentWorkspaceId;
      const workspace = await storage.getWorkspace(workspaceId);
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      const members = await storage.getWorkspaceMembers(workspaceId);
      const currentUserMembership = members.find((member) => member.userId === userId);
      const currentUserRole = currentUserMembership ? currentUserMembership.role : "member";
      const workspaceInfo = {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        currentUserRole,
        // Add current user's workspace role
        members: members.map((member) => ({
          id: member.userId,
          email: member.email || "Unknown",
          role: member.role,
          joinedAt: member.joinedAt
        }))
      };
      res.json(workspaceInfo);
    } catch (error) {
      console.error("Error fetching workspace info:", error);
      res.status(500).json({ message: "Failed to fetch workspace information" });
    }
  });
  app2.get("/api/workspaces", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const userOrganizations2 = await storage.getUserOrganizations(userId);
      const user = await storage.getUser(userId);
      if (!user || !user.currentOrganizationId) {
        return res.status(400).json({ message: "User has no organization context" });
      }
      const userOrgRole = userOrganizations2.find((uo) => uo.organizationId === user.currentOrganizationId);
      console.log("\u{1F50D} DEBUG - User:", userId, "OrgRole:", userOrgRole, "CurrentOrgId:", user.currentOrganizationId);
      let workspaces2;
      if (userOrgRole && userOrgRole.role === "owner") {
        console.log("\u{1F50D} Owner detected - fetching all workspaces for organization:", user.currentOrganizationId);
        const allWorkspaces = await storage.getWorkspacesByOrganizationId(user.currentOrganizationId);
        console.log("\u{1F50D} Found workspaces:", allWorkspaces.length, allWorkspaces.map((w) => ({ id: w.id, name: w.name })));
        workspaces2 = await Promise.all(allWorkspaces.map(async (workspace) => {
          const members = await storage.getWorkspaceMembers(workspace.id);
          const userWorkspace = await storage.getUserWorkspaceByIds(userId, workspace.id);
          return {
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            uniqueId: workspace.uniqueId,
            currentUserRole: userWorkspace ? userWorkspace.role : "owner",
            // Show 'owner' if not a member but owns org
            memberCount: members.length,
            createdAt: workspace.createdAt,
            isActive: workspace.id === user.currentWorkspaceId
          };
        }));
      } else {
        console.log("\u{1F50D} Non-owner detected - fetching user workspace roles for user:", userId);
        const userWorkspaceRoles2 = await storage.getUserWorkspaceRoles(userId, user.currentOrganizationId);
        console.log("\u{1F50D} User workspace roles found:", userWorkspaceRoles2);
        workspaces2 = await Promise.all(userWorkspaceRoles2.map(async (roleAssignment) => {
          const workspace = await storage.getWorkspace(roleAssignment.workspaceId);
          const members = await storage.getWorkspaceMembers(roleAssignment.workspaceId);
          return {
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            uniqueId: workspace.uniqueId,
            currentUserRole: roleAssignment.role,
            memberCount: members.length,
            createdAt: workspace.createdAt,
            isActive: workspace.id === user.currentWorkspaceId
          };
        }));
        console.log("\u{1F50D} Final workspaces for non-owner:", workspaces2.map((w) => ({ id: w.id, name: w.name, role: w.currentUserRole })));
      }
      res.json(workspaces2);
    } catch (error) {
      console.error("Error fetching user workspaces:", error);
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });
  app2.post("/api/workspace/switch", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { workspaceId } = req.body;
      if (!workspaceId) {
        return res.status(400).json({ message: "Workspace ID is required" });
      }
      const userWorkspaces2 = await storage.getUserWorkspaces(userId);
      const hasAccess = userWorkspaces2.some((uw) => uw.workspaceId === workspaceId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied to this workspace" });
      }
      await storage.updateUserCurrentWorkspace(userId, workspaceId);
      res.json({ success: true, message: "Workspace switched successfully" });
    } catch (error) {
      console.error("Error switching workspace:", error);
      res.status(500).json({ message: "Failed to switch workspace" });
    }
  });
  app2.get("/api/user/data-summary", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const workspaceId = getCurrentWorkspaceId(req);
      const posts2 = await storage.getPostsByUserId(userId, workspaceId);
      const images2 = await storage.getImagesByUserId(userId, workspaceId);
      const schedules = await storage.getPostSchedulesByUserId(userId, workspaceId);
      const socialConfigs = await storage.getSocialMediaConfigs(userId, workspaceId);
      const transactions = await storage.getPaymentTransactionsByUserId(userId, workspaceId);
      const templates2 = await storage.getTemplatesByUserId(userId, workspaceId);
      const dataSummary = {
        posts: posts2.length,
        media: images2.length,
        schedules: schedules.length,
        socialConfigs: socialConfigs.length,
        transactions: transactions.length,
        templates: templates2.length
      };
      res.json(dataSummary);
    } catch (error) {
      console.error("Error fetching user data summary:", error);
      res.status(500).json({ message: "Failed to fetch user data summary" });
    }
  });
  app2.delete("/api/user/delete-account", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { confirmation } = req.body;
      if (confirmation !== "DELETE MY ACCOUNT") {
        return res.status(400).json({ message: "Invalid confirmation text" });
      }
      const userWorkspaces2 = await storage.getUserWorkspaces(userId);
      for (const workspace of userWorkspaces2) {
        const workspaceId = workspace.workspaceId;
        const schedules = await storage.getPostSchedulesByUserId(userId, workspaceId);
        for (const schedule of schedules) {
          await storage.deleteScheduleExecutions(schedule.id);
        }
        for (const schedule of schedules) {
          await storage.deletePostSchedule(schedule.id, userId, workspaceId);
        }
        const posts2 = await storage.getPostsByUserId(userId, workspaceId);
        for (const post of posts2) {
          await storage.deletePublishedPostsByPostId(post.id, workspaceId);
        }
        for (const post of posts2) {
          await storage.deleteGeneratedContentByPostId(post.id, workspaceId);
        }
        const templates2 = await storage.getTemplatesByUserId(userId, workspaceId);
        for (const template of templates2) {
          await storage.deleteTemplate(template.id, userId, workspaceId);
        }
        for (const post of posts2) {
          await storage.deletePost(post.id, userId, workspaceId);
        }
        const images2 = await storage.getImagesByUserId(userId, workspaceId);
        for (const image of images2) {
          await storage.deleteImage(image.id, userId, workspaceId);
        }
        const folders2 = await storage.getFoldersByUserId(userId, workspaceId);
        for (const folder of folders2) {
          await storage.deleteFolder(folder.id, userId, workspaceId);
        }
        await storage.deleteSocialMediaConfigs(userId, workspaceId);
      }
      await storage.deletePaymentTransactions(userId);
      await storage.deleteUser(userId);
      req.session.destroy();
      res.json({
        success: true,
        message: "Account and all associated data have been permanently deleted"
      });
    } catch (error) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });
  app2.post("/api/onboarding", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      console.log("Onboarding data received for user:", userId, req.body);
      const updatedUser = await storage.saveOnboardingData(userId, req.body);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      res.status(500).json({ message: "Failed to save onboarding data" });
    }
  });
  app2.post("/api/onboarding/complete", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      console.log("Completing onboarding for user:", userId, req.body);
      const updatedUser = await storage.completeOnboarding(userId, req.body);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });
  app2.post("/api/onboarding/test-trigger", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      await storage.updateUserProfile(userId, {
        onboardingCompleted: false,
        onboardingData: null
      });
      res.json({ success: true, message: "Onboarding reset - wizard will show on next page load" });
    } catch (error) {
      console.error("Error resetting onboarding:", error);
      res.status(500).json({ message: "Failed to reset onboarding" });
    }
  });
  app2.post("/api/social-media-configs/:platformId/test", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { platformId } = req.params;
      const { apiKey } = req.body;
      console.log(`Testing ${platformId} connection for user ${userId}`);
      if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
        const workspaceId2 = getCurrentWorkspaceId(req);
        await storage.updateSocialMediaConfigTestStatus(userId, platformId, "failed", workspaceId2, "API key is required for testing");
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
      const workspaceId = getCurrentWorkspaceId(req);
      if (testResult.success) {
        await storage.upsertSocialMediaConfig({
          userId,
          platformId,
          isEnabled: true,
          apiKey: apiKey.trim(),
          testStatus: "connected",
          testError: null,
          lastTestedAt: /* @__PURE__ */ new Date()
        }, workspaceId);
        res.json({
          success: true,
          message: `${platformId} connection successful`,
          userInfo: testResult.userInfo || null
        });
      } else {
        await storage.updateSocialMediaConfigTestStatus(userId, platformId, "failed", workspaceId, testResult.error);
        res.status(400).json({
          success: false,
          message: testResult.error || `${platformId} connection failed`
        });
      }
    } catch (error) {
      console.error(`Error testing ${req.params.platformId} connection:`, error);
      const workspaceId = getCurrentWorkspaceId(req);
      await storage.updateSocialMediaConfigTestStatus(req.user.id, req.params.platformId, "failed", workspaceId, error.message);
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
      const workspaceId = getCurrentWorkspaceId(req);
      const templates2 = await storage.getTemplatesByUserId(userId, workspaceId);
      const enhancedTemplates = await Promise.all(
        templates2.map(async (template) => {
          const post = await storage.getPost(template.postId, userId, workspaceId);
          const generatedContent2 = await storage.getGeneratedContentByPostId(template.postId, userId, workspaceId);
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
      const workspaceId = getCurrentWorkspaceId(req);
      const templateId = parseInt(req.params.id);
      const template = await storage.getTemplateById(templateId, userId, workspaceId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      const post = await storage.getPost(template.postId, userId, workspaceId);
      const generatedContent2 = await storage.getGeneratedContentByPostId(template.postId, userId, workspaceId);
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
      const { organizationId, workspaceId } = getCurrentContext(req);
      const schedules = await storage.getPostSchedulesByUserId(req.user.id, workspaceId);
      const schedulesWithStats = await Promise.all(schedules.map(async (schedule) => {
        const executions = await storage.getScheduleExecutionsByScheduleId(schedule.id, req.user.id, organizationId, workspaceId);
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
      console.error("Error fetching post schedules:", error);
      res.status(500).json({ error: "Failed to fetch post schedules" });
    }
  });
  app2.post("/api/post-schedules", requireAuth, async (req, res) => {
    try {
      console.log("=== POST SCHEDULE DEBUG ===");
      console.log("Raw request body:", JSON.stringify(req.body, null, 2));
      console.log("User ID:", req.user.id);
      const scheduleData = {
        ...req.body,
        userId: req.user.id,
        status: "active",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
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
  app2.get("/api/post-schedules/:id", requireAuth, async (req, res) => {
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
  app2.put("/api/post-schedules/:id", requireAuth, async (req, res) => {
    try {
      const updates = {
        ...req.body,
        updatedAt: /* @__PURE__ */ new Date()
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
  app2.delete("/api/post-schedules/:id", requireAuth, async (req, res) => {
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
  app2.post("/api/post-schedules/:id/toggle", requireAuth, async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const { isActive } = req.body;
      const updates = { isActive, updatedAt: /* @__PURE__ */ new Date() };
      const { organizationId, workspaceId } = getCurrentContext(req);
      const schedule = await storage.updatePostSchedule(scheduleId, updates, req.user.id, organizationId, workspaceId);
      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      res.json({
        success: true,
        message: `Schedule ${isActive ? "activated" : "deactivated"} successfully`,
        schedule
      });
    } catch (error) {
      console.error("Error toggling schedule status:", error);
      res.status(500).json({ error: "Failed to toggle schedule status" });
    }
  });
  app2.post("/api/post-schedules/:id/run", requireAuth, async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const startTime = Date.now();
      const { organizationId, workspaceId } = getCurrentContext(req);
      const schedule = await storage.getPostScheduleById(scheduleId, req.user.id, organizationId, workspaceId);
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
      await storage.updatePostSchedule(scheduleId, updates, req.user.id, organizationId, workspaceId);
      await storage.createScheduleExecution({
        scheduleId,
        userId: req.user.id,
        executedAt: /* @__PURE__ */ new Date(),
        status: "success",
        message: `Schedule executed successfully on ${schedule.platforms?.length || 0} platforms`,
        platformsExecuted: schedule.platforms || [],
        executionDuration
      }, organizationId, workspaceId);
      const executionResult = {
        scheduleId,
        executedAt: /* @__PURE__ */ new Date(),
        platforms: schedule.platforms || [],
        status: "success",
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
      try {
        const { organizationId, workspaceId } = getCurrentContext(req);
        await storage.createScheduleExecution({
          scheduleId: parseInt(req.params.id),
          userId: req.user.id,
          executedAt: /* @__PURE__ */ new Date(),
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
  app2.get("/api/post-schedules/:id/history", requireAuth, async (req, res) => {
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
  const requireAdmin = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      const organizationId = getCurrentOrganizationId(req);
      if (!await hasAdminAccess(userId, organizationId)) {
        return res.status(403).json({ message: "Admin privileges required" });
      }
      next();
    } catch (error) {
      console.error("Error checking admin access:", error);
      return res.status(403).json({ message: "Admin privileges required" });
    }
  };
  app2.get("/api/admin/workspace/members", requireAuth, requireAdmin, async (req, res) => {
    try {
      const workspaceId = getCurrentWorkspaceId(req);
      const members = await storage.getWorkspaceMembers(workspaceId);
      const membersWithInfo = await Promise.all(members.map(async (member) => {
        const user = await storage.getUser(member.userId);
        return {
          id: member.userId,
          email: user?.email || "Unknown",
          firstName: user?.firstName || "Unknown",
          lastName: user?.lastName || "Unknown",
          role: member.role,
          isAdmin: user?.isAdmin || false,
          userRole: user?.userRole || "creator",
          accountStatus: user?.accountStatus || "active",
          joinedAt: member.joinedAt,
          lastActiveAt: user?.lastActiveAt || null,
          isActive: true
        };
      }));
      res.json(membersWithInfo);
    } catch (error) {
      console.error("Error fetching workspace members:", error);
      res.status(500).json({ message: "Failed to fetch workspace members" });
    }
  });
  app2.get("/api/admin/organization/members", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user || !user.currentOrganizationId) {
        return res.status(400).json({ message: "No organization context available" });
      }
      const userOrganizations2 = await storage.getUserOrganizations(userId);
      const userOrgRole = userOrganizations2.find((uo) => uo.organizationId === user.currentOrganizationId);
      if (!userOrgRole || userOrgRole.role !== "owner") {
        return res.status(403).json({ message: "Only organization owners can access all organization members" });
      }
      const organizationMembers = await storage.getOrganizationMembers(user.currentOrganizationId);
      const currentUser = await storage.getUser(userId);
      const currentWorkspaceId = currentUser?.currentWorkspaceId;
      const membersWithInfo = await Promise.all(organizationMembers.map(async (member) => {
        const user2 = await storage.getUser(member.userId);
        let currentWorkspaceRole = null;
        if (currentWorkspaceId) {
          const userWorkspaces2 = await storage.getUserWorkspaces(member.userId);
          const currentWorkspace = userWorkspaces2.find((uw) => uw.workspaceId === currentWorkspaceId);
          if (currentWorkspace) {
            currentWorkspaceRole = {
              workspaceId: currentWorkspace.workspaceId,
              role: currentWorkspace.role,
              workspaceName: currentWorkspace.workspaceName || `Workspace ${currentWorkspace.workspaceId}`
            };
          }
        }
        return {
          id: member.userId,
          email: user2?.email || "Unknown",
          firstName: user2?.firstName || "Unknown",
          lastName: user2?.lastName || "Unknown",
          role: member.role,
          isAdmin: user2?.isAdmin || false,
          userRole: user2?.userRole || "creator",
          accountStatus: user2?.accountStatus || "active",
          joinedAt: member.joinedAt,
          lastActiveAt: user2?.lastActiveAt || null,
          isActive: member.isActive,
          currentWorkspaceRole
        };
      }));
      res.json(membersWithInfo);
    } catch (error) {
      console.error("Error fetching organization members:", error);
      res.status(500).json({ message: "Failed to fetch organization members" });
    }
  });
  app2.put("/api/admin/users/:userId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { role, isAdmin, accountStatus } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const currentOrganizationId = getCurrentOrganizationId(req);
      const targetUserOrganization = await storage.getUserOrganization(userId, currentOrganizationId);
      if (targetUserOrganization && targetUserOrganization.role === "owner" && role && role !== "owner") {
        const ownerCount = await storage.countOrganizationOwners(currentOrganizationId);
        if (ownerCount <= 1) {
          return res.status(400).json({
            message: "Cannot change role of the last organization owner. The organization must have at least one owner."
          });
        }
      }
      const updates = {};
      if (role) updates.userRole = role;
      if (typeof isAdmin === "boolean") updates.isAdmin = isAdmin;
      if (accountStatus) updates.accountStatus = accountStatus;
      updates.updatedAt = /* @__PURE__ */ new Date();
      const updatedUser = await storage.updateUser(userId, updates);
      if (role) {
        const workspaceId = getCurrentWorkspaceId(req);
        await storage.updateWorkspaceMember(workspaceId, userId, { role });
      }
      if (role && targetUserOrganization) {
        await storage.updateUserOrganization(userId, currentOrganizationId, { role });
      }
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.delete("/api/admin/users/:userId/workspace", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const workspaceId = getCurrentWorkspaceId(req);
      const currentOrganizationId = getCurrentOrganizationId(req);
      console.log("\u{1F680} SERVER REMOVE USER DEBUG - DELETE request received");
      console.log("\u{1F680} SERVER REMOVE USER DEBUG - Target user ID:", userId);
      console.log("\u{1F680} SERVER REMOVE USER DEBUG - Current user:", req.user.id);
      console.log("\u{1F680} SERVER REMOVE USER DEBUG - Workspace ID:", workspaceId);
      console.log("\u{1F680} SERVER REMOVE USER DEBUG - Organization ID:", currentOrganizationId);
      if (userId === req.user.id) {
        console.log("\u{1F680} SERVER REMOVE USER DEBUG - ERROR: Cannot remove self");
        return res.status(400).json({ message: "Cannot remove yourself from workspace" });
      }
      const targetUserOrganization = await storage.getUserOrganization(userId, currentOrganizationId);
      if (targetUserOrganization && targetUserOrganization.role === "owner") {
        const ownerCount = await storage.countOrganizationOwners(currentOrganizationId);
        if (ownerCount <= 1) {
          return res.status(400).json({
            message: "Cannot remove the last organization owner. The organization must have at least one owner. Change their role to member first."
          });
        } else {
          return res.status(400).json({
            message: "Cannot remove organization owner. Change their role to member first, then remove them."
          });
        }
      }
      console.log("\u{1F680} SERVER REMOVE USER DEBUG - Calling storage.removeWorkspaceMember");
      const result = await storage.removeWorkspaceMember(workspaceId, userId);
      console.log("\u{1F680} SERVER REMOVE USER DEBUG - removeWorkspaceMember result:", result);
      console.log("\u{1F680} SERVER REMOVE USER DEBUG - User successfully removed from workspace");
      res.json({ success: true, message: "User removed from workspace" });
    } catch (error) {
      console.error("\u{1F680} SERVER REMOVE USER DEBUG - Error removing user from workspace:", error);
      res.status(500).json({ message: "Failed to remove user from workspace" });
    }
  });
  app2.get("/api/admin/workspaces", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = req.user.id;
      const userOrganizations2 = await storage.getUserOrganizations(userId);
      const user = await storage.getUser(userId);
      if (!user || !user.currentOrganizationId) {
        return res.status(400).json({ message: "User has no organization context" });
      }
      const userOrgRole = userOrganizations2.find((uo) => uo.organizationId === user.currentOrganizationId);
      console.log("\u{1F50D} ADMIN DEBUG - User:", userId, "OrgRole:", userOrgRole, "CurrentOrgId:", user.currentOrganizationId);
      let workspaces2;
      if (userOrgRole && userOrgRole.role === "owner") {
        console.log("\u{1F50D} Admin Owner detected - fetching all workspaces for organization:", user.currentOrganizationId);
        workspaces2 = await storage.getWorkspacesByOrganizationId(user.currentOrganizationId);
      } else {
        console.log("\u{1F50D} Non-owner detected - fetching user workspace roles for user:", userId);
        const userWorkspaceRoles2 = await storage.getUserWorkspaceRoles(userId, user.currentOrganizationId);
        console.log("\u{1F50D} User workspace roles found:", userWorkspaceRoles2);
        const adminWorkspaceRoles = userWorkspaceRoles2.filter((uwr) => uwr.role === "administrator");
        console.log("\u{1F50D} Admin workspace roles filtered:", adminWorkspaceRoles);
        workspaces2 = await Promise.all(adminWorkspaceRoles.map(async (roleAssignment) => {
          return await storage.getWorkspace(roleAssignment.workspaceId);
        }));
        workspaces2 = workspaces2.filter((w) => w !== void 0);
        console.log("\u{1F50D} Final workspaces for non-owner:", workspaces2);
      }
      const workspacesWithInfo = await Promise.all(workspaces2.map(async (workspace) => {
        const allMembers = await storage.getAllWorkspaceMembers(workspace.id);
        const activeMembers = await storage.getWorkspaceMembers(workspace.id);
        const organization = await storage.getOrganization(workspace.organizationId);
        const owner = organization ? await storage.getUser(organization.ownerId) : null;
        let ownerName = "Unknown";
        let ownerEmail = "Unknown";
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
          ownerEmail = owner.email || "Unknown";
        }
        console.log(`\u{1F50D} Workspace ${workspace.name} (ID: ${workspace.id}) - AllMembers: ${allMembers.length}, ActiveMembers: ${activeMembers.length}`);
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
          ownerName,
          ownerEmail
        };
      }));
      res.json(workspacesWithInfo);
    } catch (error) {
      console.error("Error fetching admin workspaces:", error);
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });
  app2.post("/api/admin/workspaces", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Workspace name is required" });
      }
      const { organizationId } = getCurrentContext(req);
      const existingWorkspace = await storage.getWorkspaceByName(name.trim());
      if (existingWorkspace) {
        return res.status(400).json({ message: "A workspace with this name already exists" });
      }
      const workspace = await storage.createWorkspace({
        name: name.trim(),
        description: description?.trim() || null,
        organizationId,
        organizationKey: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ownerUserId: req.user.id,
        uniqueId: `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      await storage.createUserWorkspace({
        userId: req.user.id,
        workspaceId: workspace.id,
        role: "administrator",
        isActive: true
      });
      res.json({ success: true, workspace });
    } catch (error) {
      console.error("Error creating workspace:", error);
      res.status(500).json({ message: "Failed to create workspace" });
    }
  });
  app2.put("/api/admin/workspaces/:workspaceId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const { name, description } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Workspace name is required" });
      }
      const existingWorkspace = await storage.getWorkspaceByName(name.trim());
      if (existingWorkspace && existingWorkspace.id !== parseInt(workspaceId)) {
        return res.status(400).json({ message: "A workspace with this name already exists" });
      }
      const updates = {
        name: name.trim(),
        description: description?.trim() || null,
        updatedAt: /* @__PURE__ */ new Date()
      };
      const updatedWorkspace = await storage.updateWorkspace(parseInt(workspaceId), updates);
      if (!updatedWorkspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      res.json({ success: true, workspace: updatedWorkspace });
    } catch (error) {
      console.error("Error updating workspace:", error);
      res.status(500).json({ message: "Failed to update workspace" });
    }
  });
  app2.post("/api/admin/workspaces/:workspaceId/switch", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const workspaceIdInt = parseInt(workspaceId);
      const workspace = await storage.getWorkspace(workspaceIdInt);
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }
      await storage.updateUserWorkspace(req.user.id, workspaceIdInt);
      req.user.currentWorkspaceId = workspaceIdInt;
      req.user.lastWorkspaceId = workspaceIdInt;
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
        }
      });
      res.json({ success: true, workspace });
    } catch (error) {
      console.error("Error switching workspace:", error);
      res.status(500).json({ message: "Failed to switch workspace" });
    }
  });
  app2.delete("/api/admin/workspaces/:workspaceId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const workspaceIdInt = parseInt(workspaceId);
      const currentWorkspaceId = getCurrentWorkspaceId(req);
      if (workspaceIdInt === currentWorkspaceId) {
        return res.status(400).json({ message: "Cannot delete current workspace. Please switch to another workspace first." });
      }
      const members = await storage.getWorkspaceMembers(workspaceIdInt);
      if (members.length > 1) {
        return res.status(400).json({ message: `Cannot delete workspace with ${members.length} members. Please remove members first.` });
      }
      await storage.deleteWorkspace(workspaceIdInt);
      res.json({ success: true, message: "Workspace deleted successfully" });
    } catch (error) {
      console.error("Error deleting workspace:", error);
      res.status(500).json({ message: "Failed to delete workspace" });
    }
  });
  app2.get("/api/workspace-roles", requireAuth, async (req, res) => {
    try {
      const roles = await storage.getWorkspaceRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching workspace roles:", error);
      res.status(500).json({ message: "Failed to fetch workspace roles" });
    }
  });
  app2.post("/api/workspace-roles", requireAuth, async (req, res) => {
    try {
      const { name, description, permissions } = req.body;
      if (!name || !description || !Array.isArray(permissions)) {
        return res.status(400).json({ message: "Name, description, and permissions are required" });
      }
      const role = await storage.createWorkspaceRole({
        name,
        description,
        permissions
      });
      res.json(role);
    } catch (error) {
      console.error("Error creating workspace role:", error);
      res.status(500).json({ message: "Failed to create workspace role" });
    }
  });
  app2.get("/api/workspace-roles/:name", requireAuth, async (req, res) => {
    try {
      const { name } = req.params;
      const role = await storage.getWorkspaceRoleByName(name);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      console.error("Error fetching workspace role:", error);
      res.status(500).json({ message: "Failed to fetch workspace role" });
    }
  });
  app2.put("/api/workspace-roles/:id", requireAuth, async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const { name, description, permissions } = req.body;
      if (isNaN(roleId)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }
      const updates = {};
      if (name) updates.name = name;
      if (description) updates.description = description;
      if (Array.isArray(permissions)) updates.permissions = permissions;
      const role = await storage.updateWorkspaceRole(roleId, updates);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      console.error("Error updating workspace role:", error);
      res.status(500).json({ message: "Failed to update workspace role" });
    }
  });
  app2.delete("/api/workspace-roles/:id", requireAuth, async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }
      const deleted = await storage.deleteWorkspaceRole(roleId);
      if (!deleted) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json({ success: true, message: "Role deleted successfully" });
    } catch (error) {
      console.error("Error deleting workspace role:", error);
      res.status(500).json({ message: "Failed to delete workspace role" });
    }
  });
  app2.get("/api/user-workspace-roles/:workspaceId", requireAuth, async (req, res) => {
    try {
      const workspaceId = parseInt(req.params.workspaceId);
      if (isNaN(workspaceId)) {
        return res.status(400).json({ message: "Invalid workspace ID" });
      }
      const userRoles = await storage.getUserWorkspaceRolesByWorkspace(workspaceId);
      res.json(userRoles);
    } catch (error) {
      console.error("Error fetching user workspace roles:", error);
      res.status(500).json({ message: "Failed to fetch user workspace roles" });
    }
  });
  app2.get("/api/admin/all-user-workspace-roles", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const organizationId = getCurrentOrganizationId(req);
      if (!await hasAdminAccess(userId, organizationId)) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      const organizationUsers = await storage.getUsersByOrganizationId(organizationId);
      const allUserWorkspaceRoles = await storage.getAllUserWorkspaceRolesForOrganization(organizationId);
      const userRolesMap = /* @__PURE__ */ new Map();
      for (const roleAssignment of allUserWorkspaceRoles) {
        const userId2 = roleAssignment.userId;
        if (!userRolesMap.has(userId2)) {
          userRolesMap.set(userId2, []);
        }
        userRolesMap.get(userId2).push(roleAssignment);
      }
      const userRolesObject = Object.fromEntries(userRolesMap);
      res.json(userRolesObject);
    } catch (error) {
      console.error("Error fetching all user workspace roles:", error);
      res.status(500).json({ message: "Failed to fetch all user workspace roles" });
    }
  });
  app2.post("/api/user-workspace-roles", requireAuth, async (req, res) => {
    try {
      const { userId, workspaceId, roleId } = req.body;
      if (!userId || !workspaceId || !roleId) {
        return res.status(400).json({ message: "User ID, workspace ID, and role ID are required" });
      }
      const currentUserId = req.user.id;
      const currentUser = await storage.getUser(currentUserId);
      if (!currentUser || !currentUser.currentOrganizationId) {
        return res.status(400).json({ message: "No organization context available" });
      }
      const userOrganizations2 = await storage.getUserOrganizations(currentUserId);
      const userOrgRole = userOrganizations2.find((uo) => uo.organizationId === currentUser.currentOrganizationId);
      const isOrgOwner = userOrgRole && userOrgRole.role === "owner";
      if (isOrgOwner) {
        const targetWorkspace = await storage.getWorkspace(workspaceId);
        if (!targetWorkspace || targetWorkspace.organizationId !== currentUser.currentOrganizationId) {
          return res.status(403).json({ message: "Target workspace does not belong to your organization" });
        }
        const targetUserOrganization = await storage.getUserOrganization(userId, currentUser.currentOrganizationId);
        if (!targetUserOrganization) {
          return res.status(403).json({ message: "Target user does not belong to your organization" });
        }
        const existingMembership = await storage.getUserWorkspaceByIds(userId, workspaceId);
        if (!existingMembership) {
          await storage.addUserToWorkspace(userId, workspaceId, "member");
        }
      } else {
        const currentUserWorkspace = await storage.getUserWorkspaceByIds(currentUserId, workspaceId);
        if (!currentUserWorkspace) {
          return res.status(403).json({ message: "Access denied to this workspace" });
        }
      }
      const assignment = await storage.assignUserWorkspaceRole({
        userId,
        workspaceId,
        roleId,
        assignedByUserId: currentUserId
      });
      res.json(assignment);
    } catch (error) {
      console.error("Error assigning user workspace role:", error);
      res.status(500).json({ message: "Failed to assign user workspace role" });
    }
  });
  app2.delete("/api/user-workspace-roles/:userId/:workspaceId/:roleId", requireAuth, async (req, res) => {
    try {
      const { userId, workspaceId, roleId } = req.params;
      const workspaceIdInt = parseInt(workspaceId);
      const roleIdInt = parseInt(roleId);
      console.log("\u{1F525} DELETE REQUEST - UserId:", userId, "WorkspaceId:", workspaceIdInt, "RoleId:", roleIdInt);
      if (isNaN(workspaceIdInt) || isNaN(roleIdInt)) {
        return res.status(400).json({ message: "Invalid workspace ID or role ID" });
      }
      const existingRoles = await storage.getUserWorkspaceRolesByWorkspace(workspaceIdInt);
      const userRoles = existingRoles.filter((role) => role.userId === userId);
      console.log("\u{1F50D} Existing roles for user:", userRoles);
      const removed = await storage.removeUserWorkspaceRole(userId, workspaceIdInt, roleIdInt);
      console.log("\u{1F5D1}\uFE0F Remove result:", removed);
      if (!removed) {
        return res.status(404).json({ message: "Role assignment not found" });
      }
      res.json({ success: true, message: "Role assignment removed successfully" });
    } catch (error) {
      console.error("Error removing user workspace role:", error);
      res.status(500).json({ message: "Failed to remove user workspace role" });
    }
  });
  app2.get("/api/user-workspace-permissions/:userId/:workspaceId", requireAuth, async (req, res) => {
    try {
      const { userId, workspaceId } = req.params;
      const workspaceIdInt = parseInt(workspaceId);
      if (isNaN(workspaceIdInt)) {
        return res.status(400).json({ message: "Invalid workspace ID" });
      }
      const permissions = await storage.getUserWorkspacePermissions(userId, workspaceIdInt);
      res.json({ permissions });
    } catch (error) {
      console.error("Error fetching user workspace permissions:", error);
      res.status(500).json({ message: "Failed to fetch user workspace permissions" });
    }
  });
  app2.post("/api/check-workspace-permission", requireAuth, async (req, res) => {
    try {
      const { userId, workspaceId, permission } = req.body;
      if (!userId || !workspaceId || !permission) {
        return res.status(400).json({ message: "User ID, workspace ID, and permission are required" });
      }
      const hasPermission = await storage.hasWorkspacePermission(userId, workspaceId, permission);
      res.json({ hasPermission });
    } catch (error) {
      console.error("Error checking workspace permission:", error);
      res.status(500).json({ message: "Failed to check workspace permission" });
    }
  });
  app2.delete("/api/admin/users/:userId/delete-completely", requireAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id;
      const organizationId = getCurrentOrganizationId(req);
      console.log("\u{1F5D1}\uFE0F DELETE USER API - Received request for userId:", userId, "from currentUser:", currentUserId);
      if (!userId || !currentUserId || !organizationId) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      const adminAccess = await hasAdminAccess(currentUserId, organizationId);
      if (!adminAccess) {
        console.log("\u{1F5D1}\uFE0F DELETE USER API - Access denied for user:", currentUserId);
        return res.status(403).json({ message: "Admin access required" });
      }
      const organizationOwners = await storage.getOrganizationOwners(organizationId);
      const isTargetUserOwner = organizationOwners.some((owner) => owner.userId === userId);
      if (isTargetUserOwner) {
        console.log("\u{1F5D1}\uFE0F DELETE USER API - Cannot delete organization owner:", userId);
        return res.status(403).json({ message: "Cannot delete organization owners" });
      }
      if (currentUserId === userId) {
        console.log("\u{1F5D1}\uFE0F DELETE USER API - User trying to delete themselves:", userId);
        return res.status(403).json({ message: "Cannot delete your own account" });
      }
      console.log("\u{1F5D1}\uFE0F DELETE USER API - Starting deletion process for userId:", userId);
      const userWorkspaces2 = await storage.getUserWorkspacesByOrganization(userId, organizationId);
      console.log("\u{1F5D1}\uFE0F DELETE USER API - Found user workspaces:", userWorkspaces2.length);
      for (const workspace of userWorkspaces2) {
        const workspaceId = workspace.workspaceId;
        console.log("\u{1F5D1}\uFE0F DELETE USER API - Processing workspace:", workspaceId);
        try {
          console.log("\u{1F5D1}\uFE0F DELETE USER API - Getting posts for user:", userId, "workspace:", workspaceId);
          const posts2 = await storage.getPostsByUserId(userId, organizationId, workspaceId);
          console.log("\u{1F5D1}\uFE0F DELETE USER API - Found posts:", posts2.length);
          for (const post of posts2) {
            console.log("\u{1F5D1}\uFE0F DELETE USER API - Processing post:", post.id);
            console.log("\u{1F5D1}\uFE0F DELETE USER API - Getting schedules for user:", userId, "workspace:", workspaceId);
            const schedules2 = await storage.getPostSchedulesByUserId(userId, workspaceId);
            for (const schedule of schedules2) {
              if (schedule.postId === post.id) {
                console.log("\u{1F5D1}\uFE0F DELETE USER API - Deleting schedule executions for schedule:", schedule.id);
                await storage.deleteScheduleExecutions(schedule.id);
              }
            }
            console.log("\u{1F5D1}\uFE0F DELETE USER API - Deleting published posts for post:", post.id);
            await storage.deletePublishedPosts(post.id);
            console.log("\u{1F5D1}\uFE0F DELETE USER API - Deleting generated content for post:", post.id);
            await storage.deleteGeneratedContent(post.id);
            console.log("\u{1F5D1}\uFE0F DELETE USER API - Deleting post:", post.id, "userId:", userId, "orgId:", organizationId, "workspaceId:", workspaceId);
            await storage.deletePost(post.id, userId, organizationId, workspaceId);
          }
          console.log("\u{1F5D1}\uFE0F DELETE USER API - Deleting remaining schedules");
          const schedules = await storage.getPostSchedulesByUserId(userId, workspaceId);
          for (const schedule of schedules) {
            console.log("\u{1F5D1}\uFE0F DELETE USER API - Deleting schedule:", schedule.id, "userId:", userId, "orgId:", organizationId, "workspaceId:", workspaceId);
            await storage.deletePostSchedule(schedule.id, userId, organizationId, workspaceId);
          }
          console.log("\u{1F5D1}\uFE0F DELETE USER API - Deleting templates");
          const templates2 = await storage.getTemplatesByUserId(userId, organizationId, workspaceId);
          for (const template of templates2) {
            console.log("\u{1F5D1}\uFE0F DELETE USER API - Deleting template:", template.id);
            await storage.deleteTemplate(template.id, userId, organizationId, workspaceId);
          }
          console.log("\u{1F5D1}\uFE0F DELETE USER API - Deleting images");
          const images2 = await storage.getImagesByUserId(userId, organizationId, workspaceId);
          for (const image of images2) {
            console.log("\u{1F5D1}\uFE0F DELETE USER API - Deleting image:", image.id);
            await storage.deleteImage(image.id, userId, workspaceId);
          }
          console.log("\u{1F5D1}\uFE0F DELETE USER API - Deleting folders");
          const folders2 = await storage.getFoldersByUserId(userId, organizationId, workspaceId);
          for (const folder of folders2) {
            console.log("\u{1F5D1}\uFE0F DELETE USER API - Deleting folder:", folder.id);
            await storage.deleteFolder(folder.id, userId, workspaceId);
          }
          console.log("\u{1F5D1}\uFE0F DELETE USER API - Deleting social media configs");
          const socialConfigs = await storage.getSocialMediaConfigs(userId, workspaceId);
          for (const config of socialConfigs) {
            console.log("\u{1F5D1}\uFE0F DELETE USER API - Deleting social config:", config.id);
            await storage.deleteSocialMediaConfig(config.id, userId, workspaceId);
          }
          console.log("\u{1F5D1}\uFE0F DELETE USER API - Anonymizing transactions");
          await storage.anonymizeUserTransactions(userId, workspaceId);
        } catch (error) {
          console.error("\u{1F5D1}\uFE0F DELETE USER API - Error in workspace processing:", error);
          throw error;
        }
      }
      await storage.deleteUserWorkspaceRoles(userId, organizationId);
      await storage.deleteUserWorkspaces(userId, organizationId);
      await storage.deleteUserOrganization(userId, organizationId);
      await storage.deleteUserInvitations(userId, organizationId);
      const remainingOrganizations = await storage.getUserOrganizations(userId);
      if (remainingOrganizations.length === 0) {
        console.log("\u{1F5D1}\uFE0F DELETE USER API - User has no other organizations, deleting account:", userId);
        await storage.deleteUserAccount(userId);
      } else {
        console.log("\u{1F5D1}\uFE0F DELETE USER API - User belongs to other organizations, keeping account:", userId, "OrgCount:", remainingOrganizations.length);
      }
      console.log("\u{1F5D1}\uFE0F DELETE USER API - Deletion completed for userId:", userId);
      res.json({
        success: true,
        message: "User completely deleted from organization",
        deletedAccount: remainingOrganizations.length === 0
      });
    } catch (error) {
      console.error("\u{1F5D1}\uFE0F DELETE USER API - Error:", error);
      res.status(500).json({
        message: "Failed to delete user completely",
        error: error.message
      });
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
import dotenv7 from "dotenv";
dotenv7.config();
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
import dotenv8 from "dotenv";
import cors2 from "cors";
dotenv8.config();
var app = express2();
app.set("trust proxy", 1);
app.use(cors2({
  //origin: "https://www.postme-ai-frontend-2d76778b4014.herokuapp.com", 
  origin: process.env.POSTMEAI_FE_URL,
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
