import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/core/types/database.types';

const supabaseUrl = import.meta.env.QCLI_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.QCLI_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '🔥 [Supabase] Credenciais ausentes no arquivo .env (QCLI_SUPABASE_URL ou QCLI_SUPABASE_ANON_KEY)',
  );
}

// Singleton do Supabase Client para uso na aplicação
export const supabaseClient = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '');
