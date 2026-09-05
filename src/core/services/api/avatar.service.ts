export function getAvatarUrl(seed: string): string {
  if (!seed) return '';
  const encodedSeed = encodeURIComponent(seed.trim());
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodedSeed}`;
}
