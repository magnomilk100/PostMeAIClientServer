import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLocation } from "wouter";
import { Sparkles, Edit3, Target, Clock, TrendingUp, HelpCircle } from "lucide-react";

export default function Post() {
  const [, setLocation] = useLocation();

  return (
    <div className="page-content">
      <h1 className="text-3xl font-bold text-standard mb-8">Create New Post</h1>
      
      {/* Explanation Section */}
      <div className="mb-8">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="explanation" className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700 rounded-lg px-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <Button
            className="group gradient-primary p-6 md:p-8 h-auto hover:scale-105 transition-transform"
            onClick={() => setLocation("/ai-post")}
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-3 md:mb-4">
                <i className="fas fa-magic text-3xl md:text-4xl group-hover:animate-pulse"></i>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">New AI Automated Post</h3>
              <p className="opacity-90 text-sm md:text-base">Let AI create engaging content for you automatically</p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="group bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 p-6 md:p-8 h-auto hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
            onClick={() => setLocation("/manual-post")}
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-3 md:mb-4">
                <i className="fas fa-edit text-3xl md:text-4xl text-gray-600 dark:text-gray-300 group-hover:text-primary"></i>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-gray-900 dark:text-white">New Manual Post</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">Create and customize your content manually</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
