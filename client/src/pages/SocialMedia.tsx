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

      // Override with database values only if explicitly disabled
      configs.forEach(config => {
        // Only set to false if explicitly disabled, otherwise keep default true
        if (config.isEnabled === false) {
          platforms[config.platformId] = false;
        }
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

  const handleFacebookOAuth = () => {
    // Check if Facebook is enabled
    if (!selectedPlatforms.facebook) {
      toast({
        title: "Facebook Not Enabled",
        description: "Please enable Facebook first by checking the checkbox.",
        variant: "destructive",
      });
      return;
    }
    // Open Facebook OAuth2 flow in a popup window
    const width = 600;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
      '/auth/facebook/api-key',
      'facebook-oauth',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    if (!popup) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site and try again.",
        variant: "destructive",
      });
      return;
    }
    // Listen for OAuth completion
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        // Check if we received a token from the popup
        checkFacebookOAuthResult();
      }
    }, 1000);
    // Listen for messages from the popup
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'FACEBOOK_OAUTH_SUCCESS') {
        popup?.close();
        clearInterval(checkClosed);
        
        // Set the API key from OAuth
        setCurrentApiKeys(prev => ({
          ...prev,
          facebook: event.data.apiKey
        }));
        
        toast({
          title: "Facebook Connected",
          description: "Facebook API key has been automatically configured!",
        });
        
        window.removeEventListener('message', messageHandler);
      } else if (event.data.type === 'FACEBOOK_OAUTH_ERROR') {
        popup?.close();
        clearInterval(checkClosed);
        
        let errorMessage = event.data.error || "Failed to connect with Facebook";
        
        // Provide more specific error messages
        if (errorMessage.includes('App not active')) {
          errorMessage = "Facebook app is not active. Please configure your Facebook app settings and enable it for public use.";
        } else if (errorMessage.includes('redirect_uri')) {
          errorMessage = "Redirect URL not configured. Please add the redirect URL to your Facebook app settings.";
        }
        
        toast({
          title: "Facebook Connection Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        window.removeEventListener('message', messageHandler);
      }
    };
    window.addEventListener('message', messageHandler);
  };
  const checkFacebookOAuthResult = async () => {
    try {
      const response = await fetch('/api/facebook-oauth-result', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.apiKey) {
          setCurrentApiKeys(prev => ({
            ...prev,
            facebook: data.apiKey
          }));
          
          toast({
            title: "Facebook Connected",
            description: "Facebook API key has been automatically configured!",
          });
        }
      }
    } catch (error) {
      console.error('Error checking Facebook OAuth result:', error);
    }
  };
  const handleLinkedInOAuth = () => {
    // Check if LinkedIn is enabled
    if (!selectedPlatforms.linkedin) {
      toast({
        title: "LinkedIn Not Enabled",
        description: "Please enable LinkedIn first by checking the checkbox.",
        variant: "destructive",
      });
      return;
    }
    // Open LinkedIn OAuth2 flow in a popup window
    const width = 600;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
      '/auth/linkedin/api-key',
      'linkedin-oauth',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    if (!popup) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site and try again.",
        variant: "destructive",
      });
      return;
    }
    // Listen for OAuth completion
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        // Check if we received a token from the popup
        checkLinkedInOAuthResult();
      }
    }, 1000);
    // Listen for messages from the popup
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'LINKEDIN_OAUTH_SUCCESS') {
        popup?.close();
        clearInterval(checkClosed);
        
        // Set the API key from OAuth
        setCurrentApiKeys(prev => ({
          ...prev,
          linkedin: event.data.apiKey
        }));
        
        toast({
          title: "LinkedIn Connected",
          description: "LinkedIn API key has been automatically configured!",
        });
        
        window.removeEventListener('message', messageHandler);
      } else if (event.data.type === 'LINKEDIN_OAUTH_ERROR') {
        popup?.close();
        clearInterval(checkClosed);
        
        let errorMessage = event.data.error || "Failed to connect with LinkedIn";
        
        // Provide more specific error messages
        if (errorMessage.includes('App not approved')) {
          errorMessage = "LinkedIn app is not approved. Please submit your app for review or test with authorized test users.";
        } else if (errorMessage.includes('redirect_uri')) {
          errorMessage = "Redirect URL not configured. Please add the redirect URL to your LinkedIn app settings.";
        }
        
        toast({
          title: "LinkedIn Connection Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        window.removeEventListener('message', messageHandler);
      }
    };
    window.addEventListener('message', messageHandler);
  };
  const checkLinkedInOAuthResult = async () => {
    try {
      const response = await fetch('/api/linkedin-oauth-result', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.apiKey) {
          setCurrentApiKeys(prev => ({
            ...prev,
            linkedin: data.apiKey
          }));
          
          toast({
            title: "LinkedIn Connected",
            description: "LinkedIn API key has been automatically configured!",
          });
        }
      }
    } catch (error) {
      console.error('Error checking LinkedIn OAuth result:', error);
    }
  };
  return (
    <div className="page-content">
      <h1 className="text-3xl font-bold text-standard mb-8">{t('socialMedia.title')}</h1>
      <div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('socialMedia.subtitle')}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">{t('socialMedia.explanation.title')}</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
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
                <div key={platform.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
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
                        <h3 className="font-semibold text-gray-900 dark:text-white">{platform.name}</h3>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedPlatforms[platform.id] ? t('socialMedia.enabled') : t('socialMedia.disabled')}
                          </p>
                          {status === 'connected' && (
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                              • Connected
                            </span>
                          )}
                          {status === 'failed' && (
                            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                              • Failed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Facebook OAuth2 + Manual API Key */}
                    {platform.id === "facebook" ? (
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className="space-y-3 flex-1">
                          {/* OAuth2 Option */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFacebookOAuth()}
                                disabled={!selectedPlatforms[platform.id]}
                                className="flex items-center space-x-2 bg-[#1877F2] hover:bg-[#166FE5] text-white border-[#1877F2] hover:border-[#166FE5]"
                              >
                                <SiFacebook className="w-4 h-4" />
                                <span>Connect with Facebook</span>
                              </Button>
                              <span className="text-sm text-gray-500 dark:text-gray-400">Recommended</span>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                <strong>Setup Required:</strong> Facebook OAuth2 requires app configuration. 
                                Add this redirect URL to your Facebook App settings: <br/>
                                <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs">
                                  {window.location.origin}/auth/facebook/api-key/callback
                                </code>
                              </p>
                            </div>
                          </div>
                          
                          {/* Manual API Key Option */}
                          <div className="relative flex-1">
                            <Input
                              type={visibleKeys[platform.id] ? "text" : "password"}
                              placeholder="Or enter your Facebook API Key manually"
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
                      </div>
                    ) : platform.id === "linkedin" ? (
                      /* LinkedIn OAuth2 + Manual API Key */
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className="space-y-3 flex-1">
                          {/* OAuth2 Option */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLinkedInOAuth()}
                                disabled={!selectedPlatforms[platform.id]}
                                className="flex items-center space-x-2 bg-[#0A66C2] hover:bg-[#084A8A] text-white border-[#0A66C2] hover:border-[#084A8A]"
                              >
                                <SiLinkedin className="w-4 h-4" />
                                <span>Connect with LinkedIn</span>
                              </Button>
                              <span className="text-sm text-gray-500 dark:text-gray-400">Recommended</span>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                <strong>Setup Required:</strong> LinkedIn OAuth2 requires app configuration. 
                                Add this redirect URL to your LinkedIn App settings: <br/>
                                <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs">
                                  {window.location.origin}/auth/linkedin/api-key/callback
                                </code>
                              </p>
                            </div>
                          </div>
                          
                          {/* Manual API Key Option */}
                          <div className="relative flex-1">
                            <Input
                              type={visibleKeys[platform.id] ? "text" : "password"}
                              placeholder="Or enter your LinkedIn API Key manually"
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
                      </div>
                    ) : (
                      /* Other platforms - existing API Key Input */
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
                    )}

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
                          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                            <AlertCircle className="w-4 h-4 animate-spin" />
                            <span className="text-sm">{t('socialMedia.testingConnection')}</span>
                          </div>
                        )}
                        {status === 'connected' && (
                          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('socialMedia.connected')}</span>
                          </div>
                        )}
                        {status === 'failed' && (
                          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('socialMedia.failed')}</span>
                          </div>
                        )}
                        {status === 'idle' && currentApiKeys[platform.id] && (
                          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{t('socialMedia.readyToTest')}</span>
                          </div>
                        )}
                      </div>

                      {/* Error Log */}
                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                          <p className="text-sm text-red-700 dark:text-red-300">
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
            <div className="text-sm text-gray-600 dark:text-gray-300">
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
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Need help configuring social media platforms?</h4>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <div>
                <p><strong>Facebook OAuth2 Setup:</strong></p>
                <p className="ml-4">1. Go to Facebook Developers → Your App → Products → Facebook Login → Settings</p>
                <p className="ml-4">2. Add redirect URL: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{window.location.origin}/auth/facebook/api-key/callback</code></p>
                <p className="ml-4">3. Enable app for public use in App Review</p>
              </div>
              <div>
                <p><strong>LinkedIn OAuth2 Setup:</strong></p>
                <p className="ml-4">1. Go to LinkedIn Developer Program → Your App → Auth</p>
                <p className="ml-4">2. Add redirect URL: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{window.location.origin}/auth/linkedin/api-key/callback</code></p>
                <p className="ml-4">3. Add required scopes: openid, profile, email, w_member_social</p>
              </div>
              <div>
                <p><strong>Manual API Keys:</strong></p>
                <p className="ml-4">• <strong>Facebook:</strong> Visit Facebook Developers → Your App → Settings → Basic</p>
                <p className="ml-4">• <strong>Instagram:</strong> Use Facebook Graph API with Instagram Basic Display</p>
                <p className="ml-4">• <strong>LinkedIn:</strong> LinkedIn Developer Program → Your App → Auth</p>
                <p className="ml-4">• <strong>TikTok:</strong> TikTok for Developers → Your App → Basic Info</p>
                <p className="ml-4">• <strong>YouTube:</strong> Google Cloud Console → APIs & Services → Credentials</p>
                <p className="ml-4">• <strong>Discord:</strong> Discord Developer Portal → Your App → Bot → Token</p>
                <p className="ml-4">• <strong>Telegram:</strong> Contact @BotFather to create a bot and get token</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
