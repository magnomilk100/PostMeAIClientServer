import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWizard } from "@/contexts/WizardContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  FileText,
  Users,
  Save,
  AlertTriangle
} from "lucide-react";

export default function ManualPostStep7() {
  const { wizardData, updateWizardData } = useWizard();
  const { toast } = useToast();
  const [scheduleName, setScheduleName] = useState(wizardData.scheduleName || "");
  const [scheduleDescription, setScheduleDescription] = useState(wizardData.scheduleDescription || "");
  const [isSaving, setIsSaving] = useState(false);

  // Update wizard data when schedule name or description changes
  useEffect(() => {
    updateWizardData({ scheduleName, scheduleDescription });
  }, [scheduleName, scheduleDescription]);

  const handleSaveSchedule = async () => {
    if (!scheduleName.trim()) {
      toast({
        title: "Schedule Name Required",
        description: "Please provide a name for your post schedule.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const scheduleData = {
        name: scheduleName,
        description: scheduleDescription.trim() || null,
        subject: wizardData.step1Data?.title || "Manual Post Schedule",
        postContent: wizardData.step1Data || {},
        platforms: Object.keys(wizardData.step3PlatformContent || {}).filter(platformId => {
          const platformContent = wizardData.step3PlatformContent?.[platformId];
          return platformContent?.active === true;
        }),
        scheduleConfig: wizardData.scheduleConfig || {},
        links: wizardData.links || {},
        selectedImages: wizardData.selectedImages || [],
        executionMode: "auto",
        status: "active"
      };

      const response = await apiRequest('POST', '/api/post-schedules', scheduleData);

      // Invalidate cache to refresh Post Scheduler page
      queryClient.invalidateQueries({ queryKey: ['/api/post-schedules'] });

      toast({
        title: "Schedule Created Successfully!",
        description: `Your post schedule "${scheduleName}" has been saved and activated.`,
      });

      // Reset wizard data
      updateWizardData({});

    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save the schedule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate totals for display
  const selectedPlatforms = Object.keys(wizardData.step3PlatformContent || {}).filter(platformId => {
    const platformContent = wizardData.step3PlatformContent?.[platformId];
    return platformContent?.active === true;
  });
  const selectedImages = wizardData.selectedImages || [];
  const links = wizardData.links || {};
  const postData = wizardData.step1Data || {};
  
  // Count schedules
  const scheduleConfig = wizardData.scheduleConfig || {};
  const totalSchedules = 
    (scheduleConfig.daily?.length || 0) +
    (scheduleConfig.weekly?.length || 0) +
    (scheduleConfig.monthly?.length || 0) +
    (scheduleConfig.calendar?.length || 0);

  const linkCount = Object.values(links).filter(link => link).length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Final Step: Schedule Name</h2>
        <p className="text-muted">Give your post schedule a memorable name and save it</p>
      </div>

      <div className="grid gap-6">
        {/* Schedule Name Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Schedule Configuration
            </CardTitle>
            <CardDescription>
              Provide a name for this automated post schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-name">Schedule Name *</Label>
              <Input
                id="schedule-name"
                type="text"
                placeholder="e.g., Daily Product Updates, Weekly Blog Posts"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                className="text-base"
              />
              <p className="text-sm text-muted-foreground">
                Choose a descriptive name to easily identify this schedule later
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schedule-description">Description (Optional)</Label>
              <Textarea
                id="schedule-description"
                placeholder="Describe what this scheduler is about..."
                value={scheduleDescription}
                onChange={(e) => setScheduleDescription(e.target.value)}
                className="text-base resize-none"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Add a description to help you remember the purpose of this schedule
              </p>
            </div>

            <Button 
              onClick={handleSaveSchedule}
              disabled={!scheduleName.trim() || isSaving}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving Schedule...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Automated Schedule
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Configuration Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Schedule Overview
            </CardTitle>
            <CardDescription>
              Summary of your automated post schedule configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {selectedPlatforms.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Platform{selectedPlatforms.length !== 1 ? 's' : ''}</div>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <FileText className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {selectedImages.length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Image{selectedImages.length !== 1 ? 's' : ''}</div>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {totalSchedules}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Schedule{totalSchedules !== 1 ? 's' : ''}</div>
              </div>

              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {linkCount}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">Link{linkCount !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post Content Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Post Content Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Title:</h4>
              <p className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                {postData.title || "No title provided"}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Content Preview:</h4>
              <p className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-lg line-clamp-3">
                {postData.content || "No content provided"}
              </p>
            </div>

            {postData.hashtags && postData.hashtags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Hashtags:</h4>
                <div className="flex flex-wrap gap-2">
                  {postData.hashtags.slice(0, 5).map((hashtag, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-300">
                      #{hashtag}
                    </Badge>
                  ))}
                  {postData.hashtags.length > 5 && (
                    <Badge variant="outline">+{postData.hashtags.length - 5} more</Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Success Instructions */}
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                  What happens next?
                </h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• Your schedule will be saved and activated automatically</li>
                  <li>• Posts will be published according to your schedule configuration</li>
                  <li>• You can view and manage schedules in the Post Scheduler page</li>
                  <li>• Execution history will be tracked for monitoring</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Warning */}
        {(!scheduleName.trim() || selectedPlatforms.length === 0 || totalSchedules === 0) && (
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                    Configuration Required
                  </h4>
                  <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                    {!scheduleName.trim() && <li>• Schedule name is required</li>}
                    {selectedPlatforms.length === 0 && <li>• At least one platform must be selected</li>}
                    {totalSchedules === 0 && <li>• At least one schedule must be configured</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}