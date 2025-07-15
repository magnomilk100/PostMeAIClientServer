import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  SiFacebook, 
  SiInstagram, 
  SiLinkedin, 
  SiTiktok, 
  SiYoutube, 
  SiDiscord, 
  SiTelegram 
} from 'react-icons/si';
import { Users, Target, Calendar, BarChart3, Globe, Zap } from 'lucide-react';

export default function SocialMedias() {
  const platforms = [
    {
      name: "Facebook",
      icon: SiFacebook,
      color: "#1877F2",
      bgColor: "bg-[#1877F2]",
      users: "2.9B+ Monthly Users",
      description: "The world's largest social network, perfect for building communities and reaching diverse audiences.",
      features: [
        "Text posts up to 63,206 characters",
        "Image and video sharing",
        "Stories and live streaming",
        "Groups and Pages management",
        "Advanced advertising tools",
        "Event creation and management"
      ],
      bestFor: [
        "Community building",
        "Brand awareness campaigns",
        "Customer engagement",
        "Event promotion",
        "B2C marketing"
      ],
      contentTypes: ["Posts", "Stories", "Videos", "Events", "Live Streams"],
      optimal: "1-2 posts per day"
    },
    {
      name: "Instagram",
      icon: SiInstagram,
      color: "#E4405F",
      bgColor: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045]",
      users: "2B+ Monthly Users",
      description: "Visual-first platform ideal for sharing photos, videos, and Stories with a younger demographic.",
      features: [
        "Photo and video posts",
        "Stories with interactive stickers",
        "Reels for short-form video",
        "IGTV for longer videos",
        "Shopping integration",
        "Direct messaging"
      ],
      bestFor: [
        "Visual storytelling",
        "Product showcases",
        "Influencer marketing",
        "Brand lifestyle content",
        "E-commerce integration"
      ],
      contentTypes: ["Posts", "Stories", "Reels", "IGTV", "Shopping"],
      optimal: "1-3 posts per day"
    },
    {
      name: "LinkedIn",
      icon: SiLinkedin,
      color: "#0A66C2",
      bgColor: "bg-[#0A66C2]",
      users: "900M+ Members",
      description: "Professional networking platform for business connections, thought leadership, and career development.",
      features: [
        "Professional posts up to 3,000 characters",
        "Article publishing",
        "Company pages",
        "Professional messaging",
        "Networking tools",
        "Job posting capabilities"
      ],
      bestFor: [
        "B2B marketing",
        "Professional networking",
        "Thought leadership",
        "Recruitment",
        "Industry insights"
      ],
      contentTypes: ["Posts", "Articles", "Videos", "Documents", "Polls"],
      optimal: "1 post per day"
    },
    {
      name: "TikTok",
      icon: SiTiktok,
      color: "#000000",
      bgColor: "bg-[#000000]",
      users: "1B+ Monthly Users",
      description: "Short-form video platform known for viral content, trending challenges, and creative expression.",
      features: [
        "15-second to 10-minute videos",
        "Advanced editing tools",
        "Music and sound effects",
        "Duets and collaborations",
        "Trending hashtags",
        "Live streaming"
      ],
      bestFor: [
        "Viral marketing",
        "Creative content",
        "Reaching Gen Z",
        "Brand personality",
        "Entertainment content"
      ],
      contentTypes: ["Videos", "Live Streams", "Duets", "Challenges"],
      optimal: "1-3 videos per day"
    },
    {
      name: "YouTube",
      icon: SiYoutube,
      color: "#FF0000",
      bgColor: "bg-[#FF0000]",
      users: "2.7B+ Monthly Users",
      description: "Video-sharing platform for long-form content, tutorials, entertainment, and educational materials.",
      features: [
        "Long-form video content",
        "YouTube Shorts",
        "Live streaming",
        "Community posts",
        "Channel customization",
        "Monetization options"
      ],
      bestFor: [
        "Educational content",
        "Product demonstrations",
        "Entertainment",
        "Tutorials",
        "Brand storytelling"
      ],
      contentTypes: ["Videos", "Shorts", "Live Streams", "Community Posts"],
      optimal: "1-2 videos per week"
    },
    {
      name: "Discord",
      icon: SiDiscord,
      color: "#5865F2",
      bgColor: "bg-[#5865F2]",
      users: "150M+ Monthly Users",
      description: "Community-focused platform for real-time communication through text, voice, and video.",
      features: [
        "Server-based communities",
        "Voice and text channels",
        "Screen sharing",
        "Bot integrations",
        "Roles and permissions",
        "File sharing"
      ],
      bestFor: [
        "Gaming communities",
        "Tech communities",
        "Real-time engagement",
        "Customer support",
        "Exclusive communities"
      ],
      contentTypes: ["Messages", "Announcements", "Media", "Voice Chats"],
      optimal: "Multiple daily interactions"
    },
    {
      name: "Telegram",
      icon: SiTelegram,
      color: "#26A5E4",
      bgColor: "bg-[#26A5E4]",
      users: "800M+ Monthly Users",
      description: "Messaging app with channels and groups for broadcasting content and building communities.",
      features: [
        "Channels for broadcasting",
        "Groups for discussions",
        "Bot integrations",
        "File sharing up to 2GB",
        "Message scheduling",
        "Self-destructing messages"
      ],
      bestFor: [
        "News and updates",
        "Community building",
        "File sharing",
        "Automated content",
        "Global reach"
      ],
      contentTypes: ["Messages", "Media", "Files", "Polls"],
      optimal: "1-5 messages per day"
    }
  ];

  const integrationFeatures = [
    {
      icon: Zap,
      title: "One-Click Publishing",
      description: "Publish to all connected platforms simultaneously with a single click"
    },
    {
      icon: Target,
      title: "Platform Optimization",
      description: "Automatically optimize content format and size for each platform"
    },
    {
      icon: Calendar,
      title: "Unified Scheduling",
      description: "Schedule posts across all platforms from one centralized dashboard"
    },
    {
      icon: BarChart3,
      title: "Cross-Platform Analytics",
      description: "Track performance metrics across all your social media channels"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Expand your reach across multiple platforms and audiences"
    },
    {
      icon: Users,
      title: "Audience Insights",
      description: "Understand your audience behavior across different platforms"
    }
  ];

  return (
    <div className="page-content">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Supported Social Media Platforms
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          PostMeAI seamlessly integrates with all major social media platforms, allowing you to manage your entire social media presence from one dashboard
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {platforms.map((platform, idx) => (
            <div key={idx} className={`p-2 rounded-lg ${platform.bgColor} text-white`}>
              <platform.icon className="w-6 h-6" />
            </div>
          ))}
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {platforms.map((platform, index) => (
          <Card key={index} className="modern-card hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-lg ${platform.bgColor} text-white`}>
                  <platform.icon className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{platform.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {platform.users}
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {platform.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 text-purple-600 dark:text-purple-400">Key Features</h4>
                <ul className="space-y-1">
                  {platform.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-purple-600 dark:text-purple-400">Best For</h4>
                <div className="flex flex-wrap gap-2">
                  {platform.bestFor.map((item, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1 text-purple-600 dark:text-purple-400">Content Types</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {platform.contentTypes.join(", ")}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-purple-600 dark:text-purple-400">Posting Frequency</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {platform.optimal}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Features */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Integration Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrationFeatures.map((feature, index) => (
            <Card key={index} className="text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full">
                  <feature.icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Ready to Connect Your Social Media?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Start managing all your social media platforms from one powerful dashboard. Connect your accounts and begin creating amazing content today.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Link href="/register">Get Started Free</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/features">Explore Features</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}