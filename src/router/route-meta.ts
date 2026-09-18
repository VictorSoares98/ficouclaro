import type { PapelUsuario } from '@/core/types/auth.types';

export const ROUTE_ROLES: Record<string, PapelUsuario[]> = {
  '/dashboard': ['professor'],
  '/disciplinas': ['professor'],
  '/hub': ['aluno'],
  '/sala': ['professor', 'aluno'],
};
