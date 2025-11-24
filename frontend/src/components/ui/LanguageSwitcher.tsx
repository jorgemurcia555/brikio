import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#8A3B12] hover:bg-[#F4C197]/40 transition-colors"
      aria-label="Change language"
    >
      <Globe className="w-5 h-5" />
      <span className="font-medium uppercase text-sm">
        {i18n.language === 'en' ? 'ES' : 'EN'}
      </span>
    </button>
  );
}

