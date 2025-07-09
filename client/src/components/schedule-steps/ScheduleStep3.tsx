import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useScheduleWizard } from "@/contexts/ScheduleWizardContext";
import { SiFacebook, SiInstagram, SiLinkedin, SiTiktok, SiYoutube, SiDiscord, SiTelegram } from "react-icons/si";
import { Zap, CheckCircle, XCircle, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const platforms = [
  {
    id: "facebook",
    name: "Facebook",
    icon: SiFacebook,
    color: "#1877F2",
    bgClass: "bg-blue-600"
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: SiInstagram,
    color: "#E4405F",
    bgClass: "bg-gradient-to-r from-purple-500 to-pink-500"
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: SiLinkedin,
    color: "#0A66C2",
    bgClass: "bg-blue-700"
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: SiTiktok,
    color: "#000000",
    bgClass: "bg-black"
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: SiYoutube,
    color: "#FF0000",
    bgClass: "bg-red-600"
  },
  {
    id: "discord",
    name: "Discord",
    icon: SiDiscord,
    color: "#5865F2",
    bgClass: "bg-indigo-600"
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: SiTelegram,
    color: "#26A5E4",
    bgClass: "bg-blue-500"
  }
];

export default function ScheduleStep3() {
  const { scheduleData, updateScheduleData } = useScheduleWizard();
  const [allPlatformsSelected, setAllPlatformsSelected] = useState(false);
  const [platformStates, setPlatformStates] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  // Fetch social media configurations to check connection status
  const { data: socialMediaConfigs, isLoading } = useQuery({
    queryKey: ['/api/social-media-configs'],
    enabled: true
  });

  // Initialize platform states based on connection status
  useEffect(() => {
    if (socialMediaConfigs && !Object.keys(platformStates).length) {
      const initialStates = platforms.reduce((acc, platform) => {
        acc[platform.id] = isPlatformConnected(platform.id);
        return acc;
      }, {} as { [key: string]: boolean });
      setPlatformStates(initialStates);
    }
  }, [socialMediaConfigs, platformStates]);

  // Initialize with all platforms selected by default (only on mount)
  useEffect(() => {
    if (!scheduleData.selectedPlatforms || scheduleData.selectedPlatforms.length === 0) {
      const allPlatformIds = platforms.map(p => p.id);
      updateScheduleData({
        selectedPlatforms: allPlatformIds
      });
      setAllPlatformsSelected(true);
    } else {
      setAllPlatformsSelected(scheduleData.selectedPlatforms.length === platforms.length);
    }
  }, []); // Only run on mount

  // Update allPlatformsSelected state when selectedPlatforms changes
  useEffect(() => {
    if (scheduleData.selectedPlatforms) {
      setAllPlatformsSelected(scheduleData.selectedPlatforms.length === platforms.length);
    }
  }, [scheduleData.selectedPlatforms]);

  const handlePlatformToggle = (platformId: string, checked: boolean | string) => {
    const isChecked = typeof checked === 'string' ? checked === 'true' : checked;
    const currentPlatforms = scheduleData.selectedPlatforms || [];
    
    let newPlatforms;
    if (isChecked) {
      // Add platform if not already selected
      newPlatforms = currentPlatforms.includes(platformId) 
        ? currentPlatforms 
        : [...currentPlatforms, platformId];
    } else {
      // Remove platform
      newPlatforms = currentPlatforms.filter(id => id !== platformId);
    }

    updateScheduleData({
      selectedPlatforms: newPlatforms
    });
    
    setAllPlatformsSelected(newPlatforms.length === platforms.length);
  };

  const togglePlatformActive = (platformId: string) => {
    setPlatformStates(prev => ({
      ...prev,
      [platformId]: !prev[platformId]
    }));
    
    const newState = !platformStates[platformId];
    toast({
      title: `${platforms.find(p => p.id === platformId)?.name} ${newState ? 'activated' : 'deactivated'}`,
      description: `Platform is now ${newState ? 'active' : 'inactive'}`,
    });
  };

  const handleAllPlatformsToggle = (checked: boolean | string) => {
    const isChecked = typeof checked === 'string' ? checked === 'true' : checked;
    const newPlatforms = isChecked ? platforms.map(p => p.id) : [];
    updateScheduleData({
      selectedPlatforms: newPlatforms
    });
    setAllPlatformsSelected(isChecked);
  };

  const isSelected = (platformId: string) => {
    return scheduleData.selectedPlatforms?.includes(platformId) || false;
  };

  const isPlatformConnected = (platformId: string) => {
    if (!socialMediaConfigs || !Array.isArray(socialMediaConfigs)) return false;
    const config = socialMediaConfigs.find((config: any) => config.platformId === platformId);
    return config && config.testStatus === 'connected';
  };

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-standard">
          <Settings className="h-5 w-5 text-purple-600" />
          Post Format & Style
        </CardTitle>
        <p className="text-muted">
          Configure post format and select active social media platforms for your scheduled content.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Select All Checkbox */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Checkbox
            id="all-platforms"
            checked={allPlatformsSelected}
            onCheckedChange={handleAllPlatformsToggle}
            className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
          />
          <label htmlFor="all-platforms" className="font-medium text-standard cursor-pointer">
            All Platforms
          </label>
          <span className="text-sm text-muted">
            ({scheduleData.selectedPlatforms?.length || 0} of {platforms.length} selected)
          </span>
        </div>

        <div className="space-y-4">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const selected = isSelected(platform.id);
            const connected = isPlatformConnected(platform.id);
            const isActive = platformStates[platform.id] !== false;
            
            return (
              <div
                key={platform.id}
                className={`relative rounded-lg border-2 transition-all duration-200 border-l-4 ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-950/20 border-gray-200 dark:border-gray-700' 
                    : 'opacity-60 bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700'
                }`}
                style={{
                  borderLeftColor: isActive ? platform.color : '#9ca3af'
                }}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={platform.id}
                        checked={selected}
                        onCheckedChange={(checked) => handlePlatformToggle(platform.id, checked)}
                        className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`${isActive ? platform.bgClass : 'bg-gray-400 dark:bg-gray-600'} p-2 rounded-lg flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-200'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${isActive ? 'text-standard' : 'text-gray-500 dark:text-gray-400'}`}>
                              {platform.name}
                            </h3>
                            {!isLoading && (
                              <div className="flex items-center gap-1">
                                {connected ? (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-xs">Connected</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-red-600">
                                    <XCircle className="h-4 w-4" />
                                    <span className="text-xs">Not Connected</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <p className={`text-sm ${isActive ? 'text-muted' : 'text-gray-400 dark:text-gray-500'}`}>
                            {platform.id === 'facebook' && 'Share posts, images, and engage with your audience'}
                            {platform.id === 'instagram' && 'Post photos, stories, and reels to your profile'}
                            {platform.id === 'linkedin' && 'Share professional content and network updates'}
                            {platform.id === 'tiktok' && 'Create and share short-form video content'}
                            {platform.id === 'youtube' && 'Upload videos and manage your channel'}
                            {platform.id === 'discord' && 'Share content in servers and communities'}
                            {platform.id === 'telegram' && 'Send messages and media to channels'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Max: 63206 content, 10 media
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={isActive ? "default" : "secondary"}
                        className={`transition-all duration-200 ${
                          isActive 
                            ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => togglePlatformActive(platform.id)}
                        className={`transition-all duration-200 ${
                          isActive ? 'data-[state=checked]:bg-green-500' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!isLoading && (
          <div className="text-center text-sm text-muted">
            {socialMediaConfigs && Array.isArray(socialMediaConfigs) && socialMediaConfigs.length > 0 
              ? `${socialMediaConfigs.filter((config: any) => config.testStatus === 'connected').length} platform(s) connected`
              : 'No platforms connected yet'
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}