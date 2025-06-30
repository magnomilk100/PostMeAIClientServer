import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { SOCIAL_PLATFORMS, TIMEZONES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Plus } from "lucide-react";
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

const scheduleSchema = z.object({
  executionMode: z.enum(["review", "auto"]),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  time: z.string().min(1, "Time is required"),
  timezone: z.string().min(1, "Timezone is required"),
});

type ScheduleForm = z.infer<typeof scheduleSchema>;

export default function Success() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [post, setPost] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [publishedPost, setPublishedPost] = useState<any>(null);

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

  const form = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      executionMode: "review",
      frequency: "weekly",
      time: "09:00",
      timezone: "CET",
    },
  });

  useEffect(() => {
    const storedPost = localStorage.getItem("currentPost");
    const storedContent = localStorage.getItem("generatedContent");
    const storedPublished = localStorage.getItem("publishedPost");
    
    if (storedPost && storedContent && storedPublished) {
      setPost(JSON.parse(storedPost));
      setGeneratedContent(JSON.parse(storedContent));
      setPublishedPost(JSON.parse(storedPublished));
    }
  }, []);

  const createTemplateMutation = useMutation({
    mutationFn: async (data: ScheduleForm) => {
      if (!post) throw new Error("No post data");
      const response = await apiRequest("POST", "/api/templates", {
        postId: post.id,
        name: `Auto Template - ${post.subject.substring(0, 30)}...`,
        ...data,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Automated schedule saved successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save schedule. Please try again.",
        variant: "destructive",
      });
    },
  });

  const publishNowMutation = useMutation({
    mutationFn: async () => {
      if (!post) throw new Error("No post data");
      const response = await apiRequest("POST", `/api/posts/${post.id}/publish`, {
        platforms: SOCIAL_PLATFORMS.map(p => p.id) // Publish to all platforms
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Update publishedPost to show "Successfully Published" state
      setPublishedPost({
        ...data,
        isManualPost: false // Keep as AI post but mark as published
      });
      toast({
        title: "Success",
        description: "Your post has been published successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ScheduleForm) => {
    createTemplateMutation.mutate(data);
  };

  const getSelectedPlatforms = () => {
    if (!publishedPost?.platforms) return [];
    return publishedPost.platforms.map((platformId: string) => 
      SOCIAL_PLATFORMS.find(p => p.id === platformId)
    ).filter(Boolean);
  };

  const isManualPost = publishedPost?.isManualPost;

  return (
    <div className="px-8 py-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Success Animation - Different for AI vs Manual Posts */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-3xl text-green-600"></i>
          </div>
          {isManualPost ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Successfully Published!</h1>
              <p className="text-gray-600">Your content has been published across selected platforms.</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Content Generated Successfully!</h1>
              <p className="text-gray-600">Your AI-generated content is ready. You can schedule it or publish immediately.</p>
            </>
          )}
        </div>

        {/* Published Content Summary - Only show for Manual Posts */}
        {generatedContent && isManualPost && (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Published Content Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-left">
                <h3 className="font-semibold mb-2">Title</h3>
                <p className="text-gray-700 mb-4">{generatedContent.title}</p>
                <h3 className="font-semibold mb-2">Content</h3>
                <p className="text-gray-700 text-sm">{generatedContent.body}</p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-2">Published Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {getSelectedPlatforms().map((platform: any) => {
                    const IconComponent = getSocialMediaIcon(platform.id);
                    return (
                      <span 
                        key={platform.id}
                        className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        <div className={`w-4 h-4 rounded-full ${platform.bgColor} flex items-center justify-center mr-2`}>
                          <IconComponent className="w-2.5 h-2.5 text-white" />
                        </div>
                        {platform.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons Section */}
        <div className="text-center mb-8">
          {/* For AI Posts: Show Publish NOW button (when not yet published) */}
          {!isManualPost && !publishedPost?.platforms && (
            <div className="flex justify-center space-x-4 mb-4">
              <Button 
                onClick={() => publishNowMutation.mutate()}
                className="bg-green-600 hover:bg-green-700"
                size="lg"
                disabled={publishNowMutation.isPending}
              >
                <i className="fas fa-rocket mr-2"></i>
                {publishNowMutation.isPending ? "Publishing..." : "Publish NOW"}
              </Button>
            </div>
          )}
          
          {/* Create New Post Button - Always show */}
          <Button 
            onClick={() => setLocation("/post")}
            className="gradient-primary"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Post
          </Button>
        </div>

        {/* Schedule Template Section - Only show for AI posts, not manual posts */}
        {!isManualPost && (
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Schedule this Template for Automated Publishing</h2>
          <div className="max-w-2xl mx-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Execution Mode */}
                <FormField
                  control={form.control}
                  name="executionMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Execution Mode *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="auto">Auto Post</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Conditional Important Message */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong>{" "}
                    {form.watch("executionMode") === "review" 
                      ? "You opted for Review, means that the post will be schedule but will not be posted unless you approve it. Post waiting for review will be under page, \"Pendent Posts to be Reviewed\"."
                      : "Once this template is configured and saved, the content will be auto-generated and published without human intervention, review, or approval."
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Frequency */}
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="daily" id="daily" />
                              <Label htmlFor="daily">Daily</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="weekly" id="weekly" />
                              <Label htmlFor="weekly">Weekly</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="monthly" id="monthly" />
                              <Label htmlFor="monthly">Monthly</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Time & Timezone */}
                  <div className="space-y-3">
                    <Label>Time & Time Zone</Label>
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TIMEZONES.map((tz) => (
                                <SelectItem key={tz.code} value={tz.code}>
                                  {tz.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Warning Message */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <i className="fas fa-exclamation-triangle text-yellow-600 mt-1 mr-3"></i>
                    <div className="text-sm text-yellow-800">
                      <strong>Important:</strong> Once this template is configured and saved, the content will be auto-generated and published without human intervention, review, or approval.
                    </div>
                  </div>
                </div>

                {/* Save Schedule Button */}
                <Button 
                  type="submit"
                  className="gradient-primary"
                  disabled={createTemplateMutation.isPending}
                >
                  <i className="fas fa-calendar-check mr-2"></i>
                  {createTemplateMutation.isPending ? "Saving..." : "Save Automated Schedule"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
