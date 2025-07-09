import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useScheduleWizard } from "@/contexts/ScheduleWizardContext";
import { SiFacebook, SiInstagram, SiLinkedin, SiTiktok, SiYoutube, SiDiscord, SiTelegram } from "react-icons/si";
import { Settings, Hash, Image, Video, FileText, Eye, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import React from "react";

const platformConfigs = {
  facebook: {
    name: "Facebook",
    icon: SiFacebook,
    color: "#1877F2",
    bgClass: "bg-blue-600",
    defaults: { image: false, hashtags: false, hashtagCount: 5 },
    previewImage: "/attached_assets/Instagram_1751927342406.JPG" // Use Instagram image for Facebook
  },
  instagram: {
    name: "Instagram", 
    icon: SiInstagram,
    color: "#E4405F",
    bgClass: "bg-gradient-to-r from-purple-500 to-pink-500",
    defaults: { image: true, hashtags: true, hashtagCount: 7 },
    previewImage: "/attached_assets/Instagram_1751927342406.JPG"
  },
  linkedin: {
    name: "LinkedIn",
    icon: SiLinkedin,
    color: "#0A66C2", 
    bgClass: "bg-blue-700",
    defaults: { image: true, hashtags: true, hashtagCount: 7 },
    previewImage: "/attached_assets/Linkedin_1751927342407.JPG"
  },
  tiktok: {
    name: "TikTok",
    icon: SiTiktok,
    color: "#000000",
    bgClass: "bg-black",
    defaults: { image: false, hashtags: false, hashtagCount: 5 },
    previewImage: "/attached_assets/Instagram_1751927342406.JPG" // Use Instagram image for TikTok
  },
  youtube: {
    name: "YouTube",
    icon: SiYoutube,
    color: "#FF0000",
    bgClass: "bg-red-600",
    defaults: { image: false, video: true, hashtags: true, hashtagCount: 7, videoReadOnly: true },
    previewImage: "/attached_assets/Linkedin_1751927342407.JPG" // Use LinkedIn image for YouTube
  },
  discord: {
    name: "Discord",
    icon: SiDiscord,
    color: "#5865F2",
    bgClass: "bg-indigo-600",
    defaults: { image: true, hashtags: true, hashtagCount: 7 },
    previewImage: "/attached_assets/Instagram_1751927342406.JPG" // Use Instagram image for Discord
  },
  telegram: {
    name: "Telegram",
    icon: SiTelegram,
    color: "#26A5E4",
    bgClass: "bg-blue-500",
    defaults: { image: false, hashtags: false, hashtagCount: 5 },
    previewImage: "/attached_assets/Linkedin_1751927342407.JPG" // Use LinkedIn image for Telegram
  }
};

export default function ScheduleStep4() {
  const { scheduleData, updateScheduleData } = useScheduleWizard();
  const [platformStates, setPlatformStates] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  // Fetch social media configurations to check connection status
  const { data: socialMediaConfigs, isLoading: configsLoading } = useQuery({
    queryKey: ['/api/social-media-configs'],
    enabled: true
  });

  // Helper function to check if platform is connected
  const isPlatformConnected = (platformId: string) => {
    if (!socialMediaConfigs || !Array.isArray(socialMediaConfigs)) return false;
    const config = socialMediaConfigs.find((config: any) => config.platformId === platformId);
    return config ? config.testStatus === 'connected' : false;
  };

  // Restore existing platform states when component mounts
  useEffect(() => {
    if (scheduleData.platformStates && Object.keys(scheduleData.platformStates).length > 0) {
      setPlatformStates(scheduleData.platformStates);
    }
  }, []); // Only run once on mount

  // Initialize platform states based on connection status for new platforms only
  useEffect(() => {
    if (!configsLoading && socialMediaConfigs && scheduleData.selectedPlatforms && scheduleData.selectedPlatforms.length > 0) {
      const currentStates = scheduleData.platformStates || {};
      
      const initialStates = scheduleData.selectedPlatforms.reduce((acc, platformId) => {
        // Only initialize if the platform doesn't already have a state (preserve user changes)
        if (currentStates[platformId] !== undefined) {
          acc[platformId] = currentStates[platformId];
        } else {
          // Initialize new platforms based on connection status
          const isConnected = isPlatformConnected(platformId);
          acc[platformId] = isConnected;
        }
        return acc;
      }, {} as { [key: string]: boolean });
      
      setPlatformStates(initialStates);
      
      // Only save to context if there are changes or if currentStates is empty
      const hasChanges = Object.keys(initialStates).some(key => 
        initialStates[key] !== currentStates[key]
      ) || Object.keys(currentStates).length === 0;
      
      if (hasChanges) {
        updateScheduleData({
          platformStates: initialStates
        });
      }
    }
  }, [socialMediaConfigs, configsLoading, scheduleData.selectedPlatforms]);

  // Initialize platform configs with defaults when component mounts
  useEffect(() => {
    if (scheduleData.selectedPlatforms && scheduleData.selectedPlatforms.length > 0) {
      const initialConfigs = {};
      let hasNewConfigs = false;
      
      scheduleData.selectedPlatforms.forEach((platformId) => {
        const platform = platformConfigs[platformId];
        if (platform && !scheduleData.platformConfigs[platformId]) {
          initialConfigs[platformId] = {
            title: true,
            body: true,
            image: platform.defaults.image || false,
            video: platform.defaults.video || false,
            carousel: false,
            hashtags: platform.defaults.hashtags || false,
            hashtagCount: platform.defaults.hashtagCount || 5,
            videoReadOnly: platform.defaults.videoReadOnly || false
          };
          hasNewConfigs = true;
        }
      });
      
      if (hasNewConfigs) {
        updateScheduleData({
          platformConfigs: {
            ...scheduleData.platformConfigs,
            ...initialConfigs
          }
        });
      }
    }
  }, [scheduleData.selectedPlatforms]);

  const handleConfigChange = (platformId: string, field: string, value: boolean | number) => {
    updateScheduleData({
      platformConfigs: {
        ...scheduleData.platformConfigs,
        [platformId]: {
          ...scheduleData.platformConfigs[platformId],
          [field]: value
        }
      }
    });
  };

  const togglePlatformActive = (platformId: string) => {
    const newState = !platformStates[platformId];
    const updatedStates = {
      ...platformStates,
      [platformId]: newState
    };
    
    setPlatformStates(updatedStates);
    
    // Save to wizard context to persist across navigation
    updateScheduleData({
      platformStates: updatedStates
    });
    
    const platformName = platformConfigs[platformId]?.name || platformId;
    toast({
      title: `${platformName} ${newState ? 'activated' : 'deactivated'}`,
      description: `Platform is now ${newState ? 'active' : 'inactive'}`,
    });
  };

  const selectedPlatforms = scheduleData.selectedPlatforms || [];

  // Create sorted platforms array that updates when platformStates changes
  const sortedSelectedPlatforms = React.useMemo(() => {
    if (!selectedPlatforms.length || !Object.keys(platformStates).length) return selectedPlatforms;
    
    return [...selectedPlatforms].sort((a, b) => {
      const stateA = platformStates[a] !== false;
      const stateB = platformStates[b] !== false;
      
      // Sort by active status: active platforms first (true > false)
      if (stateA === stateB) return 0;
      if (stateA && !stateB) return -1;
      if (!stateA && stateB) return 1;
      return 0;
    });
  }, [selectedPlatforms, platformStates]);

  return (
    <div className="space-y-6">
      <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-standard">
          <Settings className="h-5 w-5 text-purple-600" />
          Post Format & Style
        </CardTitle>
        <p className="text-muted">
          Configure the content format and style preferences for each selected platform.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedPlatforms.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Please select platforms in the previous step to configure their format settings.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Platform Configuration Cards */}
            {sortedSelectedPlatforms.map((platformId) => {
              const platform = platformConfigs[platformId];
              const config = scheduleData.platformConfigs[platformId] || {};
              const Icon = platform.icon;
              const isConnected = isPlatformConnected(platformId);
              const isActive = platformStates[platformId] !== false;
              
              return (
                <Card key={platformId} className={`border-l-4 transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-950/20 border-gray-200 dark:border-gray-700' 
                    : 'opacity-60 bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700'
                }`} style={{ borderLeftColor: isActive ? platform.color : '#9ca3af' }}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className={`${isActive ? platform.bgClass : 'bg-gray-400 dark:bg-gray-600'} p-2 rounded-lg flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-200'}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className={`${isActive ? 'text-standard' : 'text-gray-500 dark:text-gray-400'}`}>
                            {platform.name}
                          </span>
                          {!configsLoading && (
                            <div className="flex items-center gap-1 mt-1">
                              {isConnected ? (
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
                      </CardTitle>
                      
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
                          onCheckedChange={() => togglePlatformActive(platformId)}
                          className={`transition-all duration-200 ${
                            isActive ? 'data-[state=checked]:bg-green-500' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className={`space-y-4 transition-all duration-200 ${
                    isActive ? '' : 'opacity-60'
                  }`}>
                    {!isActive && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          Platform is inactive. Enable the toggle above to configure format settings.
                        </p>
                      </div>
                    )}
                    
                    {/* Content Types */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-standard">Content Elements</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${platformId}-title`}
                            checked={config.title !== false}
                            onCheckedChange={(checked) => handleConfigChange(platformId, 'title', checked)}
                            disabled={!isActive}
                          />
                          <Label htmlFor={`${platformId}-title`} className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4" />
                            Title
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${platformId}-body`}
                            checked={config.body !== false}
                            onCheckedChange={(checked) => handleConfigChange(platformId, 'body', checked)}
                            disabled={!isActive}
                          />
                          <Label htmlFor={`${platformId}-body`} className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4" />
                            Body Content
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${platformId}-image`}
                            checked={config.image || false}
                            onCheckedChange={(checked) => handleConfigChange(platformId, 'image', checked)}
                            disabled={!isActive}
                          />
                          <Label htmlFor={`${platformId}-image`} className="flex items-center gap-2 text-sm">
                            <Image className="h-4 w-4" />
                            Images
                          </Label>
                        </div>
                        
                        {platform.defaults.video && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${platformId}-video`}
                              checked={config.video || false}
                              onCheckedChange={(checked) => handleConfigChange(platformId, 'video', checked)}
                              disabled={!isActive || platform.defaults.videoReadOnly}
                            />
                            <Label htmlFor={`${platformId}-video`} className="flex items-center gap-2 text-sm">
                              <Video className="h-4 w-4" />
                              Video {platform.defaults.videoReadOnly && "(Default)"}
                            </Label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hashtags */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${platformId}-hashtags`}
                          checked={config.hashtags || false}
                          onCheckedChange={(checked) => handleConfigChange(platformId, 'hashtags', checked)}
                          disabled={!isActive}
                        />
                        <Label htmlFor={`${platformId}-hashtags`} className="flex items-center gap-2 text-sm font-medium">
                          <Hash className="h-4 w-4" />
                          Include Hashtags
                        </Label>
                      </div>
                      
                      {config.hashtags && (
                        <div className="ml-6 flex items-center gap-2">
                          <Label htmlFor={`${platformId}-hashtag-count`} className="text-sm text-muted">
                            Number of hashtags:
                          </Label>
                          <Input
                            id={`${platformId}-hashtag-count`}
                            type="number"
                            min="1"
                            max="30"
                            value={config.hashtagCount || 5}
                            onChange={(e) => handleConfigChange(platformId, 'hashtagCount', parseInt(e.target.value))}
                            className="w-20"
                            disabled={!isActive}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
      </Card>
    
      {/* Platform Preview Section - Moved to end of page */}
      {selectedPlatforms.length > 0 && (
        <Card className="modern-card border-purple-200 dark:border-purple-700 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-standard">
              <Eye className="h-5 w-5 text-purple-600" />
              Platform Preview
            </CardTitle>
            <p className="text-muted">
              Click on any platform button below to preview how your post will look on that social media platform.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sortedSelectedPlatforms.map((platformId) => {
                const platform = platformConfigs[platformId];
                const Icon = platform.icon;
                
                return (
                  <Dialog key={platformId}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-12 flex items-center gap-2 hover:ring-2 hover:ring-purple-500 transition-all duration-200"
                      >
                        <div className={`${platform.bgClass} p-1 rounded flex items-center justify-center`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">{platform.name}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <div className={`${platform.bgClass} p-2 rounded-lg flex items-center justify-center`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          {platform.name} Post Preview
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <img
                            src={platform.previewImage}
                            alt={`${platform.name} post preview`}
                            className="w-full max-w-lg mx-auto rounded-lg shadow-sm"
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}