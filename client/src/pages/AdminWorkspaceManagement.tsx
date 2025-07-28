import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAccess, useOrganizationRole } from "@/hooks/useOrganizationRole";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, Building, Users, Calendar, Plus, Edit, Trash2, Activity, ArrowRightLeft } from "lucide-react";
import { ComponentLoading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Workspace {
  id: number;
  name: string;
  uniqueId: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
}

export default function AdminWorkspaceManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasAdminAccess, isLoading: adminAccessLoading } = useAdminAccess();
  const { organizationRole } = useOrganizationRole();
  
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState<Workspace | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Fetch all workspaces
  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['/api/admin/workspaces'],
    enabled: hasAdminAccess,
    staleTime: 0, // Force fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Fetch user's workspaces to show context
  const { data: userWorkspaces } = useQuery({
    queryKey: ['/api/workspaces'],
    enabled: !!user?.id,
  });

  // Fetch user's workspace roles to check permissions
  const { data: userWorkspaceRoles } = useQuery({
    queryKey: ['/api/user/workspace-roles'],
    enabled: !!user?.id,
  });

  // Create workspace mutation
  const createWorkspaceMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      return await apiRequest('POST', '/api/admin/workspaces', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workspaces'] });
      toast.success('Workspace created successfully');
      // Reset form first
      const form = document.getElementById('createWorkspaceForm') as HTMLFormElement;
      if (form) {
        form.reset();
      }
      // Use setTimeout to ensure proper state update
      setTimeout(() => {
        setShowCreateDialog(false);
      }, 100);
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to create workspace';
      try {
        // Parse error message if it's in JSON format
        const errorText = error.message || '';
        if (errorText.includes('{') && errorText.includes('}')) {
          const jsonPart = errorText.substring(errorText.indexOf('{'));
          const parsed = JSON.parse(jsonPart);
          errorMessage = parsed.message || errorMessage;
        } else {
          errorMessage = errorText || errorMessage;
        }
      } catch (e) {
        errorMessage = error.message || 'Failed to create workspace';
      }
      toast.error(errorMessage);
    },
  });

  // Update workspace mutation
  const updateWorkspaceMutation = useMutation({
    mutationFn: async (data: { id: number; name: string; description: string }) => {
      return await apiRequest('PUT', `/api/admin/workspaces/${data.id}`, {
        name: data.name,
        description: data.description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workspaces'] });
      toast.success('Workspace updated successfully');
      setShowEditDialog(false);
      setEditingWorkspace(null);
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to update workspace';
      try {
        // Parse error message if it's in JSON format
        const errorText = error.message || '';
        if (errorText.includes('{') && errorText.includes('}')) {
          const jsonPart = errorText.substring(errorText.indexOf('{'));
          const parsed = JSON.parse(jsonPart);
          errorMessage = parsed.message || errorMessage;
        } else {
          errorMessage = errorText || errorMessage;
        }
      } catch (e) {
        errorMessage = error.message || 'Failed to update workspace';
      }
      toast.error(errorMessage);
    },
  });

  // Delete workspace mutation
  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: number) => {
      return await apiRequest('DELETE', `/api/admin/workspaces/${workspaceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workspaces'] });
      toast.success('Workspace deleted successfully');
      setDeletingWorkspace(null);
      setDeleteConfirmationText('');
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to delete workspace';
      try {
        // Parse error message if it's in JSON format
        const errorText = error.message || '';
        if (errorText.includes('{') && errorText.includes('}')) {
          const jsonPart = errorText.substring(errorText.indexOf('{'));
          const parsed = JSON.parse(jsonPart);
          errorMessage = parsed.message || errorMessage;
        } else {
          errorMessage = errorText || errorMessage;
        }
      } catch (e) {
        errorMessage = error.message || 'Failed to delete workspace';
      }
      toast.error(errorMessage);
    },
  });

  // Switch workspace mutation
  const switchWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: number) => {
      return await apiRequest('POST', `/api/admin/workspaces/${workspaceId}/switch`);
    },
    onSuccess: () => {
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
      
      // Also refetch immediately to ensure UI updates
      queryClient.refetchQueries({ queryKey: ['/api/workspace/current'] });
      queryClient.refetchQueries({ queryKey: ['/api/auth/user'] });
      
      toast.success('Workspace switched successfully');
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to switch workspace';
      try {
        // Parse error message if it's in JSON format
        const errorText = error.message || '';
        if (errorText.includes('{') && errorText.includes('}')) {
          const jsonPart = errorText.substring(errorText.indexOf('{'));
          const parsed = JSON.parse(jsonPart);
          errorMessage = parsed.message || errorMessage;
        } else {
          errorMessage = errorText || errorMessage;
        }
      } catch (e) {
        errorMessage = error.message || 'Failed to switch workspace';
      }
      toast.error(errorMessage);
    },
  });

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    createWorkspaceMutation.mutate({ name, description });
  };

  const handleEditWorkspace = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setShowEditDialog(true);
  };

  const handleUpdateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkspace) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    updateWorkspaceMutation.mutate({
      id: editingWorkspace.id,
      name,
      description,
    });
  };

  const handleDeleteWorkspace = (workspace: Workspace) => {
    setDeletingWorkspace(workspace);
    setDeleteConfirmationText('');
  };

  const confirmDeleteWorkspace = () => {
    if (deletingWorkspace && deleteConfirmationText === deletingWorkspace.name) {
      deleteWorkspaceMutation.mutate(deletingWorkspace.id);
    }
  };

  const handleSwitchWorkspace = (workspaceId: number) => {
    switchWorkspaceMutation.mutate(workspaceId);
  };

  // Check if user can edit/delete a specific workspace
  const canManageWorkspace = (workspace: Workspace) => {
    // Organization owners can manage all workspaces
    if (organizationRole?.role === 'owner') {
      return true;
    }
    
    // Workspace administrators can manage their workspace
    if (userWorkspaceRoles && Array.isArray(userWorkspaceRoles)) {
      return userWorkspaceRoles.some((role: any) => 
        role.workspaceId === workspace.id && 
        role.role === 'administrator' && 
        role.isActive
      );
    }
    
    return false;
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Workspace Management</h1>
            <p className="text-muted-foreground">
              Create, manage, and monitor all workspaces in your organization
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </Button>
        </div>

        {/* Current Workspace Context */}
        {userWorkspaces && userWorkspaces.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Your Current Workspaces
              </CardTitle>
              <CardDescription>
                Workspaces you are currently a member of
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userWorkspaces.map((workspace: any) => (
                  <div key={workspace.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{workspace.name}</div>
                      {user?.currentWorkspaceId === workspace.id && (
                        <Badge className="bg-green-500 text-white">Current</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {workspace.uniqueId}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            All Workspaces
          </CardTitle>
          <CardDescription>
            View and manage all workspaces in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <ComponentLoading />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workspace</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspaces?.map((workspace: Workspace) => (
                    <TableRow key={workspace.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">{workspace.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {workspace.uniqueId}
                          </div>
                          {workspace.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {workspace.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{workspace.memberCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(workspace.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Activity className="h-3 w-3" />
                          {new Date(workspace.updatedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSwitchWorkspace(workspace.id)}
                            disabled={switchWorkspaceMutation.isPending}
                          >
                            <ArrowRightLeft className="h-3 w-3 mr-1" />
                            Switch
                          </Button>
                          {canManageWorkspace(workspace) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditWorkspace(workspace)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          {canManageWorkspace(workspace) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteWorkspace(workspace)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the workspace "{workspace.name}"?
                                    This action cannot be undone and will affect all {workspace.memberCount} members.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                  <Label htmlFor="confirmationText" className="text-sm font-medium">
                                    Type the workspace name "{workspace.name}" to confirm deletion:
                                  </Label>
                                  <Input
                                    id="confirmationText"
                                    value={deleteConfirmationText}
                                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                    placeholder={workspace.name}
                                    className="mt-2"
                                  />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setDeleteConfirmationText('')}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={confirmDeleteWorkspace}
                                    disabled={deleteConfirmationText !== workspace.name || deleteWorkspaceMutation.isPending}
                                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  >
                                    {deleteWorkspaceMutation.isPending ? 'Deleting...' : 'Delete Workspace'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Workspace Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace for your organization
            </DialogDescription>
          </DialogHeader>
          <form id="createWorkspaceForm" onSubmit={handleCreateWorkspace} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter workspace name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter workspace description"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createWorkspaceMutation.isPending}>
                {createWorkspaceMutation.isPending ? 'Creating...' : 'Create Workspace'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Workspace Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>
              Update workspace name and description
            </DialogDescription>
          </DialogHeader>
          {editingWorkspace && (
            <form onSubmit={handleUpdateWorkspace} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Workspace Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingWorkspace.name}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingWorkspace.description || ''}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-id">Workspace ID</Label>
                <Input
                  id="edit-id"
                  value={editingWorkspace.uniqueId}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateWorkspaceMutation.isPending}>
                  {updateWorkspaceMutation.isPending ? 'Updating...' : 'Update Workspace'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}