-- ============================================================
-- 07 - REALTIME
-- ============================================================

-- Adiciona as tabelas que precisam de reatividade ao vivo no Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sinais_ritmo;
ALTER PUBLICATION supabase_realtime ADD TABLE public.duvidas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enquetes;
