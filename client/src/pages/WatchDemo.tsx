import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

// Demo videos data
const demoVideos = [
  {
    id: "VHGtSIOXS9c",
    title: "Getting Started with PostMeAI",
    description: "Learn the basics of creating AI-powered social media content. This comprehensive guide covers account setup, platform connections, and your first AI-generated post.",
    thumbnail: "https://img.youtube.com/vi/VHGtSIOXS9c/hqdefault.jpg",
    duration: "8:45"
  },
  {
    id: "QPIPGUGmtbk",
    title: "Advanced Content Templates",
    description: "Discover how to create reusable templates for consistent branding across all platforms. Master scheduling, automation, and bulk content generation.",
    thumbnail: "https://img.youtube.com/vi/QPIPGUGmtbk/hqdefault.jpg",
    duration: "12:30"
  },
  {
    id: "iX3HrzEie00",
    title: "Multi-Platform Publishing",
    description: "Optimize your content for different social media platforms. Learn platform-specific formatting, hashtag strategies, and engagement optimization.",
    thumbnail: "https://img.youtube.com/vi/iX3HrzEie00/hqdefault.jpg",
    duration: "15:20"
  },
  {
    id: "a1XUJvsHLoE",
    title: "Analytics & Performance",
    description: "Track your content performance across platforms. Understand engagement metrics, audience insights, and how to improve your content strategy.",
    thumbnail: "https://img.youtube.com/vi/a1XUJvsHLoE/hqdefault.jpg",
    duration: "10:15"
  },
  {
    id: "zx4yH0wxQRI",
    title: "Team Collaboration Features",
    description: "Learn how to collaborate with team members, manage permissions, and streamline your content approval workflow for enterprise use.",
    thumbnail: "https://img.youtube.com/vi/zx4yH0wxQRI/hqdefault.jpg",
    duration: "9:40"
  },
  {
    id: "zU1rl1Zr6gA",
    title: "AI Optimization Tips",
    description: "Master the art of AI prompt engineering for better content generation. Discover advanced techniques for creating engaging, brand-aligned content.",
    thumbnail: "https://img.youtube.com/vi/zU1rl1Zr6gA/hqdefault.jpg",
    duration: "11:55"
  }
];

export default function WatchDemo() {
  const [, setLocation] = useLocation();
  const [selectedVideo, setSelectedVideo] = useState<typeof demoVideos[0] | null>(null);

  return (
    <div className="page-content">
      {/* Header */}
      <div>
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Watch PostMeAI Demos</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Learn how to master AI-powered social media content creation with our comprehensive video tutorials. 
            From basic setup to advanced strategies, these demos will help you get the most out of PostMeAI.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {demoVideos.map((video, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow group">
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg">
                      <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-gray-900 ml-1" />
                      </div>
                    </div>
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg leading-tight">{video.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {video.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>{video.title}</DialogTitle>
                  <DialogDescription>
                    {video.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Need More Help?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Check out our comprehensive documentation 
              or get in touch with our support team for personalized assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setLocation("/documentation")}
                className="gradient-primary"
              >
                View Documentation
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation("/post")}
              >
                Start Creating Posts
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}