-- ============================================================
-- 03 - FUNÇÕES GLOBAIS
-- ============================================================

-- Retorna o papel do usuário autenticado
CREATE SCHEMA IF NOT EXISTS private;

-- Função auxiliar para gerar HMAC (Proteção contra doxxing)
CREATE OR REPLACE FUNCTION private.gerar_hash_eleitor(p_alvo_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(extensions.hmac(auth.uid()::text || p_alvo_id::text, COALESCE(current_setting('app.settings.hash_secret', true), 'FICOU_CLARO_DEFAULT_SECRET'), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para motor de regras de moderação (Custo Zero)
CREATE OR REPLACE FUNCTION private.verificar_moderacao(p_texto TEXT)
RETURNS JSONB AS $$
DECLARE
  v_sensitive BOOLEAN := false;
  v_offensive BOOLEAN := false;
BEGIN
  IF p_texto IS NULL OR p_texto = '' THEN
    RETURN '{"sensitive": false, "offensive": false}'::jsonb;
  END IF;

  -- Regex para dados sensíveis (CPF, E-mail, Telefone)
  IF p_texto ~* '([0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2})|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(\(?[0-9]{2}\)?\s?9?[0-9]{4}\-?[0-9]{4})' THEN
    v_sensitive := true;
  END IF;

  -- Regex para ofensas (Xingamentos)
  IF p_texto ~* '\b(porra|caralho|merda|buceta|carai|fdp|puta|vsf|tnc|cuzão|cu|desgraça|corno|babaca|idiota|imbecil|retardado|otario|otário|vagabundo|arrombado)\b' THEN
    v_offensive := true;
  END IF;

  RETURN jsonb_build_object('sensitive', v_sensitive, 'offensive', v_offensive);
END;
$$ LANGUAGE plpgsql STABLE;

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
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;
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
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.disciplinas WHERE id = p_disciplina_id AND professor_id = auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado: Você não é o proprietário desta disciplina.';
  END IF;

  RETURN QUERY
  SELECT
    s.id AS sessao_id,
    s.disciplina_id,
    s.topico,
    s.iniciada_em,
    s.status,
    COALESCE((SELECT AVG(nota) FROM public.avaliacoes_rapidas ar WHERE ar.sessao_id = s.id), 0) AS media_estrelas,
    (SELECT COUNT(*) FROM public.avaliacoes_rapidas ar WHERE ar.sessao_id = s.id) AS total_avaliacoes,
    (SELECT COUNT(*) FROM public.duvidas d WHERE d.sessao_id = s.id) AS total_duvidas,
    (SELECT COUNT(*) FROM public.sinais_ritmo sr WHERE sr.sessao_id = s.id) AS total_sinais,
    (SELECT COUNT(*) FROM public.enquetes e WHERE e.sessao_id = s.id) AS total_enquetes
  FROM public.sessoes s
  WHERE s.disciplina_id = p_disciplina_id
    AND s.professor_id = auth.uid();
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public;

-- Função para agregar métricas de sessões GLOBAIS (Dashboard Global)
-- Retorna os insights de todas as turmas do professor logado.
CREATE OR REPLACE FUNCTION public.get_global_insights()
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
BEGIN
  RETURN QUERY
  SELECT
    s.id AS sessao_id,
    s.disciplina_id,
    s.topico,
    s.iniciada_em,
    s.status,
    COALESCE((SELECT AVG(nota) FROM public.avaliacoes_rapidas ar WHERE ar.sessao_id = s.id), 0) AS media_estrelas,
    (SELECT COUNT(*) FROM public.avaliacoes_rapidas ar WHERE ar.sessao_id = s.id) AS total_avaliacoes,
    (SELECT COUNT(*) FROM public.duvidas d WHERE d.sessao_id = s.id) AS total_duvidas,
    (SELECT COUNT(*) FROM public.sinais_ritmo sr WHERE sr.sessao_id = s.id) AS total_sinais,
    (SELECT COUNT(*) FROM public.enquetes e WHERE e.sessao_id = s.id) AS total_enquetes
  FROM public.sessoes s
  WHERE s.professor_id = auth.uid();
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public;

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
CREATE OR REPLACE FUNCTION public.submit_poll_vote(p_enquete_id UUID, p_sessao_id UUID, p_resposta JSONB)
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
  v_hash := private.gerar_hash_eleitor(p_enquete_id);

  INSERT INTO public.respostas_enquete (enquete_id, sessao_id, resposta, hash_eleitor)
  VALUES (p_enquete_id, p_sessao_id, p_resposta, v_hash);
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
  v_hash := private.gerar_hash_eleitor(p_duvida_id);

  INSERT INTO public.votos_duvida (duvida_id, hash_eleitor)
  VALUES (p_duvida_id, v_hash);
END;
$$;

-- 3. Avaliação Rápida (Pós-Aula)
CREATE OR REPLACE FUNCTION public.submit_flash_review(p_sessao_id UUID, p_nota SMALLINT, p_comentario TEXT, p_anonimo BOOLEAN DEFAULT true)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public
AS $$
DECLARE
  v_hash TEXT;
  v_aluno_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;
  
  v_hash := private.gerar_hash_eleitor(p_sessao_id);
  
  IF p_anonimo THEN
    v_aluno_id := NULL;
  ELSE
    v_aluno_id := auth.uid();
  END IF;

  INSERT INTO public.avaliacoes_rapidas (sessao_id, aluno_id, nota, comentario, hash_eleitor)
  VALUES (p_sessao_id, v_aluno_id, p_nota, p_comentario, v_hash);
END;
$$;
