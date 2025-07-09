import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SUPPORTED_LANGUAGES, SOCIAL_PLATFORMS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ComponentLoading } from "@/components/ui/loading";
import { Upload, X, Eye, Image as ImageIcon, Loader2, Send, Brain, Edit, Sparkles, ChevronDown, ChevronUp, Plus, Wand2, Download } from "lucide-react";
import { 
  SiFacebook, 
  SiInstagram, 
  SiLinkedin, 
  SiTiktok, 
  SiYoutube, 
  SiDiscord, 
  SiTelegram,
  SiX
} from "react-icons/si";

// Database interfaces for user images and folders
interface DBImage {
  id: number;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  folder: string | null;
  binaryData: string; // base64 encoded
  createdAt: string;
  updatedAt: string;
}

interface DBFolder {
  id: number;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const manualPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
  content: z.string().min(1, "Content is required").max(2000, "Content must be 2000 characters or less"),
  language: z.string().min(1, "Language is required"),
  link: z.string().optional().transform((value) => value?.trim()).refine(
    (value) => {
      // Allow empty or "https://" as valid
      if (!value || value === "" || value === "https://") {
        return true;
      }
      // Validate as proper URL for other values
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: "Please enter a valid URL",
    }
  ),
  useAI: z.boolean().default(false),
  subject: z.string().optional(),
});

type ManualPostForm = z.infer<typeof manualPostSchema>;



export default function ManualPost() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<{title?: string, content?: string}>({});
  const [isAISectionCollapsed, setIsAISectionCollapsed] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<"library" | "upload" | "ai">("library");
  const [showAIImageDialog, setShowAIImageDialog] = useState(false);
  const [aiImagePrompt, setAiImagePrompt] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const MAX_IMAGES = 5;

  // Fetch user-specific images from database
  const { data: images = [], isLoading: imagesLoading } = useQuery<DBImage[]>({
    queryKey: ['/api/images'],
    enabled: isAuthenticated,
  });

  // Fetch user-specific folders from database
  const { data: folders = [], isLoading: foldersLoading } = useQuery<DBFolder[]>({
    queryKey: ['/api/folders'],
    enabled: isAuthenticated,
  });

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
      twitter: SiX,
    };
    return iconMap[platformId] || SiFacebook;
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create manual posts",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 1000);
    }
  }, [isAuthenticated, isLoading, toast, setLocation]);

  // Focus title field when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && titleInputRef.current) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
        }
      }, 100);
    }
  }, [isAuthenticated, isLoading]);

  // Initialize expanded folders for folders with selected images
  useEffect(() => {
    if (images.length > 0 && selectedImages.length > 0) {
      const imagesByFolder = images.reduce((acc: Record<string, DBImage[]>, image: DBImage) => {
        const folderName = image.folder || 'uncategorized';
        if (!acc[folderName]) {
          acc[folderName] = [];
        }
        acc[folderName].push(image);
        return acc;
      }, {} as Record<string, DBImage[]>);

      const foldersWithSelected = Object.keys(imagesByFolder).filter(folderName => 
        imagesByFolder[folderName].some((img: DBImage) => selectedImages.find((sel: DBImage) => sel.id === img.id))
      );
      
      const initialExpanded = foldersWithSelected.reduce((acc, folderName) => {
        acc[folderName] = true;
        return acc;
      }, {} as Record<string, boolean>);
      
      setExpandedFolders(prev => ({ ...initialExpanded, ...prev }));
    }
  }, [images, selectedImages]);

  const form = useForm<ManualPostForm>({
    resolver: zodResolver(manualPostSchema),
    mode: "onChange", // This will trigger validation on every change
    defaultValues: {
      title: "",
      content: "",
      language: "en",
      link: "https://",
      useAI: false,
      subject: "",
    },
  });

  // AI Content Generation Mutation
  const generateAIContentMutation = useMutation({
    mutationFn: async (subject: string) => {
      const response = await apiRequest("POST", "/api/ai/generate-content", {
        subject,
        language: form.getValues("language") || "en"
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAiGeneratedContent({
        title: data.title,
        content: data.content
      });
      
      // Auto-fill the form with AI-generated content
      form.setValue("title", data.title);
      form.setValue("content", data.content);
      
      // Trigger validation to clear any error messages
      form.trigger(["title", "content"]);
      
      // Collapse the AI section after successful generation
      setIsAISectionCollapsed(true);
      
      toast({
        title: "AI Content Generated",
        description: "Your post title and content have been generated by AI. You can edit them before publishing.",
      });
    },
    onError: (error) => {
      toast({
        title: "AI Generation Failed",
        description: "Unable to generate AI content. Please try again or create manually.",
        variant: "destructive",
      });
    },
  });

  // Image Upload Mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Image Uploaded",
        description: "Your image has been uploaded successfully and added to uncategorized folder.",
      });
      // Add the uploaded image to selected images
      setSelectedImages(prev => [...prev, data]);
      // Refresh images query
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Unable to upload image. Please try again.",
        variant: "destructive",
      });
    },
  });

  // AI Image Generation Mutation (mocked)
  const generateAIImageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/ai/generate-image", {
        prompt,
        size: "1024x1024",
        quality: "standard"
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "AI Image Generated",
        description: "Your AI-generated image has been created and added to your library.",
      });
      // Add the generated image to selected images
      setSelectedImages(prev => [...prev, data]);
      // Refresh images query
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
      setShowAIImageDialog(false);
      setAiImagePrompt("");
    },
    onError: (error) => {
      toast({
        title: "AI Image Generation Failed",
        description: "Unable to generate AI image. Please try again.",
        variant: "destructive",
      });
    },
  });



  // Create mutation for manual post preparation (no API call, just navigate)
  const createManualPostMutation = useMutation({
    mutationFn: async (data: ManualPostForm) => {
      // Prepare post data without API call - just organize the data for platform-content page
      const postData = {
        title: data.title,
        content: data.content,
        language: data.language,
        link: data.link || '',
        useAI: data.useAI,
        subject: data.subject || '',
        selectedImages: selectedImages,
        platforms: SOCIAL_PLATFORMS.map(platform => platform.id) // Default to all platforms for manual posts
      };
      
      // Return the prepared data (simulating async operation)
      return Promise.resolve(postData);
    },
    onSuccess: (postData) => {
      console.log("ManualPost: Prepared post data for platform-content:", postData);
      
      // Store the manual post data for platform-content page
      localStorage.setItem("pendingManualPost", JSON.stringify(postData));
      console.log("ManualPost: Stored pending manual post data");
      
      // Navigate to platform-content page to show content and "Publish NOW" button
      setLocation("/platforms-content");
    },
    onError: (error) => {
      toast({
        title: "Preparation Failed",
        description: "Unable to prepare manual post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ManualPostForm) => {
    createManualPostMutation.mutate(data);
  };

  const handleImageSelect = (image: any) => {
    if (selectedImages.find(img => img.id === image.id)) {
      // Remove image if already selected
      setSelectedImages(prev => prev.filter(img => img.id !== image.id));
    } else {
      // Check if we've reached the maximum limit
      if (selectedImages.length >= MAX_IMAGES) {
        toast({
          title: "Maximum Images Reached",
          description: `You can only select up to ${MAX_IMAGES} images per post.`,
          variant: "destructive",
        });
        return;
      }
      // Add image if under limit
      setSelectedImages(prev => [...prev, image]);
    }
  };

  const handleFolderSelect = (folderName: string) => {
    setSelectedFolder(selectedFolder === folderName ? null : folderName);
  };

  const toggleFolderExpansion = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Get unique folders from database images, including "uncategorized" for null folders
  const getFoldersWithImages = () => {
    const folderNames = images.map((img: DBImage) => img.folder || 'uncategorized');
    const uniqueFolders = Array.from(new Set(folderNames));
    return uniqueFolders.sort((a, b) => {
      // Put "uncategorized" at the end
      if (a === 'uncategorized') return 1;
      if (b === 'uncategorized') return -1;
      return a.localeCompare(b);
    });
  };

  // Get images for currently selected folder from database
  const getImagesForFolder = (folderName: string) => {
    return images.filter((img: DBImage) => {
      if (folderName === 'uncategorized') {
        return !img.folder;
      }
      return img.folder === folderName;
    });
  };

  const availableFolders = getFoldersWithImages();

  const handleRemoveImage = (imageId: number) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  };



  const handleAIToggle = (checked: boolean) => {
    setUseAI(checked);
    form.setValue("useAI", checked);
    
    // Clear AI-generated content when switching to manual
    if (!checked) {
      setAiGeneratedContent({});
      setIsAISectionCollapsed(false);
    }
  };

  const handleGenerateAIContent = () => {
    const subject = form.getValues("subject");
    if (!subject?.trim()) {
      toast({
        title: "Subject Required",
        description: "Please enter a subject description for AI content generation.",
        variant: "destructive",
      });
      return;
    }
    
    generateAIContentMutation.mutate(subject);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check if we've reached the maximum limit
    if (selectedImages.length >= MAX_IMAGES) {
      toast({
        title: "Maximum Images Reached",
        description: `You can only select up to ${MAX_IMAGES} images per post.`,
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'uncategorized'); // Always save to uncategorized
    
    uploadImageMutation.mutate(formData);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle AI image generation
  const handleGenerateAIImage = () => {
    if (!aiImagePrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for the AI image.",
        variant: "destructive",
      });
      return;
    }

    // Check if we've reached the maximum limit
    if (selectedImages.length >= MAX_IMAGES) {
      toast({
        title: "Maximum Images Reached",
        description: `You can only select up to ${MAX_IMAGES} images per post.`,
        variant: "destructive",
      });
      return;
    }

    generateAIImageMutation.mutate(aiImagePrompt);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="px-8 py-8">
        <ComponentLoading text="Checking authentication..." />
      </div>
    );
  }

  // Don't render form if not authenticated (redirect will happen via useEffect)
  if (!isAuthenticated) {
    return (
      <div className="px-8 py-8">
        <ComponentLoading text="Redirecting to login..." />
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Create Your Post Manually</h1>
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="modern-card p-8 space-y-6">
            
            {/* AI/Manual Toggle */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                      {useAI ? <Brain className="w-5 h-5 text-purple-600 dark:text-purple-300" /> : <Edit className="w-5 h-5 text-purple-600 dark:text-purple-300" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        {useAI ? "AI-Assisted Post Creation" : "Manual Post Creation"}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        {useAI 
                          ? "Let AI generate your post title and content based on your subject description"
                          : "Create your post title and content manually"
                        }
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={useAI}
                    onCheckedChange={handleAIToggle}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
              </CardHeader>
            </Card>

            {/* AI Subject Input */}
            {useAI && (
              <Collapsible open={!isAISectionCollapsed} onOpenChange={(open) => setIsAISectionCollapsed(!open)}>
                <Card className="border-2 border-dashed border-purple-200 bg-purple-50/30">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-purple-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center text-base">
                            <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                            {isAISectionCollapsed ? "AI Content Generated" : "You choose to use AI support for Title and Post content, describe your subject below"}
                          </CardTitle>
                          <CardDescription>
                            {isAISectionCollapsed 
                              ? "Content has been generated and filled in the form. Click to edit the subject again."
                              : "Tell us what you want to post about, and AI will generate the title and content for you"
                            }
                          </CardDescription>
                        </div>
                        {isAISectionCollapsed ? (
                          <ChevronDown className="w-4 h-4 text-purple-600" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={4}
                                className="resize-none"
                                placeholder="Describe your post subject in detail... What are you posting about? Include key points, context, and any specific details you want to highlight."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        onClick={handleGenerateAIContent}
                        disabled={generateAIContentMutation.isPending}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {generateAIContentMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Brain className="w-4 h-4 mr-2" />
                        )}
                        {generateAIContentMutation.isPending ? "Generating..." : "Generate AI Content"}
                      </Button>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Post Title *
                    {aiGeneratedContent.title && (
                      <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      ref={titleInputRef}
                      maxLength={200}
                      placeholder={useAI ? "AI will generate your title here..." : "Enter your post title..."}
                      className={aiGeneratedContent.title ? "bg-purple-50/50 border-purple-200" : ""}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500">
                    {field.value?.length || 0}/200 characters
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content Field */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Post Content *
                    {aiGeneratedContent.content && (
                      <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={6}
                      maxLength={2000}
                      className={`resize-none ${aiGeneratedContent.content ? "bg-purple-50/50 border-purple-200" : ""}`}
                      placeholder={useAI ? "AI will generate your content here..." : "Write your post content here..."}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500">
                    {field.value?.length || 0}/2000 characters
                    {aiGeneratedContent.content && (
                      <span className="ml-2 text-purple-600">
                        • You can edit this AI-generated content
                      </span>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language */}
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Link */}
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (Optional)</FormLabel>
                    <FormControl>
                      <Input type="url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Selection */}
            <div>
              <Label className="text-base font-medium">Images</Label>
              <div className="mt-3 space-y-4">
                {/* Selected Images */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Images ({selectedImages.length}/{MAX_IMAGES})
                    {selectedImages.length >= MAX_IMAGES && (
                      <Badge variant="destructive" className="ml-2">Maximum reached</Badge>
                    )}
                  </h4>
                  {selectedImages.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {selectedImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={`data:${image.mimeType};base64,${image.binaryData}`}
                            alt={image.originalName}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(image.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b-lg">
                            <div className="truncate">{image.originalName}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-center bg-gray-50 dark:bg-gray-800/50">
                      No images selected. You can select up to {MAX_IMAGES} images.
                    </div>
                  )}
                </div>

                {/* Image Management Tabs */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowImageSelector(!showImageSelector)}
                  className="w-full"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {showImageSelector ? "Hide" : "Manage"} Images
                </Button>

                {/* Enhanced Image Management with Tabs */}
                {showImageSelector && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Image Management</h4>
                      <Badge variant="secondary" className="text-xs">
                        {selectedImages.length}/{MAX_IMAGES} selected
                      </Badge>
                    </div>

                    <Tabs value={activeImageTab} onValueChange={(value) => setActiveImageTab(value as "library" | "upload" | "ai")}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="library" className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Library
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Upload
                        </TabsTrigger>
                        <TabsTrigger value="ai" className="flex items-center gap-2">
                          <Wand2 className="w-4 h-4" />
                          AI Generate
                        </TabsTrigger>
                      </TabsList>

                      {/* Library Tab */}
                      <TabsContent value="library" className="mt-4">
                        <div className="space-y-3">
                          {/* Loading State */}
                          {(imagesLoading || foldersLoading) && (
                            <div className="flex items-center justify-center py-8">
                              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading your images...</span>
                              </div>
                            </div>
                          )}

                          {/* No Images State */}
                          {!imagesLoading && !foldersLoading && images.length === 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                              <p className="mb-2">No images in your library yet</p>
                              <p className="text-sm">Upload images using the Upload tab or generate them with AI</p>
                            </div>
                          )}
                          
                          {/* Grouped image display by folders */}
                          {!imagesLoading && !foldersLoading && images.length > 0 && (() => {
                            // Group images by folder
                            const imagesByFolder = images.reduce((acc: Record<string, DBImage[]>, image: DBImage) => {
                              const folderName = image.folder || 'uncategorized';
                              if (!acc[folderName]) {
                                acc[folderName] = [];
                              }
                              acc[folderName].push(image);
                              return acc;
                            }, {} as Record<string, DBImage[]>);

                            // Sort folders so that ones with selected images appear first
                            const sortedFolders = Object.keys(imagesByFolder).sort((a, b) => {
                              const aHasSelected = imagesByFolder[a].some((img: DBImage) => selectedImages.find((sel: DBImage) => sel.id === img.id));
                              const bHasSelected = imagesByFolder[b].some((img: DBImage) => selectedImages.find((sel: DBImage) => sel.id === img.id));
                              if (aHasSelected && !bHasSelected) return -1;
                              if (!aHasSelected && bHasSelected) return 1;
                              return a.localeCompare(b);
                            });

                            return (
                              <div className="space-y-2">
                                {sortedFolders.map((folderName) => {
                                  const folderImages = imagesByFolder[folderName];
                                  const selectedInFolder = folderImages.filter((img: DBImage) => selectedImages.find((sel: DBImage) => sel.id === img.id));
                                  const isExpanded = expandedFolders[folderName] ?? false;
                                  
                                  return (
                                    <div key={folderName} className="space-y-2">
                                      {/* Clickable Folder Header */}
                                      <div 
                                        className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg -mx-2 transition-colors"
                                        onClick={() => toggleFolderExpansion(folderName)}
                                      >
                                        <div className="flex items-center space-x-2">
                                          <div className="flex items-center space-x-1">
                                            {isExpanded ? (
                                              <ChevronDown className="w-4 h-4 text-gray-500" />
                                            ) : (
                                              <ChevronUp className="w-4 h-4 text-gray-500 transform rotate-180" />
                                            )}
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                              {folderName === 'uncategorized' ? '📁 Uncategorized' : `📁 ${folderName}`}
                                            </h4>
                                          </div>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            ({folderImages.length} image{folderImages.length !== 1 ? 's' : ''})
                                          </span>
                                          {selectedInFolder.length > 0 && (
                                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                                              {selectedInFolder.length} selected
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Collapsible Folder Images Grid */}
                                      {isExpanded && (
                                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 ml-4 border-l-2 border-gray-100 dark:border-gray-700 pl-4">
                                          {folderImages.map((image: DBImage) => {
                                            const isSelected = selectedImages.find((img: DBImage) => img.id === image.id);
                                            const isDisabled = !isSelected && selectedImages.length >= MAX_IMAGES;
                                            
                                            return (
                                              <div
                                                key={image.id}
                                                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                                  isSelected 
                                                    ? "border-primary shadow-md" 
                                                    : isDisabled 
                                                      ? "border-gray-200 dark:border-gray-600 opacity-50 cursor-not-allowed"
                                                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                                }`}
                                                onClick={() => !isDisabled && handleImageSelect(image)}
                                              >
                                                <img
                                                  src={`data:${image.mimeType};base64,${image.binaryData}`}
                                                  alt={image.originalName}
                                                  className="w-full h-16 object-cover"
                                                />
                                                {isSelected && (
                                                  <div className="absolute inset-0 bg-primary bg-opacity-20 flex items-center justify-center">
                                                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                      <Eye className="w-3 h-3 text-white" />
                                                    </div>
                                                  </div>
                                                )}
                                                {isDisabled && !isSelected && (
                                                  <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
                                                    <div className="text-white text-xs font-medium">Max</div>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </TabsContent>

                      {/* Upload Tab */}
                      <TabsContent value="upload" className="mt-4">
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                              <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload New Image</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                Select an image file to upload. It will be added to your uncategorized folder and automatically selected for this post.
                              </p>
                              <div className="flex flex-col items-center space-y-2">
                                <Button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={uploadImageMutation.isPending || selectedImages.length >= MAX_IMAGES}
                                  className="flex items-center gap-2"
                                >
                                  {uploadImageMutation.isPending ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-4 h-4" />
                                      Choose File
                                    </>
                                  )}
                                </Button>
                                {selectedImages.length >= MAX_IMAGES && (
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    Maximum {MAX_IMAGES} images reached
                                  </p>
                                )}
                              </div>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Supported formats: JPG, PNG, GIF • Maximum size: 5MB
                          </div>
                        </div>
                      </TabsContent>

                      {/* AI Generate Tab */}
                      <TabsContent value="ai" className="mt-4">
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-lg p-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                              <Wand2 className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                              <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Generate AI Image</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                Describe the image you want to create, and AI will generate it for you.
                              </p>
                              <div className="space-y-3">
                                <Textarea
                                  placeholder="Describe the image you want to generate... (e.g., 'A futuristic city skyline at sunset with flying cars')"
                                  value={aiImagePrompt}
                                  onChange={(e) => setAiImagePrompt(e.target.value)}
                                  className="min-h-20 text-sm"
                                />
                                <Button
                                  type="button"
                                  onClick={handleGenerateAIImage}
                                  disabled={generateAIImageMutation.isPending || selectedImages.length >= MAX_IMAGES || !aiImagePrompt.trim()}
                                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                >
                                  {generateAIImageMutation.isPending ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Generating AI Image...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-4 h-4 mr-2" />
                                      Generate Image
                                    </>
                                  )}
                                </Button>
                                {selectedImages.length >= MAX_IMAGES && (
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    Maximum {MAX_IMAGES} images reached
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            AI-generated images will be automatically added to your library and selected for this post
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            </div>



            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={createManualPostMutation.isPending}
                className="gradient-primary"
              >
                {createManualPostMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {createManualPostMutation.isPending ? "Creating Post..." : "Create Manual Post"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}