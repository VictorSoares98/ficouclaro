import type { PapelUsuario } from '@/core/types/auth.types';

export const ROUTE_ROLES: Record<string, PapelUsuario[]> = {
  '/aluno': ['aluno'],
  '/professor': ['professor'],
};
