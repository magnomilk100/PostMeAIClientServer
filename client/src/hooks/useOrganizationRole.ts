import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface OrganizationRole {
  id: number;
  userId: string;
  organizationId: number;
  role: "owner" | "member";
  isActive: boolean;
  joinedAt: string;
  lastActiveAt: string;
}

interface WorkspaceRole {
  id: number;
  userId: string;
  workspaceId: number;
  role: "administrator" | "creator" | "publisher" | "approver" | "readonly";
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
    isOrganizationOwner:
      organizationRole?.role === "owner" && organizationRole?.isActive,
  };
}

export function useWorkspaceRoles() {
  const { data: workspaceRoles, isLoading } = useQuery<WorkspaceRole[]>({
    queryKey: ["/api/user/workspace-roles"],
    retry: false,
    staleTime: 5000,
  });

  return {
    workspaceRoles: workspaceRoles || [],
    isLoading,
  };
}

export function useCurrentWorkspaceRole() {
  const { user } = useAuth();

  const { data: workspaceRoles, isLoading } = useQuery<WorkspaceRole[]>({
    queryKey: ["/api/user/workspace-roles"],
    retry: false,
    staleTime: 5000,
  });

  const currentWorkspaceId = (user as any)?.currentWorkspaceId;

  // Check if user has administrator role in the CURRENT workspace only
  const hasAdministratorRole =
    workspaceRoles?.some(
      (role) =>
        role.workspaceId === currentWorkspaceId &&
        role.role === "administrator" &&
        role.isActive,
    ) || false;

  return {
    currentWorkspaceId,
    hasAdministratorRole,
    isLoading,
  };
}

// Combined hook for admin access determination
export function useAdminAccess() {
  const { isOrganizationOwner, isLoading: orgLoading } = useOrganizationRole();
  const { hasAdministratorRole, isLoading: workspaceLoading } =
    useCurrentWorkspaceRole();

  return {
    isLoading: orgLoading || workspaceLoading,
    hasAdminAccess: isOrganizationOwner || hasAdministratorRole,
    isOrganizationOwner,
    hasAdministratorRole,
  };
}
