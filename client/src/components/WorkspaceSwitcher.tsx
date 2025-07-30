import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Building2, Check, Users, Crown, Shield, Eye, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useOrganizationRole, useAdminAccess } from "@/hooks/useOrganizationRole";
import { useAuth } from "@/hooks/useAuth";

interface Workspace {
  id: number;
  name: string;
  description: string;
  uniqueId: string;
  currentUserRole: string;
  memberCount: number;
  createdAt: string;
  isActive: boolean;
}

// Extended interface for admin workspaces endpoint  
interface AdminWorkspace {
  id: number;
  name: string;
  uniqueId: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  activeMemberCount: number;
  ownerId: string | null;
  ownerName: string;
  ownerEmail: string;
  currentUserRole: string;
}

export function WorkspaceSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth(); // Get current user info
  const { organizationRole } = useOrganizationRole();
  const { hasAdminAccess } = useAdminAccess();
  const [location, setLocation] = useLocation();
  
  // Get current workspace
  const { data: currentWorkspace, isLoading: currentWorkspaceLoading, error: currentWorkspaceError } = useQuery<Workspace>({
    queryKey: ['/api/workspace/current'],
    staleTime: 0, // Always consider stale to allow immediate refetch
    retry: 3,
    retryDelay: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Get current user's workspace roles across the organization
  const { data: userWorkspaceRoles = [] } = useQuery({
    queryKey: ['/api/user/workspace-roles'],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Get workspaces based on organization role
  // Organization owners see ALL workspaces, members see only their assigned workspaces
  const isOrganizationOwner = organizationRole?.role === 'owner';
  const workspacesEndpoint = isOrganizationOwner ? '/api/admin/workspaces' : '/api/workspaces';
  
  const { data: rawWorkspaces = [], isLoading: workspacesLoading, error: workspacesError } = useQuery({
    queryKey: [workspacesEndpoint],
    staleTime: 0, // Always consider stale to allow immediate refetch
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Transform admin workspaces data to match regular workspace interface
  const workspaces: Workspace[] = isOrganizationOwner && rawWorkspaces ? 
    (rawWorkspaces as AdminWorkspace[]).map((adminWorkspace: AdminWorkspace) => ({
      id: adminWorkspace.id,
      name: adminWorkspace.name,
      description: adminWorkspace.description || '',
      uniqueId: adminWorkspace.uniqueId,
      currentUserRole: adminWorkspace.currentUserRole, // Use actual workspace role from backend
      memberCount: adminWorkspace.memberCount,
      createdAt: adminWorkspace.createdAt,
      isActive: true
    })) :
    (rawWorkspaces as Workspace[]) || [];

  // Switch workspace mutation
  const switchWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: number) => {
      const response = await apiRequest('POST', '/api/workspace/switch', { workspaceId });
      return { response, workspaceId };
    },
    onSuccess: async ({ workspaceId }) => {
      toast({
        title: "Workspace switched successfully",
        description: "Your workspace has been updated.",
      });
      
      // Force refetch all workspace-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workspace/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workspaces'] });
      
      // Invalidate all workspace-dependent data queries
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workspace/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/invitations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social-media-configs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/analytics'] });
      
      // Refetch critical queries and wait for them to complete
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['/api/workspace/current'] }),
        queryClient.refetchQueries({ queryKey: ['/api/auth/user'] }),
        queryClient.refetchQueries({ queryKey: ['/api/user/organization-role'] }),
        queryClient.refetchQueries({ queryKey: ['/api/user/workspace-roles'] })
      ]);
      
      // Check if user is currently on admin page and redirect if they lose access
      const isOnAdminPage = location.startsWith('/admin/');
      if (isOnAdminPage) {
        // Get fresh workspace data to check new role
        const newWorkspaceData = queryClient.getQueryData(['/api/workspace/current']) as any;
        const userRolesData = queryClient.getQueryData(['/api/user/workspace-roles']) as any[];
        const orgRoleData = queryClient.getQueryData(['/api/user/organization-role']) as any;
        
        // Determine if user has admin access in the new workspace
        const isOrganizationOwner = orgRoleData?.role === 'owner' && orgRoleData?.isActive;
        const hasAdministratorRole = userRolesData?.some(
          (role: any) => 
            role.workspaceId === workspaceId && 
            role.role === 'administrator' && 
            role.isActive
        ) || false;
        
        const hasNewAdminAccess = isOrganizationOwner || hasAdministratorRole;
        
        console.log('🔄 WORKSPACE SWITCH - Admin Access Check:', {
          workspaceId,
          isOrganizationOwner,
          hasAdministratorRole,
          hasNewAdminAccess,
          userRolesData,
          orgRoleData
        });
        
        // If user loses admin access after workspace switch, redirect to home
        if (!hasNewAdminAccess) {
          setLocation('/');
          toast({
            title: "Redirected to Home",
            description: "You don't have administrator access in this workspace.",
            variant: "default",
          });
        }
      }
      
      // Close dropdown
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to switch workspace",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSwitchWorkspace = (workspaceId: number) => {
    if (currentWorkspace?.id === workspaceId) {
      setIsOpen(false);
      return;
    }
    
    switchWorkspaceMutation.mutate(workspaceId);
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-3 h-3 text-blue-500" />;
      case 'member':
        return <Users className="w-3 h-3 text-green-500" />;
      case 'viewer':
        return <Eye className="w-3 h-3 text-gray-500" />;
      default:
        return <Users className="w-3 h-3 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    // Handle undefined or null role
    if (!role) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
    
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'administrator':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'creator':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'publisher':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'approver':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'viewer':
      case 'readonly':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'member':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Get roles for current user in the current workspace following priority rules
  const getCurrentUserWorkspaceRoles = () => {
    if (!currentWorkspace || !userWorkspaceRoles) return [];

    // Check if user is organization owner
    const isOrgOwner = organizationRole?.role === 'owner';
    if (isOrgOwner) {
      return ['owner']; // Only show Owner role
    }

    // Get user's roles for the current workspace
    const currentWorkspaceRoles = userWorkspaceRoles.filter(
      (role: any) => role.workspaceId === currentWorkspace.id
    );

    if (currentWorkspaceRoles.length === 0) {
      return []; // No roles in this workspace
    }

    // Check if user has administrator role
    const hasAdministratorRole = currentWorkspaceRoles.some(
      (role: any) => role.role === 'administrator'
    );

    if (hasAdministratorRole) {
      return ['administrator']; // Only show Administrator role
    }

    // Return all other roles
    return currentWorkspaceRoles.map((role: any) => role.role);
  };

  // Get the dot color for each role (for collapsed view)
  const getRoleDotColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-yellow-500'; // Gold
      case 'administrator':
        return 'bg-red-500'; // Red
      case 'creator':
        return 'bg-blue-500'; // Blue
      case 'publisher':
        return 'bg-green-500'; // Green
      case 'approver':
        return 'bg-orange-500'; // Orange
      case 'viewer':
      case 'readonly':
        return 'bg-gray-500'; // Gray
      default:
        return 'bg-gray-400'; // Default gray
    }
  };

  if (currentWorkspaceLoading) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Building2 className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-500">Loading workspace...</span>
      </div>
    );
  }

  if (currentWorkspaceError) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-red-100 dark:bg-red-900 rounded-lg">
        <Building2 className="w-4 h-4 text-red-500" />
        <span className="text-sm text-red-500">Error loading workspace</span>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
        <Building2 className="w-4 h-4 text-yellow-500" />
        <span className="text-sm text-yellow-500">No workspace found</span>
      </div>
    );
  }

  const userDisplayRoles = getCurrentUserWorkspaceRoles();

  return (
    <div className="mb-4">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-auto p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200 border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="flex-1 min-w-0 text-left">
                {/* User Info */}
                <div className="flex items-center space-x-1 mb-1">
                  <User className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">User:</span>
                  <span className="font-medium text-xs truncate text-gray-900 dark:text-white">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || 'Unknown User'
                    }
                  </span>
                </div>
                
                {/* Workspace Info */}
                <div className="flex items-center space-x-1 mb-1">
                  <Building2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Workspace:</span>
                  <span className="font-medium text-xs truncate text-gray-900 dark:text-white">
                    {currentWorkspace.name}
                  </span>
                </div>

                {/* Role(s) Info - Using colored dots for collapsed view */}
                <div className="flex items-center space-x-1 mt-1">
                  <Shield className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  <div className="flex items-center gap-1">
                    {userDisplayRoles.length > 0 ? (
                      userDisplayRoles.map((role, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${getRoleDotColor(role)}`}
                          title={role.charAt(0).toUpperCase() + role.slice(1)} // Tooltip for accessibility
                        />
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                        No roles assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="start" 
          className="w-[240px] p-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-gray-200 dark:border-gray-700"
        >
          <DropdownMenuLabel className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Switch Workspace
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {workspacesLoading ? (
            <div className="px-3 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
              Loading workspaces...
            </div>
          ) : workspacesError ? (
            <div className="px-3 py-3 text-center text-sm text-red-500">
              Error loading workspaces
            </div>
          ) : workspaces && workspaces.length > 0 ? (
            workspaces.map((workspace) => {
              // Get roles for this specific workspace following priority rules
              const getWorkspaceDisplayRoles = () => {
                // Check if user is organization owner
                const isOrgOwner = organizationRole?.role === 'owner';
                if (isOrgOwner) {
                  return ['owner']; // Only show Owner role
                }

                // Get user's roles for this workspace
                const workspaceRoles = userWorkspaceRoles.filter(
                  (role: any) => role.workspaceId === workspace.id
                );

                if (workspaceRoles.length === 0) {
                  return []; // No roles in this workspace
                }

                // Check if user has administrator role
                const hasAdministratorRole = workspaceRoles.some(
                  (role: any) => role.role === 'administrator'
                );

                if (hasAdministratorRole) {
                  return ['administrator']; // Only show Administrator role
                }

                // Return all other roles
                return workspaceRoles.map((role: any) => role.role);
              };

              const workspaceDisplayRoles = getWorkspaceDisplayRoles();

              return (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleSwitchWorkspace(workspace.id)}
                className="px-3 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {workspace.name}
                      </span>
                      {currentWorkspace?.id === workspace.id && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex flex-wrap gap-1">
                        {workspaceDisplayRoles.length > 0 ? (
                          workspaceDisplayRoles.map((role, index) => (
                            <Badge 
                              key={index}
                              variant="secondary" 
                              className={`text-xs px-1.5 py-0.5 ${getRoleBadgeColor(role)}`}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                            No roles
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {workspace.memberCount} member{workspace.memberCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
              );
            })
          ) : (
            <div className="px-3 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
              No workspaces available
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}