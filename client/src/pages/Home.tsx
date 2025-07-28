import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { ComponentLoading } from "@/components/ui/loading";
import { AuthGuard } from "@/components/AuthGuard";

import {
  Bot,
  Calendar,
  TrendingUp,
  Globe,
  FileText,
  Target,
  Headphones,
  Users,
  Building2,
  Play,
  Star,
  Check,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  Edit,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
  CheckCircle,
  BarChart,
  Sparkles,
  Smile,
  Heart,
  MessageSquare,
  Share,
  Download,
  Eye,
  Palette,
  Layers,
  Lightbulb,
  Rocket,
  CreditCard,
  Crown,
  Settings,
  DollarSign,
  Activity,
  PauseCircle,
  PlayCircle,
  TrendingDown,
  AlertCircle,
  CheckSquare,
  XCircle,
  RefreshCw,
  Calendar as CalendarIcon,
} from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation("common");
  const { user, isAuthenticated } = useAuth();

  // Query for dashboard analytics data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["/api/dashboard/analytics"],
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
  // If user is authenticated, show dashboard
  if (isAuthenticated) {
    return (
      <AuthGuard>
        <div className="page-content">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.firstName || "User"}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-1">
              Logged in as:{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {user?.email}
              </span>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Here's your PostMeAI dashboard overview
            </p>
          </div>
          {isDashboardLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-40">
                  <CardContent className="flex items-center justify-center h-full">
                    <ComponentLoading text="Loading..." />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Current Subscription Plan */}
              <Card className="modern-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Crown className="w-5 h-5 mr-2 text-purple-600" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboardData?.subscription?.plan || "Free"}
                      </span>
                      <Badge
                        variant={
                          dashboardData?.subscription?.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {dashboardData?.subscription?.status || "Free"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {dashboardData?.subscription?.nextPaymentDate
                        ? `Next payment: ${new Date(dashboardData.subscription.nextPaymentDate).toLocaleDateString()}`
                        : "No active subscription"}
                    </p>
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => setLocation("/subscription-plan")}
                    >
                      Manage Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {/* Pending Posts */}
              <Card className="modern-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                    Pending Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboardData?.pendingPosts || 0}
                      </span>
                      <Badge
                        variant={
                          dashboardData?.pendingPosts > 0
                            ? "destructive"
                            : "default"
                        }
                      >
                        {dashboardData?.pendingPosts > 0
                          ? "Action Required"
                          : "Up to Date"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Posts awaiting approval
                    </p>
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => setLocation("/pendent-posts")}
                    >
                      Review Posts
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {/* Weekly Posts Summary */}
              <Card className="modern-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <BarChart className="w-5 h-5 mr-2 text-blue-600" />
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboardData?.weeklyPosts?.total || 0}
                      </span>
                      <Badge variant="default">Total Posts</Badge>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>
                        AI: {dashboardData?.weeklyPosts?.aiPosts || 0}
                      </span>
                      <span>
                        Manual: {dashboardData?.weeklyPosts?.manualPosts || 0}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => setLocation("/post")}
                    >
                      Create Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {/* Active Schedulers */}
              <Card className="modern-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <CalendarIcon className="w-5 h-5 mr-2 text-green-600" />
                    Schedulers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboardData?.schedulers?.active || 0}
                      </span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {dashboardData?.schedulers?.inactive || 0} inactive
                      schedulers
                    </p>
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => setLocation("/post-schedule")}
                    >
                      Manage Schedulers
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {/* Credits Balance */}
              <Card className="modern-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                    Credits Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboardData?.credits?.balance || 0}
                      </span>
                      <Badge
                        variant={
                          dashboardData?.credits?.balance > 10
                            ? "default"
                            : "destructive"
                        }
                      >
                        {dashboardData?.credits?.balance > 10 ? "Good" : "Low"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Available credits
                    </p>
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => setLocation("/billing")}
                    >
                      Buy Credits
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {/* Performance Metrics */}
              <Card className="modern-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboardData?.performance?.engagementRate || 0}%
                      </span>
                      <Badge variant="default">Avg. Engagement</Badge>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>
                        Reach: {dashboardData?.performance?.totalReach || 0}
                      </span>
                      <span>
                        Clicks: {dashboardData?.performance?.totalClicks || 0}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => setLocation("/analytics")}
                    >
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </AuthGuard>
    );
  }
  // For non-authenticated users, show the landing page
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
              Save 10+ hours per week while growing your social media presence
              by 300%. The most complete set of AI-powered publishing tools for
              modern marketers.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-4 text-lg"
                onClick={() => setLocation("/login")}
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
              Schedule your content to the most popular platforms including
              Facebook, Instagram, TikTok, LinkedIn, and more
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
    </div>
  );
}
