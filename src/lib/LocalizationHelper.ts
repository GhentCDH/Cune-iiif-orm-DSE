import { getValue } from '@iiif/helpers'

/**
 * IIIF Localized value type
 * According to IIIF Presentation API 3.0, localized values are objects with language codes as keys
 * and arrays of strings as values.
 * 
 * Example: { "en": ["Hello"], "fr": ["Bonjour"], "de": ["Hallo"] }
 */
export type LocalizedValue = {
  [language: string]: string[]
} | null | undefined

/**
 * Get the best localized value from an IIIF localized object.
 * 
 * This helper extracts the most appropriate string value from a localized IIIF property
 * based on the preferred language, falling back to other available languages.
 * 
 * @param localizedValue - The IIIF localized value object (e.g., from manifest.label, manifest.summary, etc.)
 * @param preferredLanguage - The preferred language code (e.g., 'en', 'fr', 'de'). Defaults to 'en'.
 * @param fallback - Fallback value if no localized value is found. Defaults to empty string.
 * @returns The best matching localized string value
 * 
 * @example
 * ```typescript
 * const label = getLocalizedValue(manifest.label, 'en', 'Untitled')
 * // Returns the English label, or the first available language, or 'Untitled'
 * 
 * const summary = getLocalizedValue(manifest.summary, viewerState.language)
 * // Returns the summary in the viewer's language
 * ```
 */
export function getLocalizedValue(
  localizedValue: LocalizedValue,
  preferredLanguage: string = 'en',
  fallback: string = ''
): string {
  // Handle null/undefined
  if (!localizedValue) {
    return fallback
  }

  // Handle empty object
  if (Object.keys(localizedValue).length === 0) {
    return fallback
  }

  // Use IIIF helpers getValue function which handles language selection
  // It automatically picks the best language match
  const result = getValue(localizedValue, preferredLanguage)

  // getValue returns the value or empty string, use our fallback if empty
  return result || fallback
}

/**
 * Get the first available value from a localized object, ignoring language preference.
 * Useful when you just need any value and language doesn't matter.
 * 
 * @param localizedValue - The IIIF localized value object
 * @param fallback - Fallback value if no value is found. Defaults to empty string.
 * @returns The first available string value
 * 
 * @example
 * ```typescript
 * const anyLabel = getFirstLocalizedValue(resource.label, 'Untitled')
 * ```
 */
export function getFirstLocalizedValue(
  localizedValue: LocalizedValue,
  fallback: string = ''
): string {
  if (!localizedValue) {
    return fallback
  }

  const languages = Object.keys(localizedValue)
  if (languages.length === 0) {
    return fallback
  }

  const firstLanguage = languages[0]
  const values = localizedValue[firstLanguage]

  if (!values || values.length === 0) {
    return fallback
  }

  return values[0] || fallback
}

/**
 * Get all available languages in a localized value.
 * 
 * @param localizedValue - The IIIF localized value object
 * @returns Array of language codes
 * 
 * @example
 * ```typescript
 * const languages = getAvailableLanguages(manifest.label)
 * // Returns ['en', 'fr', 'de']
 * ```
 */
export function getAvailableLanguages(
  localizedValue: LocalizedValue
): string[] {
  if (!localizedValue) {
    return []
  }

  return Object.keys(localizedValue)
}

/**
 * Check if a localized value has a specific language.
 * 
 * @param localizedValue - The IIIF localized value object
 * @param language - The language code to check for
 * @returns True if the language exists and has values
 * 
 * @example
 * ```typescript
 * if (hasLanguage(manifest.label, 'fr')) {
 *   // French translation is available
 * }
 * ```
 */
export function hasLanguage(
  localizedValue: LocalizedValue,
  language: string
): boolean {
  if (!localizedValue) {
    return false
  }

  return language in localizedValue && 
         Array.isArray(localizedValue[language]) && 
         localizedValue[language].length > 0
}

export default {
  getLocalizedValue,
  getFirstLocalizedValue,
  getAvailableLanguages,
  hasLanguage
}

