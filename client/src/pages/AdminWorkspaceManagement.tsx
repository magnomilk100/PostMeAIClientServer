import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAccess } from "@/hooks/useOrganizationRole";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Building, Users, Activity, Edit, Trash2, ArrowRightLeft, Plus, Settings } from "lucide-react";
import { ComponentLoading } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Workspace {
  id: number;
  name: string;
  description?: string;
  uniqueId: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export default function AdminWorkspaceManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasAdminAccess, isLoading: adminAccessLoading } = useAdminAccess();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);

  // Fetch workspaces
  const { data: workspaces, isLoading, error } = useQuery({
    queryKey: ['/api/admin/workspaces'],
    enabled: hasAdminAccess && !adminAccessLoading,
  });

  // Create workspace mutation
  const createWorkspaceMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const workspaceData = {
        name: data.get('name') as string,
        description: data.get('description') as string || undefined,
      };
      return apiRequest('POST', '/api/admin/workspaces', workspaceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workspaces'] });
      setShowCreateDialog(false);
      toast({
        title: "Workspace created",
        description: "The workspace has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating workspace",
        description: error.message || "Failed to create workspace",
        variant: "destructive",
      });
    },
  });

  // Update workspace mutation
  const updateWorkspaceMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const workspaceData = {
        name: data.get('name') as string,
        description: data.get('description') as string || undefined,
      };
      return apiRequest('PATCH', `/api/admin/workspaces/${editingWorkspace?.id}`, workspaceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workspaces'] });
      setShowEditDialog(false);
      setEditingWorkspace(null);
      toast({
        title: "Workspace updated",
        description: "The workspace has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating workspace",
        description: error.message || "Failed to update workspace",
        variant: "destructive",
      });
    },
  });

  // Delete workspace mutation
  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: number) => {
      return apiRequest('DELETE', `/api/admin/workspaces/${workspaceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/workspaces'] });
      setWorkspaceToDelete(null);
      setDeleteConfirmationText('');
      toast({
        title: "Workspace deleted",
        description: "The workspace has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting workspace",
        description: error.message || "Failed to delete workspace",
        variant: "destructive",
      });
    },
  });

  // Switch workspace mutation
  const switchWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: number) => {
      return apiRequest('POST', '/api/user/switch-workspace', { workspaceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Workspace switched",
        description: "You have successfully switched workspaces",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error switching workspace",
        description: error.message || "Failed to switch workspace",
        variant: "destructive",
      });
    },
  });

  const handleCreateWorkspace = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createWorkspaceMutation.mutate(formData);
  };

  const handleUpdateWorkspace = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateWorkspaceMutation.mutate(formData);
  };

  const handleEditWorkspace = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setShowEditDialog(true);
  };

  const handleDeleteWorkspace = (workspace: Workspace) => {
    setWorkspaceToDelete(workspace);
  };

  const confirmDeleteWorkspace = () => {
    if (workspaceToDelete && deleteConfirmationText === workspaceToDelete.name) {
      deleteWorkspaceMutation.mutate(workspaceToDelete.id);
    }
  };

  const handleSwitchWorkspace = (workspaceId: number) => {
    switchWorkspaceMutation.mutate(workspaceId);
  };

  const canManageWorkspace = (workspace: Workspace) => {
    return hasAdminAccess;
  };

  if (adminAccessLoading) {
    return <ComponentLoading />;
  }

  if (!hasAdminAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              You don't have permission to access this page.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentWorkspaceId = (user as any)?.currentWorkspaceId;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Workspace Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage workspaces across your organization
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Workspace
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Workspaces
          </CardTitle>
          <CardDescription>
            {Array.isArray(workspaces) ? workspaces.length : 0} workspace(s) in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ComponentLoading />
          ) : error ? (
            <div className="text-center text-red-500 py-8">
              Error loading workspaces: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          ) : !Array.isArray(workspaces) || workspaces.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No workspaces found</p>
              <p className="text-sm">Create your first workspace to get started</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(workspaces) && workspaces.map((workspace: Workspace) => {
                    const isCurrentWorkspace = currentWorkspaceId === workspace.id;
                    return (
                      <TableRow 
                        key={workspace.id}
                        className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                          isCurrentWorkspace ? 'bg-purple-50 dark:bg-purple-950/20' : ''
                        }`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {workspace.name}
                                {isCurrentWorkspace && (
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {workspace.uniqueId}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {workspace.description || <span className="text-muted-foreground">No description</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-3 w-3" />
                            {workspace.memberCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={workspace.isActive ? "default" : "secondary"}>
                            {workspace.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Activity className="h-3 w-3" />
                            {new Date(workspace.updatedAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              onClick={() => handleSwitchWorkspace(workspace.id)}
                              disabled={switchWorkspaceMutation.isPending || isCurrentWorkspace}
                              className={`
                                ${isCurrentWorkspace 
                                  ? 'bg-purple-100 text-purple-700 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105'
                                }
                              `}
                            >
                              <ArrowRightLeft className="h-3 w-3 mr-1" />
                              {isCurrentWorkspace ? 'Active' : 'Switch'}
                            </Button>
                            {canManageWorkspace(workspace) && (
                              <Button
                                size="sm"
                                onClick={() => handleEditWorkspace(workspace)}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            )}
                            {canManageWorkspace(workspace) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    onClick={() => handleDeleteWorkspace(workspace)}
                                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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
                    );
                  })}
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
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createWorkspaceMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
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
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                  className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateWorkspaceMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
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