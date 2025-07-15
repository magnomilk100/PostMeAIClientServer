import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { User, Building2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface OnboardingStep2Props {
  data: any;
  updateData: (data: any) => void;
}

export default function OnboardingStep2({ data, updateData }: OnboardingStep2Props) {
  const handleProfileTypeChange = (value: string) => {
    updateData({ profileType: value });
  };

  return (
    <div className="space-y-8">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Profile Type</CardTitle>
        <CardDescription className="text-lg">
          Help us understand how you'll be using PostMeAI
        </CardDescription>
      </CardHeader>

      <div className="space-y-6">
        <RadioGroup
          value={data.profileType}
          onValueChange={handleProfileTypeChange}
          className="space-y-4"
        >
          <div className="flex items-center space-x-4 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-500 transition-colors">
            <RadioGroupItem value="individual" id="individual" />
            <Label htmlFor="individual" className="flex items-center space-x-4 cursor-pointer flex-1">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-lg">An individual</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Creator, freelancer, or personal brand
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-4 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-500 transition-colors">
            <RadioGroupItem value="company" id="company" />
            <Label htmlFor="company" className="flex items-center space-x-4 cursor-pointer flex-1">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-lg flex items-center gap-2">
                  A company or organization
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Great if you post on behalf of a brand or team</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Business, agency, or team account
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Don't worry, you can change this later
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                You can always update your profile type in your account settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}