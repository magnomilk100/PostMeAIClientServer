import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building2, 
  Globe, 
  Target, 
  MapPin, 
  Users,
  Edit,
  CheckCircle,
  Building
} from 'lucide-react';
import { SiFacebook, SiInstagram, SiLinkedin, SiX, SiTiktok, SiYoutube } from 'react-icons/si';

interface OnboardingStep8Props {
  data: any;
  updateData: (data: any) => void;
  setCurrentStep: (step: number) => void;
}

const platformIcons = {
  facebook: SiFacebook,
  instagram: SiInstagram,
  linkedin: SiLinkedin,
  twitter: SiX,
  tiktok: SiTiktok,
  youtube: SiYoutube
};

const platformColors = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  tiktok: '#000000',
  youtube: '#FF0000'
};

const goalLabels = {
  publish: 'Publish posts on multiple channels',
  schedule: 'Schedule content in advance',
  engage: 'Engage with comments & messages',
  analyze: 'Analyze performance metrics',
  collaborate: 'Collaborate with my team',
  'ai-content': 'Generate AI-powered content',
  automation: 'Automate content workflows',
  consistency: 'Maintain consistent posting'
};

export default function OnboardingStep8({ data, updateData, setCurrentStep }: OnboardingStep8Props) {
  const handleEdit = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Review Your Setup</h2>
        <p className="text-muted-foreground">
          Take a moment to review your information before we complete your setup
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(3)}
              className="text-purple-600 hover:text-purple-700"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{data.profileType}</Badge>
              <span className="font-medium">{data.fullName}</span>
            </div>
            
            {data.profileType === 'company' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span>{data.companyName}</span>
                {data.industry && <span>• {data.industry}</span>}
              </div>
            )}
            
            {data.website && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>{data.website}</span>
              </div>
            )}
          </div>
        </div>

        {/* Workspace Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building className="w-5 h-5" />
              Organization & Workspace
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(7)}
              className="text-purple-600 hover:text-purple-700"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Organization: {data.organizationName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Workspace: {data.workspaceName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>You'll be the administrator</span>
            </div>
          </div>
        </div>

        {/* Interested Platforms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Interested Platforms
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(4)}
              className="text-purple-600 hover:text-purple-700"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {data.interestedPlatforms.map((platform: string) => {
                const IconComponent = platformIcons[platform as keyof typeof platformIcons];
                const color = platformColors[platform as keyof typeof platformColors];
                return (
                  <div
                    key={platform}
                    className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                    style={{ backgroundColor: `${color}20`, color: color }}
                  >
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                    <span className="capitalize">{platform}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Primary Goals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Primary Goals
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(5)}
              className="text-purple-600 hover:text-purple-700"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="space-y-2">
              {data.primaryGoals.map((goal: string) => (
                <div key={goal} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{goalLabels[goal as keyof typeof goalLabels] || goal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Preferences
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(6)}
              className="text-purple-600 hover:text-purple-700"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Timezone:</span>
                <span className="ml-2 text-sm text-muted-foreground">{data.timezone}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Language:</span>
                <span className="ml-2 text-sm text-muted-foreground">{data.language}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-6">
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
          <h4 className="font-medium mb-2">Ready to get started?</h4>
          <p className="text-sm text-muted-foreground">
            Your workspace will be created and you'll be set up as the administrator. 
            You can always change these settings later from your account preferences.
          </p>
        </div>
      </div>
    </div>
  );
}