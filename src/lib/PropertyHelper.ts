/**
 * Check if a property matches or contains a given value.
 *
 * Comparison logic:
 * - String value + String property: Exact match comparison
 * - String value + Array property: Check if array includes the string
 * - Array value + String property: Check if any array element matches the string
 * - Array value + Array property: Check if arrays have any common elements
 *
 * @param property - The property value to check (can be string, array, or other)
 * @param value - The value to match (can be string or array)
 * @returns True if the property matches/contains the value
 *
 * @example
 * ```typescript
 * // String value comparisons
 * hasValue('foo', 'foo')           // true
 * hasValue('bar', 'foo')           // false
 * hasValue(['foo', 'bar'], 'foo')  // true
 * hasValue(['bar', 'baz'], 'foo')  // false
 *
 * // Array value comparisons
 * hasValue('foo', ['foo', 'bar'])           // true
 * hasValue('baz', ['foo', 'bar'])           // false
 * hasValue(['foo', 'baz'], ['foo', 'bar'])  // true (has 'foo')
 * hasValue(['qux', 'baz'], ['foo', 'bar'])  // false
 * ```
 */
export function hasValue(property: any, value: string | string[]): boolean {
    // Handle null/undefined property
    if (property === null || property === undefined) {
      return false
    }

    // Case 1: Value is a string
    if (typeof value === 'string') {
      // String value + String property: Exact match
      if (typeof property === 'string') {
        return property === value
      }
      
      // String value + Array property: Check if array includes the string
      if (Array.isArray(property)) {
        return property.includes(value)
      }
      
      // Other types: Convert to string and compare
      return String(property) === value
    }

    // Case 2: Value is an array
    if (Array.isArray(value)) {
      // Array value + String property: Check if any array element matches
      if (typeof property === 'string') {
        return value.includes(property)
      }
      
      // Array value + Array property: Check if arrays have any common elements
      if (Array.isArray(property)) {
        return property.some(item => value.includes(item))
      }
      
      // Other types: Convert to string and check if in array
      return value.includes(String(property))
    }

  // Fallback: Neither string nor array
  return false
}

/**
 * Check if a property exactly matches a value (no partial/contains logic).
 *
 * @param property - The property value to check
 * @param value - The value to match exactly
 * @returns True if the property exactly matches the value
 *
 * @example
 * ```typescript
 * exactMatch('foo', 'foo')           // true
 * exactMatch(['foo'], 'foo')         // false (not exact)
 * exactMatch(['foo', 'bar'], ['foo', 'bar'])  // true
 * ```
 */
export function exactMatch(property: any, value: any): boolean {
  if (property === value) {
    return true
  }

  // For arrays, check deep equality
  if (Array.isArray(property) && Array.isArray(value)) {
    if (property.length !== value.length) {
      return false
    }
    return property.every((item, index) => item === value[index])
  }

  return false
}

/**
 * Check if all values are present in the property.
 *
 * @param property - The property value to check (should be an array)
 * @param values - Array of values that must all be present
 * @returns True if all values are present
 *
 * @example
 * ```typescript
 * hasAllValues(['foo', 'bar', 'baz'], ['foo', 'bar'])  // true
 * hasAllValues(['foo'], ['foo', 'bar'])                // false
 * ```
 */
export function hasAllValues(property: any, values: string[]): boolean {
  if (!Array.isArray(property)) {
    return false
  }

  return values.every(value => property.includes(value))
}

/**
 * Check if the property is empty (null, undefined, empty string, or empty array).
 *
 * @param property - The property to check
 * @returns True if the property is considered empty
 *
 * @example
 * ```typescript
 * isEmpty(null)      // true
 * isEmpty('')        // true
 * isEmpty([])        // true
 * isEmpty('foo')     // false
 * isEmpty(['foo'])   // false
 * ```
 */
export function isEmpty(property: any): boolean {
  if (property === null || property === undefined) {
    return true
  }

  if (typeof property === 'string') {
    return property.trim() === ''
  }

  if (Array.isArray(property)) {
    return property.length === 0
  }

  return false
}

// Default export for backward compatibility
export default {
  hasValue,
  exactMatch,
  hasAllValues,
  isEmpty
}

