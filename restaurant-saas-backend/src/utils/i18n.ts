/**
 * Multi-language utilities
 * Handles language detection, RTL support, and localized content
 */

import { Language, DEFAULT_LANGUAGE, RTL_LANGUAGES, SUPPORTED_LANGUAGES, getLanguageConfig } from '../types';

/**
 * Validate and normalize language code
 */
export function normalizeLanguage(lang?: string): Language {
  if (!lang) return DEFAULT_LANGUAGE;

  const normalized = lang.toLowerCase().substring(0, 2) as Language;
  return SUPPORTED_LANGUAGES[normalized] ? normalized : DEFAULT_LANGUAGE;
}

/**
 * Check if language requires RTL layout
 */
export function isRTL(lang: Language): boolean {
  return RTL_LANGUAGES.includes(lang);
}

/**
 * Get localized text with fallback
 */
export function getLocalizedText(
  text: Record<string, string> | undefined,
  lang: Language
): string {
  if (!text) return '';

  // Try exact match
  if (text[lang]) return text[lang];

  // Try without region code (e.g., 'en-US' -> 'en')
  const langCode = lang.split('-')[0];
  if (text[langCode]) return text[langCode];

  // Fallback to English
  if (text[DEFAULT_LANGUAGE]) return text[DEFAULT_LANGUAGE];

  // Fallback to first available
  const firstValue = Object.values(text)[0];
  return firstValue || '';
}

/**
 * Transform localized text object for API response
 */
export function transformLocalizedText(
  text: Record<string, string> | undefined,
  lang: Language
): string {
  return getLocalizedText(text, lang);
}

/**
 * Create localized content object
 */
export function createLocalizedContent(
  content: string,
  languages: Language[] = ['en', 'tr', 'de', 'ru', 'fr', 'ar']
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const lang of languages) {
    result[lang] = content;
  }
  return result;
}

/**
 * Get language info for API response
 */
export function getLanguageInfo(lang: Language) {
  const config = SUPPORTED_LANGUAGES[lang] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
  return {
    code: lang,
    ...config,
  };
}

/**
 * Create RTL metadata response
 */
export function createRTLMeta(lang: Language) {
  return {
    rtl: isRTL(lang),
    language: getLanguageInfo(lang),
  };
}