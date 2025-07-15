import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Bot, Calendar, TrendingUp, Globe, FileText, Target, Headphones, Users, Building2, 
  Play, Star, Check, ArrowRight, Zap, Shield, Clock, Edit, Instagram, Youtube, 
  Twitter, Facebook, Linkedin, CheckCircle, BarChart, Sparkles, Smile, Heart, 
  MessageSquare, Share, Download, Eye, Palette, Layers, Lightbulb, Rocket 
} from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation('common');

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 to-blue-100/20 dark:from-purple-900/10 dark:to-blue-900/10"></div>
        
        <div className="page-content relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Join 50,000+ marketers who save 10+ hours per week
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Turn Ideas into Viral Content
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Post Smarter with PostMeAI
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Save 10+ hours per week while growing your social media presence by 300%. 
              The most complete set of AI-powered publishing tools for modern marketers.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-4 text-lg"
                onClick={() => setLocation("/post")}
              >
                Start Creating for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-4 text-lg"
                onClick={() => setLocation("/watch-demo")}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
              
              {/* Test button for onboarding wizard analysis */}
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-8 py-4 text-lg"
                onClick={() => setLocation("/onboarding")}
              >
                <Bot className="w-5 h-5 mr-2" />
                Test Onboarding Wizard
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Integrations Section */}
      <section className="py-12 bg-white dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <div className="page-content">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Connect your favorite accounts
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Schedule your content to the most popular platforms including Facebook, Instagram, TikTok, LinkedIn, and more
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-6 opacity-70">
            <div className="w-12 h-12 bg-[#1877F2] rounded-lg flex items-center justify-center">
              <Facebook className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-[#405DE6] to-[#E4405F] rounded-lg flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-[#0A66C2] rounded-lg flex items-center justify-center">
              <Linkedin className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-[#1DA1F2] rounded-lg flex items-center justify-center">
              <Twitter className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-[#FF0000] rounded-lg flex items-center justify-center">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-[#000000] rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <span className="text-black font-bold text-xs">T</span>
              </div>
            </div>
            <div className="text-gray-400 text-sm">+ 5 more platforms</div>
          </div>
        </div>
      </section>

      {/* Features Grid - 4 Main Features */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="page-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Publish Feature */}
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-3xl p-8 md:p-10">
              <div className="mb-6">
                <div className="inline-flex items-center space-x-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Zap className="w-4 h-4" />
                  <span>PUBLISH</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  The most complete set of publishing integrations, ever
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Schedule your content to the most popular platforms including Facebook, Instagram, TikTok, LinkedIn, Threads, Bluesky, YouTube Shorts, Pinterest, Google Business, Mastodon and X.
                </p>
                <Button 
                  variant="outline" 
                  className="bg-transparent border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
                  onClick={() => setLocation("/social-media")}
                >
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-purple-600" />
                  <span>Auto-publish your content or get a notification when it's time to post</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-purple-600" />
                  <span>Magically customize and repurpose your post for each platform</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-purple-600" />
                  <span>See everything you have scheduled in a calendar or queue view</span>
                </div>
              </div>
            </div>

            {/* Create Feature */}
            <div className="bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/20 dark:to-pink-800/20 rounded-3xl p-8 md:p-10">
              <div className="mb-6">
                <div className="inline-flex items-center space-x-2 bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Edit className="w-4 h-4" />
                  <span>CREATE</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Turn any idea into the perfect post
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Whether you're flying solo or working with a team, PostMeAI has all the features to help you create, organize, and repurpose your content for any channel. There's also an AI Assistant if you need it.
                </p>
                <Button 
                  variant="outline" 
                  className="bg-transparent border-pink-300 text-pink-700 hover:bg-pink-50 dark:border-pink-600 dark:text-pink-300 dark:hover:bg-pink-900/20"
                  onClick={() => setLocation("/post")}
                >
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-pink-600" />
                  <span>Import content from Canva, Dropbox, Google and more</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-pink-600" />
                  <span>Visually organize your ideas into groups or themes</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-pink-600" />
                  <span>Add a beautiful link in bio page to your profiles</span>
                </div>
              </div>
            </div>

            {/* Collaborate Feature */}
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-3xl p-8 md:p-10">
              <div className="mb-6">
                <div className="inline-flex items-center space-x-2 bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Users className="w-4 h-4" />
                  <span>COLLABORATE</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Great content, created together
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Collaborate seamlessly with your team. Invite unlimited collaborators, assign roles and permissions, and keep everyone aligned with saved drafts and notes.
                </p>
                <Button 
                  variant="outline" 
                  className="bg-transparent border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-900/20"
                  onClick={() => setLocation("/templates")}
                >
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-yellow-600" />
                  <span>Save all your ideas as inspiration strikes</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-yellow-600" />
                  <span>Learn exactly what content work best and why</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-yellow-600" />
                  <span>Create once, crosspost everywhere</span>
                </div>
              </div>
            </div>

            {/* Analyze Feature */}
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-3xl p-8 md:p-10">
              <div className="mb-6">
                <div className="inline-flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <BarChart className="w-4 h-4" />
                  <span>ANALYZE</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Answers, not just analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Whether it's basic analytics or in-depth reporting, PostMeAI will help you learn what works and how to improve.
                </p>
                <Button 
                  variant="outline" 
                  className="bg-transparent border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20"
                  onClick={() => setLocation("/documentation")}
                >
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span>See the best times, formats, and frequencies to post</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span>Get demographic data about your audience</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span>Tag and recycle your best-performing content</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="page-content">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Grow from zero → one → one million
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Whether you're just getting started on your creator journey or scaling your audience to new heights, PostMeAI will get your content in front of more people.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Twitter className="w-8 h-8 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">@rita_codes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">34.9K FOLLOWERS ON X</p>
                <p className="text-gray-700 dark:text-gray-300">Professional developer sharing coding tips and tutorials</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Linkedin className="w-8 h-8 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">@Pauldeloume</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">21K FOLLOWERS ON LINKEDIN</p>
                <p className="text-gray-700 dark:text-gray-300">Marketing strategist building personal brand</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Instagram className="w-8 h-8 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">@yola_bastos</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">14.6K FOLLOWERS ON INSTAGRAM</p>
                <p className="text-gray-700 dark:text-gray-300">Lifestyle content creator and influencer</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300">
                <Check className="w-5 h-5 text-green-500" />
                <span>Save all your ideas as inspiration strikes</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300">
                <Check className="w-5 h-5 text-green-500" />
                <span>Learn exactly what content work best and why</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300">
                <Check className="w-5 h-5 text-green-500" />
                <span>Create once, crosspost everywhere</span>
              </div>
            </div>
            
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
              onClick={() => setLocation("/post")}
            >
              Start Growing Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="page-content">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About us</h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
              We're an optimistic and gratitude-filled group of remote workers scattered around the world and dedicated to creating a product our customers will use and love.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">50K+</div>
                <div className="text-gray-300">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">1M+</div>
                <div className="text-gray-300">Posts Created</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">99%</div>
                <div className="text-gray-300">Satisfaction Rate</div>
              </div>
            </div>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
              onClick={() => setLocation("/documentation")}
            >
              Learn More About Us
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="page-content text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to turn your ideas into viral content?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of creators and businesses who save time and grow their audience with PostMeAI.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button 
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
              onClick={() => setLocation("/post")}
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
              onClick={() => setLocation("/subscription-plan")}
            >
              View Pricing
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
