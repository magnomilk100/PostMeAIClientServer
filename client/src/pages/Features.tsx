import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  Bot, 
  Calendar, 
  Image, 
  Share2, 
  BarChart3, 
  Users, 
  Palette, 
  Shield, 
  Clock,
  Zap,
  Target,
  Layers,
  Globe,
  Smartphone
} from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Bot,
      title: "AI Content Generation",
      description: "Generate engaging content for all your social media platforms with advanced AI technology",
      benefits: [
        "Smart content suggestions based on your industry",
        "Platform-specific optimization",
        "Trending hashtag recommendations",
        "Multiple content variations"
      ],
      category: "AI-Powered"
    },
    {
      icon: Calendar,
      title: "Advanced Post Scheduling",
      description: "Schedule posts across multiple platforms with our intelligent scheduling system",
      benefits: [
        "Optimal posting time suggestions",
        "Bulk scheduling capabilities",
        "Calendar view for content planning",
        "Recurring post templates"
      ],
      category: "Automation"
    },
    {
      icon: Image,
      title: "Media Library Management",
      description: "Organize and manage all your images and videos in one centralized location",
      benefits: [
        "Cloud-based storage",
        "Folder organization system",
        "Batch upload capabilities",
        "Auto-resize for different platforms"
      ],
      category: "Media"
    },
    {
      icon: Share2,
      title: "Multi-Platform Publishing",
      description: "Publish to Facebook, Instagram, LinkedIn, TikTok, YouTube, Discord, and Telegram",
      benefits: [
        "One-click multi-platform posting",
        "Platform-specific content adaptation",
        "Real-time publishing status",
        "Cross-platform analytics"
      ],
      category: "Publishing"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track engagement, reach, and performance across all your social media channels",
      benefits: [
        "Comprehensive engagement metrics",
        "Growth tracking over time",
        "Best performing content insights",
        "Custom reporting dashboards"
      ],
      category: "Analytics"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together with your team members in shared workspaces",
      benefits: [
        "Multi-user workspace management",
        "Role-based permissions",
        "Content approval workflows",
        "Team activity tracking"
      ],
      category: "Collaboration"
    },
    {
      icon: Palette,
      title: "Brand Consistency",
      description: "Maintain consistent branding across all your social media presence",
      benefits: [
        "Brand color palette management",
        "Logo and asset library",
        "Template customization",
        "Brand guideline enforcement"
      ],
      category: "Branding"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Enterprise-grade security features to protect your content and data",
      benefits: [
        "Two-factor authentication",
        "Data encryption",
        "Audit logs",
        "Compliance reporting"
      ],
      category: "Security"
    },
    {
      icon: Clock,
      title: "Time Zone Management",
      description: "Schedule posts for optimal timing across different time zones",
      benefits: [
        "Automatic time zone detection",
        "Global audience optimization",
        "Local time scheduling",
        "Multi-region campaigns"
      ],
      category: "Scheduling"
    },
    {
      icon: Zap,
      title: "Quick Actions",
      description: "Streamline your workflow with powerful quick action shortcuts",
      benefits: [
        "One-click post creation",
        "Bulk operations",
        "Keyboard shortcuts",
        "Template quick-start"
      ],
      category: "Productivity"
    },
    {
      icon: Target,
      title: "Audience Targeting",
      description: "Reach the right audience with advanced targeting capabilities",
      benefits: [
        "Demographic targeting",
        "Interest-based segmentation",
        "Behavioral targeting",
        "Custom audience creation"
      ],
      category: "Marketing"
    },
    {
      icon: Layers,
      title: "Content Templates",
      description: "Create reusable templates for consistent content creation",
      benefits: [
        "Pre-built template library",
        "Custom template creation",
        "Template sharing",
        "Version control"
      ],
      category: "Templates"
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Create content in multiple languages for global reach",
      benefits: [
        "Auto-translation features",
        "Language-specific optimization",
        "Cultural adaptation",
        "Localized content suggestions"
      ],
      category: "Global"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimization",
      description: "Fully responsive design that works perfectly on all devices",
      benefits: [
        "Mobile-first design",
        "Touch-friendly interface",
        "Offline capabilities",
        "App-like experience"
      ],
      category: "Mobile"
    }
  ];

  const categories = [...new Set(features.map(f => f.category))];

  return (
    <div className="page-content">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Powerful Features for Social Media Success
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Discover all the tools and features that make PostMeAI the ultimate social media management platform
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(category => (
            <Badge key={category} variant="secondary" className="px-3 py-1">
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <Card key={index} className="modern-card hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg">
                  <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {feature.category}
                </Badge>
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Join thousands of content creators and businesses who are already using PostMeAI to grow their social media presence
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Link href="/register">Start Free Trial</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/watch-demo">Watch Demo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}