import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWizard } from "@/contexts/WizardContext";
import { Globe, Link, ExternalLink, Info } from "lucide-react";

export default function ManualPostStep4() {
  const { updateWizardData, wizardData } = useWizard();
  
  const [websiteLink, setWebsiteLink] = useState(wizardData.links?.websiteLink || "");
  const [additionalLink1, setAdditionalLink1] = useState(wizardData.links?.additionalLink1 || "");
  const [additionalLink2, setAdditionalLink2] = useState(wizardData.links?.additionalLink2 || "");

  // Update wizard data when links change - Fixed infinite re-render by removing updateWizardData from dependencies
  useEffect(() => {
    updateWizardData({
      links: {
        websiteLink,
        additionalLink1,
        additionalLink2
      }
    });
  }, [websiteLink, additionalLink1, additionalLink2]); // Removed updateWizardData from dependencies

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Links Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Link Configuration
            </CardTitle>
            <CardDescription>
              Add up to 3 links that will be included with your posts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Website Link */}
            <div className="space-y-2">
              <Label htmlFor="website-link" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website Link (Primary)
              </Label>
              <Input
                id="website-link"
                type="url"
                placeholder="https://yourwebsite.com"
                value={websiteLink}
                onChange={(e) => setWebsiteLink(e.target.value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Your main website or landing page URL
              </p>
            </div>

            {/* Additional Link 1 */}
            <div className="space-y-2">
              <Label htmlFor="additional-link-1" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Additional Link 1
              </Label>
              <Input
                id="additional-link-1"
                type="url"
                placeholder="https://example.com"
                value={additionalLink1}
                onChange={(e) => setAdditionalLink1(e.target.value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Secondary link (blog, portfolio, etc.)
              </p>
            </div>

            {/* Additional Link 2 */}
            <div className="space-y-2">
              <Label htmlFor="additional-link-2" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Additional Link 2
              </Label>
              <Input
                id="additional-link-2"
                type="url"
                placeholder="https://example.com"
                value={additionalLink2}
                onChange={(e) => setAdditionalLink2(e.target.value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Third link (contact, social media, etc.)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Info className="h-5 w-5" />
              Link Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-blue-600 dark:text-blue-400">
              <p>• Use your primary website link to drive traffic to your main site</p>
              <p>• Additional links can point to specific content, products, or campaigns</p>
              <p>• Links will be included in your posts across all selected platforms</p>
              <p>• Make sure your links are accessible and mobile-friendly</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}