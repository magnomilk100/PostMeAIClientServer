import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Calendar, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useScheduleWizard } from "@/contexts/ScheduleWizardContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export default function ScheduleStep7() {
  const [, setLocation] = useLocation();
  const { scheduleData, setLoading, resetWizard } = useScheduleWizard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);
  
  // Generate default schedule name
  const generateDefaultName = () => {
    const now = new Date();
    const dateTime = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
    return `${dateTime}-schedule`;
  };
  
  const [scheduleName, setScheduleName] = useState(generateDefaultName());
  const [scheduleDescription, setScheduleDescription] = useState("");

  // Mutation to save schedule to database
  const saveScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const response = await apiRequest("POST", "/api/post-schedules", scheduleData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/post-schedules'] });
      setIsSaved(true);
      setLoading(false);
      toast({
        title: "Schedule Created",
        description: "Your automated posting schedule has been saved successfully!",
        variant: "success"
      });
    },
    onError: (error: any) => {
      setLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to save schedule",
        variant: "destructive"
      });
    }
  });

  // Transform wizard data into database format
  const transformScheduleData = () => {
    // Get selected platforms from platformStates (actual user selection)
    const actualSelectedPlatforms = Object.entries(scheduleData.platformStates || {})
      .filter(([_, isActive]) => isActive === true)
      .map(([platform, _]) => platform);

    // Database expects JSON format for these fields
    return {
      name: scheduleName,
      description: scheduleDescription.trim() || null,
      creationMode: scheduleData.creationMode,
      platforms: actualSelectedPlatforms, // Use the correct platform selection and correct field name
      platformConfigs: scheduleData.platformConfigs, // Will be stored as JSONB
      scheduleConfig: scheduleData.scheduleConfig, // Will be stored as JSONB
      links: scheduleData.links, // Will be stored as JSONB
      isActive: true,
    };
  };

  // Manual save function
  const handleSaveSchedule = () => {
    if (!scheduleName.trim()) {
      toast({
        title: "Schedule Name Required",
        description: "Please enter a name for your schedule before saving.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    const scheduleDataToSend = transformScheduleData();
    console.log("Sending schedule data to API:", scheduleDataToSend);
    console.log("Raw wizard data (for debugging):", scheduleData);
    saveScheduleMutation.mutate(scheduleDataToSend);
  };

  const handleCreateAnother = () => {
    resetWizard();
    setLocation("/post-schedule-wizard");
  };

  return (
    <div className="space-y-6">
      {!isSaved && !saveScheduleMutation.isPending && (
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="text-standard text-2xl">Final Step: Schedule Name</CardTitle>
            <CardDescription className="text-muted">
              Give your schedule a unique name for easy identification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleName" className="text-standard">Schedule Name</Label>
              <Input
                id="scheduleName"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                placeholder="Enter schedule name"
                className="w-full"
              />
              <p className="text-xs text-muted">
                Default format: YYYYMMDD_HHMMSS-schedule (e.g., {generateDefaultName()})
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scheduleDescription" className="text-standard">Description (Optional)</Label>
              <Textarea
                id="scheduleDescription"
                value={scheduleDescription}
                onChange={(e) => setScheduleDescription(e.target.value)}
                placeholder="Describe what this scheduler is about..."
                className="w-full resize-none"
                rows={3}
              />
              <p className="text-xs text-muted">
                Add a description to help you remember the purpose of this schedule
              </p>
            </div>
            
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleSaveSchedule}
                disabled={!scheduleName.trim() || saveScheduleMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8"
              >
                {saveScheduleMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving Schedule...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Schedule
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(isSaved || saveScheduleMutation.isPending) && (
        <Card className="modern-card text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              {saveScheduleMutation.isPending ? (
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )}
            </div>
            <CardTitle className="text-standard text-2xl">
              {saveScheduleMutation.isPending ? "Saving Schedule..." : "Schedule Created Successfully!"}
            </CardTitle>
            <CardDescription className="text-muted">
              {saveScheduleMutation.isPending 
                ? "Please wait while we save your automated posting schedule"
                : "Your automated posting schedule has been set up and is now active"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!saveScheduleMutation.isPending && (
              <>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    Your AI-powered content will now be generated and published automatically according to your schedule.
                    You can monitor and manage all your schedules from the Post Schedule page.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => setLocation("/post-schedule")}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View All Schedules
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCreateAnother}
                  >
                    Create Another Schedule
                  </Button>
                </div>
              </>
            )}
            
            {saveScheduleMutation.isPending && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-purple-800 dark:text-purple-200 text-sm">
                  Saving your schedule configuration to the database...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}