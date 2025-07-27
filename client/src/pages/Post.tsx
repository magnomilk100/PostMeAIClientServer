import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLocation } from "wouter";
import { AuthGuard } from "@/components/AuthGuard";
import { Sparkles, Edit3, Target, Clock, TrendingUp, HelpCircle, Bot, Calendar, PenTool, Palette, Link, Eye, Hash, Image, Users, Settings, MessageSquare, Zap, Globe, CheckCircle, Lightbulb, FileText, MousePointer, Monitor, Share2, PlayCircle, CheckSquare, Upload, History, Filter, Plus, Play } from "lucide-react";

export default function Post() {
  const [, setLocation] = useLocation();

  return (
    <AuthGuard>
      <div className="page-content">
      <h1 className="text-3xl font-bold text-standard mb-8">Create New Post</h1>
      


      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* AI Post Wizard */}
        <Card 
          className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-purple-200 dark:hover:border-purple-700"
          onClick={() => setLocation("/post-schedule-wizard")}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-standard mb-2">AI Post Wizard</h3>
                <p className="text-muted text-sm">
                  AI creates optimized content automatically
                </p>
              </div>
              <div className="w-full pt-2">
                <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                  ✨ Recommended
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Post Wizard */}
        <Card 
          className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-700"
          onClick={() => setLocation("/manual-post-wizard")}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <PenTool className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-standard mb-2">Manual Post Wizard</h3>
                <p className="text-muted text-sm">
                  Full control with custom messaging
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post Schedulers */}
        <Card 
          className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-green-200 dark:hover:border-green-700"
          onClick={() => setLocation("/post-schedule")}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-standard mb-2">Post Schedulers</h3>
                <p className="text-muted text-sm">
                  Manage schedules and campaigns
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* What is a Post? */}
        <div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="post-explanation" className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700 rounded-lg px-4">
              <AccordionTrigger className="text-purple-700 dark:text-purple-300 hover:no-underline">
                <div className="flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  What is a Post?
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  A post is the foundation of your social media content strategy. It's a piece of content designed to engage your audience, 
                  share your message, and build your brand presence across multiple social media platforms.
                </p>
                
                <div className="grid grid-cols-1 gap-4 mt-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Purpose-Driven</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Each post serves a specific goal: educate, entertain, inspire, or promote</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Time-Optimized</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Scheduled for maximum reach when your audience is most active</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Multi-Platform</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Optimized for different social media platforms and their unique audiences</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700 mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Pro Tip:</strong> Choose AI-powered posts for quick, creative content generation, or manual posts for complete 
                    control over every detail of your message.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* What is a Scheduler? */}
        <div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="scheduler-explanation" className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-green-200 dark:border-green-700 rounded-lg px-4">
              <AccordionTrigger className="text-green-700 dark:text-green-300 hover:no-underline">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  What is a Scheduler?
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  A scheduler is an automated system that manages when your posts are published across social media platforms. 
                  It allows you to plan your content strategy in advance and maintain consistent posting without manual intervention.
                </p>
                
                <div className="grid grid-cols-1 gap-4 mt-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Automated Timing</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Posts are published automatically at optimal times for maximum engagement</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Consistent Presence</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Maintain regular posting schedules across all platforms without manual effort</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Advanced Control</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Configure daily, weekly, monthly, or custom schedules with platform-specific settings</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700 mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Pro Tip:</strong> Use schedulers for recurring content campaigns, regular updates, or to maintain posting consistency 
                    while you focus on other business activities.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* AI - Frequently Asked Questions */}
      <div className="mb-8">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="ai-faq" className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700 rounded-lg px-4">
            <AccordionTrigger className="text-purple-700 dark:text-purple-300 hover:no-underline">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-7 w-7 text-purple-600" />
                <div className="text-left">
                  <div className="text-2xl font-bold">AI - Frequently Asked Questions</div>
                  <div className="text-sm text-muted opacity-80">Everything you need to know about AI Post Creation and the complete 8-step process</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="what-is-ai-post" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <Bot className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-standard">What is AI Post Generation?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">AI Post Generation uses advanced artificial intelligence to create unique, engaging social media content automatically. Instead of writing each post manually, you provide a topic or theme, and AI generates fresh, relevant content tailored to each social media platform's requirements and audience expectations.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="content-creation" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-standard">How does AI Content Creation work?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">In Step 2, you'll describe your topic, target audience, and content style. AI analyzes your input and generates compelling titles, engaging post content, and relevant hashtags. Each time your scheduled post runs, AI creates new content variations to keep your audience engaged while maintaining your brand voice.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="platform-selection" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <Globe className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-standard">Which social media platforms are supported?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Step 3 allows you to select from Facebook, Instagram, LinkedIn, TikTok, YouTube, Discord, and Telegram. Each platform has unique requirements - AI automatically adapts content length, style, and formatting to match each platform's best practices and character limits.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="post-formatting" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <Palette className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-standard">Can I customize the post format and style?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Yes! Step 4 lets you define your post's format, tone, and style preferences. You can specify whether you want professional, casual, humorous, or educational content. AI will incorporate these preferences into every generated post while maintaining consistency with your brand voice.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="links-management" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <Link className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-standard">How do I add links to my posts?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Step 5 provides dedicated fields for your website link and up to 2 additional links. These links will be automatically included in your posts across all selected platforms. AI ensures links are naturally integrated into the content flow for maximum engagement.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="review-options" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <Eye className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-standard">Can I review posts before they're published?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Absolutely! Step 6 offers two execution modes: 'Review Mode' requires your approval for each post before publishing, while 'Auto Mode' publishes content automatically. Review mode sends posts to your 'Pending Posts' page where you can edit, approve, or reject them before they go live.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="scheduling" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-standard">How flexible is the scheduling system?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Step 7 provides comprehensive scheduling options: Daily posts (specific times), Weekly posts (choose days and times), Monthly posts (select dates), and Calendar scheduling (pick specific dates). You can also choose 'Post immediately' or 'Post just once' for one-time publications.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="summary-review" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-standard">What happens in the Summary step?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Step 8 displays a complete overview of your scheduled post configuration including content preview, selected platforms, scheduling details, and execution settings. This final review ensures everything is configured correctly before activation.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="schedule-activation" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-standard">How do I activate my scheduled posts?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Step 9 completes the setup and activates your schedule. Your AI-generated posts will begin publishing according to your configured schedule. You can monitor, edit, or pause your schedules anytime from the Post Scheduler page.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="content-uniqueness" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-standard">Will my posts be unique each time?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Yes! AI generates fresh, unique content for every scheduled post. Even with the same topic and parameters, each post will have different wording, structure, and hashtags to prevent repetition and maintain audience engagement over time.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="hashtag-generation" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <Hash className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-standard">How does AI handle hashtags?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">AI automatically generates relevant, trending hashtags based on your topic and target platforms. Each platform has different hashtag best practices - Instagram might get 20-30 hashtags, while LinkedIn gets 3-5 professional ones. AI adapts accordingly.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="image-integration" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <Image className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-standard">Can I include images in scheduled posts?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Yes! You can upload images or use AI-generated images from your media library. Images will be automatically included in your scheduled posts according to each platform's specifications and optimal posting practices.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="audience-targeting" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-standard">How does AI understand my target audience?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">During content creation, you specify your target audience demographics, interests, and preferences. AI uses this information to adjust language, tone, topics, and engagement strategies to resonate with your specific audience across all platforms.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="customization" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <Settings className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-standard">Can I modify AI-generated content?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Absolutely! In Review Mode, you can edit AI-generated content before publishing. You can modify text, adjust hashtags, change images, or completely rewrite posts while maintaining the scheduling automation for future posts.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="performance" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-standard">How do I track my scheduled posts' performance?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">The Post Scheduler page shows all active schedules, execution history, and performance metrics. You can see when posts were published, which platforms they went to, and their engagement levels to optimize future content strategies.</p>
                </AccordionContent>
              </AccordionItem>
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Manual - Frequently Asked Questions */}
      <div className="mb-8">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="manual-faq" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 rounded-lg px-4">
            <AccordionTrigger className="text-blue-700 dark:text-blue-300 hover:no-underline">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-7 w-7 text-blue-600" />
                <div className="text-left">
                  <div className="text-2xl font-bold">Manual - Frequently Asked Questions</div>
                  <div className="text-sm text-muted opacity-80">Everything you need to know about Manual Post Creation and the complete 7-step process</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="what-is-manual-post" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-standard">What is Manual Post Creation?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Manual Post Creation gives you complete control over your social media content. You write your own titles, content, and hashtags, then customize them for each platform. This approach is perfect when you want specific messaging or have pre-written content to share.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="post-content-step" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                      <Edit3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-standard">How do I create post content in Step 1?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Step 1 is where you write your post title, content, and hashtags. You can toggle between AI assistance (for generating content ideas) and manual mode (for complete control). You can also add up to 3 website links and select your content language. Include images by checking the option and selecting from your library.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="platform-selection-manual" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-standard">How do I select platforms in Step 2?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Step 2 shows all available social media platforms with checkboxes. Simply check the platforms where you want to publish your post. Only connected platforms (those with valid API keys) will be available for selection. You can always manage your platform connections in the Social Media settings page.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="media-manipulation" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                      <MousePointer className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-standard">What can I do in Step 3: Image and Video Manipulation?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Step 3 allows you to customize content for each platform individually. You can edit titles, content, and hashtags specifically for each platform, add or remove images and videos per platform, and preview how your post will look on each social media platform. This gives you complete control over platform-specific optimization.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="links-step" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                      <Link className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-standard">How do I manage links in Step 4?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Step 4 provides dedicated fields for your website link and up to 2 additional links. These links will be included in your posts across all selected platforms. You can add promotional links, product pages, or any other relevant URLs that support your content strategy.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="schedule-configuration" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-standard">What scheduling options are available in Step 5?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Step 5 offers flexible scheduling: Daily (post at specific times every day), Weekly (choose days and times), Monthly (select specific dates), and Calendar (pick exact dates and times). You can also choose "Post just once" for one-time publishing or "Post immediately" to publish right after completion.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="schedule-summary" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                      <Monitor className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-standard">What does Step 6: Schedule Summary show?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Step 6 provides a comprehensive overview of all your configured schedules. You can see daily, weekly, monthly, and calendar schedules in one place, review total active schedules, and make final adjustments before proceeding to the final step.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="final-step" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-standard">What happens in Step 7: Final Step?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Step 7 is where you give your schedule a memorable name and optional description. This helps you identify and manage your schedules later. Once you complete this step, your manual post will be scheduled and ready to publish according to your configured timing.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="content-control" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-standard">Can I edit content after creating a manual post?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Yes! You can edit your manual post schedules anytime from the Post Scheduler page. You can modify content, change scheduling, add or remove platforms, and update media. Manual posts give you complete control over every aspect of your content.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="media-management" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-standard">How do I manage images and videos in manual posts?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">You can browse your media library, upload new files, or use AI to generate images. Each platform can have different images and videos - perfect for platform-specific content optimization. You can also reorder media and choose which items to include for each platform.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="platform-optimization" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-standard">How can I optimize content for different platforms?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Step 3 allows complete platform customization. You can adjust character counts for Twitter, use more hashtags for Instagram, create professional content for LinkedIn, and fun content for TikTok. Each platform can have unique titles, content, hashtags, and media to maximize engagement.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="scheduling-flexibility" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-standard">Can I schedule the same manual post multiple times?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Yes! You can set up recurring schedules for your manual posts. This is perfect for evergreen content, announcements, or regular updates. The same content will be posted according to your schedule, but you can edit it anytime through the Post Scheduler page.</p>
                </AccordionContent>
              </AccordionItem>
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Scheduler - Frequently Asked Questions */}
      <div className="mb-8">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="scheduler-faq" className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-green-200 dark:border-green-700 rounded-lg px-4">
            <AccordionTrigger className="text-green-700 dark:text-green-300 hover:no-underline">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-7 w-7 text-green-600" />
                <div className="text-left">
                  <div className="text-2xl font-bold">Scheduler - Frequently Asked Questions</div>
                  <div className="text-sm text-muted opacity-80">Everything you need to know about Post Scheduler management, automation, and scheduling features</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="what-is-scheduler" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-standard">What is the Post Scheduler?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">The Post Scheduler is your central hub for managing all automated posting schedules. It displays all your active and inactive schedules, shows next run times, execution history, and provides controls to run, pause, edit, or delete your automated posts across all social media platforms.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="schedule-types" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-standard">What types of schedules can I create?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">You can create four types of schedules: Daily (post at specific times every day), Weekly (choose specific days and times), Monthly (select dates each month), and Calendar (pick exact dates and times). Each schedule can be configured for multiple platforms simultaneously.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="schedule-management" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg">
                      <Settings className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-standard">How do I manage existing schedules?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Each schedule card shows action buttons: Run Now (execute immediately), Run History (view past executions), Config Details (view full configuration), and an Active/Inactive toggle. You can also delete schedules using the Delete button. All changes are saved automatically.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="next-run-times" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-standard">How do I know when my next post will be published?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Each schedule card displays the Next Run time prominently. The system automatically calculates the next scheduled execution based on your configuration. Active schedules show precise date and time, while inactive schedules show "Schedule Inactive" status.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="execution-history" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg">
                      <History className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-standard">Can I see the history of my scheduled posts?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Yes! Click the "Run History" button on any schedule to view detailed execution history. You'll see execution dates, success/failure status, which platforms were published to, execution duration, and any error messages. This helps you track performance and troubleshoot issues.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="platform-connections" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg">
                      <Globe className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-standard">How do I know which platforms are connected?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Platform icons show connection status with colored indicators: green dots for connected platforms, red dots for disconnected ones. Non-connected platforms appear with reduced opacity and can be clicked to navigate to Social Media settings for configuration. A "Refresh Status" button updates connection information.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="schedule-filtering" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg">
                      <Filter className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-standard">How can I filter and search my schedules?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Use the search bar to find schedules by name, and the filter dropdown to show All, Active, Inactive, AI-generated, or Manual schedules. You can also see schedule counts at the top of the page. Clear filters anytime to view all schedules.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ai-vs-manual" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg">
                      <Bot className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-standard">What's the difference between AI and Manual schedules?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">AI schedules generate fresh, unique content automatically for each execution based on your subject and parameters. Manual schedules post the same pre-written content repeatedly. AI schedules show "🤖 AI Generated Content" badges, while manual schedules show "✍️ Manual Content" badges.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="schedule-creation" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg">
                      <Plus className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-standard">How do I create new schedules?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Click "Create Schedule" to start the AI Post Wizard, or use the "AI Post Wizard" and "Manual Post Wizard" buttons on the Post page. Both paths guide you through creating comprehensive schedules with content, platform selection, timing, and automation settings.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="schedule-monitoring" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg">
                      <Eye className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-standard">How do I monitor schedule performance?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Each schedule card shows Creation date, Last Execution timestamp, and total execution count. Use "Run History" to see detailed performance metrics, success rates, and any errors. The Config Details button shows complete configuration information for troubleshooting.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="immediate-execution" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg">
                      <Play className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-standard">Can I run schedules immediately?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-14">
                  <p className="text-muted leading-relaxed">Yes! Use the "Run Now" button to execute any schedule immediately, regardless of its configured timing. This is perfect for testing, urgent posts, or when you want to post outside your regular schedule. The execution will be logged in the run history.</p>
                </AccordionContent>
              </AccordionItem>
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
    </AuthGuard>
  );
}
