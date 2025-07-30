import { Building, Users, Globe, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OnboardingStep7Props {
  data: any;
  updateData: (data: any) => void;
}

export default function OnboardingStep7({ data, updateData }: OnboardingStep7Props) {
  const handleOrganizationNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ organizationName: e.target.value });
  };

  const handleWorkspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ workspaceName: e.target.value });
  };

  const generateOrganizationName = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-T:]/g, '').replace(/\..+/, '').slice(0, 14); // ddmmyyyyhhmmss
    return `MyOrg_${timestamp}`;
  };

  const generateWorkspaceName = () => {
    if (data.profileType === 'individual') {
      if (data.fullName.trim()) {
        return `${data.fullName.trim()}`;
      }
      return "My Workspace";
    } else {
      if (data.companyName.trim()) {
        return `${data.companyName.trim()} Workspace`;
      }
      return "Company Workspace";
    }
  };

  const suggestedOrgName = generateOrganizationName();
  const suggestedWorkspaceName = generateWorkspaceName();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <Building className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Create Your Organization & Workspace</h2>
        <p className="text-muted-foreground">
          Set up your organization and workspace to manage your social media content and collaborate with your team
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Workspace Setup
          </CardTitle>
          <CardDescription>
            Choose a name for your workspace that reflects your brand or organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="organizationName">Organization Name</Label>
            <Input
              id="organizationName"
              value={data.organizationName}
              onChange={handleOrganizationNameChange}
              placeholder="Enter organization name"
              className="text-lg"
            />
            {data.organizationName.trim() === '' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Suggestion:</span>
                <button
                  type="button"
                  onClick={() => updateData({ organizationName: suggestedOrgName })}
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  {suggestedOrgName}
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workspaceName">Workspace Name</Label>
            <Input
              id="workspaceName"
              value={data.workspaceName}
              onChange={handleWorkspaceNameChange}
              placeholder="Enter workspace name"
              className="text-lg"
            />
            {data.workspaceName.trim() === '' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Suggestion:</span>
                <button
                  type="button"
                  onClick={() => updateData({ workspaceName: suggestedWorkspaceName })}
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  {suggestedWorkspaceName}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">What you'll get:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm">Team collaboration</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Multi-platform publishing</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <ArrowRight className="w-5 h-5 text-green-600" />
                <span className="text-sm">Workflow automation</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Badge className="bg-amber-500">Admin</Badge>
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  You'll be the workspace administrator
                </p>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  As the first user, you'll have full administrative privileges to manage team members, 
                  settings, and workspace configurations.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}