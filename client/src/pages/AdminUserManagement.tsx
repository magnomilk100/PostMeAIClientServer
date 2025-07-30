import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAccess } from "@/hooks/useOrganizationRole";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, UserCheck, UserX, Shield, Edit, Trash2, Mail, Calendar, Activity, AlertTriangle, Crown, Settings, Plus, Minus, UserPlus, Search, X, Building, Filter, ChevronDown, Eye } from "lucide-react";
import { ComponentLoading } from "@/components/ui/loading";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isAdmin: boolean;
  userRole?: string;
  accountStatus: string;
  joinedAt: string;
  lastLoginAt: string | null;
  isActive: boolean;
  workspaceRoles?: WorkspaceRole[];
  currentWorkspaceId?: number;
}

interface OrganizationInfo {
  id: string;
  name: string;
  role: string;
  currentUserRole?: string;
  members?: User[];
}

interface WorkspaceRole {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
}

interface UserWorkspaceRole {
  id: number;
  userId: string;
  workspaceId: number;
  roleId: number;
  assignedAt: string;
  assignedByUserId: string;
  role?: WorkspaceRole;
}

interface UserDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  organizationRole: string;
  workspaces: WorkspaceDetails[];
}

interface WorkspaceDetails {
  workspaceId: number;
  workspaceName: string;
  role: string;
  hasAccess: boolean;
}

export default function AdminUserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasAdminAccess, isLoading: adminAccessLoading, isOrganizationOwner } = useAdminAccess();
  
  const [removingUser, setRemovingUser] = useState<User | null>(null);
  const [showWorkspaceRoleDialog, setShowWorkspaceRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [userDetailsUser, setUserDetailsUser] = useState<User | null>(null);
  
  // Delete user states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteConfirmationEmail, setDeleteConfirmationEmail] = useState("");
  
  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'workspace-any' | 'workspace-roles' | 'active' | 'active-since' | 'owners'>('all');
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [activeSinceDate, setActiveSinceDate] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter users based on selected criteria
  const getFilteredUsers = () => {
    if (!users) return [];
    
    console.log('🔍 Filter Debug - FilterType:', filterType, 'TotalUsers:', (users as User[]).length);
    
    const filtered = (users as User[]).filter((member: User) => {
      switch (filterType) {
        case 'all':
          return true;
        
        case 'workspace-any':
          // Users with any role in current workspace (organization owners are separate)
          return getUserCurrentWorkspaceRole(member.id).length > 0;
        
        case 'workspace-roles':
          // Users with specific roles in current workspace
          if (selectedRoleIds.length === 0) return true;
          const userRoles = getUserCurrentWorkspaceRole(member.id);
          return userRoles.some((uwr: any) => {
            const roleId = typeof uwr.role === 'object' && uwr.role?.id ? uwr.role.id : uwr.roleId;
            return selectedRoleIds.includes(roleId);
          });
        
        case 'active':
          // Only active users
          return member.accountStatus === 'active';
        
        case 'active-since':
          // Users active since specified date (using joinedAt since many users don't have lastLoginAt)
          if (!activeSinceDate) return true;
          if (!member.joinedAt) return false;
          try {
            const sinceDate = new Date(activeSinceDate);
            sinceDate.setHours(0, 0, 0, 0); // Set to start of day
            const joinedDate = new Date(member.joinedAt);
            console.log(`🔍 Date Filter Debug - User: ${member.email}, JoinedAt: ${member.joinedAt}, SinceDate: ${activeSinceDate}, Comparison: ${joinedDate >= sinceDate}`);
            return joinedDate >= sinceDate;
          } catch (error) {
            console.error('Date parsing error:', error);
            return true;
          }
        
        case 'owners':
          // Only organization owners
          return isUserOrganizationOwner(member.id);
        
        default:
          return true;
      }
    });
    
    // Sort the filtered users to put current user at the top
    const sortedFiltered = filtered.sort((a: User, b: User) => {
      // Current user always comes first
      if (a.id === user?.id) return -1;
      if (b.id === user?.id) return 1;
      
      // For other users, maintain alphabetical order by name
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    console.log('🔍 Filter Result - Filtered Count:', sortedFiltered.length, 'FilterType:', filterType);
    return sortedFiltered;
  };

  // Reset filters
  const resetFilters = () => {
    setFilterType('all');
    setSelectedRoleIds([]);
    setActiveSinceDate('');
  };

  // Handle role checkbox changes
  const handleRoleToggle = (roleId: number) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Use the organization owner status from the hook
  const isCurrentUserOrgOwner = isOrganizationOwner;

  // Helper function to check if any user is organization owner (based on fetched data)
  const isUserOrganizationOwner = (userId: string) => {
    if (!users) return false;
    // users array contains organization members with role field for organization owners
    const userArray = users as any[];
    return userArray.some((member: any) => 
      member.id === userId && (member.organizationRole === 'owner' || member.role === 'owner')
    );
  };

  // Helper function to check if a user has administrator role in current workspace
  const hasUserAdministratorRoleInCurrentWorkspace = (userId: string) => {
    if (!userWorkspaceRoles || !(user as any)?.currentWorkspaceId) return false;
    
    const userRoles = userWorkspaceRoles.filter((role: any) => 
      role.userId === userId && role.workspaceId === (user as any).currentWorkspaceId
    );
    
    return userRoles.some((role: any) => {
      const roleDetails = (workspaceRoles as any[]).find((wr: any) => wr.id === role.roleId);
      return roleDetails?.name === 'administrator';
    });
  };

  // Always try organization members first (admin access allows both owners and workspace administrators)
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/organization/members'],
    enabled: hasAdminAccess,
    staleTime: 0, // Force fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });



  // Fetch workspace roles
  const { data: workspaceRoles = [] } = useQuery({
    queryKey: ['/api/workspace-roles'],
    enabled: hasAdminAccess,
  });

  // Fetch all workspaces (for organization owners)
  const { data: allWorkspaces = [] } = useQuery({
    queryKey: ['/api/admin/workspaces'],
    enabled: isCurrentUserOrgOwner && hasAdminAccess,
  });

  // Fetch current workspace
  const { data: currentWorkspace } = useQuery({
    queryKey: ['/api/workspace/current'],
    enabled: hasAdminAccess,
  });

  // Type the workspace roles properly
  const typedWorkspaceRoles = workspaceRoles as WorkspaceRole[];

  // Fetch user workspace roles for current workspace only
  const { data: userWorkspaceRoles } = useQuery({
    queryKey: ['/api/user-workspace-roles', (user as any)?.currentWorkspaceId],
    queryFn: () => fetch(`/api/user-workspace-roles/${(user as any)?.currentWorkspaceId}`, {
      credentials: 'include'
    }).then(res => res.json()),
    enabled: !!(user as any)?.currentWorkspaceId && hasAdminAccess,
  });

  // Fetch user details (all workspace roles) for the selected user
  const { data: userDetailsData, isLoading: userDetailsLoading } = useQuery({
    queryKey: ['/api/admin/user-details', userDetailsUser?.id],
    queryFn: () => fetch(`/api/admin/user-details/${userDetailsUser?.id}`, {
      credentials: 'include'
    }).then(res => res.json()),
    enabled: !!userDetailsUser?.id && hasAdminAccess,
  });



  // Helper function to check current user's organization role
  const getCurrentUserOrganizationRole = () => {
    // Check if current user is in organization members as owner
    if (user && isCurrentUserOrgOwner) {
      return 'owner';
    }
    return 'member';
  };

  // Helper function to check if current user can manage roles
  const canManageRoles = () => {
    // Organization owners can always manage roles
    if (isCurrentUserOrgOwner) {
      return true;
    }
    
    // Check if current user is administrator in the current workspace
    if (!(user as any)?.currentWorkspaceId || !userWorkspaceRoles) {
      return false;
    }
    
    const currentUserRoles = userWorkspaceRoles.filter((role: any) => 
      role.userId === user.id && role.workspaceId === (user as any).currentWorkspaceId
    );
    
    return currentUserRoles.some((role: any) => {
      const roleDetails = (workspaceRoles as any[]).find((wr: any) => wr.id === role.roleId);
      return roleDetails?.name === 'administrator';
    });
  };

  // Get user workspace roles for CURRENT workspace only
  const getUserCurrentWorkspaceRole = (userId: string) => {
    // Get ALL roles for this user in the current workspace from userWorkspaceRoles data
    if (!userWorkspaceRoles || !(user as any)?.currentWorkspaceId || !workspaceRoles) return [];
    
    const userRoles = userWorkspaceRoles.filter((role: any) => 
      role.userId === userId && role.workspaceId === (user as any).currentWorkspaceId
    );
    
    return userRoles.map((role: any, index: number) => {
      // Find the role name from workspaceRoles by matching roleId
      const roleDetails = (workspaceRoles as any[]).find((wr: any) => wr.id === role.roleId);
      const roleName = roleDetails?.name || 'Unknown';
      
      return {
        id: `${userId}_${role.workspaceId}_${index}`,
        userId: userId,
        workspaceId: role.workspaceId,
        roleId: role.roleId,
        role: roleName,
        workspaceName: 'Current Workspace'
      };
    });
  };





  // Get workspace role color based on role name
  const getWorkspaceRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'administrator':
        return 'bg-red-500';
      case 'member':
        return 'bg-blue-500';
      case 'approver':
        return 'bg-orange-500';
      case 'publisher':
        return 'bg-green-500';
      case 'creator':
        return 'bg-blue-500';
      case 'readonly':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Get display name for workspace roles (standardize naming)
  const getWorkspaceRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'Administrator';
      case 'administrator':
        return 'Administrator';
      case 'member':
        return 'Member';
      case 'approver':
        return 'Post Approver';
      case 'publisher':
        return 'Post Publisher';
      case 'creator':
        return 'Post Creator';
      case 'readonly':
        return 'ReadOnly';
      default:
        return roleName;
    }
  };

  // Assign workspace role mutation
  const assignWorkspaceRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId, workspaceId }: { userId: string; roleId: number; workspaceId?: number }) => {
      const targetWorkspaceId = workspaceId || user?.currentWorkspaceId;
      return await apiRequest('POST', '/api/user-workspace-roles', {
        userId,
        workspaceId: targetWorkspaceId,
        roleId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-workspace-roles', user?.currentWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workspace/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/organization/members'] });
      toast({
        title: "Success",
        description: "Workspace role assigned successfully",
      });
      // Keep dialog open to show the assignment
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign workspace role",
        variant: "destructive",
      });
    }
  });

  // Remove workspace role mutation
  const removeWorkspaceRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId, workspaceId }: { userId: string; roleId: number; workspaceId?: number }) => {
      const targetWorkspaceId = workspaceId || user?.currentWorkspaceId;
      return await apiRequest('DELETE', `/api/user-workspace-roles/${userId}/${targetWorkspaceId}/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-workspace-roles', user?.currentWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workspace/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/organization/members'] });
      toast({
        title: "Success",
        description: "Workspace role removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove workspace role",
        variant: "destructive",
      });
    }
  });





  // Delete user completely mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('🗑️ DELETE USER MUTATION - API call for user ID:', userId);
      await apiRequest('DELETE', `/api/admin/users/${userId}/delete-completely`);
    },
    onSuccess: () => {
      setUserToDelete(null);
      setShowDeleteDialog(false);
      setDeleteConfirmationEmail("");
      console.log('🗑️ DELETE USER MUTATION - SUCCESS - Invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/organization/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workspace/members'] });
      toast({
        title: "User deleted",
        description: "User has been completely deleted from the organization and all data removed.",
      });
    },
    onError: (error) => {
      console.error('🗑️ DELETE USER MUTATION - ERROR:', error);
      toast({
        title: "Error deleting user",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    },
  });



  const handleDeleteUser = (user: User) => {
    console.log('🗑️ DELETE USER DEBUG - Button clicked for user:', user);
    setUserToDelete(user);
    setDeleteConfirmationEmail("");
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    
    if (deleteConfirmationEmail !== userToDelete.email) {
      toast({
        title: "Email confirmation failed",
        description: "Please enter the exact email address to confirm deletion.",
        variant: "destructive"
      });
      return;
    }

    console.log('🗑️ DELETE USER DEBUG - Confirming deletion for user:', userToDelete);
    deleteUserMutation.mutate(userToDelete.id);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'administrator': return 'bg-red-500';
      case 'manager': return 'bg-blue-500';
      case 'editor': return 'bg-green-500';
      case 'viewer': return 'bg-gray-500';
      default: return 'bg-purple-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Check if any actions are available for any user
  const hasAnyActionsAvailable = () => {
    if (!users) return false;
    
    // Only show actions if user can manage roles (either org owner or workspace admin)
    if (canManageRoles()) {
      // Check if there are any users we can take actions on
      return (users as User[]).some((member: User) => 
        member.id !== user?.id && 
        !isUserOrganizationOwner(member.id) && 
        !hasUserAdministratorRoleInCurrentWorkspace(member.id)
      );
    }
    
    return false;
  };

  // Handle viewing user details
  const handleViewUserDetails = (member: User) => {
    setUserDetailsUser(member);
    setShowUserDetailsModal(true);
  };

  // Show loading while checking admin access
  if (adminAccessLoading) {
    return <ComponentLoading text="Checking permissions..." />;
  }

  // Check admin access using the proper hook
  if (!hasAdminAccess) {
    return (
      <div className="page-content">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access this page. Administrator privileges required.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">
          Manage workspace members, roles, and permissions
        </p>
        
        {/* Status Information */}
        <div className="grid gap-4 mt-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    About User Status
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>pending_approval:</strong> Users with this status have completed registration but are awaiting admin approval to become fully active. 
                    This typically happens when users join via invitation or when workspace requires admin approval for new members.
                    You can change their status to "active" to grant full access.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                    Organization Owner Protection
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    <strong>Organization owners</strong> cannot be removed directly to ensure every organization maintains at least one owner.
                    To remove an organization owner, first change their role to "member" then remove them. 
                    The last remaining owner in an organization cannot be demoted.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {getCurrentUserOrganizationRole() !== 'owner' && (
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Limited Permissions
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      You have <strong>{getCurrentUserOrganizationRole()}</strong> permissions in this organization.
                      Only organization owners can remove users from workspaces. Contact an organization owner to remove users.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {getCurrentUserOrganizationRole() === 'owner' && (
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900 dark:text-green-100 mb-1">
                      Organization Owner Permissions
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      As an organization owner, you can remove any user from workspaces (including other owners).
                      You cannot remove yourself - use the account deletion feature in Settings if needed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isCurrentUserOrgOwner ? 'Organization Members' : 'Workspace Members'}
          </CardTitle>
          <CardDescription>
            {isCurrentUserOrgOwner 
              ? 'View and manage all users in your organization across all workspaces'
              : 'View and manage all users in your workspace'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Section */}
          <div className="mb-6">
            <Accordion type="single" collapsible value={isFilterOpen ? "filters" : ""} onValueChange={(value) => setIsFilterOpen(!!value)}>
              <AccordionItem value="filters">
                <AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter Organization Members
                    {filterType !== 'all' && (
                      <Badge variant="secondary" className="ml-2">
                        Active Filter
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {/* Filter Type Selection */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Filter By</Label>
                        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select filter type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="workspace-any">Users with any Role in current Workspace</SelectItem>
                            <SelectItem value="workspace-roles">Users with specific Workspace Roles</SelectItem>
                            <SelectItem value="owners">Organization Owners Only</SelectItem>
                            <SelectItem value="active">Active Users Only</SelectItem>
                            <SelectItem value="active-since">Users joined since selected date</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Role Selection (shown when filterType is 'workspace-roles') */}
                      {filterType === 'workspace-roles' && (
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-medium">Select Workspace Roles</Label>
                          <div className="flex flex-wrap gap-2">
                            {typedWorkspaceRoles.map((role) => (
                              <div key={role.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`role-${role.id}`}
                                  checked={selectedRoleIds.includes(role.id)}
                                  onCheckedChange={() => handleRoleToggle(role.id)}
                                />
                                <Label htmlFor={`role-${role.id}`} className="text-sm cursor-pointer">
                                  <Badge className={getWorkspaceRoleColor(role.name)}>
                                    {getWorkspaceRoleDisplayName(role.name)}
                                  </Badge>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Date Selection (shown when filterType is 'active-since') */}
                      {filterType === 'active-since' && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Joined Since Date</Label>
                          <Input
                            type="date"
                            value={activeSinceDate}
                            onChange={(e) => setActiveSinceDate(e.target.value)}
                            className="w-full"
                            max={new Date().toISOString().split('T')[0]}
                          />
                          <p className="text-xs text-muted-foreground">
                            Shows users who joined the organization on or after this date
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Filter Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        onClick={resetFilters}
                        disabled={filterType === 'all' && selectedRoleIds.length === 0 && !activeSinceDate}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reset Filters
                      </Button>
                      
                      <div className="text-sm text-muted-foreground">
                        Showing {getFilteredUsers().length} of {(users as User[])?.length || 0} users
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <ComponentLoading />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Current Workspace Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Login</TableHead>
                    {hasAnyActionsAvailable() && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredUsers().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={hasAnyActionsAvailable() ? 6 : 5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-8 w-8 text-muted-foreground" />
                          <div className="text-muted-foreground">
                            {filterType === 'all' 
                              ? 'No users found' 
                              : 'No users match the selected filters'
                            }
                          </div>
                          {filterType !== 'all' && (
                            <Button 
                              size="sm" 
                              onClick={resetFilters}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                            >
                              Clear Filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredUsers().map((member: User) => (
                    <TableRow key={member.id} className="transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer">
                      <TableCell>
                        <div className="flex flex-col">
                          {member.id === user?.id ? (
                            <Link href="/settings" className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-200 cursor-pointer">
                              {member.firstName} {member.lastName}
                            </Link>
                          ) : (
                            <div className="font-medium">{member.firstName} {member.lastName}</div>
                          )}
                          {member.id === user?.id ? (
                            <Link href="/settings" className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors duration-200 cursor-pointer">
                              {member.email}
                            </Link>
                          ) : (
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {/* Organization Owner Badge with Crown */}
                          {isUserOrganizationOwner(member.id) && (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white w-fit">
                              <Crown className="h-3 w-3 mr-1" />
                              Organization Owner
                            </Badge>
                          )}
                          
                          {/* Current Workspace Role */}
                          <div className="flex flex-wrap gap-1">
                            {getUserCurrentWorkspaceRole(member.id).map((uwr: any) => {
                              // Handle different role data structures
                              let roleName = 'Unknown';
                              if (typeof uwr.role === 'string') {
                                roleName = uwr.role;
                              } else if (uwr.role && typeof uwr.role === 'object' && uwr.role.name) {
                                roleName = uwr.role.name;
                              }
                              
                              // Skip showing "member" role as it's organization-level, not workspace-level
                              if (roleName === 'member') {
                                return null;
                              }
                              
                              const roleColor = getWorkspaceRoleColor(roleName);
                              const roleDisplayName = getWorkspaceRoleDisplayName(roleName);
                              
                              return (
                                <div key={uwr.id} className="flex flex-col gap-0.5">
                                  <Badge className={`${roleColor} text-white text-xs w-fit`}>
                                    {roleDisplayName}
                                  </Badge>
                                </div>
                              );
                            })}
                            
                            {/* Show "No workspace role" if user has no role in current workspace */}
                            {getUserCurrentWorkspaceRole(member.id).length === 0 && (
                              <span className="text-xs text-muted-foreground italic">
                                No role in current workspace
                              </span>
                            )}
                          </div>
                          

                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeColor(member.accountStatus)} text-white`}>
                          {member.accountStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.lastLoginAt ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Activity className="h-3 w-3" />
                            {new Date(member.lastLoginAt).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {/* View Details Button - Show for all users */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewUserDetails(member)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          
                          {/* Add Role Button - Show based on specific rules */}
                          {canManageRoles() && 
                           member.id !== user?.id && 
                           !isUserOrganizationOwner(member.id) && 
                           !hasUserAdministratorRoleInCurrentWorkspace(member.id) && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedUser(member);
                                setShowWorkspaceRoleDialog(true);
                              }}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Role
                            </Button>
                          )}
                          {/* Delete Button - Show based on specific rules */}
                          {canManageRoles() && 
                           member.id !== user?.id && 
                           !isUserOrganizationOwner(member.id) && 
                           !hasUserAdministratorRoleInCurrentWorkspace(member.id) && (
                            <Button
                              size="sm"
                              onClick={() => handleDeleteUser(member)}
                              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users with no Workspace assignment Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Users with no Workspace assignment
          </CardTitle>
          <CardDescription>
            Users who have been invited but haven't been assigned roles yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PendingInvitationsSection />
        </CardContent>
      </Card>

      {/* User Search Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find & Assign Users
          </CardTitle>
          <CardDescription>
            Search for users in your organization and assign them roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserSearchSection />
        </CardContent>
      </Card>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete User Permanently
            </DialogTitle>
            <DialogDescription>
              You are about to permanently delete {userToDelete?.firstName} {userToDelete?.lastName} from the organization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200">
                    This action cannot be undone
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    This will permanently delete the user account and all associated data including:
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 mt-2 list-disc list-inside space-y-1">
                    <li>User profile and account information</li>
                    <li>All workspace roles and permissions</li>
                    <li>Created posts, templates, and content</li>
                    <li>Upload images and media files</li>
                    <li>Social media configurations</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmEmail" className="text-sm font-medium">
                To confirm deletion, please enter the user's email address:
              </Label>
              <Input
                id="confirmEmail"
                type="email"
                placeholder={userToDelete?.email}
                value={deleteConfirmationEmail}
                onChange={(e) => setDeleteConfirmationEmail(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Expected email: {userToDelete?.email}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmationEmail("");
                setUserToDelete(null);
              }}
              variant="outline"
              className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteUser}
              disabled={deleteUserMutation.isPending || deleteConfirmationEmail !== userToDelete?.email}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:from-red-600 disabled:hover:to-red-700"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User Permanently"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Workspace Role Assignment Dialog - Only show if user can manage roles */}
      {canManageRoles() && (
        <Dialog open={showWorkspaceRoleDialog} onOpenChange={setShowWorkspaceRoleDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Workspace Role</DialogTitle>
              <DialogDescription>
                Select a workspace role to assign to {selectedUser?.firstName} {selectedUser?.lastName} in the current workspace
              </DialogDescription>
            </DialogHeader>
          <div className="space-y-4">
            {/* Current Workspace and User Information */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 space-y-3 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <Label className="text-sm font-medium text-purple-800 dark:text-purple-200">Current Workspace</Label>
              </div>
              <div className="pl-6">
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{currentWorkspace?.name || 'Loading...'}</div>
                <div className="text-xs text-purple-600 dark:text-purple-300">{currentWorkspace?.description}</div>
              </div>
              
              <Separator className="bg-purple-200 dark:bg-purple-600" />
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">Target User</Label>
              </div>
              <div className="pl-6">
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{selectedUser?.firstName} {selectedUser?.lastName}</div>
                <div className="text-xs text-blue-600 dark:text-blue-300">{selectedUser?.email}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Available Roles</Label>
              {(() => {
                console.log('🔍 WORKSPACE ROLES DEBUG:', workspaceRoles, 'Type:', typeof workspaceRoles, 'Array?:', Array.isArray(workspaceRoles), 'Length:', workspaceRoles?.length);
                return null;
              })()}
              {!workspaceRoles && <p className="text-sm text-muted-foreground">Loading workspace roles...</p>}
              {workspaceRoles && workspaceRoles.length === 0 && <p className="text-sm text-muted-foreground">No workspace roles available</p>}
              <div className="space-y-2">
                {workspaceRoles?.map((role) => {
                  const targetWorkspaceId = user?.currentWorkspaceId;
                  const isAlreadyAssigned = getUserCurrentWorkspaceRole(selectedUser?.id || '').some(uwr => uwr.roleId === role.id);
                  
                  return (
                    <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getWorkspaceRoleColor(role.name)} text-white text-xs`}>
                            {getWorkspaceRoleDisplayName(role.name)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{role.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Permissions: {role.permissions.join(', ')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!isAlreadyAssigned ? (
                          <Button
                            size="sm"
                            disabled={assignWorkspaceRoleMutation.isPending || !canManageRoles()}
                            onClick={() => {
                              assignWorkspaceRoleMutation.mutate({ 
                                userId: selectedUser?.id || '', 
                                roleId: role.id,
                                workspaceId: targetWorkspaceId
                              });
                            }}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:from-purple-600 disabled:hover:to-blue-600"
                          >
                            Assign
                          </Button>
                        ) : (
                          <>
                            <Badge variant="secondary" className="text-xs text-white bg-green-600">
                              Assigned
                            </Badge>
                            {canManageRoles() && (
                              <Button
                                size="sm"
                                disabled={removeWorkspaceRoleMutation.isPending}
                                onClick={() => {
                                  removeWorkspaceRoleMutation.mutate({ 
                                    userId: selectedUser?.id || '', 
                                    roleId: role.id,
                                    workspaceId: targetWorkspaceId
                                  });
                                }}
                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:from-red-600 disabled:hover:to-red-700"
                              >
                                <Minus className="h-3 w-3 mr-1" />
                                Remove
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                onClick={() => {
                  setShowWorkspaceRoleDialog(false);
                  setSelectedUser(null);
                }}
                variant="outline"
                className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      )}

      {/* User Details Modal */}
      <Dialog open={showUserDetailsModal} onOpenChange={setShowUserDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              User Details - {userDetailsUser?.email || userDetailsUser?.firstName + ' ' + userDetailsUser?.lastName}
            </DialogTitle>
            <DialogDescription>
              Comprehensive workspace roles and permissions for this user across all workspaces
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {userDetailsLoading ? (
              <div className="flex items-center justify-center py-8">
                <ComponentLoading text="Loading user details..." />
              </div>
            ) : userDetailsData ? (
              <>
                {/* User Basic Information */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">User Information</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Full Name:</span>
                      <div className="text-gray-900 dark:text-gray-100">{userDetailsData.fullName}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                      <div className="text-gray-900 dark:text-gray-100">{userDetailsData.email}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Organization Role:</span>
                    <div className="mt-1">
                      <Badge className={`${userDetailsData.organizationRole === 'owner' ? 'bg-yellow-500' : 'bg-blue-500'} text-white`}>
                        {userDetailsData.organizationRole === 'owner' ? 'Organization Owner' : 'Member'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Workspace Roles */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <Label className="text-lg font-medium text-gray-900 dark:text-gray-100">Workspace Roles</Label>
                  </div>
                  
                  {userDetailsData.workspaces && userDetailsData.workspaces.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-800">
                            <TableHead className="font-medium">Workspace</TableHead>
                            <TableHead className="font-medium">Role</TableHead>
                            <TableHead className="font-medium">Access Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userDetailsData.workspaces.map((workspace: WorkspaceDetails) => (
                            <TableRow key={workspace.workspaceId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <TableCell>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {workspace.workspaceName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {workspace.workspaceId}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={`${
                                    workspace.role === 'Owner' ? 'bg-yellow-500' :
                                    workspace.role === 'Administrator' ? 'bg-red-500' :
                                    workspace.role === 'Publisher' ? 'bg-green-500' :
                                    workspace.role === 'Creator' ? 'bg-blue-500' :
                                    workspace.role === 'Readonly' ? 'bg-gray-500' :
                                    workspace.role === 'No Role' ? 'bg-gray-300 text-gray-700' :
                                    'bg-purple-500'
                                  } text-white`}
                                >
                                  {workspace.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={workspace.hasAccess ? "default" : "secondary"}
                                  className={workspace.hasAccess ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}
                                >
                                  {workspace.hasAccess ? "Has Access" : "No Access"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No workspace information available</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Failed to load user details</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => {
                setShowUserDetailsModal(false);
                setUserDetailsUser(null);
              }}
              variant="outline"
              className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Pending Invitations Section Component
function PendingInvitationsSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch pending invitations
  const { data: pendingInvitations = [], isLoading } = useQuery({
    queryKey: ['/api/admin/pending-invitations'],
    enabled: user?.userRole === 'administrator',
  });

  // Fetch workspace roles
  const { data: workspaceRoles = [] } = useQuery({
    queryKey: ['/api/workspace-roles'],
    enabled: user?.userRole === 'administrator',
  });

  // Fetch all workspaces (for organization owners)
  const { data: allWorkspaces = [] } = useQuery({
    queryKey: ['/api/workspaces'],
    enabled: user?.userRole === 'administrator',
  });

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async (data: { invitedUserId: string; workspaceId: number; roleId: number }) => {
      return await apiRequest('POST', '/api/admin/assign-invited-user', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workspace/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/organization/members'] });
      toast({
        title: "Success",
        description: "Role assigned successfully",
      });
      setSelectedUser(null);
      setSelectedWorkspace(null);
      setSelectedRole(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
    }
  });

  const getWorkspaceRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'administrator': return 'bg-red-500';
      case 'approver': return 'bg-orange-500';
      case 'publisher': return 'bg-green-500';
      case 'creator': return 'bg-blue-500';
      case 'readonly': return 'bg-gray-500';
      default: return 'bg-purple-500';
    }
  };

  const getWorkspaceRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case 'administrator': return 'Administrator';
      case 'approver': return 'Post Approver';
      case 'publisher': return 'Post Publisher';
      case 'creator': return 'Post Creator';
      case 'readonly': return 'ReadOnly';
      default: return roleName;
    }
  };

  const handleAssignRole = (invitedUser: any) => {
    if (!selectedWorkspace || !selectedRole) {
      toast({
        title: "Error",
        description: "Please select both workspace and role",
        variant: "destructive",
      });
      return;
    }

    assignRoleMutation.mutate({
      invitedUserId: invitedUser.id,
      workspaceId: selectedWorkspace,
      roleId: selectedRole,
    });
  };

  if (isLoading) {
    return <ComponentLoading />;
  }

  if (!pendingInvitations || pendingInvitations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <UserPlus className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No pending invitations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingInvitations.map((invitation: any) => (
        <div key={invitation.id} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">
                {invitation.firstName} {invitation.lastName}
              </h4>
              <p className="text-sm text-muted-foreground">{invitation.email}</p>
              <p className="text-xs text-muted-foreground">
                Status: {invitation.accountStatus} • Joined: {new Date(invitation.joinedAt).toLocaleDateString()}
              </p>
            </div>
            <Badge className="bg-yellow-500 text-white">Pending Assignment</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Workspace</Label>
              <Select value={selectedUser === invitation.id ? selectedWorkspace?.toString() || "" : ""} onValueChange={(value) => {
                setSelectedUser(invitation.id);
                setSelectedWorkspace(parseInt(value));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a workspace" />
                </SelectTrigger>
                <SelectContent>
                  {allWorkspaces.map((workspace: any) => (
                    <SelectItem key={workspace.id} value={workspace.id.toString()}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Role</Label>
              <Select value={selectedUser === invitation.id ? selectedRole?.toString() || "" : ""} onValueChange={(value) => {
                setSelectedUser(invitation.id);
                setSelectedRole(parseInt(value));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {workspaceRoles.map((role: any) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getWorkspaceRoleColor(role.name)} text-white text-xs`}>
                          {getWorkspaceRoleDisplayName(role.name)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => handleAssignRole(invitation)}
              disabled={selectedUser !== invitation.id || !selectedWorkspace || !selectedRole || assignRoleMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// User Search Section Component
function UserSearchSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch workspace roles
  const { data: workspaceRoles = [] } = useQuery({
    queryKey: ['/api/workspace-roles'],
    enabled: user?.userRole === 'administrator',
  });

  // Fetch all workspaces (for organization owners)
  const { data: allWorkspaces = [] } = useQuery({
    queryKey: ['/api/workspaces'],
    enabled: user?.userRole === 'administrator',
  });

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest('GET', `/api/admin/search-users?query=${encodeURIComponent(query)}`);
      return await response.json();
    },
    onSuccess: (data) => {
      console.log('Search results received:', data);
      setSearchResults(data || []);
      setIsSearching(false);
    },
    onError: (error: any) => {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to search users",
        variant: "destructive",
      });
      setIsSearching(false);
    }
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async (data: { invitedUserId: string; workspaceId: number; roleId: number }) => {
      return await apiRequest('POST', '/api/admin/assign-invited-user', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workspace/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/organization/members'] });
      toast({
        title: "Success",
        description: "Role assigned successfully",
      });
      setSelectedUser(null);
      setSelectedWorkspace(null);
      setSelectedRole(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
    }
  });

  const handleSearch = () => {
    if (searchQuery.trim().length < 2) {
      toast({
        title: "Error",
        description: "Please enter at least 2 characters to search",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    searchMutation.mutate(searchQuery.trim());
  };

  const getWorkspaceRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'administrator': return 'bg-red-500';
      case 'approver': return 'bg-orange-500';
      case 'publisher': return 'bg-green-500';
      case 'creator': return 'bg-blue-500';
      case 'readonly': return 'bg-gray-500';
      default: return 'bg-purple-500';
    }
  };

  const getWorkspaceRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case 'administrator': return 'Administrator';
      case 'approver': return 'Post Approver';
      case 'publisher': return 'Post Publisher';
      case 'creator': return 'Post Creator';
      case 'readonly': return 'ReadOnly';
      default: return roleName;
    }
  };

  const handleAssignRole = (user: any) => {
    if (!selectedWorkspace || !selectedRole) {
      toast({
        title: "Error",
        description: "Please select both workspace and role",
        variant: "destructive",
      });
      return;
    }

    assignRoleMutation.mutate({
      invitedUserId: user.id,
      workspaceId: selectedWorkspace,
      roleId: selectedRole,
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setSelectedWorkspace(null);
    setSelectedRole(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button 
          onClick={handleSearch} 
          disabled={isSearching}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSearching ? 'Searching...' : <Search className="h-4 w-4" />}
        </Button>
        {(searchQuery || (searchResults && searchResults.length > 0)) && (
          <Button 
            onClick={clearSearch} 
            title="Clear search"
            className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {searchResults && searchResults.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold">Search Results ({searchResults.length})</h4>
          {searchResults.map((searchUser: any) => (
            <div key={searchUser.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">
                      {searchUser.firstName} {searchUser.lastName}
                    </h4>
                    <Badge className={searchUser.accountStatus === 'active' ? 'bg-green-500' : 'bg-yellow-500'}>
                      {searchUser.accountStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{searchUser.email}</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Joined: {new Date(searchUser.joinedAt).toLocaleDateString()}
                    {searchUser.lastActiveAt && ` • Last Active: ${new Date(searchUser.lastActiveAt).toLocaleDateString()}`}
                  </p>
                  
                  {/* Workspace Assignments */}
                  {searchUser.workspaceAssignments && searchUser.workspaceAssignments.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Workspace Assignments ({searchUser.workspaceAssignments.length})
                      </h5>
                      <div className="space-y-2">
                        {searchUser.workspaceAssignments.map((assignment: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{assignment.workspaceName}</div>
                              <div className="text-xs text-muted-foreground">ID: {assignment.workspaceId}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${getWorkspaceRoleColor(assignment.roleName)} text-white text-xs`}>
                                {getWorkspaceRoleDisplayName(assignment.roleName)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Since {new Date(assignment.assignedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!searchUser.workspaceAssignments || searchUser.workspaceAssignments.length === 0) && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        No workspace assignments found for this user
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Workspace</Label>
                  <Select value={selectedUser === searchUser.id ? selectedWorkspace?.toString() || "" : ""} onValueChange={(value) => {
                    setSelectedUser(searchUser.id);
                    setSelectedWorkspace(parseInt(value));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      {allWorkspaces.map((workspace: any) => (
                        <SelectItem key={workspace.id} value={workspace.id.toString()}>
                          {workspace.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Role</Label>
                  <Select value={selectedUser === searchUser.id ? selectedRole?.toString() || "" : ""} onValueChange={(value) => {
                    setSelectedUser(searchUser.id);
                    setSelectedRole(parseInt(value));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaceRoles.map((role: any) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getWorkspaceRoleColor(role.name)} text-white text-xs`}>
                              {getWorkspaceRoleDisplayName(role.name)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleAssignRole(searchUser)}
                  disabled={selectedUser !== searchUser.id || !selectedWorkspace || !selectedRole || assignRoleMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchQuery && searchResults && searchResults.length === 0 && !isSearching && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No users found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}