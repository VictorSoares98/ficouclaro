/**
 * Gera URL de avatar pseudonimizada para prevenção de vazamento de PII (LGPD).
 * Transforma a semente em um hash determinístico antes de consultar a API externa.
 */
function hashSeed(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return 'fc_' + Math.abs(hash >>> 0).toString(16);
}

export function getAvatarUrl(seed: string): string {
  if (!seed) return '';
  const pseudoSeed = hashSeed(seed.trim().toLowerCase());
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${pseudoSeed}`;
}
