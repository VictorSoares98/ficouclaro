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
