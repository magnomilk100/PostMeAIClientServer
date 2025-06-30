import { Link, useLocation } from "wouter";
import { Search, Bell, Rocket, Home, Edit, Layers, Image, Share2, Settings, Book, LogOut, Loader2, CreditCard, Crown, Video, Clock, X, Users, MessageSquare, AlertTriangle, CheckCircle, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PageLoading, ComponentLoading } from "@/components/ui/loading";
import { useNavigationLoading } from "@/hooks/useNavigationLoading";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Main business navigation (most important features)
const businessNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Post", href: "/post", icon: Edit },
  { name: "Templates", href: "/templates", icon: Layers, requiresAuth: true },
  { name: "Images", href: "/images", icon: Image, requiresAuth: true },
  { name: "Social Media", href: "/social-media", icon: Share2, requiresAuth: true },
  { name: "Pendent Posts", href: "/pendent-posts", icon: Clock, requiresAuth: true },
];

// Billing and admin navigation (separated section)
const billingAdminNavigation = [
  { name: "Billing", href: "/billing", icon: CreditCard, requiresAuth: true },
  { name: "Subscription Plan", href: "/subscription-plan", icon: Crown, requiresAuth: true },
  { name: "Settings", href: "/settings", icon: Settings, requiresAuth: true },
];

// Learning and help navigation (separated section)
const learningHelpNavigation = [
  { name: "Video Demos", href: "/watch-demo", icon: Video },
  { name: "Documentation", href: "/documentation", icon: Book },
  { name: "i18n Demo", href: "/i18n-demo", icon: Globe },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const logoutMutation = useLogout();
  const { toast } = useToast();
  const isNavigationLoading = useNavigationLoading();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);

  // Search queries with database integration
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["/api/search", { q: searchQuery }],
    enabled: !!searchQuery && searchQuery.length > 2 && isAuthenticated,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Notifications query
  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
    refetchInterval: 60000, // Refetch every minute
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      refetchNotifications();
    },
  });

  // Helper functions
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.length > 2);
  };

  const handleSearchResultClick = (type: string, id: string, name: string) => {
    setSearchQuery(name);
    setShowSearchResults(false);
    
    // Navigate based on type
    switch (type) {
      case 'template':
        setLocation('/templates');
        break;
      case 'image':
        setLocation('/images');
        break;
      case 'social_media':
        setLocation('/social-media');
        break;
      case 'post':
        setLocation('/post');
        break;
      default:
        break;
    }
  };

  const handleCreditsClick = () => {
    setLocation('/billing');
    toast({
      title: "Credits Information",
      description: "You can purchase more credits on the billing page.",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'system':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      case 'social':
        return Users;
      default:
        return MessageSquare;
    }
  };

  const unreadNotifications = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead) : [];

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out",
          description: "You have been logged out successfully",
        });
        setLocation("/");
      },
    });
  };

  const getVisibleBusinessNavigation = () => {
    if (isAuthenticated) {
      return businessNavigation;
    }
    return businessNavigation.filter(item => !item.requiresAuth);
  };

  const getVisibleBillingAdminNavigation = () => {
    if (isAuthenticated) {
      return billingAdminNavigation;
    }
    return billingAdminNavigation.filter(item => !item.requiresAuth);
  };

  const getVisibleLearningHelpNavigation = () => {
    // Learning/Help navigation is always visible to all users
    return learningHelpNavigation;
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 w-full z-50 h-16">
        <div className="flex items-center justify-between px-6 h-full">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Rocket className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-gray-900">PostMeAI</span>
          </div>
          
          {/* Enhanced Search with Database Integration */}
          {isAuthenticated && (
            <div className="flex-1 max-w-md mx-8 relative">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search templates, images, social media..."
                  className="pl-10 pr-8"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.length > 2 && setShowSearchResults(true)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
                )}
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearchResults(false);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && Array.isArray(searchResults) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map((result: any) => {
                        const IconComponent = result.type === 'template' ? Layers : 
                                            result.type === 'image' ? Image : 
                                            result.type === 'social_media' ? Share2 : Edit;
                        return (
                          <div
                            key={`${result.type}-${result.id}`}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            onClick={() => handleSearchResultClick(result.type, result.id, result.name)}
                          >
                            <IconComponent className="w-4 h-4 text-gray-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{result.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{result.type.replace('_', ' ')}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {result.type}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* User Profile & Auth Actions */}
          <div className="flex items-center space-x-4">
            {/* Privacy Policy Menu - Always visible */}
            <Link href="/privacy-policy">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600">
                Privacy Policy
              </Button>
            </Link>
            
            {/* Language Switcher - Always visible */}
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <>
                {/* Enhanced Credits Display - Clickable */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreditsClick}
                  className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Credits:</span>
                  <span className="text-sm font-bold text-purple-600">
                    {user?.subscriptionStatus === 'active' ? 'Unlimited' : (user?.credits || 0)}
                  </span>
                </Button>
                
                {/* Enhanced Notifications Bell with Popover */}
                <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="w-5 h-5 text-gray-600" />
                      {unreadNotifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse">
                          <span className="absolute inset-0 rounded-full bg-red-500 opacity-75 animate-ping"></span>
                        </span>
                      )}
                      {unreadNotifications.length > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                          {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadNotifications.length > 0 && (
                          <Badge variant="secondary">{unreadNotifications.length} new</Badge>
                        )}
                      </div>
                    </div>
                    <ScrollArea className="max-h-80">
                      {Array.isArray(notifications) && notifications.length > 0 ? (
                        <div className="p-2">
                          {notifications.map((notification: any) => {
                            const IconComponent = getNotificationIcon(notification.type);
                            return (
                              <div
                                key={notification.id}
                                className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                                  notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                                }`}
                                onClick={() => {
                                  if (!notification.isRead) {
                                    markAsReadMutation.mutate(notification.id);
                                  }
                                }}
                              >
                                <div className="flex items-start space-x-3">
                                  <IconComponent className={`w-4 h-4 mt-0.5 ${
                                    notification.isRead ? 'text-gray-400' : 'text-blue-600'
                                  }`} />
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${
                                      notification.isRead ? 'text-gray-600' : 'text-gray-900'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    <p className={`text-xs mt-1 ${
                                      notification.isRead ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(notification.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">No notifications yet</p>
                          <p className="text-xs text-gray-400 mt-1">We'll notify you about important updates</p>
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    {user?.profileImageUrl ? (
                      <AvatarImage src={user.profileImageUrl} />
                    ) : null}
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || "User"}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-40">
        <nav className="p-4 space-y-6">
          {/* Business Navigation Section */}
          <div className="space-y-1">
            {getVisibleBusinessNavigation().map((item) => {
              const isActive = location === item.href;
              const IconComponent = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:text-primary hover:bg-gray-50"
                  }`}>
                    <IconComponent className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Separator */}
          <div className="border-t border-gray-200"></div>
          
          {/* Billing & Admin Navigation Section */}
          <div className="space-y-1">
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Account & Billing
              </h3>
            </div>
            {getVisibleBillingAdminNavigation().map((item) => {
              const isActive = location === item.href;
              const IconComponent = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:text-primary hover:bg-gray-50"
                  }`}>
                    <IconComponent className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Separator */}
          <div className="border-t border-gray-200"></div>
          
          {/* Learning & Help Navigation Section */}
          <div className="space-y-1">
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Learning & Help
              </h3>
            </div>
            {getVisibleLearningHelpNavigation().map((item) => {
              const isActive = location === item.href;
              const IconComponent = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:text-primary hover:bg-gray-50"
                  }`}>
                    <IconComponent className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Separator */}
          <div className="border-t border-gray-200"></div>
          
          {/* Logout button for authenticated users */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <LogOut className="w-5 h-5 mr-3" />
              )}
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-16 min-h-screen relative">
        {/* Navigation Loading Overlay */}
        {isNavigationLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <ComponentLoading text="Loading page..." />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
