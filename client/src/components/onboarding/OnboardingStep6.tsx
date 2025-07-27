import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, RefreshCw } from 'lucide-react';

interface OnboardingStep6Props {
  data: any;
  updateData: (data: any) => void;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Zurich',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Seoul',
  'Asia/Mumbai',
  'Asia/Dubai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland'
];

export default function OnboardingStep6({ data, updateData }: OnboardingStep6Props) {
  const handleInputChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  const autoDetectSettings = () => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const detectedLanguage = navigator.language.split('-')[0];
    
    updateData({
      timezone: detectedTimezone,
      language: detectedLanguage
    });
  };



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
        <CardTitle className="text-2xl font-bold">Preferences</CardTitle>
        <CardDescription className="text-lg">
          Set your timezone and language preferences
        </CardDescription>
      </CardHeader>

      <div className="space-y-6">
        <div className="flex justify-center">
          <Button
            onClick={autoDetectSettings}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Auto-detect from browser
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="text-red-500">*</span>
            Timezone
          </Label>
          <Select value={data.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your timezone" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {timezones.map((timezone) => (
                <SelectItem key={timezone} value={timezone}>
                  {formatTimezone(timezone)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language" className="text-sm font-medium flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="text-red-500">*</span>
            Language
          </Label>
          <Select value={data.language} onValueChange={(value) => handleInputChange('language', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  <div className="flex items-center space-x-2">
                    <span>{language.flag}</span>
                    <span>{language.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                These settings affect timestamps and interface language
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                All post scheduling and reports will use your selected timezone. You can change these settings anytime in your profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}