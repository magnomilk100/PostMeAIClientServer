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
  CheckCircle
} from 'lucide-react';
import { SiFacebook, SiInstagram, SiLinkedin, SiX, SiTiktok, SiYoutube } from 'react-icons/si';

interface OnboardingStep7Props {
  data: any;
  updateData: (data: any) => void;
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

const languageNames = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  ja: '日本語',
  ko: '한국어',
  zh: '中文'
};

export default function OnboardingStep7({ data }: OnboardingStep7Props) {
  const isIndividual = data.profileType === 'individual';
  
  const formatTimezone = (timezone: string) => {
    const parts = timezone.split('/');
    if (parts.length === 2) {
      return `${parts[1].replace('_', ' ')} (${parts[0]})`;
    }
    return timezone;
  };

  return (
    <div className="space-y-8">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Review & Finish
        </CardTitle>
        <CardDescription className="text-lg">
          Review your information and complete your setup
        </CardDescription>
      </CardHeader>

      <div className="space-y-6">
        {/* Profile Type & Name */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${isIndividual ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                {isIndividual ? (
                  <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {isIndividual ? data.fullName : data.companyName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isIndividual ? (
                    <>
                      {data.role && `${data.role} • `}
                      Individual Profile
                    </>
                  ) : (
                    <>
                      {data.industry && `${data.industry} • `}
                      Company Profile
                      {data.teamSize && ` • ${data.teamSize} employees`}
                    </>
                  )}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Connected Platforms */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Interested Platforms</h3>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {data.interestedPlatforms?.map((platformId: string) => {
              const Icon = platformIcons[platformId as keyof typeof platformIcons];
              const color = platformColors[platformId as keyof typeof platformColors];
              
              return (
                <div key={platformId} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                  <Icon className="w-4 h-4" style={{ color }} />
                  <span className="text-sm font-medium capitalize">{platformId}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary Goals */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Primary Goals</h3>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          <div className="space-y-2">
            {data.primaryGoals?.map((goalId: string, index: number) => (
              <div key={goalId} className="flex items-center space-x-3">
                <Badge variant="default" className="min-w-0">
                  {index + 1}
                </Badge>
                <span className="text-sm">
                  {goalLabels[goalId as keyof typeof goalLabels]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Preferences</h3>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Timezone</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatTimezone(data.timezone)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Language</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {languageNames[data.language as keyof typeof languageNames]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-lg mb-2">You're all set!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Click "Complete Setup" to finish your onboarding and access your personalized dashboard.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>All required information collected</span>
          </div>
        </div>
      </div>
    </div>
  );
}