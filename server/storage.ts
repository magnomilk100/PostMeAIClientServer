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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createLocalUser(user: LocalAuth): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;
  updateLastAuthMethod(userId: string, method: string): Promise<void>;
  
  createPost(post: InsertPost, userId: string): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined>;
  
  createGeneratedContent(content: InsertGeneratedContent): Promise<GeneratedContent>;
  getGeneratedContentByPostId(postId: number): Promise<GeneratedContent | undefined>;
  
  createPublishedPost(publishedPost: InsertPublishedPost): Promise<PublishedPost>;
  
  createTemplate(template: InsertTemplate): Promise<Template>;
  getTemplatesByUserId(userId: string): Promise<Template[]>;
  getTemplateById(id: number, userId: string): Promise<Template | undefined>;
  updateTemplate(id: number, updates: Partial<Template>, userId: string): Promise<Template | undefined>;
  deleteTemplate(id: number, userId: string): Promise<boolean>;
  executeTemplate(id: number, userId: string): Promise<void>;

  // Payment operations
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  updatePaymentTransaction(transactionId: string, updates: Partial<PaymentTransaction>): Promise<PaymentTransaction | undefined>;
  getPaymentTransactionsByUserId(userId: string): Promise<PaymentTransaction[]>;
  updateUserCredits(userId: string, credits: number): Promise<void>;

  // Folder operations
  createFolder(folder: InsertFolder): Promise<Folder>;
  getFoldersByUserId(userId: string): Promise<Folder[]>;
  deleteFolder(id: number, userId: string): Promise<boolean>;

  // Image operations
  createImage(image: InsertImage): Promise<Image>;
  getImagesByUserId(userId: string): Promise<Image[]>;
  getImagesByFolder(userId: string, folder: string): Promise<Image[]>;
  updateImage(id: number, updates: Partial<Image>): Promise<Image | undefined>;
  deleteImage(id: number, userId: string): Promise<boolean>;
  getImageById(id: number, userId: string): Promise<Image | undefined>;

  // Social Media Configuration operations
  getSocialMediaConfigs(userId: string): Promise<SocialMediaConfig[]>;
  upsertSocialMediaConfig(config: InsertSocialMediaConfig): Promise<SocialMediaConfig>;
  updateSocialMediaConfigTestStatus(userId: string, platformId: string, status: string, error?: string): Promise<void>;

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
  createPostSchedule(schedule: InsertPostSchedule): Promise<PostSchedule>;
  getPostSchedulesByUserId(userId: string): Promise<PostSchedule[]>;
  getPostScheduleById(id: number, userId: string): Promise<PostSchedule | undefined>;
  updatePostSchedule(id: number, updates: Partial<PostSchedule>, userId: string): Promise<PostSchedule | undefined>;
  deletePostSchedule(id: number, userId: string): Promise<boolean>;

  // Schedule Execution operations
  createScheduleExecution(execution: InsertScheduleExecution): Promise<ScheduleExecution>;
  getScheduleExecutionsByScheduleId(scheduleId: number, userId: string): Promise<ScheduleExecution[]>;

  // User data deletion operations
  getPostsByUserId(userId: string): Promise<Post[]>;
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

  // Onboarding operations
  saveOnboardingData(userId: string, data: any): Promise<User>;
  completeOnboarding(userId: string, data: any): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
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

  async createLocalUser(userData: LocalAuth): Promise<User> {
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
        emailVerified: false, // New users start as unverified
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

  // Post operations
  async createPost(insertPost: InsertPost, userId: string): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values({
        ...insertPost,
        userId,
        link: insertPost.link || null,
        executionMode: insertPost.executionMode || "review",
        maxTextSize: insertPost.maxTextSize || 150,
        language: insertPost.language || "en",
        generateImage: insertPost.generateImage ?? true,
      })
      .returning();
    return post;
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set(updates)
      .where(eq(posts.id, id))
      .returning();
    return post || undefined;
  }

  // Generated content operations
  async createGeneratedContent(insertContent: InsertGeneratedContent): Promise<GeneratedContent> {
    const [content] = await db
      .insert(generatedContent)
      .values({
        ...insertContent,
        imageUrl: insertContent.imageUrl || null,
        platformContent: insertContent.platformContent || null,
      })
      .returning();
    return content;
  }

  async getGeneratedContentByPostId(postId: number): Promise<GeneratedContent | undefined> {
    const [content] = await db
      .select()
      .from(generatedContent)
      .where(eq(generatedContent.postId, postId));
    return content || undefined;
  }

  // Published post operations
  async createPublishedPost(insertPublishedPost: InsertPublishedPost): Promise<PublishedPost> {
    const [publishedPost] = await db
      .insert(publishedPosts)
      .values(insertPublishedPost)
      .returning();
    return publishedPost;
  }

  // Template operations
  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values({
        ...insertTemplate,
        isActive: insertTemplate.isActive ?? true,
      })
      .returning();
    return template;
  }

  async getTemplatesByUserId(userId: string): Promise<Template[]> {
    const results = await db
      .select({
        template: templates,
        post: posts,
      })
      .from(templates)
      .leftJoin(posts, eq(templates.postId, posts.id))
      .where(eq(posts.userId, userId))
      .orderBy(templates.createdAt);
    
    return results.map(result => ({
      ...result.template,
      objective: result.post?.subject || "No objective", // Use post subject as objective
    }));
  }

  async getTemplateById(id: number, userId: string): Promise<Template | undefined> {
    const results = await db
      .select({
        template: templates,
      })
      .from(templates)
      .leftJoin(posts, eq(templates.postId, posts.id))
      .where(and(eq(templates.id, id), eq(posts.userId, userId)));
    
    return results.length > 0 ? results[0].template : undefined;
  }

  async updateTemplate(id: number, updates: Partial<Template>, userId: string): Promise<Template | undefined> {
    // Verify template belongs to user
    const template = await this.getTemplateById(id, userId);
    if (!template) return undefined;

    const [updated] = await db.update(templates)
      .set(updates)
      .where(eq(templates.id, id))
      .returning();
    return updated;
  }

  async deleteTemplate(id: number, userId: string): Promise<boolean> {
    // Verify template belongs to user
    const template = await this.getTemplateById(id, userId);
    if (!template) return false;

    try {
      await db.delete(templates)
        .where(eq(templates.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting template:", error);
      return false;
    }
  }

  async executeTemplate(id: number, userId: string): Promise<void> {
    // Verify template belongs to user and update last execution time
    const template = await this.getTemplateById(id, userId);
    if (!template) throw new Error("Template not found");

    await db.update(templates)
      .set({ lastExecutedAt: new Date() })
      .where(eq(templates.id, id));
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
  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const [folder] = await db.insert(folders).values(insertFolder).returning();
    return folder;
  }

  async getFoldersByUserId(userId: string): Promise<Folder[]> {
    return await db.select().from(folders).where(eq(folders.userId, userId));
  }

  async deleteFolder(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(folders)
      .where(and(eq(folders.id, id), eq(folders.userId, userId)));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Image operations
  async createImage(insertImage: InsertImage): Promise<Image> {
    const [image] = await db
      .insert(images)
      .values(insertImage)
      .returning();
    return image;
  }

  async getImagesByUserId(userId: string): Promise<Image[]> {
    return await db
      .select()
      .from(images)
      .where(eq(images.userId, userId))
      .orderBy(images.createdAt);
  }

  async getImagesByFolder(userId: string, folder: string): Promise<Image[]> {
    return await db
      .select()
      .from(images)
      .where(and(eq(images.userId, userId), eq(images.folder, folder)))
      .orderBy(images.createdAt);
  }

  async updateImage(id: number, updates: Partial<Image>): Promise<Image | undefined> {
    const [image] = await db
      .update(images)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(images.id, id))
      .returning();
    return image;
  }

  async deleteImage(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(images)
      .where(and(eq(images.id, id), eq(images.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async getImageById(id: number, userId: string): Promise<Image | undefined> {
    const [image] = await db
      .select()
      .from(images)
      .where(and(eq(images.id, id), eq(images.userId, userId)));
    return image;
  }

  // Social Media Configuration operations
  async getSocialMediaConfigs(userId: string): Promise<SocialMediaConfig[]> {
    return await db
      .select()
      .from(socialMediaConfigs)
      .where(eq(socialMediaConfigs.userId, userId))
      .orderBy(socialMediaConfigs.platformId);
  }

  async upsertSocialMediaConfig(config: InsertSocialMediaConfig): Promise<SocialMediaConfig> {
    const [existingConfig] = await db
      .select()
      .from(socialMediaConfigs)
      .where(
        and(
          eq(socialMediaConfigs.userId, config.userId),
          eq(socialMediaConfigs.platformId, config.platformId)
        )
      );

    if (existingConfig) {
      // Update existing configuration
      const [updatedConfig] = await db
        .update(socialMediaConfigs)
        .set({
          ...config,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(socialMediaConfigs.userId, config.userId),
            eq(socialMediaConfigs.platformId, config.platformId)
          )
        )
        .returning();
      return updatedConfig;
    } else {
      // Create new configuration
      const [newConfig] = await db
        .insert(socialMediaConfigs)
        .values(config)
        .returning();
      return newConfig;
    }
  }

  async updateSocialMediaConfigTestStatus(
    userId: string,
    platformId: string,
    status: string,
    error?: string
  ): Promise<void> {
    // First, try to find existing record
    const existingConfig = await db
      .select()
      .from(socialMediaConfigs)
      .where(
        and(
          eq(socialMediaConfigs.userId, userId),
          eq(socialMediaConfigs.platformId, platformId)
        )
      )
      .limit(1);

    if (existingConfig.length > 0) {
      // Update existing record
      await db
        .update(socialMediaConfigs)
        .set({
          testStatus: status,
          testError: error || null,
          lastTestedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(socialMediaConfigs.userId, userId),
            eq(socialMediaConfigs.platformId, platformId)
          )
        );
    } else {
      // Create new record
      await db
        .insert(socialMediaConfigs)
        .values({
          userId,
          platformId,
          isEnabled: true, // Default to enabled when testing
          apiKey: '',
          testStatus: status,
          testError: error || null,
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

  async createPostSchedule(insertSchedule: InsertPostSchedule): Promise<PostSchedule> {
    const [schedule] = await db
      .insert(postSchedules)
      .values(insertSchedule)
      .returning();
    return schedule;
  }

  async getPostSchedulesByUserId(userId: string): Promise<PostSchedule[]> {
    return await db
      .select()
      .from(postSchedules)
      .where(eq(postSchedules.userId, userId))
      .orderBy(desc(postSchedules.createdAt));
  }

  async getPostScheduleById(id: number, userId: string): Promise<PostSchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(postSchedules)
      .where(and(eq(postSchedules.id, id), eq(postSchedules.userId, userId)));
    return schedule || undefined;
  }

  async updatePostSchedule(id: number, updates: Partial<PostSchedule>, userId: string): Promise<PostSchedule | undefined> {
    const [schedule] = await db
      .update(postSchedules)
      .set(updates)
      .where(and(eq(postSchedules.id, id), eq(postSchedules.userId, userId)))
      .returning();
    return schedule || undefined;
  }

  async deletePostSchedule(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(postSchedules)
      .where(and(eq(postSchedules.id, id), eq(postSchedules.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async createScheduleExecution(insertExecution: InsertScheduleExecution): Promise<ScheduleExecution> {
    const [execution] = await db
      .insert(scheduleExecutions)
      .values(insertExecution)
      .returning();
    return execution;
  }

  async getScheduleExecutionsByScheduleId(scheduleId: number, userId: string): Promise<ScheduleExecution[]> {
    return await db
      .select()
      .from(scheduleExecutions)
      .where(and(eq(scheduleExecutions.scheduleId, scheduleId), eq(scheduleExecutions.userId, userId)))
      .orderBy(desc(scheduleExecutions.executedAt));
  }

  // User data deletion operations
  async getPostsByUserId(userId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId));
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, userId));
    return (result.rowCount || 0) > 0;
  }

  async deletePost(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(posts)
      .where(and(eq(posts.id, id), eq(posts.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async deletePublishedPostsByPostId(postId: number): Promise<boolean> {
    const result = await db
      .delete(publishedPosts)
      .where(eq(publishedPosts.postId, postId));
    return (result.rowCount || 0) > 0;
  }

  async deleteGeneratedContentByPostId(postId: number): Promise<boolean> {
    const result = await db
      .delete(generatedContent)
      .where(eq(generatedContent.postId, postId));
    return (result.rowCount || 0) > 0;
  }

  async deleteScheduleExecutions(scheduleId: number): Promise<boolean> {
    const result = await db
      .delete(scheduleExecutions)
      .where(eq(scheduleExecutions.scheduleId, scheduleId));
    return (result.rowCount || 0) > 0;
  }

  async deleteSocialMediaConfigs(userId: string): Promise<boolean> {
    const result = await db
      .delete(socialMediaConfigs)
      .where(eq(socialMediaConfigs.userId, userId));
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
    await db.update(users)
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

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }
}


export const storage = new DatabaseStorage();