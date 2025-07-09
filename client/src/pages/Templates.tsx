import { useState, useEffect } from "react";
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
import { 
  SiFacebook, 
  SiInstagram, 
  SiLinkedin, 
  SiTiktok, 
  SiYoutube, 
  SiDiscord, 
  SiTelegram 
} from "react-icons/si";

interface Template {
  id: number;
  name: string;
  objective: string;
  frequency: string;
  time: string;
  timezone: string;
  targetPlatforms: string[];
  isActive: boolean;
  lastExecutedAt: string | null;
  createdAt: string;
}

export default function Templates() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [highlightedTemplateId, setHighlightedTemplateId] = useState<number | null>(null);

  // Helper function to get social media icons
  const getSocialMediaIcon = (platformId: string) => {
    const iconMap: Record<string, any> = {
      facebook: SiFacebook,
      instagram: SiInstagram,
      linkedin: SiLinkedin,
      tiktok: SiTiktok,
      youtube: SiYoutube,
      discord: SiDiscord,
      telegram: SiTelegram,
    };
    return iconMap[platformId] || null;
  };

  // Fetch templates from database
  const { data: templates = [], isLoading, refetch } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
    refetchOnMount: true, // Always refetch when component mounts
  });

  // Debug logging
  useEffect(() => {
    if (templates.length > 0) {
      console.log("Templates page: Loaded templates:", templates);
    }
  }, [templates]);

  // Check for newly created template to highlight
  useEffect(() => {
    const highlightId = localStorage.getItem("highlightTemplateId");
    if (highlightId && templates.length > 0) {
      const templateId = parseInt(highlightId);
      const templateExists = templates.find(t => t.id === templateId);
      
      if (templateExists) {
        setHighlightedTemplateId(templateId);
        localStorage.removeItem("highlightTemplateId");
        
        // Show success toast
        toast({
          title: "Template Created Successfully",
          description: "Your new template has been created and is highlighted below.",
        });
        
        // Remove highlight after 5 seconds
        setTimeout(() => {
          setHighlightedTemplateId(null);
        }, 5000);
      }
    }
  }, [templates, toast]);

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
    // Navigate to manual post creation for new template
    setLocation("/manual-post-wizard");
  };

  const handleEditTemplate = (templateId: number) => {
    // Navigate to manual post creation for editing template
    setLocation("/manual-post-wizard");
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
    <div className="page-content">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Templates</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your automated posting templates</p>
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
        <AccordionItem value="explanation" className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700 rounded-lg px-4">
          <AccordionTrigger className="text-purple-700 dark:text-purple-300 hover:no-underline">
            <div className="flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              What are Templates?
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Templates are powerful automation tools that create and publish AI-generated content on a recurring schedule. 
              They save you time by automatically generating fresh, engaging content based on your predefined settings.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Repeat className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Automated Scheduling</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Templates run automatically based on your configured schedule (daily, weekly, monthly)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">AI Content Generation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Each template execution generates fresh AI content based on your original subject and settings</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Layers className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Multi-Platform Publishing</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Content is automatically adapted and published to all your configured social media platforms</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700 mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Pro Tip:</strong> Templates with Review execution mode require approval before publishing, while Auto mode 
                publishes content immediately without human intervention.
              </p>
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
            {templates?.length || 0} template{(templates?.length || 0) !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(templates?.length || 0) === 0 ? (
            <div className="text-center py-12">
              <Layers className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Templates Yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Create your first automated posting template to get started</p>
              <Button 
                onClick={handleCreateNewTemplate} 
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Template</span>
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 dark:border-gray-700">
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Name</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Objective</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Target Platforms</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Date Creation</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Last Execution</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Schedule</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white">Status</TableHead>
                    <TableHead className="text-right font-semibold text-gray-900 dark:text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates?.map((template) => (
                    <TableRow 
                      key={template.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800 border-b dark:border-gray-700 transition-all duration-300 ${
                        highlightedTemplateId === template.id 
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 shadow-lg' 
                          : ''
                      }`}
                    >
                      <TableCell className="py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{template.name}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="max-w-xs truncate text-gray-600 dark:text-gray-300">
                          {template.objective}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {template.targetPlatforms && template.targetPlatforms.length > 0 ? (
                            template.targetPlatforms.map((platformId) => {
                              const IconComponent = getSocialMediaIcon(platformId);
                              return IconComponent ? (
                                <div key={platformId} className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700">
                                  <IconComponent className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                                </div>
                              ) : null;
                            })
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">No platforms</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(template.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(template.lastExecutedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">{template.frequency}</div>
                          <div className="text-gray-500 dark:text-gray-400">{formatTime(template.time, template.timezone)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={template.isActive}
                            onCheckedChange={() => handleToggleStatus(template.id)}
                            disabled={toggleStatusMutation.isPending}
                          />
                          <span className={`text-sm font-medium ${template.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
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

              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-4">
                {templates?.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`p-4 transition-all duration-300 ${
                      highlightedTemplateId === template.id 
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 shadow-lg' 
                        : ''
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={template.isActive}
                            onCheckedChange={() => handleToggleStatus(template.id)}
                            disabled={toggleStatusMutation.isPending}
                          />
                          <span className={`text-sm font-medium ${template.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                            {template.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <div className="max-w-full truncate">{template.objective}</div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Platforms:</span>
                        <div className="flex flex-wrap gap-1">
                          {template.targetPlatforms && template.targetPlatforms.length > 0 ? (
                            template.targetPlatforms.map((platformId) => {
                              const IconComponent = getSocialMediaIcon(platformId);
                              return IconComponent ? (
                                <div key={platformId} className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700">
                                  <IconComponent className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                                </div>
                              ) : null;
                            })
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">No platforms</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Created:</span>
                          <div className="text-gray-700 dark:text-gray-300">{formatDate(template.createdAt)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Last Run:</span>
                          <div className="text-gray-700 dark:text-gray-300">{formatDate(template.lastExecutedAt)}</div>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Schedule:</span>
                        <div className="text-gray-700 dark:text-gray-300">
                          {template.frequency} at {formatTime(template.time, template.timezone)}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-2">
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
                        >
                          {executeTemplateMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                          <span>Run</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTemplate(template.id)}
                          className="flex items-center space-x-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </Button>
                        
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
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}