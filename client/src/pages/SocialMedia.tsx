import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { 
  SiFacebook, 
  SiInstagram, 
  SiLinkedin, 
  SiTiktok, 
  SiYoutube, 
  SiDiscord, 
  SiTelegram 
} from "react-icons/si";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

// Database interface for social media configurations
interface SocialMediaConfig {
  id: number;
  userId: string;
  platformId: string;
  isEnabled: boolean;
  apiKey: string | null;
  testStatus: string;
  testError: string | null;
  lastTestedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Icon mapping for social platforms
const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: SiFacebook,
  instagram: SiInstagram,
  linkedin: SiLinkedin,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  discord: SiDiscord,
  telegram: SiTelegram,
};

export default function SocialMedia() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  // Local state for UI interactions
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [currentApiKeys, setCurrentApiKeys] = useState<Record<string, string>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, boolean>>({});
  
  // Fetch social media configurations from database
  const { data: configs = [], isLoading: configsLoading } = useQuery<SocialMediaConfig[]>({
    queryKey: ['/api/social-media-configs'],
    enabled: isAuthenticated,
  });

  // Populate local state from database configs
  useEffect(() => {
    if (configs.length > 0) {
      const platforms: Record<string, boolean> = {};
      
      // Set all platforms to enabled by default
      SOCIAL_PLATFORMS.forEach(platform => {
        platforms[platform.id] = true;
      });

      // Override with database values
      configs.forEach(config => {
        platforms[config.platformId] = config.isEnabled;
      });

      setSelectedPlatforms(platforms);

      // Update API keys from database, but preserve any currently focused input
      setCurrentApiKeys(prevKeys => {
        const updatedKeys = { ...prevKeys };
        configs.forEach(config => {
          // Only update if we don't already have this key in state, 
          // or if it's empty (preserves user input during editing)
          if (!prevKeys[config.platformId] || prevKeys[config.platformId] === '') {
            updatedKeys[config.platformId] = config.apiKey || '';
          }
        });
        return updatedKeys;
      });
    } else {
      // If no configs in database, default all platforms to enabled
      setSelectedPlatforms(
        SOCIAL_PLATFORMS.reduce((acc, platform) => ({ ...acc, [platform.id]: true }), {})
      );
    }
  }, [configs]);

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async ({ platformId, isEnabled, apiKey }: { platformId: string; isEnabled: boolean; apiKey: string }) => {
      const response = await apiRequest("POST", "/api/social-media-configs", {
        platformId,
        isEnabled,
        apiKey: apiKey.trim() || null,
      });
      return response.json();
    },
    onSuccess: () => {
      // Don't invalidate queries during bulk save to prevent UI flicker
      // We'll manually refetch after all saves are complete
    },
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async ({ platformId, apiKey }: { platformId: string; apiKey: string }) => {
      const response = await apiRequest("POST", `/api/social-media-configs/${platformId}/test`, {
        apiKey: apiKey.trim(),
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-media-configs'] });
      if (data.success) {
        toast({
          title: t('socialMedia.connectionSuccess'),
          description: data.message || `Successfully connected to ${variables.platformId}`,
        });
      } else {
        toast({
          title: t('socialMedia.connectionFailed'),
          description: data.error || "Failed to connect to the platform",
          variant: "destructive",
        });
      }
    },
    onError: (error: any, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-media-configs'] });
      toast({
        title: t('socialMedia.connectionFailed'),
        description: `Failed to test ${variables.platformId} connection`,
        variant: "destructive",
      });
    },
  });

  const handleApiKeyChange = (platformId: string, value: string) => {
    setCurrentApiKeys(prev => ({ ...prev, [platformId]: value }));
  };

  // Helper function to get config for a platform
  const getPlatformConfig = (platformId: string): SocialMediaConfig | undefined => {
    return configs.find(config => config.platformId === platformId);
  };

  // Helper function to get test status from database
  const getTestStatus = (platformId: string): string => {
    const config = getPlatformConfig(platformId);
    
    // If currently testing this platform
    if (testConnectionMutation.isPending && testConnectionMutation.variables?.platformId === platformId) {
      return 'testing';
    }
    
    return config?.testStatus || 'idle';
  };

  // Helper function to get test error from database
  const getTestError = (platformId: string): string | null => {
    const config = getPlatformConfig(platformId);
    return config?.testError || null;
  };

  const toggleVisibility = (platformId: string) => {
    setVisibleKeys(prev => ({ ...prev, [platformId]: !prev[platformId] }));
  };

  const handlePlatformToggle = (platformId: string, checked: boolean) => {
    setSelectedPlatforms(prev => ({ ...prev, [platformId]: checked }));
  };

  const handleTestConnection = async (platformId: string, platformName: string) => {
    const apiKey = currentApiKeys[platformId];
    
    // Check if API key is empty
    if (!apiKey || apiKey.trim() === '') {
      toast({
        title: t('socialMedia.apiKeyRequired'),
        description: t('socialMedia.enterApiKey', { platform: platformName }),
        variant: "destructive",
      });
      return;
    }

    testConnectionMutation.mutate({ platformId, apiKey });
  };

  const handleSaveConfiguration = async () => {
    try {
      // Save all platforms configurations sequentially
      for (const platform of SOCIAL_PLATFORMS) {
        await saveConfigMutation.mutateAsync({
          platformId: platform.id,
          isEnabled: selectedPlatforms[platform.id] || false,
          apiKey: currentApiKeys[platform.id] || '',
        });
      }

      // Manually refetch data after all saves are complete
      await queryClient.invalidateQueries({ queryKey: ['/api/social-media-configs'] });

      toast({
        title: t('socialMedia.configurationSaved'),
        description: "All social media configurations have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: t('socialMedia.connectionFailed'),
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    const selectedCount = Object.values(selectedPlatforms).filter(Boolean).length;
    if (selectedCount === 0) {
      toast({
        title: "No Platforms Selected",
        description: "Please select at least one social media platform.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically save to backend or local storage
    toast({
      title: "Success",
      description: `Configuration saved! ${selectedCount} platform(s) selected.`,
    });
  };

  return (
    <div className="px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('socialMedia.title')}</h1>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              {t('socialMedia.subtitle')}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">{t('socialMedia.explanation.title')}</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <li key={index}>• {t(`socialMedia.explanation.items.${index}`)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Show selected platforms first, then unselected ones */}
            {[...SOCIAL_PLATFORMS]
              .sort((a, b) => {
                const aSelected = selectedPlatforms[a.id] || false;
                const bSelected = selectedPlatforms[b.id] || false;
                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;
                return 0;
              })
              .map((platform) => {
              const IconComponent = PLATFORM_ICONS[platform.id];
              const status = getTestStatus(platform.id);
              const error = getTestError(platform.id);
              
              return (
                <div key={platform.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center space-x-4">
                    {/* Checkbox */}
                    <Checkbox
                      id={`platform-${platform.id}`}
                      checked={selectedPlatforms[platform.id] || false}
                      onCheckedChange={(checked) => handlePlatformToggle(platform.id, checked as boolean)}
                    />

                    {/* Platform Icon & Name */}
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${platform.bgColor}`}>
                        {IconComponent && <IconComponent className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                        <p className="text-sm text-gray-500">
                          {selectedPlatforms[platform.id] ? t('socialMedia.enabled') : t('socialMedia.disabled')}
                        </p>
                      </div>
                    </div>

                    {/* API Key Input */}
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="relative flex-1">
                        <Input
                          type={visibleKeys[platform.id] ? "text" : "password"}
                          placeholder={t('socialMedia.enterApiKey', { platform: platform.name })}
                          value={currentApiKeys[platform.id] || ""}
                          onChange={(e) => handleApiKeyChange(platform.id, e.target.value)}
                          className="pr-10"
                          disabled={!selectedPlatforms[platform.id]}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => toggleVisibility(platform.id)}
                          disabled={!selectedPlatforms[platform.id]}
                        >
                          {visibleKeys[platform.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Test Button */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(platform.id, platform.name)}
                        disabled={!selectedPlatforms[platform.id] || status === 'testing'}
                        className="min-w-[80px]"
                      >
                        {status === 'testing' ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            {t('socialMedia.testing')}
                          </>
                        ) : (
                          t('socialMedia.testConnection')
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Status and Error Display */}
                  {selectedPlatforms[platform.id] && (
                    <div className="ml-14 space-y-2">
                      {/* Connection Status */}
                      <div className="flex items-center space-x-2">
                        {status === 'testing' && (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <AlertCircle className="w-4 h-4 animate-spin" />
                            <span className="text-sm">{t('socialMedia.testingConnection')}</span>
                          </div>
                        )}
                        {status === 'connected' && (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('socialMedia.connected')}</span>
                          </div>
                        )}
                        {status === 'failed' && (
                          <div className="flex items-center space-x-2 text-red-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('socialMedia.failed')}</span>
                          </div>
                        )}
                        {status === 'idle' && currentApiKeys[platform.id] && (
                          <div className="flex items-center space-x-2 text-gray-500">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{t('socialMedia.readyToTest')}</span>
                          </div>
                        )}
                      </div>

                      {/* Error Log */}
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-700">
                            <strong>Error:</strong> {error}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {t('socialMedia.platformsCount', { count: Object.values(selectedPlatforms).filter(Boolean).length })}
            </div>
            <Button 
              onClick={handleSaveConfiguration}
              disabled={saveConfigMutation.isPending}
              className="gradient-primary"
            >
              {saveConfigMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('socialMedia.saving')}
                </>
              ) : (
                t('socialMedia.saveConfiguration')
              )}
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Need help finding your API keys?</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Facebook:</strong> Visit Facebook Developers → Your App → Settings → Basic</p>
              <p>• <strong>Instagram:</strong> Use Facebook Graph API with Instagram Basic Display</p>
              <p>• <strong>LinkedIn:</strong> LinkedIn Developer Program → Your App → Auth</p>
              <p>• <strong>TikTok:</strong> TikTok for Developers → Your App → Basic Info</p>
              <p>• <strong>YouTube:</strong> Google Cloud Console → APIs & Services → Credentials</p>
              <p>• <strong>Discord:</strong> Discord Developer Portal → Your App → Bot → Token</p>
              <p>• <strong>Telegram:</strong> Contact @BotFather to create a bot and get token</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
