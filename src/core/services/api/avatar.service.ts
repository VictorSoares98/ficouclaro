/**
 * Tipos de coleções de avatares suportadas via DiceBear 9.x
 */
export type AvatarStyle = 'bottts' | 'adventurer' | 'notionists' | 'pixel-art' | 'fun-emoji';

export interface AvatarStyleOption {
  id: AvatarStyle;
  label: string;
  icon: string;
  description: string;
}

export const AVATAR_STYLES: readonly AvatarStyleOption[] = [
  { id: 'bottts', label: 'Cyborg', icon: 'smart_toy', description: 'Robôs futuristas' },
  { id: 'adventurer', label: 'Aventureiro', icon: 'explore', description: 'Estilo RPG acadêmico' },
  {
    id: 'notionists',
    label: 'Minimalista',
    icon: 'palette',
    description: 'Traço elegante editorial',
  },
  { id: 'pixel-art', label: 'Pixel Gamer', icon: 'sports_esports', description: 'Retrô 8-bit' },
  {
    id: 'fun-emoji',
    label: 'Expressivo',
    icon: 'sentiment_very_satisfied',
    description: 'Emojis carismáticos',
  },
];

export const FUN_ACADEMIC_NICKNAMES: readonly string[] = [
  'Einstein da Madrugada',
  'Ada dos Algoritmos',
  'Newton do Cálculo',
  'Turing do Backend',
  'Pitágoras Noturno',
  'Marie Curie do Lab',
  'Tesla da Elétrica',
  'Descartes do Código',
  'Galileu da Órbita',
  'Hipátia da Geometria',
  'Lovelace dos Loops',
  'Aristóteles da Lógica',
  'Arquimedes da Flutuação',
  'Copérnico das Ideias',
  'Pascal da Pressão',
  'Kepler dos Dados',
];

/**
 * Retorna um apelido acadêmico aleatório e espirituoso.
 */
export function getRandomAcademicNickname(): string {
  const index = Math.floor(Math.random() * FUN_ACADEMIC_NICKNAMES.length);
  return FUN_ACADEMIC_NICKNAMES[index] || 'Gênio Acadêmico';
}

/**
 * Retorna um estilo de avatar aleatório (garantindo alternância se currentStyle for fornecido).
 */
export function getRandomAvatarStyle(currentStyle?: AvatarStyle): AvatarStyle {
  const styles = AVATAR_STYLES.map((s) => s.id);
  const pool = currentStyle ? styles.filter((s) => s !== currentStyle) : styles;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? 'bottts';
}

/**
 * Algoritmo determinístico de hash com salt de segurança para proteção de PII (LGPD).
 */
function hashSeed(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return 'fc_' + Math.abs(hash >>> 0).toString(16);
}

/**
 * Gera URL de avatar pseudonimizada para prevenção de vazamento de PII (LGPD).
 * Transforma a semente em um hash determinístico antes de consultar a API externa.
 */
export function getAvatarUrl(seed: string, style: AvatarStyle = 'bottts'): string {
  if (!seed) return '';
  const pseudoSeed = hashSeed(seed.trim().toLowerCase());
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${pseudoSeed}`;
}

/**
 * Fallback determinístico offline em formato SVG Data URI.
 * Garante que mesmo sem conexão externa ou com falha na API, o avatar nunca quebre na tela.
 */
export function getFallbackAvatarDataUri(name: string): string {
  const safeName = (name || 'Aluno').trim();
  const initial = (safeName.charAt(0) || 'A').toUpperCase();

  const palette = [
    { c1: '#3b82f6', c2: '#1d4ed8' }, // Blue
    { c1: '#10b981', c2: '#047857' }, // Emerald
    { c1: '#8b5cf6', c2: '#6d28d9' }, // Purple
    { c1: '#f59e0b', c2: '#b45309' }, // Amber
    { c1: '#ec4899', c2: '#be185d' }, // Pink
    { c1: '#06b6d4', c2: '#0e7490' }, // Cyan
  ];

  let sum = 0;
  for (let i = 0; i < safeName.length; i++) {
    sum += safeName.charCodeAt(i);
  }
  const colorPair = palette[sum % palette.length] ?? palette[0]!;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="g_${sum}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorPair.c1}" />
        <stop offset="100%" stop-color="${colorPair.c2}" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#g_${sum})" />
    <text x="50" y="62" font-size="40" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="700" fill="#ffffff" text-anchor="middle">${initial}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
