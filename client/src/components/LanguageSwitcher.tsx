import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, ChevronDown, Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = supportedLanguages[i18n.language as keyof typeof supportedLanguages] || supportedLanguages.en;

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center space-x-2 min-w-[140px] justify-between"
        >
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span className="text-lg">{currentLanguage.flag}</span>
            <span className="hidden sm:inline text-sm">{currentLanguage.name}</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(supportedLanguages).map(([code, language]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{language.flag}</span>
              <span className="text-sm font-medium">{language.name}</span>
            </div>
            {i18n.language === code && (
              <Check className="w-4 h-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}