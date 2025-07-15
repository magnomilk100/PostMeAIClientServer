import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SiFacebook, SiInstagram, SiLinkedin, SiX, SiTiktok, SiYoutube } from 'react-icons/si';
import { Info } from 'lucide-react';

interface OnboardingStep4Props {
  data: any;
  updateData: (data: any) => void;
}

const platforms = [
  {
    id: 'facebook',
    name: 'Facebook Pages',
    icon: SiFacebook,
    color: '#1877F2',
    description: 'Share posts with your Facebook page followers'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: SiInstagram,
    color: '#E4405F',
    description: 'Visual content for your Instagram audience'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: SiLinkedin,
    color: '#0A66C2',
    description: 'Professional networking and business updates'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: SiX,
    color: '#1DA1F2',
    description: 'Quick updates and engagement with followers'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: SiTiktok,
    color: '#000000',
    description: 'Short-form video content and trends'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: SiYoutube,
    color: '#FF0000',
    description: 'Long-form video content and community posts'
  }
];

export default function OnboardingStep4({ data, updateData }: OnboardingStep4Props) {
  const handlePlatformChange = (platformId: string, checked: boolean) => {
    const currentPlatforms = data.interestedPlatforms || [];
    let newPlatforms;
    
    if (checked) {
      newPlatforms = [...currentPlatforms, platformId];
    } else {
      newPlatforms = currentPlatforms.filter((id: string) => id !== platformId);
    }
    
    updateData({ interestedPlatforms: newPlatforms });
  };

  return (
    <div className="space-y-8">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Social Platforms</CardTitle>
        <CardDescription className="text-lg">
          Which social media platforms would you like to use with PostMeAI?
        </CardDescription>
      </CardHeader>

      <div className="space-y-4">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isChecked = data.interestedPlatforms?.includes(platform.id) || false;
          
          return (
            <div
              key={platform.id}
              className={`flex items-center space-x-4 p-4 border-2 rounded-xl transition-all ${
                isChecked 
                  ? 'border-purple-300 bg-purple-50 dark:border-purple-500 dark:bg-purple-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Checkbox
                id={platform.id}
                checked={isChecked}
                onCheckedChange={(checked) => handlePlatformChange(platform.id, checked as boolean)}
              />
              <Label
                htmlFor={platform.id}
                className="flex items-center space-x-4 cursor-pointer flex-1"
              >
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Icon className="w-6 h-6" style={{ color: platform.color }} />
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-lg">{platform.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {platform.description}
                  </div>
                </div>
              </Label>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              You can connect more later
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Select at least one platform to continue. You can always add more platforms and configure API keys later in your Social Media settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}