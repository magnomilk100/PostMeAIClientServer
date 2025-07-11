import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  authProvider: string;
  lastAuthMethod: string | null;
  credits: number;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  subscriptionExpiresAt: string | null;
  // Profile settings
  bio?: string | null;
  timezone?: string | null;
  language?: string | null;
  // Company settings
  companyName?: string | null;
  companyLogo?: string | null;
  website?: string | null;
  industry?: string | null;
  teamSize?: string | null;
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  } | null;
  // Notification settings
  emailNotifications?: boolean | null;
  pushNotifications?: boolean | null;
  postReminders?: boolean | null;
  templateExecution?: boolean | null;
  weeklyReports?: boolean | null;
  marketingEmails?: boolean | null;
  // Theme settings
  theme?: string | null;
  primaryColor?: string | null;
  compactMode?: boolean | null;
  sidebarCollapsed?: boolean | null;
  // Security settings
  sessionTimeout?: string | null;
  autoSave?: boolean | null;
  rememberLogin?: boolean | null;
  twoFactorAuth?: boolean | null;
}

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0, // No cache to ensure fresh data
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: true, // Enable refetch on window focus to catch login state changes
    refetchOnMount: true, // Refetch on component mount
    enabled: true, // Always enabled
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Clear any existing cached data and force fresh fetch
      queryClient.setQueryData(["/api/auth/user"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: { 
      email: string; 
      password: string; 
      firstName?: string; 
      lastName?: string; 
    }) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Clear any existing cached data and force fresh fetch
      queryClient.setQueryData(["/api/auth/user"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}