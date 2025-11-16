import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { LanguagesIcon } from 'lucide-react';
import { Button } from './ui/button';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useAppStore();

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLang);
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="ghost"
      size="icon"
      className="bg-transparent text-foreground hover:bg-primary/10 hover:text-primary rounded-lg"
      aria-label={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <LanguagesIcon className="w-5 h-5" strokeWidth={2} />
    </Button>
  );
};
