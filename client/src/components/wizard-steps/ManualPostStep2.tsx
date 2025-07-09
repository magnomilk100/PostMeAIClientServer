import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useWizard } from "@/contexts/WizardContext";
import { useQuery } from "@tanstack/react-query";
import { SiFacebook, SiInstagram, SiLinkedin, SiTiktok, SiYoutube, SiDiscord, SiTelegram } from "react-icons/si";
import { Users, CheckCircle, XCircle, Zap } from "lucide-react";

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
    bgClass: "bg-sky-500"
  }
];

export default function ManualPostStep2() {
  const { updateWizardData, wizardData } = useWizard();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    wizardData.platforms || []
  );
  const [allPlatformsSelected, setAllPlatformsSelected] = useState(false);

  // Fetch social media configurations to check connection status
  const { data: socialMediaConfigs, isLoading } = useQuery({
    queryKey: ['/api/social-media-configs'],
    enabled: true
  });

  // Initialize with all platforms selected by default (only on mount)
  useEffect(() => {
    if (!wizardData.platforms || wizardData.platforms.length === 0) {
      const allPlatformIds = platforms.map(p => p.id);
      setSelectedPlatforms(allPlatformIds);
      updateWizardData({ platforms: allPlatformIds });
      setAllPlatformsSelected(true);
    } else {
      setSelectedPlatforms(wizardData.platforms);
      setAllPlatformsSelected(wizardData.platforms.length === platforms.length);
    }
  }, []); // Only run on mount

  // Update wizard data when selectedPlatforms changes
  useEffect(() => {
    updateWizardData({ platforms: selectedPlatforms });
    setAllPlatformsSelected(selectedPlatforms.length === platforms.length);
  }, [selectedPlatforms]);

  const isPlatformConnected = (platformId: string) => {
    if (!socialMediaConfigs || !Array.isArray(socialMediaConfigs)) return false;
    const config = socialMediaConfigs.find((config: any) => config.platformId === platformId);
    return config && config.testStatus === 'connected';
  };

  const handlePlatformToggle = (platformId: string, checked: boolean | string) => {
    const isChecked = typeof checked === 'string' ? checked === 'true' : checked;
    
    let newPlatforms;
    if (isChecked) {
      // Add platform if not already selected
      newPlatforms = selectedPlatforms.includes(platformId) 
        ? selectedPlatforms 
        : [...selectedPlatforms, platformId];
    } else {
      // Remove platform
      newPlatforms = selectedPlatforms.filter(id => id !== platformId);
    }

    setSelectedPlatforms(newPlatforms);
  };

  const handleAllPlatformsToggle = (checked: boolean | string) => {
    const isChecked = typeof checked === 'string' ? checked === 'true' : checked;
    const newPlatforms = isChecked ? platforms.map(p => p.id) : [];
    setSelectedPlatforms(newPlatforms);
  };

  const isSelected = (platformId: string) => {
    return selectedPlatforms.includes(platformId);
  };

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-standard">
          <Zap className="h-5 w-5 text-purple-600" />
          Social Media Platforms
        </CardTitle>
        <p className="text-muted">
          Select the social media platforms where you want to publish your content.
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
            ({selectedPlatforms.length} of {platforms.length} selected)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const selected = isSelected(platform.id);
            const connected = isPlatformConnected(platform.id);
            
            return (
              <div
                key={platform.id}
                className={`relative rounded-lg border-2 transition-all duration-200 ${
                  selected
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={platform.id}
                      checked={selected}
                      onCheckedChange={(checked) => handlePlatformToggle(platform.id, checked)}
                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`${platform.bgClass} p-2 rounded-lg flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-standard">{platform.name}</h3>
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
                        <p className="text-sm text-muted">
                          {platform.id === 'facebook' && 'Share posts, images, and engage with your audience'}
                          {platform.id === 'instagram' && 'Post photos, stories, and reels to your profile'}
                          {platform.id === 'linkedin' && 'Share professional content and network updates'}
                          {platform.id === 'tiktok' && 'Create and share short-form video content'}
                          {platform.id === 'youtube' && 'Upload videos and manage your channel'}
                          {platform.id === 'discord' && 'Share content in servers and communities'}
                          {platform.id === 'telegram' && 'Send messages and media to channels'}
                        </p>
                      </div>
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