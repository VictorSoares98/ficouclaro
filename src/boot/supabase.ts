import { defineBoot } from '#q-app';
import { supabaseClient } from '../core/supabase/client';

// Arquivo de Boot injetado antes do Vue montar a aplicação
export default defineBoot(() => {
  // Inicialização forçada precoce.
  // Permite validar imediatamente se as variáveis de ambiente foram lidas com sucesso.
  if (!supabaseClient) {
    console.error('🔥 [Boot] Falha grave: Cliente do Supabase não inicializado.');
  } else {
    console.log('✅ [Boot] Supabase Client carregado e pronto.');
  }
});
