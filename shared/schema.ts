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

// Organizations table - top-level entity for multi-tenant system
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  uniqueId: varchar("unique_id").unique().notNull(),
  ownerId: varchar("owner_id").notNull(), // User who owns this organization
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workspaces table - belongs to an organization
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  uniqueId: varchar("unique_id").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Unique workspace name per organization
  uniqueNamePerOrg: unique().on(table.organizationId, table.name),
}));

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
  // Organization and Workspace context
  currentOrganizationId: integer("current_organization_id").references(() => organizations.id),
  currentWorkspaceId: integer("current_workspace_id").references(() => workspaces.id),
  lastWorkspaceId: integer("last_workspace_id").references(() => workspaces.id),
  // Billing and subscription fields
  credits: integer("credits").notNull().default(0),
  subscriptionPlan: varchar("subscription_plan"), // 'basic', 'pro', 'enterprise', etc.
  subscriptionStatus: varchar("subscription_status").default("inactive"), // 'active', 'inactive', 'cancelled', 'expired'
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
  userRole: varchar("user_role").default("creator"), // creator, publisher, approver, administrator
  accountStatus: varchar("account_status").default("active"), // active, inactive, pending_approval
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User organization memberships (many-to-many relationship)
export const userOrganizations = pgTable("user_organizations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  role: varchar("role").notNull().default("member"), // owner, member
  isActive: boolean("is_active").default(true),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
}, (table) => ({
  uniqueUserOrganization: unique().on(table.userId, table.organizationId),
}));

// User workspace memberships (many-to-many relationship)
export const userWorkspaces = pgTable("user_workspaces", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  role: varchar("role").notNull().default("creator"), // creator, publisher, approver, administrator
  isActive: boolean("is_active").default(true),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
}, (table) => ({
  uniqueUserWorkspace: unique().on(table.userId, table.workspaceId),
}));

// Workspace invitations table - completely workspace-isolated
export const workspaceInvitations = pgTable("workspace_invitations", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  email: varchar("email").notNull(),
  role: varchar("role").notNull().default("creator"),
  invitationKey: varchar("invitation_key").unique().notNull(),
  status: varchar("status").notNull().default("pending"), // pending, accepted, expired
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
}, (table) => ({
  // Ensure invitations are workspace-specific
  uniqueWorkspaceInvitation: unique().on(table.workspaceId, table.email),
}));

// User invitations table - organization-level with workspace role assignments
export const userInvitations = pgTable("user_invitations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  invitedByUserId: varchar("invited_by_user_id").notNull().references(() => users.id),
  email: varchar("email").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  invitationKey: varchar("invitation_key").unique().notNull(),
  expirationMinutes: integer("expiration_minutes").notNull().default(10), // 10-60 minutes
  status: varchar("status").default("pending"), // pending, accepted, expired, auto_activated
  invitedAt: timestamp("invited_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  passwordSetAt: timestamp("password_set_at"),
  approvedAt: timestamp("approved_at"),
  approvedByUserId: varchar("approved_by_user_id").references(() => users.id),
  userId: varchar("user_id").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  rejectedByUserId: varchar("rejected_by_user_id").references(() => users.id),
  canceledAt: timestamp("canceled_at"),
  canceledByUserId: varchar("canceled_by_user_id").references(() => users.id),
}, (table) => ({
  // Ensure invitations are organization-specific
  uniqueOrganizationUserInvitation: unique().on(table.organizationId, table.email),
}));

// Invitation workspace roles table - stores role assignments per workspace for each invitation
export const invitationWorkspaceRoles = pgTable("invitation_workspace_roles", {
  id: serial("id").primaryKey(),
  invitationId: integer("invitation_id").notNull().references(() => userInvitations.id, { onDelete: 'cascade' }),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  roles: text("roles").array().notNull(), // Array of role names
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Ensure one record per invitation per workspace
  uniqueInvitationWorkspace: unique().on(table.invitationId, table.workspaceId),
  invitationIndex: index("invitation_workspace_roles_invitation_idx").on(table.invitationId),
  workspaceIndex: index("invitation_workspace_roles_workspace_idx").on(table.workspaceId),
}));

// Workspace roles table - defines available roles for workspaces
export const workspaceRoles = pgTable("workspace_roles", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  permissions: text("permissions").array(), // Array of permission strings
  createdAt: timestamp("created_at").defaultNow(),
});

// User workspace roles association table - maps users to workspace roles
export const userWorkspaceRoles = pgTable("user_workspace_roles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  roleId: integer("role_id").notNull().references(() => workspaceRoles.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedByUserId: varchar("assigned_by_user_id").references(() => users.id),
}, (table) => ({
  // Ensure unique role assignment per user per workspace
  uniqueUserWorkspaceRole: unique().on(table.userId, table.workspaceId, table.roleId),
  userIndex: index("user_workspace_roles_user_idx").on(table.userId),
  workspaceIndex: index("user_workspace_roles_workspace_idx").on(table.workspaceId),
  roleIndex: index("user_workspace_roles_role_idx").on(table.roleId),
}));

// Posts table - workspace-isolated
export const posts = pgTable("posts", {
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
  executionMode: varchar("execution_mode").default("review"), // review, auto, manual
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  workspaceIndex: index("posts_workspace_idx").on(table.workspaceId),
  userIndex: index("posts_user_idx").on(table.userId),
  // Composite index for multi-tenancy queries as per best practices
  workspaceUserIndex: index("posts_workspace_user_idx").on(table.workspaceId, table.userId),
}));

// Generated content table - workspace-isolated
export const generatedContent = pgTable("generated_content", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  postId: integer("post_id").notNull().references(() => posts.id),
  title: varchar("title"),
  body: text("body"),
  imageUrl: varchar("image_url"),
  imagePrompt: text("image_prompt"),
  platformContent: jsonb("platform_content"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  workspaceIndex: index("generated_content_workspace_idx").on(table.workspaceId),
  postIndex: index("generated_content_post_idx").on(table.postId),
  // Composite index for multi-tenancy queries as per best practices
  workspacePostIndex: index("generated_content_workspace_post_idx").on(table.workspaceId, table.postId),
}));

// Published posts table - workspace-isolated
export const publishedPosts = pgTable("published_posts", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  postId: integer("post_id").notNull().references(() => posts.id),
  platform: varchar("platform").notNull(),
  platformPostId: varchar("platform_post_id"),
  status: varchar("status").default("pending"), // pending, published, failed
  publishedAt: timestamp("published_at").defaultNow(),
  errorMessage: text("error_message"),
}, (table) => ({
  workspaceIndex: index("published_posts_workspace_idx").on(table.workspaceId),
  postIndex: index("published_posts_post_idx").on(table.postId),
  // Composite index for multi-tenancy queries as per best practices
  workspacePostIndex: index("published_posts_workspace_post_idx").on(table.workspaceId, table.postId),
}));

// Templates table - workspace-isolated
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  postId: integer("post_id").notNull().references(() => posts.id),
  frequency: varchar("frequency").default("daily"), // daily, weekly, monthly, custom
  isActive: boolean("is_active").default(true),
  lastExecutedAt: timestamp("last_executed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  workspaceIndex: index("templates_workspace_idx").on(table.workspaceId),
  userIndex: index("templates_user_idx").on(table.userId),
  // Composite index for multi-tenancy queries as per best practices
  workspaceUserIndex: index("templates_workspace_user_idx").on(table.workspaceId, table.userId),
}));

// Payment transactions table - workspace-isolated
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount").notNull(),
  currency: varchar("currency").default("USD"),
  paymentMethod: varchar("payment_method").notNull(),
  status: varchar("status").default("pending"), // pending, completed, failed
  transactionId: varchar("transaction_id"),
  credits: integer("credits").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  workspaceIndex: index("payment_transactions_workspace_idx").on(table.workspaceId),
  userIndex: index("payment_transactions_user_idx").on(table.userId),
  // Composite index for multi-tenancy queries as per best practices
  workspaceUserIndex: index("payment_transactions_workspace_user_idx").on(table.workspaceId, table.userId),
}));

// Folders table - workspace-isolated
export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  workspaceIndex: index("folders_workspace_idx").on(table.workspaceId),
  userIndex: index("folders_user_idx").on(table.userId),
  uniqueWorkspaceFolder: unique().on(table.workspaceId, table.userId, table.name),
  // Composite index for multi-tenancy queries as per best practices
  orgWorkspaceIndex: index("folders_org_workspace_idx").on(table.organizationId, table.workspaceId),
  workspaceUserIndex: index("folders_workspace_user_idx").on(table.workspaceId, table.userId),
}));

// Images table - workspace-isolated
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name"),
  folderId: integer("folder_id").references(() => folders.id),
  data: text("data").notNull(), // Base64 encoded image data (stored as bytea in DB)
  fileType: varchar("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  workspaceIndex: index("images_workspace_idx").on(table.workspaceId),
  userIndex: index("images_user_idx").on(table.userId),
  // Composite index for multi-tenancy queries as per best practices
  orgWorkspaceIndex: index("images_org_workspace_idx").on(table.organizationId, table.workspaceId),
  workspaceUserIndex: index("images_workspace_user_idx").on(table.workspaceId, table.userId),
}));

// Social media configurations table - workspace-isolated
export const socialMediaConfigs = pgTable("social_media_configs", {
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
  testStatus: varchar("test_status").default("not_tested"), // not_tested, testing, connected, failed
  lastTestedAt: timestamp("last_tested_at"),
  testMessage: text("test_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  workspaceIndex: index("social_media_configs_workspace_idx").on(table.workspaceId),
  userIndex: index("social_media_configs_user_idx").on(table.userId),
  uniqueWorkspacePlatform: unique().on(table.workspaceId, table.userId, table.platform),
  // Composite index for multi-tenancy queries as per best practices
  orgWorkspaceIndex: index("social_media_configs_org_workspace_idx").on(table.organizationId, table.workspaceId),
  workspaceUserIndex: index("social_media_configs_workspace_user_idx").on(table.workspaceId, table.userId),
}));

// Post schedules table - workspace-isolated
export const postSchedules = pgTable("post_schedules", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  creationMode: varchar("creation_mode").default("ai"), // ai, manual
  templateId: integer("template_id").references(() => templates.id),
  postId: integer("post_id").references(() => posts.id),
  platforms: text("platforms").array(),
  scheduleConfig: jsonb("schedule_config").notNull(),
  platformConfigs: jsonb("platform_configs"),
  links: jsonb("links"),
  isActive: boolean("is_active").default(true),
  lastExecutedAt: timestamp("last_executed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  workspaceIndex: index("post_schedules_workspace_idx").on(table.workspaceId),
  userIndex: index("post_schedules_user_idx").on(table.userId),
  // Composite index for multi-tenancy queries as per best practices
  workspaceUserIndex: index("post_schedules_workspace_user_idx").on(table.workspaceId, table.userId),
}));

// Schedule executions table - workspace-isolated
export const scheduleExecutions = pgTable("schedule_executions", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  scheduleId: integer("schedule_id").notNull().references(() => postSchedules.id),
  executedAt: timestamp("executed_at").defaultNow(),
  status: varchar("status").default("pending"), // pending, completed, failed
  errorMessage: text("error_message"),
  generatedPostId: integer("generated_post_id").references(() => posts.id),
}, (table) => ({
  workspaceIndex: index("schedule_executions_workspace_idx").on(table.workspaceId),
  scheduleIndex: index("schedule_executions_schedule_idx").on(table.scheduleId),
  // Composite index for multi-tenancy queries as per best practices
  workspaceScheduleIndex: index("schedule_executions_workspace_schedule_idx").on(table.workspaceId, table.scheduleId),
}));

// Consent audit log table for GDPR/CCPA compliance
export const consentAuditLog = pgTable("consent_audit_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  email: varchar("email"), // Store email for tracking consent before user registration
  sessionId: varchar("session_id"), // Track consent by session if no user yet
  consentAction: varchar("consent_action").notNull(), // "accepted", "rejected", "partial", "updated"
  privacyPolicyAccepted: boolean("privacy_policy_accepted").notNull(),
  termsOfUseAccepted: boolean("terms_of_use_accepted").notNull(),
  mandatoryCookies: boolean("mandatory_cookies").notNull().default(true),
  analyticsCookies: boolean("analytics_cookies").notNull().default(false),
  personalizationCookies: boolean("personalization_cookies").notNull().default(false),
  marketingCookies: boolean("marketing_cookies").notNull().default(false),
  userAgent: text("user_agent"), // Browser information for audit
  ipAddress: varchar("ip_address"), // IP address for audit
  consentTimestamp: timestamp("consent_timestamp").defaultNow(),
  consentData: jsonb("consent_data"), // Full consent object for detailed audit
}, (table) => ({
  userIndex: index("consent_audit_user_idx").on(table.userId),
  emailIndex: index("consent_audit_email_idx").on(table.email),
  sessionIndex: index("consent_audit_session_idx").on(table.sessionId),
  timestampIndex: index("consent_audit_timestamp_idx").on(table.consentTimestamp),
}));

// Type definitions
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type LocalAuth = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

export type UserOrganization = typeof userOrganizations.$inferSelect;
export type InsertUserOrganization = typeof userOrganizations.$inferInsert;

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;

export type UserWorkspace = typeof userWorkspaces.$inferSelect;
export type InsertUserWorkspace = typeof userWorkspaces.$inferInsert;

export type WorkspaceInvitation = typeof workspaceInvitations.$inferSelect;
export type InsertWorkspaceInvitation = typeof workspaceInvitations.$inferInsert;

export type UserInvitation = typeof userInvitations.$inferSelect;
export type InsertUserInvitation = typeof userInvitations.$inferInsert;
export type InvitationWorkspaceRole = typeof invitationWorkspaceRoles.$inferSelect;
export type InsertInvitationWorkspaceRole = typeof invitationWorkspaceRoles.$inferInsert;

export type WorkspaceRole = typeof workspaceRoles.$inferSelect;
export type InsertWorkspaceRole = typeof workspaceRoles.$inferInsert;

export type UserWorkspaceRole = typeof userWorkspaceRoles.$inferSelect;
export type InsertUserWorkspaceRole = typeof userWorkspaceRoles.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

export type GeneratedContent = typeof generatedContent.$inferSelect;
export type InsertGeneratedContent = typeof generatedContent.$inferInsert;

export type PublishedPost = typeof publishedPosts.$inferSelect;
export type InsertPublishedPost = typeof publishedPosts.$inferInsert;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = typeof folders.$inferInsert;

export type Image = typeof images.$inferSelect;
export type InsertImage = typeof images.$inferInsert;

export type SocialMediaConfig = typeof socialMediaConfigs.$inferSelect;
export type InsertSocialMediaConfig = typeof socialMediaConfigs.$inferInsert;

export type PostSchedule = typeof postSchedules.$inferSelect;
export type InsertPostSchedule = typeof postSchedules.$inferInsert;

export type ScheduleExecution = typeof scheduleExecutions.$inferSelect;
export type InsertScheduleExecution = typeof scheduleExecutions.$inferInsert;

export type ConsentAuditLog = typeof consentAuditLog.$inferSelect;
export type InsertConsentAuditLog = typeof consentAuditLog.$inferInsert;

// Form validation schemas
export const insertUserSchema = createInsertSchema(users);
export const insertOrganizationSchema = createInsertSchema(organizations);
export const insertUserOrganizationSchema = createInsertSchema(userOrganizations);
export const insertWorkspaceSchema = createInsertSchema(workspaces);
export const insertUserWorkspaceSchema = createInsertSchema(userWorkspaces);
export const insertWorkspaceInvitationSchema = createInsertSchema(workspaceInvitations);
export const insertUserInvitationSchema = createInsertSchema(userInvitations);
export const insertInvitationWorkspaceRoleSchema = createInsertSchema(invitationWorkspaceRoles);
export const insertWorkspaceRoleSchema = createInsertSchema(workspaceRoles);
export const insertUserWorkspaceRoleSchema = createInsertSchema(userWorkspaceRoles);
export const insertPostSchema = createInsertSchema(posts);
export const insertGeneratedContentSchema = createInsertSchema(generatedContent);
export const insertPublishedPostSchema = createInsertSchema(publishedPosts);
export const insertTemplateSchema = createInsertSchema(templates);
export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions);
export const insertFolderSchema = createInsertSchema(folders);
export const insertImageSchema = createInsertSchema(images);
export const insertSocialMediaConfigSchema = createInsertSchema(socialMediaConfigs);
export const insertPostScheduleSchema = createInsertSchema(postSchedules);
export const insertScheduleExecutionSchema = createInsertSchema(scheduleExecutions);
export const insertConsentAuditLogSchema = createInsertSchema(consentAuditLog);

// Inferred types for forms
export type InsertUserType = z.infer<typeof insertUserSchema>;
export type InsertOrganizationType = z.infer<typeof insertOrganizationSchema>;
export type InsertUserOrganizationType = z.infer<typeof insertUserOrganizationSchema>;
export type InsertWorkspaceType = z.infer<typeof insertWorkspaceSchema>;
export type InsertUserWorkspaceType = z.infer<typeof insertUserWorkspaceSchema>;
export type InsertWorkspaceInvitationType = z.infer<typeof insertWorkspaceInvitationSchema>;
export type InsertUserInvitationType = z.infer<typeof insertUserInvitationSchema>;
export type InsertWorkspaceRoleType = z.infer<typeof insertWorkspaceRoleSchema>;
export type InsertUserWorkspaceRoleType = z.infer<typeof insertUserWorkspaceRoleSchema>;
export type InsertPostType = z.infer<typeof insertPostSchema>;
export type InsertGeneratedContentType = z.infer<typeof insertGeneratedContentSchema>;
export type InsertPublishedPostType = z.infer<typeof insertPublishedPostSchema>;
export type InsertTemplateType = z.infer<typeof insertTemplateSchema>;
export type InsertPaymentTransactionType = z.infer<typeof insertPaymentTransactionSchema>;
export type InsertFolderType = z.infer<typeof insertFolderSchema>;
export type InsertImageType = z.infer<typeof insertImageSchema>;
export type InsertSocialMediaConfigType = z.infer<typeof insertSocialMediaConfigSchema>;
export type InsertPostScheduleType = z.infer<typeof insertPostScheduleSchema>;
export type InsertScheduleExecutionType = z.infer<typeof insertScheduleExecutionSchema>;
export type InsertConsentAuditLogType = z.infer<typeof insertConsentAuditLogSchema>;