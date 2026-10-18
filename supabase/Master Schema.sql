-- ====================================================================
-- ⚠️ AVISO: ARQUIVO AUTO-GERADO!
-- NÃO EDITE ESTE ARQUIVO DIRETAMENTE. ALTERE OS SNIPPETS E RODE db:build
-- Gerado em: 2026-10-18T06:12:50.168Z
-- ====================================================================

-- >>> INÍCIO DO SNIPPET: 00_Init_Extensions.sql <<<
-- ============================================================
-- 00 - EXTENSÕES BASE E SEGURANÇA
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- >>> FIM DO SNIPPET: 00_Init_Extensions.sql <<<


-- >>> INÍCIO DO SNIPPET: 01_Enums.sql <<<
-- ============================================================
-- 01 - ENUMS
-- ============================================================
CREATE TYPE papel_usuario AS ENUM ('aluno', 'professor');
CREATE TYPE status_sessao AS ENUM ('aguardando', 'ativa', 'encerrada');
CREATE TYPE tipo_enquete AS ENUM ('multipla_escolha', 'nuvem_palavras', 'escala_clareza', 'ranking');
CREATE TYPE status_enquete AS ENUM ('rascunho', 'ativa', 'encerrada');
CREATE TYPE sinal_ritmo AS ENUM ('muito_rapido', 'boiando', 'tudo_certo', 'muito_devagar');
CREATE TYPE tipo_grupo_estudo AS ENUM ('estudo', 'reforco', 'monitoria', 'projeto', 'outro');
CREATE TYPE status_grupo_estudo AS ENUM ('ativo', 'inativo');
CREATE TYPE status_registro_encontro AS ENUM ('concluido', 'pendente', 'cancelado');

-- >>> FIM DO SNIPPET: 01_Enums.sql <<<


-- >>> INÍCIO DO SNIPPET: 02_Tabelas.sql <<<
-- ============================================================
-- 02 - TABELAS
-- ============================================================

-- usuarios (Extensão do auth.users do Supabase)
CREATE TABLE public.usuarios (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  papel              papel_usuario NOT NULL DEFAULT 'aluno',
  nome_completo      TEXT,
  url_avatar         TEXT,
  termos_aceitos_em  TIMESTAMPTZ,
  versao_termos      TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- disciplinas (Disciplinas do professor)
CREATE TABLE public.disciplinas (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professor_id   UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  nome           TEXT NOT NULL,
  descricao      TEXT,
  curso          TEXT,
  semestre       TEXT,
  turma          TEXT,
  horario        TEXT,
  dia_semana     TEXT,
  sala           TEXT,
  bloco          TEXT,
  icone          TEXT,
  codigo_convite TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(4), 'hex'),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- matriculas (Aluno ↔ Disciplina)
CREATE TABLE public.matriculas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disciplina_id UUID NOT NULL REFERENCES public.disciplinas(id) ON DELETE CASCADE,
  aluno_id      UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(disciplina_id, aluno_id)
);

-- sessoes (Aula/Sessão ativa — entidade central)
CREATE TABLE public.sessoes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disciplina_id UUID NOT NULL REFERENCES public.disciplinas(id) ON DELETE CASCADE,
  professor_id  UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  topico        TEXT,
  status        status_sessao NOT NULL DEFAULT 'aguardando',
  iniciada_em   TIMESTAMPTZ,
  encerrada_em  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- sinais_ritmo (Termômetro de Ritmo — Alta Frequência)
CREATE TABLE public.sinais_ritmo (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sessao_id  UUID NOT NULL REFERENCES public.sessoes(id) ON DELETE CASCADE,
  sinal      sinal_ritmo NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- enquetes (Enquetes lançadas pelo professor)
CREATE TABLE public.enquetes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sessao_id    UUID NOT NULL REFERENCES public.sessoes(id) ON DELETE CASCADE,
  tipo         tipo_enquete NOT NULL,
  pergunta     TEXT NOT NULL,
  opcoes       JSONB,
  status       status_enquete NOT NULL DEFAULT 'rascunho',
  encerrada_em TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- respostas_enquete (Respostas dos alunos às enquetes — Anônimo via hash)
CREATE TABLE public.respostas_enquete (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquete_id   UUID NOT NULL REFERENCES public.enquetes(id) ON DELETE CASCADE,
  sessao_id    UUID NOT NULL REFERENCES public.sessoes(id) ON DELETE CASCADE,
  resposta     JSONB NOT NULL,
  hash_eleitor TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(enquete_id, hash_eleitor)
);

-- duvidas (Painel de Q&A)
CREATE TABLE public.duvidas (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sessao_id      UUID NOT NULL REFERENCES public.sessoes(id) ON DELETE CASCADE,
  autor_id       UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  texto          TEXT NOT NULL,
  votos          INTEGER NOT NULL DEFAULT 0,
  foi_respondida BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- votos_duvida (Controle de upvote único por aluno)
CREATE TABLE public.votos_duvida (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duvida_id    UUID NOT NULL REFERENCES public.duvidas(id) ON DELETE CASCADE,
  hash_eleitor TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(duvida_id, hash_eleitor)
);

-- avaliacoes_rapidas (Avaliação Pós-Aula)
CREATE TABLE public.avaliacoes_rapidas (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sessao_id    UUID NOT NULL REFERENCES public.sessoes(id) ON DELETE CASCADE,
  aluno_id     UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  nota         SMALLINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario   TEXT,
  hash_eleitor TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sessao_id, hash_eleitor)
);

-- strikes_moderacao (Controle de suspensões)
CREATE SCHEMA IF NOT EXISTS private;
CREATE TABLE private.strikes_moderacao (
  aluno_id UUID PRIMARY KEY REFERENCES public.usuarios(id) ON DELETE CASCADE,
  quantidade INT NOT NULL DEFAULT 0,
  ultima_ocorrencia TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- grupos_estudo (Os polos/grupos acadêmicos no mapa - baseado em pockets)
CREATE TABLE public.grupos_estudo (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  criador_id          UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome                TEXT NOT NULL,
  descricao           TEXT,
  tipo                tipo_grupo_estudo NOT NULL DEFAULT 'estudo',
  disciplina_id       UUID REFERENCES public.disciplinas(id) ON DELETE SET NULL,
  instituicao         TEXT NOT NULL,
  campus              TEXT,
  predio_bloco        TEXT,
  sala                TEXT,
  local_especifico    TEXT,
  cidade              TEXT,
  estado              TEXT,
  pais                TEXT DEFAULT 'Brasil',
  endereco_completo   TEXT,
  place_id            TEXT,
  slug                TEXT UNIQUE,
  lat                 NUMERIC(10, 7) NOT NULL,
  lng                 NUMERIC(10, 7) NOT NULL,
  dia_reuniao         TEXT,
  horario_reuniao     TEXT,
  vagas               INTEGER DEFAULT 10,
  codigo_convite      TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(4), 'hex'),
  categoria_universidade TEXT CHECK (categoria_universidade IN ('publica', 'privada')),
  status_academico    TEXT DEFAULT 'letivo' CHECK (status_academico IN ('letivo', 'ferias', 'greve')),
  status              status_grupo_estudo NOT NULL DEFAULT 'ativo',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- grupos_membros (Membros vinculados e Monitores)
CREATE TABLE public.grupos_membros (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grupo_id   UUID NOT NULL REFERENCES public.grupos_estudo(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  is_monitor BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(grupo_id, usuario_id)
);

-- registros_encontro (Histórico de reuniões de estudo e reforço - remodelagem de metricas)
CREATE TABLE public.registros_encontro (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grupo_id            UUID NOT NULL REFERENCES public.grupos_estudo(id) ON DELETE CASCADE,
  registrado_por      UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  data_referencia     DATE NOT NULL DEFAULT CURRENT_DATE,
  topico              TEXT,
  participantes       INTEGER NOT NULL DEFAULT 1,
  duracao_minutos     INTEGER DEFAULT 60,
  duvidas_resolvidas  INTEGER DEFAULT 0,
  observacoes         TEXT,
  status              status_registro_encontro NOT NULL DEFAULT 'concluido',
  motivo_cancelamento TEXT,
  client_uuid         UUID UNIQUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



-- >>> FIM DO SNIPPET: 02_Tabelas.sql <<<


-- >>> INÍCIO DO SNIPPET: 03_Views.sql <<<
-- ============================================================
-- 03 - VIEWS PÚBLICAS E SEGURAS
-- ============================================================

-- ============================================================
-- 1. VIEW MAPA DE GRUPOS DE ESTUDO (Baseado em vw_pockets_mapa)
-- Evita vazamento de dados confidenciais e PII dos membros
-- ============================================================
CREATE OR REPLACE VIEW public.view_grupos_estudo_publicos WITH (security_invoker = false) AS
SELECT 
  g.id,
  g.nome,
  g.slug,
  g.descricao,
  g.tipo,
  g.disciplina_id,
  g.instituicao,
  g.campus,
  g.predio_bloco,
  g.sala,
  g.local_especifico,
  g.cidade,
  g.estado,
  g.pais,
  g.place_id,
  g.lat,
  g.lng,
  g.dia_reuniao,
  g.horario_reuniao,
  g.vagas,
  g.codigo_convite,
  g.categoria_universidade,
  g.status_academico,
  g.status,
  g.created_at,
  u.nome_completo AS criador_nome,
  u.url_avatar AS criador_avatar,
  COUNT(m.id)::INT AS total_membros
FROM public.grupos_estudo g
LEFT JOIN public.usuarios u ON g.criador_id = u.id
LEFT JOIN public.grupos_membros m ON m.grupo_id = g.id
WHERE g.status = 'ativo'
GROUP BY g.id, u.nome_completo, u.url_avatar;

-- >>> FIM DO SNIPPET: 03_Views.sql <<<


-- >>> INÍCIO DO SNIPPET: 04_Funcoes.sql <<<
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


-- >>> FIM DO SNIPPET: 04_Funcoes.sql <<<


-- >>> INÍCIO DO SNIPPET: 05_Triggers.sql <<<
-- ============================================================
-- 05 - TRIGGERS
-- ============================================================

-- Trigger: Auto-criar perfil após registro no Auth
CREATE OR REPLACE FUNCTION private.processar_novo_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_papel public.papel_usuario;
BEGIN
  -- Bloco seguro para conversão de tipo ENUM
  BEGIN
    v_papel := (NEW.raw_user_meta_data->>'papel')::public.papel_usuario;
  EXCEPTION WHEN OTHERS THEN
    v_papel := 'aluno'::public.papel_usuario;
  END;

  INSERT INTO public.usuarios (id, nome_completo, url_avatar, papel, termos_aceitos_em, versao_termos)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'url_avatar', NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE(v_papel, 'aluno'::public.papel_usuario),
    (NEW.raw_user_meta_data->>'termos_aceitos_em')::TIMESTAMPTZ,
    NEW.raw_user_meta_data->>'versao_termos'
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ao_criar_usuario_auth ON auth.users;
CREATE TRIGGER ao_criar_usuario_auth
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.processar_novo_usuario();

-- Trigger: Atualizar contador de votos na tabela duvidas
CREATE OR REPLACE FUNCTION private.atualizar_contagem_votos()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.duvidas SET votos = votos + 1 WHERE id = NEW.duvida_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.duvidas SET votos = votos - 1 WHERE id = OLD.duvida_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ao_alterar_voto ON public.votos_duvida;
CREATE TRIGGER ao_alterar_voto
  AFTER INSERT OR DELETE ON public.votos_duvida
  FOR EACH ROW EXECUTE FUNCTION private.atualizar_contagem_votos();

-- Trigger: Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION private.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Moderação Automática de Conteúdo (Triggers Específicos por Tabela)
-- ============================================================

-- 1. Moderação de Dúvidas (Painel Q&A)
CREATE OR REPLACE FUNCTION private.trigger_moderacao_duvida()
RETURNS TRIGGER AS $$
DECLARE
  v_mod JSONB;
  v_strikes INT;
BEGIN
  -- Prevenção de Falsidade Ideológica (Impersonation)
  IF NEW.autor_id IS NOT NULL AND NEW.autor_id != auth.uid() THEN
    RAISE EXCEPTION 'IMPERSONATION_BLOCKED: Não é permitido assinar uma dúvida em nome de outro usuário.';
  END IF;

  IF auth.uid() IS NOT NULL THEN
    SELECT quantidade INTO v_strikes FROM private.strikes_moderacao WHERE aluno_id = auth.uid();
    IF v_strikes >= 3 THEN
      RAISE EXCEPTION 'MODERATION_SUSPENDED: Usuário suspenso por múltiplas violações das regras.';
    END IF;
  END IF;

  v_mod := private.verificar_moderacao(COALESCE(NEW.texto, ''));

  IF (v_mod->>'sensitive')::boolean THEN
    RAISE EXCEPTION 'MODERATION_BLOCKED: Dados sensíveis não são permitidos por questões de privacidade.';
  END IF;

  IF (v_mod->>'offensive')::boolean THEN
    IF auth.uid() IS NOT NULL THEN
      NEW.autor_id := auth.uid();
      
      INSERT INTO private.strikes_moderacao (aluno_id, quantidade)
      VALUES (auth.uid(), 1)
      ON CONFLICT (aluno_id) DO UPDATE SET quantidade = private.strikes_moderacao.quantidade + 1, ultima_ocorrencia = NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Moderação de Avaliações Rápidas (Pós-Aula)
CREATE OR REPLACE FUNCTION private.trigger_moderacao_avaliacao()
RETURNS TRIGGER AS $$
DECLARE
  v_mod JSONB;
  v_strikes INT;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    SELECT quantidade INTO v_strikes FROM private.strikes_moderacao WHERE aluno_id = auth.uid();
    IF v_strikes >= 3 THEN
      RAISE EXCEPTION 'MODERATION_SUSPENDED: Usuário suspenso por múltiplas violações das regras.';
    END IF;
  END IF;

  IF NEW.comentario IS NOT NULL AND NEW.comentario <> '' THEN
    v_mod := private.verificar_moderacao(NEW.comentario);

    IF (v_mod->>'sensitive')::boolean THEN
      RAISE EXCEPTION 'MODERATION_BLOCKED: Dados sensíveis não são permitidos por questões de privacidade.';
    END IF;

    IF (v_mod->>'offensive')::boolean THEN
      IF auth.uid() IS NOT NULL THEN
        NEW.aluno_id := auth.uid();
        
        INSERT INTO private.strikes_moderacao (aluno_id, quantidade)
        VALUES (auth.uid(), 1)
        ON CONFLICT (aluno_id) DO UPDATE SET quantidade = private.strikes_moderacao.quantidade + 1, ultima_ocorrencia = NOW();
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Moderação de Respostas de Enquete
CREATE OR REPLACE FUNCTION private.trigger_moderacao_enquete()
RETURNS TRIGGER AS $$
DECLARE
  v_mod JSONB;
  v_strikes INT;
  v_texto TEXT;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    SELECT quantidade INTO v_strikes FROM private.strikes_moderacao WHERE aluno_id = auth.uid();
    IF v_strikes >= 3 THEN
      RAISE EXCEPTION 'MODERATION_SUSPENDED: Usuário suspenso por múltiplas violações das regras.';
    END IF;
  END IF;

  v_texto := COALESCE(NEW.resposta->>'texto', '');
  IF v_texto <> '' THEN
    v_mod := private.verificar_moderacao(v_texto);

    IF (v_mod->>'sensitive')::boolean THEN
      RAISE EXCEPTION 'MODERATION_BLOCKED: Dados sensíveis não são permitidos por questões de privacidade.';
    END IF;

    IF (v_mod->>'offensive')::boolean THEN
      IF auth.uid() IS NOT NULL THEN
        INSERT INTO private.strikes_moderacao (aluno_id, quantidade)
        VALUES (auth.uid(), 1)
        ON CONFLICT (aluno_id) DO UPDATE SET quantidade = private.strikes_moderacao.quantidade + 1, ultima_ocorrencia = NOW();
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ao_inserir_duvida_mod ON public.duvidas;
CREATE TRIGGER ao_inserir_duvida_mod
  BEFORE INSERT ON public.duvidas
  FOR EACH ROW EXECUTE FUNCTION private.trigger_moderacao_duvida();

DROP TRIGGER IF EXISTS ao_inserir_avaliacao_mod ON public.avaliacoes_rapidas;
CREATE TRIGGER ao_inserir_avaliacao_mod
  BEFORE INSERT ON public.avaliacoes_rapidas
  FOR EACH ROW EXECUTE FUNCTION private.trigger_moderacao_avaliacao();

DROP TRIGGER IF EXISTS ao_inserir_enquete_mod ON public.respostas_enquete;
CREATE TRIGGER ao_inserir_enquete_mod
  BEFORE INSERT ON public.respostas_enquete
  FOR EACH ROW EXECUTE FUNCTION private.trigger_moderacao_enquete();

-- Remoção da função genérica depreciada se existente
DROP FUNCTION IF EXISTS private.trigger_moderacao_texto();

DROP TRIGGER IF EXISTS ao_atualizar_usuario ON public.usuarios;
CREATE TRIGGER ao_atualizar_usuario
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION private.handle_updated_at();

DROP TRIGGER IF EXISTS ao_atualizar_disciplina ON public.disciplinas;
CREATE TRIGGER ao_atualizar_disciplina
  BEFORE UPDATE ON public.disciplinas
  FOR EACH ROW EXECUTE FUNCTION private.handle_updated_at();

DROP TRIGGER IF EXISTS ao_atualizar_sessao ON public.sessoes;
CREATE TRIGGER ao_atualizar_sessao
  BEFORE UPDATE ON public.sessoes
  FOR EACH ROW EXECUTE FUNCTION private.handle_updated_at();

DROP TRIGGER IF EXISTS ao_atualizar_enquete ON public.enquetes;
CREATE TRIGGER ao_atualizar_enquete
  BEFORE UPDATE ON public.enquetes
  FOR EACH ROW EXECUTE FUNCTION private.handle_updated_at();

DROP TRIGGER IF EXISTS ao_atualizar_duvida ON public.duvidas;
CREATE TRIGGER ao_atualizar_duvida
  BEFORE UPDATE ON public.duvidas
  FOR EACH ROW EXECUTE FUNCTION private.handle_updated_at();

DROP TRIGGER IF EXISTS ao_atualizar_grupo_estudo ON public.grupos_estudo;
CREATE TRIGGER ao_atualizar_grupo_estudo
  BEFORE UPDATE ON public.grupos_estudo
  FOR EACH ROW EXECUTE FUNCTION private.handle_updated_at();

-- Trigger: Auto-vincular criador como monitor do grupo de estudo
CREATE OR REPLACE FUNCTION private.vincular_criador_grupo()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.grupos_membros (grupo_id, usuario_id, is_monitor)
  VALUES (NEW.id, NEW.criador_id, true)
  ON CONFLICT (grupo_id, usuario_id) DO UPDATE SET is_monitor = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ao_criar_grupo_estudo ON public.grupos_estudo;
CREATE TRIGGER ao_criar_grupo_estudo
  AFTER INSERT ON public.grupos_estudo
  FOR EACH ROW EXECUTE FUNCTION private.vincular_criador_grupo();


-- >>> FIM DO SNIPPET: 05_Triggers.sql <<<


-- >>> INÍCIO DO SNIPPET: 06_RLS_e_Grants.sql <<<
-- ============================================================
-- 06 - ROW LEVEL SECURITY (RLS) E POLÍTICAS
-- ============================================================
-- Nota: A role 'anon' não possui grants no schema public (Zero-Trust).

-- Role: authenticated & service_role (Mantém ALL)
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM PUBLIC;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated, service_role;

-- Grants para o schema private (necessário para as políticas RLS)
GRANT USAGE ON SCHEMA private TO authenticated, service_role;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA private TO authenticated, service_role;

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sinais_ritmo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas_enquete ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duvidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votos_duvida ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_rapidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos_estudo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_encontro ENABLE ROW LEVEL SECURITY;

-- Grants para visualização pública de grupos no mapa (Fachada de Isolamento Zero-Direct-Access)
GRANT SELECT ON public.view_grupos_estudo_publicos TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.obter_detalhes_convite(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.esta_matriculado(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_thermometer_stats(UUID) TO anon, authenticated;
GRANT SELECT ON public.sessoes TO anon;
GRANT SELECT ON public.enquetes TO anon;
GRANT SELECT ON public.duvidas TO anon;
GRANT SELECT ON public.usuarios TO anon;
GRANT SELECT ON public.disciplinas TO anon;

-- POLICIES: usuarios
CREATE POLICY "Usuário lê o próprio perfil" ON public.usuarios FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Usuário atualiza o próprio perfil" ON public.usuarios FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Professor vê perfis de alunos matriculados" ON public.usuarios FOR SELECT TO authenticated USING (
  private.obter_meu_papel() = 'professor' AND EXISTS (
    SELECT 1 FROM public.matriculas m
    JOIN public.disciplinas d ON m.disciplina_id = d.id
    WHERE m.aluno_id = usuarios.id AND d.professor_id = auth.uid()
  )
);
CREATE POLICY "Visitantes e alunos veem autores de duvidas" ON public.usuarios FOR SELECT TO anon, authenticated USING (
  EXISTS (
    SELECT 1 FROM public.duvidas d
    WHERE d.autor_id = usuarios.id
  )
);

-- POLICIES: disciplinas
CREATE POLICY "Professor gerencia próprias disciplinas" ON public.disciplinas FOR ALL USING (professor_id = auth.uid());
CREATE POLICY "Usuários autenticados podem ver disciplinas" ON public.disciplinas FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Visitantes podem ver dados de disciplinas" ON public.disciplinas FOR SELECT TO anon USING (true);

-- POLICIES: matriculas
CREATE POLICY "Aluno se matricula" ON public.matriculas FOR INSERT WITH CHECK (aluno_id = auth.uid());
CREATE POLICY "Aluno vê próprias matrículas" ON public.matriculas FOR SELECT USING (aluno_id = auth.uid());
CREATE POLICY "Professor vê matrículas das próprias disciplinas" ON public.matriculas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.disciplinas d WHERE d.id = matriculas.disciplina_id AND d.professor_id = auth.uid())
);

-- POLICIES: sessoes
CREATE POLICY "Professor gerencia próprias sessões" ON public.sessoes FOR ALL USING (professor_id = auth.uid());
CREATE POLICY "Aluno vê sessões das disciplinas matriculadas" ON public.sessoes FOR SELECT USING (esta_matriculado(disciplina_id));
CREATE POLICY "Visitantes podem ver sessões de aula" ON public.sessoes FOR SELECT TO anon USING (
  status IN ('aguardando', 'ativa', 'encerrada')
);

-- POLICIES: sinais_ritmo
CREATE POLICY "Aluno envia sinal de ritmo" ON public.sinais_ritmo FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = sinais_ritmo.sessao_id AND s.status = 'ativa' AND esta_matriculado(s.disciplina_id))
);
CREATE POLICY "Professor lê sinais das próprias sessões" ON public.sinais_ritmo FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = sinais_ritmo.sessao_id AND s.professor_id = auth.uid())
);

-- POLICIES: enquetes
CREATE POLICY "Professor gerencia enquetes" ON public.enquetes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = enquetes.sessao_id AND s.professor_id = auth.uid())
);
CREATE POLICY "Aluno vê enquetes ativas" ON public.enquetes FOR SELECT USING (
  status = 'ativa' AND EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = enquetes.sessao_id AND esta_matriculado(s.disciplina_id))
);
CREATE POLICY "Visitantes podem ver enquetes ativas" ON public.enquetes FOR SELECT TO anon USING (
  status = 'ativa'
);

-- POLICIES: respostas_enquete
CREATE POLICY "Aluno responde enquetes" ON public.respostas_enquete FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.enquetes e JOIN public.sessoes s ON s.id = e.sessao_id WHERE e.id = respostas_enquete.enquete_id AND e.status = 'ativa' AND esta_matriculado(s.disciplina_id))
);
CREATE POLICY "Professor lê respostas" ON public.respostas_enquete FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.enquetes e JOIN public.sessoes s ON s.id = e.sessao_id WHERE e.id = respostas_enquete.enquete_id AND s.professor_id = auth.uid())
);

-- POLICIES: duvidas
CREATE POLICY "Aluno envia dúvida" ON public.duvidas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = duvidas.sessao_id AND s.status = 'ativa' AND esta_matriculado(s.disciplina_id))
);
CREATE POLICY "Todos veem dúvidas da sessão" ON public.duvidas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = duvidas.sessao_id AND (s.professor_id = auth.uid() OR esta_matriculado(s.disciplina_id)))
);
CREATE POLICY "Visitantes podem ver dúvidas da sessão" ON public.duvidas FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = duvidas.sessao_id)
);
CREATE POLICY "Professor responde dúvidas" ON public.duvidas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = duvidas.sessao_id AND s.professor_id = auth.uid())
);

-- POLICIES: votos_duvida
CREATE POLICY "Aluno dá upvote" ON public.votos_duvida FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.duvidas d JOIN public.sessoes s ON s.id = d.sessao_id WHERE d.id = votos_duvida.duvida_id AND s.status = 'ativa' AND esta_matriculado(s.disciplina_id))
);

-- POLICIES: avaliacoes_rapidas
CREATE POLICY "Aluno avalia aula" ON public.avaliacoes_rapidas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = avaliacoes_rapidas.sessao_id AND s.status = 'encerrada' AND esta_matriculado(s.disciplina_id))
);
CREATE POLICY "Professor lê avaliações" ON public.avaliacoes_rapidas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = avaliacoes_rapidas.sessao_id AND s.professor_id = auth.uid())
);

-- GRANT da função analítica (Dashboard)
GRANT EXECUTE ON FUNCTION public.get_course_insights(UUID) TO authenticated;

-- POLICIES: grupos_estudo
CREATE POLICY "Qualquer um pode ver grupos de estudo ativos" ON public.grupos_estudo 
  FOR SELECT USING (status = 'ativo' OR criador_id = auth.uid());

CREATE POLICY "Usuário autenticado pode criar grupo de estudo" ON public.grupos_estudo 
  FOR INSERT WITH CHECK (criador_id = auth.uid() AND auth.role() = 'authenticated');

CREATE POLICY "Criador gerencia próprio grupo de estudo" ON public.grupos_estudo 
  FOR UPDATE USING (criador_id = auth.uid());

CREATE POLICY "Criador deleta próprio grupo de estudo" ON public.grupos_estudo 
  FOR DELETE USING (criador_id = auth.uid());

-- POLICIES: grupos_membros (Padrão FMP - Sem auto-joins recursivos)
CREATE POLICY "Membros são públicos para leitura" ON public.grupos_membros 
  FOR SELECT USING (true);

CREATE POLICY "Usuário se inscreve em grupo de estudo" ON public.grupos_membros 
  FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuário cancela inscrição ou criador remove membro" ON public.grupos_membros 
  FOR DELETE TO authenticated USING (
    usuario_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.grupos_estudo ge 
      WHERE ge.id = grupos_membros.grupo_id AND ge.criador_id = auth.uid()
    )
  );

-- POLICIES: registros_encontro
CREATE POLICY "Membros veem registros de encontros do grupo" ON public.registros_encontro 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.grupos_membros gm 
      WHERE gm.grupo_id = registros_encontro.grupo_id AND gm.usuario_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.grupos_estudo ge 
      WHERE ge.id = registros_encontro.grupo_id AND ge.criador_id = auth.uid()
    )
  );

CREATE POLICY "Monitores e criadores registram encontros" ON public.registros_encontro 
  FOR INSERT WITH CHECK (
    registrado_por = auth.uid() AND (
      EXISTS (
        SELECT 1 FROM public.grupos_estudo ge 
        WHERE ge.id = registros_encontro.grupo_id AND ge.criador_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.grupos_membros gm 
        WHERE gm.grupo_id = registros_encontro.grupo_id AND gm.usuario_id = auth.uid() AND gm.is_monitor = true
      )
    )
  );

CREATE POLICY "Registrante ou criador atualiza registro de encontro" ON public.registros_encontro 
  FOR UPDATE USING (
    registrado_por = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.grupos_estudo ge 
      WHERE ge.id = registros_encontro.grupo_id AND ge.criador_id = auth.uid()
    )
  );

-- GRANTS: View pública e RPCs de grupos de estudo (Zero-Direct-Access)
GRANT SELECT ON public.view_grupos_estudo_publicos TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.link_member_to_study_group(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.export_my_data() TO authenticated;

-- >>> FIM DO SNIPPET: 06_RLS_e_Grants.sql <<<


-- >>> INÍCIO DO SNIPPET: 07_Indexes_Performance.sql <<<
-- ============================================================
-- 07 - ÍNDICES E PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_disciplinas_professor_id ON public.disciplinas(professor_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_disciplina_id ON public.matriculas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno_id ON public.matriculas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_disciplina_id ON public.sessoes(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_professor_id ON public.sessoes(professor_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_status ON public.sessoes(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessoes_ativas_por_disciplina ON public.sessoes(disciplina_id) WHERE status IN ('aguardando', 'ativa');
CREATE INDEX IF NOT EXISTS idx_sinais_ritmo_sessao_created ON public.sinais_ritmo(sessao_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquetes_sessao_id ON public.enquetes(sessao_id);
CREATE INDEX IF NOT EXISTS idx_enquetes_status ON public.enquetes(status);
CREATE INDEX IF NOT EXISTS idx_respostas_enquete_id ON public.respostas_enquete(enquete_id);
CREATE INDEX IF NOT EXISTS idx_duvidas_sessao_id ON public.duvidas(sessao_id);
CREATE INDEX IF NOT EXISTS idx_duvidas_votos ON public.duvidas(sessao_id, votos DESC);
CREATE INDEX IF NOT EXISTS idx_votos_duvida_id ON public.votos_duvida(duvida_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_rapidas_sessao_id ON public.avaliacoes_rapidas(sessao_id);

-- Índices: grupos_estudo, grupos_membros e registros_encontro
CREATE INDEX IF NOT EXISTS idx_grupos_estudo_geo ON public.grupos_estudo(lat, lng);
CREATE INDEX IF NOT EXISTS idx_grupos_estudo_status ON public.grupos_estudo(status);
CREATE INDEX IF NOT EXISTS idx_grupos_estudo_instituicao ON public.grupos_estudo(instituicao);
CREATE INDEX IF NOT EXISTS idx_grupos_estudo_cidade_estado ON public.grupos_estudo(cidade, estado);
CREATE INDEX IF NOT EXISTS idx_grupos_estudo_slug ON public.grupos_estudo(slug);
CREATE INDEX IF NOT EXISTS idx_grupos_estudo_criador_id ON public.grupos_estudo(criador_id);
CREATE INDEX IF NOT EXISTS idx_grupos_estudo_disciplina_id ON public.grupos_estudo(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_grupos_membros_grupo_id ON public.grupos_membros(grupo_id);
CREATE INDEX IF NOT EXISTS idx_grupos_membros_usuario_id ON public.grupos_membros(usuario_id);
CREATE INDEX IF NOT EXISTS idx_registros_encontro_grupo_id ON public.registros_encontro(grupo_id);
CREATE INDEX IF NOT EXISTS idx_registros_encontro_data ON public.registros_encontro(data_referencia DESC);

-- >>> FIM DO SNIPPET: 07_Indexes_Performance.sql <<<


-- >>> INÍCIO DO SNIPPET: 08_Realtime.sql <<<
-- ============================================================
-- 08 - REALTIME
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

-- >>> FIM DO SNIPPET: 08_Realtime.sql <<<


