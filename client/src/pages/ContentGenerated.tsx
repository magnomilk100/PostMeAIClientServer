import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

const editSchema = z.object({
  subject: z.string().min(1).max(400),
  maxTextSize: z.number().min(50).max(1000),
  language: z.string().min(1),
});

type EditForm = z.infer<typeof editSchema>;

export default function ContentGenerated() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const form = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      subject: "",
      maxTextSize: 150,
      language: "en",
    },
  });

  useEffect(() => {
    const storedPost = localStorage.getItem("currentPost");
    const storedContent = localStorage.getItem("generatedContent");
    
    if (storedPost && storedContent) {
      const postData = JSON.parse(storedPost);
      const contentData = JSON.parse(storedContent);
      
      setPost(postData);
      setGeneratedContent(contentData);
      
      form.reset({
        subject: postData.subject,
        maxTextSize: postData.maxTextSize,
        language: postData.language,
      });
    } else {
      setLocation("/post");
    }
  }, []);

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      if (!post) throw new Error("No post data");
      const response = await apiRequest("POST", `/api/posts/${post.id}/generate`);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      localStorage.setItem("generatedContent", JSON.stringify(data));
      toast({
        title: "Success",
        description: "Content regenerated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to regenerate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const refineMutation = useMutation({
    mutationFn: async () => {
      if (!post) throw new Error("No post data");
      // The content is already generated with platform variations
      return generatedContent;
    },
    onSuccess: () => {
      setLocation("/platforms-content");
    },
  });

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

  return (
    <div className="px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Content Generated</h1>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Editable Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Edit Parameters</h2>
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} className="text-sm" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxTextSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Size</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            className="text-sm"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-sm">
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
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </div>

          {/* Right Side - Generated Results */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Generated Results</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <div className="bg-white p-3 rounded-lg border text-sm text-gray-800">
                  {post.subject}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Post Title</label>
                <div className="bg-white p-3 rounded-lg border text-sm text-gray-800">
                  {generatedContent.title}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Post Body</label>
                <div className="bg-white p-3 rounded-lg border text-sm text-gray-800">
                  {generatedContent.body}
                </div>
              </div>
              {generatedContent.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Post Image</label>
                  <img 
                    src={generatedContent.imageUrl} 
                    alt="Generated content" 
                    className="w-24 h-24 rounded-lg border object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button 
            variant="secondary"
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
          >
            <i className="fas fa-redo mr-2"></i>
            {regenerateMutation.isPending ? "Regenerating..." : "Regenerate Post Content"}
          </Button>
          <Button 
            className="gradient-primary"
            onClick={() => refineMutation.mutate()}
            disabled={refineMutation.isPending}
          >
            <i className="fas fa-check mr-2"></i>
            Satisfied, refine the Post Body for each platform
          </Button>
        </div>
      </div>
    </div>
  );
}
