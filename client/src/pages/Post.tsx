import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLocation } from "wouter";
import { Sparkles, Edit3, Target, Clock, TrendingUp, HelpCircle } from "lucide-react";

export default function Post() {
  const [, setLocation] = useLocation();

  return (
    <div className="px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Post</h1>
      
      {/* Explanation Section */}
      <div className="mb-8">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="explanation" className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 rounded-lg px-4">
            <AccordionTrigger className="text-purple-700 hover:no-underline">
              <div className="flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                What is a Post?
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <p className="text-gray-700 leading-relaxed">
                A post is the foundation of your social media content strategy. It's a piece of content designed to engage your audience, 
                share your message, and build your brand presence across multiple social media platforms.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Purpose-Driven</h4>
                    <p className="text-sm text-gray-600">Each post serves a specific goal: educate, entertain, inspire, or promote</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Time-Optimized</h4>
                    <p className="text-sm text-gray-600">Scheduled for maximum reach when your audience is most active</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Multi-Platform</h4>
                    <p className="text-sm text-gray-600">Optimized for different social media platforms and their unique audiences</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-purple-200 mt-4">
                <p className="text-sm text-gray-600">
                  <strong>Pro Tip:</strong> Choose AI-powered posts for quick, creative content generation, or manual posts for complete 
                  control over every detail of your message.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Button
            className="group gradient-primary p-8 h-auto hover:scale-105 transition-transform"
            onClick={() => setLocation("/ai-post")}
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <i className="fas fa-magic text-4xl group-hover:animate-pulse"></i>
              </div>
              <h3 className="text-2xl font-bold mb-3">New AI Automated Post</h3>
              <p className="opacity-90">Let AI create engaging content for you automatically</p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="group bg-white border-2 border-gray-200 p-8 h-auto hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => setLocation("/manual-post")}
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <i className="fas fa-edit text-4xl text-gray-600 group-hover:text-primary"></i>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">New Manual Post</h3>
              <p className="text-gray-600">Create and customize your content manually</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
