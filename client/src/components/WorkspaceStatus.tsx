import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Building, Shield, Clock } from 'lucide-react';

interface WorkspaceInfo {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  currentUserRole: 'owner' | 'admin' | 'member' | 'viewer';
  members: Array<{
    id: string;
    email: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joinedAt: string;
  }>;
}

export function WorkspaceStatus() {
  const { data: workspaceInfo, isLoading, error } = useQuery<WorkspaceInfo>({
    queryKey: ['/api/workspace/current'],
    retry: 1,
  });

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Current Workspace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Current Workspace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading workspace information</p>
        </CardContent>
      </Card>
    );
  }

  if (!workspaceInfo) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Current Workspace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No workspace information available</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    if (!role) {
      console.log("🚨 DEBUG  Workspace Status - getRoleBadgeColor 1a - Role is undefined/null, returning default color");
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }  
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Current Workspace
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workspace Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{workspaceInfo.name}</h3>
            <Badge variant="outline" className="text-xs">
              ID: {workspaceInfo.id}
            </Badge>
          </div>
          {workspaceInfo.description && (
            <p className="text-gray-600 text-sm">{workspaceInfo.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Created: {formatDate(workspaceInfo.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {workspaceInfo.members.length} member{workspaceInfo.members.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Current User Role */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Your Role
          </h4>
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex-1">
              <p className="font-medium text-sm">Your workspace role</p>
              <p className="text-xs text-gray-500">
                This determines your permissions in this workspace
              </p>
            </div>
            <Badge className={`text-xs ${getRoleBadgeColor(workspaceInfo.currentUserRole)}`}>
              {workspaceInfo.currentUserRole}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}