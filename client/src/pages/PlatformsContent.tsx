import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { 
  SiFacebook, 
  SiInstagram, 
  SiLinkedin, 
  SiTiktok, 
  SiYoutube, 
  SiDiscord, 
  SiTelegram 
} from "react-icons/si";

// Platform icon mapping
const getPlatformIcon = (platformId: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    facebook: SiFacebook,
    instagram: SiInstagram,
    linkedin: SiLinkedin,
    tiktok: SiTiktok,
    youtube: SiYoutube,
    discord: SiDiscord,
    telegram: SiTelegram,
  };
  return iconMap[platformId] || SiFacebook;
};

export default function PlatformsContent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isManualPost, setIsManualPost] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    SOCIAL_PLATFORMS.map(p => p.id)
  );
  
  useEffect(() => {
    const checkForMockResponse = () => {
      // Check for mock API response first (from new manual post flow)
      const mockResponse = localStorage.getItem("mockPostResponse");
      
      console.log("PlatformsContent: Checking localStorage for mockPostResponse...", !!mockResponse);
      
      if (mockResponse) {
        console.log("PlatformsContent: Found mockPostResponse in localStorage");
        const apiResponseData = JSON.parse(mockResponse);
        console.log("PlatformsContent: Parsed API response data:", apiResponseData);
        
        setIsManualPost(true);
        setPost(apiResponseData.post);
        setGeneratedContent(apiResponseData.generatedContent);
        
        console.log("PlatformsContent: Set post and generated content:", { 
          post: apiResponseData.post, 
          generatedContent: apiResponseData.generatedContent 
        });
        
        // Clear the mock response data
        localStorage.removeItem("mockPostResponse");
        return true; // Found data
      }
      return false; // No data found
    };

    const checkLegacyData = () => {
      // Check for legacy manual post data (fallback)
      const pendingManualPost = localStorage.getItem("pendingManualPost");
      
      if (pendingManualPost) {
        const manualPostData = JSON.parse(pendingManualPost);
        setIsManualPost(true);
        setPost(manualPostData);
        
        // Create generated content structure for manual posts with selected images
        const mockGeneratedContent = {
          title: manualPostData.title,
          body: manualPostData.content,
          imageUrl: null,
          selectedImages: manualPostData.selectedImages || [],
          platformContent: {}
        };
        setGeneratedContent(mockGeneratedContent);
        
        // Clear the pending manual post data
        localStorage.removeItem("pendingManualPost");
        return true;
      } else {
        // Check for regular AI post data
        const storedPost = localStorage.getItem("currentPost");
        const storedContent = localStorage.getItem("generatedContent");
        
        if (storedPost && storedContent) {
          setPost(JSON.parse(storedPost));
          setGeneratedContent(JSON.parse(storedContent));
          setIsManualPost(false);
          return true;
        } else {
          setLocation("/post");
          return false;
        }
      }
    };

    // Try immediately
    if (checkForMockResponse()) {
      return;
    }

    // If not found, try again after a short delay (in case of timing issues)
    const timeout = setTimeout(() => {
      if (checkForMockResponse()) {
        return;
      }
      
      // Fallback to checking legacy data
      console.log("PlatformsContent: No mock response found, checking legacy data...");
      checkLegacyData();
    }, 200); // 200ms delay

    return () => clearTimeout(timeout);
  }, [setLocation]);

  const publishMutation = useMutation({
    mutationFn: async (platforms: string[]) => {
      if (!post) throw new Error("No post data");
      
      if (isManualPost) {
        // Handle manual post creation and publishing (two-step process)
        // Step 1: Create the manual post
        const createResponse = await apiRequest("POST", "/api/posts/manual", {
          ...post,
          platforms: platforms
        });
        const createData = await createResponse.json();
        
        // Step 2: Publish the created post
        const publishResponse = await apiRequest("POST", `/api/posts/${createData.post.id}/publish`, {
          platforms: platforms
        });
        const publishData = await publishResponse.json();
        
        // Return combined data for success page
        return {
          post: createData.post,
          generatedContent: createData.generatedContent,
          publishedPost: publishData
        };
      } else {
        // Handle regular AI post publishing
        const response = await apiRequest("POST", `/api/posts/${post.id}/publish`, {
          platforms: platforms
        });
        return response.json();
      }
    },
    onSuccess: (data) => {
      if (isManualPost) {
        // Store data for Success page
        localStorage.setItem("currentPost", JSON.stringify(data.post));
        localStorage.setItem("generatedContent", JSON.stringify(data.generatedContent));
        
        // Create mock published post data for manual posts
        const publishedPost = {
          id: Date.now(),
          postId: data.post.id,
          platforms: selectedPlatforms,
          publishedAt: new Date().toISOString(),
          isManualPost: true,
        };
        localStorage.setItem("publishedPost", JSON.stringify(publishedPost));
      } else {
        localStorage.setItem("publishedPost", JSON.stringify(data));
      }
      
      setLocation("/success");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectAll = (checked: boolean) => {
    setSelectedPlatforms(checked ? SOCIAL_PLATFORMS.map(p => p.id) : []);
  };

  const handlePlatformToggle = (platformId: string, checked: boolean) => {
    setSelectedPlatforms(prev => 
      checked 
        ? [...prev, platformId]
        : prev.filter(id => id !== platformId)
    );
  };

  const handlePublishNow = () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform to publish to.",
        variant: "destructive",
      });
      return;
    }
    publishMutation.mutate(selectedPlatforms);
  };

  const handleSaveTemplate = () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform to save template.",
        variant: "destructive",
      });
      return;
    }
    
    // For AI posts: Navigate to Success page without publishing (for template configuration)
    localStorage.setItem("currentPost", JSON.stringify(post));
    localStorage.setItem("generatedContent", JSON.stringify(generatedContent));
    // Don't set publishedPost - this indicates the post hasn't been published yet
    setLocation("/success");
  };

  if (!post || !generatedContent) {
    return (
      <div className="px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
            <p className="text-gray-600">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  const platformContent = generatedContent.platformContent || {};

  return (
    <div className="px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Platform-Specific Content</h1>
      <div className="max-w-7xl mx-auto">
        {/* Subject (Non-editable) */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">Subject</h2>
          <div className="text-gray-700">{post.subject}</div>
        </div>

        {/* Mock API Response Display */}
        {post.status && post.status.includes("MOCK") && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm p-6 mb-8 border border-purple-200">
            <h2 className="text-lg font-semibold mb-4 text-purple-900 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-3">API Response</span>
              Mock REST API Response
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Post Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Post Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">ID:</span> {post.id}</div>
                    <div><span className="font-medium">Title:</span> {post.title}</div>
                    <div><span className="font-medium">Language:</span> {post.language}</div>
                    <div><span className="font-medium">Link:</span> {post.link}</div>
                    <div><span className="font-medium">AI Mode:</span> {post.useAI}</div>
                    <div><span className="font-medium">Status:</span> {post.status}</div>
                    <div><span className="font-medium">Processing Time:</span> {post.processingTime}</div>
                  </div>
                </div>

                {/* Content Analysis */}
                {post.contentAnalysis && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Content Analysis</h3>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Word Count:</span> {post.contentAnalysis.wordCount}</div>
                      <div><span className="font-medium">Character Count:</span> {post.contentAnalysis.characterCount}</div>
                      <div><span className="font-medium">Readability:</span> {post.contentAnalysis.readabilityScore}</div>
                      <div><span className="font-medium">Sentiment:</span> {post.contentAnalysis.sentiment}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Platform Optimization and Metadata */}
              <div className="space-y-4">
                {/* Platform Optimization */}
                {post.platformOptimization && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Platform Optimization</h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(post.platformOptimization).map(([platform, data]: [string, any]) => (
                        <div key={platform} className="border border-gray-200 rounded p-2">
                          <div className="font-medium capitalize">{platform}</div>
                          <div className="text-xs text-gray-600">{data.status}</div>
                          <div className="text-xs text-blue-600">{data.hashtags?.join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {post.metadata && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Request Metadata</h3>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Created By:</span> {post.metadata.createdBy}</div>
                      <div><span className="font-medium">User Agent:</span> {post.metadata.userAgent}</div>
                      <div><span className="font-medium">IP Address:</span> {post.metadata.ipAddress}</div>
                      <div><span className="font-medium">Session ID:</span> {post.metadata.sessionId}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Images */}
            {post.selectedImages && Array.isArray(post.selectedImages) && post.selectedImages.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Selected Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {post.selectedImages.map((image: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded p-2">
                      <div className="text-xs font-medium">{image.id || `Image ${index + 1}`}</div>
                      <div className="text-xs text-gray-600">{image.name}</div>
                      {image.url && !image.url.includes("MOCK") && (
                        <img src={image.url} alt={image.name} className="w-full h-16 object-cover rounded mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Platforms */}
            {post.platforms && Array.isArray(post.platforms) && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Target Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {post.platforms.map((platform: string, index: number) => (
                    <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Platform Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {SOCIAL_PLATFORMS.map((platform) => {
            const content = platformContent[platform.id] || {
              title: generatedContent.title,
              body: generatedContent.body,
              imageUrl: generatedContent.imageUrl
            };

            const PlatformIcon = getPlatformIcon(platform.id);
            
            return (
              <div key={platform.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className={`${platform.bgColor} p-4 flex items-center space-x-2`}>
                  <div className="text-white text-lg">
                    <PlatformIcon />
                  </div>
                  <span className="text-white font-semibold">{platform.name}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{content.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{content.body}</p>
                  
                  {/* Image Display Logic */}
                  {isManualPost && generatedContent.selectedImages && generatedContent.selectedImages.length > 0 ? (
                    /* Show selected images from manual post */
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium">Selected Images ({generatedContent.selectedImages.length})</p>
                      <div className="grid grid-cols-2 gap-2">
                        {generatedContent.selectedImages.map((image: any, index: number) => (
                          <img 
                            key={index}
                            src={image.url} 
                            alt={`Selected image ${index + 1}`} 
                            className="w-full h-20 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  ) : content.imageUrl ? (
                    /* Show single image from content-generated */
                    <img 
                      src={content.imageUrl} 
                      alt={`${platform.name} content`} 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Publishing Options */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Publishing Options</h2>
          
          {/* Master Checkbox */}
          <div className="mb-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="select-all"
                checked={selectedPlatforms.length === SOCIAL_PLATFORMS.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="font-medium text-gray-900 cursor-pointer">
                Select/Deselect All Platforms
              </label>
            </div>
          </div>

          {/* Individual Platform Checkboxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {SOCIAL_PLATFORMS.map((platform) => {
              const PlatformIcon = getPlatformIcon(platform.id);
              return (
                <div key={platform.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.id}
                    checked={selectedPlatforms.includes(platform.id)}
                    onCheckedChange={(checked) => handlePlatformToggle(platform.id, checked as boolean)}
                  />
                  <label htmlFor={platform.id} className="flex items-center space-x-2 cursor-pointer">
                    <div className="text-sm">
                      <PlatformIcon />
                    </div>
                    <span className="text-sm">{platform.name}</span>
                  </label>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handlePublishNow}
              disabled={publishMutation.isPending}
            >
              <i className="fas fa-rocket mr-2"></i>
              {publishMutation.isPending ? "Publishing..." : "Publish NOW"}
            </Button>
            {!isManualPost && (
              <Button 
                className="gradient-primary"
                onClick={handleSaveTemplate}
                disabled={publishMutation.isPending}
              >
                <i className="fas fa-save mr-2"></i>
                Save Template and Configure Schedule
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
