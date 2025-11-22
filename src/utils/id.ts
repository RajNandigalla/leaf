import { nanoid, customAlphabet } from 'nanoid';

/**
 * Generate a unique ID using nanoid
 *
 * @param size - Length of the ID (default: 21)
 * @returns A unique string ID
 *
 * @example
 * ```ts
 * const id = generateId(); // => "V1StGXR8_Z5jdHi6B-myT"
 * const shortId = generateId(10); // => "V1StGXR8_Z"
 * ```
 */
export function generateId(size?: number): string {
  return nanoid(size);
}

/**
 * Generate a numeric-only ID
 *
 * @param size - Length of the ID (default: 10)
 * @returns A numeric string ID
 *
 * @example
 * ```ts
 * const numericId = generateNumericId(); // => "4815162342"
 * ```
 */
export const generateNumericId = customAlphabet('0123456789', 10);

/**
 * Generate a URL-safe ID (no special characters)
 *
 * @param size - Length of the ID (default: 10)
 * @returns A URL-safe string ID
 *
 * @example
 * ```ts
 * const urlId = generateUrlSafeId(); // => "V1StGXR8Z5"
 * ```
 */
export const generateUrlSafeId = customAlphabet(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  10
);

/**
 * Generate a short ID (8 characters)
 *
 * @returns A short unique ID
 *
 * @example
 * ```ts
 * const shortId = generateShortId(); // => "V1StGXR8"
 * ```
 */
export function generateShortId(): string {
  return nanoid(8);
}

/**
 * Generate a prefixed ID
 *
 * @param prefix - Prefix for the ID
 * @param size - Length of the random part (default: 16)
 * @returns A prefixed unique ID
 *
 * @example
 * ```ts
 * const userId = generatePrefixedId('user'); // => "user_V1StGXR8_Z5jdHi6"
 * const orderId = generatePrefixedId('order', 10); // => "order_V1StGXR8_Z"
 * ```
 */
export function generatePrefixedId(prefix: string, size: number = 16): string {
  return `${prefix}_${nanoid(size)}`;
}
