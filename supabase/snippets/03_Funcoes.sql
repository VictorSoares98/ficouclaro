-- ============================================================
-- 03 - FUNÇÕES GLOBAIS
-- ============================================================

-- Retorna o papel do usuário autenticado
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.obter_meu_papel()
RETURNS papel_usuario AS $$
  SELECT papel FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Verifica se usuário está matriculado em uma disciplina
CREATE OR REPLACE FUNCTION public.esta_matriculado(p_disciplina_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.matriculas
    WHERE disciplina_id = p_disciplina_id AND aluno_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public;

-- Exclui a conta do próprio usuário autenticado (Direito ao Esquecimento - LGPD)
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para agregar métricas de sessões (Dashboard)
-- Substitui a necessidade de uma VIEW, mantendo os snippets organizados.
CREATE OR REPLACE FUNCTION public.get_course_insights(p_disciplina_id UUID)
RETURNS TABLE (
  sessao_id UUID,
  disciplina_id UUID,
  topico TEXT,
  iniciada_em TIMESTAMPTZ,
  status status_sessao,
  media_estrelas NUMERIC,
  total_avaliacoes BIGINT,
  total_duvidas BIGINT,
  total_sinais BIGINT,
  total_enquetes BIGINT
) AS $$
  SELECT
    s.id AS sessao_id,
    s.disciplina_id,
    s.topico,
    s.iniciada_em,
    s.status,
    COALESCE((SELECT AVG(nota) FROM public.avaliacoes_rapidas WHERE sessao_id = s.id), 0) AS media_estrelas,
    (SELECT COUNT(*) FROM public.avaliacoes_rapidas WHERE sessao_id = s.id) AS total_avaliacoes,
    (SELECT COUNT(*) FROM public.duvidas WHERE sessao_id = s.id) AS total_duvidas,
    (SELECT COUNT(*) FROM public.sinais_ritmo WHERE sessao_id = s.id) AS total_sinais,
    (SELECT COUNT(*) FROM public.enquetes WHERE sessao_id = s.id) AS total_enquetes
  FROM public.sessoes s
  WHERE s.disciplina_id = p_disciplina_id;
$$ LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public;

-- Função para contagem agregada de sinais do termômetro (Performance)
CREATE OR REPLACE FUNCTION public.get_thermometer_stats(p_sessao_id UUID)
RETURNS TABLE (
  muito_rapido BIGINT,
  boiando BIGINT,
  tudo_certo BIGINT,
  muito_devagar BIGINT
) AS $$
  SELECT 
    COUNT(*) FILTER (WHERE sinal = 'muito_rapido') AS muito_rapido,
    COUNT(*) FILTER (WHERE sinal = 'boiando') AS boiando,
    COUNT(*) FILTER (WHERE sinal = 'tudo_certo') AS tudo_certo,
    COUNT(*) FILTER (WHERE sinal = 'muito_devagar') AS muito_devagar
  FROM public.sinais_ritmo
  WHERE sessao_id = p_sessao_id;
$$ LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public;

-- ============================================================
-- RPCs PARA INSERÇÃO DE VOTOS E AVALIAÇÕES (LGPD - Geração de Hash Segura)
-- ============================================================

-- 1. Resposta de Enquete
CREATE OR REPLACE FUNCTION public.submit_poll_vote(p_enquete_id UUID, p_resposta JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public
AS $$
DECLARE
  v_hash TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  v_hash := encode(digest(auth.uid()::text || 'mvp_ficou_claro_secret_salt_993', 'sha256'), 'hex');

  INSERT INTO public.respostas_enquete (enquete_id, resposta, hash_eleitor)
  VALUES (p_enquete_id, p_resposta, v_hash);
END;
$$;

-- 2. Upvote em Dúvidas (Painel Q&A)
CREATE OR REPLACE FUNCTION public.submit_qa_upvote(p_duvida_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public
AS $$
DECLARE
  v_hash TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  v_hash := encode(digest(auth.uid()::text || 'mvp_ficou_claro_secret_salt_993', 'sha256'), 'hex');

  INSERT INTO public.votos_duvida (duvida_id, hash_eleitor)
  VALUES (p_duvida_id, v_hash);
END;
$$;

-- 3. Avaliação Rápida (Pós-Aula)
CREATE OR REPLACE FUNCTION public.submit_flash_review(p_sessao_id UUID, p_nota SMALLINT, p_comentario TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public
AS $$
DECLARE
  v_hash TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  v_hash := encode(digest(auth.uid()::text || 'mvp_ficou_claro_secret_salt_993', 'sha256'), 'hex');

  INSERT INTO public.avaliacoes_rapidas (sessao_id, nota, comentario, hash_eleitor)
  VALUES (p_sessao_id, p_nota, p_comentario, v_hash);
END;
$$;
