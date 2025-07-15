import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Building2, Globe, Users } from 'lucide-react';

interface OnboardingStep3Props {
  data: any;
  updateData: (data: any) => void;
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Food & Beverage',
  'Travel & Tourism',
  'Real Estate',
  'Marketing & Advertising',
  'Entertainment',
  'Fashion',
  'Sports & Fitness',
  'Non-profit',
  'Government',
  'Legal',
  'Consulting',
  'Manufacturing',
  'Transportation',
  'Media & Communications',
  'Other'
];

const teamSizes = [
  '1–5',
  '6–20',
  '21–100',
  '100+'
];

export default function OnboardingStep3({ data, updateData }: OnboardingStep3Props) {
  const handleInputChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  const isIndividual = data.profileType === 'individual';

  return (
    <div className="space-y-8">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full ${isIndividual ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
            {isIndividual ? (
              <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            ) : (
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            )}
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          {isIndividual ? 'Tell us about yourself' : 'Tell us about your company'}
        </CardTitle>
        <CardDescription className="text-lg">
          {isIndividual 
            ? 'Help us personalize your experience'
            : 'Help us understand your organization'
          }
        </CardDescription>
      </CardHeader>

      <div className="space-y-6">
        {isIndividual ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                <span className="text-red-500">*</span>
                Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="e.g. Jane Doe"
                value={data.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Role / Title (optional)
              </Label>
              <Input
                id="role"
                placeholder="e.g. Social Media Manager"
                value={data.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website or Blog URL (optional)
              </Label>
              <Input
                id="website"
                placeholder="https://..."
                value={data.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium flex items-center gap-2">
                <span className="text-red-500">*</span>
                Company Name
              </Label>
              <Input
                id="companyName"
                placeholder="e.g. Acme Corp"
                value={data.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-sm font-medium flex items-center gap-2">
                <span className="text-red-500">*</span>
                Industry
              </Label>
              <Select value={data.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry.toLowerCase()}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamSize" className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Size (optional)
              </Label>
              <Select value={data.teamSize} onValueChange={(value) => handleInputChange('teamSize', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  {teamSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="text-red-500">*</span> Required fields must be completed to continue.
            You can always update this information later in your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
}