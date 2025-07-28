import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useWizard } from "@/contexts/WizardContext";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

import {
  FileText,
  Sparkles,
  Wand2,
  Hash,
  Lightbulb,
  TrendingUp,
  Users,
  Clock,
  X
} from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(1, "Content is required").max(2000, "Content must be less than 2000 characters"),
  hashtags: z.array(z.string()).max(10, "Maximum 10 hashtags allowed").optional(),
  language: z.string().min(1, "Language is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function ManualPostStep1() {
  const { toast } = useToast();
  const { updateWizardData, wizardData } = useWizard();
  const [useAI, setUseAI] = useState(false);
  const [aiSubject, setAiSubject] = useState("");
  const [hashtagInput, setHashtagInput] = useState('');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [aiAccordionOpen, setAiAccordionOpen] = useState(true);

  // Get existing data from wizard context for restoration
  const existingData = wizardData.step1Data;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: existingData?.title || "",
      content: existingData?.content || "",
      hashtags: existingData?.hashtags || [],
      language: existingData?.language || "en",
    }
  });

  // Watch form changes and update wizard data
  useEffect(() => {
    const subscription = form.watch((data) => {
      updateWizardData({ step1Data: data });
    });
    return () => subscription.unsubscribe();
  }, [form, updateWizardData]);

  // Restore AI mode if it was previously set
  useEffect(() => {
    if (existingData?.useAI) {
      setUseAI(true);
      setAiSubject(existingData.aiSubject || "");
    }
  }, [existingData]);

  const generateAIContent = async () => {
    if (!aiSubject.trim()) {
      toast({
        title: "Subject Required",
        description: "Please describe your subject before generating content.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingContent(true);
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Generate contextual content based on subject keywords
      const subject = aiSubject.toLowerCase();
      let generatedTitle = "";
      let generatedContent = "";
      let generatedHashtags = [];

      // Generate content based on subject context
      if (subject.includes('product') || subject.includes('launch')) {
        generatedTitle = "Exciting Product Launch: Revolutionizing Your Experience";
        generatedContent = "We're thrilled to announce the launch of our latest innovation! This groundbreaking product combines cutting-edge technology with user-friendly design to deliver an unparalleled experience. Join us in celebrating this milestone and discover how it can transform your daily routine.";
        generatedHashtags = ["ProductLaunch", "Innovation", "Technology", "NewProduct", "Exciting"];
      } else if (subject.includes('business') || subject.includes('company')) {
        generatedTitle = "Business Growth: Strategies for Success in 2025";
        generatedContent = "Building a successful business requires strategic planning, dedication, and the right mindset. In today's competitive landscape, companies must adapt quickly and embrace innovation to stay ahead. Here are key insights that can help drive your business forward.";
        generatedHashtags = ["Business", "Success", "Growth", "Strategy", "Leadership"];
      } else if (subject.includes('tech') || subject.includes('digital')) {
        generatedTitle = "The Future of Technology: Trends Shaping Tomorrow";
        generatedContent = "Technology continues to evolve at an unprecedented pace, transforming how we work, communicate, and live. From artificial intelligence to sustainable solutions, these innovations are creating new possibilities and reshaping entire industries.";
        generatedHashtags = ["Technology", "Digital", "Innovation", "Future", "TechTrends"];
      } else if (subject.includes('social') || subject.includes('community')) {
        generatedTitle = "Building Stronger Communities Through Connection";
        generatedContent = "In our interconnected world, fostering genuine connections and building supportive communities has never been more important. Whether online or offline, creating spaces where people can share, learn, and grow together makes a lasting impact.";
        generatedHashtags = ["Community", "Connection", "Social", "Together", "Support"];
      } else {
        // Default content for any other subject
        generatedTitle = "Inspiring Change: Making a Difference Today";
        generatedContent = "Every great journey begins with a single step. Whether you're starting something new, pursuing a passion, or working towards a goal, remember that small actions can lead to significant impact. Let's explore how we can create positive change together.";
        generatedHashtags = ["Inspiration", "Change", "Impact", "Journey", "Positive"];
      }

      // Fill the form fields
      form.setValue('title', generatedTitle);
      form.setValue('content', generatedContent);
      form.setValue('hashtags', generatedHashtags);
      
      // Store AI mode in wizard data
      updateWizardData({ 
        step1Data: { 
          ...form.getValues(), 
          title: generatedTitle,
          content: generatedContent,
          hashtags: generatedHashtags,
          useAI: true, 
          aiSubject: aiSubject 
        } 
      });

      // Close the accordion after successful generation
      setAiAccordionOpen(false);

      toast({
        title: "Content Generated Successfully!",
        description: "AI has generated your title, content, and hashtags.",
      });

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const addHashtag = () => {
    if (hashtagInput.trim()) {
      const currentHashtags = form.getValues('hashtags') || [];
      const newHashtag = hashtagInput.trim().replace('#', '');
      
      if (!currentHashtags.includes(newHashtag) && currentHashtags.length < 10) {
        form.setValue('hashtags', [...currentHashtags, newHashtag]);
        setHashtagInput('');
      }
    }
  };

  const removeHashtag = (indexToRemove: number) => {
    const currentHashtags = form.getValues('hashtags') || [];
    form.setValue('hashtags', currentHashtags.filter((_, index) => index !== indexToRemove));
  };

  const handleHashtagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addHashtag();
    }
  };

  // Check if there's existing content for button text
  const hasExistingContent = () => {
    const titleValue = form.getValues('title');
    const contentValue = form.getValues('content');
    return (titleValue && titleValue.trim()) || (contentValue && contentValue.trim());
  };

  return (
    <div className="space-y-6">

      <Form {...form}>
        <div className="grid gap-6">
          {/* Post Content Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Post Content
              </CardTitle>
              <CardDescription>
                Write your post title, content, and add relevant hashtags
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI/Manual Toggle */}
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <h4 className="font-medium text-purple-900 dark:text-purple-100">
                      AI Content Generation
                    </h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      Let AI help create your content based on a subject description
                    </p>
                  </div>
                </div>
                <Switch
                  checked={useAI}
                  onCheckedChange={(checked) => {
                    setUseAI(checked);
                    if (checked) {
                      setAiAccordionOpen(true);
                    }
                  }}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              {/* AI Content Generation Section */}
              {useAI && (
                <Accordion 
                  type="single" 
                  collapsible 
                  value={aiAccordionOpen ? "ai-content" : ""}
                  onValueChange={(value) => setAiAccordionOpen(value === "ai-content")}
                >
                  <AccordionItem value="ai-content" className="border border-purple-200 dark:border-purple-800 rounded-lg">
                    <AccordionTrigger className="px-4 py-3 bg-purple-50 dark:bg-purple-900/10 rounded-t-lg hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                          AI Mode Active
                        </Badge>
                        <span className="text-sm font-medium">Content Generation</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 bg-purple-50 dark:bg-purple-900/10 rounded-b-lg">
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Describe your subject:</label>
                        <Textarea
                          placeholder="Describe what you want to post about... (e.g., 'New product launch for eco-friendly water bottles targeting health-conscious consumers')"
                          value={aiSubject}
                          onChange={(e) => setAiSubject(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                        
                        <Button
                          type="button"
                          onClick={generateAIContent}
                          disabled={!aiSubject.trim() || isGeneratingContent}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          {isGeneratingContent ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Generating Content...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4 mr-2" />
                              {hasExistingContent() ? "Regenerate Post Content" : "Generate Post Content"}
                            </>
                          )}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/* Post Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Post Title *
                      {useAI && field.value && (
                        <Badge variant="outline" className="ml-auto text-xs bg-purple-50 text-purple-700 border-purple-300">
                          🤖 AI Generated
                        </Badge>
                      )}
                    </FormLabel>
                    <FormDescription>
                      A compelling title for your social media post (max 200 characters)
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="Enter your post title..."
                        {...field}
                        className="text-base"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <FormMessage />
                      <span>{field.value?.length || 0}/200</span>
                    </div>
                  </FormItem>
                )}
              />

              {/* Post Content */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Post Content *
                      {useAI && field.value && (
                        <Badge variant="outline" className="ml-auto text-xs bg-purple-50 text-purple-700 border-purple-300">
                          🤖 AI Generated
                        </Badge>
                      )}
                    </FormLabel>
                    <FormDescription>
                      Your main post content (max 2000 characters)
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Write your post content here..."
                        {...field}
                        rows={6}
                        className="resize-none text-base"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <FormMessage />
                      <span>{field.value?.length || 0}/2000</span>
                    </div>
                  </FormItem>
                )}
              />

              {/* Hashtags */}
              <FormField
                control={form.control}
                name="hashtags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Hashtags (Optional)
                      {useAI && field.value && field.value.length > 0 && (
                        <Badge variant="outline" className="ml-auto text-xs bg-purple-50 text-purple-700 border-purple-300">
                          🤖 AI Generated
                        </Badge>
                      )}
                    </FormLabel>
                    <FormDescription>
                      Add relevant hashtags to increase discoverability (max 10)
                    </FormDescription>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter hashtag (without #)"
                          value={hashtagInput}
                          onChange={(e) => setHashtagInput(e.target.value)}
                          onKeyPress={handleHashtagKeyPress}
                          className="flex-1"
                          disabled={(field.value?.length || 0) >= 10}
                        />
                        <Button
                          type="button"
                          onClick={addHashtag}
                          disabled={!hashtagInput.trim() || (field.value?.length || 0) >= 10}
                          variant="outline"
                        >
                          Add
                        </Button>
                      </div>
                      
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((hashtag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-300"
                            >
                              #{hashtag}
                              <button
                                type="button"
                                onClick={() => removeHashtag(index)}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/10 hashtags
                      </div>
                    </div>
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
                    <FormLabel>Language</FormLabel>
                    <FormDescription>
                      Select the language for your post content
                    </FormDescription>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tips for Success */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Lightbulb className="h-5 w-5" />
                Tips for Success
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Engaging Content
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Use compelling titles and include calls-to-action to boost engagement
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Know Your Audience
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Tailor your message to resonate with your target audience
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Strategic Hashtags
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Use relevant, trending hashtags to increase discoverability
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Optimal Timing
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Schedule posts when your audience is most active
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Form>
    </div>
  );
}