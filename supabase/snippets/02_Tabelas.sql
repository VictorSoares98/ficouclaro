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

-- dispositivos_usuarios (Registro de dispositivos para Push Notifications / Web Push)
CREATE TABLE public.dispositivos_usuarios (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id          UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  endpoint            TEXT NOT NULL,
  p256dh              TEXT,
  auth_key            TEXT,
  user_agent          TEXT,
  plataforma          TEXT NOT NULL DEFAULT 'web',
  ativo               BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(usuario_id, endpoint)
);

-- notificacoes (Histórico de alertas e notificações com suporte a Realtime e Web Push)
CREATE TABLE public.notificacoes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id          UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  titulo              TEXT NOT NULL,
  mensagem            TEXT NOT NULL,
  tipo                tipo_notificacao NOT NULL DEFAULT 'sistema',
  link                TEXT,
  lida                BOOLEAN NOT NULL DEFAULT false,
  dados_extras        JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
