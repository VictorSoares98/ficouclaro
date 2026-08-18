-- ============================================================
-- 02 - TABELAS
-- ============================================================

-- usuarios (Extensão do auth.users do Supabase)
CREATE TABLE public.usuarios (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  papel          papel_usuario NOT NULL DEFAULT 'aluno',
  nome_completo  TEXT,
  url_avatar     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- disciplinas (Disciplinas do professor)
CREATE TABLE public.disciplinas (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professor_id   UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome           TEXT NOT NULL,
  descricao      TEXT,
  codigo_convite TEXT UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  professor_id  UUID NOT NULL REFERENCES public.usuarios(id),
  topico        TEXT,
  status        status_sessao NOT NULL DEFAULT 'aguardando',
  iniciada_em   TIMESTAMPTZ,
  encerrada_em  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- respostas_enquete (Respostas dos alunos às enquetes)
CREATE TABLE public.respostas_enquete (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquete_id UUID NOT NULL REFERENCES public.enquetes(id) ON DELETE CASCADE,
  resposta   JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- duvidas (Painel de Q&A — Dúvidas Anônimas)
CREATE TABLE public.duvidas (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sessao_id      UUID NOT NULL REFERENCES public.sessoes(id) ON DELETE CASCADE,
  texto          TEXT NOT NULL,
  votos          INTEGER NOT NULL DEFAULT 0,
  foi_respondida BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sessao_id  UUID NOT NULL REFERENCES public.sessoes(id) ON DELETE CASCADE,
  nota       SMALLINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
