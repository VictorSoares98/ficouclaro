import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/core/types/database.types';

let supabaseUrl = import.meta.env.QCLI_SUPABASE_URL;

// Adaptação dinâmica para acesso mobile na mesma rede local
if (
  import.meta.env.DEV &&
  supabaseUrl &&
  (supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost')) &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
) {
  const urlObj = new URL(supabaseUrl);
  urlObj.hostname = window.location.hostname;
  supabaseUrl = urlObj.toString();
}
const supabaseAnonKey = import.meta.env.QCLI_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '🔥 [Supabase] FATAL ERROR: Credenciais ausentes no arquivo .env (QCLI_SUPABASE_URL ou QCLI_SUPABASE_ANON_KEY). A aplicação não pode ser iniciada.',
  );
}

// Singleton do Supabase Client para uso na aplicação
export const supabaseClient = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '');
