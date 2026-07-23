/** Content types accepted for venue plan background images. */
export const ALLOWED_PLAN_IMAGE_CONTENT_TYPES: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
];

/** Max venue plan background image size: 25 MB. */
export const MAX_PLAN_IMAGE_SIZE_BYTES = 25 * 1024 * 1024;

/** Longest sanitized filename segment kept in a generated object key. */
export const MAX_SANITIZED_PLAN_FILENAME_LENGTH = 200;
