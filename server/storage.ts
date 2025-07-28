import {
  users,
  posts,
  generatedContent,
  publishedPosts,
  templates,
  paymentTransactions,
  folders,
  images,
  socialMediaConfigs,
  postSchedules,
  scheduleExecutions,
  consentAuditLog,
  organizations,
  userOrganizations,
  workspaces,
  userWorkspaces,
  workspaceInvitations,
  userInvitations,
  invitationWorkspaceRoles,
  type User,
  type UpsertUser,
  type LocalAuth,
  type Post,
  type InsertPost,
  type GeneratedContent,
  type InsertGeneratedContent,
  type PublishedPost,
  type InsertPublishedPost,
  type Template,
  type InsertTemplate,
  type PaymentTransaction,
  type InsertPaymentTransaction,
  type Folder,
  type InsertFolder,
  type Image,
  type InsertImage,
  type SocialMediaConfig,
  type InsertSocialMediaConfig,
  type PostSchedule,
  type InsertPostSchedule,
  type ScheduleExecution,
  type InsertScheduleExecution,
  type ConsentAuditLog,
  type InsertConsentAuditLog,
  type UserInvitation,
  type InsertUserInvitation,
  type InvitationWorkspaceRole,
  type InsertInvitationWorkspaceRole,
  type Organization,
  type InsertOrganization,
  type UserOrganization,
  type InsertUserOrganization,
  type Workspace,
  type InsertWorkspace,
  type UserWorkspace,
  type InsertUserWorkspace,
  type WorkspaceInvitation,
  type InsertWorkspaceInvitation,
  type WorkspaceRole,
  type InsertWorkspaceRole,
  type UserWorkspaceRole,
  type InsertUserWorkspaceRole,
  workspaceRoles,
  userWorkspaceRoles,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, gt, sql, lt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserWithContext(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createLocalUser(user: LocalAuth & { userRole?: string; accountStatus?: string; emailVerified?: boolean }): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;
  findOrCreateUserByEmail(userData: { email: string; firstName?: string; lastName?: string; profileImageUrl?: string; authProvider: string; providerId: string; }): Promise<User>;
  updateLastAuthMethod(userId: string, method: string): Promise<void>;
  updateUserWorkspace(userId: string, workspaceId: number): Promise<void>;
  updateUserCurrentWorkspace(userId: string, workspaceId: number): Promise<void>;
  updateUser(userId: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Organization operations
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationByUserId(userId: string): Promise<Organization | undefined>;
  getUserOrganizations(userId: string): Promise<UserOrganization[]>;
  getOrganizationMemberCount(organizationId: number): Promise<number>;
  getOrganizationMembers(organizationId: number): Promise<UserOrganization[]>;
  getOrganizationOwners(organizationId: number): Promise<UserOrganization[]>;
  getUserOrganization(userId: string, organizationId: number): Promise<UserOrganization | undefined>;
  countOrganizationOwners(organizationId: number): Promise<number>;
  createUserOrganization(userOrganization: InsertUserOrganization): Promise<UserOrganization>;
  updateUserOrganization(userId: string, organizationId: number, updates: Partial<UserOrganization>): Promise<UserOrganization | undefined>;
  
  // Workspace operations
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  getWorkspace(id: number): Promise<Workspace | undefined>;
  getWorkspaceById(id: number): Promise<Workspace | undefined>;
  getWorkspacesByUserId(userId: string): Promise<Workspace[]>;
  getWorkspacesByOrganizationId(organizationId: number): Promise<Workspace[]>;
  getWorkspaceMembers(workspaceId: number): Promise<any[]>;
  getAllWorkspaceMembers(workspaceId: number): Promise<any[]>;
  getUserWorkspaces(userId: string): Promise<UserWorkspace[]>;
  getUserWorkspaceByIds(userId: string, workspaceId: number): Promise<UserWorkspace | undefined>;
  getUserWorkspaceMembership(userId: string, workspaceId: number): Promise<UserWorkspace | undefined>;
  createUserWorkspace(userWorkspace: InsertUserWorkspace): Promise<UserWorkspace>;
  updateUserWorkspaceRole(userId: string, workspaceId: number, role: string): Promise<UserWorkspace | undefined>;
  getAllWorkspaces(): Promise<Workspace[]>;
  getWorkspaceByName(name: string): Promise<Workspace | undefined>;
  updateWorkspace(id: number, updates: Partial<Workspace>): Promise<Workspace | undefined>;
  deleteWorkspace(id: number): Promise<boolean>;
  updateWorkspaceMember(workspaceId: number, userId: string, updates: Partial<UserWorkspace>): Promise<UserWorkspace | undefined>;
  removeWorkspaceMember(workspaceId: number, userId: string): Promise<boolean>;
  addUserToWorkspace(userId: string, workspaceId: number, role: string): Promise<UserWorkspace>;
  
  // Workspace role operations
  getWorkspaceRoles(): Promise<WorkspaceRole[]>;
  getWorkspaceRoleByName(name: string): Promise<WorkspaceRole | undefined>;
  createWorkspaceRole(role: InsertWorkspaceRole): Promise<WorkspaceRole>;
  updateWorkspaceRole(id: number, updates: Partial<WorkspaceRole>): Promise<WorkspaceRole | undefined>;
  deleteWorkspaceRole(id: number): Promise<boolean>;
  
  // User workspace role operations
  getUserWorkspaceRoles(userId: string, workspaceId: number): Promise<UserWorkspaceRole[]>;
  getUserWorkspaceRoles(userId: string, organizationId: number): Promise<UserWorkspaceRole[]>;
  getUserWorkspaceRolesByWorkspace(workspaceId: number): Promise<UserWorkspaceRole[]>;
  assignUserWorkspaceRole(assignment: InsertUserWorkspaceRole): Promise<UserWorkspaceRole>;
  removeUserWorkspaceRole(userId: string, workspaceId: number, roleId: number): Promise<boolean>;
  removeAllUserWorkspaceRoles(userId: string, workspaceId: number): Promise<boolean>;
  getUserWorkspacePermissions(userId: string, workspaceId: number): Promise<string[]>;
  hasWorkspacePermission(userId: string, workspaceId: number, permission: string): Promise<boolean>;
  
  // Workspace invitation operations
  createWorkspaceInvitation(invitation: InsertWorkspaceInvitation): Promise<WorkspaceInvitation>;
  getWorkspaceInvitationByKey(key: string): Promise<WorkspaceInvitation | undefined>;
  updateWorkspaceInvitation(id: number, updates: Partial<WorkspaceInvitation>): Promise<WorkspaceInvitation | undefined>;
  getWorkspaceInvitationsByWorkspaceId(workspaceId: number): Promise<WorkspaceInvitation[]>;
  
  // Admin invitation operations
  createUserInvitation(invitation: InsertUserInvitation): Promise<UserInvitation>;
  createInvitationWorkspaceRoles(roles: InsertInvitationWorkspaceRole[]): Promise<void>;
  getUserInvitationsByUserId(userId: string, organizationId: number): Promise<UserInvitation[]>;
  getUserInvitationsByEmail(email: string, organizationId: number): Promise<UserInvitation[]>;
  getUserInvitationByKey(key: string): Promise<UserInvitation | undefined>;
  getInvitationWorkspaceRoles(invitationId: number): Promise<InvitationWorkspaceRole[]>;
  updateUserInvitation(id: number, updates: Partial<UserInvitation>): Promise<UserInvitation | undefined>;
  getInvitationByEmail(email: string, organizationId: number): Promise<UserInvitation | undefined>;
  getPendingApprovalsForAdmin(adminId: string, organizationId: number): Promise<UserInvitation[]>;
  approveUserInvitation(id: number, approvedByUserId: string): Promise<UserInvitation | undefined>;
  updateUserRoleAndStatus(userId: string, role: string, status: string): Promise<User | undefined>;
  getInvitationById(invitationId: number, organizationId: number): Promise<UserInvitation | undefined>;
  resendInvitation(invitationId: number, organizationId: number, newExpiresAt: Date, expirationMinutes: number): Promise<UserInvitation>;
  
  createPost(post: InsertPost, userId: string, workspaceId: number): Promise<Post>;
  getPost(id: number, workspaceId: number): Promise<Post | undefined>;
  updatePost(id: number, updates: Partial<Post>, workspaceId: number): Promise<Post | undefined>;
  
  createGeneratedContent(content: InsertGeneratedContent, userId: string, workspaceId: number): Promise<GeneratedContent>;
  getGeneratedContentByPostId(postId: number, userId: string, workspaceId: number): Promise<GeneratedContent | undefined>;
  
  createPublishedPost(publishedPost: InsertPublishedPost, userId: string, workspaceId: number): Promise<PublishedPost>;
  getPublishedPostsByPostId(postId: number, userId: string, workspaceId: number): Promise<PublishedPost[]>;
  
  createTemplate(template: InsertTemplate, userId: string, workspaceId: number): Promise<Template>;
  getTemplatesByUserId(userId: string, workspaceId: number): Promise<Template[]>;
  getTemplateById(id: number, userId: string, workspaceId: number): Promise<Template | undefined>;
  updateTemplate(id: number, updates: Partial<Template>, userId: string, workspaceId: number): Promise<Template | undefined>;
  deleteTemplate(id: number, userId: string, workspaceId: number): Promise<boolean>;
  executeTemplate(id: number, userId: string, workspaceId: number): Promise<Template | undefined>;

  // Payment operations
  createPaymentTransaction(transaction: InsertPaymentTransaction, userId: string, workspaceId: number): Promise<PaymentTransaction>;
  updatePaymentTransaction(transactionId: string, updates: Partial<PaymentTransaction>, userId: string, workspaceId: number): Promise<PaymentTransaction | undefined>;
  getPaymentTransactionsByUserId(userId: string, workspaceId: number): Promise<PaymentTransaction[]>;
  updateUserCredits(userId: string, credits: number): Promise<void>;

  // Folder operations
  createFolder(folder: InsertFolder, workspaceId: number): Promise<Folder>;
  getFoldersByUserId(userId: string, workspaceId: number): Promise<Folder[]>;
  deleteFolder(id: number, userId: string, workspaceId: number): Promise<boolean>;

  // Image operations
  createImage(image: InsertImage, userId: string, workspaceId: number): Promise<Image>;
  getImagesByUserId(userId: string, workspaceId: number): Promise<Image[]>;
  getImagesByFolder(userId: string, folderId: number, organizationId: number, workspaceId: number): Promise<Image[]>;
  updateImage(id: number, updates: Partial<Image>, userId: string, workspaceId: number): Promise<Image | undefined>;
  deleteImage(id: number, userId: string, workspaceId: number): Promise<boolean>;
  getImageById(id: number, userId: string, workspaceId: number): Promise<Image | undefined>;

  // Social Media Configuration operations
  getSocialMediaConfigs(userId: string, workspaceId: number): Promise<SocialMediaConfig[]>;
  upsertSocialMediaConfig(config: InsertSocialMediaConfig, userId: string, workspaceId: number): Promise<SocialMediaConfig>;
  updateSocialMediaConfigTestStatus(userId: string, platformId: string, status: string, workspaceId: number, error?: string): Promise<void>;

  // Subscription operations
  updateUserSubscription(userId: string, plan: string, status: string, expiresAt?: Date): Promise<User>;
  cancelUserSubscription(userId: string): Promise<User>;
  
  // Settings operations
  updateUserProfile(userId: string, profileData: Partial<User>): Promise<User>;
  updateUserNotifications(userId: string, notifications: Partial<User>): Promise<User>;
  updateUserTheme(userId: string, themeData: Partial<User>): Promise<User>;
  updateUserCompany(userId: string, companyData: Partial<User>): Promise<User>;
  updateUserSecurity(userId: string, securityData: Partial<User>): Promise<User>;

  // Post Schedule operations
  createPostSchedule(schedule: InsertPostSchedule, workspaceId: number): Promise<PostSchedule>;
  getPostSchedulesByUserId(userId: string, workspaceId: number): Promise<PostSchedule[]>;
  getPostScheduleById(id: number, userId: string, workspaceId: number): Promise<PostSchedule | undefined>;
  updatePostSchedule(id: number, updates: Partial<PostSchedule>, userId: string, workspaceId: number): Promise<PostSchedule | undefined>;
  deletePostSchedule(id: number, userId: string, workspaceId: number): Promise<boolean>;

  // Schedule Execution operations
  createScheduleExecution(execution: InsertScheduleExecution): Promise<ScheduleExecution>;
  getScheduleExecutionsByScheduleId(scheduleId: number, userId: string): Promise<ScheduleExecution[]>;

  // User data deletion operations
  getPostsByUserId(userId: string, workspaceId: number): Promise<Post[]>;
  deleteUser(userId: string): Promise<boolean>;
  deletePost(id: number, userId: string): Promise<boolean>;
  deletePublishedPostsByPostId(postId: number): Promise<boolean>;
  deleteGeneratedContentByPostId(postId: number): Promise<boolean>;
  deleteScheduleExecutions(scheduleId: number): Promise<boolean>;
  deleteSocialMediaConfigs(userId: string): Promise<boolean>;
  deletePaymentTransactions(userId: string): Promise<boolean>;

  // Email verification operations
  setVerificationToken(userId: string, token: string): Promise<void>;
  verifyEmail(token: string): Promise<User | null>;
  getUserByVerificationToken(token: string): Promise<User | null>;

  // Password reset operations
  setPasswordResetToken(email: string, token: string): Promise<boolean>;
  verifyPasswordResetToken(token: string): Promise<User | null>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;

  // Consent audit logging operations
  logConsentDecision(auditData: InsertConsentAuditLog): Promise<ConsentAuditLog>;

  // Onboarding operations
  saveOnboardingData(userId: string, data: any): Promise<User>;
  completeOnboarding(userId: string, data: any): Promise<User>;

  // Admin operations for pending invitations and user search
  getPendingInvitationsWithoutRoles(organizationId: number): Promise<any[]>;
  searchUsersInOrganization(organizationId: number, query: string): Promise<any[]>;
  assignRoleToInvitedUser(userId: string, workspaceId: number, roleId: number, organizationId: number): Promise<void>;
  assignUserToAllWorkspaces(userId: string, organizationId: number): Promise<void>;
  
  // Admin user deletion operations
  getUserWorkspacesByOrganization(userId: string, organizationId: number): Promise<UserWorkspace[]>;
  deleteScheduleExecutions(scheduleId: number): Promise<void>;
  deletePublishedPosts(postId: number): Promise<void>;
  deleteGeneratedContent(postId: number): Promise<void>;
  anonymizeUserTransactions(userId: string, workspaceId: number): Promise<void>;
  deleteUserWorkspaceRoles(userId: string, organizationId: number): Promise<void>;
  deleteUserWorkspaces(userId: string, organizationId: number): Promise<void>;
  deleteUserOrganization(userId: string, organizationId: number): Promise<void>;
  deleteUserInvitations(userId: string, organizationId: number): Promise<void>;
  deleteUserAccount(userId: string): Promise<void>;
  deleteSocialMediaConfig(id: number, userId: string, workspaceId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserWithContext(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) {
      return undefined;
    }
    
    // If user doesn't have current workspace/organization, try to set one
    if (!user.currentWorkspaceId || !user.currentOrganizationId) {
      // Get user's first available workspace
      const userWorkspaces = await this.getUserWorkspaces(id);
      if (userWorkspaces.length > 0) {
        const firstWorkspace = userWorkspaces[0];
        const workspace = await this.getWorkspace(firstWorkspace.workspaceId);
        if (workspace) {
          await this.updateUserWorkspace(id, workspace.id);
          // Get updated user data
          const [updatedUser] = await db.select().from(users).where(eq(users.id, id));
          return updatedUser || undefined;
        }
      }
    }
    
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createLocalUser(userData: LocalAuth & { userRole?: string; accountStatus?: string; emailVerified?: boolean; onboardingCompleted?: boolean }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const userId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        authProvider: "local",
        lastAuthMethod: "local",
        credits: 100, // Give new users 100 credits to start
        subscriptionStatus: "inactive",
        emailVerified: userData.emailVerified ?? false, // New users start as unverified unless specified
        userRole: userData.userRole || "creator", // Default role
        accountStatus: userData.accountStatus || "active", // Default status
        onboardingCompleted: userData.onboardingCompleted ?? false, // Default to false unless specified
      })
      .returning();
    
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
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

  async updateLastAuthMethod(userId: string, method: string): Promise<void> {
    await db
      .update(users)
      .set({ lastAuthMethod: method, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async findOrCreateUserByEmail(userData: { 
    email: string; 
    firstName?: string; 
    lastName?: string; 
    profileImageUrl?: string; 
    authProvider: string; 
    providerId: string; 
  }): Promise<User> {
    if (!userData.email) {
      throw new Error('Email is required for user authentication');
    }

    // First, try to find existing user by email
    const existingUser = await this.getUserByEmail(userData.email);
    
    if (existingUser) {
      // User exists - update their profile with OAuth info and return
      console.log(`Found existing user for email ${userData.email}, updating auth method to ${userData.authProvider}`);
      
      const updates: Partial<User> = {
        lastAuthMethod: userData.authProvider,
        updatedAt: new Date(),
      };

      // Only update profile data if it's not already set or if OAuth provides better data
      if (!existingUser.firstName && userData.firstName) {
        updates.firstName = userData.firstName;
      }
      if (!existingUser.lastName && userData.lastName) {
        updates.lastName = userData.lastName;
      }
      if (!existingUser.profileImageUrl && userData.profileImageUrl) {
        updates.profileImageUrl = userData.profileImageUrl;
      }
      
      // Update the existing user
      const [updatedUser] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, existingUser.id))
        .returning();
      
      return updatedUser;
    } else {
      // No existing user - create new one
      console.log(`Creating new user for email ${userData.email} with auth provider ${userData.authProvider}`);
      
      const userId = `${userData.authProvider}_${userData.providerId}_${Date.now()}`;
      
      const [newUser] = await db
        .insert(users)
        .values({
          id: userId,
          email: userData.email,
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          profileImageUrl: userData.profileImageUrl || null,
          authProvider: userData.authProvider,
          providerId: userData.providerId,
          lastAuthMethod: userData.authProvider,
          credits: 100, // Give new users 100 credits to start
          subscriptionStatus: "inactive",
          emailVerified: true, // OAuth emails are considered verified
          userRole: "creator", // Default role
          accountStatus: "active", // OAuth users are active by default
          onboardingCompleted: false, // Need to complete onboarding
        })
        .returning();
      
      return newUser;
    }
  }

  async updateUserWorkspace(userId: string, workspaceId: number): Promise<void> {
    // Get the workspace to find its organization
    const workspace = await this.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }
    
    await db.update(users).set({ 
      currentOrganizationId: workspace.organizationId,
      currentWorkspaceId: workspaceId,
      lastWorkspaceId: workspaceId 
    }).where(eq(users.id, userId));
  }

  async updateUserCurrentWorkspace(userId: string, workspaceId: number): Promise<void> {
    // Get the workspace to find its organization
    const workspace = await this.getWorkspace(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }
    
    await db.update(users).set({ 
      currentOrganizationId: workspace.organizationId,
      currentWorkspaceId: workspaceId,
      lastWorkspaceId: workspaceId 
    }).where(eq(users.id, userId));
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Organization operations
  async createOrganization(organizationData: InsertOrganization): Promise<Organization> {
    const [organization] = await db
      .insert(organizations)
      .values(organizationData)
      .returning();
    return organization;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, id));
    return organization || undefined;
  }

  async getOrganizationByUserId(userId: string): Promise<Organization | undefined> {
    const [result] = await db
      .select({ organization: organizations })
      .from(organizations)
      .innerJoin(userOrganizations, eq(organizations.id, userOrganizations.organizationId))
      .where(eq(userOrganizations.userId, userId));
    return result?.organization || undefined;
  }

  async getUserOrganizations(userId: string): Promise<UserOrganization[]> {
    return await db
      .select()
      .from(userOrganizations)
      .where(eq(userOrganizations.userId, userId));
  }

  async getOrganizationMemberCount(organizationId: number): Promise<number> {
    const result = await db
      .select()
      .from(userOrganizations)
      .where(and(
        eq(userOrganizations.organizationId, organizationId),
        eq(userOrganizations.isActive, true)
      ));
    return result.length;
  }

  async createUserOrganization(userOrganizationData: InsertUserOrganization): Promise<UserOrganization> {
    const [userOrganization] = await db
      .insert(userOrganizations)
      .values(userOrganizationData)
      .returning();
    return userOrganization;
  }

  async updateUserOrganization(userId: string, organizationId: number, updates: Partial<UserOrganization>): Promise<UserOrganization | undefined> {
    const [result] = await db
      .update(userOrganizations)
      .set(updates)
      .where(and(
        eq(userOrganizations.userId, userId),
        eq(userOrganizations.organizationId, organizationId)
      ))
      .returning();
    return result;
  }

  async getOrganizationMembers(organizationId: number): Promise<UserOrganization[]> {
    const result = await db
      .select({
        id: userOrganizations.id,
        userId: userOrganizations.userId,
        organizationId: userOrganizations.organizationId,
        role: userOrganizations.role,
        isActive: userOrganizations.isActive,
        joinedAt: userOrganizations.joinedAt,
        lastActiveAt: userOrganizations.lastActiveAt,
        accountStatus: users.accountStatus,
      })
      .from(userOrganizations)
      .innerJoin(users, eq(userOrganizations.userId, users.id))
      .where(and(
        eq(userOrganizations.organizationId, organizationId),
        eq(userOrganizations.isActive, true),
        // Include users with active or approved status
        or(
          eq(users.accountStatus, 'active'),
          eq(users.accountStatus, 'approved')
        )
      ));

    return result;
  }

  async getUsersByOrganizationId(organizationId: number): Promise<User[]> {
    const result = await db
      .select({
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
        updatedAt: users.updatedAt,
      })
      .from(users)
      .innerJoin(userOrganizations, eq(users.id, userOrganizations.userId))
      .where(and(
        eq(userOrganizations.organizationId, organizationId),
        eq(userOrganizations.isActive, true),
        // Include users with active or approved status
        or(
          eq(users.accountStatus, 'active'),
          eq(users.accountStatus, 'approved'),
          eq(users.accountStatus, 'pending_approval')
        )
      ));

    return result as User[];
  }

  async getOrganizationOwners(organizationId: number): Promise<UserOrganization[]> {
    return await db
      .select()
      .from(userOrganizations)
      .where(and(
        eq(userOrganizations.organizationId, organizationId),
        eq(userOrganizations.role, 'owner'),
        eq(userOrganizations.isActive, true)
      ));
  }

  async getUserOrganization(userId: string, organizationId: number): Promise<UserOrganization | undefined> {
    const [result] = await db
      .select()
      .from(userOrganizations)
      .where(and(
        eq(userOrganizations.userId, userId),
        eq(userOrganizations.organizationId, organizationId)
      ));
    return result || undefined;
  }

  async countOrganizationOwners(organizationId: number): Promise<number> {
    const owners = await this.getOrganizationOwners(organizationId);
    return owners.length;
  }

  // Workspace operations
  async createWorkspace(workspace: InsertWorkspace): Promise<Workspace> {
    const [result] = await db
      .insert(workspaces)
      .values(workspace)
      .returning();
    return result;
  }

  async getWorkspace(id: number): Promise<Workspace | undefined> {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id));
    return workspace;
  }

  async getWorkspaceById(id: number): Promise<Workspace | undefined> {
    return this.getWorkspace(id);
  }

  async getWorkspaceMembers(workspaceId: number): Promise<any[]> {
    const result = await db
      .select({
        userId: userWorkspaces.userId,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: userWorkspaces.role,
        joinedAt: userWorkspaces.joinedAt,
        isActive: userWorkspaces.isActive
      })
      .from(userWorkspaces)
      .innerJoin(users, eq(userWorkspaces.userId, users.id))
      .where(and(
        eq(userWorkspaces.workspaceId, workspaceId),
        eq(userWorkspaces.isActive, true)
      ));
    return result;
  }

  async getAllWorkspaceMembers(workspaceId: number): Promise<any[]> {
    const result = await db
      .select({
        userId: userWorkspaces.userId,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: userWorkspaces.role,
        joinedAt: userWorkspaces.joinedAt,
        isActive: userWorkspaces.isActive
      })
      .from(userWorkspaces)
      .innerJoin(users, eq(userWorkspaces.userId, users.id))
      .where(eq(userWorkspaces.workspaceId, workspaceId));
    return result;
  }

  async getUserWorkspaces(userId: string): Promise<UserWorkspace[]> {
    const result = await db
      .select()
      .from(userWorkspaces)
      .where(and(
        eq(userWorkspaces.userId, userId),
        eq(userWorkspaces.isActive, true)
      ));
    return result;
  }

  async getWorkspacesByUserId(userId: string): Promise<Workspace[]> {
    const result = await db
      .select({
        id: workspaces.id,
        organizationId: workspaces.organizationId,
        name: workspaces.name,
        description: workspaces.description,
        uniqueId: workspaces.uniqueId,
        createdAt: workspaces.createdAt,
        updatedAt: workspaces.updatedAt
      })
      .from(workspaces)
      .innerJoin(userWorkspaces, eq(workspaces.id, userWorkspaces.workspaceId))
      .where(and(
        eq(userWorkspaces.userId, userId),
        eq(userWorkspaces.isActive, true)
      ));
    return result;
  }

  async getWorkspacesByOrganizationId(organizationId: number): Promise<Workspace[]> {
    const result = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.organizationId, organizationId))
      .orderBy(desc(workspaces.createdAt));
    return result;
  }

  async getUserWorkspaceByIds(userId: string, workspaceId: number): Promise<UserWorkspace | undefined> {
    const [userWorkspace] = await db
      .select()
      .from(userWorkspaces)
      .where(and(
        eq(userWorkspaces.userId, userId),
        eq(userWorkspaces.workspaceId, workspaceId)
      ));
    return userWorkspace;
  }

  async getUserWorkspaceMembership(userId: string, workspaceId: number): Promise<UserWorkspace | undefined> {
    const [userWorkspace] = await db
      .select()
      .from(userWorkspaces)
      .where(and(
        eq(userWorkspaces.userId, userId),
        eq(userWorkspaces.workspaceId, workspaceId),
        eq(userWorkspaces.isActive, true)
      ));
    return userWorkspace;
  }

  async createUserWorkspace(userWorkspace: InsertUserWorkspace): Promise<UserWorkspace> {
    const [result] = await db
      .insert(userWorkspaces)
      .values(userWorkspace)
      .returning();
    return result;
  }

  async updateUserWorkspaceRole(userId: string, workspaceId: number, role: string): Promise<UserWorkspace | undefined> {
    const [result] = await db
      .update(userWorkspaces)
      .set({ role })
      .where(and(
        eq(userWorkspaces.userId, userId),
        eq(userWorkspaces.workspaceId, workspaceId)
      ))
      .returning();
    return result;
  }

  async getAllWorkspaces(): Promise<Workspace[]> {
    const result = await db
      .select()
      .from(workspaces)
      .orderBy(desc(workspaces.createdAt));
    return result;
  }

  async getWorkspaceByName(name: string): Promise<Workspace | undefined> {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.name, name));
    return workspace;
  }

  async updateWorkspace(id: number, updates: Partial<Workspace>): Promise<Workspace | undefined> {
    const [workspace] = await db
      .update(workspaces)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, id))
      .returning();
    return workspace;
  }

  async deleteWorkspace(id: number): Promise<boolean> {
    // First, find all users who have this workspace as their current workspace
    const usersWithCurrentWorkspace = await db
      .select()
      .from(users)
      .where(eq(users.currentWorkspaceId, id));
    
    // Update these users to have no current workspace (null)
    if (usersWithCurrentWorkspace.length > 0) {
      await db
        .update(users)
        .set({ currentWorkspaceId: null })
        .where(eq(users.currentWorkspaceId, id));
    }
    
    // Delete all user_workspaces entries for this workspace
    await db
      .delete(userWorkspaces)
      .where(eq(userWorkspaces.workspaceId, id));
    
    // Then delete the workspace
    const result = await db
      .delete(workspaces)
      .where(eq(workspaces.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async updateWorkspaceMember(workspaceId: number, userId: string, updates: Partial<UserWorkspace>): Promise<UserWorkspace | undefined> {
    const [result] = await db
      .update(userWorkspaces)
      .set(updates)
      .where(and(
        eq(userWorkspaces.workspaceId, workspaceId),
        eq(userWorkspaces.userId, userId)
      ))
      .returning();
    return result;
  }

  async removeWorkspaceMember(workspaceId: number, userId: string): Promise<boolean> {
    console.log('?? STORAGE DEBUG - removeWorkspaceMember called');
    console.log('?? STORAGE DEBUG - workspaceId:', workspaceId);
    console.log('?? STORAGE DEBUG - userId:', userId);
    
    // First, remove all workspace role assignments for this user in this workspace
    const roleRemovalResult = await db
      .delete(userWorkspaceRoles)
      .where(and(
        eq(userWorkspaceRoles.workspaceId, workspaceId),
        eq(userWorkspaceRoles.userId, userId)
      ));
    console.log('?? STORAGE DEBUG - Role removal result:', roleRemovalResult);
    
    // Then, completely remove the user from the workspace (delete the record)
    const result = await db
      .delete(userWorkspaces)
      .where(and(
        eq(userWorkspaces.workspaceId, workspaceId),
        eq(userWorkspaces.userId, userId)
      ));
    console.log('?? STORAGE DEBUG - Workspace member removal result:', result);
    console.log('?? STORAGE DEBUG - rowCount:', result.rowCount);
    
    return result.rowCount !== null && result.rowCount > 0;
  }

  async addUserToWorkspace(userId: string, workspaceId: number, role: string): Promise<UserWorkspace> {
    const [result] = await db
      .insert(userWorkspaces)
      .values({
        userId,
        workspaceId,
        role,
        isActive: true,
        joinedAt: new Date()
      })
      .returning();
    return result;
  }

  // Workspace invitation operations
  async createWorkspaceInvitation(invitation: InsertWorkspaceInvitation): Promise<WorkspaceInvitation> {
    const [result] = await db
      .insert(workspaceInvitations)
      .values(invitation)
      .returning();
    return result;
  }

  async getWorkspaceInvitationByKey(key: string): Promise<WorkspaceInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.invitationKey, key));
    return invitation;
  }

  async updateWorkspaceInvitation(id: number, updates: Partial<WorkspaceInvitation>): Promise<WorkspaceInvitation | undefined> {
    const [result] = await db
      .update(workspaceInvitations)
      .set(updates)
      .where(eq(workspaceInvitations.id, id))
      .returning();
    return result;
  }

  async getWorkspaceInvitationsByWorkspaceId(workspaceId: number): Promise<WorkspaceInvitation[]> {
    return await db
      .select()
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.workspaceId, workspaceId));
  }

  // Post operations with organization context
  async createPost(insertPost: InsertPost, userId: string, organizationId: number, workspaceId: number): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values({
        ...insertPost,
        userId,
        organizationId,
        workspaceId,
        executionMode: insertPost.executionMode || "review",
        language: insertPost.language || "en",
      })
      .returning();
    return post;
  }

  async getPost(id: number, organizationId: number, workspaceId: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(and(
      eq(posts.id, id),
      eq(posts.organizationId, organizationId),
      eq(posts.workspaceId, workspaceId)
    ));
    return post || undefined;
  }

  async updatePost(id: number, updates: Partial<Post>, organizationId: number, workspaceId: number): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set(updates)
      .where(and(
        eq(posts.id, id),
        eq(posts.organizationId, organizationId),
        eq(posts.workspaceId, workspaceId)
      ))
      .returning();
    return post || undefined;
  }

  // Generated content operations with organization context
  async createGeneratedContent(insertContent: InsertGeneratedContent, organizationId: number, workspaceId: number): Promise<GeneratedContent> {
    const [content] = await db
      .insert(generatedContent)
      .values({
        ...insertContent,
        organizationId,
        workspaceId,
      })
      .returning();
    return content;
  }

  async getGeneratedContentByPostId(postId: number, organizationId: number, workspaceId: number): Promise<GeneratedContent | undefined> {
    const [content] = await db
      .select()
      .from(generatedContent)
      .where(and(
        eq(generatedContent.postId, postId),
        eq(generatedContent.organizationId, organizationId),
        eq(generatedContent.workspaceId, workspaceId)
      ));
    return content || undefined;
  }

  // Published post operations
  async createPublishedPost(insertPublishedPost: InsertPublishedPost, workspaceId: number): Promise<PublishedPost> {
    const [publishedPost] = await db
      .insert(publishedPosts)
      .values({
        ...insertPublishedPost,
        workspaceId,
      })
      .returning();
    return publishedPost;
  }

  // Template operations
  async createTemplate(insertTemplate: InsertTemplate, organizationId: number, workspaceId: number): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values({
        ...insertTemplate,
        organizationId,
        workspaceId,
        isActive: insertTemplate.isActive ?? true,
      })
      .returning();
    return template;
  }

  async getTemplatesByUserId(userId: string, organizationId: number, workspaceId: number): Promise<Template[]> {
    const results = await db
      .select({
        template: templates,
        post: posts,
      })
      .from(templates)
      .leftJoin(posts, eq(templates.postId, posts.id))
      .where(and(
        eq(posts.userId, userId),
        eq(templates.organizationId, organizationId),
        eq(templates.workspaceId, workspaceId)
      ))
      .orderBy(templates.createdAt);
    
    return results.map(result => ({
      ...result.template,
      objective: result.post?.subject || "No objective", // Use post subject as objective
    }));
  }

  async getTemplateById(id: number, userId: string, workspaceId: number): Promise<Template | undefined> {
    const results = await db
      .select({
        template: templates,
      })
      .from(templates)
      .leftJoin(posts, eq(templates.postId, posts.id))
      .where(and(
        eq(templates.id, id), 
        eq(posts.userId, userId),
        eq(templates.workspaceId, workspaceId)
      ));
    
    return results.length > 0 ? results[0].template : undefined;
  }

  async updateTemplate(id: number, updates: Partial<Template>, userId: string, workspaceId: number): Promise<Template | undefined> {
    // Verify template belongs to user
    const template = await this.getTemplateById(id, userId, workspaceId);
    if (!template) return undefined;

    const [updated] = await db.update(templates)
      .set(updates)
      .where(and(
        eq(templates.id, id),
        eq(templates.workspaceId, workspaceId)
      ))
      .returning();
    return updated;
  }

  async deleteTemplate(id: number, userId: string, workspaceId: number): Promise<boolean> {
    // Verify template belongs to user
    const template = await this.getTemplateById(id, userId, workspaceId);
    if (!template) return false;

    try {
      await db.delete(templates)
        .where(and(
          eq(templates.id, id),
          eq(templates.workspaceId, workspaceId)
        ));
      return true;
    } catch (error) {
      console.error("Error deleting template:", error);
      return false;
    }
  }

  async executeTemplate(id: number, userId: string, workspaceId: number): Promise<void> {
    // Verify template belongs to user and update last execution time
    const template = await this.getTemplateById(id, userId, workspaceId);
    if (!template) throw new Error("Template not found");

    await db.update(templates)
      .set({ lastExecutedAt: new Date() })
      .where(and(
        eq(templates.id, id),
        eq(templates.workspaceId, workspaceId)
      ));
  }

  // Payment operations
  async createPaymentTransaction(insertTransaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const [transaction] = await db
      .insert(paymentTransactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async updatePaymentTransaction(transactionId: string, updates: Partial<PaymentTransaction>): Promise<PaymentTransaction | undefined> {
    const [transaction] = await db
      .update(paymentTransactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(paymentTransactions.transactionId, transactionId))
      .returning();
    return transaction;
  }

  async getPaymentTransactionsByUserId(userId: string): Promise<PaymentTransaction[]> {
    return await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.userId, userId))
      .orderBy(paymentTransactions.createdAt);
  }

  async updateUserCredits(userId: string, credits: number): Promise<void> {
    await db
      .update(users)
      .set({ credits })
      .where(eq(users.id, userId));
  }

  // Folder operations
  async createFolder(insertFolder: InsertFolder, organizationId: number, workspaceId: number): Promise<Folder> {
    const [folder] = await db.insert(folders).values({
      ...insertFolder,
      organizationId,
      workspaceId,
    }).returning();
    return folder;
  }

  async getFoldersByUserId(userId: string, organizationId: number, workspaceId: number): Promise<Folder[]> {
    return await db.select().from(folders).where(and(
      eq(folders.userId, userId),
      eq(folders.organizationId, organizationId),
      eq(folders.workspaceId, workspaceId)
    ));
  }

  async deleteFolder(id: number, userId: string, workspaceId: number): Promise<boolean> {
    const result = await db.delete(folders)
      .where(and(
        eq(folders.id, id), 
        eq(folders.userId, userId),
        eq(folders.workspaceId, workspaceId)
      ));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Image operations
  async createImage(insertImage: InsertImage, organizationId: number, workspaceId: number): Promise<Image> {
    const [image] = await db
      .insert(images)
      .values({
        ...insertImage,
        organizationId,
        workspaceId,
      })
      .returning();
    return image;
  }

  async getImagesByUserId(userId: string, organizationId: number, workspaceId: number): Promise<Image[]> {
    return await db
      .select()
      .from(images)
      .where(and(
        eq(images.userId, userId),
        eq(images.organizationId, organizationId),
        eq(images.workspaceId, workspaceId)
      ))
      .orderBy(images.createdAt);
  }

  async getImagesByFolder(userId: string, folderId: number, organizationId: number, workspaceId: number): Promise<Image[]> {
    return await db
      .select()
      .from(images)
      .where(and(
        eq(images.userId, userId), 
        eq(images.folderId, folderId),
        eq(images.organizationId, organizationId),
        eq(images.workspaceId, workspaceId)
      ))
      .orderBy(images.createdAt);
  }

  async updateImage(id: number, updates: Partial<Image>, organizationId: number, workspaceId: number): Promise<Image | undefined> {
    const [image] = await db
      .update(images)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(images.id, id),
        eq(images.organizationId, organizationId),
        eq(images.workspaceId, workspaceId)
      ))
      .returning();
    return image;
  }

  async deleteImage(id: number, userId: string, organizationId: number, workspaceId: number): Promise<boolean> {
    const result = await db
      .delete(images)
      .where(and(
        eq(images.id, id), 
        eq(images.userId, userId),
        eq(images.organizationId, organizationId),
        eq(images.workspaceId, workspaceId)
      ));
    return (result.rowCount || 0) > 0;
  }

  async getImageById(id: number, userId: string, organizationId: number, workspaceId: number): Promise<Image | undefined> {
    const [image] = await db
      .select()
      .from(images)
      .where(and(
        eq(images.id, id), 
        eq(images.userId, userId),
        eq(images.organizationId, organizationId),
        eq(images.workspaceId, workspaceId)
      ));
    return image;
  }

  // Social Media Configuration operations with organization context
  async getSocialMediaConfigs(userId: string, organizationId: number, workspaceId: number): Promise<SocialMediaConfig[]> {
    return await db
      .select()
      .from(socialMediaConfigs)
      .where(and(
        eq(socialMediaConfigs.userId, userId),
        eq(socialMediaConfigs.organizationId, organizationId),
        eq(socialMediaConfigs.workspaceId, workspaceId)
      ))
      .orderBy(socialMediaConfigs.platform);
  }

  async upsertSocialMediaConfig(config: InsertSocialMediaConfig, organizationId: number, workspaceId: number): Promise<SocialMediaConfig> {
    const [existingConfig] = await db
      .select()
      .from(socialMediaConfigs)
      .where(
        and(
          eq(socialMediaConfigs.userId, config.userId),
          eq(socialMediaConfigs.platform, config.platform),
          eq(socialMediaConfigs.organizationId, organizationId),
          eq(socialMediaConfigs.workspaceId, workspaceId)
        )
      );

    if (existingConfig) {
      // Update existing configuration
      const [updatedConfig] = await db
        .update(socialMediaConfigs)
        .set({
          ...config,
          organizationId,
          workspaceId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(socialMediaConfigs.userId, config.userId),
            eq(socialMediaConfigs.platform, config.platform),
            eq(socialMediaConfigs.organizationId, organizationId),
            eq(socialMediaConfigs.workspaceId, workspaceId)
          )
        )
        .returning();
      return updatedConfig;
    } else {
      // Create new configuration
      const [newConfig] = await db
        .insert(socialMediaConfigs)
        .values({
          ...config,
          organizationId,
          workspaceId,
        })
        .returning();
      return newConfig;
    }
  }

  async updateSocialMediaConfigTestStatus(
    userId: string,
    platform: string,
    status: string,
    organizationId: number,
    workspaceId: number,
    error?: string
  ): Promise<void> {
    // First, try to find existing record
    const existingConfig = await db
      .select()
      .from(socialMediaConfigs)
      .where(
        and(
          eq(socialMediaConfigs.userId, userId),
          eq(socialMediaConfigs.platform, platform),
          eq(socialMediaConfigs.organizationId, organizationId),
          eq(socialMediaConfigs.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (existingConfig.length > 0) {
      // Update existing record
      await db
        .update(socialMediaConfigs)
        .set({
          testStatus: status,
          testMessage: error || null,
          lastTestedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(socialMediaConfigs.userId, userId),
            eq(socialMediaConfigs.platform, platform),
            eq(socialMediaConfigs.organizationId, organizationId),
            eq(socialMediaConfigs.workspaceId, workspaceId)
          )
        );
    } else {
      // Create new record
      await db
        .insert(socialMediaConfigs)
        .values({
          userId,
          platform: platform,
          organizationId,
          workspaceId,
          isActive: true,
          apiKey: '',
          testStatus: status,
          testMessage: error || null,
          lastTestedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    }
  }

  // Subscription operations
  async updateUserSubscription(userId: string, plan: string, status: string, expiresAt?: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        subscriptionPlan: plan,
        subscriptionStatus: status,
        subscriptionExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async cancelUserSubscription(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        subscriptionStatus: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Settings operations
  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserNotifications(userId: string, notifications: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...notifications,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserTheme(userId: string, themeData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...themeData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserCompany(userId: string, companyData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...companyData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSecurity(userId: string, securityData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...securityData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createPostSchedule(insertSchedule: InsertPostSchedule, workspaceId: number): Promise<PostSchedule> {
    const [schedule] = await db
      .insert(postSchedules)
      .values({
        ...insertSchedule,
        workspaceId,
      })
      .returning();
    return schedule;
  }

  async getPostSchedulesByUserId(userId: string, workspaceId: number): Promise<PostSchedule[]> {
    return await db
      .select()
      .from(postSchedules)
      .where(and(
        eq(postSchedules.userId, userId),
        eq(postSchedules.workspaceId, workspaceId)
      ))
      .orderBy(desc(postSchedules.createdAt));
  }

  async getPostScheduleById(id: number, userId: string, organizationId: number, workspaceId: number): Promise<PostSchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(postSchedules)
      .where(and(
        eq(postSchedules.id, id), 
        eq(postSchedules.userId, userId),
        eq(postSchedules.workspaceId, workspaceId)
      ));
    return schedule || undefined;
  }

  async updatePostSchedule(id: number, updates: Partial<PostSchedule>, userId: string, organizationId: number, workspaceId: number): Promise<PostSchedule | undefined> {
    const [schedule] = await db
      .update(postSchedules)
      .set(updates)
      .where(and(
        eq(postSchedules.id, id), 
        eq(postSchedules.userId, userId),
        eq(postSchedules.workspaceId, workspaceId)
      ))
      .returning();
    return schedule || undefined;
  }

  async deletePostSchedule(id: number, userId: string, organizationId: number, workspaceId: number): Promise<boolean> {
    const result = await db
      .delete(postSchedules)
      .where(and(
        eq(postSchedules.id, id), 
        eq(postSchedules.userId, userId),
        eq(postSchedules.workspaceId, workspaceId)
      ));
    return (result.rowCount || 0) > 0;
  }

  async createScheduleExecution(insertExecution: InsertScheduleExecution, organizationId: number, workspaceId: number): Promise<ScheduleExecution> {
    const [execution] = await db
      .insert(scheduleExecutions)
      .values({
        ...insertExecution,
        organizationId,
        workspaceId,
      })
      .returning();
    return execution;
  }

  async getScheduleExecutionsByScheduleId(scheduleId: number, userId: string, organizationId: number, workspaceId: number): Promise<ScheduleExecution[]> {
    return await db
      .select()
      .from(scheduleExecutions)
      .where(and(
        eq(scheduleExecutions.scheduleId, scheduleId), 
        eq(scheduleExecutions.workspaceId, workspaceId)
      ))
      .orderBy(desc(scheduleExecutions.executedAt));
  }

  // User data deletion operations
  async getPostsByUserId(userId: string, organizationId: number, workspaceId: number): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(and(
        eq(posts.userId, userId),
        eq(posts.organizationId, organizationId),
        eq(posts.workspaceId, workspaceId)
      ));
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, userId));
    return (result.rowCount || 0) > 0;
  }

  async deletePost(id: number, userId: string, organizationId: number, workspaceId: number): Promise<boolean> {
    const result = await db
      .delete(posts)
      .where(and(
        eq(posts.id, id), 
        eq(posts.userId, userId),
        eq(posts.organizationId, organizationId),
        eq(posts.workspaceId, workspaceId)
      ));
    return (result.rowCount || 0) > 0;
  }

  async deletePublishedPostsByPostId(postId: number, workspaceId: number): Promise<boolean> {
    const result = await db
      .delete(publishedPosts)
      .where(and(
        eq(publishedPosts.postId, postId),
        eq(publishedPosts.workspaceId, workspaceId)
      ));
    return (result.rowCount || 0) > 0;
  }

  async deleteGeneratedContentByPostId(postId: number, workspaceId: number): Promise<boolean> {
    const result = await db
      .delete(generatedContent)
      .where(and(
        eq(generatedContent.postId, postId),
        eq(generatedContent.workspaceId, workspaceId)
      ));
    return (result.rowCount || 0) > 0;
  }

  async deleteScheduleExecutions(scheduleId: number): Promise<boolean> {
    const result = await db
      .delete(scheduleExecutions)
      .where(eq(scheduleExecutions.scheduleId, scheduleId));
    return (result.rowCount || 0) > 0;
  }

  async deleteSocialMediaConfigs(userId: string, organizationId: number, workspaceId: number): Promise<boolean> {
    const result = await db
      .delete(socialMediaConfigs)
      .where(and(
        eq(socialMediaConfigs.userId, userId),
        eq(socialMediaConfigs.organizationId, organizationId),
        eq(socialMediaConfigs.workspaceId, workspaceId)
      ));
    return (result.rowCount || 0) > 0;
  }

  async deletePaymentTransactions(userId: string): Promise<boolean> {
    const result = await db
      .delete(paymentTransactions)
      .where(eq(paymentTransactions.userId, userId));
    return (result.rowCount || 0) > 0;
  }

  // Email verification operations
  async setVerificationToken(userId: string, token: string): Promise<void> {
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    await db
      .update(users)
      .set({ 
        verificationToken: token,
        verificationTokenExpiry: expiryTime
      })
      .where(eq(users.id, userId));
  }

  async verifyEmail(token: string): Promise<User | null> {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.verificationToken, token));
      
      if (!user) return null;
      
      // Check if token is expired
      if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
        return null;
      }
      
      // Update user as verified and clear token
      await db.update(users)
        .set({
          emailVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null
        })
        .where(eq(users.id, user.id));
      
      return { ...user, emailVerified: true };
    } catch (error) {
      console.error('Error verifying email:', error);
      return null;
    }
  }

  async getUserByVerificationToken(token: string): Promise<User | null> {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.verificationToken, token));
      
      return user || null;
    } catch (error) {
      console.error('Error getting user by verification token:', error);
      return null;
    }
  }

  async saveOnboardingData(userId: string, data: any): Promise<User> {
    const updateData: any = {};
    
    if (data.profileType) updateData.profileType = data.profileType;
    if (data.fullName) {
      const nameParts = data.fullName.split(' ');
      updateData.firstName = nameParts[0];
      updateData.lastName = nameParts.slice(1).join(' ');
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

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async completeOnboarding(userId: string, data: any): Promise<User> {
    const updateData: any = {
      onboardingCompleted: true
    };
    
    if (data.profileType) updateData.profileType = data.profileType;
    if (data.fullName) {
      const nameParts = data.fullName.split(' ');
      updateData.firstName = nameParts[0];
      updateData.lastName = nameParts.slice(1).join(' ');
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

    // Create organization and workspace if provided
    if (data.workspaceName) {
      // Create organization first
      const organizationData = {
        name: data.organizationName || "Organization_default",
        description: data.organizationDescription || "Default organization created during onboarding",
        uniqueId: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ownerId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [organization] = await db
        .insert(organizations)
        .values(organizationData)
        .returning();

      // Create user-organization relationship with owner role
      await db
        .insert(userOrganizations)
        .values({
          userId: userId,
          organizationId: organization.id,
          role: 'owner',
          isActive: true,
          joinedAt: new Date(),
          lastActiveAt: new Date()
        });

      // Create workspace under the organization
      const workspaceData = {
        organizationId: organization.id,
        name: data.workspaceName || "Default",
        description: data.workspaceDescription || "Default workspace created during onboarding",
        uniqueId: `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [workspace] = await db
        .insert(workspaces)
        .values(workspaceData)
        .returning();

      // Add user to workspace as administrator
      await db
        .insert(userWorkspaces)
        .values({
          workspaceId: workspace.id,
          userId: userId,
          role: 'administrator',
          isActive: true,
          joinedAt: new Date(),
          lastActiveAt: new Date()
        });

      // Set as current organization and workspace, make user administrator
      updateData.currentOrganizationId = organization.id;
      updateData.currentWorkspaceId = workspace.id;
      updateData.userRole = 'administrator';
      updateData.accountStatus = 'active';
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }
  async setPasswordResetToken(email: string, token: string): Promise<boolean> {
    try {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      
      const result = await db
        .update(users)
        .set({
          passwordResetToken: token,
          passwordResetTokenExpiresAt: expiresAt
        })
        .where(eq(users.email, email))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error setting password reset token:', error);
      return false;
    }
  }
  async verifyPasswordResetToken(token: string): Promise<User | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.passwordResetToken, token),
          gt(users.passwordResetTokenExpiresAt, new Date())
        ));
      
      return user || null;
    } catch (error) {
      console.error('Error verifying password reset token:', error);
      return null;
    }
  }
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const user = await this.verifyPasswordResetToken(token);
      if (!user) {
        return false;
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const result = await db
        .update(users)
        .set({
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetTokenExpiresAt: null
        })
        .where(eq(users.id, user.id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  }

  // Admin invitation operations
  async createUserInvitation(invitation: InsertUserInvitation): Promise<UserInvitation> {
    const [newInvitation] = await db
      .insert(userInvitations)
      .values(invitation)
      .returning();
    return newInvitation;
  }

  async createInvitationWorkspaceRoles(roles: InsertInvitationWorkspaceRole[]): Promise<void> {
    if (roles.length === 0) return;
    await db
      .insert(invitationWorkspaceRoles)
      .values(roles);
  }

  async getInvitationWorkspaceRoles(invitationId: number): Promise<InvitationWorkspaceRole[]> {
    return await db
      .select()
      .from(invitationWorkspaceRoles)
      .where(eq(invitationWorkspaceRoles.invitationId, invitationId));
  }

  // Automatic invitation expiration function
  async expireInvitations(organizationId: number): Promise<number> {
    const now = new Date();
    const result = await db
      .update(userInvitations)
      .set({ status: 'expired' })
      .where(and(
        eq(userInvitations.organizationId, organizationId),
        eq(userInvitations.status, 'pending'),
        lt(userInvitations.expiresAt, now)
      ));
    return result.rowCount || 0;
  }

  async getUserInvitationsByUserId(userId: string, organizationId: number): Promise<UserInvitation[]> {
    // First, expire any invitations that have passed their expiration time
    const expiredCount = await this.expireInvitations(organizationId);
    if (expiredCount > 0) {
      console.log(`? EXPIRED ${expiredCount} invitation(s) automatically`);
    }

    const invitations = await db
      .select()
      .from(userInvitations)
      .where(and(
        eq(userInvitations.invitedByUserId, userId),
        eq(userInvitations.organizationId, organizationId)
      ))
      .orderBy(desc(userInvitations.invitedAt));
    return invitations;
  }

  async getUserInvitationsByEmail(email: string, organizationId: number): Promise<UserInvitation[]> {
    const invitations = await db
      .select()
      .from(userInvitations)
      .where(and(
        eq(userInvitations.email, email),
        eq(userInvitations.organizationId, organizationId)
      ))
      .orderBy(desc(userInvitations.invitedAt));
    return invitations;
  }

  async getUserInvitationByKey(key: string): Promise<UserInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(userInvitations)
      .where(eq(userInvitations.invitationKey, key))
      .limit(1);
    return invitation || undefined;
  }

  async updateUserInvitation(id: number, updates: Partial<UserInvitation>): Promise<UserInvitation | undefined> {
    const [updated] = await db
      .update(userInvitations)
      .set(updates)
      .where(eq(userInvitations.id, id))
      .returning();
    return updated || undefined;
  }

  async getInvitationByEmail(email: string, organizationId: number): Promise<UserInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(userInvitations)
      .where(and(
        eq(userInvitations.email, email),
        eq(userInvitations.organizationId, organizationId)
      ))
      .orderBy(desc(userInvitations.invitedAt))
      .limit(1);
    return invitation || undefined;
  }

  async getPendingApprovalsForAdmin(adminId: string, organizationId: number): Promise<UserInvitation[]> {
    // Look for invitations that are either "pending" (awaiting password) or "password_set" (password set, awaiting approval)
    return await db
      .select()
      .from(userInvitations)
      .where(and(
        or(
          eq(userInvitations.status, "pending"),
          eq(userInvitations.status, "password_set")
        ),
        eq(userInvitations.organizationId, organizationId)
      ))
      .orderBy(desc(userInvitations.invitedAt));
  }

  async approveUserInvitation(id: number, approvedByUserId: string): Promise<UserInvitation | undefined> {
    const [approved] = await db
      .update(userInvitations)
      .set({
        status: "approved",
        approvedAt: new Date(),
        approvedByUserId,
      })
      .where(eq(userInvitations.id, id))
      .returning();
    return approved || undefined;
  }

  async getInvitationById(invitationId: number, organizationId: number): Promise<UserInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(userInvitations)
      .where(and(
        eq(userInvitations.id, invitationId),
        eq(userInvitations.organizationId, organizationId)
      ))
      .limit(1);
    return invitation || undefined;
  }



  async assignUserToAllWorkspaces(userId: string, organizationId: number): Promise<void> {
    // First, ensure user is in the organization
    await db
      .insert(userOrganizations)
      .values({
        userId,
        organizationId,
        role: 'member',
        isActive: true,
        joinedAt: new Date(),
        lastActiveAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userOrganizations.userId, userOrganizations.organizationId],
        set: {
          isActive: true,
          lastActiveAt: new Date(),
        },
      });

    // Get all workspaces in the organization
    const workspaces = await this.getWorkspacesByOrganizationId(organizationId);
    
    // Assign user to each workspace and activate them if they already exist
    for (const workspace of workspaces) {
      await db
        .insert(userWorkspaces)
        .values({
          userId,
          workspaceId: workspace.id,
          joinedAt: new Date(),
          isActive: true,
        })
        .onConflictDoUpdate({
          target: [userWorkspaces.userId, userWorkspaces.workspaceId],
          set: {
            isActive: true,
          },
        });
    }
  }

  async updateUserRoleAndStatus(userId: string, role: string, status: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({
        userRole: role,
        accountStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updated || undefined;
  }

  async getInvitationById(invitationId: number, organizationId: number): Promise<UserInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(userInvitations)
      .where(and(
        eq(userInvitations.id, invitationId),
        eq(userInvitations.organizationId, organizationId)
      ))
      .limit(1);
    return invitation || undefined;
  }

  async resendInvitation(invitationId: number, organizationId: number, newExpiresAt: Date, expirationMinutes: number): Promise<UserInvitation> {
    console.log(`?? RESEND INVITATION DEBUG - Starting resend for invitation ID: ${invitationId}, org: ${organizationId}`);
    
    // First, get the original invitation to copy its details
    const originalInvitation = await this.getInvitationById(invitationId, organizationId);
    if (!originalInvitation) {
      throw new Error("Original invitation not found");
    }
    console.log(`?? RESEND INVITATION DEBUG - Original invitation found: ${originalInvitation.email}`);

    // Create a completely new invitation based on the original
    const newInvitationKey = crypto.randomUUID();
    
    const [newInvitation] = await db
      .insert(userInvitations)
      .values({
        organizationId: originalInvitation.organizationId,
        email: originalInvitation.email,
        invitedByUserId: originalInvitation.invitedByUserId,
        invitationKey: newInvitationKey,
        status: 'pending',
        invitedAt: new Date(),
        expiresAt: newExpiresAt,
        expirationMinutes: expirationMinutes
      })
      .returning();

    console.log(`?? RESEND INVITATION DEBUG - New invitation created with ID: ${newInvitation.id}`);

    // Copy workspace role assignments from the original invitation
    const originalWorkspaceRoles = await this.getInvitationWorkspaceRoles(invitationId);
    console.log(`?? RESEND INVITATION DEBUG - Found ${originalWorkspaceRoles.length} original workspace roles:`, originalWorkspaceRoles);
    
    if (originalWorkspaceRoles.length > 0) {
      const roleAssignments = originalWorkspaceRoles.map(role => ({
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

  async cancelInvitation(invitationId: number, organizationId: number, canceledByUserId: string): Promise<UserInvitation | undefined> {
    console.log(`?? CANCEL INVITATION DEBUG - Starting cancel for invitation ID: ${invitationId}, org: ${organizationId}`);
    
    const [canceled] = await db
      .update(userInvitations)
      .set({
        status: "canceled",
        canceledAt: new Date(),
        canceledByUserId,
      })
      .where(and(
        eq(userInvitations.id, invitationId),
        eq(userInvitations.organizationId, organizationId)
      ))
      .returning();
    
    if (canceled) {
      console.log(`?? CANCEL INVITATION DEBUG - Invitation canceled successfully: ${canceled.email}`);
    } else {
      console.log(`?? CANCEL INVITATION DEBUG - Invitation not found or could not be canceled`);
    }
    
    return canceled || undefined;
  }

  // Workspace role operations
  async getWorkspaceRoles(): Promise<WorkspaceRole[]> {
    return await db.select().from(workspaceRoles).orderBy(workspaceRoles.name);
  }

  async getWorkspaceRoleByName(name: string): Promise<WorkspaceRole | undefined> {
    const [role] = await db.select().from(workspaceRoles).where(eq(workspaceRoles.name, name));
    return role;
  }

  async createWorkspaceRole(role: InsertWorkspaceRole): Promise<WorkspaceRole> {
    const [newRole] = await db.insert(workspaceRoles).values(role).returning();
    return newRole;
  }

  async updateWorkspaceRole(id: number, updates: Partial<WorkspaceRole>): Promise<WorkspaceRole | undefined> {
    const [updated] = await db
      .update(workspaceRoles)
      .set(updates)
      .where(eq(workspaceRoles.id, id))
      .returning();
    return updated;
  }

  async deleteWorkspaceRole(id: number): Promise<boolean> {
    const result = await db.delete(workspaceRoles).where(eq(workspaceRoles.id, id));
    return (result.rowCount || 0) > 0;
  }

  // User workspace role operations
  async getUserWorkspaceRoles(userId: string, workspaceIdOrOrganizationId: number): Promise<UserWorkspaceRole[]> {
    // Check if the second parameter is being used as workspaceId (backward compatibility)
    // or organizationId (new functionality)
    
    // If workspaceId is provided directly, use the original logic
    const workspace = await db.select().from(workspaces).where(eq(workspaces.id, workspaceIdOrOrganizationId)).limit(1);
    
    if (workspace.length > 0) {
      // This is a workspaceId, use original logic
      return await db
        .select({
          id: userWorkspaceRoles.id,
          userId: userWorkspaceRoles.userId,
          workspaceId: userWorkspaceRoles.workspaceId,
          roleId: userWorkspaceRoles.roleId,
          role: workspaceRoles.name,
          assignedAt: userWorkspaceRoles.assignedAt,
          assignedByUserId: userWorkspaceRoles.assignedByUserId,
          isActive: sql<boolean>`true`.as('isActive')
        })
        .from(userWorkspaceRoles)
        .innerJoin(workspaces, eq(userWorkspaceRoles.workspaceId, workspaces.id))
        .innerJoin(workspaceRoles, eq(userWorkspaceRoles.roleId, workspaceRoles.id))        
        .where(and(
          eq(userWorkspaceRoles.userId, userId),
          eq(userWorkspaceRoles.workspaceId, workspaceIdOrOrganizationId)
        ))
        .orderBy(userWorkspaceRoles.assignedAt);
    } else {
      // This is an organizationId, get all roles for user across organization
      return await db
        .select({
          id: userWorkspaceRoles.id,
          userId: userWorkspaceRoles.userId,
          workspaceId: userWorkspaceRoles.workspaceId,
          roleId: userWorkspaceRoles.roleId,
          role: workspaceRoles.name,
          assignedAt: userWorkspaceRoles.assignedAt,
          assignedByUserId: userWorkspaceRoles.assignedByUserId,
          isActive: sql<boolean>`true`.as('isActive')
        })
        .from(userWorkspaceRoles)
        .innerJoin(workspaces, eq(userWorkspaceRoles.workspaceId, workspaces.id))
        .innerJoin(workspaceRoles, eq(userWorkspaceRoles.roleId, workspaceRoles.id))
        .where(and(
          eq(userWorkspaceRoles.userId, userId),
          eq(workspaces.organizationId, workspaceIdOrOrganizationId)
        ))
        .orderBy(userWorkspaceRoles.assignedAt);
    }
  }

  async getUserWorkspaceRolesByWorkspace(workspaceId: number): Promise<UserWorkspaceRole[]> {
    return await db
      .select()
      .from(userWorkspaceRoles)
      .where(eq(userWorkspaceRoles.workspaceId, workspaceId))
      .orderBy(userWorkspaceRoles.assignedAt);
  }

  async getAllUserWorkspaceRolesForOrganization(organizationId: number): Promise<any[]> {
    return await db
      .select({
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
          permissions: workspaceRoles.permissions,
        },
        // Include workspace details
        workspace: {
          id: workspaces.id,
          name: workspaces.name,
          description: workspaces.description,
        }
      })
      .from(userWorkspaceRoles)
      .innerJoin(workspaceRoles, eq(userWorkspaceRoles.roleId, workspaceRoles.id))
      .innerJoin(workspaces, eq(userWorkspaceRoles.workspaceId, workspaces.id))
      .where(eq(workspaces.organizationId, organizationId))
      .orderBy(userWorkspaceRoles.userId, userWorkspaceRoles.assignedAt);
  }

  async assignUserWorkspaceRole(assignment: InsertUserWorkspaceRole): Promise<UserWorkspaceRole> {
    const [newAssignment] = await db
      .insert(userWorkspaceRoles)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async removeUserWorkspaceRole(userId: string, workspaceId: number, roleId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(userWorkspaceRoles)
        .where(and(
          eq(userWorkspaceRoles.userId, userId),
          eq(userWorkspaceRoles.workspaceId, workspaceId),
          eq(userWorkspaceRoles.roleId, roleId)
        ));
      
      console.log('??? Delete result:', result);
      
      // Check if the record was actually deleted by querying for it
      const remainingRoles = await db
        .select()
        .from(userWorkspaceRoles)
        .where(and(
          eq(userWorkspaceRoles.userId, userId),
          eq(userWorkspaceRoles.workspaceId, workspaceId),
          eq(userWorkspaceRoles.roleId, roleId)
        ));
      
      const wasDeleted = remainingRoles.length === 0;
      console.log('??? Was actually deleted:', wasDeleted);
      
      return wasDeleted;
    } catch (error) {
      console.error('??? Error in removeUserWorkspaceRole:', error);
      return false;
    }
  }

  async removeAllUserWorkspaceRoles(userId: string, workspaceId: number): Promise<boolean> {
    const result = await db
      .delete(userWorkspaceRoles)
      .where(and(
        eq(userWorkspaceRoles.userId, userId),
        eq(userWorkspaceRoles.workspaceId, workspaceId)
      ));
    return (result.rowCount || 0) > 0;
  }

  async getUserWorkspacePermissions(userId: string, workspaceId: number): Promise<string[]> {
    const userRoles = await db
      .select({
        permissions: workspaceRoles.permissions
      })
      .from(userWorkspaceRoles)
      .innerJoin(workspaceRoles, eq(userWorkspaceRoles.roleId, workspaceRoles.id))
      .where(and(
        eq(userWorkspaceRoles.userId, userId),
        eq(userWorkspaceRoles.workspaceId, workspaceId)
      ));

    // Combine all permissions from all roles
    const allPermissions = userRoles.reduce((acc, role) => {
      if (role.permissions) {
        acc.push(...role.permissions);
      }
      return acc;
    }, [] as string[]);

    // Return unique permissions
    return [...new Set(allPermissions)];
  }

  async hasWorkspacePermission(userId: string, workspaceId: number, permission: string): Promise<boolean> {
    const userPermissions = await this.getUserWorkspacePermissions(userId, workspaceId);
    return userPermissions.includes(permission);
  }

  // Admin operations for pending invitations and user search
  async getPendingInvitationsWithoutRoles(organizationId: number): Promise<any[]> {
    // Get users who have been invited but don't have workspace roles assigned yet
    // Exclude users with 'approved' or 'active' status since they should appear in organization members
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

  async searchUsersInOrganization(organizationId: number, query: string): Promise<any[]> {
    console.log('?? Starting search with query:', query, 'orgId:', organizationId);
    
    // Search users in the organization by name or email - using Drizzle ORM instead of raw SQL
    const searchPattern = `%${query.toLowerCase()}%`;
    
    try {
      const result = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          accountStatus: users.accountStatus,
          joinedAt: users.createdAt,
          lastActiveAt: userOrganizations.lastActiveAt
        })
        .from(users)
        .innerJoin(userOrganizations, eq(users.id, userOrganizations.userId))
        .where(and(
          eq(userOrganizations.organizationId, organizationId),
          or(
            sql`LOWER(${users.email}) LIKE ${searchPattern}`,
            sql`LOWER(${users.firstName}) LIKE ${searchPattern}`,
            sql`LOWER(${users.lastName}) LIKE ${searchPattern}`
          )
        ))
        .limit(10);

      console.log('?? Base search returned:', result.length, 'users');

      // For each user, get their workspace assignments using the new role system
      const usersWithAssignments = [];
      
      for (const user of result) {
        // Get workspace assignments for this user from the proper role system
        const workspaceAssignments = await db
          .select({
            workspaceId: workspaces.id,
            workspaceName: workspaces.name,
            roleName: workspaceRoles.name,
            assignedAt: userWorkspaceRoles.assignedAt
          })
          .from(userWorkspaceRoles)
          .innerJoin(workspaces, eq(userWorkspaceRoles.workspaceId, workspaces.id))
          .innerJoin(workspaceRoles, eq(userWorkspaceRoles.roleId, workspaceRoles.id))
          .where(and(
            eq(userWorkspaceRoles.userId, user.id),
            eq(workspaces.organizationId, organizationId)
          ))
          .orderBy(workspaces.name);

        usersWithAssignments.push({
          ...user,
          workspaceAssignments
        });
      }

      console.log('?? Final results with assignments:', usersWithAssignments.length);
      return usersWithAssignments;
    } catch (error) {
      console.error('Error in searchUsersInOrganization:', error);
      return [];
    }
  }

  async assignRoleToInvitedUser(userId: string, workspaceId: number, roleId: number, organizationId: number): Promise<void> {
    // Add user to workspace if not already there
    await db
      .insert(userWorkspaces)
      .values({
        userId,
        workspaceId,
        joinedAt: new Date(),
        isActive: true,
      })
      .onConflictDoNothing();

    // Assign workspace role
    await db
      .insert(userWorkspaceRoles)
      .values({
        userId,
        workspaceId,
        roleId,
        assignedAt: new Date(),
        isActive: true,
      })
      .onConflictDoNothing();

    // Update user status to active
    await db
      .update(users)
      .set({
        accountStatus: 'active',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
  // Consent audit logging implementation
  async logConsentDecision(auditData: InsertConsentAuditLog): Promise<ConsentAuditLog> {
    try {
      const [result] = await db.insert(consentAuditLog)
        .values(auditData)
        .returning();
      return result;
    } catch (error) {
      console.error("Error logging consent decision:", error);
      throw error;
    }
  }

  // Admin user deletion methods
  async getUserWorkspacesByOrganization(userId: string, organizationId: number): Promise<UserWorkspace[]> {
    const result = await db
      .select()
      .from(userWorkspaces)
      .innerJoin(workspaces, eq(userWorkspaces.workspaceId, workspaces.id))
      .where(and(
        eq(userWorkspaces.userId, userId),
        eq(workspaces.organizationId, organizationId)
      ));
    
    return result.map(r => r.user_workspaces);
  }

  async deleteScheduleExecutions(scheduleId: number): Promise<void> {
    await db.delete(scheduleExecutions).where(eq(scheduleExecutions.scheduleId, scheduleId));
  }

  async deletePublishedPosts(postId: number): Promise<void> {
    await db.delete(publishedPosts).where(eq(publishedPosts.postId, postId));
  }

  async deleteGeneratedContent(postId: number): Promise<void> {
    await db.delete(generatedContent).where(eq(generatedContent.postId, postId));
  }

  async anonymizeUserTransactions(userId: string, workspaceId: number): Promise<void> {
    await db
      .update(paymentTransactions)
      .set({
        userId: 'deleted_user',
        billingAddress: null,
        cardLast4: '****',
        updatedAt: new Date()
      })
      .where(and(
        eq(paymentTransactions.userId, userId),
        eq(paymentTransactions.workspaceId, workspaceId)
      ));
  }

  async deleteUserWorkspaceRoles(userId: string, organizationId: number): Promise<void> {
    // Get workspaces in this organization
    const orgWorkspaces = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.organizationId, organizationId));
    
    if (orgWorkspaces.length > 0) {
      const workspaceIds = orgWorkspaces.map(w => w.id);
      await db
        .delete(userWorkspaceRoles)
        .where(and(
          eq(userWorkspaceRoles.userId, userId),
          sql`${userWorkspaceRoles.workspaceId} = ANY(${workspaceIds})`
        ));
    }
  }

  async deleteUserWorkspaces(userId: string, organizationId: number): Promise<void> {
    // Get workspaces in this organization
    const orgWorkspaces = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.organizationId, organizationId));
    
    if (orgWorkspaces.length > 0) {
      const workspaceIds = orgWorkspaces.map(w => w.id);
      await db
        .delete(userWorkspaces)
        .where(and(
          eq(userWorkspaces.userId, userId),
          sql`${userWorkspaces.workspaceId} = ANY(${workspaceIds})`
        ));
    }
  }

  async deleteUserOrganization(userId: string, organizationId: number): Promise<void> {
    await db
      .delete(userOrganizations)
      .where(and(
        eq(userOrganizations.userId, userId),
        eq(userOrganizations.organizationId, organizationId)
      ));
  }

  async deleteUserInvitations(userId: string, organizationId: number): Promise<void> {
    await db
      .delete(userInvitations)
      .where(and(
        eq(userInvitations.userId, userId),
        eq(userInvitations.organizationId, organizationId)
      ));
  }

  async deleteUserAccount(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async deleteSocialMediaConfig(id: number, userId: string, workspaceId: number): Promise<boolean> {
    const result = await db
      .delete(socialMediaConfigs)
      .where(and(
        eq(socialMediaConfigs.id, id),
        eq(socialMediaConfigs.userId, userId),
        eq(socialMediaConfigs.workspaceId, workspaceId)
      ));
    return true;
  }
}


export const storage = new DatabaseStorage();