import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Play, Plus, Layers, Clock, Repeat, Zap, HelpCircle, Loader2, Power } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Template {
  id: number;
  name: string;
  objective: string;
  frequency: string;
  time: string;
  timezone: string;
  isActive: boolean;
  lastExecutedAt: string | null;
  createdAt: string;
}

export default function Templates() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch templates from database
  const { data: templates = [], isLoading, refetch } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  // Execute template mutation
  const executeTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return await apiRequest("POST", `/api/templates/${templateId}/execute`);
    },
    onSuccess: (data, templateId) => {
      toast({
        title: "Template Executed",
        description: "Template has been successfully executed and content generated.",
      });
      // Refresh templates to update last execution time
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Execution Failed",
        description: error.message || "Failed to execute template",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return await apiRequest("DELETE", `/api/templates/${templateId}`);
    },
    onSuccess: () => {
      toast({
        title: "Template Deleted",
        description: "Template has been successfully removed.",
      });
      // Refresh templates list
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  // Toggle template status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return await apiRequest("PATCH", `/api/templates/${templateId}/toggle-status`);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Status Updated",
        description: `Template ${data.isActive ? 'activated' : 'deactivated'} successfully.`,
      });
      // Refresh templates list
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Status Update Failed",
        description: error.message || "Failed to update template status",
        variant: "destructive",
      });
    },
  });

  const handleCreateNewTemplate = () => {
    // Navigate to AI post creation with template creation mode
    setLocation("/ai-post?mode=template");
  };

  const handleEditTemplate = (templateId: number) => {
    // Navigate to AI post edit with template data
    setLocation(`/ai-post?edit=${templateId}`);
  };

  const handleRunTemplate = (templateId: number) => {
    executeTemplateMutation.mutate(templateId);
  };

  const handleDeleteTemplate = (templateId: number) => {
    deleteTemplateMutation.mutate(templateId);
  };

  const handleToggleStatus = (templateId: number) => {
    toggleStatusMutation.mutate(templateId);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string, timezone: string) => {
    return `${time} (${timezone})`;
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading templates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600 mt-2">Manage your automated posting templates</p>
        </div>
        <Button 
          onClick={handleCreateNewTemplate} 
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Template</span>
        </Button>
      </div>

      {/* Templates Explanation Accordion */}
      <Accordion type="single" collapsible className="mb-8">
        <AccordionItem value="explanation">
          <AccordionTrigger className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <span>What are Templates?</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="bg-blue-50 p-6 rounded-lg space-y-4">
              <div className="flex items-start space-x-3">
                <Repeat className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Automated Scheduling</h3>
                  <p className="text-gray-600">Templates run automatically based on your configured schedule (daily, weekly, monthly)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Zap className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">AI Content Generation</h3>
                  <p className="text-gray-600">Each template execution generates fresh AI content based on your original subject and settings</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Layers className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Multi-Platform Publishing</h3>
                  <p className="text-gray-600">Content is automatically adapted and published to all your configured social media platforms</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Your Templates</span>
          </CardTitle>
          <CardDescription>
            {templates.length} template{templates.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Yet</h3>
              <p className="text-gray-600 mb-6">Create your first automated posting template to get started</p>
              <Button 
                onClick={handleCreateNewTemplate} 
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Template</span>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="font-semibold text-gray-900">Name</TableHead>
                    <TableHead className="font-semibold text-gray-900">Objective</TableHead>
                    <TableHead className="font-semibold text-gray-900">Date Creation</TableHead>
                    <TableHead className="font-semibold text-gray-900">Last Execution</TableHead>
                    <TableHead className="font-semibold text-gray-900">Schedule</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id} className="hover:bg-gray-50 border-b">
                      <TableCell className="py-4">
                        <div className="font-medium text-gray-900">{template.name}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="max-w-xs truncate text-gray-600">
                          {template.objective}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm text-gray-600">
                          {formatDate(template.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm text-gray-600">
                          {formatDate(template.lastExecutedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{template.frequency}</div>
                          <div className="text-gray-500">{formatTime(template.time, template.timezone)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={template.isActive}
                            onCheckedChange={() => handleToggleStatus(template.id)}
                            disabled={toggleStatusMutation.isPending}
                          />
                          <span className={`text-sm font-medium ${template.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                            {template.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Run Now Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRunTemplate(template.id)}
                            disabled={executeTemplateMutation.isPending || !template.isActive}
                            className={`flex items-center space-x-1 ${
                              template.isActive 
                                ? "hover:bg-green-50 hover:border-green-300 hover:text-green-700" 
                                : "opacity-50 cursor-not-allowed"
                            }`}
                            title={!template.isActive ? "Template must be active to run" : "Execute template now"}
                          >
                            {executeTemplateMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            <span>Run</span>
                          </Button>

                          {/* Edit Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTemplate(template.id)}
                            className="flex items-center space-x-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </Button>

                          {/* Delete Button with Confirmation */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{template.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTemplate(template.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleteTemplateMutation.isPending}
                                >
                                  {deleteTemplateMutation.isPending ? (
                                    <div className="flex items-center space-x-2">
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>Deleting...</span>
                                    </div>
                                  ) : (
                                    "Delete Template"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
    </div>
  );
}