import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useScheduleWizard } from "@/contexts/ScheduleWizardContext";
import { CheckCircle, Clock, Mail, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function ScheduleStep6() {
  const { scheduleData, updateScheduleData } = useScheduleWizard();

  // Fetch user data to get email address
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: true
  });

  const handlePublishModeChange = (value: string) => {
    updateScheduleData({
      reviewOptions: {
        ...scheduleData.reviewOptions,
        publishMode: value as 'review' | 'auto'
      }
    });
  };

  const handleEmailNotificationToggle = (enabled: boolean, mode: 'review' | 'auto') => {
    updateScheduleData({
      reviewOptions: {
        ...scheduleData.reviewOptions,
        [mode === 'review' ? 'reviewEmailEnabled' : 'autoEmailEnabled']: enabled
      }
    });
  };

  const handleEmailChange = (email: string, mode: 'review' | 'auto') => {
    updateScheduleData({
      reviewOptions: {
        ...scheduleData.reviewOptions,
        [mode === 'review' ? 'reviewEmail' : 'autoEmail']: email
      }
    });
  };

  // Auto-populate email from user database and set default publishMode
  useEffect(() => {
    if (user?.email) {
      // Set default publishMode if not set and auto-populate email fields
      updateScheduleData({
        reviewOptions: {
          publishMode: scheduleData.reviewOptions?.publishMode || 'review',
          reviewEmail: scheduleData.reviewOptions?.reviewEmail || user.email,
          autoEmail: scheduleData.reviewOptions?.autoEmail || user.email,
          ...scheduleData.reviewOptions
        }
      });
    }
  }, [user?.email, updateScheduleData]);

  const defaultEmail = user?.email || "";

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-standard">
          <CheckCircle className="h-5 w-5 text-purple-600" />
          Review & Publish Options
        </CardTitle>
        <p className="text-muted">
          The full content of the post will be AI generated. So you can choose the following options:
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={scheduleData.reviewOptions?.publishMode || 'review'}
          onValueChange={handlePublishModeChange}
          className="space-y-6"
        >
          {/* To be reviewed option */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="review" id="review" />
              <Label htmlFor="review" className="flex items-center gap-2 text-standard cursor-pointer">
                <Clock className="h-4 w-4 text-orange-600" />
                To be reviewed
              </Label>
            </div>
            <div className="ml-6 space-y-3 text-sm text-muted">
              <p>Post will be presented on "Pendent Posts" to be approved 3 hours before the published schedule time</p>
              
              {/* Email notification for review mode */}
              <div className="space-y-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="review-email-toggle" className="flex items-center gap-2 text-standard">
                    <Mail className="h-4 w-4 text-orange-600" />
                    Receive email notification
                  </Label>
                  <Switch
                    id="review-email-toggle"
                    checked={scheduleData.reviewOptions?.reviewEmailEnabled || false}
                    onCheckedChange={(checked) => handleEmailNotificationToggle(checked, 'review')}
                  />
                </div>
                {scheduleData.reviewOptions?.reviewEmailEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="review-email" className="text-sm text-muted">Email address</Label>
                    <Input
                      id="review-email"
                      type="email"
                      placeholder={defaultEmail}
                      value={scheduleData.reviewOptions?.reviewEmail || defaultEmail}
                      onChange={(e) => handleEmailChange(e.target.value, 'review')}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Auto Publish option */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="auto" id="auto" />
              <Label htmlFor="auto" className="flex items-center gap-2 text-standard cursor-pointer">
                <AlertCircle className="h-4 w-4 text-red-600" />
                Auto Publish
              </Label>
            </div>
            <div className="ml-6 space-y-3 text-sm text-muted">
              <p>All the post generated will be published according to the schedule</p>
              
              {/* Email notification for auto mode */}
              <div className="space-y-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-email-toggle" className="flex items-center gap-2 text-standard">
                    <Mail className="h-4 w-4 text-red-600" />
                    Receive email notification
                  </Label>
                  <Switch
                    id="auto-email-toggle"
                    checked={scheduleData.reviewOptions?.autoEmailEnabled || false}
                    onCheckedChange={(checked) => handleEmailNotificationToggle(checked, 'auto')}
                  />
                </div>
                {scheduleData.reviewOptions?.autoEmailEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="auto-email" className="text-sm text-muted">Email address</Label>
                    <Input
                      id="auto-email"
                      type="email"
                      placeholder={defaultEmail}
                      value={scheduleData.reviewOptions?.autoEmail || defaultEmail}
                      onChange={(e) => handleEmailChange(e.target.value, 'auto')}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}