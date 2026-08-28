-- ====================================================================
-- ⚠️ AVISO: ARQUIVO AUTO-GERADO!
-- NÃO EDITE ESTE ARQUIVO DIRETAMENTE. ALTERE OS SNIPPETS E RODE db:build
-- Gerado em: 2026-08-28T05:02:08.548Z
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

-- >>> FIM DO SNIPPET: 01_Enums.sql <<<


-- >>> INÍCIO DO SNIPPET: 02_Tabelas.sql <<<
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

-- >>> FIM DO SNIPPET: 02_Tabelas.sql <<<


-- >>> INÍCIO DO SNIPPET: 03_Funcoes.sql <<<
-- ============================================================
-- 03 - FUNÇÕES GLOBAIS
-- ============================================================

-- Retorna o papel do usuário autenticado
CREATE OR REPLACE FUNCTION public.obter_meu_papel()
RETURNS papel_usuario AS $$
  SELECT papel FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Verifica se usuário está matriculado em uma disciplina
CREATE OR REPLACE FUNCTION public.esta_matriculado(p_disciplina_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.matriculas
    WHERE disciplina_id = p_disciplina_id AND aluno_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Exclui a conta do próprio usuário autenticado (Direito ao Esquecimento - LGPD)
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- >>> FIM DO SNIPPET: 03_Funcoes.sql <<<


-- >>> INÍCIO DO SNIPPET: 04_Triggers.sql <<<
-- ============================================================
-- 04 - TRIGGERS
-- ============================================================

-- Trigger: Auto-criar perfil após registro no Auth
CREATE OR REPLACE FUNCTION public.processar_novo_usuario()
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

  INSERT INTO public.usuarios (id, nome_completo, url_avatar, papel)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nome_completo',
    NEW.raw_user_meta_data->>'url_avatar',
    COALESCE(v_papel, 'aluno'::public.papel_usuario)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER ao_criar_usuario_auth
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.processar_novo_usuario();

-- Trigger: Atualizar contador de votos na tabela duvidas
CREATE OR REPLACE FUNCTION public.atualizar_contagem_votos()
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

CREATE TRIGGER ao_alterar_voto
  AFTER INSERT OR DELETE ON public.votos_duvida
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_contagem_votos();

-- >>> FIM DO SNIPPET: 04_Triggers.sql <<<


-- >>> INÍCIO DO SNIPPET: 05_RLS_e_Grants.sql <<<
-- ============================================================
-- 05 - ROW LEVEL SECURITY (RLS) E POLÍTICAS
-- ============================================================
-- Role: anon (Apenas leitura/execução, RLS cuida do resto)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO anon;

-- Role: authenticated & service_role (Mantêm ALL)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated, service_role;

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

-- POLICIES: usuarios
CREATE POLICY "Usuário lê o próprio perfil" ON public.usuarios FOR SELECT USING (id = auth.uid());
CREATE POLICY "Usuário atualiza o próprio perfil" ON public.usuarios FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Professor vê perfis de alunos matriculados" ON public.usuarios FOR SELECT USING (
  obter_meu_papel() = 'professor' AND EXISTS (
    SELECT 1 FROM public.matriculas m
    JOIN public.disciplinas d ON m.disciplina_id = d.id
    WHERE m.aluno_id = usuarios.id AND d.professor_id = auth.uid()
  )
);

-- POLICIES: disciplinas
CREATE POLICY "Professor gerencia próprias disciplinas" ON public.disciplinas FOR ALL USING (professor_id = auth.uid());
CREATE POLICY "Usuários autenticados podem ver disciplinas" ON public.disciplinas FOR SELECT USING (auth.role() = 'authenticated');

-- POLICIES: matriculas
CREATE POLICY "Aluno se matricula" ON public.matriculas FOR INSERT WITH CHECK (aluno_id = auth.uid());
CREATE POLICY "Aluno vê próprias matrículas" ON public.matriculas FOR SELECT USING (aluno_id = auth.uid());
CREATE POLICY "Professor vê matrículas das próprias disciplinas" ON public.matriculas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.disciplinas d WHERE d.id = matriculas.disciplina_id AND d.professor_id = auth.uid())
);

-- POLICIES: sessoes
CREATE POLICY "Professor gerencia próprias sessões" ON public.sessoes FOR ALL USING (professor_id = auth.uid());
CREATE POLICY "Aluno vê sessões das disciplinas matriculadas" ON public.sessoes FOR SELECT USING (esta_matriculado(disciplina_id));

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

-- >>> FIM DO SNIPPET: 05_RLS_e_Grants.sql <<<


-- >>> INÍCIO DO SNIPPET: 06_Indexes_Performance.sql <<<
-- ============================================================
-- 06 - ÍNDICES E PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_disciplinas_professor_id ON public.disciplinas(professor_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_disciplina_id ON public.matriculas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno_id ON public.matriculas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_disciplina_id ON public.sessoes(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_professor_id ON public.sessoes(professor_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_status ON public.sessoes(status);
CREATE INDEX IF NOT EXISTS idx_sinais_ritmo_sessao_created ON public.sinais_ritmo(sessao_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquetes_sessao_id ON public.enquetes(sessao_id);
CREATE INDEX IF NOT EXISTS idx_enquetes_status ON public.enquetes(status);
CREATE INDEX IF NOT EXISTS idx_respostas_enquete_id ON public.respostas_enquete(enquete_id);
CREATE INDEX IF NOT EXISTS idx_duvidas_sessao_id ON public.duvidas(sessao_id);
CREATE INDEX IF NOT EXISTS idx_duvidas_votos ON public.duvidas(sessao_id, votos DESC);
CREATE INDEX IF NOT EXISTS idx_votos_duvida_id ON public.votos_duvida(duvida_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_rapidas_sessao_id ON public.avaliacoes_rapidas(sessao_id);

-- >>> FIM DO SNIPPET: 06_Indexes_Performance.sql <<<


-- >>> INÍCIO DO SNIPPET: 07_Realtime.sql <<<
-- ============================================================
-- 07 - REALTIME
-- ============================================================

-- Adiciona as tabelas que precisam de reatividade ao vivo no Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sinais_ritmo;
ALTER PUBLICATION supabase_realtime ADD TABLE public.duvidas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enquetes;

-- >>> FIM DO SNIPPET: 07_Realtime.sql <<<


