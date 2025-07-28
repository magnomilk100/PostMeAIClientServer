import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useScheduleWizard } from "@/contexts/ScheduleWizardContext";
import { SiFacebook, SiInstagram, SiLinkedin, SiTiktok, SiYoutube, SiDiscord, SiTelegram } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle, AlertCircle, Mail, Calendar, RepeatIcon, Settings, Users, Globe, Eye } from "lucide-react";
import { useState } from "react";
import React from "react";

export default function ScheduleStep8() {
  const { scheduleData } = useScheduleWizard();
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  
  // Debug log to see what reviewOptions data we have
  console.log('Step 8 - scheduleData.reviewOptions:', scheduleData.reviewOptions);

  // Fetch social media configurations for connection status
  const { data: socialConfigs = [] } = useQuery({
    queryKey: ['/api/social-media-configs'],
    enabled: true
  });

  const isPlatformConnected = (platformId: string) => {
    const config = socialConfigs.find((config: any) => config.platformId === platformId);
    return config?.testStatus === 'connected';
  };

  const platformConfigs = {
    facebook: {
      name: "Facebook",
      icon: SiFacebook,
      color: "#1877F2",
      bgClass: "bg-blue-600",
      previewImage: "/attached_assets/Instagram_1751927342406.JPG"
    },
    instagram: {
      name: "Instagram",
      icon: SiInstagram,
      color: "#E4405F",
      bgClass: "bg-gradient-to-r from-purple-500 to-pink-500",
      previewImage: "/attached_assets/Instagram_1751927342406.JPG"
    },
    linkedin: {
      name: "LinkedIn",
      icon: SiLinkedin,
      color: "#0A66C2",
      bgClass: "bg-blue-700",
      previewImage: "/attached_assets/Linkedin_1751927342407.JPG"
    },
    tiktok: {
      name: "TikTok",
      icon: SiTiktok,
      color: "#000000",
      bgClass: "bg-black",
      previewImage: "/attached_assets/Instagram_1751927342406.JPG"
    },
    youtube: {
      name: "YouTube",
      icon: SiYoutube,
      color: "#FF0000",
      bgClass: "bg-red-600",
      previewImage: "/attached_assets/Linkedin_1751927342407.JPG"
    },
    discord: {
      name: "Discord",
      icon: SiDiscord,
      color: "#5865F2",
      bgClass: "bg-indigo-600",
      previewImage: "/attached_assets/Instagram_1751927342406.JPG"
    },
    telegram: {
      name: "Telegram",
      icon: SiTelegram,
      color: "#26A5E4",
      bgClass: "bg-blue-500",
      previewImage: "/attached_assets/Linkedin_1751927342407.JPG"
    }
  };

  // Check if immediate posting is enabled
  const isImmediatePost = scheduleData.postImmediately;

  return (
    <div className="space-y-6">
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="text-standard">
            {isImmediatePost ? 'Immediate Post Summary' : 'Schedule Summary'}
          </CardTitle>
          <CardDescription className="text-muted">
            {isImmediatePost 
              ? 'Review your post configuration before immediate publishing'
              : 'Review all your configuration settings before creating the schedule'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Show special message for immediate posting */}
          {isImmediatePost && (
            <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Clock className="h-12 w-12 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                  Immediate Publishing Enabled
                </h2>
                <p className="text-lg text-orange-700 dark:text-orange-300 max-w-2xl mx-auto">
                  This post will be published in the end of these steps when you press confirm on step 9.
                </p>
                <div className="p-4 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    <strong>Note:</strong> No scheduling configuration is required. Your content will be published immediately to all selected platforms once you complete the wizard.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Basic Configuration Section */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border">
            <h2 className="text-lg font-bold text-standard mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Basic Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-standard mb-2">Creation Mode</h3>
                <Badge variant="outline" className="capitalize">
                  {scheduleData.creationMode} Creation
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-standard mb-2">AI Subject</h3>
                <p className="text-sm text-muted">{scheduleData.aiContent?.subject || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Platform Configuration Section */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border">
            <h2 className="text-lg font-bold text-standard mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Platform Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-standard mb-3">Selected Platforms</h3>
                <div className="flex flex-wrap gap-3">
                  {scheduleData.selectedPlatforms?.filter((platformId) => {
                    // Only show platforms that are active (not disabled in step 2)
                    const platformState = scheduleData.platformStates?.[platformId];
                    return platformState !== false; // Show if true or undefined (default active)
                  }).map((platformId) => {
                    const config = platformConfigs[platformId as keyof typeof platformConfigs];
                    if (!config) return null;
                    const Icon = config.icon;
                    const isConnected = isPlatformConnected(platformId);
                    
                    return (
                      <div
                        key={platformId}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                          isConnected 
                            ? 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-800' 
                            : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-60'
                        }`}
                      >
                        <Icon 
                          className="h-5 w-5" 
                          style={{ color: isConnected ? config.color : '#6b7280' }} 
                        />
                        <span className={`text-sm font-medium ${isConnected ? 'text-standard' : 'text-gray-500 dark:text-gray-400'}`}>
                          {config.name}
                        </span>
                        {!isConnected && (
                          <span className="text-xs text-red-500">(Not Connected)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-standard mb-3">Platform Features</h3>
                <div className="space-y-3">
                  {scheduleData.selectedPlatforms?.filter((platform) => {
                    // Only show platforms that are active (not disabled in step 2)
                    const platformState = scheduleData.platformStates?.[platform];
                    return platformState !== false; // Show if true or undefined (default active)
                  }).map((platform) => {
                    const config = scheduleData.platformConfigs?.[platform];
                    if (!config) return null;
                    
                    const enabledFeatures = Object.entries(config).filter(([_, enabled]) => enabled);
                    
                    return (
                      <div key={platform} className="p-3 bg-white dark:bg-gray-800 border rounded-lg">
                        <h4 className="font-medium capitalize text-standard mb-2">{platform}</h4>
                        <div className="flex flex-wrap gap-1">
                          {enabledFeatures.map(([feature]) => (
                            <Badge key={feature} variant="secondary" className="text-xs capitalize text-white bg-purple-600">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Platform Preview Section */}
          <Card className="modern-card border-purple-200 dark:border-purple-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-standard">
                <Eye className="h-5 w-5 text-purple-600" />
                Platform Preview
              </CardTitle>
              <CardDescription className="text-muted">
                Click on any platform button below to preview how your post will look on that social media platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {scheduleData.selectedPlatforms?.filter((platformId) => {
                  // Only show platforms that are active (not disabled in step 2)
                  const platformState = scheduleData.platformStates?.[platformId];
                  return platformState !== false; // Show if true or undefined (default active)
                }).map((platformId) => {
                  const platform = platformConfigs[platformId as keyof typeof platformConfigs];
                  if (!platform) return null;
                  const Icon = platform.icon;
                  
                  return (
                    <Button
                      key={platformId}
                      variant={selectedPreview === platformId ? "default" : "outline"}
                      className={`h-12 flex items-center gap-2 ${
                        selectedPreview === platformId ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => setSelectedPreview(selectedPreview === platformId ? null : platformId)}
                    >
                      <div className={`${platform.bgClass} p-1 rounded flex items-center justify-center`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </Button>
                  );
                })}
              </div>
              
              {/* Preview Image Display */}
              {selectedPreview && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`${platformConfigs[selectedPreview as keyof typeof platformConfigs].bgClass} p-2 rounded-lg flex items-center justify-center`}>
                      {React.createElement(platformConfigs[selectedPreview as keyof typeof platformConfigs].icon, { className: "h-5 w-5 text-white" })}
                    </div>
                    <h3 className="text-lg font-semibold text-standard">
                      {platformConfigs[selectedPreview as keyof typeof platformConfigs].name} Post Preview
                    </h3>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-2 shadow-sm">
                    <img
                      src={platformConfigs[selectedPreview as keyof typeof platformConfigs].previewImage}
                      alt={`${platformConfigs[selectedPreview as keyof typeof platformConfigs].name} post preview`}
                      className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Configuration Section - Hide when immediate posting is enabled */}
          {!isImmediatePost && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border">
            <h2 className="text-lg font-bold text-standard mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Schedule Configuration
            </h2>
            <div className="space-y-4">
              {/* Daily Schedules */}
              {scheduleData.scheduleConfig?.daily && scheduleData.scheduleConfig.daily.length > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Daily Schedules</h4>
                  <div className="space-y-2">
                    {scheduleData.scheduleConfig.daily.map((schedule, index) => (
                      <div key={index} className="text-sm text-blue-700 dark:text-blue-300">
                        Every day at {String(schedule.hour).padStart(2, '0')}:{String(schedule.minute).padStart(2, '0')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weekly Schedules */}
              {scheduleData.scheduleConfig?.weekly && scheduleData.scheduleConfig.weekly.length > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Weekly Schedules</h4>
                  <div className="space-y-2">
                    {scheduleData.scheduleConfig.weekly.map((schedule, index) => (
                      <div key={index} className="text-sm text-green-700 dark:text-green-300">
                        Every {schedule.dayOfWeek} at {String(schedule.hour).padStart(2, '0')}:{String(schedule.minute).padStart(2, '0')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly Schedules */}
              {scheduleData.scheduleConfig?.monthly && scheduleData.scheduleConfig.monthly.length > 0 && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Monthly Schedules</h4>
                  <div className="space-y-2">
                    {scheduleData.scheduleConfig.monthly.map((schedule, index) => (
                      <div key={index} className="text-sm text-purple-700 dark:text-purple-300">
                        Day {schedule.dayOfMonth} of every month at {String(schedule.hour).padStart(2, '0')}:{String(schedule.minute).padStart(2, '0')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar Schedules */}
              {scheduleData.scheduleConfig?.calendar && scheduleData.scheduleConfig.calendar.length > 0 && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border">
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Specific Date Schedules</h4>
                  <div className="space-y-2">
                    {scheduleData.scheduleConfig.calendar.map((schedule, index) => (
                      <div key={index} className="text-sm text-orange-700 dark:text-orange-300">
                        {schedule.date} at {String(schedule.hour).padStart(2, '0')}:{String(schedule.minute).padStart(2, '0')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule Summary */}
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {(scheduleData.scheduleConfig?.daily?.length || 0) + 
                     (scheduleData.scheduleConfig?.weekly?.length || 0) + 
                     (scheduleData.scheduleConfig?.monthly?.length || 0) + 
                     (scheduleData.scheduleConfig?.calendar?.length || 0)}
                  </div>
                  <div className="text-sm text-muted">Total Active Schedules</div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Review & Publish Options Section */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border">
            <h2 className="text-lg font-bold text-standard mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-amber-600" />
              Review & Publish Options
            </h2>
            <div className="space-y-4">
              {/* Check if reviewOptions exists, if not show default */}
              {scheduleData.reviewOptions ? (
                <div className="p-4 bg-white dark:bg-gray-800 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    {(scheduleData.reviewOptions.publishMode || 'review') === 'review' ? (
                      <Clock className="h-5 w-5 text-orange-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-semibold text-standard text-lg">
                      {(scheduleData.reviewOptions.publishMode || 'review') === 'review' ? 'To be reviewed' : 'Auto Publish'}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-4">
                    {(scheduleData.reviewOptions.publishMode || 'review') === 'review' 
                      ? 'Post will be presented on "Pendent Posts" to be approved 3 hours before the published schedule time'
                      : 'All the post generated will be published according to the schedule'
                    }
                  </p>

                  {/* Review Mode Email Notifications */}
                  {(scheduleData.reviewOptions.publishMode || 'review') === 'review' && (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-semibold text-standard">Email Notifications</span>
                      </div>
                      {scheduleData.reviewOptions.reviewEmailEnabled ? (
                        <div>
                          <p className="text-sm text-orange-800 dark:text-orange-200 mb-1">
                            ✓ Email notifications enabled for new posts awaiting review
                          </p>
                          <p className="text-sm text-muted">
                            Notifications will be sent to: <span className="font-medium text-orange-700 dark:text-orange-300">{scheduleData.reviewOptions.reviewEmail}</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ✗ Email notifications disabled - you'll need to manually check for pending posts
                        </p>
                      )}
                    </div>
                  )}

                  {/* Auto Mode Email Notifications */}
                  {(scheduleData.reviewOptions.publishMode || 'review') === 'auto' && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-semibold text-standard">Email Notifications</span>
                      </div>
                      {scheduleData.reviewOptions.autoEmailEnabled ? (
                        <div>
                          <p className="text-sm text-red-800 dark:text-red-200 mb-1">
                            ✓ Email notifications enabled for successful auto-published posts
                          </p>
                          <p className="text-sm text-muted">
                            Notifications will be sent to: <span className="font-medium text-red-700 dark:text-red-300">{scheduleData.reviewOptions.autoEmail}</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ✗ Email notifications disabled - posts will publish silently according to schedule
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No review options configured. Please go back to Step 6 to configure your publish mode and notification preferences.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Links Configuration Section */}
          {(scheduleData.links?.website || scheduleData.links?.link1 || scheduleData.links?.link2) && (
            <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border">
              <h2 className="text-lg font-bold text-standard mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-cyan-600" />
                Links Configuration
              </h2>
              <div className="space-y-2">
                {scheduleData.links.website && (
                  <div className="text-sm">
                    <span className="font-medium">Website:</span> 
                    <a href={scheduleData.links.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-800 underline">
                      {scheduleData.links.website}
                    </a>
                  </div>
                )}
                {scheduleData.links.link1 && (
                  <div className="text-sm">
                    <span className="font-medium">Additional Link 1:</span> 
                    <a href={scheduleData.links.link1} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-800 underline">
                      {scheduleData.links.link1}
                    </a>
                  </div>
                )}
                {scheduleData.links.link2 && (
                  <div className="text-sm">
                    <span className="font-medium">Additional Link 2:</span> 
                    <a href={scheduleData.links.link2} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-800 underline">
                      {scheduleData.links.link2}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Ready to create your schedule!</strong> All configuration looks good. 
              Click Next to save your post schedule and start automated publishing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}