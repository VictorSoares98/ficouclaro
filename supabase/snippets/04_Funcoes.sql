-- ============================================================
-- 04 - FUNÇÕES GLOBAIS
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

-- Função para motor de regras de moderação (Padrão Indústria / Custo Zero)
CREATE OR REPLACE FUNCTION private.verificar_moderacao(p_texto TEXT)
RETURNS JSONB AS $$
DECLARE
  v_sensitive BOOLEAN := false;
  v_offensive BOOLEAN := false;
  v_texto_normalizado TEXT;
BEGIN
  IF p_texto IS NULL OR TRIM(p_texto) = '' THEN
    RETURN '{"sensitive": false, "offensive": false}'::jsonb;
  END IF;

  -- 1. Verificação de Dados Sensíveis (no texto original)
  -- Captura CPFs, E-mails e Telefones (BR)
  IF p_texto ~* '([0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2})|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(\(?[0-9]{2}\)?\s*9?[0-9]{4}\-?[0-9]{4})' THEN
    v_sensitive := true;
  END IF;

  -- 2. Normalização do Texto para contornar "Leetspeak" (ex: p0rr@ -> porra, m3rd4 -> merda)
  -- Remove acentos e converte números/símbolos usados para mascarar xingamentos para letras base
  v_texto_normalizado := lower(p_texto);
  v_texto_normalizado := translate(v_texto_normalizado, 'áàãâäéèêëíìîïóòõôöúùûüç@03415', 'aaaaaeeeeiiiiooooouuuucaoeais');

  -- 3. Dicionário Robusto de Ofensas e Assédio (utiliza word-boundaries \b para evitar falsos positivos como "documento" pegando "cu")
  IF v_texto_normalizado ~ '\b(porra|caralho|merda|buceta|boceta|xereca|xota|cacete|carai|fdp|puta|puto|vsf|tnc|cuzao|desgraca|corno|babaca|idiota|imbecil|retardado|otario|vagabundo|vagabunda|arrombado|viado|piranha|foder|fuder|fudendo|safado|safada|pica|rola|piroca|cu)\b' THEN
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

-- ============================================================
-- 4. GRUPOS DE ESTUDO: VINCULAR MEMBRO (Atômico - Padrão FMP)
-- ============================================================
CREATE OR REPLACE FUNCTION public.link_member_to_study_group(p_grupo_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autorizado';
  END IF;

  -- Insere o membro com papel de membro regular
  INSERT INTO public.grupos_membros (grupo_id, usuario_id, is_monitor)
  VALUES (p_grupo_id, auth.uid(), false)
  ON CONFLICT (grupo_id, usuario_id) DO NOTHING;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Falha ao vincular membro ao grupo de estudos: %', SQLERRM;
END;
$$;

-- ============================================================
-- 5. PORTABILIDADE DE DADOS (DSAR - Art. 18 LGPD)
-- ============================================================
CREATE OR REPLACE FUNCTION public.export_my_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_result JSONB;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  SELECT jsonb_build_object(
    'titular', (
      SELECT jsonb_build_object(
        'id', u.id,
        'papel', u.papel,
        'nome_completo', u.nome_completo,
        'url_avatar', u.url_avatar,
        'termos_aceitos_em', u.termos_aceitos_em,
        'versao_termos', u.versao_termos,
        'created_at', u.created_at,
        'updated_at', u.updated_at
      )
      FROM public.usuarios u
      WHERE u.id = v_uid
    ),
    'disciplinas_lecionadas', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', d.id,
        'nome', d.nome,
        'descricao', d.descricao,
        'curso', d.curso,
        'semestre', d.semestre,
        'turma', d.turma,
        'horario', d.horario,
        'codigo_convite', d.codigo_convite,
        'created_at', d.created_at
      ))
      FROM public.disciplinas d
      WHERE d.professor_id = v_uid
    ), '[]'::jsonb),
    'matriculas', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'matricula_id', m.id,
        'matriculado_em', m.created_at,
        'disciplina_id', d.id,
        'disciplina_nome', d.nome,
        'curso', d.curso,
        'semestre', d.semestre
      ))
      FROM public.matriculas m
      JOIN public.disciplinas d ON d.id = m.disciplina_id
      WHERE m.aluno_id = v_uid
    ), '[]'::jsonb),
    'duvidas_submetidas', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', dv.id,
        'sessao_id', dv.sessao_id,
        'texto', dv.texto,
        'votos', dv.votos,
        'foi_respondida', dv.foi_respondida,
        'created_at', dv.created_at
      ))
      FROM public.duvidas dv
      WHERE dv.autor_id = v_uid
    ), '[]'::jsonb),
    'avaliacoes_realizadas', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', ar.id,
        'sessao_id', ar.sessao_id,
        'nota', ar.nota,
        'comentario', ar.comentario,
        'created_at', ar.created_at
      ))
      FROM public.avaliacoes_rapidas ar
      WHERE ar.aluno_id = v_uid
    ), '[]'::jsonb),
    'grupos_estudo_criados', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', ge.id,
        'nome', ge.nome,
        'descricao', ge.descricao,
        'tipo', ge.tipo,
        'instituicao', ge.instituicao,
        'campus', ge.campus,
        'cidade', ge.cidade,
        'created_at', ge.created_at
      ))
      FROM public.grupos_estudo ge
      WHERE ge.criador_id = v_uid
    ), '[]'::jsonb),
    'grupos_membro', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'grupo_id', gm.grupo_id,
        'grupo_nome', ge.nome,
        'is_monitor', gm.is_monitor,
        'inscrito_em', gm.created_at
      ))
      FROM public.grupos_membros gm
      JOIN public.grupos_estudo ge ON ge.id = gm.grupo_id
      WHERE gm.usuario_id = v_uid
    ), '[]'::jsonb),
    'registros_encontro', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', re.id,
        'grupo_id', re.grupo_id,
        'data_referencia', re.data_referencia,
        'topico', re.topico,
        'participantes', re.participantes,
        'duracao_minutos', re.duracao_minutos,
        'duvidas_resolvidas', re.duvidas_resolvidas,
        'created_at', re.created_at
      ))
      FROM public.registros_encontro re
      WHERE re.registrado_por = v_uid
    ), '[]'::jsonb),
    'exportado_em', NOW()
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Busca dados públicos da disciplina por código de convite para a página de ingresso e QR Code
CREATE OR REPLACE FUNCTION public.obter_detalhes_convite(p_codigo TEXT)
RETURNS TABLE (
  disciplina_id UUID,
  nome TEXT,
  descricao TEXT,
  curso TEXT,
  semestre TEXT,
  turma TEXT,
  sala TEXT,
  bloco TEXT,
  icone TEXT,
  codigo_convite TEXT,
  professor_nome TEXT,
  professor_avatar TEXT,
  sessao_ativa_id UUID
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id AS disciplina_id,
    d.nome,
    d.descricao,
    d.curso,
    d.semestre,
    d.turma,
    d.sala,
    d.bloco,
    d.icone,
    d.codigo_convite,
    COALESCE(u.nome_completo, 'Professor Docente') AS professor_nome,
    u.url_avatar AS professor_avatar,
    (
      SELECT s.id 
      FROM public.sessoes s 
      WHERE s.disciplina_id = d.id 
        AND s.status IN ('aguardando', 'ativa') 
      ORDER BY s.created_at DESC 
      LIMIT 1
    ) AS sessao_ativa_id
  FROM public.disciplinas d
  LEFT JOIN public.usuarios u ON d.professor_id = u.id
  WHERE LOWER(d.codigo_convite) = LOWER(p_codigo)
  LIMIT 1;
END;
$$;

-- Envia uma notificação direta para um usuário específico
CREATE OR REPLACE FUNCTION public.enviar_notificacao_evento(
  p_usuario_id UUID,
  p_titulo TEXT,
  p_mensagem TEXT,
  p_tipo tipo_notificacao DEFAULT 'sistema',
  p_link TEXT DEFAULT NULL,
  p_dados_extras JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notificacao_id UUID;
BEGIN
  INSERT INTO public.notificacoes (
    usuario_id,
    titulo,
    mensagem,
    tipo,
    link,
    dados_extras
  ) VALUES (
    p_usuario_id,
    p_titulo,
    p_mensagem,
    p_tipo,
    p_link,
    p_dados_extras
  ) RETURNING id INTO v_notificacao_id;

  RETURN v_notificacao_id;
END;
$$;

-- Notifica todos os alunos matriculados na disciplina de uma sessão (ex: aula iniciada, enquete aberta)
CREATE OR REPLACE FUNCTION public.notificar_turma_sessao(
  p_sessao_id UUID,
  p_titulo TEXT,
  p_mensagem TEXT,
  p_tipo tipo_notificacao DEFAULT 'aula_iniciada',
  p_link TEXT DEFAULT NULL,
  p_dados_extras JSONB DEFAULT '{}'::jsonb
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_disciplina_id UUID;
  v_count INTEGER := 0;
  r RECORD;
BEGIN
  SELECT disciplina_id INTO v_disciplina_id FROM public.sessoes WHERE id = p_sessao_id;
  IF v_disciplina_id IS NULL THEN
    RETURN 0;
  END IF;

  FOR r IN (
    SELECT aluno_id FROM public.matriculas WHERE disciplina_id = v_disciplina_id
  ) LOOP
    INSERT INTO public.notificacoes (
      usuario_id,
      titulo,
      mensagem,
      tipo,
      link,
      dados_extras
    ) VALUES (
      r.aluno_id,
      p_titulo,
      p_mensagem,
      p_tipo,
      p_link,
      p_dados_extras
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;
