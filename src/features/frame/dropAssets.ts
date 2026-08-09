export const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/gif',
] as const;

export type AcceptedMime = (typeof ACCEPTED_TYPES)[number];

export function classifyDropAsset(type: string): 'accept' | 'reject' | 'unknown' {
  if (type === '') {
    return 'unknown';
  }

  if ((ACCEPTED_TYPES as readonly string[]).includes(type)) {
    return 'accept';
  }

  return 'reject';
}
