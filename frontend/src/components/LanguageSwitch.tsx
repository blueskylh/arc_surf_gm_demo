import { useI18n, Locale } from '../lib/i18n';

export function LanguageSwitch() {
  const { locale, setLocale } = useI18n();

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'zh' : 'en');
  };

  return (
    <button
      onClick={toggleLocale}
      className="px-2.5 py-1 text-xs text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10 rounded-md transition-all duration-200"
    >
      {locale === 'en' ? '中文' : 'EN'}
    </button>
  );
}
