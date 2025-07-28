// Authentication configuration
export const authConfig = {
  // Enable/disable authentication globally
  enabled: process.env.AUTH_ENABLED !== 'false', // Default to enabled unless explicitly disabled
  
  // Optional: Skip authentication for specific routes
  skipAuthRoutes: [
    '/',
    '/documentation',
    '/watch-demo',
    '/privacy-policy',
    '/i18n-demo'
  ],
  
  // Default user for when auth is disabled
  defaultUser: {
    id: 'anonymous',
    email: 'anonymous@example.com',
    firstName: 'Anonymous',
    lastName: 'User',
    provider: 'local',
    providerId: 'anonymous',
    credits: 1000,
    subscriptionPlan: 'pro',
    subscriptionStatus: 'active',
    onboardingCompleted: true,
    currentWorkspaceId: 2, // Default workspace for anonymous users
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

// Helper function to check if auth is required for a route
export function isAuthRequired(path: string): boolean {
  if (!authConfig.enabled) return false;
  return !authConfig.skipAuthRoutes.includes(path);
}

// Middleware factory for optional auth
export function createAuthMiddleware(requireAuth: boolean = true) {
  return (req: any, res: any, next: any) => {
    // Debug logging for user session tracking
    if (req.url.includes('admin') || req.url.includes('organization') || req.url.includes('workspace')) {
      console.log('?? AUTH MIDDLEWARE DEBUG - URL:', req.url, 'Method:', req.method, 'User:', req.user?.id, 'Session ID:', req.sessionID);
    }
    
    // If auth is disabled globally, inject default user
    if (!authConfig.enabled) {
      req.user = authConfig.defaultUser;
      return next();
    }
    
    // If auth is enabled but not required for this route, still pass through user if available
    if (!requireAuth) {
      return next();
    }
    
    // Standard auth check
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    next();
  };
}