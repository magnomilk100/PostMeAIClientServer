import { useQuery } from "@tanstack/react-query";
import { Building2, Crown, Shield, Users, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function OrganizationSwitcher() {
  const { data: currentOrganization, isLoading, error } = useQuery({
    queryKey: ['/api/organization/current'],
    staleTime: 0, // Always consider stale to allow immediate refetch
    retry: 3,
    retryDelay: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'member':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'member':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-1"></div>
          <div className="h-3 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <Building2 className="w-5 h-5 text-red-500" />
        <div className="flex-1">
          <span className="text-sm text-red-600 dark:text-red-400">Error loading organization</span>
        </div>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
        <Building2 className="w-5 h-5 text-yellow-500" />
        <div className="flex-1">
          <span className="text-sm text-yellow-600 dark:text-yellow-400">No organization found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
        <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {currentOrganization.name}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            {getRoleIcon(currentOrganization.currentUserRole)}
            <Badge 
              variant="outline" 
              className={`text-xs px-2 py-0.5 ${getRoleBadgeColor(currentOrganization.currentUserRole)}`}
            >
              {currentOrganization.currentUserRole}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}