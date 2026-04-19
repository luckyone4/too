/**
 * Language types supported by the system
 * AR = Arabic (RTL language)
 */
export type Language = 'en' | 'tr' | 'de' | 'ru' | 'fr' | 'ar';

/**
 * RTL languages for proper text direction handling
 */
export const RTL_LANGUAGES: Language[] = ['ar'];

/**
 * Default language when not specified
 */
export const DEFAULT_LANGUAGE: Language = 'en';

/**
 * Supported languages configuration
 */
export const SUPPORTED_LANGUAGES: Record<Language, { name: string; nativeName: string; rtl: boolean }> = {
  en: { name: 'English', nativeName: 'English', rtl: false },
  tr: { name: 'Turkish', nativeName: 'Türkçe', rtl: false },
  de: { name: 'German', nativeName: 'Deutsch', rtl: false },
  ru: { name: 'Russian', nativeName: 'Русский', rtl: false },
  fr: { name: 'French', nativeName: 'Français', rtl: false },
  ar: { name: 'Arabic', nativeName: 'العربية', rtl: true }
};

/**
 * Check if a language is RTL
 */
export function isRTL(lang: Language): boolean {
  return RTL_LANGUAGES.includes(lang);
}

/**
 * Get language configuration
 */
export function getLanguageConfig(lang: Language) {
  return SUPPORTED_LANGUAGES[lang] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
}