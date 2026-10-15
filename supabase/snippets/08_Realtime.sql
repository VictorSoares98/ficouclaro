-- ============================================================
-- 07 - REALTIME
-- ============================================================

-- Adiciona as tabelas que precisam de reatividade ao vivo no Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sinais_ritmo;
ALTER PUBLICATION supabase_realtime ADD TABLE public.duvidas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enquetes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.respostas_enquete;

-- Configuração obrigatória para que políticas RLS consigam ler colunas 
-- não modificadas (ex: disciplina_id) durante eventos de UPDATE no Realtime
ALTER TABLE public.sessoes REPLICA IDENTITY FULL;
ALTER TABLE public.duvidas REPLICA IDENTITY FULL;
ALTER TABLE public.enquetes REPLICA IDENTITY FULL;
