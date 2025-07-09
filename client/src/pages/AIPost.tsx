import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ComponentLoading } from "@/components/ui/loading";
import { Loader2, Sparkles } from "lucide-react";

const aiPostSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(400, "Subject must be 400 characters or less"),
  maxTextSize: z.number().min(50, "Minimum 50 characters").max(1000, "Maximum 1000 characters"),
  language: z.string().min(1, "Language is required"),
  generateImage: z.boolean(),
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
});

type AIPostForm = z.infer<typeof aiPostSchema>;

export default function AIPost() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const subjectInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Check URL parameters for mode
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode'); // 'template' for template creation
  const editTemplateId = urlParams.get('edit'); // template ID for editing
  const isTemplateMode = mode === 'template';
  const isEditMode = !!editTemplateId;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate AI posts",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 1000);
    }
  }, [isAuthenticated, isLoading, toast, setLocation]);

  // Focus and select subject field when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && subjectInputRef.current) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        if (subjectInputRef.current) {
          subjectInputRef.current.focus();
          subjectInputRef.current.select();
        }
      }, 100);
    }
  }, [isAuthenticated, isLoading]);
  const [charCount, setCharCount] = useState(35);

  const form = useForm<AIPostForm>({
    resolver: zodResolver(aiPostSchema),
    mode: "onChange", // This will trigger validation on every change
    defaultValues: {
      subject: "Create a post to speak of anything",
      maxTextSize: 150,
      language: "en",
      generateImage: true,
      link: "https://",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: AIPostForm) => {
      const postResponse = await apiRequest("POST", "/api/posts", data);
      const post = await postResponse.json();
      
      const generateResponse = await apiRequest("POST", `/api/posts/${post.id}/generate`);
      const generatedContent = await generateResponse.json();
      
      return { post, generatedContent };
    },
    onSuccess: (data) => {
      localStorage.setItem("currentPost", JSON.stringify(data.post));
      localStorage.setItem("generatedContent", JSON.stringify(data.generatedContent));
      setLocation("/content-generated");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AIPostForm) => {
    createPostMutation.mutate(data);
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {isTemplateMode ? "AI Automated Post – Template Creation" : 
         isEditMode ? "Edit Template" : 
         "AI Automated Post"}
      </h1>
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="modern-card p-8 space-y-6">
            {/* Subject Field */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      ref={subjectInputRef}
                      rows={4}
                      maxLength={400}
                      className="resize-none"
                      onChange={(e) => {
                        field.onChange(e);
                        setCharCount(e.target.value.length);
                      }}
                    />
                  </FormControl>
                  <div className={`text-xs mt-1 ${charCount > 350 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {charCount}/400 characters
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Max Text Size */}
              <FormField
                control={form.control}
                name="maxTextSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Text Size *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={50}
                        max={1000}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Generate Image */}
              <FormField
                control={form.control}
                name="generateImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Generate Image *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value ? "yes" : "no"}
                        onValueChange={(value) => field.onChange(value === "yes")}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="yes" />
                          <Label htmlFor="yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="no" />
                          <Label htmlFor="no">No</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="gradient-primary"
                disabled={createPostMutation.isPending}
              >
                {createPostMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {createPostMutation.isPending ? "Generating..." : "Generate Post Content"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
