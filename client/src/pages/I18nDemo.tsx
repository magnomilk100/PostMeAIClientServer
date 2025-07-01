import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Check, Users, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function I18nDemo() {
  const { t, i18n } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Globe className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Internationalization Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            This page demonstrates the i18n functionality with 5 supported languages
          </p>
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Current Language Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Current Language Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Active Language:</p>
                <Badge variant="outline" className="mt-1">
                  {i18n.language} - {i18n.language === 'en' ? 'English' : 
                                   i18n.language === 'pt' ? 'Português' : 
                                   i18n.language === 'es' ? 'Español' : 
                                   i18n.language === 'de' ? 'Deutsch' : 
                                   i18n.language === 'it' ? 'Italiano' : 'Unknown'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fallback Language:</p>
                <Badge variant="secondary" className="mt-1">en - English</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Translation Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Basic UI Elements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic UI Elements</CardTitle>
              <CardDescription>Common interface translations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Welcome:</span>
                <Badge>{t('welcome')}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Login:</span>
                <Badge>{t('login')}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Logout:</span>
                <Badge>{t('logout')}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Settings:</span>
                <Badge>{t('settings')}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Language:</span>
                <Badge>{t('language')}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Menu */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Navigation Menu</CardTitle>
              <CardDescription>Menu item translations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Home:</span>
                <Badge variant="outline">{t('home')}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Post:</span>
                <Badge variant="outline">{t('post')}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Templates:</span>
                <Badge variant="outline">{t('templates')}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Images:</span>
                <Badge variant="outline">{t('images')}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Social Media:</span>
                <Badge variant="outline">{t('socialMedia')}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Action Buttons</CardTitle>
              <CardDescription>Button and action translations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full">
                {t('createNewPost')}
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                {t('aiPost')}
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                {t('manualPost')}
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                {t('selectLanguage')}
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                {t('changeLanguage')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span>Implementation Features</span>
            </CardTitle>
            <CardDescription>
              What's included in this i18n implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Supported Languages</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <span>🇺🇸</span>
                    <span>English (Default)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>🇧🇷</span>
                    <span>Português (Portuguese)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>🇪🇸</span>
                    <span>Español (Spanish)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>🇩🇪</span>
                    <span>Deutsch (German)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>🇮🇹</span>
                    <span>Italiano (Italian)</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Key Features</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>✓ Browser language detection</li>
                  <li>✓ Local storage persistence</li>
                  <li>✓ Dynamic language switching</li>
                  <li>✓ Fallback to English</li>
                  <li>✓ Country flag indicators</li>
                  <li>✓ Scalable folder structure</li>
                  <li>✓ Production-ready setup</li>
                  <li>✓ Easy to extend</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Usage Instructions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                <strong>1. Language Detection:</strong> The application automatically detects your browser's language 
                preference and switches to it if supported. Otherwise, it defaults to English.
              </p>
              <p>
                <strong>2. Manual Language Switch:</strong> Use the language switcher dropdown in the header 
                (with country flags) to manually change the language at any time.
              </p>
              <p>
                <strong>3. Persistence:</strong> Your language preference is saved in local storage and 
                will be remembered across browser sessions.
              </p>
              <p>
                <strong>4. Fallback System:</strong> If a translation key is missing in the selected language, 
                the application will automatically fall back to the English translation.
              </p>
              <p>
                <strong>5. Adding New Languages:</strong> To add support for new languages, simply create 
                new translation files in the <code>/client/src/locales/</code> directory and update the 
                language configuration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}