import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bell, 
  Palette, 
  Building, 
  Shield, 
  Globe, 
  Clock, 
  Camera, 
  Settings as SettingsIcon,
  Save,
  Upload,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [, navigate] = useLocation();
  
  // Profile settings state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    bio: user?.bio || "",
    timezone: user?.timezone || "UTC",
    language: user?.language || "en",
    profileImage: user?.profileImageUrl || ""
  });

  // Update state when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        bio: user.bio || "",
        timezone: user.timezone || "UTC",
        language: user.language || "en",
        profileImage: user.profileImageUrl || ""
      });
      setNotifications({
        emailNotifications: user.emailNotifications ?? true,
        pushNotifications: user.pushNotifications ?? true,
        postReminders: user.postReminders ?? true,
        templateExecution: user.templateExecution ?? true,
        weeklyReports: user.weeklyReports ?? false,
        marketingEmails: user.marketingEmails ?? false
      });
      setThemeSettings({
        theme: theme,
        primaryColor: user.primaryColor || "purple",
        compactMode: user.compactMode ?? false,
        sidebarCollapsed: user.sidebarCollapsed ?? false
      });
      setCompanySettings({
        companyName: user.companyName || "",
        companyLogo: user.companyLogo || "",
        website: user.website || "",
        industry: user.industry || "",
        teamSize: user.teamSize || "",
        brandColors: user.brandColors || {
          primary: "#7c3aed",
          secondary: "#06b6d4",
          accent: "#f59e0b"
        }
      });
      setSessionSettings({
        sessionTimeout: user.sessionTimeout || "8",
        autoSave: Boolean(user.autoSave ?? true),
        rememberLogin: Boolean(user.rememberLogin ?? true),
        twoFactorAuth: Boolean(user.twoFactorAuth ?? false)
      });
    }
  }, [user]);

  // File upload handlers
  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Profile image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setProfileData({...profileData, profileImage: imageUrl});
        toast({
          title: "Profile photo updated",
          description: "Your profile photo has been changed successfully",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompanyLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Company logo must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setCompanySettings({...companySettings, companyLogo: imageUrl});
        toast({
          title: "Company logo updated",
          description: "Your company logo has been changed successfully",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    postReminders: true,
    templateExecution: true,
    weeklyReports: false,
    marketingEmails: false
  });

  // Theme settings state
  const [themeSettings, setThemeSettings] = useState({
    theme: "light",
    primaryColor: "purple",
    compactMode: false,
    sidebarCollapsed: false
  });

  // Company settings state
  const [companySettings, setCompanySettings] = useState({
    companyName: "",
    companyLogo: "",
    website: "",
    industry: "",
    teamSize: "",
    brandColors: {
      primary: "#7c3aed",
      secondary: "#06b6d4",
      accent: "#f59e0b"
    }
  });

  // Session settings state
  const [sessionSettings, setSessionSettings] = useState({
    sessionTimeout: "8",
    autoSave: true,
    rememberLogin: true,
    twoFactorAuth: false
  });

  // React Query mutations for database integration
  const profileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/settings/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile settings.",
        variant: "destructive",
      });
    },
  });

  const notificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/settings/notifications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    },
  });

  const themeMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/settings/theme", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Theme Updated",
        description: "Your theme preferences have been applied.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update theme settings.",
        variant: "destructive",
      });
    },
  });

  const companyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/settings/company", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Company Settings Updated",
        description: "Your company information has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update company settings.",
        variant: "destructive",
      });
    },
  });

  const securityMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/settings/security", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Security Settings Updated",
        description: "Your security preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update security settings.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    profileMutation.mutate({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      bio: profileData.bio,
      timezone: profileData.timezone,
      language: profileData.language,
      profileImageUrl: profileData.profileImage,
    });
  };

  const handleSaveNotifications = () => {
    notificationsMutation.mutate(notifications);
  };

  const handleSaveTheme = () => {
    themeMutation.mutate(themeSettings);
  };

  const handleSaveCompany = () => {
    companyMutation.mutate(companySettings);
  };

  const handleSaveSecurity = () => {
    securityMutation.mutate(sessionSettings);
  };

  return (
    <div className="page-content">
      <div className="flex items-center mb-8">
        <SettingsIcon className="w-8 h-8 mr-3 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">{t('settings.tabs.profile')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.tabs.notifications')}</TabsTrigger>
          <TabsTrigger value="theme">{t('settings.tabs.theme')}</TabsTrigger>
          <TabsTrigger value="company">{t('settings.tabs.company')}</TabsTrigger>
          <TabsTrigger value="security">{t('settings.tabs.security')}</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                {t('settings.profile.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.profile.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  {profileData.profileImage ? (
                    <AvatarImage src={profileData.profileImage} />
                  ) : null}
                  <AvatarFallback className="text-lg">
                    {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageUpload}
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('profile-image-upload')?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {t('settings.profile.changePhoto')}
                    </Button>
                    {profileData.profileImage && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setProfileData({...profileData, profileImage: ""});
                          toast({
                            title: "Profile photo removed",
                            description: "Your profile photo has been removed",
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('settings.profile.remove')}
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">{t('settings.profile.firstName')}</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t('settings.profile.lastName')}</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">{t('settings.profile.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="bio">{t('settings.profile.bio')}</Label>
                <Textarea
                  id="bio"
                  placeholder={t('settings.profile.bioPlaceholder')}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={profileData.timezone} onValueChange={(value) => setProfileData({...profileData, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">EST (Eastern)</SelectItem>
                      <SelectItem value="PST">PST (Pacific)</SelectItem>
                      <SelectItem value="CET">CET (Central Europe)</SelectItem>
                      <SelectItem value="JST">JST (Japan)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={profileData.language} onValueChange={(value) => setProfileData({...profileData, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleSaveProfile} 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={profileMutation.isPending}
              >
                {profileMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('settings.profile.saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t('settings.profile.saveProfile')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Post Reminders</Label>
                    <p className="text-sm text-gray-500">Reminders for scheduled posts</p>
                  </div>
                  <Switch
                    checked={notifications.postReminders}
                    onCheckedChange={(checked) => setNotifications({...notifications, postReminders: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Template Execution</Label>
                    <p className="text-sm text-gray-500">Notifications when templates run</p>
                  </div>
                  <Switch
                    checked={notifications.templateExecution}
                    onCheckedChange={(checked) => setNotifications({...notifications, templateExecution: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Weekly Reports</Label>
                    <p className="text-sm text-gray-500">Performance summaries via email</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => setNotifications({...notifications, weeklyReports: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Marketing Emails</Label>
                    <p className="text-sm text-gray-500">Product updates and tips</p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) => setNotifications({...notifications, marketingEmails: checked})}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSaveNotifications} 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={notificationsMutation.isPending}
              >
                {notificationsMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Notifications
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Theme & Appearance
              </CardTitle>
              <CardDescription>
                Customize how PostMeAI looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={(value) => {
                  setTheme(value as 'light' | 'dark' | 'auto');
                  setThemeSettings({...themeSettings, theme: value});
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t('settings.theme.themes.light')}</SelectItem>
                    <SelectItem value="dark">{t('settings.theme.themes.dark')}</SelectItem>
                    <SelectItem value="auto">{t('settings.theme.themes.auto')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Select value={themeSettings.primaryColor} onValueChange={(value) => setThemeSettings({...themeSettings, primaryColor: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Compact Mode</Label>
                    <p className="text-sm text-gray-500">Reduce spacing for more content</p>
                  </div>
                  <Switch
                    checked={themeSettings.compactMode}
                    onCheckedChange={(checked) => setThemeSettings({...themeSettings, compactMode: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Collapsed Sidebar</Label>
                    <p className="text-sm text-gray-500">Start with sidebar minimized</p>
                  </div>
                  <Switch
                    checked={themeSettings.sidebarCollapsed}
                    onCheckedChange={(checked) => setThemeSettings({...themeSettings, sidebarCollapsed: checked})}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSaveTheme} 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={themeMutation.isPending}
              >
                {themeMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Theme
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Settings */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Company & Brand Settings
              </CardTitle>
              <CardDescription>
                Manage your company information and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companySettings.companyName}
                  onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
                  placeholder="Your company name"
                />
              </div>

              <div>
                <Label htmlFor="companyLogo">Company Logo</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    {companySettings.companyLogo ? (
                      <img src={companySettings.companyLogo} alt="Company Logo" className="w-14 h-14 object-contain rounded-lg" />
                    ) : (
                      <Building className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      id="company-logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCompanyLogoUpload}
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('company-logo-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                      {companySettings.companyLogo && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setCompanySettings({...companySettings, companyLogo: ""});
                            toast({
                              title: "Company logo removed",
                              description: "Your company logo has been removed",
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('settings.profile.remove')}
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                    placeholder="https://yourcompany.com"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={companySettings.industry} onValueChange={(value) => setCompanySettings({...companySettings, industry: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="teamSize">Team Size</Label>
                <Select value={companySettings.teamSize} onValueChange={(value) => setCompanySettings({...companySettings, teamSize: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Just me</SelectItem>
                    <SelectItem value="2-10">2-10 people</SelectItem>
                    <SelectItem value="11-50">11-50 people</SelectItem>
                    <SelectItem value="51-200">51-200 people</SelectItem>
                    <SelectItem value="200+">200+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium mb-4 block">Brand Colors</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primaryColor" className="text-sm">Primary</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: companySettings.brandColors.primary }}
                      ></div>
                      <Input
                        id="primaryColor"
                        value={companySettings.brandColors.primary}
                        onChange={(e) => setCompanySettings({
                          ...companySettings, 
                          brandColors: {...companySettings.brandColors, primary: e.target.value}
                        })}
                        placeholder="#7c3aed"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor" className="text-sm">Secondary</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: companySettings.brandColors.secondary }}
                      ></div>
                      <Input
                        id="secondaryColor"
                        value={companySettings.brandColors.secondary}
                        onChange={(e) => setCompanySettings({
                          ...companySettings, 
                          brandColors: {...companySettings.brandColors, secondary: e.target.value}
                        })}
                        placeholder="#06b6d4"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accentColor" className="text-sm">Accent</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: companySettings.brandColors.accent }}
                      ></div>
                      <Input
                        id="accentColor"
                        value={companySettings.brandColors.accent}
                        onChange={(e) => setCompanySettings({
                          ...companySettings, 
                          brandColors: {...companySettings.brandColors, accent: e.target.value}
                        })}
                        placeholder="#f59e0b"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSaveCompany} 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={companyMutation.isPending}
              >
                {companyMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Company Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security & Session Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and session preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Select value={sessionSettings.sessionTimeout} onValueChange={(value) => setSessionSettings({...sessionSettings, sessionTimeout: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Auto-save Drafts</Label>
                    <p className="text-sm text-gray-500">Automatically save your work</p>
                  </div>
                  <Switch
                    checked={sessionSettings.autoSave}
                    onCheckedChange={(checked) => setSessionSettings({...sessionSettings, autoSave: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Remember Login</Label>
                    <p className="text-sm text-gray-500">Stay logged in on this device</p>
                  </div>
                  <Switch
                    checked={sessionSettings.rememberLogin}
                    onCheckedChange={(checked) => setSessionSettings({...sessionSettings, rememberLogin: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={sessionSettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSessionSettings({...sessionSettings, twoFactorAuth: checked})}
                    />
                    {sessionSettings.twoFactorAuth && (
                      <Badge variant="outline" className="text-green-600">Enabled</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Password Management</h3>
                <div className="space-y-4">
                  <Button variant="outline">
                    Change Password
                  </Button>
                  <div>
                    <p className="text-sm text-gray-500">
                      Last password change: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Account Management</h3>
                <div className="space-y-4">
                  <Button variant="outline">
                    Download My Data
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => navigate("/user-data-deletion")}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                  <p className="text-sm text-gray-500">
                    Account deletion is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleSaveSecurity} 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={securityMutation.isPending}
              >
                {securityMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Security Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
