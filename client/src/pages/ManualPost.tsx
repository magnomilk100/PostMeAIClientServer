import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { apiRequest } from "@/lib/queryClient";
import { SUPPORTED_LANGUAGES, SOCIAL_PLATFORMS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ComponentLoading } from "@/components/ui/loading";
import { Upload, X, Eye, Image as ImageIcon, Loader2, Send, Brain, Edit, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
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

                {/* Image Selection Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowImageSelector(!showImageSelector)}
                  className="w-full"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {showImageSelector ? "Hide" : "Select"} Images from Library
                </Button>

                {/* Image Library */}
                {showImageSelector && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Available Images by Folder</h4>
                    
                    {/* Loading State */}
                    {(imagesLoading || foldersLoading) && (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Loading your images...</span>
                        </div>
                      </div>
                    )}

                    {/* No Images State */}
                    {!imagesLoading && !foldersLoading && images.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="mb-2">No images in your library yet</p>
                        <p className="text-sm">Upload images on the Images page to see them here</p>
                      </div>
                    )}
                    
                    {/* Folder Browsing */}
                    {!imagesLoading && !foldersLoading && images.length > 0 && (
                      <div className="space-y-3">
                      {availableFolders.map((folderName) => {
                        const folderImages = getImagesForFolder(folderName);
                        const isExpanded = selectedFolder === folderName;
                        
                        return (
                          <div key={folderName} className="border border-gray-200 rounded-lg bg-white">
                            {/* Folder Header */}
                            <div 
                              className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => handleFolderSelect(folderName)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <ImageIcon className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900 capitalize">{folderName}</h5>
                                  <p className="text-sm text-gray-500">{folderImages.length} image{folderImages.length !== 1 ? 's' : ''}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {/* Show selected images count for this folder */}
                                {selectedImages.filter((img: DBImage) => {
                                  const imgFolder = img.folder || 'uncategorized';
                                  return imgFolder === folderName;
                                }).length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {selectedImages.filter((img: DBImage) => {
                                      const imgFolder = img.folder || 'uncategorized';
                                      return imgFolder === folderName;
                                    }).length} selected
                                  </Badge>
                                )}
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                            
                            {/* Folder Images (Expandable) */}
                            {isExpanded && (
                              <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700">
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-3">
                                  {folderImages.map((image) => {
                                    const isSelected = selectedImages.find(img => img.id === image.id);
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
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1">
                                          <div className="truncate">{image.originalName}</div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      </div>
                    )}
                    
                    {/* Tips section - show regardless of loading state */}
                    {!imagesLoading && !foldersLoading && (
                      <div className="mt-4 text-xs text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-4 h-4 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-300 text-xs">i</span>
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-200">Image Selection Tips:</span>
                      </div>
                      <ul className="ml-6 space-y-1">
                        <li>• Click folder names to expand and browse images</li>
                        <li>• You can select up to {MAX_IMAGES} images maximum</li>
                        <li>• Click images to select/deselect them</li>
                        <li>• Selected images will appear above</li>
                      </ul>
                      </div>
                    )}
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