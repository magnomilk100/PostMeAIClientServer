import { useQuery } from "@tanstack/react-query";

interface OrganizationRole {
  id: number;
  userId: string;
  organizationId: number;
  role: 'owner' | 'member';
  isActive: boolean;
  joinedAt: string;
  lastActiveAt: string;
}

interface WorkspaceRole {
  id: number;
  userId: string;
  workspaceId: number;
  role: 'administrator' | 'creator' | 'publisher' | 'approver' | 'readonly';
  isActive: boolean;
  assignedAt: string;
}

export function useOrganizationRole() {
  const { data: organizationRole, isLoading } = useQuery<OrganizationRole>({
    queryKey: ["/api/user/organization-role"],
    retry: false,
    staleTime: 5000,
  });

  return {
    organizationRole,
    isLoading,
    isOrganizationOwner: organizationRole?.role === 'owner' && organizationRole?.isActive,
  };
}

export function useWorkspaceRoles() {
  const { data: workspaceRoles, isLoading } = useQuery<WorkspaceRole[]>({
    queryKey: ["/api/user/workspace-roles"],
    retry: false,
    staleTime: 5000,
  });

  const hasAdministratorRole = workspaceRoles?.some(role => 
    role.role === 'administrator' && role.isActive
  ) || false;

  return {
    workspaceRoles: workspaceRoles || [],
    isLoading,
    hasAdministratorRole,
  };
}

// Combined hook for admin access determination
export function useAdminAccess() {
  const { isOrganizationOwner, isLoading: orgLoading } = useOrganizationRole();
  const { hasAdministratorRole, isLoading: workspaceLoading } = useWorkspaceRoles();

  return {
    isLoading: orgLoading || workspaceLoading,
    hasAdminAccess: isOrganizationOwner || hasAdministratorRole,
    isOrganizationOwner,
    hasAdministratorRole,
  };
}