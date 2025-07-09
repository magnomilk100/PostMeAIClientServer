import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Link as LinkIcon } from "lucide-react";
import { useScheduleWizard } from "@/contexts/ScheduleWizardContext";

export default function ScheduleStep5() {
  const { scheduleData, updateScheduleData } = useScheduleWizard();

  const handleLinkChange = (field: string, value: string) => {
    updateScheduleData({
      links: {
        ...scheduleData.links,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="text-standard">Links</CardTitle>
          <CardDescription className="text-muted">
            Add links that will be published along with the post content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="website" className="text-standard">Website Link (Optional)</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                className="pl-10"
                value={scheduleData.links?.website || ''}
                onChange={(e) => handleLinkChange('website', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link1" className="text-standard">Link 1 (Optional)</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="link1"
                type="url"
                placeholder="https://example.com"
                className="pl-10"
                value={scheduleData.links?.link1 || ''}
                onChange={(e) => handleLinkChange('link1', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link2" className="text-standard">Link 2 (Optional)</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="link2"
                type="url"
                placeholder="https://example.com"
                className="pl-10"
                value={scheduleData.links?.link2 || ''}
                onChange={(e) => handleLinkChange('link2', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Links will be automatically included in the post content when published to each platform.
              The formatting may vary depending on each platform's link display preferences.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}